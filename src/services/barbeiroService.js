import api from "./api";

async function executar(
  requisicao,
  mensagemPadrao
) {
  try {
    const resposta = await requisicao();

    return resposta.data;
  } catch (erro) {
    const detalhe =
      erro.response?.data?.detail;

    throw new Error(
      typeof detalhe === "string"
        ? detalhe
        : mensagemPadrao
    );
  }
}

export async function listarBarbeiros() {
  return executar(
    () => api.get("/barbeiros"),
    "Erro ao listar barbeiros."
  );
}

export async function criarBarbeiro(dados) {
  return executar(
    () => api.post("/barbeiros", dados),
    "Erro ao criar barbeiro."
  );
}

export async function atualizarBarbeiro(
  id,
  dados
) {
  return executar(
    () => api.put(`/barbeiros/${id}`, dados),
    "Erro ao atualizar barbeiro."
  );
}

export async function excluirBarbeiro(id) {
  return executar(
    () => api.delete(`/barbeiros/${id}`),
    "Erro ao inativar barbeiro."
  );
}

export async function reativarBarbeiro(id) {
  return executar(
    () =>
      api.put(
        `/barbeiros/${id}/reativar`
      ),
    "Erro ao reativar barbeiro."
  );
}

export async function excluirBarbeiroDefinitivamente(
  id
) {
  return executar(
    () =>
      api.delete(
        `/barbeiros/${id}/excluir`
      ),
    "Erro ao excluir barbeiro definitivamente."
  );
}