"use client";

import { useEffect } from "react";
import {
  usePathname,
  useRouter,
} from "next/navigation";

import { useAuth } from "@/contexts/AuthContext";
import LayoutAdmin from "./LayoutAdmin";

export default function LayoutWrapper({
  children,
}) {
  const pathname = usePathname();
  const router = useRouter();

  const {
    autenticado,
    carregando,
  } = useAuth();

  const paginasPublicas = [
    "/login",
    "/agendar",
    "/consultar-agendamento",
    "/cancelar-agendamento",
  ];

  const paginaPublica = paginasPublicas.some(
    (rota) =>
      pathname === rota ||
      pathname.startsWith(`${rota}/`)
  );

  useEffect(() => {
    if (
      !paginaPublica &&
      !carregando &&
      !autenticado
    ) {
      router.replace("/login");
    }
  }, [
    paginaPublica,
    carregando,
    autenticado,
    router,
  ]);

  if (paginaPublica) {
    return <>{children}</>;
  }

  if (carregando || !autenticado) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          background: "#f3f4f6",
          color: "#374151",
          fontFamily: "Arial, sans-serif",
        }}
      >
        Verificando acesso...
      </div>
    );
  }

  return (
    <LayoutAdmin>
      {children}
    </LayoutAdmin>
  );
}