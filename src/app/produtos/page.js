"use client";

import { useEffect, useMemo, useState } from "react";
import {
  listarProdutos,
  criarProduto,
  atualizarProduto,
  deletarProduto,
} from "@/services/produtoService";

const produtoInicial = {
  nome: "",
  categoria: "",
  preco_custo: "",
  preco_venda: "",
  estoque: "",
  codigo_qr: "",
};

export default function ProdutosPage() {
  const [produtos, setProdutos] = useState([]);
  const [form, setForm] = useState(produtoInicial);
  const [editandoId, setEditandoId] = useState(null);
  const [busca, setBusca] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");

  useEffect(() => {
    carregarProdutos();
  }, []);

  async function carregarProdutos() {
    try {
      setErro("");
      const dados = await listarProdutos();
      setProdutos(dados || []);
    } catch (error) {
      console.error(error);
      setErro("Erro ao carregar produtos.");
    }
  }

  function alterarCampo(campo, valor) {
    setForm((atual) => ({
      ...atual,
      [campo]: campo === "nome" || campo === "categoria" ? valor.toUpperCase() : valor,
    }));
  }

  function limparFormulario() {
    setForm(produtoInicial);
    setEditandoId(null);
  }

  async function salvarProduto(e) {
    e.preventDefault();
    setMensagem("");
    setErro("");

    if (!form.nome.trim()) {
      setErro("Informe o nome do produto.");
      return;
    }

    if (!form.preco_venda) {
      setErro("Informe o preço de venda.");
      return;
    }

    const dados = {
      nome: form.nome.trim(),
      categoria: form.categoria.trim() || null,
      preco_custo: Number(form.preco_custo || 0),
      preco_venda: Number(form.preco_venda || 0),
      estoque: Number(form.estoque || 0),
      codigo_qr: form.codigo_qr.trim() || null,
    };

    try {
      if (editandoId) {
        await atualizarProduto(editandoId, dados);
        setMensagem("Produto atualizado com sucesso.");
      } else {
        await criarProduto(dados);
        setMensagem("Produto cadastrado com sucesso.");
      }

      limparFormulario();
      await carregarProdutos();
    } catch (error) {
      console.error(error);
      setErro("Erro ao salvar produto.");
    }
  }

  function editarProduto(produto) {
    setEditandoId(produto.id);
    setForm({
      nome: produto.nome || "",
      categoria: produto.categoria || "",
      preco_custo: produto.preco_custo ?? "",
      preco_venda: produto.preco_venda ?? "",
      estoque: produto.estoque ?? "",
      codigo_qr: produto.codigo_qr || "",
    });
  }

  async function removerProduto(id) {
    const confirmar = window.confirm("Deseja realmente inativar este produto?");
    if (!confirmar) return;

    try {
      setMensagem("");
      setErro("");

      await deletarProduto(id);
      setMensagem("Produto inativado com sucesso.");
      await carregarProdutos();
    } catch (error) {
      console.error(error);
      setErro("Erro ao inativar produto.");
    }
  }

  function formatarMoeda(valor) {
    return Number(valor || 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  const produtosFiltrados = useMemo(() => {
    const termo = busca.toLowerCase().trim();

    if (!termo) return produtos;

    return produtos.filter((produto) => {
      return (
        produto.nome?.toLowerCase().includes(termo) ||
        produto.categoria?.toLowerCase().includes(termo) ||
        produto.codigo_qr?.toLowerCase().includes(termo)
      );
    });
  }, [produtos, busca]);

  const resumo = useMemo(() => {
    const totalProdutos = produtos.length;
    const estoqueBaixo = produtos.filter((p) => Number(p.estoque || 0) <= 2).length;
    const valorEstoqueVenda = produtos.reduce(
      (soma, p) => soma + Number(p.preco_venda || 0) * Number(p.estoque || 0),
      0
    );

    return {
      totalProdutos,
      estoqueBaixo,
      valorEstoqueVenda,
    };
  }, [produtos]);

  const inputStyle = {
    width: "100%",
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #d1d5db",
  };

  const buttonStyle = {
    background: "#111827",
    color: "#fff",
    border: "none",
    padding: "10px 14px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
  };

  const cardStyle = {
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: "12px",
    padding: "18px",
    boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
  };

  return (
    <main style={{ padding: "30px", background: "#f9fafb", minHeight: "100vh" }}>
      <h1>Produtos</h1>
      <p style={{ color: "#4b5563", marginBottom: "25px" }}>
        Controle de produtos, estoque e preços de venda.
      </p>

      {mensagem && (
        <div style={{ background: "#dcfce7", color: "#166534", padding: "12px", marginBottom: "15px", borderRadius: "8px" }}>
          {mensagem}
        </div>
      )}

      {erro && (
        <div style={{ background: "#fee2e2", color: "#991b1b", padding: "12px", marginBottom: "15px", borderRadius: "8px" }}>
          {erro}
        </div>
      )}

      <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "15px", marginBottom: "25px" }}>
        <div style={cardStyle}>
          <h2>{resumo.totalProdutos}</h2>
          <p>Produtos cadastrados</p>
        </div>

        <div style={cardStyle}>
          <h2>{resumo.estoqueBaixo}</h2>
          <p>Produtos com estoque baixo</p>
        </div>

        <div style={cardStyle}>
          <h2>{formatarMoeda(resumo.valorEstoqueVenda)}</h2>
          <p>Valor estimado em estoque</p>
        </div>
      </section>

      <section style={{ display: "grid", gridTemplateColumns: "380px 1fr", gap: "20px", alignItems: "start" }}>
        <form onSubmit={salvarProduto} style={cardStyle}>
          <h2>{editandoId ? "Editar Produto" : "Cadastrar Produto"}</h2>

          <label>Nome</label>
          <input value={form.nome} onChange={(e) => alterarCampo("nome", e.target.value)} style={inputStyle} />

          <br /><br />

          <label>Categoria</label>
          <input value={form.categoria} onChange={(e) => alterarCampo("categoria", e.target.value)} placeholder="EX: BARBA, CABELO, COSMÉTICO" style={inputStyle} />

          <br /><br />

          <label>Preço de custo</label>
          <input type="number" step="0.01" value={form.preco_custo} onChange={(e) => alterarCampo("preco_custo", e.target.value)} style={inputStyle} />

          <br /><br />

          <label>Preço de venda</label>
          <input type="number" step="0.01" value={form.preco_venda} onChange={(e) => alterarCampo("preco_venda", e.target.value)} style={inputStyle} />

          <br /><br />

          <label>Estoque</label>
          <input type="number" value={form.estoque} onChange={(e) => alterarCampo("estoque", e.target.value)} style={inputStyle} />

          <br /><br />

          <label>Código QR / Código interno</label>
          <input value={form.codigo_qr} onChange={(e) => alterarCampo("codigo_qr", e.target.value)} style={inputStyle} />

          <br /><br />

          <button type="submit" style={buttonStyle}>
            {editandoId ? "Atualizar Produto" : "Cadastrar Produto"}
          </button>

          {editandoId && (
            <button type="button" onClick={limparFormulario} style={{ ...buttonStyle, background: "#6b7280", marginLeft: "10px" }}>
              Cancelar
            </button>
          )}
        </form>

        <div style={cardStyle}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: "15px", marginBottom: "15px" }}>
            <h2>Lista de Produtos</h2>

            <input
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Pesquisar produto..."
              style={{ ...inputStyle, maxWidth: "280px" }}
            />
          </div>

          <div style={{ overflowX: "auto" }}>
            <table width="100%" cellPadding="10" style={{ borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f3f4f6", textAlign: "left" }}>
                  <th>ID</th>
                  <th>Produto</th>
                  <th>Categoria</th>
                  <th>Estoque</th>
                  <th>Custo</th>
                  <th>Venda</th>
                  <th>Ações</th>
                </tr>
              </thead>

              <tbody>
                {produtosFiltrados.map((produto) => (
                  <tr key={produto.id} style={{ borderBottom: "1px solid #e5e7eb" }}>
                    <td>#{produto.id}</td>
                    <td>{produto.nome}</td>
                    <td>{produto.categoria || "-"}</td>
                    <td>
                      <strong style={{ color: Number(produto.estoque || 0) <= 2 ? "#dc2626" : "#111827" }}>
                        {produto.estoque}
                      </strong>
                    </td>
                    <td>{formatarMoeda(produto.preco_custo)}</td>
                    <td>{formatarMoeda(produto.preco_venda)}</td>
                    <td>
                      <button onClick={() => editarProduto(produto)} style={{ ...buttonStyle, padding: "8px 10px", marginRight: "6px" }}>
                        Editar
                      </button>

                      <button onClick={() => removerProduto(produto.id)} style={{ ...buttonStyle, background: "#dc2626", padding: "8px 10px" }}>
                        Inativar
                      </button>
                    </td>
                  </tr>
                ))}

                {produtosFiltrados.length === 0 && (
                  <tr>
                    <td colSpan="7" align="center" style={{ padding: "20px" }}>
                      Nenhum produto encontrado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </main>
  );
}