const BASE_URL = "https://www.barbsist.com.br";

export default function sitemap() {
  const paginas = [
    { rota: "/", prioridade: 1 },
    { rota: "/recursos", prioridade: 0.9 },
    { rota: "/como-funciona", prioridade: 0.9 },
    { rota: "/barbearias", prioridade: 0.9 },
    { rota: "/contato", prioridade: 0.6 },
  ];

  return paginas.map(({ rota, prioridade }) => ({
    url: `${BASE_URL}${rota}`,
    changeFrequency: "weekly",
    priority: prioridade,
  }));
}