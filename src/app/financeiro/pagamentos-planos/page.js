"use client";

import { useEffect, useState } from "react";

import {
  listarPagamentosPlanos,
  verificarInadimplencia,
} from "@/services/assinaturaService";

import {
  Botao,
  Painel,
  moeda,
} from "@/components/DataView";


function formatarData(valor) {
  if (!valor) return "-";

  const data = new Date(valor);

  if (Number.isNaN(data.getTime())) {
    return valor;
  }

  return data.toLocaleString("pt-BR");
}


function estiloStatus(status) {
  const valor = String(
    status || ""
  ).toUpperCase();

  if (valor === "PAGO") {
    return {
      background: "#dcfce7",
      color: "#166534",
    };
  }

  if (
    valor === "PENDENTE" ||
    valor === "ABERTO"
  ) {
    return {
      background: "#fef3c7",
      color: "#92400e",
    };
  }

  if (
    valor === "VENCIDO" ||
    valor === "ATRASADO" ||
    valor === "CANCELADO"
  ) {
    return {
      background: "#fee2e2",
      color: "#991b1b",
    };
  }

  return {
    background: "#e2e8f0",
    color: "#334155",
  };
}


export default function PagamentosPlanosPage() {
  const [pagamentos, setPagamentos] =
    useState([]);

  const [erro, setErro] =
    useState("");

  const [mensagem, setMensagem] =
    useState("");

  const [carregando, setCarregando] =
    useState(true);


  async function carregar() {
    setErro("");
    setCarregando(true);

    try {
      const resposta =
        await listarPagamentosPlanos();

      setPagamentos(
        Array.isArray(resposta)
          ? resposta
          : []
      );
    } catch (e) {
      console.error(e);

      setErro(
        e?.response?.data?.detail ||
          "Não foi possível carregar os pagamentos dos planos."
      );
    } finally {
      setCarregando(false);
    }
  }


  useEffect(() => {
    carregar();
  }, []);


  async function verificar() {
    setErro("");
    setMensagem("");

    try {
      const resultado =
        await verificarInadimplencia();

      setMensagem(
        resultado?.mensagem ||
          "Verificação de inadimplência concluída."
      );

      await carregar();
    } catch (e) {
      console.error(e);

      setErro(
        e?.response?.data?.detail ||
          "Não foi possível verificar inadimplência."
      );
    }
  }


  const totalPago = pagamentos
    .filter(
      (item) =>
        String(
          item?.status || ""
        ).toUpperCase() === "PAGO"
    )
    .reduce(
      (soma, item) =>
        soma +
        Number(item?.valor || 0),
      0
    );


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
          justifyContent:
            "space-between",
          alignItems: "center",
          gap: 16,
        }}
      >
        <div>
          <h1>
            Pagamentos de Planos
          </h1>

          <p
            style={{
              color: "#64748b",
            }}
          >
            Histórico financeiro das
            assinaturas dos clientes.
          </p>
        </div>

        <div
          style={{
            display: "flex",
            gap: 8,
          }}
        >
          <Botao
            tipo="neutro"
            onClick={carregar}
            disabled={carregando}
          >
            Atualizar
          </Botao>

          <Botao
            onClick={verificar}
          >
            Verificar inadimplência
          </Botao>
        </div>
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


      {mensagem ? (
        <div
          style={{
            color: "#166534",
            margin: "18px 0",
          }}
        >
          {mensagem}
        </div>
      ) : null}


      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(2,minmax(0,1fr))",
          gap: 16,
          margin: "24px 0",
        }}
      >
        <Resumo
          titulo="Pagamentos registrados"
          valor={pagamentos.length}
        />

        <Resumo
          titulo="Total pago"
          valor={moeda(totalPago)}
          destaque
        />
      </div>


      <Painel
        titulo="Histórico de pagamentos"
      >
        {carregando ? (
          <p>
            Carregando pagamentos...
          </p>
        ) : pagamentos.length === 0 ? (
          <p
            style={{
              color: "#64748b",
            }}
          >
            Nenhum pagamento registrado.
          </p>
        ) : (
          <div
            style={{
              overflowX: "auto",
            }}
          >
            <table className="financeTableBarbSist"
              style={{
                width: "100%",
                borderCollapse:
                  "collapse",
              }}
            >
              <thead>
                <tr
                  style={{
                    background:
                      "#f8fafc",
                  }}
                >
                  <Th>Cliente</Th>
                  <Th>Plano</Th>
                  <Th>Referência</Th>
                  <Th>Valor</Th>
                  <Th>Forma</Th>
                  <Th>Status</Th>
                  <Th>Data</Th>
                  <Th>Observações</Th>
                </tr>
              </thead>

              <tbody>
                {pagamentos.map(
                  (pagamento) => {
                    const status =
                      String(
                        pagamento?.status ||
                          "-"
                      ).toUpperCase();

                    const estilo =
                      estiloStatus(
                        status
                      );

                    return (
                      <tr
                        key={
                          pagamento.id
                        }
                        style={{
                          borderTop:
                            "1px solid #e2e8f0",
                        }}
                      >
                        <Td>
                          Cliente #
                          {
                            pagamento.cliente_id
                          }
                        </Td>

                        <Td>
                          Plano #
                          {
                            pagamento.plano_id
                          }
                        </Td>

                        <Td>
                          {pagamento.referencia_mes ||
                            "-"}
                        </Td>

                        <Td forte>
                          {moeda(
                            pagamento.valor ||
                              0
                          )}
                        </Td>

                        <Td>
                          {pagamento.forma_pagamento ||
                            "-"}
                        </Td>

                        <Td>
                          <span
                            style={{
                              ...estilo,
                              display:
                                "inline-block",
                              padding:
                                "5px 9px",
                              borderRadius:
                                999,
                              fontWeight:
                                700,
                              fontSize: 12,
                            }}
                          >
                            {status}
                          </span>
                        </Td>

                        <Td>
                          {formatarData(
                            pagamento.data_pagamento
                          )}
                        </Td>

                        <Td>
                          {pagamento.observacoes ||
                            "-"}
                        </Td>
                      </tr>
                    );
                  }
                )}
              </tbody>
            </table>
          </div>
        )}
      </Painel>
    </main>
  );
}


function Resumo({
  titulo,
  valor,
  destaque = false,
}) {
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

      <strong
        style={{
          fontSize: 26,
          color: destaque
            ? "#1d4ed8"
            : "#0f172a",
        }}
      >
        {valor}
      </strong>
    </div>
  );
}


function Th({ children }) {
  return (
    <th
      style={{
        textAlign: "left",
        padding: "13px 12px",
        color: "#475569",
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </th>
  );
}


function Td({
  children,
  forte = false,
}) {
  return (
    <td
      style={{
        padding: "14px 12px",
        verticalAlign: "top",
        fontWeight:
          forte ? 700 : 400,
      }}
    >
      {children}
    </td>
  );
}
