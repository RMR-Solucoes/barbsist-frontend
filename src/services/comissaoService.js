import api from "./api";

export async function listarComissoes() {
  const response = await api.get("/comissoes");
  return response.data;
}