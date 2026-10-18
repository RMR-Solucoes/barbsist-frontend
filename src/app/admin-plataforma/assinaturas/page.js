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
  concederExcecaoTesteGratuitoSaas,
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

  const [barbeariaTeste, setBarbeariaTeste] = useState("");
  const [tipoDocumentoTeste, setTipoDocumentoTeste] = useState("CPF");
  const [documentoTeste, setDocumentoTeste] = useState("");
  const [motivoTeste, setMotivoTeste] = useState("");
  const [confirmarExcecaoTeste, setConfirmarExcecaoTeste] = useState(false);

  async function concederExcecaoTeste(evento) {
    evento.preventDefault();

    setErro("");
    setSucesso("");

    if (!barbeariaTeste) {
      setErro("Selecione a barbearia.");
      return;
    }

    if (!tipoDocumentoTeste) {
      setErro("Selecione CPF ou CNPJ.");
      return;
    }

    if (!documentoTeste.trim()) {
      setErro("Informe o documento.");
      return;
    }

    if (motivoTeste.trim().length < 3) {
      setErro(
        "Informe o motivo da exce\u00e7\u00e3o administrativa."
      );
      return;
    }

    if (!confirmarExcecaoTeste) {
      setErro(
        "Confirme que o conflito antifraude foi revisado antes da libera\u00e7\u00e3o."
      );
      return;
    }

    setProcessandoId(
      "teste-gratuito-excecao"
    );

    try {
      const resposta =
        await concederExcecaoTesteGratuitoSaas(
          Number(barbeariaTeste),
          {
            tipo_documento:
              tipoDocumentoTeste,
            documento:
              documentoTeste.trim(),
            motivo:
              motivoTeste.trim(),
          }
        );

      const dataFim =
        resposta?.data_fim
          ? new Date(
              resposta.data_fim
            ).toLocaleDateString(
              "pt-BR"
            )
          : null;

      setSucesso(
        `${
          resposta?.mensagem ||
          "Exce\u00e7\u00e3o de teste gratuito concedida com sucesso."
        }${
          dataFim
            ? ` V\u00e1lido at\u00e9 ${dataFim}.`
            : ""
        }`
      );

      setDocumentoTeste("");
      setMotivoTeste("");
      setConfirmarExcecaoTeste(false);

      await carregar();

    } catch (e) {

      const detalhe =
        e?.response?.data?.detail;

      if (
        typeof detalhe === "string"
      ) {

        setErro(detalhe);

      } else if (
        detalhe &&
        typeof detalhe === "object"
      ) {

        const mensagem =
          detalhe.mensagem ||
          "Nao foi possivel conceder a excecao.";

        const codigo =
          detalhe.codigo
            ? ` (${detalhe.codigo})`
            : "";

        setErro(
          `${mensagem}${codigo}`
        );

      } else {

        setErro(
          "Nao foi possivel conceder a excecao de teste gratuito."
        );

      }

    } finally {

      setProcessandoId(null);

    }
  }

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
      <section style={estilos.painel}>
        <h2>
          Conceder exce&ccedil;&atilde;o de teste gratuito
        </h2>

        <p style={estilos.subtitulo}>
          Use esta op&ccedil;&atilde;o somente quando o
          antifraude bloquear um teste leg&iacute;timo.
          O per&iacute;odo &eacute; fixo em 40 dias e
          n&atilde;o cria plano, pagamento ou
          assinatura SaaS.
        </p>

        <form
          onSubmit={concederExcecaoTeste}
          style={estilos.filtros}
        >
          <select
            style={estilos.input}
            value={barbeariaTeste}
            onChange={(e) => {
              setBarbeariaTeste(
                e.target.value
              );
              setDocumentoTeste("");
              setMotivoTeste("");
              setConfirmarExcecaoTeste(
                false
              );
              setErro("");
              setSucesso("");
            }}
            required
          >
            <option value="">
              Selecione a barbearia
            </option>

            {barbearias.map((item) => (
              <option
                key={item.id}
                value={item.id}
              >
                {item.nome}
              </option>
            ))}
          </select>

          <select
            style={estilos.input}
            value={tipoDocumentoTeste}
            onChange={(e) => {
              setTipoDocumentoTeste(
                e.target.value
              );
              setDocumentoTeste("");
              setErro("");
              setSucesso("");
            }}
            required
          >
            <option value="CPF">
              CPF do respons&aacute;vel
            </option>

            <option value="CNPJ">
              CNPJ da barbearia
            </option>
          </select>

          <input
            style={estilos.input}
            type="text"
            value={documentoTeste}
            onChange={(e) =>
              setDocumentoTeste(
                e.target.value
              )
            }
            placeholder={
              tipoDocumentoTeste === "CNPJ"
                ? "CNPJ"
                : "CPF do respons\u00e1vel"
            }
            minLength={
              tipoDocumentoTeste === "CNPJ"
                ? 14
                : 11
            }
            maxLength={18}
            autoComplete="off"
            required
          />

          <input
            style={estilos.input}
            type="text"
            value={motivoTeste}
            onChange={(e) =>
              setMotivoTeste(
                e.target.value
              )
            }
            placeholder={
              "Motivo da exce\u00e7\u00e3o administrativa"
            }
            minLength="3"
            maxLength="500"
            required
          />

          <label
            style={{
              gridColumn: "1 / -1",
              display: "flex",
              gap: 8,
              alignItems: "flex-start",
            }}
          >
            <input
              type="checkbox"
              checked={
                confirmarExcecaoTeste
              }
              onChange={(e) =>
                setConfirmarExcecaoTeste(
                  e.target.checked
                )
              }
              required
            />

            <span>
              Confirmo que revisei o conflito
              antifraude e autorizo
              excepcionalmente um novo
              per&iacute;odo gratuito de 40 dias.
            </span>
          </label>

          <button
            type="submit"
            style={{
              ...estilos.botaoLiberar,
              whiteSpace: "nowrap",
              width: "fit-content",
            }}
            disabled={
              processandoId ===
              "teste-gratuito-excecao"
            }
          >
            {processandoId ===
            "teste-gratuito-excecao"
              ? "Concedendo..."
              : "Conceder exce\u00e7\u00e3o de 40 dias"}
          </button>
        </form>
      </section>

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
            placeholder="Buscar por barbearia, plano ou status..."
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
