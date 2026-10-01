"use client";

import { useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { fetchLeagueData, type LeagueIndexEntry, type Player } from "@/lib/leagues";

// Bucketing ported verbatim from public/index.html's renderDashboard()
// (pmsportsiq repo) so these numbers match the production app exactly for
// the same loaded data.
const ROLE_LABEL: Record<string, string> = {
  GK: "GK",
  CENTRE_BACK: "CB",
  SIDE_BACK: "FB",
  DEF_MID: "DM",
  ATT_MID: "CAM",
  WINGER: "Winger",
  STRIKER: "Striker",
};
const POS_ORDER = ["GK", "CB", "FB", "DM", "CAM", "Winger", "Striker"];
const AGE_BUCKET_LABELS = ["<18", "18-21", "22-25", "26-29", "30-33", "34+"];

function ageBucketIndex(age: number) {
  return age < 18 ? 0 : age <= 21 ? 1 : age <= 25 ? 2 : age <= 29 ? 3 : age <= 33 ? 4 : 5;
}

export function DashboardClient({ leagueIndex }: { leagueIndex: LeagueIndexEntry[] }) {
  const [loadedByLeague, setLoadedByLeague] = useState<Record<string, Player[]>>({});
  const [loading, setLoading] = useState(false);

  const loaded = useMemo(() => Object.values(loadedByLeague).flat(), [loadedByLeague]);

  const totalDb = useMemo(
    () => leagueIndex.reduce((s, r) => s + r.playerCount, 0),
    [leagueIndex],
  );
  const leagueCount = leagueIndex.length;
  const loadedCount = loaded.length;
  const avgAge = useMemo(() => {
    const ages = loaded.map((p) => p.age).filter((a) => a > 0);
    return ages.length ? ages.reduce((s, a) => s + a, 0) / ages.length : null;
  }, [loaded]);

  const posCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    loaded.forEach((p) => {
      const label = ROLE_LABEL[p.role] || "Other";
      counts[label] = (counts[label] || 0) + 1;
    });
    return POS_ORDER.filter((k) => counts[k]).map((k) => ({ label: k, count: counts[k] }));
  }, [loaded]);

  const topNationalities = useMemo(() => {
    const counts: Record<string, number> = {};
    loaded.forEach((p) => {
      const n = p.birthCountry || p.passportCountry;
      if (!n) return;
      counts[n] = (counts[n] || 0) + 1;
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  }, [loaded]);

  const ageBuckets = useMemo(() => {
    const counts = AGE_BUCKET_LABELS.map(() => 0);
    loaded.forEach((p) => {
      if (!p.age) return;
      counts[ageBucketIndex(p.age)]++;
    });
    return counts;
  }, [loaded]);

  const contractBuckets = useMemo(() => {
    const counts: Record<string, number> = {};
    loaded.forEach((p) => {
      const year = (p.contractExpires || "").slice(0, 4);
      if (year.length !== 4) return;
      counts[year] = (counts[year] || 0) + 1;
    });
    return Object.entries(counts).sort(([a], [b]) => a.localeCompare(b));
  }, [loaded]);

  const maxPos = Math.max(1, ...posCounts.map((p) => p.count));
  const maxNat = Math.max(1, ...topNationalities.map(([, c]) => c));
  const maxAge = Math.max(1, ...ageBuckets);
  const maxContract = Math.max(1, ...contractBuckets.map(([, c]) => c));

  async function loadFullStats() {
    setLoading(true);
    const supabase = createClient();
    const toLoad = leagueIndex.filter((l) => !loadedByLeague[l.name]);
    try {
      const results = await Promise.all(
        toLoad.map((l) => fetchLeagueData(supabase, l.name)),
      );
      setLoadedByLeague((prev) => {
        const next = { ...prev };
        toLoad.forEach((l, i) => {
          next[l.name] = results[i];
        });
        return next;
      });
    } finally {
      setLoading(false);
    }
  }

  const allLoaded = leagueIndex.length > 0 && leagueIndex.every((l) => loadedByLeague[l.name]);

  return (
    <div>
      <div className="flex items-end justify-between gap-4 mb-2">
        <div>
          <div className="font-mono text-[10px] tracking-[3px] text-pm-gold uppercase mb-2.5">
            Dashboard
          </div>
          <h1 className="font-display font-extrabold text-[34px] leading-none m-0 mb-1.5">
            Panorama da base
          </h1>
          <p className="text-[13px] text-pm-text-muted m-0">
            {loadedCount
              ? `Gráficos refletem ${loadedCount.toLocaleString("pt-BR")} jogadores carregados`
              : `${leagueCount} ligas na base — carregue os dados completos para ver os gráficos`}
          </p>
        </div>
        {!allLoaded && (
          <button
            onClick={loadFullStats}
            disabled={loading}
            className="font-mono text-[10px] tracking-[1.5px] uppercase border border-pm-gold-border bg-pm-gold-soft text-pm-gold px-4 py-2.5 disabled:opacity-50 shrink-0"
          >
            {loading ? "Carregando…" : "⬇ Load Full Stats"}
          </button>
        )}
      </div>

      <div className="flex gap-16 items-end mt-12 mb-14 pb-10 border-b border-pm-border">
        <div>
          <div className="font-display font-black text-[128px] leading-[0.82] tracking-[-1px]">
            {totalDb ? totalDb.toLocaleString("pt-BR") : "—"}
          </div>
          <div className="font-mono text-[11px] tracking-[2px] text-pm-text-muted uppercase mt-2.5">
            Jogadores na base
          </div>
        </div>
        <div className="flex flex-col gap-4 pl-10 border-l border-pm-border shrink-0">
          <KpiRow label="Ligas cobertas" value={leagueCount || "—"} />
          <KpiRow label="Carregados" value={loadedCount.toLocaleString("pt-BR")} />
          <KpiRow label="Idade média" value={avgAge ? avgAge.toFixed(1).replace(".", ",") : "—"} />
        </div>
      </div>

      {!loadedCount ? (
        <div className="font-mono text-[11px] text-pm-text-soft py-10 border-t border-pm-border">
          Clique em &ldquo;Load Full Stats&rdquo; para ver a distribuição por posição, nacionalidade, idade e
          contrato.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-24 mb-16">
            <section>
              <SectionHeader title="Jogadores por posição" meta="Base carregada" />
              {posCounts.map((p) => (
                <BarRow key={p.label} label={p.label} value={`${p.count.toLocaleString("pt-BR")}`} pct={(p.count / maxPos) * 100} />
              ))}
            </section>
            <section>
              <SectionHeader title="Principais nacionalidades" meta="Top 5" />
              {topNationalities.map(([name, count]) => (
                <BarRow key={name} label={name} value={count.toLocaleString("pt-BR")} pct={(count / maxNat) * 100} />
              ))}
            </section>
          </div>

          <div className="grid grid-cols-2 gap-24">
            <section>
              <SectionHeader title="Distribuição de idade" meta="15–40" />
              <MiniBars values={ageBuckets} labels={AGE_BUCKET_LABELS} max={maxAge} />
            </section>
            <section>
              <SectionHeader title="Vencimento de contrato" meta="Por ano" />
              <MiniBars
                values={contractBuckets.map(([, c]) => c)}
                labels={contractBuckets.map(([y]) => y)}
                max={maxContract}
              />
            </section>
          </div>
        </>
      )}
    </div>
  );
}

function KpiRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex items-baseline justify-between gap-9 min-w-[230px]">
      <span className="font-mono text-[10px] tracking-[1.5px] text-pm-text-muted uppercase">{label}</span>
      <span className="font-display font-bold text-[26px]">{value}</span>
    </div>
  );
}

function SectionHeader({ title, meta }: { title: string; meta: string }) {
  return (
    <div className="flex items-baseline justify-between mb-6">
      <span className="font-display font-bold text-xl tracking-[0.3px]">{title}</span>
      <span className="font-mono text-[9px] text-pm-text-soft tracking-[1.5px] uppercase">{meta}</span>
    </div>
  );
}

function BarRow({ label, value, pct }: { label: string; value: string; pct: number }) {
  return (
    <div className="flex items-center gap-5 py-3.5 border-t border-pm-border text-[15px] first:border-t-0">
      <span className="w-[108px] shrink-0 truncate">{label}</span>
      <span className="flex-1 h-[5px] bg-white/[0.06] shrink-0">
        <span className="block h-full bg-pm-gold" style={{ width: `${pct}%` }} />
      </span>
      <span className="font-mono text-[13px] text-pm-text w-[64px] text-right shrink-0">{value}</span>
    </div>
  );
}

function MiniBars({
  values,
  labels,
  max,
}: {
  values: number[];
  labels: string[];
  max: number;
}) {
  return (
    <div className="flex items-end gap-2.5 h-[140px] mt-2">
      {values.map((v, i) => (
        <div key={i} className="flex-1 flex flex-col items-center justify-end h-full gap-2">
          <span className="font-mono text-[11px] text-pm-text-muted">{v || ""}</span>
          <div
            className={v === max && v > 0 ? "w-full bg-pm-gold" : "w-full bg-[#2a3444]"}
            style={{ height: `${Math.max(3, (v / max) * 100)}%` }}
          />
          <span className="font-mono text-[9px] text-pm-text-soft tracking-[0.5px]">{labels[i]}</span>
        </div>
      ))}
    </div>
  );
}
