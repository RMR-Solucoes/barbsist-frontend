const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export async function listarBarbeiros() {
  const resposta = await fetch(`${API_URL}/barbeiros`);

  if (!resposta.ok) {
    throw new Error("Erro ao listar barbeiros.");
  }

  return resposta.json();
}

export async function criarBarbeiro(dados) {
  const resposta = await fetch(`${API_URL}/barbeiros`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(dados),
  });

  if (!resposta.ok) {
    const erro = await resposta.json();
    throw new Error(erro.detail || "Erro ao criar barbeiro.");
  }

  return resposta.json();
}

export async function atualizarBarbeiro(id, dados) {
  const resposta = await fetch(`${API_URL}/barbeiros/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(dados),
  });

  if (!resposta.ok) {
    const erro = await resposta.json();
    throw new Error(erro.detail || "Erro ao atualizar barbeiro.");
  }

  return resposta.json();
}

export async function excluirBarbeiro(id) {
  const resposta = await fetch(`${API_URL}/barbeiros/${id}`, {
    method: "DELETE",
  });

  if (!resposta.ok) {
    const erro = await resposta.json();
    throw new Error(erro.detail || "Erro ao inativar barbeiro.");
  }

  return resposta.json();
}

export async function reativarBarbeiro(id) {
  const resposta = await fetch(
    `${API_URL}/barbeiros/${id}/reativar`,
    {
      method: "PUT",
    }
  );

  if (!resposta.ok) {
    const erro = await resposta.json();
    throw new Error(erro.detail || "Erro ao reativar barbeiro.");
  }

  return resposta.json();
}

export async function excluirBarbeiroDefinitivamente(id) {
  const resposta = await fetch(
    `${API_URL}/barbeiros/${id}/excluir`,
    {
      method: "DELETE",
    }
  );

  if (!resposta.ok) {
    const erro = await resposta.json();
    throw new Error(
      erro.detail || "Erro ao excluir barbeiro definitivamente."
    );
  }

  return resposta.json();
}