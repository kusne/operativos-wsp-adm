// ===== CONFIG SUPABASE (SOLO LECTURA WSP) =====
const SUPABASE_URL = "https://ugeydxozfewzhldjbkat.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_ZeLC2rOxhhUXlQdvJ28JkA_qf802-pX";

(function () {
  // ===== DOM refs =====
  const selTipo = document.getElementById("tipo");
  const selOrden = document.getElementById("orden");
  const selHorario = document.getElementById("horario");

  const divFinaliza = document.getElementById("finaliza");
  const divDetalles = document.getElementById("bloqueDetalles");

  const divMismosElementos = document.getElementById("bloqueMismosElementos");
  const chkMismosElementos = document.getElementById("mismosElementos");
  const btnEnviar = document.getElementById("btnEnviar");

  // ===== Estado =====
  let ordenSeleccionada = null;
  let franjaSeleccionada = null;
  let syncingOrdenes = false;

  // Cache en memoria
  let ordenesCache = [];

  function guardarOrdenesSeguro(arr) {
    ordenesCache = Array.isArray(arr) ? arr : [];
    try {
      StorageApp && StorageApp.guardarOrdenes && StorageApp.guardarOrdenes(ordenesCache);
    } catch (e) {
      console.warn("[WSP] No se pudo guardar en StorageApp, uso cache en memoria.", e);
    }
  }

  function cargarOrdenesSeguro() {
    try {
      const arr = StorageApp && StorageApp.cargarOrdenes && StorageApp.cargarOrdenes();
      if (Array.isArray(arr)) return arr;
    } catch (e) {
      console.warn("[WSP] No se pudo leer de StorageApp, uso cache en memoria.", e);
    }
    return Array.isArray(ordenesCache) ? ordenesCache : [];
  }

  // ======================================================
  // ===== LECTURA DESDE SUPABASE ==========================
  // ======================================================
  async function syncOrdenesDesdeServidor() {
    try {
      const r = await fetch(
        `${SUPABASE_URL}/rest/v1/ordenes_store?select=payload&order=updated_at.desc&limit=1`,
        {
          headers: {
            apikey: SUPABASE_ANON_KEY,
            Accept: "application/json",
          },
        }
      );

      if (!r.ok) {
        console.error("[WSP] Supabase REST error:", r.status, await r.text());
        return false;
      }

      const data = await r.json();
      if (!Array.isArray(data) || !Array.isArray(data[0]?.payload)) return false;

      guardarOrdenesSeguro(data[0].payload);
      return true;
    } catch (e) {
      console.error("Error leyendo Supabase:", e);
      return false;
    }
  }

  async function syncAntesDeSeleccion() {
    if (syncingOrdenes) return;
    syncingOrdenes = true;

    const ok = await syncOrdenesDesdeServidor();
    if (ok) {
      cargarOrdenesDisponibles();
      limpiarSeleccionOrden();
    }

    syncingOrdenes = false;
  }

  // ===== UI =====
  function limpiarSeleccionOrden() {
    ordenSeleccionada = null;
    franjaSeleccionada = null;
    selOrden.value = "";
    selHorario.innerHTML = '<option value="">Seleccionar horario</option>';
  }

  // ===== Guardia =====
  function getGuardiaInicio() {
    const now = new Date();
    const start = new Date(now);
    start.setHours(6, 0, 0, 0);
    if (now < start) start.setDate(start.getDate() - 1);
    return start;
  }

  function extraerHoraInicio(h) {
    const s = String(h || "").toLowerCase();

    let m = s.match(/(\d{1,2})\s*:\s*\d{2}/);
    if (m) {
      const n = parseInt(m[1], 10);
      return n >= 0 && n <= 23 ? n : null;
    }

    m = s.match(/(?:^|desde|de|horario|hs|h|a\s+las)\s*(\d{1,2})\b/);
    if (m) {
      const n = parseInt(m[1], 10);
      return n >= 0 && n <= 23 ? n : null;
    }

    m = s.match(/\b(\d{1,2})\b/);
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

  function parseVigenciaFlexible(v) {
    try {
      const d = Dates?.parseVigenciaToDate?.(v);
      if (d instanceof Date && !isNaN(d)) return d;
    } catch {}

    const iso = String(v || "").match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (iso) return new Date(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3]));

    const latam = String(v || "").match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (latam) return new Date(Number(latam[3]), Number(latam[2]) - 1, Number(latam[1]));

    return null;
  }

  function cargarOrdenesDisponibles() {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    let ordenes = OrdersSync.filtrarCaducadas(cargarOrdenesSeguro());
    guardarOrdenesSeguro(ordenes);

    selOrden.innerHTML = '<option value="">Seleccionar</option>';

    ordenes.forEach((o, i) => {
      const v = parseVigenciaFlexible(o.vigencia);
      if (!v || v > hoy) return;
      if (!o.franjas?.some((f) => franjaEnGuardia(f.horario))) return;

      const op = document.createElement("option");
      op.value = i;
      op.text = `${o.num} ${o.textoRef || ""}`.trim();
      selOrden.appendChild(op);
    });
  }

  function limpiarTextoSimple(txt) {
    return String(txt || "")
      .replace(/\s+/g, " ")
      .replace(/[–—]/g, "-")
      .trim();
  }

  function normalizarBasicoSinAcentos(txt) {
    return limpiarTextoSimple(txt)
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  }

  function obtenerTipoCortoFranja(franja) {
    const fuente = normalizarBasicoSinAcentos(
      [franja?.titulo || "", ordenSeleccionada?.textoRef || ""].join(" ")
    );

    if (/\balcoholemia\b|\balcoholimetr/i.test(fuente)) return "Alcoholemia";
    if (/\bordenamiento\b/.test(fuente)) return "Ordenamiento";
    if (/\blimpieza\s*tunel\b/.test(fuente)) return "Limpieza Tunel";
    if (/\bcustodia\b/.test(fuente)) return "Custodia";
    if (/\btraslado\b/.test(fuente)) return "Traslado";
    if (/\bmonitoreo\b/.test(fuente)) return "Monitoreo";
    if (/\bpatrullaje\b/.test(fuente)) return "Patrullaje";
    if (/\bocv\b/.test(fuente)) return "OCV";
    if (/\bestablecido\b/.test(fuente)) return "Establecido";
    if (/\bpuente\s*carretero\b/.test(fuente)) return "Puente Carretero";
    if (/\bcontrol\b/.test(fuente)) return "Control";

    const titulo = limpiarTextoSimple(franja?.titulo || "");
    if (!titulo) return "Operativo";

    return titulo.length > 22 ? titulo.slice(0, 22).trim() : titulo;
  }

  function obtenerLugarCortoFranja(franja) {
    let lugar = limpiarTextoSimple(franja?.lugar || "");
    if (!lugar) return "sin lugar";

    lugar = lugar
      .replace(/^qth\s*[:\-]?\s*/i, "")
      .replace(/^lugar\s*[:\-]?\s*/i, "")
      .trim()
      .toLowerCase();

    if (lugar.length > 30) {
      return lugar.slice(0, 30).trim() + "...";
    }

    return lugar;
  }

  function construirTextoOpcionHorario(franja) {
    const horario = limpiarTextoSimple(franja?.horario || "");
    const tipo = obtenerTipoCortoFranja(franja);
    const lugar = obtenerLugarCortoFranja(franja);

    return `${horario} - ${tipo} - ${lugar}`;
  }

  function cargarHorariosOrden() {
    ordenSeleccionada = null;
    franjaSeleccionada = null;

    const ordenes = cargarOrdenesSeguro();
    const idx = Number(selOrden.value);
    if (!ordenes[idx]) return;

    ordenSeleccionada = ordenes[idx];
    selHorario.innerHTML = '<option value="">Seleccionar horario</option>';

    ordenSeleccionada.franjas.forEach((f, i) => {
      if (franjaEnGuardia(f.horario)) {
        const o = document.createElement("option");
        o.value = i;
        o.text = construirTextoOpcionHorario(f);
        o.title = construirTextoOpcionHorario(f);
        selHorario.appendChild(o);
      }
    });
  }

  function actualizarDatosFranja() {
    if (!ordenSeleccionada) return;
    franjaSeleccionada = ordenSeleccionada.franjas[Number(selHorario.value)] || null;
  }

  function actualizarTipo() {
    const fin = selTipo.value === "FINALIZA";

    divFinaliza.classList.toggle("hidden", !fin);
    divDetalles.classList.toggle("hidden", !fin);

    if (divMismosElementos) divMismosElementos.classList.toggle("hidden", !fin);

    if (!fin) {
      if (chkMismosElementos) chkMismosElementos.checked = false;
      setElementosVisibles(true);
      return;
    }

    const payload = cargarElementosGuardados?.() || null;

    if (chkMismosElementos) chkMismosElementos.checked = !!payload;

    if (payload) {
      aplicarElementos(payload);
      setElementosVisibles(false);
    } else {
      setElementosVisibles(true);
    }
  }

  // ======================================================
  // ===== SELECCIONES =====================================
  // ======================================================
  function seleccion(clase) {
    return Array.from(document.querySelectorAll("." + clase + ":checked"))
      .map((e) => e.value)
      .join("\n");
  }

  function seleccionLinea(clase, sep) {
    const v = Array.from(document.querySelectorAll("." + clase + ":checked")).map((e) => e.value);
    return v.length ? v.join(" " + sep + " ") : "/";
  }

  function leerSeleccionPorClase(clase) {
    return Array.from(document.querySelectorAll("." + clase + ":checked")).map((e) => e.value);
  }

  function lineaDesdeArray(arr, sep) {
    const v = Array.isArray(arr) ? arr : [];
    return v.length ? v.join(" " + sep + " ") : "/";
  }

  // ======================================================
  // ===== NORMALIZADORES DE SALIDA =======================
  // ======================================================
  function normalizarTituloOperativo(txt) {
    if (!txt) return "";

    let t = txt.toLowerCase().trim();
    t = t.replace(/\b\w/g, (l) => l.toUpperCase());
    t = t.replace(/\b(o\.?\s*op\.?|op)\s*0*(\d+\/\d+)\b/i, "O.Op. $2");

    return t;
  }

  function normalizarLugar(txt) {
    if (!txt) return "";
    return txt
      .toLowerCase()
      .trim()
      .replace(/\b\w/g, (l) => l.toUpperCase());
  }

  function normalizarHorario(txt) {
    if (!txt) return "";

    let t = txt.toLowerCase().replace(/\s+/g, " ").trim();
    t = t.replace(/\bfinalizar\b/g, "Finalizar");

    return t;
  }

  function bold(txt) {
    return `*${String(txt || "").trim()}*`;
  }

  function valorObservacionPorDefecto() {
    const txt = String(document.getElementById("obs")?.value || "").trim();
    return txt || "Sin novedad";
  }

  function compactarSaltos(texto) {
    return String(texto || "")
      .replace(/[ \t]+\n/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  }

  function esOperativoConjunto() {
    const fuente = [
      franjaSeleccionada?.titulo || "",
      ordenSeleccionada?.textoRef || "",
    ]
      .join(" ")
      .toLowerCase();

    return /\buor\s*3\b|\buor3\b|\bmunicipio\b|\bufiv\b/.test(fuente);
  }

  function bloqueConjuntoExtra() {
    if (!esOperativoConjunto()) return "";

    return `${bold("Personal UOR 3:")}

${bold("Moviles:")}`;
  }

  function esFinalizaSinResultados() {
    const fuente = [
      franjaSeleccionada?.titulo || "",
      ordenSeleccionada?.textoRef || "",
    ]
      .join(" ")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

    return /\bordenamiento\b|\blimpieza\s*tunel\b|\bcustodia\b|\btraslado\b|\bmonitoreo\b/.test(fuente);
  }

  // ======================================================
  // ===== DETALLES ========================================
  // ======================================================
  function normalizarLineaDetalle(linea) {
    let s = String(linea || "").trim();
    if (!s) return "";

    s = s.replace(/\s+/g, " ").trim();

    let m = s.match(/^\(\s*(\d{1,2})\s*\)\s*(\d{4,5})\s+(.+)$/i);
    if (m) {
      const cantidad = m[1].padStart(2, "0");
      const codigo = m[2];
      const descripcion = m[3].trim().replace(/^:\s*/, "");
      return `(${cantidad}) ${codigo} ${descripcion}`;
    }

    m = s.match(/^(\d{1,2})\s+(\d{4,5})\s+(.+)$/i);
    if (m) {
      const cantidad = m[1].padStart(2, "0");
      const codigo = m[2];
      const descripcion = m[3].trim().replace(/^:\s*/, "");
      return `(${cantidad}) ${codigo} ${descripcion}`;
    }

    m = s.match(/^(\d{4,5})\s*:?\s*(.+)$/i);
    if (m) {
      const codigo = m[1];
      const descripcion = m[2].trim().replace(/^:\s*/, "");
      return `(01) ${codigo} ${descripcion}`;
    }

    return s;
  }

  function normalizarDetallesTexto(texto) {
    const limpio = String(texto || "").replace(/\r/g, "").trim();
    if (!limpio) return "";

    return limpio
      .split("\n")
      .map((linea) => normalizarLineaDetalle(linea))
      .filter(Boolean)
      .join("\n");
  }

  function construirLineasResultados() {
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

    return [
      `Vehículos Fiscalizados: (${vehiculos})`,
      `Personas Identificadas: (${personas})`,
      `Test de Alómetro: (${testalom})`,
      `Test de Alcoholímetro: (${alco})`,
      `Positiva Sancionable: (${posSan})`,
      `Positiva no Sancionable: (${posNo})`,
      `Actas Labradas: (${actas})`,
      `Requisas: (${requisa})`,
      `Qrz: (${qrz})`,
      `Dominio: (${dominio})`,
      `Medidas Cautelares:`,
      `Remisión: (${remision})`,
      `Retención: (${retencion})`,
      `Prohibición de Circulación: (${prohibicion})`,
      `Cesión de Conducción: (${cesion})`,
    ];
  }

  function setElementosVisibles(visible) {
    const ids = [
      "bloqueEscopeta",
      "bloqueHT",
      "bloquePDA",
      "bloqueImpresora",
      "bloqueAlometro",
      "bloqueAlcoholimetro",
    ];

    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.classList.toggle("hidden", !visible);
    });
  }

  function resetUI() {
    ordenSeleccionada = null;
    franjaSeleccionada = null;

    selTipo.value = "";
    selOrden.value = "";
    selHorario.innerHTML = '<option value="">Seleccionar horario</option>';

    document.querySelectorAll('input[type="checkbox"]').forEach((c) => (c.checked = false));

    document
      .querySelectorAll('input[type="number"], input[type="text"], textarea')
      .forEach((i) => (i.value = ""));

    const obs = document.getElementById("obs");
    if (obs) obs.value = "";

    divFinaliza.classList.add("hidden");
    divDetalles.classList.add("hidden");

    if (chkMismosElementos) chkMismosElementos.checked = false;
    if (divMismosElementos) divMismosElementos.classList.add("hidden");

    setElementosVisibles(true);
  }

  // ======================================================
  // ===== MISMOS ELEMENTOS ================================
  // ======================================================
  function guardarElementosDeInicio() {
    const payload = {
      ts: Date.now(),
      ESCOPETA: leerSeleccionPorClase("ESCOPETA"),
      HT: leerSeleccionPorClase("HT"),
      PDA: leerSeleccionPorClase("PDA"),
      IMPRESORA: leerSeleccionPorClase("IMPRESORA"),
      Alometro: leerSeleccionPorClase("Alometro"),
      Alcoholimetro: leerSeleccionPorClase("Alcoholimetro"),
    };

    try {
      if (typeof StorageApp !== "undefined" && typeof StorageApp.guardarElementosInicio === "function") {
        StorageApp.guardarElementosInicio(payload);
        return;
      }
    } catch (e) {
      console.warn("[WSP] Error guardando en StorageApp, uso localStorage.", e);
    }

    try {
      localStorage.setItem("elementos_inicio", JSON.stringify(payload));
    } catch (e) {
      console.warn("[WSP] No se pudo guardar en localStorage.", e);
    }
  }

  function cargarElementosGuardados() {
    try {
      const p = StorageApp?.cargarElementosInicio?.();
      if (p) return p;
    } catch {}

    try {
      return JSON.parse(localStorage.getItem("elementos_inicio") || "null");
    } catch {
      return null;
    }
  }

  function limpiarSeleccionElementos() {
    const clases = ["ESCOPETA", "HT", "PDA", "IMPRESORA", "Alometro", "Alcoholimetro"];
    clases.forEach((clase) => {
      document.querySelectorAll("." + clase).forEach((inp) => {
        inp.checked = false;
      });
    });
  }

  function aplicarElementos(payload) {
    if (!payload) return;

    const map = {
      ESCOPETA: payload.ESCOPETA,
      HT: payload.HT,
      PDA: payload.PDA,
      IMPRESORA: payload.IMPRESORA,
      Alometro: payload.Alometro,
      Alcoholimetro: payload.Alcoholimetro,
    };

    Object.keys(map).forEach((clase) => {
      const wanted = new Set(Array.isArray(map[clase]) ? map[clase] : []);
      const inputs = Array.from(document.querySelectorAll("." + clase));

      inputs.forEach((inp) => {
        inp.checked = wanted.has(inp.value);
      });
    });
  }

  if (chkMismosElementos) {
    chkMismosElementos.addEventListener("change", () => {
      if (!chkMismosElementos.checked) {
        limpiarSeleccionElementos();
        setElementosVisibles(true);
        return;
      }

      const payload = cargarElementosGuardados();
      if (!payload) {
        alert("No hay elementos guardados del INICIA.");
        chkMismosElementos.checked = false;
        limpiarSeleccionElementos();
        setElementosVisibles(true);
        return;
      }

      aplicarElementos(payload);
      setElementosVisibles(false);
    });
  }

  // ===== ENVIAR A WHATSAPP =====
  function enviar() {
    if (!ordenSeleccionada || !franjaSeleccionada) return;

    if (!seleccion("personal")) {
      alert("Debe seleccionar personal policial.");
      return;
    }

    const mov = seleccionLinea("movil", "/");
    const mot = seleccionLinea("moto", "/");
    if (mov === "/" && mot === "/") {
      alert("Debe seleccionar al menos un móvil o moto.");
      return;
    }

    const esFinaliza = selTipo.value === "FINALIZA";
    const finalizaSinResultados = esFinaliza && esFinalizaSinResultados();
    const usarMismosElementos = esFinaliza && !!chkMismosElementos?.checked;

    let elementosInicio = null;
    if (usarMismosElementos) {
      elementosInicio = cargarElementosGuardados();
      if (!elementosInicio) {
        alert("No hay elementos guardados del INICIA. Destilde “mismos elementos” o envíe primero un INICIA.");
        return;
      }
    }

    const fecha = new Date().toLocaleDateString("es-AR");

    const escopetasTXT = usarMismosElementos
      ? lineaDesdeArray(elementosInicio.ESCOPETA, "/")
      : seleccionLinea("ESCOPETA", "/");
    const htTXT = usarMismosElementos
      ? lineaDesdeArray(elementosInicio.HT, "/")
      : seleccionLinea("HT", "/");
    const pdaTXT = usarMismosElementos
      ? lineaDesdeArray(elementosInicio.PDA, "/")
      : seleccionLinea("PDA", "/");
    const impTXT = usarMismosElementos
      ? lineaDesdeArray(elementosInicio.IMPRESORA, "/")
      : seleccionLinea("IMPRESORA", "/");
    const alomTXT = usarMismosElementos
      ? lineaDesdeArray(elementosInicio.Alometro, "/")
      : seleccionLinea("Alometro", "/");
    const alcoTXT = usarMismosElementos
      ? lineaDesdeArray(elementosInicio.Alcoholimetro, "/")
      : seleccionLinea("Alcoholimetro", "/");

    const tituloPrincipal = `${selTipo.value.charAt(0) + selTipo.value.slice(1).toLowerCase()} ${normalizarTituloOperativo(
      franjaSeleccionada.titulo
    )} ${ordenSeleccionada.num}`.trim();

    const mobilesTexto =
      [seleccionLinea("movil", "/"), seleccionLinea("moto", "/")]
        .filter((v) => v !== "/")
        .join(" / ") || "/";

    const partes = [];

    partes.push(bold("Policia de la Provincia de Santa Fe - Guardia Provincial"));
    partes.push(bold("Brigada Motorizada Centro Norte"));
    partes.push(bold("Tercio Charlie"));
    partes.push("");

    partes.push(bold(tituloPrincipal));
    partes.push("");

    partes.push(`${bold("Fecha:")} ${fecha}`);
    partes.push(`${bold("Horario:")} ${normalizarHorario(franjaSeleccionada.horario)}`);
    partes.push(`${bold("Lugar:")} ${normalizarLugar(franjaSeleccionada.lugar)}`);
    partes.push("");

    partes.push(bold("Personal Policial:"));
    partes.push(seleccion("personal") || "/");
    partes.push("");

    partes.push(`${bold("Móviles:")} ${mobilesTexto}`);
    partes.push("");

    const extraConjunto = bloqueConjuntoExtra();
    if (extraConjunto) {
      partes.push(extraConjunto);
      partes.push("");
    }

    partes.push(bold("Elementos:"));
    partes.push(`Escopetas: ${escopetasTXT}`);
    partes.push(`Ht: ${htTXT}`);
    partes.push(`Pda: ${pdaTXT}`);
    partes.push(`Impresoras: ${impTXT}`);
    partes.push(`Alómetros: ${alomTXT}`);
    partes.push(`Alcoholímetros: ${alcoTXT}`);

    if (esFinaliza && !finalizaSinResultados) {
      partes.push("");
      partes.push(bold("Resultados:"));
      partes.push(...construirLineasResultados());

      const detallesNormalizados = normalizarDetallesTexto(document.getElementById("detalles")?.value || "");
      if (detallesNormalizados) {
        partes.push("");
        partes.push(bold("Detalles:"));
        partes.push(detallesNormalizados);
      }
    }

    if (esFinaliza && finalizaSinResultados) {
      const detallesNormalizados = normalizarDetallesTexto(document.getElementById("detalles")?.value || "");
      if (detallesNormalizados) {
        partes.push("");
        partes.push(bold("Detalles:"));
        partes.push(detallesNormalizados);
      }
    }

    partes.push("");
    partes.push(bold("Observaciones:"));
    partes.push(valorObservacionPorDefecto());

    const textoFinal = compactarSaltos(partes.join("\n"));

    if (selTipo.value === "INICIA") {
      guardarElementosDeInicio();
    }

    resetUI();

    setTimeout(() => {
      window.location.href = "https://wa.me/?text=" + encodeURIComponent(textoFinal);
    }, 0);
  }

  // ===== Eventos =====
  selOrden.addEventListener("focus", syncAntesDeSeleccion);
  selOrden.addEventListener("change", cargarHorariosOrden);
  selHorario.addEventListener("change", actualizarDatosFranja);
  selTipo.addEventListener("change", actualizarTipo);
  btnEnviar.addEventListener("click", enviar);

  // ===== Init =====
  (async function init() {
    actualizarTipo();
    await syncOrdenesDesdeServidor();
    const _tmp = cargarOrdenesSeguro();
    console.log("[WSP] Órdenes en memoria/Storage:", Array.isArray(_tmp) ? _tmp.length : _tmp);
    cargarOrdenesDisponibles();
  })();
})();
