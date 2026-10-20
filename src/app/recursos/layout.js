export const metadata = {
  robots: { index: true, follow: true },
  title: "Funcionalidades para Barbearias",
  description: "Conheça os recursos do BarbSist para gestão de barbearias, agenda, clientes, comandas, caixa e divulgação.",
  alternates: {
    canonical: "/recursos",
  },
};

export default function PublicPageLayout({ children }) {
  return children;
}