"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  listarAssinaturasSaas,
  bloquearAssinaturaSaas,
  liberarAssinaturaSaas,
  listarBarbearias,
  listarPlanosSaas,
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
    minWidth: 1150,
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

  botaoBloquear: {
    border: 0,
    background: "#fee2e2",
    color: "#991b1b",
    borderRadius: 8,
    padding: "8px 11px",
    cursor: "pointer",
    fontWeight: 700,
  },

  botaoLiberar: {
    border: 0,
    background: "#dcfce7",
    color: "#166534",
    borderRadius: 8,
    padding: "8px 11px",
    cursor: "pointer",
    fontWeight: 700,
  },

  erro: {
    color: "#991b1b",
    background: "#fee2e2",
    border: "1px solid #fecaca",
    padding: 12,
    borderRadius: 10,
    margin: "18px 0",
  },

  sucesso: {
    color: "#166534",
    background: "#dcfce7",
    border: "1px solid #bbf7d0",
    padding: 12,
    borderRadius: 10,
    margin: "18px 0",
  },
};

function dataBr(valor) {
  if (!valor) return "-";

  const data = new Date(valor);

  if (Number.isNaN(data.getTime())) {
    return valor;
  }

  return data.toLocaleDateString(
    "pt-BR",
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }
  );
}

function badgeStatus(status) {
  const valor = String(
    status || ""
  ).toUpperCase();

  if (
    valor === "ATIVA" ||
    valor === "PAGO" ||
    valor === "APROVADO"
  ) {
    return estilos.badgeVerde;
  }

  if (
    valor === "PENDENTE" ||
    valor === "AGUARDANDO"
  ) {
    return estilos.badgeAmarelo;
  }

  if (
    valor === "BLOQUEADA" ||
    valor === "CANCELADA" ||
    valor === "INADIMPLENTE"
  ) {
    return estilos.badgeVermelho;
  }

  return estilos.badgeCinza;
}

export default function Page() {
  const [assinaturas, setAssinaturas] =
    useState([]);

  const [barbearias, setBarbearias] =
    useState([]);

  const [planos, setPlanos] =
    useState([]);

  const [busca, setBusca] =
    useState("");

  const [filtroStatus, setFiltroStatus] =
    useState("");

  const [carregando, setCarregando] =
    useState(true);

  const [processandoId, setProcessandoId] =
    useState(null);

  const [erro, setErro] =
    useState("");

  const [sucesso, setSucesso] =
    useState("");

  async function carregar() {
    setCarregando(true);
    setErro("");

    try {
      const [
        dadosAssinaturas,
        dadosBarbearias,
        dadosPlanos,
      ] = await Promise.all([
        listarAssinaturasSaas(),
        listarBarbearias(),
        listarPlanosSaas(),
      ]);

      setAssinaturas(
        Array.isArray(dadosAssinaturas)
          ? dadosAssinaturas
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
    } catch (e) {
      setErro(
        e?.response?.data?.detail ||
          "Erro ao carregar assinaturas SaaS."
      );
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  const barbeariasPorId = useMemo(() => {
    return Object.fromEntries(
      barbearias.map((item) => [
        item.id,
        item,
      ])
    );
  }, [barbearias]);

  const planosPorId = useMemo(() => {
    return Object.fromEntries(
      planos.map((item) => [
        item.id,
        item,
      ])
    );
  }, [planos]);

  const resumo = useMemo(() => {
    const total = assinaturas.length;

    const ativas = assinaturas.filter(
      (item) =>
        String(item.status)
          .toUpperCase() === "ATIVA"
    ).length;

    const bloqueadas =
      assinaturas.filter(
        (item) =>
          String(item.status)
            .toUpperCase() ===
          "BLOQUEADA"
      ).length;

    const pendentes =
      assinaturas.filter(
        (item) =>
          String(
            item.status_pagamento
          ).toUpperCase() ===
          "PENDENTE"
      ).length;

    return {
      total,
      ativas,
      bloqueadas,
      pendentes,
    };
  }, [assinaturas]);

  const filtradas = useMemo(() => {
    const termo = busca
      .trim()
      .toLowerCase();

    return assinaturas.filter(
      (item) => {
        const status =
          String(item.status || "")
            .toUpperCase();

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

        const texto = [
          item.id,
          item.barbearia_id,
          item.plano_id,
          barbearia?.nome,
          barbearia?.slug,
          plano?.nome,
          item.status,
          item.status_pagamento,
          item.forma_pagamento,
          item.promocao_codigo,
          item.fundador_posicao,
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
    assinaturas,
    busca,
    filtroStatus,
    barbeariasPorId,
    planosPorId,
  ]);

  async function alterarBloqueio(item) {
    setErro("");
    setSucesso("");
    setProcessandoId(item.id);

    try {
      const bloqueada =
        String(item.status)
          .toUpperCase() ===
        "BLOQUEADA";

      if (bloqueada) {
        await liberarAssinaturaSaas(
          item.id
        );

        setSucesso(
          "Assinatura liberada com sucesso."
        );
      } else {
        await bloquearAssinaturaSaas(
          item.id
        );

        setSucesso(
          "Assinatura bloqueada com sucesso."
        );
      }

      await carregar();
    } catch (e) {
      setErro(
        e?.response?.data?.detail ||
          "Nao foi possivel alterar a assinatura."
      );
    } finally {
      setProcessandoId(null);
    }
  }

  return (
    <main style={estilos.pagina}>
      <h1>Assinaturas SaaS</h1>

      <p style={estilos.subtitulo}>
        Gest&atilde;o das assinaturas
        das barbearias na plataforma
        BarbSist.
      </p>

      {erro ? (
        <div style={estilos.erro}>
          {erro}
        </div>
      ) : null}

      {sucesso ? (
        <div style={estilos.sucesso}>
          {sucesso}
        </div>
      ) : null}

      <section style={estilos.cards}>
        <div style={estilos.card}>
          <div style={estilos.cardLabel}>
            Total de assinaturas
          </div>

          <div style={estilos.cardValor}>
            {resumo.total}
          </div>
        </div>

        <div style={estilos.card}>
          <div style={estilos.cardLabel}>
            Assinaturas ativas
          </div>

          <div style={estilos.cardValor}>
            {resumo.ativas}
          </div>
        </div>

        <div style={estilos.card}>
          <div style={estilos.cardLabel}>
            Bloqueadas
          </div>

          <div style={estilos.cardValor}>
            {resumo.bloqueadas}
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
      </section>

      <section style={estilos.painel}>
        <h2
          style={{
            marginTop: 0,
            fontSize: 20,
          }}
        >
          Assinaturas cadastradas
        </h2>

        <div style={estilos.filtros}>
          <input
            type="search"
            value={busca}
            onChange={(e) =>
              setBusca(
                e.target.value
              )
            }
            placeholder="Buscar por barbearia, plano, status ou promocao..."
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

            <option value="ATIVA">
              Ativa
            </option>

            <option value="BLOQUEADA">
              Bloqueada
            </option>

            <option value="CANCELADA">
              Cancelada
            </option>

            <option value="SUSPENSA">
              Suspensa
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
                  Assinatura
                </th>

                <th style={estilos.th}>
                  Pagamento
                </th>

                <th style={estilos.th}>
                  In&iacute;cio
                </th>

                <th style={estilos.th}>
                  Vencimento
                </th>

                <th style={estilos.th}>
                  Promo&ccedil;&atilde;o
                </th>

                <th style={estilos.th}>
                  A&ccedil;&atilde;o
                </th>
              </tr>
            </thead>

            <tbody>
              {carregando ? (
                <tr>
                  <td
                    colSpan={9}
                    style={estilos.td}
                  >
                    Carregando assinaturas...
                  </td>
                </tr>
              ) : filtradas.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    style={estilos.td}
                  >
                    Nenhuma assinatura encontrada.
                  </td>
                </tr>
              ) : (
                filtradas.map(
                  (item) => {
                    const barbearia =
                      barbeariasPorId[
                        item.barbearia_id
                      ];

                    const plano =
                      planosPorId[
                        item.plano_id
                      ];

                    const bloqueada =
                      String(item.status)
                        .toUpperCase() ===
                      "BLOQUEADA";

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
                        </td>

                        <td style={estilos.td}>
                          <span
                            style={badgeStatus(
                              item.status_pagamento
                            )}
                          >
                            {item.status_pagamento ||
                              "-"}
                          </span>

                          <div
                            style={{
                              color:
                                "#64748b",
                              fontSize: 13,
                              marginTop: 5,
                            }}
                          >
                            {item.forma_pagamento ||
                              ""}
                          </div>
                        </td>

                        <td style={estilos.td}>
                          {dataBr(
                            item.data_inicio
                          )}
                        </td>

                        <td style={estilos.td}>
                          {dataBr(
                            item.data_proximo_vencimento ||
                              item.data_fim
                          )}
                        </td>

                        <td style={estilos.td}>
                          {item.promocao_codigo ? (
                            <>
                              <strong>
                                {
                                  item.promocao_codigo
                                }
                              </strong>

                              <div
                                style={{
                                  color:
                                    "#64748b",
                                  fontSize: 13,
                                  marginTop: 3,
                                }}
                              >
                                {item.fundador_posicao
                                  ? `Fundador #${item.fundador_posicao}`
                                  : ""}
                              </div>
                            </>
                          ) : item.fundador_posicao ? (
                            `Fundador #${item.fundador_posicao}`
                          ) : (
                            "-"
                          )}
                        </td>

                        <td style={estilos.td}>
                          <button
                            type="button"
                            disabled={
                              processandoId ===
                              item.id
                            }
                            onClick={() =>
                              alterarBloqueio(
                                item
                              )
                            }
                            style={{
                              ...(bloqueada
                                ? estilos.botaoLiberar
                                : estilos.botaoBloquear),
                              opacity:
                                processandoId ===
                                item.id
                                  ? 0.6
                                  : 1,
                            }}
                          >
                            {processandoId ===
                            item.id
                              ? "Processando..."
                              : bloqueada
                              ? "Liberar"
                              : "Bloquear"}
                          </button>
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
