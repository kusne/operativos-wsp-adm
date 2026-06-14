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
  const MARCAS_MOTO_CONOCIDAS = [
    "HONDA", "ZANELLA", "GUERRERO", "SUZUKI", "APPIA", "YAMAHA", "MOTOMEL",
    "CORVEN", "GILERA", "BAJAJ", "KELLER", "MONDIAL", "KYMCO", "BENELLI",
    "KAWASAKI", "BETA", "TVS", "BMW", "KTM", "HERO", "VESPA"
  ];

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

  function charDominioNumero(ch) {
    const c = String(ch || "").toUpperCase();
    if (c === "O" || c === "Q" || c === "D") return "0";
    if (c === "I" || c === "L" || c === "|") return "1";
    if (c === "Z") return "2";
    if (c === "S") return "5";
    if (c === "G") return "6";
    if (c === "B") return "8";
    return c;
  }

  function charDominioLetra(ch) {
    const c = String(ch || "").toUpperCase();
    if (c === "0") return "O";
    if (c === "1") return "I";
    if (c === "2") return "Z";
    if (c === "5") return "S";
    if (c === "6") return "G";
    if (c === "8") return "B";
    return c;
  }

  function normalizarDominio(value) {
    // Para 460/22 trabajamos con motos. Dominio válido:
    // - 6 caracteres: 3 números + 3 letras. Ej: 982CRW
    // - 7 caracteres: 1 letra + 3 números + 3 letras. Ej: A264JDN
    // Se descartan dominios tipo auto y basura pegada de "Tipo".
    const bruto = normalizarMayus(value)
      .replace(/\b(?:TIPO|T1PO|TIP0|MODELO|MARCA|DNI|PROPIETARIO|LUGAR|FECHA)\b.*$/i, "")
      .replace(/[^A-Z0-9]/g, "");

    function formarMoto7(seg) {
      if (!seg || seg.length !== 7) return "";
      const out = charDominioLetra(seg[0])
        + charDominioNumero(seg[1])
        + charDominioNumero(seg[2])
        + charDominioNumero(seg[3])
        + charDominioLetra(seg[4])
        + charDominioLetra(seg[5])
        + charDominioLetra(seg[6]);
      return /^[A-Z][0-9]{3}[A-Z]{3}$/.test(out) ? out : "";
    }

    function formarMoto6(seg) {
      if (!seg || seg.length !== 6) return "";
      const out = charDominioNumero(seg[0])
        + charDominioNumero(seg[1])
        + charDominioNumero(seg[2])
        + charDominioLetra(seg[3])
        + charDominioLetra(seg[4])
        + charDominioLetra(seg[5]);
      return /^[0-9]{3}[A-Z]{3}$/.test(out) ? out : "";
    }

    // Primero probar el comienzo exacto del campo, que normalmente ya viene aislado.
    const directo7 = formarMoto7(bruto.slice(0, 7));
    if (directo7) return directo7;
    const directo6 = formarMoto6(bruto.slice(0, 6));
    if (directo6) return directo6;

    // Si el OCR insertó basura antes/después, escanear ventanas.
    for (let i = 0; i <= Math.max(0, bruto.length - 7); i++) {
      const d = formarMoto7(bruto.slice(i, i + 7));
      if (d) return d;
    }
    for (let i = 0; i <= Math.max(0, bruto.length - 6); i++) {
      const d = formarMoto6(bruto.slice(i, i + 6));
      if (d) return d;
    }
    return "";
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

  function limpiarTextoMarcaModelo(value) {
    return normalizarMayus(value)
      .replace(/\b(?:TIPO|T1PO|TIP0|DOMINIO|DNI|PROPIETARIO|LUGAR|NO\s+PRESENTA)\b.*$/i, "")
      .replace(/[+\-:._;,]/g, " ")
      .replace(/\s{2,}/g, " ")
      .trim();
  }

  function limpiarMarcaOcr(value) {
    let marca = limpiarTextoMarcaModelo(value);
    for (const conocida of MARCAS_MOTO_CONOCIDAS) {
      const re = new RegExp(`(^|\\s)${conocida.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(\\s|$)`, "i");
      if (re.test(marca)) return conocida;
    }
    // Quitar restos OCR típicos: "HONDA NE E", "ZANELLA _", "SUZUKI E E".
    const tokens = marca.split(/\s+/).filter(Boolean);
    while (tokens.length > 1 && tokens[tokens.length - 1].length <= 2) tokens.pop();
    return tokens.join(" ").trim();
  }

  function limpiarModeloOcr(value) {
    let modelo = limpiarTextoMarcaModelo(value);
    // No permitir signos en modelo. Mantener letras/números y espacios.
    modelo = modelo.replace(/[^A-Z0-9 ]/g, " ").replace(/\s{2,}/g, " ").trim();

    // Si hay basura OCR luego del modelo, recortar con patrones frecuentes de motos.
    const conocidos = [
      /\bZB\s*110\b/i, /\bCG\s*150\b/i, /\bGSX\s*150\b/i, /\bWAVE\s*110\s*S\b/i,
      /\bWAVE\s*110\b/i, /\bWAVE\b/i, /\bBREZZA\b/i, /\bG110\b/i
    ];
    for (const patron of conocidos) {
      const m = modelo.match(patron);
      if (m && m[0]) return normalizarMayus(m[0]);
    }

    // Regla general: si después de un token con números quedan letras sueltas OCR, eliminarlas.
    const tokens = modelo.split(/\s+/).filter(Boolean);
    if (tokens.length > 1) {
      let lastUseful = tokens.length - 1;
      for (let i = tokens.length - 1; i >= 0; i--) {
        if (/\d/.test(tokens[i])) {
          lastUseful = i;
          break;
        }
      }
      if (lastUseful < tokens.length - 1) {
        const extras = tokens.slice(lastUseful + 1);
        if (extras.every((t) => t.length <= 2)) return tokens.slice(0, lastUseful + 1).join(" ");
      }
    }
    return modelo;
  }

  function extraerModelo(texto) {
    const limpio = normalizarBusqueda(texto);
    let modelo = buscarPrimero(limpio, [
      /Modelo\s*:\s*([^\n]+)/i,
      /Mode[l1]o\s*:\s*([^\n]+)/i,
    ]);
    modelo = modelo.replace(/\s+Tipo\s*:.*$/i, "").trim();
    return limpiarModeloOcr(cortarEnEtiquetas(modelo));
  }

  function extraerMarca(texto) {
    const limpio = normalizarBusqueda(texto);
    const marca = buscarPrimero(limpio, [
      /Marca\s*:\s*([^\n]+)/i,
      /Mar[cç]a\s*:\s*([^\n]+)/i,
    ]);
    return limpiarMarcaOcr(cortarEnEtiquetas(marca));
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

  function normalizarActaCandidato(value) {
    const raw = String(value || "");
    // Evita falsos positivos como texto de encabezado convertido a números
    // por confusiones OCR. Debe haber suficientes dígitos reales en el candidato.
    if ((raw.match(/\d/g) || []).length < 6) return "";
    let numero = normalizarNumeroOcrEstricto(raw);
    // El número de acta APSV tiene 9 dígitos. Ej: 070544272.
    // En estas actas normalmente inicia con 0; Tesseract a veces lee ese 0 inicial como 9.
    const crudos = numero.match(/\d{9}/g) || [];
    const normalizados = crudos.map((n) => {
      if (/^9\d{8}$/.test(n) && /^97/.test(n)) return "0" + n.slice(1);
      return n;
    });
    const preferido = normalizados.find((n) => /^0\d{8}$/.test(n)) || normalizados[0] || "";
    return preferido || "";
  }

  function extraerActa(texto) {
    const limpio = normalizarBusqueda(texto);
    const lineas = limpio.split("\n").map((linea) => linea.trim()).filter(Boolean);

    // 1) Preferir línea ACTA NRO. No aceptar menos de 9 dígitos para no confundir DNI/códigos.
    const lineasActa = lineas.filter((linea) => /ACTA|NRO|NR0|N[°º]/i.test(linea));
    for (const linea of lineasActa) {
      const normal = linea.replace(/[^A-Z0-9OoQqIl|SsZzGgBb°º.:,;*\s-]/gi, " ");
      const porEtiqueta = normal.match(/ACTA[\s\S]{0,45}?([0-9OoQqIl|SsZzGgBb\s]{8,14})/i);
      if (porEtiqueta && porEtiqueta[1]) {
        const acta = normalizarActaCandidato(porEtiqueta[1]);
        if (acta) return acta;
      }
      const cualquiera = normalizarActaCandidato(normal);
      if (cualquiera) return cualquiera;
    }

    // 2) Barcode/encabezado con asteriscos: *070544272*.
    const porAsterisco = limpio.match(/\*\s*([0-9OoQqIl|SsZzGgBb\s]{8,14})\s*\*/i);
    if (porAsterisco && porAsterisco[1]) {
      const acta = normalizarActaCandidato(porAsterisco[1]);
      if (acta) return acta;
    }

    // 3) Fallback acotado: cualquier secuencia de 9 dígitos que empiece con 0.
    const all = limpio.match(/[0-9OoQqIl|SsZzGgBb]{9}/g) || [];
    for (const cand of all) {
      const acta = normalizarActaCandidato(cand);
      if (acta && /^0\d{8}$/.test(acta)) return acta;
    }
    return "";
  }

  function obtenerSetCodigosNomenclador460() {
    const out = new Set();
    try {
      if (window.WSP?.services?.nomenclador?.listarCodigos) {
        window.WSP.services.nomenclador.listarCodigos().forEach((c) => {
          const clean = String(c || "").replace(/\D+/g, "");
          if (/^\d{4,5}$/.test(clean)) out.add(clean);
        });
      }
    } catch (error) {
      console.warn("[WSP OCR 460] No se pudo leer nomenclador desde servicio.", error);
    }

    try {
      if (window.NOMENCLADOR_CODIGOS && typeof window.NOMENCLADOR_CODIGOS === "object") {
        Object.keys(window.NOMENCLADOR_CODIGOS).forEach((key) => {
          const clean = String(key || "").replace(/\D+/g, "");
          if (/^\d{4,5}$/.test(clean)) out.add(clean);
        });
      }
    } catch (error) {
      console.warn("[WSP OCR 460] No se pudo leer NOMENCLADOR_CODIGOS.", error);
    }

    // Fallback mínimo para códigos que aparecen en las actas 460 probadas.
    ["4084", "5011", "5038", "5041", "9119", "11029", "13018"].forEach((c) => out.add(c));
    return out;
  }

  function existeCodigoNomenclador460(codigo, setCodigos) {
    const clean = String(codigo || "").replace(/\D+/g, "");
    if (!/^\d{4,5}$/.test(clean)) return false;
    if (setCodigos && setCodigos.has(clean)) return true;
    try {
      if (window.WSP?.services?.nomenclador?.existeCodigo) return !!window.WSP.services.nomenclador.existeCodigo(clean);
    } catch {}
    try {
      if (typeof window.getNomencladorFalta === "function") return !!window.getNomencladorFalta(clean);
    } catch {}
    return false;
  }

  function normalizarCodigoOCRCorto(value) {
    return String(value || "")
      .toUpperCase()
      .replace(/[OoQ]/g, "0")
      .replace(/[Il|]/g, "1")
      .replace(/[Z]/g, "2")
      .replace(/[^0-9]/g, "");
  }

  function candidatosCodigoDesdeTexto(value) {
    const raw = String(value || "").toUpperCase();
    const candidatos = [];

    // Captura la primera secuencia inmediatamente posterior a Cod/Cód, sin comerse texto de la infracción.
    // Permite OCR típico: Cod:5041, Cqd:4084, C0d:9119, Cod : 5 041.
    const m = raw.match(/(?:C\s*[O0ÓQ]\s*[DCL]|C0D|CODIGO|C[O0ÓQ]DIGO)\s*[º°.:,;\- ]*([0-9OQIL|ZSGB\s]{4,9})/i);
    if (m && m[1]) {
      const compacto = normalizarCodigoOCRCorto(m[1]);
      if (compacto) {
        if (compacto.length >= 5) candidatos.push(compacto.slice(0, 5));
        if (compacto.length >= 4) candidatos.push(compacto.slice(0, 4));
        const grupos = compacto.match(/\d{4,5}/g) || [];
        grupos.forEach((g) => candidatos.push(g));
      }
    }

    // Si se perdió completamente el prefijo Cod, aceptar número al inicio de la línea de infracción.
    const inicio = raw.match(/^\s*([0-9OQIL|ZSGB]{4,5})\b/i);
    if (inicio && inicio[1]) candidatos.push(normalizarCodigoOCRCorto(inicio[1]));

    // Agregar variantes por eliminación de un dígito extra OCR: 40841 -> 4084.
    const extendidos = [];
    for (const c of candidatos) {
      if (/^\d{5}$/.test(c)) {
        for (let i = 0; i < c.length; i++) extendidos.push(c.slice(0, i) + c.slice(i + 1));
      }
      extendidos.push(c);
    }

    return Array.from(new Set(extendidos.filter((c) => /^\d{4,5}$/.test(c))));
  }

  function codigoPorTextoInfraccion(linea) {
    const t = sinAcentos(String(linea || "").toUpperCase()).replace(/\s+/g, " ");
    const out = [];

    // Fallback semántico acotado a frases habituales del acta. Sirve cuando OCR rompe "Cod" o agrega dígitos.
    if (/CASCO|BANDOLERA|CHALECO/.test(t)) out.push("4084");
    if (/COBERTURA DE SEGURO|SEGURO OBLIGATORIO VIGEN/.test(t)) out.push("5041");
    if (/COMPROBANTE DEL SEGURO/.test(t)) out.push("5038");
    if (/HABILITAD/.test(t)) out.push("9119");
    if (/(NO EXHIB|EXHIBIR).*(LICENCIA|DOCUMENTACION|DOCUMENTO|CEDULA)|LICENCIA DE CONDUCTOR O CUALQUIER OTRA/.test(t)) out.push("5011");
    if (/PLACAS DE IDENTIFICACION|SIN LAS PLACAS|DOMINIO CORRESPONDIENTES/.test(t)) out.push("11029");
    if (/REVISION TECNICA|RTO\b/.test(t)) out.push("13018");

    return out;
  }

  function agregarCodigoUnico(codigos, codigo, setCodigos) {
    const clean = String(codigo || "").replace(/\D+/g, "");
    if (!/^\d{4,5}$/.test(clean)) return false;
    if (!existeCodigoNomenclador460(clean, setCodigos)) return false;
    if (!codigos.includes(clean)) codigos.push(clean);
    return true;
  }

  function extraerBloqueInfracciones(lineas) {
    const idx = lineas.findIndex((linea) => /INFRACCIONES?|INFRACCI0NES?|INFRACC1ONES?/i.test(linea));
    if (idx < 0) return [];
    const out = [];
    for (let i = idx + 1; i < Math.min(lineas.length, idx + 22); i++) {
      const linea = lineas[i];
      if (/^(Observaciones|Medidas\s+Cautelares|Retiene\s+Licencia|Secuestra\s+Veh[iíi]culo|Otra\s+Medida|Juzgado|Firma)\b/i.test(linea)) break;
      out.push(linea);
    }
    return out;
  }

  function unirLineasInfraccionesPartidas(bloqueLineas) {
    const out = [];
    for (const lineaRaw of bloqueLineas || []) {
      const linea = String(lineaRaw || "").trim();
      if (!linea) continue;
      const esNueva = /(?:C\s*[O0ÓQ]\s*[DCL]|C0D|CODIGO|C[O0ÓQ]DIGO)\s*[º°.:,;\- ]*[0-9OQIL|ZSGB]/i.test(linea) || /^\s*[0-9OQIL|ZSGB]{4,5}\b/i.test(linea);
      if (esNueva || !out.length) out.push(linea);
      else out[out.length - 1] += " " + linea;
    }
    return out;
  }

  function extraerCodigos(texto) {
    const limpio = normalizarBusqueda(texto);
    const codigos = [];
    const setCodigos = obtenerSetCodigosNomenclador460();
    const lineas = limpio.split("\n").map((linea) => linea.trim()).filter(Boolean);
    const bloqueLineas = unirLineasInfraccionesPartidas(extraerBloqueInfracciones(lineas));

    // Primera pasada: extraer candidatos numéricos vinculados a cada línea del bloque INFRACCIONES.
    for (const linea of bloqueLineas) {
      const candidatos = candidatosCodigoDesdeTexto(linea);
      let agrego = false;
      for (const candidato of candidatos) {
        if (agregarCodigoUnico(codigos, candidato, setCodigos)) agrego = true;
      }

      // Segunda pasada: si el número OCR vino roto, usar el texto de la infracción para resolverlo.
      // También agrega códigos faltantes cuando una línea trae texto claro pero número inválido.
      const porTexto = codigoPorTextoInfraccion(linea);
      for (const codigo of porTexto) {
        if (agregarCodigoUnico(codigos, codigo, setCodigos)) agrego = true;
      }

      if (codigos.length >= 6) break;
    }

    // Fallback final, igualmente validado contra nomenclador: si el OCR no mantuvo saltos de línea.
    if (!codigos.length) {
      const bloque = bloqueLineas.length ? bloqueLineas.join("\n") : limpio;
      const partes = bloque.split(/(?=C\s*[O0ÓQ]\s*[DCL]\s*[º°.:,;\- ]*[0-9OQIL|ZSGB]|C0D\s*[º°.:,;\- ]*[0-9OQIL|ZSGB]|CODIGO\s*[º°.:,;\- ]*[0-9OQIL|ZSGB])/i);
      for (const parte of partes) {
        for (const candidato of candidatosCodigoDesdeTexto(parte)) agregarCodigoUnico(codigos, candidato, setCodigos);
        for (const codigo of codigoPorTextoInfraccion(parte)) agregarCodigoUnico(codigos, codigo, setCodigos);
        if (codigos.length >= 6) break;
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
