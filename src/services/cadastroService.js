import api from "./api";

export async function cadastrarBarbearia(dados) {
  const response = await api.post(
    "/auth/cadastrar-barbearia",
    dados
  );

  return response.data;
}