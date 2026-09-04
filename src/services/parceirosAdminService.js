import api from "./api";

export async function listarParceiros(incluirInativos = true) {
  const resposta = await api.get("/admin/parceiros", {
    params: {
      incluir_inativos: incluirInativos,
    },
  });

  return resposta.data;
}

export async function obterParceiro(parceiroId) {
  const resposta = await api.get(
    `/admin/parceiros/${parceiroId}`
  );

  return resposta.data;
}

export async function criarParceiro(dados) {
  const resposta = await api.post(
    "/admin/parceiros",
    dados
  );

  return resposta.data;
}

export async function registrarIndicacao(
  parceiroId,
  barbeariaIndicadaId
) {
  const resposta = await api.post(
    `/admin/parceiros/${parceiroId}/indicacoes`,
    null,
    {
      params: {
        barbearia_indicada_id: barbeariaIndicadaId,
      },
    }
  );

  return resposta.data;
}

export async function listarIndicacoes(parceiroId) {
  const resposta = await api.get(
    `/admin/parceiros/${parceiroId}/indicacoes`
  );

  return resposta.data;
}

export async function listarComissoes(parceiroId) {
  const resposta = await api.get(
    `/admin/parceiros/${parceiroId}/comissoes`
  );

  return resposta.data;
}

export async function listarCreditos(parceiroId) {
  const resposta = await api.get(
    `/admin/parceiros/${parceiroId}/creditos`
  );

  return resposta.data;
}

export async function listarResgates(status = null) {
  const params = {};

  if (status) {
    params.status = status;
  }

  const resposta = await api.get(
    "/admin/parceiros/resgates",
    { params }
  );

  return resposta.data;
}

export async function aprovarResgate(resgateId) {
  const resposta = await api.post(
    `/admin/parceiros/resgates/${resgateId}/aprovar`
  );

  return resposta.data;
}

export async function aplicarResgate(
  resgateId,
  {
    assinaturaSaasId = null,
    pagamentoSaasId = null,
  } = {}
) {
  const params = {};

  if (assinaturaSaasId !== null) {
    params.assinatura_saas_id = assinaturaSaasId;
  }

  if (pagamentoSaasId !== null) {
    params.pagamento_saas_id = pagamentoSaasId;
  }

  const resposta = await api.post(
    `/admin/parceiros/resgates/${resgateId}/aplicar`,
    null,
    { params }
  );

  return resposta.data;
}

export async function processarBeneficioPagamento(
  pagamentoSaasId
) {
  const resposta = await api.post(
    `/admin/parceiros/processar-pagamento/${pagamentoSaasId}`
  );

  return resposta.data;
}