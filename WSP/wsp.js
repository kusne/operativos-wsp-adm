// ===== WSP.JS (desde cero, autocontenido) =====
(() => {
  "use strict";

  // ===== CONFIG SUPABASE (SOLO LECTURA WSP) =====
  const SUPABASE_URL = "https://ugeydxozfewzhldjbkat.supabase.co";
  const SUPABASE_ANON_KEY = "sb_publishable_ZeLC2rOxhhUXlQdvJ28JkA_qf802-pX";

  // ===== STORAGE KEY =====
  const STORAGE_KEY = "ordenes_storage_v1";

  // ===== DOM =====
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

  // ===== Estado =====
  let ordenSeleccionada = null;
  let franjaSeleccionada = null;
  let syncingOrdenes = false;
  let ordenesVisibles = []; // el select se arma sobre ESTE array (no sobre Storage crudo)

  // ======================================================
  // ===== Storage (autocontenido) ========================
  // ======================================================
  const Storage = {
    cargar() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        const arr = raw ? JSON.parse(raw) : [];
        return Array.isArray(arr) ? arr : [];
      } catch {
        return [];
      }
    },
    guardar(arr) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.isArray(arr) ? arr : []));
      } catch (e) {
        console.error("Storage.guardar error:", e);
      }
    }
  };

  // ======================================================
  // ===== Fechas / vigencia / caducidad ==================
  // ======================================================
  function parseDateYYYYMMDD(s) {
    // Espera "YYYY-MM-DD"
    if (!s || typeof s !== "string") return null;
    const m = s.trim().match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!m) return null;
    const y = Number(m[1]);
    const mo = Number(m[2]);
    const d = Number(m[3]);
    if (!y || !mo || !d) return null;
    const dt = new Date(y, mo - 1, d);
    if (Number.isNaN(dt.getTime())) return null;
    dt.setHours(0, 0, 0, 0);
    return dt;
  }

  function hoy00() {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }

  function isCaducada(caducidad) {
    // Regla práctica:
    // - "" / null => no caduca
    // - "A FINALIZAR" => no caduca
    // - "YYYY-MM-DD" => caduca al finalizar ese día (23:59:59)
    if (!caducidad) return false;
    const t = String(caducidad).trim().toUpperCase();
    if (!t) return false;
    if (t === "A FINALIZAR") return false;

    const d = parseDateYYYYMMDD(String(caducidad).trim());
    if (!d) return false;

    const finDia = new Date(d);
    finDia.setHours(23, 59, 59, 999);
    return new Date() > finDia;
  }

  function filtrarCaducadas(ordenes) {
    return (Array.isArray(ordenes) ? ordenes : []).filter(o => !isCaducada(o?.caducidad));
  }

  // ======================================================
  // ===== Guardia 06:00 a 06:00 ==========================
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
    return n >= 0 && n <= 23 ? n : null;
  }

  function franjaEnGuardia(h) {
    const hi = extraerHoraInicio(h);
    if (hi === null) return true; // si no se puede parsear, no bloqueamos

    const inicio = getGuardiaInicio();
    const fin = new Date(inicio.getTime() + 86400000);

    const f = new Date(inicio);
    f.setHours(hi, 0, 0, 0);
    if (f < inicio) f.setDate(f.getDate() + 1);

    return f >= inicio && f < fin;
  }

  // ======================================================
  // ===== LECTURA DESDE SUPABASE (id=1) ==================
  // ======================================================
  async function syncOrdenesDesdeServidor() {
    try {
      const url = new URL(`${SUPABASE_URL}/rest/v1/ordenes_store`);
      url.searchParams.set("id", "eq.1");
      url.searchParams.set("select", "payload");
      

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

      // Si no hay fila id=1 (respuesta vacía), NO tocamos el storage:
      // el usuario pidió mantener lo anterior.
      if (!Array.isArray(data) || data.length === 0) {
        console.warn("Supabase WSP: respuesta vacía (sin fila id=1). Mantengo Storage local.");
        return true;
      }

      const payload = data[0]?.payload;

      // Si el payload existe pero no es array => dato inválido, no tocamos storage
      if (payload != null && !Array.isArray(payload)) {
        console.error("Supabase WSP: payload inválido. Data:", data);
        return false;
      }

      // Si payload es array (incluso []), eso SÍ es estado real del servidor:
      if (Array.isArray(payload)) {
        Storage.guardar(payload);
        console.log("Supabase WSP OK. Ordenes desde servidor:", payload.length);
      }

      return true;
    } catch (e) {
      console.error("Error leyendo Supabase:", e);
      return false;
    }
  }

  async function syncAntesDeSeleccion() {
    const now = Date.now();
    if (syncingOrdenes) return false;
    if (now - lastSyncAt < 1500) return false; // debounce 1.5s
    
    syncingOrdenes = true;
    lastSyncAt = now;

    try {
      const ok = await syncOrdenesDesdeServidor();
      reconstruirSelectorDesdeStorage();
      limpiarSeleccionOrden();
      return ok;
    } finally {
      syncingOrdenes = false;
    }
  }
  // SOLO UNO (no focus + no mousedown + no touchstart)
  selOrden.addEventListener("pointerdown", () => {
    syncAntesDeSeleccion();
  });

  // ======================================================
  // ===== UI / selector ==================================
  // ======================================================
  function toggleCargaOrdenes() {
    if (!elBloqueCarga || !elToggleCarga) return;
    elBloqueCarga.classList.toggle("hidden", !elToggleCarga.checked);
  }

  function limpiarSeleccionOrden() {
    ordenSeleccionada = null;
    franjaSeleccionada = null;
    if (selOrden) selOrden.value = "";
    if (selHorario) selHorario.innerHTML = '<option value="">Seleccionar horario</option>';
  }

  function reconstruirSelectorDesdeStorage() {
    if (!selOrden) return;

    // 1) caducadas afuera (y persistimos limpieza)
    let ordenes = filtrarCaducadas(Storage.cargar());
    Storage.guardar(ordenes);

    // 2) vigencia <= hoy + al menos una franja en guardia
    const hoy = hoy00();
    ordenesVisibles = [];

    selOrden.innerHTML = '<option value="">Seleccionar</option>';

    ordenes.forEach((o) => {
      const v = parseDateYYYYMMDD(o?.vigencia);
      if (!v || v > hoy) return;

      const franjas = Array.isArray(o?.franjas) ? o.franjas : [];
      if (!franjas.some(f => franjaEnGuardia(f?.horario))) return;

      const idxVisible = ordenesVisibles.length;
      ordenesVisibles.push(o);

      const op = document.createElement("option");
      op.value = String(idxVisible);
      op.text = `${o.num || ""} ${o.textoRef || ""}`.trim();
      selOrden.appendChild(op);
    });
  }

  function cargarHorariosOrden() {
    ordenSeleccionada = null;
    franjaSeleccionada = null;

    if (!selOrden || !selHorario) return;

    const idx = Number(selOrden.value);
    if (!Number.isFinite(idx) || idx < 0) return;

    const o = ordenesVisibles[idx];
    if (!o) return;

    ordenSeleccionada = o;
    selHorario.innerHTML = '<option value="">Seleccionar horario</option>';

    const franjas = Array.isArray(o.franjas) ? o.franjas : [];
    franjas.forEach((f, i) => {
      if (!franjaEnGuardia(f?.horario)) return;
      const opt = document.createElement("option");
      opt.value = String(i);
      opt.text = String(f?.horario || "").trim();
      selHorario.appendChild(opt);
    });
  }

  function actualizarDatosFranja() {
    if (!ordenSeleccionada || !selHorario) return;
    const i = Number(selHorario.value);
    const franjas = Array.isArray(ordenSeleccionada.franjas) ? ordenSeleccionada.franjas : [];
    franjaSeleccionada = franjas[i] || null;
  }

  function actualizarTipo() {
    if (!selTipo) return;
    const fin = String(selTipo.value || "").toUpperCase() === "FINALIZA";
    if (divFinaliza) divFinaliza.classList.toggle("hidden", !fin);
    if (divDetalles) divDetalles.classList.toggle("hidden", !fin);
  }

  // ======================================================
  // ===== Importar JSON local (opcional) =================
  // ======================================================
  function importarOrdenes() {
    if (!elImportBox) return;

    const texto = elImportBox.value.trim();
    if (!texto) return;

    let data;
    try { data = JSON.parse(texto); }
    catch {
      alert("JSON inválido.");
      return;
    }

    if (!Array.isArray(data)) {
      alert("El JSON debe ser un array de órdenes.");
      return;
    }

    Storage.guardar(data);
    reconstruirSelectorDesdeStorage();
    limpiarSeleccionOrden();
  }

  // ======================================================
  // ===== Helpers para WhatsApp ==========================
  // ======================================================
  function seleccion(clase) {
    return Array.from(document.querySelectorAll("." + clase + ":checked"))
      .map(e => e.value)
      .join("\n");
  }

  function seleccionLinea(clase, sep) {
    const v = Array.from(document.querySelectorAll("." + clase + ":checked")).map(e => e.value);
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

    if (selTipo) selTipo.value = "";
    if (selOrden) selOrden.value = "";
    if (selHorario) selHorario.innerHTML = '<option value="">Seleccionar horario</option>';

    document.querySelectorAll('input[type="checkbox"]').forEach(c => (c.checked = false));
    document.querySelectorAll('input[type="number"], input[type="text"], textarea').forEach(i => (i.value = ""));

    if (divFinaliza) divFinaliza.classList.add("hidden");
    if (divDetalles) divDetalles.classList.add("hidden");
  }

  // ======================================================
  // ===== ENVIAR A WHATSAPP ==============================
  // ======================================================
  function enviar() {
    if (!ordenSeleccionada || !franjaSeleccionada || !selTipo) return;

    if (!seleccion("personal")) {
      alert("Debe seleccionar personal policial.");
      return;
    }
    if (seleccionLinea("movil", "/") === "/") {
      alert("Debe seleccionar al menos un móvil.");
      return;
    }

    const fecha = new Date().toLocaleDateString("es-AR");
    const tipo = String(selTipo.value || "").trim();
    const tipoFmt = tipo ? (tipo.charAt(0) + tipo.slice(1).toLowerCase()) : "";

    let bloqueResultados = "";
    let textoDetalles = "";

    if (String(selTipo.value || "").toUpperCase() === "FINALIZA") {
      const getNum = (id) => document.getElementById(id)?.value || 0;

      const vehiculos = getNum("vehiculos");
      const personas = getNum("personas");
      const testalom = getNum("testalom");
      const alco = getNum("Alcotest");
      const posSan = getNum("positivaSancionable");
      const posNo = getNum("positivaNoSancionable");
      const actas = getNum("actas");
      const requisa = getNum("Requisa");
      const qrz = getNum("qrz");
      const dominio = getNum("dominio");

      const remision = getNum("Remision");
      const retencion = getNum("Retencion");
      const prohibicion = getNum("Prohibicion");
      const cesion = getNum("Cesion");

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

    const obs = document.getElementById("obs")?.value || "Sin novedad";

    const texto =
`Policia de la Provincia de Santa Fe - Guardia Provincial
Brigada Motorizada Centro Norte
Tercio Charly
${tipoFmt} ${normalizarTituloOperativo(franjaSeleccionada.titulo)} ${ordenSeleccionada.num}
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
${obs}`.replace(/\n{2,}/g, "\n");

    // Reset UI antes de salir
    resetUI();

    // permitir repaint antes de navegar
    setTimeout(() => {
      window.location.href = "https://wa.me/?text=" + encodeURIComponent(texto);
    }, 0);
  }

  // ======================================================
  // ===== Eventos (selector refresca antes de abrir) =====
  // ======================================================
  if (elToggleCarga) elToggleCarga.addEventListener("change", toggleCargaOrdenes);
  if (btnCargarOrdenes) btnCargarOrdenes.addEventListener("click", importarOrdenes);

  if (selOrden) {
    selOrden.addEventListener("pointerdown", async (e) => {
      e.preventDefault();
      await syncAntesDeSeleccion();
      selOrden.focus();
      setTimeout(() => selOrden.click(), 0);
    });

    // teclado (Tab)
    selOrden.addEventListener("focus", () => {
      syncAntesDeSeleccion();
    });

    selOrden.addEventListener("change", cargarHorariosOrden);
  }

  if (selHorario) selHorario.addEventListener("change", actualizarDatosFranja);
  if (selTipo) selTipo.addEventListener("change", actualizarTipo);
  if (btnEnviar) btnEnviar.addEventListener("click", enviar);

  // ======================================================
  // ===== Init ===========================================
  // ======================================================
  (async function init() {
    // UI base
    toggleCargaOrdenes();
    actualizarTipo();

    // 1) primero arma con lo que haya en Storage (rápido)
    reconstruirSelectorDesdeStorage();

    // 2) luego intenta sync servidor (sin borrar Storage si viene vacío)
    await syncOrdenesDesdeServidor();

    // 3) y vuelve a armar selector por si hubo cambios
    reconstruirSelectorDesdeStorage();
  })();
})();
















