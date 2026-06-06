(function () {
  "use strict";

  window.WSP = window.WSP || {};
  window.WSP.ui = window.WSP.ui || {};
  window.WSP.modules = window.WSP.modules || {};

  const MENSAJES_DEFAULT = Object.freeze({
    sinFranja: "No hay operativos iniciados para vincular el informe.",
    sinInicio: "No hay INICIO guardado para este operativo. Envíe primero el INICIA.",
  });

  const MENSAJE_SIN_INICIO_DETALLADO =
    "No hay INICIO guardado para este operativo. Envíe primero el INICIA para autocompletar lugar, móviles y personal.";

  function limpiarTextoSimple(valor) {
    return String(valor || "")
      .replace(/\s+/g, " ")
      .trim();
  }

  function normalizarLugarFallback(valor) {
    return limpiarTextoSimple(valor);
  }

  function arrayDesdeValor(value) {
    if (Array.isArray(value)) return value.map((v) => limpiarTextoSimple(v)).filter(Boolean);
    if (typeof value === "string") {
      const raw = value.trim();
      if (!raw) return [];
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed.map((v) => limpiarTextoSimple(v)).filter(Boolean);
      } catch {}
      return [limpiarTextoSimple(raw)].filter(Boolean);
    }
    return [];
  }

  function lineaDesdeArrayFallback(value, sep = "/") {
    const items = arrayDesdeValor(value);
    return items.length ? items.join(sep) : "/";
  }

  function construirMovilidadInicio(inicio = {}, deps = {}) {
    const linea = typeof deps.lineaDesdeArray === "function" ? deps.lineaDesdeArray : lineaDesdeArrayFallback;
    const moviles = linea(inicio.moviles, "/");
    const motos = linea(inicio.motos, "/");
    return [moviles, motos].filter((v) => v && v !== "/").join(" / ") || "/";
  }

  function construirLugarInicio(inicio = {}, franja = {}, deps = {}) {
    const normalizar = typeof deps.normalizarLugar === "function" ? deps.normalizarLugar : normalizarLugarFallback;
    return normalizar(inicio.lugar || franja.lugar || "");
  }

  function resolverTextoContextoInforme(config = {}) {
    const franja = config.franja || null;
    const inicio = config.inicio || null;
    const mensajes = { ...MENSAJES_DEFAULT, ...(config.mensajes || {}) };
    const deps = config.deps || {};

    if (!franja) return mensajes.sinFranja;
    if (!inicio) return mensajes.sinInicio;

    const lugar = construirLugarInicio(inicio, franja, deps) || "/";
    const movilidad = construirMovilidadInicio(inicio, deps);
    return `Lugar: ${lugar} | Móviles: ${movilidad}`;
  }

  function setTextoContexto(el, texto = "") {
    if (!el) return;
    el.textContent = limpiarTextoSimple(texto);
  }

  function mensajeSinInicioInforme(config = {}) {
    return limpiarTextoSimple(config.mensaje || config.mensajeSinInicio || MENSAJE_SIN_INICIO_DETALLADO);
  }

  function getAlertFn(config = {}) {
    if (typeof config.alert === "function") return config.alert;
    return window.alert ? window.alert.bind(window) : null;
  }

  function alertarSiCorresponde(config = {}, mensaje = "") {
    if (config.mostrarAlerta === false) return false;
    const alertFn = getAlertFn(config);
    if (!alertFn) return false;
    alertFn(limpiarTextoSimple(mensaje));
    return true;
  }

  async function refrescarContextoSiCorresponde(config = {}) {
    if (typeof config.refrescarContexto !== "function") return false;
    try {
      await config.refrescarContexto();
      return true;
    } catch {
      return false;
    }
  }

  async function obtenerInicioPorCallback(config = {}) {
    if (typeof config.obtenerInicio !== "function") return null;
    try {
      return await config.obtenerInicio();
    } catch {
      return null;
    }
  }

  function resultadoSinInicio(motivo, mensaje, extra = {}) {
    return {
      ok: false,
      inicio: null,
      motivo: motivo || "sin_inicio",
      mensaje: limpiarTextoSimple(mensaje),
      ...extra,
    };
  }

  function asegurarElementoContexto(config = {}) {
    const existente = config.elemento || config.el || null;
    if (existente) return existente;

    const contenedor = config.contenedor || config.parent || null;
    if (!contenedor || !contenedor.querySelector) return null;

    const id = limpiarTextoSimple(config.id || "");
    if (id) {
      const porId = contenedor.querySelector(`#${id}`) || document.getElementById(id);
      if (porId) return porId;
    }

    const selector = limpiarTextoSimple(config.selector || "");
    if (selector) {
      const porSelector = contenedor.querySelector(selector);
      if (porSelector) return porSelector;
    }

    if (config.crear === false) return null;

    const el = document.createElement(config.tag || "div");
    if (id) el.id = id;
    el.className = limpiarTextoSimple(config.className || "informe-contexto");
    el.textContent = limpiarTextoSimple(config.textoInicial || "");

    const insertarAntesDe = config.insertarAntesDe || contenedor.firstElementChild || null;
    if (insertarAntesDe && insertarAntesDe.parentNode === contenedor) {
      contenedor.insertBefore(el, insertarAntesDe);
    } else {
      contenedor.prepend ? contenedor.prepend(el) : contenedor.appendChild(el);
    }

    return el;
  }


  async function refrescarContextoInforme(config = {}) {
    const elemento = config.elemento || config.el || null;
    if (!elemento) return { ok: false, skipped: true, motivo: "sin_elemento" };

    const estaActivo = typeof config.activo === "function" ? !!config.activo() : config.activo !== false;
    if (!estaActivo) return { ok: false, skipped: true, motivo: "inactivo" };

    const getFranja = typeof config.getFranja === "function" ? config.getFranja : (() => config.franja || null);
    let franja = getFranja();

    if (!franja && typeof config.seleccionarDefault === "function") {
      await config.seleccionarDefault();
      franja = getFranja();
    }

    const mensajes = { ...MENSAJES_DEFAULT, ...(config.mensajes || {}) };
    const deps = config.deps || {};
    const setTexto = typeof config.setTexto === "function" ? config.setTexto : setTextoContexto;
    const resolverTexto = typeof config.resolverTexto === "function"
      ? config.resolverTexto
      : (inicio, franjaActual) => resolverTextoContextoInforme({ inicio, franja: franjaActual, mensajes, deps });

    if (!franja) {
      const texto = resolverTexto(null, null);
      setTexto(elemento, texto);
      return { ok: false, skipped: false, motivo: "sin_franja", texto };
    }

    const inicio = typeof config.getInicio === "function" ? await config.getInicio(franja) : (config.inicio || null);
    const texto = resolverTexto(inicio, franja);
    setTexto(elemento, texto);

    return { ok: !!inicio, skipped: false, motivo: inicio ? "ok" : "sin_inicio", inicio, franja, texto };
  }


  async function refrescarContextosActivos(items = []) {
    const lista = Array.isArray(items) ? items : [];
    const resultados = [];

    for (const item of lista) {
      if (!item) continue;

      const estaActivo = typeof item.activo === "function" ? !!item.activo() : item.activo !== false;
      if (!estaActivo) continue;

      try {
        if (typeof item.refrescar === "function") {
          resultados.push(await item.refrescar());
        } else {
          resultados.push(await refrescarContextoInforme(item));
        }
      } catch (error) {
        resultados.push({ ok: false, skipped: false, motivo: "error", error });
        try { console.warn("[WSP selector contexto UI] No se pudo refrescar un contexto activo.", error); } catch {}
      }
    }

    return resultados;
  }


  async function obtenerInicioSeleccionadoInforme(config = {}) {
    const getFranja = typeof config.getFranja === "function"
      ? config.getFranja
      : (() => config.franja || null);
    const seleccionarDefault = typeof config.seleccionarDefault === "function" ? config.seleccionarDefault : null;

    let franja = getFranja();
    if (!franja && seleccionarDefault) {
      await seleccionarDefault();
      franja = getFranja();
    }

    if (!franja) return null;
    if (franja.__inicioGuardadoPayload) return franja.__inicioGuardadoPayload;

    const lectores = [
      config.leerInicio,
      config.cargarInicioGuardadoCoincidente,
      config.cargarInicioLocal,
    ].filter((fn) => typeof fn === "function");

    for (const leer of lectores) {
      try {
        const inicio = await leer(franja);
        if (inicio) return inicio;
      } catch {}
    }

    return null;
  }


  async function requerirInicioSeleccionadoInforme(config = {}) {
    const inicio = await obtenerInicioSeleccionadoInforme(config);
    if (inicio) {
      return { ok: true, inicio, motivo: "ok" };
    }

    const mensaje = mensajeSinInicioInforme(config);
    await refrescarContextoSiCorresponde(config);
    alertarSiCorresponde(config, mensaje);

    return resultadoSinInicio("sin_inicio", mensaje);
  }


  async function resolverInicioRequeridoInforme(config = {}) {
    const mensaje = mensajeSinInicioInforme(config);

    const requerir = typeof config.requerirInicio === "function"
      ? await config.requerirInicio({ ...config, mensaje })
      : await requerirInicioSeleccionadoInforme({ ...config, mensaje });

    if (requerir && requerir.ok && requerir.inicio) {
      return { ok: true, inicio: requerir.inicio, motivo: requerir.motivo || "ok", requerir };
    }

    if (requerir && requerir.ok === false) {
      return resultadoSinInicio(requerir.motivo || "sin_inicio", requerir.mensaje || mensaje, { requerir });
    }

    const inicio = await obtenerInicioPorCallback(config);
    if (inicio) return { ok: true, inicio, motivo: "obtener_inicio" };

    await refrescarContextoSiCorresponde(config);
    alertarSiCorresponde(config, mensaje);

    return resultadoSinInicio("sin_inicio", mensaje);
  }


  async function resolverInicioParaEnvioInforme(config = {}) {
    const mensaje = mensajeSinInicioInforme(config);
    const resolver = typeof config.resolverInicioRequerido === "function"
      ? config.resolverInicioRequerido
      : resolverInicioRequeridoInforme;

    const resultado = await resolver({ ...config, mensaje });
    if (resultado && resultado.ok && resultado.inicio) return resultado.inicio;
    if (resultado && resultado.ok === false) return null;

    const inicio = await obtenerInicioPorCallback(config);
    if (inicio) return inicio;

    await refrescarContextoSiCorresponde(config);
    alertarSiCorresponde(config, mensaje);

    return null;
  }

  async function seleccionarOperativoIniciadoPorDefecto(config = {}) {
    const selHorario = config.selHorario || null;
    if (!selHorario) return { ok: false, motivo: "sin_selector" };

    const getOperativos = typeof config.getOperativos === "function"
      ? config.getOperativos
      : (() => Array.isArray(config.operativos) ? config.operativos : []);
    const cargarOperativos = typeof config.cargarOperativos === "function" ? config.cargarOperativos : null;
    const getFranjaSeleccionada = typeof config.getFranjaSeleccionada === "function"
      ? config.getFranjaSeleccionada
      : (() => config.franjaSeleccionada || null);
    const seleccionarFranja = typeof config.seleccionarFranja === "function"
      ? config.seleccionarFranja
      : ((franja) => {
          if (!franja) return;
          selHorario.value = franja.__key || "";
        });
    const leerInicio = typeof config.leerInicio === "function" ? config.leerInicio : null;
    const ordenarCandidatos = typeof config.ordenarCandidatos === "function"
      ? config.ordenarCandidatos
      : ((items) => Array.isArray(items) ? items.slice() : []);
    const afterSelect = typeof config.afterSelect === "function" ? config.afterSelect : null;
    const fallbackUnico = config.fallbackUnico !== false;
    const fallbackPrimero = config.fallbackPrimero === true;
    const usarInicioLocal = config.usarInicioLocal === true;
    const cargarInicioLocal = typeof config.cargarInicioLocal === "function" ? config.cargarInicioLocal : null;
    const puntuarCoincidenciaInicio = typeof config.puntuarCoincidenciaInicio === "function"
      ? config.puntuarCoincidenciaInicio
      : (() => -1);

    let operativos = getOperativos();
    const faltaCacheInicio = !Array.isArray(operativos) || !operativos.length || !operativos.some((op) => op && op.__desdeInicioGuardado);

    if (faltaCacheInicio && cargarOperativos) {
      await cargarOperativos(selHorario.value || "");
      operativos = getOperativos();
    }

    if (!Array.isArray(operativos) || !operativos.length) {
      return { ok: false, motivo: "sin_operativos" };
    }

    const franjaActual = getFranjaSeleccionada();
    if (franjaActual && leerInicio) {
      try {
        const inicioActual = await leerInicio(franjaActual);
        if (inicioActual) return { ok: true, motivo: "actual_con_inicio", franja: franjaActual, inicio: inicioActual };
      } catch {}
    }

    const candidatos = ordenarCandidatos(operativos);

    if (leerInicio) {
      for (const candidato of candidatos) {
        try {
          const inicio = await leerInicio(candidato);
          if (!inicio) continue;
          seleccionarFranja(candidato, { motivo: "inicio_supabase", inicio });
          if (afterSelect) afterSelect(candidato, { motivo: "inicio_supabase", inicio });
          return { ok: true, motivo: "inicio_supabase", franja: candidato, inicio };
        } catch {}
      }
    }

    if (usarInicioLocal && cargarInicioLocal) {
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
          seleccionarFranja(mejor, { motivo: "inicio_local", inicio: inicioLocal, puntaje: mejorPuntaje });
          if (afterSelect) afterSelect(mejor, { motivo: "inicio_local", inicio: inicioLocal, puntaje: mejorPuntaje });
          return { ok: true, motivo: "inicio_local", franja: mejor, inicio: inicioLocal, puntaje: mejorPuntaje };
        }
      }
    }

    if (fallbackPrimero && candidatos.length) {
      const candidato = candidatos[0];
      seleccionarFranja(candidato, { motivo: "fallback_primero" });
      if (afterSelect) afterSelect(candidato, { motivo: "fallback_primero" });
      return { ok: true, motivo: "fallback_primero", franja: candidato };
    }

    if (fallbackUnico && candidatos.length === 1) {
      const candidato = candidatos[0];
      seleccionarFranja(candidato, { motivo: "fallback_unico" });
      if (afterSelect) afterSelect(candidato, { motivo: "fallback_unico" });
      return { ok: true, motivo: "fallback_unico", franja: candidato };
    }

    return { ok: false, motivo: "sin_seleccion", candidatos };
  }

  const api = {
    MENSAJES_DEFAULT,
    limpiarTextoSimple,
    arrayDesdeValor,
    lineaDesdeArrayFallback,
    construirMovilidadInicio,
    construirLugarInicio,
    resolverTextoContextoInforme,
    setTextoContexto,
    mensajeSinInicioInforme,
    alertarSiCorresponde,
    refrescarContextoSiCorresponde,
    obtenerInicioPorCallback,
    asegurarElementoContexto,
    refrescarContextoInforme,
    refrescarContextosActivos,
    obtenerInicioSeleccionadoInforme,
    requerirInicioSeleccionadoInforme,
    resolverInicioRequeridoInforme,
    resolverInicioParaEnvioInforme,
    seleccionarOperativoIniciadoPorDefecto,
  };

  window.WSP.ui.selectorContexto = api;
  window.WSP.modules.selectorContextoUi = api;

  console.log("[WSP selector contexto UI] cargado");
})();
