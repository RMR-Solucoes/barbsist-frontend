"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/contexts/AuthContext";
import { salvarToken } from "@/services/authStorage";

import {
  listarBarbearias,
  obterBarbeariaAdministracao,
  ativarBarbearia,
  desativarBarbearia,
  entrarContextoBarbearia,
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

  busca: {
    width: "100%",
    maxWidth: 520,
    padding: "11px 13px",
    border: "1px solid #cbd5e1",
    borderRadius: 9,
    fontSize: 15,
    marginTop: 12,
    marginBottom: 18,
  },

  tabelaWrapper: {
    overflowX: "auto",
  },

  tabela: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: 920,
  },

  th: {
    textAlign: "left",
    borderBottom: "1px solid #e2e8f0",
    padding: "12px 10px",
    color: "#334155",
    whiteSpace: "nowrap",
  },

  td: {
    padding: "13px 10px",
    borderBottom: "1px solid #f1f5f9",
    verticalAlign: "middle",
  },

  statusAtiva: {
    display: "inline-block",
    padding: "5px 9px",
    borderRadius: 999,
    background: "#dcfce7",
    color: "#166534",
    fontWeight: 700,
    fontSize: 13,
  },

  statusInativa: {
    display: "inline-block",
    padding: "5px 9px",
    borderRadius: 999,
    background: "#fee2e2",
    color: "#991b1b",
    fontWeight: 700,
    fontSize: 13,
  },

  botoes: {
    display: "flex",
    flexWrap: "wrap",
    gap: 7,
  },

  botao: {
    border: 0,
    borderRadius: 8,
    padding: "8px 11px",
    cursor: "pointer",
    fontWeight: 700,
  },

  detalhes: {
    background: "#0f172a",
    color: "#fff",
  },

  acessar: {
    background: "#2563eb",
    color: "#fff",
  },

  ativar: {
    background: "#dcfce7",
    color: "#166534",
  },

  desativar: {
    background: "#fee2e2",
    color: "#991b1b",
  },

  detalhesGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 14,
    marginTop: 16,
  },

  campo: {
    padding: 12,
    background: "#f8fafc",
    borderRadius: 10,
    border: "1px solid #e2e8f0",
  },

  label: {
    display: "block",
    fontSize: 12,
    color: "#64748b",
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: ".04em",
  },

  valor: {
    color: "#0f172a",
    fontWeight: 600,
    wordBreak: "break-word",
  },
};

export default function Page() {
  const router = useRouter();
  const { recarregarUsuario } = useAuth();

  const [barbearias, setBarbearias] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [busca, setBusca] = useState("");
  const [selecionada, setSelecionada] = useState(null);
  const [processandoId, setProcessandoId] =
    useState(null);

  async function carregar() {
    setCarregando(true);
    setErro("");

    try {
      const dados = await listarBarbearias();

      setBarbearias(
        Array.isArray(dados) ? dados : []
      );
    } catch (e) {
      setErro(
        e?.response?.data?.detail ||
          "Erro ao carregar barbearias."
      );
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  const resumo = useMemo(() => {
    const total = barbearias.length;

    const ativas = barbearias.filter(
      (item) => Boolean(item.ativa)
    ).length;

    return {
      total,
      ativas,
      inativas: total - ativas,
    };
  }, [barbearias]);

  const filtradas = useMemo(() => {
    const termo = busca
      .trim()
      .toLowerCase();

    if (!termo) {
      return barbearias;
    }

    return barbearias.filter((item) => {
      const texto = [
        item.codigo,
        item.nome,
        item.responsavel,
        item.email,
        item.telefone,
        item.cidade,
        item.estado,
        item.slug,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return texto.includes(termo);
    });
  }, [barbearias, busca]);

  async function verDetalhes(id) {
    setErro("");
    setSucesso("");

    try {
      const dados =
        await obterBarbeariaAdministracao(id);

      setSelecionada(dados);
    } catch (e) {
      setErro(
        e?.response?.data?.detail ||
          "Erro ao carregar detalhes."
      );
    }
  }

  async function acessarBarbearia(item) {
    if (!item?.ativa) {
      setErro("Nao e possivel acessar uma barbearia inativa.");
      return;
    }

    setErro("");
    setSucesso("");
    setProcessandoId(item.id);

    try {
      const resultado =
        await entrarContextoBarbearia(item.id);

      if (!resultado?.access_token) {
        throw new Error(
          "Token contextual nao recebido."
        );
      }

      salvarToken(resultado.access_token);

      await recarregarUsuario();

      router.replace("/");
    } catch (e) {
      setErro(
        e?.response?.data?.detail ||
          e?.message ||
          "Nao foi possivel acessar a barbearia."
      );
    } finally {
      setProcessandoId(null);
    }
  }

  async function alterarSituacao(item) {
    setErro("");
    setSucesso("");
    setProcessandoId(item.id);

    try {
      if (item.ativa) {
        await desativarBarbearia(item.id);

        setSucesso(
          `Barbearia "${item.nome}" desativada.`
        );
      } else {
        await ativarBarbearia(item.id);

        setSucesso(
          `Barbearia "${item.nome}" ativada.`
        );
      }

      if (selecionada?.id === item.id) {
        setSelecionada(null);
      }

      await carregar();
    } catch (e) {
      setErro(
        e?.response?.data?.detail ||
          "Nao foi possivel alterar a situacao."
      );
    } finally {
      setProcessandoId(null);
    }
  }

  return (
    <main style={estilos.pagina}>
      <h1>Barbearias da Plataforma</h1>

      <p style={estilos.subtitulo}>
        Administra&ccedil;&atilde;o global das
        barbearias cadastradas no BarbSist.
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
            Total de barbearias
          </div>
          <div style={estilos.cardValor}>
            {resumo.total}
          </div>
        </div>

        <div style={estilos.card}>
          <div style={estilos.cardLabel}>
            Barbearias ativas
          </div>
          <div style={estilos.cardValor}>
            {resumo.ativas}
          </div>
        </div>

        <div style={estilos.card}>
          <div style={estilos.cardLabel}>
            Barbearias inativas
          </div>
          <div style={estilos.cardValor}>
            {resumo.inativas}
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
          Barbearias cadastradas
        </h2>

        <input
          type="search"
          value={busca}
          onChange={(e) =>
            setBusca(e.target.value)
          }
          placeholder="Buscar por nome, codigo, responsavel, cidade, e-mail ou slug..."
          style={estilos.busca}
        />

        <div style={estilos.tabelaWrapper}>
          <table style={estilos.tabela}>
            <thead>
              <tr>
                <th style={estilos.th}>
                  C&oacute;digo
                </th>
                <th style={estilos.th}>
                  Barbearia
                </th>
                <th style={estilos.th}>
                  Respons&aacute;vel
                </th>
                <th style={estilos.th}>
                  Localiza&ccedil;&atilde;o
                </th>
                <th style={estilos.th}>
                  Contato
                </th>
                <th style={estilos.th}>
                  Situa&ccedil;&atilde;o
                </th>
                <th style={estilos.th}>
                  A&ccedil;&otilde;es
                </th>
              </tr>
            </thead>

            <tbody>
              {carregando ? (
                <tr>
                  <td
                    colSpan={7}
                    style={estilos.td}
                  >
                    Carregando barbearias...
                  </td>
                </tr>
              ) : filtradas.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    style={estilos.td}
                  >
                    Nenhuma barbearia encontrada.
                  </td>
                </tr>
              ) : (
                filtradas.map((item) => (
                  <tr key={item.id}>
                    <td style={estilos.td}>
                      {item.codigo ?? "-"}
                    </td>

                    <td style={estilos.td}>
                      <strong>
                        {item.nome || "-"}
                      </strong>

                      <div
                        style={{
                          color: "#64748b",
                          fontSize: 13,
                          marginTop: 3,
                        }}
                      >
                        {item.slug || ""}
                      </div>
                    </td>

                    <td style={estilos.td}>
                      {item.responsavel || "-"}
                    </td>

                    <td style={estilos.td}>
                      {[item.cidade, item.estado]
                        .filter(Boolean)
                        .join(" / ") || "-"}
                    </td>

                    <td style={estilos.td}>
                      <div>
                        {item.email || "-"}
                      </div>

                      <div
                        style={{
                          color: "#64748b",
                          fontSize: 13,
                          marginTop: 3,
                        }}
                      >
                        {item.telefone ||
                          item.telefone_whatsapp ||
                          ""}
                      </div>
                    </td>

                    <td style={estilos.td}>
                      <span
                        style={
                          item.ativa
                            ? estilos.statusAtiva
                            : estilos.statusInativa
                        }
                      >
                        {item.ativa
                          ? "ATIVA"
                          : "INATIVA"}
                      </span>
                    </td>

                    <td style={estilos.td}>
                      <div style={estilos.botoes}>
                        <button
                          type="button"
                          onClick={() =>
                            verDetalhes(item.id)
                          }
                          style={{
                            ...estilos.botao,
                            ...estilos.detalhes,
                          }}
                        >
                          Detalhes
                        </button>

                        <button
                          type="button"
                          disabled={
                            !item.ativa ||
                            processandoId === item.id
                          }
                          onClick={() =>
                            acessarBarbearia(item)
                          }
                          style={{
                            ...estilos.botao,
                            ...estilos.acessar,
                            opacity:
                              !item.ativa ||
                              processandoId === item.id
                                ? 0.6
                                : 1,
                          }}
                        >
                          {processandoId === item.id
                            ? "Acessando..."
                            : "Acessar"}
                        </button>

                        <button
                          type="button"
                          disabled={
                            processandoId === item.id
                          }
                          onClick={() =>
                            alterarSituacao(item)
                          }
                          style={{
                            ...estilos.botao,
                            ...(item.ativa
                              ? estilos.desativar
                              : estilos.ativar),
                            opacity:
                              processandoId ===
                              item.id
                                ? 0.6
                                : 1,
                          }}
                        >
                          {processandoId === item.id
                            ? "Processando..."
                            : item.ativa
                            ? "Desativar"
                            : "Ativar"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {selecionada ? (
        <section style={estilos.painel}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 15,
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <div>
              <h2
                style={{
                  margin: 0,
                  fontSize: 20,
                }}
              >
                Detalhes da barbearia
              </h2>

              <div
                style={{
                  color: "#64748b",
                  marginTop: 5,
                }}
              >
                ID {selecionada.id}
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                setSelecionada(null)
              }
              style={{
                ...estilos.botao,
                background: "#e2e8f0",
                color: "#334155",
              }}
            >
              Fechar
            </button>
          </div>

          <div style={estilos.detalhesGrid}>
            {[
              ["Codigo", selecionada.codigo],
              ["Nome", selecionada.nome],
              [
                "Responsavel",
                selecionada.responsavel,
              ],
              ["E-mail", selecionada.email],
              [
                "Telefone",
                selecionada.telefone,
              ],
              [
                "WhatsApp",
                selecionada.telefone_whatsapp,
              ],
              ["CNPJ", selecionada.cnpj],
              ["Cidade", selecionada.cidade],
              ["Estado", selecionada.estado],
              ["CEP", selecionada.cep],
              ["Slug", selecionada.slug],
              [
                "Situacao",
                selecionada.ativa
                  ? "ATIVA"
                  : "INATIVA",
              ],
            ].map(([label, valor]) => (
              <div
                key={label}
                style={estilos.campo}
              >
                <span style={estilos.label}>
                  {label}
                </span>

                <span style={estilos.valor}>
                  {valor ?? "-"}
                </span>
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}
