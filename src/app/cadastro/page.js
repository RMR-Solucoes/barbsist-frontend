"use client";

import { useState } from "react";
import Link from "next/link";

import { cadastrarBarbearia } from "@/services/cadastroService";

import styles from "./cadastro.module.css";

const formularioInicial = {
  nome_barbearia: "",
  responsavel: "",
  email: "",
  telefone_whatsapp: "",
  cidade: "",
  estado: "",
  senha: "",
  confirmar_senha: "",
  aceitou_termos: false,
};

export default function CadastroPage() {
  const [formulario, setFormulario] =
    useState(formularioInicial);

  const [erro, setErro] = useState("");
  const [resultado, setResultado] =
    useState(null);
  const [enviando, setEnviando] =
    useState(false);

  function alterarCampo(evento) {
    const {
      name,
      value,
      type,
      checked,
    } = evento.target;

    setFormulario((atual) => ({
      ...atual,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));

    setErro("");
  }

  function validarFormulario() {
    if (
      !formulario.nome_barbearia.trim() ||
      !formulario.responsavel.trim() ||
      !formulario.email.trim() ||
      !formulario.telefone_whatsapp.trim() ||
      !formulario.cidade.trim() ||
      !formulario.estado.trim() ||
      !formulario.senha
    ) {
      return "Preencha todos os campos obrigatórios.";
    }

    if (formulario.estado.trim().length !== 2) {
      return "Informe o estado usando duas letras, por exemplo: SP.";
    }

    if (formulario.senha.length < 6) {
      return "A senha deve possuir pelo menos 6 caracteres.";
    }

    if (
      formulario.senha !==
      formulario.confirmar_senha
    ) {
      return "As senhas informadas não são iguais.";
    }

    if (!formulario.aceitou_termos) {
      return "É necessário aceitar os termos de uso.";
    }

    return "";
  }

  async function enviarFormulario(evento) {
  evento.preventDefault();

  if (enviando) {
    return;
  }

  const erroValidacao = validarFormulario();

  if (erroValidacao) {
    setErro(erroValidacao);
    return;
  }

  setErro("");
  setEnviando(true);

  try {
    const dados = await cadastrarBarbearia({
      nome_barbearia:
        formulario.nome_barbearia.trim(),

      responsavel:
        formulario.responsavel.trim(),

      email:
        formulario.email
          .trim()
          .toLowerCase(),

      telefone_whatsapp:
        formulario.telefone_whatsapp.trim(),

      cidade:
        formulario.cidade.trim(),

      estado:
        formulario.estado
          .trim()
          .toUpperCase(),

      senha:
        formulario.senha,

      confirmar_senha:
        formulario.confirmar_senha,

      aceite_termos:
        formulario.aceitou_termos,
    });

    setResultado(dados);
  } catch (error) {
    const detalhe =
      error.response?.data?.detail;

    if (typeof detalhe === "string") {
      setErro(detalhe);
    } else if (Array.isArray(detalhe)) {
      const nomesCampos = {
        nome_barbearia:
          "Nome da barbearia",
        responsavel:
          "Responsável",
        email:
          "E-mail",
        telefone_whatsapp:
          "WhatsApp",
        cidade:
          "Cidade",
        estado:
          "Estado",
        senha:
          "Senha",
        confirmar_senha:
          "Confirmação da senha",
        aceite_termos:
          "Aceite dos termos",
      };

      const mensagens = detalhe.map(
        (item) => {
          const campo =
            item.loc?.[
              item.loc.length - 1
            ];

          const nomeCampo =
            nomesCampos[campo] || campo;

          if (
            item.msg === "Field required" ||
            item.type === "missing"
          ) {
            return `O campo "${nomeCampo}" é obrigatório.`;
          }

          if (
            item.msg ===
            "Value error, As senhas não coincidem."
          ) {
            return "As senhas informadas não são iguais.";
          }

          return item.msg;
        }
      );

      setErro(mensagens.join(" "));
    } else {
      setErro(
        "Não foi possível concluir o cadastro. Tente novamente."
      );
    }
  } finally {
    setEnviando(false);
  }
}
  if (resultado) {
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
              Sua barbearia foi criada
            </h1>

            <p>
              O ambiente inicial já está
              configurado para você começar.
            </p>
          </div>

          <small>
            RMR Soluções de Sistemas
          </small>
        </section>

        <section className={styles.areaFormulario}>
          <div className={styles.formulario}>
            <div className={styles.cabecalho}>
              <span
                className={styles.logoMobile}
              >
                💈 BarbSist
              </span>

              <h2>Cadastro concluído</h2>

              <p>
                Guarde os dados abaixo para
                acessar o sistema.
              </p>
            </div>

            <div className={styles.sucesso}>
              {resultado.mensagem ||
                "Barbearia cadastrada com sucesso."}
            </div>

            <div className={styles.resumo}>
              <div>
                <span>Barbearia</span>
                <strong>
                  {resultado.barbearia?.nome}
                </strong>
              </div>

              <div>
                <span>
                  Identificador da barbearia
                </span>
                <strong>
                  {resultado.login?.slug ||
                    resultado.barbearia?.slug}
                </strong>
              </div>

              <div>
                <span>
                  E-mail do administrador
                </span>
                <strong>
                  {resultado.login?.email ||
                    resultado.administrador
                      ?.email}
                </strong>
              </div>
            </div>

            <Link
              href="/login"
              className={styles.botaoLink}
            >
              Entrar no BarbSist
            </Link>
          </div>
        </section>
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
            Comece a organizar sua barbearia
          </h1>

          <p>
            Cadastre seu estabelecimento e
            crie o primeiro acesso
            administrativo.
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
            <span
              className={styles.logoMobile}
            >
              💈 BarbSist
            </span>

            <h2>Criar minha barbearia</h2>

            <p>
              Preencha os dados para criar seu
              ambiente no BarbSist.
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

          <div className={styles.grade}>
            <label className={styles.campo}>
              <span>
                Nome da barbearia
              </span>

              <input
                type="text"
                name="nome_barbearia"
                value={
                  formulario.nome_barbearia
                }
                onChange={alterarCampo}
                placeholder="Ex.: Barbearia Central"
                autoComplete="organization"
                autoFocus
                required
              />
            </label>

            <label className={styles.campo}>
              <span>Responsável</span>

              <input
                type="text"
                name="responsavel"
                value={formulario.responsavel}
                onChange={alterarCampo}
                placeholder="Nome do responsável"
                autoComplete="name"
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

            <label className={styles.campo}>
              <span>WhatsApp</span>

              <input
                type="tel"
                name="telefone_whatsapp"
                value={
                  formulario.telefone_whatsapp
                }
                onChange={alterarCampo}
                placeholder="11999999999"
                autoComplete="tel"
                required
              />
            </label>

            <label className={styles.campo}>
              <span>Cidade</span>

              <input
                type="text"
                name="cidade"
                value={formulario.cidade}
                onChange={alterarCampo}
                placeholder="Sua cidade"
                autoComplete="address-level2"
                required
              />
            </label>

            <label className={styles.campo}>
              <span>Estado</span>

              <input
                type="text"
                name="estado"
                value={formulario.estado}
                onChange={alterarCampo}
                placeholder="SP"
                maxLength={2}
                autoComplete="address-level1"
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
                placeholder="Mínimo de 6 caracteres"
                autoComplete="new-password"
                required
              />
            </label>

            <label className={styles.campo}>
              <span>Confirmar senha</span>

              <input
                type="password"
                name="confirmar_senha"
                value={
                  formulario.confirmar_senha
                }
                onChange={alterarCampo}
                placeholder="Digite novamente"
                autoComplete="new-password"
                required
              />
            </label>
          </div>

          <label className={styles.termos}>
            <input
                type="checkbox"
                name="aceitou_termos"
                checked={formulario.aceitou_termos}
                onChange={alterarCampo}
                required
                />

            <span>
              Li e aceito os termos de uso e
              a política de privacidade.
            </span>
          </label>

          <button
            type="submit"
            className={styles.botao}
            disabled={enviando}
          >
            {enviando
              ? "Criando barbearia..."
              : "Criar minha barbearia"}
          </button>

          <p className={styles.ajuda}>
            Já possui cadastro?{" "}
            <Link href="/login">
              Acessar o sistema
            </Link>
          </p>
        </form>
      </section>
    </main>
  );
}