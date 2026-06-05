(function () {
  "use strict";

  window.WSP = window.WSP || {};
  window.WSP.modules = window.WSP.modules || {};
  window.WSP.forms = window.WSP.forms || {};

  const CLASES_ELEMENTOS_OPERATIVO = [
    ["ESCOPETA", "ESCOPETA"],
    ["HT", "HT"],
    ["PDA", "PDA"],
    ["IMPRESORA", "IMPRESORA"],
    ["Alometro", "Alometro"],
    ["Alcoholimetro", "Alcoholimetro"],
  ];

  function limpiarTextoSimple(txt) {
    const modTexto = window.WSP?.text?.operativo || window.WSP?.modules?.textoOperativo || null;
    if (modTexto && typeof modTexto.limpiarTextoSimple === "function") {
      return modTexto.limpiarTextoSimple(txt);
    }
    return String(txt || "").replace(/\s+/g, " ").trim();
  }

  function normalizarArrayTexto(arr) {
    return (Array.isArray(arr) ? arr : [])
      .map((v) => limpiarTextoSimple(v))
      .filter(Boolean);
  }

  function valoresSeleccionadosPorClase(clase) {
    if (!clase) return [];
    return Array.from(document.querySelectorAll("." + clase + ":checked"))
      .map((e) => e?.value || "")
      .filter((v) => String(v || "").trim());
  }

  function seleccion(clase) {
    return valoresSeleccionadosPorClase(clase).join("\n");
  }

  function seleccionLinea(clase, sep = "/") {
    const valores = valoresSeleccionadosPorClase(clase);
    return valores.length ? valores.join(" " + sep + " ") : "/";
  }

  function leerSeleccionPorClase(clase) {
    return valoresSeleccionadosPorClase(clase);
  }

  function lineaDesdeArray(arr, sep = "/") {
    const valores = normalizarArrayTexto(arr);
    return valores.length ? valores.join(" " + sep + " ") : "/";
  }

  function construirPayloadElementosActual() {
    return CLASES_ELEMENTOS_OPERATIVO.reduce((acc, [key, clase]) => {
      acc[key] = leerSeleccionPorClase(clase);
      return acc;
    }, {});
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

  function resolverPersonalOperativo({ esFinaliza = false, usarMismoPersonal = false, inicioCompartido = null } = {}) {
    const personalTexto = (esFinaliza || usarMismoPersonal)
      ? normalizarArrayTexto(inicioCompartido?.personal).join("\n")
      : seleccion("personal");

    if (!personalTexto) {
      return {
        ok: false,
        mensaje: esFinaliza
          ? "El INICIO guardado no tiene personal policial. Actualice primero el INICIO del operativo en curso."
          : "Debe seleccionar personal policial.",
        personalTexto: "",
      };
    }

    return { ok: true, personalTexto };
  }

  function resolverMovilidadOperativo({ esFinaliza = false, usarMismoMovil = false, inicioCompartido = null } = {}) {
    const mov = (esFinaliza || usarMismoMovil)
      ? lineaDesdeArray(inicioCompartido?.moviles, "/")
      : seleccionLinea("movil", "/");

    const mot = (esFinaliza || usarMismoMovil)
      ? lineaDesdeArray(inicioCompartido?.motos, "/")
      : seleccionLinea("moto", "/");

    if (mov === "/" && mot === "/") {
      return {
        ok: false,
        mensaje: esFinaliza
          ? "El INICIO guardado no tiene móvil ni moto. Actualice primero el INICIO del operativo en curso."
          : "Debe seleccionar al menos un móvil o moto.",
        mov,
        mot,
      };
    }

    return { ok: true, mov, mot };
  }

  function resolverElementosOperativo({ esFinaliza = false, usarMismosElementos = false, elementosInicio = null } = {}) {
    const usarElementosDesdeInicio = !!(esFinaliza || usarMismosElementos);

    if (usarElementosDesdeInicio && !elementosInicio) {
      return {
        ok: false,
        mensaje: esFinaliza
          ? "El INICIO guardado no tiene elementos. Actualice primero el INICIO del operativo en curso."
          : "No hay elementos guardados del INICIA. Destilde “mismos elementos” o envíe primero un INICIA.",
      };
    }

    const fuente = usarElementosDesdeInicio ? normalizarPayloadElementos(elementosInicio) : null;

    return {
      ok: true,
      usarElementosDesdeInicio,
      escopetasTXT: usarElementosDesdeInicio ? lineaDesdeArray(fuente.ESCOPETA, "/") : seleccionLinea("ESCOPETA", "/"),
      htTXT: usarElementosDesdeInicio ? lineaDesdeArray(fuente.HT, "/") : seleccionLinea("HT", "/"),
      pdaTXT: usarElementosDesdeInicio ? lineaDesdeArray(fuente.PDA, "/") : seleccionLinea("PDA", "/"),
      impTXT: usarElementosDesdeInicio ? lineaDesdeArray(fuente.IMPRESORA, "/") : seleccionLinea("IMPRESORA", "/"),
      alomTXT: usarElementosDesdeInicio ? lineaDesdeArray(fuente.Alometro, "/") : seleccionLinea("Alometro", "/"),
      alcoTXT: usarElementosDesdeInicio ? lineaDesdeArray(fuente.Alcoholimetro, "/") : seleccionLinea("Alcoholimetro", "/"),
    };
  }

  function resolverLecturaFormularioOperativo(ctx = {}) {
    const personal = resolverPersonalOperativo(ctx);
    if (!personal.ok) return personal;

    const movilidad = resolverMovilidadOperativo(ctx);
    if (!movilidad.ok) return movilidad;

    const elementos = resolverElementosOperativo(ctx);
    if (!elementos.ok) return elementos;

    return {
      ok: true,
      personalTexto: personal.personalTexto,
      mov: movilidad.mov,
      mot: movilidad.mot,
      usarElementosDesdeInicio: elementos.usarElementosDesdeInicio,
      escopetasTXT: elementos.escopetasTXT,
      htTXT: elementos.htTXT,
      pdaTXT: elementos.pdaTXT,
      impTXT: elementos.impTXT,
      alomTXT: elementos.alomTXT,
      alcoTXT: elementos.alcoTXT,
    };
  }

  const api = {
    valoresSeleccionadosPorClase,
    seleccion,
    seleccionLinea,
    leerSeleccionPorClase,
    lineaDesdeArray,
    normalizarArrayTexto,
    construirPayloadElementosActual,
    normalizarPayloadElementos,
    resolverPersonalOperativo,
    resolverMovilidadOperativo,
    resolverElementosOperativo,
    resolverLecturaFormularioOperativo,
  };

  window.WSP.modules.formularioOperativo = api;
  window.WSP.forms.operativo = api;

  console.log("[WSP formulario operativo] cargado");
})();
