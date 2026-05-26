// @ts-nocheck
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-admin-password",
};

const ADMIN_PASSWORD = Deno.env.get("ADMIN_PASSWORD") ?? "wl2026admin";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = req.method === "POST" ? await req.json().catch(() => ({})) : {};
    const pwd = req.headers.get("x-admin-password") ?? body?.password ?? "";
    if (pwd !== ADMIN_PASSWORD) {
      return json({ ok: false, error: "Unauthorized" }, 401);
    }

    const action = body?.action ?? "list";

    if (action === "list") {
      const { sede, grupo, deposito } = body?.filters ?? {};
      let q = supabase.from("leads_verano").select("*").order("created_at", { ascending: false }).limit(2000);
      if (sede && sede !== "todos") q = q.eq("venue", sede);
      if (grupo && grupo !== "todos") q = q.eq("grupo", grupo);
      if (deposito === "pagado") q = q.eq("deposito_pagado", true);
      if (deposito === "pendiente") q = q.eq("deposito_pagado", false);
      const { data, error } = await q;
      if (error) return json({ ok: false, error: error.message, details: error }, 500);
      return json({ ok: true, data });
    }

    if (!body?.id) return json({ ok: false, error: "id required" }, 400);
    const id = body.id;
    const now = new Date().toISOString();

    if (action === "update_deposito") {
      const paid = !!body.paid;
      const update: Record<string, unknown> = {
        deposito_pagado: paid,
        deposito_fecha: paid ? now : null,
      };
      if (paid && body.metodo) update.deposito_metodo = body.metodo;
      if (typeof body.monto === "number") update.deposito_monto = body.monto;
      if (body.estado) update.estado = body.estado;
      const { data, error } = await supabase.from("leads_verano").update(update).eq("id", id).select().single();
      if (error) return json({ ok: false, error: error.message, details: error }, 500);
      return json({ ok: true, data });
    }

    if (action === "update_saldo") {
      const paid = !!body.paid;
      const update: Record<string, unknown> = {
        saldo_pagado: paid,
        saldo_fecha: paid ? now : null,
      };
      if (paid && body.metodo) update.saldo_metodo = body.metodo;
      if (typeof body.monto === "number") update.saldo_monto = body.monto;
      if (body.estado) update.estado = body.estado;
      const { data, error } = await supabase.from("leads_verano").update(update).eq("id", id).select().single();
      if (error) return json({ ok: false, error: error.message, details: error }, 500);
      return json({ ok: true, data });
    }

    if (action === "update_notas") {
      const { data, error } = await supabase
        .from("leads_verano")
        .update({ notas: body.notas ?? null })
        .eq("id", id)
        .select()
        .single();
      if (error) return json({ ok: false, error: error.message, details: error }, 500);
      return json({ ok: true, data });
    }

    if (action === "delete") {
      const { error } = await supabase.from("leads_verano").delete().eq("id", id);
      if (error) return json({ ok: false, error: error.message, details: error }, 500);
      return json({ ok: true });
    }

    return json({ ok: false, error: `Unknown action: ${action}` }, 400);
  } catch (e: any) {
    console.error("admin-leads-verano error:", e);
    return json({ ok: false, error: e?.message ?? String(e) }, 500);
  }
});
