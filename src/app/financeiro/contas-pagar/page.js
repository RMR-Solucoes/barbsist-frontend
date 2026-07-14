"use client";

import { useEffect, useState } from "react";
import api from "@/services/api";

export default function ContasPagarPage() {
  const [contas, setContas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");

  useEffect(() => {
    carregarContas();
  }, []);

  async function carregarContas() {
    try {
      setCarregando(true);

      const response = await api.get("/contas-pagar");

      setContas(response.data || []);
      setErro("");
    } catch (error) {
      console.error(error);
      setErro("Erro ao carregar contas a pagar.");
    } finally {
      setCarregando(false);
    }
  }

  async function pagarConta(id) {
    const confirmar = window.confirm("Confirmar pagamento desta conta?");

    if (!confirmar) return;

    try {
      await api.put(`/contas-pagar/${id}/pagar?forma_pagamento=PIX`);

      setMensagem("Conta paga com sucesso.");
      carregarContas();
    } catch (error) {
      console.error(error);
      setErro("Erro ao pagar conta.");
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

    return new Date(`${data}T00:00:00`).toLocaleDateString("pt-BR");
  }

  const cardStyle = {
    border: "1px solid #d1d5db",
    borderRadius: "12px",
    padding: "20px",
    background: "#fff",
  };

  return (
    <main style={{ padding: "30px" }}>
      <h1>Contas a Pagar</h1>

      <p style={{ color: "#6b7280" }}>
        Controle financeiro das despesas e obrigações da barbearia.
      </p>

      {mensagem && (
        <div
          style={{
            background: "#dcfce7",
            padding: "12px",
            borderRadius: "8px",
            marginBottom: "15px",
          }}
        >
          {mensagem}
        </div>
      )}

      {erro && (
        <div
          style={{
            background: "#fee2e2",
            padding: "12px",
            borderRadius: "8px",
            marginBottom: "15px",
          }}
        >
          {erro}
        </div>
      )}

      <section style={cardStyle}>
        {carregando ? (
          <p>Carregando...</p>
        ) : contas.length === 0 ? (
          <p>Nenhuma conta encontrada.</p>
        ) : (
          <table
            width="100%"
            cellPadding="10"
            style={{ borderCollapse: "collapse" }}
          >
            <thead>
              <tr style={{ background: "#f3f4f6" }}>
                <th>ID</th>
                <th>Descrição</th>
                <th>Fornecedor</th>
                <th>Valor</th>
                <th>Vencimento</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>

            <tbody>
              {contas.map((conta) => (
                <tr
                  key={conta.id}
                  style={{ borderBottom: "1px solid #e5e7eb" }}
                >
                  <td>{conta.id}</td>
                  <td>{conta.descricao}</td>
                  <td>{conta.fornecedor || "-"}</td>
                  <td>{formatarMoeda(conta.valor)}</td>
                  <td>{formatarData(conta.vencimento)}</td>

                  <td>
                    <span
                      style={{
                        padding: "5px 10px",
                        borderRadius: "20px",
                        fontWeight: "bold",
                        background:
                          conta.status === "PAGA" ? "#dcfce7" : "#fef3c7",
                        color:
                          conta.status === "PAGA" ? "#166534" : "#92400e",
                      }}
                    >
                      {conta.status}
                    </span>
                  </td>

                  <td>
                    {conta.status === "PENDENTE" ? (
                      <button
                        onClick={() => pagarConta(conta.id)}
                        style={{
                          background: "#dc2626",
                          color: "#fff",
                          border: "none",
                          padding: "8px 12px",
                          borderRadius: "6px",
                          cursor: "pointer",
                        }}
                      >
                        Pagar
                      </button>
                    ) : (
                      <span style={{ color: "#166534", fontWeight: "bold" }}>
                        Paga
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </main>
  );
}