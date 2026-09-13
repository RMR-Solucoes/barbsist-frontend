const TOKEN_KEY = "barbsist_access_token";

export const EVENTO_NAO_AUTORIZADO =
  "barbsist:nao-autorizado";

export function obterToken() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.sessionStorage.getItem(TOKEN_KEY);
}

export function salvarToken(token) {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.setItem(TOKEN_KEY, token);

  // Remove o armazenamento antigo compartilhado entre as abas.
  window.localStorage.removeItem(TOKEN_KEY);
}

export function removerToken() {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem(TOKEN_KEY);
}
