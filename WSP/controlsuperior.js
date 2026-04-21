(function () {
  const JEFE_NOMBRE = "SubCrio Choque Jose Maria";
  const SUBJEFE_NOMBRE = "Inspector Tramontini Ismael";

  let refs = null;

  function qs(id) {
    return document.getElementById(id);
  }

  function ensureRefs() {
    if (refs) return refs;
    refs = {
      tipo: qs("tipo"),
      jefe: qs("controlSuperiorJefe"),
      subjefe: qs("controlSuperiorSubjefe"),
      otros: qs("controlSuperiorOtros"),
      otrosTextoWrap: qs("bloqueControlSuperiorOtrosTexto"),
      otrosTexto: qs("controlSuperiorOtrosTexto"),
      conMovil: qs("controlSuperiorConMovil"),
      seAcopla: qs("controlSuperiorSeAcopla"),
      bloque: qs("bloqueControlSuperior"),
    };
    return refs;
  }

  function normalizarModo(txt) {
    return String(txt || "")
      .trim()
      .replace(/\s+/g, " ")
      .toUpperCase();
  }

  function isActive() {
    const r = ensureRefs();
    const value = normalizarModo(r.tipo?.value);
    const selectedText = normalizarModo(r.tipo?.selectedOptions?.[0]?.textContent);
    return value === "CONTROL SUPERIOR" || selectedText === "CONTROL SUPERIOR";
  }

  function limpiarRolesExcepto(excepto) {
    const r = ensureRefs();
    [r.jefe, r.subjefe, r.otros].forEach((el) => {
      if (!el || el === excepto) return;
      el.checked = false;
    });
  }

  function getRolSeleccionado() {
    const r = ensureRefs();
    if (r.jefe?.checked) return "JEFE";
    if (r.subjefe?.checked) return "SUBJEFE";
    if (r.otros?.checked) return "OTROS";
    return "";
  }

  function syncOtros() {
    const r = ensureRefs();
    const mostrar = !!r.otros?.checked;
    if (r.otrosTextoWrap) r.otrosTextoWrap.classList.toggle("hidden", !mostrar);
    if (!mostrar && r.otrosTexto) r.otrosTexto.value = "";
  }

  function reset() {
    const r = ensureRefs();
    if (r.jefe) r.jefe.checked = false;
    if (r.subjefe) r.subjefe.checked = false;
    if (r.otros) r.otros.checked = false;
    if (r.conMovil) r.conMovil.checked = false;
    if (r.seAcopla) r.seAcopla.checked = false;
    if (r.otrosTexto) r.otrosTexto.value = "";
    syncOtros();
  }

  function getPayload() {
    const r = ensureRefs();
    return {
      activo: isActive(),
      rol: getRolSeleccionado(),
      otros: String(r.otrosTexto?.value || "").trim(),
      conMovil: !!r.conMovil?.checked,
      seAcopla: !!r.seAcopla?.checked,
    };
  }

  function obtenerNombreRol(payload) {
    if (payload.rol === "JEFE") return JEFE_NOMBRE;
    if (payload.rol === "SUBJEFE") return SUBJEFE_NOMBRE;
    return payload.otros || "otros";
  }

  function construirObservacion(payload, movilTexto) {
    const nombre = obtenerNombreRol(payload);
    const movil = String(movilTexto || "").trim() || "__________";

    if (payload.rol === "OTROS") {
      if (payload.conMovil) {
        return `Siendo la hora al margen se hace presente ${nombre}, en móvil ${movil}.`;
      }
      return `Siendo la hora al margen se hace presente ${nombre}.`;
    }

    const articulo = payload.rol === "JEFE" ? "el Jefe" : "el Subjefe";
    const tramoMovil = payload.conMovil ? `, en móvil ${movil},` : ",";
    const cierre = payload.seAcopla
      ? " acoplandose al mismo."
      : " acto seguido se retira sin novedad.";

    return `Siendo la hora al margen se hace presente${tramoMovil} ${articulo} de dependencia BMZCN ${nombre} controlando el servicio,${cierre}`;
  }

  function buildMessage(ctx = {}) {
    const payload = getPayload();
    const activo = ctx.forceActivo === true || payload.activo;
    if (!activo) {
      return { ok: false, mensaje: "CONTROL SUPERIOR no está seleccionado." };
    }

    if (!payload.rol) {
      return { ok: false, mensaje: "Debe seleccionar JEFE, SUBJEFE u OTROS en CONTROL SUPERIOR." };
    }

    if (payload.rol === "OTROS" && !payload.otros) {
      return { ok: false, mensaje: "Debe completar el nombre en OTROS para CONTROL SUPERIOR." };
    }

    const inicio = ctx.inicio || {};
    const franja = ctx.franja || {};
    const bold = typeof ctx.bold === "function" ? ctx.bold : (txt) => `*${String(txt || "").trim()}*`;
    const compactarSaltos = typeof ctx.compactarSaltos === "function"
      ? ctx.compactarSaltos
      : (txt) => String(txt || "").replace(/\n{3,}/g, "\n\n").trim();
    const normalizarLugar = typeof ctx.normalizarLugar === "function"
      ? ctx.normalizarLugar
      : (txt) => String(txt || "").trim();
    const normalizarArrayTexto = typeof ctx.normalizarArrayTexto === "function"
      ? ctx.normalizarArrayTexto
      : (arr) => Array.isArray(arr) ? arr.map((v) => String(v || "").trim()).filter(Boolean) : [];
    const lineaDesdeArray = typeof ctx.lineaDesdeArray === "function"
      ? ctx.lineaDesdeArray
      : (arr, sep) => Array.isArray(arr) && arr.length ? arr.join(` ${sep} `) : "/";

    const fecha = ctx.fecha || new Date().toLocaleDateString("es-AR");
    const hora = ctx.hora || new Date().toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit", hour12: false });
    const lugar = normalizarLugar(inicio.lugar || franja.lugar || "");
    const personalTexto = normalizarArrayTexto(inicio.personal).join("\n") || "/";
    const movilTexto = [
      lineaDesdeArray(inicio.moviles, "/"),
      lineaDesdeArray(inicio.motos, "/"),
    ].filter((v) => v && v !== "/").join(" / ") || "/";

    const partes = [];
    partes.push(bold("POLICIA DE LA PROVINCIA DE SANTA FE - GUARDIA PROVINCIAL"));
    partes.push(bold("BRIGADA MOTORIZADA ZONA CENTRO NORTE"));
    partes.push(bold("TERCIO CHARLIE"));
    partes.push("");
    partes.push(`${bold("MOTIVO:")} CONTROL SUPERIOR`);
    partes.push("");
    partes.push(`${bold("LUGAR:")} ${lugar || "/"}`);
    partes.push("");
    partes.push(`${bold("HORA:")} ${hora} hs`);
    partes.push("");
    partes.push(`${bold("FECHA:")} ${fecha}`);
    partes.push("");
    partes.push(`${bold("MOVIL:")} ${movilTexto}`);
    partes.push("");
    partes.push(bold("PERSONAL:"));
    partes.push(personalTexto);
    partes.push("");
    partes.push(bold("OBSERVACIÓNES:"));
    partes.push(construirObservacion(payload, movilTexto));

    return { ok: true, texto: compactarSaltos(partes.join("\n")) };
  }

  function init() {
    const r = ensureRefs();
    [r.jefe, r.subjefe, r.otros].forEach((el) => {
      if (!el) return;
      el.addEventListener("change", () => {
        if (el.checked) limpiarRolesExcepto(el);
        syncOtros();
      });
    });

    syncOtros();
  }

  window.ControlSuperior = {
    init,
    isActive,
    reset,
    getPayload,
    buildMessage,
  };
})();
