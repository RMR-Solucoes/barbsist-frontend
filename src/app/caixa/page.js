"use client";

import { useEffect, useMemo, useState } from "react";
import {
  listarCaixa,
  criarMovimentacaoCaixa,
} from "@/services/caixaService";

const movimentacaoInicial = {
  tipo: "entrada",
  descricao: "",
  valor: "",
  forma_pagamento: "pix",
};

export default function CaixaPage() {
  const [movimentacoes, setMovimentacoes] = useState([]);
  const [form, setForm] = useState(movimentacaoInicial);
  const [busca, setBusca] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    carregarCaixa();
  }, []);

  async function carregarCaixa() {
    try {
      setErro("");
      setCarregando(true);

      const dados = await listarCaixa();
      setMovimentacoes(dados || []);
    } catch (error) {
      console.error(error);
      setErro("Erro ao carregar movimentações do caixa.");
    } finally {
      setCarregando(false);
    }
  }

  function alterarCampo(campo, valor) {
    setForm((atual) => ({
      ...atual,
      [campo]: campo === "descricao" ? valor.toUpperCase() : valor,
    }));
  }

  function limparFormulario() {
    setForm(movimentacaoInicial);
  }

  async function salvarMovimentacao(e) {
    e.preventDefault();
    setMensagem("");
    setErro("");

    if (!form.descricao.trim()) {
      setErro("Informe a descrição da movimentação.");
      return;
    }

    if (!form.valor || Number(form.valor) <= 0) {
      setErro("Informe um valor maior que zero.");
      return;
    }

    const dados = {
      tipo: form.tipo,
      descricao: form.descricao.trim(),
      valor: Number(form.valor),
      forma_pagamento: form.forma_pagamento || null,
    };

    try {
      await criarMovimentacaoCaixa(dados);

      setMensagem("Movimentação registrada com sucesso.");
      limparFormulario();
      await carregarCaixa();
    } catch (error) {
      console.error(error);

      const detalhe =
        error?.response?.data?.detail ||
        "Erro ao registrar movimentação no caixa.";

      setErro(detalhe);
    }
  }

  function formatarMoeda(valor) {
    return Number(valor || 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  function formatarData(data) {
    if (!data) return "-";

    return new Date(data).toLocaleString("pt-BR", {
      dateStyle: "short",
      timeStyle: "short",
    });
  }

  const movimentacoesFiltradas = useMemo(() => {
    const termo = busca.toLowerCase().trim();

    if (!termo) return movimentacoes;

    return movimentacoes.filter((item) => {
      return (
        item.tipo?.toLowerCase().includes(termo) ||
        item.descricao?.toLowerCase().includes(termo) ||
        item.forma_pagamento?.toLowerCase().includes(termo)
      );
    });
  }, [movimentacoes, busca]);

  const resumo = useMemo(() => {
    const entradas = movimentacoes.reduce((soma, item) => {
      if (item.tipo === "entrada") return soma + Number(item.valor || 0);
      return soma;
    }, 0);

    const saidas = movimentacoes.reduce((soma, item) => {
      if (item.tipo === "saida") return soma + Number(item.valor || 0);
      return soma;
    }, 0);

    return {
      entradas,
      saidas,
      saldo: entradas - saidas,
      totalMovimentacoes: movimentacoes.length,
    };
  }, [movimentacoes]);

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
      <h1>Caixa</h1>

      <p style={{ color: "#4b5563", marginBottom: "25px" }}>
        Controle de entradas, saídas e saldo operacional.
      </p>

      {mensagem && (
        <div
          style={{
            background: "#dcfce7",
            color: "#166534",
            padding: "12px",
            marginBottom: "15px",
            borderRadius: "8px",
          }}
        >
          {mensagem}
        </div>
      )}

      {erro && (
        <div
          style={{
            background: "#fee2e2",
            color: "#991b1b",
            padding: "12px",
            marginBottom: "15px",
            borderRadius: "8px",
          }}
        >
          {erro}
        </div>
      )}

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "15px",
          marginBottom: "25px",
        }}
      >
        <div style={cardStyle}>
          <h2>{formatarMoeda(resumo.entradas)}</h2>
          <p>Entradas</p>
        </div>

        <div style={cardStyle}>
          <h2>{formatarMoeda(resumo.saidas)}</h2>
          <p>Saídas</p>
        </div>

        <div style={cardStyle}>
          <h2
            style={{
              color: resumo.saldo >= 0 ? "#166534" : "#dc2626",
            }}
          >
            {formatarMoeda(resumo.saldo)}
          </h2>
          <p>Saldo atual</p>
        </div>

        <div style={cardStyle}>
          <h2>{resumo.totalMovimentacoes}</h2>
          <p>Movimentações</p>
        </div>
      </section>

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "380px 1fr",
          gap: "20px",
          alignItems: "start",
        }}
      >
        <form onSubmit={salvarMovimentacao} style={cardStyle}>
          <h2>Nova Movimentação</h2>

          <label>Tipo</label>
          <select
            value={form.tipo}
            onChange={(e) => alterarCampo("tipo", e.target.value)}
            style={inputStyle}
          >
            <option value="entrada">Entrada</option>
            <option value="saida">Saída</option>
          </select>

          <br />
          <br />

          <label>Descrição</label>
          <input
            value={form.descricao}
            onChange={(e) => alterarCampo("descricao", e.target.value)}
            placeholder="EX: COMPRA DE TOALHAS"
            style={inputStyle}
          />

          <br />
          <br />

          <label>Valor</label>
          <input
            type="number"
            step="0.01"
            value={form.valor}
            onChange={(e) => alterarCampo("valor", e.target.value)}
            style={inputStyle}
          />

          <br />
          <br />

          <label>Forma de pagamento</label>
          <select
            value={form.forma_pagamento}
            onChange={(e) => alterarCampo("forma_pagamento", e.target.value)}
            style={inputStyle}
          >
            <option value="pix">Pix</option>
            <option value="dinheiro">Dinheiro</option>
            <option value="debito">Débito</option>
            <option value="credito">Crédito</option>
            <option value="transferencia">Transferência</option>
            <option value="outro">Outro</option>
          </select>

          <br />
          <br />

          <button type="submit" style={buttonStyle}>
            Registrar Movimentação
          </button>
        </form>

        <div style={cardStyle}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: "15px",
              marginBottom: "15px",
              alignItems: "center",
            }}
          >
            <h2>Movimentações do Caixa</h2>

            <div style={{ display: "flex", gap: "10px" }}>
              <input
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Pesquisar..."
                style={{ ...inputStyle, width: "240px" }}
              />

              <button onClick={carregarCaixa} style={buttonStyle}>
                {carregando ? "Carregando..." : "Atualizar"}
              </button>
            </div>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table width="100%" cellPadding="10" style={{ borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f3f4f6", textAlign: "left" }}>
                  <th>ID</th>
                  <th>Data</th>
                  <th>Tipo</th>
                  <th>Descrição</th>
                  <th>Forma</th>
                  <th>Valor</th>
                </tr>
              </thead>

              <tbody>
                {movimentacoesFiltradas.map((item) => (
                  <tr key={item.id} style={{ borderBottom: "1px solid #e5e7eb" }}>
                    <td>#{item.id}</td>
                    <td>{formatarData(item.data)}</td>
                    <td>
                      <span
                        style={{
                          padding: "5px 8px",
                          borderRadius: "999px",
                          fontSize: "12px",
                          fontWeight: "700",
                          background:
                            item.tipo === "entrada" ? "#dcfce7" : "#fee2e2",
                          color:
                            item.tipo === "entrada" ? "#166534" : "#991b1b",
                        }}
                      >
                        {item.tipo?.toUpperCase()}
                      </span>
                    </td>
                    <td>{item.descricao}</td>
                    <td>{item.forma_pagamento || "-"}</td>
                    <td
                      style={{
                        fontWeight: "700",
                        color: item.tipo === "entrada" ? "#166534" : "#dc2626",
                      }}
                    >
                      {item.tipo === "entrada" ? "+" : "-"}{" "}
                      {formatarMoeda(item.valor)}
                    </td>
                  </tr>
                ))}

                {movimentacoesFiltradas.length === 0 && (
                  <tr>
                    <td colSpan="6" align="center" style={{ padding: "20px" }}>
                      Nenhuma movimentação encontrada.
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