"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { listarMinhaAgenda } from "@/services/agendamentoService";
import { listarMinhasComandas } from "@/services/comandaService";
import { listarMinhasComissoes } from "@/services/comissaoService";

import styles from "./page.module.css";


const STATUS_ATIVOS = new Set([
  "agendado",
  "confirmado",
  "em_atendimento",
  "reagendado",
]);


function moeda(valor) {
  return Number(valor || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}


function dataValida(valor) {
  if (!valor) return null;
  const data = new Date(valor);
  return Number.isNaN(data.getTime()) ? null : data;
}


function formatarDataHora(valor) {
  const data = dataValida(valor);
  if (!data) return "—";
  return data.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}


function chaveMes(data) {
  return [
    data.getFullYear(),
    String(data.getMonth() + 1).padStart(2, "0"),
  ].join("-");
}


function chaveDia(data) {
  return [
    data.getFullYear(),
    String(data.getMonth() + 1).padStart(2, "0"),
    String(data.getDate()).padStart(2, "0"),
  ].join("-");
}


function rotuloStatus(status) {
  const valor = String(status || "").toLowerCase();
  const rotulos = {
    agendado: "Agendado",
    confirmado: "Confirmado",
    em_atendimento: "Em atendimento",
    reagendado: "Reagendado",
    concluido: "Concluído",
    cancelado: "Cancelado",
    nao_compareceu: "Não compareceu",
    aberta: "Aberta",
    fechada: "Fechada",
  };
  return rotulos[valor] || status || "—";
}


function mensagemErro(erro, fallback) {
  return erro?.response?.data?.detail || erro?.message || fallback;
}


function Cartao({ titulo, valor, detalhe, destaque = false }) {
  return (
    <article className={`${styles.card} ${destaque ? styles.cardDestaque : ""}`}>
      <span>{titulo}</span>
      <strong>{valor}</strong>
      <small>{detalhe}</small>
    </article>
  );
}


export default function MeuTrabalhoPage() {
  const hoje = useMemo(() => new Date(), []);
  const [mesSelecionado, setMesSelecionado] = useState(chaveMes(hoje));
  const [agenda, setAgenda] = useState([]);
  const [comandas, setComandas] = useState([]);
  const [comissoes, setComissoes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [avisos, setAvisos] = useState([]);

  async function carregarTudo() {
    setCarregando(true);
    setAvisos([]);

    const resultados = await Promise.allSettled([
      listarMinhaAgenda(),
      listarMinhasComandas(),
      listarMinhasComissoes(),
    ]);

    const novosAvisos = [];

    if (resultados[0].status === "fulfilled") {
      setAgenda(Array.isArray(resultados[0].value) ? resultados[0].value : []);
    } else {
      setAgenda([]);
      novosAvisos.push(
        mensagemErro(resultados[0].reason, "Não foi possível carregar sua agenda.")
      );
    }

    if (resultados[1].status === "fulfilled") {
      setComandas(Array.isArray(resultados[1].value) ? resultados[1].value : []);
    } else {
      setComandas([]);
      novosAvisos.push(
        mensagemErro(resultados[1].reason, "Não foi possível carregar suas comandas.")
      );
    }

    if (resultados[2].status === "fulfilled") {
      setComissoes(Array.isArray(resultados[2].value) ? resultados[2].value : []);
    } else {
      setComissoes([]);
      novosAvisos.push(
        mensagemErro(resultados[2].reason, "Não foi possível carregar suas comissões.")
      );
    }

    setAvisos(novosAvisos);
    setCarregando(false);
  }

  useEffect(() => {
    carregarTudo();
  }, []);

  const agendaOrdenada = useMemo(
    () => [...agenda].sort(
      (a, b) =>
        (dataValida(a.data_hora_inicio)?.getTime() || 0) -
        (dataValida(b.data_hora_inicio)?.getTime() || 0)
    ),
    [agenda]
  );

  const agendamentosHoje = agendaOrdenada.filter((item) => {
    const data = dataValida(item.data_hora_inicio);
    return data && chaveDia(data) === chaveDia(hoje) &&
      STATUS_ATIVOS.has(String(item.status || "").toLowerCase());
  });

  const proximoAgendamento = agendaOrdenada.find((item) => {
    const data = dataValida(item.data_hora_inicio);
    return data && data >= hoje &&
      STATUS_ATIVOS.has(String(item.status || "").toLowerCase());
  });

  const comandasAbertas = comandas.filter(
    (item) => String(item.status || "").toLowerCase() === "aberta"
  );

  const comissoesFiltradas = useMemo(
    () => comissoes.filter((item) => {
      const data = dataValida(item.data);
      return data && chaveMes(data) === mesSelecionado;
    }),
    [comissoes, mesSelecionado]
  );

  const totalServicos = comissoesFiltradas.reduce(
    (soma, item) => soma + Number(item.valor_servico || 0),
    0
  );

  const totalComissoes = comissoesFiltradas.reduce(
    (soma, item) => soma + Number(item.valor_comissao || 0),
    0
  );

  const percentual = comissoesFiltradas.length
    ? Number(comissoesFiltradas[0].percentual || 0)
    : null;

  return (
    <main className={styles.pagina}>
      <header className={styles.cabecalho}>
        <div>
          <span className={styles.sobretitulo}>ÁREA DO BARBEIRO</span>
          <h1>Meu Painel</h1>
          <p>Acompanhe sua rotina, suas comandas e as comissões geradas.</p>
        </div>

        <button type="button" onClick={carregarTudo} disabled={carregando}>
          {carregando ? "Atualizando..." : "Atualizar"}
        </button>
      </header>

      {avisos.length > 0 && (
        <section className={styles.aviso}>
          {avisos.map((aviso) => <p key={aviso}>{aviso}</p>)}
        </section>
      )}

      <section className={styles.cards}>
        <Cartao
          titulo="Atendimentos hoje"
          valor={carregando ? "—" : agendamentosHoje.length}
          detalhe="Somente sua agenda"
        />
        <Cartao
          titulo="Próximo atendimento"
          valor={carregando ? "—" : (
            proximoAgendamento
              ? formatarDataHora(proximoAgendamento.data_hora_inicio)
              : "Sem próximo horário"
          )}
          detalhe={proximoAgendamento ? `Agendamento #${proximoAgendamento.id}` : "Agenda livre"}
        />
        <Cartao
          titulo="Comandas abertas"
          valor={carregando ? "—" : comandasAbertas.length}
          detalhe="Somente suas comandas"
        />
        <Cartao
          titulo="Comissão no mês"
          valor={carregando ? "—" : moeda(totalComissoes)}
          detalhe={percentual === null ? "Nenhuma comissão no período" : `Percentual: ${percentual}%`}
          destaque
        />
      </section>

      <section className={styles.atalhos}>
        <Link href="/agenda">Abrir minha agenda</Link>
        <Link href="/comandas">Abrir minhas comandas</Link>
      </section>

      <section className={styles.painel}>
        <div className={styles.tituloLinha}>
          <div>
            <h2>Meus ganhos e comissões</h2>
            <p>Valores gerados pelas suas comandas fechadas.</p>
          </div>
          <label>
            Mês de referência
            <input
              type="month"
              value={mesSelecionado}
              onChange={(evento) => setMesSelecionado(evento.target.value)}
            />
          </label>
        </div>

        <div className={styles.resumoFinanceiro}>
          <div><span>Serviços realizados</span><strong>{moeda(totalServicos)}</strong></div>
          <div><span>Comissão gerada</span><strong>{moeda(totalComissoes)}</strong></div>
          <div><span>Registros no período</span><strong>{comissoesFiltradas.length}</strong></div>
        </div>

        <div className={styles.tabelaContainer}>
          <table>
            <thead>
              <tr>
                <th>Data</th>
                <th>Comanda</th>
                <th>Serviços</th>
                <th>Percentual</th>
                <th>Comissão</th>
              </tr>
            </thead>
            <tbody>
              {comissoesFiltradas.length === 0 ? (
                <tr><td colSpan="5" className={styles.vazio}>Nenhuma comissão gerada neste mês.</td></tr>
              ) : comissoesFiltradas.map((item) => (
                <tr key={item.id}>
                  <td>{formatarDataHora(item.data)}</td>
                  <td>#{item.comanda_id}</td>
                  <td>{moeda(item.valor_servico)}</td>
                  <td>{Number(item.percentual || 0)}%</td>
                  <td className={styles.valorPositivo}>{moeda(item.valor_comissao)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className={styles.duasColunas}>
        <article className={styles.painel}>
          <div className={styles.tituloLinha}>
            <div><h2>Próximos agendamentos</h2><p>Seus próximos horários ativos.</p></div>
          </div>
          <div className={styles.lista}>
            {agendaOrdenada.filter((item) => {
              const data = dataValida(item.data_hora_inicio);
              return data && data >= hoje && STATUS_ATIVOS.has(String(item.status || "").toLowerCase());
            }).slice(0, 5).map((item) => (
              <div className={styles.itemLista} key={item.id}>
                <div><strong>{formatarDataHora(item.data_hora_inicio)}</strong><span>Agendamento #{item.id}</span></div>
                <span className={styles.status}>{rotuloStatus(item.status)}</span>
              </div>
            ))}
            {!carregando && agendaOrdenada.filter((item) => {
              const data = dataValida(item.data_hora_inicio);
              return data && data >= hoje && STATUS_ATIVOS.has(String(item.status || "").toLowerCase());
            }).length === 0 && <p className={styles.vazio}>Nenhum próximo agendamento.</p>}
          </div>
        </article>

        <article className={styles.painel}>
          <div className={styles.tituloLinha}>
            <div><h2>Minhas comandas</h2><p>Movimentação operacional recente.</p></div>
          </div>
          <div className={styles.lista}>
            {comandas.slice(0, 5).map((item) => (
              <div className={styles.itemLista} key={item.id}>
                <div><strong>Comanda #{item.id}</strong><span>{moeda(item.total)}</span></div>
                <span className={styles.status}>{rotuloStatus(item.status)}</span>
              </div>
            ))}
            {!carregando && comandas.length === 0 && <p className={styles.vazio}>Nenhuma comanda encontrada.</p>}
          </div>
        </article>
      </section>
    </main>
  );
}
