(function () {
  "use strict";

  window.WSP = window.WSP || {};
  window.WSP.modules = window.WSP.modules || {};

  const TESSERACT_CDN = "https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js";
  const ESTADOS = {
    idle: "Opcional: use este botón antes de cargar los campos manuales.",
    loading: "Cargando lector OCR...",
    preparing: "Preparando imagen del acta...",
    reading: "Leyendo solo datos útiles del acta 460/22...",
  };

  // Optimización 460/22: el OCR sigue leyendo la foto completa para no perder datos
  // cuando el acta viene torcida o cortada, pero la imagen se reduce y el parser
  // solo extrae estos campos: acta, dominio, marca, modelo, códigos, secuestro,
  // juzgado y labrante.
  const OCR460_MAX_WIDTH = 1400;
  const DOMINIO_MAX_ALFANUM = 7;

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
    // Dominio argentino: máximo 7 caracteres alfanuméricos.
    // Se corta antes de etiquetas vecinas como "Tipo" para evitar casos reales
    // como "A264JDN Tipo" -> "A264JDNTIP".
    let limpio = normalizarMayus(value)
      .replace(/\b(?:TIPO|T1PO|TIP0|MODELO|MARCA|DNI|PROPIETARIO|LUGAR)\b.*$/i, "")
      .replace(/[^A-Z0-9]/g, "");

    // Patrones frecuentes: AA862DN, A264JDN, ABC123.
    const patronNuevoAuto = limpio.match(/[A-Z]{2}\d{3}[A-Z]{2}/);
    if (patronNuevoAuto) return patronNuevoAuto[0].slice(0, DOMINIO_MAX_ALFANUM);
    const patronMoto = limpio.match(/[A-Z]\d{3}[A-Z]{3}/);
    if (patronMoto) return patronMoto[0].slice(0, DOMINIO_MAX_ALFANUM);
    const patronViejo = limpio.match(/[A-Z]{3}\d{3}/);
    if (patronViejo) return patronViejo[0].slice(0, DOMINIO_MAX_ALFANUM);

    return limpio.slice(0, DOMINIO_MAX_ALFANUM);
  }

  function normalizarNumero(value) {
    return String(value || "")
      .replace(/[Oo]/g, "0")
      .replace(/[Il|]/g, "1")
      .replace(/\D+/g, "");
  }

  function normalizarNumeroOcrEstricto(value) {
    // Solo para números de acta/códigos, donde el OCR suele confundir letras con números.
    return String(value || "")
      .replace(/[OoQq]/g, "0")
      .replace(/[Il|]/g, "1")
      .replace(/[Zz]/g, "2")
      .replace(/[Ss]/g, "5")
      .replace(/[Gg]/g, "6")
      .replace(/[Bb]/g, "8")
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
    const lineas = limpio.split("\n").map((linea) => linea.trim()).filter(Boolean);

    // 1) Preferir la línea exacta de dominio y cortar antes de "Tipo".
    for (const linea of lineas) {
      if (!/Dom[ií1]nio/i.test(linea)) continue;
      let valor = linea
        .replace(/^.*?Dom[ií1]nio\s*[º°.:,;\- ]*/i, "")
        .replace(/\b(?:Tipo|T1po|Tip0|Modelo|Marca|DNI|Propietario|Lugar)\b.*$/i, "")
        .trim();
      const dominio = normalizarDominio(valor);
      if (dominio.length >= 5) return dominio;
    }

    // 2) Fallback de texto plano, acotado al valor inmediatamente posterior a Dominio.
    const plano = limpio.replace(/\n+/g, " ");
    const match = plano.match(/Dom[ií1]nio\s*[º°.:,;\- ]*([A-Z0-9\s\-]{5,18})(?=\s+(?:Tipo|T1po|Tip0|Modelo|Marca|DNI|Propietario|Lugar)\b|$)/i);
    if (match && match[1]) return normalizarDominio(match[1]);

    // 3) Fallback final: buscar patrones de dominio en todo el OCR.
    const patrones = [/[A-Z]{2}\d{3}[A-Z]{2}/i, /[A-Z]\d{3}[A-Z]{3}/i, /[A-Z]{3}\d{3}/i];
    for (const patron of patrones) {
      const m = limpio.match(patron);
      if (m && m[0]) return normalizarDominio(m[0]);
    }
    return "";
  }

  function extraerActa(texto) {
    const limpio = normalizarBusqueda(texto);
    const lineas = limpio.split("\n").map((linea) => linea.trim()).filter(Boolean);

    // Primer intento: línea del encabezado del acta. Ejemplos reales/OCR:
    // "ACTA NRO. 070544272", "ACTA NRO . 070544272", "ACTA N° 070544272".
    const lineasActa = lineas.filter((linea) => /ACTA/i.test(linea));
    for (const linea of lineasActa) {
      const porEtiqueta = linea.match(/ACTA\s*(?:N\s*)?(?:RO|R0|º|°|O|0|UMERO|ÚMERO)?\s*[º°.:,;\- ]*([0-9OoIl ]{6,16})/i);
      if (porEtiqueta && porEtiqueta[1]) {
        const numero = normalizarNumero(porEtiqueta[1]).slice(0, 12);
        if (numero.length >= 6) return numero;
      }

      const primerNumeroEnLineaActa = linea.match(/([0-9OoIl ]{6,16})/i);
      if (primerNumeroEnLineaActa && primerNumeroEnLineaActa[1]) {
        const numero = normalizarNumero(primerNumeroEnLineaActa[1]).slice(0, 12);
        if (numero.length >= 6) return numero;
      }
    }

    // Segundo intento: texto plano, por si Tesseract partió el renglón o perdió el punto.
    const plano = limpio.replace(/\n+/g, " ");
    const acta = buscarPrimero(plano, [
      /ACTA\s*(?:NRO|NR0|N\s*RO|N\s*R0|Nº|N°|NO|N0|NUMERO|NÚMERO)\s*[º°.:,;\- ]*([0-9OoIl ]{6,16})/i,
      /ACTA[^0-9OoIl]{0,50}([0-9OoIl ]{6,16})/i,
      /NRO\s*[º°.:,;\- ]*([0-9OoIl ]{6,16})/i,
    ]);
    return normalizarNumero(acta).slice(0, 12);
  }

  function agregarCodigoUnico(codigos, value) {
    const codigo = normalizarNumeroOcrEstricto(value).slice(0, 8);
    if (codigo.length >= 3 && codigo.length <= 6 && !codigos.includes(codigo)) codigos.push(codigo);
  }

  function extraerCodigos(texto) {
    const limpio = normalizarBusqueda(texto);
    const codigos = [];
    const lineas = limpio.split("\n").map((linea) => linea.trim()).filter(Boolean);

    // 1) Línea directa: "Cod: 5041", "Cód. 5041", "Codigo 5041".
    for (const linea of lineas) {
      if (!/\bC[o0ó]d|C[o0ó]digo/i.test(linea)) continue;
      const m = linea.match(/\bC[o0ó]d(?:igo)?\s*[º°.:,;\- ]*([0-9OoIl|SsZzGgBb\s]{3,14})/i);
      if (m && m[1]) agregarCodigoUnico(codigos, m[1]);
    }
    if (codigos.length) return codigos;

    // 2) Bloque INFRACCIONES: buscar solo en pocas líneas para no agarrar DNI/acta.
    const idx = lineas.findIndex((linea) => /INFRACCIONES?/i.test(linea));
    if (idx >= 0) {
      const bloqueLineas = lineas.slice(idx, idx + 8);
      for (const linea of bloqueLineas) {
        const conCod = linea.match(/\bC[o0ó]d(?:igo)?\s*[º°.:,;\- ]*([0-9OoIl|SsZzGgBb\s]{3,14})/i);
        if (conCod && conCod[1]) agregarCodigoUnico(codigos, conCod[1]);
      }
      if (codigos.length) return codigos;

      // 3) Fallback dentro del bloque: primer número de 3 a 6 dígitos después de INFRACCIONES.
      const bloque = bloqueLineas.join(" ");
      const reBloque = /\b([0-9OoIl|SsZzGgBb]{3,6})\b/g;
      let match;
      while ((match = reBloque.exec(bloque))) {
        agregarCodigoUnico(codigos, match[1]);
        if (codigos.length >= 4) break;
      }
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
    return cortarEnEtiquetas(buscarPrimero(limpio, [
      /Juzgado\s*:\s*([^\n]+)/i,
      /Juzqado\s*:\s*([^\n]+)/i,
    ]));
  }

  function extraerLabrante(texto) {
    const limpio = normalizarBusqueda(texto);
    const lineas = limpio.split("\n").map((linea) => linea.trim()).filter(Boolean);
    const candidatos = [];
    for (let i = 0; i < lineas.length; i++) {
      const linea = lineas[i];
      if (/(Firma\s+y\s+aclaracion|N[°º]\s*Dispositivo|Suboficial|Inspector|Oficial|Agente|Policia|Polic[ií]a|Delgado)/i.test(linea)) {
        candidatos.push(linea);
        if (lineas[i + 1]) candidatos.push(lineas[i + 1]);
      }
    }
    const unicos = [];
    candidatos
      .map((v) => v.replace(/^[-.:\s]+/, "").trim())
      .filter((v) => /(SUBOFICIAL|INSPECTOR|OFICIAL|AGENTE|POLICIA|POLICIA|DELGADO|[A-ZÁÉÍÓÚÑ]{3,}\s+[A-ZÁÉÍÓÚÑ]{3,})/i.test(v))
      .forEach((v) => {
        if (v && !unicos.includes(v)) unicos.push(v);
      });
    return unicos.slice(0, 3).join(" / ");
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

  async function cargarImagenADataUrl(file, maxWidth = OCR460_MAX_WIDTH) {
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

    return canvas.toDataURL("image/jpeg", 0.86);
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
