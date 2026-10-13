import api from "./api";

export async function buscarDashboard(params = {}) {
  const response = await api.get("/dashboard", { params });
  return response.data;
}
