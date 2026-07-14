"use client";

import { useEffect, useMemo, useState } from "react";

import { listarClientes } from "@/services/clienteService";
import { listarBarbeiros } from "@/services/barbeiroService";
import { listarComandas } from "@/services/comandaService";
import { listarCaixa } from "@/services/caixaService";
import { listarProdutos } from "@/services/produtoService";

export default function Home() {
  const [clientes, setClientes] = useState([]);
  const [barbeiros, setBarbeiros] = useState([]);
  const [comandas, setComandas] = useState([]);
  const [caixa, setCaixa] = useState([]);
  const [produtos, setProdutos] = useState([]);

  useEffect(() => {
    carregarDashboard();
  }, []);

  async function carregarDashboard() {
    try {
      const [
        dadosClientes,
        dadosBarbeiros,
        dadosComandas,
        dadosCaixa,
        dadosProdutos,
      ] = await Promise.all([
        listarClientes(),
        listarBarbeiros(),
        listarComandas(),
        listarCaixa(),
        listarProdutos(),
      ]);

      setClientes(dadosClientes || []);
      setBarbeiros(dadosBarbeiros || []);
      setComandas(dadosComandas || []);
      setCaixa(dadosCaixa || []);
      setProdutos(dadosProdutos || []);
    } catch (erro) {
      console.error("Erro Dashboard:", erro);
    }
  }

  function formatarMoeda(valor) {
    return Number(valor || 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  const resumo = useMemo(() => {
    const clientesAtivos = clientes.filter((c) => c.ativo).length;
    const barbeirosAtivos = barbeiros.filter((b) => b.ativo).length;

    const comandasAbertas = comandas.filter(
      (c) => c.status === "aberta"
    ).length;

    const faturamento = caixa
      .filter((c) => c.tipo === "entrada")
      .reduce((soma, item) => soma + Number(item.valor || 0), 0);

    const produtosAtivos = produtos.filter((p) => p.ativo !== false).length;

    const produtosEstoqueBaixo = produtos.filter(
      (p) => Number(p.estoque || 0) <= 2
    ).length;

    const valorEstoque = produtos.reduce(
      (soma, p) =>
        soma + Number(p.preco_venda || 0) * Number(p.estoque || 0),
      0
    );

    return {
      clientesAtivos,
      barbeirosAtivos,
      comandasAbertas,
      faturamento,
      produtosAtivos,
      produtosEstoqueBaixo,
      valorEstoque,
    };
  }, [clientes, barbeiros, comandas, caixa, produtos]);

  const cardStyle = {
    background: "white",
    padding: "20px",
    borderRadius: "12px",
    minWidth: "220px",
    boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
  };

  return (
    <>
      <h1>Sistema de Gestão para Barbearia</h1>

      <p>Bem-vindo ao painel administrativo.</p>

      <div
        style={{
          display: "flex",
          gap: "20px",
          flexWrap: "wrap",
          marginTop: "30px",
        }}
      >
        <div style={cardStyle}>
          <h3>Clientes Ativos</h3>
          <h2>{resumo.clientesAtivos}</h2>
        </div>

        <div style={cardStyle}>
          <h3>Barbeiros Ativos</h3>
          <h2>{resumo.barbeirosAtivos}</h2>
        </div>

        <div style={cardStyle}>
          <h3>Comandas Abertas</h3>
          <h2>{resumo.comandasAbertas}</h2>
        </div>

        <div style={cardStyle}>
          <h3>Faturamento</h3>
          <h2>{formatarMoeda(resumo.faturamento)}</h2>
        </div>

        <div style={cardStyle}>
          <h3>Produtos Ativos</h3>
          <h2>{resumo.produtosAtivos}</h2>
        </div>

        <div style={cardStyle}>
          <h3>Estoque Baixo</h3>
          <h2 style={{ color: "#dc2626" }}>
            {resumo.produtosEstoqueBaixo}
          </h2>
        </div>

        <div style={cardStyle}>
          <h3>Valor em Estoque</h3>
          <h2>{formatarMoeda(resumo.valorEstoque)}</h2>
        </div>
      </div>

      <div
        style={{
          marginTop: "30px",
          background: "white",
          padding: "20px",
          borderRadius: "12px",
          boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
        }}
      >
        <h2>Resumo Operacional</h2>

        <p>
          Total de clientes:
          <strong> {clientes.length}</strong>
        </p>

        <p>
          Total de barbeiros:
          <strong> {barbeiros.length}</strong>
        </p>

        <p>
          Total de comandas:
          <strong> {comandas.length}</strong>
        </p>

        <p>
          Movimentações de caixa:
          <strong> {caixa.length}</strong>
        </p>

        <p>
          Total de produtos:
          <strong> {produtos.length}</strong>
        </p>
      </div>
    </>
  );
}