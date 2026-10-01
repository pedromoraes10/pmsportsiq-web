import type { SupabaseClient } from "@supabase/supabase-js";

interface AllowedUserRow {
  plan: string | null;
  plan_expires_at: string | null;
  trial_until: string | null;
  features: string | null;
}

export interface AccessStatus {
  hasAccess: boolean;
  isAdmin: boolean;
  features: string;
}

// Ported verbatim from public/index.html's checkPlanAccess (the pmsportsiq
// repo) plus the isAdmin/features lookup from its onAuthStateChange
// handler, merged into one query. Same allowed_users table, same columns,
// same "fail open" behavior on a query error (the old app treats a missing
// table/network error as "allow access" rather than locking everyone out).
export async function checkAccess(
  supabase: SupabaseClient,
  email: string,
): Promise<AccessStatus> {
  try {
    const { data, error } = await supabase
      .from("allowed_users")
      .select("plan,plan_expires_at,trial_until,features")
      .eq("email", email);

    if (error) return { hasAccess: true, isAdmin: false, features: "all" };

    const rows = (data || []) as AllowedUserRow[];
    if (!rows.length) return { hasAccess: false, isAdmin: false, features: "" };

    const row = rows[0];
    const now = new Date();
    const isAdmin = row.plan === "admin";
    const features = row.features || "all";

    if (row.trial_until && new Date(row.trial_until) > now)
      return { hasAccess: true, isAdmin, features };
    if (row.plan === "pro" && row.plan_expires_at && new Date(row.plan_expires_at) > now)
      return { hasAccess: true, isAdmin, features };
    if (isAdmin) return { hasAccess: true, isAdmin, features };
    if (row.plan === "enterprise") return { hasAccess: true, isAdmin, features };

    return { hasAccess: false, isAdmin, features };
  } catch {
    return { hasAccess: true, isAdmin: false, features: "all" };
  }
}
