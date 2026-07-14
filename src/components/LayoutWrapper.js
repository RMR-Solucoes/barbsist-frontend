"use client";

import { usePathname } from "next/navigation";
import LayoutAdmin from "./LayoutAdmin";

export default function LayoutWrapper({ children }) {
  const pathname = usePathname();

  const paginasPublicas = [
    "/agendar",
    "/consultar-agendamento",
    "/cancelar-agendamento",
  ];

  const paginaPublica = paginasPublicas.some((rota) =>
    pathname.startsWith(rota)
  );

  if (paginaPublica) {
    return <>{children}</>;
  }

  return <LayoutAdmin>{children}</LayoutAdmin>;
}