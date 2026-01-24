// ===============================
// WSP.JS (desde cero, estable)
// ===============================

// ===== CONFIG SUPABASE (SOLO LECTURA WSP) =====
const SUPABASE_URL = "https://ugeydxozfewzhldjbkat.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_ZeLC2rOxhhUXlQdvJ28JkA_qf802-pX";

// ===== Storage key fallback (por si storage.js no existiera) =====
const FALLBACK_STORAGE_KEY = "WSP_ORDENES_PAYLOAD";

// ===== Helpers storage (usa StorageApp si existe) =====
function storageCargarOrdenes() {
  try {
    if (window.StorageApp && typeof StorageApp.cargarOrdenes === "function") {
      const v = StorageApp.cargarOrdenes();
      return Array.isArray(v) ? v : [];
    }
  } catch (_) {}
  // fallback
  try {
    const raw = localStorage.getItem(FALLBACK_STORAGE_KEY);
    const v = raw ? JSON.parse(raw) : [];
    return Array.isArray(v) ? v : [];
  } catch (_) {
    return [];
  }
}

function storageGuardarOrdenes(arr) {
  const ordenes = Array.isArray(arr) ? arr : [];
  try {
    if (window.StorageApp && typeof StorageApp.guardarOrdenes === "function") {
      StorageApp.guardarOrdenes(ordenes);
      return;
    }
  } catch (_) {}
  // fallback
  localStorage.setItem(FALLBACK_STORAGE_KEY, JSON.stringify(ordenes));
}

// ===== Parse fechas robusto =====
// Soporta: "YYYY-MM-DD", "DD/MM/YYYY", "DD/MM/YY"
function parseFechaFlexible(s) {
  const txt = String(s || "").trim();
  if (!txt) return null;

  // ISO yyyy-mm-dd
  const iso = txt.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (iso) {
    const y = Number(iso[1]);
    const m = Number(iso[2]) - 1;
    const d = Number(iso[3]);
    const dt = new Date(y, m, d);
    return isNaN(dt.getTime()) ? null : dt;
  }

  // dd/mm/yyyy o dd/mm/yy
  const lat = txt.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2}|\d{4})$/);
  if (lat) {
    const d = Number(lat[1]);
    const m = Number(lat[2]) - 1;
    let y = Number(lat[3]);
    if (y < 100) y = 2000 + y; // 26 -> 2026
    const dt = new Date(y, m, d);
    return isNaN(dt.getTime()) ? null : dt;
  }

  return null;
}

function finDelDia(d) {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}

function hoyCero() {
  const h = new Date();
  h.setHours(0, 0, 0, 0);
  return h;
}

// Caducidad:
// - "A FINALIZAR" => no caduca automáticamente
// - fecha => si ya pasó, se elimina
function estaCaducada(orden) {
  const cad = String(orden?.caducidad || "").trim();
  if (!cad) return false;
  if (cad.toUpperCase() === "A FINALIZAR") return false;

  const d = parseFechaFlexible(cad);
  if (!d) return false; // si no puedo parsear, NO borro (conservador)
  return finDelDia(d) < new Date();
}

// Vigencia:
// - si no hay vigencia, la muestro igual
// - si hay vigencia, muestro cuando vigencia <= hoy
function estaVigenteParaMostrar(orden) {
  const vig = String(orden?.vigencia || "").trim();
  if (!vig) return true;
  const d = parseFechaFlexible(vig);
  if (!d) return true; // si no puedo parsear, NO oculto (conservador)
  return d <= hoyCero();
}

// ===== Guardia (06 a 06) =====
function getGuardiaInicio() {
  const now = new Date();
  const start = new Date(now);
  start.setHours(6, 0, 0, 0);
  if (now < start) start.setDate(start.getDate() - 1);
  return start;
}

function extraerHoraInicio(h) {
  const m = String(h || "").match(/(\d{1,2})/);
  if (!m) return null;
  const n = parseInt(m[1], 10);
  return n >= 0 && n <= 23 ? n : null;
}

function franjaEnGuardia(h) {
  const hi = extraerHoraInicio(h);
  if (hi === null) return true;

  const inicio = getGuardiaInicio();
  const fin = new Date(inicio.getTime() + 86400000);

  const f = new Date(inicio);
  f.setHours(hi, 0, 0, 0);
  if (f < inicio) f.setDate(f.getDate() + 1);

  return f >= inicio && f < fin;
}

// ===== Supabase sync =====
let syncing = false;
let lastSyncAt = 0; // FIX: antes te faltaba y explotaba
const MIN_SYNC_INTERVAL_MS = 5000; // anti-spam

async function syncOrdenesDesdeServidor() {
  // throttle simple
  const now = Date.now();
  if (now - lastSyncAt < MIN_SYNC_INTERVAL_MS) return { ok: true, changed: false };

  const url = new URL(`${SUPABASE_URL}/rest/v1/ordenes_store`);
  url.searchParams.set("select", "payload");
  url.searchParams.set("id", "eq.1"); // PostgREST filter correcto

  try {
    const r = await fetch(url.toString(), {
      method: "GET",
      cache: "no-store",
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: "Bearer " + SUPABASE_ANON_KEY,
        Accept: "application/json"
      }
    });

    if (!r.ok) {
      const txt = await r.text().catch(() => "");
      console.error("Supabase WSP NO OK:", r.status, txt);
      console.error("URL usada:", url.toString());
      return { ok: false, changed: false };
    }

    const data = await r.json();

    // IMPORTANTE (tu regla): si viene vacío, NO borro storage
    if (!Array.isArray(data) || data.length === 0) {
      console.warn("Supabase WSP: respuesta vacía (sin fila id=1). Mantengo Storage local.");
      lastSyncAt = now;
      return { ok: true, changed: false };
    }

    const payload = data[0]?.payload;

    // Si payload viene null/vacío, también mantengo lo local (tu criterio)
    if (payload == null) {
      console.warn("Supabase WSP: payload null. Mantengo Storage local.");
      lastSyncAt = now;
      return { ok: true, changed: false };
    }

    if (!Array.isArray(payload)) {
      console.error("Supabase WSP: payload inválido (no array). Data:", data);
      return { ok: false, changed: false };
    }

    storageGuardarOrdenes(payload);
    lastSyncAt = now;
    console.log("Supabase WSP OK. Órdenes:", payload.length);
    return { ok: true, changed: true };

  } catch (e) {
    console.error("Error leyendo Supabase:", e);
    return { ok: false, changed: false };
  }
}

// ===== DOM / UI =====
(function () {
  // ===== DOM refs =====
  const elToggleCarga = document.getElementById("toggleCarga");
  const elBloqueCarga = document.getElementById("bloqueCargaOrdenes");
  const elImportBox = document.getElementById("importBox");
  const btnCargarOrdenes = document.getElementById("btnCargarOrdenes");

  const selTipo = document.getElementById("tipo");
  const selOrden = document.getElementById("orden");
  const selHorario = document.getElementById("horario");

  const divFinaliza = document.getElementById("finaliza");
  const divDetalles = document.getElementById("bloqueDetalles");
  const btnEnviar = document.getElementById("btnEnviar");

  // Estado
  let ordenSeleccionada = null;
  let franjaSeleccionada = null;

  // Safety: si falta algo crítico, freno con log claro
  const required = [
    ["toggleCarga", elToggleCarga],
    ["bloqueCargaOrdenes", elBloqueCarga],
    ["importBox", elImportBox],
    ["btnCargarOrdenes", btnCargarOrdenes],
    ["tipo", selTipo],
    ["orden", selOrden],
    ["horario", selHorario],
    ["finaliza", divFinaliza],
    ["bloqueDetalles", divDetalles],
    ["btnEnviar", btnEnviar]
  ];
  const missing = required.filter(([, el]) => !el).map(([id]) => id);
  if (missing.length) {
    console.error("WSP: faltan IDs en HTML:", missing.join(", "));
    return;
  }

  function toggleCargaOrdenes() {
    elBloqueCarga.classList.toggle("hidden", !elToggleCarga.checked);
  }

  function limpiarSeleccionOrden() {
    ordenSeleccionada = null;
    franjaSeleccionada = null;
    selOrden.value = "";
    selHorario.innerHTML = '<option value="">Seleccionar horario</option>';
  }

  function importarOrdenes() {
    const texto = elImportBox.value.trim();
    if (!texto) return;

    let data;
    try { data = JSON.parse(texto); } catch { return; }
    if (!Array.isArray(data)) return;

    storageGuardarOrdenes(data);
    cargarOrdenesDisponibles();
    limpiarSeleccionOrden();
  }

  function actualizarTipo() {
    const fin = selTipo.value === "FINALIZA";
    divFinaliza.classList.toggle("hidden", !fin);
    divDetalles.classList.toggle("hidden", !fin);
  }

  function filtrarYGuardarCaducadas() {
    const ordenes = storageCargarOrdenes();
    const vivas = ordenes.filter(o => !estaCaducada(o));
    if (vivas.length !== ordenes.length) storageGuardarOrdenes(vivas);
    return vivas;
  }

  function cargarOrdenesDisponibles() {
    const ordenes = filtrarYGuardarCaducadas();

    selOrden.innerHTML = '<option value="">Seleccionar</option>';

    ordenes.forEach((o, i) => {
      if (!estaVigenteParaMostrar(o)) return;
      if (!o?.franjas?.some(f => franjaEnGuardia(f?.horario))) return;

      const op = document.createElement("option");
      op.value = String(i);
      op.text = `${o.num || "(sin num)"} ${o.textoRef || ""}`.trim();
      selOrden.appendChild(op);
    });
  }

  function cargarHorariosOrden() {
    ordenSeleccionada = null;
    franjaSeleccionada = null;

    const ordenes = storageCargarOrdenes();
    const idx = Number(selOrden.value);
    if (!Number.isFinite(idx) || !ordenes[idx]) return;

    ordenSeleccionada = ordenes[idx];
    selHorario.innerHTML = '<option value="">Seleccionar horario</option>';

    (ordenSeleccionada.franjas || []).forEach((f, i) => {
      if (franjaEnGuardia(f?.horario)) {
        const o = document.createElement("option");
        o.value = String(i);
        o.text = f?.horario || "(sin horario)";
        selHorario.appendChild(o);
      }
    });
  }

  function actualizarDatosFranja() {
    if (!ordenSeleccionada) return;
    franjaSeleccionada = (ordenSeleccionada.franjas || [])[Number(selHorario.value)] || null;
  }

  function seleccion(clase) {
    return Array.from(document.querySelectorAll("." + clase + ":checked"))
      .map(e => e.value)
      .join("\n");
  }

  function seleccionLinea(clase, sep) {
    const v = Array.from(document.querySelectorAll("." + clase + ":checked"))
      .map(e => e.value);
    return v.length ? v.join(" " + sep + " ") : "/";
  }

  function normalizarTituloOperativo(txt) {
    if (!txt) return "";
    let t = String(txt).toLowerCase().trim();
    t = t.replace(/\b\w/g, l => l.toUpperCase());
    t = t.replace(/\b(o\.?\s*op\.?|op)\s*0*(\d+\/\d+)\b/i, "O.Op. $2");
    return t;
  }

  function normalizarLugar(txt) {
    if (!txt) return "";
    return String(txt).toLowerCase().trim().replace(/\b\w/g, l => l.toUpperCase());
  }

  function normalizarHorario(txt) {
    if (!txt) return "";
    let t = String(txt).toLowerCase().replace(/\s+/g, " ").trim();
    t = t.replace(/\bfinalizar\b/g, "Finalizar");
    return t;
  }

  function resetUI() {
    ordenSeleccionada = null;
    franjaSeleccionada = null;

    selTipo.value = "";
    selOrden.value = "";
    selHorario.innerHTML = '<option value="">Seleccionar horario</option>';

    document.querySelectorAll('input[type="checkbox"]').forEach(c => (c.checked = false));
    document.querySelectorAll('input[type="number"], input[type="text"], textarea').forEach(i => (i.value = ""));

    divFinaliza.classList.add("hidden");
    divDetalles.classList.add("hidden");
  }

  function enviar() {
    if (!ordenSeleccionada || !franjaSeleccionada) return;

    if (!seleccion("personal")) {
      alert("Debe seleccionar personal policial.");
      return;
    }
    if (seleccionLinea("movil", "/") === "/") {
      alert("Debe seleccionar al menos un móvil.");
      return;
    }

    const fecha = new Date().toLocaleDateString("es-AR");

    let bloqueResultados = "";
    let textoDetalles = "";

    if (selTipo.value === "FINALIZA") {
      const vehiculos = document.getElementById("vehiculos")?.value || 0;
      const personas = document.getElementById("personas")?.value || 0;
      const testalom = document.getElementById("testalom")?.value || 0;
      const alco = document.getElementById("Alcotest")?.value || 0;
      const posSan = document.getElementById("positivaSancionable")?.value || 0;
      const posNo = document.getElementById("positivaNoSancionable")?.value || 0;
      const actas = document.getElementById("actas")?.value || 0;
      const requisa = document.getElementById("Requisa")?.value || 0;
      const qrz = document.getElementById("qrz")?.value || 0;
      const dominio = document.getElementById("dominio")?.value || 0;

      const remision = document.getElementById("Remision")?.value || 0;
      const retencion = document.getElementById("Retencion")?.value || 0;
      const prohibicion = document.getElementById("Prohibicion")?.value || 0;
      const cesion = document.getElementById("Cesion")?.value || 0;

      bloqueResultados =
`Resultados:
Vehículos Fiscalizados: (${vehiculos})
Personas Identificadas: (${personas})
Test de Alómetro: (${testalom})
Test de Alcoholímetro: (${alco})
Positiva Sancionable: (${posSan})
Positiva no Sancionable: (${posNo})
Actas Labradas: (${actas})
Requisas: (${requisa})
Qrz: (${qrz})
Dominio: (${dominio})
Medidas Cautelares:
Remisión: (${remision})
Retención: (${retencion})
Prohibición de Circulación: (${prohibicion})
Cesión de Conducción: (${cesion})
`;

      const detallesTexto = document.getElementById("detalles")?.value?.trim();
      if (detallesTexto) {
        textoDetalles =
`Detalles:
${detallesTexto}
`;
      }
    }

    const texto =
`Policia de la Provincia de Santa Fe - Guardia Provincial
Brigada Motorizada Centro Norte
Tercio Charly
${selTipo.value.charAt(0) + selTipo.value.slice(1).toLowerCase()} ${normalizarTituloOperativo(franjaSeleccionada.titulo)} ${ordenSeleccionada.num}
Fecha: ${fecha}
Horario: ${normalizarHorario(franjaSeleccionada.horario)}
Lugar: ${normalizarLugar(franjaSeleccionada.lugar)}
Personal Policial:
${seleccion("personal")}
Móviles: ${seleccionLinea("movil", "/")}
Elementos:
Escopetas: ${seleccionLinea("ESCOPETA", "/")}
Ht: ${seleccionLinea("HT", "/")}
Pda: ${seleccionLinea("PDA", "/")}
Impresoras: ${seleccionLinea("IMPRESORA", "/")}
Alómetros: ${seleccionLinea("Alometro", "/")}
Alcoholímetros: ${seleccionLinea("Alcoholimetro", "/")}
${bloqueResultados}
${textoDetalles}
Observaciones:
${document.getElementById("obs")?.value || "Sin novedad"}`;

    const textoFinal = texto.replace(/\n{2,}/g, "\n");

    resetUI();
    setTimeout(() => {
      window.location.href = "https://wa.me/?text=" + encodeURIComponent(textoFinal);
    }, 0);
  }

  // ===== Botón “Actualizar órdenes” (inyectado) =====
  function asegurarBotonActualizar() {
    if (document.getElementById("btnRefreshOrdenes")) return;

    const btn = document.createElement("button");
    btn.type = "button";
    btn.id = "btnRefreshOrdenes";
    btn.textContent = "Actualizar órdenes";
    btn.style.marginLeft = "8px";
    btn.style.padding = "6px 10px";
    btn.style.fontSize = "12px";
    btn.style.cursor = "pointer";

    selOrden.insertAdjacentElement("afterend", btn);

    btn.addEventListener("click", async () => {
      if (syncing) return;
      syncing = true;
      try {
        const res = await syncOrdenesDesdeServidor();
        cargarOrdenesDisponibles();
        limpiarSeleccionOrden();
        if (!res.ok) alert("No se pudo actualizar desde Supabase. Se usan órdenes locales.");
      } finally {
        syncing = false;
      }
    });
  }

  // ===== Sync en background al volver a la pestaña =====
  async function syncSiVuelvo() {
    if (syncing) return;
    syncing = true;
    try {
      const res = await syncOrdenesDesdeServidor();
      if (res.ok && res.changed) {
        cargarOrdenesDisponibles();
        limpiarSeleccionOrden();
      }
    } finally {
      syncing = false;
    }
  }

  // ===== Eventos =====
  elToggleCarga.addEventListener("change", toggleCargaOrdenes);
  btnCargarOrdenes.addEventListener("click", importarOrdenes);

  selOrden.addEventListener("change", cargarHorariosOrden);
  selHorario.addEventListener("change", actualizarDatosFranja);
  selTipo.addEventListener("change", actualizarTipo);
  btnEnviar.addEventListener("click", enviar);

  window.addEventListener("focus", syncSiVuelvo);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") syncSiVuelvo();
  });

  // ===== Init =====
  (async function init() {
    toggleCargaOrdenes();
    actualizarTipo();
    asegurarBotonActualizar();

    // 1) Cargar lo local primero (siempre debe mostrar algo)
    cargarOrdenesDisponibles();

    // 2) Intentar traer lo del servidor (si hay) sin romper nada
    await syncSiVuelvo();
  })();
})();


















