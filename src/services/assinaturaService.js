import api from "./api";

export async function listarAssinaturas() {
  const response = await api.get("/planos/assinaturas");
  return response.data;
}

export async function criarAssinatura(dados) {
  const response = await api.post("/planos/assinaturas", dados);
  return response.data;
}

export async function buscarAssinaturasCliente(clienteId) {
  const response = await api.get(`/planos/cliente/${clienteId}`);
  return response.data;
}

export async function renovarAssinatura(id, dados) {
  const response = await api.put(`/planos/assinaturas/${id}/renovar`, dados);
  return response.data;
}

export async function suspenderAssinatura(id, dados) {
  const response = await api.put(`/planos/assinaturas/${id}/suspender`, dados);
  return response.data;
}

export async function reativarAssinatura(id, dados) {
  const response = await api.put(`/planos/assinaturas/${id}/reativar`, dados);
  return response.data;
}

export async function listarPagamentosAssinatura(id) {
  const response = await api.get(`/planos/assinaturas/${id}/pagamentos`);
  return response.data;
}

export async function atualizarAssinatura(id, dados) {
  const response = await api.put(
    `/planos/assinaturas/${id}`,
    dados
  );

  return response.data;
}