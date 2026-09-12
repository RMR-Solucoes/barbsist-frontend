"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { obterBarbeariaPublica } from "@/services/barbeariaService";
import {
  loginCliente,
  obterBarbeariaPortal,
  salvarBarbeariaPortal,
} from "@/services/portalClienteService";

function Login() {
  const router = useRouter();
  const params = useSearchParams();
  const [slug, setSlug] = useState("");
  const [barbeariaNome, setBarbeariaNome] = useState("");
  const [carregandoBarbearia, setCarregandoBarbearia] = useState(true);
  const [linkInvalido, setLinkInvalido] = useState(false);
  const [form, setForm] = useState({ email: "", senha: "" });
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    let ativo = true;
    const valor = (params.get("barbearia") || obterBarbeariaPortal() || "")
      .trim()
      .toLowerCase();

    setSlug(valor);
    setErro("");
    setLinkInvalido(false);
    setCarregandoBarbearia(true);

    if (!valor) {
      setLinkInvalido(true);
      setCarregandoBarbearia(false);
      return () => { ativo = false; };
    }

    obterBarbeariaPublica(valor)
      .then((dados) => {
        if (!ativo) return;
        setBarbeariaNome(dados?.nome || "Barbearia");
        salvarBarbeariaPortal(valor);
      })
      .catch(() => {
        if (!ativo) return;
        setLinkInvalido(true);
      })
      .finally(() => {
        if (ativo) setCarregandoBarbearia(false);
      });

    return () => { ativo = false; };
  }, [params]);

  async function entrar(event) {
    event.preventDefault();
    if (linkInvalido || !slug) return;
    setErro("");
    setEnviando(true);
    try {
      await loginCliente(slug, form.email.trim().toLowerCase(), form.senha);
      router.push("/portal-cliente/inicio");
    } catch (error) {
      setErro(error?.response?.data?.detail || "Não foi possível entrar.");
    } finally {
      setEnviando(false);
    }
  }

  if (carregandoBarbearia) {
    return <main className="min-h-screen bg-slate-950 p-8 text-center text-white">Carregando barbearia...</main>;
  }

  if (linkInvalido) {
    return <main className="min-h-screen bg-slate-950 p-8 text-center text-white">Barbearia não encontrada ou indisponível. Solicite o link correto à barbearia.</main>;
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-12 text-slate-100">
      <form onSubmit={entrar} className="mx-auto max-w-md rounded-2xl bg-white p-7 text-slate-900 shadow-2xl">
        <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">BarbSist</p>
        <h1 className="mt-2 text-2xl font-bold">Portal do cliente</h1>
        <p className="mt-1 text-base font-semibold text-blue-700">{barbeariaNome}</p>
        <p className="mt-2 text-sm text-slate-600">Entre para acessar seus dados.</p>

        <div className="mt-7 space-y-4">
          <label className="block text-sm font-medium">E-mail
            <input required type="email" autoComplete="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} className="mt-1 w-full rounded-lg border p-3" />
          </label>
          <label className="block text-sm font-medium">Senha
            <input required type="password" minLength={8} autoComplete="current-password" value={form.senha} onChange={(event) => setForm({ ...form, senha: event.target.value })} className="mt-1 w-full rounded-lg border p-3" />
          </label>
        </div>

        {erro && <p role="alert" className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{erro}</p>}
        <button disabled={enviando} className="mt-6 w-full rounded-lg bg-blue-600 p-3 font-semibold text-white disabled:opacity-60">{enviando ? "Entrando..." : "Entrar"}</button>
        <Link className="mt-5 block text-center font-medium text-blue-700" href={`/portal-cliente/criar-conta?barbearia=${encodeURIComponent(slug)}`}>Criar conta / Primeiro acesso</Link>
        <p className="mt-3 text-center text-sm text-slate-500">Esqueci minha senha — disponível na próxima etapa.</p>
      </form>
    </main>
  );
}

export default function Page() {
  return <Suspense fallback={<main className="min-h-screen bg-slate-950 p-8 text-center text-white">Carregando...</main>}><Login /></Suspense>;
}
