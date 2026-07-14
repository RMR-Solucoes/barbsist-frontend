"use client";

import { useEffect, useState } from "react";
import api from "@/services/api";
import { listarClientes } from "@/services/clienteService";

export default function ContasReceberPage() {
  const [contas, setContas] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");

  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  const [novaConta, setNovaConta] = useState({
    descricao: "",
    cliente_id: "",
    valor: "",
    vencimento: "",
    forma_pagamento: "",
    observacoes: "",
  });

  useEffect(() => {
    carregarContas();
    carregarClientes();
  }, []);

  async function carregarContas() {
    try {
      setCarregando(true);

      const response = await api.get("/contas-receber");

      setContas(response.data || []);
      setErro("");
    } catch (error) {
      console.error(error);
      setErro("Erro ao carregar contas a receber.");
    } finally {
      setCarregando(false);
    }
  }
  
  async function carregarClientes() {
    try {
        const dados = await listarClientes();

        setClientes(
        dados.filter(
            (cliente) => cliente.ativo !== false
        )
        );
    } catch (error) {
        console.error(error);
    }
  }

  async function receberConta(id) {
    const confirmar = window.confirm(
      "Confirmar recebimento desta conta?"
    );

    if (!confirmar) return;

    try {
      await api.put(
        `/contas-receber/${id}/receber?forma_pagamento=PIX`
      );

      setMensagem("Conta recebida com sucesso.");

      carregarContas();
    } catch (error) {
      console.error(error);
      setErro("Erro ao receber conta.");
    }
  }

  async function salvarConta(e) {
  e.preventDefault();

  try {
    await api.post("/contas-receber", {
      descricao: novaConta.descricao,
      cliente_id: novaConta.cliente_id
        ? Number(novaConta.cliente_id)
        : null,
      valor: Number(novaConta.valor),
      vencimento: novaConta.vencimento,
      forma_pagamento: novaConta.forma_pagamento,
      observacoes: novaConta.observacoes,
    });

    setMensagem("Conta cadastrada com sucesso.");

    setNovaConta({
      descricao: "",
      cliente_id: "",
      valor: "",
      vencimento: "",
      forma_pagamento: "",
      observacoes: "",
    });

    setMostrarFormulario(false);

    carregarContas();
  } catch (error) {
    console.error(error);
    setErro("Erro ao cadastrar conta.");
  }
}

  function formatarMoeda(valor) {
    return Number(valor || 0).toLocaleString(
      "pt-BR",
      {
        style: "currency",
        currency: "BRL",
      }
    );
  }
  
  const inputStyle = {
    width: "100%",
    padding: "10px",
    marginBottom: "12px",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
  };

  const cardStyle = {
    border: "1px solid #d1d5db",
    borderRadius: "12px",
    padding: "20px",
    background: "#fff",
  };

  return (
    <main style={{ padding: "30px" }}>
      <h1>Contas a Receber</h1>

      <p style={{ color: "#6b7280" }}>
        Controle financeiro das receitas previstas.
      </p>

      <button
        onClick={() =>
            setMostrarFormulario(!mostrarFormulario)
        }
        style={{
            background: "#2563eb",
            color: "#fff",
            border: "none",
            padding: "10px 16px",
            borderRadius: "8px",
            cursor: "pointer",
            marginBottom: "20px",
        }}
        >
        ➕ Nova Conta
      </button>

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
      
      {mostrarFormulario && (
        <form
            onSubmit={salvarConta}
            style={{
            background: "#fff",
            padding: "20px",
            borderRadius: "12px",
            border: "1px solid #d1d5db",
            marginBottom: "20px",
            }}
        >
            <h3>Nova Conta a Receber</h3>

            <input
            type="text"
            placeholder="Descrição"
            value={novaConta.descricao}
            onChange={(e) =>
                setNovaConta({
                ...novaConta,
                descricao: e.target.value,
                })
            }
            style={inputStyle}
            required
            />

            <select
                value={novaConta.cliente_id}
                onChange={(e) =>
                    setNovaConta({
                    ...novaConta,
                    cliente_id: e.target.value,
                    })
                }
                style={inputStyle}
                >
                <option value="">
                    Selecione um cliente
                </option>

                {clientes.map((cliente) => (
                    <option
                    key={cliente.id}
                    value={cliente.id}
                    >
                    {cliente.nome}
                    </option>
                ))}
            </select>

            <input
            type="number"
            step="0.01"
            placeholder="Valor"
            value={novaConta.valor}
            onChange={(e) =>
                setNovaConta({
                ...novaConta,
                valor: e.target.value,
                })
            }
            style={inputStyle}
            required
            />

            <input
            type="date"
            value={novaConta.vencimento}
            onChange={(e) =>
                setNovaConta({
                ...novaConta,
                vencimento: e.target.value,
                })
            }
            style={inputStyle}
            required
            />

            <input
            type="text"
            placeholder="Forma de pagamento"
            value={novaConta.forma_pagamento}
            onChange={(e) =>
                setNovaConta({
                ...novaConta,
                forma_pagamento: e.target.value,
                })
            }
            style={inputStyle}
            />

            <textarea
            placeholder="Observações"
            value={novaConta.observacoes}
            onChange={(e) =>
                setNovaConta({
                ...novaConta,
                observacoes: e.target.value,
                })
            }
            style={{
                ...inputStyle,
                minHeight: "80px",
            }}
            />

            <button
            type="submit"
            style={{
                background: "#16a34a",
                color: "#fff",
                border: "none",
                padding: "10px 16px",
                borderRadius: "8px",
                cursor: "pointer",
            }}
            >
            Salvar Conta
            </button>
        </form>
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
            style={{
              borderCollapse: "collapse",
            }}
          >
            <thead>
              <tr
                style={{
                  background: "#f3f4f6",
                }}
              >
                <th>ID</th>
                <th>Descrição</th>
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
                  style={{
                    borderBottom: "1px solid #e5e7eb",
                  }}
                >
                  <td>{conta.id}</td>

                  <td>{conta.descricao}</td>

                  <td>
                    {formatarMoeda(conta.valor)}
                  </td>

                  <td>
                    {new Date(
                      conta.vencimento
                    ).toLocaleDateString("pt-BR")}
                  </td>

                  <td>
                    <span
                      style={{
                        padding: "5px 10px",
                        borderRadius: "20px",
                        fontWeight: "bold",
                        background:
                          conta.status === "RECEBIDA"
                            ? "#dcfce7"
                            : "#fef3c7",
                        color:
                          conta.status === "RECEBIDA"
                            ? "#166534"
                            : "#92400e",
                      }}
                    >
                      {conta.status}
                    </span>
                  </td>

                  <td>
                    {conta.status === "PENDENTE" ? (
                      <button
                        onClick={() =>
                          receberConta(conta.id)
                        }
                        style={{
                          background: "#16a34a",
                          color: "#fff",
                          border: "none",
                          padding: "8px 12px",
                          borderRadius: "6px",
                          cursor: "pointer",
                        }}
                      >
                        Receber
                      </button>
                    ) : (
                      <span
                        style={{
                          color: "#166534",
                          fontWeight: "bold",
                        }}
                      >
                        Recebida
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