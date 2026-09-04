"use client";

import { useEffect, useState } from "react";
import { buscarFluxoCaixa } from "@/services/financeiroService";
import { moeda } from "@/components/DataView";

function dataBr(data) {
  if (!data) return "-";

  const partes = String(data).split("-");
  if (partes.length !== 3) return data;

  return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

export default function FluxoCaixaPage() {
  const [dados, setDados] = useState(null);
  const [erro, setErro] = useState("");

  useEffect(() => {
    buscarFluxoCaixa()
      .then(setDados)
      .catch((e) => {
        console.error(e);
        setErro(
          e?.response?.data?.detail ||
            "Erro ao carregar fluxo de caixa."
        );
      });
  }, []);

  const dias = Array.isArray(dados?.dias)
    ? dados.dias
    : [];

  return (
    <main
      style={{
        padding: 30,
        background: "#f8fafc",
        minHeight: "100vh",
      }}
    >
      <h1>Fluxo de Caixa</h1>

      <p style={{ color: "#64748b" }}>
        Acompanhe as entradas, saídas e o saldo financeiro da barbearia.
      </p>

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

      {!dados && !erro ? (
        <div
          style={{
            background: "#fff",
            padding: 24,
            borderRadius: 14,
            marginTop: 24,
          }}
        >
          Carregando fluxo de caixa...
        </div>
      ) : null}

      {dados ? (
        <>
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit,minmax(200px,1fr))",
              gap: 16,
              margin: "24px 0",
            }}
          >
            <Resumo
              titulo="Saldo Inicial"
              valor={moeda(dados?.saldo_inicial ?? 0)}
            />

            <Resumo
              titulo="Saldo Final"
              valor={moeda(dados?.saldo_final ?? 0)}
              destaque
            />

            <Resumo
              titulo="Período"
              valor={`${dataBr(
                dados?.data_inicio
              )} a ${dataBr(dados?.data_fim)}`}
            />
          </div>

          <section
            style={{
              background: "#fff",
              border: "1px solid #e2e8f0",
              borderRadius: 14,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: "20px 22px",
                borderBottom: "1px solid #e2e8f0",
              }}
            >
              <h2
                style={{
                  margin: 0,
                  fontSize: 20,
                }}
              >
                Movimentação por dia
              </h2>
            </div>

            <div style={{ overflowX: "auto" }}>
              <table className="financeTableBarbSist"
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                }}
              >
                <thead>
                  <tr
                    style={{
                      background: "#f8fafc",
                      textAlign: "left",
                    }}
                  >
                    <Th>Data</Th>
                    <Th>Entradas</Th>
                    <Th>Saídas</Th>
                    <Th>Saldo do dia</Th>
                    <Th>Saldo acumulado</Th>
                  </tr>
                </thead>

                <tbody>
                  {dias.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        style={{
                          padding: 24,
                          textAlign: "center",
                          color: "#64748b",
                        }}
                      >
                        Nenhuma movimentação encontrada no período.
                      </td>
                    </tr>
                  ) : (
                    dias.map((dia, indice) => (
                      <tr
                        key={`${dia?.data || "dia"}-${indice}`}
                        style={{
                          borderTop: "1px solid #e2e8f0",
                        }}
                      >
                        <Td>{dataBr(dia?.data)}</Td>

                        <Td>
                          {moeda(dia?.entradas ?? 0)}
                        </Td>

                        <Td>
                          {moeda(dia?.saidas ?? 0)}
                        </Td>

                        <Td>
                          {moeda(dia?.saldo_dia ?? 0)}
                        </Td>

                        <Td forte>
                          {moeda(
                            dia?.saldo_acumulado ?? 0
                          )}
                        </Td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </>
      ) : null}
    </main>
  );
}

function Resumo({ titulo, valor, destaque = false }) {
  return (
    <div
      style={{
        background: "#fff",
        border: destaque
          ? "2px solid #2563eb"
          : "1px solid #e2e8f0",
        borderRadius: 14,
        padding: 22,
      }}
    >
      <div
        style={{
          color: "#64748b",
          marginBottom: 10,
        }}
      >
        {titulo}
      </div>

      <div
        style={{
          fontSize: destaque ? 28 : 24,
          fontWeight: 700,
          color: destaque ? "#1d4ed8" : "#0f172a",
        }}
      >
        {valor}
      </div>
    </div>
  );
}

function Th({ children }) {
  return (
    <th
      style={{
        padding: "14px 18px",
        color: "#475569",
        fontWeight: 600,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </th>
  );
}

function Td({ children, forte = false }) {
  return (
    <td
      style={{
        padding: "16px 18px",
        color: "#0f172a",
        fontWeight: forte ? 700 : 400,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </td>
  );
}
