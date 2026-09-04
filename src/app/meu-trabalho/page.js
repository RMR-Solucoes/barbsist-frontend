"use client";

import { useEffect, useState } from "react";

import {
  listarMinhaAgenda,
} from "@/services/agendamentoService";

import {
  listarMinhasComandas,
} from "@/services/comandaService";

import {
  listarMinhasComissoes,
} from "@/services/comissaoService";

import {
  JsonBox,
  Painel,
} from "@/components/DataView";


function estadoInicial() {
  return {
    carregando: true,
    dados: null,
    erro: null,
  };
}


function extrairErro(erro) {
  return {
    status:
      erro?.response?.status ??
      null,

    detalhe:
      erro?.response?.data?.detail ??
      erro?.message ??
      "Erro ao consultar o backend.",
  };
}


export default function MeuTrabalhoPage() {
  const [agenda, setAgenda] =
    useState(estadoInicial());

  const [comandas, setComandas] =
    useState(estadoInicial());

  const [comissoes, setComissoes] =
    useState(estadoInicial());


  async function carregarAgenda() {
    setAgenda(estadoInicial());

    try {
      const dados =
        await listarMinhaAgenda();

      setAgenda({
        carregando: false,
        dados,
        erro: null,
      });
    } catch (erro) {
      setAgenda({
        carregando: false,
        dados: null,
        erro: extrairErro(erro),
      });
    }
  }


  async function carregarComandas() {
    setComandas(estadoInicial());

    try {
      const dados =
        await listarMinhasComandas();

      setComandas({
        carregando: false,
        dados,
        erro: null,
      });
    } catch (erro) {
      setComandas({
        carregando: false,
        dados: null,
        erro: extrairErro(erro),
      });
    }
  }


  async function carregarComissoes() {
    setComissoes(estadoInicial());

    try {
      const dados =
        await listarMinhasComissoes();

      setComissoes({
        carregando: false,
        dados,
        erro: null,
      });
    } catch (erro) {
      setComissoes({
        carregando: false,
        dados: null,
        erro: extrairErro(erro),
      });
    }
  }


  function carregarTudo() {
    carregarAgenda();
    carregarComandas();
    carregarComissoes();
  }


  useEffect(() => {
    carregarTudo();
  }, []);


  function exibir(estado) {
    if (estado.carregando) {
      return {
        carregando: true,
      };
    }

    if (estado.erro) {
      return {
        erro: true,
        status:
          estado.erro.status,
        detalhe:
          estado.erro.detalhe,
      };
    }

    if (
      Array.isArray(estado.dados) &&
      estado.dados.length === 0
    ) {
      return {
        mensagem:
          "Nenhum registro encontrado.",
        dados: [],
      };
    }

    return estado.dados;
  }


  return (
    <main
      style={{
        padding: 30,
        background: "#f8fafc",
        minHeight: "100vh",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 16,
          marginBottom: 18,
        }}
      >
        <div>
          <h1>Meu Trabalho</h1>

          <p
            style={{
              color: "#64748b",
            }}
          >
            Área pessoal para agenda,
            comandas e comissões do
            usuário/barbeiro autenticado.
          </p>
        </div>

        <button
          type="button"
          onClick={carregarTudo}
          style={{
            border: "1px solid #cbd5e1",
            borderRadius: 9,
            padding: "10px 16px",
            background: "#ffffff",
            cursor: "pointer",
            fontWeight: 700,
          }}
        >
          Atualizar
        </button>
      </div>


      <Painel titulo="Minha Agenda">
        <JsonBox
          dados={exibir(agenda)}
        />
      </Painel>


      <Painel titulo="Minhas Comandas">
        <JsonBox
          dados={exibir(comandas)}
        />
      </Painel>


      <Painel titulo="Minhas Comissões">
        <JsonBox
          dados={exibir(comissoes)}
        />
      </Painel>
    </main>
  );
}
