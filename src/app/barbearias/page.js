"use client";

import { numeroWhatsAppBrasil } from "../../utils/telefoneBrasil";

import { useCallback, useState } from "react";
import { listarBarbeariasProximas } from "@/services/barbeariasPublicasService";
import styles from "./barbearias.module.css";

const RAIOS_KM = [2, 5, 10, 20];

export default function BarbeariasProximasPage() {
  const [raioKm, setRaioKm] = useState(5);
  const [coordenadas, setCoordenadas] = useState(null);
  const [barbearias, setBarbearias] = useState([]);
  const [carregandoLocalizacao, setCarregandoLocalizacao] = useState(false);
  const [carregandoBusca, setCarregandoBusca] = useState(false);
  const [erro, setErro] = useState("");
  const [buscaRealizada, setBuscaRealizada] = useState(false);

  const buscarBarbearias = useCallback(async (latitude, longitude, raioSelecionado) => {
    setErro("");
    setCarregandoBusca(true);

    try {
      const dados = await listarBarbeariasProximas({
        latitude,
        longitude,
        raioKm: raioSelecionado,
        limite: 50,
      });

      setBarbearias(Array.isArray(dados?.barbearias) ? dados.barbearias : []);
      setBuscaRealizada(true);
    } catch (error) {
      console.error(error);
      setBarbearias([]);
      setBuscaRealizada(true);
      setErro(
        obterMensagemErroApi(error) ||
          "Não foi possível buscar as barbearias próximas. Tente novamente."
      );
    } finally {
      setCarregandoBusca(false);
    }
  }, []);

  function solicitarLocalizacao() {
    setErro("");

    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setErro(
        "Este navegador não oferece suporte à localização. Tente novamente em um navegador atualizado."
      );
      return;
    }

    setCarregandoLocalizacao(true);

    navigator.geolocation.getCurrentPosition(
      async (posicao) => {
        const latitude = posicao.coords.latitude;
        const longitude = posicao.coords.longitude;

        setCoordenadas({ latitude, longitude });
        setCarregandoLocalizacao(false);
        await buscarBarbearias(latitude, longitude, raioKm);
      },
      (error) => {
        setCarregandoLocalizacao(false);
        setErro(mensagemErroLocalizacao(error));
      },
      {
        enableHighAccuracy: false,
        timeout: 12000,
        maximumAge: 60000,
      }
    );
  }

  async function alterarRaio(novoRaio) {
    setRaioKm(novoRaio);

    if (!coordenadas) return;

    await buscarBarbearias(
      coordenadas.latitude,
      coordenadas.longitude,
      novoRaio
    );
  }

  const carregando = carregandoLocalizacao || carregandoBusca;

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.brand}>BarbSist</div>
          <h1>Barbearias perto de você</h1>
          <p className={styles.heroText}>
            Encontre barbearias próximas, veja a distância,
            fale pelo WhatsApp e agende online quando disponível.
          </p>
          <div className={styles.privacyNote}>
            Sua localização é usada somente para calcular a distância nesta busca.
            Ela não é salva no BarbSist.
          </div>
          <button
            type="button"
            className={styles.locationButton}
            onClick={solicitarLocalizacao}
            disabled={carregando}
          >
            {carregandoLocalizacao
              ? "Obtendo localização..."
              : coordenadas
                ? "Atualizar minha localização"
                : "Usar minha localização"}
          </button>
        </div>
      </section>

      <section className={styles.content}>
        <div className={styles.filtersCard}>
          <div>
            <span className={styles.filterLabel}>Distância máxima</span>
            <p className={styles.filterHelp}>Escolha o raio da busca.</p>
          </div>

          <div className={styles.radiusGroup} aria-label="Raio da busca">
            {RAIOS_KM.map((raio) => (
              <button
                key={raio}
                type="button"
                className={
                  raioKm === raio
                    ? `${styles.radiusButton} ${styles.radiusButtonActive}`
                    : styles.radiusButton
                }
                aria-pressed={raioKm === raio}
                onClick={() => alterarRaio(raio)}
                disabled={carregandoBusca}
              >
                {raio} km
              </button>
            ))}
          </div>
        </div>

        {erro && (
          <div className={styles.errorBox}>
            <strong>Não foi possível continuar.</strong>
            <span>{erro}</span>
          </div>
        )}

        {carregandoBusca && (
          <div className={styles.statusCard}>
            Buscando barbearias em até {raioKm} km...
          </div>
        )}

        {!coordenadas && !erro && !carregando && (
          <div className={styles.initialCard}>
            <div className={styles.initialIcon}>📍</div>
            <h2>Encontre uma barbearia próxima</h2>
            <p>
              Toque em <strong>Usar minha localização</strong> e permita
              o acesso à localização no navegador.
            </p>
          </div>
        )}

        {coordenadas && buscaRealizada && !carregandoBusca && !erro && (
          <>
            <div className={styles.resultHeader}>
              <div>
                <h2>
                  {barbearias.length === 1
                    ? "1 barbearia encontrada"
                    : `${barbearias.length} barbearias encontradas`}
                </h2>
                <p>Em até {raioKm} km da sua localização.</p>
              </div>

              <button
                type="button"
                className={styles.refreshButton}
                onClick={() =>
                  buscarBarbearias(
                    coordenadas.latitude,
                    coordenadas.longitude,
                    raioKm
                  )
                }
                disabled={carregandoBusca}
              >
                Atualizar resultados
              </button>
            </div>

            {barbearias.length === 0 ? (
              <div className={styles.emptyCard}>
                <div className={styles.initialIcon}>✂️</div>
                <h2>Nenhuma barbearia encontrada</h2>
                <p>
                  Não encontramos barbearias participantes em até {raioKm} km.
                  Tente aumentar o raio.
                </p>
              </div>
            ) : (
              <div className={styles.grid}>
                {barbearias.map((barbearia) => (
                  <BarbeariaCard key={barbearia.slug} barbearia={barbearia} />
                ))}
              </div>
            )}
          </>
        )}
      </section>
    </main>
  );
}

function BarbeariaCard({ barbearia }) {
  const enderecoCompleto = [
    barbearia.endereco,
    barbearia.cidade,
    barbearia.estado,
    barbearia.cep,
  ]
    .filter(Boolean)
    .join(", ");

  const latitudeBarbearia = Number(barbearia.latitude);
  const longitudeBarbearia = Number(barbearia.longitude);

  const possuiCoordenadas =
    barbearia.latitude != null &&
    barbearia.longitude != null &&
    Number.isFinite(latitudeBarbearia) &&
    Number.isFinite(longitudeBarbearia);

  const urlMaps = possuiCoordenadas
    ? `https://www.google.com/maps/dir/?api=1&destination=${latitudeBarbearia},${longitudeBarbearia}`
    : enderecoCompleto
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(enderecoCompleto)}`
      : null;

  const telefoneWhatsApp = numeroWhatsAppBrasil(barbearia.telefone_whatsapp);

  const urlWhatsApp = telefoneWhatsApp
    ? `https://wa.me/${telefoneWhatsApp}?text=${encodeURIComponent(
        `Olá! Encontrei a ${barbearia.nome} pelo BarbSist.`
      )}`
    : null;

  const urlInstagram = obterUrlInstagram(barbearia.instagram);

  const urlAgendamento = barbearia.permitir_agendamento_portal
    ? `/agendar?barbearia=${encodeURIComponent(barbearia.slug)}`
    : null;

  const urlPerfil = `/barbearia/${encodeURIComponent(barbearia.slug)}`;

  return (
    <article className={styles.card}>
      <div className={styles.cover}>
        {barbearia.imagem_capa_url ? (
          <img
            src={barbearia.imagem_capa_url}
            alt=""
            className={styles.coverImage}
          />
        ) : (
          <div className={styles.coverFallback}>
            <span>✂️</span>
          </div>
        )}

        <div className={styles.distanceBadge}>
          {formatarDistancia(barbearia.distancia_km)}
        </div>
      </div>

      <div className={styles.cardBody}>
        <div className={styles.identityRow}>
          {barbearia.logo_url ? (
            <img
              src={barbearia.logo_url}
              alt={`Logo de ${barbearia.nome}`}
              className={styles.logo}
            />
          ) : (
            <div className={styles.logoFallback}>{inicialNome(barbearia.nome)}</div>
          )}

          <div className={styles.identityText}>
            <h3>{barbearia.nome}</h3>
            {barbearia.slogan && (
              <p className={styles.slogan}>{barbearia.slogan}</p>
            )}
          </div>
        </div>

        {enderecoCompleto && (
          <p className={styles.address}>
            <span aria-hidden="true">📍</span>
            <span>{enderecoCompleto}</span>
          </p>
        )}

        <div className={styles.actions}>
          <a href={urlPerfil} className={styles.actionButton}>
            Ver perfil
          </a>

          {urlAgendamento ? (
            <a
              href={urlAgendamento}
              className={`${styles.actionButton} ${styles.primaryAction}`}
            >
              Agendar
            </a>
          ) : (
            <span className={styles.offlineScheduling}>
              Agendamento online indisponível
            </span>
          )}

          {urlWhatsApp && (
            <a
              href={urlWhatsApp}
              target="_blank"
              rel="noopener noreferrer"
              className={`${styles.actionButton} ${styles.whatsappAction}`}
            >
              WhatsApp
            </a>
          )}

          {urlMaps && (
            <a
              href={urlMaps}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.actionButton}
            >
              Como chegar
            </a>
          )}

          {urlInstagram && (
            <a
              href={urlInstagram}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.actionButton}
            >
              Instagram
            </a>
          )}
        </div>
      </div>
    </article>
  );
}

function mensagemErroLocalizacao(error) {
  if (!error) return "Não foi possível obter sua localização.";

  if (error.code === 1) {
    return "A permissão de localização foi negada. Autorize a localização no navegador e tente novamente.";
  }

  if (error.code === 2) {
    return "Sua localização não pôde ser determinada neste momento. Tente novamente.";
  }

  if (error.code === 3) {
    return "A localização demorou mais que o esperado. Tente novamente.";
  }

  return "Não foi possível obter sua localização.";
}

function obterMensagemErroApi(error) {
  const detalhe = error?.response?.data?.detail;
  return typeof detalhe === "string" ? detalhe : "";
}

function somenteDigitos(valor) {
  return String(valor || "").replace(/\D/g, "");
}

function obterUrlInstagram(valor) {
  const texto = String(valor || "").trim();
  if (!texto) return null;

  if (/^https?:\/\//i.test(texto)) return texto;

  const usuario = texto.replace(/^@/, "").replace(/^\/+|\/+$/g, "");
  return usuario
    ? `https://www.instagram.com/${encodeURIComponent(usuario)}`
    : null;
}

function formatarDistancia(valor) {
  const distancia = Number(valor);

  if (!Number.isFinite(distancia)) return "-";

  if (distancia < 1) {
    return `${Math.round(distancia * 1000)} m`;
  }

  return `${distancia.toLocaleString("pt-BR", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })} km`;
}

function inicialNome(nome) {
  const texto = String(nome || "").trim();
  return texto ? texto.charAt(0).toUpperCase() : "B";
}
