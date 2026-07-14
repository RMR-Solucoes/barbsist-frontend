"use client";

import { useEffect, useState } from "react";
import api from "@/services/api";
import { obterBarbearia } from "@/services/barbeariaService";

export default function AgendamentoOnlinePage() {
  const [nomeCliente, setNomeCliente] = useState("");
  const [telefoneCliente, setTelefoneCliente] = useState("");
  const [barbearia, setBarbearia] = useState(null);

  const [servicos, setServicos] = useState([]);
  const [servicoId, setServicoId] = useState("");

  const [dataAgenda, setDataAgenda] = useState("");
  const [horarios, setHorarios] = useState([]);

  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");
  

  useEffect(() => {
    carregarDadosIniciais();
    carregarBarbearia();
  }, []);

  async function carregarBarbearia() {
  try {
    const dados = await obterBarbearia();
    setBarbearia(dados);
  } catch (error) {
    console.error(error);
    setBarbearia(null);
  }
}

  async function carregarServicos() {
    try {
      const response = await api.get("/agendamento-online/servicos");
      setServicos(response.data);
    } catch (error) {
      console.error(error);
    }
  }

  async function buscarHorarios() {
    setMensagem("");
    setErro("");

    if (!servicoId || !dataAgenda) {
      setErro("Selecione serviço e data.");
      return;
    }

    try {
      const response = await api.get(
        `/agendamento-online/horarios-dia?servico_id=${servicoId}&data=${dataAgenda}`
      );

      setHorarios(response.data);
    } catch (error) {
      console.error(error);
      setErro("Erro ao carregar horários.");
    }
  }

  async function agendar(horario) {
    setMensagem("");
    setErro("");

    if (!nomeCliente.trim()) {
      setErro("Informe seu nome.");
      return;
    }

    if (!telefoneCliente.trim()) {
      setErro("Informe seu telefone.");
      return;
    }

    try {
      await api.post("/agendamento-online", {
        nome_cliente: nomeCliente,
        telefone_cliente: telefoneCliente,
        barbeiro_id: horario.barbeiro_id,
        servico_id: Number(servicoId),
        data_hora_inicio: horario.data_hora_inicio,
        tipo_atendimento: "avulso",
        observacoes: ""
      });

      setMensagem(
        `Agendamento realizado com sucesso para ${horario.horario}.`
      );

      buscarHorarios();
    } catch (error) {
      console.error(error);

      setErro(
        error?.response?.data?.detail ||
          "Não foi possível concluir o agendamento."
      );
    }
  }

  return (
    <div style={{ maxWidth: "900px", margin: "30px auto", padding: "20px" }}>
      <h1>Agendamento Online</h1>

      <div style={{ display: "grid", gap: "12px", marginTop: "20px" }}>
        <input
          type="text"
          placeholder="Nome"
          value={nomeCliente}
          onChange={(e) => setNomeCliente(e.target.value)}
        />

        <input
          type="text"
          placeholder="Telefone"
          value={telefoneCliente}
          onChange={(e) => setTelefoneCliente(e.target.value)}
        />

        <select
          value={servicoId}
          onChange={(e) => setServicoId(e.target.value)}
        >
          <option value="">Selecione um serviço</option>

          {servicos.map((servico) => (
            <option key={servico.id} value={servico.id}>
              {servico.nome} - R$ {servico.preco}
            </option>
          ))}
        </select>

        <input
          type="date"
          value={dataAgenda}
          onChange={(e) => setDataAgenda(e.target.value)}
        />

        <button onClick={buscarHorarios}>
          Buscar Horários
        </button>
      </div>

      {mensagem && (
        <div
          style={{
            marginTop: "20px",
            padding: "10px",
            background: "#d4edda",
            color: "#155724",
            borderRadius: "8px"
          }}
        >
          {mensagem}
        </div>
      )}

      {erro && (
        <div
          style={{
            marginTop: "20px",
            padding: "10px",
            background: "#f8d7da",
            color: "#721c24",
            borderRadius: "8px"
          }}
        >
          {erro}
        </div>
      )}

      <div style={{ marginTop: "30px" }}>
        <h2>Horários Disponíveis</h2>

        {horarios.length === 0 && (
          <p>Nenhum horário encontrado.</p>
        )}

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "10px"
          }}
        >
          {horarios.map((horario, index) => (
            <button
              key={index}
              onClick={() => agendar(horario)}
              style={{
                padding: "12px",
                borderRadius: "10px",
                border: "1px solid #ddd",
                cursor: "pointer"
              }}
            >
              <div>
                <strong>{horario.horario}</strong>
              </div>

              <div>{horario.barbeiro_nome}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}