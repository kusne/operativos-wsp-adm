(function () {
  "use strict";

  window.WSP = window.WSP || {};
  window.WSP.modules = window.WSP.modules || {};

  const TESSERACT_CDN = "https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js";
  const ESTADOS = {
    idle: "Opcional: use este botón antes de cargar los campos manuales.",
    loading: "Cargando lector OCR...",
    preparing: "Preparando imagen del acta...",
    reading: "Leyendo acta. Puede demorar unos segundos...",
  };

  let promesaTesseract = null;
  let inicializado = false;
  let ultimoTextoOcr = "";
  let ultimosDatos = null;

  function getEl(id) {
    return document.getElementById(id);
  }

  function refs() {
    return {
      btn: getEl("btnLeerActa460"),
      input: getEl("inputLeerActa460"),
      status: getEl("inf460ActaOcrEstado"),
      marca: getEl("inf460Marca"),
      modelo: getEl("inf460Modelo"),
      dominio: getEl("inf460Dominio"),
      acta: getEl("inf460Acta"),
      codigos: getEl("inf460OtrosCodigos"),
      inventario: getEl("inf460Inventario"),
    };
  }

  function setEstado(mensaje, tipo) {
    const r = refs();
    if (!r.status) return;
    r.status.textContent = mensaje || ESTADOS.idle;
    r.status.classList.remove("ok", "warn", "error");
    if (tipo) r.status.classList.add(tipo);
  }

  function setCargando(activo, textoBoton) {
    const r = refs();
    if (r.btn) {
      r.btn.disabled = !!activo;
      const main = r.btn.querySelector(".inf460-ocr-btn-main");
      const sub = r.btn.querySelector(".inf460-ocr-btn-sub");
      if (main) main.textContent = activo ? (textoBoton || "LEYENDO ACTA") : "LEER FOTO ACTA";
      if (sub) sub.textContent = activo ? "No cierre esta pantalla" : "Precarga marca, modelo, dominio, acta y códigos";
    }
  }

  function cargarScript(src) {
    return new Promise((resolve, reject) => {
      const existente = Array.from(document.scripts || []).find((s) => String(s.src || "").includes("tesseract"));
      if (existente && window.Tesseract) return resolve(window.Tesseract);

      const script = document.createElement("script");
      script.src = src;
      script.async = true;
      script.onload = () => resolve(window.Tesseract);
      script.onerror = () => reject(new Error("No se pudo cargar Tesseract.js"));
      document.head.appendChild(script);
    });
  }

  async function asegurarTesseract() {
    if (window.Tesseract) return window.Tesseract;
    if (!promesaTesseract) promesaTesseract = cargarScript(TESSERACT_CDN);
    const tesseract = await promesaTesseract;
    if (!tesseract || !tesseract.recognize) throw new Error("OCR no disponible en el navegador");
    return tesseract;
  }

  function normalizarTextoOcr(texto) {
    return String(texto || "")
      .replace(/\r\n?/g, "\n")
      .replace(/[\u00A0\t]+/g, " ")
      .replace(/[ ]{2,}/g, " ")
      .replace(/[|]/g, "I")
      .split("\n")
      .map((linea) => linea.trim())
      .filter(Boolean)
      .join("\n")
      .trim();
  }

  function sinAcentos(texto) {
    return String(texto || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  }

  function normalizarBusqueda(texto) {
    return sinAcentos(texto)
      .replace(/[|]/g, "I")
      .replace(/[ ]{2,}/g, " ");
  }

  function normalizarMayus(value) {
    return String(value || "")
      .replace(/[–—]/g, "-")
      .replace(/\s+/g, " ")
      .trim()
      .toUpperCase();
  }

  function normalizarDominio(value) {
    return normalizarMayus(value).replace(/[^A-Z0-9]/g, "").slice(0, 10);
  }

  function normalizarNumero(value) {
    return String(value || "")
      .replace(/[Oo]/g, "0")
      .replace(/[Il]/g, "1")
      .replace(/\D+/g, "");
  }

  function limpiarValorCampo(value) {
    return String(value || "")
      .replace(/^[.:\-\s]+/, "")
      .replace(/\s{2,}/g, " ")
      .trim();
  }

  function cortarEnEtiquetas(value) {
    return limpiarValorCampo(value)
      .replace(/\s+(?:Tipo|Modelo|Marca|DNI|Propietario|Lugar|Referencia|Cod|Observaciones|Retiene|Secuestra)\s*:.*/i, "")
      .trim();
  }

  function buscarPrimero(texto, patrones) {
    const lista = Array.isArray(patrones) ? patrones : [patrones];
    for (const patron of lista) {
      const match = String(texto || "").match(patron);
      if (match && match[1]) return limpiarValorCampo(match[1]);
    }
    return "";
  }

  function buscarLineas(texto, labelRegex) {
    const lineas = String(texto || "").split("\n");
    const out = [];
    for (const linea of lineas) {
      if (labelRegex.test(linea)) out.push(linea);
    }
    return out;
  }

  function extraerCampoEnLinea(texto, etiqueta) {
    const limpio = normalizarBusqueda(texto);
    const etiquetaEsc = String(etiqueta || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const re = new RegExp(`${etiquetaEsc}\\s*:?\\s*([^\\n]+)`, "i");
    return buscarPrimero(limpio, re);
  }

  function extraerModelo(texto) {
    const limpio = normalizarBusqueda(texto);
    let modelo = buscarPrimero(limpio, [
      /Modelo\s*:\s*([^\n]+)/i,
      /Mode[l1]o\s*:\s*([^\n]+)/i,
    ]);
    modelo = modelo.replace(/\s+Tipo\s*:.*$/i, "").trim();
    return cortarEnEtiquetas(modelo);
  }

  function extraerMarca(texto) {
    const limpio = normalizarBusqueda(texto);
    const marca = buscarPrimero(limpio, [
      /Marca\s*:\s*([^\n]+)/i,
      /Mar[cç]a\s*:\s*([^\n]+)/i,
    ]);
    return cortarEnEtiquetas(marca);
  }

  function extraerDominio(texto) {
    const limpio = normalizarBusqueda(texto);
    const dominio = buscarPrimero(limpio, [
      /Dominio\s*:\s*([A-Z0-9\s-]{5,12})/i,
      /Dom[ií1]nio\s*:\s*([A-Z0-9\s-]{5,12})/i,
    ]);
    return normalizarDominio(dominio);
  }

  function extraerActa(texto) {
    const limpio = normalizarBusqueda(texto);
    const acta = buscarPrimero(limpio, [
      /ACTA\s*(?:NRO|NR0|Nº|N°|NO|N0)\.?\s*[:.]?\s*([0-9OoIl\s]{6,14})/i,
      /NRO\.?\s*[:.]?\s*([0-9OoIl\s]{6,14})/i,
    ]);
    return normalizarNumero(acta).slice(0, 12);
  }

  function extraerCodigos(texto) {
    const limpio = normalizarBusqueda(texto);
    const codigos = [];
    const re = /C[o0]d\s*[:.]?\s*([0-9OoIl]{3,8})/ig;
    let match;
    while ((match = re.exec(limpio))) {
      const codigo = normalizarNumero(match[1]);
      if (codigo && !codigos.includes(codigo)) codigos.push(codigo);
    }
    return codigos;
  }

  function extraerMedidas(texto) {
    const limpio = normalizarBusqueda(texto);
    const retiene = /Retiene\s+Licencia\s*:\s*S[i1í]/i.test(limpio);
    const secuestra = /Secuestra\s+Veh[iíi]culo\s*:\s*S[i1í]/i.test(limpio);
    return { retieneLicencia: retiene, secuestraVehiculo: secuestra };
  }

  function extraerJuzgado(texto) {
    const limpio = normalizarBusqueda(texto);
    return cortarEnEtiquetas(buscarPrimero(limpio, /Juzgado\s*:\s*([^\n]+)/i));
  }

  function extraerLabrante(texto) {
    const limpio = normalizarBusqueda(texto);
    const lineas = buscarLineas(limpio, /(SUBOFICIAL|INSPECTOR|OFICIAL|AGENTE|DELGADO|POLICIA)/i);
    return lineas.map((v) => v.trim()).filter(Boolean).slice(0, 3).join(" / ");
  }

  function extraerDatosActa460(textoOcr) {
    const texto = normalizarTextoOcr(textoOcr);
    const datos = {
      actaNumero: extraerActa(texto),
      dominio: extraerDominio(texto),
      modelo: normalizarMayus(extraerModelo(texto)),
      marca: normalizarMayus(extraerMarca(texto)),
      codigos: extraerCodigos(texto),
      juzgado: extraerJuzgado(texto),
      labrante: extraerLabrante(texto),
      ...extraerMedidas(texto),
      textoOcr: texto,
    };
    return datos;
  }

  function dispatchInput(el) {
    if (!el) return;
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
  }

  function setValue(el, value) {
    const val = String(value || "").trim();
    if (!el || !val) return false;
    el.value = val;
    dispatchInput(el);
    return true;
  }

  function aplicarDatosAFormulario460(datos) {
    const r = refs();
    const cargados = [];

    if (setValue(r.marca, datos.marca)) cargados.push("marca");
    if (setValue(r.modelo, datos.modelo)) cargados.push("modelo");
    if (setValue(r.dominio, datos.dominio)) cargados.push("dominio");
    if (setValue(r.acta, datos.actaNumero)) cargados.push("acta");
    if (Array.isArray(datos.codigos) && datos.codigos.length && setValue(r.codigos, datos.codigos.join(" / "))) cargados.push("códigos");

    // No se marca inventario automáticamente: en 460/22 debe revisarlo el usuario.
    // Se informa en el estado si el acta dice Secuestra Vehículo: Sí.
    return cargados;
  }

  function resumenDatos(datos, cargados) {
    const faltantes = [];
    if (!datos.marca) faltantes.push("marca");
    if (!datos.modelo) faltantes.push("modelo");
    if (!datos.dominio) faltantes.push("dominio");
    if (!datos.actaNumero) faltantes.push("acta");
    if (!datos.codigos?.length) faltantes.push("códigos");

    const extras = [];
    if (datos.juzgado) extras.push(`Juzgado: ${datos.juzgado}`);
    if (datos.labrante) extras.push("labrante detectado");
    if (datos.secuestraVehiculo) extras.push("el acta indica secuestro de vehículo");

    if (cargados.length) {
      return `Acta leída. Cargado: ${cargados.join(", ")}. ${extras.length ? extras.join(". ") + ". " : ""}Revisar antes de enviar${faltantes.length ? `. Falta revisar: ${faltantes.join(", ")}` : ""}.`;
    }
    return `No se pudieron completar campos automáticamente. Intente con una foto más cercana y nítida del acta.`;
  }

  async function cargarImagenADataUrl(file, maxWidth = 1800) {
    const dataUrl = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ""));
      reader.onerror = () => reject(reader.error || new Error("No se pudo leer la imagen"));
      reader.readAsDataURL(file);
    });

    const img = await new Promise((resolve, reject) => {
      const im = new Image();
      im.onload = () => resolve(im);
      im.onerror = () => reject(new Error("No se pudo abrir la imagen"));
      im.src = dataUrl;
    });

    const scale = img.width > maxWidth ? maxWidth / img.width : 1;
    const width = Math.max(1, Math.round(img.width * scale));
    const height = Math.max(1, Math.round(img.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    ctx.drawImage(img, 0, 0, width, height);

    try {
      const imageData = ctx.getImageData(0, 0, width, height);
      const data = imageData.data;
      for (let i = 0; i < data.length; i += 4) {
        const gray = (data[i] * 0.299) + (data[i + 1] * 0.587) + (data[i + 2] * 0.114);
        const contraste = Math.max(0, Math.min(255, (gray - 128) * 1.28 + 128));
        data[i] = data[i + 1] = data[i + 2] = contraste;
      }
      ctx.putImageData(imageData, 0, 0);
    } catch (error) {
      console.warn("[WSP OCR 460] No se pudo preprocesar imagen. Se usa original escalada.", error);
    }

    return canvas.toDataURL("image/jpeg", 0.92);
  }

  async function leerTextoDesdeFoto(file) {
    if (!file) return "";
    setEstado(ESTADOS.loading);
    const Tesseract = await asegurarTesseract();
    setEstado(ESTADOS.preparing);
    const imagen = await cargarImagenADataUrl(file);
    setEstado(ESTADOS.reading);

    const resultado = await Tesseract.recognize(imagen, "spa", {
      logger: (m) => {
        if (!m || !m.status) return;
        if (m.status === "recognizing text" && Number.isFinite(m.progress)) {
          const pct = Math.max(0, Math.min(99, Math.round(m.progress * 100)));
          setEstado(`Leyendo acta... ${pct}%`);
        }
      },
    });
    return resultado?.data?.text || "";
  }

  async function procesarArchivoActa(file) {
    setCargando(true);
    try {
      const texto = await leerTextoDesdeFoto(file);
      ultimoTextoOcr = normalizarTextoOcr(texto);
      const datos = extraerDatosActa460(ultimoTextoOcr);
      ultimosDatos = datos;
      const cargados = aplicarDatosAFormulario460(datos);
      const tipo = cargados.length ? "ok" : "warn";
      setEstado(resumenDatos(datos, cargados), tipo);
      console.info("[WSP OCR 460] Texto OCR:", ultimoTextoOcr);
      console.info("[WSP OCR 460] Datos extraídos:", datos);
    } catch (error) {
      console.error("[WSP OCR 460] Error leyendo acta", error);
      setEstado("No se pudo leer el acta. Revise conexión o cargue los campos manualmente.", "error");
    } finally {
      setCargando(false);
      const r = refs();
      if (r.input) r.input.value = "";
    }
  }

  function init() {
    if (inicializado) return;
    const r = refs();
    if (!r.btn || !r.input) return;
    inicializado = true;

    r.btn.addEventListener("click", () => {
      setEstado("Seleccione o saque una foto nítida del acta 460/22.");
      r.input.click();
    });

    r.input.addEventListener("change", () => {
      const file = r.input.files && r.input.files[0];
      if (!file) return;
      procesarArchivoActa(file);
    });

    setEstado(ESTADOS.idle);
  }

  window.WSP.modules.actasOcr460 = {
    init,
    extraerDatosActa460,
    aplicarDatosAFormulario460,
    leerTextoDesdeFoto,
    getUltimoTextoOcr: () => ultimoTextoOcr,
    getUltimosDatos: () => ultimosDatos,
  };

  window.WSPActasOCR460 = window.WSP.modules.actasOcr460;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }

  console.log("[WSP OCR 460] cargado");
})();
