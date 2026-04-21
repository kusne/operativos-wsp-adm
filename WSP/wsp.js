// ===== CONFIG SUPABASE WSP =====
const SUPABASE_URL = "https://ugeydxozfewzhldjbkat.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_ZeLC2rOxhhUXlQdvJ28JkA_qf802-pX";

(function () {
  // ===== DOM refs =====
  const selTipo = document.getElementById("tipo");
  const selOrden = document.getElementById("orden");
  const selHorario = document.getElementById("horario");

  const divFinaliza = document.getElementById("finaliza");
  const divDetalles = document.getElementById("bloqueDetalles");
  const bloqueMostrarResultadosFinaliza = document.getElementById("bloqueMostrarResultadosFinaliza");
  const chkMostrarResultadosFinaliza = document.getElementById("mostrarResultadosFinaliza");
  const tituloResultadosFinaliza = document.getElementById("tituloResultadosFinaliza");
  const contenidoResultadosFinaliza = document.getElementById("contenidoResultadosFinaliza");
  const bloquePresenciaActiva = document.getElementById("bloquePresenciaActiva");
  const chkPresenciaActiva = document.getElementById("presenciaActiva");

  const divMismosElementos = document.getElementById("bloqueMismosElementos");
  const chkMismoPersonal = document.getElementById("mismoPersonal");
  const chkMismoMovil = document.getElementById("mismoMovil");
  const chkMismosElementos = document.getElementById("mismosElementos");
  const bloqueControlSuperior = document.getElementById("bloqueControlSuperior");
  const labelObs = document.getElementById("labelObs");
  const textareaObs = document.getElementById("obs");
  const btnEnviar = document.getElementById("btnEnviar");

  const inputAlcotest = document.getElementById("Alcotest");
  const inputPositivaSancionable = document.getElementById("positivaSancionable");
  const inputPositivaNoSancionable = document.getElementById("positivaNoSancionable");
  const bloquePositivosAlcoholimetro = document.getElementById("bloquePositivosAlcoholimetro");
  const wrapGraduacionesSancionable = document.getElementById("wrapGraduacionesSancionable");
  const wrapGraduacionesNoSancionable = document.getElementById("wrapGraduacionesNoSancionable");
  const graduacionesSancionable = document.getElementById("graduacionesSancionable");
  const graduacionesNoSancionable = document.getElementById("graduacionesNoSancionable");
  const unitGraduacionesSancionable = document.getElementById("unitGraduacionesSancionable");
  const unitGraduacionesNoSancionable = document.getElementById("unitGraduacionesNoSancionable");
  const inputQrz = document.getElementById("qrz");
  const inputDominio = document.getElementById("dominio");
  const wrapQrzCasilleros = document.getElementById("wrapQrzCasilleros");
  const qrzCasilleros = document.getElementById("qrzCasilleros");
  const wrapDominioCasilleros = document.getElementById("wrapDominioCasilleros");
  const dominioCasilleros = document.getElementById("dominioCasilleros");

  // ===== Estado =====
  let ordenSeleccionada = null;
  let franjaSeleccionada = null;
  let syncingOrdenes = false;

  // Cache en memoria
  let ordenesCache = [];
  let operativosCache = [];
  let inicioGuardadoActual = null;
  let inicioGuardadoLookupId = 0;

  const OBS_PRESENCIA_ACTIVA_INICIA = "Se inicia con Presencia Activa por inclemencias del tiempo ( lluvias).Se adjunta vistas Fotograficas.";
  const OBS_PRESENCIA_ACTIVA_FINALIZA = "Se Realizo Presencia Activa durante todo el operativo por inclemencias del tiempo(lluvias) . Se adjuntas vistas Fotograficas.";

  function limpiarErrorCampo(el) {
    if (!el) return;
    el.classList.remove("input-error");
  }

  function marcarErrorCampo(el, mensaje) {
    if (el) {
      el.classList.add("input-error");
      try { el.focus({ preventScroll: false }); } catch { try { el.focus(); } catch {} }
    }
    alert(mensaje);
    return false;
  }

  function leerEnteroNoNegativo(valor) {
    const n = parseInt(String(valor ?? "").trim(), 10);
    return Number.isFinite(n) && n > 0 ? n : 0;
  }

  function leerEnteroInput(el) {
    return leerEnteroNoNegativo(el?.value);
  }

  function formatearCantidad(n) {
    const v = Math.max(0, parseInt(n, 10) || 0);
    return String(v).padStart(2, "0");
  }

  function normalizarTextoGraduacion(valor) {
    return String(valor || "").replace(/\s+/g, "").trim();
  }

  function graduacionTieneFormatoValido(valor) {
    return /^\d+[.,]\d{2}$/.test(normalizarTextoGraduacion(valor));
  }

  function graduacionEsCero(valor) {
    const limpio = normalizarTextoGraduacion(valor);
    if (!graduacionTieneFormatoValido(limpio)) return false;
    return Number(limpio.replace(",", ".")) === 0;
  }

  function crearInputGraduacion(valorInicial) {
    const slot = document.createElement("div");
    slot.className = "graduacion-slot";

    const abre = document.createElement("span");
    abre.className = "graduacion-paren";
    abre.textContent = "(";

    const input = document.createElement("input");
    input.type = "text";
    input.inputMode = "decimal";
    input.autocomplete = "off";
    input.maxLength = 4;
    input.placeholder = "0,86";
    input.value = valorInicial || "";

    input.addEventListener("input", () => limpiarErrorCampo(input));

    const cierra = document.createElement("span");
    cierra.className = "graduacion-paren";
    cierra.textContent = ")";

    slot.appendChild(abre);
    slot.appendChild(input);
    slot.appendChild(cierra);

    return slot;
  }

  function obtenerValoresGraduaciones(contenedor) {
    return Array.from(contenedor?.querySelectorAll('input[type="text"]') || []).map((inp) => inp.value || "");
  }

  function renderGraduaciones(contenedor, cantidad) {
    if (!contenedor) return;

    const cant = Math.max(0, parseInt(cantidad, 10) || 0);
    const actuales = obtenerValoresGraduaciones(contenedor);
    contenedor.innerHTML = "";

    for (let i = 0; i < cant; i += 1) {
      contenedor.appendChild(crearInputGraduacion(actuales[i] || ""));
    }
  }

  function limpiarGraduaciones(contenedor) {
    if (!contenedor) return;
    contenedor.innerHTML = "";
  }

  function sanitizarValorQrz(valor) {
    return String(valor || "").replace(/\D+/g, "").slice(0, 9);
  }

  function sanitizarValorDominio(valor) {
    return String(valor || "")
      .toUpperCase()
      .replace(/[^A-Z0-9 ]+/g, "")
      .slice(0, 16);
  }

  function crearInputDinamicoLista(tipo, valorInicial) {
    const wrap = document.createElement("div");
    wrap.className = "casillero-dinamico";

    const input = document.createElement("input");
    input.type = "text";
    input.autocomplete = "off";
    input.spellcheck = false;
    input.className = `casillero-${tipo}`;

    if (tipo === "qrz") {
      input.inputMode = "numeric";
      input.maxLength = 9;
      input.placeholder = "36459780";
      input.value = sanitizarValorQrz(valorInicial);
      input.addEventListener("input", () => {
        input.value = sanitizarValorQrz(input.value);
      });
    } else {
      input.inputMode = "text";
      input.maxLength = 16;
      input.placeholder = "AA123QK Sedan";
      input.value = sanitizarValorDominio(valorInicial);
      input.addEventListener("input", () => {
        input.value = sanitizarValorDominio(input.value);
      });
    }

    wrap.appendChild(input);
    return wrap;
  }

  function obtenerValoresListaDinamica(contenedor, tipo) {
    const inputs = Array.from(contenedor?.querySelectorAll('input[type="text"]') || []);
    return inputs.map((input) => {
      const valor = tipo === "qrz" ? sanitizarValorQrz(input.value) : sanitizarValorDominio(input.value);
      input.value = valor;
      return valor;
    });
  }

  function renderListaDinamica(contenedor, cantidad, tipo) {
    if (!contenedor) return;

    const cant = Math.max(0, parseInt(cantidad, 10) || 0);
    const actuales = obtenerValoresListaDinamica(contenedor, tipo);
    contenedor.innerHTML = "";

    for (let i = 0; i < cant; i += 1) {
      contenedor.appendChild(crearInputDinamicoLista(tipo, actuales[i] || ""));
    }
  }

  function limpiarListaDinamica(contenedor) {
    if (!contenedor) return;
    contenedor.innerHTML = "";
  }

  function sincronizarUIQrzDominio() {
    const cantidadQrz = leerEnteroInput(inputQrz);
    wrapQrzCasilleros?.classList.toggle("hidden", cantidadQrz <= 0);
    if (cantidadQrz > 0) renderListaDinamica(qrzCasilleros, cantidadQrz, "qrz");
    else limpiarListaDinamica(qrzCasilleros);

    const cantidadDominio = leerEnteroInput(inputDominio);
    wrapDominioCasilleros?.classList.toggle("hidden", cantidadDominio <= 0);
    if (cantidadDominio > 0) renderListaDinamica(dominioCasilleros, cantidadDominio, "dominio");
    else limpiarListaDinamica(dominioCasilleros);
  }

  function construirBloqueListaVertical(titulo, cantidad, valores) {
    const lineas = [`${titulo}: (${formatearCantidad(cantidad)})`];
    const completos = (Array.isArray(valores) ? valores : []).filter(Boolean);
    if (completos.length) lineas.push(...completos);
    return lineas;
  }

  function sincronizarUIAlcoholimetro() {
    const alcotest = leerEnteroInput(inputAlcotest);
    const posSan = leerEnteroInput(inputPositivaSancionable);
    const posNo = leerEnteroInput(inputPositivaNoSancionable);

    limpiarErrorCampo(inputAlcotest);

    const mostrarPositivos = alcotest > 0;
    bloquePositivosAlcoholimetro?.classList.toggle("hidden", !mostrarPositivos);

    if (!mostrarPositivos) {
      if (inputPositivaSancionable) inputPositivaSancionable.value = "";
      if (inputPositivaNoSancionable) inputPositivaNoSancionable.value = "";
      wrapGraduacionesSancionable?.classList.add("hidden");
      wrapGraduacionesNoSancionable?.classList.add("hidden");
      unitGraduacionesSancionable?.classList.add("hidden");
      unitGraduacionesNoSancionable?.classList.add("hidden");
      limpiarGraduaciones(graduacionesSancionable);
      limpiarGraduaciones(graduacionesNoSancionable);
      return;
    }

    const mostrarGradSan = posSan > 0;
    wrapGraduacionesSancionable?.classList.toggle("hidden", !mostrarGradSan);
    unitGraduacionesSancionable?.classList.toggle("hidden", !mostrarGradSan);
    if (mostrarGradSan) renderGraduaciones(graduacionesSancionable, posSan);
    else limpiarGraduaciones(graduacionesSancionable);

    const mostrarGradNo = posNo > 0;
    wrapGraduacionesNoSancionable?.classList.toggle("hidden", !mostrarGradNo);
    unitGraduacionesNoSancionable?.classList.toggle("hidden", !mostrarGradNo);
    if (mostrarGradNo) renderGraduaciones(graduacionesNoSancionable, posNo);
    else limpiarGraduaciones(graduacionesNoSancionable);
  }

  function serializarGraduaciones(contenedor, etiqueta, { permiteCero = false } = {}) {
    const inputs = Array.from(contenedor?.querySelectorAll('input[type="text"]') || []);
    const valores = [];

    for (const input of inputs) {
      const valor = normalizarTextoGraduacion(input.value);

      if (!valor) {
        return {
          ok: false,
          mensaje: `Complete todas las graduaciones de ${etiqueta}.`,
          input,
        };
      }

      if (!graduacionTieneFormatoValido(valor)) {
        return {
          ok: false,
          mensaje: `Cada graduación de ${etiqueta} debe tener formato 0.00 o 0,00.`,
          input,
        };
      }

      if (!permiteCero && graduacionEsCero(valor)) {
        return {
          ok: false,
          mensaje: `En Positiva Sancionable no se permite 0.00 ni 0,00.`,
          input,
        };
      }

      valores.push(valor);
    }

    return { ok: true, valores };
  }

  function construirLineaGraduaciones(valores) {
    return `Graduaciones: ${valores.map((v) => `(${v})`).join(" ")} g/l`;
  }

  function construirBloqueAlcoholimetro() {
    const alcotest = leerEnteroInput(inputAlcotest);

    if (alcotest <= 0) {
      return {
        ok: true,
        lineas: [`Test de Alcoholímetro: (${formatearCantidad(0)})`],
        cantidadSancionables: 0,
        cantidadNoSancionables: 0,
        totalValidos: 0,
      };
    }

    const posSan = leerEnteroInput(inputPositivaSancionable);
    const posNo = leerEnteroInput(inputPositivaNoSancionable);
    const sumaIngresada = posSan + posNo;

    if (posSan <= 0 && posNo <= 0) {
      const el = inputPositivaSancionable || inputPositivaNoSancionable || inputAlcotest;
      return {
        ok: false,
        mensaje: 'Si "Test de Alcoholímetro" es mayor a 0, debe completar Positiva Sancionable o Positiva no Sancionable con un numeral mayor a cero.',
        input: el,
      };
    }

    if (alcotest !== sumaIngresada) {
      return {
        ok: false,
        mensaje: 'Revisar Numerales: Test de Alcoholímetro debe ser igual a Positiva Sancionable + Positiva no Sancionable.',
        input: inputAlcotest,
      };
    }

    let valoresSan = [];
    let valoresNo = [];

    if (posSan > 0) {
      const validacionSan = serializarGraduaciones(graduacionesSancionable, "Positiva Sancionable");
      if (!validacionSan.ok) return validacionSan;
      valoresSan = validacionSan.valores;
    }

    if (posNo > 0) {
      const validacionNo = serializarGraduaciones(graduacionesNoSancionable, "Positiva no Sancionable", { permiteCero: true });
      if (!validacionNo.ok) return validacionNo;
      valoresNo = validacionNo.valores.filter((v) => !graduacionEsCero(v));
    }

    const totalValidos = valoresSan.length + valoresNo.length;
    if (totalValidos === 0) {
      return {
        ok: true,
        lineas: [`Test de Alcoholímetro: (${formatearCantidad(0)})`],
        cantidadSancionables: 0,
        cantidadNoSancionables: 0,
        totalValidos: 0,
      };
    }

    const lineas = [
      `Test de Alcoholímetro: (${formatearCantidad(totalValidos)})`,
      `Positiva Sancionable: (${formatearCantidad(valoresSan.length)})`,
    ];

    if (valoresSan.length > 0) {
      lineas.push(construirLineaGraduaciones(valoresSan));
    }

    lineas.push(`Positiva no Sancionable: (${formatearCantidad(valoresNo.length)})`);

    if (valoresNo.length > 0) {
      lineas.push(construirLineaGraduaciones(valoresNo));
    }

    return {
      ok: true,
      lineas,
      cantidadSancionables: valoresSan.length,
      cantidadNoSancionables: valoresNo.length,
      totalValidos,
    };
  }

  function normalizarInputNoNegativo(el) {
    if (!el) return;
    const crudo = String(el.value || "").trim();
    if (!crudo) {
      limpiarErrorCampo(el);
      return;
    }

    const n = parseInt(crudo, 10);
    el.value = Number.isFinite(n) && n > 0 ? String(n) : "0";
    limpiarErrorCampo(el);
  }

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

    const seleccionActual = selHorario?.value || "";
    const ok = await syncOrdenesDesdeServidor();
    if (ok) {
      cargarOperativosDisponibles(seleccionActual);
      actualizarDatosFranja();
    }

    syncingOrdenes = false;
  }

  // ===== UI =====
  function limpiarSeleccionOperativo() {
    ordenSeleccionada = null;
    franjaSeleccionada = null;
    if (selHorario) {
      selHorario.value = "";
      selHorario.innerHTML = '<option value="">Seleccionar Operativo</option>';
    }
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

  function pad2(n) {
    return String(n).padStart(2, "0");
  }

  function toFechaISO(d) {
    return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
  }

  function getGuardiaFechaISO() {
    return toFechaISO(getGuardiaInicio());
  }

  function getFechasBusquedaInicio() {
    const base = getGuardiaInicio();
    const anterior = new Date(base);
    anterior.setDate(anterior.getDate() - 1);
    return [toFechaISO(base), toFechaISO(anterior)];
  }

  function getDiaGuardiaTexto() {
    const nombres = ["domingo", "lunes", "martes", "miercoles", "jueves", "viernes", "sabado"];
    return nombres[getGuardiaInicio().getDay()] || "";
  }

  function normalizarParteClave(txt) {
    return normalizarBasicoSinAcentos(String(txt || ""))
      .replace(/[^a-z0-9/ -]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function construirOperativoKeyEstable(franja) {
    if (!franja) return "";

    const ordenNum = normalizarParteClave(obtenerNumeroOrdenDeFranja(franja) || "sin-orden");
    const textoRef = normalizarParteClave(obtenerTextoRefOrdenDeFranja(franja) || "sin-texto");
    const horario = normalizarParteClave(franja?.horario || "sin-horario");
    const lugar = normalizarParteClave(franja?.lugar || "sin-lugar");
    const tipo = normalizarParteClave(obtenerTipoCortoFranja(franja) || "sin-tipo");

    return [ordenNum, textoRef, horario, lugar, tipo].join("|");
  }

  function construirOperativoKeysPosibles(franja) {
    if (!franja) return [];

    const orden = normalizarParteClave(obtenerNumeroOrdenDeFranja(franja) || "-") || "-";
    const textoRef = normalizarParteClave(obtenerTextoRefOrdenDeFranja(franja) || "-") || "-";
    const horario = normalizarParteClave(String(franja?.horario || "-").replace(/:/g, " ")) || "-";
    const lugar = normalizarParteClave(franja?.lugar || "-") || "-";
    const tipo = normalizarParteClave(obtenerTipoCortoFranja(franja) || "-") || "-";
    const dia = normalizarParteClave(getDiaGuardiaTexto() || "-") || "-";

    const keys = new Set();
    keys.add(construirOperativoKeyEstable(franja));
    keys.add([orden, dia, horario, lugar, tipo].join("|"));
    keys.add([orden, dia, horario, lugar, `${tipo} - ${textoRef}`].join("|"));
    keys.add([orden, dia, horario, lugar, `${tipo} - -`].join("|"));
    keys.add([orden, horario, lugar].join("|"));

    return Array.from(keys).map((v) => limpiarTextoSimple(v)).filter(Boolean);
  }

  function normalizarArrayTexto(arr) {
    return (Array.isArray(arr) ? arr : []).map((v) => limpiarTextoSimple(v)).filter(Boolean);
  }

  function construirPayloadElementosActual() {
    return {
      ESCOPETA: leerSeleccionPorClase("ESCOPETA"),
      HT: leerSeleccionPorClase("HT"),
      PDA: leerSeleccionPorClase("PDA"),
      IMPRESORA: leerSeleccionPorClase("IMPRESORA"),
      Alometro: leerSeleccionPorClase("Alometro"),
      Alcoholimetro: leerSeleccionPorClase("Alcoholimetro"),
    };
  }

  function normalizarPayloadElementos(payload) {
    const fuente = payload?.elementos && typeof payload.elementos === "object" ? payload.elementos : payload || {};

    return {
      ESCOPETA: normalizarArrayTexto(fuente.ESCOPETA),
      HT: normalizarArrayTexto(fuente.HT),
      PDA: normalizarArrayTexto(fuente.PDA),
      IMPRESORA: normalizarArrayTexto(fuente.IMPRESORA),
      Alometro: normalizarArrayTexto(fuente.Alometro),
      Alcoholimetro: normalizarArrayTexto(fuente.Alcoholimetro),
    };
  }

  function pareceHorario(txt) {
    return /(\d{1,2})[ :](\d{2})\s*a\s*(\d{1,2})[ :](\d{2})/i.test(String(txt || ""));
  }

  function pareceDiaSemana(txt) {
    return /^(lunes|martes|miercoles|miércoles|jueves|viernes|sabado|sábado|domingo)$/i.test(limpiarTextoSimple(txt));
  }

  function extraerPartesDeOperativoKey(operativoKey) {
    const partes = String(operativoKey || "").split("|").map((v) => limpiarTextoSimple(v));

    if (partes.length >= 5 && pareceDiaSemana(partes[1])) {
      return {
        orden_num: limpiarTextoSimple(partes[0] || ""),
        texto_ref: limpiarTextoSimple(partes[4] || ""),
        horario: limpiarTextoSimple(partes[2] || ""),
        lugar: limpiarTextoSimple(partes[3] || ""),
        tipo_corto: limpiarTextoSimple(partes[4] || ""),
      };
    }

    if (partes.length >= 5 && pareceHorario(partes[2])) {
      return {
        orden_num: limpiarTextoSimple(partes[0] || ""),
        texto_ref: limpiarTextoSimple(partes[1] || ""),
        horario: limpiarTextoSimple(partes[2] || ""),
        lugar: limpiarTextoSimple(partes[3] || ""),
        tipo_corto: limpiarTextoSimple(partes[4] || ""),
      };
    }

    if (partes.length >= 3 && pareceHorario(partes[1])) {
      return {
        orden_num: limpiarTextoSimple(partes[0] || ""),
        texto_ref: limpiarTextoSimple(partes[3] || partes[2] || ""),
        horario: limpiarTextoSimple(partes[1] || ""),
        lugar: limpiarTextoSimple(partes[2] || ""),
        tipo_corto: limpiarTextoSimple(partes[3] || ""),
      };
    }

    return {
      orden_num: limpiarTextoSimple(partes[0] || ""),
      texto_ref: limpiarTextoSimple(partes[1] || ""),
      horario: limpiarTextoSimple(partes[2] || ""),
      lugar: limpiarTextoSimple(partes[3] || ""),
      tipo_corto: limpiarTextoSimple(partes[4] || ""),
    };
  }

  function normalizarValorComparacion(txt) {
    return normalizarBasicoSinAcentos(String(txt || "")).replace(/[^a-z0-9]+/g, "");
  }

  function valoresComparablesCoinciden(a, b) {
    const aa = normalizarValorComparacion(a);
    const bb = normalizarValorComparacion(b);
    if (!aa || !bb) return false;
    return aa === bb || aa.includes(bb) || bb.includes(aa);
  }

  function puntuarCoincidenciaInicio(payload, franja = franjaSeleccionada) {
    if (!payload || !franja) return -1;

    const fechasBusqueda = getFechasBusquedaInicio();
    if (payload.guardia_fecha && !fechasBusqueda.includes(payload.guardia_fecha)) {
      return -1;
    }

    const keysEsperadas = construirOperativoKeysPosibles(franja);
    if (payload.operativo_key && keysEsperadas.includes(limpiarTextoSimple(payload.operativo_key))) {
      return 1000;
    }

    let puntos = 0;

    if (valoresComparablesCoinciden(payload.horario, franja?.horario || "")) puntos += 60;
    if (valoresComparablesCoinciden(payload.lugar, franja?.lugar || "")) puntos += 30;
    if (valoresComparablesCoinciden(payload.tipo_corto, obtenerTipoCortoFranja(franja) || "")) puntos += 10;
    if (valoresComparablesCoinciden(payload.orden_num, obtenerNumeroOrdenDeFranja(franja) || "")) puntos += 8;
    if (valoresComparablesCoinciden(payload.texto_ref, obtenerTextoRefOrdenDeFranja(franja) || "")) puntos += 5;

    return puntos;
  }

  function normalizarInicioGuardado(payload) {
    if (!payload) return null;

    const derivado = extraerPartesDeOperativoKey(payload.operativo_key || "");

    return {
      guardia_fecha: String(payload.guardia_fecha || ""),
      operativo_key: String(payload.operativo_key || ""),
      orden_num: limpiarTextoSimple(payload.orden_num || derivado.orden_num || ""),
      texto_ref: limpiarTextoSimple(payload.texto_ref || derivado.texto_ref || ""),
      horario: limpiarTextoSimple(payload.horario || derivado.horario || ""),
      lugar: limpiarTextoSimple(payload.lugar || derivado.lugar || ""),
      tipo_corto: limpiarTextoSimple(payload.tipo_corto || derivado.tipo_corto || ""),
      personal: normalizarArrayTexto(payload.personal),
      moviles: normalizarArrayTexto(payload.moviles),
      motos: normalizarArrayTexto(payload.motos),
      elementos: normalizarPayloadElementos(payload),
      ts: payload?.ts || Date.now(),
    };
  }

  function construirInicioGuardadoActual() {
    if (!franjaSeleccionada) return null;

    return normalizarInicioGuardado({
      guardia_fecha: getGuardiaFechaISO(),
      operativo_key: construirOperativoKeyEstable(franjaSeleccionada),
      orden_num: obtenerNumeroOrdenDeFranja(franjaSeleccionada),
      texto_ref: obtenerTextoRefOrdenDeFranja(franjaSeleccionada),
      horario: limpiarTextoSimple(franjaSeleccionada?.horario || ""),
      lugar: limpiarTextoSimple(franjaSeleccionada?.lugar || ""),
      tipo_corto: obtenerTipoCortoFranja(franjaSeleccionada),
      personal: leerSeleccionPorClase("personal"),
      moviles: leerSeleccionPorClase("movil"),
      motos: leerSeleccionPorClase("moto"),
      elementos: construirPayloadElementosActual(),
      ts: Date.now(),
    });
  }

  function headersSupabase(extra = {}) {
    return {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      ...extra,
    };
  }

  function guardarInicioLocal(payload) {
    const data = normalizarInicioGuardado(payload);
    if (!data) return;

    try {
      if (typeof StorageApp !== "undefined" && typeof StorageApp.guardarElementosInicio === "function") {
        StorageApp.guardarElementosInicio(data.elementos);
      }
    } catch (e) {
      console.warn("[WSP] Error guardando elementos en StorageApp.", e);
    }

    try {
      localStorage.setItem("elementos_inicio", JSON.stringify(data.elementos));
      localStorage.setItem("wsp_inicio_actual", JSON.stringify(data));
    } catch (e) {
      console.warn("[WSP] No se pudo guardar inicio en localStorage.", e);
    }
  }

  function cargarInicioLocal() {
    try {
      const raw = localStorage.getItem("wsp_inicio_actual");
      if (raw) {
        const parsed = normalizarInicioGuardado(JSON.parse(raw));
        if (parsed) return parsed;
      }
    } catch (e) {
      console.warn("[WSP] No se pudo leer wsp_inicio_actual de localStorage.", e);
    }

    try {
      const storageAppPayload = StorageApp?.cargarElementosInicio?.();
      if (storageAppPayload) return normalizarInicioGuardado({ elementos: storageAppPayload });
    } catch {}

    try {
      const legacy = JSON.parse(localStorage.getItem("elementos_inicio") || "null");
      if (legacy) return normalizarInicioGuardado({ elementos: legacy });
    } catch {}

    return null;
  }

  function coincideInicioConFranja(payload, franja = franjaSeleccionada) {
    if (!payload || !franja) return false;
    return puntuarCoincidenciaInicio(normalizarInicioGuardado(payload), franja) >= 90;
  }

  function cargarInicioGuardadoCoincidente() {
    const candidatos = [
      normalizarInicioGuardado(inicioGuardadoActual),
      cargarInicioLocal(),
    ].filter(Boolean);

    let mejor = null;
    let mejorPuntaje = -1;

    candidatos.forEach((item) => {
      const puntaje = puntuarCoincidenciaInicio(item);
      if (puntaje > mejorPuntaje) {
        mejor = item;
        mejorPuntaje = puntaje;
      }
    });

    return mejorPuntaje >= 90 ? mejor : null;
  }

  async function guardarInicioEnSupabase(payload) {
    const data = normalizarInicioGuardado(payload);
    if (!data) return false;
    const { ts, ...dataParaSupabase } = data;

    try {
      const url = `${SUPABASE_URL}/rest/v1/wsp_inicios?on_conflict=guardia_fecha,operativo_key`;
      const r = await fetch(url, {
        method: "POST",
        headers: headersSupabase({
          "Content-Type": "application/json",
          Prefer: "resolution=merge-duplicates,return=minimal",
        }),
        body: JSON.stringify(dataParaSupabase),
      });

      if (!r.ok) {
        console.warn("[WSP] No se pudo guardar inicio en Supabase:", r.status, await r.text());
        return false;
      }

      return true;
    } catch (e) {
      console.warn("[WSP] Error guardando inicio en Supabase.", e);
      return false;
    }
  }

  async function leerInicioDesdeSupabase(franja) {
    if (!franja) return null;

    const selectCols = "guardia_fecha,operativo_key,orden_num,texto_ref,horario,lugar,tipo_corto,personal,moviles,motos,elementos,updated_at";
    const fechasBusqueda = getFechasBusquedaInicio();
    const keysPosibles = construirOperativoKeysPosibles(franja);

    try {
      for (const fechaBusqueda of fechasBusqueda) {
        for (const keyPosible of keysPosibles) {
          const paramsExactos = new URLSearchParams({
            select: selectCols,
            guardia_fecha: `eq.${fechaBusqueda}`,
            operativo_key: `eq.${keyPosible}`,
            order: "updated_at.desc",
            limit: "1",
          });

          const rExacto = await fetch(`${SUPABASE_URL}/rest/v1/wsp_inicios?${paramsExactos.toString()}`, {
            headers: headersSupabase({ Accept: "application/json" }),
          });

          if (!rExacto.ok) {
            console.warn("[WSP] No se pudo leer inicio exacto desde Supabase:", rExacto.status, await rExacto.text());
          } else {
            const dataExacta = await rExacto.json();
            const rowExacta = Array.isArray(dataExacta) ? dataExacta[0] : null;
            if (rowExacta) return normalizarInicioGuardado(rowExacta);
          }
        }
      }

      let filas = [];
      for (const fechaBusqueda of fechasBusqueda) {
        const paramsFallback = new URLSearchParams({
          select: selectCols,
          guardia_fecha: `eq.${fechaBusqueda}`,
          order: "updated_at.desc",
          limit: "100",
        });

        const rFallback = await fetch(`${SUPABASE_URL}/rest/v1/wsp_inicios?${paramsFallback.toString()}`, {
          headers: headersSupabase({ Accept: "application/json" }),
        });

        if (!rFallback.ok) {
          console.warn("[WSP] No se pudo leer inicio fallback desde Supabase:", rFallback.status, await rFallback.text());
          continue;
        }

        const dataFallback = await rFallback.json();
        if (Array.isArray(dataFallback)) {
          filas = filas.concat(dataFallback.map(normalizarInicioGuardado).filter(Boolean));
        }
      }

      let mejor = null;
      let mejorPuntaje = -1;
      filas.forEach((fila) => {
        const puntaje = puntuarCoincidenciaInicio(fila, franja);
        if (puntaje > mejorPuntaje) {
          mejor = fila;
          mejorPuntaje = puntaje;
        }
      });

      return mejorPuntaje >= 90 ? mejor : null;
    } catch (e) {
      console.warn("[WSP] Error leyendo inicio desde Supabase.", e);
      return null;
    }
  }

  function construirOperativoPlano(franja, orden, idxOrden, idxFranja) {
    return {
      ...franja,
      __key: `${idxOrden}-${idxFranja}`,
      __ordenNum: limpiarTextoSimple(orden?.num || ""),
      __ordenTextoRef: limpiarTextoSimple(orden?.textoRef || ""),
    };
  }

  function cargarOperativosDisponibles(valorSeleccionado = "") {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    let ordenes = OrdersSync.filtrarCaducadas(cargarOrdenesSeguro());
    guardarOrdenesSeguro(ordenes);

    operativosCache = [];
    if (selHorario) {
      selHorario.innerHTML = '<option value="">Seleccionar Operativo</option>';
    }

    ordenes.forEach((orden, idxOrden) => {
      const vigencia = parseVigenciaFlexible(orden.vigencia);
      if (!vigencia || vigencia > hoy) return;

      (orden.franjas || []).forEach((franja, idxFranja) => {
        if (!franjaEnGuardia(franja.horario)) return;

        const operativo = construirOperativoPlano(franja, orden, idxOrden, idxFranja);
        operativosCache.push(operativo);

        if (!selHorario) return;
        const option = document.createElement("option");
        option.value = operativo.__key;
        option.text = construirTextoOpcionHorario(operativo);
        option.title = construirTextoOpcionHorario(operativo);
        selHorario.appendChild(option);
      });
    });

    if (selHorario && valorSeleccionado && operativosCache.some((item) => item.__key === valorSeleccionado)) {
      selHorario.value = valorSeleccionado;
    }
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

  function obtenerTextoRefOrdenDeFranja(franja) {
    return limpiarTextoSimple(franja?.__ordenTextoRef || "");
  }

  function obtenerNumeroOrdenDeFranja(franja) {
    return limpiarTextoSimple(franja?.__ordenNum || "");
  }

  function obtenerTipoCortoFranja(franja) {
    const fuente = normalizarBasicoSinAcentos(
      [franja?.titulo || "", obtenerTextoRefOrdenDeFranja(franja)].join(" ")
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
    const numeroOrden = obtenerNumeroOrdenDeFranja(franja);

    return numeroOrden
      ? `${horario} - ${tipo} - ${lugar} - ${numeroOrden}`
      : `${horario} - ${tipo} - ${lugar}`;
  }

  function actualizarDatosFranja() {
    const key = selHorario?.value || "";
    franjaSeleccionada = operativosCache.find((item) => item.__key === key) || null;
    ordenSeleccionada = null;

    if (chkMostrarResultadosFinaliza) {
      chkMostrarResultadosFinaliza.checked = false;
    }
    if (chkPresenciaActiva) {
      chkPresenciaActiva.checked = false;
    }

    actualizarVisibilidadBloquePresenciaActiva();
    actualizarVisibilidadResultadosFinaliza();

    if (selTipo.value === "FINALIZA") {
      sincronizarInicioGuardadoSegunContexto();
    }
  }

  function actualizarTipo() {
    const controlSuperior = esControlSuperiorActivo();
    const fin = selTipo.value === "FINALIZA";

    if (chkPresenciaActiva) {
      chkPresenciaActiva.checked = false;
    }

    if (controlSuperior) {
      setUIControlSuperiorActiva(true);
      sincronizarUIAlcoholimetro();
      sincronizarUIQrzDominio();
      return;
    }

    setUIControlSuperiorActiva(false);
    divFinaliza.classList.toggle("hidden", !fin);

    if (divMismosElementos) divMismosElementos.classList.toggle("hidden", !fin);

    if (!fin) {
      if (chkMostrarResultadosFinaliza) chkMostrarResultadosFinaliza.checked = false;
      actualizarVisibilidadBloquePresenciaActiva();
      actualizarVisibilidadResultadosFinaliza();
      desactivarControlesMismos();
      sincronizarUIAlcoholimetro();
      return;
    }

    if (chkMostrarResultadosFinaliza && !esFinalizaConResultadosOpcionales()) {
      chkMostrarResultadosFinaliza.checked = false;
    }
    actualizarVisibilidadBloquePresenciaActiva();
    actualizarVisibilidadResultadosFinaliza();
    desactivarControlesMismos({ limpiar: true });
    sincronizarUIAlcoholimetro();
    sincronizarInicioGuardadoSegunContexto();
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

  function construirObservacionesFinales(observacionesExtras = []) {
    const usuario = String(document.getElementById("obs")?.value || "").trim();
    const extras = Array.isArray(observacionesExtras)
      ? observacionesExtras.map((linea) => limpiarTextoSimple(linea)).filter(Boolean)
      : [];

    if (usuario && extras.length) return `${usuario}\n${extras.join("\n")}`;
    if (usuario) return usuario;
    if (extras.length) return extras.join("\n");
    return "Sin novedad";
  }

  function compactarSaltos(texto) {
    return String(texto || "")
      .replace(/[ \t]+\n/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  }

  const ORGANISMOS_CONJUNTO = [
    { nombre: "UOR 3", patrones: [/\buor\s*3\b/, /\buor3\b/] },
    { nombre: "Municipalidad", patrones: [/\bmunicipalidad\b/, /\bmunicipio\b/, /\bmunicipal\b/] },
    { nombre: "Tránsito", patrones: [/\btransito\b/, /\binspectores?\s+de\s+transito\b/] },
    { nombre: "UFIV", patrones: [/\bufiv\b/] },
    { nombre: "APSV", patrones: [/\bapsv\b/, /\bagencia\s+provincial\s+de\s+seguridad\s+vial\b/] },
    { nombre: "DICEP", patrones: [/\bdicep\b/] },
    { nombre: "ASSAL", patrones: [/\bassal\b/] },
    { nombre: "SENASA", patrones: [/\bsenasa\b/] },
    { nombre: "Gendarmería", patrones: [/\bgendarmeria\b/, /\bgna\b/] },
    { nombre: "PDI", patrones: [/\bpdi\b/, /\bpolicia\s+de\s+investigaciones\b/] },
    { nombre: "Comuna", patrones: [/\bcomuna\b/] },
    { nombre: "ANSV", patrones: [/\bansv\b/, /\bagencia\s+nacional\s+de\s+seguridad\s+vial\b/] },
    { nombre: "Comisaría", patrones: [/\bcomisaria\b/, /\bcria\b/, /\bcomisaria\s+\d+\b/] },
    { nombre: "CRE", patrones: [/\bcre\b/] },
    { nombre: "PAT", patrones: [/\bpat\b/] },
  ];

  const FRASES_CONJUNTO = [
    /\ben\s+conjunto\s+con\b/,
    /\boperativo\s+en\s+conjunto\s+con\b/,
    /\bjunto\s+a\b/,
    /\bjunto\s+con\b/,
    /\bcon\s+apoyo\s+de\b/,
    /\bcon\s+colaboracion\s+de\b/,
    /\bcoordinado\s+con\b/,
    /\bcon\s+participacion\s+de\b/,
    /\bcon\s+personal\s+de\b/,
    /\bcon\s+intervencion\s+de\b/,
    /\bcon\s+presencia\s+de\b/,
    /\boperativo\s+con\b/,
  ];

  function obtenerFuenteConjunto() {
    return normalizarBasicoSinAcentos([
      franjaSeleccionada?.titulo || "",
      obtenerTextoRefOrdenDeFranja(franjaSeleccionada),
      franjaSeleccionada?.lugar || "",
    ].join(" "));
  }

  function detectarOrganismosConjunto() {
    const fuente = obtenerFuenteConjunto();
    const hayFraseConjunto = FRASES_CONJUNTO.some((regex) => regex.test(fuente));

    const organismos = ORGANISMOS_CONJUNTO
      .filter((organismo) => organismo.patrones.some((regex) => regex.test(fuente)))
      .map((organismo) => organismo.nombre)
      .filter((nombre, idx, arr) => arr.indexOf(nombre) === idx);

    const esConjunto = organismos.length > 0 && (hayFraseConjunto || organismos.length >= 1);

    return { esConjunto, organismos };
  }

  function esOperativoConjunto() {
    return detectarOrganismosConjunto().esConjunto;
  }

  function bloqueConjuntoExtra() {
    const deteccion = detectarOrganismosConjunto();
    if (!deteccion.esConjunto || !deteccion.organismos.length) return "";

    return deteccion.organismos
      .map((organismo) => `${bold(`Personal ${organismo}:`)}

${bold(`Moviles ${organismo}:`)}`)
      .join("\n\n");
  }

  function obtenerFuenteTipoActual() {
    return normalizarBasicoSinAcentos([
      franjaSeleccionada?.titulo || "",
      obtenerTextoRefOrdenDeFranja(franjaSeleccionada),
      obtenerTipoCortoFranja(franjaSeleccionada),
      construirTextoOpcionHorario(franjaSeleccionada),
    ].join(" "));
  }

  function esFinalizaSinResultados() {
    const fuente = obtenerFuenteTipoActual();
    return /\bcustodia\b|\btraslado\b/.test(fuente);
  }

  function esFinalizaConResultadosOpcionales() {
    const fuente = obtenerFuenteTipoActual();
    return /\bordenamiento\b|\bestablecido\b|\bmonitoreo\b|\bpresencia\s*activa\b|\blimpieza\b|\bablacion\b/.test(fuente);
  }

  function esTipoConPresenciaActivaOpcional() {
    const fuente = obtenerFuenteTipoActual();
    if (!fuente) return false;

    if (/\bordenamiento\b|\bablacion\b|\blimpieza\b|\bestablecido\b|\bmonitoreo\b|\bacompanamiento\b|\bacompanamieto\b|\bescolta\b|\bcustodia\b|\btraslado\b|\bpresencia\s*activa\b/.test(fuente)) {
      return false;
    }

    return /\bocv\b|\bcontrol\s+vehicular\b|\boperativo\s+de\s+control\s+vehicular\b|\balcoholem/i.test(fuente)
      || /\bdicep\b|\ben\s+conjunto\b|\boperativo\s+en\s+conjunto\b|\bconjunto\b|\bcoordinad\w*\b|\bcontrol\s+de\s+peso\b|\bpeso\b|\bcontrol\b/.test(fuente);
  }

  function debeOcultarTodoPorPresenciaActivaFinaliza() {
    return selTipo?.value === "FINALIZA" && !!chkPresenciaActiva?.checked;
  }

  function debeIncluirResultadosFinaliza() {
    if (selTipo?.value !== "FINALIZA") return false;
    if (debeOcultarTodoPorPresenciaActivaFinaliza()) return false;
    if (esFinalizaSinResultados()) return false;
    if (esFinalizaConResultadosOpcionales()) return !!chkMostrarResultadosFinaliza?.checked;
    return true;
  }

  function debeIncluirDetallesFinaliza() {
    if (selTipo?.value !== "FINALIZA") return false;
    if (debeOcultarTodoPorPresenciaActivaFinaliza()) return false;
    if (esFinalizaConResultadosOpcionales()) return !!chkMostrarResultadosFinaliza?.checked;
    if (esFinalizaSinResultados()) return true;
    return true;
  }

  function actualizarVisibilidadBloquePresenciaActiva() {
    const mostrar = !!franjaSeleccionada && esTipoConPresenciaActivaOpcional();

    if (bloquePresenciaActiva) {
      bloquePresenciaActiva.classList.toggle("hidden", !mostrar);
    }

    if (!mostrar && chkPresenciaActiva) {
      chkPresenciaActiva.checked = false;
    }
  }

  function actualizarVisibilidadResultadosFinaliza() {
    const fin = selTipo?.value === "FINALIZA";
    const resultadosOpcionales = fin && esFinalizaConResultadosOpcionales();
    const mostrarResultados = fin && debeIncluirResultadosFinaliza();
    const mostrarDetalles = fin && debeIncluirDetallesFinaliza();

    if (bloqueMostrarResultadosFinaliza) {
      bloqueMostrarResultadosFinaliza.classList.toggle("hidden", !resultadosOpcionales);
    }

    if (tituloResultadosFinaliza) {
      tituloResultadosFinaliza.classList.toggle("hidden", !mostrarResultados);
    }

    if (contenidoResultadosFinaliza) {
      contenidoResultadosFinaliza.classList.toggle("hidden", !mostrarResultados);
    }

    if (divDetalles) {
      divDetalles.classList.toggle("hidden", !mostrarDetalles);
    }

    if (!mostrarResultados) {
      if (bloquePositivosAlcoholimetro) bloquePositivosAlcoholimetro.classList.add("hidden");
      if (wrapGraduacionesSancionable) wrapGraduacionesSancionable.classList.add("hidden");
      if (wrapGraduacionesNoSancionable) wrapGraduacionesNoSancionable.classList.add("hidden");
      if (unitGraduacionesSancionable) unitGraduacionesSancionable.classList.add("hidden");
      if (unitGraduacionesNoSancionable) unitGraduacionesNoSancionable.classList.add("hidden");
      if (wrapQrzCasilleros) wrapQrzCasilleros.classList.add("hidden");
      if (wrapDominioCasilleros) wrapDominioCasilleros.classList.add("hidden");
      if (!mostrarDetalles) {
        return;
      }
    }

    if (mostrarResultados) {
      sincronizarUIAlcoholimetro();
      sincronizarUIQrzDominio();
    }
  }

  // ======================================================
  // ===== DETALLES ========================================
  // ======================================================
  function limpiarDescripcionDetalle(txt) {
    return String(txt || "")
      .replace(/^[\s:;,.–—-]+/, "")
      .replace(/\s*[:;,.–—-]\s*/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function obtenerReferenciaNomenclador(codigo, fallback = "") {
    const codigoLimpio = String(codigo || "").replace(/\D+/g, "");
    if (!codigoLimpio || codigoLimpio === "17117") return fallback;

    try {
      if (typeof window !== "undefined" && typeof window.getReferenciaFalta === "function") {
        return limpiarDescripcionDetalle(window.getReferenciaFalta(codigoLimpio, fallback || ""));
      }
    } catch {}

    return fallback;
  }

  function reconstruirLineaDetalle(cantidad, codigo, descripcion) {
    const descripcionFinal = limpiarDescripcionDetalle(descripcion);
    if (!descripcionFinal) return null;

    const codigoLimpio = String(codigo || "").replace(/\D+/g, "");
    const cantidadLimpia = cantidad == null ? null : formatearCantidad(cantidad);

    if (cantidadLimpia) return `(${cantidadLimpia}) ${codigoLimpio} ${descripcionFinal}`;
    return `${codigoLimpio} ${descripcionFinal}`;
  }

  function autocompletarLineaDetalleConNomenclador(linea) {
    const original = String(linea || "").replace(/\r/g, "");
    const s = original.trim();
    if (!s) return original;

    const patrones = [
      { regex: /^\(\s*(\d{1,2})\s*\)\s*(\d{4,5})(?:\s*[-:;,.–—]\s*|\s+)?(.*)$/i, conCantidad: true },
      { regex: /^(\d{1,2})\s*[-–—]\s*(\d{4,5})(?:\s*[-:;,.–—]\s*|\s+)?(.*)$/i, conCantidad: true },
      { regex: /^(\d{1,2})\s+(\d{4,5})(?:\s*[-:;,.–—]\s*|\s+)?(.*)$/i, conCantidad: true },
      { regex: /^(\d{4,5})(?:\s*[-:;,.–—]\s*|\s+)?(.*)$/i, conCantidad: false },
    ];

    for (const patron of patrones) {
      const m = s.match(patron.regex);
      if (!m) continue;

      const cantidad = patron.conCantidad ? m[1] : null;
      const codigo = patron.conCantidad ? m[2] : m[1];
      if (String(codigo || "").replace(/\D+/g, "") === "17117") return original;

      const referencia = obtenerReferenciaNomenclador(codigo, "");
      if (!referencia) return original;

      const reconstruida = reconstruirLineaDetalle(cantidad, codigo, referencia);
      return reconstruida || original;
    }

    return original;
  }

  function autocompletarDetallesDesdeNomenclador(texto) {
    const original = String(texto || "").replace(/\r/g, "");
    if (!original) return original;
    return original.split("\n").map(autocompletarLineaDetalleConNomenclador).join("\n");
  }

  function aplicarAutocompletadoDetalles(textarea) {
    if (!textarea) return;

    const valorOriginal = String(textarea.value || "");
    const valorNuevo = autocompletarDetallesDesdeNomenclador(valorOriginal);
    if (valorNuevo === valorOriginal) return;

    const inicio = typeof textarea.selectionStart === "number" ? textarea.selectionStart : valorOriginal.length;
    const fin = typeof textarea.selectionEnd === "number" ? textarea.selectionEnd : valorOriginal.length;
    const nuevoInicio = autocompletarDetallesDesdeNomenclador(valorOriginal.slice(0, inicio)).length;
    const nuevoFin = autocompletarDetallesDesdeNomenclador(valorOriginal.slice(0, fin)).length;

    textarea.value = valorNuevo;

    try {
      textarea.setSelectionRange(nuevoInicio, nuevoFin);
    } catch {}
  }

  function normalizarLineaDetalle(linea) {
    let s = String(linea || "").replace(/\r/g, "").trim();
    if (!s) return null;

    s = s.replace(/\s+/g, " ").trim();

    const patrones = [
      { regex: /^\(\s*(\d{1,2})\s*\)\s*(\d{4,5})(?:\s*[-:;,.–—]\s*|\s+)?(.*)$/i, conCantidad: true },
      { regex: /^(\d{1,2})\s*[-–—]\s*(\d{4,5})(?:\s*[-:;,.–—]\s*|\s+)?(.*)$/i, conCantidad: true },
      { regex: /^(\d{1,2})\s+(\d{4,5})(?:\s*[-:;,.–—]\s*|\s+)?(.*)$/i, conCantidad: true },
      { regex: /^(\d{4,5})(?:\s*[-:;,.–—]\s*|\s+)?(.*)$/i, conCantidad: false },
    ];

    for (const patron of patrones) {
      const m = s.match(patron.regex);
      if (!m) continue;

      const cantidad = patron.conCantidad ? formatearCantidad(m[1]) : formatearCantidad(1);
      const codigo = patron.conCantidad ? m[2] : m[1];
      const descripcionIngresada = patron.conCantidad ? m[3] : m[2];
      const descripcion = obtenerReferenciaNomenclador(codigo, limpiarDescripcionDetalle(descripcionIngresada));

      if (!descripcion) continue;

      return {
        tipo: "detalle",
        texto: `(${cantidad}) ${codigo} ${descripcion}`,
      };
    }

    return {
      tipo: "observacion",
      texto: s,
    };
  }

  function normalizarDetallesTexto(texto) {
    const limpio = String(texto || "").replace(/\r/g, "").trim();
    if (!limpio) {
      return {
        detalles: "",
        observaciones: [],
        cantidadValidos: 0,
        detalleItems: [],
        tieneTexto: false,
      };
    }

    const detalles = [];
    const observaciones = [];

    limpio.split("\n").forEach((linea) => {
      const item = normalizarLineaDetalle(linea);
      if (!item || !item.texto) return;
      if (item.tipo === "detalle") detalles.push(item.texto);
      else observaciones.push(item.texto);
    });

    return {
      detalles: detalles.join("\n"),
      observaciones,
      cantidadValidos: detalles.length,
      detalleItems: detalles,
      tieneTexto: true,
    };
  }

  function validarDetallesRequeridosPorActas(detallesProcesados) {
    const detallesEl = document.getElementById("detalles");
    const actasCargadas = leerEnteroNoNegativo(document.getElementById("actas")?.value);

    if (actasCargadas <= 0) return true;

    const cantidadDetallesValidos = Array.isArray(detallesProcesados?.detalleItems)
      ? detallesProcesados.detalleItems.length
      : leerEnteroNoNegativo(detallesProcesados?.cantidadValidos);

    const tieneTexto = !!String(detallesEl?.value || "").trim();

    if (!tieneTexto) {
      marcarErrorCampo(
        detallesEl,
        'Si "Actas Labradas" es mayor a cero, el cuadro Detalles no puede estar vacío. Debe cargar al menos un detalle válido. Ej: (03) 13018 Rto.'
      );
      return false;
    }

    if (cantidadDetallesValidos <= 0) {
      marcarErrorCampo(
        detallesEl,
        'Si "Actas Labradas" es mayor a cero, Detalles debe contener al menos un detalle válido con formato como: (03) 13018 Rto.'
      );
      return false;
    }

    return true;
  }

  function construirLineasResultados() {
    const vehiculos = leerEnteroNoNegativo(document.getElementById("vehiculos")?.value);
    const personas = leerEnteroNoNegativo(document.getElementById("personas")?.value);
    const testalom = leerEnteroNoNegativo(document.getElementById("testalom")?.value);
    const actas = leerEnteroNoNegativo(document.getElementById("actas")?.value);
    const requisa = leerEnteroNoNegativo(document.getElementById("Requisa")?.value);
    const qrz = leerEnteroNoNegativo(document.getElementById("qrz")?.value);
    const dominio = leerEnteroNoNegativo(document.getElementById("dominio")?.value);
    const remision = leerEnteroNoNegativo(document.getElementById("Remision")?.value);
    const retencion = leerEnteroNoNegativo(document.getElementById("Retencion")?.value);
    const prohibicion = leerEnteroNoNegativo(document.getElementById("Prohibicion")?.value);
    const cesion = leerEnteroNoNegativo(document.getElementById("Cesion")?.value);

    const alcoholimetro = construirBloqueAlcoholimetro();
    if (!alcoholimetro.ok) {
      marcarErrorCampo(alcoholimetro.input, alcoholimetro.mensaje);
      return null;
    }

    if ((alcoholimetro.cantidadSancionables || 0) > 0 && actas <= 0) {
      marcarErrorCampo(
        document.getElementById("actas"),
        'Si hay al menos una alcoholemia positiva sancionable, "Actas Labradas" debe ser mayor a cero.'
      );
      return null;
    }

    if (actas > 0 && vehiculos <= 0) {
      marcarErrorCampo(
        document.getElementById("vehiculos"),
        'Si "Actas Labradas" es mayor a cero, "Vehículos Fiscalizados" no puede ser cero ni quedar vacío.'
      );
      return null;
    }

    if (actas > 0 && personas <= 0) {
      marcarErrorCampo(
        document.getElementById("personas"),
        'Si "Actas Labradas" es mayor a cero, "Personas Identificadas" no puede ser cero ni quedar vacío.'
      );
      return null;
    }

    const medidas = [
      ["Remisión", remision],
      ["Retención", retencion],
      ["Prohibición de Circulación", prohibicion],
      ["Cesión de Conducción", cesion],
    ].filter(([, valor]) => valor > 0);

    const qrzValores = obtenerValoresListaDinamica(qrzCasilleros, "qrz");
    const dominioValores = obtenerValoresListaDinamica(dominioCasilleros, "dominio");

    const lineas = [
      `Vehículos Fiscalizados: (${formatearCantidad(vehiculos)})`,
      `Personas Identificadas: (${formatearCantidad(personas)})`,
      `Test de Alómetro: (${formatearCantidad(testalom)})`,
      ...alcoholimetro.lineas,
      `Actas Labradas: (${formatearCantidad(actas)})`,
      `Requisas: (${formatearCantidad(requisa)})`,
      ...construirBloqueListaVertical("Qrz", qrz, qrzValores),
      ...construirBloqueListaVertical("Dominio", dominio, dominioValores),
    ];

    if (medidas.length) {
      lineas.push("Medidas Cautelares:");
      medidas.forEach(([titulo, valor]) => {
        lineas.push(`${titulo}: (${formatearCantidad(valor)})`);
      });
    }

    return lineas;
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

  function setPersonalVisible(visible) {
    const el = document.getElementById("bloquePersonal");
    if (!el) return;
    el.classList.toggle("hidden", !visible);
  }

  function setMovilidadVisible(visible) {
    const el = document.getElementById("bloqueMovil");
    if (!el) return;
    el.classList.toggle("hidden", !visible);
  }


  function esControlSuperiorActivo() {
    try {
      if (window.ControlSuperior && typeof window.ControlSuperior.isActive === "function") {
        return !!window.ControlSuperior.isActive();
      }
    } catch {}
    return selTipo?.value === "CONTROL SUPERIOR";
  }

  function setObservacionesVisible(visible) {
    if (labelObs) labelObs.classList.toggle("hidden", !visible);
    if (textareaObs) textareaObs.classList.toggle("hidden", !visible);
  }

  function setControlSuperiorVisible(visible) {
    if (bloqueControlSuperior) bloqueControlSuperior.classList.toggle("hidden", !visible);
  }

  function setUIControlSuperiorActiva(activa) {
    setControlSuperiorVisible(activa);

    setPersonalVisible(!activa);
    setMovilidadVisible(!activa);
    setElementosVisibles(!activa);
    setObservacionesVisible(!activa);

    if (divFinaliza) divFinaliza.classList.toggle("hidden", activa || selTipo.value !== "FINALIZA");
    if (divDetalles) divDetalles.classList.add("hidden");
    if (divMismosElementos) divMismosElementos.classList.add("hidden");
    if (bloquePresenciaActiva) bloquePresenciaActiva.classList.add("hidden");

    if (activa) {
      if (chkMostrarResultadosFinaliza) chkMostrarResultadosFinaliza.checked = false;
      if (chkPresenciaActiva) chkPresenciaActiva.checked = false;
      if (chkMismoPersonal) chkMismoPersonal.checked = false;
      if (chkMismoMovil) chkMismoMovil.checked = false;
      if (chkMismosElementos) chkMismosElementos.checked = false;
    }
  }

  function limpiarSeleccionPersonal() {
    document.querySelectorAll(".personal").forEach((inp) => {
      inp.checked = false;
    });
  }

  function limpiarSeleccionMovilidad() {
    document.querySelectorAll(".movil, .moto").forEach((inp) => {
      inp.checked = false;
    });
  }

  function aplicarSeleccionDesdeArray(selector, valores) {
    const wanted = new Set(normalizarArrayTexto(valores));
    Array.from(document.querySelectorAll(selector)).forEach((inp) => {
      inp.checked = wanted.has(inp.value);
    });
  }

  function aplicarPersonal(payload) {
    aplicarSeleccionDesdeArray(".personal", payload?.personal);
  }

  function aplicarMovilidad(payload) {
    aplicarSeleccionDesdeArray(".movil", payload?.moviles);
    aplicarSeleccionDesdeArray(".moto", payload?.motos);
  }

  function desactivarControlesMismos({ limpiar = false } = {}) {
    if (chkMismoPersonal) chkMismoPersonal.checked = false;
    if (chkMismoMovil) chkMismoMovil.checked = false;
    if (chkMismosElementos) chkMismosElementos.checked = false;

    if (limpiar) {
      limpiarSeleccionPersonal();
      limpiarSeleccionMovilidad();
      limpiarSeleccionElementos();
    }

    setPersonalVisible(true);
    setMovilidadVisible(true);
    setElementosVisibles(true);
  }

  function aplicarInicioGuardadoAutomatico(payload) {
    const data = normalizarInicioGuardado(payload);
    inicioGuardadoActual = data;

    if (!data) {
      desactivarControlesMismos({ limpiar: true });
      return;
    }

    if (chkMismoPersonal) chkMismoPersonal.checked = true;
    if (chkMismoMovil) chkMismoMovil.checked = true;
    if (chkMismosElementos) chkMismosElementos.checked = true;

    aplicarPersonal(data);
    aplicarMovilidad(data);
    aplicarElementos(data.elementos);

    setPersonalVisible(false);
    setMovilidadVisible(false);
    setElementosVisibles(false);
  }

  async function sincronizarInicioGuardadoSegunContexto() {
    const fin = selTipo.value === "FINALIZA";

    if (!fin || !franjaSeleccionada) {
      inicioGuardadoActual = null;
      desactivarControlesMismos({ limpiar: false });
      return;
    }

    const lookupId = ++inicioGuardadoLookupId;
    const remoto = await leerInicioDesdeSupabase(franjaSeleccionada);
    if (lookupId !== inicioGuardadoLookupId) return;

    const payload = remoto || cargarInicioGuardadoCoincidente();
    aplicarInicioGuardadoAutomatico(payload);
  }

  function resetUI() {
    ordenSeleccionada = null;
    franjaSeleccionada = null;
    inicioGuardadoActual = null;

    selTipo.value = "INICIA";
    limpiarSeleccionOperativo();

    document.querySelectorAll('input[type="checkbox"]').forEach((c) => (c.checked = false));

    document
      .querySelectorAll('input[type="number"], input[type="text"], textarea')
      .forEach((i) => {
        i.value = "";
        limpiarErrorCampo(i);
      });

    if (window.ControlSuperior && typeof window.ControlSuperior.reset === "function") {
      window.ControlSuperior.reset();
    }

    const obs = document.getElementById("obs");
    if (obs) obs.value = "";

    divFinaliza.classList.add("hidden");
    divDetalles.classList.add("hidden");

    if (divMismosElementos) divMismosElementos.classList.add("hidden");
    if (bloquePresenciaActiva) bloquePresenciaActiva.classList.add("hidden");
    setControlSuperiorVisible(false);
    setObservacionesVisible(true);

    limpiarGraduaciones(graduacionesSancionable);
    limpiarGraduaciones(graduacionesNoSancionable);
    limpiarListaDinamica(qrzCasilleros);
    limpiarListaDinamica(dominioCasilleros);
    if (bloquePositivosAlcoholimetro) bloquePositivosAlcoholimetro.classList.add("hidden");
    if (wrapGraduacionesSancionable) wrapGraduacionesSancionable.classList.add("hidden");
    if (wrapGraduacionesNoSancionable) wrapGraduacionesNoSancionable.classList.add("hidden");
    if (unitGraduacionesSancionable) unitGraduacionesSancionable.classList.add("hidden");
    if (unitGraduacionesNoSancionable) unitGraduacionesNoSancionable.classList.add("hidden");
    if (wrapQrzCasilleros) wrapQrzCasilleros.classList.add("hidden");
    if (wrapDominioCasilleros) wrapDominioCasilleros.classList.add("hidden");

    desactivarControlesMismos();
    actualizarTipo();
    sincronizarUIAlcoholimetro();
    sincronizarUIQrzDominio();
  }

  // ======================================================
  // ===== DATOS DE INICIO COMPARTIDOS =====================
  // ======================================================
  async function guardarElementosDeInicio() {
    const payload = construirInicioGuardadoActual();
    if (!payload) return null;

    inicioGuardadoActual = payload;
    guardarInicioLocal(payload);
    await guardarInicioEnSupabase(payload);
    return payload;
  }

  function cargarElementosGuardados() {
    const payload = cargarInicioGuardadoCoincidente();
    return payload ? normalizarPayloadElementos(payload) : null;
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

    const map = normalizarPayloadElementos(payload);

    Object.keys(map).forEach((clase) => {
      const wanted = new Set(Array.isArray(map[clase]) ? map[clase] : []);
      const inputs = Array.from(document.querySelectorAll("." + clase));

      inputs.forEach((inp) => {
        inp.checked = wanted.has(inp.value);
      });
    });
  }

  if (chkMismoPersonal) {
    chkMismoPersonal.addEventListener("change", () => {
      if (!chkMismoPersonal.checked) {
        limpiarSeleccionPersonal();
        setPersonalVisible(true);
        return;
      }

      const payload = cargarInicioGuardadoCoincidente();
      if (!payload || !payload.personal.length) {
        alert("No hay personal guardado del INICIA.");
        chkMismoPersonal.checked = false;
        limpiarSeleccionPersonal();
        setPersonalVisible(true);
        return;
      }

      aplicarPersonal(payload);
      setPersonalVisible(false);
    });
  }

  if (chkMismoMovil) {
    chkMismoMovil.addEventListener("change", () => {
      if (!chkMismoMovil.checked) {
        limpiarSeleccionMovilidad();
        setMovilidadVisible(true);
        return;
      }

      const payload = cargarInicioGuardadoCoincidente();
      if (!payload || (!payload.moviles.length && !payload.motos.length)) {
        alert("No hay móviles guardados del INICIA.");
        chkMismoMovil.checked = false;
        limpiarSeleccionMovilidad();
        setMovilidadVisible(true);
        return;
      }

      aplicarMovilidad(payload);
      setMovilidadVisible(false);
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
  async function enviar() {
    if (!franjaSeleccionada) return;

    if (esControlSuperiorActivo()) {
      const inicioControlSuperior = await leerInicioDesdeSupabase(franjaSeleccionada) || cargarInicioGuardadoCoincidente();
      if (!inicioControlSuperior) {
        alert("No hay datos de inicio guardados para este operativo.");
        return;
      }

      if (!window.ControlSuperior || typeof window.ControlSuperior.buildMessage !== "function") {
        alert("No se pudo cargar el módulo de CONTROL SUPERIOR.");
        return;
      }

      const resultadoControlSuperior = window.ControlSuperior.buildMessage({
        forceActivo: true,
        inicio: inicioControlSuperior,
        franja: franjaSeleccionada,
        bold,
        compactarSaltos,
        normalizarLugar,
        normalizarArrayTexto,
        lineaDesdeArray,
      });

      if (!resultadoControlSuperior?.ok) {
        alert(resultadoControlSuperior?.mensaje || "No se pudo generar CONTROL SUPERIOR.");
        return;
      }

      resetUI();
      setTimeout(() => {
        window.location.href = "https://wa.me/?text=" + encodeURIComponent(resultadoControlSuperior.texto);
      }, 0);
      return;
    }

    const esFinaliza = selTipo.value === "FINALIZA";
    const incluirResultadosFinaliza = esFinaliza && debeIncluirResultadosFinaliza();
    const incluirDetallesFinaliza = esFinaliza && debeIncluirDetallesFinaliza();
    const usarPresenciaActiva = !!chkPresenciaActiva?.checked;
    const usarMismoPersonal = esFinaliza && !!chkMismoPersonal?.checked;
    const usarMismoMovil = esFinaliza && !!chkMismoMovil?.checked;
    const usarMismosElementos = esFinaliza && !!chkMismosElementos?.checked;

    let inicioCompartido = null;
    if (usarMismoPersonal || usarMismoMovil || usarMismosElementos) {
      inicioCompartido = cargarInicioGuardadoCoincidente();
      if (!inicioCompartido) {
        alert("No hay datos guardados del INICIA para este operativo. Destilde las opciones o envíe primero un INICIA.");
        return;
      }
    }

    const personalTexto = usarMismoPersonal
      ? normalizarArrayTexto(inicioCompartido?.personal).join("\n")
      : seleccion("personal");

    if (!personalTexto) {
      alert("Debe seleccionar personal policial.");
      return;
    }

    const mov = usarMismoMovil ? lineaDesdeArray(inicioCompartido?.moviles, "/") : seleccionLinea("movil", "/");
    const mot = usarMismoMovil ? lineaDesdeArray(inicioCompartido?.motos, "/") : seleccionLinea("moto", "/");
    if (mov === "/" && mot === "/") {
      alert("Debe seleccionar al menos un móvil o moto.");
      return;
    }

    const elementosInicio = usarMismosElementos ? normalizarPayloadElementos(inicioCompartido) : null;
    if (usarMismosElementos && !elementosInicio) {
      alert("No hay elementos guardados del INICIA. Destilde “mismos elementos” o envíe primero un INICIA.");
      return;
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
    )}`.trim();

    const mobilesTexto = [mov, mot].filter((v) => v !== "/").join(" / ") || "/";

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
    partes.push(personalTexto || "/");
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

    const detallesProcesados = esFinaliza && incluirDetallesFinaliza
      ? normalizarDetallesTexto(document.getElementById("detalles")?.value || "")
      : { detalles: "", observaciones: [], cantidadValidos: 0, detalleItems: [], tieneTexto: false };

    if (esFinaliza && incluirResultadosFinaliza && !validarDetallesRequeridosPorActas(detallesProcesados)) {
      return;
    }

    if (esFinaliza && incluirResultadosFinaliza) {
      const lineasResultados = construirLineasResultados();
      if (!lineasResultados) return;

      partes.push("");
      partes.push(bold("Resultados:"));
      partes.push(...lineasResultados);

      if (incluirDetallesFinaliza && detallesProcesados.detalles) {
        partes.push("");
        partes.push(bold("Detalles:"));
        partes.push(detallesProcesados.detalles);
      }
    }

    if (esFinaliza && !incluirResultadosFinaliza && incluirDetallesFinaliza) {
      if (detallesProcesados.detalles) {
        partes.push("");
        partes.push(bold("Detalles:"));
        partes.push(detallesProcesados.detalles);
      }
    }

    const observacionesExtras = [...detallesProcesados.observaciones];
    if (!esFinaliza && usarPresenciaActiva) observacionesExtras.push(OBS_PRESENCIA_ACTIVA_INICIA);
    if (esFinaliza && usarPresenciaActiva) observacionesExtras.push(OBS_PRESENCIA_ACTIVA_FINALIZA);

    partes.push("");
    partes.push(bold("Observaciones:"));
    partes.push(construirObservacionesFinales(observacionesExtras));

    const textoFinal = compactarSaltos(partes.join("\n"));

    if (selTipo.value === "INICIA") {
      await guardarElementosDeInicio();
    }

    resetUI();

    setTimeout(() => {
      window.location.href = "https://wa.me/?text=" + encodeURIComponent(textoFinal);
    }, 0);
  }

  // ===== Eventos =====
  if (selHorario) {
    selHorario.addEventListener("focus", syncAntesDeSeleccion);
    selHorario.addEventListener("change", actualizarDatosFranja);
  }
  selTipo.addEventListener("change", actualizarTipo);
  if (chkMostrarResultadosFinaliza) {
    chkMostrarResultadosFinaliza.addEventListener("change", () => {
      actualizarVisibilidadResultadosFinaliza();
    });
  }

  if (chkPresenciaActiva) {
    chkPresenciaActiva.addEventListener("change", () => {
      actualizarVisibilidadResultadosFinaliza();
    });
  }

  [inputAlcotest, inputPositivaSancionable, inputPositivaNoSancionable].forEach((input) => {
    if (!input) return;
    input.addEventListener("input", () => {
      limpiarErrorCampo(input);
      sincronizarUIAlcoholimetro();
    });
    input.addEventListener("blur", () => {
      normalizarInputNoNegativo(input);
      sincronizarUIAlcoholimetro();
    });
  });

  [inputQrz, inputDominio].forEach((input) => {
    if (!input) return;
    input.addEventListener("input", () => {
      limpiarErrorCampo(input);
      sincronizarUIQrzDominio();
    });
    input.addEventListener("blur", () => {
      normalizarInputNoNegativo(input);
      sincronizarUIQrzDominio();
    });
  });

  const detallesInput = document.getElementById("detalles");
  if (detallesInput) {
    detallesInput.addEventListener("input", () => {
      limpiarErrorCampo(detallesInput);
      aplicarAutocompletadoDetalles(detallesInput);
    });
    detallesInput.addEventListener("blur", () => {
      aplicarAutocompletadoDetalles(detallesInput);
    });
  }

  btnEnviar.addEventListener("click", enviar);

  // ===== Init =====
  (async function init() {
    if (window.ControlSuperior && typeof window.ControlSuperior.init === "function") {
      window.ControlSuperior.init();
    }
    selTipo.value = "INICIA";
    actualizarTipo();
    sincronizarUIAlcoholimetro();
    sincronizarUIQrzDominio();
    await syncOrdenesDesdeServidor();
    const _tmp = cargarOrdenesSeguro();
    console.log("[WSP] Órdenes en memoria/Storage:", Array.isArray(_tmp) ? _tmp.length : _tmp);
    cargarOperativosDisponibles();
  })();
})();
