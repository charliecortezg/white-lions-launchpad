import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const NAVY = "#2D2B6B";
const BG = "#F8F7F5";

type Lead = {
  id: string;
  created_at: string;
  nombre_padre: string;
  telefono: string;
  email: string | null;
  nombre_jugador: string;
  edad_jugador: number;
  grupo: string;
  venue: string | null;
  mes_interes: string;
  paquete_interes: string;
  forma_pago: string | null;
  estado: string;
  deposito_monto: number | null;
  deposito_pagado: boolean;
  deposito_fecha: string | null;
  deposito_metodo: string | null;
  saldo_monto: number | null;
  saldo_pagado: boolean;
  saldo_fecha: string | null;
  saldo_metodo: string | null;
  notas: string | null;
};

const PRECIO_TOTAL: Record<string, number> = {
  mes_completo: 3600,
  "2_semanas": 1800,
  "1_semana": 1000,
  dia_suelto: 250,
};

const VENUE_LABEL: Record<string, string> = {
  futcenter: "Futcenter",
  city_sports: "City Sports",
};

function calcExpected(l: Lead): { dep: number; saldo: number } {
  // Nuevo esquema: depósito $1,000 fijo
  if (l.paquete_interes === "mes_completo" && l.forma_pago === "deposito")
    return { dep: 1000, saldo: 3000 };
  if (l.paquete_interes === "2_semanas" && l.forma_pago === "deposito")
    return { dep: 1000, saldo: 1000 };
  const total = PRECIO_TOTAL[l.paquete_interes] ?? 0;
  return { dep: total, saldo: 0 };
}

function fmt(n: number) {
  return "$" + n.toLocaleString("es-MX") + " MXN";
}

const PASSWORD = (import.meta.env.VITE_ADMIN_PASSWORD as string) || "wl2026admin";

const PAQUETE_LABEL: Record<string, string> = {
  mes_completo: "Mes completo",
  "2_semanas": "2 semanas",
  "1_semana": "1 semana",
  dia_suelto: "Día suelto",
};

const ESTADO_COLOR: Record<string, string> = {
  lead: "#6B7280",
  deposito_pagado: "#EAB308",
  saldo_pendiente: "#F97316",
  pago_completo: "#16A34A",
  inscrito: "#2D2B6B",
};

function deriveEstado(l: Lead): string {
  if (l.estado === "inscrito") return "inscrito";
  if (l.deposito_pagado && l.saldo_pagado) return "pago_completo";
  if (l.deposito_pagado && (calcExpected(l).saldo > 0) && !l.saldo_pagado) return "saldo_pendiente";
  if (l.deposito_pagado) return "deposito_pagado";
  return "lead";
}

export default function Admin() {
  const [authed, setAuthed] = useState(false);
  const [pwd, setPwd] = useState("");
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [mes, setMes] = useState("todos");
  const [grupo, setGrupo] = useState("todos");
  const [sede, setSede] = useState("todos");
  const [depF, setDepF] = useState("todos");
  const [estadoF, setEstadoF] = useState("todos");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [showResumen, setShowResumen] = useState(false);

  // Saldo modal
  const [saldoFor, setSaldoFor] = useState<Lead | null>(null);
  const [editNotes, setEditNotes] = useState<string | null>(null);
  const [notesValue, setNotesValue] = useState("");

  useEffect(() => {
    document.title = "Admin Verano 2026 — White Lions Academy";
    let m = document.querySelector('meta[name="robots"]');
    if (!m) {
      m = document.createElement("meta");
      m.setAttribute("name", "robots");
      document.head.appendChild(m);
    }
    m.setAttribute("content", "noindex, nofollow");
    if (localStorage.getItem("wl_admin_auth") === "true") setAuthed(true);
  }, []);

  useEffect(() => {
    if (!authed) return;
    fetchLeads();
    const ch = supabase
      .channel("leads_verano_admin")
      .on("postgres_changes", { event: "*", schema: "public", table: "leads_verano" }, (payload: any) => {
        if (payload.eventType === "INSERT") {
          toast({ title: "Nuevo lead", description: payload.new.nombre_jugador ?? "" });
        }
        fetchLeads();
      })
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [authed]);

  async function fetchLeads() {
    setLoading(true);
    const { data, error } = await supabase
      .from("leads_verano")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1000);
    if (error) toast({ title: "Error cargando", description: error.message, variant: "destructive" });
    setLeads((data as any) || []);
    setLoading(false);
  }

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (pwd === PASSWORD) {
      localStorage.setItem("wl_admin_auth", "true");
      setAuthed(true);
    } else {
      toast({ title: "Contraseña incorrecta", variant: "destructive" });
    }
  }

  function logout() {
    localStorage.removeItem("wl_admin_auth");
    setAuthed(false);
  }

  // Filtered (by month for metrics)
  const byMonth = useMemo(
    () => (mes === "todos" ? leads : leads.filter((l) => l.mes_interes === mes)),
    [leads, mes]
  );

  // Metrics
  const metrics = useMemo(() => {
    let recaudado = 0;
    let porCobrar = 0;
    let grupoA = 0;
    let grupoB = 0;
    let leadsCount = 0;
    for (const l of byMonth) {
      const exp = calcExpected(l);
      const depMonto = l.deposito_monto ?? exp.dep;
      const saldoMonto = l.saldo_monto ?? exp.saldo;
      if (l.deposito_pagado) recaudado += depMonto;
      if (l.saldo_pagado) recaudado += saldoMonto;
      if (l.deposito_pagado && !l.saldo_pagado && saldoMonto > 0) porCobrar += saldoMonto;
      if (l.estado !== "lead" || l.deposito_pagado) {
        if (l.grupo === "A") grupoA++;
        else if (l.grupo === "B") grupoB++;
      }
      if (deriveEstado(l) === "lead") leadsCount++;
    }
    return { recaudado, porCobrar, grupoA, grupoB, leadsCount };
  }, [byMonth]);

  // Filtered table
  const filtered = useMemo(() => {
    return byMonth.filter((l) => {
      if (grupo !== "todos" && l.grupo !== grupo) return false;
      if (sede !== "todos" && (l.venue ?? "") !== sede) return false;
      if (depF === "pagado" && !l.deposito_pagado) return false;
      if (depF === "pendiente" && l.deposito_pagado) return false;
      if (estadoF !== "todos" && deriveEstado(l) !== estadoF) return false;
      if (search) {
        const s = search.toLowerCase();
        if (!l.nombre_padre.toLowerCase().includes(s) && !l.nombre_jugador.toLowerCase().includes(s)) return false;
      }
      return true;
    });
  }, [byMonth, grupo, sede, depF, estadoF, search]);

  const PAGE_SIZE = 20;
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  async function confirmSaldo(metodo: string) {
    if (!saldoFor) return;
    const exp = calcExpected(saldoFor);
    const { error } = await supabase
      .from("leads_verano")
      .update({
        saldo_pagado: true,
        saldo_metodo: metodo,
        saldo_fecha: new Date().toISOString(),
        saldo_monto: saldoFor.saldo_monto ?? exp.saldo,
        estado: "pago_completo",
      })
      .eq("id", saldoFor.id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else toast({ title: "Saldo registrado" });
    setSaldoFor(null);
    fetchLeads();
  }

  async function saveNotes(id: string) {
    const { error } = await supabase.from("leads_verano").update({ notas: notesValue }).eq("id", id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else toast({ title: "Notas guardadas" });
    setEditNotes(null);
    fetchLeads();
  }

  async function toggleDeposito(l: Lead) {
    const exp = calcExpected(l);
    const newPaid = !l.deposito_pagado;
    const { error } = await supabase
      .from("leads_verano")
      .update({
        deposito_pagado: newPaid,
        deposito_fecha: newPaid ? new Date().toISOString() : null,
        deposito_monto: l.deposito_monto ?? exp.dep,
        estado: newPaid ? (l.saldo_pagado ? "pago_completo" : "deposito_pagado") : "lead",
      })
      .eq("id", l.id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else toast({ title: newPaid ? "Depósito marcado como pagado" : "Depósito revertido" });
    fetchLeads();
  }

  async function toggleSaldoQuick(l: Lead) {
    const exp = calcExpected(l);
    const newPaid = !l.saldo_pagado;
    const { error } = await supabase
      .from("leads_verano")
      .update({
        saldo_pagado: newPaid,
        saldo_fecha: newPaid ? new Date().toISOString() : null,
        saldo_monto: l.saldo_monto ?? exp.saldo,
        estado: newPaid && l.deposito_pagado ? "pago_completo" : (l.deposito_pagado ? "deposito_pagado" : "lead"),
      })
      .eq("id", l.id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else toast({ title: newPaid ? "Saldo marcado como pagado" : "Saldo revertido" });
    fetchLeads();
  }

  function copyPhone(p: string) {
    navigator.clipboard.writeText(p);
    toast({ title: "Teléfono copiado" });
  }

  function exportCSV() {
    const rows = filtered;
    const headers = [
      "created_at","nombre_padre","telefono","email","nombre_jugador","edad_jugador",
      "grupo","mes_interes","paquete_interes","forma_pago","estado",
      "deposito_monto","deposito_pagado","deposito_fecha","deposito_metodo",
      "saldo_monto","saldo_pagado","saldo_fecha","saldo_metodo","notas",
    ];
    const csv = [headers.join(",")].concat(
      rows.map((r: any) => headers.map((h) => `"${String(r[h] ?? "").replace(/"/g, '""')}"`).join(","))
    ).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `verano-leads-${mes}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // Resumen financiero
  const resumen = useMemo(() => {
    const meses = ["junio", "julio", "agosto"];
    return meses.map((m) => {
      const ls = leads.filter((l) => l.mes_interes === m);
      let bruto = 0;
      let saldoPend = 0;
      for (const l of ls) {
        const exp = calcExpected(l);
        const depMonto = l.deposito_monto ?? exp.dep;
        const saldoMonto = l.saldo_monto ?? exp.saldo;
        if (l.deposito_pagado) bruto += depMonto;
        if (l.saldo_pagado) bruto += saldoMonto;
        if (l.deposito_pagado && !l.saldo_pagado) saldoPend += saldoMonto;
      }
      return {
        mes: m,
        jugadores: ls.filter((l) => l.deposito_pagado).length,
        bruto,
        futcenter: Math.round(bruto * 0.2),
        wl: Math.round(bruto * 0.8),
        saldoPend,
      };
    });
  }, [leads]);

  // ===== LOGIN =====
  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: BG }}>
        <form onSubmit={handleLogin} className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-sm">
          <h1 className="text-2xl font-black mb-2" style={{ color: NAVY }}>White Lions Academy</h1>
          <p className="text-sm text-gray-600 mb-6">Admin Verano 2026</p>
          <input
            type="password"
            value={pwd}
            onChange={(e) => setPwd(e.target.value)}
            placeholder="Contraseña"
            autoFocus
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg mb-4 focus:outline-none focus:border-black"
          />
          <button type="submit" className="w-full py-3 text-white font-bold rounded-lg" style={{ background: NAVY }}>
            Entrar
          </button>
        </form>
      </div>
    );
  }

  // ===== DASHBOARD =====
  return (
    <div className="min-h-screen" style={{ background: BG, fontFamily: "'Inter', system-ui, sans-serif" }}>
      <header className="sticky top-0 z-30 text-white shadow-md" style={{ background: NAVY }}>
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="font-bold text-sm sm:text-base">White Lions Academy — Admin Verano 2026</div>
          <div className="flex items-center gap-2">
            <select value={mes} onChange={(e) => { setMes(e.target.value); setPage(1); }}
              className="bg-white text-black px-3 py-1.5 rounded text-sm">
              <option value="todos">Todos los meses</option>
              <option value="junio">Junio</option>
              <option value="julio">Julio</option>
              <option value="agosto">Agosto</option>
            </select>
            <button onClick={logout} className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded text-sm">
              Cerrar sesión
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* METRICS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-xl shadow-sm">
            <div className="text-xs uppercase text-gray-500 font-bold mb-1">Total recaudado</div>
            <div className="text-2xl font-black" style={{ color: NAVY }}>{fmt(metrics.recaudado)}</div>
          </div>
          <div className="bg-white p-5 rounded-xl shadow-sm">
            <div className="text-xs uppercase text-gray-500 font-bold mb-1">Saldo por cobrar</div>
            <div className="text-2xl font-black" style={{ color: metrics.porCobrar > 0 ? "#F97316" : NAVY }}>
              {fmt(metrics.porCobrar)}
            </div>
          </div>
          <div className="bg-white p-5 rounded-xl shadow-sm">
            <div className="text-xs uppercase text-gray-500 font-bold mb-2">Lugares ocupados</div>
            <div className="text-sm font-bold mb-2">{metrics.grupoA}/15 Grupo A · {metrics.grupoB}/15 Grupo B</div>
            <div className="space-y-1">
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full" style={{ width: `${Math.min(100, (metrics.grupoA/15)*100)}%`, background: NAVY }} />
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full" style={{ width: `${Math.min(100, (metrics.grupoB/15)*100)}%`, background: "#C4317A" }} />
              </div>
            </div>
          </div>
          <div className="bg-white p-5 rounded-xl shadow-sm">
            <div className="text-xs uppercase text-gray-500 font-bold mb-1">Leads sin convertir</div>
            <div className="text-2xl font-black" style={{ color: metrics.leadsCount > 0 ? "#DC2626" : NAVY }}>
              {metrics.leadsCount}
            </div>
          </div>
        </div>

        {/* FILTERS */}
        <div className="bg-white p-4 rounded-xl shadow-sm flex flex-wrap gap-2">
          <select value={grupo} onChange={(e) => { setGrupo(e.target.value); setPage(1); }}
            className="px-3 py-2 border rounded text-sm">
            <option value="todos">Todos los grupos</option>
            <option value="A">Grupo A</option>
            <option value="B">Grupo B</option>
          </select>
          <select value={sede} onChange={(e) => { setSede(e.target.value); setPage(1); }}
            className="px-3 py-2 border rounded text-sm">
            <option value="todos">Todas las sedes</option>
            <option value="futcenter">Futcenter</option>
            <option value="city_sports">City Sports</option>
          </select>
          <select value={depF} onChange={(e) => { setDepF(e.target.value); setPage(1); }}
            className="px-3 py-2 border rounded text-sm">
            <option value="todos">Depósito: todos</option>
            <option value="pagado">Depósito pagado</option>
            <option value="pendiente">Depósito pendiente</option>
          </select>
          <select value={estadoF} onChange={(e) => { setEstadoF(e.target.value); setPage(1); }}
            className="px-3 py-2 border rounded text-sm">
            <option value="todos">Todos los estados</option>
            <option value="lead">Lead</option>
            <option value="deposito_pagado">Depósito pagado</option>
            <option value="saldo_pendiente">Saldo pendiente</option>
            <option value="pago_completo">Pago completo</option>
            <option value="inscrito">Inscrito</option>
          </select>
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Buscar nombre..."
            className="px-3 py-2 border rounded text-sm flex-1 min-w-[180px]"
          />
          <button onClick={fetchLeads} className="px-3 py-2 text-sm border rounded hover:bg-gray-50">
            ↻ Recargar
          </button>
        </div>

        {/* TABLE */}
        <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Cargando...</div>
          ) : paged.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No hay registros con esos filtros.</div>
          ) : (
            <table className="w-full text-sm min-w-[1100px]">
              <thead className="bg-gray-50 text-left text-xs uppercase text-gray-600">
                <tr>
                  <th className="p-3">Jugador</th>
                  <th className="p-3">Padre</th>
                  <th className="p-3">Contacto</th>
                  <th className="p-3">Sede</th>
                  <th className="p-3">Paquete</th>
                  <th className="p-3">Depósito</th>
                  <th className="p-3">Saldo</th>
                  <th className="p-3">Estado</th>
                  <th className="p-3">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {paged.map((l) => {
                  const exp = calcExpected(l);
                  const depMonto = l.deposito_monto ?? exp.dep;
                  const saldoMonto = l.saldo_monto ?? exp.saldo;
                  const est = deriveEstado(l);
                  return (
                    <tr key={l.id} className="border-t hover:bg-gray-50 align-top">
                      <td className="p-3">
                        <div className="font-bold">{l.nombre_jugador}</div>
                        <div className="text-xs text-gray-500">{l.edad_jugador} años</div>
                        <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-bold rounded text-white"
                          style={{ background: l.grupo === "A" ? NAVY : "#C4317A" }}>
                          Grupo {l.grupo}
                        </span>
                      </td>
                      <td className="p-3">{l.nombre_padre}</td>
                      <td className="p-3">
                        <div className="flex items-center gap-1">
                          <span>{l.telefono}</span>
                          <button onClick={() => copyPhone(l.telefono)} className="text-xs text-blue-600 hover:underline">📋</button>
                        </div>
                        {l.email && <div className="text-xs text-gray-500">{l.email}</div>}
                      </td>
                      <td className="p-3">
                        <span className="inline-block px-2 py-1 text-xs font-bold rounded bg-gray-100">
                          {PAQUETE_LABEL[l.paquete_interes]}
                        </span>
                        <div className="text-xs text-gray-500 mt-1 capitalize">{l.mes_interes}</div>
                        {l.forma_pago && <div className="text-xs text-gray-400">{l.forma_pago}</div>}
                      </td>
                      <td className="p-3">
                        <div>{fmt(depMonto)}</div>
                        {l.deposito_fecha && (
                          <div className="text-xs text-gray-500">{new Date(l.deposito_fecha).toLocaleDateString()}</div>
                        )}
                        <span className={`inline-block mt-1 px-2 py-0.5 text-[10px] font-bold rounded ${
                          l.deposito_pagado ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                        }`}>
                          {l.deposito_pagado ? "Pagado" : "Pendiente"}
                        </span>
                      </td>
                      <td className="p-3">
                        {saldoMonto > 0 ? (
                          <>
                            <div>{fmt(saldoMonto)}</div>
                            <span className={`inline-block mt-1 px-2 py-0.5 text-[10px] font-bold rounded ${
                              l.saldo_pagado ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"
                            }`}>
                              {l.saldo_pagado ? "Pagado" : "Pendiente"}
                            </span>
                          </>
                        ) : (
                          <span className="text-xs text-gray-400">N/A</span>
                        )}
                      </td>
                      <td className="p-3">
                        <span className="inline-block px-2 py-1 text-[10px] font-bold rounded text-white"
                          style={{ background: ESTADO_COLOR[est] }}>
                          {est.replace("_", " ")}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="flex flex-col gap-1">
                          <a
                            href={`https://wa.me/52${l.telefono.replace(/\D/g, "")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs px-2 py-1 bg-green-500 text-white rounded text-center hover:bg-green-600"
                          >
                            WhatsApp
                          </a>
                          {l.deposito_pagado && !l.saldo_pagado && saldoMonto > 0 && (
                            <button
                              onClick={() => setSaldoFor(l)}
                              className="text-xs px-2 py-1 bg-orange-500 text-white rounded hover:bg-orange-600"
                            >
                              Saldo ✓
                            </button>
                          )}
                          <button
                            onClick={() => { setEditNotes(l.id); setNotesValue(l.notas ?? ""); }}
                            className="text-xs px-2 py-1 border rounded hover:bg-gray-100"
                          >
                            Notas
                          </button>
                        </div>
                        {editNotes === l.id && (
                          <div className="mt-2">
                            <textarea
                              value={notesValue}
                              onChange={(e) => setNotesValue(e.target.value)}
                              rows={2}
                              className="w-full text-xs border rounded p-1"
                            />
                            <div className="flex gap-1 mt-1">
                              <button onClick={() => saveNotes(l.id)} className="text-xs px-2 py-0.5 bg-blue-600 text-white rounded">Guardar</button>
                              <button onClick={() => setEditNotes(null)} className="text-xs px-2 py-0.5 border rounded">Cancelar</button>
                            </div>
                          </div>
                        )}
                        {l.notas && editNotes !== l.id && (
                          <div className="text-[10px] text-gray-500 mt-1 italic">{l.notas}</div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2">
            <button disabled={page === 1} onClick={() => setPage((p) => p - 1)}
              className="px-3 py-1 border rounded disabled:opacity-50">←</button>
            <span className="text-sm">Página {page} de {totalPages}</span>
            <button disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1 border rounded disabled:opacity-50">→</button>
          </div>
        )}

        {/* RESUMEN FINANCIERO */}
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <button
              onClick={() => setShowResumen((s) => !s)}
              className="font-bold text-sm flex items-center gap-2"
              style={{ color: NAVY }}
            >
              Ver resumen financiero {showResumen ? "▲" : "▼"}
            </button>
            <button onClick={exportCSV} className="px-4 py-2 text-sm text-white rounded font-bold" style={{ background: NAVY }}>
              Exportar CSV
            </button>
          </div>
          {showResumen && (
            <div className="overflow-x-auto mt-4">
              <table className="w-full text-sm min-w-[640px]">
                <thead className="bg-gray-50 text-left text-xs uppercase text-gray-600">
                  <tr>
                    <th className="p-2">Mes</th>
                    <th className="p-2">Jugadores</th>
                    <th className="p-2">Ingreso bruto</th>
                    <th className="p-2">20% Futcenter</th>
                    <th className="p-2">80% White Lions</th>
                    <th className="p-2">Saldo por cobrar</th>
                  </tr>
                </thead>
                <tbody>
                  {resumen.map((r) => (
                    <tr key={r.mes} className="border-t">
                      <td className="p-2 capitalize font-bold">{r.mes}</td>
                      <td className="p-2">{r.jugadores}</td>
                      <td className="p-2">{fmt(r.bruto)}</td>
                      <td className="p-2">{fmt(r.futcenter)}</td>
                      <td className="p-2">{fmt(r.wl)}</td>
                      <td className="p-2">{fmt(r.saldoPend)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* SALDO MODAL */}
      {saldoFor && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center px-4" onClick={() => setSaldoFor(null)}>
          <div className="bg-white p-6 rounded-xl max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-black mb-2" style={{ color: NAVY }}>Confirmar pago de saldo</h3>
            <p className="text-sm text-gray-600 mb-4">
              {saldoFor.nombre_jugador} — {fmt(saldoFor.saldo_monto ?? calcExpected(saldoFor).saldo)}
            </p>
            <p className="text-sm font-bold mb-2">Método:</p>
            <div className="flex gap-2 mb-4">
              <button onClick={() => confirmSaldo("efectivo")} className="flex-1 py-2 border rounded hover:bg-gray-50">Efectivo</button>
              <button onClick={() => confirmSaldo("transferencia")} className="flex-1 py-2 border rounded hover:bg-gray-50">Transferencia</button>
            </div>
            <button onClick={() => setSaldoFor(null)} className="w-full text-sm text-gray-500 hover:underline">Cancelar</button>
          </div>
        </div>
      )}
    </div>
  );
}
