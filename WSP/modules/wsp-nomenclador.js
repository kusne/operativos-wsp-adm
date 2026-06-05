(function () {
  "use strict";

  window.WSP = window.WSP || {};
  window.WSP.services = window.WSP.services || {};

  function normalizarCodigo(codigo) {
    return String(codigo || "").replace(/\D+/g, "").trim();
  }

  function limpiarDescripcion(txt) {
    return String(txt || "")
      .replace(/^[\s:;,.–—-]+/, "")
      .replace(/\s*[:;,.–—-]\s*/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function extraerReferenciaDesdeItem(item, fallback = "") {
    if (!item) return limpiarDescripcion(fallback || "");

    if (typeof item === "string") {
      return limpiarDescripcion(item) || limpiarDescripcion(fallback || "");
    }

    if (typeof item === "object") {
      const candidatos = [
        item.descripcion,
        item.referencia,
        item.texto,
        item.nombre,
        item.falta,
        item.detalle,
        item.label,
      ];

      for (const candidato of candidatos) {
        const clean = limpiarDescripcion(candidato || "");
        if (clean) return clean;
      }
    }

    return limpiarDescripcion(fallback || "");
  }

  function obtenerFuentesObjeto() {
    return [
      window.NOMENCLADOR_CODIGOS,
      window.NOMENCLADOR,
      window.nomenclador,
      window.BMZCN?.NOMENCLADOR_CODIGOS,
      window.BMZCN?.nomenclador,
      window.WSP?.nomenclador,
      window.WSP?.NOMENCLADOR_CODIGOS,
    ].filter(Boolean);
  }

  function obtenerItem(codigo) {
    const codigoLimpio = normalizarCodigo(codigo);
    if (!codigoLimpio) return null;

    try {
      if (typeof window.getNomencladorFalta === "function") {
        const item = window.getNomencladorFalta(codigoLimpio);
        if (item) return item;
      }
    } catch (e) {
      console.warn("[WSP nomenclador] Error en getNomencladorFalta.", e);
    }

    for (const fuente of obtenerFuentesObjeto()) {
      try {
        if (fuente instanceof Map) {
          const item = fuente.get(codigoLimpio) || fuente.get(String(Number(codigoLimpio)));
          if (item) return item;
          continue;
        }

        if (Array.isArray(fuente)) {
          const item = fuente.find((x) => {
            const c = normalizarCodigo(x?.codigo || x?.cod || x?.id || x?.numero || "");
            return c === codigoLimpio || c === String(Number(codigoLimpio));
          });
          if (item) return item;
          continue;
        }

        if (typeof fuente === "object") {
          const item = fuente[codigoLimpio] || fuente[String(Number(codigoLimpio))];
          if (item) return item;
        }
      } catch (e) {
        console.warn("[WSP nomenclador] Error leyendo fuente objeto.", e);
      }
    }

    return null;
  }

  function obtenerReferencia(codigo, fallback = "") {
    const codigoLimpio = normalizarCodigo(codigo);
    const fallbackLimpio = limpiarDescripcion(fallback || "");
    if (!codigoLimpio) return fallbackLimpio;

    try {
      if (typeof window.getReferenciaFalta === "function") {
        const ref = limpiarDescripcion(window.getReferenciaFalta(codigoLimpio, fallbackLimpio || ""));
        if (ref) return ref;
      }
    } catch (e) {
      console.warn("[WSP nomenclador] Error en getReferenciaFalta.", e);
    }

    return extraerReferenciaDesdeItem(obtenerItem(codigoLimpio), fallbackLimpio);
  }

  function existeCodigo(codigo) {
    const codigoLimpio = normalizarCodigo(codigo);
    if (!codigoLimpio) return false;
    return !!obtenerReferencia(codigoLimpio, "");
  }

  function listarCodigos() {
    const out = new Set();

    for (const fuente of obtenerFuentesObjeto()) {
      try {
        if (fuente instanceof Map) {
          fuente.forEach((_, key) => {
            const clean = normalizarCodigo(key);
            if (clean) out.add(clean);
          });
          continue;
        }

        if (Array.isArray(fuente)) {
          fuente.forEach((item) => {
            const clean = normalizarCodigo(item?.codigo || item?.cod || item?.id || item?.numero || "");
            if (clean) out.add(clean);
          });
          continue;
        }

        if (typeof fuente === "object") {
          Object.keys(fuente).forEach((key) => {
            const clean = normalizarCodigo(key);
            if (clean) out.add(clean);
          });
        }
      } catch {}
    }

    return Array.from(out).sort((a, b) => Number(a) - Number(b));
  }

  function diagnosticar(codigoPrueba = "13018") {
    const codigo = normalizarCodigo(codigoPrueba);
    return {
      getReferenciaFalta: typeof window.getReferenciaFalta,
      getNomencladorFalta: typeof window.getNomencladorFalta,
      NOMENCLADOR_CODIGOS: !!window.NOMENCLADOR_CODIGOS,
      cantidadCodigosDetectados: listarCodigos().length,
      codigoPrueba: codigo,
      referenciaPrueba: obtenerReferencia(codigo, ""),
      existePrueba: existeCodigo(codigo),
    };
  }

  window.WSP.services.nomenclador = {
    normalizarCodigo,
    limpiarDescripcion,
    extraerReferenciaDesdeItem,
    obtenerItem,
    obtenerReferencia,
    existeCodigo,
    listarCodigos,
    diagnosticar,
  };

  console.log("[WSP nomenclador] cargado", diagnosticar("13018"));
})();
