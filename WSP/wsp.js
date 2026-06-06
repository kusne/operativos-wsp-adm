// ===== CONFIG SUPABASE WSP =====
const SUPABASE_URL = "https://ugeydxozfewzhldjbkat.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_ZeLC2rOxhhUXlQdvJ28JkA_qf802-pX";

// Paso 41: configuración compartida para módulos.
// No cambia la fuente de verdad; solo evita que cada módulo dependa de wrappers legacy de wsp.js.
window.WSP = window.WSP || {};
window.WSP.config = {
  ...(window.WSP.config || {}),
  supabaseUrl: SUPABASE_URL,
  supabaseAnonKey: SUPABASE_ANON_KEY,
};

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
  const bloqueInformeSelector = document.getElementById("bloqueInformeSelector");
  const tipoInforme = document.getElementById("tipoInforme");

  // ===== INFORME ALCOHOLEMIA POSITIVA =====
  const bloqueInformeAlcoholemia = document.getElementById("bloqueInformeAlcoholemia");
  const informeAlcoholemiaContexto = document.getElementById("informeAlcoholemiaContexto");
  const infAlco460 = document.getElementById("infAlco460");
  const infAlcoTipoVehiculo = document.getElementById("infAlcoTipoVehiculo");
  const wrapInfAlcoTipoOtro = document.getElementById("wrapInfAlcoTipoOtro");
  const infAlcoTipoOtro = document.getElementById("infAlcoTipoOtro");
  const infAlcoMarca = document.getElementById("infAlcoMarca");
  const infAlcoModelo = document.getElementById("infAlcoModelo");
  const infAlcoDominio = document.getElementById("infAlcoDominio");
  const infAlcoConductor = document.getElementById("infAlcoConductor");
  const infAlcoGraduacion = document.getElementById("infAlcoGraduacion");
  const infAlcoActa = document.getElementById("infAlcoActa");
  const infAlcoLicenciaClase = document.getElementById("infAlcoLicenciaClase");
  const infAlcoLicenciaDigital = document.getElementById("infAlcoLicenciaDigital");
  const infAlcoOtrosCodigos = document.getElementById("infAlcoOtrosCodigos");
  const infAlcoMedProhibicion = document.getElementById("infAlcoMedProhibicion");
  const infAlcoMedCesion = document.getElementById("infAlcoMedCesion");
  const infAlcoMedRemision = document.getElementById("infAlcoMedRemision");
  const infAlcoMedRetencion = document.getElementById("infAlcoMedRetencion");
  const infAlcoDependenciaRemite = document.getElementById("infAlcoDependenciaRemite");
  const infAlcoCorralon = document.getElementById("infAlcoCorralon");
  const infAlcoInventario = document.getElementById("infAlcoInventario");
  const bloqueAlcoRemisionDestino = document.getElementById("bloqueAlcoRemisionDestino");
  const infAlcoObservacionExtra = document.getElementById("infAlcoObservacionExtra");
  const infAlcoResultadoAuto = document.getElementById("infAlcoResultadoAuto");
  const infAlcoFotos = [1,2,3,4].map((n) => document.getElementById(`infAlcoFoto${n}`)).filter(Boolean);

  // ===== INFORME DECTO 460/22 =====
  const bloqueInformeDecto460 = document.getElementById("bloqueInformeDecto460");
  const informeDecto460Contexto = document.getElementById("informeDecto460Contexto");
  const inf460Marca = document.getElementById("inf460Marca");
  const inf460Modelo = document.getElementById("inf460Modelo");
  const inf460Dominio = document.getElementById("inf460Dominio");
  const inf460Acta = document.getElementById("inf460Acta");
  const inf460OtrosCodigos = document.getElementById("inf460OtrosCodigos");
  const inf460Corralon = document.getElementById("inf460Corralon");
  const inf460Inventario = document.getElementById("inf460Inventario");
  const inf460ResultadoAuto = document.getElementById("inf460ResultadoAuto");
  const inf460Fotos = [1,2,3,4].map((n) => document.getElementById(`inf460Foto${n}`)).filter(Boolean);

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
  let firmaInformesIntermediosAplicadosFinalizado = "";


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
  let controlMovilesUltimaFirmaRender = "";

  const INFORMES_TIPO = "INFORMES";
  const INFORME_CONTROL_SUPERIOR_TIPO = "CONTROL SUPERIOR";
  const INFORME_ALCOHOLEMIA_TIPO = "INFORME ALCOHOLEMIA";
  const INFORME_DECRETO_460_TIPO = "INFORME DECTO 460/22";
  const HISTORIAL_FOTOS_BUCKET = "operativos-historial-fotos";
  const HISTORIAL_FOTOS_TABLE = "operativos_eventos_fotos";

  // ===== WHATSAPP SERVICE BRIDGE =====
  // La lógica real fue extraída a WSP/modules/wsp-whatsapp.js.
  // Estas funciones puente conservan los nombres usados por el wsp.js actual.
  function programarCierreVentanaWsp() {
    const svc = window.WSP?.services?.whatsapp;
    if (!svc || typeof svc.programarCierreVentanaWsp !== "function") {
      console.error("[WSP] No se cargó el módulo WhatsApp.");
      return false;
    }
    return svc.programarCierreVentanaWsp();
  }

  function archivosCompartiblesWsp(files) {
    const svc = window.WSP?.services?.whatsapp;
    if (!svc || typeof svc.archivosCompartiblesWsp !== "function") return [];
    return svc.archivosCompartiblesWsp(files);
  }

  function abrirWhatsappTextoWsp(texto) {
    const svc = window.WSP?.services?.whatsapp;
    if (!svc || typeof svc.abrirWhatsappTextoWsp !== "function") {
      alert("No se pudo cargar el módulo de WhatsApp.");
      return false;
    }
    return svc.abrirWhatsappTextoWsp(texto);
  }

  async function compartirWhatsappConFotosSiCorresponde(texto, files = []) {
    const svc = window.WSP?.services?.whatsapp;
    if (!svc || typeof svc.compartirWhatsappConFotosSiCorresponde !== "function") {
      alert("No se pudo cargar el módulo de WhatsApp.");
      return false;
    }
    return svc.compartirWhatsappConFotosSiCorresponde(texto, files);
  }

  function abrirWhatsappYCerrarWspLuego(texto, files = []) {
    const svc = window.WSP?.services?.whatsapp;
    if (!svc || typeof svc.abrirWhatsappYCerrarWspLuego !== "function") {
      alert("No se pudo cargar el módulo de WhatsApp.");
      return false;
    }
    return svc.abrirWhatsappYCerrarWspLuego(texto, files);
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
  const CONTROL_MOVILES_POLLING_MS = 45000; // respaldo suave; Realtime hace la actualización inmediata
  const CONTROL_MOVILES_PRESENCE_TTL_MS = 45000;
  const CONTROL_MOVILES_LOCK_TTL_MS = 2 * 60 * 60 * 1000;

  function cerrarAyudaControlMoviles() {
    const ui = controlMovilesUiWsp();
    if (ui && typeof ui.cerrarAyuda === "function") return ui.cerrarAyuda(refsControlMovilesWsp());
    if (!controlMovilesAyudaPopup || !controlMovilesAyudaBtn) return;
    controlMovilesAyudaPopup.classList.add("hidden");
    controlMovilesAyudaBtn.classList.remove("ayuda-activa");
    controlMovilesAyudaBtn.setAttribute("aria-expanded", "false");
  }

  function abrirAyudaControlMoviles() {
    const ui = controlMovilesUiWsp();
    if (ui && typeof ui.abrirAyuda === "function") return ui.abrirAyuda(refsControlMovilesWsp());
    if (!controlMovilesAyudaPopup || !controlMovilesAyudaBtn) return;
    controlMovilesAyudaPopup.classList.remove("hidden");
    controlMovilesAyudaBtn.classList.add("ayuda-activa");
    controlMovilesAyudaBtn.setAttribute("aria-expanded", "true");
  }

  function alternarAyudaControlMoviles(event) {
    const ui = controlMovilesUiWsp();
    if (ui && typeof ui.alternarAyuda === "function") return ui.alternarAyuda(event, refsControlMovilesWsp());
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
    const ui = window.WSP?.ui?.helpers;
    if (ui && typeof ui.limpiarErrorCampo === "function") return ui.limpiarErrorCampo(el);
    if (!el) return;
    el.classList.remove("input-error");
  }
  function marcarErrorCampo(el, mensaje) {
    const ui = window.WSP?.ui?.helpers;
    if (ui && typeof ui.marcarErrorCampo === "function") return ui.marcarErrorCampo(el, mensaje);
    if (el) {
      el.classList.add("input-error");
      try { el.focus({ preventScroll: false }); } catch { try { el.focus(); } catch {} }
    }
    alert(mensaje);
    return false;
  }
  function leerEnteroNoNegativo(valor) {
    const ui = window.WSP?.ui?.helpers;
    if (ui && typeof ui.leerEnteroNoNegativo === "function") return ui.leerEnteroNoNegativo(valor);
    const n = parseInt(String(valor ?? "").trim(), 10);
    return Number.isFinite(n) && n > 0 ? n : 0;
  }
  function leerEnteroInput(el) {
    const ui = window.WSP?.ui?.helpers;
    if (ui && typeof ui.leerEnteroInput === "function") return ui.leerEnteroInput(el);
    return leerEnteroNoNegativo(el?.value);
  }
  function formatearCantidad(n) {
    const ui = window.WSP?.ui?.helpers;
    if (ui && typeof ui.formatearCantidad === "function") return ui.formatearCantidad(n);
    const v = Math.max(0, parseInt(n, 10) || 0);
    return String(v).padStart(2, "0");
  }

  function refsAlcoholimetroWsp() {
    return {
      inputAlcotest,
      inputPositivaSancionable,
      inputPositivaNoSancionable,
      bloquePositivosAlcoholimetro,
      wrapGraduacionesSancionable,
      wrapGraduacionesNoSancionable,
      graduacionesSancionable,
      graduacionesNoSancionable,
      unitGraduacionesSancionable,
      unitGraduacionesNoSancionable,
    };
  }

  function refsQrzDominioWsp() {
    return {
      inputQrz,
      inputDominio,
      wrapQrzCasilleros,
      qrzCasilleros,
      wrapDominioCasilleros,
      dominioCasilleros,
    };
  }

  function alcoholimetroUiWsp() {
    return window.WSP?.ui?.alcoholimetro || null;
  }

  function operativoUiWsp() {
    return window.WSP?.ui?.operativo || null;
  }

  function refsOperativoUiWsp() {
    return {
      bloquePersonal: document.getElementById("bloquePersonal"),
      bloqueMovil: document.getElementById("bloqueMovil"),
      labelObs,
      textareaObs,
      divFinaliza,
      divDetalles,
      divMismosElementos,
      bloquePresenciaActiva,
    };
  }

  function normalizarTextoGraduacion(valor) {
    const mod = alcoholimetroUiWsp();
    if (mod && typeof mod.normalizarTextoGraduacion === "function") return mod.normalizarTextoGraduacion(valor);
    return String(valor || "").replace(/\s+/g, "").trim();
  }

  function graduacionTieneFormatoValido(valor) {
    const mod = alcoholimetroUiWsp();
    if (mod && typeof mod.graduacionTieneFormatoValido === "function") return mod.graduacionTieneFormatoValido(valor);
    return /^\d+[.,]\d{2}$/.test(normalizarTextoGraduacion(valor));
  }

  function graduacionEsCero(valor) {
    const mod = alcoholimetroUiWsp();
    if (mod && typeof mod.graduacionEsCero === "function") return mod.graduacionEsCero(valor);
    const limpio = normalizarTextoGraduacion(valor);
    if (!graduacionTieneFormatoValido(limpio)) return false;
    return Number(limpio.replace(",", ".")) === 0;
  }

  function crearInputGraduacion(valorInicial) {
    const mod = alcoholimetroUiWsp();
    if (mod && typeof mod.crearInputGraduacion === "function") return mod.crearInputGraduacion(valorInicial);
    const slot = document.createElement("div");
    slot.className = "graduacion-slot";
    const input = document.createElement("input");
    input.type = "text";
    input.inputMode = "decimal";
    input.autocomplete = "off";
    input.maxLength = 4;
    input.placeholder = "0,86";
    input.value = valorInicial || "";
    input.addEventListener("input", () => limpiarErrorCampo(input));
    slot.appendChild(input);
    return slot;
  }

  function obtenerValoresGraduaciones(contenedor) {
    const mod = alcoholimetroUiWsp();
    if (mod && typeof mod.obtenerValoresGraduaciones === "function") return mod.obtenerValoresGraduaciones(contenedor);
    return Array.from(contenedor?.querySelectorAll('input[type="text"]') || []).map((inp) => inp.value || "");
  }

  function renderGraduaciones(contenedor, cantidad) {
    const mod = alcoholimetroUiWsp();
    if (mod && typeof mod.renderGraduaciones === "function") return mod.renderGraduaciones(contenedor, cantidad);
  }

  function limpiarGraduaciones(contenedor) {
    const mod = alcoholimetroUiWsp();
    if (mod && typeof mod.limpiarGraduaciones === "function") return mod.limpiarGraduaciones(contenedor);
    if (!contenedor) return;
    contenedor.innerHTML = "";
  }

  function sanitizarValorQrz(valor) {
    const mod = alcoholimetroUiWsp();
    if (mod && typeof mod.sanitizarValorQrz === "function") return mod.sanitizarValorQrz(valor);
    return String(valor || "").replace(/\D+/g, "").slice(0, 9);
  }

  function sanitizarValorDominio(valor) {
    const mod = alcoholimetroUiWsp();
    if (mod && typeof mod.sanitizarValorDominio === "function") return mod.sanitizarValorDominio(valor);
    return String(valor || "").toUpperCase().replace(/[^A-Z0-9 ]+/g, "").slice(0, 16);
  }

  function crearInputDinamicoLista(tipo, valorInicial) {
    const mod = alcoholimetroUiWsp();
    if (mod && typeof mod.crearInputDinamicoLista === "function") return mod.crearInputDinamicoLista(tipo, valorInicial);
    const wrap = document.createElement("div");
    wrap.className = "casillero-dinamico";
    return wrap;
  }

  function obtenerValoresListaDinamica(contenedor, tipo) {
    const mod = alcoholimetroUiWsp();
    if (mod && typeof mod.obtenerValoresListaDinamica === "function") return mod.obtenerValoresListaDinamica(contenedor, tipo);
    return [];
  }

  function renderListaDinamica(contenedor, cantidad, tipo) {
    const mod = alcoholimetroUiWsp();
    if (mod && typeof mod.renderListaDinamica === "function") return mod.renderListaDinamica(contenedor, cantidad, tipo);
  }

  function limpiarListaDinamica(contenedor) {
    const mod = alcoholimetroUiWsp();
    if (mod && typeof mod.limpiarListaDinamica === "function") return mod.limpiarListaDinamica(contenedor);
    if (!contenedor) return;
    contenedor.innerHTML = "";
  }

  function sincronizarUIQrzDominio() {
    const mod = alcoholimetroUiWsp();
    if (mod && typeof mod.sincronizarUIQrzDominio === "function") return mod.sincronizarUIQrzDominio(refsQrzDominioWsp());
  }

  function construirBloqueListaVertical(titulo, cantidad, valores) {
    const mod = alcoholimetroUiWsp();
    if (mod && typeof mod.construirBloqueListaVertical === "function") return mod.construirBloqueListaVertical(titulo, cantidad, valores);
    const lineas = [`${titulo}: (${formatearCantidad(cantidad)})`];
    const completos = (Array.isArray(valores) ? valores : []).filter(Boolean);
    if (completos.length) lineas.push(...completos);
    return lineas;
  }

  function sincronizarUIAlcoholimetro() {
    const mod = alcoholimetroUiWsp();
    if (mod && typeof mod.sincronizarUIAlcoholimetro === "function") return mod.sincronizarUIAlcoholimetro(refsAlcoholimetroWsp());
  }

  function serializarGraduaciones(contenedor, etiqueta, opts = {}) {
    const mod = alcoholimetroUiWsp();
    if (mod && typeof mod.serializarGraduaciones === "function") return mod.serializarGraduaciones(contenedor, etiqueta, opts);
    return { ok: true, valores: [] };
  }

  function construirLineaGraduaciones(valores) {
    const mod = alcoholimetroUiWsp();
    if (mod && typeof mod.construirLineaGraduaciones === "function") return mod.construirLineaGraduaciones(valores);
    return `Graduaciones: ${(Array.isArray(valores) ? valores : []).map((v) => `(${v})`).join(" ")} g/l`;
  }

  function construirBloqueAlcoholimetro() {
    const mod = alcoholimetroUiWsp();
    if (mod && typeof mod.construirBloqueAlcoholimetro === "function") return mod.construirBloqueAlcoholimetro(refsAlcoholimetroWsp());
    return { ok: true, lineas: [`Test de Alcoholímetro: (${formatearCantidad(0)})`], cantidadSancionables: 0, cantidadNoSancionables: 0, totalValidos: 0, valoresSan: [], valoresNo: [] };
  }

  function normalizarInputNoNegativo(el) {
    const ui = window.WSP?.ui?.helpers;
    if (ui && typeof ui.normalizarInputNoNegativo === "function") return ui.normalizarInputNoNegativo(el);
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
    // Fuente de verdad: Supabase. Esta cache vive solo en memoria de la pantalla actual.
    // No se persiste en localStorage ni en StorageApp.
    ordenesCache = Array.isArray(arr) ? arr : [];
  }

  function cargarOrdenesSeguro() {
    // Fuente de verdad: Supabase. Respaldo únicamente en memoria mientras la pantalla está abierta.
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

  function parseJsonObjectWsp(value) {
    if (!value) return null;
    if (typeof value === "object" && !Array.isArray(value)) return value;
    if (typeof value === "string") {
      const raw = value.trim();
      if (!raw) return null;
      try {
        const parsed = JSON.parse(raw);
        return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : null;
      } catch {
        return null;
      }
    }
    return null;
  }

  function obtenerRegistroOriginalPublicadoWsp(row) {
    return parseJsonObjectWsp(row?.registro_original) || {};
  }

  function obtenerMetaTemporalPublicadoWsp(row) {
    const registroOriginal = obtenerRegistroOriginalPublicadoWsp(row);
    return parseJsonObjectWsp(registroOriginal?.wsp_meta_temporal) || {};
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
      const registroOriginal = obtenerRegistroOriginalPublicadoWsp(row);
      const metaTemporal = obtenerMetaTemporalPublicadoWsp(row);

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
        __tipoPublicado: limpiarTextoSimple(row?.tipo || "Operativo"),
        __ordenesOrigen: ordenes,
        __archivosOrigen: archivos,
        __registroOriginalPublicado: registroOriginal,
        __wspMetaTemporal: metaTemporal,
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

    // INFORMES usa como fuente los operativos realmente iniciados/en curso.
    // No recargar el selector cada vez que recibe foco: en celulares/Chrome eso
    // desarma el desplegable justo cuando el usuario intenta elegir otro operativo.
    if (selTipo?.value === "FINALIZA" || esInformeAlcoholemiaActivo() || esInformeDecto460Activo() || esControlSuperiorActivo()) {
      const tieneOpciones = Array.from(selHorario?.options || []).some((opt) => limpiarTextoSimple(opt?.value || ""));
      if (tieneOpciones && operativosCache.length) return;

      syncingOrdenes = true;
      try {
        await cargarOperativosIniciadosParaInformes(selHorario?.value || "");
        actualizarDatosFranja();
      } finally {
        syncingOrdenes = false;
      }
      return;
    }

    syncingOrdenes = true;
    try {
      const seleccionActual = selHorario?.value || "";
      const ok = await syncOrdenesDesdeServidor();
      if (ok) {
        cargarOperativosDisponibles(seleccionActual);
        actualizarDatosFranja();
      }
    } finally {
      syncingOrdenes = false;
    }
  }

  // ===== UI =====
  function limpiarSeleccionOperativo() {
    ordenSeleccionada = null;
    franjaSeleccionada = null;

    const ui = selectorOperativoUiWsp();
    if (ui && typeof ui.limpiarSeleccionOperativo === "function") {
      return ui.limpiarSeleccionOperativo({
        selHorario,
        actualizarContadorOperativosWsp,
      });
    }

    if (selHorario) {
      selHorario.value = "";
      selHorario.innerHTML = '<option value="">Seleccionar Operativo</option>';
    }
    actualizarContadorOperativosWsp(0);
  }

  // ===== Guardia =====
  function obtenerServicioGuardiaWsp(nombreFuncion) {
    const svc = window.WSP?.services?.guardia;
    if (!svc || typeof svc[nombreFuncion] !== "function") {
      throw new Error(`[WSP] No se cargó el módulo de Guardia: ${nombreFuncion}`);
    }
    return svc[nombreFuncion];
  }

  function getVentanaOperativosWsp(now = new Date()) {
    return obtenerServicioGuardiaWsp("getVentanaOperativosWsp")(now);
  }

  function getGuardiaInicio() {
    return obtenerServicioGuardiaWsp("getGuardiaInicio")();
  }

  function extraerHoraInicio(h) {
    return obtenerServicioGuardiaWsp("extraerHoraInicio")(h);
  }

  function extraerHoraInicioCompleta(h) {
    return obtenerServicioGuardiaWsp("extraerHoraInicioCompleta")(h);
  }

  function franjaEnGuardia(h) {
    return obtenerServicioGuardiaWsp("franjaEnGuardia")(h);
  }

  function obtenerFechaFranjaOperativo(franja, orden) {
    return obtenerServicioGuardiaWsp("obtenerFechaFranjaOperativo")(franja, orden);
  }

  function construirFechaHoraInicioFranja(franja, orden) {
    return obtenerServicioGuardiaWsp("construirFechaHoraInicioFranja")(franja, orden);
  }

  function franjaIniciaEnGuardiaActual(franja, orden) {
    return obtenerServicioGuardiaWsp("franjaIniciaEnGuardiaActual")(franja, orden);
  }

  function parseVigenciaFlexible(v) {
    return obtenerServicioGuardiaWsp("parseVigenciaFlexible")(v);
  }

  function pad2(n) {
    return obtenerServicioGuardiaWsp("pad2")(n);
  }

  function toFechaISO(d) {
    return obtenerServicioGuardiaWsp("toFechaISO")(d);
  }

  function getGuardiaFechaISO() {
    return obtenerServicioGuardiaWsp("getGuardiaFechaISO")();
  }

  function getFechasBusquedaInicio() {
    return obtenerServicioGuardiaWsp("getFechasBusquedaInicio")();
  }

  function getDiaGuardiaTexto() {
    return obtenerServicioGuardiaWsp("getDiaGuardiaTexto")();
  }

  function normalizarParteClave(txt) {
    const mod = payloadOperativoWsp();
    if (mod && typeof mod.normalizarParteClave === "function") return mod.normalizarParteClave(txt);
    return normalizarBasicoSinAcentos(String(txt || ""))
      .replace(/[^a-z0-9/ -]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function construirOperativoKeyEstable(franja) {
    const mod = payloadOperativoWsp();
    if (mod && typeof mod.construirOperativoKeyEstable === "function") {
      return mod.construirOperativoKeyEstable(franja, {
        obtenerNumeroOrdenDeFranja,
        obtenerTextoRefOrdenDeFranja,
        obtenerTipoCortoFranja,
      });
    }
    if (!franja) return "";

    const ordenNum = normalizarParteClave(obtenerNumeroOrdenDeFranja(franja) || "sin-orden");
    const textoRef = normalizarParteClave(obtenerTextoRefOrdenDeFranja(franja) || "sin-texto");
    const horario = normalizarParteClave(franja?.horario || "sin-horario");
    const lugar = normalizarParteClave(franja?.lugar || "sin-lugar");
    const tipo = normalizarParteClave(obtenerTipoCortoFranja(franja) || "sin-tipo");

    return [ordenNum, textoRef, horario, lugar, tipo].join("|");
  }

  function construirOperativoKeysPosibles(franja) {
    const mod = payloadOperativoWsp();
    if (mod && typeof mod.construirOperativoKeysPosibles === "function") {
      return mod.construirOperativoKeysPosibles(franja, {
        obtenerNumeroOrdenDeFranja,
        obtenerTextoRefOrdenDeFranja,
        obtenerTipoCortoFranja,
        getDiaGuardiaTexto,
      });
    }
    if (!franja) return [];

    const orden = normalizarParteClave(obtenerNumeroOrdenDeFranja(franja) || "-") || "-";
    const textoRef = normalizarParteClave(obtenerTextoRefOrdenDeFranja(franja) || "-") || "-";
    const horario = normalizarParteClave(String(franja?.horario || "-").replace(/:/g, " ")) || "-";
    const lugar = normalizarParteClave(franja?.lugar || "-") || "-";
    const tipo = normalizarParteClave(obtenerTipoCortoFranja(franja) || "-") || "-";
    const dia = normalizarParteClave(getDiaGuardiaTexto() || "-") || "-";

    const keys = new Set();
    if (franja?.__operativoKey) keys.add(limpiarTextoSimple(franja.__operativoKey));
    keys.add(construirOperativoKeyEstable(franja));
    keys.add([orden, dia, horario, lugar, tipo].join("|"));
    keys.add([orden, dia, horario, lugar, `${tipo} - ${textoRef}`].join("|"));
    keys.add([orden, dia, horario, lugar, `${tipo} - -`].join("|"));
    keys.add([orden, horario, lugar].join("|"));

    return Array.from(keys).map((v) => limpiarTextoSimple(v)).filter(Boolean);
  }

  function normalizarArrayTexto(arr) {
    const mod = payloadOperativoWsp();
    if (mod && typeof mod.normalizarArrayTexto === "function") return mod.normalizarArrayTexto(arr);
    return (Array.isArray(arr) ? arr : []).map((v) => limpiarTextoSimple(v)).filter(Boolean);
  }

  function construirPayloadElementosActual() {
    const mod = formularioOperativoWsp();
    if (mod && typeof mod.construirPayloadElementosActual === "function") {
      return mod.construirPayloadElementosActual();
    }
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
    const mod = payloadOperativoWsp();
    if (mod && typeof mod.normalizarPayloadElementos === "function") return mod.normalizarPayloadElementos(payload);
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
    const mod = payloadOperativoWsp();
    if (mod && typeof mod.pareceHorario === "function") return mod.pareceHorario(txt);
    return /(\d{1,2})[ :](\d{2})\s*a\s*(\d{1,2})[ :](\d{2})/i.test(String(txt || ""));
  }

  function pareceDiaSemana(txt) {
    const mod = payloadOperativoWsp();
    if (mod && typeof mod.pareceDiaSemana === "function") return mod.pareceDiaSemana(txt);
    return /^(lunes|martes|miercoles|miércoles|jueves|viernes|sabado|sábado|domingo)$/i.test(limpiarTextoSimple(txt));
  }

  function extraerPartesDeOperativoKey(operativoKey) {
    const mod = payloadOperativoWsp();
    if (mod && typeof mod.extraerPartesDeOperativoKey === "function") return mod.extraerPartesDeOperativoKey(operativoKey);
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
    const mod = payloadOperativoWsp();
    if (mod && typeof mod.normalizarValorComparacion === "function") return mod.normalizarValorComparacion(txt);
    return normalizarBasicoSinAcentos(String(txt || "")).replace(/[^a-z0-9]+/g, "");
  }

  function valoresComparablesCoinciden(a, b) {
    const mod = payloadOperativoWsp();
    if (mod && typeof mod.valoresComparablesCoinciden === "function") return mod.valoresComparablesCoinciden(a, b);
    const aa = normalizarValorComparacion(a);
    const bb = normalizarValorComparacion(b);
    if (!aa || !bb) return false;
    return aa === bb || aa.includes(bb) || bb.includes(aa);
  }

  function puntuarCoincidenciaInicio(payload, franja = franjaSeleccionada) {
    const mod = payloadOperativoWsp();
    if (mod && typeof mod.puntuarCoincidenciaInicio === "function") {
      return mod.puntuarCoincidenciaInicio(payload, franja, {
        fechasBusqueda: getFechasBusquedaInicio(),
        deps: {
          obtenerNumeroOrdenDeFranja,
          obtenerTextoRefOrdenDeFranja,
          obtenerTipoCortoFranja,
          getDiaGuardiaTexto,
        },
      });
    }
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
    const mod = payloadOperativoWsp();
    if (mod && typeof mod.normalizarInicioGuardado === "function") return mod.normalizarInicioGuardado(payload);
    if (!payload) return null;

    const derivado = extraerPartesDeOperativoKey(payload.operativo_key || "");

    return {
      guardia_fecha: String(payload.guardia_fecha || ""),
      operativo_estado_id: String(payload.operativo_estado_id || payload.id || ""),
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
    const mod = payloadOperativoWsp();
    if (mod && typeof mod.construirInicioGuardadoActual === "function") {
      return mod.construirInicioGuardadoActual({
        franja: franjaSeleccionada,
        guardiaFecha: getGuardiaFechaISO(),
        deps: {
          obtenerNumeroOrdenDeFranja,
          obtenerTextoRefOrdenDeFranja,
          obtenerTipoCortoFranja,
          leerSeleccionPorClase,
          construirPayloadElementosActual,
        },
      });
    }
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

  function historialOperativoServiceWsp() {
    return window.WSP?.services?.historialOperativo || null;
  }

  function historialOperativoRepoWsp() {
    return window.WSP?.services?.historialOperativoRepo || window.WSP?.modules?.historialOperativo || null;
  }

  function depsHistorialOperativoRepoWsp() {
    return {
      SUPABASE_URL,
      SUPABASE_ANON_KEY,
      getGuardiaFechaISO,
      construirOperativoKeysPosibles,
      puntuarCoincidenciaInicio,
      normalizarInicioGuardado,
      deduplicarIniciosInformeWsp,
      construirOperativoKeyEstable,
      resultadoGuardadoValidoWsp,
      esErrorValidacionOperativaWsp,
      mensajeErrorOperativoWsp,
      headersSupabase,
      fetchSupabaseTabla,
      limpiarTextoSimple,
      normalizarArrayJsonWsp,
      parseJsonObjectWsp,
      timestampOperativoAMs,
    };
  }

  function headersSupabase(extra = {}) {
    const svc = historialOperativoServiceWsp();
    if (svc && typeof svc.headersSupabase === "function") {
      try {
        return svc.headersSupabase({ anonKey: SUPABASE_ANON_KEY, extra });
      } catch (e) {
        console.warn("[WSP] Historial service no pudo armar headers Supabase. Se usa fallback.", e);
      }
    }

    return {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      ...extra,
    };
  }

  function guardarInicioLocal(payload) {
    // Sin localStorage. Se conserva solo en memoria mientras la pantalla está abierta.
    const data = normalizarInicioGuardado(payload);
    inicioGuardadoActual = data || null;
  }

  function cargarInicioLocal() {
    // Sin localStorage. La fuente persistente es Supabase mediante leerInicioDesdeSupabase().
    return normalizarInicioGuardado(inicioGuardadoActual);
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
    // La persistencia real de INICIO se realiza al enviar el WhatsApp con
    // guardarHistorialOperativoWsp() -> BMZCN.OperativosRepo.guardarInicio().
    // Esta función queda como no-op para no duplicar eventos incompletos.
    guardarInicioLocal(payload);
    return true;
  }

  function normalizarInicioDesdeVistaGuardiaWsp(row) {
    if (!row) return null;
    const metadataEstado = parseJsonObjectWsp(row?.estado_metadata || row?.metadata) || {};
    const horario = limpiarTextoSimple(row?.hora_desde && row?.hora_hasta ? `${row.hora_desde} A ${row.hora_hasta}` : row?.horario || metadataEstado?.horario || "");
    return normalizarInicioGuardado({
      guardia_fecha: row?.guardia_fecha || getGuardiaFechaISO(),
      operativo_estado_id: row?.operativo_estado_id || row?.id || "",
      operativo_key: row?.operativo_key || "",
      orden_num: normalizarArrayJsonWsp(row?.ordenes_origen).join(" / ") || limpiarTextoSimple(metadataEstado?.orden_num || metadataEstado?.orden || ""),
      texto_ref: limpiarTextoSimple(metadataEstado?.texto_ref || metadataEstado?.titulo || metadataEstado?.archivo || "Operativo en curso"),
      horario,
      lugar: row?.lugar || "",
      tipo_corto: row?.tipo_operativo || metadataEstado?.tipo_operativo || metadataEstado?.titulo || "Operativo iniciado",
      personal: row?.inicio_personal || metadataEstado?.personal_inicio || metadataEstado?.ultimo_personal || metadataEstado?.personal || [],
      moviles: row?.inicio_moviles || metadataEstado?.moviles_inicio || metadataEstado?.ultimo_moviles || metadataEstado?.moviles || [],
      motos: row?.inicio_motos || metadataEstado?.motos_inicio || metadataEstado?.ultimo_motos || metadataEstado?.motos || [],
      elementos: row?.inicio_elementos || metadataEstado?.elementos_inicio || metadataEstado?.ultimo_elementos || metadataEstado?.elementos || {},
      ts: timestampOperativoAMs(row?.updated_at || row?.created_at) || Date.now(),
    });
  }

  async function leerInicioDesdeSupabase(franja) {
    const svcRepo = historialOperativoRepoWsp();
    if (svcRepo && typeof svcRepo.leerInicioDesdeSupabase === "function") {
      try {
        return await svcRepo.leerInicioDesdeSupabase(franja, depsHistorialOperativoRepoWsp());
      } catch (e) {
        console.warn("[WSP] Historial operativo modular falló al leer INICIO. Se usa fallback legacy.", e);
      }
    }

    if (!franja) return null;
    const keysPosibles = new Set(construirOperativoKeysPosibles(franja).map((v) => limpiarTextoSimple(v)).filter(Boolean));
    const keyDirecta = limpiarTextoSimple(franja?.__operativoKey || franja?.__inicioGuardadoPayload?.operativo_key || "");
    if (keyDirecta) keysPosibles.add(keyDirecta);

    try {
      if (window.BMZCN?.OperativosRepo?.leerOperativosGuardia) {
        const rows = await window.BMZCN.OperativosRepo.leerOperativosGuardia({ guardiaFecha: getGuardiaFechaISO(), limit: 500 });
        let mejor = null;
        let mejorPuntaje = -1;
        (Array.isArray(rows) ? rows : []).forEach((row) => {
          const estadoReal = limpiarTextoSimple(row?.estado_real || row?.estado || "").toUpperCase();
          if (!["EN_CURSO", "FINALIZADO"].includes(estadoReal)) return;
          const rowKey = limpiarTextoSimple(row?.operativo_key || "");
          const payload = normalizarInicioDesdeVistaGuardiaWsp(row);
          if (!payload) return;
          const puntaje = keysPosibles.has(rowKey) ? 100 : puntuarCoincidenciaInicio(payload, franja);
          if (puntaje > mejorPuntaje) {
            mejor = payload;
            mejorPuntaje = puntaje;
          }
        });
        if (mejor && mejorPuntaje >= 90) return mejor;
      }
    } catch (e) {
      console.warn("[WSP] No se pudo leer INICIO desde vistas canónicas Supabase.", e);
    }

    // Respaldo final: si el selector de informes ya trajo el snapshot canónico.
    return normalizarInicioGuardado(franja?.__inicioGuardadoPayload) || null;
  }

  function estadoOperativoEsEnCursoWsp(row) {
    const estadoTxt = limpiarTextoSimple(row?.estado || "").toUpperCase().replace(/\s+/g, "_");
    const tieneInicioReal = !!row?.inicio_evento_id;
    const tieneFinalizado = !!row?.finalizado_evento_id || estadoTxt === "FINALIZADO" || estadoTxt === "CERRADO";
    if (tieneFinalizado) return false;

    // Blindaje: no alcanza con que exista en operativos_estado. Debe estar marcado
    // como iniciado/en curso o tener evento de INICIO real. Esto evita que el selector
    // de INFORMES muestre operativos publicados, futuros, viejos o pruebas.
    if (["EN_CURSO", "INICIADO", "ACTIVO"].includes(estadoTxt)) return true;
    if (tieneInicioReal && !estadoTxt) return true;
    return false;
  }

  function normalizarEstadoOperativoEnCurso(row) {
    if (!row || !estadoOperativoEsEnCursoWsp(row)) return null;

    const horaDesde = limpiarTextoSimple(row?.hora_desde || "");
    const horaHasta = limpiarTextoSimple(row?.hora_hasta || "");
    const horario = limpiarTextoSimple(row?.horario || (horaDesde && horaHasta ? `${horaDesde} A ${horaHasta}` : horaDesde || horaHasta));
    const ordenes = normalizarArrayJsonWsp(row?.ordenes_origen);
    const meta = parseJsonObjectWsp(row?.metadata) || {};

    return normalizarInicioGuardado({
      guardia_fecha: row?.guardia_fecha || getGuardiaFechaISO(),
      operativo_estado_id: row?.id || row?.operativo_estado_id || "",
      operativo_key: row?.operativo_key || "",
      orden_num: ordenes.join(" / ") || limpiarTextoSimple(meta?.orden_num || meta?.orden || ""),
      texto_ref: limpiarTextoSimple(meta?.texto_ref || meta?.archivo || "Operativo en curso"),
      horario,
      lugar: row?.lugar || "",
      tipo_corto: row?.tipo_operativo || meta?.tipo_operativo || row?.tipo || "Operativo iniciado",
      personal: row?.personal || meta?.personal_inicio || meta?.ultimo_personal || meta?.personal || [],
      moviles: row?.moviles || meta?.moviles_inicio || meta?.ultimo_moviles || meta?.moviles || [],
      motos: row?.motos || meta?.motos_inicio || meta?.ultimo_motos || meta?.motos || [],
      elementos: row?.elementos || meta?.elementos_inicio || meta?.ultimo_elementos || meta?.elementos || {},
      ts: timestampOperativoAMs(row?.updated_at || row?.created_at) || Date.now(),
    });
  }

  async function leerOperativoKeysFinalizadosGuardiaSupabase() {
    const svcRepo = historialOperativoRepoWsp();
    if (svcRepo && typeof svcRepo.leerOperativoKeysFinalizadosGuardiaSupabase === "function") {
      try {
        return await svcRepo.leerOperativoKeysFinalizadosGuardiaSupabase(depsHistorialOperativoRepoWsp());
      } catch (e) {
        console.warn("[WSP] Historial operativo modular falló al leer FINALIZADOS. Se usa fallback legacy.", e);
      }
    }

    const guardiaFecha = getGuardiaFechaISO();
    const out = new Set();

    try {
      const params = new URLSearchParams({
        select: "operativo_key,payload_completo,guardia_fecha,tipo_evento",
        guardia_fecha: `eq.${guardiaFecha}`,
        tipo_evento: "eq.FINALIZADO",
        limit: "1000",
      });

      const r = await fetch(`${SUPABASE_URL}/rest/v1/operativos_eventos?${params.toString()}`, {
        headers: headersSupabase({ Accept: "application/json" }),
      });

      if (!r.ok) {
        console.warn("[WSP] No se pudieron leer FINALIZADOS para filtrar operativos iniciados:", r.status, await r.text());
        return out;
      }

      const data = await r.json();
      (Array.isArray(data) ? data : []).forEach((row) => {
        [
          row?.operativo_key,
          row?.payload_completo?.operativo_key,
          row?.payload_completo?.franja?.__operativoKey,
        ].forEach((key) => {
          const clean = limpiarTextoSimple(key || "");
          if (clean) out.add(clean);
        });
      });
    } catch (e) {
      console.warn("[WSP] Error leyendo FINALIZADOS para filtrar operativos iniciados.", e);
    }

    return out;
  }

  function deduplicarIniciosInformeWsp(filas) {
    const vistos = new Set();
    const unicos = [];
    (Array.isArray(filas) ? filas : []).forEach((fila) => {
      const key = limpiarTextoSimple(fila?.operativo_key || construirOperativoKeyEstable({
        __ordenNum: fila?.orden_num,
        __ordenTextoRef: fila?.texto_ref,
        horario: fila?.horario,
        lugar: fila?.lugar,
        titulo: fila?.tipo_corto,
      }));
      if (!key || vistos.has(key)) return;
      vistos.add(key);
      unicos.push(fila);
    });
    return unicos;
  }

  async function leerOperativosEnCursoDesdeEstadoSupabase() {
    const svcRepo = historialOperativoRepoWsp();
    if (svcRepo && typeof svcRepo.leerOperativosEnCursoDesdeEstadoSupabase === "function") {
      try {
        return await svcRepo.leerOperativosEnCursoDesdeEstadoSupabase(depsHistorialOperativoRepoWsp());
      } catch (e) {
        console.warn("[WSP] Historial operativo modular falló al leer EN CURSO. Se usa fallback legacy.", e);
      }
    }

    const guardiaFecha = getGuardiaFechaISO();
    const selectCols = "id,operativo_key,guardia_fecha,fecha_operativo,hora_desde,hora_hasta,lugar,tipo_operativo,tipo,ordenes_origen,estado,inicio_evento_id,finalizado_evento_id,metadata,created_at,updated_at";

    try {
      const params = new URLSearchParams({
        select: selectCols,
        guardia_fecha: `eq.${guardiaFecha}`,
        order: "hora_desde.asc,updated_at.desc",
        limit: "300",
      });

      const r = await fetch(`${SUPABASE_URL}/rest/v1/operativos_estado?${params.toString()}`, {
        headers: headersSupabase({ Accept: "application/json" }),
      });

      if (!r.ok) {
        console.warn("[WSP] No se pudieron leer operativos EN CURSO desde operativos_estado:", r.status, await r.text());
        return null;
      }

      const finalizados = await leerOperativoKeysFinalizadosGuardiaSupabase();
      const data = await r.json();
      return deduplicarIniciosInformeWsp((Array.isArray(data) ? data : [])
        .map(normalizarEstadoOperativoEnCurso)
        .filter((item) => item && item.operativo_key && !finalizados.has(limpiarTextoSimple(item.operativo_key))));
    } catch (e) {
      console.warn("[WSP] Error leyendo operativos EN CURSO desde operativos_estado.", e);
      return null;
    }
  }

  async function leerIniciosGuardiaDesdeWspIniciosFallback() {
    const svcRepo = historialOperativoRepoWsp();
    if (svcRepo && typeof svcRepo.leerIniciosGuardiaDesdeWspIniciosFallback === "function") {
      try {
        return await svcRepo.leerIniciosGuardiaDesdeWspIniciosFallback(depsHistorialOperativoRepoWsp());
      } catch (e) {
        console.warn("[WSP] Historial operativo modular falló al leer fallback wsp_inicios. Se usa fallback legacy.", e);
      }
    }

    const guardiaFecha = getGuardiaFechaISO();
    const selectCols = "id,guardia_fecha,operativo_key,orden_num,texto_ref,horario,lugar,tipo_corto,personal,moviles,motos,elementos";

    try {
      const params = new URLSearchParams({
        select: selectCols,
        guardia_fecha: `eq.${guardiaFecha}`,
        order: "id.desc",
        limit: "300",
      });

      const r = await fetch(`${SUPABASE_URL}/rest/v1/wsp_inicios?${params.toString()}`, {
        headers: headersSupabase({ Accept: "application/json" }),
      });

      if (!r.ok) {
        console.warn("[WSP] No se pudo leer fallback wsp_inicios para INFORMES:", r.status, await r.text().catch(() => ""));
        return [];
      }

      const finalizados = await leerOperativoKeysFinalizadosGuardiaSupabase();
      const data = await r.json();
      return deduplicarIniciosInformeWsp((Array.isArray(data) ? data : [])
        .map(normalizarInicioGuardado)
        .filter((item) => item && item.operativo_key && !finalizados.has(limpiarTextoSimple(item.operativo_key))));
    } catch (e) {
      console.warn("[WSP] Error leyendo fallback wsp_inicios para INFORMES.", e);
      return [];
    }
  }

  async function leerIniciosGuardiaDesdeSupabase() {
    const svcRepo = historialOperativoRepoWsp();
    if (svcRepo && typeof svcRepo.leerIniciosGuardiaDesdeSupabase === "function") {
      try {
        return await svcRepo.leerIniciosGuardiaDesdeSupabase(depsHistorialOperativoRepoWsp());
      } catch (e) {
        console.warn("[WSP] Historial operativo modular falló al leer inicios de guardia. Se usa fallback legacy.", e);
      }
    }

    // Fuente única para INFORMES: Supabase canónico.
    // No usa localStorage, no usa wsp_inicios y no mezcla caches viejas.
    try {
      if (window.BMZCN?.OperativosRepo?.leerOperativosGuardia) {
        const rows = await window.BMZCN.OperativosRepo.leerOperativosGuardia({ guardiaFecha: getGuardiaFechaISO(), limit: 500 });
        const inicios = (Array.isArray(rows) ? rows : [])
          .filter((row) => limpiarTextoSimple(row?.estado_real || row?.estado || "").toUpperCase() === "EN_CURSO")
          .map(normalizarInicioDesdeVistaGuardiaWsp)
          .filter((item) => item && item.operativo_key);
        return deduplicarIniciosInformeWsp(inicios);
      }
    } catch (e) {
      console.warn("[WSP] Error leyendo operativos EN CURSO desde OperativosRepo.", e);
    }

    // Respaldo directo a vista en curso si el repo no está cargado. Sigue siendo Supabase.
    const enCurso = await leerOperativosEnCursoDesdeEstadoSupabase();
    return deduplicarIniciosInformeWsp(Array.isArray(enCurso) ? enCurso : []);
  }

  function construirFranjaInformeDesdeInicio(inicio, idx = 0) {
    const data = normalizarInicioGuardado(inicio);
    if (!data) return null;
    const key = limpiarTextoSimple(data.operativo_key || `inicio-${idx}`);
    return {
      __key: `inicio-${idx}-${key}`,
      __desdeInicioGuardado: true,
      __operativoKey: key,
      __ordenNum: limpiarTextoSimple(data.orden_num || ""),
      __ordenTextoRef: limpiarTextoSimple(data.texto_ref || ""),
      __tipoPublicado: limpiarTextoSimple(data.tipo_corto || "Operativo iniciado"),
      __fechaOperativo: limpiarTextoSimple(data.guardia_fecha || getGuardiaFechaISO()),
      __inicioTs: Date.parse(`${data.guardia_fecha || getGuardiaFechaISO()}T${String(data.horario || "00:00").slice(0,5)}:00`) || Date.now(),
      titulo: limpiarTextoSimple(data.tipo_corto || "Operativo iniciado"),
      horario: limpiarTextoSimple(data.horario || ""),
      lugar: limpiarTextoSimple(data.lugar || ""),
      fecha: limpiarTextoSimple(data.guardia_fecha || getGuardiaFechaISO()),
      __inicioGuardadoPayload: data,
    };
  }

  function selectorOperativoUiWsp() {
    return window.WSP?.modules?.selectorOperativoUi || window.WSP?.ui?.selectorOperativo || null;
  }

  function selectorCargaUiWsp() {
    return window.WSP?.modules?.selectorCargaUi || window.WSP?.ui?.selectorCarga || null;
  }

  function selectorEstadoUiWsp() {
    return window.WSP?.modules?.selectorEstadoUi || window.WSP?.ui?.selectorEstado || null;
  }

  function selectorContextoUiWsp() {
    return window.WSP?.modules?.selectorContextoUi || window.WSP?.ui?.selectorContexto || null;
  }

  function informesFlujoUiWsp() {
    return window.WSP?.modules?.informesFlujoUi || window.WSP?.ui?.informesFlujo || null;
  }

  function textoContextoInformeInicioWsp(inicio, franja, opts = {}) {
    const ui = selectorContextoUiWsp();
    const mensajes = {
      sinFranja: "No hay operativos iniciados para vincular el informe.",
      sinInicio: "No hay INICIO guardado para este operativo. Envíe primero el INICIA.",
      ...(opts.mensajes || {}),
    };

    if (ui && typeof ui.resolverTextoContextoInforme === "function") {
      return ui.resolverTextoContextoInforme({
        inicio,
        franja,
        mensajes,
        deps: {
          normalizarLugar,
          lineaDesdeArray,
        },
      });
    }

    if (!franja) return mensajes.sinFranja;
    if (!inicio) return mensajes.sinInicio;

    const moviles = lineaDesdeArray(inicio.moviles, "/");
    const motos = lineaDesdeArray(inicio.motos, "/");
    const movilidad = [moviles, motos].filter((v) => v && v !== "/").join(" / ") || "/";
    return `Lugar: ${normalizarLugar(inicio.lugar || franja.lugar)} | Móviles: ${movilidad}`;
  }

  function setTextoContextoInformeWsp(el, texto) {
    const ui = selectorContextoUiWsp();
    if (ui && typeof ui.setTextoContexto === "function") {
      return ui.setTextoContexto(el, texto);
    }
    if (el) el.textContent = String(texto || "");
  }

  async function refrescarContextoInformeGenericoWsp(config = {}) {
    const ui = selectorContextoUiWsp();
    const elemento = config.elemento || null;

    if (ui && typeof ui.refrescarContextoInforme === "function") {
      return ui.refrescarContextoInforme({
        elemento,
        activo: config.activo,
        getFranja: () => franjaSeleccionada,
        seleccionarDefault: config.seleccionarDefault,
        getInicio: config.obtenerInicio,
        setTexto: setTextoContextoInformeWsp,
        resolverTexto: textoContextoInformeInicioWsp,
        deps: {
          normalizarLugar,
          lineaDesdeArray,
        },
      });
    }

    if (!elemento || (typeof config.activo === "function" && !config.activo())) return null;
    if (!franjaSeleccionada && typeof config.seleccionarDefault === "function") {
      await config.seleccionarDefault();
    }
    if (!franjaSeleccionada) {
      setTextoContextoInformeWsp(elemento, textoContextoInformeInicioWsp(null, null));
      return null;
    }
    const inicio = typeof config.obtenerInicio === "function" ? await config.obtenerInicio(franjaSeleccionada) : null;
    setTextoContextoInformeWsp(elemento, textoContextoInformeInicioWsp(inicio, franjaSeleccionada));
    return inicio;
  }

  function obtenerElementoContextoControlSuperiorWsp() {
    const ui = selectorContextoUiWsp();
    if (ui && typeof ui.asegurarElementoContexto === "function") {
      return ui.asegurarElementoContexto({
        contenedor: bloqueControlSuperior,
        id: "controlSuperiorContexto",
        className: "informe-contexto control-superior-contexto",
        textoInicial: "",
      });
    }
    return document.getElementById("controlSuperiorContexto");
  }

  async function seleccionarOperativoControlSuperiorPorDefecto() {
    const seleccionModular = await seleccionarOperativoInformePorDefectoModularWsp({
      ordenarCandidatos: typeof ordenarCandidatosInformeAlcoholemia === "function"
        ? ordenarCandidatosInformeAlcoholemia
        : ((items) => Array.isArray(items) ? items.slice() : []),
      fallbackUnico: true,
      fallbackPrimero: false,
    });
    if (seleccionModular !== null) return seleccionModular;

    if (!selHorario) return false;
    if (!Array.isArray(operativosCache) || !operativosCache.length || !operativosCache.some((op) => op?.__desdeInicioGuardado)) {
      await cargarOperativosIniciadosParaInformes(selHorario.value || "");
    }
    if (!Array.isArray(operativosCache) || !operativosCache.length) return false;

    if (franjaSeleccionada) {
      try {
        const inicioActual = await leerInicioDesdeSupabase(franjaSeleccionada);
        if (inicioActual) return true;
      } catch {}
    }

    const ordenar = typeof ordenarCandidatosInformeAlcoholemia === "function"
      ? ordenarCandidatosInformeAlcoholemia
      : ((items) => Array.isArray(items) ? items.slice() : []);
    const candidatos = ordenar(operativosCache);

    for (const candidato of candidatos) {
      try {
        const inicio = await leerInicioDesdeSupabase(candidato);
        if (!inicio) continue;
        selHorario.value = candidato.__key || "";
        franjaSeleccionada = candidato;
        ordenSeleccionada = null;
        return true;
      } catch {}
    }

    if (!franjaSeleccionada && candidatos.length === 1) {
      const candidato = candidatos[0];
      selHorario.value = candidato.__key || "";
      franjaSeleccionada = candidato;
      ordenSeleccionada = null;
      return true;
    }

    return false;
  }

  async function obtenerInicioParaControlSuperior() {
    const inicioModular = await obtenerInicioSeleccionadoInformeModularWsp({
      seleccionarDefault: seleccionarOperativoControlSuperiorPorDefecto,
    });
    if (inicioModular !== null) return inicioModular;

    if (!franjaSeleccionada) await seleccionarOperativoControlSuperiorPorDefecto();
    if (!franjaSeleccionada) return null;
    return franjaSeleccionada.__inicioGuardadoPayload || await leerInicioDesdeSupabase(franjaSeleccionada) || cargarInicioGuardadoCoincidente() || cargarInicioLocal();
  }

  async function refrescarContextoControlSuperior() {
    const elemento = obtenerElementoContextoControlSuperiorWsp();
    return refrescarContextoInformeGenericoWsp({
      elemento,
      activo: esControlSuperiorActivo,
      seleccionarDefault: seleccionarOperativoControlSuperiorPorDefecto,
      obtenerInicio: obtenerInicioParaControlSuperior,
    });
  }

  function refrescarContextosInformesActivosWsp() {
    const items = [
      { activo: esInformeAlcoholemiaActivo, refrescar: refrescarContextoInformeAlcoholemia },
      { activo: esInformeDecto460Activo, refrescar: refrescarContextoInformeDecto460 },
      { activo: esControlSuperiorActivo, refrescar: refrescarContextoControlSuperior },
    ];

    const ui = selectorContextoUiWsp();
    const tarea = ui && typeof ui.refrescarContextosActivos === "function"
      ? ui.refrescarContextosActivos(items)
      : Promise.all(items.map(async (item) => {
          const activo = typeof item.activo === "function" ? !!item.activo() : item.activo !== false;
          if (!activo || typeof item.refrescar !== "function") return null;
          return item.refrescar();
        }));

    return Promise.resolve(tarea).catch((error) => {
      console.warn("[WSP] No se pudieron refrescar contextos activos de informes.", error);
      return [];
    });
  }


  function sincronizarWidgetsAuxiliaresInformesWsp() {
    const ui = informesFlujoUiWsp();
    if (ui && typeof ui.sincronizarWidgetsAuxiliares === "function") {
      return ui.sincronizarWidgetsAuxiliares({
        sincronizarUIAlcoholimetro,
        sincronizarUIQrzDominio,
      });
    }

    sincronizarUIAlcoholimetro();
    sincronizarUIQrzDominio();
  }

  function cargarOperativosYRefrescarInformeWsp(refrescarContexto) {
    const ui = informesFlujoUiWsp();
    if (ui && typeof ui.cargarOperativosYRefrescar === "function") {
      return ui.cargarOperativosYRefrescar({
        valorSeleccionado: selHorario?.value || "",
        cargarOperativos: cargarOperativosIniciadosParaInformes,
        actualizarDatosFranja,
        refrescarContexto,
      });
    }

    return cargarOperativosIniciadosParaInformes(selHorario?.value || "").then(() => {
      actualizarDatosFranja();
      if (typeof refrescarContexto === "function") return refrescarContexto();
      return null;
    });
  }

  function activarPantallaInformeWsp(config = {}) {
    const ui = informesFlujoUiWsp();
    const deps = {
      valorSeleccionado: selHorario?.value || "",
      cargarOperativos: cargarOperativosIniciadosParaInformes,
      actualizarDatosFranja,
      sincronizarUIAlcoholimetro,
      sincronizarUIQrzDominio,
      ...config,
    };

    if (ui && typeof ui.activarPantallaInforme === "function") {
      return ui.activarPantallaInforme(deps);
    }

    if (typeof deps.aplicarVisibilidad === "function") deps.aplicarVisibilidad();
    const tarea = cargarOperativosYRefrescarInformeWsp(deps.refrescarContexto);
    if (typeof deps.postActivar === "function") deps.postActivar();
    sincronizarWidgetsAuxiliaresInformesWsp();
    return tarea;
  }

  function configVisibilidadPantallaInformeWsp(tipoPantalla) {
    return {
      tipoPantalla,
      setControlSuperiorActiva: setUIControlSuperiorActiva,
      setAlcoholemiaActiva: setUIInformeAlcoholemiaActiva,
      setDecto460Activa: setUIInformeDecto460Activa,
    };
  }

  function aplicarVisibilidadPantallaInformeWsp(tipoPantalla) {
    const ui = informesFlujoUiWsp();
    const deps = configVisibilidadPantallaInformeWsp(tipoPantalla);

    if (ui && typeof ui.aplicarVisibilidadPantallaInforme === "function") {
      return ui.aplicarVisibilidadPantallaInforme(deps);
    }

    const tipo = limpiarTextoSimple(tipoPantalla).toUpperCase();
    const esControlSuperior = tipo === "CONTROL_SUPERIOR";
    const esAlcoholemia = tipo === "ALCOHOLEMIA";
    const esDecto460 = tipo === "DECTO460";

    // Primero se apagan las pantallas que no corresponden y recién después
    // se activa la elegida. Evita que un setUI...Activa(false) posterior
    // vuelva a mostrar la UI base o esconda el formulario activo.
    if (!esControlSuperior) setUIControlSuperiorActiva(false);
    if (!esAlcoholemia) setUIInformeAlcoholemiaActiva(false);
    if (!esDecto460) setUIInformeDecto460Activa(false);

    if (esControlSuperior) setUIControlSuperiorActiva(true);
    if (esAlcoholemia) setUIInformeAlcoholemiaActiva(true);
    if (esDecto460) setUIInformeDecto460Activa(true);

    return { tipo, esControlSuperior, esAlcoholemia, esDecto460 };
  }

  function desactivarPantallasInformesWsp() {
    const ui = informesFlujoUiWsp();
    const deps = configVisibilidadPantallaInformeWsp("");

    if (ui && typeof ui.desactivarPantallasInformes === "function") {
      return ui.desactivarPantallasInformes(deps);
    }

    return aplicarVisibilidadPantallaInformeWsp("");
  }

  function activarPantallaInformePorTipoWsp(tipoPantalla, refrescarContexto, opts = {}) {
    const ui = informesFlujoUiWsp();

    if (ui && typeof ui.activarPantallaInformePorTipo === "function") {
      return ui.activarPantallaInformePorTipo({
        valorSeleccionado: selHorario?.value || "",
        cargarOperativos: cargarOperativosIniciadosParaInformes,
        actualizarDatosFranja,
        sincronizarUIAlcoholimetro,
        sincronizarUIQrzDominio,
        refrescarContexto,
        postActivar: opts.postActivar,
        ...configVisibilidadPantallaInformeWsp(tipoPantalla),
      });
    }

    return activarPantallaInformeWsp({
      aplicarVisibilidad: () => aplicarVisibilidadPantallaInformeWsp(tipoPantalla),
      refrescarContexto,
      postActivar: opts.postActivar,
    });
  }


  function prepararMenuInformesWsp() {
    const ui = informesFlujoUiWsp();
    const limpiarSeleccionMenuInformes = () => {
      operativosCache = [];
      franjaSeleccionada = null;
      ordenSeleccionada = null;
    };

    const config = {
      aplicarPantallaExclusiva: aplicarPantallaExclusivaWsp,
      desactivarPantallasInformes: desactivarPantallasInformesWsp,
      setPersonalVisible,
      setMovilidadVisible,
      setElementosVisibles,
      setObservacionesVisible,
      setTituloOperativosIniciados,
      limpiarSeleccion: limpiarSeleccionMenuInformes,
      prepararSelectorInformesMenu: prepararSelectorInformesMenuWsp,
      divFinaliza,
      divDetalles,
    };

    if (ui && typeof ui.prepararMenuInformes === "function") {
      return ui.prepararMenuInformes(config);
    }

    aplicarPantallaExclusivaWsp("INFORMES_MENU");
    desactivarPantallasInformesWsp();
    setPersonalVisible(false);
    setMovilidadVisible(false);
    setElementosVisibles(false);
    setObservacionesVisible(false);
    setTituloOperativosIniciados(true);
    limpiarSeleccionMenuInformes();
    prepararSelectorInformesMenuWsp();
    if (divFinaliza) divFinaliza.classList.add("hidden");
    if (divDetalles) divDetalles.classList.add("hidden");
    return { ok: true, modo: "INFORMES_MENU" };
  }


  function resetearInformesUIWsp() {
    const ui = informesFlujoUiWsp();
    const config = {
      desactivarPantallasInformes: desactivarPantallasInformesWsp,
      resetControlSuperior: () => {
        if (window.ControlSuperior && typeof window.ControlSuperior.reset === "function") {
          window.ControlSuperior.reset();
        }
      },
      limpiarInformeAlcoholemia,
      limpiarInformeDecto460,
      setObservacionesVisible,
    };

    if (ui && typeof ui.resetearInformesUI === "function") {
      return ui.resetearInformesUI(config);
    }

    desactivarPantallasInformesWsp();
    config.resetControlSuperior();
    limpiarInformeAlcoholemia();
    limpiarInformeDecto460();
    setObservacionesVisible(true);
    return { ok: true, accion: "resetear_informes_ui" };
  }


  async function seleccionarOperativoInformePorDefectoModularWsp(config = {}) {
    const ui = selectorContextoUiWsp();
    if (!ui || typeof ui.seleccionarOperativoIniciadoPorDefecto !== "function") return null;

    try {
      const resultado = await ui.seleccionarOperativoIniciadoPorDefecto({
        selHorario,
        getOperativos: () => operativosCache,
        cargarOperativos: async (valorSeleccionado) => {
          await cargarOperativosIniciadosParaInformes(valorSeleccionado || "");
          return operativosCache;
        },
        getFranjaSeleccionada: () => franjaSeleccionada,
        seleccionarFranja: (franja) => {
          if (!franja) return;
          if (selHorario) selHorario.value = franja.__key || "";
          franjaSeleccionada = franja;
          ordenSeleccionada = null;
        },
        leerInicio: leerInicioDesdeSupabase,
        ordenarCandidatos: config.ordenarCandidatos,
        afterSelect: config.afterSelect,
        fallbackUnico: config.fallbackUnico !== false,
        fallbackPrimero: !!config.fallbackPrimero,
        usarInicioLocal: !!config.usarInicioLocal,
        cargarInicioLocal: config.usarInicioLocal ? cargarInicioLocal : null,
        puntuarCoincidenciaInicio,
      });

      return !!(resultado && resultado.ok);
    } catch (error) {
      console.warn("[WSP] Selector modular de informes falló. Se usa fallback legacy.", error);
      return null;
    }
  }

  function crearConfigInicioInformeWsp(config = {}) {
    return {
      getFranja: () => franjaSeleccionada,
      seleccionarDefault: config.seleccionarDefault,
      leerInicio: leerInicioDesdeSupabase,
      cargarInicioGuardadoCoincidente,
      cargarInicioLocal,
      refrescarContexto: config.refrescarContexto,
      mensaje: config.mensaje,
      mensajeSinInicio: config.mensajeSinInicio,
      mostrarAlerta: config.mostrarAlerta,
      alert,
      obtenerInicio: config.obtenerInicio,
      requerirInicio: config.requerirInicio,
      resolverInicioRequerido: config.resolverInicioRequerido,
    };
  }

  async function obtenerInicioSeleccionadoInformeModularWsp(config = {}) {
    const ui = selectorContextoUiWsp();
    if (!ui || typeof ui.obtenerInicioSeleccionadoInforme !== "function") return null;

    try {
      return await ui.obtenerInicioSeleccionadoInforme(crearConfigInicioInformeWsp(config));
    } catch (error) {
      console.warn("[WSP] Obtención modular de INICIO de informe falló. Se usa fallback legacy.", error);
      return null;
    }
  }

  async function requerirInicioSeleccionadoInformeModularWsp(config = {}) {
    const ui = selectorContextoUiWsp();
    if (!ui || typeof ui.requerirInicioSeleccionadoInforme !== "function") return null;

    try {
      return await ui.requerirInicioSeleccionadoInforme(crearConfigInicioInformeWsp(config));
    } catch (error) {
      console.warn("[WSP] Validación modular de INICIO de informe falló. Se usa fallback legacy.", error);
      return null;
    }
  }


  async function resolverInicioRequeridoInformeModularWsp(config = {}) {
    const ui = selectorContextoUiWsp();
    if (!ui || typeof ui.resolverInicioRequeridoInforme !== "function") return null;

    try {
      return await ui.resolverInicioRequeridoInforme(crearConfigInicioInformeWsp(config));
    } catch (error) {
      console.warn("[WSP] Resolución modular de INICIO requerido para informe falló. Se usa fallback legacy.", error);
      return null;
    }
  }


  async function resolverInicioParaEnvioInformeWsp(config = {}) {
    const ui = selectorContextoUiWsp();

    if (ui && typeof ui.resolverInicioParaEnvioInforme === "function") {
      try {
        return await ui.resolverInicioParaEnvioInforme(crearConfigInicioInformeWsp(config));
      } catch (error) {
        console.warn("[WSP] Resolución modular de INICIO para envío de informe falló. Se usa fallback legacy.", error);
      }
    }

    const inicioRes = await resolverInicioRequeridoInformeModularWsp(config);
    if (inicioRes) {
      if (!inicioRes.ok) return null;
      return inicioRes.inicio || null;
    }

    const inicioReq = await requerirInicioSeleccionadoInformeModularWsp(config);
    if (inicioReq && !inicioReq.ok) return null;

    const inicio = inicioReq?.inicio || (typeof config.obtenerInicio === "function" ? await config.obtenerInicio() : null);
    if (inicio) return inicio;

    const mensaje = limpiarTextoSimple(config.mensaje || "No hay INICIO guardado para este operativo.");
    if (config.mostrarAlerta !== false) alert(mensaje);
    return null;
  }


  function resolverCambioSeleccionOperativoWsp() {
    const mod = selectorEstadoUiWsp();
    if (mod && typeof mod.resolverCambioSeleccion === "function") {
      return mod.resolverCambioSeleccion({
        selHorario,
        operativos: operativosCache,
        chkMostrarResultadosFinaliza,
        chkPresenciaActiva,
      });
    }

    const key = selHorario?.value || "";
    if (chkMostrarResultadosFinaliza) chkMostrarResultadosFinaliza.checked = false;
    if (chkPresenciaActiva) chkPresenciaActiva.checked = false;

    return {
      key,
      franjaSeleccionada: operativosCache.find((item) => item.__key === key) || null,
      ordenSeleccionada: null,
    };
  }

  function crearOpcionHorarioWsp(operativo) {
    const ui = selectorOperativoUiWsp();
    if (ui && typeof ui.crearOpcionHorario === "function") {
      return ui.crearOpcionHorario(operativo);
    }

    const opt = document.createElement("option");
    opt.value = operativo.__key;
    opt.text = construirTextoOpcionHorario(operativo);
    opt.title = construirTextoOpcionHorario(operativo);
    return opt;
  }

  function renderizarSelectorOperativosWsp(operativos = [], opts = {}) {
    const lista = Array.isArray(operativos) ? operativos : [];
    const ui = selectorCargaUiWsp();

    if (ui && typeof ui.renderizarSelectorOperativos === "function") {
      return ui.renderizarSelectorOperativos({
        selHorario,
        operativos: lista,
        placeholderConItems: opts.placeholderConItems || "Seleccionar Operativo",
        placeholderVacio: opts.placeholderVacio || opts.placeholderConItems || "Seleccionar Operativo",
        valorSeleccionado: opts.valorSeleccionado || "",
        selectorDefault: opts.selectorDefault,
        actualizarContadorOperativosWsp,
        deps: {
          crearOpcionHorario: crearOpcionHorarioWsp,
          construirTextoOpcionHorario,
        },
      });
    }

    if (!selHorario) return "";

    selHorario.innerHTML = lista.length
      ? `<option value="">${opts.placeholderConItems || "Seleccionar Operativo"}</option>`
      : `<option value="">${opts.placeholderVacio || opts.placeholderConItems || "Seleccionar Operativo"}</option>`;

    lista.forEach((operativo) => selHorario.appendChild(crearOpcionHorarioWsp(operativo)));

    if (opts.valorSeleccionado && lista.some((item) => item.__key === opts.valorSeleccionado)) {
      selHorario.value = opts.valorSeleccionado;
    } else if (typeof opts.selectorDefault === "function") {
      const seleccionado = opts.selectorDefault(lista);
      selHorario.value = typeof seleccionado === "string" ? seleccionado : (seleccionado?.__key || "");
    } else {
      selHorario.value = "";
    }

    actualizarContadorOperativosWsp(lista.length);
    return selHorario.value || "";
  }

  function setTituloOperativosIniciados(modoIniciados) {
    const ui = selectorOperativoUiWsp();
    if (ui && typeof ui.setTituloOperativosIniciados === "function") {
      return ui.setTituloOperativosIniciados(modoIniciados);
    }
    try {
      const label = document.querySelector(".operativos-title-label");
      if (label) label.textContent = modoIniciados ? "OPERATIVOS INICIADOS" : "OPERATIVOS";
    } catch {}
  }

  async function cargarOperativosIniciadosParaInformes(valorSeleccionado = "") {
    if (!selHorario) return [];

    const uiCarga = selectorCargaUiWsp();
    if (uiCarga && typeof uiCarga.prepararBusquedaIniciados === "function") {
      uiCarga.prepararBusquedaIniciados({
        selHorario,
        setTituloOperativosIniciados,
        actualizarContadorOperativosWsp,
      });
    } else {
      setTituloOperativosIniciados(true);
      selHorario.disabled = true;
      selHorario.innerHTML = '<option value="">Buscando operativos iniciados...</option>';
      actualizarContadorOperativosWsp(0);
    }

    operativosCache = [];
    franjaSeleccionada = null;
    ordenSeleccionada = null;

    const inicios = await leerIniciosGuardiaDesdeSupabase();
    const candidatos = ordenarCandidatosInformeAlcoholemia(
      inicios.map(construirFranjaInformeDesdeInicio).filter(Boolean)
    );

    operativosCache = candidatos.slice();

    renderizarSelectorOperativosWsp(operativosCache, {
      placeholderConItems: "Seleccionar Operativo Iniciado",
      placeholderVacio: "No hay operativos iniciados",
      valorSeleccionado,
      selectorDefault: (items) => {
        if (items.length === 1) return items[0].__key;
        if (items.length > 1) return ordenarCandidatosInformeAlcoholemia(items)[0].__key;
        return "";
      },
    });

    franjaSeleccionada = operativosCache.find((item) => item.__key === selHorario.value) || null;
    ordenSeleccionada = null;
    selHorario.disabled = false;
    actualizarContadorOperativosWsp(operativosCache.length);
    return operativosCache;
  }

  function construirOperativoPlano(franja, orden, idxOrden, idxFranja) {
    const ui = selectorOperativoUiWsp();
    if (ui && typeof ui.construirOperativoPlano === "function") {
      return ui.construirOperativoPlano(franja, orden, idxOrden, idxFranja);
    }
    return {
      ...franja,
      __key: `${idxOrden}-${idxFranja}`,
      __ordenNum: limpiarTextoSimple(franja?.__ordenNum || orden?.num || ""),
      __ordenTextoRef: limpiarTextoSimple(franja?.__ordenTextoRef || orden?.textoRef || ""),
    };
  }

  function booleanoMetaTemporal(value, fallback = false) {
    if (value === true || value === false) return value;
    if (typeof value === "string") {
      const t = value.trim().toLowerCase();
      if (["true", "1", "si", "sí"].includes(t)) return true;
      if (["false", "0", "no"].includes(t)) return false;
    }
    return fallback;
  }

  function obtenerMetaTemporalFranja(franja = {}) {
    return parseJsonObjectWsp(franja?.__wspMetaTemporal) || {};
  }

  function obtenerRelacionTemporalFranja(franja = {}) {
    return limpiarTextoSimple(obtenerMetaTemporalFranja(franja).relacion_temporal || franja?.relacionTemporal || "individual");
  }

  function obtenerFinalizadoGrupoTemporalFranja(franja = {}) {
    const meta = obtenerMetaTemporalFranja(franja);
    return limpiarTextoSimple(meta.finalizado_grupo_id || franja?.finalizadoGrupoId || franja?.wspFinalizadoGrupoId || "");
  }

  function debeMostrarInicioWsp(franja = {}) {
    const meta = obtenerMetaTemporalFranja(franja);
    if (Object.prototype.hasOwnProperty.call(meta, "inicio_visible_wsp")) {
      return booleanoMetaTemporal(meta.inicio_visible_wsp, true);
    }
    return true;
  }

  function debeMostrarFinalizadoWsp(franja = {}) {
    const meta = obtenerMetaTemporalFranja(franja);
    if (Object.prototype.hasOwnProperty.call(meta, "finalizado_visible_wsp")) {
      return booleanoMetaTemporal(meta.finalizado_visible_wsp, true);
    }
    return true;
  }

  function esFinalizadoFusionadoTemporal(franja = {}) {
    const meta = obtenerMetaTemporalFranja(franja);
    return booleanoMetaTemporal(meta.finalizado_fusionado, false);
  }

  function extraerHorarioPartesWsp(horario = "") {
    const m = String(horario || "").match(/(\d{1,2}:\d{2})\s*A\s*((?:\d{1,2}:\d{2})|FINALIZAR)/i);
    if (!m) return { desde: "", hasta: "" };
    return { desde: limpiarTextoSimple(m[1]), hasta: limpiarTextoSimple(m[2]).toUpperCase() };
  }

  function minutosDesdeHoraWsp(value = "") {
    if (/FINALIZAR/i.test(value)) return 24 * 60;
    const m = String(value || "").match(/^(\d{1,2}):(\d{2})$/);
    if (!m) return Number.MAX_SAFE_INTEGER;
    return (Number(m[1]) * 60) + Number(m[2]);
  }

  function pushUnicoTextoWsp(out, value) {
    const clean = limpiarTextoSimple(value);
    if (clean && !out.includes(clean)) out.push(clean);
  }

  function obtenerCierresInternosTemporalWsp(franja = {}) {
    const out = [];
    const fuentes = [
      franja?.cierresInternosTemporal,
      franja?.__registroOriginalPublicado?.cierresInternosTemporal,
      franja?.__registroOriginalPublicado?.cierres_internos_temporal,
      obtenerMetaTemporalFranja(franja).cierres_internos_temporal,
    ];

    fuentes.forEach((fuente) => {
      if (!Array.isArray(fuente)) return;
      fuente.forEach((item) => {
        const texto = limpiarTextoSimple(item?.texto || item?.observacion || construirTextoCierreInternoTemporalWsp(item));
        if (texto) pushUnicoTextoWsp(out, texto);
      });
    });

    return out;
  }

  function normalizarListaObjetosTemporalWsp(value) {
    if (!value) return [];
    if (Array.isArray(value)) return value.filter(Boolean);
    if (typeof value === "object") return [value];
    if (typeof value === "string") {
      const raw = value.trim();
      if (!raw) return [];
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed.filter(Boolean);
        if (parsed && typeof parsed === "object") return [parsed];
      } catch {}
    }
    return [];
  }

  function obtenerRelacionesTemporalesWsp(franja = {}) {
    const meta = obtenerMetaTemporalFranja(franja);
    const registro = franja?.__registroOriginalPublicado || {};
    const fuentes = [
      meta.relacionados,
      meta.relaciones_temporales,
      franja?.relacionesTemporales,
      franja?.relaciones_temporales,
      registro.relacionesTemporales,
      registro.relaciones_temporales,
    ];

    const out = [];
    fuentes.forEach((fuente) => {
      normalizarListaObjetosTemporalWsp(fuente).forEach((item) => {
        if (item && typeof item === "object") out.push(item);
      });
    });
    return out;
  }

  function construirReferenciaOperativoTemporalWsp(info = {}) {
    const tipo = limpiarTextoSimple(info?.tipo || info?.titulo || "operativo");
    const orden = limpiarTextoSimple(info?.orden || info?.ordenVistaPrevia || info?.orden_vista_previa || "");
    const base = [tipo, orden].filter(Boolean).join(" ").replace(/\s+/g, " ").trim();
    return base || "operativo relacionado";
  }

  function construirTextoCierreInternoTemporalWsp(item = {}) {
    if (!item || typeof item !== "object") return limpiarTextoSimple(item);
    const hora = limpiarTextoSimple(item.hora || item.horaHasta || item.hora_hasta || "xx:xx");
    const referencia = construirReferenciaOperativoTemporalWsp(item);
    return `Siendo las ${hora} hs finalizó ${referencia} sin novedad.`.replace(/\s+/g, " ").trim();
  }

  function minutosHorarioRelativoWsp(hora = "", inicioReferencia = "") {
    const minuto = minutosDesdeHoraWsp(hora);
    if (!Number.isFinite(minuto) || minuto === Number.MAX_SAFE_INTEGER) return minuto;
    const inicio = minutosDesdeHoraWsp(inicioReferencia);
    if (!Number.isFinite(inicio) || inicio === Number.MAX_SAFE_INTEGER) return minuto;
    return minuto <= inicio ? minuto + (24 * 60) : minuto;
  }

  function debeAgregarContinuidadConcatenacionWsp(franja = {}, relacion = {}) {
    const tipo = limpiarTextoSimple(relacion?.tipo || relacion?.relacion_temporal || "");
    if (tipo !== "concatenacion") return false;

    const rol = limpiarTextoSimple(relacion?.rol || relacion?.rol_temporal || "");
    if (rol === "inicia_primero") return true;
    if (rol === "continua_despues") return false;

    const actual = extraerHorarioPartesWsp(franja?.horario || "");
    const relacionado = relacion?.con || relacion?.relacionado || relacion?.operativo || {};
    const finActual = minutosHorarioRelativoWsp(actual.hasta, actual.desde);
    const finRelacionado = minutosHorarioRelativoWsp(relacionado.horaHasta || relacionado.hora_hasta || "", relacionado.horaDesde || relacionado.hora_desde || "");
    return finRelacionado > finActual;
  }

  function obtenerObservacionesDesdeRelacionesTemporalesWsp(franja = {}) {
    const out = [];

    obtenerRelacionesTemporalesWsp(franja).forEach((relacion) => {
      const tipo = limpiarTextoSimple(relacion?.tipo || relacion?.relacion_temporal || "");
      const rol = limpiarTextoSimple(relacion?.rol || relacion?.rol_temporal || "");
      const relacionado = relacion?.con || relacion?.relacionado || relacion?.operativo || null;

      if (tipo === "absorcion_inicio_distinto_final_distinto" && rol === "principal" && relacionado) {
        pushUnicoTextoWsp(out, construirTextoCierreInternoTemporalWsp({
          hora: relacionado.horaHasta || relacionado.hora_hasta || "",
          tipo: relacionado.tipo || relacionado.titulo || "operativo",
          orden: relacionado.orden || relacionado.ordenVistaPrevia || "",
        }));
      }

      if (debeAgregarContinuidadConcatenacionWsp(franja, relacion) && relacionado) {
        const referencia = construirReferenciaOperativoTemporalWsp(relacionado);
        pushUnicoTextoWsp(out, `Continúa operativo en el lugar conforme ${referencia}.`);
      }
    });

    return out;
  }

  function obtenerObservacionesTemporalesFranja(franja = {}) {
    const out = [];
    const meta = obtenerMetaTemporalFranja(franja);
    pushUnicoTextoWsp(out, meta.observacion_temporal || franja?.observacionTemporal || "");
    obtenerCierresInternosTemporalWsp(franja).forEach((linea) => pushUnicoTextoWsp(out, linea));
    obtenerObservacionesDesdeRelacionesTemporalesWsp(franja).forEach((linea) => pushUnicoTextoWsp(out, linea));

    if (Array.isArray(franja?.__franjasOrigenTemporal)) {
      franja.__franjasOrigenTemporal.forEach((origen) => {
        obtenerCierresInternosTemporalWsp(origen).forEach((linea) => pushUnicoTextoWsp(out, linea));
        obtenerObservacionesDesdeRelacionesTemporalesWsp(origen).forEach((linea) => pushUnicoTextoWsp(out, linea));
      });
    }
    return out;
  }

  function construirFranjaFinalizadoFusionadoWsp(items = []) {
    const lista = (Array.isArray(items) ? items : []).filter(Boolean);
    if (!lista.length) return null;

    const ordenadas = lista.slice().sort((a, b) => {
      const ai = Number.isFinite(a.__inicioTs) ? a.__inicioTs : Number.MAX_SAFE_INTEGER;
      const bi = Number.isFinite(b.__inicioTs) ? b.__inicioTs : Number.MAX_SAFE_INTEGER;
      return ai - bi;
    });

    const base = ordenadas[0];
    const tipos = [];
    const ordenes = [];
    const archivos = [];
    const observaciones = [];

    ordenadas.forEach((item) => {
      pushUnicoTextoWsp(tipos, item.__tipoPublicado || obtenerTipoCortoFranja(item));
      normalizarArrayJsonWsp(item.__ordenesOrigen || item.__ordenNum).forEach((orden) => pushUnicoTextoWsp(ordenes, orden));
      normalizarArrayJsonWsp(item.__archivosOrigen || item.__ordenTextoRef).forEach((archivo) => pushUnicoTextoWsp(archivos, archivo));
      obtenerObservacionesTemporalesFranja(item).forEach((linea) => pushUnicoTextoWsp(observaciones, linea));
    });

    const horarios = ordenadas.map((item) => extraerHorarioPartesWsp(item.horario));
    const desde = horarios
      .map((h) => h.desde)
      .filter(Boolean)
      .sort((a, b) => minutosDesdeHoraWsp(a) - minutosDesdeHoraWsp(b))[0] || extraerHorarioPartesWsp(base.horario).desde;
    const hasta = horarios
      .map((h) => h.hasta)
      .filter(Boolean)
      .sort((a, b) => minutosDesdeHoraWsp(b) - minutosDesdeHoraWsp(a))[0] || extraerHorarioPartesWsp(base.horario).hasta;

    const tipoTxt = tipos.length ? tipos.join(" Y ") : limpiarTextoSimple(base.titulo || "Operativo");
    const ordenTxt = ordenes.join(" / ");
    const titulo = limpiarTextoSimple([tipoTxt, ordenTxt].filter(Boolean).join(" ")) || base.titulo;
    const grupoId = obtenerFinalizadoGrupoTemporalFranja(base) || `finalizado-${base.__key}`;

    return {
      ...base,
      horario: desde && hasta ? `${desde} A ${hasta}` : base.horario,
      titulo,
      __ordenNum: ordenTxt || base.__ordenNum,
      __ordenTextoRef: archivos.join(" / ") || base.__ordenTextoRef,
      __key: `finalizado-fusionado-${grupoId}`,
      __finalizadoFusionadoVirtual: ordenadas.length > 1,
      __franjasOrigenTemporal: ordenadas,
      __observacionesTemporalesWsp: observaciones,
    };
  }

  function prepararFranjasParaModoWsp(franjas = []) {
    const lista = Array.isArray(franjas) ? franjas : [];
    const esFinaliza = selTipo?.value === "FINALIZA";

    if (!esFinaliza) {
      return lista.filter(debeMostrarInicioWsp);
    }

    const salida = [];
    const gruposFinalFusionado = new Map();

    lista.forEach((franja) => {
      if (!debeMostrarFinalizadoWsp(franja)) return;

      const grupoFinal = obtenerFinalizadoGrupoTemporalFranja(franja);
      if (esFinalizadoFusionadoTemporal(franja) && grupoFinal) {
        if (!gruposFinalFusionado.has(grupoFinal)) gruposFinalFusionado.set(grupoFinal, []);
        gruposFinalFusionado.get(grupoFinal).push(franja);
        return;
      }

      salida.push(franja);
    });

    gruposFinalFusionado.forEach((items) => {
      const fusionado = construirFranjaFinalizadoFusionadoWsp(items);
      if (fusionado) salida.push(fusionado);
    });

    return salida.sort((a, b) => {
      const at = Number.isFinite(a.__inicioTs) ? a.__inicioTs : Number.MAX_SAFE_INTEGER;
      const bt = Number.isFinite(b.__inicioTs) ? b.__inicioTs : Number.MAX_SAFE_INTEGER;
      return at - bt;
    });
  }

  function cargarOperativosDisponibles(valorSeleccionado = "") {
    const uiCarga = selectorCargaUiWsp();
    if (uiCarga && typeof uiCarga.prepararSelectorDisponibles === "function") {
      uiCarga.prepararSelectorDisponibles({ selHorario, setTituloOperativosIniciados });
    } else {
      setTituloOperativosIniciados(false);
      if (selHorario) {
        selHorario.innerHTML = '<option value="">Seleccionar Operativo</option>';
      }
    }

    const ordenes = cargarOrdenesSeguro();
    operativosCache = [];

    ordenes.forEach((orden, idxOrden) => {
      const franjasOrdenadas = (orden.franjas || [])
        .map((franja, idxFranja) => ({ franja, idxFranja, inicio: construirFechaHoraInicioFranja(franja, orden) }))
        .sort((a, b) => {
          const at = a.inicio instanceof Date && !isNaN(a.inicio.getTime()) ? a.inicio.getTime() : Number.MAX_SAFE_INTEGER;
          const bt = b.inicio instanceof Date && !isNaN(b.inicio.getTime()) ? b.inicio.getTime() : Number.MAX_SAFE_INTEGER;
          return at - bt;
        });

      const operativosOrden = [];

      franjasOrdenadas.forEach(({ franja, idxFranja }) => {
        if (!franjaIniciaEnGuardiaActual(franja, orden)) return;
        operativosOrden.push(construirOperativoPlano(franja, orden, idxOrden, idxFranja));
      });

      prepararFranjasParaModoWsp(operativosOrden).forEach((operativo) => {
        operativosCache.push(operativo);
      });
    });

    renderizarSelectorOperativosWsp(operativosCache, {
      placeholderConItems: "Seleccionar Operativo",
      placeholderVacio: "Seleccionar Operativo",
      valorSeleccionado,
    });

    actualizarContadorOperativosWsp(operativosCache.length);
  }

  function textoOperativoWsp() {
    return window.WSP?.modules?.textoOperativo || window.WSP?.textoOperativo || null;
  }

  function limpiarTextoSimple(txt) {
    const mod = textoOperativoWsp();
    if (mod && typeof mod.limpiarTextoSimple === "function") return mod.limpiarTextoSimple(txt);
    return String(txt || "")
      .replace(/\s+/g, " ")
      .replace(/[–—]/g, "-")
      .trim();
  }

  function normalizarBasicoSinAcentos(txt) {
    const mod = textoOperativoWsp();
    if (mod && typeof mod.normalizarBasicoSinAcentos === "function") return mod.normalizarBasicoSinAcentos(txt);
    return limpiarTextoSimple(txt)
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  }

  function obtenerTextoRefOrdenDeFranja(franja) {
    const ui = selectorOperativoUiWsp();
    if (ui && typeof ui.obtenerTextoRefOrdenDeFranja === "function") return ui.obtenerTextoRefOrdenDeFranja(franja);
    return limpiarTextoSimple(franja?.__ordenTextoRef || "");
  }

  function obtenerNumeroOrdenDeFranja(franja) {
    const ui = selectorOperativoUiWsp();
    if (ui && typeof ui.obtenerNumeroOrdenDeFranja === "function") return ui.obtenerNumeroOrdenDeFranja(franja);
    return limpiarTextoSimple(franja?.__ordenNum || "");
  }

  function detectarTiposCombinadosVisualesWsp(fuente = "") {
    const ui = selectorOperativoUiWsp();
    if (ui && typeof ui.detectarTiposCombinadosVisualesWsp === "function") return ui.detectarTiposCombinadosVisualesWsp(fuente);

    const t = normalizarBasicoSinAcentos(fuente);
    const tipos = [];

    function add(label) {
      if (label && !tipos.includes(label)) tipos.push(label);
    }

    const tieneOCV = /\bocv\b|\bcontrol\s+vehicular\b|\boperativo\s+de\s+control\s+vehicular\b/.test(t);
    const tieneAlcoholemia = /\balcoholemia\b|\balcoholimetr/.test(t);
    const tieneDICEP = /\bdicep\b|\bmultiagencial\b|\bmulti\s+agencial\b/.test(t);
    const tieneCinemometro = /\bcinemometro\b|\bcinemómetro\b/.test(t);
    const tieneBalanza = /\bcontrol\s+de\s+peso\b|\bpeso\b|\bbalanza\b|\bbascula\b|\bbasculas\b|\bpesaje\b/.test(t);
    const tieneOrdenamiento = /\bordenamiento\b/.test(t);

    if (tieneOCV) add("OCV");
    if (tieneAlcoholemia) add("Alcoholemia");
    if (tieneDICEP) add("DICEP");
    if (tieneCinemometro) add("Cinemómetro");
    if (tieneBalanza) add("Balanza");
    if (tieneOrdenamiento) add("Ordenamiento");

    return tipos.length > 1 ? tipos.join(" y ") : "";
  }

  function obtenerTipoCortoFranja(franja) {
    const ui = selectorOperativoUiWsp();
    if (ui && typeof ui.obtenerTipoCortoFranja === "function") return ui.obtenerTipoCortoFranja(franja);

    const fuente = normalizarBasicoSinAcentos(
      [franja?.titulo || "", obtenerTextoRefOrdenDeFranja(franja)].join(" ")
    );

    const tipoCombinado = detectarTiposCombinadosVisualesWsp(fuente);
    if (tipoCombinado) return tipoCombinado;

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
    const ui = selectorOperativoUiWsp();
    if (ui && typeof ui.obtenerLugarCortoFranja === "function") return ui.obtenerLugarCortoFranja(franja);

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
    const ui = selectorOperativoUiWsp();
    if (ui && typeof ui.obtenerFuenteVisualFranja === "function") return ui.obtenerFuenteVisualFranja.apply(null, arguments);

    /*
      Fuente visual del selector. No modifica la franja ni el informe:
      solo junta todos los campos posibles donde puede venir el tipo real.
      Esto evita que una fusión OCV + ALCOHOLEMIA se vea como un solo tipo
      cuando Supabase o una franja virtual guardan el tipo combinado en otro campo.
    */
    const partes = [];
    const vistos = new Set();

    function addTexto(value) {
      if (value == null) return;

      if (Array.isArray(value)) {
        value.forEach(addTexto);
        return;
      }

      if (typeof value === "object") {
        addTexto(value.tipo);
        addTexto(value.titulo);
        addTexto(value.__tipoPublicado);
        addTexto(value.tipoPublicado);
        addTexto(value.tipo_operativo);
        addTexto(value.tipoFusionado);
        addTexto(value.tiposFusionados);
        addTexto(value.tipos);
        addTexto(value.tipos_origen);
        addTexto(value.__foTipoSupabasePublicado);
        addTexto(value.orden);
        addTexto(value.ordenes);
        addTexto(value.ordenesOrigen);
        addTexto(value.ordenes_origen);
        return;
      }

      const clean = limpiarTextoSimple(String(value || ""));
      if (!clean) return;
      const key = clean.toLowerCase();
      if (vistos.has(key)) return;
      vistos.add(key);
      partes.push(clean);
    }

    addTexto(franja?.titulo);
    addTexto(franja?.__tipoPublicado);
    addTexto(franja?.tipo);
    addTexto(franja?.tipoPublicado);
    addTexto(franja?.tipo_operativo);
    addTexto(franja?.__ordenTextoRef);
    addTexto(franja?.__ordenNum);
    addTexto(franja?.__ordenesOrigen);
    addTexto(franja?.lugar);

    addTexto(franja?.__registroOriginalPublicado);
    addTexto(franja?.__wspMetaTemporal);

    if (Array.isArray(franja?.__franjasOrigenTemporal)) {
      franja.__franjasOrigenTemporal.forEach(addTexto);
    }

    return normalizarBasicoSinAcentos(partes.join(" "));
  }

  function compactarClaveVisual(txt) {
    const ui = selectorOperativoUiWsp();
    if (ui && typeof ui.compactarClaveVisual === "function") return ui.compactarClaveVisual.apply(null, arguments);

    return normalizarBasicoSinAcentos(txt).replace(/[^a-z0-9]+/g, "");
  }

  function capitalizarLugarVisual(txt) {
    const ui = selectorOperativoUiWsp();
    if (ui && typeof ui.capitalizarLugarVisual === "function") return ui.capitalizarLugarVisual.apply(null, arguments);

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
    const ui = selectorOperativoUiWsp();
    if (ui && typeof ui.obtenerLugarVisualFranja === "function") return ui.obtenerLugarVisualFranja.apply(null, arguments);

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
    const ui = selectorOperativoUiWsp();
    if (ui && typeof ui.obtenerTipoVisualFranja === "function") return ui.obtenerTipoVisualFranja.apply(null, arguments);

    const fuente = obtenerFuenteVisualFranja(franja);
    const clave = compactarClaveVisual(fuente);

    /*
      PRIORIDAD ABSOLUTA DEL SELECTOR:
      si el operativo trae más de un tipo real, se muestran todos.
      Esto aplica tanto en INICIA como en FINALIZA y no toca el informe final.
    */
    const tipoCombinado = detectarTiposCombinadosVisualesWsp(fuente);
    if (tipoCombinado) return tipoCombinado;

    /*
      Reglas específicas de referencia para el desplegable.
      Van después de detectar combinados para no perder fusiones.
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
    const ui = selectorOperativoUiWsp();
    if (ui && typeof ui.obtenerSufijosVisualesFranja === "function") return ui.obtenerSufijosVisualesFranja.apply(null, arguments);

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
    const ui = selectorOperativoUiWsp();
    if (ui && typeof ui.construirTextoOpcionHorario === "function") return ui.construirTextoOpcionHorario.apply(null, arguments);

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
  function modoUiWsp() {
    return window.WSP?.ui?.modo || window.WSP?.modules?.modoUi || null;
  }

  function refsModoUiWsp() {
    return {
      selTipo,
      tipoInforme,
      bloqueInformeSelector,
    };
  }

  function configModoUiWsp() {
    return {
      INFORMES_TIPO,
      INFORME_CONTROL_SUPERIOR_TIPO,
      INFORME_ALCOHOLEMIA_TIPO,
      INFORME_DECRETO_460_TIPO,
      CONTROL_MOVILES_TIPO: "CONTROL MOVILES",
      FINALIZA_TIPO: "FINALIZA",
      INICIA_TIPO: "INICIA",
    };
  }

  function esControlMovilesActivo() {
    const mod = modoUiWsp();
    if (mod && typeof mod.esControlMovilesActivo === "function") {
      return mod.esControlMovilesActivo(refsModoUiWsp(), configModoUiWsp());
    }
    return selTipo?.value === "CONTROL MOVILES";
  }

  function controlMovilesUiWsp() {
    return window.WSP?.modules?.controlMovilesUi || null;
  }

  function refsControlMovilesWsp() {
    return {
      bloqueControlMoviles,
      controlMovilesEstado,
      controlMovilesChips,
      controlMovilesFormulario,
      controlMovilNumeroSeleccionado,
      controlMovilKilometraje,
      controlMovilCombustible,
      controlMovilObservaciones,
      controlMovilFueraServicio,
      controlMovilesAyudaWrap,
      controlMovilesAyudaBtn,
      controlMovilesAyudaPopup,
      controlMovilFoto1,
      controlMovilFoto2,
      controlMovilPreview1,
      controlMovilPreview2,
      btnEnviar,
    };
  }

  function pantallasUiWsp() {
    return window.WSP?.ui?.pantallas || window.WSP?.modules?.pantallasUi || null;
  }

  function refsPantallasUiWsp() {
    return {
      bloqueInformeSelector,
      bloqueInformeAlcoholemia,
      bloqueInformeDecto460,
      bloqueControlSuperior,
      bloqueControlMoviles,
      divFinaliza,
      divDetalles,
      divMismosElementos,
      bloquePresenciaActiva,
      chkPresenciaActiva,
      chkMostrarResultadosFinaliza,
      bloqueMostrarResultadosFinaliza,
      tituloResultadosFinaliza,
      contenidoResultadosFinaliza,
      bloquePositivosAlcoholimetro,
      wrapGraduacionesSancionable,
      wrapGraduacionesNoSancionable,
      unitGraduacionesSancionable,
      unitGraduacionesNoSancionable,
      wrapQrzCasilleros,
      wrapDominioCasilleros,
      labelObs,
      textareaObs,
      btnEnviar,
      bloquePersonal: document.getElementById("bloquePersonal"),
      bloqueMovil: document.getElementById("bloqueMovil"),
      bloqueEscopeta: document.getElementById("bloqueEscopeta"),
      bloqueHT: document.getElementById("bloqueHT"),
      bloquePDA: document.getElementById("bloquePDA"),
      bloqueImpresora: document.getElementById("bloqueImpresora"),
      bloqueAlometro: document.getElementById("bloqueAlometro"),
      bloqueAlcoholimetro: document.getElementById("bloqueAlcoholimetro"),
    };
  }

  function aplicarPantallaExclusivaWsp(modo, opts = {}) {
    const ui = pantallasUiWsp();
    if (ui && typeof ui.aplicarPantallaExclusiva === "function") {
      return ui.aplicarPantallaExclusiva(modo, refsPantallasUiWsp(), opts);
    }

    // Fallback legacy mínimo: evita superposición de pantallas si el módulo nuevo no cargó.
    const modoFinal = String(modo || "INICIA").toUpperCase();
    const mostrarControlMoviles = modoFinal === "CONTROL_MOVILES";
    const mostrarAlcoholemia = modoFinal === "ALCOHOLEMIA";
    const mostrarDecto460 = modoFinal === "DECTO460";
    const mostrarControlSuperior = modoFinal === "CONTROL_SUPERIOR";
    const mostrarFinaliza = modoFinal === "FINALIZA";

    if (bloqueControlMoviles) bloqueControlMoviles.classList.toggle("hidden", !mostrarControlMoviles);
    if (bloqueInformeAlcoholemia) bloqueInformeAlcoholemia.classList.toggle("hidden", !mostrarAlcoholemia);
    if (bloqueInformeDecto460) bloqueInformeDecto460.classList.toggle("hidden", !mostrarDecto460);
    if (bloqueControlSuperior) bloqueControlSuperior.classList.toggle("hidden", !mostrarControlSuperior);
    if (divFinaliza) divFinaliza.classList.toggle("hidden", !mostrarFinaliza);
    if (!mostrarFinaliza) {
      if (divDetalles) divDetalles.classList.add("hidden");
      if (divMismosElementos) divMismosElementos.classList.add("hidden");
      if (bloquePresenciaActiva) bloquePresenciaActiva.classList.add("hidden");
      if (chkPresenciaActiva) chkPresenciaActiva.checked = false;
      if (chkMostrarResultadosFinaliza) chkMostrarResultadosFinaliza.checked = false;
    }
  }
  function transicionesUiWsp() {
    return window.WSP?.ui?.transiciones || window.WSP?.modules?.transicionesUi || null;
  }

  function refsTransicionesUiWsp() {
    return {
      selHorario,
      textareaObs,
      btnEnviar,
      divFinaliza,
      divDetalles,
      divMismosElementos,
      bloquePresenciaActiva,
      chkPresenciaActiva,
      chkMostrarResultadosFinaliza,
      bloquePositivosAlcoholimetro,
      wrapGraduacionesSancionable,
      wrapGraduacionesNoSancionable,
      unitGraduacionesSancionable,
      unitGraduacionesNoSancionable,
      wrapQrzCasilleros,
      wrapDominioCasilleros,
    };
  }

  function limpiarFormularioDomWsp() {
    const ui = transicionesUiWsp();
    if (ui && typeof ui.limpiarFormularioDom === "function") {
      return ui.limpiarFormularioDom(refsTransicionesUiWsp());
    }

    document.querySelectorAll('input[type="checkbox"]').forEach((c) => (c.checked = false));
    document
      .querySelectorAll('input[type="number"], input[type="text"], textarea')
      .forEach((i) => {
        i.value = "";
        limpiarErrorCampo(i);
      });
  }

  function ocultarBloquesDinamicosFinalizaWsp() {
    const ui = transicionesUiWsp();
    if (ui && typeof ui.ocultarBloquesDinamicosFinaliza === "function") {
      return ui.ocultarBloquesDinamicosFinaliza(refsTransicionesUiWsp());
    }

    if (divFinaliza) divFinaliza.classList.add("hidden");
    if (divDetalles) divDetalles.classList.add("hidden");
    if (divMismosElementos) divMismosElementos.classList.add("hidden");
    if (bloquePresenciaActiva) bloquePresenciaActiva.classList.add("hidden");
    if (bloquePositivosAlcoholimetro) bloquePositivosAlcoholimetro.classList.add("hidden");
    if (wrapGraduacionesSancionable) wrapGraduacionesSancionable.classList.add("hidden");
    if (wrapGraduacionesNoSancionable) wrapGraduacionesNoSancionable.classList.add("hidden");
    if (unitGraduacionesSancionable) unitGraduacionesSancionable.classList.add("hidden");
    if (unitGraduacionesNoSancionable) unitGraduacionesNoSancionable.classList.add("hidden");
    if (wrapQrzCasilleros) wrapQrzCasilleros.classList.add("hidden");
    if (wrapDominioCasilleros) wrapDominioCasilleros.classList.add("hidden");
  }

  function prepararSelectorInformesMenuWsp() {
    const ui = transicionesUiWsp();
    if (ui && typeof ui.prepararSelectorInformesMenu === "function") {
      return ui.prepararSelectorInformesMenu(refsTransicionesUiWsp(), {
        actualizarContador: actualizarContadorOperativosWsp,
      });
    }

    if (selHorario) {
      selHorario.innerHTML = '<option value="">Seleccione un informe para ver operativos iniciados</option>';
      selHorario.value = "";
    }
    actualizarContadorOperativosWsp(0);
  }


  function setTextoEstadoControlMoviles(texto) {
    const ui = controlMovilesUiWsp();
    if (ui && typeof ui.setTextoEstado === "function") return ui.setTextoEstado(texto, refsControlMovilesWsp());
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
    // Identificador técnico de sesión para locks de Control de Móviles.
    // No es fuente de verdad operativa y no usa localStorage.
    const key = "wsp_control_moviles_owner_id";
    try {
      const actual = window.sessionStorage?.getItem(key);
      if (actual) return actual;
      const nuevo = crearIdControlMoviles("owner");
      window.sessionStorage?.setItem(key, nuevo);
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
    const svc = historialOperativoServiceWsp();
    if (svc && typeof svc.querySupabase === "function") {
      try {
        return svc.querySupabase(params);
      } catch (e) {
        console.warn("[WSP] Historial service no pudo armar query Supabase. Se usa fallback.", e);
      }
    }

    const qs = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value === undefined || value === null) return;
      qs.set(key, String(value));
    });
    return qs.toString();
  }

  async function fetchSupabaseTabla(table, { method = "GET", params = {}, body = null, extraHeaders = {} } = {}) {
    const svc = historialOperativoServiceWsp();
    if (svc && typeof svc.fetchSupabaseTabla === "function") {
      try {
        return await svc.fetchSupabaseTabla({
          supabaseUrl: SUPABASE_URL,
          anonKey: SUPABASE_ANON_KEY,
          table,
          method,
          params,
          body,
          extraHeaders,
        });
      } catch (e) {
        console.warn("[WSP] Historial service falló en fetchSupabaseTabla. Se usa fallback legacy.", e);
      }
    }

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
    // Identificador técnico de sesión/dispositivo para auditoría WSP.
    // No es fuente de verdad operativa y no usa localStorage.
    const key = "wsp_control_moviles_device_id";
    try {
      const actual = window.sessionStorage?.getItem(key);
      if (actual) return actual;
      const nuevo = crearIdControlMoviles("device");
      window.sessionStorage?.setItem(key, nuevo);
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

  function normalizarFingerprintValorControlMoviles(value) {
    return limpiarTextoSimple(value ?? '').toLowerCase();
  }

  function redondearPixelRatioControlMoviles(value) {
    const n = Number(value || 0);
    if (!Number.isFinite(n) || n <= 0) return '';
    return String(Math.round(n * 1000) / 1000);
  }

  function construirFingerprintBaseControlMoviles(info = {}) {
    const partes = [
      normalizarFingerprintValorControlMoviles(info.os_detectado),
      normalizarFingerprintValorControlMoviles(info.browser_detectado),
      normalizarFingerprintValorControlMoviles(info.platform),
      String(Number(info.screen_width || 0) || ''),
      String(Number(info.screen_height || 0) || ''),
      redondearPixelRatioControlMoviles(info.pixel_ratio),
      normalizarFingerprintValorControlMoviles(info.language),
      normalizarFingerprintValorControlMoviles(info.timezone),
      String(Number(info.hardware_concurrency || 0) || ''),
      String(Number(info.device_memory || 0) || ''),
      String(Number(info.max_touch_points || 0) || ''),
    ];
    return partes.join('|');
  }

  function hashFallbackControlMoviles(str) {
    // Fallback liviano y determinístico si crypto.subtle no está disponible.
    let h1 = 0xdeadbeef;
    let h2 = 0x41c6ce57;
    const s = String(str || '');
    for (let i = 0; i < s.length; i += 1) {
      const ch = s.charCodeAt(i);
      h1 = Math.imul(h1 ^ ch, 2654435761);
      h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    return `${(h2 >>> 0).toString(16).padStart(8, '0')}${(h1 >>> 0).toString(16).padStart(8, '0')}`;
  }

  async function hashTextoControlMoviles(texto) {
    const raw = String(texto || '');
    try {
      if (window.crypto?.subtle && window.TextEncoder) {
        const data = new TextEncoder().encode(raw);
        const buffer = await window.crypto.subtle.digest('SHA-256', data);
        return Array.from(new Uint8Array(buffer)).map((b) => b.toString(16).padStart(2, '0')).join('');
      }
    } catch (e) {
      console.warn('[WSP] No se pudo usar crypto.subtle para fingerprint. Se usa fallback.', e);
    }
    return hashFallbackControlMoviles(raw);
  }

  async function construirInfoDispositivoControlMoviles() {
    const nav = window.navigator || {};
    const screenObj = window.screen || {};
    const userAgent = String(nav.userAgent || "");
    const platform = String(nav.platform || "");
    const connection = nav.connection || nav.mozConnection || nav.webkitConnection || null;
    let timezone = "";
    try { timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || ""; } catch {}

    const info = {
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
      max_touch_points: Number(nav.maxTouchPoints || 0) || null,
    };

    info.fingerprint_base = construirFingerprintBaseControlMoviles(info);
    info.fingerprint_hash = await hashTextoControlMoviles(info.fingerprint_base);
    return info;
  }

  function normalizarDispositivoAliasControlMoviles(row) {
    const deviceId = limpiarTextoSimple(row?.device_id || '');
    if (!deviceId) return null;
    return {
      device_id: deviceId,
      device_label: limpiarTextoSimple(row?.device_label || ''),
      alias_origen: limpiarTextoSimple(row?.alias_origen || ''),
      alias_confirmado: row?.alias_confirmado === true,
      alias_confidence: Number(row?.alias_confidence || 0) || 0,
      device_id_anterior_vinculado: limpiarTextoSimple(row?.device_id_anterior_vinculado || ''),
      fingerprint_hash: limpiarTextoSimple(row?.fingerprint_hash || ''),
      fingerprint_base: limpiarTextoSimple(row?.fingerprint_base || ''),
      grupo_guardia: limpiarTextoSimple(row?.grupo_guardia || ''),
      user_agent: limpiarTextoSimple(row?.user_agent || ''),
      platform: limpiarTextoSimple(row?.platform || ''),
      os_detectado: limpiarTextoSimple(row?.os_detectado || ''),
      browser_detectado: limpiarTextoSimple(row?.browser_detectado || ''),
      device_model_detectado: limpiarTextoSimple(row?.device_model_detectado || ''),
      screen_width: Number(row?.screen_width || 0) || null,
      screen_height: Number(row?.screen_height || 0) || null,
      pixel_ratio: Number(row?.pixel_ratio || 0) || null,
      language: limpiarTextoSimple(row?.language || ''),
      timezone: limpiarTextoSimple(row?.timezone || ''),
      hardware_concurrency: Number(row?.hardware_concurrency || 0) || null,
      device_memory: Number(row?.device_memory || 0) || null,
      connection_type: limpiarTextoSimple(row?.connection_type || ''),
      max_touch_points: Number(row?.max_touch_points || 0) || null,
      last_seen_at: limpiarTextoSimple(row?.last_seen_at || ''),
    };
  }

  function fingerprintHardwareScoreControlMoviles(actual, candidato) {
    if (!actual || !candidato) return 0;

    const actualHash = limpiarTextoSimple(actual.fingerprint_hash || '');
    const candidatoHash = limpiarTextoSimple(candidato.fingerprint_hash || '');
    if (actualHash && candidatoHash && actualHash === candidatoHash) return 100;

    let score = 0;
    let total = 0;
    const sumar = (peso, ok) => {
      total += peso;
      if (ok) score += peso;
    };
    const eqTxt = (a, b) => {
      const aa = normalizarFingerprintValorControlMoviles(a);
      const bb = normalizarFingerprintValorControlMoviles(b);
      return !!aa && !!bb && aa === bb;
    };
    const eqNum = (a, b, tolerancia = 0) => {
      const aa = Number(a || 0);
      const bb = Number(b || 0);
      if (!Number.isFinite(aa) || !Number.isFinite(bb) || aa <= 0 || bb <= 0) return false;
      return Math.abs(aa - bb) <= tolerancia;
    };

    sumar(14, eqTxt(actual.os_detectado, candidato.os_detectado));
    sumar(10, eqTxt(actual.browser_detectado, candidato.browser_detectado));
    sumar(8, eqTxt(actual.platform, candidato.platform));
    sumar(12, eqNum(actual.screen_width, candidato.screen_width));
    sumar(12, eqNum(actual.screen_height, candidato.screen_height));
    sumar(12, eqNum(actual.pixel_ratio, candidato.pixel_ratio, 0.01));
    sumar(8, eqTxt(actual.language, candidato.language));
    sumar(8, eqTxt(actual.timezone, candidato.timezone));
    sumar(6, eqNum(actual.hardware_concurrency, candidato.hardware_concurrency));
    sumar(5, eqNum(actual.device_memory, candidato.device_memory));
    sumar(5, eqNum(actual.max_touch_points, candidato.max_touch_points));

    if (!total) return 0;
    return Math.round((score / total) * 100);
  }

  async function leerDispositivosAliasControlMoviles() {
    const select = [
      'device_id', 'device_label', 'alias_origen', 'alias_confirmado', 'alias_confidence',
      'device_id_anterior_vinculado', 'fingerprint_hash', 'fingerprint_base', 'grupo_guardia',
      'user_agent', 'platform', 'os_detectado', 'browser_detectado', 'device_model_detectado',
      'screen_width', 'screen_height', 'pixel_ratio', 'language', 'timezone',
      'hardware_concurrency', 'device_memory', 'connection_type', 'max_touch_points', 'last_seen_at'
    ].join(',');

    try {
      const data = await fetchSupabaseTabla(CONTROL_MOVILES_DISPOSITIVOS_TABLE, {
        params: {
          select,
          activo: 'eq.true',
          order: 'last_seen_at.desc',
          limit: '200',
        },
        extraHeaders: { Accept: 'application/json' },
      });
      return (Array.isArray(data) ? data : []).map(normalizarDispositivoAliasControlMoviles).filter(Boolean);
    } catch (e) {
      console.warn('[WSP] No se pudo leer dispositivos para alias probable. Se continúa sin bloquear el control.', e);
      return [];
    }
  }

  async function resolverAliasProbableDispositivoControlMoviles(info) {
    try {
      const actual = normalizarDispositivoAliasControlMoviles(info);
      if (!actual?.device_id) return null;

      const dispositivos = await leerDispositivosAliasControlMoviles();
      const filaActual = dispositivos.find((d) => d.device_id === actual.device_id);
      if (filaActual?.device_label) {
        return {
          device_label: filaActual.device_label,
          alias_origen: filaActual.alias_origen || 'directo',
          alias_confirmado: filaActual.alias_confirmado === true,
          alias_confidence: Math.max(100, Number(filaActual.alias_confidence || 0) || 0),
          device_id_anterior_vinculado: filaActual.device_id_anterior_vinculado || '',
        };
      }

      const candidatos = dispositivos
        .filter((d) => d.device_id !== actual.device_id)
        .filter((d) => limpiarTextoSimple(d.device_label || ''))
        .map((d) => ({ ...d, __score: fingerprintHardwareScoreControlMoviles(actual, d) }))
        .sort((a, b) => b.__score - a.__score);

      const mejor = candidatos[0];
      if (!mejor || mejor.__score < 85) return null;

      const payload = {
        device_id: actual.device_id,
        device_label: mejor.device_label,
        alias_origen: 'probable',
        alias_confirmado: false,
        alias_confidence: mejor.__score,
        device_id_anterior_vinculado: mejor.device_id,
        grupo_guardia: actual.grupo_guardia || mejor.grupo_guardia || 'BMZCN',
        fingerprint_hash: actual.fingerprint_hash || null,
        fingerprint_base: actual.fingerprint_base || null,
        last_seen_at: ahoraISOControlMoviles(),
        activo: true,
      };

      try {
        await fetchSupabaseTabla(CONTROL_MOVILES_DISPOSITIVOS_TABLE, {
          method: 'POST',
          params: { on_conflict: 'device_id' },
          body: payload,
          extraHeaders: { Prefer: 'resolution=merge-duplicates,return=minimal' },
        });
      } catch (e) {
        console.warn('[WSP] Se detectó alias probable, pero no se pudo grabar en wsp_dispositivos.', e);
      }

      return {
        device_label: mejor.device_label,
        alias_origen: 'probable',
        alias_confirmado: false,
        alias_confidence: mejor.__score,
        device_id_anterior_vinculado: mejor.device_id,
      };
    } catch (e) {
      console.warn('[WSP] Error resolviendo alias probable. El control continúa igual.', e);
      return null;
    }
  }

  async function registrarDispositivoControlMoviles() {
    const info = await construirInfoDispositivoControlMoviles();
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
      max_touch_points: info.max_touch_points,
      fingerprint_hash: info.fingerprint_hash,
      fingerprint_base: info.fingerprint_base,
      grupo_guardia: 'BMZCN',
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

    const aliasProbable = await resolverAliasProbableDispositivoControlMoviles(info);
    if (aliasProbable?.device_label) {
      info.device_label = aliasProbable.device_label;
      info.alias_origen = aliasProbable.alias_origen || 'probable';
      info.alias_confirmado = aliasProbable.alias_confirmado === true;
      info.alias_confidence = Number(aliasProbable.alias_confidence || 0) || 0;
      info.device_id_anterior_vinculado = aliasProbable.device_id_anterior_vinculado || '';
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
      max_touch_points: dispositivo.max_touch_points,
      fingerprint_hash: dispositivo.fingerprint_hash,
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
      ultimo_device_label: dispositivo.device_label || null,
      ultimo_alias_origen: dispositivo.alias_origen || null,
      ultimo_alias_confirmado: dispositivo.alias_confirmado === true,
      ultimo_device_id_anterior_vinculado: dispositivo.device_id_anterior_vinculado || null,
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
      console.warn("[WSP] No se pudo actualizar la marca completa de Recursos. Se intenta marca mínima.", e);

      // Respaldo: nunca bloquear el control de móviles por campos nuevos/auxiliares.
      // Se intenta guardar solo lo indispensable para que Recursos pueda marcar ©.
      const payloadMinimo = {
        guardia_fecha: guardia.guardia_fecha,
        numero_movil: Number(numeroNormalizado),
        controlado: true,
        controlado_at: controladoAtIso,
        expires_at: expiresAtIso,
        cantidad_controles_ventana: cantidad,
        color_marca: colorMarca,
        ultimo_device_id: dispositivo.device_id,
        ultimo_session_id: CONTROL_MOVILES_SESSION_ID,
        fuente: "WSP",
        updated_at: controladoAtIso,
      };

      try {
        await fetchSupabaseTabla(CONTROL_MOVILES_ESTADO_RECURSOS_TABLE, {
          method: "POST",
          params: { on_conflict: "guardia_fecha,numero_movil" },
          body: payloadMinimo,
          extraHeaders: {
            Prefer: "resolution=merge-duplicates,return=minimal",
          },
        });
        console.log("[WSP] Estado Recursos mínimo actualizado para ©:", numeroNormalizado, colorMarca, cantidad);
        return true;
      } catch (e2) {
        console.warn("[WSP] No se pudo actualizar la marca © de Recursos. El control principal continúa guardado.", e2);
        return false;
      }
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
    const ui = controlMovilesUiWsp();
    if (ui && typeof ui.actualizarBotonSalir === "function") {
      return ui.actualizarBotonSalir(refsControlMovilesWsp(), {
        enControlMoviles: esControlMovilesActivo(),
        hayMovilSeleccionado: !!controlMovilSeleccionado,
      });
    }

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
      btnEnviar.classList.add("hidden");
      btnEnviar.style.display = "none";
    } else {
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

  function formularioControlMovilActivo() {
    const ui = controlMovilesUiWsp();
    if (ui && typeof ui.formularioActivo === "function") return ui.formularioActivo(refsControlMovilesWsp(), controlMovilSeleccionado);
    return !!controlMovilSeleccionado?.numero
      && !!controlMovilesFormulario
      && !controlMovilesFormulario.classList.contains("hidden");
  }

  function camposControlMovilEnEdicion() {
    const ui = controlMovilesUiWsp();
    if (ui && typeof ui.camposEnEdicion === "function") return ui.camposEnEdicion(refsControlMovilesWsp());
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

    const ui = controlMovilesUiWsp();
    if (ui && typeof ui.aplicarMovilAlFormulario === "function") return ui.aplicarMovilAlFormulario(movil, refsControlMovilesWsp());

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
    if (respetarEdicion && (formularioControlMovilActivo() || camposControlMovilEnEdicion())) return controlMovilSeleccionado;

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

    if (!controlMovilesCargados) setTextoEstadoControlMoviles("Cargando móviles en servicio...");

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
          if (!formularioControlMovilActivo() && !camposControlMovilEnEdicion()) aplicarMovilControlAlFormulario(controlMovilSeleccionado);
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

  function construirFirmaRenderControlMoviles(visibles) {
    const ui = controlMovilesUiWsp();
    if (ui && typeof ui.construirFirmaRender === "function") {
      return ui.construirFirmaRender({
        visibles,
        limpiarTextoSimple,
        normalizarTipoMovilControl,
        obtenerLockControlMovil,
        lockControlMovilEsPropio,
      });
    }

    return (Array.isArray(visibles) ? visibles : [])
      .map((movil) => {
        const numero = limpiarTextoSimple(movil?.numero || "");
        const lock = obtenerLockControlMovil(numero);
        const lockEstado = lock ? (lockControlMovilEsPropio(lock) ? "propio" : "otro") : "sin-lock";
        return [
          numero,
          normalizarTipoMovilControl(movil?.tipo),
          limpiarTextoSimple(movil?.modelo || ""),
          movil?.condicion ? "1" : "0",
          lockEstado,
        ].join(":");
      })
      .join("|");
  }

  function renderControlMovilesChips() {
    const ui = controlMovilesUiWsp();
    if (ui && typeof ui.renderChips === "function") {
      const result = ui.renderChips({
        refs: refsControlMovilesWsp(),
        visibles: movilesControlVisibles(),
        firmaAnterior: controlMovilesUltimaFirmaRender,
        baseNumeros: CONTROL_MOVILES_BASE_NUMEROS,
        limpiarTextoSimple,
        normalizarBasicoSinAcentos,
        normalizarTipoMovilControl,
        ordenarMovilesControl,
        obtenerLockControlMovil,
        lockControlMovilEsPropio,
        onSeleccionar: seleccionarMovilControl,
        setEstado: (texto) => {
          if (controlMovilesEstado) controlMovilesEstado.textContent = texto || "";
        },
      });
      if (result && typeof result.firmaRender === "string") controlMovilesUltimaFirmaRender = result.firmaRender;
      return;
    }

    if (!controlMovilesChips) return;

    const visibles = movilesControlVisibles();
    const firmaRender = construirFirmaRenderControlMoviles(visibles);
    if (firmaRender === controlMovilesUltimaFirmaRender && controlMovilesChips.dataset.renderListo === "1") {
      return;
    }

    controlMovilesUltimaFirmaRender = firmaRender;
    controlMovilesChips.dataset.renderListo = "1";
    controlMovilesChips.innerHTML = "";

    if (!visibles.length) {
      setTextoEstadoControlMoviles("No hay móviles en servicio para controlar.");
      return;
    }

    setTextoEstadoControlMoviles("Seleccione un móvil en servicio.");
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

    const ui = controlMovilesUiWsp();
    if (ui && typeof ui.mostrarFormulario === "function") {
      ui.mostrarFormulario(refsControlMovilesWsp());
    } else {
      document.body.classList.add("control-movil-seleccionado-activo");
      if (controlMovilesChips) {
        controlMovilesChips.classList.add("hidden");
        controlMovilesChips.style.display = "none";
      }
      if (controlMovilesFormulario) {
        controlMovilesFormulario.classList.remove("hidden");
        controlMovilesFormulario.style.display = "grid";
      }
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

    const ui = controlMovilesUiWsp();
    if (ui && typeof ui.volverASeleccion === "function") {
      ui.volverASeleccion(refsControlMovilesWsp(), {
        hayMoviles: movilesControlVisibles().length > 0,
        setEstado: (texto) => {
          if (controlMovilesEstado) controlMovilesEstado.textContent = texto || "";
        },
      });
      actualizarBotonSalirControlMoviles();
      return;
    }

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
    const ui = controlMovilesUiWsp();
    if (ui && typeof ui.limpiarFotos === "function") return ui.limpiarFotos(refsControlMovilesWsp());

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
    const ui = controlMovilesUiWsp();
    if (ui && typeof ui.mostrarPreview === "function") return ui.mostrarPreview(input, preview);

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
    const intentos = [payload];

    // Respaldo defensivo: si alguna instalación vieja no tuviera la columna fuente,
    // se reintenta sin ese campo para no romper el control de móviles.
    if (payload && Object.prototype.hasOwnProperty.call(payload, "fuente")) {
      const sinFuente = { ...payload };
      delete sinFuente.fuente;
      intentos.push(sinFuente);
    }

    let ultimoError = "";

    for (const cuerpo of intentos) {
      const r = await fetch(`${SUPABASE_URL}/rest/v1/${CONTROL_MOVILES_TABLE}`, {
        method: "POST",
        headers: headersSupabase({
          "Content-Type": "application/json",
          Prefer: "return=representation",
          Accept: "application/json",
        }),
        body: JSON.stringify(cuerpo),
      });

      if (r.ok) return r.json().catch(() => null);

      ultimoError = await r.text().catch(() => "");
      const textoError = String(ultimoError || "").toLowerCase();
      const puedeReintentarSinFuente = cuerpo === payload && textoError.includes("fuente");
      if (!puedeReintentarSinFuente) break;
    }

    throw new Error(`No se pudo insertar control: ${ultimoError}`);
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

    const numeroMovilControlado = controlMovilSeleccionado.numero;
    const movilIdControlado = controlMovilSeleccionado.id;
    const guardiaControl = obtenerGuardiaControlMovil();
    let controlInsertado = null;
    let foto1 = null;
    let foto2 = null;

    try {
      if (btnCambiarMovilControl) {
        btnCambiarMovilControl.disabled = true;
        btnCambiarMovilControl.textContent = "Guardando...";
      }

      // Las fotos son respaldo visual. Si una foto falla, NO debe impedir controlar el móvil.
      try {
        foto1 = await subirFotoControlMovil(controlMovilFoto1?.files?.[0] || null, numeroMovilControlado, "foto1");
      } catch (e) {
        console.warn("[WSP] No se pudo subir foto 1. El control continúa igual.", e);
      }

      try {
        foto2 = await subirFotoControlMovil(controlMovilFoto2?.files?.[0] || null, numeroMovilControlado, "foto2");
      } catch (e) {
        console.warn("[WSP] No se pudo subir foto 2. El control continúa igual.", e);
      }

      // Núcleo obligatorio: registrar el control histórico.
      const controlInsertadoResp = await insertarRegistroControlMovil({
        movil_id: movilIdControlado,
        numero_movil: Number(numeroMovilControlado),
        kilometraje: Number(kilometraje),
        combustible,
        observaciones,
        guardia_fecha: guardiaControl.guardia_fecha,
        guardia_inicio: guardiaControl.guardia_inicio,
        guardia_fin: guardiaControl.guardia_fin,
        fuente: "WSP",
      });

      controlInsertado = normalizarControlMovilInsertado(controlInsertadoResp);

      // Núcleo obligatorio: actualizar el estado actual del móvil.
      await actualizarEstadoActualMovilControl(numeroMovilControlado, kilometraje, combustible, observaciones, fueraServicio);

      // Fotos vinculadas al control: no deben romper el guardado si falla storage/tabla fotos.
      try {
        await insertarFotosGuardiaControlMovil({
          control: controlInsertado,
          fotos: [foto1, foto2],
          numero: numeroMovilControlado,
          movilId: movilIdControlado,
          observaciones,
          guardia: guardiaControl,
        });
      } catch (e) {
        console.warn("[WSP] Control guardado, pero no se pudieron registrar fotos de guardia.", e);
      }

      // Marca de auditoría para Recursos: debe intentarse, pero jamás bloquear WSP.
      try {
        await registrarControlWspParaRecursos({
          numero: numeroMovilControlado,
          guardia: guardiaControl,
          controladoAt: new Date().toISOString(),
        });
      } catch (e) {
        console.warn("[WSP] Control guardado, pero falló la marca © para Recursos.", e);
      }

      actualizarMovilControlEnCache({
        ...controlMovilSeleccionado,
        kilometraje: String(kilometraje),
        combustible,
        observaciones_novedades: observaciones,
        observaciones,
        condicion: !fueraServicio,
      });

      // Lock amarillo de WSP: coordinación visual. No debe bloquear el guardado principal.
      try {
        await guardarBloqueoControlMovil(numeroMovilControlado);
      } catch (e) {
        console.warn("[WSP] Control guardado, pero no se pudo activar el bloqueo amarillo compartido.", e);
      }

      try {
        controlMovilesCargados = false;
        await cargarMovilesControlDesdeSupabase({ forzar: true });
      } catch (e) {
        console.warn("[WSP] Control guardado, pero no se pudo refrescar la lista desde Supabase.", e);
      }

      volverASeleccionMovilControl();
      setTextoEstadoControlMoviles("Control guardado. Seleccione otro móvil o presione Salir.");
    } catch (e) {
      console.error("[WSP] Error guardando control de móvil", e);
      alert("No se pudo guardar el control de móvil. Revisá la consola para ver el detalle exacto del error.");
    } finally {
      if (btnCambiarMovilControl) {
        btnCambiarMovilControl.disabled = false;
        btnCambiarMovilControl.textContent = "Guardar";
      }
      actualizarBotonSalirControlMoviles();
    }
  }

  function setUIControlMovilesActiva(activa) {
    const ui = controlMovilesUiWsp();
    if (ui && typeof ui.setActiva === "function") {
      ui.setActiva(refsControlMovilesWsp(), activa);
    } else {
      if (bloqueControlMoviles) bloqueControlMoviles.classList.toggle("hidden", !activa);
      document.body.classList.toggle("modo-control-moviles", !!activa);
      if (!activa) cerrarAyudaControlMoviles();
    }

    if (activa) {
      aplicarPantallaExclusivaWsp("CONTROL_MOVILES");
      // Evita superposición de pantallas al cambiar desde INFORMES
      // hacia CONTROL DE MÓVILES sin recargar el navegador.
      desactivarPantallasInformesWsp();
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

      controlMovilSeleccionado = null;
      if (ui && typeof ui.mostrarPantallaPrincipal === "function") {
        ui.mostrarPantallaPrincipal(refsControlMovilesWsp());
      } else {
        document.body.classList.remove("control-movil-seleccionado-activo");
        if (controlMovilesFormulario) {
          controlMovilesFormulario.classList.add("hidden");
          controlMovilesFormulario.style.display = "none";
        }
        if (controlMovilesChips) {
          controlMovilesChips.classList.remove("hidden");
          controlMovilesChips.style.display = "grid";
        }
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

  function estaEnMenuInformes() {
    const mod = modoUiWsp();
    if (mod && typeof mod.estaEnMenuInformes === "function") {
      return mod.estaEnMenuInformes(refsModoUiWsp(), configModoUiWsp());
    }
    return selTipo?.value === INFORMES_TIPO;
  }

  function getTipoInformeActivo() {
    const mod = modoUiWsp();
    if (mod && typeof mod.getTipoInformeActivo === "function") {
      return mod.getTipoInformeActivo(refsModoUiWsp(), configModoUiWsp());
    }
    if (estaEnMenuInformes()) return tipoInforme?.value || "";
    // Compatibilidad por si queda algún valor viejo guardado o seleccionado.
    return selTipo?.value || "";
  }

  function setSelectorInformesVisible(visible) {
    const mod = modoUiWsp();
    if (mod && typeof mod.setSelectorInformesVisible === "function") {
      return mod.setSelectorInformesVisible(refsModoUiWsp(), visible);
    }
    if (bloqueInformeSelector) bloqueInformeSelector.classList.toggle("hidden", !visible);
    if (!visible && tipoInforme) tipoInforme.value = "";
  }

  function actualizarDatosFranja() {
    const estadoSeleccion = resolverCambioSeleccionOperativoWsp();
    franjaSeleccionada = estadoSeleccion?.franjaSeleccionada || null;
    ordenSeleccionada = estadoSeleccion?.ordenSeleccionada || null;

    actualizarVisibilidadBloquePresenciaActiva();
    actualizarVisibilidadResultadosFinaliza();

    if (selTipo.value === "FINALIZA") {
      sincronizarInicioGuardadoSegunContexto();
    }
    refrescarContextosInformesActivosWsp();
  }

  function actualizarTipo() {
    const enInformes = estaEnMenuInformes();
    setSelectorInformesVisible(enInformes);
    const controlMoviles = esControlMovilesActivo();
    const controlSuperior = esControlSuperiorActivo();
    const informeAlcoholemia = esInformeAlcoholemiaActivo();
    const informeDecto460 = esInformeDecto460Activo();
    const fin = selTipo.value === "FINALIZA";

    if (chkPresenciaActiva) {
      chkPresenciaActiva.checked = false;
    }

    if (controlMoviles) {
      // Control de Móviles es una pantalla exclusiva: al entrar debe cerrar
      // cualquier formulario de INFORMES que hubiera quedado visible.
      desactivarPantallasInformesWsp();
      setTituloOperativosIniciados(false);
      cargarOperativosDisponibles(selHorario?.value || "");
      actualizarDatosFranja();
      setUIControlMovilesActiva(true);
      sincronizarUIAlcoholimetro();
      sincronizarUIQrzDominio();
      return;
    }

    setUIControlMovilesActiva(false);

    if (fin) {
      aplicarPantallaExclusivaWsp("FINALIZA");
      // FINALIZA debe trabajar sobre la misma fuente real que INFORMES:
      // operativos iniciados/en curso desde Supabase, nunca operativos publicados ni cache vieja.
      desactivarPantallasInformesWsp();
      setSelectorInformesVisible(false);
      setTituloOperativosIniciados(true);
      if (divFinaliza) divFinaliza.classList.remove("hidden");
      if (divMismosElementos) divMismosElementos.classList.remove("hidden");
      actualizarVisibilidadBloquePresenciaActiva();
      actualizarVisibilidadResultadosFinaliza();
      desactivarControlesMismos({ limpiar: true });
      sincronizarUIAlcoholimetro();
      sincronizarUIQrzDominio();
      cargarOperativosIniciadosParaInformes(selHorario?.value || "").then(() => {
        actualizarDatosFranja();
        sincronizarInicioGuardadoSegunContexto();
      });
      return;
    }

    if (enInformes && !getTipoInformeActivo()) {
      prepararMenuInformesWsp();
      return;
    }

    if (informeDecto460) {
      activarPantallaInformePorTipoWsp("DECTO460", refrescarContextoInformeDecto460);
      return;
    }

    if (informeAlcoholemia) {
      activarPantallaInformePorTipoWsp("ALCOHOLEMIA", refrescarContextoInformeAlcoholemia, {
        postActivar: actualizarReglasInformeAlcoholemia,
      });
      return;
    }

    setUIInformeAlcoholemiaActiva(false);
    setUIInformeDecto460Activa(false);

    if (controlSuperior) {
      activarPantallaInformePorTipoWsp("CONTROL_SUPERIOR", refrescarContextoControlSuperior);
      return;
    }

    desactivarPantallasInformesWsp();
    aplicarPantallaExclusivaWsp(fin ? "FINALIZA" : "INICIA", { mostrarFormularioBase: !fin });
    setTituloOperativosIniciados(false);
    cargarOperativosDisponibles(selHorario?.value || "");
    actualizarDatosFranja();
    divFinaliza.classList.toggle("hidden", !fin);

    if (divMismosElementos) divMismosElementos.classList.toggle("hidden", !fin);

    if (!fin) {
      if (chkMostrarResultadosFinaliza) chkMostrarResultadosFinaliza.checked = false;
      actualizarVisibilidadBloquePresenciaActiva();
      actualizarVisibilidadResultadosFinaliza();
      desactivarControlesMismos();
      ocultarResumenInformesIntermediosFinalizado();
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
  // ===== SELECCIONES / FORMULARIO OPERATIVO ==============
  // ======================================================
  function formularioOperativoWsp() {
    return window.WSP?.forms?.operativo || window.WSP?.modules?.formularioOperativo || null;
  }

  function payloadOperativoWsp() {
    return window.WSP?.payloads?.operativo || window.WSP?.modules?.payloadOperativo || null;
  }

  function seleccion(clase) {
    const mod = formularioOperativoWsp();
    if (mod && typeof mod.seleccion === "function") return mod.seleccion(clase);
    return Array.from(document.querySelectorAll("." + clase + ":checked"))
      .map((e) => e.value)
      .join("\n");
  }

  function seleccionLinea(clase, sep) {
    const mod = formularioOperativoWsp();
    if (mod && typeof mod.seleccionLinea === "function") return mod.seleccionLinea(clase, sep);
    const v = Array.from(document.querySelectorAll("." + clase + ":checked")).map((e) => e.value);
    return v.length ? v.join(" " + sep + " ") : "/";
  }

  function leerSeleccionPorClase(clase) {
    const mod = formularioOperativoWsp();
    if (mod && typeof mod.leerSeleccionPorClase === "function") return mod.leerSeleccionPorClase(clase);
    return Array.from(document.querySelectorAll("." + clase + ":checked")).map((e) => e.value);
  }

  function lineaDesdeArray(arr, sep) {
    const modFormulario = formularioOperativoWsp();
    if (modFormulario && typeof modFormulario.lineaDesdeArray === "function") return modFormulario.lineaDesdeArray(arr, sep);
    const mod = textoOperativoWsp();
    if (mod && typeof mod.lineaDesdeArray === "function") return mod.lineaDesdeArray(arr, sep);
    const v = Array.isArray(arr) ? arr : [];
    return v.length ? v.join(" " + sep + " ") : "/";
  }

  function resolverLecturaFormularioOperativo(ctx = {}) {
    const mod = formularioOperativoWsp();
    if (mod && typeof mod.resolverLecturaFormularioOperativo === "function") {
      return mod.resolverLecturaFormularioOperativo(ctx);
    }
    return null;
  }

  // ======================================================
  // ===== NORMALIZADORES DE SALIDA =======================
  // ======================================================
  function normalizarTituloOperativo(txt) {
    const mod = textoOperativoWsp();
    if (mod && typeof mod.normalizarTituloOperativo === "function") return mod.normalizarTituloOperativo(txt);
    if (!txt) return "";

    let t = txt.toLowerCase().trim();
    t = t.replace(/\b\w/g, (l) => l.toUpperCase());
    t = t.replace(/\b(o\.?\s*op\.?|op)\s*0*(\d+\/\d+)\b/i, "O.Op. $2");

    return t;
  }

  function normalizarLugar(txt) {
    const mod = textoOperativoWsp();
    if (mod && typeof mod.normalizarLugar === "function") return mod.normalizarLugar(txt);
    if (!txt) return "";
    return txt
      .toLowerCase()
      .trim()
      .replace(/\b\w/g, (l) => l.toUpperCase());
  }

  function normalizarHorario(txt) {
    const mod = textoOperativoWsp();
    if (mod && typeof mod.normalizarHorario === "function") return mod.normalizarHorario(txt);
    if (!txt) return "";

    let t = txt.toLowerCase().replace(/\s+/g, " ").trim();
    t = t.replace(/\bfinalizar\b/g, "Finalizar");

    return t;
  }

  function bold(txt) {
    const mod = textoOperativoWsp();
    if (mod && typeof mod.bold === "function") return mod.bold(txt);
    return `*${String(txt || "").trim()}*`;
  }

  function mensajesOperativoWsp() {
    return window.WSP?.messages?.operativo || window.WSP?.modules?.mensajesOperativo || null;
  }

  function valorObservacionPorDefecto() {
    const txt = String(document.getElementById("obs")?.value || "").trim();
    return txt || "Sin novedad";
  }

  function construirObservacionesFinales(observacionesExtras = []) {
    const mod = mensajesOperativoWsp();
    const usuario = String(document.getElementById("obs")?.value || "").trim();
    if (mod && typeof mod.construirObservacionesFinales === "function") {
      return mod.construirObservacionesFinales(usuario, observacionesExtras);
    }

    const extras = Array.isArray(observacionesExtras)
      ? observacionesExtras.map((linea) => limpiarTextoSimple(linea)).filter(Boolean)
      : [];

    if (usuario && extras.length) return `${usuario}\n${extras.join("\n")}`;
    if (usuario) return usuario;
    if (extras.length) return extras.join("\n");
    return "Sin novedad";
  }

  function compactarSaltos(texto) {
    const mod = mensajesOperativoWsp();
    if (mod && typeof mod.compactarSaltos === "function") return mod.compactarSaltos(texto);
    return String(texto || "")
      .replace(/[ \t]+\n/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  }

  const ORGANISMOS_CONJUNTO = [
    { nombre: "UOR 3", patrones: [/\buor\s*3\b/, /\buor3\b/] },
    { nombre: "CNRT", patrones: [/\bcnrt\b/, /\bcrnt\b/, /\bc\s*n\s*r\s*t\b/] },
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

  function estadisticasUiWsp() {
    return window.WSP?.ui?.estadisticas || null;
  }

  function refsEstadisticasFinalizadoWsp() {
    return {
      selTipo,
      chkPresenciaActiva,
      bloquePresenciaActiva,
      chkMostrarResultadosFinaliza,
      bloqueMostrarResultadosFinaliza,
      tituloResultadosFinaliza,
      contenidoResultadosFinaliza,
      divDetalles,
      bloquePositivosAlcoholimetro,
      wrapGraduacionesSancionable,
      wrapGraduacionesNoSancionable,
      unitGraduacionesSancionable,
      unitGraduacionesNoSancionable,
      wrapQrzCasilleros,
      wrapDominioCasilleros,
    };
  }

  function ctxEstadisticasFinalizadoWsp() {
    return {
      refs: refsEstadisticasFinalizadoWsp(),
      franja: franjaSeleccionada,
      deps: {
        normalizarBasicoSinAcentos,
        obtenerTextoRefOrdenDeFranja,
        obtenerTipoCortoFranja,
        construirTextoOpcionHorario,
        esControlSuperiorActivo,
        sincronizarUIAlcoholimetro,
        sincronizarUIQrzDominio,
      },
    };
  }

  function obtenerFuenteTipoActual() {
    const mod = estadisticasUiWsp();
    if (mod && typeof mod.obtenerFuenteTipoActual === "function") {
      return mod.obtenerFuenteTipoActual(ctxEstadisticasFinalizadoWsp());
    }
    return normalizarBasicoSinAcentos([
      franjaSeleccionada?.titulo || "",
      obtenerTextoRefOrdenDeFranja(franjaSeleccionada),
      obtenerTipoCortoFranja(franjaSeleccionada),
      construirTextoOpcionHorario(franjaSeleccionada),
    ].join(" "));
  }

  function esFinalizaSinResultados() {
    const mod = estadisticasUiWsp();
    if (mod && typeof mod.esFinalizaSinResultados === "function") return mod.esFinalizaSinResultados(ctxEstadisticasFinalizadoWsp());
    const fuente = obtenerFuenteTipoActual();
    return /\bcustodia\b|\btraslado\b/.test(fuente);
  }

  function esFinalizaConResultadosOpcionales() {
    const mod = estadisticasUiWsp();
    if (mod && typeof mod.esFinalizaConResultadosOpcionales === "function") return mod.esFinalizaConResultadosOpcionales(ctxEstadisticasFinalizadoWsp());
    const fuente = obtenerFuenteTipoActual();
    return /\bordenamiento\b|\bestablecido\b|\bmonitoreo\b|\bpresencia\s*activa\b|\blimpieza\b|\bablacion\b/.test(fuente);
  }

  function esTipoConPresenciaActivaOpcional() {
    const mod = estadisticasUiWsp();
    if (mod && typeof mod.esTipoConPresenciaActivaOpcional === "function") return mod.esTipoConPresenciaActivaOpcional(ctxEstadisticasFinalizadoWsp());

    const fuente = obtenerFuenteTipoActual();
    if (!fuente) return false;
    if (/\bordenamiento\b|\bablacion\b|\blimpieza\b|\bestablecido\b|\bmonitoreo\b|\bacompanamiento\b|\bacompanamieto\b|\bescolta\b|\bcustodia\b|\btraslado\b|\bpresencia\s*activa\b/.test(fuente)) return false;
    return /\bocv\b|\bcontrol\s+vehicular\b|\boperativo\s+de\s+control\s+vehicular\b|\balcoholem/i.test(fuente)
      || /\bdicep\b|\ben\s+conjunto\b|\boperativo\s+en\s+conjunto\b|\bconjunto\b|\bcoordinad\w*\b|\bcontrol\s+de\s+peso\b|\bpeso\b|\bcontrol\b/.test(fuente);
  }

  function debeOcultarTodoPorPresenciaActivaFinaliza() {
    const mod = estadisticasUiWsp();
    if (mod && typeof mod.debeOcultarTodoPorPresenciaActivaFinaliza === "function") return mod.debeOcultarTodoPorPresenciaActivaFinaliza(ctxEstadisticasFinalizadoWsp());
    return selTipo?.value === "FINALIZA" && !!chkPresenciaActiva?.checked;
  }

  function debeIncluirResultadosFinaliza() {
    const mod = estadisticasUiWsp();
    if (mod && typeof mod.debeIncluirResultadosFinaliza === "function") return mod.debeIncluirResultadosFinaliza(ctxEstadisticasFinalizadoWsp());
    if (selTipo?.value !== "FINALIZA") return false;
    if (debeOcultarTodoPorPresenciaActivaFinaliza()) return false;
    if (esFinalizaSinResultados()) return false;
    if (esFinalizaConResultadosOpcionales()) return !!chkMostrarResultadosFinaliza?.checked;
    return true;
  }

  function debeIncluirDetallesFinaliza() {
    const mod = estadisticasUiWsp();
    if (mod && typeof mod.debeIncluirDetallesFinaliza === "function") return mod.debeIncluirDetallesFinaliza(ctxEstadisticasFinalizadoWsp());
    if (selTipo?.value !== "FINALIZA") return false;
    if (debeOcultarTodoPorPresenciaActivaFinaliza()) return false;
    if (esFinalizaConResultadosOpcionales()) return !!chkMostrarResultadosFinaliza?.checked;
    if (esFinalizaSinResultados()) return true;
    return true;
  }

  function actualizarVisibilidadBloquePresenciaActiva() {
    const mod = estadisticasUiWsp();
    if (mod && typeof mod.actualizarVisibilidadBloquePresenciaActiva === "function") {
      return mod.actualizarVisibilidadBloquePresenciaActiva(ctxEstadisticasFinalizadoWsp());
    }

    if (esControlSuperiorActivo()) {
      if (bloquePresenciaActiva) bloquePresenciaActiva.classList.add("hidden");
      if (chkPresenciaActiva) chkPresenciaActiva.checked = false;
      return;
    }

    const mostrar = !!franjaSeleccionada && esTipoConPresenciaActivaOpcional();
    if (bloquePresenciaActiva) bloquePresenciaActiva.classList.toggle("hidden", !mostrar);
    if (!mostrar && chkPresenciaActiva) chkPresenciaActiva.checked = false;
  }

  function actualizarVisibilidadResultadosFinaliza() {
    const mod = estadisticasUiWsp();
    if (mod && typeof mod.actualizarVisibilidadResultadosFinaliza === "function") {
      return mod.actualizarVisibilidadResultadosFinaliza(ctxEstadisticasFinalizadoWsp());
    }

    const fin = selTipo?.value === "FINALIZA";
    const resultadosOpcionales = fin && esFinalizaConResultadosOpcionales();
    const mostrarResultados = fin && debeIncluirResultadosFinaliza();
    const mostrarDetalles = fin && debeIncluirDetallesFinaliza();

    if (bloqueMostrarResultadosFinaliza) bloqueMostrarResultadosFinaliza.classList.toggle("hidden", !resultadosOpcionales);
    if (tituloResultadosFinaliza) tituloResultadosFinaliza.classList.toggle("hidden", !mostrarResultados);
    if (contenidoResultadosFinaliza) contenidoResultadosFinaliza.classList.toggle("hidden", !mostrarResultados);
    if (divDetalles) divDetalles.classList.toggle("hidden", !mostrarDetalles);

    if (!mostrarResultados) {
      if (bloquePositivosAlcoholimetro) bloquePositivosAlcoholimetro.classList.add("hidden");
      if (wrapGraduacionesSancionable) wrapGraduacionesSancionable.classList.add("hidden");
      if (wrapGraduacionesNoSancionable) wrapGraduacionesNoSancionable.classList.add("hidden");
      if (unitGraduacionesSancionable) unitGraduacionesSancionable.classList.add("hidden");
      if (unitGraduacionesNoSancionable) unitGraduacionesNoSancionable.classList.add("hidden");
      if (wrapQrzCasilleros) wrapQrzCasilleros.classList.add("hidden");
      if (wrapDominioCasilleros) wrapDominioCasilleros.classList.add("hidden");
      if (!mostrarDetalles) return;
    }

    if (mostrarResultados) {
      sincronizarUIAlcoholimetro();
      sincronizarUIQrzDominio();
    }
  }

  // ======================================================
  // ===== DETALLES ========================================
  // ======================================================  // ===== DETALLES SERVICE BRIDGE =====
  // La lógica real fue extraída a WSP/modules/wsp-detalles.js.
  // Estas funciones puente conservan los nombres usados por el wsp.js actual.
  function obtenerServicioDetallesWsp(nombreFuncion) {
    const svc = window.WSP?.services?.detalles;
    if (!svc || typeof svc[nombreFuncion] !== "function") {
      throw new Error(`[WSP] No se cargó el módulo Detalles: ${nombreFuncion}`);
    }
    return svc[nombreFuncion];
  }

  function limpiarDescripcionDetalle(...args) {
    return obtenerServicioDetallesWsp("limpiarDescripcionDetalle")(...args);
  }

  function obtenerReferenciaNomenclador(...args) {
    return obtenerServicioDetallesWsp("obtenerReferenciaNomenclador")(...args);
  }

  function codigoExisteEnNomenclador(...args) {
    return obtenerServicioDetallesWsp("codigoExisteEnNomenclador")(...args);
  }

  function codigosInvalidosNomenclador(...args) {
    return obtenerServicioDetallesWsp("codigosInvalidosNomenclador")(...args);
  }

  function reconstruirLineaDetalle(...args) {
    return obtenerServicioDetallesWsp("reconstruirLineaDetalle")(...args);
  }

  function esReferenciaDecreto460(...args) {
    return obtenerServicioDetallesWsp("esReferenciaDecreto460")(...args);
  }

  function construirObservacionDecreto460(...args) {
    return obtenerServicioDetallesWsp("construirObservacionDecreto460")(...args);
  }

  function extraerNumeralResultadoFlexible(...args) {
    return obtenerServicioDetallesWsp("extraerNumeralResultadoFlexible")(...args);
  }

  function extraerNumeralDto460Resultado(...args) {
    return obtenerServicioDetallesWsp("extraerNumeralDto460Resultado")(...args);
  }

  function leerResultadoCampo(...args) {
    return obtenerServicioDetallesWsp("leerResultadoCampo")(...args);
  }

  function obtenerCodigoDetalleInicialNoProcedimiento460(...args) {
    return obtenerServicioDetallesWsp("obtenerCodigoDetalleInicialNoProcedimiento460")(...args);
  }

  function normalizarDetalleDecreto460(...args) {
    return obtenerServicioDetallesWsp("normalizarDetalleDecreto460")(...args);
  }

  function autocompletarLineaDetalleConNomenclador(...args) {
    return obtenerServicioDetallesWsp("autocompletarLineaDetalleConNomenclador")(...args);
  }

  function analizarLineaDetalleParaAutocompletar(...args) {
    return obtenerServicioDetallesWsp("analizarLineaDetalleParaAutocompletar")(...args);
  }

  function autocompletarDetallesDesdeNomenclador(...args) {
    return obtenerServicioDetallesWsp("autocompletarDetallesDesdeNomenclador")(...args);
  }

  function obtenerCodigoActualLineaDetalle(...args) {
    return obtenerServicioDetallesWsp("obtenerCodigoActualLineaDetalle")(...args);
  }

  function limpiarDescripcionAutocompletadaObsoleta(...args) {
    return obtenerServicioDetallesWsp("limpiarDescripcionAutocompletadaObsoleta")(...args);
  }

  function calcularLineaYColumnaDesdePosicion(...args) {
    return obtenerServicioDetallesWsp("calcularLineaYColumnaDesdePosicion")(...args);
  }

  function longitudHastaLinea(...args) {
    return obtenerServicioDetallesWsp("longitudHastaLinea")(...args);
  }

  function obtenerOrigenVisualDetalle(...args) {
    return obtenerServicioDetallesWsp("obtenerOrigenVisualDetalle")(...args);
  }

  function consolidarDetallesVisualesTextarea(...args) {
    return obtenerServicioDetallesWsp("consolidarDetallesVisualesTextarea")(...args);
  }

  function aplicarAutocompletadoDetalles(...args) {
    return obtenerServicioDetallesWsp("aplicarAutocompletadoDetalles")(...args);
  }

  function normalizarLineaDetalle(...args) {
    return obtenerServicioDetallesWsp("normalizarLineaDetalle")(...args);
  }

  function normalizarDetallesTexto(...args) {
    return obtenerServicioDetallesWsp("normalizarDetallesTexto")(...args);
  }

  function validarDetallesRequeridosPorActas(...args) {
    return obtenerServicioDetallesWsp("validarDetallesRequeridosPorActas")(...args);
  }



  function construirLineasResultados(agregadoInformes = null) {
    const campoVehiculos = leerResultadoCampo("vehiculos");
    const campoPersonas = leerResultadoCampo("personas");
    const campoTestAlom = leerResultadoCampo("testalom");
    const campoActas = leerResultadoCampo("actas");
    const campoRequisa = leerResultadoCampo("Requisa");
    const campoQrz = leerResultadoCampo("qrz");
    const campoDominio = leerResultadoCampo("dominio");
    const campoRemision = leerResultadoCampo("Remision");
    const campoRetencion = leerResultadoCampo("Retencion");
    const campoProhibicion = leerResultadoCampo("Prohibicion");
    const campoCesion = leerResultadoCampo("Cesion");

    const vehiculos = campoVehiculos.valor + valorAgregadoResultado(agregadoInformes, ["Vehículos Fiscalizados", "Vehiculos Fiscalizados"]);
    const personas = campoPersonas.valor + valorAgregadoResultado(agregadoInformes, ["Personas Identificadas", "Personas identificadas"]);
    const testalom = campoTestAlom.valor;
    const actasManual = campoActas.valor;
    const actas = campoActas.valor + valorAgregadoResultado(agregadoInformes, ["Actas Labradas", "Actas labradas"]);
    const requisa = campoRequisa.valor;
    const qrz = campoQrz.valor;
    const dominio = campoDominio.valor;
    const aggActas = valorAgregadoResultado(agregadoInformes, ["Actas Labradas", "Actas labradas"]);
    const aggRemision = valorAgregadoMedida(agregadoInformes, ["Remisión", "Vehículos remitidos"]);
    const aggRetencion = valorAgregadoMedida(agregadoInformes, ["Retención", "Licencias Retenidas"]);
    const aggProhibicion = valorAgregadoMedida(agregadoInformes, ["Prohibición de Circulación", "Prohibición de circular"]);
    const aggCesion = valorAgregadoMedida(agregadoInformes, ["Cesión de Conducción", "Cesión de la conducción"]);
    const aggDto460 = valorAgregadoResultado(agregadoInformes, ["Decreto 460/22", "Dto. 460/22"]);

    const remision = campoRemision.valor + aggRemision;
    const retencion = campoRetencion.valor + aggRetencion;
    const prohibicion = campoProhibicion.valor + aggProhibicion;
    const cesion = campoCesion.valor + aggCesion;

    const observaciones460Resultados = [];
    [
      campoVehiculos,
      campoPersonas,
      campoTestAlom,
      campoActas,
      campoRequisa,
      campoQrz,
      campoDominio,
      campoRemision,
      campoRetencion,
      campoProhibicion,
      campoCesion,
    ].forEach((campo) => pushUnicoTextoWsp(observaciones460Resultados, campo.observacion460));
    if (aggDto460 > 0) pushUnicoTextoWsp(observaciones460Resultados, construirObservacionDecreto460(aggDto460));

    const alcoholimetro = construirBloqueAlcoholimetro();
    if (!alcoholimetro.ok) {
      marcarErrorCampo(alcoholimetro.input, alcoholimetro.mensaje);
      return null;
    }

    if ((alcoholimetro.cantidadSancionables || 0) > 0 && actasManual <= 0) {
      marcarErrorCampo(
        document.getElementById("actas"),
        'Si hay al menos una alcoholemia positiva sancionable, "Actas Labradas" debe ser mayor a cero.'
      );
      return null;
    }

    if (actasManual > 0 && vehiculos <= 0) {
      marcarErrorCampo(
        document.getElementById("vehiculos"),
        'Si "Actas Labradas" es mayor a cero, "Vehículos Fiscalizados" no puede ser cero ni quedar vacío.'
      );
      return null;
    }

    if (actasManual > 0 && personas <= 0) {
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
      ...construirLineasAlcoholimetroConAgregado(alcoholimetro, agregadoInformes),
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

    lineas.__observaciones460Resultados = observaciones460Resultados;
    return lineas;
  }

  function setElementosVisibles(visible) {
    const mod = operativoUiWsp();
    if (mod && typeof mod.setElementosVisibles === "function") {
      return mod.setElementosVisibles(visible, refsOperativoUiWsp());
    }

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
    const mod = operativoUiWsp();
    if (mod && typeof mod.setPersonalVisible === "function") {
      return mod.setPersonalVisible(visible, refsOperativoUiWsp());
    }

    const el = document.getElementById("bloquePersonal");
    if (!el) return;
    el.classList.toggle("hidden", !visible);
  }

  function setMovilidadVisible(visible) {
    const mod = operativoUiWsp();
    if (mod && typeof mod.setMovilidadVisible === "function") {
      return mod.setMovilidadVisible(visible, refsOperativoUiWsp());
    }

    const el = document.getElementById("bloqueMovil");
    if (!el) return;
    el.classList.toggle("hidden", !visible);
  }


  function esControlSuperiorActivo() {
    // CONTROL SUPERIOR ya no vive como opción principal: debe ejecutarse dentro de INFORMES.
    // Se mantiene compatibilidad si algún HTML viejo todavía trae CONTROL SUPERIOR en el selector principal.
    const mod = modoUiWsp();
    if (mod && typeof mod.esControlSuperiorActivo === "function") {
      if (mod.esControlSuperiorActivo(refsModoUiWsp(), configModoUiWsp())) return true;
    } else if (getTipoInformeActivo() === INFORME_CONTROL_SUPERIOR_TIPO) {
      return true;
    }
    try {
      if (window.ControlSuperior && typeof window.ControlSuperior.isActive === "function") {
        return !!window.ControlSuperior.isActive();
      }
    } catch {}
    return false;
  }

  function setObservacionesVisible(visible) {
    const mod = operativoUiWsp();
    if (mod && typeof mod.setObservacionesVisible === "function") {
      return mod.setObservacionesVisible(visible, refsOperativoUiWsp());
    }

    if (labelObs) labelObs.classList.toggle("hidden", !visible);
    if (textareaObs) textareaObs.classList.toggle("hidden", !visible);
  }

  function setControlSuperiorVisible(visible) {
    if (bloqueControlSuperior) bloqueControlSuperior.classList.toggle("hidden", !visible);
  }

  function setUIControlSuperiorActiva(activa) {
    if (activa) aplicarPantallaExclusivaWsp("CONTROL_SUPERIOR");
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
      refrescarContextoControlSuperior();
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
    refrescarResumenInformesIntermediosFinalizado();
  }

  function resetUI() {
    ordenSeleccionada = null;
    franjaSeleccionada = null;
    inicioGuardadoActual = null;
    firmaInformesIntermediosAplicadosFinalizado = "";

    selTipo.value = "INICIA";
    aplicarPantallaExclusivaWsp("INICIA", { mostrarFormularioBase: true });
    limpiarSeleccionOperativo();

    limpiarFormularioDomWsp();

    resetearInformesUIWsp();

    const obs = document.getElementById("obs");
    if (obs) obs.value = "";

    ocultarBloquesDinamicosFinalizaWsp();
    setUIControlMovilesActiva(false);

    limpiarGraduaciones(graduacionesSancionable);
    limpiarGraduaciones(graduacionesNoSancionable);
    limpiarListaDinamica(qrzCasilleros);
    limpiarListaDinamica(dominioCasilleros);

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


  // ===== HISTORIAL OPERATIVOS SUPABASE =====
  function arrayDesdeLineaHistorialWsp(linea) {
    const mod = payloadOperativoWsp();
    if (mod && typeof mod.arrayDesdeLineaHistorialWsp === "function") return mod.arrayDesdeLineaHistorialWsp(linea);
    const raw = limpiarTextoSimple(linea || "");
    if (!raw || raw === "/") return [];
    return raw.split("/").map((v) => limpiarTextoSimple(v)).filter(Boolean).filter((v) => v !== "/");
  }

  function fechaFranjaHistorialWsp(franja) {
    const mod = payloadOperativoWsp();
    if (mod && typeof mod.fechaFranjaHistorialWsp === "function") return mod.fechaFranjaHistorialWsp(franja);
    return limpiarTextoSimple(franja?.fecha || franja?.__fechaOperativo || "");
  }

  function extraerMapasResultadosHistorialWsp(lineas = []) {
    const mod = payloadOperativoWsp();
    if (mod && typeof mod.extraerMapasResultadosHistorialWsp === "function") return mod.extraerMapasResultadosHistorialWsp(lineas);
    const resultados = {};
    const medidas = {};
    let enMedidas = false;

    (Array.isArray(lineas) ? lineas : []).forEach((linea) => {
      const texto = limpiarTextoSimple(linea || "");
      if (!texto) return;
      if (/^medidas cautelares:?$/i.test(texto)) {
        enMedidas = true;
        return;
      }
      const m = texto.match(/^(.+?):\s*\((\d{1,3})\)/);
      if (!m) return;
      const key = limpiarTextoSimple(m[1]);
      const value = parseInt(m[2], 10) || 0;
      if (enMedidas) medidas[key] = value;
      else resultados[key] = value;
    });

    return { resultados, medidas };
  }

  function construirPayloadHistorialOperativoWsp({
    tipoEvento,
    textoFinal,
    personalTexto,
    mov,
    mot,
    escopetasTXT,
    htTXT,
    pdaTXT,
    impTXT,
    alomTXT,
    alcoTXT,
    lineasResultados,
    detallesProcesados,
    observacionesFinales,
  }) {
    const mod = payloadOperativoWsp();
    if (mod && typeof mod.construirPayloadHistorialOperativoWsp === "function") {
      return mod.construirPayloadHistorialOperativoWsp({
        tipoEvento,
        textoFinal,
        personalTexto,
        mov,
        mot,
        escopetasTXT,
        htTXT,
        pdaTXT,
        impTXT,
        alomTXT,
        alcoTXT,
        lineasResultados,
        detallesProcesados,
        observacionesFinales,
        franja: franjaSeleccionada,
        fecha: new Date().toLocaleDateString("es-AR"),
        deps: {
          extraerHorarioPartesWsp,
          normalizarArrayJsonWsp,
          getGuardiaFechaISO,
          obtenerTipoCortoFranja,
          obtenerNumeroOrdenDeFranja,
          obtenerTextoRefOrdenDeFranja,
          getDiaGuardiaTexto,
        },
      });
    }
    const partesHorario = extraerHorarioPartesWsp(franjaSeleccionada?.horario || "");
    const mapas = extraerMapasResultadosHistorialWsp(lineasResultados || []);
    const ordenes = normalizarArrayJsonWsp(franjaSeleccionada?.__ordenesOrigen || franjaSeleccionada?.__ordenNum || "");

    return {
      fuente: "WSP",
      operativo_key: limpiarTextoSimple(franjaSeleccionada?.__operativoKey || construirOperativoKeyEstable(franjaSeleccionada)),
      operativo_publicado_id: franjaSeleccionada?.__operativoPublicadoId || null,
      guardia_fecha: getGuardiaFechaISO(),
      fecha_operativo: fechaFranjaHistorialWsp(franjaSeleccionada),
      fecha: new Date().toLocaleDateString("es-AR"),
      horario: normalizarHorario(franjaSeleccionada?.horario || ""),
      hora_desde: partesHorario.desde || "",
      hora_hasta: partesHorario.hasta || "",
      lugar: normalizarLugar(franjaSeleccionada?.lugar || ""),
      lugar_normalizado: normalizarLugar(franjaSeleccionada?.lugar || ""),
      tipo_operativo: obtenerTipoCortoFranja(franjaSeleccionada),
      titulo: limpiarTextoSimple(franjaSeleccionada?.titulo || ""),
      ordenes_origen: ordenes,
      personal: String(personalTexto || "").split("\n").map((v) => limpiarTextoSimple(v)).filter(Boolean),
      moviles: arrayDesdeLineaHistorialWsp(mov),
      motos: arrayDesdeLineaHistorialWsp(mot),
      elementos: {
        ESCOPETA: arrayDesdeLineaHistorialWsp(escopetasTXT),
        HT: arrayDesdeLineaHistorialWsp(htTXT),
        PDA: arrayDesdeLineaHistorialWsp(pdaTXT),
        IMPRESORA: arrayDesdeLineaHistorialWsp(impTXT),
        Alometro: arrayDesdeLineaHistorialWsp(alomTXT),
        Alcoholimetro: arrayDesdeLineaHistorialWsp(alcoTXT),
      },
      resultados: mapas.resultados,
      medidas_cautelares: mapas.medidas,
      detalles: Array.isArray(detallesProcesados?.detalleItems) ? detallesProcesados.detalleItems : [],
      observaciones: observacionesFinales,
      texto_generado: textoFinal,
      payload_completo: {
        tipo_evento: tipoEvento,
        franja: franjaSeleccionada,
        registro_original: franjaSeleccionada?.__registroOriginalPublicado || null,
      },
      metadata: {
        tipo_evento: tipoEvento,
        generado_desde: "wsp.js",
      },
    };
  }

  function esErrorValidacionOperativaWsp(error) {
    const code = String(error?.code || "").toUpperCase();
    const msg = String(error?.message || "").toUpperCase();
    return !!error?.esValidacionOperativa || code.startsWith("VALIDACION_") || msg.includes("DEBE INICIAR EL OPERATIVO");
  }

  function mensajeErrorOperativoWsp(error) {
    return String(error?.message || "Error de validación operativa.").trim() || "Error de validación operativa.";
  }

  function esEventoOperativoCriticoWsp(tipoEvento) {
    const tipo = limpiarTextoSimple(tipoEvento).toUpperCase();
    return tipo === "INICIO" || tipo === "FINALIZADO";
  }

  function resultadoGuardadoValidoWsp(resultado) {
    return !!(
      resultado &&
      resultado.estado &&
      resultado.evento &&
      resultado.estado.id &&
      resultado.evento.id
    );
  }

  async function guardarHistorialOperativoWsp(tipoEvento, payload) {
    const svcRepo = historialOperativoRepoWsp();
    if (svcRepo && typeof svcRepo.guardarHistorialOperativoWsp === "function") {
      try {
        return await svcRepo.guardarHistorialOperativoWsp(tipoEvento, payload, depsHistorialOperativoRepoWsp());
      } catch (e) {
        console.warn("[WSP] Historial operativo modular falló al guardar. Se usa fallback legacy.", e);
      }
    }

    const tipo = limpiarTextoSimple(tipoEvento).toUpperCase();
    const critico = esEventoOperativoCriticoWsp(tipo);

    try {
      const repo = window.BMZCN?.OperativosRepo;
      if (!repo) {
        return {
          ok: false,
          motivo: "No se pudo guardar en Supabase: BMZCN.OperativosRepo no está cargado. No se enviará el informe porque Estadísticas no podría actualizarse."
        };
      }

      let resultado = null;
      if (tipo === "INICIO" && typeof repo.guardarInicio === "function") {
        resultado = await repo.guardarInicio(payload);
      } else if (tipo === "FINALIZADO" && typeof repo.guardarFinalizado === "function") {
        resultado = await repo.guardarFinalizado(payload);
      } else if (typeof repo.guardarInforme === "function") {
        resultado = await repo.guardarInforme(tipo, payload);
      } else {
        return {
          ok: false,
          motivo: `No se pudo guardar en Supabase: función de guardado no disponible para ${tipo || "EVENTO"}.`
        };
      }

      if (critico && !resultadoGuardadoValidoWsp(resultado)) {
        return {
          ok: false,
          motivo: "No se confirmó el guardado en Supabase. No se enviará por WhatsApp porque Estadísticas no podría actualizarse."
        };
      }

      console.log("[WSP] Evento guardado en Supabase", tipo, resultado);
      return resultado;
    } catch (e) {
      if (esErrorValidacionOperativaWsp(e)) {
        return { ok: false, motivo: mensajeErrorOperativoWsp(e), error: e };
      }
      console.error("[WSP] Falló el guardado en Supabase.", e);
      return {
        ok: false,
        motivo: critico
          ? `No se pudo guardar ${tipo} en Supabase. No se enviará por WhatsApp porque Estadísticas no podría actualizarse. Detalle: ${mensajeErrorOperativoWsp(e)}`
          : `No se pudo guardar el informe en Supabase. Detalle: ${mensajeErrorOperativoWsp(e)}`,
        error: e
      };
    }
  }

  function historialInformesRepoWsp() {
    return window.WSP?.services?.historialInformes || window.WSP?.modules?.historialInformes || null;
  }

  function depsHistorialInformesWsp() {
    return {
      limpiarTextoSimple,
      normalizarBasicoSinAcentos,
      normalizarNumeroActaInforme,
      getGuardiaFechaISO,
      construirOperativoKeyEstable,
      alert: (msg) => alert(msg),
      console,
    };
  }

  function normalizarComponenteInformeKeyWsp(value) {
    const svc = historialInformesRepoWsp();
    if (svc && typeof svc.normalizarComponenteInformeKeyWsp === "function") {
      return svc.normalizarComponenteInformeKeyWsp(value);
    }
    return normalizarBasicoSinAcentos(String(value || ""))
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "")
      .slice(0, 120);
  }

  function clasificacionEventoInformeWsp(tipoEvento) {
    const svc = historialInformesRepoWsp();
    if (svc && typeof svc.clasificacionEventoInformeWsp === "function") {
      return svc.clasificacionEventoInformeWsp(tipoEvento);
    }
    const tipo = String(tipoEvento || "").toUpperCase();
    if (tipo === "ALCOHOLEMIA_POSITIVA") {
      return {
        categoria_evento: "PREVENTIVO",
        subtipo_evento: "ALCOHOLEMIA_POSITIVA",
        area_interes: ["SEGURIDAD_VIAL", "POLICIAL"],
        requiere_fiscalia: false,
        requiere_traslado_comisaria: false,
        requiere_word_semanal: true,
        informe_word_destino: ["ALCOHOLEMIAS_SEMANAL"],
        alimenta_finalizado: false,
        alimenta_estadisticas: false,
        contador_circular: true,
      };
    }
    if (tipo === "DECTO_460_22") {
      return {
        categoria_evento: "PREVENTIVO",
        subtipo_evento: "DECTO_460_22",
        area_interes: ["SEGURIDAD_VIAL", "POLICIAL"],
        requiere_fiscalia: false,
        requiere_traslado_comisaria: false,
        requiere_word_semanal: true,
        informe_word_destino: ["PROCEDIMIENTOS_SEMANAL"],
        alimenta_finalizado: false,
        alimenta_estadisticas: false,
        contador_circular: true,
      };
    }
    return {
      categoria_evento: "OPERATIVO",
      subtipo_evento: tipo || "INFORME",
      area_interes: ["POLICIAL"],
      requiere_fiscalia: false,
      requiere_traslado_comisaria: false,
      requiere_word_semanal: false,
      informe_word_destino: [],
      alimenta_finalizado: false,
      alimenta_estadisticas: false,
      contador_circular: false,
    };
  }

  function construirInformeKeyWsp(tipoEvento, payload, nroActa) {
    const svc = historialInformesRepoWsp();
    if (svc && typeof svc.construirInformeKeyWsp === "function") {
      return svc.construirInformeKeyWsp(tipoEvento, payload, nroActa, {
        franja: franjaSeleccionada,
        deps: depsHistorialInformesWsp(),
      });
    }
    const guardia = limpiarTextoSimple(payload?.guardia_fecha || getGuardiaFechaISO());
    const operativoKey = limpiarTextoSimple(
      payload?.operativo_key ||
      franjaSeleccionada?.__operativoKey ||
      construirOperativoKeyEstable(franjaSeleccionada) ||
      "sin_operativo"
    );
    const tipo = String(tipoEvento || payload?.tipo_evento || "").toUpperCase() || "INFORME";
    const acta = normalizarNumeroActaInforme(nroActa || payload?.payload_completo?.datos_formulario?.nro_acta || "");
    return [
      guardia,
      normalizarComponenteInformeKeyWsp(operativoKey) || "sin_operativo",
      tipo,
      acta || "sin_acta",
    ].join("|");
  }

  function prepararPayloadInformeEventoWsp(tipoEvento, payload, nroActa) {
    const svc = historialInformesRepoWsp();
    if (svc && typeof svc.prepararPayloadInformeEventoWsp === "function") {
      return svc.prepararPayloadInformeEventoWsp(tipoEvento, payload, nroActa, {
        franja: franjaSeleccionada,
        deps: depsHistorialInformesWsp(),
      });
    }
    const clasificacion = clasificacionEventoInformeWsp(tipoEvento);
    const guardiaFecha = limpiarTextoSimple(payload?.guardia_fecha || getGuardiaFechaISO());
    const operativoKey = limpiarTextoSimple(payload?.operativo_key || franjaSeleccionada?.__operativoKey || construirOperativoKeyEstable(franjaSeleccionada));
    const informeKey = limpiarTextoSimple(payload?.informe_key || construirInformeKeyWsp(tipoEvento, { ...payload, guardia_fecha: guardiaFecha, operativo_key: operativoKey }, nroActa));

    return {
      ...payload,
      tipo_evento: tipoEvento,
      guardia_fecha: guardiaFecha,
      operativo_key: operativoKey,
      informe_key: informeKey,

      categoria_evento: clasificacion.categoria_evento,
      subtipo_evento: clasificacion.subtipo_evento,
      area_interes: clasificacion.area_interes,
      requiere_fiscalia: clasificacion.requiere_fiscalia,
      requiere_traslado_comisaria: clasificacion.requiere_traslado_comisaria,
      requiere_word_semanal: clasificacion.requiere_word_semanal,
      informe_word_destino: clasificacion.informe_word_destino,

      // Regla actual: los informes NO alimentan el FINALIZADO ni los numerales estadísticos.
      // Quedan guardados para historial/Word/fotos y solo alimentan contador visual cuando corresponda.
      alimenta_finalizado: false,
      alimenta_estadisticas: false,
      contador_circular: clasificacion.contador_circular,

      payload_completo: {
        ...(payload?.payload_completo || {}),
        informe_key: informeKey,
        categoria_evento: clasificacion.categoria_evento,
        subtipo_evento: clasificacion.subtipo_evento,
        area_interes: clasificacion.area_interes,
        alimenta_finalizado: false,
        alimenta_estadisticas: false,
        contador_circular: clasificacion.contador_circular,
      },
      metadata: {
        ...(payload?.metadata || {}),
        tipo_evento: tipoEvento,
        informe_key: informeKey,
        generado_desde: "wsp.js",
        guardado_por_upsert: true,
        alimenta_finalizado: false,
        alimenta_estadisticas: false,
        contador_circular: clasificacion.contador_circular,
      },
    };
  }

  function payloadInformeEventoParaSupabaseWsp(data) {
    const svc = historialInformesRepoWsp();
    if (svc && typeof svc.payloadInformeEventoParaSupabaseWsp === "function") {
      return svc.payloadInformeEventoParaSupabaseWsp(data);
    }
    // Mantener el insert/upsert acotado a columnas usadas por la tabla de eventos.
    // El informe completo queda igualmente dentro de payload_completo y texto_generado.
    return {
      fuente: data.fuente || "WSP",
      operativo_key: data.operativo_key || "",
      tipo_evento: data.tipo_evento,
      guardia_fecha: data.guardia_fecha,
      informe_key: data.informe_key,

      horario: data.horario || "",
      lugar: data.lugar || "",
      tipo_operativo: data.tipo_operativo || "",
      resultados: data.resultados || {},
      medidas_cautelares: data.medidas_cautelares || {},
      detalles: Array.isArray(data.detalles) ? data.detalles : [],
      observaciones: data.observaciones || "",
      texto_generado: data.texto_generado || "",
      payload_completo: data.payload_completo || {},

      categoria_evento: data.categoria_evento,
      subtipo_evento: data.subtipo_evento,
      area_interes: Array.isArray(data.area_interes) ? data.area_interes : [],
      requiere_fiscalia: !!data.requiere_fiscalia,
      requiere_traslado_comisaria: !!data.requiere_traslado_comisaria,
      requiere_word_semanal: !!data.requiere_word_semanal,
      informe_word_destino: Array.isArray(data.informe_word_destino) ? data.informe_word_destino : [],
      alimenta_finalizado: false,
      alimenta_estadisticas: false,
      contador_circular: !!data.contador_circular,
    };
  }

  function resultadoInformeSinSupabaseWsp(data, motivo = "") {
    const svc = historialInformesRepoWsp();
    if (svc && typeof svc.resultadoInformeSinSupabaseWsp === "function") {
      return svc.resultadoInformeSinSupabaseWsp(data, motivo, {
        franja: franjaSeleccionada,
        deps: depsHistorialInformesWsp(),
      });
    }
    return {
      evento: {
        id: null,
        operativo_key: data?.operativo_key || "",
        guardia_fecha: data?.guardia_fecha || getGuardiaFechaISO(),
        informe_key: data?.informe_key || "",
        tipo_evento: data?.tipo_evento || "INFORME",
        payload_completo: data?.payload_completo || {},
      },
      estado: null,
      informe_key: data?.informe_key || "",
      supabase_ok: false,
      motivo_error: motivo,
    };
  }

  async function guardarInformeEventoWsp(tipoEvento, payload, nroActa) {
    const svc = historialInformesRepoWsp();
    if (svc && typeof svc.guardarInformeEventoWsp === "function") {
      try {
        return await svc.guardarInformeEventoWsp(tipoEvento, payload, nroActa, {
          franja: franjaSeleccionada,
          deps: depsHistorialInformesWsp(),
        });
      } catch (e) {
        console.warn("[WSP] Historial informes modular falló al guardar. Se usa fallback legacy.", e);
      }
    }
    const data = prepararPayloadInformeEventoWsp(tipoEvento, payload, nroActa);

    try {
      const repo = window.BMZCN?.OperativosRepo;
      if (repo?.guardarInforme) {
        const resultado = await repo.guardarInforme(tipoEvento, {
          ...data,
          nro_acta: nroActa,
          acta: nroActa,
          operativo_estado_id: franjaSeleccionada?.__inicioGuardadoPayload?.operativo_estado_id || data.operativo_estado_id || null,
        });
        return { ...resultado, supabase_ok: true };
      }
    } catch (e) {
      console.error("[WSP] Error guardando informe mediante OperativosRepo.", e);
      alert("Error guardando el informe en Supabase. Se enviará igual por WhatsApp; revise conexión/RLS/bucket para archivar fotos.");
      return resultadoInformeSinSupabaseWsp(data, String(e?.message || e || "error"));
    }

    // Respaldo sin REST si OperativosRepo no está cargado.
    // No se usa on_conflict ni guardados directos duplicados. El guardado canónico de informes
    // debe pasar por BMZCN.OperativosRepo para mantener una sola fuente de verdad.
    console.error("[WSP] OperativosRepo no disponible para guardar informe. No se usa fallback REST.");
    alert("No se pudo guardar el informe en Supabase porque OperativosRepo no está disponible. Se enviará igual por WhatsApp; las fotos no quedarán archivadas.");
    return resultadoInformeSinSupabaseWsp(data, "OperativosRepo no disponible");
  }

  function fotosInformesRepoWsp() {
    return window.WSP?.services?.fotosInformes || window.WSP?.modules?.fotosInformes || null;
  }

  function depsFotosInformesWsp() {
    return {
      SUPABASE_URL,
      HISTORIAL_FOTOS_BUCKET,
      HISTORIAL_FOTOS_TABLE,
      headersSupabase,
      getGuardiaFechaISO,
      limpiarTextoSimple,
      normalizarComponenteInformeKeyWsp,
      construirOperativoKeyEstable,
      normalizarImagenControlMovil,
      fetch: window.fetch,
      console,
    };
  }

  async function eliminarFotosPreviasInformeWsp(resultadoHistorial) {
    const svc = fotosInformesRepoWsp();
    if (svc && typeof svc.eliminarFotosPreviasInformeWsp === "function") {
      try {
        return await svc.eliminarFotosPreviasInformeWsp(resultadoHistorial, {
          franja: franjaSeleccionada,
          deps: depsFotosInformesWsp(),
        });
      } catch (e) {
        console.warn("[WSP] Fotos informes modular falló al limpiar fotos previas. Se usa fallback legacy.", e);
      }
    }

    const evento = resultadoHistorial?.evento || {};
    const informeKey = limpiarTextoSimple(evento.informe_key || resultadoHistorial?.informe_key || evento?.payload_completo?.informe_key || "");
    const guardiaFecha = limpiarTextoSimple(evento.guardia_fecha || getGuardiaFechaISO());
    if (!informeKey) return;

    const filtros = new URLSearchParams({
      guardia_fecha: `eq.${guardiaFecha}`,
      informe_key: `eq.${informeKey}`,
    });

    try {
      const r = await fetch(`${SUPABASE_URL}/rest/v1/${HISTORIAL_FOTOS_TABLE}?${filtros.toString()}`, {
        method: "DELETE",
        headers: headersSupabase({ Prefer: "return=minimal" }),
      });
      if (!r.ok) {
        console.warn("[WSP] No se pudieron limpiar fotos previas por informe_key:", r.status, await r.text().catch(() => ""));
      }
    } catch (e) {
      console.warn("[WSP] Error limpiando fotos previas del informe.", e);
    }
  }

  // ===== INFORMES INTERMEDIOS: ALCOHOLEMIA POSITIVA =====

  function refsInformeAlcoholemiaWsp() {
    return {
      bloqueInformeAlcoholemia,
      informeAlcoholemiaContexto,
      infAlco460,
      infAlcoTipoVehiculo,
      wrapInfAlcoTipoOtro,
      infAlcoTipoOtro,
      infAlcoMarca,
      infAlcoModelo,
      infAlcoDominio,
      infAlcoConductor,
      infAlcoGraduacion,
      infAlcoActa,
      infAlcoLicenciaClase,
      infAlcoLicenciaDigital,
      infAlcoOtrosCodigos,
      infAlcoMedProhibicion,
      infAlcoMedCesion,
      infAlcoMedRemision,
      infAlcoMedRetencion,
      infAlcoDependenciaRemite,
      infAlcoCorralon,
      infAlcoInventario,
      bloqueAlcoRemisionDestino,
      infAlcoObservacionExtra,
      infAlcoResultadoAuto,
      infAlcoFotos,
    };
  }

  function moduloInformeAlcoholemiaWsp() {
    return window.WSP?.modules?.alcoholemia || null;
  }

  function esInformeAlcoholemiaActivo() {
    const mod = modoUiWsp();
    if (mod && typeof mod.esInformeAlcoholemiaActivo === "function") {
      return mod.esInformeAlcoholemiaActivo(refsModoUiWsp(), configModoUiWsp());
    }
    return getTipoInformeActivo() === INFORME_ALCOHOLEMIA_TIPO;
  }

  function esInformeDecto460Activo() {
    const mod = modoUiWsp();
    if (mod && typeof mod.esInformeDecto460Activo === "function") {
      return mod.esInformeDecto460Activo(refsModoUiWsp(), configModoUiWsp());
    }
    return getTipoInformeActivo() === INFORME_DECRETO_460_TIPO;
  }

  function esInformeAlcoholemia460Seleccionado() {
    const mod = moduloInformeAlcoholemiaWsp();
    if (mod && typeof mod.es460Seleccionado === "function") {
      return mod.es460Seleccionado(refsInformeAlcoholemiaWsp());
    }
    return !!infAlco460?.checked;
  }

  function normalizarMayusInforme(value) {
    const mod = textoOperativoWsp();
    if (mod && typeof mod.normalizarMayus === "function") return mod.normalizarMayus(value);
    return limpiarTextoSimple(value || "").toUpperCase();
  }

  function normalizarMayusInformeInput(value) {
    const mod = textoOperativoWsp();
    if (mod && typeof mod.normalizarMayusInput === "function") return mod.normalizarMayusInput(value);
    // Para escritura en vivo: no usar trim(), porque si el usuario escribe
    // "QUISPE " se borra el espacio final y parece que el campo no permite
    // separar nombre/apellido o marca/modelo. El recorte se hace en blur/envío.
    return String(value || "")
      .replace(/[–—]/g, "-")
      .toUpperCase();
  }

  function normalizarDominioInforme(value) {
    const mod = textoOperativoWsp();
    if (mod && typeof mod.normalizarDominio === "function") return mod.normalizarDominio(value);
    return normalizarMayusInforme(value).replace(/\s+/g, "");
  }

  function normalizarNumeroActaInforme(value) {
    const mod = textoOperativoWsp();
    if (mod && typeof mod.normalizarNumeroActa === "function") return mod.normalizarNumeroActa(value);
    return String(value || "").replace(/\D+/g, "");
  }

  function normalizarGraduacionInforme(value) {
    const mod = textoOperativoWsp();
    if (mod && typeof mod.normalizarGraduacion === "function") return mod.normalizarGraduacion(value);
    return String(value || "").replace(/\s+/g, "").replace(",", ".").trim();
  }

  function normalizarLicenciaInforme(value) {
    return normalizarMayusInforme(value || "").replace(/\s+/g, "");
  }

  function infoLicenciaInformeAlcoholemia() {
    const mod = moduloInformeAlcoholemiaWsp();
    if (mod && typeof mod.infoLicencia === "function") {
      return mod.infoLicencia(refsInformeAlcoholemiaWsp());
    }
    const valor = normalizarLicenciaInforme(infAlcoLicenciaClase?.value || "");
    const digital = !!infAlcoLicenciaDigital?.checked;
    const esDniSinLicencia = /^\d{7,8}$/.test(valor);
    const esClaseLicencia = !esDniSinLicencia && /^[A-Z0-9.]{2,5}$/.test(valor);
    return {
      valor,
      digital: digital && !esDniSinLicencia,
      esDniSinLicencia,
      esClaseLicencia,
      retencionAutomatica: !!valor && esClaseLicencia && !digital,
      codigoSinLicencia: esDniSinLicencia ? "9119" : "",
    };
  }

  function parseCodigosInputInforme(value) {
    return String(value || "")
      .split(/[\s,;/]+/)
      .map((v) => v.replace(/\D+/g, ""))
      .filter(Boolean)
      .filter((codigo, idx, arr) => arr.indexOf(codigo) === idx);
  }

  function sincronizarCodigosAutomaticosAlcoholemia(calc = null) {
    const mod = moduloInformeAlcoholemiaWsp();
    if (mod && typeof mod.sincronizarCodigosAutomaticos === "function") {
      return mod.sincronizarCodigosAutomaticos(refsInformeAlcoholemiaWsp(), calc);
    }
    if (!infAlcoOtrosCodigos) return;
  }

  function graduacionNumeroInforme(value) {
    const n = Number(normalizarGraduacionInforme(value));
    return Number.isFinite(n) ? n : null;
  }

  function fmtHoraInforme(date = new Date()) {
    return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
  }

  function fmtFechaInforme(date = new Date()) {
    return `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")}/${date.getFullYear()}`;
  }

  function grupoVehiculoAlcoholemia(value) {
    const mod = moduloInformeAlcoholemiaWsp();
    if (mod && typeof mod.grupoVehiculo === "function") return mod.grupoVehiculo(value);
    const v = normalizarBasicoSinAcentos(value || "").replace(/[\-_]+/g, " ").trim();
    if (/\bmoto\b|motovehiculo|motovehiculo/.test(v)) return "moto";
    if (/\bcamion\b|transporte de pasajeros|chasis con cabina|chasis sin cabina|tractor de carretera|carreton/.test(v)) return "profesional";
    return "general";
  }

  function labelTipoVehiculoInforme() {
    const val = infAlcoTipoVehiculo?.value || "";
    if (val === "otros") return normalizarMayusInforme(infAlcoTipoOtro?.value || "OTROS");
    const opt = infAlcoTipoVehiculo?.selectedOptions?.[0];
    return normalizarMayusInforme(opt?.textContent || val);
  }

  function calcularAlcoholemiaInforme(tipoVehiculo, graduacion) {
    const mod = moduloInformeAlcoholemiaWsp();
    if (mod && typeof mod.calcular === "function") return mod.calcular(tipoVehiculo, graduacion);
    const n = graduacionNumeroInforme(graduacion);
    if (n == null || n <= 0) return null;
    const grupo = grupoVehiculoAlcoholemia(tipoVehiculo);
    if (grupo === "moto") return { grupo, codigo: "2020", sancionable: n > 0.20, noSancionable: n > 0 && n <= 0.20 };
    if (grupo === "profesional") return { grupo, codigo: "2033", sancionable: n > 0, noSancionable: false };
    return { grupo, codigo: "2016", sancionable: n > 0.50, noSancionable: n > 0 && n <= 0.50 };
  }

  function inferirDestinoRemisionAlcoholemia() {
    const fuente = normalizarBasicoSinAcentos([
      franjaSeleccionada?.lugar,
      franjaSeleccionada?.titulo,
      franjaSeleccionada?.tipo,
      franjaSeleccionada?.__tipoPublicado,
      obtenerTipoCortoFranja(franjaSeleccionada),
    ].filter(Boolean).join(" "));
    if (/rn\s*(?:n|nro|num|numero|n°|nº)?\s*168|ruta\s*nacional\s*(?:n|nro|num|numero|n°|nº)?\s*168|rp\s*0*1\b|ruta\s*provincial\s*(?:n|nro|num|numero|n°|nº)?\s*0*1\b|km\s*0+\s*(?:a|al|hasta)\s*km\s*18/.test(fuente)) return "RINCON";
    if (/rp\s*0*5\b|ruta\s*provincial\s*(?:n|nro|num|numero|n°|nº)?\s*0*5\b|rp\s*0*2\b|ruta\s*provincial\s*(?:n|nro|num|numero|n°|nº)?\s*0*2\b/.test(fuente)) return "RECREO";
    return "";
  }

  function completarDestinoRemisionSiVacio() {
    if (!infAlcoCorralon) return;
    if (normalizarMayusInforme(infAlcoCorralon.value)) return;
    const destino = inferirDestinoRemisionAlcoholemia();
    if (destino) infAlcoCorralon.value = destino;
  }

  function actualizarReglasInformeAlcoholemia() {
    const mod = moduloInformeAlcoholemiaWsp();
    if (mod && typeof mod.actualizarReglas === "function") {
      return mod.actualizarReglas(refsInformeAlcoholemiaWsp(), {
        completarDestinoRemisionSiVacio,
        labelTipoVehiculoInforme,
      });
    }
  }

  function aplicarMayusculasInputsInformeAlcoholemia() {
    const mod = moduloInformeAlcoholemiaWsp();
    if (mod && typeof mod.aplicarMayusculasInputs === "function") {
      return mod.aplicarMayusculasInputs(refsInformeAlcoholemiaWsp());
    }
    document.querySelectorAll("#bloqueInformeAlcoholemia .upper-input").forEach((el) => {
      const pos = el.selectionStart;
      const end = el.selectionEnd;
      el.value = normalizarMayusInformeInput(el.value);
      try { if (pos != null && end != null) el.setSelectionRange(pos, end); } catch {}
    });
  }

  function limpiarInformeAlcoholemia() {
    const mod = moduloInformeAlcoholemiaWsp();
    if (mod && typeof mod.limpiar === "function") {
      return mod.limpiar(refsInformeAlcoholemiaWsp(), {
        limpiarErrorCampo,
        completarDestinoRemisionSiVacio,
        labelTipoVehiculoInforme,
      });
    }
  }

  function esFranjaPatrullajeInformeAlcoholemia(franja) {
    const t = normalizarBasicoSinAcentos([
      franja?.titulo,
      franja?.__tipoPublicado,
      obtenerTipoCortoFranja(franja),
    ].filter(Boolean).join(" "));
    return /\bpatrullaje\b|\bpatrullajes\b|\bpatrulla\b/.test(t);
  }

  function ordenarCandidatosInformeAlcoholemia(candidatos = []) {
    return (Array.isArray(candidatos) ? candidatos : []).slice().sort((a, b) => {
      const ap = esFranjaPatrullajeInformeAlcoholemia(a) ? 0 : 1;
      const bp = esFranjaPatrullajeInformeAlcoholemia(b) ? 0 : 1;
      if (ap !== bp) return ap - bp;
      const at = Number.isFinite(a?.__inicioTs) ? a.__inicioTs : Number.MAX_SAFE_INTEGER;
      const bt = Number.isFinite(b?.__inicioTs) ? b.__inicioTs : Number.MAX_SAFE_INTEGER;
      return at - bt;
    });
  }

  async function seleccionarOperativoAlcoholemiaPorDefecto() {
    const seleccionModular = await seleccionarOperativoInformePorDefectoModularWsp({
      ordenarCandidatos: ordenarCandidatosInformeAlcoholemia,
      usarInicioLocal: true,
      fallbackUnico: true,
      fallbackPrimero: false,
      afterSelect: completarDestinoRemisionSiVacio,
    });
    if (seleccionModular !== null) return seleccionModular;

    if (!selHorario) return false;
    if (!Array.isArray(operativosCache) || !operativosCache.length || !operativosCache.some((op) => op?.__desdeInicioGuardado)) {
      await cargarOperativosIniciadosParaInformes(selHorario.value || "");
    }
    if (!Array.isArray(operativosCache) || !operativosCache.length) return false;

    if (franjaSeleccionada) {
      try {
        const inicioActual = await leerInicioDesdeSupabase(franjaSeleccionada);
        if (inicioActual) return true;
      } catch {}
    }

    const candidatos = ordenarCandidatosInformeAlcoholemia(operativosCache);
    for (const candidato of candidatos) {
      try {
        const inicio = await leerInicioDesdeSupabase(candidato);
        if (!inicio) continue;
        selHorario.value = candidato.__key || "";
        franjaSeleccionada = candidato;
        ordenSeleccionada = null;
        completarDestinoRemisionSiVacio();
        return true;
      } catch {}
    }

    // Respaldo local: si Supabase todavía no devolvió el inicio, pero hay un único
    // inicio local guardado o un solo operativo en la lista, preseleccionarlo para
    // no obligar al usuario a tocar el desplegable.
    const inicioLocal = cargarInicioLocal();
    if (inicioLocal) {
      let mejor = null;
      let mejorPuntaje = -1;
      candidatos.forEach((candidato) => {
        const puntaje = puntuarCoincidenciaInicio(inicioLocal, candidato);
        if (puntaje > mejorPuntaje) {
          mejor = candidato;
          mejorPuntaje = puntaje;
        }
      });
      if (mejor && (mejorPuntaje >= 90 || candidatos.length === 1)) {
        selHorario.value = mejor.__key || "";
        franjaSeleccionada = mejor;
        ordenSeleccionada = null;
        completarDestinoRemisionSiVacio();
        return true;
      }
    }

    if (!franjaSeleccionada && candidatos.length === 1) {
      const candidato = candidatos[0];
      selHorario.value = candidato.__key || "";
      franjaSeleccionada = candidato;
      ordenSeleccionada = null;
      completarDestinoRemisionSiVacio();
      return true;
    }

    return false;
  }

  async function obtenerInicioParaInformeAlcoholemia() {
    const inicioModular = await obtenerInicioSeleccionadoInformeModularWsp({
      seleccionarDefault: seleccionarOperativoAlcoholemiaPorDefecto,
    });
    if (inicioModular !== null) return inicioModular;

    if (!franjaSeleccionada) await seleccionarOperativoAlcoholemiaPorDefecto();
    if (!franjaSeleccionada) return null;
    return franjaSeleccionada.__inicioGuardadoPayload || await leerInicioDesdeSupabase(franjaSeleccionada) || cargarInicioGuardadoCoincidente() || cargarInicioLocal();
  }

  async function refrescarContextoInformeAlcoholemia() {
    return refrescarContextoInformeGenericoWsp({
      elemento: informeAlcoholemiaContexto,
      activo: esInformeAlcoholemiaActivo,
      seleccionarDefault: seleccionarOperativoAlcoholemiaPorDefecto,
      obtenerInicio: obtenerInicioParaInformeAlcoholemia,
    });
  }

  function setUIInformeAlcoholemiaActiva(activa) {
    if (activa) aplicarPantallaExclusivaWsp("ALCOHOLEMIA");
    if (bloqueInformeAlcoholemia) bloqueInformeAlcoholemia.classList.toggle("hidden", !activa);
    document.body.classList.toggle("modo-informe-alcoholemia", !!activa);
    setControlSuperiorVisible(false);
    setPersonalVisible(!activa);
    setMovilidadVisible(!activa);
    setElementosVisibles(!activa);
    setObservacionesVisible(!activa);
    if (divFinaliza) divFinaliza.classList.add("hidden");
    if (divDetalles) divDetalles.classList.add("hidden");
    if (divMismosElementos) divMismosElementos.classList.add("hidden");
    if (bloquePresenciaActiva) bloquePresenciaActiva.classList.add("hidden");
    if (activa) {
      const titulo = bloqueInformeAlcoholemia?.querySelector(".informe-alcohol-title");
      if (titulo) titulo.textContent = "INFORME - ALCOHOLEMIA";
      actualizarReglasInformeAlcoholemia();
      refrescarContextoInformeAlcoholemia();
    }
  }

  function codigosInformeAlcoholemia(codigoPrincipal) {
    const mod = moduloInformeAlcoholemiaWsp();
    if (mod && typeof mod.codigos === "function") {
      return mod.codigos(refsInformeAlcoholemiaWsp(), codigoPrincipal);
    }
    const codigos = [codigoPrincipal];
    parseCodigosInputInforme(infAlcoOtrosCodigos?.value || "")
      .forEach((codigo) => { if (!codigos.includes(codigo)) codigos.push(codigo); });
    const codigoLicencia = infoLicenciaInformeAlcoholemia().codigoSinLicencia;
    if (codigoLicencia && !codigos.includes(codigoLicencia)) codigos.push(codigoLicencia);
    return codigos;
  }

  function descripcionCodigoInforme(codigo) {
    return obtenerReferenciaNomenclador(codigo, "") || "INFRACCIÓN";
  }

  function detalleLineaInforme(codigo) {
    return reconstruirLineaDetalle(1, codigo, descripcionCodigoInforme(codigo)) || `(01) ${codigo}`;
  }

  function medidasSeleccionadasInformeAlcoholemia() {
    const mod = moduloInformeAlcoholemiaWsp();
    if (mod && typeof mod.medidas === "function") {
      return mod.medidas(refsInformeAlcoholemiaWsp());
    }
    const lic = infoLicenciaInformeAlcoholemia();
    return {
      prohibicion: !!infAlcoMedProhibicion?.checked,
      cesion: !!infAlcoMedCesion?.checked,
      remision: !!infAlcoMedRemision?.checked,
      retencion: !!infAlcoMedRetencion?.checked || lic.retencionAutomatica,
    };
  }

  function textoMedidasInforme(medidas) {
    const out = [];
    if (medidas.prohibicion) out.push("PROHIBICIÓN DE CIRCULAR");
    if (medidas.cesion) out.push("CESIÓN DE CONDUCCIÓN");
    if (medidas.remision) out.push("REMISIÓN");
    if (medidas.retencion) out.push("RETENCIÓN DE LICENCIA DE CONDUCIR");
    return out;
  }

  function fotosSeleccionadasInformeAlcoholemia() {
    const mod = moduloInformeAlcoholemiaWsp();
    if (mod && typeof mod.fotos === "function") {
      return mod.fotos(refsInformeAlcoholemiaWsp());
    }
    return infAlcoFotos.map((el) => el?.files?.[0] || null).filter(Boolean).slice(0, 4);
  }

  function validarInformeAlcoholemia() {
    const mod = moduloInformeAlcoholemiaWsp();
    if (mod && typeof mod.validar === "function") {
      return mod.validar(refsInformeAlcoholemiaWsp(), {
        franjaSeleccionada,
        selHorario,
        marcarErrorCampo,
        labelTipoVehiculoInforme,
        codigosInvalidosNomenclador,
      });
    }
    return false;
  }

  function construirPayloadInformeAlcoholemia({ inicio, textoFinal, calc, grad, tipoVehiculo, codigos, medidas, fecha, hora }) {
    const ordenes = normalizarArrayJsonWsp(franjaSeleccionada?.__ordenesOrigen || franjaSeleccionada?.__ordenNum || obtenerNumeroOrdenDeFranja(franjaSeleccionada) || "");
    // Los inventarios provenientes de informes no se imprimen como Detalle.
    // Se contabilizan para la observación automática del 460/22/remisión.
    const detalles = codigos.map(detalleLineaInforme);

    const esAlco460 = !!infAlco460?.checked;
    const actasInforme = (calc.sancionable || esAlco460) ? 1 : 0;
    const resultados = {
      "Vehículos Fiscalizados": 1,
      "Personas Identificadas": 1,
      "Test de Alcoholímetro": 1,
      "Actas Labradas": actasInforme,
      "Positiva Sancionable": calc.sancionable ? 1 : 0,
      "Positiva no Sancionable": calc.noSancionable ? 1 : 0,
    };
    if (esAlco460) resultados["Decreto 460/22"] = 1;

    const medidasPayload = {
      "Prohibición de Circulación": medidas.prohibicion ? 1 : 0,
      "Cesión de Conducción": medidas.cesion ? 1 : 0,
      "Remisión": medidas.remision ? 1 : 0,
      "Retención": medidas.retencion ? 1 : 0,
    };

    return {
      fuente: "WSP",
      operativo_key: limpiarTextoSimple(franjaSeleccionada?.__operativoKey || inicio?.operativo_key || construirOperativoKeyEstable(franjaSeleccionada)),
      operativo_publicado_id: franjaSeleccionada?.__operativoPublicadoId || null,
      guardia_fecha: getGuardiaFechaISO(),
      fecha_operativo: fechaFranjaHistorialWsp(franjaSeleccionada),
      fecha,
      horario: hora,
      hora_desde: hora,
      hora_hasta: hora,
      lugar: normalizarLugar(inicio?.lugar || franjaSeleccionada?.lugar || ""),
      lugar_normalizado: normalizarLugar(inicio?.lugar || franjaSeleccionada?.lugar || ""),
      tipo_operativo: obtenerTipoCortoFranja(franjaSeleccionada),
      titulo: "ALCOHOLEMIA POSITIVA",
      ordenes_origen: ordenes,
      personal: normalizarArrayTexto(inicio?.personal),
      moviles: normalizarArrayTexto(inicio?.moviles),
      motos: normalizarArrayTexto(inicio?.motos),
      elementos: normalizarPayloadElementos(inicio),
      resultados,
      medidas_cautelares: medidasPayload,
      detalles,
      observaciones: "",
      texto_generado: textoFinal,
      payload_completo: {
        tipo_evento: "ALCOHOLEMIA_POSITIVA",
        tipo_informe: infAlco460?.checked ? "ALCOHOLEMIA_460" : "ALCOHOLEMIA_POSITIVA",
        franja: franjaSeleccionada,
        datos_formulario: {
          tipo_vehiculo: tipoVehiculo,
          marca: normalizarMayusInforme(infAlcoMarca?.value),
          modelo: normalizarMayusInforme(infAlcoModelo?.value),
          dominio: normalizarDominioInforme(infAlcoDominio?.value),
          conductor: normalizarMayusInforme(infAlcoConductor?.value),
          graduacion: grad,
          nro_acta: normalizarNumeroActaInforme(infAlcoActa?.value),
          licencia_clase: normalizarLicenciaInforme(infAlcoLicenciaClase?.value),
          licencia_digital: infoLicenciaInformeAlcoholemia().digital,
          licencia_sin_poseer_dni: infoLicenciaInformeAlcoholemia().esDniSinLicencia,
          retencion_licencia_automatica: infoLicenciaInformeAlcoholemia().retencionAutomatica,
          alcoholemia_460: !!infAlco460?.checked,
          codigos,
          medidas,
          dependencia_remite: normalizarMayusInforme(infAlcoDependenciaRemite?.value),
          corralon: normalizarMayusInforme(infAlcoCorralon?.value),
          acta_inventario: !!infAlcoInventario?.checked,
        },
        graduaciones_sancionables: calc.sancionable ? [grad] : [],
        graduaciones_no_sancionables: calc.noSancionable ? [grad] : [],
        detalle_origen_visual: infAlco460?.checked ? "460/22" : "alcoholemia",
        detalles_readonly: detalles.map((texto) => ({ texto, origen: infAlco460?.checked ? "460/22" : "alcoholemia", readonly: true })),
        remisiones_460: infAlco460?.checked && medidas.remision ? 1 : 0,
        inventarios_460: infAlco460?.checked && infAlcoInventario?.checked ? 1 : 0,
        corralon_460: infAlco460?.checked ? normalizarClaveCorralonInforme(infAlcoCorralon?.value) : "",
        corralon_460_texto: infAlco460?.checked ? textoCorralonInforme(infAlcoCorralon?.value) : "",
      },
      metadata: {
        tipo_evento: "ALCOHOLEMIA_POSITIVA",
        generado_desde: "wsp.js",
        alimenta_finalizado: false,
      },
    };
  }

  function construirTextoInformeAlcoholemia({ inicio, calc, grad, tipoVehiculo, codigos, medidas, fecha, hora }) {
    const motivo = infAlco460?.checked
      ? (calc.sancionable
        ? "ALCOHOLEMIA POSITIVA SANCIONABLE CON REMISIÓN POR DECTO 460/22"
        : "REMISIÓN POR DECTO 460/22 Y ALCOHOLEMIA POSITIVA NO SANCIONABLE")
      : (calc.sancionable ? "ALCOHOLEMIA POSITIVA SANCIONABLE" : "ALCOHOLEMIA POSITIVA NO SANCIONABLE");

    const lugar = normalizarLugar(inicio?.lugar || franjaSeleccionada?.lugar || "");
    const moviles = [lineaDesdeArray(inicio?.moviles, "/"), lineaDesdeArray(inicio?.motos, "/")].filter((v) => v && v !== "/").join("/") || "/";
    const personal = normalizarArrayTexto(inicio?.personal).join("\n") || "/";
    const orden = normalizarMayusInforme(obtenerNumeroOrdenDeFranja(franjaSeleccionada) || inicio?.orden_num || "");
    const tipoOp = normalizarMayusInforme(inicio?.tipo_corto || obtenerTipoCortoFranja(franjaSeleccionada) || "OPERATIVO");
    const marca = normalizarMayusInforme(infAlcoMarca?.value);
    const modelo = normalizarMayusInforme(infAlcoModelo?.value);
    const dominio = normalizarDominioInforme(infAlcoDominio?.value);
    const conductor = normalizarMayusInforme(infAlcoConductor?.value);
    const nroActa = normalizarNumeroActaInforme(infAlcoActa?.value);
    const licenciaClase = normalizarMayusInforme(infAlcoLicenciaClase?.value);
    const licenciaTxt = licenciaClase ? ` LICENCIA CLASE ${licenciaClase}${infAlcoLicenciaDigital?.checked ? " DIGITAL" : ""}.` : "";
    const codigosTxt = codigos.join("/");
    const medidasTxt = textoMedidasInforme(medidas);
    const medidaFrase = medidasTxt.length ? ` Como medida cautelar se realiza ${medidasTxt.join(", ")}.` : "";
    const remisionFrase = (infAlco460?.checked || medidas.remision)
      ? ` Remitiendo el vehículo al destino/corralón ${normalizarMayusInforme(infAlcoCorralon?.value)}.`
      : "";
    const inventarioFrase = infAlcoInventario?.checked ? " Labrando acta de inventario." : "";
    const obs = [
      `En momentos que nos encontrábamos realizando ${tipoOp}${orden ? ` ${orden}` : ""} se detiene la marcha de un vehiculo tipo ${tipoVehiculo} marca ${marca}${modelo ? ` modelo ${modelo}` : ""}, dominio ${dominio}${conductor ? `, conducido por ${conductor}` : ""}, constatando que circula con alcoholemia positiva ${calc.sancionable ? "sancionable" : "no sancionable"} de ${grad} G/L. Se labra acta de infracción N° ${nroActa} por código/s ${codigosTxt}.${licenciaTxt}${medidaFrase}${remisionFrase}${inventarioFrase}`,
    ].filter(Boolean).join(" ");

    return compactarSaltos([
      bold("POLICÍA DE LA PROVINCIA DE SANTA FE - GUARDIA PROVINCIAL"),
      bold("BRIGADA MOTORIZADA ZONA CENTRO NORTE SANTA FE"),
      bold("TERCIO CHARLIE"),
      "",
      bold(`MOTIVO: ${motivo}`),
      "",
      `${bold("LUGAR:")} ${lugar}`,
      "",
      `${bold("HORA:")} ${hora}HS`,
      "",
      `${bold("FECHA:")} ${fecha}`,
      "",
      `${bold("MÓVIL:")} ${moviles}`,
      "",
      bold("PERSONAL"),
      personal,
      "",
      `${bold("OBSERVACIÓN:")} ${obs}`,
      fotosSeleccionadasInformeAlcoholemia().length ? bold("Se adjunta vista fotográfica") : "",
    ].filter((v) => v !== null && v !== undefined).join("\n"));
  }

  async function subirFotoInformeAlcoholemia(file, resultadoHistorial, numero) {
    const svc = fotosInformesRepoWsp();
    if (svc && typeof svc.subirFotoInformeWsp === "function") {
      try {
        return await svc.subirFotoInformeWsp(file, resultadoHistorial, numero, {
          tipoEvento: "ALCOHOLEMIA_POSITIVA",
          carpeta: "alcoholemia",
          franja: franjaSeleccionada,
          deps: depsFotosInformesWsp(),
        });
      } catch (e) {
        console.warn("[WSP] Fotos informes modular falló al subir foto de alcoholemia. Se usa fallback legacy.", e);
      }
    }

    if (!file || !resultadoHistorial?.evento?.id) return null;
    const archivo = await normalizarImagenControlMovil(file);
    const eventoId = String(resultadoHistorial.evento.id);
    const estadoId = String(resultadoHistorial.estado?.id || "");
    const informeKey = limpiarTextoSimple(resultadoHistorial.evento.informe_key || resultadoHistorial.informe_key || resultadoHistorial.evento?.payload_completo?.informe_key || "");
    const operativoKey = limpiarTextoSimple(resultadoHistorial.evento.operativo_key || resultadoHistorial.estado?.operativo_key || construirOperativoKeyEstable(franjaSeleccionada));
    const safeKey = operativoKey.toLowerCase().replace(/[^a-z0-9_-]+/g, "_").slice(0, 90) || "operativo";
    const safeInforme = normalizarComponenteInformeKeyWsp(informeKey || eventoId) || eventoId;
    const path = `informes/alcoholemia/${getGuardiaFechaISO()}/${safeKey}/${safeInforme}/${Date.now()}_${numero}.jpg`;
    const url = `${SUPABASE_URL}/storage/v1/object/${HISTORIAL_FOTOS_BUCKET}/${path}`;
    const r = await fetch(url, {
      method: "POST",
      headers: headersSupabase({
        "Content-Type": archivo.type || "image/jpeg",
        "x-upsert": "false",
      }),
      body: archivo,
    });
    if (!r.ok) throw new Error(`No se pudo subir foto ${numero}: ${r.status} ${await r.text().catch(() => "")}`);
    const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${HISTORIAL_FOTOS_BUCKET}/${path}`;
    const row = {
      evento_id: eventoId,
      operativo_estado_id: estadoId || null,
      operativo_key: operativoKey,
      guardia_fecha: getGuardiaFechaISO(),
      informe_key: informeKey || null,
      tipo_evento: "ALCOHOLEMIA_POSITIVA",
      foto_numero: numero,
      storage_bucket: HISTORIAL_FOTOS_BUCKET,
      storage_path: path,
      public_url: publicUrl,
    };
    const ins = await fetch(`${SUPABASE_URL}/rest/v1/${HISTORIAL_FOTOS_TABLE}`, {
      method: "POST",
      headers: headersSupabase({ "Content-Type": "application/json", Prefer: "return=minimal" }),
      body: JSON.stringify(row),
    });
    if (!ins.ok) throw new Error(`No se pudo registrar foto ${numero}: ${ins.status} ${await ins.text().catch(() => "")}`);
    return row;
  }

  async function subirFotosInformeAlcoholemia(resultadoHistorial, files) {
    const svc = fotosInformesRepoWsp();
    if (svc && typeof svc.subirFotosInformeWsp === "function") {
      try {
        return await svc.subirFotosInformeWsp(resultadoHistorial, files, {
          tipoEvento: "ALCOHOLEMIA_POSITIVA",
          carpeta: "alcoholemia",
          franja: franjaSeleccionada,
          deps: depsFotosInformesWsp(),
        });
      } catch (e) {
        console.warn("[WSP] Fotos informes modular falló al subir fotos de alcoholemia. Se usa fallback legacy.", e);
      }
    }

    const fotos = (Array.isArray(files) ? files : []).slice(0, 4);
    for (let i = 0; i < fotos.length; i += 1) {
      await subirFotoInformeAlcoholemia(fotos[i], resultadoHistorial, i + 1);
    }
  }

  async function enviarInformeAlcoholemia() {
    aplicarMayusculasInputsInformeAlcoholemia();
    if (!franjaSeleccionada) await seleccionarOperativoAlcoholemiaPorDefecto();
    actualizarReglasInformeAlcoholemia();
    if (!validarInformeAlcoholemia()) return;

    const inicio = await resolverInicioParaEnvioInformeWsp({
      seleccionarDefault: seleccionarOperativoAlcoholemiaPorDefecto,
      refrescarContexto: refrescarContextoInformeAlcoholemia,
      obtenerInicio: obtenerInicioParaInformeAlcoholemia,
      mensaje: "No hay INICIO guardado para este operativo. Envíe primero el INICIA para autocompletar lugar, móviles y personal.",
    });
    if (!inicio) return;

    const now = new Date();
    const fecha = fmtFechaInforme(now);
    const hora = fmtHoraInforme(now);
    const tipoVehiculo = labelTipoVehiculoInforme();
    const grad = normalizarGraduacionInforme(infAlcoGraduacion?.value);
    const calc = calcularAlcoholemiaInforme(tipoVehiculo, grad);
    const codigos = codigosInformeAlcoholemia(calc.codigo);
    const medidas = medidasSeleccionadasInformeAlcoholemia();
    const textoFinal = construirTextoInformeAlcoholemia({ inicio, calc, grad, tipoVehiculo, codigos, medidas, fecha, hora });
    const payload = construirPayloadInformeAlcoholemia({ inicio, textoFinal, calc, grad, tipoVehiculo, codigos, medidas, fecha, hora });
    const fotos = fotosSeleccionadasInformeAlcoholemia();

    const resultadoHistorial = await guardarInformeEventoWsp("ALCOHOLEMIA_POSITIVA", payload, normalizarNumeroActaInforme(infAlcoActa?.value));
    if (fotos.length && resultadoHistorial?.supabase_ok && resultadoHistorial?.evento?.id) {
      try {
        await eliminarFotosPreviasInformeWsp(resultadoHistorial);
        await subirFotosInformeAlcoholemia(resultadoHistorial, fotos);
      } catch (e) {
        console.warn("[WSP] No se pudieron cargar todas las fotos del informe.", e);
        alert("El informe se enviará por WhatsApp, pero alguna foto no pudo archivarse en Supabase.");
      }
    } else if (fotos.length && !resultadoHistorial?.supabase_ok) {
      console.warn("[WSP] Se omite archivo de fotos en Supabase porque el informe no quedó guardado con ID. WhatsApp continúa igual.", resultadoHistorial?.motivo_error || "");
    }

    resetUI();
    abrirWhatsappYCerrarWspLuego(textoFinal, fotos);
  }


  // ===== INFORME INTERMEDIO: DECTO 460/22 =====

  function refsInformeDecto460Wsp() {
    return {
      bloqueInformeDecto460,
      informeDecto460Contexto,
      inf460Marca,
      inf460Modelo,
      inf460Dominio,
      inf460Acta,
      inf460OtrosCodigos,
      inf460Corralon,
      inf460Inventario,
      inf460ResultadoAuto,
      inf460Fotos,
    };
  }

  function moduloInformeDecto460Wsp() {
    return window.WSP?.modules?.decto460 || null;
  }

    function normalizarClaveCorralonInforme(value) {
    const mod = moduloInformeDecto460Wsp();
    if (mod && typeof mod.normalizarClaveCorralonInforme === "function") return mod.normalizarClaveCorralonInforme(value);
    return normalizarMayusInforme(value || "");
  }

    function textoCorralonInforme(value) {
    const mod = moduloInformeDecto460Wsp();
    if (mod && typeof mod.textoCorralonInforme === "function") return mod.textoCorralonInforme(value);
    return normalizarMayusInforme(value || "");
  }

    function esFranjaPatrullajeInformeDecto460(franja) {
    const mod = moduloInformeDecto460Wsp();
    if (mod && typeof mod.esFranjaPatrullajeInformeDecto460 === "function") {
      return mod.esFranjaPatrullajeInformeDecto460(franja, { normalizarBasicoSinAcentos, obtenerTipoCortoFranja });
    }
    const t = normalizarBasicoSinAcentos([
      franja?.titulo,
      franja?.__tipoPublicado,
      obtenerTipoCortoFranja(franja),
    ].filter(Boolean).join(" "));
    return /\bpatrullaje\b|\bpatrullajes\b|\bpatrulla\b/.test(t);
  }

    function ordenarCandidatosInformeDecto460(candidatos = []) {
    const mod = moduloInformeDecto460Wsp();
    if (mod && typeof mod.ordenarCandidatosInformeDecto460 === "function") {
      return mod.ordenarCandidatosInformeDecto460(candidatos, { normalizarBasicoSinAcentos, obtenerTipoCortoFranja });
    }
    return (Array.isArray(candidatos) ? candidatos : []).slice().sort((a, b) => {
      const ap = esFranjaPatrullajeInformeDecto460(a) ? 0 : 1;
      const bp = esFranjaPatrullajeInformeDecto460(b) ? 0 : 1;
      if (ap !== bp) return ap - bp;
      const at = Number.isFinite(a?.__inicioTs) ? a.__inicioTs : Number.MAX_SAFE_INTEGER;
      const bt = Number.isFinite(b?.__inicioTs) ? b.__inicioTs : Number.MAX_SAFE_INTEGER;
      return at - bt;
    });
  }

  async function seleccionarOperativoDecto460PorDefecto() {
    const seleccionModular = await seleccionarOperativoInformePorDefectoModularWsp({
      ordenarCandidatos: ordenarCandidatosInformeDecto460,
      fallbackUnico: true,
      fallbackPrimero: true,
      afterSelect: completarDestinoDecto460SiVacio,
    });
    if (seleccionModular !== null) return seleccionModular;

    if (!selHorario) return false;
    if (!Array.isArray(operativosCache) || !operativosCache.length || !operativosCache.some((op) => op?.__desdeInicioGuardado)) {
      await cargarOperativosIniciadosParaInformes(selHorario.value || "");
    }
    if (!Array.isArray(operativosCache) || !operativosCache.length) return false;

    if (franjaSeleccionada) {
      try {
        const inicioActual = await leerInicioDesdeSupabase(franjaSeleccionada);
        if (inicioActual) return true;
      } catch {}
    }

    const candidatos = ordenarCandidatosInformeDecto460(operativosCache);
    for (const candidato of candidatos) {
      try {
        const inicio = await leerInicioDesdeSupabase(candidato);
        if (!inicio) continue;
        selHorario.value = candidato.__key || "";
        franjaSeleccionada = candidato;
        ordenSeleccionada = null;
        completarDestinoDecto460SiVacio();
        return true;
      } catch {}
    }

    // Respaldo visual: si no pudo confirmar INICIO desde Supabase todavía,
    // deja preseleccionado el primer operativo priorizando PATRULLAJE para que el usuario pueda cambiarlo.
    if (!franjaSeleccionada && candidatos.length) {
      const candidato = candidatos[0];
      selHorario.value = candidato.__key || "";
      franjaSeleccionada = candidato;
      ordenSeleccionada = null;
      completarDestinoDecto460SiVacio();
      return true;
    }

    return false;
  }

  async function obtenerInicioParaInformeDecto460() {
    const inicioModular = await obtenerInicioSeleccionadoInformeModularWsp({
      seleccionarDefault: seleccionarOperativoDecto460PorDefecto,
    });
    if (inicioModular !== null) return inicioModular;

    if (!franjaSeleccionada) await seleccionarOperativoDecto460PorDefecto();
    if (!franjaSeleccionada) return null;
    return franjaSeleccionada.__inicioGuardadoPayload || await leerInicioDesdeSupabase(franjaSeleccionada) || cargarInicioGuardadoCoincidente() || cargarInicioLocal();
  }

  async function refrescarContextoInformeDecto460() {
    return refrescarContextoInformeGenericoWsp({
      elemento: informeDecto460Contexto,
      activo: esInformeDecto460Activo,
      seleccionarDefault: seleccionarOperativoDecto460PorDefecto,
      obtenerInicio: obtenerInicioParaInformeDecto460,
    });
  }

  function setUIInformeDecto460Activa(activa) {
    if (activa) aplicarPantallaExclusivaWsp("DECTO460");
    if (bloqueInformeDecto460) bloqueInformeDecto460.classList.toggle("hidden", !activa);
    document.body.classList.toggle("modo-informe-decto460", !!activa);
    setControlSuperiorVisible(false);
    setPersonalVisible(!activa);
    setMovilidadVisible(!activa);
    setElementosVisibles(!activa);
    setObservacionesVisible(!activa);
    if (divFinaliza) divFinaliza.classList.add("hidden");
    if (divDetalles) divDetalles.classList.add("hidden");
    if (divMismosElementos) divMismosElementos.classList.add("hidden");
    if (bloquePresenciaActiva) bloquePresenciaActiva.classList.add("hidden");
    if (activa) {
      if (inf460ResultadoAuto) {
        inf460ResultadoAuto.textContent = "El informe queda guardado como evento. No carga numerales automáticamente en el FINALIZADO.";
      }
      completarDestinoDecto460SiVacio();
      refrescarContextoInformeDecto460();
    }
  }

    function completarDestinoDecto460SiVacio() {
    const mod = moduloInformeDecto460Wsp();
    if (mod && typeof mod.completarDestinoDecto460SiVacio === "function") {
      return mod.completarDestinoDecto460SiVacio(refsInformeDecto460Wsp(), {
        inferirDestinoRemisionAlcoholemia,
        normalizarMayusInforme,
      });
    }
    if (!inf460Corralon) return;
    if (normalizarMayusInforme(inf460Corralon.value)) return;
    const destino = inferirDestinoRemisionAlcoholemia();
    if (destino) inf460Corralon.value = destino;
  }

    function aplicarMayusculasInputsDecto460() {
    const mod = moduloInformeDecto460Wsp();
    if (mod && typeof mod.aplicarMayusculasInputsDecto460 === "function") {
      return mod.aplicarMayusculasInputsDecto460(refsInformeDecto460Wsp(), {
        normalizarMayusInforme,
        normalizarNumeroActaInforme,
        normalizarDominioInforme,
      });
    }
  }

    function codigosInformeDecto460() {
    const mod = moduloInformeDecto460Wsp();
    if (mod && typeof mod.codigosInformeDecto460 === "function") return mod.codigosInformeDecto460(refsInformeDecto460Wsp());
    return String(inf460OtrosCodigos?.value || "")
      .split(/[\s,;/]+/)
      .map((v) => v.replace(/\D+/g, ""))
      .filter(Boolean)
      .filter((codigo, idx, arr) => arr.indexOf(codigo) === idx);
  }

    function fotosSeleccionadasInformeDecto460() {
    const mod = moduloInformeDecto460Wsp();
    if (mod && typeof mod.fotosSeleccionadasInformeDecto460 === "function") return mod.fotosSeleccionadasInformeDecto460(refsInformeDecto460Wsp());
    return inf460Fotos.map((el) => el?.files?.[0] || null).filter(Boolean).slice(0, 4);
  }

    function limpiarInformeDecto460() {
    const mod = moduloInformeDecto460Wsp();
    if (mod && typeof mod.limpiarInformeDecto460 === "function") {
      return mod.limpiarInformeDecto460(refsInformeDecto460Wsp(), {
        limpiarErrorCampo,
        inferirDestinoRemisionAlcoholemia,
        normalizarMayusInforme,
      });
    }
  }

    function validarInformeDecto460() {
    const mod = moduloInformeDecto460Wsp();
    if (mod && typeof mod.validarInformeDecto460 === "function") {
      return mod.validarInformeDecto460(refsInformeDecto460Wsp(), {
        normalizarMayusInforme,
        normalizarDominioInforme,
        normalizarNumeroActaInforme,
        marcarErrorCampo,
        codigosInvalidosNomenclador,
      });
    }
    return true;
  }

    function construirTextoInformeDecto460({ inicio, fecha, hora, codigos }) {
    const mod = moduloInformeDecto460Wsp();
    if (mod && typeof mod.construirTextoInformeDecto460 === "function") {
      return mod.construirTextoInformeDecto460({
        refs: refsInformeDecto460Wsp(),
        inicio,
        franjaSeleccionada,
        fecha,
        hora,
        codigos,
        deps: {
          normalizarLugar,
          lineaDesdeArray,
          normalizarArrayTexto,
          normalizarMayusInforme,
          normalizarDominioInforme,
          normalizarNumeroActaInforme,
          obtenerNumeroOrdenDeFranja,
          obtenerTipoCortoFranja,
          compactarSaltos,
          bold,
        },
      });
    }
    return "";
  }

    function construirPayloadInformeDecto460({ inicio, textoFinal, codigos, fecha, hora }) {
    const mod = moduloInformeDecto460Wsp();
    if (mod && typeof mod.construirPayloadInformeDecto460 === "function") {
      return mod.construirPayloadInformeDecto460({
        refs: refsInformeDecto460Wsp(),
        inicio,
        franjaSeleccionada,
        textoFinal,
        codigos,
        fecha,
        hora,
        deps: {
          normalizarArrayJsonWsp,
          obtenerNumeroOrdenDeFranja,
          detalleLineaInforme,
          normalizarMayusInforme,
          normalizarDominioInforme,
          normalizarNumeroActaInforme,
          limpiarTextoSimple,
          construirOperativoKeyEstable,
          getGuardiaFechaISO,
          fechaFranjaHistorialWsp,
          normalizarLugar,
          obtenerTipoCortoFranja,
          normalizarArrayTexto,
          normalizarPayloadElementos,
        },
      });
    }
    return {};
  }

  async function subirFotoInformeDecto460(file, resultadoHistorial, numero) {
    const svc = fotosInformesRepoWsp();
    if (svc && typeof svc.subirFotoInformeWsp === "function") {
      try {
        return await svc.subirFotoInformeWsp(file, resultadoHistorial, numero, {
          tipoEvento: "DECTO_460_22",
          carpeta: "460",
          franja: franjaSeleccionada,
          deps: depsFotosInformesWsp(),
        });
      } catch (e) {
        console.warn("[WSP] Fotos informes modular falló al subir foto de Decto 460/22. Se usa fallback legacy.", e);
      }
    }

    if (!file || !resultadoHistorial?.evento?.id) return null;
    const archivo = await normalizarImagenControlMovil(file);
    const eventoId = String(resultadoHistorial.evento.id);
    const estadoId = String(resultadoHistorial.estado?.id || "");
    const informeKey = limpiarTextoSimple(resultadoHistorial.evento.informe_key || resultadoHistorial.informe_key || resultadoHistorial.evento?.payload_completo?.informe_key || "");
    const operativoKey = limpiarTextoSimple(resultadoHistorial.evento.operativo_key || resultadoHistorial.estado?.operativo_key || construirOperativoKeyEstable(franjaSeleccionada));
    const safeKey = operativoKey.toLowerCase().replace(/[^a-z0-9_-]+/g, "_").slice(0, 90) || "operativo";
    const safeInforme = normalizarComponenteInformeKeyWsp(informeKey || eventoId) || eventoId;
    const path = `informes/460/${getGuardiaFechaISO()}/${safeKey}/${safeInforme}/${Date.now()}_${numero}.jpg`;
    const url = `${SUPABASE_URL}/storage/v1/object/${HISTORIAL_FOTOS_BUCKET}/${path}`;
    const r = await fetch(url, {
      method: "POST",
      headers: headersSupabase({
        "Content-Type": archivo.type || "image/jpeg",
        "x-upsert": "false",
      }),
      body: archivo,
    });
    if (!r.ok) throw new Error(`No se pudo subir foto ${numero}: ${r.status} ${await r.text().catch(() => "")}`);
    const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${HISTORIAL_FOTOS_BUCKET}/${path}`;
    const row = {
      evento_id: eventoId,
      operativo_estado_id: estadoId || null,
      operativo_key: operativoKey,
      guardia_fecha: getGuardiaFechaISO(),
      informe_key: informeKey || null,
      tipo_evento: "DECTO_460_22",
      foto_numero: numero,
      storage_bucket: HISTORIAL_FOTOS_BUCKET,
      storage_path: path,
      public_url: publicUrl,
    };
    const ins = await fetch(`${SUPABASE_URL}/rest/v1/${HISTORIAL_FOTOS_TABLE}`, {
      method: "POST",
      headers: headersSupabase({ "Content-Type": "application/json", Prefer: "return=minimal" }),
      body: JSON.stringify(row),
    });
    if (!ins.ok) throw new Error(`No se pudo registrar foto ${numero}: ${ins.status} ${await ins.text().catch(() => "")}`);
    return row;
  }

  async function subirFotosInformeDecto460(resultadoHistorial, files) {
    const svc = fotosInformesRepoWsp();
    if (svc && typeof svc.subirFotosInformeWsp === "function") {
      try {
        return await svc.subirFotosInformeWsp(resultadoHistorial, files, {
          tipoEvento: "DECTO_460_22",
          carpeta: "460",
          franja: franjaSeleccionada,
          deps: depsFotosInformesWsp(),
        });
      } catch (e) {
        console.warn("[WSP] Fotos informes modular falló al subir fotos de Decto 460/22. Se usa fallback legacy.", e);
      }
    }

    const fotos = (Array.isArray(files) ? files : []).slice(0, 4);
    for (let i = 0; i < fotos.length; i += 1) {
      await subirFotoInformeDecto460(fotos[i], resultadoHistorial, i + 1);
    }
  }

  async function enviarInformeDecto460() {
    aplicarMayusculasInputsDecto460();
    if (!validarInformeDecto460()) return;
    const inicio = await resolverInicioParaEnvioInformeWsp({
      seleccionarDefault: seleccionarOperativoDecto460PorDefecto,
      refrescarContexto: refrescarContextoInformeDecto460,
      obtenerInicio: obtenerInicioParaInformeDecto460,
      mensaje: "No hay INICIO guardado para este operativo. Envíe primero el INICIA para autocompletar lugar, móviles y personal.",
    });
    if (!inicio) return;
    const now = new Date();
    const fecha = fmtFechaInforme(now);
    const hora = fmtHoraInforme(now);
    const codigos = codigosInformeDecto460();
    const textoFinal = construirTextoInformeDecto460({ inicio, fecha, hora, codigos });
    const payload = construirPayloadInformeDecto460({ inicio, textoFinal, codigos, fecha, hora });
    const fotos = fotosSeleccionadasInformeDecto460();
    const resultadoHistorial = await guardarInformeEventoWsp("DECTO_460_22", payload, normalizarNumeroActaInforme(inf460Acta?.value));
    if (fotos.length && resultadoHistorial?.supabase_ok && resultadoHistorial?.evento?.id) {
      try {
        await eliminarFotosPreviasInformeWsp(resultadoHistorial);
        await subirFotosInformeDecto460(resultadoHistorial, fotos);
      } catch (e) {
        console.warn("[WSP] No se pudieron cargar todas las fotos del informe Decto 460/22.", e);
        alert("El informe se enviará por WhatsApp, pero alguna foto no pudo archivarse en Supabase.");
      }
    } else if (fotos.length && !resultadoHistorial?.supabase_ok) {
      console.warn("[WSP] Se omite archivo de fotos en Supabase porque el informe no quedó guardado con ID. WhatsApp continúa igual.", resultadoHistorial?.motivo_error || "");
    }
    resetUI();
    abrirWhatsappYCerrarWspLuego(textoFinal, fotos);
  }

  function valorAgregadoResultado(agregado, keys) {
    const resultados = agregado?.resultados || {};
    const lista = Array.isArray(keys) ? keys : [keys];
    for (const key of lista) {
      const n = Number(resultados[key] || 0);
      if (Number.isFinite(n) && n > 0) return n;
    }
    return 0;
  }

  function valorAgregadoMedida(agregado, keys) {
    const medidas = agregado?.medidas || {};
    const lista = Array.isArray(keys) ? keys : [keys];
    for (const key of lista) {
      const n = Number(medidas[key] || 0);
      if (Number.isFinite(n) && n > 0) return n;
    }
    return 0;
  }

  function agregadoInformesTieneDatos(agregado) {
    return !!(agregado && (Object.values(agregado.resultados || {}).some((n) => Number(n) > 0) || Object.values(agregado.medidas || {}).some((n) => Number(n) > 0) || (agregado.detalles || []).length));
  }

  function obtenerKeysInformesIntermediosFranja(franja) {
    const keys = [];
    const add = (value) => {
      const key = limpiarTextoSimple(value || "");
      if (key && !keys.includes(key)) keys.push(key);
    };
    const lista = [franja];
    if (Array.isArray(franja?.__franjasOrigenTemporal)) lista.push(...franja.__franjasOrigenTemporal);
    lista.filter(Boolean).forEach((item) => {
      add(item.__operativoKey);
      add(construirOperativoKeyEstable(item));
    });
    return keys;
  }

  function agregarKeyUnicaInformes(keys, value) {
    const key = limpiarTextoSimple(value || "");
    if (key && !keys.includes(key)) keys.push(key);
  }

  function informeIntermedioCoincideConFranja(row, franja, keys = []) {
    if (!row || !franja) return false;
    const rowKey = limpiarTextoSimple(row.operativo_key || "");
    if (rowKey && keys.includes(rowKey)) return true;

    const pc = row?.payload_completo && typeof row.payload_completo === "object" ? row.payload_completo : {};
    const fr = pc?.franja && typeof pc.franja === "object" ? pc.franja : {};

    let puntos = 0;
    if (valoresComparablesCoinciden(fr.horario || row.horario, franja.horario || "")) puntos += 45;
    if (valoresComparablesCoinciden(fr.lugar || row.lugar, franja.lugar || "")) puntos += 35;
    if (valoresComparablesCoinciden(obtenerTipoCortoFranja(fr) || row.tipo_operativo, obtenerTipoCortoFranja(franja) || "")) puntos += 15;
    if (valoresComparablesCoinciden(obtenerNumeroOrdenDeFranja(fr), obtenerNumeroOrdenDeFranja(franja))) puntos += 10;
    if (valoresComparablesCoinciden(obtenerTextoRefOrdenDeFranja(fr), obtenerTextoRefOrdenDeFranja(franja))) puntos += 5;

    return puntos >= 70;
  }

  function fingerprintInformeIntermedioWsp(row) {
    const pc = row?.payload_completo && typeof row.payload_completo === "object" ? row.payload_completo : {};
    const datos = pc.datos_formulario && typeof pc.datos_formulario === "object" ? pc.datos_formulario : {};
    const tipo = String(row?.tipo_evento || pc.tipo_evento || pc.tipo_informe || "").toUpperCase();
    const acta = normalizarNumeroActaInforme(datos.nro_acta || datos.acta || "");
    const dominio = normalizarDominioInforme(datos.dominio || "");
    const codigos = Array.isArray(datos.codigos) ? datos.codigos.join("/") : String(datos.codigos || "");
    if (acta) return `${tipo}|ACTA:${acta}`;
    if (dominio || codigos) return `${tipo}|DOM:${dominio}|COD:${codigos}`;
    return `ID:${row?.id || ""}`;
  }

  function filtrarDuplicadosInformesIntermedios(rows) {
    const map = new Map();
    (Array.isArray(rows) ? rows : []).forEach((row) => {
      const fp = fingerprintInformeIntermedioWsp(row);
      if (!fp || fp === "ID:") return;
      const prev = map.get(fp);
      // Si el mismo informe fue enviado más de una vez en pruebas, se conserva el último.
      if (!prev || String(row?.created_at || "") > String(prev?.created_at || "")) map.set(fp, row);
    });
    const used = new Set(Array.from(map.values()).map((row) => String(row?.id || "")));
    const out = Array.from(map.values());
    (Array.isArray(rows) ? rows : []).forEach((row) => {
      const id = String(row?.id || "");
      const fp = fingerprintInformeIntermedioWsp(row);
      if ((fp && fp !== "ID:") || (id && used.has(id))) return;
      out.push(row);
      if (id) used.add(id);
    });
    return out.sort((a, b) => String(a?.created_at || "").localeCompare(String(b?.created_at || "")));
  }

  function parseDetalleParaAgruparOrigen(texto) {
    const limpio = limpiarMarcaOrigenVisualDetalle(texto);
    const item = normalizarLineaDetalle(limpio);
    if (!item || item.tipo !== "detalle") return null;
    const codigo = String(item.codigo || "").replace(/\D+/g, "");
    if (!codigo || !codigoExisteEnNomenclador(codigo)) return null;
    const cantidad = Math.max(1, leerEnteroNoNegativo(item.cantidad || 1));
    const descripcion = obtenerReferenciaNomenclador(codigo, "") || limpiarDescripcionDetalle(item.descripcion || "") || descripcionCodigoInforme(codigo);
    if (!descripcion) return null;
    return { codigo, cantidad, descripcion };
  }

  function esDetalleInventarioTexto(texto) {
    const t = normalizarBasicoSinAcentos(texto || "");
    return /actas?\s+de\s+inventari|inventari/.test(t);
  }

  function agregarDetalleReadonlyAgrupado(agregado, texto, origen) {
    if (!texto || esDetalleInventarioTexto(texto)) return;
    const parsed = parseDetalleParaAgruparOrigen(texto);
    if (!parsed) return;
    const org = String(origen || "informe").trim();
    const key = `${parsed.codigo}|${org}`;
    if (!agregado.detallesMap) agregado.detallesMap = new Map();
    if (!agregado.detallesMap.has(key)) {
      agregado.detallesMap.set(key, { ...parsed, origen: org, cantidad: 0 });
    }
    const item = agregado.detallesMap.get(key);
    item.cantidad += parsed.cantidad;
    if (!item.descripcion && parsed.descripcion) item.descripcion = parsed.descripcion;
  }

  function finalizarDetallesReadonlyAgrupados(agregado) {
    const items = Array.from(agregado?.detallesMap?.values?.() || []);
    agregado.detallesReadonly = items.map((item) => {
      const descripcion = obtenerReferenciaNomenclador(item.codigo, item.descripcion) || item.descripcion || "INFRACCIÓN";
      const texto = reconstruirLineaDetalle(item.cantidad, item.codigo, descripcion) || `(${formatearCantidad(item.cantidad)}) ${item.codigo} ${descripcion}`;
      return { texto, origen: item.origen, readonly: true };
    });
    agregado.detalles = agregado.detallesReadonly.map((item) => {
      const origen = String(item.origen || "informe").trim();
      const origenVisual = /460\/22/i.test(origen) ? "del 460/22" : origen;
      return `${item.texto} > ${origenVisual}`;
    });
  }

  function construirObservacionDecto460Extendida(agregado) {
    const proc = Math.max(0, Number(agregado?.procedimientos460 || valorAgregadoResultado(agregado, ["Decreto 460/22", "Dto. 460/22"]) || 0));
    if (proc <= 0) return "";
    const rem = Math.max(0, Number(agregado?.remisiones460 || valorAgregadoMedida(agregado, ["Remisión", "Vehículos remitidos"]) || 0));
    const inv = Math.max(0, Number(agregado?.inventarios460 || 0));
    const destinos = Array.from(new Set(Array.from(agregado?.destinos460 || []).map(textoCorralonInforme).filter(Boolean)));
    const destinoTxt = destinos.length === 1 ? ` al corralon de ${destinos[0]}` : (destinos.length > 1 ? ` a los corralones de ${destinos.join(" / ")}` : "");
    const partes = [`Se Realizaron (${formatearCantidad(proc)}) Proc. Policiales por 460/22`];
    if (rem > 0) partes.push(`con (${formatearCantidad(rem)}) Remisiones${destinoTxt}`);
    if (inv > 0) partes.push(`${rem > 0 ? "y" : "con"} (${formatearCantidad(inv)}) inventarios`);
    return `${partes.join(" ")}.`;
  }

  async function cargarAgregadoInformesIntermediosWsp() {
    if (!franjaSeleccionada) return null;
    const keys = obtenerKeysInformesIntermediosFranja(franjaSeleccionada);

    // Clave crítica: el informe intermedio suele guardarse con la key real del INICIO.
    // El FINALIZADO a veces trae una franja reconstruida/publicada con otra key.
    // Por eso se agregan también las keys del INICIO local/remoto y luego hay fallback por franja.
    const inicioRemoto = await leerInicioDesdeSupabase(franjaSeleccionada);
    agregarKeyUnicaInformes(keys, inicioRemoto?.operativo_key);

    try {
      const rows = [];
      const seen = new Set();
      const addRow = (row) => {
        const id = String(row?.id || "");
        if (id && seen.has(id)) return;
        if (id) seen.add(id);
        rows.push(row);
      };

      for (const key of keys) {
        const params = new URLSearchParams({
          select: "id,operativo_estado_id,operativo_key,tipo_evento,resultados,medidas_cautelares,detalles,payload_completo,observaciones,created_at,horario,lugar,tipo_operativo,alimenta_finalizado",
          operativo_key: `eq.${key}`,
          tipo_evento: "in.(ALCOHOLEMIA_POSITIVA,DECTO_460_22)",
          alimenta_finalizado: "eq.true",
          order: "created_at.asc",
        });
        const r = await fetch(`${SUPABASE_URL}/rest/v1/operativos_eventos?${params.toString()}`, {
          headers: headersSupabase({ Accept: "application/json" }),
        });
        if (!r.ok) throw new Error(`${r.status} ${await r.text().catch(() => "")}`);
        const data = await r.json();
        (Array.isArray(data) ? data : []).forEach(addRow);
      }

      // Respaldo: si no coincidió la key, se buscan los informes de la guardia
      // y se filtran por lugar/horario/tipo/orden guardados en payload_completo.franja.
      const paramsFallback = new URLSearchParams({
        select: "id,operativo_estado_id,operativo_key,tipo_evento,resultados,medidas_cautelares,detalles,payload_completo,observaciones,created_at,horario,lugar,tipo_operativo,alimenta_finalizado",
        guardia_fecha: `eq.${getGuardiaFechaISO()}`,
        tipo_evento: "in.(ALCOHOLEMIA_POSITIVA,DECTO_460_22)",
        alimenta_finalizado: "eq.true",
        order: "created_at.asc",
        limit: "200",
      });
      const rf = await fetch(`${SUPABASE_URL}/rest/v1/operativos_eventos?${paramsFallback.toString()}`, {
        headers: headersSupabase({ Accept: "application/json" }),
      });
      if (rf.ok) {
        const dataFallback = await rf.json();
        (Array.isArray(dataFallback) ? dataFallback : [])
          .filter((row) => informeIntermedioCoincideConFranja(row, franjaSeleccionada, keys))
          .forEach(addRow);
      } else {
        console.warn("[WSP] No se pudo leer fallback de informes intermedios:", rf.status, await rf.text().catch(() => ""));
      }

      const agregado = { resultados: {}, medidas: {}, detalles: [], observaciones: [], graduacionesSancionables: [], graduacionesNoSancionables: [], detallesReadonly: [], detallesMap: new Map(), procedimientos460: 0, remisiones460: 0, inventarios460: 0, destinos460: new Set() };
      filtrarDuplicadosInformesIntermedios(rows).forEach((row) => {
        const resultados = row?.resultados && typeof row.resultados === "object" ? row.resultados : {};
        Object.entries(resultados).forEach(([k,v]) => { agregado.resultados[k] = Number(agregado.resultados[k] || 0) + Number(v || 0); });
        const medidas = row?.medidas_cautelares && typeof row.medidas_cautelares === "object" ? row.medidas_cautelares : {};
        Object.entries(medidas).forEach(([k,v]) => { agregado.medidas[k] = Number(agregado.medidas[k] || 0) + Number(v || 0); });
        const pc = row?.payload_completo && typeof row.payload_completo === "object" ? row.payload_completo : {};
        const origen = pc.detalle_origen_visual || (row.tipo_evento === "DECTO_460_22" ? "460/22" : "alcoholemia");

        if (row.tipo_evento === "DECTO_460_22") {
          const proc = Number(resultados["Decreto 460/22"] || resultados["Dto. 460/22"] || 1);
          const rem = Number(medidas["Remisión"] || medidas["Vehículos remitidos"] || 1);
          const datos = pc.datos_formulario && typeof pc.datos_formulario === "object" ? pc.datos_formulario : {};
          const inv = Number(pc.inventarios_460 || datos.inventarios_460 || (datos.acta_inventario ? 1 : 0) || 0);
          agregado.procedimientos460 += Number.isFinite(proc) && proc > 0 ? proc : 1;
          agregado.remisiones460 += Number.isFinite(rem) && rem > 0 ? rem : 1;
          agregado.inventarios460 += Number.isFinite(inv) && inv > 0 ? inv : 0;
          const destino = pc.corralon_460 || pc.corralon_460_texto || datos.corralon || datos.corralon_texto || "";
          if (destino) agregado.destinos460.add(destino);
        }

        if (Array.isArray(pc.detalles_readonly) && pc.detalles_readonly.length) {
          pc.detalles_readonly.forEach((d) => agregarDetalleReadonlyAgrupado(agregado, String(d?.texto || ""), d?.origen || origen));
        } else if (Array.isArray(row?.detalles)) {
          row.detalles.forEach((d) => agregarDetalleReadonlyAgrupado(agregado, String(d || ""), origen));
        }
        if (Array.isArray(pc.graduaciones_sancionables)) agregado.graduacionesSancionables.push(...pc.graduaciones_sancionables);
        if (Array.isArray(pc.graduaciones_no_sancionables)) agregado.graduacionesNoSancionables.push(...pc.graduaciones_no_sancionables);
        if (row?.observaciones) agregado.observaciones.push(String(row.observaciones));
      });
      finalizarDetallesReadonlyAgrupados(agregado);
      return agregadoInformesTieneDatos(agregado) ? agregado : null;
    } catch (e) {
      console.warn("[WSP] No se pudieron leer informes intermedios para finalizado.", e);
      return null;
    }
  }

  function firmaAgregadoInformesFinalizado(agregado) {
    if (!agregadoInformesTieneDatos(agregado)) return "";
    try {
      return JSON.stringify({
        resultados: agregado?.resultados || {},
        medidas: agregado?.medidas || {},
        detalles: agregado?.detalles || [],
        observaciones: agregado?.observaciones || [],
        san: agregado?.graduacionesSancionables || [],
        no: agregado?.graduacionesNoSancionables || [],
      });
    } catch {
      return String(Date.now());
    }
  }

  function sumarCampoFinalizaDesdeInforme(id, autoValor) {
    const el = document.getElementById(id);
    if (!el) return;
    const autoNuevo = Math.max(0, Number(autoValor || 0));
    const autoPrevio = Math.max(0, Number(el.dataset.autoInformeIntermedio || 0));
    const actual = leerEnteroNoNegativo(el.value);
    const baseManual = Math.max(0, actual - autoPrevio);
    const nuevo = baseManual + autoNuevo;
    el.value = nuevo > 0 ? String(nuevo) : "";
    el.dataset.autoInformeIntermedio = String(autoNuevo);
    el.classList.toggle("input-auto-informe", autoNuevo > 0);
  }

  function getAutoLineasPrevias(el, key) {
    if (!el) return [];
    try {
      const parsed = JSON.parse(el.dataset[key] || "[]");
      return Array.isArray(parsed) ? parsed.map((x) => String(x || "").trim()).filter(Boolean) : [];
    } catch {
      return [];
    }
  }

  function limpiarMarcaOrigenVisualDetalle(texto) {
    return String(texto || "")
      .replace(/\s*>\s*(?:del\s+)?(?:460\/22|4060\/22|alcoholemia|informe)\s*$/i, "")
      .trim();
  }

  function aplicarLineasAutomaticasTextarea(id, lineasNuevas, dataKey) {
    const el = document.getElementById(id);
    if (!el) return;
    const previas = getAutoLineasPrevias(el, dataKey);
    const prevSet = new Set(previas.map((x) => x.trim()).filter(Boolean));
    const base = String(el.value || "")
      .split(/\n+/)
      .map((x) => x.trim())
      .filter((x) => x && !prevSet.has(x));

    const agregadas = [];
    const baseKeys = new Set(base.map((x) => limpiarMarcaOrigenVisualDetalle(x)));
    const agregadasKeys = new Set();
    (Array.isArray(lineasNuevas) ? lineasNuevas : []).forEach((linea) => {
      const visual = String(linea || "").trim();
      const clean = limpiarMarcaOrigenVisualDetalle(visual);
      if (!clean) return;
      if (baseKeys.has(clean) || agregadasKeys.has(clean)) return;
      agregadas.push(visual);
      agregadasKeys.add(clean);
    });

    let lineasFinales = [...base, ...agregadas];
    if (id === "detalles") {
      lineasFinales = consolidarDetallesVisualesTextarea(lineasFinales).lineas;
    }

    let valorFinal = lineasFinales.join("\n");
    if (id === "detalles" && agregadas.length > 0) {
      valorFinal = valorFinal ? `${valorFinal}\n` : "";
    }

    el.value = valorFinal;
    el.dataset[dataKey] = JSON.stringify(agregadas);
    el.classList.toggle("input-auto-informe", agregadas.length > 0);

    if (id === "detalles" && agregadas.length > 0 && typeof el.setSelectionRange === "function") {
      try {
        el.focus({ preventScroll: true });
        el.setSelectionRange(el.value.length, el.value.length);
      } catch {}
    }
  }

  function aplicarGraduacionesAutomaticasFinaliza(agregado) {
    const san = valorAgregadoResultado(agregado, ["Positiva Sancionable", "Alcoholemias Positivas Sancionables"]);
    const no = valorAgregadoResultado(agregado, ["Positiva no Sancionable", "Alcoholemias Positivas NO Sancionables"]);
    const test = valorAgregadoResultado(agregado, ["Test de Alcoholímetro", "Test con alcoholímetro"]) || (san + no);

    sumarCampoFinalizaDesdeInforme("Alcotest", test);
    sumarCampoFinalizaDesdeInforme("positivaSancionable", san);
    sumarCampoFinalizaDesdeInforme("positivaNoSancionable", no);
    sincronizarUIAlcoholimetro();

    const setValores = (contenedor, valores) => {
      const vals = Array.isArray(valores) ? valores.filter(Boolean) : [];
      const inputs = Array.from(contenedor?.querySelectorAll('input[type="text"]') || []);
      vals.forEach((v, idx) => {
        if (inputs[idx]) inputs[idx].value = String(v).replace(".", ",");
      });
    };

    setValores(graduacionesSancionable, agregado?.graduacionesSancionables || []);
    setValores(graduacionesNoSancionable, agregado?.graduacionesNoSancionables || []);
  }

  function aplicarInformesIntermediosEnCamposFinalizado(agregado) {
    const firma = firmaAgregadoInformesFinalizado(agregado);

    if (chkMostrarResultadosFinaliza && agregadoInformesTieneDatos(agregado)) {
      chkMostrarResultadosFinaliza.checked = true;
    }
    actualizarVisibilidadResultadosFinaliza();

    sumarCampoFinalizaDesdeInforme("vehiculos", valorAgregadoResultado(agregado, ["Vehículos Fiscalizados", "Vehiculos Fiscalizados"]));
    sumarCampoFinalizaDesdeInforme("personas", valorAgregadoResultado(agregado, ["Personas Identificadas", "Personas identificadas"]));
    sumarCampoFinalizaDesdeInforme("actas", valorAgregadoResultado(agregado, ["Actas Labradas", "Actas labradas"]));
    sumarCampoFinalizaDesdeInforme("Remision", valorAgregadoMedida(agregado, ["Remisión", "Vehículos remitidos"]));
    sumarCampoFinalizaDesdeInforme("Retencion", valorAgregadoMedida(agregado, ["Retención", "Licencias Retenidas"]));
    sumarCampoFinalizaDesdeInforme("Prohibicion", valorAgregadoMedida(agregado, ["Prohibición de Circulación", "Prohibición de circular"]));
    sumarCampoFinalizaDesdeInforme("Cesion", valorAgregadoMedida(agregado, ["Cesión de Conducción", "Cesión de la conducción"]));
    aplicarGraduacionesAutomaticasFinaliza(agregado);

    const detalles = (agregado?.detalles || []).filter(Boolean);
    aplicarLineasAutomaticasTextarea("detalles", detalles, "autoInformeIntermedioDetalles");

    const observaciones = [];
    const obs460 = construirObservacionDecto460Extendida(agregado);
    if (obs460) observaciones.push(obs460);
    (Array.isArray(agregado?.observaciones) ? agregado.observaciones : []).forEach((obs) => {
      const clean = limpiarTextoSimple(obs);
      if (clean && !observaciones.includes(clean)) observaciones.push(clean);
    });
    aplicarLineasAutomaticasTextarea("obs", observaciones, "autoInformeIntermedioObs");

    firmaInformesIntermediosAplicadosFinalizado = firma;
  }

  function informesIntermediosYaEstanAplicadosEnCampos(agregado) {
    const firma = firmaAgregadoInformesFinalizado(agregado);
    return !!firma && !!firmaInformesIntermediosAplicadosFinalizado && firma === firmaInformesIntermediosAplicadosFinalizado;
  }

  function escapeHtmlWsp(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function ensureResumenInformesIntermediosFinalizado() {
    let box = document.getElementById("resumenInformesIntermediosFinalizado");
    if (box) return box;
    box = document.createElement("div");
    box.id = "resumenInformesIntermediosFinalizado";
    box.className = "resumen-informes-finalizado hidden";
    const destino = divFinaliza || document.getElementById("bloqueResultadosFinaliza") || document.body;
    destino.parentNode?.insertBefore(box, destino);
    return box;
  }

  function ocultarResumenInformesIntermediosFinalizado() {
    const box = document.getElementById("resumenInformesIntermediosFinalizado");
    if (box) {
      box.classList.add("hidden");
      box.innerHTML = "";
    }
  }

  function renderResumenInformesIntermediosFinalizado(agregado) {
    // La información de informes intermedios NO debe mostrarse como resumen aparte.
    // Debe impactar directamente en los campos existentes del FINALIZADO.
    aplicarInformesIntermediosEnCamposFinalizado(agregado);
    ocultarResumenInformesIntermediosFinalizado();
  }

  async function refrescarResumenInformesIntermediosFinalizado() {
    if (selTipo?.value !== "FINALIZA" || !franjaSeleccionada) {
      ocultarResumenInformesIntermediosFinalizado();
      return null;
    }
    const agregado = await cargarAgregadoInformesIntermediosWsp();
    renderResumenInformesIntermediosFinalizado(agregado);
    return agregado;
  }

  function construirLineasAlcoholimetroConAgregado(alcoholimetro, agregado) {
    const aggSan = valorAgregadoResultado(agregado, ["Positiva Sancionable", "Alcoholemias Positivas Sancionables"]);
    const aggNo = valorAgregadoResultado(agregado, ["Positiva no Sancionable", "Alcoholemias Positivas NO Sancionables"]);
    const aggTest = valorAgregadoResultado(agregado, ["Test de Alcoholímetro", "Test con alcoholímetro"]) || (aggSan + aggNo);
    const valoresSan = [...(alcoholimetro?.valoresSan || []), ...(agregado?.graduacionesSancionables || [])].filter(Boolean);
    const valoresNo = [...(alcoholimetro?.valoresNo || []), ...(agregado?.graduacionesNoSancionables || [])].filter(Boolean);
    const total = (alcoholimetro?.totalValidos || 0) + aggTest;
    const san = valoresSan.length || ((alcoholimetro?.cantidadSancionables || 0) + aggSan);
    const no = valoresNo.length || ((alcoholimetro?.cantidadNoSancionables || 0) + aggNo);
    const lineas = [
      `Test de Alcoholímetro: (${formatearCantidad(total)})`,
      `Positiva Sancionable: (${formatearCantidad(san)})`,
    ];
    if (valoresSan.length) lineas.push(construirLineaGraduaciones(valoresSan));
    lineas.push(`Positiva no Sancionable: (${formatearCantidad(no)})`);
    if (valoresNo.length) lineas.push(construirLineaGraduaciones(valoresNo));
    return lineas;
  }

  // ===== ENVIAR A WHATSAPP =====
  async function enviar() {
    if (esControlMovilesActivo()) {
      await salirControlMoviles();
      return;
    }

    if (!franjaSeleccionada) return;

    if (esInformeAlcoholemiaActivo()) {
      await enviarInformeAlcoholemia();
      return;
    }

    if (esInformeDecto460Activo()) {
      await enviarInformeDecto460();
      return;
    }

    if (esControlSuperiorActivo()) {
      const inicioControlSuperior = await resolverInicioParaEnvioInformeWsp({
        seleccionarDefault: seleccionarOperativoControlSuperiorPorDefecto,
        refrescarContexto: refrescarContextoControlSuperior,
        obtenerInicio: obtenerInicioParaControlSuperior,
        mensaje: "No hay datos de inicio guardados para este operativo.",
      });
      if (!inicioControlSuperior) return;

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
    const agregadoInformesLeidosFinalizado = esFinaliza ? await cargarAgregadoInformesIntermediosWsp() : null;
    const agregadoYaAplicadoEnCampos = esFinaliza && informesIntermediosYaEstanAplicadosEnCampos(agregadoInformesLeidosFinalizado);
    const agregadoInformesFinalizado = agregadoYaAplicadoEnCampos ? null : agregadoInformesLeidosFinalizado;
    const hayAgregadoInformesFinalizado = agregadoInformesTieneDatos(agregadoInformesFinalizado);
    const incluirResultadosFinaliza = esFinaliza && (debeIncluirResultadosFinaliza() || hayAgregadoInformesFinalizado);
    const incluirDetallesFinaliza = esFinaliza && (debeIncluirDetallesFinaliza() || hayAgregadoInformesFinalizado);
    const usarPresenciaActiva = !!chkPresenciaActiva?.checked;
    const usarMismoPersonal = esFinaliza && !!chkMismoPersonal?.checked;
    const usarMismoMovil = esFinaliza && !!chkMismoMovil?.checked;
    const usarMismosElementos = esFinaliza && !!chkMismosElementos?.checked;

    let inicioCompartido = null;

    // Regla robusta BMZCN:
    // FINALIZA siempre debe salir con el snapshot vigente del INICIO guardado en Supabase.
    // No se debe obligar al usuario a volver a seleccionar personal, móvil ni elementos.
    // Si no existe INICIO previo, se corta el envío.
    if (esFinaliza || usarMismoPersonal || usarMismoMovil || usarMismosElementos) {
      inicioCompartido = await leerInicioDesdeSupabase(franjaSeleccionada) || cargarInicioGuardadoCoincidente() || cargarInicioLocal();
      if (!inicioCompartido) {
        alert(esFinaliza
          ? "Debe iniciar el operativo antes de finalizarlo."
          : "No hay datos guardados del INICIA para este operativo. Destilde las opciones o envíe primero un INICIA."
        );
        return;
      }
      inicioGuardadoActual = inicioCompartido;
    }

    const elementosInicio = (esFinaliza || usarMismosElementos) ? normalizarPayloadElementos(inicioCompartido) : null;
    const lecturaFormulario = resolverLecturaFormularioOperativo({
      esFinaliza,
      usarMismoPersonal,
      usarMismoMovil,
      usarMismosElementos,
      inicioCompartido,
      elementosInicio,
    });

    let personalTexto;
    let mov;
    let mot;
    let usarElementosDesdeInicio;
    let escopetasTXT;
    let htTXT;
    let pdaTXT;
    let impTXT;
    let alomTXT;
    let alcoTXT;

    if (lecturaFormulario) {
      if (!lecturaFormulario.ok) {
        alert(lecturaFormulario.mensaje || "Revise los datos del formulario del operativo.");
        return;
      }
      ({
        personalTexto,
        mov,
        mot,
        usarElementosDesdeInicio,
        escopetasTXT,
        htTXT,
        pdaTXT,
        impTXT,
        alomTXT,
        alcoTXT,
      } = lecturaFormulario);
    } else {
      personalTexto = (esFinaliza || usarMismoPersonal)
        ? normalizarArrayTexto(inicioCompartido?.personal).join("\n")
        : seleccion("personal");

      if (!personalTexto) {
        alert(esFinaliza
          ? "El INICIO guardado no tiene personal policial. Actualice primero el INICIO del operativo en curso."
          : "Debe seleccionar personal policial."
        );
        return;
      }

      mov = (esFinaliza || usarMismoMovil) ? lineaDesdeArray(inicioCompartido?.moviles, "/") : seleccionLinea("movil", "/");
      mot = (esFinaliza || usarMismoMovil) ? lineaDesdeArray(inicioCompartido?.motos, "/") : seleccionLinea("moto", "/");
      if (mov === "/" && mot === "/") {
        alert(esFinaliza
          ? "El INICIO guardado no tiene móvil ni moto. Actualice primero el INICIO del operativo en curso."
          : "Debe seleccionar al menos un móvil o moto."
        );
        return;
      }

      if ((esFinaliza || usarMismosElementos) && !elementosInicio) {
        alert(esFinaliza
          ? "El INICIO guardado no tiene elementos. Actualice primero el INICIO del operativo en curso."
          : "No hay elementos guardados del INICIA. Destilde “mismos elementos” o envíe primero un INICIA."
        );
        return;
      }

      usarElementosDesdeInicio = esFinaliza || usarMismosElementos;
      escopetasTXT = usarElementosDesdeInicio
        ? lineaDesdeArray(elementosInicio.ESCOPETA, "/")
        : seleccionLinea("ESCOPETA", "/");
      htTXT = usarElementosDesdeInicio
        ? lineaDesdeArray(elementosInicio.HT, "/")
        : seleccionLinea("HT", "/");
      pdaTXT = usarElementosDesdeInicio
        ? lineaDesdeArray(elementosInicio.PDA, "/")
        : seleccionLinea("PDA", "/");
      impTXT = usarElementosDesdeInicio
        ? lineaDesdeArray(elementosInicio.IMPRESORA, "/")
        : seleccionLinea("IMPRESORA", "/");
      alomTXT = usarElementosDesdeInicio
        ? lineaDesdeArray(elementosInicio.Alometro, "/")
        : seleccionLinea("Alometro", "/");
      alcoTXT = usarElementosDesdeInicio
        ? lineaDesdeArray(elementosInicio.Alcoholimetro, "/")
        : seleccionLinea("Alcoholimetro", "/");
    }

    const fecha = new Date().toLocaleDateString("es-AR");

    const modMensajesOperativo = mensajesOperativoWsp();
    const extraConjunto = bloqueConjuntoExtra();
    let partes;

    if (modMensajesOperativo && typeof modMensajesOperativo.construirBaseMensajeOperativo === "function") {
      partes = modMensajesOperativo.construirBaseMensajeOperativo({
        tipo: selTipo.value,
        franja: franjaSeleccionada,
        fecha,
        personalTexto,
        mov,
        mot,
        extraConjunto,
        elementos: {
          escopetasTXT,
          htTXT,
          pdaTXT,
          impTXT,
          alomTXT,
          alcoTXT,
        },
        deps: {
          bold,
          normalizarTituloOperativo,
          normalizarHorario,
          normalizarLugar,
        },
      });
    } else {
      const tituloPrincipal = `${selTipo.value.charAt(0) + selTipo.value.slice(1).toLowerCase()} ${normalizarTituloOperativo(
        franjaSeleccionada.titulo
      )}`.trim();

      const mobilesTexto = [mov, mot].filter((v) => v !== "/").join(" / ") || "/";

      partes = [];

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
    }

    const textoDetallesManual = document.getElementById("detalles")?.value || "";
    const textoDetallesAgregados = hayAgregadoInformesFinalizado ? (agregadoInformesFinalizado.detalles || []).join("\n") : "";
    const detallesProcesados = esFinaliza && incluirDetallesFinaliza
      ? normalizarDetallesTexto([textoDetallesManual, textoDetallesAgregados].filter((v) => String(v || "").trim()).join("\n"))
      : { detalles: "", observaciones: [], cantidadValidos: 0, detalleItems: [], tieneTexto: false };

    const observacionesResultadosFinaliza = [];
    let lineasResultadosGeneradas = null;

    if (esFinaliza && incluirResultadosFinaliza && !validarDetallesRequeridosPorActas(detallesProcesados)) {
      return;
    }

    if (esFinaliza && incluirResultadosFinaliza) {
      const lineasResultados = construirLineasResultados(agregadoInformesFinalizado);
      if (!lineasResultados) return;
      lineasResultadosGeneradas = lineasResultados;

      if (Array.isArray(lineasResultados.__observaciones460Resultados)) {
        lineasResultados.__observaciones460Resultados.forEach((linea) => pushUnicoTextoWsp(observacionesResultadosFinaliza, linea));
      }

      if (modMensajesOperativo && typeof modMensajesOperativo.agregarBloqueResultados === "function") {
        modMensajesOperativo.agregarBloqueResultados(partes, lineasResultados, { bold });
      } else {
        partes.push("");
        partes.push(bold("Resultados:"));
        partes.push(...lineasResultados);
      }

      if (incluirDetallesFinaliza && detallesProcesados.detalles) {
        if (modMensajesOperativo && typeof modMensajesOperativo.agregarBloqueDetalles === "function") {
          modMensajesOperativo.agregarBloqueDetalles(partes, detallesProcesados.detalles, { bold });
        } else {
          partes.push("");
          partes.push(bold("Detalles:"));
          partes.push(detallesProcesados.detalles);
        }
      }
    }

    if (esFinaliza && !incluirResultadosFinaliza && incluirDetallesFinaliza) {
      if (detallesProcesados.detalles) {
        if (modMensajesOperativo && typeof modMensajesOperativo.agregarBloqueDetalles === "function") {
          modMensajesOperativo.agregarBloqueDetalles(partes, detallesProcesados.detalles, { bold });
        } else {
          partes.push("");
          partes.push(bold("Detalles:"));
          partes.push(detallesProcesados.detalles);
        }
      }
    }

    const observacionesExtras = [...detallesProcesados.observaciones, ...observacionesResultadosFinaliza];
    if (!esFinaliza && usarPresenciaActiva) observacionesExtras.push(OBS_PRESENCIA_ACTIVA_INICIA);
    if (esFinaliza && usarPresenciaActiva) observacionesExtras.push(OBS_PRESENCIA_ACTIVA_FINALIZA);
    if (esFinaliza) {
      obtenerObservacionesTemporalesFranja(franjaSeleccionada).forEach((linea) => observacionesExtras.push(linea));
    }

    const observacionesFinalesTexto = construirObservacionesFinales(observacionesExtras);

    if (modMensajesOperativo && typeof modMensajesOperativo.agregarBloqueObservaciones === "function") {
      modMensajesOperativo.agregarBloqueObservaciones(partes, observacionesFinalesTexto, { bold });
    } else {
      partes.push("");
      partes.push(bold("Observaciones:"));
      partes.push(observacionesFinalesTexto);
    }

    const textoFinal = modMensajesOperativo && typeof modMensajesOperativo.construirTextoDesdePartes === "function"
      ? modMensajesOperativo.construirTextoDesdePartes(partes)
      : compactarSaltos(partes.join("\n"));
    const tipoEventoHistorial = esFinaliza ? "FINALIZADO" : "INICIO";
    const payloadHistorial = construirPayloadHistorialOperativoWsp({
      tipoEvento: tipoEventoHistorial,
      textoFinal,
      personalTexto,
      mov,
      mot,
      escopetasTXT,
      htTXT,
      pdaTXT,
      impTXT,
      alomTXT,
      alcoTXT,
      lineasResultados: lineasResultadosGeneradas,
      detallesProcesados,
      observacionesFinales: observacionesFinalesTexto,
    });

    if (selTipo.value === "INICIA") {
      await guardarElementosDeInicio();
    }

    const resultadoHistorial = await guardarHistorialOperativoWsp(tipoEventoHistorial, payloadHistorial);
    if (resultadoHistorial && resultadoHistorial.ok === false) {
      alert(resultadoHistorial.motivo || "No se pudo guardar en Supabase.");
      return;
    }
    if (!resultadoGuardadoValidoWsp(resultadoHistorial)) {
      alert("No se confirmó el guardado en Supabase. No se enviará por WhatsApp porque Estadísticas no podría actualizarse.");
      return;
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
  if (tipoInforme) tipoInforme.addEventListener("change", actualizarTipo);
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

  [infAlcoTipoVehiculo, infAlcoGraduacion, infAlco460, infAlcoLicenciaDigital, infAlcoLicenciaClase, infAlcoMedRetencion, infAlcoMedRemision].forEach((el) => {
    if (!el) return;
    el.addEventListener("input", actualizarReglasInformeAlcoholemia);
    el.addEventListener("change", actualizarReglasInformeAlcoholemia);
  });

  [infAlcoMarca, infAlcoModelo, infAlcoDominio, infAlcoConductor, infAlcoLicenciaClase, infAlcoTipoOtro, infAlcoDependenciaRemite, infAlcoCorralon, infAlcoObservacionExtra].forEach((el) => {
    if (!el) return;
    el.addEventListener("input", () => {
      const pos = el.selectionStart;
      const end = el.selectionEnd;
      el.value = normalizarMayusInformeInput(el.value);
      try { if (pos != null && end != null) el.setSelectionRange(pos, end); } catch {}
    });
    el.addEventListener("blur", () => { el.value = normalizarMayusInforme(el.value); });
  });

  if (infAlcoActa) {
    infAlcoActa.addEventListener("input", () => { infAlcoActa.value = normalizarNumeroActaInforme(infAlcoActa.value); });
  }

  if (infAlcoDominio) {
    infAlcoDominio.addEventListener("blur", () => { infAlcoDominio.value = normalizarDominioInforme(infAlcoDominio.value); });
  }


  [inf460Marca, inf460Modelo, inf460Dominio, inf460OtrosCodigos, inf460Corralon].forEach((el) => {
    if (!el) return;
    el.addEventListener("input", () => {
      const pos = el.selectionStart;
      const end = el.selectionEnd;
      el.value = normalizarMayusInformeInput(el.value);
      try { if (pos != null && end != null) el.setSelectionRange(pos, end); } catch {}
    });
    el.addEventListener("blur", () => { el.value = normalizarMayusInforme(el.value); });
  });
  if (inf460Acta) {
    inf460Acta.addEventListener("input", () => { inf460Acta.value = normalizarNumeroActaInforme(inf460Acta.value); });
  }
  if (inf460Dominio) {
    inf460Dominio.addEventListener("blur", () => { inf460Dominio.value = normalizarDominioInforme(inf460Dominio.value); });
  }

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
    console.log("[WSP] Órdenes en memoria de pantalla:", Array.isArray(_tmp) ? _tmp.length : _tmp);
    cargarOperativosDisponibles();
  })();
})();
