(function () {
  "use strict";

  window.WSP = window.WSP || {};
  window.WSP.modules = window.WSP.modules || {};

  const STORAGE_KEY = "wsp_ocr460_dominios_aprendidos_v1";
  const SUPABASE_TABLE = "ocr_patentes_aprendidas";

  // Tabla base rápida para dominios/patentes problemáticas del OCR 460/22.
  // Formato: lectura OCR dudosa -> dominio correcto.
  const CORRECCIONES = Object.freeze({
    // Caso real observado: A006DCQ. El cero impreso con línea interna suele salir como 6/O/Q/D/G/5.
    A606DCQ: "A006DCQ",
    A666DCQ: "A006DCQ",
    A6O6DCQ: "A006DCQ",
    A60GDCQ: "A006DCQ",
    AO06DCQ: "A006DCQ",
    AOO6DCQ: "A006DCQ",
    AQ06DCQ: "A006DCQ",
    AQQ6DCQ: "A006DCQ",
    AD06DCQ: "A006DCQ",
    ADD6DCQ: "A006DCQ",
    A5550OA: "A006DCQ",
    A555OQA: "A006DCQ",
  });

  // Patentes reales conocidas. Sirve para validar exactos y para agregar casos nuevos al archivo.
  const PATENTES = Object.freeze([
    "A006DCQ",
  ]);

  let aprendizajesSupabase = {};
  let promesaCargaSupabase = null;
  let supabaseCargado = false;

  function normalizarMayus(value) {
    return String(value || "")
      .replace(/[–—]/g, "-")
      .replace(/\s+/g, " ")
      .trim()
      .toUpperCase();
  }

  function limpiarToken(value) {
    return normalizarMayus(value)
      .replace(/[ØøΘθΦφ⊘◎○●¤@]/g, "0")
      .replace(/[^A-Z0-9]/g, "");
  }

  function esDominioMotoValido(value) {
    const token = limpiarToken(value);
    return /^[0-9]{3}[A-Z]{3}$/.test(token) || /^[A-Z][0-9]{3}[A-Z]{3}$/.test(token);
  }

  function supabaseConfig() {
    const cfg = window.WSP?.config || window.BMZCN?.Supabase?.config || {};
    const url = cfg.supabaseUrl || cfg.SUPABASE_URL || window.SUPABASE_URL || "";
    const key = cfg.supabaseAnonKey || cfg.SUPABASE_ANON_KEY || window.SUPABASE_ANON_KEY || "";
    if (!url || !key) return null;
    return { url: String(url).replace(/\/+$/, ""), key };
  }

  function supabaseHeaders(extra = {}) {
    const cfg = supabaseConfig();
    if (!cfg) return null;
    return {
      apikey: cfg.key,
      Authorization: `Bearer ${cfg.key}`,
      Accept: "application/json",
      ...extra,
    };
  }

  function leerAprendidasLocales() {
    try {
      const raw = window.localStorage ? window.localStorage.getItem(STORAGE_KEY) : "";
      const data = raw ? JSON.parse(raw) : {};
      if (!data || typeof data !== "object") return {};
      const out = {};
      Object.entries(data).forEach(([k, v]) => {
        const key = limpiarToken(k);
        const val = limpiarToken(v);
        if (key && esDominioMotoValido(val)) out[key] = val;
      });
      return out;
    } catch (error) {
      console.warn("[WSP Patentes OCR] No se pudo leer tabla aprendida local.", error);
      return {};
    }
  }

  function leerAprendidas() {
    return {
      ...leerAprendidasLocales(),
      ...(aprendizajesSupabase || {}),
    };
  }

  function guardarAprendidasLocales(tabla) {
    try {
      if (!window.localStorage) return false;
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tabla || {}));
      return true;
    } catch (error) {
      console.warn("[WSP Patentes OCR] No se pudo guardar tabla aprendida local.", error);
      return false;
    }
  }

  function generarVariantes(dominioCorrecto) {
    const dominio = limpiarToken(dominioCorrecto);
    if (!esDominioMotoValido(dominio)) return [];

    const variantes = [dominio];
    const variantesPorDigito = {
      "0": ["0", "O", "Q", "D", "6", "G", "5"],
      "6": ["6", "G", "0", "O", "Q"],
      "1": ["1", "I", "L"],
      "2": ["2", "Z"],
      "5": ["5", "S"],
      "8": ["8", "B"],
    };

    const posicionesNumericas = dominio.length === 7 ? [1, 2, 3] : [0, 1, 2];
    for (const pos of posicionesNumericas) {
      const ch = dominio[pos];
      const vars = variantesPorDigito[ch] || [ch];
      const actuales = variantes.slice();
      for (const actual of actuales) {
        for (const v of vars) variantes.push(actual.slice(0, pos) + v + actual.slice(pos + 1));
      }
    }

    return Array.from(new Set(variantes.map(limpiarToken).filter(Boolean)));
  }

  async function cargarAprendizajesSupabaseEnSegundoPlano() {
    if (supabaseCargado) return aprendizajesSupabase;
    if (promesaCargaSupabase) return promesaCargaSupabase;

    promesaCargaSupabase = (async () => {
      const cfg = supabaseConfig();
      const headers = supabaseHeaders();
      if (!cfg || !headers) return aprendizajesSupabase;

      try {
        const params = new URLSearchParams({
          select: "variante_ocr,patente_real,activo",
          activo: "eq.true",
          limit: "5000",
        });
        const resp = await fetch(`${cfg.url}/rest/v1/${SUPABASE_TABLE}?${params.toString()}`, { headers });
        if (!resp.ok) {
          console.warn("[WSP Patentes OCR] No se pudo cargar aprendizaje Supabase:", resp.status, await resp.text().catch(() => ""));
          return aprendizajesSupabase;
        }
        const rows = await resp.json().catch(() => []);
        const tabla = {};
        (Array.isArray(rows) ? rows : []).forEach((row) => {
          const key = limpiarToken(row?.variante_ocr);
          const val = limpiarToken(row?.patente_real);
          if (key && esDominioMotoValido(val)) tabla[key] = val;
        });
        aprendizajesSupabase = tabla;
        supabaseCargado = true;
        console.info("[WSP Patentes OCR] Aprendizajes Supabase cargados:", Object.keys(tabla).length);
        return aprendizajesSupabase;
      } catch (error) {
        console.warn("[WSP Patentes OCR] Error cargando aprendizaje Supabase.", error);
        return aprendizajesSupabase;
      }
    })();

    return promesaCargaSupabase;
  }

  function guardarAprendizajesSupabaseEnSegundoPlano(candidatosOcr, dominioCorrecto) {
    const correcto = limpiarToken(dominioCorrecto);
    if (!esDominioMotoValido(correcto)) return;

    const cfg = supabaseConfig();
    const headers = supabaseHeaders({
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates,return=minimal",
    });
    if (!cfg || !headers) return;

    const candidatos = new Set();
    (Array.isArray(candidatosOcr) ? candidatosOcr : [candidatosOcr]).forEach((c) => {
      const token = limpiarToken(c);
      if (token && token !== correcto) candidatos.add(token);
    });
    generarVariantes(correcto).forEach((v) => {
      if (v && v !== correcto) candidatos.add(v);
    });

    const now = new Date().toISOString();
    const rows = Array.from(candidatos)
      .filter((token) => token.length >= 5 && token.length <= 12)
      .map((token) => ({
        variante_ocr: token,
        patente_real: correcto,
        tipo_vehiculo: "MOTO",
        fuente: "WSP_OCR_460",
        activo: true,
        updated_at: now,
      }));
    if (!rows.length) return;

    rows.forEach((row) => { aprendizajesSupabase[row.variante_ocr] = row.patente_real; });

    fetch(`${cfg.url}/rest/v1/${SUPABASE_TABLE}?on_conflict=variante_ocr`, {
      method: "POST",
      headers,
      body: JSON.stringify(rows),
    }).catch((error) => {
      console.warn("[WSP Patentes OCR] No se pudo guardar aprendizaje Supabase.", error);
    });
  }

  function buscar(value) {
    const token = limpiarToken(value);
    if (!token) return "";

    if (CORRECCIONES[token]) return CORRECCIONES[token];

    const aprendidas = leerAprendidas();
    if (aprendidas[token]) return aprendidas[token];

    if (PATENTES.includes(token)) return token;

    // Ventanas dentro de una línea contaminada, por ejemplo: A666DCQTIPOMOTOCICLETA.
    for (let i = 0; i <= Math.max(0, token.length - 7); i++) {
      const w7 = token.slice(i, i + 7);
      if (CORRECCIONES[w7]) return CORRECCIONES[w7];
      if (aprendidas[w7]) return aprendidas[w7];
      if (PATENTES.includes(w7)) return w7;
    }
    for (let i = 0; i <= Math.max(0, token.length - 6); i++) {
      const w6 = token.slice(i, i + 6);
      if (CORRECCIONES[w6]) return CORRECCIONES[w6];
      if (aprendidas[w6]) return aprendidas[w6];
      if (PATENTES.includes(w6)) return w6;
    }

    return "";
  }

  function aprender(candidatosOcr, dominioCorrecto) {
    const correcto = limpiarToken(dominioCorrecto);
    if (!esDominioMotoValido(correcto)) return false;

    const tabla = leerAprendidasLocales();
    const candidatos = new Set();

    (Array.isArray(candidatosOcr) ? candidatosOcr : [candidatosOcr]).forEach((c) => {
      const token = limpiarToken(c);
      if (token && token !== correcto) candidatos.add(token);
    });

    generarVariantes(correcto).forEach((v) => {
      if (v && v !== correcto) candidatos.add(v);
    });

    let cambio = false;
    candidatos.forEach((token) => {
      if (token.length < 5 || token.length > 12) return;
      if (tabla[token] !== correcto) {
        tabla[token] = correcto;
        cambio = true;
      }
      if (aprendizajesSupabase[token] !== correcto) aprendizajesSupabase[token] = correcto;
    });

    if (cambio) guardarAprendidasLocales(tabla);
    guardarAprendizajesSupabaseEnSegundoPlano(Array.from(candidatos), correcto);
    return cambio;
  }

  function getAprendidas() {
    return leerAprendidas();
  }

  const api = {
    version: "ocr460-patentes-supabase-bg-20260614",
    patentes: PATENTES,
    correcciones: CORRECCIONES,
    buscar,
    aprender,
    getAprendidas,
    cargarAprendizajesSupabaseEnSegundoPlano,
    guardarAprendizajesSupabaseEnSegundoPlano,
  };

  window.WSP.modules.patentesOcr460 = api;
  window.WSP_OCR460_PATENTES = api;

  console.log("[WSP Patentes OCR 460] cargado", api.version);
})();
