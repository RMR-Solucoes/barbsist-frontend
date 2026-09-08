"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { carregarPerfilCliente, obterTokenCliente, sairPortalCliente } from "@/services/portalClienteService";

export default function InicioPortalClientePage() {
  const router = useRouter();
  const [perfil, setPerfil] = useState(null);
  const [erro, setErro] = useState("");

  useEffect(() => {
    if (!obterTokenCliente()) { router.replace("/cliente"); return; }
    carregarPerfilCliente().then(setPerfil).catch((error) => {
      sairPortalCliente();
      setErro(error?.response?.data?.detail || "Sua sessão expirou.");
    });
  }, [router]);

  function sair() { sairPortalCliente(); router.replace("/cliente"); }

  if (erro) return <main className="min-h-screen bg-slate-100 p-8"><div className="mx-auto max-w-xl rounded-xl bg-white p-6"><p className="text-red-700">{erro}</p><button onClick={sair} className="mt-4 text-blue-700">Voltar ao login</button></div></main>;
  if (!perfil) return <main className="min-h-screen bg-slate-100 p-8 text-center">Carregando seu portal...</main>;

  return (
    <main className="min-h-screen bg-slate-100 p-4 md:p-8">
      <div className="mx-auto max-w-5xl">
        <header className="flex items-center justify-between rounded-2xl bg-slate-950 p-6 text-white">
          <div><p className="text-sm text-blue-300">{perfil.barbearia_nome}</p><h1 className="text-2xl font-bold">Olá, {perfil.nome}</h1></div>
          <button onClick={sair} className="rounded-lg border border-slate-600 px-4 py-2">Sair</button>
        </header>
        {perfil.deve_trocar_senha && <p className="mt-4 rounded-xl bg-amber-100 p-4 text-amber-900">Por segurança, altere a senha inicial no primeiro acesso.</p>}
        <section className="mt-6 grid gap-4 md:grid-cols-3">
          <article className="rounded-xl bg-white p-5 shadow"><h2 className="font-bold">Meu plano</h2><p className="mt-2 text-sm text-slate-600">Será conectado ao histórico financeiro na próxima etapa.</p></article>
          <article className="rounded-xl bg-white p-5 shadow"><h2 className="font-bold">Pagamentos</h2><p className="mt-2 text-sm text-slate-600">Consulta segura pelo cliente autenticado será adicionada na próxima etapa.</p></article>
          <article className="rounded-xl bg-white p-5 shadow"><h2 className="font-bold">Agendamento</h2><p className="mt-2 text-sm text-slate-600">{perfil.permitir_agendamento_portal ? "Habilitado pela barbearia." : "Não disponibilizado pela barbearia."}</p></article>
        </section>
      </div>
    </main>
  );
}
