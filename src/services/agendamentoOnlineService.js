import api from "./api";

export async function listarBarbeirosOnline() {
  const response = await api.get("/agendamento-online/barbeiros");
  return response.data;
}

export async function listarServicosOnline() {
  const response = await api.get("/agendamento-online/servicos");
  return response.data;
}

export async function listarHorariosDiaOnline(servicoId, data) {
  const params = new URLSearchParams();

  params.append("servico_id", servicoId);
  params.append("data", data);

  const response = await api.get(
    `/agendamento-online/horarios-dia?${params.toString()}`
  );

  return response.data;
}

export async function listarHorariosSemanaOnline(
  barbeiroId,
  servicoId,
  dataInicio
) {
  const params = new URLSearchParams();

  params.append("barbeiro_id", barbeiroId);
  params.append("servico_id", servicoId);
  params.append("data_inicio", dataInicio);

  const response = await api.get(
    `/agendamento-online/horarios-semana?${params.toString()}`
  );

  return response.data;
}

export async function criarAgendamentoOnline(dados) {
  const response = await api.post("/agendamento-online", dados);
  return response.data;
}

export async function consultarAgendamentoOnline(telefone) {
  const params = new URLSearchParams();

  params.append("telefone", telefone);

  const response = await api.get(
    `/agendamento-online/consultar?${params.toString()}`
  );

  return response.data;
}

export async function cancelarAgendamentoOnline(telefone, agendamentoId) {
  const params = new URLSearchParams();

  params.append("telefone", telefone);
  params.append("agendamento_id", agendamentoId);

  const response = await api.put(
    `/agendamento-online/cancelar?${params.toString()}`
  );

  return response.data;
}