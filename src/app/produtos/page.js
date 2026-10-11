"use client";

import { useEffect, useMemo, useState } from "react";
import {
  listarProdutos,
  criarProduto,
  atualizarProduto,
  deletarProduto,
  entradaEstoque,
  ajustarEstoque,
  listarMovimentacoesEstoque,
} from "@/services/produtoService";

const produtoInicial = {
  nome: "",
  categoria: "",
  preco_custo: "",
  preco_venda: "",
  estoque: "",
  estoque_minimo: "2",
  codigo_qr: "",
};

function detalheErro(error, fallback) {
  const detail = error?.response?.data?.detail;
  return typeof detail === "string" ? detail : fallback;
}

export default function ProdutosPage() {
  const [produtos, setProdutos] = useState([]);
  const [form, setForm] = useState(produtoInicial);
  const [editandoId, setEditandoId] = useState(null);
  const [busca, setBusca] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");
  const [produtoMovimento, setProdutoMovimento] = useState(null);
  const [modoMovimento, setModoMovimento] = useState(null);
  const [quantidadeEntrada, setQuantidadeEntrada] = useState("");
  const [novoEstoque, setNovoEstoque] = useState("");
  const [observacao, setObservacao] = useState("");
  const [movimentacoes, setMovimentacoes] = useState([]);
  const [carregandoHistorico, setCarregandoHistorico] = useState(false);

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
      setErro(detalheErro(error, "Erro ao carregar produtos."));
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

  function fecharMovimento() {
    setProdutoMovimento(null);
    setModoMovimento(null);
    setQuantidadeEntrada("");
    setNovoEstoque("");
    setObservacao("");
    setMovimentacoes([]);
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
      estoque_minimo: Number(form.estoque_minimo || 0),
      codigo_qr: form.codigo_qr.trim() || null,
    };

    if (!editandoId) {
      dados.estoque = Number(form.estoque || 0);
    }

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
      setErro(detalheErro(error, "Erro ao salvar produto."));
    }
  }

  function editarProduto(produto) {
    fecharMovimento();
    setEditandoId(produto.id);
    setForm({
      nome: produto.nome || "",
      categoria: produto.categoria || "",
      preco_custo: produto.preco_custo ?? "",
      preco_venda: produto.preco_venda ?? "",
      estoque: produto.estoque ?? "",
      estoque_minimo: produto.estoque_minimo ?? 2,
      codigo_qr: produto.codigo_qr || "",
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function removerProduto(id) {
    if (!window.confirm("Deseja realmente inativar este produto?")) {
      return;
    }

    try {
      setMensagem("");
      setErro("");
      await deletarProduto(id);
      setMensagem("Produto inativado com sucesso.");
      await carregarProdutos();
    } catch (error) {
      console.error(error);
      setErro(detalheErro(error, "Erro ao inativar produto."));
    }
  }

  function abrirMovimento(produto, modo) {
    setMensagem("");
    setErro("");
    setProdutoMovimento(produto);
    setModoMovimento(modo);
    setQuantidadeEntrada("");
    setNovoEstoque(String(produto.estoque ?? 0));
    setObservacao("");
    setMovimentacoes([]);

    if (modo === "historico") {
      carregarHistorico(produto);
    }
  }

  async function carregarHistorico(produto) {
    try {
      setCarregandoHistorico(true);
      const dados = await listarMovimentacoesEstoque(produto.id, 100);
      setMovimentacoes(dados || []);
    } catch (error) {
      console.error(error);
      setErro(detalheErro(error, "Erro ao carregar histórico do estoque."));
    } finally {
      setCarregandoHistorico(false);
    }
  }

  async function confirmarEntrada(e) {
    e.preventDefault();

    const quantidade = Number(quantidadeEntrada);

    if (!Number.isInteger(quantidade) || quantidade <= 0) {
      setErro("Informe uma quantidade inteira maior que zero.");
      return;
    }

    try {
      setErro("");
      await entradaEstoque(produtoMovimento.id, {
        quantidade,
        observacao: observacao.trim() || null,
      });

      setMensagem(`Entrada registrada para ${produtoMovimento.nome}.`);
      fecharMovimento();
      await carregarProdutos();
    } catch (error) {
      console.error(error);
      setErro(detalheErro(error, "Erro ao registrar entrada de estoque."));
    }
  }

  async function confirmarAjuste(e) {
    e.preventDefault();

    const saldo = Number(novoEstoque);

    if (!Number.isInteger(saldo) || saldo < 0) {
      setErro("Informe um novo saldo inteiro igual ou maior que zero.");
      return;
    }

    if (observacao.trim().length < 3) {
      setErro("Informe o motivo do ajuste com pelo menos 3 caracteres.");
      return;
    }

    try {
      setErro("");
      await ajustarEstoque(produtoMovimento.id, {
        novo_estoque: saldo,
        observacao: observacao.trim(),
      });

      setMensagem(`Estoque de ${produtoMovimento.nome} ajustado com sucesso.`);
      fecharMovimento();
      await carregarProdutos();
    } catch (error) {
      console.error(error);
      setErro(detalheErro(error, "Erro ao ajustar estoque."));
    }
  }

  function formatarMoeda(valor) {
    return Number(valor || 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  function formatarData(valor) {
    if (!valor) return "-";
    return new Date(valor).toLocaleString("pt-BR");
  }

  function situacaoProduto(produto) {
    const estoque = Number(produto.estoque || 0);
    const minimo = Number(produto.estoque_minimo ?? 2);

    if (estoque <= 0) {
      return { texto: "SEM ESTOQUE", cor: "#b91c1c", fundo: "#fee2e2" };
    }

    if (estoque <= minimo) {
      return { texto: "ESTOQUE BAIXO", cor: "#92400e", fundo: "#fef3c7" };
    }

    return { texto: "NORMAL", cor: "#166534", fundo: "#dcfce7" };
  }

  const produtosFiltrados = useMemo(() => {
    const termo = busca.toLowerCase().trim();

    if (!termo) return produtos;

    return produtos.filter((produto) => (
      produto.nome?.toLowerCase().includes(termo) ||
      produto.categoria?.toLowerCase().includes(termo) ||
      produto.codigo_qr?.toLowerCase().includes(termo)
    ));
  }, [produtos, busca]);

  const resumo = useMemo(() => {
    const estoqueBaixo = produtos.filter((p) => {
      const estoque = Number(p.estoque || 0);
      const minimo = Number(p.estoque_minimo ?? 2);

      return estoque > 0 && estoque <= minimo;
    }).length;

    const semEstoque = produtos.filter(
      (p) => Number(p.estoque || 0) <= 0
    ).length;

    const valorEstoqueCusto = produtos.reduce(
      (soma, p) => soma + Number(p.preco_custo || 0) * Number(p.estoque || 0),
      0
    );

    return {
      totalProdutos: produtos.length,
      estoqueBaixo,
      semEstoque,
      valorEstoqueCusto,
    };
  }, [produtos]);

  const inputStyle = {
    width: "100%",
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #d1d5db",
    boxSizing: "border-box",
  };

  const buttonStyle = {
    background: "#111827",
    color: "#fff",
    border: "none",
    padding: "9px 11px",
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
      <h1>Produtos e Estoque</h1>
      <p style={{ color: "#4b5563", marginBottom: "25px" }}>
        Controle de produtos, saldo, estoque mínimo e histórico de movimentações.
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

      <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: "15px", marginBottom: "25px" }}>
        <div style={cardStyle}>
          <h2>{resumo.totalProdutos}</h2>
          <p>Produtos cadastrados</p>
        </div>

        <div style={cardStyle}>
          <h2>{resumo.estoqueBaixo}</h2>
          <p>Estoque baixo</p>
        </div>

        <div style={cardStyle}>
          <h2>{resumo.semEstoque}</h2>
          <p>Sem estoque</p>
        </div>

        <div style={cardStyle}>
          <h2>{formatarMoeda(resumo.valorEstoqueCusto)}</h2>
          <p>Valor de custo em estoque</p>
        </div>
      </section>

      <section style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <form onSubmit={salvarProduto} style={cardStyle}>
          <h2 style={{ marginTop: 0 }}>
            {editandoId ? "Editar Produto" : "Cadastrar Produto"}
          </h2>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "14px", alignItems: "end" }}>
            <Campo label="Nome">
              <input value={form.nome} onChange={(e) => alterarCampo("nome", e.target.value)} style={inputStyle} />
            </Campo>

            <Campo label="Categoria">
              <input value={form.categoria} onChange={(e) => alterarCampo("categoria", e.target.value)} placeholder="EX: BARBA, CABELO, COSMÉTICO" style={inputStyle} />
            </Campo>

            <Campo label="Preço de custo">
              <input type="number" min="0" step="0.01" value={form.preco_custo} onChange={(e) => alterarCampo("preco_custo", e.target.value)} style={inputStyle} />
            </Campo>

            <Campo label="Preço de venda">
              <input type="number" min="0" step="0.01" value={form.preco_venda} onChange={(e) => alterarCampo("preco_venda", e.target.value)} style={inputStyle} />
            </Campo>

            <Campo label={editandoId ? "Estoque atual" : "Estoque inicial"}>
              <input
                type="number"
                min="0"
                value={form.estoque}
                disabled={Boolean(editandoId)}
                onChange={(e) => alterarCampo("estoque", e.target.value)}
                style={{ ...inputStyle, background: editandoId ? "#f3f4f6" : "#fff" }}
              />
            </Campo>

            <Campo label="Estoque mínimo">
              <input type="number" min="0" value={form.estoque_minimo} onChange={(e) => alterarCampo("estoque_minimo", e.target.value)} style={inputStyle} />
            </Campo>

            <Campo label="Código QR / interno">
              <input value={form.codigo_qr} onChange={(e) => alterarCampo("codigo_qr", e.target.value)} style={inputStyle} />
            </Campo>
          </div>

          {editandoId && (
            <p style={{ margin: "12px 0 0", color: "#6b7280", fontSize: "13px" }}>
              O saldo não é alterado pela edição. Use Entrada ou Ajustar para manter o histórico do estoque.
            </p>
          )}

          <div style={{ display: "flex", gap: "10px", marginTop: "16px", justifyContent: "flex-end" }}>
            <button type="submit" style={buttonStyle}>
              {editandoId ? "Atualizar Produto" : "Cadastrar Produto"}
            </button>

            {editandoId && (
              <button type="button" onClick={limparFormulario} style={{ ...buttonStyle, background: "#6b7280" }}>
                Cancelar
              </button>
            )}
          </div>
        </form>

        {produtoMovimento && (
          <div style={cardStyle}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", alignItems: "center" }}>
              <div>
                <h2 style={{ margin: 0 }}>
                  {modoMovimento === "entrada"
                    ? "Entrada de estoque"
                    : modoMovimento === "ajuste"
                    ? "Ajuste de estoque"
                    : "Histórico de estoque"}
                </h2>
                <p style={{ marginBottom: 0 }}>
                  <strong>{produtoMovimento.nome}</strong> — saldo atual: {produtoMovimento.estoque}
                </p>
              </div>

              <button type="button" onClick={fecharMovimento} style={{ ...buttonStyle, background: "#6b7280" }}>
                Fechar
              </button>
            </div>

            {modoMovimento === "entrada" && (
              <form onSubmit={confirmarEntrada} style={{ display: "grid", gridTemplateColumns: "160px minmax(240px, 1fr) auto", gap: "12px", alignItems: "end", marginTop: "18px" }}>
                <Campo label="Quantidade">
                  <input type="number" min="1" step="1" value={quantidadeEntrada} onChange={(e) => setQuantidadeEntrada(e.target.value)} style={inputStyle} />
                </Campo>

                <Campo label="Observação">
                  <input value={observacao} onChange={(e) => setObservacao(e.target.value)} placeholder="Ex.: reposição do fornecedor" style={inputStyle} />
                </Campo>

                <button type="submit" style={buttonStyle}>
                  Registrar entrada
                </button>
              </form>
            )}

            {modoMovimento === "ajuste" && (
              <form onSubmit={confirmarAjuste} style={{ display: "grid", gridTemplateColumns: "160px minmax(240px, 1fr) auto", gap: "12px", alignItems: "end", marginTop: "18px" }}>
                <Campo label="Novo saldo">
                  <input type="number" min="0" step="1" value={novoEstoque} onChange={(e) => setNovoEstoque(e.target.value)} style={inputStyle} />
                </Campo>

                <Campo label="Motivo obrigatório">
                  <input value={observacao} onChange={(e) => setObservacao(e.target.value)} placeholder="Ex.: contagem física / perda / correção" style={inputStyle} />
                </Campo>

                <button type="submit" style={{ ...buttonStyle, background: "#7c3aed" }}>
                  Confirmar ajuste
                </button>
              </form>
            )}

            {modoMovimento === "historico" && (
              <div style={{ overflowX: "auto", marginTop: "18px" }}>
                {carregandoHistorico ? (
                  <p>Carregando...</p>
                ) : (
                  <table width="100%" style={{ borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ background: "#e2e8f0", textAlign: "left" }}>
                        <th style={{ padding: "10px" }}>Data</th>
                        <th>Tipo</th>
                        <th>Origem</th>
                        <th>Qtd.</th>
                        <th>Anterior</th>
                        <th>Posterior</th>
                        <th>Referência</th>
                        <th>Observação</th>
                      </tr>
                    </thead>
                    <tbody>
                      {movimentacoes.map((m) => (
                        <tr key={m.id} style={{ borderBottom: "1px solid #e5e7eb" }}>
                          <td style={{ padding: "10px" }}>{formatarData(m.data)}</td>
                          <td>{m.tipo}</td>
                          <td>{m.origem}</td>
                          <td>{m.quantidade}</td>
                          <td>{m.saldo_anterior}</td>
                          <td><strong>{m.saldo_posterior}</strong></td>
                          <td>{m.referencia_id ?? "-"}</td>
                          <td>{m.observacao || "-"}</td>
                        </tr>
                      ))}

                      {movimentacoes.length === 0 && (
                        <tr>
                          <td colSpan="8" style={{ padding: "16px", textAlign: "center" }}>
                            Nenhuma movimentação encontrada.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </div>
        )}

        <div style={cardStyle}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: "15px", marginBottom: "15px", flexWrap: "wrap" }}>
            <h2>Lista de Produtos</h2>
            <input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Pesquisar produto..." style={{ ...inputStyle, maxWidth: "280px" }} />
          </div>

          <div style={{ overflowX: "auto" }}>
            <table width="100%" style={{ borderCollapse: "separate", borderSpacing: 0, tableLayout: "auto" }}>
              <thead>
                <tr style={{ background: "#334155", textAlign: "left" }}>
                  {["ID", "Produto", "Categoria", "Estoque", "Mínimo", "Situação", "Custo", "Venda", "Ações"].map((titulo) => (
                    <th key={titulo} style={{ padding: "13px 14px", color: "#fff", fontSize: "13px", whiteSpace: "nowrap" }}>
                      {titulo}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {produtosFiltrados.map((produto, index) => {
                  const situacao = situacaoProduto(produto);

                  return (
                    <tr key={produto.id} style={{ background: index % 2 === 0 ? "#fff" : "#f1f5f9" }}>
                      <td style={{ padding: "13px 14px" }}>#{produto.id}</td>
                      <td style={{ padding: "13px 14px", fontWeight: "600" }}>{produto.nome}</td>
                      <td style={{ padding: "13px 14px" }}>{produto.categoria || "-"}</td>
                      <td style={{ padding: "13px 14px", textAlign: "center" }}><strong>{produto.estoque}</strong></td>
                      <td style={{ padding: "13px 14px", textAlign: "center" }}>{produto.estoque_minimo ?? 2}</td>
                      <td style={{ padding: "13px 14px" }}>
                        <span style={{ background: situacao.fundo, color: situacao.cor, padding: "5px 8px", borderRadius: "999px", fontSize: "11px", fontWeight: "700" }}>
                          {situacao.texto}
                        </span>
                      </td>
                      <td style={{ padding: "13px 14px", textAlign: "right" }}>{formatarMoeda(produto.preco_custo)}</td>
                      <td style={{ padding: "13px 14px", textAlign: "right", fontWeight: "700" }}>{formatarMoeda(produto.preco_venda)}</td>
                      <td style={{ padding: "13px 14px", minWidth: "390px" }}>
                        <button onClick={() => editarProduto(produto)} style={{ ...buttonStyle, margin: "2px" }}>Editar</button>
                        <button onClick={() => abrirMovimento(produto, "entrada")} style={{ ...buttonStyle, background: "#166534", margin: "2px" }}>Entrada</button>
                        <button onClick={() => abrirMovimento(produto, "ajuste")} style={{ ...buttonStyle, background: "#7c3aed", margin: "2px" }}>Ajustar</button>
                        <button onClick={() => abrirMovimento(produto, "historico")} style={{ ...buttonStyle, background: "#0369a1", margin: "2px" }}>Histórico</button>
                        <button onClick={() => removerProduto(produto.id)} style={{ ...buttonStyle, background: "#dc2626", margin: "2px" }}>Inativar</button>
                      </td>
                    </tr>
                  );
                })}

                {produtosFiltrados.length === 0 && (
                  <tr>
                    <td colSpan="9" align="center" style={{ padding: "20px" }}>
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

function Campo({ label, children }) {
  return (
    <div>
      <label style={{ display: "block", marginBottom: "6px", fontWeight: "600" }}>
        {label}
      </label>
      {children}
    </div>
  );
}
