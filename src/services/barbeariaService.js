import api from "./api";

export async function obterBarbearia() {
  const response = await api.get("/barbearia");
  return response.data;
}

export async function criarBarbearia(dados) {
  const response = await api.post("/barbearia", dados);
  return response.data;
}

export async function atualizarBarbearia(dados) {
  const response = await api.put("/barbearia", dados);
  return response.data;
}