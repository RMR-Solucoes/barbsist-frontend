"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { obterBarbeariaPublica } from "@/services/barbeariaService";
import { confirmarEmailCliente, reenviarCodigoCliente } from "@/services/portalClienteService";

function Confirmar() {
  const router = useRouter();
  const params = useSearchParams();
  const slug = (params.get("barbearia") || "").trim().toLowerCase();
  const email = params.get("email") || "";
  const [barbeariaNome, setBarbeariaNome] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [linkInvalido, setLinkInvalido] = useState(false);
  const [codigo, setCodigo] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");

  useEffect(() => {
    let ativo = true;
    if (!slug) {
      setLinkInvalido(true);
      setCarregando(false);
      return () => { ativo = false; };
    }
    obterBarbeariaPublica(slug)
      .then((dados) => { if (ativo) setBarbeariaNome(dados?.nome || "Barbearia"); })
      .catch(() => { if (ativo) setLinkInvalido(true); })
      .finally(() => { if (ativo) setCarregando(false); });
    return () => { ativo = false; };
  }, [slug]);

  async function enviar(event) {
    event.preventDefault();
    setErro("");
    try {
      await confirmarEmailCliente(slug, email, codigo);
      router.push(`/portal-cliente?barbearia=${encodeURIComponent(slug)}`);
    } catch (error) {
      setErro(error?.response?.data?.detail || "Código inválido.");
    }
  }

  async function reenviar() {
    setErro("");
    try {
      const resposta = await reenviarCodigoCliente(slug, email);
      setMensagem(resposta.mensagem);
    } catch {
      setErro("Não foi possível reenviar.");
    }
  }

  if (carregando) return <main className="min-h-screen bg-slate-950 p-8 text-center text-white">Carregando barbearia...</main>;
  if (linkInvalido) return <main className="min-h-screen bg-slate-950 p-8 text-center text-white">Barbearia não encontrada ou indisponível. Solicite o link correto à barbearia.</main>;

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-12">
      <form onSubmit={enviar} className="mx-auto max-w-md rounded-2xl bg-white p-7">
        <h1 className="text-2xl font-bold">Confirme seu e-mail</h1>
        <p className="mt-1 text-base font-semibold text-blue-700">{barbeariaNome}</p>
        <p className="mt-2 text-sm text-slate-600">Digite o código de 6 números enviado para {email}.</p>
        <input required inputMode="numeric" pattern="[0-9]{6}" maxLength={6} value={codigo} onChange={(event) => setCodigo(event.target.value.replace(/\D/g, ""))} className="mt-6 w-full rounded-lg border p-3 text-center text-2xl tracking-[.4em]" />
        {erro && <p className="mt-4 text-sm text-red-700">{erro}</p>}
        {mensagem && <p className="mt-4 text-sm text-green-700">{mensagem}</p>}
        <button className="mt-5 w-full rounded-lg bg-blue-600 p-3 font-semibold text-white">Confirmar e-mail</button>
        <button type="button" onClick={reenviar} className="mt-3 w-full p-2 text-blue-700">Reenviar código</button>
      </form>
    </main>
  );
}

export default function Page() {
  return <Suspense fallback={<main>Carregando...</main>}><Confirmar /></Suspense>;
}
