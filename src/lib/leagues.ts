import type { SupabaseClient } from "@supabase/supabase-js";
import { getRoleCat, type RoleCat } from "@/lib/scoring/positions";

// Field shape ported from public/index.html's loadLeagueData/
// saveOneLeagueToStorage in the pmsportsiq repo. The `leagues.data` column
// stores players with short keys (n, t, p, m, g, a, b, pc, ft, ht, wt, mv,
// ce, ol, ag, r, s) to save space; decode/encode here mirror that mapping
// exactly so this app reads/writes the same rows the existing production
// app does, with zero data migration.
export interface Player {
  name: string;
  team: string;
  position: string;
  mins: number;
  goals: number;
  assists: number;
  birthCountry: string;
  passportCountry: string;
  foot: string;
  height: number;
  weight: number;
  marketValue: number;
  contractExpires: string;
  onLoan: string;
  age: number;
  role: RoleCat;
  stats: Record<string, number>;
  league: string;
}

interface RawPlayer {
  n: string;
  t: string;
  p: string;
  m?: number;
  g?: number;
  a?: number;
  b?: string;
  pc?: string;
  ft?: string;
  ht?: number;
  wt?: number;
  mv?: number;
  ce?: string;
  ol?: string;
  ag?: number;
  r?: RoleCat;
  s?: Record<string, number>;
}

export function decodePlayer(p: RawPlayer, league: string): Player {
  return {
    name: p.n,
    team: p.t,
    position: p.p,
    mins: p.m || 0,
    goals: p.g || 0,
    assists: p.a || 0,
    birthCountry: p.b || "",
    passportCountry: p.pc || "",
    foot: p.ft || "",
    height: p.ht || 0,
    weight: p.wt || 0,
    marketValue: p.mv || 0,
    contractExpires: p.ce || "",
    onLoan: p.ol || "",
    age: p.ag || 0,
    role: p.r || getRoleCat(p.p),
    stats: p.s || {},
    league,
  };
}

export interface LeagueIndexEntry {
  name: string;
  playerCount: number;
}

/** Lightweight — no player blobs. Powers the Total Players (DB) / Leagues KPIs. */
export async function fetchLeagueIndex(
  supabase: SupabaseClient,
): Promise<LeagueIndexEntry[]> {
  const { data, error } = await supabase
    .from("leagues")
    .select("name,player_count")
    .order("name");
  if (error) throw error;
  return (data || []).map((r) => ({
    name: r.name as string,
    playerCount: (r.player_count as number) || 0,
  }));
}

/** Full player blob for one league — only call for leagues the user chose to load. */
export async function fetchLeagueData(
  supabase: SupabaseClient,
  name: string,
): Promise<Player[]> {
  const { data, error } = await supabase
    .from("leagues")
    .select("data")
    .eq("name", name)
    .limit(1);
  if (error) throw error;
  const row = data?.[0] as { data?: RawPlayer[] } | undefined;
  return (row?.data || []).map((p) => decodePlayer(p, name));
}
