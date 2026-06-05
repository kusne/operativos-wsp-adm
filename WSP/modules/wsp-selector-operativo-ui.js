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

  function obtenerTextoRefOrdenDeFranja(franja) {
    return limpiarTextoSimple(franja?.__ordenTextoRef || "");
  }

  function obtenerNumeroOrdenDeFranja(franja) {
    return limpiarTextoSimple(franja?.__ordenNum || "");
  }

  function detectarTiposCombinadosVisualesWsp(fuente = "") {
    const t = normalizarBasicoSinAcentos(fuente);
    const tipos = [];

    function add(label) {
      if (label && !tipos.includes(label)) tipos.push(label);
    }

    const tieneOCV = /\bocv\b|\bcontrol\s+vehicular\b|\boperativo\s+de\s+control\s+vehicular\b/.test(t);
    const tieneAlcoholemia = /\balcoholemia\b|\balcoholimetr/.test(t);
    const tieneDICEP = /\bdicep\b|\bmultiagencial\b|\bmulti\s+agencial\b/.test(t);
    const tieneCinemometro = /\bcinemometro\b|\bcinemómetro\b/.test(t);
    const tieneBalanza = /\bcontrol\s+de\s+peso\b|\bpeso\b|\bbalanza\b|\bbascula\b|\bbasculas\b|\bpesaje\b/.test(t);
    const tieneOrdenamiento = /\bordenamiento\b/.test(t);

    if (tieneOCV) add("OCV");
    if (tieneAlcoholemia) add("Alcoholemia");
    if (tieneDICEP) add("DICEP");
    if (tieneCinemometro) add("Cinemómetro");
    if (tieneBalanza) add("Balanza");
    if (tieneOrdenamiento) add("Ordenamiento");

    return tipos.length > 1 ? tipos.join(" y ") : "";
  }

  function obtenerTipoCortoFranja(franja) {
    const fuente = normalizarBasicoSinAcentos(
      [franja?.titulo || "", obtenerTextoRefOrdenDeFranja(franja)].join(" ")
    );

    const tipoCombinado = detectarTiposCombinadosVisualesWsp(fuente);
    if (tipoCombinado) return tipoCombinado;

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

  function obtenerFuenteVisualFranja(franja) {
    const partes = [];
    const vistos = new Set();

    function addTexto(value) {
      if (value == null) return;

      if (Array.isArray(value)) {
        value.forEach(addTexto);
        return;
      }

      if (typeof value === "object") {
        addTexto(value.tipo);
        addTexto(value.titulo);
        addTexto(value.__tipoPublicado);
        addTexto(value.tipoPublicado);
        addTexto(value.tipo_operativo);
        addTexto(value.tipoFusionado);
        addTexto(value.tiposFusionados);
        addTexto(value.tipos);
        addTexto(value.tipos_origen);
        addTexto(value.__foTipoSupabasePublicado);
        addTexto(value.orden);
        addTexto(value.ordenes);
        addTexto(value.ordenesOrigen);
        addTexto(value.ordenes_origen);
        return;
      }

      const clean = limpiarTextoSimple(String(value || ""));
      if (!clean) return;
      const key = clean.toLowerCase();
      if (vistos.has(key)) return;
      vistos.add(key);
      partes.push(clean);
    }

    addTexto(franja?.titulo);
    addTexto(franja?.__tipoPublicado);
    addTexto(franja?.tipo);
    addTexto(franja?.tipoPublicado);
    addTexto(franja?.tipo_operativo);
    addTexto(franja?.__ordenTextoRef);
    addTexto(franja?.__ordenNum);
    addTexto(franja?.__ordenesOrigen);
    addTexto(franja?.lugar);

    addTexto(franja?.__registroOriginalPublicado);
    addTexto(franja?.__wspMetaTemporal);

    if (Array.isArray(franja?.__franjasOrigenTemporal)) {
      franja.__franjasOrigenTemporal.forEach(addTexto);
    }

    return normalizarBasicoSinAcentos(partes.join(" "));
  }

  function compactarClaveVisual(txt) {
    return normalizarBasicoSinAcentos(txt).replace(/[^a-z0-9]+/g, "");
  }

  function capitalizarLugarVisual(txt) {
    return limpiarTextoSimple(txt)
      .toLowerCase()
      .replace(/\b\w/g, (l) => l.toUpperCase())
      .replace(/\bRn\b/g, "RN")
      .replace(/\bRp\b/g, "RP")
      .replace(/\bKm\b/g, "KM")
      .replace(/\bUor\b/g, "UOR")
      .replace(/\bDicep\b/g, "DICEP");
  }

  function obtenerLugarVisualFranja(franja) {
    let lugar = limpiarTextoSimple(franja?.lugar || "");
    if (!lugar) return "sin lugar";

    lugar = lugar
      .replace(/^qth\s*[:\-]?\s*/i, "")
      .replace(/^lugar\s*[:\-]?\s*/i, "")
      .trim();

    const clave = compactarClaveVisual(lugar);

    if (clave.includes("rn168delkm18al00rp1delkm00al20")) return "RN168/RP1";
    if (clave.includes("rn168delkm18al00")) return "RN168 Km18/Km00";

    const tieneRN168 = clave.includes("rn168") || clave.includes("rutanacional168");
    const tieneKM18 = clave.includes("km18") || clave.includes("kilometro18");
    const tienePeaje = clave.includes("peaje");

    if (tieneRN168 && tieneKM18) {
      return tienePeaje ? "Peaje" : "Base";
    }

    if (clave.includes("rn168km16ascendente")) return "RN168 KM16 ASC";
    if (
      clave.includes("zonadebolichesbailableslindantesarn168") ||
      clave.includes("zonadebolichesbailableslindantesarnn168")
    ) return "ZONA DE BOLICHES";
    if (clave === "ascendente") return "ASC";
    if (clave === "descendente") return "DESC";
    if (clave.includes("rp01km06consubbaserinconuor3coordinado")) return "RP01 KM06 CON SUB-BASE";
    if (clave.includes("rp1yrn168alturaparadadecolectivo")) return "RP1 Y RN168 P. DE COLECTIVO";
    if (clave.includes("aup01km141bmnuor3")) return "AUP01 KM141";
    if (clave.includes("rn168km75ascbmconufivambossentidos")) return "RN168 KM7,5 ASC";
    if (clave.includes("rn11km454sauceviejoalturaaeropuertobmnuor3")) return "RN11 KM454 AEROPUERTO";
    if (clave.includes("rp1km8coordinadoconsubbaserincon")) return "RP1 KM8 CON SUB BASE";
    if (clave.includes("rp2yrp5monteverabmnuor3")) return "RP2 Y RP5";

    const esRN168 = clave.includes("rn168") || clave.includes("rutanacional168");
    const esRP1 = clave.includes("rp1") || clave.includes("rutaprovincial1");

    if (esRN168 && esRP1) return "RN168 y RP1";

    lugar = lugar
      .replace(/\bruta\s+nacional\s*/gi, "RN")
      .replace(/\bruta\s+provincial\s*/gi, "RP")
      .replace(/\bkil[oó]metro\b/gi, "KM")
      .replace(/\bascendente\b/gi, "ASC")
      .replace(/\bdescendente\b/gi, "DESC")
      .replace(/\bpuente\s+carretero\b/gi, "Pte. Carretero")
      .replace(/\bcabecera\b/gi, "Cab.")
      .replace(/\bsanto\s+tome\b/gi, "Sto. Tome")
      .replace(/\bsanta\s+fe\b/gi, "Sta. Fe");

    lugar = capitalizarLugarVisual(lugar)
      .replace(/\bAsc\b/g, "ASC")
      .replace(/\bDesc\b/g, "DESC")
      .replace(/\bRn\b/g, "RN")
      .replace(/\bRp\b/g, "RP")
      .replace(/\bKm\b/g, "KM")
      .replace(/\bUor\b/g, "UOR");

    if (lugar.length > 24) {
      return lugar.slice(0, 24).trim() + "...";
    }

    return lugar;
  }

  function obtenerTipoVisualFranja(franja) {
    const fuente = obtenerFuenteVisualFranja(franja);
    const clave = compactarClaveVisual(fuente);

    const tipoCombinado = detectarTiposCombinadosVisualesWsp(fuente);
    if (tipoCombinado) return tipoCombinado;

    if (clave.includes("operativodecontrolvehicularenconjuntoconsubbaseuor3")) return "OCV CON SUB BASE";
    if (clave.includes("operativodecontrolvehicularenconjuntoconuor3")) return "CON UOR3";
    if (clave.includes("nocturnidadcontrolada")) return "NOCTURNIDAD";
    if (clave.includes("alcoholemiaenconjuntoconuor3")) return "ALCOHOLEMIA CON UOR3";
    if (clave.includes("operativoretornocuidadocorredordelacostarn168")) return "RETORNO";
    if (clave.includes("operativoordenamientovehicular")) return "ORDENAMIENTO";
    if (clave.includes("operativoespecialmultiagencialdenominadodicep")) return "DICEP";
    if (clave.includes("cinemometrocondetencion")) return "CINEMÓMETRO";

    if (/\bcontrol\s+de\s+peso\b|\bpeso\b|\bbalanza\b|\bbascula\b|\bbasculas\b|\bpesaje\b/.test(fuente)) return "Balanza";
    if (/\bdicep\b|\bmultiagencial\b|\bmulti\s+agencial\b/.test(fuente)) return "DICEP";
    if (/\balcoholemia\b|\balcoholimetr/.test(fuente)) return "Alcoholemia";
    if (/\bocv\b|\bcontrol\s+vehicular\b|\boperativo\s+de\s+control\s+vehicular\b/.test(fuente)) return "OCV";
    if (/\bordenamiento\b/.test(fuente)) return "Ordenamiento";
    if (/\blimpieza\b/.test(fuente)) return "Limpieza";
    if (/\bablacion\b/.test(fuente)) return "Ablacion";
    if (/\bestablecido\b/.test(fuente)) return "Establecido";
    if (/\bpresencia\s+activa\b|\bpresencia\b/.test(fuente)) return "Presencia";
    if (/\bmonitoreo\b/.test(fuente)) return "Monitoreo";
    if (/\btraslado\b/.test(fuente)) return "Traslado";
    if (/\bcustodia\b/.test(fuente)) return "Custodia";
    if (/\bacompanamiento\b|\bacompanamieto\b|\bescolta\b/.test(fuente)) return "Acomp.";

    return obtenerTipoCortoFranja(franja);
  }

  function obtenerSufijosVisualesFranja(franja) {
    const fuente = obtenerFuenteVisualFranja(franja);
    const clave = compactarClaveVisual(fuente);
    const sufijos = [];

    if (
      clave.includes("operativodecontrolvehicularenconjuntoconuor3") ||
      clave.includes("alcoholemiaenconjuntoconuor3") ||
      clave.includes("operativodecontrolvehicularenconjuntoconsubbaseuor3")
    ) {
      return sufijos;
    }

    if (/\buor\s*3\b|\buor3\b/.test(fuente)) sufijos.push("con UOR3");
    if (/\btransito\b|\binspectores?\s+de\s+transito\b/.test(fuente)) sufijos.push("con Transito");

    return sufijos;
  }

  function construirTextoOpcionHorario(franja) {
    const horario = limpiarTextoSimple(franja?.horario || "");
    const lugar = obtenerLugarVisualFranja(franja);
    const tipo = obtenerTipoVisualFranja(franja);
    const sufijos = obtenerSufijosVisualesFranja(franja);
    const referencia = [tipo, ...sufijos].filter(Boolean).join(" ");

    return `${horario} - ${lugar} - ${referencia}`;
  }

  function construirOperativoPlano(franja, orden, idxOrden, idxFranja) {
    return {
      ...franja,
      __key: `${idxOrden}-${idxFranja}`,
      __ordenNum: limpiarTextoSimple(franja?.__ordenNum || orden?.num || ""),
      __ordenTextoRef: limpiarTextoSimple(franja?.__ordenTextoRef || orden?.textoRef || ""),
    };
  }

  function setTituloOperativosIniciados(modoIniciados) {
    try {
      const label = document.querySelector(".operativos-title-label");
      if (label) label.textContent = modoIniciados ? "OPERATIVOS INICIADOS" : "OPERATIVOS";
    } catch {}
  }

  function limpiarSeleccionOperativo(refs = {}) {
    const { selHorario, actualizarContadorOperativosWsp } = refs;
    if (selHorario) {
      selHorario.value = "";
      selHorario.innerHTML = '<option value="">Seleccionar Operativo</option>';
    }
    if (typeof actualizarContadorOperativosWsp === "function") actualizarContadorOperativosWsp(0);
  }

  function crearOpcionHorario(franja) {
    const option = document.createElement("option");
    option.value = franja?.__key || "";
    option.text = construirTextoOpcionHorario(franja);
    option.title = option.text;
    return option;
  }

  const api = {
    limpiarTextoSimple,
    normalizarBasicoSinAcentos,
    obtenerTextoRefOrdenDeFranja,
    obtenerNumeroOrdenDeFranja,
    detectarTiposCombinadosVisualesWsp,
    obtenerTipoCortoFranja,
    obtenerLugarCortoFranja,
    obtenerFuenteVisualFranja,
    compactarClaveVisual,
    capitalizarLugarVisual,
    obtenerLugarVisualFranja,
    obtenerTipoVisualFranja,
    obtenerSufijosVisualesFranja,
    construirTextoOpcionHorario,
    construirOperativoPlano,
    setTituloOperativosIniciados,
    limpiarSeleccionOperativo,
    crearOpcionHorario,
  };

  window.WSP.modules.selectorOperativoUi = api;
  window.WSP.ui = window.WSP.ui || {};
  window.WSP.ui.selectorOperativo = api;

  console.log("[WSP selector operativo UI] cargado");
})();
