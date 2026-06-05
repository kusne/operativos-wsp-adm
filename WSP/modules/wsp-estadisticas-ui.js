(function () {
  "use strict";

  window.WSP = window.WSP || {};
  window.WSP.ui = window.WSP.ui || {};
  window.WSP.modules = window.WSP.modules || {};

  function normalizarBasicoLocal(txt) {
    return String(txt || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/\s+/g, " ")
      .trim();
  }

  function getDeps(ctx = {}) {
    return ctx.deps || {};
  }

  function getRefs(ctx = {}) {
    return ctx.refs || {};
  }

  function getFranja(ctx = {}) {
    return ctx.franja || null;
  }

  function esFinaliza(ctx = {}) {
    return getRefs(ctx).selTipo?.value === "FINALIZA";
  }

  function normalizarFuente(ctx = {}, texto) {
    const deps = getDeps(ctx);
    const fn = typeof deps.normalizarBasicoSinAcentos === "function"
      ? deps.normalizarBasicoSinAcentos
      : normalizarBasicoLocal;
    return fn(texto || "");
  }

  function obtenerFuenteTipoActual(ctx = {}) {
    const deps = getDeps(ctx);
    const franja = getFranja(ctx);

    const obtenerTextoRefOrdenDeFranja = typeof deps.obtenerTextoRefOrdenDeFranja === "function"
      ? deps.obtenerTextoRefOrdenDeFranja
      : () => "";
    const obtenerTipoCortoFranja = typeof deps.obtenerTipoCortoFranja === "function"
      ? deps.obtenerTipoCortoFranja
      : () => "";
    const construirTextoOpcionHorario = typeof deps.construirTextoOpcionHorario === "function"
      ? deps.construirTextoOpcionHorario
      : () => "";

    return normalizarFuente(ctx, [
      franja?.titulo || "",
      obtenerTextoRefOrdenDeFranja(franja),
      obtenerTipoCortoFranja(franja),
      construirTextoOpcionHorario(franja),
    ].join(" "));
  }

  function esFinalizaSinResultados(ctx = {}) {
    const fuente = obtenerFuenteTipoActual(ctx);
    return /\bcustodia\b|\btraslado\b/.test(fuente);
  }

  function esFinalizaConResultadosOpcionales(ctx = {}) {
    const fuente = obtenerFuenteTipoActual(ctx);
    return /\bordenamiento\b|\bestablecido\b|\bmonitoreo\b|\bpresencia\s*activa\b|\blimpieza\b|\bablacion\b/.test(fuente);
  }

  function esTipoConPresenciaActivaOpcional(ctx = {}) {
    const fuente = obtenerFuenteTipoActual(ctx);
    if (!fuente) return false;

    if (/\bordenamiento\b|\bablacion\b|\blimpieza\b|\bestablecido\b|\bmonitoreo\b|\bacompanamiento\b|\bacompanamieto\b|\bescolta\b|\bcustodia\b|\btraslado\b|\bpresencia\s*activa\b/.test(fuente)) {
      return false;
    }

    return /\bocv\b|\bcontrol\s+vehicular\b|\boperativo\s+de\s+control\s+vehicular\b|\balcoholem/i.test(fuente)
      || /\bdicep\b|\ben\s+conjunto\b|\boperativo\s+en\s+conjunto\b|\bconjunto\b|\bcoordinad\w*\b|\bcontrol\s+de\s+peso\b|\bpeso\b|\bcontrol\b/.test(fuente);
  }

  function debeOcultarTodoPorPresenciaActivaFinaliza(ctx = {}) {
    const refs = getRefs(ctx);
    return esFinaliza(ctx) && !!refs.chkPresenciaActiva?.checked;
  }

  function debeIncluirResultadosFinaliza(ctx = {}) {
    const refs = getRefs(ctx);
    if (!esFinaliza(ctx)) return false;
    if (debeOcultarTodoPorPresenciaActivaFinaliza(ctx)) return false;
    if (esFinalizaSinResultados(ctx)) return false;
    if (esFinalizaConResultadosOpcionales(ctx)) return !!refs.chkMostrarResultadosFinaliza?.checked;
    return true;
  }

  function debeIncluirDetallesFinaliza(ctx = {}) {
    const refs = getRefs(ctx);
    if (!esFinaliza(ctx)) return false;
    if (debeOcultarTodoPorPresenciaActivaFinaliza(ctx)) return false;
    if (esFinalizaConResultadosOpcionales(ctx)) return !!refs.chkMostrarResultadosFinaliza?.checked;
    if (esFinalizaSinResultados(ctx)) return true;
    return true;
  }

  function actualizarVisibilidadBloquePresenciaActiva(ctx = {}) {
    const refs = getRefs(ctx);
    const deps = getDeps(ctx);
    const esControlSuperiorActivo = typeof deps.esControlSuperiorActivo === "function"
      ? deps.esControlSuperiorActivo
      : () => false;

    if (esControlSuperiorActivo()) {
      if (refs.bloquePresenciaActiva) refs.bloquePresenciaActiva.classList.add("hidden");
      if (refs.chkPresenciaActiva) refs.chkPresenciaActiva.checked = false;
      return;
    }

    const mostrar = !!getFranja(ctx) && esTipoConPresenciaActivaOpcional(ctx);

    if (refs.bloquePresenciaActiva) {
      refs.bloquePresenciaActiva.classList.toggle("hidden", !mostrar);
    }

    if (!mostrar && refs.chkPresenciaActiva) {
      refs.chkPresenciaActiva.checked = false;
    }
  }

  function ocultarBloquesDinamicosFinalizado(refs = {}) {
    [
      refs.bloquePositivosAlcoholimetro,
      refs.wrapGraduacionesSancionable,
      refs.wrapGraduacionesNoSancionable,
      refs.unitGraduacionesSancionable,
      refs.unitGraduacionesNoSancionable,
      refs.wrapQrzCasilleros,
      refs.wrapDominioCasilleros,
    ].forEach((el) => {
      if (el) el.classList.add("hidden");
    });
  }

  function actualizarVisibilidadResultadosFinaliza(ctx = {}) {
    const refs = getRefs(ctx);
    const deps = getDeps(ctx);
    const fin = esFinaliza(ctx);
    const resultadosOpcionales = fin && esFinalizaConResultadosOpcionales(ctx);
    const mostrarResultados = fin && debeIncluirResultadosFinaliza(ctx);
    const mostrarDetalles = fin && debeIncluirDetallesFinaliza(ctx);

    if (refs.bloqueMostrarResultadosFinaliza) {
      refs.bloqueMostrarResultadosFinaliza.classList.toggle("hidden", !resultadosOpcionales);
    }

    if (refs.tituloResultadosFinaliza) {
      refs.tituloResultadosFinaliza.classList.toggle("hidden", !mostrarResultados);
    }

    if (refs.contenidoResultadosFinaliza) {
      refs.contenidoResultadosFinaliza.classList.toggle("hidden", !mostrarResultados);
    }

    if (refs.divDetalles) {
      refs.divDetalles.classList.toggle("hidden", !mostrarDetalles);
    }

    if (!mostrarResultados) {
      ocultarBloquesDinamicosFinalizado(refs);
      if (!mostrarDetalles) return;
    }

    if (mostrarResultados) {
      if (typeof deps.sincronizarUIAlcoholimetro === "function") deps.sincronizarUIAlcoholimetro();
      if (typeof deps.sincronizarUIQrzDominio === "function") deps.sincronizarUIQrzDominio();
    }
  }

  const api = {
    obtenerFuenteTipoActual,
    esFinalizaSinResultados,
    esFinalizaConResultadosOpcionales,
    esTipoConPresenciaActivaOpcional,
    debeOcultarTodoPorPresenciaActivaFinaliza,
    debeIncluirResultadosFinaliza,
    debeIncluirDetallesFinaliza,
    actualizarVisibilidadBloquePresenciaActiva,
    actualizarVisibilidadResultadosFinaliza,
  };

  window.WSP.ui.estadisticas = api;
  window.WSP.modules.estadisticasUi = api;

  console.log("[WSP estadísticas UI] cargado");
})();
