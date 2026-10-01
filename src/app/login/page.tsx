"use client";

import { useActionState } from "react";
import { signIn } from "./actions";

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(signIn, undefined);

  return (
    <div className="min-h-screen flex items-center justify-center bg-pm-bg px-6">
      <div className="w-full max-w-sm">
        <div className="mb-10 text-center">
          <div className="font-display font-extrabold text-2xl tracking-[2px] text-pm-text">
            PM <span className="text-pm-gold">SPORTS IQ</span>
          </div>
          <div className="font-mono text-[10px] tracking-[3px] text-pm-text-soft uppercase mt-2">
            Scouting Intelligence
          </div>
        </div>

        <form action={formAction} className="flex flex-col gap-4">
          <div>
            <label
              htmlFor="email"
              className="block font-mono text-[10px] tracking-[1.5px] text-pm-text-soft uppercase mb-2"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className="w-full bg-pm-bg-raised border border-pm-border-strong text-pm-text text-sm px-3.5 py-2.5 outline-none focus:border-pm-gold-border"
              placeholder="voce@clube.com"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block font-mono text-[10px] tracking-[1.5px] text-pm-text-soft uppercase mb-2"
            >
              Senha
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="w-full bg-pm-bg-raised border border-pm-border-strong text-pm-text text-sm px-3.5 py-2.5 outline-none focus:border-pm-gold-border"
              placeholder="••••••••"
            />
          </div>

          {state?.error && (
            <div className="font-mono text-[11px] text-pm-danger">{state.error}</div>
          )}

          <button
            type="submit"
            disabled={pending}
            className="mt-2 bg-pm-gold text-pm-bg font-mono text-xs tracking-[1.5px] uppercase py-2.5 disabled:opacity-60"
          >
            {pending ? "Entrando…" : "Entrar"}
          </button>
        </form>

        <div className="mt-6 text-center font-mono text-[10px] text-pm-text-soft">
          Primeiro acesso? Fale com{" "}
          <a href="mailto:peeumoraes@gmail.com" className="text-pm-gold">
            peeumoraes@gmail.com
          </a>
        </div>
      </div>
    </div>
  );
}
