"use client";

// DASHBOARD_TEMA_M3
// DASHBOARD_TEMA_CONFORTO_M4
// DASHBOARD_TEMA_SERENO_M5

import { useEffect, useState } from "react";

import styles from "../../app/dashboard.module.css";
import { buscarDashboard } from "@/services/dashboardService";
import GraficoLinha from "./GraficoLinha";
import GraficoBarras from "./GraficoBarras";
import GraficoRosca from "./GraficoRosca";

const OPCOES = [
  ["hoje", "Hoje"],
  ["semana", "Semana"],
  ["mes", "Mês"],
  ["ano", "Ano"],
  ["personalizado", "Personalizado"],
];

function dinheiro(valor) {
  return Number(valor || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export default function DashboardGraficosModal({ aberto, onClose }) {
  const [periodo, setPeriodo] = useState("mes");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [dados, setDados] = useState(null);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const [tema, setTema] = useState("claro");


  useEffect(() => {
    if (!aberto) return;

    const anterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function fecharComEsc(event) {
      if (event.key === "Escape") onClose();
    }

    window.addEventListener("keydown", fecharComEsc);

    return () => {
      document.body.style.overflow = anterior;
      window.removeEventListener("keydown", fecharComEsc);
    };
  }, [aberto, onClose]);

  useEffect(() => {
    if (!aberto) return;

    try {
      const temaSalvo = window.localStorage.getItem(
        "barbsist-dashboard-graficos-tema"
      );

      if (
        temaSalvo === "claro" ||
        temaSalvo === "escuro" ||
        temaSalvo === "conforto" ||
        temaSalvo === "sereno"
      ) {
        setTema(temaSalvo);
      }
    } catch {
      // A preferência visual é opcional; falha de storage não bloqueia o painel.
    }

    carregar("mes", "", "");
  }, [aberto]);

  function alterarTema(novoTema) {
    setTema(novoTema);

    try {
      window.localStorage.setItem(
        "barbsist-dashboard-graficos-tema",
        novoTema
      );
    } catch {
      // Mantém o tema apenas nesta sessão quando o navegador bloquear storage.
    }
  }

  async function carregar(novoPeriodo = periodo, inicio = dataInicio, fim = dataFim) {
    if (novoPeriodo === "personalizado" && (!inicio || !fim)) {
      setErro("Informe a data inicial e a data final para o período personalizado.");
      return;
    }

    setCarregando(true);
    setErro("");

    try {
      const params = {
        periodo: novoPeriodo,
        incluir_graficos: true,
      };

      if (novoPeriodo === "personalizado") {
        params.data_inicio = inicio;
        params.data_fim = fim;
      }

      const resposta = await buscarDashboard(params);
      setDados(resposta);
    } catch (error) {
      console.error("Erro ao carregar gráficos:", error);
      setErro(
        String(
          error?.response?.data?.detail ||
            "Não foi possível carregar os gráficos."
        )
      );
    } finally {
      setCarregando(false);
    }
  }

  async function selecionarPeriodo(novoPeriodo) {
    setPeriodo(novoPeriodo);
    setErro("");

    if (novoPeriodo === "personalizado" && (!dataInicio || !dataFim)) {
      return;
    }

    await carregar(novoPeriodo, dataInicio, dataFim);
  }

  if (!aberto) return null;

  const temaEscuro = tema === "escuro";
  const temaConforto = tema === "conforto";
  const temaSereno = tema === "sereno";
  const graficos = dados?.graficos || {};
  const indicadores = dados?.indicadores || {};
  const agenda = graficos?.agenda_status || {};

  return (
    <div
      className={`${styles.modalBackdrop} ${temaEscuro ? styles.modalBackdropEscuro : ""} ${temaConforto ? styles.modalBackdropConforto : ""} ${temaSereno ? styles.modalBackdropSereno : ""}`}
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        className={`${styles.modalPainel} ${temaEscuro ? styles.modalPainelEscuro : ""} ${temaConforto ? styles.modalPainelConforto : ""} ${temaSereno ? styles.modalPainelSereno : ""}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-graficos-dashboard"
      >
        <header className={styles.modalHeader}>
          <div>
            <p className={styles.eyebrow}>Visão gerencial</p>
            <h2 id="titulo-graficos-dashboard">Gráficos e análises</h2>
            <p>Os gráficos são carregados somente quando você abre este painel.</p>
          </div>

          <div className={styles.modalHeaderAcoes}>
            <div
              className={styles.temaControle}
              role="group"
              aria-label="Tema dos gráficos"
            >
              <button
                type="button"
                className={tema === "claro" ? styles.temaAtivo : styles.temaBotao}
                onClick={() => alterarTema("claro")}
                aria-pressed={tema === "claro"}
                aria-label="Usar tema claro"
              >
                <span aria-hidden="true">☀</span>
                <span>Claro</span>
              </button>

              <button
                type="button"
                className={tema === "conforto" ? styles.temaAtivo : styles.temaBotao}
                onClick={() => alterarTema("conforto")}
                aria-pressed={tema === "conforto"}
                aria-label="Usar tema conforto"
              >
                <span aria-hidden="true">◐</span>
                <span>Conforto</span>
              </button>

              <button
                type="button"
                className={tema === "sereno" ? styles.temaAtivo : styles.temaBotao}
                onClick={() => alterarTema("sereno")}
                aria-pressed={tema === "sereno"}
                aria-label="Usar tema sereno"
              >
                <span aria-hidden="true">◒</span>
                <span>Sereno</span>
              </button>

              <button
                type="button"
                className={tema === "escuro" ? styles.temaAtivo : styles.temaBotao}
                onClick={() => alterarTema("escuro")}
                aria-pressed={tema === "escuro"}
                aria-label="Usar tema escuro"
              >
                <span aria-hidden="true">☾</span>
                <span>Escuro</span>
              </button>
            </div>

            <button
              type="button"
              className={styles.botaoFechar}
              onClick={onClose}
              aria-label="Fechar gráficos"
            >
              ×
            </button>
          </div>
        </header>

        <div className={styles.filtrosPeriodo}>
          <div className={styles.periodoBotoes}>
            {OPCOES.map(([valor, rotulo]) => (
              <button
                type="button"
                key={valor}
                className={periodo === valor ? styles.periodoAtivo : styles.periodoBotao}
                onClick={() => selecionarPeriodo(valor)}
              >
                {rotulo}
              </button>
            ))}
          </div>

          {periodo === "personalizado" && (
            <div className={styles.filtroDatas}>
              <label>
                Início
                <input
                  type="date"
                  value={dataInicio}
                  onChange={(event) => setDataInicio(event.target.value)}
                />
              </label>

              <label>
                Fim
                <input
                  type="date"
                  value={dataFim}
                  onChange={(event) => setDataFim(event.target.value)}
                />
              </label>

              <button
                type="button"
                className={styles.botaoAplicar}
                onClick={() => carregar("personalizado", dataInicio, dataFim)}
              >
                Aplicar
              </button>
            </div>
          )}
        </div>

        {erro && <div className={`${styles.status} ${styles.error}`}>{erro}</div>}
        {carregando && <div className={styles.status}>Atualizando análises...</div>}

        {dados && (
          <>
            <div className={styles.modalMetricas}>
              <article>
                <span>Atendimentos</span>
                <strong>{dados?.atendimentos?.periodo ?? 0}</strong>
              </article>
              <article>
                <span>Serviços realizados</span>
                <strong>{indicadores.servicos_realizados ?? 0}</strong>
              </article>
              <article>
                <span>Receitas</span>
                <strong>{dinheiro(indicadores.receitas)}</strong>
              </article>
              <article>
                <span>Resultado</span>
                <strong>{dinheiro(indicadores.resultado)}</strong>
              </article>
            </div>

            <div className={styles.graficosGrid}>
              <article className={styles.graficoCardGrande}>
                <div className={styles.graficoTitulo}>
                  <h3>Evolução dos atendimentos</h3>
                  <p>Comandas fechadas que possuem ao menos um serviço.</p>
                </div>
                <GraficoLinha
                  dados={graficos.atendimentos_evolucao || []}
                  series={[
                    {
                      chave: "valor",
                      rotulo: "Atendimentos",
                      cor: "#2563eb",
                    },
                  ]}
                />
              </article>

              <article className={styles.graficoCardGrande}>
                <div className={styles.graficoTitulo}>
                  <h3>Receitas e despesas</h3>
                  <p>Evolução do Caixa no mesmo período selecionado.</p>
                </div>
                <GraficoLinha
                  dados={graficos.financeiro_evolucao || []}
                  formato="moeda"
                  series={[
                    {
                      chave: "entradas",
                      rotulo: "Receitas",
                      cor: "#0f766e",
                    },
                    {
                      chave: "saidas",
                      rotulo: "Despesas",
                      cor: "#dc2626",
                    },
                  ]}
                />
              </article>

              <article className={styles.graficoCard}>
                <div className={styles.graficoTitulo}>
                  <h3>Serviços mais realizados</h3>
                  <p>Quantidade efetivamente lançada em comandas fechadas.</p>
                </div>
                <GraficoBarras
                  dados={graficos.servicos_top || []}
                  chaveValor="quantidade"
                  secundaria={{ chave: "valor", rotulo: "Valor" }}
                  secundariaTipo="moeda"
                />
              </article>

              <article className={styles.graficoCard}>
                <div className={styles.graficoTitulo}>
                  <h3>Produtos mais vendidos</h3>
                  <p>Somente produtos de comandas fechadas.</p>
                </div>
                <GraficoBarras
                  dados={graficos.produtos_top || []}
                  chaveValor="quantidade"
                  secundaria={{ chave: "valor", rotulo: "Receita" }}
                  secundariaTipo="moeda"
                />
              </article>

              <article className={styles.graficoCard}>
                <div className={styles.graficoTitulo}>
                  <h3>Atendimentos por barbeiro</h3>
                  <p>Ranking por volume de atendimentos realizados.</p>
                </div>
                <GraficoBarras
                  dados={graficos.barbeiros_top || []}
                  chaveValor="atendimentos"
                  secundaria={{ chave: "servicos", rotulo: "Serviços" }}
                />
              </article>

              <article className={styles.graficoCard}>
                <div className={styles.graficoTitulo}>
                  <h3>Planos de clientes</h3>
                  <p>Base ativa atual e movimentação do período.</p>
                </div>

                {(graficos.planos || []).length ? (
                  <div className={styles.planosLista}>
                    {(graficos.planos || []).map((plano) => (
                      <div className={styles.planoLinha} key={plano.id}>
                        <div>
                          <strong>{plano.nome}</strong>
                          <span>{plano.novas_adesoes} nova(s) adesão(ões)</span>
                        </div>
                        <div className={styles.planoNumeros}>
                          <strong>{plano.ativos} ativos</strong>
                          <span>{dinheiro(plano.receita)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className={styles.graficoVazio}>Sem dados de planos no período.</div>
                )}
              </article>

              <article className={styles.graficoCard}>
                <div className={styles.graficoTitulo}>
                  <h3>Formas de pagamento</h3>
                  <p>Distribuição das entradas financeiras.</p>
                </div>
                <GraficoRosca
                  dados={graficos.formas_pagamento || []}
                  chaveValor="valor"
                />
              </article>

              <article className={styles.graficoCard}>
                <div className={styles.graficoTitulo}>
                  <h3>Origem dos agendamentos</h3>
                  <p>Comparação entre agendamentos internos e online.</p>
                </div>
                <GraficoRosca
                  dados={graficos.origens_agendamento || []}
                  chaveValor="quantidade"
                />
              </article>

              <article className={styles.graficoCard}>
                <div className={styles.graficoTitulo}>
                  <h3>Agenda do período</h3>
                  <p>Sem transformar reagendamento automaticamente em perda.</p>
                </div>
                <div className={styles.agendaMetricas}>
                  <div>
                    <span>Agendamentos</span>
                    <strong>{agenda.total ?? 0}</strong>
                  </div>
                  <div>
                    <span>Cancelados</span>
                    <strong>{agenda.cancelados ?? 0}</strong>
                  </div>
                  <div>
                    <span>Não compareceu</span>
                    <strong>{agenda.nao_compareceu ?? 0}</strong>
                  </div>
                </div>
              </article>
            </div>
          </>
        )}

        <footer className={styles.modalFooter}>
          <button
            type="button"
            className={styles.botaoFecharRodape}
            onClick={onClose}
          >
            Fechar gráficos
          </button>
        </footer>
      </section>
    </div>
  );
}
