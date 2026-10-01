import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { checkAccess } from "@/lib/auth";
import { fetchLeagueIndex } from "@/lib/leagues";
import { DashboardClient } from "./DashboardClient";
import { AppShell } from "@/components/AppShell";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const access = await checkAccess(supabase, user.email!);

  if (!access.hasAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-pm-bg px-6 text-center">
        <div>
          <div className="font-display font-extrabold text-xl text-pm-text mb-2">
            Acesso pendente
          </div>
          <p className="font-mono text-[11px] text-pm-text-soft max-w-sm">
            Sua conta ainda não tem um plano ativo. Fale com{" "}
            <a href="mailto:peeumoraes@gmail.com" className="text-pm-gold">
              peeumoraes@gmail.com
            </a>{" "}
            para liberar o acesso.
          </p>
        </div>
      </div>
    );
  }

  const leagueIndex = await fetchLeagueIndex(supabase);

  return (
    <AppShell userEmail={user.email!} isAdmin={access.isAdmin} active="dashboard">
      <DashboardClient leagueIndex={leagueIndex} />
    </AppShell>
  );
}
