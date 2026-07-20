import api from "./api";


function baseUrl(barbeariaSlug) {
  if (!barbeariaSlug) {
    throw new Error("Slug da barbearia não informado.");
  }

  return `/agendamento-online/${encodeURIComponent(barbeariaSlug)}`;
}


export async function listarBarbeirosOnline(barbeariaSlug) {
  const response = await api.get(`${baseUrl(barbeariaSlug)}/barbeiros`);
  return response.data;
}


export async function listarServicosOnline(barbeariaSlug) {
  const response = await api.get(`${baseUrl(barbeariaSlug)}/servicos`);
  return response.data;
}


export async function listarHorariosDiaOnline(
  barbeariaSlug,
  servicoId,
  data
) {
  const params = new URLSearchParams();
  params.append("servico_id", servicoId);
  params.append("data", data);

  const response = await api.get(
    `${baseUrl(barbeariaSlug)}/horarios-dia?${params.toString()}`
  );
  return response.data;
}


export async function listarHorariosSemanaOnline(
  barbeariaSlug,
  barbeiroId,
  servicoId,
  dataInicio
) {
  const params = new URLSearchParams();
  params.append("barbeiro_id", barbeiroId);
  params.append("servico_id", servicoId);
  params.append("data_inicio", dataInicio);

  const response = await api.get(
    `${baseUrl(barbeariaSlug)}/horarios-semana?${params.toString()}`
  );
  return response.data;
}


export async function criarAgendamentoOnline(barbeariaSlug, dados) {
  const response = await api.post(baseUrl(barbeariaSlug), dados);
  return response.data;
}


export async function consultarAgendamentoOnline(
  barbeariaSlug,
  telefone
) {
  const params = new URLSearchParams();
  params.append("telefone", telefone);

  const response = await api.get(
    `${baseUrl(barbeariaSlug)}/consultar?${params.toString()}`
  );
  return response.data;
}


export async function cancelarAgendamentoOnline(
  barbeariaSlug,
  telefone,
  agendamentoId
) {
  const params = new URLSearchParams();
  params.append("telefone", telefone);
  params.append("agendamento_id", agendamentoId);

  const response = await api.put(
    `${baseUrl(barbeariaSlug)}/cancelar?${params.toString()}`
  );
  return response.data;
}
