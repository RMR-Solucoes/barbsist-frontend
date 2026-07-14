"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function LayoutAdmin({ children }) {
  const pathname = usePathname();

  const menuGroups = [
    {
      titulo: "📅 OPERAÇÃO",
      background: "#1e293b",
      items: [
        { label: "📅 Agenda", href: "/agenda" },
        { label: "🌐 Agendamento Online", href: "/agendar" },
      ],
    },
    {
      titulo: "👥 CADASTROS",
      background: "#1f2937",
      items: [
        { label: "👥 Clientes", href: "/clientes" },
        { label: "✂️ Barbeiros", href: "/barbeiro" },
        { label: "🧰 Serviços", href: "/servicos" },
        { label: "💳 Planos", href: "/planos" },
      ],
    },
    {
      titulo: "🧾 ATENDIMENTO",
      background: "#312e81",
      items: [
        { label: "🧾 Comandas", href: "/comandas" },
        { label: "📦 Produtos", href: "/produtos" },
      ],
    },
    {
      titulo: "💰 FINANCEIRO",
      background: "#14532d",
      items: [
        { label: "💵 Financeiro", href: "/financeiro" },
        { label: "💰 Caixa", href: "/caixa" },
        { label: "🏆 Comissões", href: "/comissoes" },
      ],
    },
    {
      titulo: "⚙️ SISTEMA",
      background: "#374151",
      items: [{ label: "⚙️ Configurações", href: "/configuracoes" }],
    },
  ];

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
        <h2 style={{ marginBottom: "0px" }}>💈 BarbSist</h2>

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

        <hr style={{ borderColor: "#374151", marginBottom: "20px" }} />

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
              background: pathname === "/" ? "#2563eb" : "#1f2937",
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

              {grupo.items.map((item) => {
                const active = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    style={{
                      display: "block",
                      color: "white",
                      textDecoration: "none",
                      padding: "8px 10px",
                      marginBottom: "4px",
                      borderRadius: "6px",
                      background: active ? "#2563eb" : "transparent",
                      fontWeight: active ? "bold" : "normal",
                    }}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
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
          Desenvolvido por <strong>RMR Soluções de Sistemas</strong>
        </footer>
      </main>
    </div>
  );
}