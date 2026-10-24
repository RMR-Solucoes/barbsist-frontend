"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import api from "@/services/api";
import styles from "./SinoNotificacoes.module.css";
import { tocarSomBarbSist } from "@/utils/catalogoSonsBarbSist"; // F2.4C3B

const INTERVALO_MS = 20000;
const INTERVALO_SOM_MS = 20000;
const SOM_CHAVE_PREFIXO = "barbsist:notificacoes:som:";
const TIPO_CHAVE_PREFIXO = "barbsist:notificacoes:tipo:";
const VOLUME_CHAVE_PREFIXO = "barbsist:notificacoes:volume:";

function tocarSomConfigurado(identidade) {
  let tipo = "classica";
  let volume = 100;
  try {
    tipo = window.localStorage.getItem(TIPO_CHAVE_PREFIXO + identidade) || "classica";
    const armazenado = window.localStorage.getItem(VOLUME_CHAVE_PREFIXO + identidade);
    if (armazenado !== null) volume = Number(armazenado);
  } catch { /* valores padrao */ }
  return tocarSomBarbSist(tipo, Number.isFinite(volume) ? Math.max(0, Math.min(100, volume)) : 100);
}


function descreverErro(erro) {
  const status = erro?.response?.status;

  if (status === 404) {
    return "As notificações ainda não estão disponíveis.";
  }

  if (status === 401 || status === 403) {
    return "Não foi possível consultar as notificações.";
  }

  return "Falha ao atualizar as notificações.";
}

export default function SinoNotificacoes({ usuario }) {
  const [aberto, setAberto] = useState(false);
  const [itens, setItens] = useState([]);
  const [naoLidas, setNaoLidas] = useState(0);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const [indisponivel, setIndisponivel] = useState(false);
  const [marcando, setMarcando] = useState(null);
  const [somAtivo, setSomAtivo] = useState(false);
  const [somAviso, setSomAviso] = useState("");

  const referencia = useRef(null);
  const identidadeRef = useRef(null);
  const consultaEmAndamento = useRef(false);
  const indisponivelRef = useRef(false);
  const somAtivoRef = useRef(false);
  const idsConhecidosRef = useRef(null);

  const perfil = String(usuario?.perfil || "").toLowerCase();

  const superadminGlobal =
    perfil === "superadmin" &&
    usuario?.contexto_barbearia_id == null;

  const identidade = usuario
    ? `${usuario.id ?? ""}:${usuario.barbearia_id ?? ""}:${
        usuario.contexto_barbearia_id ?? ""
      }`
    : "";

  const podeConsultar =
    Boolean(usuario) && !superadminGlobal;

  // F2.4A10S - consulta centralizada: contador, lista e alerta.
  const atualizar = useCallback(async (mostrarLista = false) => {
    if (indisponivelRef.current || consultaEmAndamento.current) return;

    const identidadeInicial = identidadeRef.current;
    consultaEmAndamento.current = true;

    try {
      if (mostrarLista) setCarregando(true);

      const contagem = await api.get("/notificacoes/nao-lidas");
      if (identidadeRef.current !== identidadeInicial) return;

      setNaoLidas(Number(contagem.data?.nao_lidas) || 0);

      if (mostrarLista || somAtivoRef.current) {
        const resposta = await api.get("/notificacoes", {
          params: { limite: 100 },
        });

        if (identidadeRef.current !== identidadeInicial) return;

        const lista = Array.isArray(resposta.data?.notificacoes)
          ? resposta.data.notificacoes
          : [];

        if (mostrarLista) setItens(lista);

        if (somAtivoRef.current) {
          const atuais = new Set(
            lista.filter((item) => !item.lida)
              .map((item) => String(item.id))
          );

          const anteriores = idsConhecidosRef.current;
          idsConhecidosRef.current = atuais;

          if (
            anteriores !== null &&
            [...atuais].some((id) => !anteriores.has(id))
          ) {
            void tocarSomConfigurado(identidadeRef.current).then((tocou) => {
              if (!tocou && identidadeRef.current === identidadeInicial) {
                setSomAviso(
                  "Audio bloqueado pelo navegador. Clique em Testar som."
                );
              }
            });
          }
        }
      }

      setErro("");
    } catch (falha) {
      if (identidadeRef.current !== identidadeInicial) return;

      if (falha?.response?.status === 404) {
        indisponivelRef.current = true;
        setIndisponivel(true);
      }

      idsConhecidosRef.current = null;
      setErro(descreverErro(falha));
    } finally {
      consultaEmAndamento.current = false;
      if (identidadeRef.current === identidadeInicial) {
        setCarregando(false);
      }
    }
  }, []);

  useEffect(() => {
    identidadeRef.current = identidade;
    idsConhecidosRef.current = null;
    indisponivelRef.current = false;
    setIndisponivel(false);
    setAberto(false);
    setItens([]);
    setNaoLidas(0);
    setErro("");

    if (!podeConsultar) return;

    // A consulta anterior nao deve atualizar o novo contexto.
    // A verificacao de identidade ocorre apos cada resposta.
    atualizar();

    const intervalo = window.setInterval(() => {
      if (!indisponivelRef.current) {
        atualizar();
      }
    }, INTERVALO_MS);

    return () => window.clearInterval(intervalo);
  }, [identidade, podeConsultar, atualizar]);

  useEffect(() => {
    if (!aberto) return;

    function clicarFora(evento) {
      if (!referencia.current?.contains(evento.target)) {
        setAberto(false);
      }
    }

    function teclaEscape(evento) {
      if (evento.key === "Escape") setAberto(false);
    }

    document.addEventListener("pointerdown", clicarFora);
    document.addEventListener("keydown", teclaEscape);

    return () => {
      document.removeEventListener("pointerdown", clicarFora);
      document.removeEventListener("keydown", teclaEscape);
    };
  }, [aberto]);

  async function marcarComoLida(item) {
    if (item.lida || marcando !== null) return;

    const identidadeInicial = identidadeRef.current;
    setMarcando(item.id);

    try {
      await api.put(`/notificacoes/${item.id}/ler`);

      if (identidadeRef.current !== identidadeInicial) return;

      setItens((atuais) =>
        atuais.map((atual) =>
          atual.id === item.id
            ? { ...atual, lida: true }
            : atual
        )
      );

      setNaoLidas((atual) => Math.max(0, atual - 1));
      setErro("");
    } catch (falha) {
      if (identidadeRef.current === identidadeInicial) {
        setErro(descreverErro(falha));
      }
    } finally {
      if (identidadeRef.current === identidadeInicial) {
        setMarcando(null);
      }
    }
  }

  function alternarPainel() {
    const abrir = !aberto;
    setAberto(abrir);

    if (abrir && !indisponivel) {
      atualizar(true);
    }
  }


  // Preferencia sonora por usuario e barbearia.
  useEffect(() => {
    setSomAviso("");

    let ativado = false;
    try {
      ativado =
        window.localStorage.getItem(SOM_CHAVE_PREFIXO + identidade) === "1";
    } catch {
      ativado = false;
    }

    somAtivoRef.current = ativado;
    idsConhecidosRef.current = null;
    setSomAtivo(ativado);
  }, [identidade]);

  // Sincroniza preferencia salva em Configuracoes, inclusive em outra aba.
  useEffect(() => {
    function sincronizar(evento) {
      if (evento?.detail?.identidade && evento.detail.identidade !== identidade) return;
      if (evento?.key && !evento.key.endsWith(identidade)) return;
      let ativado = false;
      try {
        ativado = window.localStorage.getItem(SOM_CHAVE_PREFIXO + identidade) === "1";
      } catch { /* armazenamento indisponivel */ }
      if (somAtivoRef.current !== ativado) {
        idsConhecidosRef.current = null;
        somAtivoRef.current = ativado;
        setSomAtivo(ativado);
      }
    }
    window.addEventListener("barbsist:preferencias-som-alteradas", sincronizar);
    window.addEventListener("storage", sincronizar);
    return () => {
      window.removeEventListener("barbsist:preferencias-som-alteradas", sincronizar);
      window.removeEventListener("storage", sincronizar);
    };
  }, [identidade]);

  async function configurarSom() {
    const novoEstado = !somAtivo;
    somAtivoRef.current = novoEstado;
    idsConhecidosRef.current = null;
    setSomAtivo(novoEstado);
    setSomAviso("");

    try {
      window.localStorage.setItem(
        SOM_CHAVE_PREFIXO + identidade,
        novoEstado ? "1" : "0"
      );
    } catch {
      setSomAviso("Preferencia nao pode ser salva neste navegador.");
    }

    if (novoEstado) {
      const tocou = await tocarSomConfigurado(identidadeRef.current);
      if (!tocou) {
        setSomAviso("O navegador bloqueou o som. Verifique as permissoes.");
      }
    }
  }

  async function testarSom() {
    const tocou = await tocarSomConfigurado(identidadeRef.current);
    setSomAviso(
      tocou ? "" : "O navegador bloqueou a reproducao do som."
    );
  }

  if (!podeConsultar) return null;

  return (
    <div className={styles.faixa}>
      <div className={styles.container} ref={referencia}>
        <button
          type="button"
          className={styles.botao}
          onClick={alternarPainel}
          aria-label={`Notificações: ${naoLidas} não lidas`}
          aria-expanded={aberto}
          aria-controls="painel-notificacoes-barbsist"
        >
          <span aria-hidden="true">🔔</span>
          <span>Notificações</span>

          {naoLidas > 0 && (
            <span className={styles.contador}>
              {naoLidas > 99 ? "99+" : naoLidas}
            </span>
          )}
        </button>

        <div className={styles.controlesSom}>
          <button
            type="button"
            className={styles.controleSom}
            onClick={configurarSom}
            aria-pressed={somAtivo}
            title="Ativar ou silenciar alertas sonoros"
          >
            {somAtivo ? "🔊 Som ligado" : "🔇 Ativar som"}
          </button>
          {somAtivo && (
            <button
              type="button"
              className={styles.controleSom}
              onClick={testarSom}
            >
              Testar som
            </button>
          )}
          {somAviso && <span className={styles.somAviso}>{somAviso}</span>}
        </div>

        {aberto && (
          <section
            id="painel-notificacoes-barbsist"
            className={styles.painel}
            aria-label="Notificações recentes"
          >
            <div className={styles.cabecalho}>
              <strong>Notificações</strong>

              <button
                type="button"
                className={styles.fechar}
                onClick={() => setAberto(false)}
                aria-label="Fechar notificações"
              >
                ×
              </button>
            </div>

            {erro && (
              <p className={styles.aviso} role="status">
                {erro}
              </p>
            )}

            {carregando && (
              <p className={styles.vazio}>Atualizando...</p>
            )}

            {!carregando &&
              !indisponivel &&
              itens.length === 0 && (
                <p className={styles.vazio}>
                  Nenhuma notificação recente.
                </p>
              )}

            {!carregando && itens.length > 0 && (
              <ul className={styles.lista}>
                {itens.map((item) => (
                  <li
                    key={item.id}
                    className={`${styles.item} ${
                      item.lida ? "" : styles.naoLida
                    }`}
                  >
                    <strong>{item.titulo}</strong>
                    <p>{item.mensagem}</p>

                    <div className={styles.acoes}>
                      {item.agendamento_id && (
                        <Link
                          href="/agenda"
                          onClick={() => setAberto(false)}
                        >
                          Ver agenda
                        </Link>
                      )}

                      {!item.lida && (
                        <button
                          type="button"
                          disabled={marcando !== null}
                          onClick={() => marcarComoLida(item)}
                        >
                          {marcando === item.id
                            ? "Salvando..."
                            : "Marcar como lida"}
                        </button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}
      </div>
    </div>
  );
}