import ApresentacaoPage from "./apresentacao/page";

export const metadata = {
  robots: { index: true, follow: true },
  alternates: { canonical: "/" },
};

export default function HomePublica() {
  return <ApresentacaoPage />;
}
