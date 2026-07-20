"use client";

import { useEffect, useMemo, useState } from "react";

import styles from "./dashboard.module.css";
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
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    carregarDashboard();
  }, []);

  async function carregarDashboard() {
    setCarregando(true);
    setErro("");

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
    } catch (error) {
      console.error("Erro Dashboard:", error);
      setErro("Não foi possível carregar os indicadores do Dashboard.");
    } finally {
      setCarregando(false);
    }
  }

  function formatarMoeda(valor) {
    return Number(valor || 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  const resumo = useMemo(() => {
    const clientesAtivos = clientes.filter((cliente) => cliente.ativo).length;
    const barbeirosAtivos = barbeiros.filter((barbeiro) => barbeiro.ativo).length;
    const comandasAbertas = comandas.filter(
      (comanda) => comanda.status === "aberta"
    ).length;
    const faturamento = caixa
      .filter((movimento) => movimento.tipo === "entrada")
      .reduce((soma, item) => soma + Number(item.valor || 0), 0);
    const produtosAtivos = produtos.filter(
      (produto) => produto.ativo !== false
    ).length;
    const produtosEstoqueBaixo = produtos.filter(
      (produto) => Number(produto.estoque || 0) <= 2
    ).length;
    const valorEstoque = produtos.reduce(
      (soma, produto) =>
        soma +
        Number(produto.preco_venda || 0) * Number(produto.estoque || 0),
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

  const indicadores = [
    ["Clientes Ativos", resumo.clientesAtivos],
    ["Barbeiros Ativos", resumo.barbeirosAtivos],
    ["Comandas Abertas", resumo.comandasAbertas],
    ["Faturamento", formatarMoeda(resumo.faturamento)],
    ["Produtos Ativos", resumo.produtosAtivos],
    ["Estoque Baixo", resumo.produtosEstoqueBaixo, true],
    ["Valor em Estoque", formatarMoeda(resumo.valorEstoque)],
  ];

  return (
    <section>
      <header className={styles.pageHeader}>
        <h1 className={styles.title}>Sistema de Gestão para Barbearia</h1>
        <p className={styles.subtitle}>Bem-vindo ao painel administrativo.</p>
      </header>

      {carregando && <div className={styles.status}>Carregando indicadores...</div>}
      {erro && <div className={`${styles.status} ${styles.error}`}>{erro}</div>}

      <div className={styles.grid} aria-busy={carregando}>
        {indicadores.map(([titulo, valor, alerta]) => (
          <article className={styles.card} key={titulo}>
            <h2 className={styles.cardTitle}>{titulo}</h2>
            <p className={`${styles.cardValue} ${alerta ? styles.danger : ""}`}>
              {valor}
            </p>
          </article>
        ))}
      </div>

      <section className={styles.summary}>
        <h2>Resumo Operacional</h2>
        <div className={styles.summaryGrid}>
          <p className={styles.summaryItem}>
            Total de clientes: <strong>{clientes.length}</strong>
          </p>
          <p className={styles.summaryItem}>
            Total de barbeiros: <strong>{barbeiros.length}</strong>
          </p>
          <p className={styles.summaryItem}>
            Total de comandas: <strong>{comandas.length}</strong>
          </p>
          <p className={styles.summaryItem}>
            Movimentações de caixa: <strong>{caixa.length}</strong>
          </p>
          <p className={styles.summaryItem}>
            Total de produtos: <strong>{produtos.length}</strong>
          </p>
        </div>
      </section>
    </section>
  );
}
