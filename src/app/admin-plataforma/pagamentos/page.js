"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  listarPagamentosSaas,
  listarBarbearias,
  listarPlanosSaas,
  listarAssinaturasSaas,
} from "@/services/adminPlataformaService";

const estilos = {
  pagina: {
    padding: 30,
    background: "#f8fafc",
    minHeight: "100vh",
  },

  subtitulo: {
    color: "#64748b",
    marginTop: 4,
  },

  cards: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(190px, 1fr))",
    gap: 14,
    margin: "24px 0",
  },

  card: {
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: 14,
    padding: 18,
    boxShadow:
      "0 6px 18px rgba(15,23,42,.04)",
  },

  cardLabel: {
    color: "#64748b",
    marginBottom: 8,
  },

  cardValor: {
    fontSize: 30,
    fontWeight: 700,
    color: "#0f172a",
  },

  painel: {
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: 14,
    padding: 20,
    marginTop: 18,
    boxShadow:
      "0 6px 18px rgba(15,23,42,.04)",
  },

  filtros: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 12,
    marginBottom: 18,
  },

  input: {
    padding: "11px 12px",
    border: "1px solid #cbd5e1",
    borderRadius: 9,
    fontSize: 15,
    background: "#fff",
  },

  tabelaWrapper: {
    overflowX: "auto",
  },

  tabela: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: 1250,
  },

  th: {
    textAlign: "left",
    padding: "12px 10px",
    borderBottom:
      "1px solid #e2e8f0",
    color: "#334155",
    whiteSpace: "nowrap",
  },

  td: {
    padding: "13px 10px",
    borderBottom:
      "1px solid #f1f5f9",
    verticalAlign: "middle",
  },

  badgeVerde: {
    display: "inline-block",
    padding: "5px 9px",
    borderRadius: 999,
    background: "#dcfce7",
    color: "#166534",
    fontWeight: 700,
    fontSize: 12,
  },

  badgeAmarelo: {
    display: "inline-block",
    padding: "5px 9px",
    borderRadius: 999,
    background: "#fef3c7",
    color: "#92400e",
    fontWeight: 700,
    fontSize: 12,
  },

  badgeVermelho: {
    display: "inline-block",
    padding: "5px 9px",
    borderRadius: 999,
    background: "#fee2e2",
    color: "#991b1b",
    fontWeight: 700,
    fontSize: 12,
  },

  badgeCinza: {
    display: "inline-block",
    padding: "5px 9px",
    borderRadius: 999,
    background: "#e2e8f0",
    color: "#334155",
    fontWeight: 700,
    fontSize: 12,
  },

  erro: {
    color: "#991b1b",
    background: "#fee2e2",
    border: "1px solid #fecaca",
    padding: 12,
    borderRadius: 10,
    margin: "18px 0",
  },
};

function dinheiro(valor) {
  const numero = Number(valor || 0);

  return numero.toLocaleString(
    "pt-BR",
    {
      style: "currency",
      currency: "BRL",
    }
  );
}

function dataHoraBr(valor) {
  if (!valor) return "-";

  const data = new Date(valor);

  if (Number.isNaN(data.getTime())) {
    return valor;
  }

  return data.toLocaleString("pt-BR");
}

function badgeStatus(status) {
  const valor = String(
    status || ""
  ).toLowerCase();

  if (
    valor === "approved" ||
    valor === "pago" ||
    valor === "accredited"
  ) {
    return estilos.badgeVerde;
  }

  if (
    valor === "pending" ||
    valor.includes("waiting")
  ) {
    return estilos.badgeAmarelo;
  }

  if (
    valor === "rejected" ||
    valor === "cancelled" ||
    valor === "refunded"
  ) {
    return estilos.badgeVermelho;
  }

  return estilos.badgeCinza;
}

export default function Page() {
  const [pagamentos, setPagamentos] =
    useState([]);

  const [barbearias, setBarbearias] =
    useState([]);

  const [planos, setPlanos] =
    useState([]);

  const [assinaturas, setAssinaturas] =
    useState([]);

  const [busca, setBusca] =
    useState("");

  const [filtroStatus, setFiltroStatus] =
    useState("");

  const [carregando, setCarregando] =
    useState(true);

  const [erro, setErro] =
    useState("");

  async function carregar() {
    setCarregando(true);
    setErro("");

    try {
      const [
        dadosPagamentos,
        dadosBarbearias,
        dadosPlanos,
        dadosAssinaturas,
      ] = await Promise.all([
        listarPagamentosSaas(),
        listarBarbearias(),
        listarPlanosSaas(),
        listarAssinaturasSaas(),
      ]);

      setPagamentos(
        Array.isArray(dadosPagamentos)
          ? dadosPagamentos
          : []
      );

      setBarbearias(
        Array.isArray(dadosBarbearias)
          ? dadosBarbearias
          : []
      );

      setPlanos(
        Array.isArray(dadosPlanos)
          ? dadosPlanos
          : []
      );

      setAssinaturas(
        Array.isArray(dadosAssinaturas)
          ? dadosAssinaturas
          : []
      );
    } catch (e) {
      setErro(
        e?.response?.data?.detail ||
          "Erro ao carregar pagamentos SaaS."
      );
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  const barbeariasPorId =
    useMemo(() => {
      return Object.fromEntries(
        barbearias.map((item) => [
          item.id,
          item,
        ])
      );
    }, [barbearias]);

  const planosPorId =
    useMemo(() => {
      return Object.fromEntries(
        planos.map((item) => [
          item.id,
          item,
        ])
      );
    }, [planos]);

  const assinaturasPorId =
    useMemo(() => {
      return Object.fromEntries(
        assinaturas.map((item) => [
          item.id,
          item,
        ])
      );
    }, [assinaturas]);

  const resumo = useMemo(() => {
    const total = pagamentos.length;

    const aprovados =
      pagamentos.filter(
        (item) =>
          String(item.status)
            .toLowerCase() ===
          "approved"
      ).length;

    const pendentes =
      pagamentos.filter(
        (item) =>
          String(item.status)
            .toLowerCase() ===
          "pending"
      ).length;

    const processados =
      pagamentos.filter(
        (item) =>
          Boolean(item.processado)
      ).length;

    const receitaAprovada =
      pagamentos
        .filter(
          (item) =>
            String(item.status)
              .toLowerCase() ===
            "approved"
        )
        .reduce(
          (soma, item) =>
            soma +
            Number(item.valor || 0),
          0
        );

    return {
      total,
      aprovados,
      pendentes,
      processados,
      receitaAprovada,
    };
  }, [pagamentos]);

  const filtrados = useMemo(() => {
    const termo = busca
      .trim()
      .toLowerCase();

    return pagamentos.filter(
      (item) => {
        const status =
          String(item.status || "")
            .toLowerCase();

        if (
          filtroStatus &&
          status !== filtroStatus
        ) {
          return false;
        }

        if (!termo) {
          return true;
        }

        const barbearia =
          barbeariasPorId[
            item.barbearia_id
          ];

        const plano =
          planosPorId[
            item.plano_id
          ];

        const assinatura =
          assinaturasPorId[
            item.assinatura_id
          ];

        const texto = [
          item.id,
          item.payment_id,
          item.external_reference,
          item.tipo_pagamento,
          item.payment_method_id,
          item.payment_type_id,
          item.payer_email,
          item.status,
          item.status_detail,
          barbearia?.nome,
          barbearia?.slug,
          plano?.nome,
          assinatura?.id,
        ]
          .filter(
            (valor) =>
              valor !== null &&
              valor !== undefined
          )
          .join(" ")
          .toLowerCase();

        return texto.includes(termo);
      }
    );
  }, [
    pagamentos,
    busca,
    filtroStatus,
    barbeariasPorId,
    planosPorId,
    assinaturasPorId,
  ]);

  return (
    <main style={estilos.pagina}>
      <h1>Pagamentos SaaS</h1>

      <p style={estilos.subtitulo}>
        Acompanhamento administrativo
        dos pagamentos das assinaturas
        da plataforma BarbSist.
      </p>

      {erro ? (
        <div style={estilos.erro}>
          {erro}
        </div>
      ) : null}

      <section style={estilos.cards}>
        <div style={estilos.card}>
          <div style={estilos.cardLabel}>
            Total de pagamentos
          </div>

          <div style={estilos.cardValor}>
            {resumo.total}
          </div>
        </div>

        <div style={estilos.card}>
          <div style={estilos.cardLabel}>
            Pagamentos aprovados
          </div>

          <div style={estilos.cardValor}>
            {resumo.aprovados}
          </div>
        </div>

        <div style={estilos.card}>
          <div style={estilos.cardLabel}>
            Pagamentos pendentes
          </div>

          <div style={estilos.cardValor}>
            {resumo.pendentes}
          </div>
        </div>

        <div style={estilos.card}>
          <div style={estilos.cardLabel}>
            Processados
          </div>

          <div style={estilos.cardValor}>
            {resumo.processados}
          </div>
        </div>

        <div style={estilos.card}>
          <div style={estilos.cardLabel}>
            Receita aprovada
          </div>

          <div
            style={{
              ...estilos.cardValor,
              fontSize: 24,
            }}
          >
            {dinheiro(
              resumo.receitaAprovada
            )}
          </div>
        </div>
      </section>

      <section style={estilos.painel}>
        <h2
          style={{
            marginTop: 0,
            fontSize: 20,
          }}
        >
          Hist?rico de pagamentos
        </h2>

        <div style={estilos.filtros}>
          <input
            type="search"
            value={busca}
            onChange={(e) =>
              setBusca(e.target.value)
            }
            placeholder="Buscar por barbearia, plano, pagamento, e-mail ou referencia..."
            style={estilos.input}
          />

          <select
            value={filtroStatus}
            onChange={(e) =>
              setFiltroStatus(
                e.target.value
              )
            }
            style={estilos.input}
          >
            <option value="">
              Todos os status
            </option>

            <option value="approved">
              Aprovado
            </option>

            <option value="pending">
              Pendente
            </option>

            <option value="rejected">
              Rejeitado
            </option>

            <option value="cancelled">
              Cancelado
            </option>

            <option value="refunded">
              Estornado
            </option>
          </select>
        </div>

        <div style={estilos.tabelaWrapper}>
          <table style={estilos.tabela}>
            <thead>
              <tr>
                <th style={estilos.th}>
                  ID
                </th>

                <th style={estilos.th}>
                  Barbearia
                </th>

                <th style={estilos.th}>
                  Plano
                </th>

                <th style={estilos.th}>
                  Pagamento
                </th>

                <th style={estilos.th}>
                  Forma
                </th>

                <th style={estilos.th}>
                  Valor
                </th>

                <th style={estilos.th}>
                  Parcelas
                </th>

                <th style={estilos.th}>
                  Status
                </th>

                <th style={estilos.th}>
                  Processado
                </th>

                <th style={estilos.th}>
                  Data
                </th>
              </tr>
            </thead>

            <tbody>
              {carregando ? (
                <tr>
                  <td
                    colSpan={10}
                    style={estilos.td}
                  >
                    Carregando pagamentos...
                  </td>
                </tr>
              ) : filtrados.length === 0 ? (
                <tr>
                  <td
                    colSpan={10}
                    style={estilos.td}
                  >
                    Nenhum pagamento encontrado.
                  </td>
                </tr>
              ) : (
                filtrados.map(
                  (item) => {
                    const barbearia =
                      barbeariasPorId[
                        item.barbearia_id
                      ];

                    const plano =
                      planosPorId[
                        item.plano_id
                      ];

                    return (
                      <tr key={item.id}>
                        <td style={estilos.td}>
                          {item.id}
                        </td>

                        <td style={estilos.td}>
                          <strong>
                            {barbearia?.nome ||
                              `Barbearia #${item.barbearia_id}`}
                          </strong>

                          <div
                            style={{
                              color:
                                "#64748b",
                              fontSize: 13,
                              marginTop: 3,
                            }}
                          >
                            {barbearia?.slug ||
                              ""}
                          </div>
                        </td>

                        <td style={estilos.td}>
                          <strong>
                            {plano?.nome ||
                              `Plano #${item.plano_id}`}
                          </strong>

                          <div
                            style={{
                              color:
                                "#64748b",
                              fontSize: 13,
                              marginTop: 3,
                            }}
                          >
                            Assinatura #
                            {item.assinatura_id}
                          </div>
                        </td>

                        <td style={estilos.td}>
                          <div>
                            {item.payment_id ||
                              "-"}
                          </div>

                          <div
                            style={{
                              color:
                                "#64748b",
                              fontSize: 12,
                              marginTop: 4,
                              maxWidth: 260,
                              wordBreak:
                                "break-all",
                            }}
                          >
                            {item.external_reference ||
                              ""}
                          </div>
                        </td>

                        <td style={estilos.td}>
                          <strong>
                            {item.tipo_pagamento ||
                              "-"}
                          </strong>

                          <div
                            style={{
                              color:
                                "#64748b",
                              fontSize: 13,
                              marginTop: 3,
                            }}
                          >
                            {item.payment_method_id ||
                              ""}
                          </div>
                        </td>

                        <td style={estilos.td}>
                          <strong>
                            {dinheiro(
                              item.valor
                            )}
                          </strong>

                          {item.valor_parcela ? (
                            <div
                              style={{
                                color:
                                  "#64748b",
                                fontSize: 13,
                                marginTop: 3,
                              }}
                            >
                              Parcela:{" "}
                              {dinheiro(
                                item.valor_parcela
                              )}
                            </div>
                          ) : null}
                        </td>

                        <td style={estilos.td}>
                          {item.installments ??
                            1}
                        </td>

                        <td style={estilos.td}>
                          <span
                            style={badgeStatus(
                              item.status
                            )}
                          >
                            {item.status ||
                              "-"}
                          </span>

                          <div
                            style={{
                              color:
                                "#64748b",
                              fontSize: 12,
                              marginTop: 4,
                            }}
                          >
                            {item.status_detail ||
                              ""}
                          </div>
                        </td>

                        <td style={estilos.td}>
                          <span
                            style={
                              item.processado
                                ? estilos.badgeVerde
                                : estilos.badgeAmarelo
                            }
                          >
                            {item.processado
                              ? "SIM"
                              : "NAO"}
                          </span>
                        </td>

                        <td style={estilos.td}>
                          {dataHoraBr(
                            item.data_criacao
                          )}
                        </td>
                      </tr>
                    );
                  }
                )
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
