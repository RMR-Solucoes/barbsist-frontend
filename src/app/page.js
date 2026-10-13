"use client";

import { useCallback, useEffect, useState } from "react";

import styles from "./dashboard.module.css";
import { buscarDashboard } from "@/services/dashboardService";
import DashboardGraficosModal from "@/components/dashboard/DashboardGraficosModal";

function dinheiro(valor) {
  return Number(valor || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export default function Home() {
  const [dados, setDados] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [graficosAbertos, setGraficosAbertos] = useState(false);

  const carregarResumo = useCallback(async () => {
    setCarregando(true);
    setErro("");

    try {
      const resposta = await buscarDashboard({
        periodo: "mes",
        incluir_graficos: false,
      });
      setDados(resposta);
    } catch (error) {
      console.error("Erro Dashboard:", error);
      setErro(
        String(
          error?.response?.data?.detail ||
            "Não foi possível carregar os indicadores do Dashboard."
        )
      );
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregarResumo();
  }, [carregarResumo]);

  const atendimentos = dados?.atendimentos || {};
  const indicadores = dados?.indicadores || {};
  const estoque = dados?.estoque || {};
  const operacao = dados?.operacao || {};

  return (
    <section className={styles.dashboard}>
      <header className={styles.pageHeader}>
        <div>
          <p className={styles.eyebrow}>Visão geral</p>
          <h1 className={styles.title}>Dashboard</h1>
          <p className={styles.subtitle}>
            Acompanhe o essencial da barbearia sem poluir sua tela.
          </p>
        </div>

        <button
          type="button"
          className={styles.botaoGraficos}
          onClick={() => setGraficosAbertos(true)}
          disabled={carregando || !dados}
        >
          <span aria-hidden="true">📊</span>
          Ver gráficos e análises
        </button>
      </header>

      {carregando && <div className={styles.status}>Carregando indicadores...</div>}

      {erro && (
        <div className={`${styles.status} ${styles.error}`}>
          {erro}
          <button
            type="button"
            className={styles.botaoTentarNovamente}
            onClick={carregarResumo}
          >
            Tentar novamente
          </button>
        </div>
      )}

      {dados && (
        <>
          <section className={styles.atendimentosBloco}>
            <div className={styles.secaoCabecalho}>
              <div>
                <p className={styles.eyebrow}>Atendimentos realizados</p>
                <h2>Movimento da barbearia</h2>
              </div>
              <span className={styles.secaoNota}>Comandas fechadas com serviço</span>
            </div>

            <div className={styles.atendimentosGrid}>
              {[
                ["Hoje", atendimentos.hoje],
                ["Semana", atendimentos.semana],
                ["Mês", atendimentos.mes],
                ["Ano", atendimentos.ano],
              ].map(([rotulo, valor]) => (
                <article className={styles.atendimentoCard} key={rotulo}>
                  <span>{rotulo}</span>
                  <strong>{valor ?? 0}</strong>
                </article>
              ))}
            </div>
          </section>

          <section className={styles.indicadoresGrid}>
            <article className={styles.indicadorCard}>
              <span>Receitas no mês</span>
              <strong>{dinheiro(indicadores.receitas)}</strong>
              <small>Entradas ativas do Caixa</small>
            </article>

            <article className={styles.indicadorCard}>
              <span>Serviços realizados</span>
              <strong>{indicadores.servicos_realizados ?? 0}</strong>
              <small>No mês atual</small>
            </article>

            <article className={styles.indicadorCard}>
              <span>Serviços por atendimento</span>
              <strong>
                {Number(indicadores.servicos_por_atendimento || 0).toLocaleString(
                  "pt-BR",
                  { minimumFractionDigits: 2, maximumFractionDigits: 2 }
                )}
              </strong>
              <small>Média do mês</small>
            </article>

            <article className={styles.indicadorCard}>
              <span>Comandas abertas</span>
              <strong>{indicadores.comandas_abertas ?? 0}</strong>
              <small>Situação atual</small>
            </article>
          </section>

          <section className={styles.resumoInferior}>
            <article className={styles.atencaoCard}>
              <div className={styles.secaoCabecalho}>
                <div>
                  <p className={styles.eyebrow}>Atenção</p>
                  <h2>Estoque</h2>
                </div>
                <div className={styles.badgesEstoque}>
                  <span>{estoque.estoque_baixo ?? 0} baixo</span>
                  <span>{estoque.sem_estoque ?? 0} zerado</span>
                </div>
              </div>

              {(estoque.alertas || []).length ? (
                <div className={styles.alertasLista}>
                  {(estoque.alertas || []).slice(0, 5).map((item) => (
                    <div className={styles.alertaLinha} key={item.produto_id}>
                      <div>
                        <strong>{item.nome}</strong>
                        <span>
                          Saldo {item.estoque} · mínimo {item.estoque_minimo}
                        </span>
                      </div>
                      <b
                        className={
                          item.status === "SEM_ESTOQUE"
                            ? styles.alertaCritico
                            : styles.alertaAviso
                        }
                      >
                        {item.status === "SEM_ESTOQUE" ? "Sem estoque" : "Estoque baixo"}
                      </b>
                    </div>
                  ))}
                </div>
              ) : (
                <div className={styles.estadoPositivo}>
                  Nenhum produto em alerta de estoque.
                </div>
              )}
            </article>

            <article className={styles.operacaoCard}>
              <p className={styles.eyebrow}>Operação atual</p>
              <h2>Estrutura da barbearia</h2>

              <div className={styles.operacaoGrid}>
                <div>
                  <span>Clientes ativos</span>
                  <strong>{operacao.clientes_ativos ?? 0}</strong>
                </div>
                <div>
                  <span>Barbeiros ativos</span>
                  <strong>{operacao.barbeiros_ativos ?? 0}</strong>
                </div>
                <div>
                  <span>Produtos ativos</span>
                  <strong>{estoque.produtos_ativos ?? 0}</strong>
                </div>
                <div>
                  <span>Valor em estoque</span>
                  <strong>{dinheiro(estoque.valor_custo)}</strong>
                </div>
              </div>
            </article>
          </section>
        </>
      )}

      <DashboardGraficosModal
        aberto={graficosAbertos}
        onClose={() => setGraficosAbertos(false)}
      />
    </section>
  );
}
