import api from "./api";

/*
|--------------------------------------------------------------------------
| CLIENTES SERVICE
|--------------------------------------------------------------------------
*/

export async function listarClientes() {
  try {
    const response = await api.get("/clientes");

    return response.data;
  } catch (error) {
    console.error("Erro ao listar clientes:", error);
    throw error;
  }
}


export async function listarClientesComAssinaturas() {
  try {
    const response = await api.get(
      "/clientes/com-assinaturas"
    );

    return response.data;
  } catch (error) {
    console.error(
      "Erro ao listar clientes com assinaturas:",
      error
    );

    throw error;
  }
}


export async function criarCliente(dados) {
  try {
    const response = await api.post(
      "/clientes",
      dados
    );

    return response.data;
  } catch (error) {
    console.error(
      "Erro ao criar cliente:",
      error
    );

    throw error;
  }
}


export async function atualizarCliente(id, dados) {
  try {
    const response = await api.put(
      `/clientes/${id}`,
      dados
    );

    return response.data;
  } catch (error) {
    console.error(
      "Erro ao atualizar cliente:",
      error
    );

    throw error;
  }
}


export async function excluirCliente(id) {
  try {
    const response = await api.delete(
      `/clientes/${id}`
    );

    return response.data;
  } catch (error) {
    console.error(
      "Erro ao excluir cliente:",
      error
    );

    throw error;
  }
}