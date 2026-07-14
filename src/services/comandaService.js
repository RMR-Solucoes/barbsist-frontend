import api from "./api";

export async function listarComandas() {
  const response = await api.get("/comandas");
  return response.data;
}

export async function buscarComanda(id) {
  const response = await api.get(`/comandas/${id}`);
  return response.data;
}

export async function listarItensComanda(id) {
  const response = await api.get(`/comandas/${id}/itens`);
  return response.data;
}

export async function adicionarServicoComanda(id, dados) {
  const response = await api.post(
    `/comandas/${id}/servicos`,
    dados
  );

  return response.data;
}

export async function adicionarProdutoComanda(id, dados) {
  const response = await api.post(
    `/comandas/${id}/produtos`,
    dados
  );

  return response.data;
}

export async function consultarAssinaturaComanda(id) {
  const response = await api.get(
    `/comandas/${id}/assinatura`
  );

  return response.data;
}

export async function usarPlanoNoItem(
  comandaId,
  itemId,
  assinaturaId
) {
  const response = await api.post(
    `/comandas/${comandaId}/itens/${itemId}/usar-plano`,
    {
      assinatura_id: assinaturaId,
    }
  );

  return response.data;
}

export async function fecharComanda(id, dados) {
  const response = await api.put(
    `/comandas/${id}/fechar`,
    dados
  );

  return response.data;
}