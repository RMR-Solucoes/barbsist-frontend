"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useParams,
  useRouter,
} from "next/navigation";

import {
  obterCarteiraParceiro,
  obterPortalParceiro,
} from "@/services/adminPlataformaService";


const estilos = {
  pagina: {
    padding: 30,
    background: "#f8fafc",
    minHeight: "100vh",
  },

  topo: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 16,
    flexWrap: "wrap",
    marginBottom: 22,
  },

  titulo: {
    margin: 0,
    color: "#0f172a",
  },

  subtitulo: {
    color: "#64748b",
    marginTop: 6,
  },

  botaoVoltar: {
    border: "1px solid #cbd5e1",
    borderRadius: 9,
    padding: "10px 14px",
    background: "#fff",
    color: "#0f172a",
    fontWeight: 700,
    cursor: "pointer",
  },

  identidade: {
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: 14,
    padding: 20,
    marginBottom: 20,
    boxShadow: "0 7px 20px rgba(15,23,42,.04)",
  },

  identidadeGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(180px, 1fr))",
    gap: 18,
  },

  pequeno: {
    color: "#64748b",
    fontSize: 13,
    marginBottom: 5,
  },

  valorIdentidade: {
    color: "#0f172a",
    fontWeight: 700,
    wordBreak: "break-word",
  },

  codigo: {
    display: "inline-block",
    padding: "7px 11px",
    borderRadius: 8,
    background: "#f1f5f9",
    fontFamily: "monospace",
    fontWeight: 800,
    letterSpacing: 1,
  },

  cards: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(190px, 1fr))",
    gap: 14,
    marginBottom: 20,
  },

  card: {
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: 14,
    padding: 18,
    boxShadow: "0 7px 20px rgba(15,23,42,.04)",
  },

  cardLabel: {
    color: "#64748b",
    fontSize: 14,
  },

  cardValor: {
    color: "#0f172a",
    fontSize: 25,
    fontWeight: 800,
    marginTop: 7,
  },

  painel: {
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: 14,
    padding: 20,
    marginTop: 20,
    boxShadow: "0 7px 20px rgba(15,23,42,.04)",
  },

  tabelaWrap: {
    overflowX: "auto",
    marginTop: 12,
  },

  tabela: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: 850,
  },

  th: {
    textAlign: "left",
    padding: "11px 9px",
    borderBottom: "1px solid #cbd5e1",
    color: "#334155",
    whiteSpace: "nowrap",
  },

  td: {
    padding: "11px 9px",
    borderBottom: "1px solid #f1f5f9",
    verticalAlign: "top",
  },

  badge: {
    display: "inline-block",
    padding: "5px 9px",
    borderRadius: 999,
    background: "#e2e8f0",
    color: "#334155",
    fontSize: 12,
    fontWeight: 800,
  },

  ativo: {
    display: "inline-block",
    padding: "5px 9px",
    borderRadius: 999,
    background: "#dcfce7",
    color: "#166534",
    fontSize: 12,
    fontWeight: 800,
  },

  inativo: {
    display: "inline-block",
    padding: "5px 9px",
    borderRadius: 999,
    background: "#fee2e2",
    color: "#991b1b",
    fontSize: 12,
    fontWeight: 800,
  },

  erro: {
    background: "#fee2e2",
    color: "#991b1b",
    border: "1px solid #fecaca",
    borderRadius: 9,
    padding: 12,
    marginBottom: 18,
  },

  aviso: {
    background: "#fff7ed",
    color: "#9a3412",
    border: "1px solid #fed7aa",
    borderRadius: 9,
    padding: 12,
    marginTop: 15,
  },

  resgate: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 18,
    flexWrap: "wrap",
    marginTop: 18,
  },

  botaoResgate: {
    border: 0,
    borderRadius: 9,
    padding: "11px 16px",
    background: "#0f172a",
    color: "#fff",
    fontWeight: 800,
    opacity: 0.5,
    cursor: "not-allowed",
  },
};


function moeda(valor) {
  return Number(
    valor || 0
  ).toLocaleString(
    "pt-BR",
    {
      style: "currency",
      currency: "BRL",
    }
  );
}


function dataHora(valor) {
  if (!valor) return "-";

  const data = new Date(valor);

  if (
    Number.isNaN(
      data.getTime()
    )
  ) {
    return String(valor);
  }

  return data.toLocaleString(
    "pt-BR"
  );
}


function textoTipo(tipo) {
  const mapa = {
    VENDEDOR: "Vendedor",
    COLABORADOR: "Colaborador",
    BARBEARIA: "Barbearia parceira",
  };

  return mapa[tipo] || tipo || "-";
}


function textoBeneficio(tipo) {
  if (tipo === "COMISSAO") {
    return "Comiss\u00e3o";
  }

  if (tipo === "CREDITO") {
    return "Cr\u00e9dito";
  }

  return tipo || "-";
}


export default function PortalParceiroPreviewPage() {
  const params = useParams();
  const router = useRouter();

  const parceiroId = Number(
    params?.parceiroId
  );

  const [portal, setPortal] =
    useState(null);

  const [carteira, setCarteira] =
    useState(null);

  const [carregando, setCarregando] =
    useState(true);

  const [erro, setErro] =
    useState("");


  const carregar = useCallback(
    async () => {
      if (
        !Number.isInteger(
          parceiroId
        ) ||
        parceiroId <= 0
      ) {
        setErro(
          "Identificador de parceiro inv\u00e1lido."
        );
        setCarregando(false);
        return;
      }

      setCarregando(true);
      setErro("");

      try {
        const dados =
          await obterPortalParceiro(
            parceiroId
          );

        setPortal(dados);

        if (
          dados?.parceiro
            ?.tipo_beneficio ===
          "CREDITO"
        ) {
          try {
            const dadosCarteira =
              await obterCarteiraParceiro(
                parceiroId
              );

            setCarteira(
              dadosCarteira
            );
          } catch {
            setCarteira(null);
          }
        } else {
          setCarteira(null);
        }
      } catch (e) {
        setErro(
          e?.response?.data?.detail ||
            "N\u00e3o foi poss\u00edvel carregar o portal do parceiro."
        );
      } finally {
        setCarregando(false);
      }
    },
    [parceiroId]
  );


  useEffect(() => {
    carregar();
  }, [carregar]);


  const parceiro =
    portal?.parceiro || {};

  const resumo =
    portal?.resumo || {};

  const indicacoes =
    Array.isArray(
      portal?.indicacoes
    )
      ? portal.indicacoes
      : [];

  const comissoes =
    Array.isArray(
      portal?.comissoes
    )
      ? portal.comissoes
      : [];

  const creditos =
    Array.isArray(
      portal?.creditos
    )
      ? portal.creditos
      : [];

  const ehComissao =
    parceiro.tipo_beneficio ===
    "COMISSAO";

  const ehCredito =
    parceiro.tipo_beneficio ===
    "CREDITO";


  const totalComissao = useMemo(
    () =>
      Number(
        resumo.comissao_pendente ||
          0
      ) +
      Number(
        resumo.comissao_liberada ||
          0
      ) +
      Number(
        resumo.comissao_paga ||
          0
      ),
    [resumo]
  );


  if (carregando) {
    return (
      <main style={estilos.pagina}>
        <h1>
          Portal do Parceiro BarbSist
        </h1>

        <p>
          Carregando dados do parceiro...
        </p>
      </main>
    );
  }


  return (
    <main style={estilos.pagina}>
      <div style={estilos.topo}>
        <div>
          <h1 style={estilos.titulo}>
            Portal do Parceiro BarbSist
          </h1>

          <p style={estilos.subtitulo}>
            Acompanhe suas indica&ccedil;&otilde;es,
            benef&iacute;cios e resultados na plataforma.
          </p>
        </div>

        <button
          type="button"
          style={estilos.botaoVoltar}
          onClick={() =>
            router.push(
              "/admin-plataforma/parceiros"
            )
          }
        >
          Voltar para parceiros
        </button>
      </div>

      {erro ? (
        <div style={estilos.erro}>
          {erro}
        </div>
      ) : null}

      {!erro && portal ? (
        <>
          <section style={estilos.identidade}>
            <div style={estilos.identidadeGrid}>
              <div>
                <div style={estilos.pequeno}>
                  Parceiro
                </div>

                <div style={estilos.valorIdentidade}>
                  {parceiro.nome || "-"}
                </div>
              </div>

              <div>
                <div style={estilos.pequeno}>
                  Tipo
                </div>

                <div style={estilos.valorIdentidade}>
                  {textoTipo(
                    parceiro.tipo
                  )}
                </div>
              </div>

              <div>
                <div style={estilos.pequeno}>
                  Benef&iacute;cio
                </div>

                <div style={estilos.valorIdentidade}>
                  {textoBeneficio(
                    parceiro.tipo_beneficio
                  )}
                </div>
              </div>

              <div>
                <div style={estilos.pequeno}>
                  C&oacute;digo de indica&ccedil;&atilde;o
                </div>

                <span style={estilos.codigo}>
                  {parceiro.codigo_ref || "-"}
                </span>
              </div>

              <div>
                <div style={estilos.pequeno}>
                  Situa&ccedil;&atilde;o
                </div>

                <span
                  style={
                    parceiro.ativo
                      ? estilos.ativo
                      : estilos.inativo
                  }
                >
                  {parceiro.ativo
                    ? "ATIVO"
                    : "INATIVO"}
                </span>
              </div>
            </div>
          </section>

          <section style={estilos.cards}>
            <div style={estilos.card}>
              <div style={estilos.cardLabel}>
                Indica&ccedil;&otilde;es
              </div>

              <div style={estilos.cardValor}>
                {Number(
                  resumo.indicacoes_total ||
                    0
                )}
              </div>
            </div>

            <div style={estilos.card}>
              <div style={estilos.cardLabel}>
                Convertidas
              </div>

              <div style={estilos.cardValor}>
                {Number(
                  resumo.indicacoes_convertidas ||
                    0
                )}
              </div>
            </div>

            {ehComissao ? (
              <>
                <div style={estilos.card}>
                  <div style={estilos.cardLabel}>
                    Comiss&atilde;o pendente
                  </div>

                  <div style={estilos.cardValor}>
                    {moeda(
                      resumo.comissao_pendente
                    )}
                  </div>
                </div>

                <div style={estilos.card}>
                  <div style={estilos.cardLabel}>
                    Comiss&atilde;o liberada
                  </div>

                  <div style={estilos.cardValor}>
                    {moeda(
                      resumo.comissao_liberada
                    )}
                  </div>
                </div>

                <div style={estilos.card}>
                  <div style={estilos.cardLabel}>
                    Comiss&atilde;o paga
                  </div>

                  <div style={estilos.cardValor}>
                    {moeda(
                      resumo.comissao_paga
                    )}
                  </div>
                </div>

                <div style={estilos.card}>
                  <div style={estilos.cardLabel}>
                    Total gerado
                  </div>

                  <div style={estilos.cardValor}>
                    {moeda(
                      totalComissao
                    )}
                  </div>
                </div>
              </>
            ) : null}

            {ehCredito ? (
              <>
                <div style={estilos.card}>
                  <div style={estilos.cardLabel}>
                    Cr&eacute;dito dispon&iacute;vel
                  </div>

                  <div style={estilos.cardValor}>
                    {moeda(
                      resumo.credito_disponivel
                    )}
                  </div>
                </div>

                <div style={estilos.card}>
                  <div style={estilos.cardLabel}>
                    Cr&eacute;dito aplicado
                  </div>

                  <div style={estilos.cardValor}>
                    {moeda(
                      resumo.credito_aplicado
                    )}
                  </div>
                </div>
              </>
            ) : null}
          </section>

          {ehCredito && carteira ? (
            <section style={estilos.painel}>
              <h2 style={{ marginTop: 0 }}>
                Minha carteira
              </h2>

              <div style={estilos.cards}>
                <div style={estilos.card}>
                  <div style={estilos.cardLabel}>
                    Total gerado
                  </div>

                  <div style={estilos.cardValor}>
                    {moeda(
                      carteira.total_gerado
                    )}
                  </div>
                </div>

                <div style={estilos.card}>
                  <div style={estilos.cardLabel}>
                    Total aplicado
                  </div>

                  <div style={estilos.cardValor}>
                    {moeda(
                      carteira.total_aplicado
                    )}
                  </div>
                </div>

                <div style={estilos.card}>
                  <div style={estilos.cardLabel}>
                    Total reservado
                  </div>

                  <div style={estilos.cardValor}>
                    {moeda(
                      carteira.total_reservado
                    )}
                  </div>
                </div>

                <div style={estilos.card}>
                  <div style={estilos.cardLabel}>
                    Saldo bruto
                  </div>

                  <div style={estilos.cardValor}>
                    {moeda(
                      carteira.saldo_bruto
                    )}
                  </div>
                </div>

                <div style={estilos.card}>
                  <div style={estilos.cardLabel}>
                    Saldo dispon&iacute;vel
                  </div>

                  <div style={estilos.cardValor}>
                    {moeda(
                      carteira.saldo_disponivel
                    )}
                  </div>
                </div>
              </div>

              <div style={estilos.resgate}>
                <div>
                  <strong>
                    Solicitar resgate de cr&eacute;ditos
                  </strong>

                  <div style={estilos.pequeno}>
                    O parceiro poder&aacute; solicitar
                    resgate utilizando o saldo
                    dispon&iacute;vel.
                  </div>
                </div>

                <button
                  type="button"
                  disabled
                  style={estilos.botaoResgate}
                >
                  Solicitar resgate
                </button>
              </div>

              <div style={estilos.aviso}>
                Esta &eacute; uma pr&eacute;via administrativa.
                O resgate ser&aacute; habilitado no portal
                autenticado do parceiro.
              </div>
            </section>
          ) : null}

          <section style={estilos.painel}>
            <h2 style={{ marginTop: 0 }}>
              Minhas indica&ccedil;&otilde;es
            </h2>

            <div style={estilos.tabelaWrap}>
              <table style={estilos.tabela}>
                <thead>
                  <tr>
                    <th style={estilos.th}>
                      Barbearia
                    </th>
                    <th style={estilos.th}>
                      Plano
                    </th>
                    <th style={estilos.th}>
                      C&oacute;digo
                    </th>
                    <th style={estilos.th}>
                      Status
                    </th>
                    <th style={estilos.th}>
                      Cadastro
                    </th>
                    <th style={estilos.th}>
                      Convers&atilde;o
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {indicacoes.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        style={estilos.td}
                      >
                        Nenhuma indica&ccedil;&atilde;o
                        registrada.
                      </td>
                    </tr>
                  ) : (
                    indicacoes.map(
                      (item) => (
                        <tr
                          key={
                            item.indicacao_id
                          }
                        >
                          <td style={estilos.td}>
                            <strong>
                              {item.barbearia_nome ||
                                "-"}
                            </strong>
                          </td>

                          <td style={estilos.td}>
                            {item.plano_nome ||
                              "-"}
                          </td>

                          <td style={estilos.td}>
                            {item.codigo_ref ||
                              "-"}
                          </td>

                          <td style={estilos.td}>
                            <span style={estilos.badge}>
                              {item.status ||
                                "-"}
                            </span>
                          </td>

                          <td style={estilos.td}>
                            {dataHora(
                              item.data_cadastro
                            )}
                          </td>

                          <td style={estilos.td}>
                            {dataHora(
                              item.data_conversao
                            )}
                          </td>
                        </tr>
                      )
                    )
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {ehComissao ? (
            <section style={estilos.painel}>
              <h2 style={{ marginTop: 0 }}>
                Minhas comiss&otilde;es
              </h2>

              <div style={estilos.tabelaWrap}>
                <table style={estilos.tabela}>
                  <thead>
                    <tr>
                      <th style={estilos.th}>
                        Barbearia
                      </th>
                      <th style={estilos.th}>
                        Pagamento
                      </th>
                      <th style={estilos.th}>
                        Comiss&atilde;o
                      </th>
                      <th style={estilos.th}>
                        Status
                      </th>
                      <th style={estilos.th}>
                        Gera&ccedil;&atilde;o
                      </th>
                      <th style={estilos.th}>
                        Libera&ccedil;&atilde;o
                      </th>
                      <th style={estilos.th}>
                        Pagamento da comiss&atilde;o
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {comissoes.length === 0 ? (
                      <tr>
                        <td
                          colSpan={7}
                          style={estilos.td}
                        >
                          Nenhuma comiss&atilde;o
                          registrada.
                        </td>
                      </tr>
                    ) : (
                      comissoes.map(
                        (item) => (
                          <tr
                            key={
                              item.comissao_id
                            }
                          >
                            <td style={estilos.td}>
                              {item.barbearia_nome ||
                                "-"}
                            </td>

                            <td style={estilos.td}>
                              {moeda(
                                item.valor_pagamento
                              )}
                            </td>

                            <td style={estilos.td}>
                              <strong>
                                {moeda(
                                  item.valor_comissao
                                )}
                              </strong>
                            </td>

                            <td style={estilos.td}>
                              <span style={estilos.badge}>
                                {item.status ||
                                  "-"}
                              </span>
                            </td>

                            <td style={estilos.td}>
                              {dataHora(
                                item.data_geracao
                              )}
                            </td>

                            <td style={estilos.td}>
                              {dataHora(
                                item.data_liberacao
                              )}
                            </td>

                            <td style={estilos.td}>
                              {dataHora(
                                item.data_pagamento
                              )}
                            </td>
                          </tr>
                        )
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          ) : null}

          {ehCredito ? (
            <section style={estilos.painel}>
              <h2 style={{ marginTop: 0 }}>
                Meus cr&eacute;ditos
              </h2>

              <div style={estilos.tabelaWrap}>
                <table style={estilos.tabela}>
                  <thead>
                    <tr>
                      <th style={estilos.th}>
                        Barbearia indicada
                      </th>
                      <th style={estilos.th}>
                        Cr&eacute;dito
                      </th>
                      <th style={estilos.th}>
                        Status
                      </th>
                      <th style={estilos.th}>
                        Refer&ecirc;ncia
                      </th>
                      <th style={estilos.th}>
                        Gera&ccedil;&atilde;o
                      </th>
                      <th style={estilos.th}>
                        Aplica&ccedil;&atilde;o
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {creditos.length === 0 ? (
                      <tr>
                        <td
                          colSpan={6}
                          style={estilos.td}
                        >
                          Nenhum cr&eacute;dito
                          registrado.
                        </td>
                      </tr>
                    ) : (
                      creditos.map(
                        (item) => (
                          <tr
                            key={
                              item.credito_id
                            }
                          >
                            <td style={estilos.td}>
                              {item.barbearia_indicada_nome ||
                                "-"}
                            </td>

                            <td style={estilos.td}>
                              <strong>
                                {moeda(
                                  item.valor_credito
                                )}
                              </strong>
                            </td>

                            <td style={estilos.td}>
                              <span style={estilos.badge}>
                                {item.status ||
                                  "-"}
                              </span>
                            </td>

                            <td style={estilos.td}>
                              {item.referencia_mensalidade ||
                                "-"}
                            </td>

                            <td style={estilos.td}>
                              {dataHora(
                                item.data_geracao
                              )}
                            </td>

                            <td style={estilos.td}>
                              {dataHora(
                                item.data_aplicacao
                              )}
                            </td>
                          </tr>
                        )
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          ) : null}
        </>
      ) : null}
    </main>
  );
}
