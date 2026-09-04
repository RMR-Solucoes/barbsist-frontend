"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  atualizarMovimentacaoFinanceiroPlataforma,
  criarMovimentacaoFinanceiroPlataforma,
  listarMovimentacoesFinanceiroPlataforma,
  obterFluxoCaixaPlataforma,
  obterResumoFinanceiroPlataforma,
} from "@/services/adminPlataformaService";


const estilos = {
  pagina: {
    padding: 30,
    background: "#f8fafc",
    minHeight: "100vh",
  },

  subtitulo: {
    color: "#64748b",
    marginTop: 5,
  },

  filtros: {
    display: "flex",
    gap: 12,
    flexWrap: "wrap",
    alignItems: "end",
    margin: "22px 0",
  },

  campo: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },

  label: {
    fontSize: 13,
    fontWeight: 700,
    color: "#475569",
  },

  input: {
    minHeight: 42,
    padding: "8px 11px",
    border: "1px solid #cbd5e1",
    borderRadius: 9,
    background: "#fff",
  },

  botao: {
    minHeight: 42,
    padding: "9px 15px",
    border: 0,
    borderRadius: 9,
    background: "#0f172a",
    color: "#fff",
    fontWeight: 700,
    cursor: "pointer",
  },

  botaoSecundario: {
    minHeight: 36,
    padding: "7px 11px",
    border: "1px solid #cbd5e1",
    borderRadius: 8,
    background: "#fff",
    color: "#334155",
    fontWeight: 600,
    cursor: "pointer",
  },

  cards: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(190px, 1fr))",
    gap: 14,
    margin: "22px 0",
  },

  card: {
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: 14,
    padding: 18,
    boxShadow: "0 6px 18px rgba(15,23,42,.04)",
  },

  cardLabel: {
    color: "#64748b",
    fontSize: 14,
  },

  cardValor: {
    fontSize: 26,
    fontWeight: 800,
    marginTop: 7,
    color: "#0f172a",
  },

  painel: {
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: 14,
    padding: 20,
    marginTop: 20,
    boxShadow: "0 6px 18px rgba(15,23,42,.04)",
  },

  formulario: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(210px, 1fr))",
    gap: 12,
  },

  tabelaWrap: {
    overflowX: "auto",
  },

  tabela: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: 900,
  },

  th: {
    textAlign: "left",
    padding: "11px 9px",
    borderBottom: "1px solid #cbd5e1",
    whiteSpace: "nowrap",
    color: "#334155",
  },

  td: {
    padding: "11px 9px",
    borderBottom: "1px solid #f1f5f9",
    verticalAlign: "top",
  },

  sucesso: {
    background: "#dcfce7",
    color: "#166534",
    border: "1px solid #bbf7d0",
    padding: 11,
    borderRadius: 9,
    margin: "14px 0",
  },

  erro: {
    background: "#fee2e2",
    color: "#991b1b",
    border: "1px solid #fecaca",
    padding: 11,
    borderRadius: 9,
    margin: "14px 0",
  },

  badge: {
    display: "inline-block",
    padding: "4px 8px",
    borderRadius: 999,
    background: "#e2e8f0",
    color: "#334155",
    fontSize: 12,
    fontWeight: 700,
  },
};


function dinheiro(valor) {
  return Number(valor || 0).toLocaleString(
    "pt-BR",
    {
      style: "currency",
      currency: "BRL",
    }
  );
}


function dataHoje() {
  const hoje = new Date();

  const ano = hoje.getFullYear();
  const mes = String(
    hoje.getMonth() + 1
  ).padStart(2, "0");
  const dia = String(
    hoje.getDate()
  ).padStart(2, "0");

  return `${ano}-${mes}-${dia}`;
}


function primeiroDiaMes() {
  const hoje = new Date();

  const ano = hoje.getFullYear();
  const mes = String(
    hoje.getMonth() + 1
  ).padStart(2, "0");

  return `${ano}-${mes}-01`;
}


function agoraLocalInput() {
  const data = new Date();

  const ano = data.getFullYear();
  const mes = String(
    data.getMonth() + 1
  ).padStart(2, "0");
  const dia = String(
    data.getDate()
  ).padStart(2, "0");
  const hora = String(
    data.getHours()
  ).padStart(2, "0");
  const minuto = String(
    data.getMinutes()
  ).padStart(2, "0");

  return `${ano}-${mes}-${dia}T${hora}:${minuto}`;
}


function paraBackend(valor) {
  if (!valor) return null;

  if (valor.length === 16) {
    return `${valor}:00`;
  }

  return valor;
}


function formatarDataHora(valor) {
  if (!valor) return "-";

  const data = new Date(valor);

  if (Number.isNaN(data.getTime())) {
    return valor;
  }

  return data.toLocaleString("pt-BR");
}


const formularioInicial = {
  tipo: "SAIDA",
  categoria: "OUTRA_DESPESA",
  descricao: "",
  valor: "",
  data_competencia: agoraLocalInput(),
  data_realizacao: agoraLocalInput(),
  forma_pagamento: "PIX",
  observacao: "",
  status: "REALIZADO",
};


export default function FinanceiroPlataformaPage() {
  const [dataInicio, setDataInicio] =
    useState(primeiroDiaMes());

  const [dataFim, setDataFim] =
    useState(dataHoje());

  const [resumo, setResumo] =
    useState(null);

  const [fluxo, setFluxo] =
    useState(null);

  const [movimentacoes, setMovimentacoes] =
    useState([]);

  const [formulario, setFormulario] =
    useState(formularioInicial);

  const [carregando, setCarregando] =
    useState(true);

  const [salvando, setSalvando] =
    useState(false);

  const [erro, setErro] =
    useState("");

  const [sucesso, setSucesso] =
    useState("");


  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro("");

    const params = {
      data_inicio: dataInicio,
      data_fim: dataFim,
    };

    try {
      const [
        dadosResumo,
        dadosFluxo,
        dadosMovimentacoes,
      ] = await Promise.all([
        obterResumoFinanceiroPlataforma(
          params
        ),
        obterFluxoCaixaPlataforma(
          params
        ),
        listarMovimentacoesFinanceiroPlataforma(
          params
        ),
      ]);

      setResumo(dadosResumo);
      setFluxo(dadosFluxo);

      setMovimentacoes(
        Array.isArray(dadosMovimentacoes)
          ? dadosMovimentacoes
          : []
      );
    } catch (e) {
      setErro(
        e?.response?.data?.detail ||
          "Erro ao carregar o financeiro da plataforma."
      );
    } finally {
      setCarregando(false);
    }
  }, [dataInicio, dataFim]);


  useEffect(() => {
    carregar();
  }, [carregar]);


  const diasComMovimento = useMemo(() => {
    if (!Array.isArray(fluxo?.dias)) {
      return [];
    }

    return fluxo.dias.filter(
      (item) =>
        Number(item.entradas || 0) !== 0 ||
        Number(item.saidas || 0) !== 0
    );
  }, [fluxo]);


  function alterarCampo(campo, valor) {
    setFormulario((anterior) => ({
      ...anterior,
      [campo]: valor,
      ...(campo === "status" &&
      valor !== "REALIZADO"
        ? { data_realizacao: "" }
        : {}),
      ...(campo === "status" &&
      valor === "REALIZADO"
        ? {
            data_realizacao:
              anterior.data_realizacao ||
              agoraLocalInput(),
          }
        : {}),
    }));
  }


  async function salvarMovimentacao(event) {
    event.preventDefault();

    setSalvando(true);
    setErro("");
    setSucesso("");

    try {
      const payload = {
        tipo: formulario.tipo,
        categoria: formulario.categoria,
        descricao: formulario.descricao,
        valor: Number(formulario.valor),
        data_competencia: paraBackend(
          formulario.data_competencia
        ),
        data_realizacao:
          formulario.status === "REALIZADO"
            ? paraBackend(
                formulario.data_realizacao
              )
            : null,
        forma_pagamento:
          formulario.forma_pagamento || null,
        observacao:
          formulario.observacao || null,
        status: formulario.status,
      };

      await criarMovimentacaoFinanceiroPlataforma(
        payload
      );

      setSucesso(
        "Movimentacao financeira registrada."
      );

      setFormulario({
        ...formularioInicial,
        data_competencia: agoraLocalInput(),
        data_realizacao: agoraLocalInput(),
      });

      await carregar();
    } catch (e) {
      setErro(
        e?.response?.data?.detail ||
          "Erro ao registrar movimentacao."
      );
    } finally {
      setSalvando(false);
    }
  }


  async function cancelarMovimentacao(item) {
    const confirmar = window.confirm(
      `Cancelar a movimentacao "${item.descricao}"?`
    );

    if (!confirmar) return;

    setErro("");
    setSucesso("");

    try {
      await atualizarMovimentacaoFinanceiroPlataforma(
        item.id,
        {
          status: "CANCELADO",
          data_realizacao: null,
        }
      );

      setSucesso(
        "Movimentacao cancelada."
      );

      await carregar();
    } catch (e) {
      setErro(
        e?.response?.data?.detail ||
          "Erro ao cancelar movimentacao."
      );
    }
  }


  return (
    <main style={estilos.pagina}>
      <h1>Financeiro da Plataforma</h1>

      <p style={estilos.subtitulo}>
        Fluxo financeiro global do BarbSist:
        receitas SaaS, despesas, taxas,
        comiss&otilde;es, impostos e resultado
        l&iacute;quido.
      </p>

      <div style={estilos.filtros}>
        <div style={estilos.campo}>
          <label style={estilos.label}>
            Data inicial
          </label>

          <input
            type="date"
            value={dataInicio}
            onChange={(e) =>
              setDataInicio(e.target.value)
            }
            style={estilos.input}
          />
        </div>

        <div style={estilos.campo}>
          <label style={estilos.label}>
            Data final
          </label>

          <input
            type="date"
            value={dataFim}
            onChange={(e) =>
              setDataFim(e.target.value)
            }
            style={estilos.input}
          />
        </div>

        <button
          type="button"
          style={estilos.botao}
          onClick={carregar}
        >
          Atualizar
        </button>
      </div>

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
            Receita SaaS
          </div>
          <div style={estilos.cardValor}>
            {dinheiro(resumo?.receita_saas)}
          </div>
        </div>

        <div style={estilos.card}>
          <div style={estilos.cardLabel}>
            Outras entradas
          </div>
          <div style={estilos.cardValor}>
            {dinheiro(resumo?.outras_entradas)}
          </div>
        </div>

        <div style={estilos.card}>
          <div style={estilos.cardLabel}>
            Entradas totais
          </div>
          <div style={estilos.cardValor}>
            {dinheiro(resumo?.entradas_totais)}
          </div>
        </div>

        <div style={estilos.card}>
          <div style={estilos.cardLabel}>
            Sa&iacute;das totais
          </div>
          <div style={estilos.cardValor}>
            {dinheiro(resumo?.despesas_totais)}
          </div>
        </div>

        <div style={estilos.card}>
          <div style={estilos.cardLabel}>
            Resultado l&iacute;quido
          </div>
          <div style={estilos.cardValor}>
            {dinheiro(resumo?.resultado_liquido)}
          </div>
        </div>
      </section>

      <section style={estilos.cards}>
        <div style={estilos.card}>
          <div style={estilos.cardLabel}>
            Taxas de pagamento
          </div>
          <div style={estilos.cardValor}>
            {dinheiro(resumo?.taxas_pagamento)}
          </div>
        </div>

        <div style={estilos.card}>
          <div style={estilos.cardLabel}>
            Comiss&otilde;es de parceiros
          </div>
          <div style={estilos.cardValor}>
            {dinheiro(
              resumo?.comissoes_parceiros
            )}
          </div>
        </div>

        <div style={estilos.card}>
          <div style={estilos.cardLabel}>
            Impostos
          </div>
          <div style={estilos.cardValor}>
            {dinheiro(resumo?.impostos)}
          </div>
        </div>

        <div style={estilos.card}>
          <div style={estilos.cardLabel}>
            Outras despesas
          </div>
          <div style={estilos.cardValor}>
            {dinheiro(resumo?.outras_despesas)}
          </div>
        </div>

        <div style={estilos.card}>
          <div style={estilos.cardLabel}>
            Sa&iacute;das pendentes
          </div>
          <div style={estilos.cardValor}>
            {dinheiro(resumo?.pendentes_saida)}
          </div>
        </div>
      </section>

      <section style={estilos.painel}>
        <h2 style={{ marginTop: 0 }}>
          Nova movimenta&ccedil;&atilde;o
        </h2>

        <p style={{ color: "#64748b" }}>
          Pagamentos de assinaturas SaaS entram
          automaticamente. Use este formul&aacute;rio
          para despesas, impostos, taxas e outras
          entradas administrativas.
        </p>

        <form
          onSubmit={salvarMovimentacao}
          style={estilos.formulario}
        >
          <div style={estilos.campo}>
            <label style={estilos.label}>
              Tipo
            </label>

            <select
              value={formulario.tipo}
              onChange={(e) =>
                alterarCampo(
                  "tipo",
                  e.target.value
                )
              }
              style={estilos.input}
            >
              <option value="SAIDA">
                Sa&iacute;da
              </option>
              <option value="ENTRADA">
                Entrada
              </option>
            </select>
          </div>

          <div style={estilos.campo}>
            <label style={estilos.label}>
              Categoria
            </label>

            <select
              value={formulario.categoria}
              onChange={(e) =>
                alterarCampo(
                  "categoria",
                  e.target.value
                )
              }
              style={estilos.input}
            >
              {formulario.tipo === "ENTRADA" ? (
                <>
                  <option value="OUTRA_RECEITA">
                    Outra receita
                  </option>
                </>
              ) : (
                <>
                  <option value="OUTRA_DESPESA">
                    Outra despesa
                  </option>
                  <option value="HOSPEDAGEM">
                    Hospedagem
                  </option>
                  <option value="DOMINIO">
                    Dom&iacute;nio
                  </option>
                  <option value="SERVICOS_API">
                    Servi&ccedil;os / APIs
                  </option>
                  <option value="MARKETING">
                    Marketing
                  </option>
                  <option value="TAXA_PAGAMENTO">
                    Taxa de pagamento
                  </option>
                  <option value="COMISSAO_PARCEIRO">
                    Comiss&atilde;o de parceiro
                  </option>
                  <option value="IMPOSTO">
                    Imposto
                  </option>
                  <option value="CONTABILIDADE">
                    Contabilidade
                  </option>
                  <option value="DESENVOLVIMENTO">
                    Desenvolvimento
                  </option>
                </>
              )}
            </select>
          </div>

          <div style={estilos.campo}>
            <label style={estilos.label}>
              Descri&ccedil;&atilde;o
            </label>

            <input
              required
              value={formulario.descricao}
              onChange={(e) =>
                alterarCampo(
                  "descricao",
                  e.target.value
                )
              }
              style={estilos.input}
            />
          </div>

          <div style={estilos.campo}>
            <label style={estilos.label}>
              Valor
            </label>

            <input
              required
              type="number"
              min="0.01"
              step="0.01"
              value={formulario.valor}
              onChange={(e) =>
                alterarCampo(
                  "valor",
                  e.target.value
                )
              }
              style={estilos.input}
            />
          </div>

          <div style={estilos.campo}>
            <label style={estilos.label}>
              Status
            </label>

            <select
              value={formulario.status}
              onChange={(e) =>
                alterarCampo(
                  "status",
                  e.target.value
                )
              }
              style={estilos.input}
            >
              <option value="REALIZADO">
                Realizado
              </option>
              <option value="PENDENTE">
                Pendente
              </option>
            </select>
          </div>

          <div style={estilos.campo}>
            <label style={estilos.label}>
              Compet&ecirc;ncia
            </label>

            <input
              required
              type="datetime-local"
              value={formulario.data_competencia}
              onChange={(e) =>
                alterarCampo(
                  "data_competencia",
                  e.target.value
                )
              }
              style={estilos.input}
            />
          </div>

          {formulario.status ===
          "REALIZADO" ? (
            <div style={estilos.campo}>
              <label style={estilos.label}>
                Data da realiza&ccedil;&atilde;o
              </label>

              <input
                required
                type="datetime-local"
                value={formulario.data_realizacao}
                onChange={(e) =>
                  alterarCampo(
                    "data_realizacao",
                    e.target.value
                  )
                }
                style={estilos.input}
              />
            </div>
          ) : null}

          <div style={estilos.campo}>
            <label style={estilos.label}>
              Forma de pagamento
            </label>

            <select
              value={
                formulario.forma_pagamento
              }
              onChange={(e) =>
                alterarCampo(
                  "forma_pagamento",
                  e.target.value
                )
              }
              style={estilos.input}
            >
              <option value="PIX">PIX</option>
              <option value="CARTAO">
                Cart&atilde;o
              </option>
              <option value="BOLETO">
                Boleto
              </option>
              <option value="DINHEIRO">
                Dinheiro
              </option>
              <option value="TRANSFERENCIA">
                Transfer&ecirc;ncia
              </option>
              <option value="">
                N&atilde;o informado
              </option>
            </select>
          </div>

          <div style={estilos.campo}>
            <label style={estilos.label}>
              Observa&ccedil;&atilde;o
            </label>

            <input
              value={formulario.observacao}
              onChange={(e) =>
                alterarCampo(
                  "observacao",
                  e.target.value
                )
              }
              style={estilos.input}
            />
          </div>

          <div
            style={{
              ...estilos.campo,
              justifyContent: "end",
            }}
          >
            <button
              type="submit"
              disabled={salvando}
              style={estilos.botao}
            >
              {salvando
                ? "Salvando..."
                : "Registrar movimentacao"}
            </button>
          </div>
        </form>
      </section>

      <section style={estilos.painel}>
        <h2 style={{ marginTop: 0 }}>
          Fluxo de caixa
        </h2>

        <p style={{ color: "#64748b" }}>
          Saldo inicial:{" "}
          <strong>
            {dinheiro(fluxo?.saldo_inicial)}
          </strong>
          {" | "}
          Saldo final:{" "}
          <strong>
            {dinheiro(fluxo?.saldo_final)}
          </strong>
        </p>

        <div style={estilos.tabelaWrap}>
          <table style={estilos.tabela}>
            <thead>
              <tr>
                <th style={estilos.th}>Data</th>
                <th style={estilos.th}>
                  Entradas
                </th>
                <th style={estilos.th}>
                  Sa&iacute;das
                </th>
                <th style={estilos.th}>
                  Resultado do dia
                </th>
                <th style={estilos.th}>
                  Saldo acumulado
                </th>
              </tr>
            </thead>

            <tbody>
              {diasComMovimento.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    style={estilos.td}
                  >
                    Nenhuma movimenta&ccedil;&atilde;o
                    realizada no per&iacute;odo.
                  </td>
                </tr>
              ) : (
                diasComMovimento.map((item) => (
                  <tr key={item.data}>
                    <td style={estilos.td}>
                      {new Date(
                        `${item.data}T12:00:00`
                      ).toLocaleDateString(
                        "pt-BR"
                      )}
                    </td>
                    <td style={estilos.td}>
                      {dinheiro(item.entradas)}
                    </td>
                    <td style={estilos.td}>
                      {dinheiro(item.saidas)}
                    </td>
                    <td style={estilos.td}>
                      {dinheiro(
                        item.resultado_dia
                      )}
                    </td>
                    <td style={estilos.td}>
                      <strong>
                        {dinheiro(
                          item.saldo_acumulado
                        )}
                      </strong>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section style={estilos.painel}>
        <h2 style={{ marginTop: 0 }}>
          Movimenta&ccedil;&otilde;es administrativas
        </h2>

        {carregando ? (
          <p>Carregando...</p>
        ) : (
          <div style={estilos.tabelaWrap}>
            <table style={estilos.tabela}>
              <thead>
                <tr>
                  <th style={estilos.th}>ID</th>
                  <th style={estilos.th}>Tipo</th>
                  <th style={estilos.th}>
                    Categoria
                  </th>
                  <th style={estilos.th}>
                    Descri&ccedil;&atilde;o
                  </th>
                  <th style={estilos.th}>
                    Valor
                  </th>
                  <th style={estilos.th}>
                    Status
                  </th>
                  <th style={estilos.th}>
                    Realiza&ccedil;&atilde;o
                  </th>
                  <th style={estilos.th}>
                    A&ccedil;&atilde;o
                  </th>
                </tr>
              </thead>

              <tbody>
                {movimentacoes.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      style={estilos.td}
                    >
                      Nenhuma movimenta&ccedil;&atilde;o
                      administrativa cadastrada.
                    </td>
                  </tr>
                ) : (
                  movimentacoes.map((item) => (
                    <tr key={item.id}>
                      <td style={estilos.td}>
                        {item.id}
                      </td>

                      <td style={estilos.td}>
                        {item.tipo}
                      </td>

                      <td style={estilos.td}>
                        {item.categoria}
                      </td>

                      <td style={estilos.td}>
                        {item.descricao}
                      </td>

                      <td style={estilos.td}>
                        <strong>
                          {dinheiro(item.valor)}
                        </strong>
                      </td>

                      <td style={estilos.td}>
                        <span style={estilos.badge}>
                          {item.status}
                        </span>
                      </td>

                      <td style={estilos.td}>
                        {formatarDataHora(
                          item.data_realizacao
                        )}
                      </td>

                      <td style={estilos.td}>
                        {item.status !==
                        "CANCELADO" ? (
                          <button
                            type="button"
                            style={
                              estilos.botaoSecundario
                            }
                            onClick={() =>
                              cancelarMovimentacao(
                                item
                              )
                            }
                          >
                            Cancelar
                          </button>
                        ) : (
                          "-"
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
