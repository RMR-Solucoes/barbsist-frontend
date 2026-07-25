"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import {
  useRouter,
  useSearchParams,
} from "next/navigation";

import { redefinirSenha } from "@/services/authService";

import styles from "../login/login.module.css";

function FormularioRedefinicao() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") || "";

  const [formulario, setFormulario] = useState({
    nova_senha: "",
    confirmar_nova_senha: "",
  });

  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [enviando, setEnviando] = useState(false);

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

    if (!token) {
      setErro(
        "O link de redefinição é inválido ou não possui token."
      );
      return;
    }

    if (
      formulario.nova_senha !==
      formulario.confirmar_nova_senha
    ) {
      setErro("As senhas informadas não coincidem.");
      return;
    }

    setErro("");
    setMensagem("");
    setEnviando(true);

    try {
      const resposta = await redefinirSenha({
        token,
        nova_senha: formulario.nova_senha,
        confirmar_nova_senha:
          formulario.confirmar_nova_senha,
      });

      setMensagem(
        resposta.mensagem ||
          "Senha redefinida com sucesso."
      );

      setTimeout(() => {
        router.replace("/login");
        }, 3000);

      setFormulario({
        nova_senha: "",
        confirmar_nova_senha: "",
      });
    } catch (error) {
      const detalhe = error.response?.data?.detail;

      setErro(
        typeof detalhe === "string"
          ? detalhe
          : "Não foi possível redefinir a senha."
      );
    } finally {
      setEnviando(false);
    }
  }

  return (
    <main className={styles.pagina}>
      <section className={styles.apresentacao}>
        <div className={styles.marca}>
          <span className={styles.icone}>💈</span>
          <span>BarbSist</span>
        </div>

        <div>
          <h1>Crie uma nova senha</h1>

          <p>
            Informe uma nova senha para recuperar
            o acesso à sua conta.
          </p>
        </div>

        <small>RMR Soluções de Sistemas</small>
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

            <h2>Redefinir senha</h2>

            <p>
              Digite e confirme sua nova senha.
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
            <span>Nova senha</span>

            <input
              type="password"
              name="nova_senha"
              value={formulario.nova_senha}
              onChange={alterarCampo}
              placeholder="Digite a nova senha"
              autoComplete="new-password"
              required
            />
          </label>

          <label className={styles.campo}>
            <span>Confirmar nova senha</span>

            <input
              type="password"
              name="confirmar_nova_senha"
              value={
                formulario.confirmar_nova_senha
              }
              onChange={alterarCampo}
              placeholder="Confirme a nova senha"
              autoComplete="new-password"
              required
            />
          </label>

          <button
            type="submit"
            className={styles.botao}
            disabled={enviando || !token || Boolean(mensagem)}
          >
            {enviando
              ? "Redefinindo..."
              : "Redefinir senha"}
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

export default function RedefinirSenhaPage() {
  return (
    <Suspense
      fallback={
        <main className={styles.carregando}>
          Carregando...
        </main>
      }
    >
      <FormularioRedefinicao />
    </Suspense>
  );
}