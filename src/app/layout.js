import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import LayoutWrapper from "../components/LayoutWrapper";
import { AuthProvider } from "@/contexts/AuthContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  metadataBase: new URL("https://www.barbsist.com.br"),
  title: {
    default: "BarbSist | Sistema de Gestão e Agenda para Barbearias",
    template: "%s | BarbSist",
  },
  description:
    "Gerencie sua barbearia com agenda online, clientes, comandas, caixa e planos. Divulgue seu estabelecimento e seja encontrado por novos clientes.",

  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "https://www.barbsist.com.br",
    siteName: "BarbSist",
    title: "BarbSist | Gestão, Agenda e Divulgação de Barbearias",
    description:
      "Sistema para organizar sua barbearia, gerenciar agendamentos e divulgar seu estabelecimento.",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable}`}
    >
      <body>
        <AuthProvider>
          <LayoutWrapper>
            {children}
          </LayoutWrapper>
        </AuthProvider>
      </body>
    </html>
  );
}