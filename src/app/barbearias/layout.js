export const metadata = {
  robots: { index: true, follow: true },
  title: "Encontre Barbearias Perto de Você",
  description: "Encontre barbearias próximas, consulte informações dos estabelecimentos e descubra opções de agendamento online.",
  alternates: {
    canonical: "/barbearias",
  },
};

export default function PublicPageLayout({ children }) {
  return children;
}