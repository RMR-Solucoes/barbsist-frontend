"use client";

import { useEffect, useState } from "react";
import {
  listarServicos,
  criarServico,
  atualizarServico,
  deletarServico,
} from "@/services/servicoService";

export default function ServicosPage() {
  const [servicos, setServicos] = useState([]);
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");
  const [editandoId, setEditandoId] = useState(null);

  const [form, setForm] = useState({
    nome: "",
    preco: "",
    tempo_medio_minutos: "",
  });

  useEffect(() => {
    carregarServicos();
  }, []);

  async function carregarServicos() {
    try {
      const dados = await listarServicos();
      setServicos(dados.filter((s) => s.ativo !== false));
    } catch {
      setErro("Erro ao carregar serviços.");
    }
  }

  function limparFormulario() {
    setForm({
      nome: "",
      preco: "",
      tempo_medio_minutos: "",
    });
    setEditandoId(null);
  }

  function handleChange(e) {
    const { name, value } = e.target;

    setForm({
      ...form,
      [name]: name === "nome" ? value.toUpperCase() : value,
    });
  }

  async function salvarServico(e) {
    e.preventDefault();
    setMensagem("");
    setErro("");

    if (!form.nome || !form.preco || !form.tempo_medio_minutos) {
      setErro("Preencha todos os campos.");
      return;
    }

    const dados = {
      nome: form.nome.trim().toUpperCase(),
      preco: Number(form.preco),
      tempo_medio_minutos: Number(form.tempo_medio_minutos),
    };

    try {
      if (editandoId) {
        await atualizarServico(editandoId, dados);
        setMensagem("Serviço atualizado com sucesso.");
      } else {
        await criarServico(dados);
        setMensagem("Serviço cadastrado com sucesso.");
      }

      limparFormulario();
      carregarServicos();
    } catch {
      setErro("Erro ao salvar serviço.");
    }
  }

  function editarServico(servico) {
    setEditandoId(servico.id);
    setForm({
      nome: servico.nome || "",
      preco: servico.preco || "",
      tempo_medio_minutos: servico.tempo_medio_minutos || "",
    });
  }

  async function removerServico(id) {
    const confirmar = window.confirm("Deseja realmente desativar este serviço?");
    if (!confirmar) return;

    try {
      await deletarServico(id);
      setMensagem("Serviço desativado com sucesso.");
      carregarServicos();
    } catch {
      setErro("Erro ao desativar serviço.");
    }
  }

  const inputStyle = {
    width: "100%",
    padding: "10px",
    marginTop: "5px",
    marginBottom: "15px",
    border: "1px solid #ccc",
    borderRadius: "6px",
    fontSize: "15px",
    backgroundColor: "#fff",
    color: "#000",
  };

  const buttonStyle = {
    padding: "10px 16px",
    border: "none",
    borderRadius: "6px",
    backgroundColor: "#111827",
    color: "#fff",
    cursor: "pointer",
    marginRight: "8px",
  };

  return (
    <main style={{ padding: "30px" }}>
      <h1>Serviços</h1>

      <p>
        Total de serviços ativos: <strong>{servicos.length}</strong>
      </p>

      {mensagem && (
        <div style={{ background: "#d1fae5", padding: "10px", marginBottom: "10px" }}>
          {mensagem}
        </div>
      )}

      {erro && (
        <div style={{ background: "#fee2e2", padding: "10px", marginBottom: "10px" }}>
          {erro}
        </div>
      )}

      <form
        onSubmit={salvarServico}
        style={{
          border: editandoId ? "2px solid #f59e0b" : "1px solid #ccc",
          padding: "20px",
          marginBottom: "30px",
          borderRadius: "8px",
          maxWidth: "700px",
        }}
      >
        <h2>{editandoId ? "Editando Serviço" : "Cadastrar Serviço"}</h2>

        <label>Nome do serviço</label>
        <input
          type="text"
          name="nome"
          value={form.nome}
          onChange={handleChange}
          style={inputStyle}
        />

        <label>Preço</label>
        <input
          type="number"
          name="preco"
          value={form.preco}
          onChange={handleChange}
          step="0.01"
          min="0"
          style={inputStyle}
        />

        <label>Tempo médio em minutos</label>
        <input
          type="number"
          name="tempo_medio_minutos"
          value={form.tempo_medio_minutos}
          onChange={handleChange}
          min="1"
          style={inputStyle}
        />

        <button type="submit" style={buttonStyle}>
          {editandoId ? "Atualizar Serviço" : "Cadastrar Serviço"}
        </button>

        {editandoId && (
          <button type="button" onClick={limparFormulario} style={buttonStyle}>
            Cancelar
          </button>
        )}
      </form>

      <h2>Lista de Serviços</h2>

      <table width="100%" cellPadding="10" style={{ borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: "#f3f4f6" }}>
            <th>ID</th>
            <th>Nome</th>
            <th>Preço</th>
            <th>Tempo Médio</th>
            <th>Ações</th>
          </tr>
        </thead>

        <tbody>
          {servicos.map((servico) => (
            <tr key={servico.id} style={{ borderBottom: "1px solid #ddd" }}>
              <td>{servico.id}</td>
              <td>{servico.nome}</td>
              <td>R$ {Number(servico.preco).toFixed(2)}</td>
              <td>{servico.tempo_medio_minutos} min</td>
              <td>
                <button onClick={() => editarServico(servico)} style={buttonStyle}>
                  Editar
                </button>
                <button onClick={() => removerServico(servico.id)} style={buttonStyle}>
                  Desativar
                </button>
              </td>
            </tr>
          ))}

          {servicos.length === 0 && (
            <tr>
              <td colSpan="5" align="center">
                Nenhum serviço cadastrado.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </main>
  );
}