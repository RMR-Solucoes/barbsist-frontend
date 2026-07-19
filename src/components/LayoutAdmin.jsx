"use client";

import Link from "next/link";
import {
  usePathname,
  useRouter,
} from "next/navigation";
import { useEffect, useState } from "react";

import { useAuth } from "@/contexts/AuthContext";

export default function LayoutAdmin({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { usuario, sair } = useAuth();

  function realizarLogout() {
    sair();
    router.replace("/login");
  }

  const rotasCadastros = [
    "/clientes",
    "/barbeiro",
    "/servicos",
    "/planos",
  ];

  const estaNaAreaCadastros = rotasCadastros.some(
    (rota) =>
      pathname === rota ||
      pathname.startsWith(`${rota}/`)
  );

  const [cadastrosAbertos, setCadastrosAbertos] =
    useState(estaNaAreaCadastros);

  useEffect(() => {
    if (estaNaAreaCadastros) {
      setCadastrosAbertos(true);
    }
  }, [estaNaAreaCadastros]);

  const menuGroups = [
    {
      titulo: "📅 OPERAÇÃO",
      background: "#1e293b",
      items: [
        {
          label: "📅 Agenda",
          href: "/agenda",
        },
        {
          label: "🌐 Agendamento Online",
          href: "/agendar",
        },
      ],
    },
    {
      titulo: "🧾 ATENDIMENTO",
      background: "#312e81",
      items: [
        {
          label: "🧾 Comandas",
          href: "/comandas",
        },
        {
          label: "📦 Produtos",
          href: "/produtos",
        },
      ],
    },
    {
      titulo: "💰 FINANCEIRO",
      background: "#14532d",
      items: [
        {
          label: "💵 Financeiro",
          href: "/financeiro",
        },
        {
          label: "💰 Caixa",
          href: "/caixa",
        },
        {
          label: "🏆 Comissões",
          href: "/comissoes",
        },
      ],
    },
  ];

  const menuCadastros = [
    {
      label: "👥 Clientes",
      href: "/clientes",
    },
    {
      label: "✂️ Barbeiros",
      href: "/barbeiro",
    },
    {
      label: "🧰 Serviços",
      href: "/servicos",
    },
    {
      label: "💳 Planos",
      href: "/planos",
    },
  ];

  function itemEstaAtivo(href) {
    if (href === "/") {
      return pathname === "/";
    }

    return (
      pathname === href ||
      pathname.startsWith(`${href}/`)
    );
  }

  const linkStyle = (
    ativo,
    recuo = false
  ) => ({
    display: "block",
    color: "white",
    textDecoration: "none",
    padding: recuo
      ? "8px 10px 8px 22px"
      : "8px 10px",
    marginBottom: "4px",
    borderRadius: "6px",
    background: ativo
      ? "#2563eb"
      : "transparent",
    fontWeight: ativo
      ? "bold"
      : "normal",
    fontSize: recuo
      ? "14px"
      : "16px",
  });

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        fontFamily: "Arial",
        background: "#f5f5f5",
      }}
    >
      <aside
        style={{
          width: "250px",
          background: "#111827",
          color: "white",
          padding: "20px",
          minHeight: "100vh",
          overflowY: "auto",
        }}
      >
        <h2 style={{ marginBottom: "0px" }}>
          💈 BarbSist
        </h2>

        <p
          style={{
            fontSize: "12px",
            color: "#9ca3af",
            marginTop: "2px",
            marginBottom: "25px",
          }}
        >
          RMR Soluções de Sistemas
        </p>

        <hr
          style={{
            borderColor: "#374151",
            marginBottom: "20px",
          }}
        />

        <nav>
          <Link
            href="/"
            style={{
              display: "block",
              color: "white",
              textDecoration: "none",
              padding: "10px",
              marginBottom: "15px",
              borderRadius: "8px",
              background:
                pathname === "/"
                  ? "#2563eb"
                  : "#1f2937",
              fontWeight: "bold",
              textAlign: "center",
            }}
          >
            📊 Dashboard
          </Link>

          {menuGroups.map((grupo) => (
            <div
              key={grupo.titulo}
              style={{
                background: grupo.background,
                borderRadius: "10px",
                padding: "10px",
                marginBottom: "12px",
              }}
            >
              <div
                style={{
                  fontSize: "11px",
                  fontWeight: "bold",
                  color: "#d1d5db",
                  marginBottom: "8px",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                }}
              >
                {grupo.titulo}
              </div>

              {grupo.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  style={linkStyle(
                    itemEstaAtivo(item.href)
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          ))}

          <div
            style={{
              background: "#374151",
              borderRadius: "10px",
              padding: "10px",
              marginBottom: "12px",
            }}
          >
            <div
              style={{
                fontSize: "11px",
                fontWeight: "bold",
                color: "#d1d5db",
                marginBottom: "8px",
                textTransform: "uppercase",
                letterSpacing: "1px",
              }}
            >
              ⚙️ SISTEMA
            </div>

            <Link
              href="/configuracoes"
              style={linkStyle(
                itemEstaAtivo("/configuracoes")
              )}
            >
              ⚙️ Configurações
            </Link>

            <button
              type="button"
              onClick={() =>
                setCadastrosAbertos(
                  (aberto) => !aberto
                )
              }
              style={{
                width: "100%",
                border: "none",
                color: "white",
                background: estaNaAreaCadastros
                  ? "#2563eb"
                  : "transparent",
                padding: "8px 10px",
                marginBottom: "4px",
                borderRadius: "6px",
                cursor: "pointer",
                fontWeight: estaNaAreaCadastros
                  ? "bold"
                  : "normal",
                fontSize: "16px",
                textAlign: "left",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <span>📋 Cadastros</span>

              <span>
                {cadastrosAbertos
                  ? "▾"
                  : "▸"}
              </span>
            </button>

            {cadastrosAbertos && (
              <div
                style={{
                  marginTop: "6px",
                  paddingTop: "6px",
                  borderTop:
                    "1px solid #4b5563",
                }}
              >
                {menuCadastros.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    style={linkStyle(
                      itemEstaAtivo(item.href),
                      true
                    )}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </nav>

                <div
          style={{
            marginTop: "24px",
            paddingTop: "16px",
            borderTop: "1px solid #374151",
          }}
        >
          <div
            style={{
              padding: "12px",
              marginBottom: "10px",
              borderRadius: "8px",
              background: "#1f2937",
            }}
          >
            <div
              style={{
                marginBottom: "4px",
                fontSize: "14px",
                fontWeight: "bold",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
              title={usuario?.nome || ""}
            >
              👤 {usuario?.nome || "Usuário"}
            </div>

            <div
              style={{
                marginBottom: "5px",
                color: "#9ca3af",
                fontSize: "11px",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
              title={usuario?.email || ""}
            >
              {usuario?.email || ""}
            </div>

            <div
              style={{
                color: "#93c5fd",
                fontSize: "11px",
                textTransform: "capitalize",
              }}
            >
              {usuario?.perfil || ""}
            </div>
          </div>

          <button
            type="button"
            onClick={realizarLogout}
            style={{
              width: "100%",
              padding: "10px",
              border: "1px solid #ef4444",
              borderRadius: "8px",
              color: "#fecaca",
              background: "transparent",
              fontSize: "14px",
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            🚪 Sair
          </button>
        </div>
      </aside>

      <main
        style={{
          flex: 1,
          padding: "30px",
          position: "relative",
          minHeight: "100vh",
        }}
      >
        {children}

        <footer
          style={{
            position: "absolute",
            bottom: "20px",
            right: "30px",
            fontSize: "13px",
            color: "#6b7280",
          }}
        >
          Desenvolvido por{" "}
          <strong>
            RMR Soluções de Sistemas
          </strong>
        </footer>
      </main>
    </div>
  );
}