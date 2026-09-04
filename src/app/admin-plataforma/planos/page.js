"use client";

import { useEffect, useMemo, useState } from "react";

import {
  listarPlanosSaas,
  criarPlanoSaas,
  atualizarPlanoSaas,
} from "@/services/adminPlataformaService";

const vazio = {
  nome: "",
  descricao: "",
  periodo_meses: 1,
  valor_pix: "",
  valor_cartao: "",
  max_parcelas_cartao: 1,
  limite_barbeiros: 1,
  ativo: true,
};

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
    boxShadow: "0 6px 18px rgba(15,23,42,.04)",
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
    boxShadow: "0 6px 18px rgba(15,23,42,.04)",
  },

  grid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 14,
  },

  campo: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },

  label: {
    fontWeight: 600,
    color: "#334155",
  },

  input: {
    padding: "11px 12px",
    borderRadius: 9,
    border: "1px solid #cbd5e1",
    fontSize: 15,
  },

  textarea: {
    padding: "11px 12px",
    borderRadius: 9,
    border: "1px solid #cbd5e1",
    fontSize: 15,
    minHeight: 80,
    resize: "vertical",
  },

  tabelaWrapper: {
    overflowX: "auto",
  },

  tabela: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: 950,
  },

  th: {
    textAlign: "left",
    padding: "12px 10px",
    borderBottom: "1px solid #e2e8f0",
    color: "#334155",
    whiteSpace: "nowrap",
  },

  td: {
    padding: "13px 10px",
    borderBottom: "1px solid #f1f5f9",
    verticalAlign: "middle",
  },

  badgeAtivo: {
    display: "inline-block",
    padding: "5px 9px",
    borderRadius: 999,
    background: "#dcfce7",
    color: "#166534",
    fontWeight: 700,
    fontSize: 13,
  },

  badgeInativo: {
    display: "inline-block",
    padding: "5px 9px",
    borderRadius: 999,
    background: "#fee2e2",
    color: "#991b1b",
    fontWeight: 700,
    fontSize: 13,
  },

  botaoPrimario: {
    border: 0,
    background: "#0f172a",
    color: "#fff",
    borderRadius: 8,
    padding: "10px 14px",
    cursor: "pointer",
    fontWeight: 700,
  },

  botaoSecundario: {
    border: 0,
    background: "#e2e8f0",
    color: "#334155",
    borderRadius: 8,
    padding: "10px 14px",
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

function dinheiro(valor) {
  const numero = Number(valor || 0);

  return numero.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export default function Page() {
  const [planos, setPlanos] = useState([]);
  const [form, setForm] = useState(vazio);
  const [editandoId, setEditandoId] = useState(null);

  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  async function carregar() {
    setCarregando(true);
    setErro("");

    try {
      const dados = await listarPlanosSaas();
      setPlanos(Array.isArray(dados) ? dados : []);
    } catch (e) {
      setErro(
        e?.response?.data?.detail ||
          "Erro ao carregar planos SaaS."
      );
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  const resumo = useMemo(() => {
    const total = planos.length;
    const ativos = planos.filter(
      (item) => Boolean(item.ativo)
    ).length;

    return {
      total,
      ativos,
      inativos: total - ativos,
    };
  }, [planos]);

  function alterar(campo, valor) {
    setForm((anterior) => ({
      ...anterior,
      [campo]: valor,
    }));
  }

  function cancelarEdicao() {
    setForm(vazio);
    setEditandoId(null);
    setErro("");
    setSucesso("");
  }

  function editar(item) {
    setEditandoId(item.id);

    setForm({
      nome: item.nome || "",
      descricao: item.descricao || "",
      periodo_meses: item.periodo_meses ?? 1,
      valor_pix: item.valor_pix ?? "",
      valor_cartao: item.valor_cartao ?? "",
      max_parcelas_cartao:
        item.max_parcelas_cartao ?? 1,
      limite_barbeiros:
        item.limite_barbeiros ?? 1,
      ativo: Boolean(item.ativo),
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function salvar(event) {
    event.preventDefault();

    setErro("");
    setSucesso("");
    setSalvando(true);

    try {
      const payload = {
        nome: form.nome.trim(),
        descricao:
          form.descricao.trim() || null,
        periodo_meses:
          Number(form.periodo_meses),
        valor_pix:
          Number(form.valor_pix),
        valor_cartao:
          Number(form.valor_cartao),
        max_parcelas_cartao:
          Number(form.max_parcelas_cartao),
        limite_barbeiros:
          Number(form.limite_barbeiros),
        ativo: Boolean(form.ativo),
      };

      if (editandoId) {
        await atualizarPlanoSaas(
          editandoId,
          payload
        );

        setSucesso(
          "Plano SaaS atualizado com sucesso."
        );
      } else {
        await criarPlanoSaas(payload);

        setSucesso(
          "Plano SaaS cadastrado com sucesso."
        );
      }

      setForm(vazio);
      setEditandoId(null);

      await carregar();
    } catch (e) {
      const detalhe = e?.response?.data?.detail;

      setErro(
        typeof detalhe === "string"
          ? detalhe
          : "Nao foi possivel salvar o plano."
      );
    } finally {
      setSalvando(false);
    }
  }

  return (
    <main style={estilos.pagina}>
      <h1>Planos SaaS</h1>

      <p style={estilos.subtitulo}>
        Gest&atilde;o administrativa dos planos
        comerciais da plataforma BarbSist.
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
            Total de planos
          </div>
          <div style={estilos.cardValor}>
            {resumo.total}
          </div>
        </div>

        <div style={estilos.card}>
          <div style={estilos.cardLabel}>
            Planos ativos
          </div>
          <div style={estilos.cardValor}>
            {resumo.ativos}
          </div>
        </div>

        <div style={estilos.card}>
          <div style={estilos.cardLabel}>
            Planos inativos
          </div>
          <div style={estilos.cardValor}>
            {resumo.inativos}
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
          {editandoId
            ? "Editar plano SaaS"
            : "Cadastrar plano SaaS"}
        </h2>

        <form onSubmit={salvar}>
          <div style={estilos.grid}>
            <label style={estilos.campo}>
              <span style={estilos.label}>
                Nome
              </span>

              <input
                required
                value={form.nome}
                onChange={(e) =>
                  alterar("nome", e.target.value)
                }
                style={estilos.input}
              />
            </label>

            <label style={estilos.campo}>
              <span style={estilos.label}>
                Per&iacute;odo em meses
              </span>

              <input
                required
                min="1"
                type="number"
                value={form.periodo_meses}
                onChange={(e) =>
                  alterar(
                    "periodo_meses",
                    e.target.value
                  )
                }
                style={estilos.input}
              />
            </label>

            <label style={estilos.campo}>
              <span style={estilos.label}>
                Valor PIX
              </span>

              <input
                required
                min="0"
                step="0.01"
                type="number"
                value={form.valor_pix}
                onChange={(e) =>
                  alterar(
                    "valor_pix",
                    e.target.value
                  )
                }
                style={estilos.input}
              />
            </label>

            <label style={estilos.campo}>
              <span style={estilos.label}>
                Valor cart&atilde;o
              </span>

              <input
                required
                min="0"
                step="0.01"
                type="number"
                value={form.valor_cartao}
                onChange={(e) =>
                  alterar(
                    "valor_cartao",
                    e.target.value
                  )
                }
                style={estilos.input}
              />
            </label>

            <label style={estilos.campo}>
              <span style={estilos.label}>
                M&aacute;ximo de parcelas
              </span>

              <input
                required
                min="1"
                type="number"
                value={form.max_parcelas_cartao}
                onChange={(e) =>
                  alterar(
                    "max_parcelas_cartao",
                    e.target.value
                  )
                }
                style={estilos.input}
              />
            </label>

            <label style={estilos.campo}>
              <span style={estilos.label}>
                Limite de barbeiros
              </span>

              <input
                required
                min="1"
                type="number"
                value={form.limite_barbeiros}
                onChange={(e) =>
                  alterar(
                    "limite_barbeiros",
                    e.target.value
                  )
                }
                style={estilos.input}
              />
            </label>

            <label style={estilos.campo}>
              <span style={estilos.label}>
                Situa&ccedil;&atilde;o
              </span>

              <select
                value={
                  form.ativo ? "true" : "false"
                }
                onChange={(e) =>
                  alterar(
                    "ativo",
                    e.target.value === "true"
                  )
                }
                style={estilos.input}
              >
                <option value="true">
                  Ativo
                </option>
                <option value="false">
                  Inativo
                </option>
              </select>
            </label>
          </div>

          <label
            style={{
              ...estilos.campo,
              marginTop: 14,
            }}
          >
            <span style={estilos.label}>
              Descri&ccedil;&atilde;o
            </span>

            <textarea
              value={form.descricao}
              onChange={(e) =>
                alterar(
                  "descricao",
                  e.target.value
                )
              }
              style={estilos.textarea}
            />
          </label>

          <div
            style={{
              display: "flex",
              gap: 10,
              marginTop: 16,
              flexWrap: "wrap",
            }}
          >
            <button
              type="submit"
              disabled={salvando}
              style={{
                ...estilos.botaoPrimario,
                opacity: salvando ? 0.6 : 1,
              }}
            >
              {salvando
                ? "Salvando..."
                : editandoId
                ? "Salvar alteracoes"
                : "Cadastrar plano"}
            </button>

            {editandoId ? (
              <button
                type="button"
                onClick={cancelarEdicao}
                style={estilos.botaoSecundario}
              >
                Cancelar edicao
              </button>
            ) : null}
          </div>
        </form>
      </section>

      <section style={estilos.painel}>
        <h2
          style={{
            marginTop: 0,
            fontSize: 20,
          }}
        >
          Planos cadastrados
        </h2>

        <div style={estilos.tabelaWrapper}>
          <table style={estilos.tabela}>
            <thead>
              <tr>
                <th style={estilos.th}>ID</th>
                <th style={estilos.th}>Plano</th>
                <th style={estilos.th}>
                  Per&iacute;odo
                </th>
                <th style={estilos.th}>PIX</th>
                <th style={estilos.th}>
                  Cart&atilde;o
                </th>
                <th style={estilos.th}>
                  Parcelas
                </th>
                <th style={estilos.th}>
                  Barbeiros
                </th>
                <th style={estilos.th}>
                  Situa&ccedil;&atilde;o
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
                    Carregando planos...
                  </td>
                </tr>
              ) : planos.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    style={estilos.td}
                  >
                    Nenhum plano cadastrado.
                  </td>
                </tr>
              ) : (
                planos.map((item) => (
                  <tr key={item.id}>
                    <td style={estilos.td}>
                      {item.id}
                    </td>

                    <td style={estilos.td}>
                      <strong>
                        {item.nome}
                      </strong>

                      {item.descricao ? (
                        <div
                          style={{
                            color: "#64748b",
                            fontSize: 13,
                            marginTop: 4,
                            maxWidth: 280,
                          }}
                        >
                          {item.descricao}
                        </div>
                      ) : null}
                    </td>

                    <td style={estilos.td}>
                      {item.periodo_meses} mes(es)
                    </td>

                    <td style={estilos.td}>
                      {dinheiro(item.valor_pix)}
                    </td>

                    <td style={estilos.td}>
                      {dinheiro(
                        item.valor_cartao
                      )}
                    </td>

                    <td style={estilos.td}>
                      {item.max_parcelas_cartao}
                    </td>

                    <td style={estilos.td}>
                      {item.limite_barbeiros}
                    </td>

                    <td style={estilos.td}>
                      <span
                        style={
                          item.ativo
                            ? estilos.badgeAtivo
                            : estilos.badgeInativo
                        }
                      >
                        {item.ativo
                          ? "ATIVO"
                          : "INATIVO"}
                      </span>
                    </td>

                    <td style={estilos.td}>
                      <button
                        type="button"
                        onClick={() => editar(item)}
                        style={
                          estilos.botaoPrimario
                        }
                      >
                        Editar
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
