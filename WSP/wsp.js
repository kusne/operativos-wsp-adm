// ===== CONFIG SUPABASE (SOLO LECTURA WSP) ===== 
const SUPABASE_URL = "https://ugeydxozfewzhldjbkat.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_ZeLC2rOxhhUXlQdvJ28JkA_qf802-pX";

(function () {
  // ===== DOM refs =====
  const elToggleCarga = document.getElementById("toggleCarga");
  const elBloqueCarga = document.getElementById("bloqueCargaOrdenes");
  const elImportBox = document.getElementById("importBox");
  const btnCargarOrdenes = document.getElementById("btnCargarOrdenes");

  const selTipo = document.getElementById("tipo");
  const selOrden = document.getElementById("orden");
  const selHorario = document.getElementById("horario");

  const divFinaliza = document.getElementById("finaliza");
  const divDetalles = document.getElementById("bloqueDetalles");

  const btnEnviar = document.getElementById("btnEnviar");

  // ===== Estado =====
  let ordenSeleccionada = null;
  let franjaSeleccionada = null;
  let syncingOrdenes = false;
  // ======================================================
  // ===== LECTURA DESDE SUPABASE (FUENTE REAL) ============
  // ======================================================
  async function syncOrdenesDesdeServidor() {
    try {
      // Lee EXACTAMENTE la fila id=1 (misma que actualiza el ADM)
      const url = new URL(`${SUPABASE_URL}/rest/v1/ordenes_store`);
      url.searchParams.set("id", "eq.1");
      url.searchParams.set("select", "payload");
      //url.searchParams.set("ts", String(Date.now())); // anti-cache

      const r = await fetch(url.toString(), {
        method: "GET",
        cache: "no-store",
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: "Bearer " + SUPABASE_ANON_KEY,
          Accept: "application/json"
        }
      });

      if (!r.ok) {
        const txt = await r.text().catch(() => "");
        console.error("Supabase WSP NO OK:", r.status, txt);
        console.error("URL usada:", url.toString());
        return false;
      }

      const data = await r.json();

      // Esperamos: [{ payload: [...] }]
      const payload = Array.isArray(data) ? data[0]?.payload : null;
      if (!Array.isArray(payload)) {
        console.error("Supabase WSP: payload inválido. Data:", data);
        return false;
      }

      StorageApp.guardarOrdenes(payload);
      return true;

    } catch (e) {
      console.error("Error leyendo Supabase:", e);
      return false;
    }
  }


    

async function syncAntesDeSeleccion() {
  if (syncingOrdenes) return;
  syncingOrdenes = true;

  const ok = await syncOrdenesDesdeServidor();
  if (ok) {
    cargarOrdenesDisponibles();
    limpiarSeleccionOrden();
  }

  syncingOrdenes = false;
}

  // ===== UI =====
  function toggleCargaOrdenes() {
    elBloqueCarga.classList.toggle("hidden", !elToggleCarga.checked);
  }

  function limpiarSeleccionOrden() {
    ordenSeleccionada = null;
    franjaSeleccionada = null;
    selOrden.value = "";
    selHorario.innerHTML = '<option value="">Seleccionar horario</option>';
  }

  function importarOrdenes() {
    const texto = elImportBox.value.trim();
    if (!texto) return;

    let data;
    try { data = JSON.parse(texto); }
    catch { return; }

    if (!Array.isArray(data)) return;

    StorageApp.guardarOrdenes(data);
    cargarOrdenesDisponibles();
    limpiarSeleccionOrden();
  }

  // ===== Guardia =====
  function getGuardiaInicio() {
    const now = new Date();
    const start = new Date(now);
    start.setHours(6, 0, 0, 0);
    if (now < start) start.setDate(start.getDate() - 1);
    return start;
  }

  function extraerHoraInicio(h) {
    const m = String(h || "").match(/(\d{1,2})/);
    if (!m) return null;
    const n = parseInt(m[1], 10);
    return (n >= 0 && n <= 23) ? n : null;
  }

  function franjaEnGuardia(h) {
    const hi = extraerHoraInicio(h);
    if (hi === null) return true;

    const inicio = getGuardiaInicio();
    const fin = new Date(inicio.getTime() + 86400000);
    const f = new Date(inicio);
    f.setHours(hi, 0, 0, 0);
    if (f < inicio) f.setDate(f.getDate() + 1);
    return f >= inicio && f < fin;
  }

  function cargarOrdenesDisponibles() {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    let ordenes = OrdersSync.filtrarCaducadas(StorageApp.cargarOrdenes());
    StorageApp.guardarOrdenes(ordenes);

    selOrden.innerHTML = '<option value="">Seleccionar</option>';

    ordenes.forEach((o, i) => {
      const v = Dates.parseVigenciaToDate(o.vigencia);
      if (!v || v > hoy) return;
      if (!o.franjas?.some(f => franjaEnGuardia(f.horario))) return;

      const op = document.createElement("option");
      op.value = i;
      op.text = `${o.num} ${o.textoRef || ""}`.trim();
      selOrden.appendChild(op);
    });
  }

  function cargarHorariosOrden() {
    ordenSeleccionada = null;
    franjaSeleccionada = null;

    const ordenes = StorageApp.cargarOrdenes();
    const idx = Number(selOrden.value);
    if (!ordenes[idx]) return;

    ordenSeleccionada = ordenes[idx];
    selHorario.innerHTML = '<option value="">Seleccionar horario</option>';

    ordenSeleccionada.franjas.forEach((f, i) => {
      if (franjaEnGuardia(f.horario)) {
        const o = document.createElement("option");
        o.value = i;
        o.text = f.horario;
        selHorario.appendChild(o);
      }
    });
  }

  function actualizarDatosFranja() {
    if (!ordenSeleccionada) return;
    franjaSeleccionada = ordenSeleccionada.franjas[Number(selHorario.value)] || null;
  }

  function actualizarTipo() {
    const fin = selTipo.value === "FINALIZA";
    divFinaliza.classList.toggle("hidden", !fin);
    divDetalles.classList.toggle("hidden", !fin);
  }

  // ======================================================
  // ===== FUNCIONES QUE FALTABAN (CLAVE) =================
  // ======================================================
  function seleccion(clase) {
    return Array.from(document.querySelectorAll("." + clase + ":checked"))
      .map(e => e.value)
      .join("\n");
  }

  function seleccionLinea(clase, sep) {
    const v = Array.from(document.querySelectorAll("." + clase + ":checked"))
      .map(e => e.value);
    return v.length ? v.join(" " + sep + " ") : "/";
  }
  function normalizarTextoWhatsApp(texto) {
  return texto
    // pasar todo a minúscula
    .toLowerCase()

    // quitar símbolos no permitidos
    .replace(/[*_\-•—–]/g, "")
    .replace(/[.]{2,}/g, ".")

    // normalizar espacios
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")

    // capitalizar inicio de oración
    .replace(/(^|\n|\.\s+)([a-záéíóúñ])/g, (m, p1, p2) => {
      return p1 + p2.toUpperCase();
    })

    .trim();
}
// ===== NORMALIZADORES DE SALIDA (SOLO WSP) =====
function normalizarTituloOperativo(txt) {
  if (!txt) return "";

  let t = txt.toLowerCase().trim();

  // Capitalizar palabras
  t = t.replace(/\b\w/g, l => l.toUpperCase());

  // Normalizar OP
  t = t.replace(
    /\b(o\.?\s*op\.?|op)\s*0*(\d+\/\d+)\b/i,
    "O.Op. $2"
  );

  return t;
}

function normalizarLugar(txt) {
  if (!txt) return "";
  return txt
    .toLowerCase()
    .trim()
    .replace(/\b\w/g, l => l.toUpperCase());
}

function normalizarHorario(txt) {
  if (!txt) return "";

  let t = txt.toLowerCase().replace(/\s+/g, " ").trim();

  // Solo Finalizar con mayúscula
  t = t.replace(/\bfinalizar\b/g, "Finalizar");

  return t;
}
function resetUI() {
  // estado interno
  ordenSeleccionada = null;
  franjaSeleccionada = null;

  // selects
  selTipo.value = "";
  selOrden.value = "";
  selHorario.innerHTML = '<option value="">Seleccionar horario</option>';

  // checkboxes
  document
    .querySelectorAll('input[type="checkbox"]')
    .forEach(c => (c.checked = false));

  // inputs numéricos y textos
  document
    .querySelectorAll('input[type="number"], input[type="text"], textarea')
    .forEach(i => (i.value = ""));

  // observaciones default
  const obs = document.getElementById("obs");
  if (obs) obs.value = "";

  // ocultar bloques dependientes
  divFinaliza.classList.add("hidden");
  divDetalles.classList.add("hidden");
}
function haySeleccion(clase) {
  return document.querySelectorAll("." + clase + ":checked").length > 0;
}
// ===== ENVIAR A WHATSAPP =====
function enviar() { 
  if (!ordenSeleccionada || !franjaSeleccionada)return;
    
  if (!seleccion("personal")) {
    alert("Debe seleccionar personal policial.");
    return;
  }
  if (seleccionLinea("movil", "/") === "/") {
    alert("Debe seleccionar al menos un móvil.");
    return;
  }
  const fecha = new Date().toLocaleDateString("es-AR");

  let bloqueResultados = "";
  let textoDetalles = "";
  // ⬇️ SOLO si es FINALIZA agregamos los numerales
  if (selTipo.value === "FINALIZA") {
    const vehiculos = document.getElementById("vehiculos")?.value || 0;
    const personas = document.getElementById("personas")?.value || 0;
    const testalom = document.getElementById("testalom")?.value || 0;
    const alco = document.getElementById("Alcotest")?.value || 0;
    const posSan = document.getElementById("positivaSancionable")?.value || 0;
    const posNo = document.getElementById("positivaNoSancionable")?.value || 0;
    const actas = document.getElementById("actas")?.value || 0;
    const requisa = document.getElementById("Requisa")?.value || 0;
    const qrz = document.getElementById("qrz")?.value || 0;
    const dominio = document.getElementById("dominio")?.value || 0;

    const remision = document.getElementById("Remision")?.value || 0;
    const retencion = document.getElementById("Retencion")?.value || 0;
    const prohibicion = document.getElementById("Prohibicion")?.value || 0;
    const cesion = document.getElementById("Cesion")?.value || 0;
    
    
    
    
    bloqueResultados =
`Resultados:
Vehículos Fiscalizados: (${vehiculos})
Personas Identificadas: (${personas})
Test de Alómetro: (${testalom})
Test de Alcoholímetro: (${alco})
Positiva Sancionable: (${posSan})
Positiva no Sancionable: (${posNo})
Actas Labradas: (${actas})
Requisas: (${requisa})
Qrz: (${qrz})
Dominio: (${dominio})
Medidas Cautelares:
Remisión: (${remision})
Retención: (${retencion})
Prohibición de Circulación: (${prohibicion})
Cesión de Conducción: (${cesion})
`;
 const detallesTexto = document.getElementById("detalles")?.value?.trim();
 if (detallesTexto) {
    textoDetalles =
`Detalles:
${detallesTexto}
`;
    }
  }
  const texto =
`Policia de la Provincia de Santa Fe - Guardia Provincial
Brigada Motorizada Centro Norte
Tercio Charly
${selTipo.value.charAt(0) + selTipo.value.slice(1).toLowerCase()} ${normalizarTituloOperativo(franjaSeleccionada.titulo)} ${ordenSeleccionada.num}
Fecha: ${fecha}
Horario: ${normalizarHorario(franjaSeleccionada.horario)}
Lugar: ${normalizarLugar(franjaSeleccionada.lugar)}
Personal Policial:
${seleccion("personal")}
Móviles: ${seleccionLinea("movil", "/")}
Elementos:
Escopetas: ${seleccionLinea("ESCOPETA", "/")}
Ht: ${seleccionLinea("HT", "/")}
Pda: ${seleccionLinea("PDA", "/")}
Impresoras: ${seleccionLinea("IMPRESORA", "/")}
Alómetros: ${seleccionLinea("Alometro", "/")}
Alcoholímetros: ${seleccionLinea("Alcoholimetro", "/")}
${bloqueResultados}
${textoDetalles}
Observaciones:
${document.getElementById("obs")?.value || "Sin novedad"}`;

  
  const textoFinal = texto.replace(/\n{2,}/g, "\n");
  // 🔹 RESET DE LA UI
  resetUI();
  // 🔹 ENVÍO A WHATSAPP
  // 🔹 permitir repaint antes de salir
  setTimeout(() => {
    window.location.href =
      "https://wa.me/?text=" + encodeURIComponent(textoFinal);
  }, 0);
 }

  // ===== Eventos =====
  elToggleCarga.addEventListener("change", toggleCargaOrdenes);
  btnCargarOrdenes.addEventListener("click", importarOrdenes);
  selOrden.addEventListener("focus", syncAntesDeSeleccion);
  selOrden.addEventListener("mousedown", syncAntesDeSeleccion);
  selOrden.addEventListener("click", syncAntesDeSeleccion);
  selOrden.addEventListener("touchstart", syncAntesDeSeleccion, { passive: true });  
  selOrden.addEventListener("change", cargarHorariosOrden);
    
  selHorario.addEventListener("change", actualizarDatosFranja);
  selTipo.addEventListener("change", actualizarTipo);
  btnEnviar.addEventListener("click", enviar);
  

  // ===== Init =====
  (async function init() {
    toggleCargaOrdenes();
    actualizarTipo();
    await syncOrdenesDesdeServidor();
    cargarOrdenesDisponibles();
  })();
})();


























































