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

  const inputAlcotest = document.getElementById("Alcotest");
  const inputPositivaSancionable = document.getElementById("positivaSancionable");
  const inputPositivaNoSancionable = document.getElementById("positivaNoSancionable");
  const bloquePositivosAlcoholimetro = document.getElementById("bloquePositivosAlcoholimetro");
  const wrapGraduacionesSancionable = document.getElementById("wrapGraduacionesSancionable");
  const wrapGraduacionesNoSancionable = document.getElementById("wrapGraduacionesNoSancionable");
  const graduacionesSancionable = document.getElementById("graduacionesSancionable");
  const graduacionesNoSancionable = document.getElementById("graduacionesNoSancionable");
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
      input.placeholder = "Documento";
      input.value = sanitizarValorQrz(valorInicial);
      input.addEventListener("input", () => {
        input.value = sanitizarValorQrz(input.value);
      });
    } else {
      input.inputMode = "text";
      input.maxLength = 16;
      input.placeholder = "Dominio";
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
      limpiarGraduaciones(graduacionesSancionable);
      limpiarGraduaciones(graduacionesNoSancionable);
      return;
    }

    const mostrarGradSan = posSan > 0;
    wrapGraduacionesSancionable?.classList.toggle("hidden", !mostrarGradSan);
    if (mostrarGradSan) renderGraduaciones(graduacionesSancionable, posSan);
    else limpiarGraduaciones(graduacionesSancionable);

    const mostrarGradNo = posNo > 0;
    wrapGraduacionesNoSancionable?.classList.toggle("hidden", !mostrarGradNo);
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
    return `Graduaciones: ${valores.map((v) => `(${v})`).join("")}`;
  }

  function construirBloqueAlcoholimetro() {
    const alcotest = leerEnteroInput(inputAlcotest);

    if (alcotest <= 0) {
      return { ok: true, lineas: [`Test de Alcoholímetro: (${formatearCantidad(0)})`] };
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
      return { ok: true, lineas: [`Test de Alcoholímetro: (${formatearCantidad(0)})`] };
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

    return { ok: true, lineas };
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
      sincronizarUIAlcoholimetro();
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

    sincronizarUIAlcoholimetro();
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
  function limpiarDescripcionDetalle(txt) {
    return String(txt || "")
      .replace(/^[\s:;,.–—-]+/, "")
      .replace(/\s*[:;,.–—-]\s*/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function normalizarLineaDetalle(linea) {
    let s = String(linea || "").replace(/\r/g, "").trim();
    if (!s) return null;

    s = s.replace(/\s+/g, " ").trim();

    const patrones = [
      /^\(\s*(\d{1,2})\s*\)\s*(\d{4,5})(?:\s*[-:;,.–—]\s*|\s+)(.+)$/i,
      /^\(\s*(\d{1,2})\s*\)\s*(\d{4,5})(.+)$/i,
      /^(\d{1,2})\s*[-–—]\s*(\d{4,5})(?:\s*[-:;,.–—]\s*|\s+)(.+)$/i,
      /^(\d{1,2})\s*[-–—]\s*(\d{4,5})(.+)$/i,
      /^(\d{1,2})\s+(\d{4,5})(?:\s*[-:;,.–—]\s*|\s+)(.+)$/i,
      /^(\d{4,5})(?:\s*[-:;,.–—]\s*|\s+)(.+)$/i,
    ];

    for (let i = 0; i < patrones.length; i += 1) {
      const m = s.match(patrones[i]);
      if (!m) continue;

      const tieneCantidad = i < 5;
      const cantidad = tieneCantidad ? formatearCantidad(m[1]) : formatearCantidad(1);
      const codigo = tieneCantidad ? m[2] : m[1];
      const descripcion = limpiarDescripcionDetalle(tieneCantidad ? m[3] : m[2]);

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

  function resetUI() {
    ordenSeleccionada = null;
    franjaSeleccionada = null;

    selTipo.value = "";
    selOrden.value = "";
    selHorario.innerHTML = '<option value="">Seleccionar horario</option>';

    document.querySelectorAll('input[type="checkbox"]').forEach((c) => (c.checked = false));

    document
      .querySelectorAll('input[type="number"], input[type="text"], textarea')
      .forEach((i) => {
        i.value = "";
        limpiarErrorCampo(i);
      });

    const obs = document.getElementById("obs");
    if (obs) obs.value = "";

    divFinaliza.classList.add("hidden");
    divDetalles.classList.add("hidden");

    if (chkMismosElementos) chkMismosElementos.checked = false;
    if (divMismosElementos) divMismosElementos.classList.add("hidden");

    limpiarGraduaciones(graduacionesSancionable);
    limpiarGraduaciones(graduacionesNoSancionable);
    limpiarListaDinamica(qrzCasilleros);
    limpiarListaDinamica(dominioCasilleros);
    if (bloquePositivosAlcoholimetro) bloquePositivosAlcoholimetro.classList.add("hidden");
    if (wrapGraduacionesSancionable) wrapGraduacionesSancionable.classList.add("hidden");
    if (wrapGraduacionesNoSancionable) wrapGraduacionesNoSancionable.classList.add("hidden");
    if (wrapQrzCasilleros) wrapQrzCasilleros.classList.add("hidden");
    if (wrapDominioCasilleros) wrapDominioCasilleros.classList.add("hidden");

    setElementosVisibles(true);
    sincronizarUIAlcoholimetro();
    sincronizarUIQrzDominio();
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

    const detallesProcesados = esFinaliza
      ? normalizarDetallesTexto(document.getElementById("detalles")?.value || "")
      : { detalles: "", observaciones: [], cantidadValidos: 0, detalleItems: [], tieneTexto: false };

    if (esFinaliza && !finalizaSinResultados && !validarDetallesRequeridosPorActas(detallesProcesados)) {
      return;
    }

    if (esFinaliza && !finalizaSinResultados) {
      const lineasResultados = construirLineasResultados();
      if (!lineasResultados) return;

      partes.push("");
      partes.push(bold("Resultados:"));
      partes.push(...lineasResultados);

      if (detallesProcesados.detalles) {
        partes.push("");
        partes.push(bold("Detalles:"));
        partes.push(detallesProcesados.detalles);
      }
    }

    if (esFinaliza && finalizaSinResultados) {
      if (detallesProcesados.detalles) {
        partes.push("");
        partes.push(bold("Detalles:"));
        partes.push(detallesProcesados.detalles);
      }
    }

    partes.push("");
    partes.push(bold("Observaciones:"));
    partes.push(construirObservacionesFinales(detallesProcesados.observaciones));

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
    detallesInput.addEventListener("input", () => limpiarErrorCampo(detallesInput));
  }

  btnEnviar.addEventListener("click", enviar);

  // ===== Init =====
  (async function init() {
    actualizarTipo();
    sincronizarUIAlcoholimetro();
    sincronizarUIQrzDominio();
    await syncOrdenesDesdeServidor();
    const _tmp = cargarOrdenesSeguro();
    console.log("[WSP] Órdenes en memoria/Storage:", Array.isArray(_tmp) ? _tmp.length : _tmp);
    cargarOrdenesDisponibles();
  })();
})();
