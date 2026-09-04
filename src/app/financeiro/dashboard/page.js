"use client";

import { useEffect, useMemo, useState } from "react";
import { buscarDashboardFinanceiro } from "@/services/financeiroService";
import { Card, Painel, moeda } from "@/components/DataView";

export default function DashboardFinanceiroPage() {
  const [dados, setDados] = useState(null);
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(true);

  async function carregar() {
    setErro("");
    setCarregando(true);

    try {
      const resposta = await buscarDashboardFinanceiro();
      setDados(resposta);
    } catch (e) {
      console.error(e);
      setErro(
        e?.response?.data?.detail ||
          "Erro ao carregar dashboard financeiro."
      );
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  const receita =
    dados?.receitas ??
    dados?.total_receitas ??
    dados?.entradas ??
    0;

  const despesas =
    dados?.despesas ??
    dados?.total_despesas ??
    dados?.saidas ??
    0;

  const saldo =
    dados?.saldo ??
    Number(receita || 0) -
      Number(despesas || 0);

  const receitasPorOrigem =
    dados?.receitas_por_origem ?? [];

  const despesasPorOrigem =
    dados?.despesas_por_origem ?? [];

  const movimentacoesRecentes =
    dados?.movimentacoes_recentes ?? [];

  const cardsSecundarios = useMemo(
    () => [
      {
        titulo: "Contas a Receber Pendentes",
        valor:
          dados?.contas_receber_pendentes ?? 0,
      },
      {
        titulo: "Contas a Pagar Pendentes",
        valor:
          dados?.contas_pagar_pendentes ?? 0,
      },
      {
        titulo: "Recebimentos Vencidos",
        valor:
          dados?.contas_receber_vencidas ?? 0,
      },
      {
        titulo: "Pagamentos Vencidos",
        valor:
          dados?.contas_pagar_vencidas ?? 0,
      },
      {
        titulo: "Movimentações",
        valor:
          dados?.quantidade_movimentacoes ?? 0,
      },
    ],
    [dados]
  );

  const cardStyle = {
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: 14,
    padding: 18,
  };

  const linhaStyle = {
    display: "flex",
    justifyContent: "space-between",
    gap: 16,
    padding: "10px 0",
    borderBottom: "1px solid #e2e8f0",
  };

  return (
    <main
      style={{
        padding: 30,
        background: "#f8fafc",
        minHeight: "100vh",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 16,
        }}
      >
        <div>
          <h1>Dashboard Financeiro</h1>

          <p style={{ color: "#64748b" }}>
            Visão consolidada das receitas,
            despesas e compromissos financeiros.
          </p>
        </div>

        <button
          type="button"
          onClick={carregar}
          disabled={carregando}
          style={{
            border: "1px solid #cbd5e1",
            borderRadius: 9,
            padding: "10px 16px",
            background: "#ffffff",
            fontWeight: 700,
            cursor:
              carregando
                ? "not-allowed"
                : "pointer",
          }}
        >
          {carregando
            ? "Atualizando..."
            : "Atualizar"}
        </button>
      </div>

      {erro ? (
        <div
          style={{
            color: "#991b1b",
            margin: "18px 0",
          }}
        >
          {erro}
        </div>
      ) : null}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(3,minmax(0,1fr))",
          gap: 16,
          margin: "24px 0",
        }}
      >
        <Card
          titulo="Receitas"
          valor={moeda(receita)}
        />

        <Card
          titulo="Despesas"
          valor={moeda(despesas)}
        />

        <Card
          titulo="Saldo"
          valor={moeda(saldo)}
        />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit,minmax(210px,1fr))",
          gap: 16,
          marginBottom: 24,
        }}
      >
        {cardsSecundarios.map((item) => (
          <div
            key={item.titulo}
            style={cardStyle}
          >
            <div
              style={{
                color: "#64748b",
                marginBottom: 8,
              }}
            >
              {item.titulo}
            </div>

            <strong
              style={{
                fontSize: 26,
              }}
            >
              {item.valor}
            </strong>
          </div>
        ))}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(2,minmax(0,1fr))",
          gap: 16,
          marginBottom: 24,
        }}
      >
        <Painel titulo="Receitas por origem">
          {receitasPorOrigem.length === 0 ? (
            <p style={{ color: "#64748b" }}>
              Nenhuma receita no período.
            </p>
          ) : (
            receitasPorOrigem.map((item) => (
              <div
                key={`${item.origem}-${item.valor}`}
                style={linhaStyle}
              >
                <span>{item.origem}</span>
                <strong>
                  {moeda(item.valor)}
                </strong>
              </div>
            ))
          )}
        </Painel>

        <Painel titulo="Despesas por origem">
          {despesasPorOrigem.length === 0 ? (
            <p style={{ color: "#64748b" }}>
              Nenhuma despesa no período.
            </p>
          ) : (
            despesasPorOrigem.map((item) => (
              <div
                key={`${item.origem}-${item.valor}`}
                style={linhaStyle}
              >
                <span>{item.origem}</span>
                <strong>
                  {moeda(item.valor)}
                </strong>
              </div>
            ))
          )}
        </Painel>
      </div>

      <Painel titulo="Movimentações recentes">
        {movimentacoesRecentes.length === 0 ? (
          <p style={{ color: "#64748b" }}>
            Nenhuma movimentação recente.
          </p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="financeTableBarbSist"
              style={{
                width: "100%",
                borderCollapse: "collapse",
              }}
            >
              <thead>
                <tr>
                  <th
                    style={{
                      textAlign: "left",
                      padding: 10,
                    }}
                  >
                    Data
                  </th>

                  <th
                    style={{
                      textAlign: "left",
                      padding: 10,
                    }}
                  >
                    Tipo
                  </th>

                  <th
                    style={{
                      textAlign: "left",
                      padding: 10,
                    }}
                  >
                    Origem
                  </th>

                  <th
                    style={{
                      textAlign: "left",
                      padding: 10,
                    }}
                  >
                    Descrição
                  </th>

                  <th
                    style={{
                      textAlign: "right",
                      padding: 10,
                    }}
                  >
                    Valor
                  </th>
                </tr>
              </thead>

              <tbody>
                {movimentacoesRecentes.map(
                  (movimento, indice) => (
                    <tr
                      key={
                        movimento.id ??
                        indice
                      }
                    >
                      <td
                        style={{
                          padding: 10,
                          borderTop:
                            "1px solid #e2e8f0",
                        }}
                      >
                        {movimento.data ??
                          movimento.data_movimentacao ??
                          "-"}
                      </td>

                      <td
                        style={{
                          padding: 10,
                          borderTop:
                            "1px solid #e2e8f0",
                        }}
                      >
                        {movimento.tipo ?? "-"}
                      </td>

                      <td
                        style={{
                          padding: 10,
                          borderTop:
                            "1px solid #e2e8f0",
                        }}
                      >
                        {movimento.origem ?? "-"}
                      </td>

                      <td
                        style={{
                          padding: 10,
                          borderTop:
                            "1px solid #e2e8f0",
                        }}
                      >
                        {movimento.descricao ??
                          "-"}
                      </td>

                      <td
                        style={{
                          padding: 10,
                          borderTop:
                            "1px solid #e2e8f0",
                          textAlign: "right",
                          fontWeight: 700,
                        }}
                      >
                        {moeda(
                          movimento.valor ?? 0
                        )}
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </Painel>
    </main>
  );
}
