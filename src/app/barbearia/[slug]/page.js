"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { obterPerfilBarbeariaPublica } from "@/services/barbeariasPublicasService";
import styles from "./perfilBarbearia.module.css";

export default function PerfilPublicoBarbeariaPage() {
  const params = useParams();
  const slugParam = params?.slug;
  const slug = Array.isArray(slugParam) ? slugParam[0] : slugParam;

  const [barbearia, setBarbearia] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    if (!slug) return;

    let ativo = true;

    async function carregarPerfil() {
      setCarregando(true);
      setErro("");

      try {
        const dados = await obterPerfilBarbeariaPublica(slug);
        if (ativo) setBarbearia(dados);
      } catch (error) {
        if (!ativo) return;

        if (error?.response?.status === 404) {
          setErro(
            "Esta barbearia não foi encontrada ou não está disponível no catálogo público."
          );
        } else {
          setErro(
            "Não foi possível carregar o perfil desta barbearia. Tente novamente."
          );
        }
      } finally {
        if (ativo) setCarregando(false);
      }
    }

    carregarPerfil();

    return () => {
      ativo = false;
    };
  }, [slug]);

  if (carregando) {
    return (
      <main className={styles.page}>
        <header className={styles.topbar}>
          <a href="/" className={styles.brand}>✂ BarbSist</a>
          <a href="/barbearias" className={styles.backLink}>← Voltar ao catálogo</a>
        </header>

        <section className={styles.stateCard}>
          <div className={styles.spinner} aria-hidden="true" />
          <h1>Carregando perfil...</h1>
          <p>Estamos buscando as informações públicas da barbearia.</p>
        </section>
      </main>
    );
  }

  if (erro || !barbearia) {
    return (
      <main className={styles.page}>
        <header className={styles.topbar}>
          <a href="/" className={styles.brand}>✂ BarbSist</a>
          <a href="/barbearias" className={styles.backLink}>← Voltar ao catálogo</a>
        </header>

        <section className={styles.stateCard}>
          <div className={styles.stateIcon} aria-hidden="true">✂</div>
          <h1>Perfil indisponível</h1>
          <p>{erro || "Não foi possível carregar este perfil."}</p>
          <a href="/barbearias" className={styles.primaryButton}>
            Encontrar outras barbearias
          </a>
        </section>
      </main>
    );
  }

  const enderecoCompleto = montarEndereco(barbearia);
  const telefoneWhatsApp = somenteDigitos(barbearia.telefone_whatsapp);

  const urlWhatsApp = telefoneWhatsApp
    ? `https://wa.me/${telefoneWhatsApp}?text=${encodeURIComponent(
        `Olá! Encontrei a ${barbearia.nome} pelo BarbSist.`
      )}`
    : null;

  const urlInstagram = obterUrlInstagram(barbearia.instagram);

  const latitudeBarbearia = Number(barbearia.latitude);
  const longitudeBarbearia = Number(barbearia.longitude);

  const possuiCoordenadas =
    barbearia.latitude != null &&
    barbearia.longitude != null &&
    Number.isFinite(latitudeBarbearia) &&
    Number.isFinite(longitudeBarbearia);

  const urlMaps = possuiCoordenadas
    ? `https://www.google.com/maps/dir/?api=1&destination=${latitudeBarbearia},${longitudeBarbearia}`
    : enderecoCompleto
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          enderecoCompleto
        )}`
      : null;

  const urlAgendamento = barbearia.permitir_agendamento_portal
    ? `/agendar?barbearia=${encodeURIComponent(barbearia.slug)}`
    : null;

  const urlPortalCliente =
    `/portal-cliente?barbearia=${encodeURIComponent(barbearia.slug)}`;

  const servicos = Array.isArray(barbearia.servicos)
    ? barbearia.servicos
    : [];

  return (
    <main className={styles.page}>
      <header className={styles.topbar}>
        <a href="/" className={styles.brand}>✂ BarbSist</a>

        <div className={styles.topActions}>
          <a href={urlPortalCliente} className={styles.clientLink}>
            Área do cliente
          </a>
          <a href="/barbearias" className={styles.backLink}>
            ← Voltar ao catálogo
          </a>
        </div>
      </header>

      <section className={styles.hero}>
        <div className={styles.cover}>
          {barbearia.imagem_capa_url ? (
            <img
              src={barbearia.imagem_capa_url}
              alt=""
              className={styles.coverImage}
            />
          ) : (
            <div className={styles.coverFallback} aria-hidden="true">
              <span>✂</span>
            </div>
          )}
        </div>

        <div className={styles.heroContent}>
          <div className={styles.identity}>
            {barbearia.logo_url ? (
              <img
                src={barbearia.logo_url}
                alt={`Logo de ${barbearia.nome}`}
                className={styles.logo}
              />
            ) : (
              <div className={styles.logoFallback}>
                {inicialNome(barbearia.nome)}
              </div>
            )}

            <div className={styles.identityText}>
              <p className={styles.eyebrow}>Perfil público no BarbSist</p>
              <h1>{barbearia.nome}</h1>
              {barbearia.slogan && (
                <p className={styles.slogan}>{barbearia.slogan}</p>
              )}
            </div>
          </div>

          {enderecoCompleto && (
            <p className={styles.address}>
              <span aria-hidden="true">📍</span>
              <span>{enderecoCompleto}</span>
            </p>
          )}

          <div className={styles.actions}>
            {urlAgendamento ? (
              <a href={urlAgendamento} className={styles.primaryButton}>
                Agendar horário
              </a>
            ) : (
              <span className={styles.offlineScheduling}>
                Agendamento online indisponível
              </span>
            )}

            {urlWhatsApp && (
              <a
                href={urlWhatsApp}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.whatsappButton}
              >
                WhatsApp
              </a>
            )}

            {urlMaps && (
              <a
                href={urlMaps}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.secondaryButton}
              >
                Como chegar
              </a>
            )}

            {urlInstagram && (
              <a
                href={urlInstagram}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.secondaryButton}
              >
                Instagram
              </a>
            )}
          </div>
        </div>
      </section>

      <section className={styles.content}>
        <div className={styles.sectionHeading}>
          <div>
            <p className={styles.eyebrowDark}>Serviços</p>
            <h2>Escolha o que você precisa</h2>
          </div>
          <p>
            Valores e duração informados pela própria barbearia no BarbSist.
          </p>
        </div>

        {servicos.length > 0 ? (
          <div className={styles.servicesGrid}>
            {servicos.map((servico, index) => (
              <article
                key={`${servico.nome}-${index}`}
                className={styles.serviceCard}
              >
                <div>
                  <h3>{servico.nome}</h3>
                  <p>{formatarDuracao(servico.tempo_medio_minutos)}</p>
                </div>
                <strong>{formatarMoeda(servico.preco)}</strong>
              </article>
            ))}
          </div>
        ) : (
          <div className={styles.emptyServices}>
            <h3>Serviços ainda não publicados</h3>
            <p>
              Entre em contato com a barbearia para consultar os serviços disponíveis.
            </p>
          </div>
        )}

        <div className={styles.footerCard}>
          <div>
            <h2>Gostou desta barbearia?</h2>
            <p>
              {urlAgendamento
                ? "Escolha seus serviços e marque seu horário pelo BarbSist."
                : "Use os canais de contato disponíveis para falar com a barbearia."}
            </p>
          </div>

          {urlAgendamento ? (
            <a href={urlAgendamento} className={styles.primaryButton}>
              Agendar agora
            </a>
          ) : urlWhatsApp ? (
            <a
              href={urlWhatsApp}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.whatsappButton}
            >
              Falar pelo WhatsApp
            </a>
          ) : (
            <a href="/barbearias" className={styles.secondaryButton}>
              Voltar ao catálogo
            </a>
          )}
        </div>
      </section>
    </main>
  );
}

function montarEndereco(barbearia) {
  return [
    barbearia.endereco,
    barbearia.cidade,
    barbearia.estado,
    barbearia.cep,
  ]
    .filter(Boolean)
    .join(", ");
}

function somenteDigitos(valor) {
  return String(valor || "").replace(/\D/g, "");
}

function obterUrlInstagram(valor) {
  const texto = String(valor || "").trim();
  if (!texto) return null;

  if (/^https?:\/\//i.test(texto)) return texto;

  const usuario = texto
    .replace(/^@/, "")
    .replace(/^instagram\.com\//i, "")
    .replace(/^www\.instagram\.com\//i, "")
    .replace(/\/+$/, "");

  return usuario
    ? `https://www.instagram.com/${encodeURIComponent(usuario)}`
    : null;
}

function inicialNome(nome) {
  const texto = String(nome || "").trim();
  return texto ? texto.charAt(0).toUpperCase() : "B";
}

function formatarMoeda(valor) {
  const numero = Number(valor || 0);

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(numero);
}

function formatarDuracao(minutos) {
  const total = Number(minutos || 0);

  if (!Number.isFinite(total) || total <= 0) {
    return "Duração não informada";
  }

  if (total < 60) {
    return `${total} min`;
  }

  const horas = Math.floor(total / 60);
  const restante = total % 60;

  if (!restante) {
    return `${horas}h`;
  }

  return `${horas}h ${restante}min`;
}
