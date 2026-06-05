(function () {
  "use strict";

  window.WSP = window.WSP || {};
  window.WSP.ui = window.WSP.ui || {};
  window.WSP.modules = window.WSP.modules || {};

  const TIPO_INFORMES = "INFORMES";
  const INFORME_CONTROL_SUPERIOR = "CONTROL SUPERIOR";
  const INFORME_ALCOHOLEMIA = "INFORME ALCOHOLEMIA";
  const INFORME_DECTO_460 = "INFORME DECTO 460/22";

  const INFORMES_DISPONIBLES = [
    { value: INFORME_CONTROL_SUPERIOR, text: "CONTROL SUPERIOR" },
    { value: INFORME_ALCOHOLEMIA, text: "ALCOHOLEMIA POSITIVA" },
    { value: INFORME_DECTO_460, text: "DECTO 460/22" },
  ];

  const ALIASES_INFORMES = new Map([
    ["CONTROL SUPERIOR", INFORME_CONTROL_SUPERIOR],
    ["INFORME CONTROL SUPERIOR", INFORME_CONTROL_SUPERIOR],
    ["ALCOHOLEMIA", INFORME_ALCOHOLEMIA],
    ["ALCOHOLEMIA POSITIVA", INFORME_ALCOHOLEMIA],
    ["INFORME ALCOHOLEMIA", INFORME_ALCOHOLEMIA],
    ["DECTO 460/22", INFORME_DECTO_460],
    ["DTO 460/22", INFORME_DECTO_460],
    ["DECRETO 460/22", INFORME_DECTO_460],
    ["INFORME DECTO 460/22", INFORME_DECTO_460],
    ["INFORME DECRETO 460/22", INFORME_DECTO_460],
  ]);

  function normalizar(valor) {
    return String(valor || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, " ")
      .trim()
      .toUpperCase();
  }

  function getEl(id) {
    return document.getElementById(id);
  }

  function getSelectTipo() {
    return getEl("tipo");
  }

  function getSelectTipoInforme() {
    return getEl("tipoInforme");
  }

  function getBloqueInformeSelector() {
    return getEl("bloqueInformeSelector");
  }

  function optionCoincide(option, valorNormalizado) {
    return normalizar(option?.value) === valorNormalizado ||
      normalizar(option?.textContent) === valorNormalizado;
  }

  function asegurarOpcion(select, value, text) {
    if (!select) return null;

    const valorBuscado = normalizar(value);
    let existente = Array.from(select.options || []).find((opt) => optionCoincide(opt, valorBuscado));

    if (existente) {
      existente.value = value;
      existente.textContent = text;
      return existente;
    }

    const option = document.createElement("option");
    option.value = value;
    option.textContent = text;

    if (select.options && select.options.length > 0) {
      select.insertBefore(option, select.options[1] || null);
    } else {
      select.appendChild(option);
    }

    return option;
  }

  function asegurarInformesEnSelectorPrincipal() {
    const selTipo = getSelectTipo();
    if (!selTipo) return null;
    return asegurarOpcion(selTipo, TIPO_INFORMES, "INFORMES");
  }

  function quitarControlSuperiorDelSelectorPrincipal() {
    const selTipo = getSelectTipo();
    if (!selTipo) return 0;

    let removidas = 0;
    Array.from(selTipo.options || []).forEach((option) => {
      if (!optionCoincide(option, INFORME_CONTROL_SUPERIOR)) return;
      option.remove();
      removidas += 1;
    });

    return removidas;
  }

  function normalizarValorInforme(value) {
    const clean = normalizar(value);
    return ALIASES_INFORMES.get(clean) || String(value || "").trim();
  }

  function asegurarOpcionesInformes() {
    const tipoInforme = getSelectTipoInforme();
    if (!tipoInforme) return [];

    const opciones = [];

    INFORMES_DISPONIBLES.forEach((info) => {
      const opt = asegurarOpcion(tipoInforme, info.value, info.text);
      if (opt) opciones.push(opt.value);
    });

    // Normaliza opciones viejas si existieran, por ejemplo "INFORME DECRETO 460/22".
    Array.from(tipoInforme.options || []).forEach((option) => {
      const normalizado = normalizarValorInforme(option.value || option.textContent);
      const oficial = INFORMES_DISPONIBLES.find((x) => x.value === normalizado);
      if (!oficial) return;
      option.value = oficial.value;
      option.textContent = oficial.text;
    });

    return opciones;
  }

  function estaEnMenuInformes() {
    return getSelectTipo()?.value === TIPO_INFORMES;
  }

  function getTipoInformeActivo() {
    const selTipo = getSelectTipo();
    const tipoInforme = getSelectTipoInforme();

    if (estaEnMenuInformes()) {
      return normalizarValorInforme(tipoInforme?.value || "");
    }

    // Compatibilidad legacy: si alguna pantalla vieja dejara el informe como valor principal.
    return normalizarValorInforme(selTipo?.value || "");
  }

  function esControlSuperiorActivo() {
    return getTipoInformeActivo() === INFORME_CONTROL_SUPERIOR;
  }

  function esInformeAlcoholemiaActivo() {
    return getTipoInformeActivo() === INFORME_ALCOHOLEMIA;
  }

  function esInformeDecto460Activo() {
    return getTipoInformeActivo() === INFORME_DECTO_460;
  }

  function setSelectorInformesVisible(visible) {
    const bloque = getBloqueInformeSelector();
    const tipoInforme = getSelectTipoInforme();

    if (bloque) bloque.classList.toggle("hidden", !visible);

    // Mantiene el comportamiento legacy del wsp.js: si sale de INFORMES, se limpia la opción interna.
    if (!visible && tipoInforme) tipoInforme.value = "";
  }

  function seleccionarInforme(tipo, { dispararEventos = true } = {}) {
    const selTipo = getSelectTipo();
    const tipoInforme = getSelectTipoInforme();
    if (!selTipo || !tipoInforme) return false;

    asegurarSelectoresInformes();

    const tipoNormalizado = normalizarValorInforme(tipo);
    const existe = Array.from(tipoInforme.options || []).some((opt) => opt.value === tipoNormalizado);
    if (!existe) return false;

    selTipo.value = TIPO_INFORMES;
    tipoInforme.value = tipoNormalizado;
    setSelectorInformesVisible(true);

    if (dispararEventos) {
      selTipo.dispatchEvent(new Event("change", { bubbles: true }));
      tipoInforme.dispatchEvent(new Event("change", { bubbles: true }));
      emitirCambio();
    }

    return true;
  }

  function emitirCambio() {
    const detail = diagnosticar();
    try {
      window.dispatchEvent(new CustomEvent("wsp:informes-cambio", { detail }));
    } catch {}
    return detail;
  }

  function instalarEventos() {
    const selTipo = getSelectTipo();
    const tipoInforme = getSelectTipoInforme();

    if (selTipo && !selTipo.__wspInformesBind) {
      selTipo.__wspInformesBind = true;
      selTipo.addEventListener("change", () => {
        asegurarSelectoresInformes();
        emitirCambio();
      }, true);
    }

    if (tipoInforme && !tipoInforme.__wspInformesBind) {
      tipoInforme.__wspInformesBind = true;
      tipoInforme.addEventListener("change", () => {
        const normalizado = normalizarValorInforme(tipoInforme.value);
        if (normalizado && normalizado !== tipoInforme.value) tipoInforme.value = normalizado;
        emitirCambio();
      }, true);
    }
  }

  function asegurarSelectoresInformes() {
    try {
      if (window.WSP?.ui?.selector && typeof window.WSP.ui.selector.normalizarSelectorInformes === "function") {
        window.WSP.ui.selector.normalizarSelectorInformes();
      }
    } catch (e) {
      console.warn("[WSP informes] No se pudo ejecutar normalizarSelectorInformes.", e);
    }

    asegurarInformesEnSelectorPrincipal();
    asegurarOpcionesInformes();
    quitarControlSuperiorDelSelectorPrincipal();

    return diagnosticar();
  }

  function diagnosticar() {
    const selTipo = getSelectTipo();
    const tipoInforme = getSelectTipoInforme();

    return {
      selectorPrincipal: selTipo?.value || "",
      tipoInforme: tipoInforme?.value || "",
      estaEnMenuInformes: estaEnMenuInformes(),
      tipoInformeActivo: getTipoInformeActivo(),
      controlSuperiorActivo: esControlSuperiorActivo(),
      alcoholemiaActivo: esInformeAlcoholemiaActivo(),
      decto460Activo: esInformeDecto460Activo(),
      opcionesInformes: Array.from(tipoInforme?.options || []).map((opt) => ({
        value: opt.value,
        text: opt.textContent,
      })),
      controlSuperiorEnSelectorPrincipal: !!Array.from(selTipo?.options || [])
        .find((opt) => optionCoincide(opt, INFORME_CONTROL_SUPERIOR)),
    };
  }

  function init() {
    const diagnostico = asegurarSelectoresInformes();
    instalarEventos();
    console.log("[WSP informes] cargado", diagnostico);
    return diagnostico;
  }

  window.WSP.ui.informes = {
    TIPO_INFORMES,
    INFORME_CONTROL_SUPERIOR,
    INFORME_ALCOHOLEMIA,
    INFORME_DECTO_460,
    INFORMES_DISPONIBLES,
    normalizar,
    normalizarValorInforme,
    asegurarSelectoresInformes,
    asegurarOpcionesInformes,
    estaEnMenuInformes,
    getTipoInformeActivo,
    esControlSuperiorActivo,
    esInformeAlcoholemiaActivo,
    esInformeDecto460Activo,
    setSelectorInformesVisible,
    seleccionarInforme,
    diagnosticar,
    emitirCambio,
    init,
  };

  init();
})();
