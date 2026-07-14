import api from "./api";

export async function listarDisponibilidadeBarbeiro(barbeiroId) {
  const response = await api.get(`/barbeiro-disponibilidade/${barbeiroId}`);
  return response.data;
}

export async function atualizarDisponibilidadeBarbeiro(id, dados) {
  const response = await api.put(`/barbeiro-disponibilidade/${id}`, dados);
  return response.data;
}