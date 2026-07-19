"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/contexts/AuthContext";

import styles from "./login.module.css";

export default function LoginPage() {
  const router = useRouter();

  const {
    entrar,
    autenticado,
    carregando,
  } = useAuth();

  const [formulario, setFormulario] = useState({
    barbearia_slug: "",
    email: "",
    senha: "",
  });

  const [erro, setErro] = useState("");
  const [enviando, setEnviando] =
    useState(false);

  useEffect(() => {
    if (!carregando && autenticado) {
      router.replace("/");
    }
  }, [
    carregando,
    autenticado,
    router,
  ]);

  function alterarCampo(evento) {
    const { name, value } = evento.target;

    setFormulario((atual) => ({
      ...atual,
      [name]: value,
    }));

    setErro("");
  }

  async function enviarFormulario(evento) {
    evento.preventDefault();

    if (enviando) {
      return;
    }

    setErro("");
    setEnviando(true);

    try {
      await entrar({
        barbearia_slug:
          formulario.barbearia_slug.trim(),
        email: formulario.email
          .trim()
          .toLowerCase(),
        senha: formulario.senha,
      });

      router.replace("/");
    } catch (error) {
      const detalhe =
        error.response?.data?.detail;

      setErro(
        typeof detalhe === "string"
          ? detalhe
          : "Não foi possível realizar o login."
      );
    } finally {
      setEnviando(false);
    }
  }

  if (carregando || autenticado) {
    return (
      <main className={styles.carregando}>
        Verificando acesso...
      </main>
    );
  }

  return (
    <main className={styles.pagina}>
      <section className={styles.apresentacao}>
        <div className={styles.marca}>
          <span className={styles.icone}>
            💈
          </span>

          <span>BarbSist</span>
        </div>

        <div>
          <h1>
            Gestão completa para sua barbearia
          </h1>

          <p>
            Organize clientes, agenda, comandas,
            planos e o financeiro em um único
            lugar.
          </p>
        </div>

        <small>
          RMR Soluções de Sistemas
        </small>
      </section>

      <section className={styles.areaFormulario}>
        <form
          className={styles.formulario}
          onSubmit={enviarFormulario}
        >
          <div className={styles.cabecalho}>
            <span className={styles.logoMobile}>
              💈 BarbSist
            </span>

            <h2>Acessar o sistema</h2>

            <p>
              Informe os dados fornecidos no
              cadastro da sua barbearia.
            </p>
          </div>

          {erro && (
            <div
              className={styles.erro}
              role="alert"
            >
              {erro}
            </div>
          )}

          <label className={styles.campo}>
            <span>
              Identificador da barbearia
            </span>

            <input
              type="text"
              name="barbearia_slug"
              value={formulario.barbearia_slug}
              onChange={alterarCampo}
              placeholder="ex.: minha-barbearia"
              autoComplete="organization"
              autoFocus
              required
            />
          </label>

          <label className={styles.campo}>
            <span>E-mail</span>

            <input
              type="email"
              name="email"
              value={formulario.email}
              onChange={alterarCampo}
              placeholder="seuemail@exemplo.com"
              autoComplete="username"
              required
            />
          </label>

          <label className={styles.campo}>
            <span>Senha</span>

            <input
              type="password"
              name="senha"
              value={formulario.senha}
              onChange={alterarCampo}
              placeholder="Digite sua senha"
              autoComplete="current-password"
              required
            />
          </label>

          <button
            type="submit"
            className={styles.botao}
            disabled={enviando}
          >
            {enviando
              ? "Entrando..."
              : "Entrar"}
          </button>

          <p className={styles.ajuda}>
            Não possui acesso? Entre em contato
            com o administrador da sua barbearia.
          </p>
        </form>
      </section>
    </main>
  );
}