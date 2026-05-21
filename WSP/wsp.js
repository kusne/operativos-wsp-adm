// ===== CONFIG SUPABASE WSP =====
const SUPABASE_URL = "https://ugeydxozfewzhldjbkat.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_ZeLC2rOxhhUXlQdvJ28JkA_qf802-pX";

(function () {
  // ===== DOM refs =====
  const selTipo = document.getElementById("tipo");
  const selOrden = document.getElementById("orden");
  const selHorario = document.getElementById("horario");
  const contadorOperativosWsp = document.getElementById("contadorOperativosWsp");

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

  // ===== CONTROL DE MÓVILES =====
  const bloqueControlMoviles = document.getElementById("bloqueControlMoviles");
  const controlMovilesEstado = document.getElementById("controlMovilesEstado");
  const controlMovilesChips = document.getElementById("controlMovilesChips");
  const controlMovilesFormulario = document.getElementById("controlMovilesFormulario");
  const controlMovilNumeroSeleccionado = document.getElementById("controlMovilNumeroSeleccionado");
  const controlMovilKilometraje = document.getElementById("controlMovilKilometraje");
  const controlMovilCombustible = document.getElementById("controlMovilCombustible");
  const controlMovilObservaciones = document.getElementById("controlMovilObservaciones");
  const controlMovilFueraServicio = document.getElementById("controlMovilFueraServicio");
  const controlMovilesAyudaWrap = document.getElementById("controlMovilesAyudaWrap");
  const controlMovilesAyudaBtn = document.getElementById("controlMovilesAyudaBtn");
  const controlMovilesAyudaPopup = document.getElementById("controlMovilesAyudaPopup");
  const controlMovilFoto1 = document.getElementById("controlMovilFoto1");
  const controlMovilFoto2 = document.getElementById("controlMovilFoto2");
  const controlMovilPreview1 = document.getElementById("controlMovilPreview1");
  const controlMovilPreview2 = document.getElementById("controlMovilPreview2");
  const btnCambiarMovilControl = document.getElementById("btnCambiarMovilControl");

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

  let controlMovilesCache = [];
  let controlMovilSeleccionado = null;
  let controlMovilesCargados = false;
  let controlMovilesLocks = new Map();
  let controlMovilesHeartbeatTimer = null;
  let controlMovilesPollingTimer = null;
  let controlMovilesRealtimeChannel = null;
  let controlMovilesRealtimeClient = null;
  let controlMovilesRealtimeRefreshTimer = null;
  let controlMovilesSincronizando = false;

  const AUTO_CIERRE_WSP_MS = 5 * 60 * 1000; // 5 minutos después de abrir WhatsApp
  let autoCierreWspTimer = null;

  function programarCierreVentanaWsp() {
    if (autoCierreWspTimer) {
      clearTimeout(autoCierreWspTimer);
      autoCierreWspTimer = null;
    }

    autoCierreWspTimer = setTimeout(() => {
      try {
        if (window.electronAPI && typeof window.electronAPI.closeCurrentWindow === "function") {
          window.electronAPI.closeCurrentWindow();
          return;
        }
      } catch (e) {
        console.warn("[WSP] No se pudo cerrar mediante electronAPI.closeCurrentWindow.", e);
      }

      try {
        if (window.electronAPI && typeof window.electronAPI.cerrarVentanaActual === "function") {
          window.electronAPI.cerrarVentanaActual();
          return;
        }
      } catch (e) {
        console.warn("[WSP] No se pudo cerrar mediante electronAPI.cerrarVentanaActual.", e);
      }

      try {
        window.close();
      } catch (e) {
        console.warn("[WSP] El navegador bloqueó window.close().", e);
      }
    }, AUTO_CIERRE_WSP_MS);
  }

  function abrirWhatsappYCerrarWspLuego(texto) {
    const url = "https://wa.me/?text=" + encodeURIComponent(texto || "");

    programarCierreVentanaWsp();

    try {
      const win = window.open(url, "_blank");
      if (win) return;
    } catch (e) {
      console.warn("[WSP] No se pudo abrir WhatsApp en ventana nueva. Se usa navegación actual.", e);
    }

    // Respaldo: mantiene el comportamiento anterior si el navegador bloquea la ventana nueva.
    // En este caso el cierre automático puede no ejecutarse porque la página navega a WhatsApp.
    window.location.href = url;
  }

  const detallesAutocompletadoState = new WeakMap();

  function actualizarContadorOperativosWsp(cantidad = operativosCache.length) {
    if (!contadorOperativosWsp) return;
    const n = Math.max(0, parseInt(cantidad, 10) || 0);
    contadorOperativosWsp.textContent = String(n);
  }

  const OBS_PRESENCIA_ACTIVA_INICIA = "Se inicia con Presencia Activa por inclemencias del tiempo ( lluvias).Se adjunta vistas Fotograficas.";
  const OBS_PRESENCIA_ACTIVA_FINALIZA = "Se Realizo Presencia Activa durante todo el operativo por inclemencias del tiempo(lluvias) . Se adjuntas vistas Fotograficas.";

  const CONTROL_MOVILES_TABLE = "moviles_controles";
  const CONTROL_MOVILES_MOVILES_TABLE = "moviles_bmzcn";
  const CONTROL_MOVILES_FOTOS_TABLE = "moviles_fotos_guardia";
  const CONTROL_MOVILES_BUCKET = "moviles-control-fotos";
  const CONTROL_MOVILES_LOCKS_TABLE = "wsp_control_moviles_locks";
  const CONTROL_MOVILES_ESTADO_RECURSOS_TABLE = "recursos_controles_wsp_estado";
  const CONTROL_MOVILES_DISPOSITIVOS_TABLE = "wsp_dispositivos";
  const CONTROL_MOVILES_PRESENCE_TABLE = "wsp_control_moviles_presence";
  const CONTROL_MOVILES_COMBUSTIBLES = ["", "reserva", "1/4", "+1/4", "-1/2", "1/2", "+1/2", "3/4", "+3/4", "lleno"];
  const CONTROL_MOVILES_BASE_NUMEROS = ["12428", "10139", "12502"];
  const CONTROL_MOVILES_HEARTBEAT_MS = 15000;
  const CONTROL_MOVILES_POLLING_MS = 8000;
  const CONTROL_MOVILES_PRESENCE_TTL_MS = 45000;
  const CONTROL_MOVILES_LOCK_TTL_MS = 2 * 60 * 60 * 1000;

  function cerrarAyudaControlMoviles() {
    if (!controlMovilesAyudaPopup || !controlMovilesAyudaBtn) return;
    controlMovilesAyudaPopup.classList.add("hidden");
    controlMovilesAyudaBtn.classList.remove("ayuda-activa");
    controlMovilesAyudaBtn.setAttribute("aria-expanded", "false");
  }

  function abrirAyudaControlMoviles() {
    if (!controlMovilesAyudaPopup || !controlMovilesAyudaBtn) return;
    controlMovilesAyudaPopup.classList.remove("hidden");
    controlMovilesAyudaBtn.classList.add("ayuda-activa");
    controlMovilesAyudaBtn.setAttribute("aria-expanded", "true");
  }

  function alternarAyudaControlMoviles(event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    if (!controlMovilesAyudaPopup) return;
    const estaAbierta = !controlMovilesAyudaPopup.classList.contains("hidden");
    if (estaAbierta) cerrarAyudaControlMoviles();
    else abrirAyudaControlMoviles();
  }

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
  function pad2FechaOrdenes(n) {
    return String(n).padStart(2, "0");
  }

  function fechaIsoADDMMAAAA(value) {
    if (!value) return "";

    const raw = String(value || "").trim();

    let m = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (m) return `${m[3]}/${m[2]}/${m[1]}`;

    m = raw.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{2,4})$/);
    if (m) {
      const year = m[3].length === 2 ? `20${m[3]}` : m[3];
      return `${pad2FechaOrdenes(m[1])}/${pad2FechaOrdenes(m[2])}/${year}`;
    }

    const d = new Date(raw);
    if (!isNaN(d.getTime())) {
      return `${pad2FechaOrdenes(d.getDate())}/${pad2FechaOrdenes(d.getMonth() + 1)}/${d.getFullYear()}`;
    }

    return raw;
  }

  function horarioDesdeRegistroPublicado(rec) {
    const hDesde = limpiarTextoSimple(rec?.horaDesde || rec?.desde || "");
    const hHasta = limpiarTextoSimple(rec?.horaHasta || rec?.hasta || "");

    if (hDesde && hHasta) return `${hDesde} A ${hHasta}`;

    const horario = limpiarTextoSimple(rec?.horario || "");
    if (horario) return horario;

    return "";
  }

  function tituloDesdeRegistroPublicado(rec, row) {
    const tipo = limpiarTextoSimple(rec?.tipo || "");
    const orden = limpiarTextoSimple(rec?.orden || rec?.numOrden || "");
    const titulo = limpiarTextoSimple(rec?.titulo || "");

    if (titulo) return titulo;
    if (tipo && orden) return `${tipo} ${orden}`;
    if (tipo) return tipo;
    if (orden) return orden;
    return limpiarTextoSimple(row?.archivo_nombre || "Orden publicada");
  }

  function numeroOrdenDesdeRegistroPublicado(rec) {
    return limpiarTextoSimple(rec?.orden || rec?.numOrden || "");
  }

  function registrosPublicadosDeFila(row) {
    if (Array.isArray(row?.registros)) return row.registros;

    if (typeof row?.registros === "string") {
      try {
        const parsed = JSON.parse(row.registros);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }

    return [];
  }


  function normalizarArrayJsonWsp(value) {
    if (Array.isArray(value)) {
      return value.map((v) => limpiarTextoSimple(v)).filter(Boolean);
    }

    if (typeof value === "string") {
      const raw = value.trim();
      if (!raw) return [];
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          return parsed.map((v) => limpiarTextoSimple(v)).filter(Boolean);
        }
      } catch {}
      return [limpiarTextoSimple(raw)].filter(Boolean);
    }

    return [];
  }

  function timestampOperativoAMs(value) {
    if (!value) return NaN;
    const d = new Date(String(value).trim());
    return !isNaN(d.getTime()) ? d.getTime() : NaN;
  }

  function tituloDesdeOperativoPublicado(row) {
    const tipo = limpiarTextoSimple(row?.tipo || "Operativo");
    const ordenes = normalizarArrayJsonWsp(row?.ordenes_origen);
    const ordenTxt = ordenes.join(" / ");

    if (tipo && ordenTxt) return `${tipo} ${ordenTxt}`;
    if (tipo) return tipo;
    if (ordenTxt) return ordenTxt;
    return "Operativo";
  }

  function convertirOperativosPublicadosAFormatoWsp(filas) {
    const rows = Array.isArray(filas) ? filas : [];
    const franjas = [];

    rows.forEach((row) => {
      if (row?.activo === false) return;
      if (row?.sin_efecto === true) return;

      const hDesde = limpiarTextoSimple(row?.hora_desde || "");
      const hHasta = limpiarTextoSimple(row?.hora_hasta || "");
      const lugar = limpiarTextoSimple(row?.lugar || "");
      const titulo = tituloDesdeOperativoPublicado(row);
      const fechaRegistro = fechaIsoADDMMAAAA(row?.fecha_operativo || "");
      const inicioMs = timestampOperativoAMs(row?.inicio_operativo);
      const ordenes = normalizarArrayJsonWsp(row?.ordenes_origen);
      const archivos = normalizarArrayJsonWsp(row?.archivos_origen);

      if (!hDesde || !hHasta || !lugar || !titulo || !fechaRegistro) return;

      franjas.push({
        horario: `${hDesde} A ${hHasta}`,
        lugar,
        titulo,
        fecha: fechaRegistro,
        sortKey: Number.isFinite(inicioMs) ? inicioMs : undefined,
        __inicioTs: Number.isFinite(inicioMs) ? inicioMs : undefined,
        __operativoPublicadoId: row?.id || null,
        __operativoKey: limpiarTextoSimple(row?.operativo_key || ""),
        __ordenNum: ordenes.join(" / "),
        __ordenTextoRef: archivos.join(" / ") || "Operativos publicados",
      });
    });

    return [{
      num: "",
      textoRef: "Operativos publicados",
      vigencia: fechaIsoADDMMAAAA(getGuardiaFechaISO()),
      caducidad: "",
      franjas,
    }];
  }

  function convertirOrdenesPublicadasAFormatoWsp(filas) {
    const ordenes = [];
    const rows = Array.isArray(filas) ? filas : [];

    rows.forEach((row, idxRow) => {
      if (String(row?.estado_manual || "ACTIVA").toUpperCase() !== "ACTIVA") return;
      if (row?.activo === false) return;

      const estadoOrden = String(row?.estado || "").toUpperCase();
      if (estadoOrden && !["EN_VIGENCIA", "A_EJECUTAR"].includes(estadoOrden)) return;

      const registros = registrosPublicadosDeFila(row);
      if (!registros.length) return;

      const franjas = [];
      let primerNumeroOrden = "";
      let primeraFechaRegistro = "";

      registros.forEach((rec) => {
        if (rec?.sinEfecto === true || rec?.__sinEfecto === true) return;

        const horario = horarioDesdeRegistroPublicado(rec);
        const lugar = limpiarTextoSimple(rec?.lugar || rec?.qth || "");
        const titulo = tituloDesdeRegistroPublicado(rec, row);
        const numeroOrden = numeroOrdenDesdeRegistroPublicado(rec);

        if (!horario || !lugar || !titulo) return;
        const fechaRegistro = fechaIsoADDMMAAAA(rec?.fecha || row?.fecha_inicio_ejecucion);
        const sortKey = Number(rec?.sortKey || rec?.__inicioTs || rec?.inicioTs || rec?.inicio_ts || NaN);

        if (!primerNumeroOrden && numeroOrden) primerNumeroOrden = numeroOrden;
        if (!primeraFechaRegistro && fechaRegistro) primeraFechaRegistro = limpiarTextoSimple(fechaRegistro);

        franjas.push({
          horario,
          lugar,
          titulo,
          fecha: fechaRegistro,
          sortKey: Number.isFinite(sortKey) ? sortKey : undefined,
          __inicioTs: Number.isFinite(sortKey) ? sortKey : undefined,
        });
      });

      if (!franjas.length) return;

      ordenes.push({
        num: primerNumeroOrden,
        textoRef: limpiarTextoSimple(row?.archivo_nombre || `Orden publicada ${idxRow + 1}`),
        vigencia: fechaIsoADDMMAAAA(primeraFechaRegistro || row?.fecha_inicio_ejecucion),
        caducidad: row?.modo_caducidad === "A_FINALIZAR"
          ? "A FINALIZAR"
          : fechaIsoADDMMAAAA(row?.fecha_caducidad),
        franjas,
      });
    });

    return ordenes;
  }

  async function syncOrdenesDesdeServidor() {
    try {
      const guardiaFecha = getGuardiaFechaISO();
      const params = new URLSearchParams({
        select: "id,operativo_key,guardia_fecha,fecha_operativo,inicio_operativo,hora_desde,hora_hasta,lugar,lugar_normalizado,tipo,ordenes_origen,archivos_origen,activo,sin_efecto,error_en_la_orden,error_motivo,registro_original,updated_at",
        guardia_fecha: `eq.${guardiaFecha}`,
        activo: "eq.true",
        sin_efecto: "eq.false",
        order: "inicio_operativo.asc",
      });

      const r = await fetch(`${SUPABASE_URL}/rest/v1/operativos_publicados?${params.toString()}`, {
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          Accept: "application/json",
        },
      });

      if (!r.ok) {
        const txt = await r.text().catch(() => "");
        console.error("[WSP] Supabase REST error operativos_publicados:", r.status, txt);
        guardarOrdenesSeguro([]);
        actualizarContadorOperativosWsp(0);
        return false;
      }

      const data = await r.json();
      const ordenes = convertirOperativosPublicadosAFormatoWsp(data);

      guardarOrdenesSeguro(ordenes);
      return true;
    } catch (e) {
      console.error("Error leyendo operativos_publicados:", e);
      guardarOrdenesSeguro([]);
      actualizarContadorOperativosWsp(0);
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
    actualizarContadorOperativosWsp(0);
  }

  // ===== Guardia =====
  function getVentanaOperativosWsp(now = new Date()) {
    /*
      Ventana operativa BMZCN:
      - NO cambia a las 00:00.
      - Cambia recién a las 06:00.
      - Desde 06:00 inclusive hasta 06:00 del día siguiente exclusivo.
      Ejemplo: si son las 02:00 del jueves, la guardia vigente sigue siendo
      miércoles 06:00 → jueves 06:00.
    */
    const desde = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      6,
      0,
      0,
      0
    );

    if (now < desde) {
      desde.setDate(desde.getDate() - 1);
    }

    const hasta = new Date(desde);
    hasta.setDate(hasta.getDate() + 1);

    return { desde, hasta };
  }

  function getGuardiaInicio() {
    return getVentanaOperativosWsp().desde;
  }

  function extraerHoraInicio(h) {
    const hora = extraerHoraInicioCompleta(h);
    return hora ? hora.hh : null;
  }

  function extraerHoraInicioCompleta(h) {
    const s = String(h || "").toLowerCase();

    let m = s.match(/(\d{1,2})\s*[:.]\s*(\d{2})/);
    if (m) {
      const hh = parseInt(m[1], 10);
      const mm = parseInt(m[2], 10);
      if (hh >= 0 && hh <= 23 && mm >= 0 && mm <= 59) return { hh, mm };
    }

    m = s.match(/(?:^|desde|de|horario|hs|h|a\s+las)\s*(\d{1,2})/);
    if (m) {
      const hh = parseInt(m[1], 10);
      if (hh >= 0 && hh <= 23) return { hh, mm: 0 };
    }

    m = s.match(/(\d{1,2})/);
    if (!m) return null;

    const hh = parseInt(m[1], 10);
    return hh >= 0 && hh <= 23 ? { hh, mm: 0 } : null;
  }

  function franjaEnGuardia(h) {
    const hora = extraerHoraInicioCompleta(h);
    if (!hora) return true;

    const { desde, hasta } = getVentanaOperativosWsp();
    const f = new Date(desde.getFullYear(), desde.getMonth(), desde.getDate(), hora.hh, hora.mm, 0, 0);

    if (f < desde) f.setDate(f.getDate() + 1);

    return f >= desde && f < hasta;
  }

  function obtenerFechaFranjaOperativo(franja, orden) {
    return limpiarTextoSimple(franja?.fecha || franja?.__fechaOperativo || orden?.vigencia || "");
  }

  function construirFechaHoraInicioFranja(franja, orden) {
    const ts = Number(franja?.__inicioTs || franja?.sortKey || franja?.inicioTs || franja?.inicio_ts || NaN);
    if (Number.isFinite(ts)) {
      const d = new Date(ts);
      if (!isNaN(d.getTime())) return d;
    }

    const fechaBase = parseVigenciaFlexible(obtenerFechaFranjaOperativo(franja, orden));
    const horaInicio = extraerHoraInicioCompleta(franja?.horario || "");

    if (!(fechaBase instanceof Date) || isNaN(fechaBase.getTime())) return null;
    if (!horaInicio) return null;

    return new Date(
      fechaBase.getFullYear(),
      fechaBase.getMonth(),
      fechaBase.getDate(),
      horaInicio.hh,
      horaInicio.mm,
      0,
      0
    );
  }

  function franjaIniciaEnGuardiaActual(franja, orden) {
    const fechaHoraInicio = construirFechaHoraInicioFranja(franja, orden);

    if (!fechaHoraInicio) {
      return franjaEnGuardia(franja?.horario || "");
    }

    const { desde, hasta } = getVentanaOperativosWsp();
    return fechaHoraInicio >= desde && fechaHoraInicio < hasta;
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

    const latamCorto = String(v || "").match(/^(\d{1,2})\/(\d{1,2})\/(\d{2})$/);
    if (latamCorto) return new Date(2000 + Number(latamCorto[3]), Number(latamCorto[2]) - 1, Number(latamCorto[1]));

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

    const selectCols = "id,guardia_fecha,operativo_key,orden_num,texto_ref,horario,lugar,tipo_corto,personal,moviles,motos,elementos";
    const fechasBusqueda = getFechasBusquedaInicio();
    const keysPosibles = construirOperativoKeysPosibles(franja);

    try {
      for (const fechaBusqueda of fechasBusqueda) {
        for (const keyPosible of keysPosibles) {
          const paramsExactos = new URLSearchParams({
            select: selectCols,
            guardia_fecha: `eq.${fechaBusqueda}`,
            operativo_key: `eq.${keyPosible}`,
            order: "id.desc",
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
          order: "id.desc",
          limit: "300",
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
    const ordenes = cargarOrdenesSeguro();

    operativosCache = [];
    if (selHorario) {
      selHorario.innerHTML = '<option value="">Seleccionar Operativo</option>';
    }

    ordenes.forEach((orden, idxOrden) => {
      const franjasOrdenadas = (orden.franjas || [])
        .map((franja, idxFranja) => ({ franja, idxFranja, inicio: construirFechaHoraInicioFranja(franja, orden) }))
        .sort((a, b) => {
          const at = a.inicio instanceof Date && !isNaN(a.inicio.getTime()) ? a.inicio.getTime() : Number.MAX_SAFE_INTEGER;
          const bt = b.inicio instanceof Date && !isNaN(b.inicio.getTime()) ? b.inicio.getTime() : Number.MAX_SAFE_INTEGER;
          return at - bt;
        });

      franjasOrdenadas.forEach(({ franja, idxFranja }) => {
        if (!franjaIniciaEnGuardiaActual(franja, orden)) return;

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

    actualizarContadorOperativosWsp(operativosCache.length);
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

  // Texto corto SOLO para mostrar en el desplegable de operativos.
  // No modifica la franja original, ni las claves internas, ni lo que se envía por WhatsApp/Supabase.
  function obtenerFuenteVisualFranja(franja) {
    return normalizarBasicoSinAcentos([
      franja?.titulo || "",
      obtenerTextoRefOrdenDeFranja(franja),
      franja?.lugar || "",
    ].join(" "));
  }

  function compactarClaveVisual(txt) {
    return normalizarBasicoSinAcentos(txt).replace(/[^a-z0-9]+/g, "");
  }

  function capitalizarLugarVisual(txt) {
    return limpiarTextoSimple(txt)
      .toLowerCase()
      .replace(/\b\w/g, (l) => l.toUpperCase())
      .replace(/\bRn\b/g, "RN")
      .replace(/\bRp\b/g, "RP")
      .replace(/\bKm\b/g, "KM")
      .replace(/\bUor\b/g, "UOR")
      .replace(/\bDicep\b/g, "DICEP");
  }

  function obtenerLugarVisualFranja(franja) {
    let lugar = limpiarTextoSimple(franja?.lugar || "");
    if (!lugar) return "sin lugar";

    lugar = lugar
      .replace(/^qth\s*[:\-]?\s*/i, "")
      .replace(/^lugar\s*[:\-]?\s*/i, "")
      .trim();

    const clave = compactarClaveVisual(lugar);

    /*
      Reglas específicas de LUGAR para el desplegable.
      Van antes de las reglas generales viejas para que no las pisen.
      No modifican la franja original, solo el texto visual del select.
    */

    // Rutas combinadas / tramos: deben evaluarse antes de RN168+KM18 genérico.
    if (clave.includes("rn168delkm18al00rp1delkm00al20")) return "RN168/RP1";
    if (clave.includes("rn168delkm18al00")) return "RN168 Km18/Km00";

    // Regla especial pedida: RN168 KM18 con/sin Peaje.
    const tieneRN168 = clave.includes("rn168") || clave.includes("rutanacional168");
    const tieneKM18 = clave.includes("km18") || clave.includes("kilometro18");
    const tienePeaje = clave.includes("peaje");

    if (tieneRN168 && tieneKM18) {
      return tienePeaje ? "Peaje" : "Base";
    }

    if (clave.includes("rn168km16ascendente")) return "RN168 KM16 ASC";
    if (
      clave.includes("zonadebolichesbailableslindantesarn168") ||
      clave.includes("zonadebolichesbailableslindantesarnn168")
    ) return "ZONA DE BOLICHES";
    if (clave === "ascendente") return "ASC";
    if (clave === "descendente") return "DESC";
    if (clave.includes("rp01km06consubbaserinconuor3coordinado")) return "RP01 KM06 CON SUB-BASE";
    if (clave.includes("rp1yrn168alturaparadadecolectivo")) return "RP1 Y RN168 P. DE COLECTIVO";
    if (clave.includes("aup01km141bmnuor3")) return "AUP01 KM141";
    if (clave.includes("rn168km75ascbmconufivambossentidos")) return "RN168 KM7,5 ASC";
    if (clave.includes("rn11km454sauceviejoalturaaeropuertobmnuor3")) return "RN11 KM454 AEROPUERTO";
    if (clave.includes("rp1km8coordinadoconsubbaserincon")) return "RP1 KM8 CON SUB BASE";
    if (clave.includes("rp2yrp5monteverabmnuor3")) return "RP2 Y RP5";

    const esRN168 = clave.includes("rn168") || clave.includes("rutanacional168");
    const esRP1 = clave.includes("rp1") || clave.includes("rutaprovincial1");

    if (esRN168 && esRP1) return "RN168 y RP1";

    lugar = lugar
      .replace(/\bruta\s+nacional\s*/gi, "RN")
      .replace(/\bruta\s+provincial\s*/gi, "RP")
      .replace(/\bkil[oó]metro\b/gi, "KM")
      .replace(/\bascendente\b/gi, "ASC")
      .replace(/\bdescendente\b/gi, "DESC")
      .replace(/\bpuente\s+carretero\b/gi, "Pte. Carretero")
      .replace(/\bcabecera\b/gi, "Cab.")
      .replace(/\bsanto\s+tome\b/gi, "Sto. Tome")
      .replace(/\bsanta\s+fe\b/gi, "Sta. Fe");

    lugar = capitalizarLugarVisual(lugar)
      .replace(/\bAsc\b/g, "ASC")
      .replace(/\bDesc\b/g, "DESC")
      .replace(/\bRn\b/g, "RN")
      .replace(/\bRp\b/g, "RP")
      .replace(/\bKm\b/g, "KM")
      .replace(/\bUor\b/g, "UOR");

    if (lugar.length > 24) {
      return lugar.slice(0, 24).trim() + "...";
    }

    return lugar;
  }

  function obtenerTipoVisualFranja(franja) {
    const fuente = obtenerFuenteVisualFranja(franja);
    const clave = compactarClaveVisual(fuente);

    /*
      Reglas específicas de REFERENCIA para el desplegable.
      Van antes de las reglas generales viejas.
    */
    if (clave.includes("operativodecontrolvehicularenconjuntoconsubbaseuor3")) return "OCV CON SUB BASE";
    if (clave.includes("operativodecontrolvehicularenconjuntoconuor3")) return "CON UOR3";
    if (clave.includes("nocturnidadcontrolada")) return "NOCTURNIDAD";
    if (clave.includes("alcoholemiaenconjuntoconuor3")) return "ALCOHOLEMIA CON UOR3";
    if (clave.includes("operativoretornocuidadocorredordelacostarn168")) return "RETORNO";
    if (clave.includes("operativoordenamientovehicular")) return "ORDENAMIENTO";
    if (clave.includes("operativoespecialmultiagencialdenominadodicep")) return "DICEP";
    if (clave.includes("cinemometrocondetencion")) return "CINEMÓMETRO";

    if (/\bcontrol\s+de\s+peso\b|\bpeso\b|\bbalanza\b|\bbascula\b|\bbasculas\b|\bpesaje\b/.test(fuente)) return "Balanza";
    if (/\bdicep\b|\bmultiagencial\b|\bmulti\s+agencial\b/.test(fuente)) return "DICEP";
    if (/\balcoholemia\b|\balcoholimetr/.test(fuente)) return "Alcoholemia";
    if (/\bocv\b|\bcontrol\s+vehicular\b|\boperativo\s+de\s+control\s+vehicular\b/.test(fuente)) return "OCV";
    if (/\bordenamiento\b/.test(fuente)) return "Ordenamiento";
    if (/\blimpieza\b/.test(fuente)) return "Limpieza";
    if (/\bablacion\b/.test(fuente)) return "Ablacion";
    if (/\bestablecido\b/.test(fuente)) return "Establecido";
    if (/\bpresencia\s+activa\b|\bpresencia\b/.test(fuente)) return "Presencia";
    if (/\bmonitoreo\b/.test(fuente)) return "Monitoreo";
    if (/\btraslado\b/.test(fuente)) return "Traslado";
    if (/\bcustodia\b/.test(fuente)) return "Custodia";
    if (/\bacompanamiento\b|\bacompanamieto\b|\bescolta\b/.test(fuente)) return "Acomp.";

    return obtenerTipoCortoFranja(franja);
  }

  function obtenerSufijosVisualesFranja(franja) {
    const fuente = obtenerFuenteVisualFranja(franja);
    const clave = compactarClaveVisual(fuente);
    const sufijos = [];

    /*
      Estas referencias ya incluyen UOR3/Sub Base en el resumen.
      Evita salidas duplicadas como "CON UOR3 con UOR3".
    */
    if (
      clave.includes("operativodecontrolvehicularenconjuntoconuor3") ||
      clave.includes("alcoholemiaenconjuntoconuor3") ||
      clave.includes("operativodecontrolvehicularenconjuntoconsubbaseuor3")
    ) {
      return sufijos;
    }

    if (/\buor\s*3\b|\buor3\b/.test(fuente)) sufijos.push("con UOR3");
    if (/\btransito\b|\binspectores?\s+de\s+transito\b/.test(fuente)) sufijos.push("con Transito");

    return sufijos;
  }

  function construirTextoOpcionHorario(franja) {
    const horario = limpiarTextoSimple(franja?.horario || "");
    const lugar = obtenerLugarVisualFranja(franja);
    const tipo = obtenerTipoVisualFranja(franja);
    const sufijos = obtenerSufijosVisualesFranja(franja);
    const referencia = [tipo, ...sufijos].filter(Boolean).join(" ");

    return `${horario} - ${lugar} - ${referencia}`;
  }

  // ======================================================
  // ===== CONTROL DE MÓVILES ==============================
  // ======================================================
  function esControlMovilesActivo() {
    return selTipo?.value === "CONTROL MOVILES";
  }

  function setTextoEstadoControlMoviles(texto) {
    if (controlMovilesEstado) controlMovilesEstado.textContent = texto || "";
  }

  function crearIdControlMoviles(prefix) {
    try {
      if (window.crypto && typeof window.crypto.randomUUID === "function") {
        return `${prefix}_${window.crypto.randomUUID()}`;
      }
    } catch {}
    return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 12)}`;
  }

  function obtenerOwnerIdControlMoviles() {
    const key = "wsp_control_moviles_owner_id";
    try {
      const actual = window.localStorage?.getItem(key);
      if (actual) return actual;
      const nuevo = crearIdControlMoviles("owner");
      window.localStorage?.setItem(key, nuevo);
      return nuevo;
    } catch {
      return crearIdControlMoviles("owner");
    }
  }

  function obtenerSessionIdControlMoviles() {
    const key = "wsp_control_moviles_session_id";
    try {
      const actual = window.sessionStorage?.getItem(key);
      if (actual) return actual;
      const nuevo = crearIdControlMoviles("session");
      window.sessionStorage?.setItem(key, nuevo);
      return nuevo;
    } catch {
      return crearIdControlMoviles("session");
    }
  }

  const CONTROL_MOVILES_OWNER_ID = obtenerOwnerIdControlMoviles();
  const CONTROL_MOVILES_SESSION_ID = obtenerSessionIdControlMoviles();

  function ahoraISOControlMoviles(offsetMs = 0) {
    return new Date(Date.now() + offsetMs).toISOString();
  }

  function querySupabase(params = {}) {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value === undefined || value === null) return;
      qs.set(key, String(value));
    });
    return qs.toString();
  }

  async function fetchSupabaseTabla(table, { method = "GET", params = {}, body = null, extraHeaders = {} } = {}) {
    const qs = querySupabase(params);
    const url = `${SUPABASE_URL}/rest/v1/${table}${qs ? `?${qs}` : ""}`;
    const r = await fetch(url, {
      method,
      headers: headersSupabase({
        ...(body ? { "Content-Type": "application/json" } : {}),
        ...extraHeaders,
      }),
      body: body ? JSON.stringify(body) : null,
    });

    if (!r.ok) {
      const txt = await r.text().catch(() => "");
      throw new Error(`Supabase ${table} ${method} ${r.status}: ${txt}`);
    }

    if (method === "DELETE" || extraHeaders.Prefer === "return=minimal") return null;
    return r.json().catch(() => null);
  }

  function normalizarNumeroMovilControl(numero) {
    return limpiarTextoSimple(numero || "").replace(/\D+/g, "");
  }

  function normalizarLockControlMovil(row) {
    const numero = normalizarNumeroMovilControl(row?.numero_movil);
    if (!numero) return null;
    return {
      numero,
      guardia_fecha: limpiarTextoSimple(row?.guardia_fecha || ""),
      owner_id: limpiarTextoSimple(row?.owner_id || ""),
      session_id: limpiarTextoSimple(row?.session_id || ""),
      locked_at: limpiarTextoSimple(row?.locked_at || ""),
      updated_at: limpiarTextoSimple(row?.updated_at || ""),
      expires_at: limpiarTextoSimple(row?.expires_at || ""),
    };
  }

  function lockControlMovilEsPropio(lock) {
    return !!lock && lock.owner_id === CONTROL_MOVILES_OWNER_ID;
  }

  function obtenerLockControlMovil(numero) {
    return controlMovilesLocks.get(normalizarNumeroMovilControl(numero));
  }

  function movilControlVisiblePorEstadoOLock(movil) {
    if (!movil?.numero) return false;
    return !!movil.condicion || !!obtenerLockControlMovil(movil.numero);
  }

  function movilesControlVisibles() {
    return (Array.isArray(controlMovilesCache) ? controlMovilesCache : []).filter(movilControlVisiblePorEstadoOLock);
  }

  async function cargarBloqueosControlMoviles() {
    const guardia = obtenerGuardiaControlMovil();
    try {
      const data = await fetchSupabaseTabla(CONTROL_MOVILES_LOCKS_TABLE, {
        params: {
          select: "numero_movil,guardia_fecha,owner_id,session_id,locked_at,updated_at,expires_at",
          guardia_fecha: `eq.${guardia.guardia_fecha}`,
          expires_at: `gt.${ahoraISOControlMoviles()}`,
        },
        extraHeaders: { Accept: "application/json" },
      });

      controlMovilesLocks = new Map();
      (Array.isArray(data) ? data : []).forEach((row) => {
        const lock = normalizarLockControlMovil(row);
        if (lock) controlMovilesLocks.set(lock.numero, lock);
      });

      verificarSeleccionBloqueadaPorOtroControlMovil();
      renderControlMovilesChips();
      return controlMovilesLocks;
    } catch (e) {
      console.warn("[WSP] No se pudieron leer bloqueos de control de móviles.", e);
      return controlMovilesLocks;
    }
  }

  async function borrarBloqueosVencidosControlMoviles() {
    try {
      await fetchSupabaseTabla(CONTROL_MOVILES_LOCKS_TABLE, {
        method: "DELETE",
        params: { expires_at: `lt.${ahoraISOControlMoviles()}` },
        extraHeaders: { Prefer: "return=minimal" },
      });
    } catch (e) {
      console.warn("[WSP] No se pudieron borrar bloqueos vencidos.", e);
    }
  }

  async function borrarPresenciasVencidasControlMoviles() {
    try {
      await fetchSupabaseTabla(CONTROL_MOVILES_PRESENCE_TABLE, {
        method: "DELETE",
        params: { expires_at: `lt.${ahoraISOControlMoviles()}` },
        extraHeaders: { Prefer: "return=minimal" },
      });
    } catch (e) {
      console.warn("[WSP] No se pudieron borrar presencias vencidas.", e);
    }
  }

  async function contarPresenciasActivasControlMoviles() {
    const guardia = obtenerGuardiaControlMovil();
    try {
      const data = await fetchSupabaseTabla(CONTROL_MOVILES_PRESENCE_TABLE, {
        params: {
          select: "session_id",
          guardia_fecha: `eq.${guardia.guardia_fecha}`,
          expires_at: `gt.${ahoraISOControlMoviles()}`,
        },
        extraHeaders: { Accept: "application/json" },
      });
      return Array.isArray(data) ? data.length : 0;
    } catch (e) {
      console.warn("[WSP] No se pudieron contar presencias activas.", e);
      return 1;
    }
  }

  async function borrarTodosLosBloqueosGuardiaControlMoviles() {
    const guardia = obtenerGuardiaControlMovil();
    try {
      await fetchSupabaseTabla(CONTROL_MOVILES_LOCKS_TABLE, {
        method: "DELETE",
        params: { guardia_fecha: `eq.${guardia.guardia_fecha}` },
        extraHeaders: { Prefer: "return=minimal" },
      });
      controlMovilesLocks = new Map();
      renderControlMovilesChips();
    } catch (e) {
      console.warn("[WSP] No se pudieron limpiar los bloqueos de la guardia.", e);
    }
  }

  async function limpiarSesionVencidaControlMoviles() {
    await borrarPresenciasVencidasControlMoviles();
    await borrarBloqueosVencidosControlMoviles();
    const activas = await contarPresenciasActivasControlMoviles();
    if (activas <= 0) await borrarTodosLosBloqueosGuardiaControlMoviles();
  }

  async function registrarPresenciaControlMoviles() {
    const guardia = obtenerGuardiaControlMovil();
    const now = ahoraISOControlMoviles();
    const payload = {
      owner_id: CONTROL_MOVILES_OWNER_ID,
      session_id: CONTROL_MOVILES_SESSION_ID,
      guardia_fecha: guardia.guardia_fecha,
      entered_at: now,
      heartbeat_at: now,
      expires_at: ahoraISOControlMoviles(CONTROL_MOVILES_PRESENCE_TTL_MS),
    };

    await fetchSupabaseTabla(CONTROL_MOVILES_PRESENCE_TABLE, {
      method: "POST",
      params: { on_conflict: "session_id" },
      body: payload,
      extraHeaders: {
        Prefer: "resolution=merge-duplicates,return=minimal",
      },
    });
  }


  function obtenerDeviceIdControlMoviles() {
    const key = "wsp_control_moviles_device_id";
    try {
      const actual = window.localStorage?.getItem(key);
      if (actual) return actual;
      const nuevo = crearIdControlMoviles("device");
      window.localStorage?.setItem(key, nuevo);
      return nuevo;
    } catch {
      return crearIdControlMoviles("device");
    }
  }

  const CONTROL_MOVILES_DEVICE_ID = obtenerDeviceIdControlMoviles();

  function detectarSistemaOperativoControlMoviles(userAgent, platform) {
    const ua = String(userAgent || "").toLowerCase();
    const pf = String(platform || "").toLowerCase();
    if (/android/.test(ua)) return "Android";
    if (/iphone|ipad|ipod/.test(ua) || /ios/.test(pf)) return "iOS";
    if (/windows nt/.test(ua) || /win/.test(pf)) return "Windows";
    if (/mac os x|macintosh/.test(ua) || /mac/.test(pf)) return "macOS";
    if (/linux/.test(ua) || /linux/.test(pf)) return "Linux";
    return "Desconocido";
  }

  function detectarNavegadorControlMoviles(userAgent) {
    const ua = String(userAgent || "");
    if (/Edg\//.test(ua)) return "Edge";
    if (/OPR\//.test(ua) || /Opera/.test(ua)) return "Opera";
    if (/Chrome\//.test(ua) && !/Chromium/.test(ua)) return "Chrome/WebView";
    if (/Firefox\//.test(ua)) return "Firefox";
    if (/Safari\//.test(ua) && !/Chrome\//.test(ua)) return "Safari";
    return "Desconocido";
  }

  function detectarModeloDispositivoControlMoviles(userAgent) {
    const ua = String(userAgent || "");
    const android = ua.match(/Android[^;)]*;\s*([^;)]+)\s+Build\//i);
    if (android?.[1]) return limpiarTextoSimple(android[1]);
    const iphone = ua.match(/\b(iPhone|iPad|iPod)\b/i);
    if (iphone?.[1]) return iphone[1];
    return "";
  }

  function construirInfoDispositivoControlMoviles() {
    const nav = window.navigator || {};
    const screenObj = window.screen || {};
    const userAgent = String(nav.userAgent || "");
    const platform = String(nav.platform || "");
    const connection = nav.connection || nav.mozConnection || nav.webkitConnection || null;
    let timezone = "";
    try { timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || ""; } catch {}

    return {
      device_id: CONTROL_MOVILES_DEVICE_ID,
      owner_id: CONTROL_MOVILES_OWNER_ID,
      session_id: CONTROL_MOVILES_SESSION_ID,
      user_agent: userAgent,
      platform,
      os_detectado: detectarSistemaOperativoControlMoviles(userAgent, platform),
      browser_detectado: detectarNavegadorControlMoviles(userAgent),
      device_model_detectado: detectarModeloDispositivoControlMoviles(userAgent),
      screen_width: Number(screenObj.width || 0) || null,
      screen_height: Number(screenObj.height || 0) || null,
      pixel_ratio: Number(window.devicePixelRatio || 1) || null,
      language: String(nav.language || ""),
      timezone,
      hardware_concurrency: Number(nav.hardwareConcurrency || 0) || null,
      device_memory: Number(nav.deviceMemory || 0) || null,
      connection_type: connection ? limpiarTextoSimple(connection.effectiveType || connection.type || "") : "",
    };
  }

  async function registrarDispositivoControlMoviles() {
    const info = construirInfoDispositivoControlMoviles();
    const now = ahoraISOControlMoviles();
    const payload = {
      device_id: info.device_id,
      owner_id: info.owner_id,
      ultimo_session_id: info.session_id,
      user_agent: info.user_agent,
      platform: info.platform,
      os_detectado: info.os_detectado,
      browser_detectado: info.browser_detectado,
      device_model_detectado: info.device_model_detectado,
      screen_width: info.screen_width,
      screen_height: info.screen_height,
      pixel_ratio: info.pixel_ratio,
      language: info.language,
      timezone: info.timezone,
      hardware_concurrency: info.hardware_concurrency,
      device_memory: info.device_memory,
      connection_type: info.connection_type,
      last_seen_at: now,
      activo: true,
    };

    try {
      await fetchSupabaseTabla(CONTROL_MOVILES_DISPOSITIVOS_TABLE, {
        method: "POST",
        params: { on_conflict: "device_id" },
        body: payload,
        extraHeaders: { Prefer: "resolution=merge-duplicates,return=minimal" },
      });
    } catch (e) {
      console.warn("[WSP] No se pudo registrar el dispositivo de control. El control continúa igual.", e);
    }

    return info;
  }

  function colorMarcaRecursosDesdeCantidad(cantidad) {
    const n = Math.max(1, parseInt(cantidad, 10) || 1);
    if (n >= 3) return "NEGRA";
    if (n === 2) return "AZUL";
    return "DORADA";
  }

  async function leerEstadoControlRecursosVigente(numero, guardiaFecha) {
    const numeroNormalizado = normalizarNumeroMovilControl(numero);
    if (!numeroNormalizado || !guardiaFecha) return null;

    try {
      const data = await fetchSupabaseTabla(CONTROL_MOVILES_ESTADO_RECURSOS_TABLE, {
        params: {
          select: "id,numero_movil,guardia_fecha,controlado,controlado_at,expires_at,cantidad_controles_ventana,color_marca,ultimo_device_id,ultimo_session_id,ultimo_device_label,fuente,updated_at,created_at",
          guardia_fecha: `eq.${guardiaFecha}`,
          numero_movil: `eq.${numeroNormalizado}`,
          limit: "1",
        },
        extraHeaders: { Accept: "application/json" },
      });
      const row = Array.isArray(data) ? data[0] : null;
      if (!row) return null;
      const expires = row.expires_at ? new Date(row.expires_at) : null;
      if (expires && !Number.isNaN(expires.getTime()) && expires.getTime() <= Date.now()) return null;
      return row;
    } catch (e) {
      console.warn("[WSP] No se pudo leer estado vigente para Recursos.", e);
      return null;
    }
  }

  async function registrarControlWspParaRecursos({ numero, guardia, controladoAt } = {}) {
    const numeroNormalizado = normalizarNumeroMovilControl(numero);
    if (!numeroNormalizado || !guardia?.guardia_fecha) return false;

    const dispositivo = await registrarDispositivoControlMoviles();
    const ahora = controladoAt ? new Date(controladoAt) : new Date();
    const controladoAtIso = Number.isNaN(ahora.getTime()) ? ahoraISOControlMoviles() : ahora.toISOString();
    const expiresAtIso = new Date(Date.now() + CONTROL_MOVILES_LOCK_TTL_MS).toISOString();
    const existente = await leerEstadoControlRecursosVigente(numeroNormalizado, guardia.guardia_fecha);
    const cantidadAnterior = existente ? (parseInt(existente.cantidad_controles_ventana, 10) || 1) : 0;
    const cantidad = cantidadAnterior > 0 ? cantidadAnterior + 1 : 1;
    const colorMarca = colorMarcaRecursosDesdeCantidad(cantidad);

    const deviceResumen = {
      device_id: dispositivo.device_id,
      owner_id: dispositivo.owner_id,
      session_id: dispositivo.session_id,
      os_detectado: dispositivo.os_detectado,
      browser_detectado: dispositivo.browser_detectado,
      device_model_detectado: dispositivo.device_model_detectado,
      screen_width: dispositivo.screen_width,
      screen_height: dispositivo.screen_height,
      pixel_ratio: dispositivo.pixel_ratio,
      language: dispositivo.language,
      timezone: dispositivo.timezone,
    };

    const payload = {
      guardia_fecha: guardia.guardia_fecha,
      numero_movil: Number(numeroNormalizado),
      controlado: true,
      controlado_at: controladoAtIso,
      expires_at: expiresAtIso,
      cantidad_controles_ventana: cantidad,
      color_marca: colorMarca,
      ultimo_device_id: dispositivo.device_id,
      ultimo_session_id: CONTROL_MOVILES_SESSION_ID,
      ultimo_owner_id: CONTROL_MOVILES_OWNER_ID,
      ultimo_device_info: deviceResumen,
      fuente: "WSP",
      updated_at: controladoAtIso,
    };

    try {
      await fetchSupabaseTabla(CONTROL_MOVILES_ESTADO_RECURSOS_TABLE, {
        method: "POST",
        params: { on_conflict: "guardia_fecha,numero_movil" },
        body: payload,
        extraHeaders: {
          Prefer: "resolution=merge-duplicates,return=representation",
          Accept: "application/json",
        },
      });
      console.log("[WSP] Estado Recursos actualizado para ©:", numeroNormalizado, colorMarca, cantidad);
      return true;
    } catch (e) {
      console.error("[WSP] No se pudo actualizar la marca de Recursos para el control WSP.", e);
      alert("El control se guardó, pero no se pudo actualizar la marca © en Recursos. Revisá la tabla recursos_controles_wsp_estado y sus permisos/realtime.");
      return false;
    }
  }

  async function guardarBloqueoControlMovil(numero) {
    const numeroNormalizado = normalizarNumeroMovilControl(numero);
    if (!numeroNormalizado) return;

    const guardia = obtenerGuardiaControlMovil();
    const now = ahoraISOControlMoviles();
    const payload = {
      numero_movil: numeroNormalizado,
      guardia_fecha: guardia.guardia_fecha,
      owner_id: CONTROL_MOVILES_OWNER_ID,
      session_id: CONTROL_MOVILES_SESSION_ID,
      locked_at: now,
      updated_at: now,
      expires_at: ahoraISOControlMoviles(CONTROL_MOVILES_LOCK_TTL_MS),
    };

    await fetchSupabaseTabla(CONTROL_MOVILES_LOCKS_TABLE, {
      method: "POST",
      params: { on_conflict: "guardia_fecha,numero_movil" },
      body: payload,
      extraHeaders: {
        Prefer: "resolution=merge-duplicates,return=representation",
        Accept: "application/json",
      },
    });

    const lock = normalizarLockControlMovil(payload);
    if (lock) controlMovilesLocks.set(lock.numero, lock);
    renderControlMovilesChips();
  }

  async function borrarPresenciaPropiaControlMoviles() {
    try {
      await fetchSupabaseTabla(CONTROL_MOVILES_PRESENCE_TABLE, {
        method: "DELETE",
        params: { session_id: `eq.${CONTROL_MOVILES_SESSION_ID}` },
        extraHeaders: { Prefer: "return=minimal" },
      });
    } catch (e) {
      console.warn("[WSP] No se pudo quitar la presencia propia de control de móviles.", e);
    }
  }

  function borrarPresenciaPropiaControlMovilesKeepAlive() {
    try {
      const url = `${SUPABASE_URL}/rest/v1/${CONTROL_MOVILES_PRESENCE_TABLE}?session_id=eq.${encodeURIComponent(CONTROL_MOVILES_SESSION_ID)}`;
      fetch(url, {
        method: "DELETE",
        headers: headersSupabase({ Prefer: "return=minimal" }),
        keepalive: true,
      });
    } catch {}
  }

  function obtenerClienteRealtimeControlMoviles() {
    if (controlMovilesRealtimeClient) return controlMovilesRealtimeClient;
    try {
      if (!window.supabase || typeof window.supabase.createClient !== "function") return null;
      controlMovilesRealtimeClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: { persistSession: false, autoRefreshToken: false },
      });
      return controlMovilesRealtimeClient;
    } catch (e) {
      console.warn("[WSP] Supabase Realtime no disponible. Se usa polling como respaldo.", e);
      return null;
    }
  }

  function iniciarRealtimeControlMoviles() {
    const client = obtenerClienteRealtimeControlMoviles();
    if (!client || typeof client.channel !== "function") return false;

    detenerRealtimeControlMoviles();

    const guardia = obtenerGuardiaControlMovil();

    const refrescarPorRealtime = (origen) => {
      if (controlMovilesRealtimeRefreshTimer) clearTimeout(controlMovilesRealtimeRefreshTimer);
      controlMovilesRealtimeRefreshTimer = setTimeout(async () => {
        if (!esControlMovilesActivo()) return;
        try {
          await cargarBloqueosControlMoviles();
          await cargarMovilesControlDesdeSupabase({ forzar: true });
          await refrescarMovilSeleccionadoDesdeSupabase({ respetarEdicion: true });
          console.log(`[WSP] Control móviles sincronizado por realtime: ${origen}`);
        } catch (e) {
          console.warn(`[WSP] No se pudo sincronizar por realtime: ${origen}`, e);
        }
      }, 350);
    };

    controlMovilesRealtimeChannel = client
      .channel(`wsp-control-moviles-${guardia.guardia_fecha}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: CONTROL_MOVILES_LOCKS_TABLE,
          filter: `guardia_fecha=eq.${guardia.guardia_fecha}`,
        },
        () => refrescarPorRealtime(CONTROL_MOVILES_LOCKS_TABLE)
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: CONTROL_MOVILES_MOVILES_TABLE,
        },
        () => refrescarPorRealtime(CONTROL_MOVILES_MOVILES_TABLE)
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: CONTROL_MOVILES_TABLE,
          filter: `guardia_fecha=eq.${guardia.guardia_fecha}`,
        },
        () => refrescarPorRealtime(CONTROL_MOVILES_TABLE)
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") console.log("[WSP] Realtime control de móviles activo.");
        if (status === "CHANNEL_ERROR" || status === "TIMED_OUT" || status === "CLOSED") {
          console.warn("[WSP] Realtime control de móviles no está entregando eventos. Queda activo el polling corto:", status);
        }
      });

    return true;
  }

  function detenerRealtimeControlMoviles() {
    if (controlMovilesRealtimeRefreshTimer) {
      clearTimeout(controlMovilesRealtimeRefreshTimer);
      controlMovilesRealtimeRefreshTimer = null;
    }
    if (!controlMovilesRealtimeChannel || !controlMovilesRealtimeClient) return;
    try {
      controlMovilesRealtimeClient.removeChannel(controlMovilesRealtimeChannel);
    } catch (e) {
      console.warn("[WSP] No se pudo detener canal Realtime de control de móviles.", e);
    }
    controlMovilesRealtimeChannel = null;
  }

  function iniciarTimersControlMoviles() {
    detenerTimersControlMoviles();

    controlMovilesHeartbeatTimer = setInterval(async () => {
      if (!esControlMovilesActivo()) return;
      try {
        await registrarPresenciaControlMoviles();
        await limpiarSesionVencidaControlMoviles();
        await cargarBloqueosControlMoviles();
      } catch (e) {
        console.warn("[WSP] Heartbeat de control de móviles falló.", e);
      }
    }, CONTROL_MOVILES_HEARTBEAT_MS);

    controlMovilesPollingTimer = setInterval(async () => {
      if (!esControlMovilesActivo()) return;
      await cargarBloqueosControlMoviles();
      await cargarMovilesControlDesdeSupabase({ forzar: true });
      await refrescarMovilSeleccionadoDesdeSupabase({ respetarEdicion: true });
    }, CONTROL_MOVILES_POLLING_MS);
  }

  function detenerTimersControlMoviles() {
    if (controlMovilesHeartbeatTimer) {
      clearInterval(controlMovilesHeartbeatTimer);
      controlMovilesHeartbeatTimer = null;
    }
    if (controlMovilesPollingTimer) {
      clearInterval(controlMovilesPollingTimer);
      controlMovilesPollingTimer = null;
    }
  }

  async function iniciarModoControlMovilesCompartido() {
    if (controlMovilesSincronizando) return;
    controlMovilesSincronizando = true;

    try {
      await limpiarSesionVencidaControlMoviles();
      await registrarPresenciaControlMoviles();
      await cargarBloqueosControlMoviles();
      iniciarRealtimeControlMoviles();
      iniciarTimersControlMoviles();
      controlMovilesCargados = false;
      await cargarMovilesControlDesdeSupabase({ forzar: true });
    } catch (e) {
      console.warn("[WSP] No se pudo iniciar sincronización compartida de control de móviles.", e);
      iniciarTimersControlMoviles();
      controlMovilesCargados = false;
      await cargarMovilesControlDesdeSupabase({ forzar: true });
    } finally {
      controlMovilesSincronizando = false;
    }
  }

  async function detenerModoControlMovilesCompartido({ limpiarRemoto = true } = {}) {
    detenerTimersControlMoviles();
    detenerRealtimeControlMoviles();

    if (limpiarRemoto) {
      await borrarPresenciaPropiaControlMoviles();
      await borrarPresenciasVencidasControlMoviles();
      const activas = await contarPresenciasActivasControlMoviles();
      if (activas <= 0) await borrarTodosLosBloqueosGuardiaControlMoviles();
    }

    controlMovilesLocks = new Map();
    renderControlMovilesChips();
  }

  function verificarSeleccionBloqueadaPorOtroControlMovil() {
    if (!controlMovilSeleccionado?.numero) return;
    const lock = obtenerLockControlMovil(controlMovilSeleccionado.numero);
    if (lock && !lockControlMovilEsPropio(lock)) {
      alert(`El móvil ${controlMovilSeleccionado.numero} ya fue controlado desde otra app y quedó bloqueado.`);
      volverASeleccionMovilControl();
      setTextoEstadoControlMoviles("Móvil bloqueado por otra app. Seleccione otro móvil o presione Salir.");
    }
  }

  function actualizarBotonSalirControlMoviles() {
    if (!btnEnviar) return;

    const enControlMoviles = esControlMovilesActivo();
    const hayMovilSeleccionado = !!controlMovilSeleccionado;

    if (!enControlMoviles) {
      document.body.classList.remove("modo-control-moviles", "control-movil-seleccionado-activo");
      btnEnviar.classList.remove("hidden");
      btnEnviar.style.display = "";
      btnEnviar.textContent = "Enviar por WhatsApp";
      return;
    }

    document.body.classList.add("modo-control-moviles");
    document.body.classList.toggle("control-movil-seleccionado-activo", hayMovilSeleccionado);

    if (hayMovilSeleccionado) {
      // Vista de formulario: solo debe quedar visible el botón rojo Guardar.
      btnEnviar.classList.add("hidden");
      btnEnviar.style.display = "none";
    } else {
      // Vista principal: se ven los chips y solo el botón azul Salir.
      btnEnviar.classList.remove("hidden");
      btnEnviar.style.display = "block";
      btnEnviar.textContent = "Salir";
    }
  }

  function normalizarCombustibleControlMovil(value) {
    const v = limpiarTextoSimple(value || "").toLowerCase();
    return CONTROL_MOVILES_COMBUSTIBLES.includes(v) ? v : "";
  }

  function normalizarTipoMovilControl(value) {
    const v = normalizarBasicoSinAcentos(value || "");
    if (v === "pick up" || v === "pickup") return "PICK UP";
    if (v === "furgon") return "FURGÓN";
    if (v === "sedan") return "SEDAN";
    if (v === "moto" || v === "motos") return "MOTO";
    return limpiarTextoSimple(value || "").toUpperCase();
  }

  function normalizarMovilControl(row) {
    const condicion = row?.condicion === true || String(row?.condicion).toLowerCase() === "true";
    const observaciones = limpiarTextoSimple(
      row?.observaciones_novedades ??
      row?.observaciones ??
      row?.novedad ??
      ""
    );

    return {
      id: row?.id || null,
      numero: limpiarTextoSimple(row?.numero || ""),
      tipo: normalizarTipoMovilControl(row?.tipo || row?.categoria || ""),
      modelo: limpiarTextoSimple(row?.modelo || ""),
      dominio: limpiarTextoSimple(row?.dominio || "").toUpperCase(),
      kilometraje: String(row?.kilometraje ?? "").replace(/\D+/g, ""),
      combustible: normalizarCombustibleControlMovil(row?.combustible),
      observaciones_novedades: observaciones,
      observaciones,
      condicion,
    };
  }

  function prioridadTipoControlMovil(movil) {
    const t = normalizarTipoMovilControl(movil?.tipo);
    if (t === "PICK UP") return 1;
    if (t === "FURGÓN") return 2;
    if (t === "SEDAN") return 3;
    if (t === "MOTO") return 4;
    return 9;
  }

  function prioridadNumeroPickUpControl(movil) {
    const n = limpiarTextoSimple(movil?.numero);
    const orden = ["12428", "10139"];
    const idx = orden.indexOf(n);
    return idx >= 0 ? idx : 99;
  }

  function prioridadModeloMotoControl(movil) {
    const m = normalizarBasicoSinAcentos(movil?.modelo || "");
    if (m.includes("250")) return 1;
    if (m.includes("300")) return 2;
    if (m.includes("650")) return 3;
    if (m.includes("400")) return 4;
    return 9;
  }

  function ordenarMovilesControl(a, b) {
    const ta = prioridadTipoControlMovil(a);
    const tb = prioridadTipoControlMovil(b);
    if (ta !== tb) return ta - tb;

    if (ta === 1) {
      const pa = prioridadNumeroPickUpControl(a);
      const pb = prioridadNumeroPickUpControl(b);
      if (pa !== pb) return pa - pb;
    }

    if (ta === 4) {
      const ma = prioridadModeloMotoControl(a);
      const mb = prioridadModeloMotoControl(b);
      if (ma !== mb) return ma - mb;
    }

    return String(a?.numero || "").localeCompare(String(b?.numero || ""), "es", { numeric: true });
  }

  async function cargarEstadoActualMovilControlDesdeSupabase(numero) {
    const numeroNormalizado = limpiarTextoSimple(numero || "").replace(/\D+/g, "");
    if (!numeroNormalizado) return null;

    const params = new URLSearchParams({
      select: "id,numero,tipo,modelo,dominio,kilometraje,combustible,observaciones_novedades,condicion,activo",
      numero: `eq.${numeroNormalizado}`,
      limit: "1",
    });

    const r = await fetch(`${SUPABASE_URL}/rest/v1/${CONTROL_MOVILES_MOVILES_TABLE}?${params.toString()}`, {
      headers: headersSupabase({ Accept: "application/json" }),
    });

    if (!r.ok) {
      const txt = await r.text().catch(() => "");
      throw new Error(`Supabase ${r.status}: ${txt}`);
    }

    const data = await r.json();
    const row = Array.isArray(data) ? data[0] : null;
    return row ? normalizarMovilControl(row) : null;
  }

  function actualizarMovilControlEnCache(movilActualizado) {
    if (!movilActualizado?.numero) return;

    const idx = controlMovilesCache.findIndex((m) => String(m.numero) === String(movilActualizado.numero));
    if (idx >= 0) {
      controlMovilesCache[idx] = { ...controlMovilesCache[idx], ...movilActualizado };
    }
  }

  function camposControlMovilEnEdicion() {
    const active = document.activeElement;
    return !!active && [
      controlMovilKilometraje,
      controlMovilCombustible,
      controlMovilObservaciones,
      controlMovilFueraServicio,
      controlMovilFoto1,
      controlMovilFoto2
    ].includes(active);
  }

  function aplicarMovilControlAlFormulario(movil) {
    if (!movil) return;
    controlMovilSeleccionado = movil;
    if (controlMovilNumeroSeleccionado) controlMovilNumeroSeleccionado.textContent = movil.numero || "---";
    if (controlMovilKilometraje) controlMovilKilometraje.value = movil.kilometraje || "";
    if (controlMovilCombustible) controlMovilCombustible.value = movil.combustible || "";
    if (controlMovilObservaciones) controlMovilObservaciones.value = movil.observaciones_novedades || movil.observaciones || "";
    if (controlMovilFueraServicio) {
      controlMovilFueraServicio.disabled = false;
      controlMovilFueraServicio.checked = !movil.condicion;
    }
  }

  async function refrescarMovilSeleccionadoDesdeSupabase({ respetarEdicion = true } = {}) {
    if (!controlMovilSeleccionado?.numero) return null;
    if (respetarEdicion && camposControlMovilEnEdicion()) return controlMovilSeleccionado;

    try {
      const movilActualizado = await cargarEstadoActualMovilControlDesdeSupabase(controlMovilSeleccionado.numero);
      if (!movilActualizado) return null;
      actualizarMovilControlEnCache(movilActualizado);
      const merged = { ...controlMovilSeleccionado, ...movilActualizado };
      aplicarMovilControlAlFormulario(merged);
      return merged;
    } catch (e) {
      console.warn("[WSP] No se pudo refrescar el móvil seleccionado desde Supabase.", e);
      return null;
    }
  }

  async function cargarMovilesControlDesdeSupabase({ forzar = false } = {}) {
    if (controlMovilesCargados && !forzar) return controlMovilesCache;

    setTextoEstadoControlMoviles("Cargando móviles en servicio...");

    const params = new URLSearchParams({
      select: "id,numero,tipo,modelo,dominio,kilometraje,combustible,observaciones_novedades,condicion,activo",
      activo: "eq.true",
      order: "numero.asc",
    });

    try {
      const r = await fetch(`${SUPABASE_URL}/rest/v1/${CONTROL_MOVILES_MOVILES_TABLE}?${params.toString()}`, {
        headers: headersSupabase({ Accept: "application/json" }),
      });

      if (!r.ok) {
        const txt = await r.text().catch(() => "");
        throw new Error(`Supabase ${r.status}: ${txt}`);
      }

      const data = await r.json();
      controlMovilesCache = (Array.isArray(data) ? data : [])
        .map(normalizarMovilControl)
        .filter((m) => m.numero)
        .sort(ordenarMovilesControl);

      controlMovilesCargados = true;

      if (controlMovilSeleccionado?.numero) {
        const actualizado = controlMovilesCache.find((m) => String(m.numero) === String(controlMovilSeleccionado.numero));
        if (actualizado) {
          controlMovilSeleccionado = { ...controlMovilSeleccionado, ...actualizado };
          if (!camposControlMovilEnEdicion()) aplicarMovilControlAlFormulario(controlMovilSeleccionado);
        }
      }

      renderControlMovilesChips();
      return controlMovilesCache;
    } catch (e) {
      console.warn("[WSP] No se pudieron cargar móviles en servicio.", e);
      controlMovilesCache = [];
      renderControlMovilesChips();
      setTextoEstadoControlMoviles("No se pudieron cargar móviles en servicio. Revisá Supabase.");
      return [];
    }
  }

  function renderControlMovilesChips() {
    if (!controlMovilesChips) return;

    controlMovilesChips.innerHTML = "";

    const visibles = movilesControlVisibles();

    if (!visibles.length) {
      setTextoEstadoControlMoviles("No hay móviles en servicio para controlar.");
      return;
    }

    setTextoEstadoControlMoviles("Seleccione un móvil en servicio.");

    // Cuadro superior: SOLO 12428, 10139 y 12502.
    const movilesBase = visibles
      .filter((movil) => CONTROL_MOVILES_BASE_NUMEROS.includes(limpiarTextoSimple(movil?.numero)))
      .sort((a, b) => CONTROL_MOVILES_BASE_NUMEROS.indexOf(limpiarTextoSimple(a?.numero)) - CONTROL_MOVILES_BASE_NUMEROS.indexOf(limpiarTextoSimple(b?.numero)));

    // Cuadro inferior: SOLO motos.
    const motos = visibles
      .filter((movil) => normalizarTipoMovilControl(movil?.tipo) === "MOTO")
      .sort(ordenarMovilesControl);

    const crearGrupo = (titulo, rows, tipoGrupo) => {
      if (!rows.length) return;

      const box = document.createElement("div");
      box.className = `control-moviles-grupo control-moviles-grupo-${tipoGrupo}`;

      const title = document.createElement("div");
      title.className = "control-moviles-grupo-titulo";
      title.textContent = titulo;
      box.appendChild(title);

      const grid = document.createElement("div");
      grid.className = "control-moviles-grupo-grid";

      rows.forEach((movil) => {
        const lock = obtenerLockControlMovil(movil.numero);
        const bloqueadoPorOtro = !!lock && !lockControlMovilEsPropio(lock);
        const controlado = !!lock;

        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "control-movil-chip";
        btn.dataset.numero = movil.numero;
        btn.disabled = bloqueadoPorOtro;

        if (controlado) btn.classList.add("control-movil-chip-controlado");
        if (bloqueadoPorOtro) btn.classList.add("control-movil-chip-bloqueado");
        if (!movil.condicion) btn.classList.add("control-movil-chip-fuera-servicio");

        const candado = bloqueadoPorOtro ? ' <span class="control-movil-candado" aria-hidden="true">🔒</span>' : "";

        if (tipoGrupo === "motos") {
          const cilindrada = cilindradaMotoControl(movil);
          btn.innerHTML = `${escapeHtmlControlMovil(movil.numero)}${cilindrada ? ` <small>${escapeHtmlControlMovil(cilindrada)}</small>` : ""}${candado}`;
        } else {
          btn.innerHTML = `${escapeHtmlControlMovil(movil.numero)}${candado}`;
        }

        if (bloqueadoPorOtro) {
          btn.title = "Ya fue controlado desde otra app. Queda bloqueado hasta que todas las apps salgan del modo control de móviles.";
        } else if (controlado) {
          btn.title = "Ya controlado desde esta app. Puede volver a editarlo.";
        } else {
          btn.title = "Seleccionar móvil";
        }

        btn.addEventListener("click", () => {
          if (bloqueadoPorOtro) return;
          seleccionarMovilControl(movil.numero);
        });
        grid.appendChild(btn);
      });

      box.appendChild(grid);
      controlMovilesChips.appendChild(box);
    };

    crearGrupo("Móviles", movilesBase, "base");
    crearGrupo("Motos", motos, "motos");
  }

  function cilindradaMotoControl(movil) {
    const modelo = normalizarBasicoSinAcentos(movil?.modelo || "");
    if (modelo.includes("250")) return "(250cc.)";
    if (modelo.includes("300")) return "(300cc.)";
    if (modelo.includes("650")) return "(650cc.)";
    if (modelo.includes("400")) return "(400cc.)";
    return "";
  }

  function escapeHtmlControlMovil(str) {
    return String(str || "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  async function seleccionarMovilControl(numero) {
    const lockInicial = obtenerLockControlMovil(numero);
    if (lockInicial && !lockControlMovilEsPropio(lockInicial)) {
      setTextoEstadoControlMoviles(`El móvil ${normalizarNumeroMovilControl(numero)} ya fue controlado desde otra app y está bloqueado.`);
      return;
    }

    let movil = controlMovilesCache.find((m) => String(m.numero) === String(numero));
    if (!movil) return;

    controlMovilSeleccionado = movil;
    document.body.classList.add("control-movil-seleccionado-activo");

    // Al seleccionar un móvil, se ocultan TODOS los chips para dejar la vista limpia.
    if (controlMovilesChips) {
      controlMovilesChips.classList.add("hidden");
      controlMovilesChips.style.display = "none";
    }

    if (controlMovilesFormulario) {
      controlMovilesFormulario.classList.remove("hidden");
      controlMovilesFormulario.style.display = "grid";
    }

    aplicarMovilControlAlFormulario(movil);

    limpiarFotosControlMovil();
    setTextoEstadoControlMoviles("Leyendo último estado del móvil desde Supabase...");
    actualizarBotonSalirControlMoviles();

    try {
      const movilActualizado = await cargarEstadoActualMovilControlDesdeSupabase(movil.numero);
      if (movilActualizado) {
        actualizarMovilControlEnCache(movilActualizado);
        movil = { ...movil, ...movilActualizado };
        controlMovilSeleccionado = movil;

        aplicarMovilControlAlFormulario(movil);
      }

      setTextoEstadoControlMoviles("Complete kilometraje, combustible, observaciones y fotos si corresponde.");
    } catch (e) {
      console.warn("[WSP] No se pudo leer el último estado del móvil seleccionado. Se usan los datos cargados al entrar al modo.", e);
      setTextoEstadoControlMoviles("No se pudo refrescar el último estado. Se usan los datos cargados al entrar al modo.");
    }
  }

  function volverASeleccionMovilControl() {
    controlMovilSeleccionado = null;
    document.body.classList.remove("control-movil-seleccionado-activo");

    if (controlMovilesFormulario) {
      controlMovilesFormulario.classList.add("hidden");
      controlMovilesFormulario.style.display = "none";
    }

    if (controlMovilesChips) {
      controlMovilesChips.classList.remove("hidden");
      controlMovilesChips.style.display = "grid";
    }

    if (controlMovilNumeroSeleccionado) controlMovilNumeroSeleccionado.textContent = "---";
    if (controlMovilKilometraje) controlMovilKilometraje.value = "";
    if (controlMovilCombustible) controlMovilCombustible.value = "";
    if (controlMovilObservaciones) controlMovilObservaciones.value = "";
    if (controlMovilFueraServicio) {
      controlMovilFueraServicio.checked = false;
      controlMovilFueraServicio.disabled = true;
    }
    limpiarFotosControlMovil();
    setTextoEstadoControlMoviles(movilesControlVisibles().length ? "Seleccione un móvil en servicio." : "No hay móviles en servicio para controlar.");
    actualizarBotonSalirControlMoviles();
  }

  function limpiarFotosControlMovil() {
    [controlMovilFoto1, controlMovilFoto2].forEach((input) => {
      if (input) input.value = "";
    });
    [controlMovilPreview1, controlMovilPreview2].forEach((img) => {
      if (!img) return;
      img.src = "";
      img.classList.add("hidden");
    });
  }

  function mostrarPreviewControlMovil(input, preview) {
    if (!input || !preview) return;
    const file = input.files?.[0];
    if (!file) {
      preview.src = "";
      preview.classList.add("hidden");
      return;
    }
    preview.src = URL.createObjectURL(file);
    preview.classList.remove("hidden");
  }

  function normalizarKilometrajeControlMovil(value) {
    return String(value || "").replace(/\D+/g, "");
  }

  function extensionArchivoControlMovil(file) {
    const name = String(file?.name || "");
    const m = name.match(/\.([a-z0-9]{2,5})$/i);
    if (m) return m[1].toLowerCase();
    const type = String(file?.type || "").toLowerCase();
    if (type.includes("png")) return "png";
    if (type.includes("webp")) return "webp";
    return "jpg";
  }

  function fechaHoraLocalISOControlMovil(d) {
    if (!(d instanceof Date) || Number.isNaN(d.getTime())) return "";
    return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}T${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}`;
  }

  function obtenerGuardiaControlMovil() {
    const desde = getGuardiaInicio();
    const hasta = new Date(desde);
    hasta.setDate(hasta.getDate() + 1);

    return {
      guardia_fecha: toFechaISO(desde),
      guardia_inicio: fechaHoraLocalISOControlMovil(desde),
      guardia_fin: fechaHoraLocalISOControlMovil(hasta),
    };
  }

  async function cargarImagenParaCanvas(file) {
    if (!file) return null;

    if (typeof createImageBitmap === "function") {
      try {
        return await createImageBitmap(file, { imageOrientation: "from-image" });
      } catch (e) {
        try {
          return await createImageBitmap(file);
        } catch {}
      }
    }

    return await new Promise((resolve, reject) => {
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(objectUrl);
        resolve(img);
      };
      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error("No se pudo leer la imagen."));
      };
      img.src = objectUrl;
    });
  }

  async function normalizarImagenControlMovil(file) {
    if (!file || !String(file.type || "").toLowerCase().startsWith("image/")) return file;

    try {
      const imagen = await cargarImagenParaCanvas(file);
      if (!imagen) return file;

      const anchoOriginal = imagen.width || imagen.naturalWidth || 0;
      const altoOriginal = imagen.height || imagen.naturalHeight || 0;
      if (!anchoOriginal || !altoOriginal) return file;

      const maxLado = 1800;
      const escala = Math.min(1, maxLado / Math.max(anchoOriginal, altoOriginal));
      const ancho = Math.max(1, Math.round(anchoOriginal * escala));
      const alto = Math.max(1, Math.round(altoOriginal * escala));

      const canvas = document.createElement("canvas");
      canvas.width = ancho;
      canvas.height = alto;

      const ctx = canvas.getContext("2d");
      if (!ctx) return file;
      ctx.drawImage(imagen, 0, 0, ancho, alto);

      if (typeof imagen.close === "function") {
        try { imagen.close(); } catch {}
      }

      const blob = await new Promise((resolve) => {
        canvas.toBlob(resolve, "image/jpeg", 0.88);
      });

      if (!blob) return file;

      const nombreBase = String(file.name || "foto-control.jpg").replace(/\.[a-z0-9]{2,5}$/i, "");
      return new File([blob], `${nombreBase}.jpg`, { type: "image/jpeg" });
    } catch (e) {
      console.warn("[WSP] No se pudo normalizar la orientación de la foto. Se sube el archivo original.", e);
      return file;
    }
  }

  async function subirFotoControlMovil(file, numero, slot) {
    if (!file) return null;

    const archivoSubida = await normalizarImagenControlMovil(file);
    const safeNumero = String(numero || "movil").replace(/[^0-9a-z_-]+/gi, "");
    const guardia = obtenerGuardiaControlMovil();
    const path = `${guardia.guardia_fecha}/${safeNumero}/${Date.now()}_${slot}.jpg`;
    const url = `${SUPABASE_URL}/storage/v1/object/${CONTROL_MOVILES_BUCKET}/${path}`;

    const r = await fetch(url, {
      method: "POST",
      headers: headersSupabase({
        "Content-Type": archivoSubida.type || "image/jpeg",
        "x-upsert": "false",
      }),
      body: archivoSubida,
    });

    if (!r.ok) {
      const txt = await r.text().catch(() => "");
      throw new Error(`No se pudo subir foto ${slot}: ${r.status} ${txt}`);
    }

    return {
      url: `${SUPABASE_URL}/storage/v1/object/public/${CONTROL_MOVILES_BUCKET}/${path}`,
      path,
      slot,
    };
  }

  
  async function insertarRegistroControlMovil(payload) {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/${CONTROL_MOVILES_TABLE}`, {
      method: "POST",
      headers: headersSupabase({
        "Content-Type": "application/json",
        Prefer: "return=representation",
        Accept: "application/json",
      }),
      body: JSON.stringify(payload),
    });

    if (!r.ok) {
      const txt = await r.text().catch(() => "");
      throw new Error(`No se pudo insertar control: ${r.status} ${txt}`);
    }

    return r.json().catch(() => null);
  }

  function normalizarControlMovilInsertado(resp) {
    if (Array.isArray(resp)) return resp[0] || null;
    return resp || null;
  }

  async function insertarFotosGuardiaControlMovil({ control, fotos, numero, movilId, observaciones, guardia }) {
    const fotosValidas = (Array.isArray(fotos) ? fotos : []).filter((foto) => foto && foto.url);
    if (!fotosValidas.length) return true;

    const controlId = control?.id ? String(control.id) : null;
    const payload = fotosValidas.map((foto) => ({
      control_id: controlId,
      movil_id: movilId == null ? null : String(movilId),
      numero_movil: Number(numero),
      guardia_fecha: guardia.guardia_fecha,
      guardia_inicio: guardia.guardia_inicio,
      guardia_fin: guardia.guardia_fin,
      foto_url: foto.url,
      foto_path: foto.path || null,
      slot: foto.slot || null,
      fuente: "WSP",
      observaciones: observaciones || "",
    }));

    const r = await fetch(`${SUPABASE_URL}/rest/v1/${CONTROL_MOVILES_FOTOS_TABLE}`, {
      method: "POST",
      headers: headersSupabase({
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      }),
      body: JSON.stringify(payload),
    });

    if (!r.ok) {
      const txt = await r.text().catch(() => "");
      throw new Error(`No se pudo insertar foto/s de guardia: ${r.status} ${txt}`);
    }

    return true;
  }

  async function actualizarEstadoActualMovilControl(numero, kilometraje, combustible, observaciones, fueraServicio = false) {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/${CONTROL_MOVILES_MOVILES_TABLE}?numero=eq.${encodeURIComponent(Number(numero))}`, {
      method: "PATCH",
      headers: headersSupabase({
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      }),
      body: JSON.stringify({
        kilometraje: Number(kilometraje),
        combustible,
        observaciones_novedades: observaciones,
        condicion: !fueraServicio,
      }),
    });

    if (!r.ok) {
      const txt = await r.text().catch(() => "");
      throw new Error(`No se pudo actualizar móvil: ${r.status} ${txt}`);
    }
  }

  async function guardarControlMovil() {
    if (!controlMovilSeleccionado) {
      alert("Seleccione un móvil en servicio.");
      return;
    }

    const kilometraje = normalizarKilometrajeControlMovil(controlMovilKilometraje?.value || "");
    const combustible = normalizarCombustibleControlMovil(controlMovilCombustible?.value || "");
    const observaciones = limpiarTextoSimple(controlMovilObservaciones?.value || "");
    const fueraServicio = !!controlMovilFueraServicio?.checked;

    if (!kilometraje) {
      alert("Complete el kilometraje. Solo se aceptan números.");
      controlMovilKilometraje?.focus();
      return;
    }

    if (!CONTROL_MOVILES_COMBUSTIBLES.includes(combustible)) {
      alert("Seleccione un combustible válido.");
      controlMovilCombustible?.focus();
      return;
    }

    try {
      if (btnCambiarMovilControl) {
        btnCambiarMovilControl.disabled = true;
        btnCambiarMovilControl.textContent = "Guardando...";
      }

      const guardiaControl = obtenerGuardiaControlMovil();
      const foto1 = await subirFotoControlMovil(controlMovilFoto1?.files?.[0] || null, controlMovilSeleccionado.numero, "foto1");
      const foto2 = await subirFotoControlMovil(controlMovilFoto2?.files?.[0] || null, controlMovilSeleccionado.numero, "foto2");

      const controlInsertadoResp = await insertarRegistroControlMovil({
        movil_id: controlMovilSeleccionado.id,
        numero_movil: Number(controlMovilSeleccionado.numero),
        kilometraje: Number(kilometraje),
        combustible,
        observaciones,
        guardia_fecha: guardiaControl.guardia_fecha,
        guardia_inicio: guardiaControl.guardia_inicio,
        guardia_fin: guardiaControl.guardia_fin,
        fuente: "WSP",
      });

      const controlInsertado = normalizarControlMovilInsertado(controlInsertadoResp);

      await insertarFotosGuardiaControlMovil({
        control: controlInsertado,
        fotos: [foto1, foto2],
        numero: controlMovilSeleccionado.numero,
        movilId: controlMovilSeleccionado.id,
        observaciones,
        guardia: guardiaControl,
      });

      await actualizarEstadoActualMovilControl(controlMovilSeleccionado.numero, kilometraje, combustible, observaciones, fueraServicio);
      await registrarControlWspParaRecursos({
        numero: controlMovilSeleccionado.numero,
        guardia: guardiaControl,
        controladoAt: new Date().toISOString(),
      });

      actualizarMovilControlEnCache({
        ...controlMovilSeleccionado,
        kilometraje: String(kilometraje),
        combustible,
        observaciones_novedades: observaciones,
        observaciones,
        condicion: !fueraServicio,
      });

      try {
        await guardarBloqueoControlMovil(controlMovilSeleccionado.numero);
      } catch (e) {
        console.warn("[WSP] Control guardado, pero no se pudo activar el bloqueo compartido del móvil.", e);
        alert("El control se guardó, pero no se pudo marcar/bloquear este móvil en las otras apps. Revisá la tabla realtime de Supabase.");
      }

      controlMovilesCargados = false;
      await cargarMovilesControlDesdeSupabase({ forzar: true });
      volverASeleccionMovilControl();
      setTextoEstadoControlMoviles("Control guardado. Seleccione otro móvil o presione Salir.");
    } catch (e) {
      console.error("[WSP] Error guardando control de móvil", e);
      alert("No se pudo guardar el control de móvil. Revisá tabla, bucket Storage y permisos de Supabase.");
    } finally {
      if (btnCambiarMovilControl) {
        btnCambiarMovilControl.disabled = false;
        btnCambiarMovilControl.textContent = "Guardar";
      }
      actualizarBotonSalirControlMoviles();
    }
  }

  function setUIControlMovilesActiva(activa) {
    if (bloqueControlMoviles) bloqueControlMoviles.classList.toggle("hidden", !activa);
    document.body.classList.toggle("modo-control-moviles", !!activa);
    if (!activa) cerrarAyudaControlMoviles();

    if (activa) {
      setUIControlSuperiorActiva(false);
      setControlSuperiorVisible(false);
      setPersonalVisible(false);
      setMovilidadVisible(false);
      setElementosVisibles(false);
      setObservacionesVisible(false);
      if (divFinaliza) divFinaliza.classList.add("hidden");
      if (divDetalles) divDetalles.classList.add("hidden");
      if (divMismosElementos) divMismosElementos.classList.add("hidden");
      if (bloquePresenciaActiva) bloquePresenciaActiva.classList.add("hidden");
      if (chkPresenciaActiva) chkPresenciaActiva.checked = false;
      limpiarSeleccionOperativo();

      // Pantalla principal del control: chips visibles, formulario oculto, botón azul Salir visible.
      controlMovilSeleccionado = null;
      document.body.classList.remove("control-movil-seleccionado-activo");
      if (controlMovilesFormulario) {
        controlMovilesFormulario.classList.add("hidden");
        controlMovilesFormulario.style.display = "none";
      }
      if (controlMovilesChips) {
        controlMovilesChips.classList.remove("hidden");
        controlMovilesChips.style.display = "grid";
      }

      iniciarModoControlMovilesCompartido();
      actualizarBotonSalirControlMoviles();
    } else {
      detenerModoControlMovilesCompartido({ limpiarRemoto: true });
      document.body.classList.remove("modo-control-moviles", "control-movil-seleccionado-activo");
      if (btnEnviar) {
        btnEnviar.classList.remove("hidden");
        btnEnviar.style.display = "";
        btnEnviar.textContent = "Enviar por WhatsApp";
      }
      volverASeleccionMovilControl();
    }
  }

  async function salirControlMoviles() {
    try {
      if (btnEnviar) {
        btnEnviar.disabled = true;
        btnEnviar.textContent = "Saliendo...";
      }
      await detenerModoControlMovilesCompartido({ limpiarRemoto: true });
    } catch (e) {
      console.warn("[WSP] No se pudo cerrar limpiamente el modo control de móviles.", e);
    } finally {
      if (btnEnviar) btnEnviar.disabled = false;
    }

    try {
      window.close();
    } catch (e) {}

    setTimeout(() => {
      if (window.closed) return;
      if (selTipo) selTipo.value = "INICIA";
      actualizarTipo();
    }, 120);
  }

  function bindControlMovilesEventos() {
    if (controlMovilKilometraje) {
      controlMovilKilometraje.addEventListener("input", () => {
        controlMovilKilometraje.value = normalizarKilometrajeControlMovil(controlMovilKilometraje.value);
      });
    }

    if (controlMovilFoto1) {
      controlMovilFoto1.addEventListener("change", () => mostrarPreviewControlMovil(controlMovilFoto1, controlMovilPreview1));
    }

    if (controlMovilFoto2) {
      controlMovilFoto2.addEventListener("change", () => mostrarPreviewControlMovil(controlMovilFoto2, controlMovilPreview2));
    }

    if (btnCambiarMovilControl) {
      btnCambiarMovilControl.addEventListener("click", guardarControlMovil);
    }
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
    const controlMoviles = esControlMovilesActivo();
    const controlSuperior = esControlSuperiorActivo();
    const fin = selTipo.value === "FINALIZA";

    if (chkPresenciaActiva) {
      chkPresenciaActiva.checked = false;
    }

    if (controlMoviles) {
      setUIControlMovilesActiva(true);
      sincronizarUIAlcoholimetro();
      sincronizarUIQrzDominio();
      return;
    }

    setUIControlMovilesActiva(false);

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
    if (esControlSuperiorActivo()) {
      if (bloquePresenciaActiva) bloquePresenciaActiva.classList.add("hidden");
      if (chkPresenciaActiva) chkPresenciaActiva.checked = false;
      return;
    }

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

  function esReferenciaDecreto460(txt) {
    const fuente = normalizarBasicoSinAcentos(txt);
    return /\b(?:decreto|dto\.?|dec\.?)\s*(?:n[°º]?\s*)?460(?:\s*\/\s*22|22)?\b/.test(fuente) ||
      /\b460\s*\/\s*22\b/.test(fuente) ||
      /\b46022\b/.test(fuente) ||
      /^460$/.test(fuente) ||
      /^460\b/.test(fuente);
  }

  function construirObservacionDecreto460(cantidad) {
    return "Se Realizo (" + formatearCantidad(cantidad || 1) + ") Procedimiento Policial por Dcto. 460/22.";
  }

  function normalizarDetalleDecreto460(linea, { paraAutocompletar = false } = {}) {
    let s = String(linea || "").replace(/\r/g, "").trim();
    if (!s) return null;

    s = s.replace(/\s+/g, " ").trim();

    let cantidad = null;
    let cuerpo = s;

    const patronesCantidadInicial = [
      /^\(\s*(\d{1,2})\s*\)\s*(.*)$/i,
      /^(\d{1,2})\s*[-–—]\s*(.*)$/i,
      /^(\d{1,2})\s+(.*)$/i,
    ];

    for (const regex of patronesCantidadInicial) {
      const m = cuerpo.match(regex);
      if (!m) continue;

      const posibleCuerpo = limpiarDescripcionDetalle(m[2]);
      if (!esReferenciaDecreto460(posibleCuerpo)) continue;

      cantidad = m[1];
      cuerpo = posibleCuerpo;
      break;
    }

    if (cantidad === null) {
      const mFinal = cuerpo.match(/^(.*?)\s*\(\s*(\d{1,2})\s*\)\s*$/i);
      if (mFinal && esReferenciaDecreto460(mFinal[1])) {
        cuerpo = limpiarDescripcionDetalle(mFinal[1]);
        cantidad = mFinal[2];
      }
    }

    if (!esReferenciaDecreto460(cuerpo)) return null;

    const cantidadFinal = cantidad == null ? null : formatearCantidad(cantidad);
    const cantidadSalida = cantidadFinal || formatearCantidad(1);
    const referencia = obtenerReferenciaNomenclador("460", "Decreto 460/22") || "Decreto 460/22";
    const detalleSinCantidad = "460/22 " + referencia;
    const textoAutocompletar = cantidadFinal ? "(" + cantidadFinal + ") " + detalleSinCantidad : detalleSinCantidad;

    if (paraAutocompletar && !cantidadFinal) return detalleSinCantidad;

    return {
      tipo: "procedimiento460",
      cantidad: cantidadSalida,
      codigo: "460",
      descripcion: referencia,
      texto: "(" + cantidadSalida + ") " + detalleSinCantidad,
      textoAutocompletar,
      observacion: construirObservacionDecreto460(cantidadSalida),
    };
  }

  function autocompletarLineaDetalleConNomenclador(linea) {
    const original = String(linea || "").replace(/\r/g, "");
    const s = original.trim();
    if (!s) return original;

    const decreto460 = normalizarDetalleDecreto460(s, { paraAutocompletar: true });
    if (decreto460) {
      return typeof decreto460 === "string" ? decreto460 : (decreto460.textoAutocompletar || original);
    }

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

  function analizarLineaDetalleParaAutocompletar(linea) {
    const original = String(linea || "").replace(/\r/g, "");
    const s = original.trim();
    if (!s) return null;

    const decreto460 = normalizarDetalleDecreto460(s, { paraAutocompletar: true });
    if (decreto460) {
      const texto = typeof decreto460 === "string" ? decreto460 : (decreto460.textoAutocompletar || original);
      const mCodigo = texto.match(/460(?:\s*\/\s*22|22)?/i);
      return {
        texto,
        codigo: "460",
        descripcion: limpiarDescripcionDetalle(texto.replace(/^.*?460(?:\s*\/\s*22|22)?/i, "")),
        cursorDespuesCodigo: mCodigo ? mCodigo.index + mCodigo[0].length : Math.min(texto.length, 3),
      };
    }

    const patrones = [
      { regex: /^(\s*\(\s*(\d{1,2})\s*\)\s*)(\d{4,5})(?:\s*[-:;,.–—]\s*|\s+)?(.*)$/i, conCantidad: true, grupoCodigo: 3 },
      { regex: /^(\s*(\d{1,2})\s*[-–—]\s*)(\d{4,5})(?:\s*[-:;,.–—]\s*|\s+)?(.*)$/i, conCantidad: true, grupoCodigo: 3 },
      { regex: /^(\s*(\d{1,2})\s+)(\d{4,5})(?:\s*[-:;,.–—]\s*|\s+)?(.*)$/i, conCantidad: true, grupoCodigo: 3 },
      { regex: /^(\s*)(\d{4,5})(?:\s*[-:;,.–—]\s*|\s+)?(.*)$/i, conCantidad: false, grupoCodigo: 2 },
    ];

    for (const patron of patrones) {
      const m = s.match(patron.regex);
      if (!m) continue;

      const cantidad = patron.conCantidad ? m[2] : null;
      const codigo = patron.conCantidad ? m[3] : m[2];
      if (String(codigo || "").replace(/\D+/g, "") === "17117") return null;

      const referencia = obtenerReferenciaNomenclador(codigo, "");
      if (!referencia) return null;

      const reconstruida = reconstruirLineaDetalle(cantidad, codigo, referencia);
      if (!reconstruida) return null;

      const idxCodigo = reconstruida.indexOf(String(codigo));
      return {
        texto: reconstruida,
        codigo: String(codigo || "").replace(/\D+/g, ""),
        descripcion: limpiarDescripcionDetalle(referencia),
        cursorDespuesCodigo: idxCodigo >= 0 ? idxCodigo + String(codigo).length : reconstruida.length,
      };
    }

    return null;
  }

  function autocompletarDetallesDesdeNomenclador(texto) {
    const original = String(texto || "").replace(/\r/g, "");
    if (!original) return original;
    return original.split("\n").map((linea) => {
      const analisis = analizarLineaDetalleParaAutocompletar(linea);
      return analisis?.texto || autocompletarLineaDetalleConNomenclador(linea);
    }).join("\n");
  }

  function obtenerCodigoActualLineaDetalle(linea) {
    const s = String(linea || "").replace(/\r/g, "").trim();
    if (!s) return "";

    const patrones = [
      /^\(\s*\d{1,2}\s*\)\s*(\d{0,5})/i,
      /^\d{1,2}\s*[-–—]\s*(\d{0,5})/i,
      /^\d{1,2}\s+(\d{0,5})/i,
      /^(\d{0,5})/i,
    ];

    for (const regex of patrones) {
      const m = s.match(regex);
      const codigo = String(m?.[1] || "").replace(/\D+/g, "");
      if (codigo) return codigo;
    }

    return "";
  }

  function limpiarDescripcionAutocompletadaObsoleta(linea, meta) {
    if (!meta || !meta.descripcion) return linea;

    const codigoActual = obtenerCodigoActualLineaDetalle(linea);
    if (codigoActual === String(meta.codigo || "")) return linea;

    const texto = String(linea || "");
    const descripcion = String(meta.descripcion || "");
    const idx = texto.toLowerCase().indexOf(descripcion.toLowerCase());
    if (idx < 0) return linea;

    const antes = texto.slice(0, idx).replace(/[\s:;,.–—-]+$/g, "").trimEnd();
    const despues = texto.slice(idx + descripcion.length).trim();
    return despues ? `${antes} ${despues}`.trim() : antes;
  }

  function calcularLineaYColumnaDesdePosicion(texto, posicion) {
    const hastaCursor = String(texto || "").slice(0, Math.max(0, posicion));
    const partes = hastaCursor.split("\n");
    return {
      linea: partes.length - 1,
      columna: partes[partes.length - 1].length,
    };
  }

  function longitudHastaLinea(lineas, lineaObjetivo) {
    let total = 0;
    for (let i = 0; i < lineaObjetivo; i += 1) {
      total += String(lineas[i] || "").length + 1;
    }
    return total;
  }

  function aplicarAutocompletadoDetalles(textarea, { forzar = false } = {}) {
    if (!textarea) return;

    const valorOriginal = String(textarea.value || "");
    const inicio = typeof textarea.selectionStart === "number" ? textarea.selectionStart : valorOriginal.length;
    const fin = typeof textarea.selectionEnd === "number" ? textarea.selectionEnd : inicio;
    const seleccionColapsada = inicio === fin;
    const cursorOriginal = calcularLineaYColumnaDesdePosicion(valorOriginal, inicio);
    const metasPrevias = detallesAutocompletadoState.get(textarea) || [];

    const lineasOriginales = valorOriginal.split("\n");
    const lineasLimpias = lineasOriginales.map((linea, idx) => limpiarDescripcionAutocompletadaObsoleta(linea, metasPrevias[idx]));
    const lineasNuevas = [];
    const metasNuevas = [];
    let cursorNuevo = null;

    lineasLimpias.forEach((linea, idx) => {
      const analisis = analizarLineaDetalleParaAutocompletar(linea);
      if (analisis?.texto) {
        lineasNuevas.push(analisis.texto);
        metasNuevas[idx] = {
          codigo: analisis.codigo,
          descripcion: analisis.descripcion,
          texto: analisis.texto,
        };

        if (seleccionColapsada && idx === cursorOriginal.linea && (linea !== analisis.texto || forzar)) {
          cursorNuevo = longitudHastaLinea(lineasNuevas, idx) + analisis.cursorDespuesCodigo;
        }
        return;
      }

      lineasNuevas.push(linea);
      metasNuevas[idx] = null;
    });

    const valorNuevo = lineasNuevas.join("\n");
    detallesAutocompletadoState.set(textarea, metasNuevas);

    if (valorNuevo === valorOriginal) return;

    textarea.value = valorNuevo;

    try {
      if (cursorNuevo != null) {
        textarea.setSelectionRange(cursorNuevo, cursorNuevo);
      } else {
        const lineaActual = Math.min(cursorOriginal.linea, lineasNuevas.length - 1);
        const base = longitudHastaLinea(lineasNuevas, lineaActual);
        const columna = Math.min(cursorOriginal.columna, String(lineasNuevas[lineaActual] || "").length);
        const pos = Math.max(0, Math.min(valorNuevo.length, base + columna));
        textarea.setSelectionRange(pos, pos);
      }
    } catch {}
  }

  
  function normalizarLineaDetalle(linea) {
    let s = String(linea || "").replace(/\r/g, "").trim();
    if (!s) return null;

    s = s.replace(/\s+/g, " ").trim();

    const decreto460 = normalizarDetalleDecreto460(s);
    if (decreto460) return decreto460;

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
    const detalleItems = [];

    limpio.split("\n").forEach((linea) => {
      const item = normalizarLineaDetalle(linea);
      if (!item || !item.texto) return;

      if (item.tipo === "detalle") {
        detalles.push(item.texto);
        detalleItems.push(item.texto);
        return;
      }

      if (item.tipo === "procedimiento460") {
        observaciones.push(item.observacion || construirObservacionDecreto460(item.cantidad));
        detalleItems.push(item.texto);
        return;
      }

      observaciones.push(item.texto);
    });

    return {
      detalles: detalles.join("\n"),
      observaciones,
      cantidadValidos: detalleItems.length,
      detalleItems,
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

    document.body.classList.toggle("modo-control-superior", !!activa);

    setPersonalVisible(!activa);
    setMovilidadVisible(!activa);
    setElementosVisibles(!activa);
    setObservacionesVisible(!activa);

    if (divFinaliza) divFinaliza.classList.toggle("hidden", activa || selTipo.value !== "FINALIZA");
    if (divDetalles) divDetalles.classList.add("hidden");
    if (divMismosElementos) divMismosElementos.classList.add("hidden");
    if (bloquePresenciaActiva) bloquePresenciaActiva.classList.add("hidden");
    if (chkPresenciaActiva) chkPresenciaActiva.disabled = !!activa;

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
    setUIControlMovilesActiva(false);
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
    if (esControlMovilesActivo()) {
      await salirControlMoviles();
      return;
    }

    if (!franjaSeleccionada) return;

    if (esControlSuperiorActivo()) {
      const inicioControlSuperior = await leerInicioDesdeSupabase(franjaSeleccionada) || cargarInicioGuardadoCoincidente() || cargarInicioLocal();
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
      abrirWhatsappYCerrarWspLuego(resultadoControlSuperior.texto);
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
    abrirWhatsappYCerrarWspLuego(textoFinal);
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
      aplicarAutocompletadoDetalles(detallesInput, { forzar: true });
    });
  }

  if (controlMovilesAyudaBtn) {
    controlMovilesAyudaBtn.addEventListener("click", alternarAyudaControlMoviles);
  }

  if (controlMovilesAyudaPopup) {
    controlMovilesAyudaPopup.addEventListener("click", (event) => {
      event.stopPropagation();
    });
  }

  document.addEventListener("click", (event) => {
    if (!controlMovilesAyudaWrap) return;
    if (controlMovilesAyudaWrap.contains(event.target)) return;
    cerrarAyudaControlMoviles();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") cerrarAyudaControlMoviles();
  });

  bindControlMovilesEventos();

  window.addEventListener("beforeunload", () => {
    if (esControlMovilesActivo()) borrarPresenciaPropiaControlMovilesKeepAlive();
  });

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
