(function () {
  "use strict";

  window.WSP = window.WSP || {};
  window.WSP.modules = window.WSP.modules || {};

  const TIPO_INFORMES = "INFORMES";
  const TIPO_CONTROL_SUPERIOR = "CONTROL SUPERIOR";

  const SUPERIORES = {
    jefe: {
      rol: "JEFE",
      nombre: "SubCrio Choque Jose Maria",
    },
    subjefe: {
      rol: "SUBJEFE",
      nombre: "Inspector Tramontini Ismael",
    },
  };

  function getEl(id) {
    return document.getElementById(id);
  }

  function checked(id) {
    return !!getEl(id)?.checked;
  }

  function setChecked(id, value) {
    const el = getEl(id);
    if (el) el.checked = !!value;
  }

  function value(id) {
    return String(getEl(id)?.value || "").replace(/\s+/g, " ").trim();
  }

  function limpiarTextoSimple(txt) {
    return String(txt || "")
      .replace(/\s+/g, " ")
      .trim();
  }

  function upperTexto(txt) {
    return String(txt || "")
      .replace(/\s+/g, " ")
      .trim()
      .toUpperCase();
  }

  function normalizarArrayTextoLocal(arr) {
    return (Array.isArray(arr) ? arr : [])
      .map((v) => String(v || "").replace(/\s+/g, " ").trim())
      .filter(Boolean);
  }

  function lineaDesdeArrayLocal(arr, sep = "/") {
    const values = normalizarArrayTextoLocal(arr);
    return values.length ? values.join(" " + sep + " ") : "/";
  }

  function boldLocal(txt) {
    return `*${String(txt || "").trim()}*`;
  }

  function compactarSaltosLocal(texto) {
    return String(texto || "")
      .replace(/[ \t]+\n/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  }

  function normalizarLugarLocal(txt) {
    return String(txt || "")
      .toLowerCase()
      .trim()
      .replace(/\b\w/g, (l) => l.toUpperCase());
  }

  function normalizarHorarioLocal(txt) {
    return String(txt || "")
      .replace(/\s+/g, " ")
      .trim();
  }

  function normalizarTituloLocal(txt) {
    return String(txt || "")
      .replace(/\s+/g, " ")
      .trim();
  }

  function escapeRegexSuperior(value) {
    return String(value || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  function normalizarBasicoSuperior(txt) {
    return String(txt || "")
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "");
  }

  function extraerNumeroOrdenSuperior(value = "") {
    const texto = limpiarTextoSimple(value || "");
    const match = texto.match(/\b(\d{1,6}\s*\/\s*\d{2,4})\b/);
    return match ? match[1].replace(/\s+/g, "") : "";
  }

  function limpiarOrdenDentroDeTituloSuperior(tipoRaw = "", ordenRaw = "") {
    let tipo = limpiarTextoSimple(tipoRaw || "");
    const orden = limpiarTextoSimple(ordenRaw || "");
    if (!tipo) return "";
    if (orden) tipo = tipo.replace(new RegExp(escapeRegexSuperior(orden), "ig"), " ");
    const numero = extraerNumeroOrdenSuperior(orden || tipo);
    if (numero) {
      const flex = numero.replace(/\//g, "\\s*\/\\s*");
      tipo = tipo
        .replace(new RegExp(`\b(?:O\.?\s*S\.?\s*G\.?\s*P\.?|OSGP|O\.?\s*S\.?|ORDEN(?:\s+DE\s+SERVICIO)?|ORD\.?)\s*(?:N[°º]?\s*)?${flex}\b`, "ig"), " ")
        .replace(new RegExp(`\b(?:N[°º]?\s*)?${flex}\b`, "ig"), " ");
    }
    tipo = tipo.replace(/\s{2,}/g, " ").trim();
    if (!tipo || normalizarBasicoSuperior(tipo) === normalizarBasicoSuperior(orden)) return "";
    return normalizarTituloLocal(tipo);
  }

  function getSelectTipo() {
    return getEl("tipo");
  }

  function getSelectTipoInforme() {
    return getEl("tipoInforme");
  }

  function isActive() {
    const selTipo = getSelectTipo();
    const tipoInforme = getSelectTipoInforme();

    if (selTipo?.value === TIPO_INFORMES && tipoInforme?.value === TIPO_CONTROL_SUPERIOR) return true;

    // Compatibilidad por si algún HTML viejo o cache del navegador conserva la opción principal.
    if (selTipo?.value === TIPO_CONTROL_SUPERIOR) return true;

    return false;
  }

  function obtenerSeleccionSuperior() {
    const seleccionados = [];

    if (checked("controlSuperiorJefe")) {
      seleccionados.push({ key: "jefe", ...SUPERIORES.jefe });
    }

    if (checked("controlSuperiorSubjefe")) {
      seleccionados.push({ key: "subjefe", ...SUPERIORES.subjefe });
    }

    if (checked("controlSuperiorOtros")) {
      seleccionados.push({
        key: "otros",
        rol: "SUPERIOR",
        nombre: upperTexto(value("controlSuperiorOtrosTexto")),
      });
    }

    if (!seleccionados.length) {
      return {
        ok: false,
        mensaje: "Debe seleccionar JEFE, SUBJEFE u OTROS para CONTROL SUPERIOR.",
      };
    }

    if (seleccionados.length > 1) {
      return {
        ok: false,
        mensaje: "Seleccione un solo superior: JEFE, SUBJEFE u OTROS.",
      };
    }

    const seleccionado = seleccionados[0];
    if (seleccionado.key === "otros" && !seleccionado.nombre) {
      return {
        ok: false,
        mensaje: "Debe completar el nombre del superior en OTROS.",
      };
    }

    return { ok: true, superior: seleccionado };
  }

  function actualizarOtrosVisible() {
    const wrap = getEl("bloqueControlSuperiorOtrosTexto");
    const input = getEl("controlSuperiorOtrosTexto");
    const visible = checked("controlSuperiorOtros");

    if (wrap) wrap.classList.toggle("hidden", !visible);
    if (!visible && input) input.value = "";
  }

  function marcarExclusivo(idActivo) {
    ["controlSuperiorJefe", "controlSuperiorSubjefe", "controlSuperiorOtros"].forEach((id) => {
      if (id !== idActivo) setChecked(id, false);
    });
    actualizarOtrosVisible();
  }

  function reset() {
    setChecked("controlSuperiorJefe", false);
    setChecked("controlSuperiorSubjefe", false);
    setChecked("controlSuperiorOtros", false);
    setChecked("controlSuperiorConMovil", false);
    setChecked("controlSuperiorSeAcopla", false);

    const otrosTexto = getEl("controlSuperiorOtrosTexto");
    if (otrosTexto) otrosTexto.value = "";

    actualizarOtrosVisible();
  }

  function init() {
    const jefe = getEl("controlSuperiorJefe");
    const subjefe = getEl("controlSuperiorSubjefe");
    const otros = getEl("controlSuperiorOtros");
    const otrosTexto = getEl("controlSuperiorOtrosTexto");

    if (jefe && !jefe.__wspControlSuperiorBind) {
      jefe.__wspControlSuperiorBind = true;
      jefe.addEventListener("change", () => {
        if (jefe.checked) marcarExclusivo("controlSuperiorJefe");
        else actualizarOtrosVisible();
      });
    }

    if (subjefe && !subjefe.__wspControlSuperiorBind) {
      subjefe.__wspControlSuperiorBind = true;
      subjefe.addEventListener("change", () => {
        if (subjefe.checked) marcarExclusivo("controlSuperiorSubjefe");
        else actualizarOtrosVisible();
      });
    }

    if (otros && !otros.__wspControlSuperiorBind) {
      otros.__wspControlSuperiorBind = true;
      otros.addEventListener("change", () => {
        if (otros.checked) marcarExclusivo("controlSuperiorOtros");
        else actualizarOtrosVisible();
      });
    }

    if (otrosTexto && !otrosTexto.__wspControlSuperiorUpperBind) {
      otrosTexto.__wspControlSuperiorUpperBind = true;
      otrosTexto.addEventListener("input", () => {
        const start = otrosTexto.selectionStart;
        const end = otrosTexto.selectionEnd;
        otrosTexto.value = upperTexto(otrosTexto.value);
        try {
          if (start != null && end != null) otrosTexto.setSelectionRange(start, end);
        } catch {}
      });
    }

    actualizarOtrosVisible();
  }

  function construirObservacionSuperior(superior) {
    const conMovil = checked("controlSuperiorConMovil");
    const seAcopla = checked("controlSuperiorSeAcopla");

    const sujeto = `${superior.rol} ${superior.nombre}`.replace(/\s+/g, " ").trim();
    const partes = [`Se hace presente ${sujeto}`];

    if (conMovil) partes.push("con móvil");

    partes.push("realizando control superior");

    if (seAcopla) partes.push("y se acopla al operativo");

    return partes.join(" ").replace(/\s+/g, " ").trim() + ".";
  }

  function buildMessage(options = {}) {
    const {
      forceActivo = false,
      inicio = null,
      franja = null,
      bold = boldLocal,
      compactarSaltos = compactarSaltosLocal,
      normalizarLugar = normalizarLugarLocal,
      normalizarArrayTexto = normalizarArrayTextoLocal,
      lineaDesdeArray = lineaDesdeArrayLocal,
    } = options;

    if (!forceActivo && !isActive()) {
      return { ok: false, mensaje: "CONTROL SUPERIOR no está activo." };
    }

    const seleccion = obtenerSeleccionSuperior();
    if (!seleccion.ok) return seleccion;

    if (!inicio) {
      return {
        ok: false,
        mensaje: "No hay datos de INICIO para generar CONTROL SUPERIOR.",
      };
    }

    const fecha = new Date().toLocaleDateString("es-AR");
    const hora = new Date().toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit", hour12: false });
    const lugar = normalizarLugar(inicio?.lugar || franja?.lugar || "");
    const horario = normalizarHorarioLocal(inicio?.horario || franja?.horario || "");
    const orden = normalizarTituloLocal(inicio?.orden_num || franja?.__ordenNum || "");
    const tipoOperativoRaw = normalizarTituloLocal(inicio?.tipo_corto || franja?.titulo || "OPERATIVO");
    const tipoOperativo = limpiarOrdenDentroDeTituloSuperior(tipoOperativoRaw, orden) || "OPERATIVO";
    const personal = normalizarArrayTexto(inicio?.personal).join("\n") || "/";
    const moviles = [
      lineaDesdeArray(inicio?.moviles, "/"),
      lineaDesdeArray(inicio?.motos, "/"),
    ].filter((v) => v && v !== "/").join(" / ") || "/";
    const observacion = construirObservacionSuperior(seleccion.superior);

    const texto = compactarSaltos([
      bold("POLICÍA DE LA PROVINCIA DE SANTA FE - GUARDIA PROVINCIAL"),
      bold("BRIGADA MOTORIZADA ZONA CENTRO NORTE SANTA FE"),
      bold("TERCIO CHARLIE"),
      "",
      bold("MOTIVO: CONTROL SUPERIOR"),
      "",
      `${bold("LUGAR:")} ${lugar}`,
      "",
      `${bold("HORA:")} ${hora}HS`,
      "",
      `${bold("FECHA:")} ${fecha}`,
      "",
      `${bold("OPERATIVO:")} ${[tipoOperativo, orden].filter(Boolean).join(" ")}`,
      horario ? `${bold("HORARIO:")} ${horario}` : "",
      "",
      bold("PERSONAL POLICIAL:"),
      personal,
      "",
      `${bold("MÓVIL:")} ${moviles}`,
      "",
      `${bold("OBSERVACIONES:")} ${observacion}`,
    ].filter((linea) => linea !== null && linea !== undefined).join("\n"));

    return {
      ok: true,
      texto,
      superior: seleccion.superior,
      metadata: {
        con_movil: checked("controlSuperiorConMovil"),
        se_acopla: checked("controlSuperiorSeAcopla"),
      },
    };
  }

  window.ControlSuperior = {
    init,
    reset,
    isActive,
    buildMessage,
    diagnosticar() {
      return {
        activo: isActive(),
        jefe: checked("controlSuperiorJefe"),
        subjefe: checked("controlSuperiorSubjefe"),
        otros: checked("controlSuperiorOtros"),
        otrosTexto: value("controlSuperiorOtrosTexto"),
        conMovil: checked("controlSuperiorConMovil"),
        seAcopla: checked("controlSuperiorSeAcopla"),
      };
    },
  };

  window.WSP.modules.controlSuperior = window.ControlSuperior;

  console.log("[WSP control superior] cargado");
})();
