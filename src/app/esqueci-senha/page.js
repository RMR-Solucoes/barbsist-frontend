"use client";

import { useState } from "react";
import Link from "next/link";

import {
  solicitarRecuperacaoSenha,
} from "@/services/authService";

import styles from "../login/login.module.css";

export default function EsqueciSenhaPage() {
  const [formulario, setFormulario] = useState({
    barbearia_slug: "",
    email: "",
  });

  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [enviando, setEnviando] =
    useState(false);

  function alterarCampo(evento) {
    const { name, value } = evento.target;

    setFormulario((atual) => ({
      ...atual,
      [name]: value,
    }));

    setErro("");
    setMensagem("");
  }

  async function enviarFormulario(evento) {
    evento.preventDefault();

    if (enviando) {
      return;
    }

    setErro("");
    setMensagem("");
    setEnviando(true);

    try {
      const resposta =
        await solicitarRecuperacaoSenha({
          barbearia_slug:
            formulario.barbearia_slug.trim(),
          email: formulario.email
            .trim()
            .toLowerCase(),
        });

      setMensagem(
        resposta.mensagem ||
          "As instruções foram enviadas."
      );
    } catch (error) {
      const detalhe =
        error.response?.data?.detail;

      setErro(
        typeof detalhe === "string"
          ? detalhe
          : "Não foi possível solicitar a recuperação."
      );
    } finally {
      setEnviando(false);
    }
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
          <h1>Recupere seu acesso</h1>

          <p>
            Informe os dados cadastrados para
            receber o link de redefinição de
            senha.
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

            <h2>Esqueci minha senha</h2>

            <p>
              Informe a barbearia e o e-mail
              da sua conta.
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

          {mensagem && (
            <div
              style={{
                marginBottom: "20px",
                padding: "13px 14px",
                border: "1px solid #bbf7d0",
                borderRadius: "10px",
                color: "#166534",
                background: "#f0fdf4",
                fontSize: "14px",
                lineHeight: "1.4",
              }}
              role="status"
            >
              {mensagem}
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
              autoComplete="email"
              required
            />
          </label>

          <button
            type="submit"
            className={styles.botao}
            disabled={enviando}
          >
            {enviando
              ? "Enviando..."
              : "Enviar instruções"}
          </button>

          <p className={styles.ajuda}>
            <Link href="/login">
              Voltar para o login
            </Link>
          </p>
        </form>
      </section>
    </main>
  );
}