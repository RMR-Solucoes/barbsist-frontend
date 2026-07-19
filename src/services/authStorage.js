const TOKEN_KEY = "barbsist_access_token";

export const EVENTO_NAO_AUTORIZADO =
  "barbsist:nao-autorizado";

export function obterToken() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem(TOKEN_KEY);
}

export function salvarToken(token) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(TOKEN_KEY, token);
}

export function removerToken() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(TOKEN_KEY);
}