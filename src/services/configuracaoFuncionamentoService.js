import api from "./api";

export async function listarConfiguracoesFuncionamento() {
  const response = await api.get("/configuracao-funcionamento");
  return response.data;
}

export async function atualizarConfiguracaoFuncionamento(id, dados) {
  const response = await api.put(
    `/configuracao-funcionamento/${id}`,
    dados
  );

  return response.data;
}