"use client";

import { useEffect, useMemo, useState } from "react";
import { listarComissoes } from "@/services/comissaoService";
import { listarBarbeiros } from "@/services/barbeiroService";

export default function ComissoesPage() {
  const [comissoes, setComissoes] = useState([]);
  const [barbeiros, setBarbeiros] = useState([]);
  const [busca, setBusca] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    carregarDados();
  }, []);

  async function carregarDados() {
    try {
      setErro("");
      setCarregando(true);

      const [dadosComissoes, dadosBarbeiros] = await Promise.all([
        listarComissoes(),
        listarBarbeiros(),
      ]);

      setComissoes(dadosComissoes || []);
      setBarbeiros(dadosBarbeiros || []);
    } catch (error) {
      console.error(error);
      setErro("Erro ao carregar comissões.");
    } finally {
      setCarregando(false);
    }
  }

  function nomeBarbeiro(id) {
    const barbeiro = barbeiros.find((b) => Number(b.id) === Number(id));
    return barbeiro?.nome || `Barbeiro #${id}`;
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

  const comissoesFiltradas = useMemo(() => {
    const termo = busca.toLowerCase().trim();

    if (!termo) return comissoes;

    return comissoes.filter((item) => {
      const barbeiro = nomeBarbeiro(item.barbeiro_id).toLowerCase();

      return (
        barbeiro.includes(termo) ||
        String(item.comanda_id).includes(termo) ||
        String(item.barbeiro_id).includes(termo)
      );
    });
  }, [comissoes, barbeiros, busca]);

  const resumo = useMemo(() => {
    const totalComissoes = comissoes.reduce(
      (soma, item) => soma + Number(item.valor_comissao || 0),
      0
    );

    const totalServicos = comissoes.reduce(
      (soma, item) => soma + Number(item.valor_servico || 0),
      0
    );

    return {
      quantidade: comissoes.length,
      totalComissoes,
      totalServicos,
    };
  }, [comissoes]);

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
      <h1>Comissões</h1>

      <p style={{ color: "#4b5563", marginBottom: "25px" }}>
        Controle de comissões geradas a partir das comandas fechadas.
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
          <h2>{resumo.quantidade}</h2>
          <p>Comissões geradas</p>
        </div>

        <div style={cardStyle}>
          <h2>{formatarMoeda(resumo.totalServicos)}</h2>
          <p>Total em serviços</p>
        </div>

        <div style={cardStyle}>
          <h2>{formatarMoeda(resumo.totalComissoes)}</h2>
          <p>Total de comissões</p>
        </div>
      </section>

      <section style={cardStyle}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: "15px",
            marginBottom: "15px",
            alignItems: "center",
          }}
        >
          <h2>Lista de Comissões</h2>

          <div style={{ display: "flex", gap: "10px" }}>
            <input
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Pesquisar barbeiro ou comanda..."
              style={{ ...inputStyle, width: "280px" }}
            />

            <button onClick={carregarDados} style={buttonStyle}>
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
                <th>Barbeiro</th>
                <th>Comanda</th>
                <th>Valor Serviço</th>
                <th>%</th>
                <th>Comissão</th>
              </tr>
            </thead>

            <tbody>
              {comissoesFiltradas.map((item) => (
                <tr key={item.id} style={{ borderBottom: "1px solid #e5e7eb" }}>
                  <td>#{item.id}</td>
                  <td>{formatarData(item.data)}</td>
                  <td>{nomeBarbeiro(item.barbeiro_id)}</td>
                  <td>Comanda #{item.comanda_id}</td>
                  <td>{formatarMoeda(item.valor_servico)}</td>
                  <td>{Number(item.percentual || 0)}%</td>
                  <td style={{ fontWeight: "700", color: "#166534" }}>
                    {formatarMoeda(item.valor_comissao)}
                  </td>
                </tr>
              ))}

              {comissoesFiltradas.length === 0 && (
                <tr>
                  <td colSpan="7" align="center" style={{ padding: "20px" }}>
                    Nenhuma comissão encontrada.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}