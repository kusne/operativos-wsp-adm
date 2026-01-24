// ===== CONFIG SUPABASE (SOLO LECTURA WSP) =====
const SUPABASE_URL = "https://ugeydxozfewzhldjbkat.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_ZeLC2rOxhhUXlQdvJ28JkA_qf802-pX";

(function () {
  "use strict";

  // ======================================================
  // ===== DOM refs =======================================
  // ======================================================
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

  // Validación mínima de IDs críticos
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

  const faltantes = required.filter(([, el]) => !el).map(([id]) => id);
  if (faltantes.length) {
    console.error("WSP: faltan IDs en el HTML:", faltantes.join(", "));
    return;
  }

  // ======================================================
  // ===== Estado =========================================
  // ======================================================
  let ordenSeleccionada = null;
  let franjaSeleccionada = null;

  let syncingOrdenes = false;
  let lastSyncAt = 0;
  const MIN_SYNC_INTERVAL_MS = 1500;

  // ======================================================
  // ===== Helpers de dependencias (robustez) ==============
  // ======================================================
  function safeCargarOrdenes() {
    try {
      return (typeof StorageApp !== "undefined" && StorageApp.cargarOrdenes)
        ? (StorageApp.cargarOrdenes() || [])
        : [];
    } catch {
      return [];
    }
  }

  function safeGuardarOrdenes(arr) {
    try {
      if (typeof StorageApp !== "undefined" && StorageApp.guardarOrdenes) {
        StorageApp.guardarOrdenes(Array.isArray(arr) ? arr : []);
      }
    } catch (e) {
      console.warn("WSP: no pude guardar en StorageApp:", e);
    }
  }

  function safeFiltrarCaducadas(arr) {
    try {
      if (typeof OrdersSync !== "undefined" && OrdersSync.filtrarCaducadas) {
        return OrdersSync.filtrarCaducadas(arr);
      }
      return arr;
    } catch {
      return arr;
    }
  }

  function safeParseVigenciaToDate(vigencia) {
    try {
      if (typeof Dates !== "undefined" && Dates.parseVigenciaToDate) {
        return Dates.parseVigenciaToDate(vigencia);
      }
    } catch {}
    // fallback: intenta YYYY-MM-DD
    if (typeof vigencia === "string" && /^\d{4}-\d{2}-\d{2}$/.test(vigencia)) {
      const d = new Date(vigencia + "T00:00:00");
      return isNaN(d.getTime()) ? null : d;
    }
    return null;
  }

  // ======================================================
  // ===== LECTURA DESDE SUPABASE (FUENTE REAL) ============
  // ======================================================
  async function syncOrdenesDesdeServidor() {
    try {
      const url = new URL(`${SUPABASE_URL}/rest/v1/ordenes_store`);
      url.searchParams.set("select", "payload");
      url.searchParams.set("id", "eq.1");
      url.searchParams.set("ts", String(Date.now())); // anti-cache

      const r = await fetch(url.toString(), {
        method: "GET",
        cache: "no-store",
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: "Bearer " + SUPABASE_ANON_KEY,
          Accept: "application/json",
          "Cache-Control": "no-cache",
          Pragma: "no-cache"
        }
      });

      if (!r.ok) {
        const txt = await r.text().catch(() => "");
        console.error("Supabase WSP NO OK:", r.status, txt);
        console.error("URL usada:", url.toString());
        return false;
      }

      const data = await r.json();

      // CLAVE (pedido tuyo): si viene vacío, NO borro el storage local
      if (!Array.isArray(data) || data.length === 0) {
        console.warn("Supabase WSP: respuesta vacía (sin fila id=1). Mantengo Storage local.");
        return true;
      }

      const payload = data[0]?.payload;

      if (!Array.isArray(payload)) {
        console.error("Supabase WSP: payload inválido. Data:", data);
        return false;
      }

      // Guardamos EXACTO lo que viene (incluye vigencia/caducidad para que WSP gestione)
      safeGuardarOrdenes(payload);

      console.log("Supabase WSP OK. Ordenes:", payload.length);
      return true;

    } catch (e) {
      console.error("Error leyendo Supabase:", e);
      return false;
    }
  }

  async function syncAntesDeSeleccion() {
    const now = Date.now();

    if (syncingOrdenes) return false;

    // throttle para evitar loops y 400/requests duplicadas
    if (now - lastSyncAt < MIN_SYNC_INTERVAL_MS) {
      cargarOrdenesDisponibles();
      return true;
    }

    syncingOrdenes = true;
    try {
      const ok = await syncOrdenesDesdeServidor();
      lastSyncAt = Date.now();

      // reconstruyo SIEMPRE desde storage local (sea ok o no)
      cargarOrdenesDisponibles();
      limpiarSeleccionOrden();
      return ok;
    } finally {
      syncingOrdenes = false;
    }
  }

  // ======================================================
  // ===== UI =============================================
  // ======================================================
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
    const texto = (elImportBox.value || "").trim();
    if (!texto) return;

    let data;
    try {
      data = JSON.parse(texto);
    } catch {
      console.warn("Import: JSON inválido");
      return;
    }

    if (!Array.isArray(data)) {
      console.warn("Import: se esperaba un array de órdenes");
      return;
    }

    safeGuardarOrdenes(data);
    cargarOrdenesDisponibles();
    limpiarSeleccionOrden();
  }

  // ======================================================
  // ===== Guardia ========================================
  // ======================================================
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
    return (n >= 0 && n <= 23) ? n : null;
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

  function cargarOrdenesDisponibles() {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    // 1) leo del storage local
    let ordenes = safeCargarOrdenes();

    // 2) filtro caducadas (si tu OrdersSync lo soporta)
    ordenes = safeFiltrarCaducadas(ordenes);

    // 3) guardo lo filtrado para que se “limpie” localmente con caducidad
    safeGuardarOrdenes(ordenes);

    // 4) poblo selector
    selOrden.innerHTML = '<option value="">Seleccionar</option>';

    ordenes.forEach((o, i) => {
      const v = safeParseVigenciaToDate(o.vigencia);

      // mostrar a partir de vigencia (incluye hoy)
      if (!v || v > hoy) return;

      // debe tener franjas dentro de la guardia actual
      if (!o.franjas?.some(f => franjaEnGuardia(f.horario))) return;

      const op = document.createElement("option");
      op.value = String(i);
      op.text = `${o.num || ""} ${o.textoRef || ""}`.trim();
      selOrden.appendChild(op);
    });
  }

  function cargarHorariosOrden() {
    ordenSeleccionada = null;
    franjaSeleccionada = null;

    const ordenes = safeCargarOrdenes();
    const idx = Number(selOrden.value);
    if (!Number.isFinite(idx) || !ordenes[idx]) return;

    ordenSeleccionada = ordenes[idx];
    selHorario.innerHTML = '<option value="">Seleccionar horario</option>';

    (ordenSeleccionada.franjas || []).forEach((f, i) => {
      if (!f) return;
      if (franjaEnGuardia(f.horario)) {
        const o = document.createElement("option");
        o.value = String(i);
        o.text = f.horario || "";
        selHorario.appendChild(o);
      }
    });
  }

  function actualizarDatosFranja() {
    if (!ordenSeleccionada) return;
    const idx = Number(selHorario.value);
    franjaSeleccionada = (ordenSeleccionada.franjas || [])[idx] || null;
  }

  function actualizarTipo() {
    const fin = selTipo.value === "FINALIZA";
    divFinaliza.classList.toggle("hidden", !fin);
    divDetalles.classList.toggle("hidden", !fin);
  }

  // ======================================================
  // ===== Selección / Normalización ======================
  // ======================================================
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
    return String(txt)
      .toLowerCase()
      .trim()
      .replace(/\b\w/g, l => l.toUpperCase());
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

    const obs = document.getElementById("obs");
    if (obs) obs.value = "";

    divFinaliza.classList.add("hidden");
    divDetalles.classList.add("hidden");
  }

  // ======================================================
  // ===== ENVIAR A WHATSAPP ==============================
  // ======================================================
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

    const tipoFmt =
      selTipo.value
        ? selTipo.value.charAt(0) + selTipo.value.slice(1).toLowerCase()
        : "";

    const texto =
`Policia de la Provincia de Santa Fe - Guardia Provincial
Brigada Motorizada Centro Norte
Tercio Charly
${tipoFmt} ${normalizarTituloOperativo(franjaSeleccionada.titulo)} ${ordenSeleccionada.num || ""}
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
${bloqueResultados}${textoDetalles}Observaciones:
${document.getElementById("obs")?.value || "Sin novedad"}`;

    const textoFinal = texto.replace(/\n{2,}/g, "\n");

    resetUI();

    setTimeout(() => {
      window.location.href = "https://wa.me/?text=" + encodeURIComponent(textoFinal);
    }, 0);
  }

  // ======================================================
  // ===== Eventos ========================================
  // ======================================================
  elToggleCarga.addEventListener("change", toggleCargaOrdenes);
  btnCargarOrdenes.addEventListener("click", importarOrdenes);

  // refrescar antes de usar el selector (sin loops por throttle)
  selOrden.addEventListener("pointerdown", () => {
    syncAntesDeSeleccion();
  });

  selOrden.addEventListener("focus", () => {
    syncAntesDeSeleccion();
  });

  selOrden.addEventListener("change", cargarHorariosOrden);
  selHorario.addEventListener("change", actualizarDatosFranja);
  selTipo.addEventListener("change", actualizarTipo);
  btnEnviar.addEventListener("click", enviar);

  // ======================================================
  // ===== Init ===========================================
  // ======================================================
  (async function init() {
    toggleCargaOrdenes();
    actualizarTipo();

    // 1) primero muestro lo que haya en local (si existe)
    cargarOrdenesDisponibles();

    // 2) luego intento sincronizar (si supabase viene vacío, NO borra local)
    await syncOrdenesDesdeServidor();
    cargarOrdenesDisponibles();
  })();
})();















