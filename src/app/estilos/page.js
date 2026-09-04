"use client";

import { useEffect, useState } from "react";
import {
  listarEstilos,
  criarEstilo,
  atualizarEstilo,
  inativarEstilo,
  reativarEstilo,
} from "@/services/estiloService";

const FORM_INICIAL = {
  nome: "",
  categoria: "",
  tipo_cabelo: "geral",
  descricao: "",
  imagem_url: "",
};

function mensagemErro(erro, padrao) {
  const detail = erro?.response?.data?.detail;

  if (typeof detail === "string") return detail;

  if (Array.isArray(detail)) {
    return detail
      .map((item) => item?.msg)
      .filter(Boolean)
      .join(" | ");
  }

  return padrao;
}

export default function EstilosPage() {
  const [estilos, setEstilos] = useState([]);
  const [form, setForm] = useState(FORM_INICIAL);
  const [editandoId, setEditandoId] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [alterandoId, setAlterandoId] = useState(null);
  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [filtro, setFiltro] = useState("");

  async function carregar() {
    setCarregando(true);
    setErro("");

    try {
      const dados = await listarEstilos({
        apenas_ativos: false,
      });

      setEstilos(Array.isArray(dados) ? dados : []);
    } catch (e) {
      console.error(e);
      setErro(
        mensagemErro(
          e,
          "Não foi possível carregar os estilos."
        )
      );
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  function alterarCampo(evento) {
    const { name, value } = evento.target;

    setForm((anterior) => ({
      ...anterior,
      [name]: value,
    }));
  }

  function limparFormulario() {
    setForm(FORM_INICIAL);
    setEditandoId(null);
  }

  function editar(estilo) {
    setForm({
      nome: estilo.nome || "",
      categoria: estilo.categoria || "",
      tipo_cabelo: estilo.tipo_cabelo || "geral",
      descricao: estilo.descricao || "",
      imagem_url: estilo.imagem_url || "",
    });

    setEditandoId(estilo.id);
    setErro("");
    setMensagem("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function salvar(evento) {
    evento.preventDefault();

    setErro("");
    setMensagem("");

    const nome = form.nome.trim();
    const categoria = form.categoria.trim();

    if (!nome || !categoria) {
      setErro("Informe o nome e a categoria do estilo.");
      return;
    }

    const dados = {
      nome,
      categoria,
      tipo_cabelo:
        form.tipo_cabelo.trim() || "geral",
      descricao:
        form.descricao.trim() || null,
      imagem_url:
        form.imagem_url.trim() || null,
    };

    setSalvando(true);

    try {
      if (editandoId) {
        await atualizarEstilo(editandoId, dados);
        setMensagem("Estilo atualizado com sucesso.");
      } else {
        await criarEstilo(dados);
        setMensagem("Estilo cadastrado com sucesso.");
      }

      limparFormulario();
      await carregar();
    } catch (e) {
      console.error(e);
      setErro(
        mensagemErro(
          e,
          "Não foi possível salvar o estilo."
        )
      );
    } finally {
      setSalvando(false);
    }
  }

  async function alternarSituacao(estilo) {
    const acao =
      estilo.ativo === false ? "reativar" : "inativar";

    const confirmou = window.confirm(
      `Deseja ${acao} o estilo "${estilo.nome}"?`
    );

    if (!confirmou) return;

    setAlterandoId(estilo.id);
    setErro("");
    setMensagem("");

    try {
      if (estilo.ativo === false) {
        await reativarEstilo(estilo.id);
        setMensagem("Estilo reativado com sucesso.");
      } else {
        await inativarEstilo(estilo.id);
        setMensagem("Estilo inativado com sucesso.");
      }

      if (editandoId === estilo.id) {
        limparFormulario();
      }

      await carregar();
    } catch (e) {
      console.error(e);
      setErro(
        mensagemErro(
          e,
          `Não foi possível ${acao} o estilo.`
        )
      );
    } finally {
      setAlterandoId(null);
    }
  }

  const termo = filtro.trim().toLowerCase();

  const estilosFiltrados = estilos.filter((estilo) => {
    if (!termo) return true;

    return [
      estilo.nome,
      estilo.categoria,
      estilo.tipo_cabelo,
      estilo.descricao,
    ]
      .filter(Boolean)
      .some((valor) =>
        String(valor).toLowerCase().includes(termo)
      );
  });

  const ativos = estilos.filter(
    (estilo) => estilo.ativo !== false
  ).length;

  const inativos = estilos.length - ativos;

  return (
    <main
      style={{
        padding: 30,
        background: "#f8fafc",
        minHeight: "100vh",
      }}
    >
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ marginBottom: 6 }}>Estilos</h1>

        <p
          style={{
            color: "#64748b",
            margin: 0,
          }}
        >
          Cadastre e organize cortes, penteados e
          referências visuais oferecidas pela barbearia.
        </p>
      </div>

      {erro && (
        <div
          style={{
            background: "#fef2f2",
            color: "#991b1b",
            border: "1px solid #fecaca",
            borderRadius: 10,
            padding: 14,
            marginBottom: 18,
          }}
        >
          {erro}
        </div>
      )}

      {mensagem && (
        <div
          style={{
            background: "#f0fdf4",
            color: "#166534",
            border: "1px solid #bbf7d0",
            borderRadius: 10,
            padding: 14,
            marginBottom: 18,
          }}
        >
          {mensagem}
        </div>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit,minmax(180px,1fr))",
          gap: 16,
          marginBottom: 24,
        }}
      >
        <Resumo
          titulo="Estilos cadastrados"
          valor={estilos.length}
        />

        <Resumo
          titulo="Estilos ativos"
          valor={ativos}
          destaque
        />

        <Resumo
          titulo="Estilos inativos"
          valor={inativos}
        />
      </div>

      <section
        style={{
          background: "#ffffff",
          border: "1px solid #e2e8f0",
          borderRadius: 14,
          padding: 24,
          marginBottom: 24,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 16,
            flexWrap: "wrap",
            marginBottom: 20,
          }}
        >
          <div>
            <h2 style={{ margin: 0 }}>
              {editandoId
                ? "Editar estilo"
                : "Novo estilo"}
            </h2>

            <div
              style={{
                color: "#64748b",
                fontSize: 14,
                marginTop: 5,
              }}
            >
              Nome e categoria são obrigatórios.
            </div>
          </div>

          {editandoId && (
            <button
              type="button"
              onClick={limparFormulario}
              style={botaoSecundario}
            >
              Cancelar edição
            </button>
          )}
        </div>

        <form onSubmit={salvar}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit,minmax(220px,1fr))",
              gap: 16,
            }}
          >
            <Campo
              label="Nome *"
              name="nome"
              value={form.nome}
              onChange={alterarCampo}
              placeholder="Ex.: Degradê clássico"
            />

            <Campo
              label="Categoria *"
              name="categoria"
              value={form.categoria}
              onChange={alterarCampo}
              placeholder="Ex.: Corte masculino"
            />

            <Campo
              label="Tipo de cabelo"
              name="tipo_cabelo"
              value={form.tipo_cabelo}
              onChange={alterarCampo}
              placeholder="Ex.: liso, cacheado, geral"
            />
          </div>

          <div style={{ marginTop: 16 }}>
            <label style={labelStyle}>
              Descrição
            </label>

            <textarea
              name="descricao"
              value={form.descricao}
              onChange={alterarCampo}
              rows={4}
              placeholder="Descrição, características ou observações do estilo."
              style={{
                ...inputStyle,
                resize: "vertical",
              }}
            />
          </div>

          <div style={{ marginTop: 16 }}>
            <Campo
              label="URL da imagem"
              name="imagem_url"
              value={form.imagem_url}
              onChange={alterarCampo}
              placeholder="https://..."
              type="url"
            />
          </div>

          {form.imagem_url.trim() && (
            <div style={{ marginTop: 16 }}>
              <div
                style={{
                  color: "#64748b",
                  fontSize: 13,
                  marginBottom: 8,
                }}
              >
                Pré-visualização
              </div>

              <ImagemEstilo
                url={form.imagem_url.trim()}
                nome={form.nome || "Estilo"}
                grande
              />
            </div>
          )}

          <div
            style={{
              display: "flex",
              gap: 10,
              marginTop: 22,
              flexWrap: "wrap",
            }}
          >
            <button
              type="submit"
              disabled={salvando}
              style={{
                ...botaoPrincipal,
                opacity: salvando ? 0.65 : 1,
              }}
            >
              {salvando
                ? "Salvando..."
                : editandoId
                ? "Salvar alterações"
                : "Cadastrar estilo"}
            </button>

            <button
              type="button"
              onClick={limparFormulario}
              disabled={salvando}
              style={botaoSecundario}
            >
              Limpar
            </button>
          </div>
        </form>
      </section>

      <section
        style={{
          background: "#ffffff",
          border: "1px solid #e2e8f0",
          borderRadius: 14,
          padding: 24,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 16,
            flexWrap: "wrap",
            marginBottom: 20,
          }}
        >
          <div>
            <h2 style={{ margin: 0 }}>
              Estilos cadastrados
            </h2>

            <div
              style={{
                color: "#64748b",
                fontSize: 14,
                marginTop: 5,
              }}
            >
              {estilosFiltrados.length} registro(s)
              exibido(s).
            </div>
          </div>

          <div
            style={{
              display: "flex",
              gap: 10,
              flexWrap: "wrap",
            }}
          >
            <input
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              placeholder="Pesquisar estilo..."
              style={{
                ...inputStyle,
                width: 250,
              }}
            />

            <button
              type="button"
              onClick={carregar}
              style={botaoSecundario}
            >
              Atualizar
            </button>
          </div>
        </div>

        {carregando ? (
          <div style={{ color: "#64748b" }}>
            Carregando estilos...
          </div>
        ) : estilosFiltrados.length === 0 ? (
          <div
            style={{
              padding: 30,
              textAlign: "center",
              color: "#64748b",
              background: "#f8fafc",
              borderRadius: 10,
            }}
          >
            Nenhum estilo encontrado.
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                minWidth: 900,
              }}
            >
              <thead>
                <tr
                  style={{
                    background: "#f8fafc",
                    textAlign: "left",
                  }}
                >
                  <Th>Imagem</Th>
                  <Th>Nome</Th>
                  <Th>Categoria</Th>
                  <Th>Tipo de cabelo</Th>
                  <Th>Situação</Th>
                  <Th>Ações</Th>
                </tr>
              </thead>

              <tbody>
                {estilosFiltrados.map((estilo) => (
                  <tr
                    key={estilo.id}
                    style={{
                      borderTop:
                        "1px solid #e2e8f0",
                      opacity:
                        estilo.ativo === false
                          ? 0.72
                          : 1,
                    }}
                  >
                    <Td>
                      <ImagemEstilo
                        url={estilo.imagem_url}
                        nome={estilo.nome}
                      />
                    </Td>

                    <Td>
                      <strong>
                        {estilo.nome || "-"}
                      </strong>

                      {estilo.descricao && (
                        <div
                          style={{
                            color: "#64748b",
                            fontSize: 13,
                            marginTop: 4,
                            maxWidth: 300,
                          }}
                        >
                          {estilo.descricao}
                        </div>
                      )}
                    </Td>

                    <Td>
                      {estilo.categoria || "-"}
                    </Td>

                    <Td>
                      {estilo.tipo_cabelo || "geral"}
                    </Td>

                    <Td>
                      <Status
                        ativo={estilo.ativo !== false}
                      />
                    </Td>

                    <Td>
                      <div
                        style={{
                          display: "flex",
                          gap: 8,
                          flexWrap: "wrap",
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => editar(estilo)}
                          style={botaoEditar}
                        >
                          Editar
                        </button>

                        <button
                          type="button"
                          disabled={
                            alterandoId === estilo.id
                          }
                          onClick={() =>
                            alternarSituacao(estilo)
                          }
                          style={
                            estilo.ativo === false
                              ? botaoReativar
                              : botaoInativar
                          }
                        >
                          {alterandoId === estilo.id
                            ? "Processando..."
                            : estilo.ativo === false
                            ? "Reativar"
                            : "Inativar"}
                        </button>
                      </div>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}

function Campo({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = "text",
}) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        style={inputStyle}
      />
    </div>
  );
}

function ImagemEstilo({
  url,
  nome,
  grande = false,
}) {
  const [falhou, setFalhou] = useState(false);

  useEffect(() => {
    setFalhou(false);
  }, [url]);

  const largura = grande ? 180 : 72;
  const altura = grande ? 130 : 60;

  if (!url || falhou) {
    return (
      <div
        style={{
          width: largura,
          height: altura,
          borderRadius: 10,
          background: "#f1f5f9",
          border: "1px solid #e2e8f0",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#94a3b8",
          fontSize: grande ? 14 : 11,
          textAlign: "center",
          padding: 5,
        }}
      >
        Sem imagem
      </div>
    );
  }

  return (
    <img
      src={url}
      alt={nome || "Estilo"}
      onError={() => setFalhou(true)}
      style={{
        width: largura,
        height: altura,
        borderRadius: 10,
        objectFit: "cover",
        border: "1px solid #e2e8f0",
      }}
    />
  );
}

function Status({ ativo }) {
  return (
    <span
      style={{
        display: "inline-block",
        padding: "5px 10px",
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 700,
        background: ativo
          ? "#dcfce7"
          : "#fee2e2",
        color: ativo
          ? "#166534"
          : "#991b1b",
      }}
    >
      {ativo ? "Ativo" : "Inativo"}
    </span>
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
        background: "#ffffff",
        border: destaque
          ? "2px solid #2563eb"
          : "1px solid #e2e8f0",
        borderRadius: 14,
        padding: 24,
      }}
    >
      <div
        style={{
          color: "#64748b",
          marginBottom: 10,
          fontSize: 15,
        }}
      >
        {titulo}
      </div>

      <div
        style={{
          fontSize: 28,
          fontWeight: 800,
          color: destaque
            ? "#1d4ed8"
            : "#0f172a",
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
        padding: 12,
        color: "#475569",
        fontSize: 13,
      }}
    >
      {children}
    </th>
  );
}

function Td({ children }) {
  return (
    <td
      style={{
        padding: 12,
        verticalAlign: "middle",
      }}
    >
      {children}
    </td>
  );
}

const labelStyle = {
  display: "block",
  marginBottom: 7,
  fontSize: 14,
  fontWeight: 600,
  color: "#334155",
};

const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: "10px 12px",
  border: "1px solid #cbd5e1",
  borderRadius: 8,
  background: "#ffffff",
  color: "#0f172a",
  outline: "none",
};

const botaoPrincipal = {
  border: 0,
  borderRadius: 8,
  padding: "10px 16px",
  background: "#2563eb",
  color: "#ffffff",
  fontWeight: 700,
  cursor: "pointer",
};

const botaoSecundario = {
  border: "1px solid #cbd5e1",
  borderRadius: 8,
  padding: "10px 16px",
  background: "#ffffff",
  color: "#334155",
  fontWeight: 600,
  cursor: "pointer",
};

const botaoEditar = {
  ...botaoSecundario,
  padding: "8px 12px",
};

const botaoInativar = {
  border: "1px solid #fecaca",
  borderRadius: 8,
  padding: "8px 12px",
  background: "#fef2f2",
  color: "#991b1b",
  fontWeight: 700,
  cursor: "pointer",
};

const botaoReativar = {
  border: "1px solid #bbf7d0",
  borderRadius: 8,
  padding: "8px 12px",
  background: "#f0fdf4",
  color: "#166534",
  fontWeight: 700,
  cursor: "pointer",
};
