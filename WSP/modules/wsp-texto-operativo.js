(function () {
  "use strict";

  window.WSP = window.WSP || {};
  window.WSP.modules = window.WSP.modules || {};

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

  function normalizarComparacion(txt) {
    return normalizarBasicoSinAcentos(txt).replace(/[^a-z0-9]+/g, "");
  }

  function capitalizarBasico(txt) {
    return limpiarTextoSimple(txt)
      .toLowerCase()
      .replace(/\b\w/g, (l) => l.toUpperCase());
  }

  function normalizarTituloOperativo(txt) {
    if (!txt) return "";

    let t = capitalizarBasico(txt);
    t = t.replace(/\b(o\.?\s*op\.?|op)\s*0*(\d+\/\d+)\b/i, "O.Op. $2");

    return t;
  }

  function normalizarLugar(txt) {
    if (!txt) return "";
    return capitalizarBasico(txt);
  }

  function normalizarHorario(txt) {
    if (!txt) return "";

    let t = String(txt || "").toLowerCase().replace(/\s+/g, " ").trim();
    t = t.replace(/\bfinalizar\b/g, "Finalizar");

    return t;
  }

  function bold(txt) {
    return `*${String(txt || "").trim()}*`;
  }

  function normalizarMayus(value) {
    return limpiarTextoSimple(value || "").toUpperCase();
  }

  function normalizarMayusInput(value) {
    // Para escritura en vivo: no usar trim(), porque si el usuario escribe
    // "QUISPE " se borra el espacio final y parece que el campo no permite
    // separar nombre/apellido o marca/modelo. El recorte se hace en blur/envío.
    return String(value || "")
      .replace(/[–—]/g, "-")
      .toUpperCase();
  }

  function normalizarDominio(value) {
    return normalizarMayus(value).replace(/\s+/g, "");
  }

  function normalizarNumeroActa(value) {
    return String(value || "").replace(/\D+/g, "");
  }

  function normalizarGraduacion(value) {
    return String(value || "").replace(/\s+/g, "").replace(",", ".").trim();
  }

  function lineaDesdeArray(arr, sep) {
    const v = Array.isArray(arr) ? arr : [];
    return v.length ? v.join(" " + sep + " ") : "/";
  }

  function limpiarLineasTexto(value) {
    return String(value || "")
      .split(/\r?\n+/)
      .map((linea) => limpiarTextoSimple(linea))
      .filter(Boolean);
  }

  const api = {
    limpiarTextoSimple,
    normalizarBasicoSinAcentos,
    normalizarComparacion,
    capitalizarBasico,
    normalizarTituloOperativo,
    normalizarLugar,
    normalizarHorario,
    bold,
    normalizarMayus,
    normalizarMayusInput,
    normalizarDominio,
    normalizarNumeroActa,
    normalizarGraduacion,
    lineaDesdeArray,
    limpiarLineasTexto,
  };

  window.WSP.modules.textoOperativo = api;
  window.WSP.textoOperativo = api;

  console.log("[WSP texto operativo] cargado");
})();
