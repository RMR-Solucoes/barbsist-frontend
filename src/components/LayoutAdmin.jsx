"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { useAuth } from "@/contexts/AuthContext";
import styles from "./LayoutAdmin.module.css";

export default function LayoutAdmin({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { usuario, sair } = useAuth();
  const [menuAberto, setMenuAberto] = useState(false);

  const rotasCadastros = ["/clientes", "/barbeiro", "/servicos", "/planos"];
  const estaNaAreaCadastros = rotasCadastros.some(
    (rota) => pathname === rota || pathname.startsWith(`${rota}/`)
  );
  const [cadastrosAbertos, setCadastrosAbertos] = useState(
    estaNaAreaCadastros
  );

  useEffect(() => {
    setMenuAberto(false);
    if (estaNaAreaCadastros) setCadastrosAbertos(true);
  }, [pathname, estaNaAreaCadastros]);

  useEffect(() => {
    if (!menuAberto) return undefined;

    function fecharComEscape(event) {
      if (event.key === "Escape") setMenuAberto(false);
    }

    document.addEventListener("keydown", fecharComEscape);
    return () => document.removeEventListener("keydown", fecharComEscape);
  }, [menuAberto]);

  function realizarLogout() {
    sair();
    router.replace("/login");
  }

  const menuGroups = [
    {
      titulo: "📅 OPERAÇÃO",
      background: "#1e293b",
      items: [
        { label: "📅 Agenda", href: "/agenda" },
        
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
  ];

  const menuCadastros = [
    { label: "👥 Clientes", href: "/clientes" },
    { label: "✂️ Barbeiros", href: "/barbeiro" },
    { label: "🧰 Serviços", href: "/servicos" },
    { label: "💳 Planos", href: "/planos" },
  ];

  function itemEstaAtivo(href) {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  function classesLink(base, href) {
    return `${base} ${itemEstaAtivo(href) ? styles.active : ""}`;
  }

  return (
    <div className={styles.shell}>
      <header className={styles.mobileHeader}>
        <span className={styles.mobileTitle}>💈 BarbSist</span>
        <button
          type="button"
          className={styles.menuButton}
          onClick={() => setMenuAberto((aberto) => !aberto)}
          aria-label={menuAberto ? "Fechar menu" : "Abrir menu"}
          aria-expanded={menuAberto}
          aria-controls="menu-administrativo"
        >
          {menuAberto ? "×" : "☰"}
        </button>
      </header>

      {menuAberto && (
        <button
          type="button"
          className={styles.backdrop}
          aria-label="Fechar menu"
          onClick={() => setMenuAberto(false)}
        />
      )}

      <aside
        id="menu-administrativo"
        className={`${styles.sidebar} ${menuAberto ? styles.sidebarOpen : ""}`}
      >
        <h2 className={styles.brand}>💈 BarbSist</h2>
        <p className={styles.brandCaption}>RMR Soluções de Sistemas</p>
        <hr className={styles.divider} />

        <nav aria-label="Menu administrativo">
          <Link href="/" className={classesLink(styles.dashboardLink, "/")}>
            📊 Dashboard
          </Link>

          {menuGroups.map((grupo) => (
            <div
              key={grupo.titulo}
              className={styles.menuGroup}
              style={{ background: grupo.background }}
            >
              <div className={styles.groupTitle}>{grupo.titulo}</div>
              {grupo.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={classesLink(styles.menuLink, item.href)}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          ))}

          <div className={`${styles.systemGroup}`}>
            <div className={styles.groupTitle}>⚙️ SISTEMA</div>
            <Link
              href="/configuracoes"
              className={classesLink(styles.menuLink, "/configuracoes")}
            >
              ⚙️ Configurações
            </Link>

            <button
              type="button"
              onClick={() => setCadastrosAbertos((aberto) => !aberto)}
              className={`${styles.cadastroButton} ${
                estaNaAreaCadastros ? styles.active : ""
              }`}
              aria-expanded={cadastrosAbertos}
            >
              <span>📋 Cadastros</span>
              <span aria-hidden="true">{cadastrosAbertos ? "▾" : "▸"}</span>
            </button>

            {cadastrosAbertos && (
              <div className={styles.submenu}>
                {menuCadastros.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={classesLink(styles.submenuLink, item.href)}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </nav>

        <div className={styles.userArea}>
          <div className={styles.userCard}>
            <div className={styles.userName} title={usuario?.nome || ""}>
              👤 {usuario?.nome || "Usuário"}
            </div>
            <div className={styles.userEmail} title={usuario?.email || ""}>
              {usuario?.email || ""}
            </div>
            <div className={styles.userRole}>{usuario?.perfil || ""}</div>
          </div>
          <button
            type="button"
            onClick={realizarLogout}
            className={styles.logoutButton}
          >
            🚪 Sair
          </button>
        </div>
      </aside>

      <main className={styles.main}>
        {children}
        <footer className={styles.footer}>
          Desenvolvido por <strong>RMR Soluções de Sistemas</strong>
        </footer>
      </main>
    </div>
  );
}
