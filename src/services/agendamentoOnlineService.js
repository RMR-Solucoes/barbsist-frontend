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


// BARBSIST_MULTI_SERVICE_M4_API_CLIENT
function adicionarServicosNosParametros(params, servicosIds) {
  if (Array.isArray(servicosIds)) {
    const ids = servicosIds
      .map((id) => Number(id))
      .filter((id) => Number.isInteger(id) && id > 0);

    if (ids.length) {
      params.append("servicos_ids", ids.join(","));
    }

    return;
  }

  if (servicosIds !== null && servicosIds !== undefined && servicosIds !== "") {
    params.append("servico_id", servicosIds);
  }
}


export async function listarHorariosDiaOnline(
  barbeariaSlug,
  servicosIds,
  data
) {
  const params = new URLSearchParams();
  adicionarServicosNosParametros(params, servicosIds);
  params.append("data", data);

  const response = await api.get(
    `${baseUrl(barbeariaSlug)}/horarios-dia?${params.toString()}`
  );
  return response.data;
}


export async function listarHorariosSemanaOnline(
  barbeariaSlug,
  barbeiroId,
  servicosIds,
  dataInicio
) {
  const params = new URLSearchParams();
  params.append("barbeiro_id", barbeiroId);
  adicionarServicosNosParametros(params, servicosIds);
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
