import api from "./api";

export async function listarAgendamentos(filtros = {}) {
  const params = new URLSearchParams();

  if (filtros.data_agenda) {
    params.append("data_agenda", filtros.data_agenda);
  }

  if (filtros.barbeiro_id) {
    params.append("barbeiro_id", filtros.barbeiro_id);
  }

  const response = await api.get(`/agendamentos?${params.toString()}`);
  return response.data;
}

export async function criarAgendamento(dados) {
  const response = await api.post("/agendamentos", dados);
  return response.data;
}

export async function cancelarAgendamento(id) {
  const response = await api.put(`/agendamentos/${id}/cancelar`);
  return response.data;
}

export async function atualizarStatusAgendamento(id, status) {
  const response = await api.put(`/agendamentos/${id}/status`, { status });
  return response.data;
}

export async function reagendarAgendamento(id, nova_data_hora_inicio) {
  const response = await api.put(`/agendamentos/${id}/reagendar`, {
    nova_data_hora_inicio,
  });
  return response.data;
}

export async function converterAgendamentoEmComanda(id) {
  const response = await api.post(`/agendamentos/${id}/converter-comanda`);
  return response.data;
}