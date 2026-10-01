// Ported verbatim from public/index.html (getRoleCat) in the pmsportsiq repo.
// Do not "clean up" this regex table — see the rebuild plan's note on why
// data tables that feed scoring/bucketing must be copied exactly, not
// re-derived, since even an innocuous reordering can shift which bucket a
// player lands in.
export type RoleCat =
  | "GK"
  | "CENTRE_BACK"
  | "SIDE_BACK"
  | "DEF_MID"
  | "ATT_MID"
  | "WINGER"
  | "STRIKER";

export function getRoleCat(pos: string | undefined | null): RoleCat {
  if (!pos) return "ATT_MID";
  const p = String(pos).split(",")[0].trim().toUpperCase();
  if (/^GK/.test(p)) return "GK";
  if (/^(RCB|LCB|CBR|CBL|CB)$/.test(p)) return "CENTRE_BACK";
  if (/^(RWB|LWB|RB|LB)$/.test(p)) return "SIDE_BACK";
  if (/DMF|CDM/.test(p)) return "DEF_MID";
  if (/AMF|CAM|LAMF|RAMF/.test(p)) return "ATT_MID";
  if (/RCMF|LCMF|CMF/.test(p) || /^(CM|LCM|RCM)$/.test(p)) return "DEF_MID";
  if (/RWF|LWF|RWG|LWG|RAM|LAM/.test(p) || /^(RW|LW)$/.test(p))
    return "WINGER";
  if (/^(CF|ST|SS)$/.test(p)) return "STRIKER";
  return "ATT_MID";
}
