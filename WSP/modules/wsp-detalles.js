(function () {
  "use strict";

  window.WSP = window.WSP || {};
  window.WSP.services = window.WSP.services || {};

  const detallesAutocompletadoState = new WeakMap();
  const detallesEdicionState = new WeakMap();

  function normalizarBasicoSinAcentos(txt) {
    return String(txt || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();
  }

  function limpiarTextoSimple(txt) {
    return String(txt || "")
      .replace(/\s+/g, " ")
      .trim();
  }

  function leerEnteroNoNegativo(valor) {
    const ui = window.WSP?.ui?.helpers;
    if (ui && typeof ui.leerEnteroNoNegativo === "function") return ui.leerEnteroNoNegativo(valor);
    const n = parseInt(String(valor ?? "").trim(), 10);
    return Number.isFinite(n) && n > 0 ? n : 0;
  }

  function formatearCantidad(n) {
    const ui = window.WSP?.ui?.helpers;
    if (ui && typeof ui.formatearCantidad === "function") return ui.formatearCantidad(n);
    const v = Math.max(0, parseInt(n, 10) || 0);
    return String(v).padStart(2, "0");
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

  function limpiarMarcaOrigenVisualDetalle(texto) {
    return String(texto || "")
      .replace(/\s*>\s*(?:del\s+)?(?:460\/22|4060\/22|alcoholemia|informe)\s*$/i, "")
      .trim();
  }

  function limpiarDescripcionDetalle(txt) {
    return String(txt || "")
      .replace(/^[\s:;,.–—-]+/, "")
      .replace(/\s*[:;,.–—-]\s*/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function obtenerServicioNomencladorWsp() {
    return window.WSP?.services?.nomenclador || null;
  }

  function extraerReferenciaDesdeObjetoNomenclador(item, fallback = "") {
    if (!item) return fallback;

    if (typeof item === "string") return limpiarDescripcionDetalle(item) || fallback;

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
        const clean = limpiarDescripcionDetalle(candidato || "");
        if (clean) return clean;
      }
    }

    return fallback;
  }

  function obtenerReferenciaNomenclador(codigo, fallback = "") {
    const codigoLimpio = String(codigo || "").replace(/\D+/g, "");
    const fallbackLimpio = limpiarDescripcionDetalle(fallback || "");
    if (!codigoLimpio || codigoLimpio === "17117") return fallbackLimpio;

    const svcNomenclador = obtenerServicioNomencladorWsp();
    if (svcNomenclador && typeof svcNomenclador.obtenerReferencia === "function") {
      try {
        const refServicio = limpiarDescripcionDetalle(svcNomenclador.obtenerReferencia(codigoLimpio, fallbackLimpio || ""));
        if (refServicio) return refServicio;
      } catch (e) {
        console.warn("[WSP detalles] No se pudo leer referencia desde servicio nomenclador.", e);
      }
    }

    const fuentesObjeto = [
      () => window.NOMENCLADOR_CODIGOS,
      () => window.NOMENCLADOR,
      () => window.nomenclador,
      () => window.BMZCN?.NOMENCLADOR_CODIGOS,
      () => window.BMZCN?.nomenclador,
      () => window.WSP?.nomenclador,
      () => window.WSP?.NOMENCLADOR_CODIGOS,
    ];

    try {
      if (typeof window !== "undefined" && typeof window.getReferenciaFalta === "function") {
        const ref = limpiarDescripcionDetalle(window.getReferenciaFalta(codigoLimpio, fallbackLimpio || ""));
        if (ref) return ref;
      }
    } catch {}

    try {
      if (typeof window !== "undefined" && typeof window.getNomencladorFalta === "function") {
        const item = window.getNomencladorFalta(codigoLimpio);
        const ref = extraerReferenciaDesdeObjetoNomenclador(item, "");
        if (ref) return ref;
      }
    } catch {}

    for (const obtenerFuente of fuentesObjeto) {
      try {
        const fuente = obtenerFuente();
        if (!fuente) continue;
        const item = fuente[codigoLimpio] || fuente[String(Number(codigoLimpio))];
        const ref = extraerReferenciaDesdeObjetoNomenclador(item, "");
        if (ref) return ref;
      } catch {}
    }

    return fallbackLimpio;
  }

  function codigoExisteEnNomenclador(codigo) {
    const codigoLimpio = String(codigo || "").replace(/\D+/g, "");
    if (!codigoLimpio) return false;
    // 460/22 es procedimiento/contador, no detalle de infracción común.
    // Se autocompleta por caso especial y recién al enviar pasa a Observaciones.
    if (codigoLimpio === "460" || codigoLimpio === "46022" || codigoLimpio === "22") return false;

    const svcNomenclador = obtenerServicioNomencladorWsp();
    if (svcNomenclador && typeof svcNomenclador.existeCodigo === "function") {
      try {
        if (svcNomenclador.existeCodigo(codigoLimpio)) return true;
      } catch {}
    }

    const ref = obtenerReferenciaNomenclador(codigoLimpio, "");
    return !!limpiarDescripcionDetalle(ref);
  }

  function codigosInvalidosNomenclador(codigos) {
    return (Array.isArray(codigos) ? codigos : [])
      .map((c) => String(c || "").replace(/\D+/g, ""))
      .filter(Boolean)
      .filter((codigo, idx, arr) => arr.indexOf(codigo) === idx)
      .filter((codigo) => !codigoExisteEnNomenclador(codigo));
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

  function extraerNumeralResultadoFlexible(valor) {
    const raw = String(valor ?? "").replace(/\r/g, "").trim();
    if (!raw) return 0;

    let m = raw.match(/\(\s*(\d{1,3})\s*\)/);
    if (m) return leerEnteroNoNegativo(m[1]);

    if (/^\d+\s*$/.test(raw)) return leerEnteroNoNegativo(raw);

    m = raw.match(/^\s*(\d{1,3})\s+(?=\S)/);
    if (m) return leerEnteroNoNegativo(m[1]);

    m = raw.match(/[\s:;=\-–—](\d{1,3})\s*$/);
    if (m) return leerEnteroNoNegativo(m[1]);

    return 0;
  }

  function extraerNumeralDto460Resultado(valor) {
    const raw = String(valor ?? "").replace(/\r/g, "").trim();
    if (!raw || !esReferenciaDecreto460(raw)) return 0;

    const probe = normalizarBasicoSinAcentos(raw)
      .replace(/[.\-_]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    // Evita interpretar "460/22" o "460 22" como cantidad 22 cuando no hay numeral operativo.
    if (/^(?:dto|dcto|decreto|dec)?\s*460\s*(?:\/|\s)?\s*22$/.test(probe) || /^460$/.test(probe)) {
      return 0;
    }

    let m = raw.match(/\(\s*(\d{1,3})\s*\)/);
    if (m) return leerEnteroNoNegativo(m[1]);

    m = raw.match(/^\s*(\d{1,3})\s+(?=.*\b460\b)/i);
    if (m) return leerEnteroNoNegativo(m[1]);

    m = raw.match(/(?:^|[\s:;=\-–—])(\d{1,3})\s*$/);
    if (m) {
      const cantidad = leerEnteroNoNegativo(m[1]);
      if (cantidad && cantidad !== 22 && cantidad !== 460) return cantidad;
    }

    return 0;
  }

  function leerResultadoCampo(id) {
    const el = document.getElementById(id);
    const raw = String(el?.value ?? "");
    const valor = extraerNumeralResultadoFlexible(raw);
    const cantidad460 = extraerNumeralDto460Resultado(raw);

    return {
      valor,
      raw,
      observacion460: cantidad460 > 0 ? construirObservacionDecreto460(cantidad460) : "",
    };
  }

  function obtenerCodigoDetalleInicialNoProcedimiento460(linea) {
    const s = String(linea || "").replace(/\r/g, "").trim();
    if (!s) return "";

    const patrones = [
      /^\(\s*\d{1,3}\s*\)\s*(\d{3,5})(?:\s*\/\s*22)?\b/i,
      /^\d{1,3}\s*[-–—]\s*(\d{3,5})(?:\s*\/\s*22)?\b/i,
      /^\d{1,3}\s+(\d{3,5})(?:\s*\/\s*22)?\b/i,
      /^(\d{3,5})(?:\s*\/\s*22)?\b/i,
    ];

    for (const regex of patrones) {
      const m = s.match(regex);
      const codigo = String(m?.[1] || "").replace(/\D+/g, "");
      if (!codigo) continue;
      if (codigo === "460" || codigo === "46022" || codigo === "22") return "";
      return codigo;
    }

    return "";
  }

  function normalizarDetalleDecreto460(linea, { paraAutocompletar = false } = {}) {
    let s = String(linea || "").replace(/\r/g, "").trim();
    if (!s) return null;

    s = s.replace(/\s+/g, " ").trim();

    // Si la línea es un detalle real con referencia visual de origen
    // ej. "(02) 9119 sin habilitación > del 460/22", NO debe
    // reinterpretarse como procedimiento 460/22. La referencia es solo visual.
    if (obtenerCodigoDetalleInicialNoProcedimiento460(s)) return null;

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

  function analizarLineaDetalle460ParaAutocompletar(linea) {
    const item460 = normalizarDetalleDecreto460(linea, { paraAutocompletar: true });
    if (!item460 || !item460.textoAutocompletar) return null;

    const texto = item460.textoAutocompletar;
    const idxCodigo = texto.indexOf("460/22");

    return {
      texto,
      codigo: "460",
      descripcion: limpiarDescripcionDetalle(item460.descripcion || "Decreto 460/22"),
      cursorDespuesCodigo: idxCodigo >= 0 ? idxCodigo + "460/22".length : texto.length,
      procedimiento460: true,
    };
  }

  function autocompletarLineaDetalleConNomenclador(linea) {
    const original = String(linea || "").replace(/\r/g, "");
    const s = original.trim();
    if (!s) return original;

    // Caso especial 460/22:
    // Se muestra y se autocompleta en Detalles durante la carga,
    // pero al generar/enviar el informe se normaliza y pasa a Observaciones.
    const analisis460 = analizarLineaDetalle460ParaAutocompletar(s);
    if (analisis460?.texto) return analisis460.texto;

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

    // Caso especial 460/22:
    // Se autocompleta visualmente y deja el cursor en el renglón inferior,
    // pero normalizarDetallesTexto() lo mueve a Observaciones al generar/enviar.
    const analisis460 = analizarLineaDetalle460ParaAutocompletar(s);
    if (analisis460?.texto) return analisis460;

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

  function obtenerOrigenVisualDetalle(linea) {
    const m = String(linea || "").match(/\s*>\s*(.+?)\s*$/i);
    if (!m) return "";
    const raw = limpiarTextoSimple(m[1] || "");
    if (/460\s*\/\s*22|4060\s*\/\s*22|\b460\b/i.test(raw)) return "del 460/22";
    if (/alcoholemia/i.test(raw)) return "alcoholemia";
    return raw;
  }

  function consolidarDetallesVisualesTextarea(lineas, { preservarVacias = false } = {}) {
    const originales = Array.isArray(lineas) ? lineas.map((x) => String(x ?? "")) : [];
    const grupos = new Map();
    const orden = [];
    const otras = [];

    originales.forEach((linea, idx) => {
      const visual = String(linea || "").trim();
      if (!visual) {
        otras.push({ idx, texto: linea, vacia: true });
        return;
      }

      const origen = obtenerOrigenVisualDetalle(visual);
      const limpio = limpiarMarcaOrigenVisualDetalle(visual);
      const item = normalizarLineaDetalle(limpio);

      // Los procedimientos 460/22 no son detalles de infracción, pero NO deben
      // borrarse del cuadro mientras el usuario escribe. Se mantienen visibles
      // y recién al generar el informe se transforman en Observaciones.
      if (item?.tipo === "procedimiento460") {
        otras.push({ idx, texto: linea, vacia: false });
        return;
      }

      if (!item || item.tipo !== "detalle") {
        otras.push({ idx, texto: linea, vacia: false });
        return;
      }

      const codigo = String(item.codigo || "").replace(/\D+/g, "");
      if (!codigo || !codigoExisteEnNomenclador(codigo)) {
        otras.push({ idx, texto: linea, vacia: false });
        return;
      }

      if (!grupos.has(codigo)) {
        grupos.set(codigo, {
          idx,
          codigo,
          cantidad: 0,
          descripcion: obtenerReferenciaNomenclador(codigo, item.descripcion || "") || item.descripcion || "INFRACCIÓN",
          origenes: new Set(),
          tieneManual: false,
        });
        orden.push(codigo);
      }

      const grupo = grupos.get(codigo);
      grupo.cantidad += Math.max(1, leerEnteroNoNegativo(item.cantidad || 1));
      if (!grupo.descripcion && item.descripcion) grupo.descripcion = item.descripcion;
      if (origen) grupo.origenes.add(origen);
      else grupo.tieneManual = true;
    });

    const reconstruidas = orden.map((codigo) => {
      const grupo = grupos.get(codigo);
      const descripcion = obtenerReferenciaNomenclador(grupo.codigo, grupo.descripcion) || grupo.descripcion || "INFRACCIÓN";
      let texto = reconstruirLineaDetalle(grupo.cantidad, grupo.codigo, descripcion) || `(${formatearCantidad(grupo.cantidad)}) ${grupo.codigo} ${descripcion}`;

      // Si solo vino de informes, conservar la referencia para saber el origen.
      // Si el usuario agregó manualmente el mismo código, se fusiona y se quita
      // la referencia visual porque ya es un total mixto/manual.
      if (!grupo.tieneManual && grupo.origenes.size === 1) {
        texto += ` > ${Array.from(grupo.origenes)[0]}`;
      }
      return { idx: grupo.idx, texto };
    });

    const salida = [
      ...reconstruidas,
      ...(preservarVacias ? otras : otras.filter((x) => !x.vacia)),
    ]
      .sort((a, b) => a.idx - b.idx)
      .map((x) => x.texto);

    const antes = originales.map((x) => String(x || "").trim()).filter(Boolean).join("\n");
    const despues = salida.map((x) => String(x || "").trim()).filter(Boolean).join("\n");
    return { lineas: salida, changed: antes !== despues };
  }

  function aplicarAutocompletadoDetalles(textarea, { forzar = false, saltarLinea = !forzar } = {}) {
    if (!textarea) return;

    /*
      Regla WSP Detalles:
      - El autocompletado debe actuar cuando el usuario escribe un código.
      - Si el usuario está borrando con Backspace o Delete, NO debe reconstruir la línea
        ni volver a bajar el cursor automáticamente.
      - Durante el borrado se deja trabajar al comportamiento nativo del textarea:
        carácter por carácter, uno a uno.
    */
    const estadoEdicion = detallesEdicionState.get(textarea);
    if (!forzar && estadoEdicion?.suprimirAutocompletadoHasta && Date.now() < estadoEdicion.suprimirAutocompletadoHasta) {
      return;
    }

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
    let lineaParaSaltar = -1;

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
          /*
            Regla WSP Detalles:
            - Al escribir un código y autocompletar desde el nomenclador, no dejar el cursor
              detrás del código porque al presionar Enter se parte la línea y se copia abajo
              la descripción autocompletada.
            - El cursor debe quedar directamente en el renglón siguiente, listo para otro código.
            - En blur/forzar se conserva el comportamiento seguro de no insertar renglones nuevos.
          */
          if (saltarLinea && linea !== analisis.texto) {
            lineaParaSaltar = idx;
          } else {
            cursorNuevo = longitudHastaLinea(lineasNuevas, idx) + analisis.cursorDespuesCodigo;
          }
        }
        return;
      }

      lineasNuevas.push(linea);
      metasNuevas[idx] = null;
    });

    if (lineaParaSaltar >= 0) {
      const siguiente = lineasNuevas[lineaParaSaltar + 1];
      if (siguiente === undefined || String(siguiente).trim() !== "") {
        lineasNuevas.splice(lineaParaSaltar + 1, 0, "");
        metasNuevas.splice(lineaParaSaltar + 1, 0, null);
      }
      cursorNuevo = longitudHastaLinea(lineasNuevas, lineaParaSaltar + 1);
    }

    const consolidadoVisual = consolidarDetallesVisualesTextarea(lineasNuevas, {
      // Mientras el usuario escribe, no borrar la línea vacía creada para seguir cargando códigos.
      // En blur/forzar sí se limpia para que el texto final quede prolijo.
      preservarVacias: !forzar,
    });
    const lineasFinales = consolidadoVisual.lineas;
    if (consolidadoVisual.changed && cursorNuevo == null) {
      cursorNuevo = lineasFinales.join("\n").length;
    }

    const valorNuevo = lineasFinales.join("\n");
    detallesAutocompletadoState.set(textarea, consolidadoVisual.changed ? [] : metasNuevas);

    if (valorNuevo === valorOriginal) {
      if (cursorNuevo != null) {
        try {
          textarea.setSelectionRange(cursorNuevo, cursorNuevo);
        } catch {}
      }
      return;
    }

    textarea.value = valorNuevo;

    try {
      if (cursorNuevo != null) {
        textarea.setSelectionRange(cursorNuevo, cursorNuevo);
      } else {
        const lineaActual = Math.min(cursorOriginal.linea, lineasFinales.length - 1);
        const base = longitudHastaLinea(lineasFinales, lineaActual);
        const columna = Math.min(cursorOriginal.columna, String(lineasFinales[lineaActual] || "").length);
        const pos = Math.max(0, Math.min(valorNuevo.length, base + columna));
        textarea.setSelectionRange(pos, pos);
      }
    } catch {}
  }
  
  function normalizarLineaDetalle(linea) {
    let s = String(linea || "").replace(/\r/g, "").trim();
    if (!s) return null;

    // Las referencias visuales de origen de informes intermedios
    // (> 460/22, > alcoholemia) no deben imprimirse ni guardarse
    // como parte real del detalle.
    s = limpiarMarcaOrigenVisualDetalle(s);
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

      const cantidadNumero = patron.conCantidad ? leerEnteroNoNegativo(m[1]) : 1;
      const cantidad = formatearCantidad(cantidadNumero);
      const codigo = String(patron.conCantidad ? m[2] : m[1]).replace(/\D+/g, "");
      const descripcionIngresada = patron.conCantidad ? m[3] : m[2];
      const descripcion = obtenerReferenciaNomenclador(codigo, limpiarDescripcionDetalle(descripcionIngresada));

      if (!descripcion) continue;

      return {
        tipo: "detalle",
        codigo,
        cantidad: cantidadNumero,
        descripcion,
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

    const detallesAgrupados = new Map();
    const detallesSinCodigo = [];
    const observaciones = [];
    const detalleItems = [];

    limpio.split("\n").forEach((linea) => {
      const item = normalizarLineaDetalle(linea);
      if (!item || !item.texto) return;

      if (item.tipo === "detalle") {
        const codigo = String(item.codigo || "").replace(/\D+/g, "");
        const cantidad = Math.max(1, leerEnteroNoNegativo(item.cantidad || 1));

        if (codigo) {
          if (!detallesAgrupados.has(codigo)) {
            detallesAgrupados.set(codigo, {
              codigo,
              cantidad: 0,
              descripcion: limpiarDescripcionDetalle(item.descripcion || ""),
            });
          }

          const grupo = detallesAgrupados.get(codigo);
          grupo.cantidad += cantidad;

          if (!grupo.descripcion && item.descripcion) {
            grupo.descripcion = limpiarDescripcionDetalle(item.descripcion);
          }
        } else {
          detallesSinCodigo.push(item.texto);
        }

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

    const detalles = [
      ...Array.from(detallesAgrupados.values()).map((grupo) => {
        const descripcion = obtenerReferenciaNomenclador(grupo.codigo, grupo.descripcion) || grupo.descripcion;
        return reconstruirLineaDetalle(grupo.cantidad, grupo.codigo, descripcion);
      }).filter(Boolean),
      ...detallesSinCodigo,
    ];

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



  function lineaPareceDetalleAutocompletadoParaBorrar(linea) {
    const clean = String(linea || "").replace(/\r/g, "").trim();
    if (!clean) return false;

    const item = normalizarLineaDetalle(clean);
    if (item && (item.tipo === "detalle" || item.tipo === "procedimiento460")) return true;

    const analisis = analizarLineaDetalleParaAutocompletar(clean);
    return !!(analisis && analisis.texto);
  }

  function manejarRetrocesoDetalleAutocompletado(event) {
    if (!event || (event.key !== "Backspace" && event.key !== "Delete")) return false;

    const textarea = event.target && event.target.id === "detalles" ? event.target : null;
    if (!textarea) return false;

    /*
      No se cancela la tecla y no se borra una línea completa.
      Solo se marca que el próximo input viene de una acción de borrado para que
      aplicarAutocompletadoDetalles() no rearme la línea ni mande el cursor abajo.
      El navegador queda libre para borrar carácter por carácter.
    */
    detallesEdicionState.set(textarea, {
      tecla: event.key,
      suprimirAutocompletadoHasta: Date.now() + 350,
    });

    return false;
  }

  function vincularRetrocesoDetalles() {
    const textarea = document.getElementById("detalles");
    if (!textarea || textarea.__wspDetallesBackspaceBound) return;
    textarea.__wspDetallesBackspaceBound = true;
    textarea.addEventListener("keydown", manejarRetrocesoDetalleAutocompletado, true);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", vincularRetrocesoDetalles, { once: true });
  } else {
    vincularRetrocesoDetalles();
  }

  document.addEventListener("focusin", (event) => {
    if (event.target && event.target.id === "detalles") vincularRetrocesoDetalles();
  });

  window.WSP.services.detalles = {
    limpiarMarcaOrigenVisualDetalle,
    limpiarDescripcionDetalle,
    obtenerReferenciaNomenclador,
    codigoExisteEnNomenclador,
    codigosInvalidosNomenclador,
    reconstruirLineaDetalle,
    esReferenciaDecreto460,
    construirObservacionDecreto460,
    extraerNumeralResultadoFlexible,
    extraerNumeralDto460Resultado,
    leerResultadoCampo,
    obtenerCodigoDetalleInicialNoProcedimiento460,
    normalizarDetalleDecreto460,
    analizarLineaDetalle460ParaAutocompletar,
    autocompletarLineaDetalleConNomenclador,
    analizarLineaDetalleParaAutocompletar,
    autocompletarDetallesDesdeNomenclador,
    obtenerCodigoActualLineaDetalle,
    limpiarDescripcionAutocompletadaObsoleta,
    calcularLineaYColumnaDesdePosicion,
    longitudHastaLinea,
    obtenerOrigenVisualDetalle,
    consolidarDetallesVisualesTextarea,
    aplicarAutocompletadoDetalles,
    lineaPareceDetalleAutocompletadoParaBorrar,
    manejarRetrocesoDetalleAutocompletado,
    vincularRetrocesoDetalles,
    normalizarLineaDetalle,
    normalizarDetallesTexto,
    validarDetallesRequeridosPorActas
  };

  console.log("[WSP detalles] cargado - borrado caracter a caracter corregido");
})();
