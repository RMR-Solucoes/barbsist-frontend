"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  buscarUsuarioLogado,
  realizarLogin,
} from "@/services/authService";

import {
  EVENTO_NAO_AUTORIZADO,
  obterToken,
  removerToken,
  salvarToken,
} from "@/services/authStorage";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [carregando, setCarregando] =
    useState(true);

  const carregarUsuario = useCallback(
    async () => {
      const token = obterToken();

      if (!token) {
        setUsuario(null);
        setCarregando(false);
        return;
      }

      try {
        const dados =
          await buscarUsuarioLogado();

        setUsuario(dados);
      } catch {
        removerToken();
        setUsuario(null);
      } finally {
        setCarregando(false);
      }
    },
    []
  );

  useEffect(() => {
    carregarUsuario();

    function tratarNaoAutorizado() {
      setUsuario(null);
      setCarregando(false);
    }

    window.addEventListener(
      EVENTO_NAO_AUTORIZADO,
      tratarNaoAutorizado
    );

    return () => {
      window.removeEventListener(
        EVENTO_NAO_AUTORIZADO,
        tratarNaoAutorizado
      );
    };
  }, [carregarUsuario]);

  const entrar = useCallback(async (dados) => {
    const resultado = await realizarLogin(dados);

    if (!resultado.access_token) {
      throw new Error(
        "Token de acesso não recebido."
      );
    }

    salvarToken(resultado.access_token);

    try {
      const usuarioLogado =
        await buscarUsuarioLogado();

      setUsuario(usuarioLogado);

      return usuarioLogado;
    } catch (erro) {
      removerToken();
      setUsuario(null);
      throw erro;
    }
  }, []);

  const sair = useCallback(() => {
    removerToken();
    setUsuario(null);
  }, []);

  const valor = useMemo(
    () => ({
      usuario,
      carregando,
      autenticado: Boolean(usuario),
      entrar,
      sair,
      recarregarUsuario: carregarUsuario,
    }),
    [
      usuario,
      carregando,
      entrar,
      sair,
      carregarUsuario,
    ]
  );

  return (
    <AuthContext.Provider value={valor}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const contexto = useContext(AuthContext);

  if (!contexto) {
    throw new Error(
      "useAuth deve ser usado dentro de AuthProvider."
    );
  }

  return contexto;
}