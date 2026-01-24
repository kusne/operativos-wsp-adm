// ===== PUENTE GLOBAL (NO SE ROMPE CON DOMContentLoaded NI CON PISADAS) =====
window.agregarOrden = function () {
  if (typeof window.__adm_agregarOrden === "function") return window.__adm_agregarOrden();
  alert("ADM no inicializó agregarOrden. Hacé Ctrl+F5.");
};

window.publicarOrdenes = function () {
  if (typeof window.__adm_publicarOrdenes === "function") return window.__adm_publicarOrdenes();
  alert("ADM no inicializó publicarOrdenes. Hacé Ctrl+F5.");
};

console.log("ADM/adm.js cargado OK - puente global activo");

// ===== CONFIG SUPABASE (SOLO ADM) =====
const SUPABASE_URL = "https://ugeydxozfewzhldjbkat.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_ZeLC2rOxhhUXlQdvJ28JkA_qf802-pX";
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ===== NORMALIZADORES PARA PUBLICACIÓN =====
function isoToLatam(iso) {
  // "2026-01-20" -> "20/01/2026"
  const m = String(iso || "").match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return iso || "";
  return `${m[3]}/${m[2]}/${m[1]}`;
}

function normalizarOrdenParaPublicar(o) {
  // copia defensiva
  const out = { ...o };

  // vigencia viene de <input type="date"> => ISO
  out.vigencia = isoToLatam(out.vigencia);

  // (opcional) si tuvieras caducidad ISO también, aplicalo igual:
  // out.caducidad = isoToLatam(out.caducidad);

  // asegurar franjas array
  if (Array.isArray(out.franjas)) {
    out.franjas = out.franjas.map(f => ({ ...f }));
  } else {
    out.franjas = [];
  }

  return out;
}

// ======================================================
// TODO EL CÓDIGO DEPENDIENTE DEL DOM VA ACÁ
// ======================================================
document.addEventListener("DOMContentLoaded", async () => {

  // ===== CONTENEDORES LOGIN / ADM =====
  const loginContainer = document.getElementById("loginContainer");
  const admContainer = document.getElementById("admContainer");

  // ===== LOGIN ELEMENTS =====
  const btnLogin = document.getElementById("btnLogin");
  const btnForgot = document.getElementById("btnForgot");
  const loginEmail = document.getElementById("loginEmail");
  const loginPassword = document.getElementById("loginPassword");
  const loginError = document.getElementById("loginError");

  // ===== ADM ELEMENTS =====
  const chkFinalizar = document.getElementById("aFinalizarCheckbox");
  const fechaCaducidadInput = document.getElementById("fechaCaducidad");
  const numOrdenEl = document.getElementById("numOrden");
  const textoRefEl = document.getElementById("textoRef");
  const franjasEl = document.getElementById("franjas");
  const fechaVigenciaEl = document.getElementById("fechaVigencia");
  const selectOrdenExistente = document.getElementById("ordenExistente");
  const btnPublicar = document.getElementById("btnPublicarOrdenes");

  // ===== EXPORT / IMPORT TOGGLE =====
  const toggleExportImport = document.getElementById("toggleExportImport");
  const exportImportContainer = document.getElementById("exportImportContainer");
  if (toggleExportImport && exportImportContainer) {
    toggleExportImport.addEventListener("change", () => {
      exportImportContainer.classList.toggle("hidden", !toggleExportImport.checked);
    });
  }

  // ===== LOGOUT =====
  const btnLogout = document.getElementById("btnLogout");
  if (btnLogout) {
    btnLogout.addEventListener("click", async () => {
      await supabaseClient.auth.signOut();
      // volver al login
      if (admContainer) admContainer.style.display = "none";
      if (loginContainer) loginContainer.style.display = "block";
    });
  }

  // ======================================================
  // ESTADO DE CAMBIOS / PUBLICACIÓN
  // ======================================================
  let cambiosId = 0;
  let ultimoPublicadoId = 0;
  let ordenSeleccionadaIdx = null;

  function marcarCambio() {
    cambiosId++;
    actualizarEstadoPublicar();
  }

  function puedePublicar() {
    return cambiosId > ultimoPublicadoId;
  }

  function actualizarEstadoPublicar() {
    if (!btnPublicar) return;
    const habilitado = puedePublicar();
    btnPublicar.dataset.canPublish = habilitado ? "1" : "0";
    btnPublicar.classList.toggle("disabled", !habilitado);
  }

  // ======================================================
  // PARSE FRANJAS (HORARIO - LUGAR - TÍTULO)
  // ======================================================
  function parseFranjas(raw) {
    const lines = String(raw || "")
      .split("\n")
      .map(x => x.trim())
      .filter(Boolean);

    const out = [];
    const re = /^(.*?)\s*[-–—]\s*(.*?)\s*[-–—]\s*(.*?)$/;

    for (let i = 0; i < lines.length; i++) {
      const m = re.exec(lines[i]);
      if (!m) return { ok: false, error: `Error en franja ${i + 1}` };
      out.push({ horario: m[1].trim(), lugar: m[2].trim(), titulo: m[3].trim() });
    }

    return out.length ? { ok: true, franjas: out } : { ok: false, error: "Franjas vacías" };
  }

  // ======================================================
  // SELECTOR: ACTUALIZAR LISTA DE ÓRDENES
  // ======================================================
  function actualizarSelector() {
    if (!selectOrdenExistente) return;
    if (typeof StorageApp === "undefined" || !StorageApp.cargarOrdenes) {
      console.error("StorageApp no disponible. No se puede cargar selector.");
      return;
    }

    const ordenes = StorageApp.cargarOrdenes();
    selectOrdenExistente.innerHTML = "";

    const optVacio = document.createElement("option");
    optVacio.value = "";
    optVacio.text = "";
    selectOrdenExistente.appendChild(optVacio);

    ordenes.forEach((o, i) => {
      if (!o || !o.num) return;
      const opt = document.createElement("option");
      opt.value = String(i);
      opt.text = `${o.num} ${o.textoRef || ""}`.trim();
      selectOrdenExistente.appendChild(opt);
    });

    selectOrdenExistente.value = "";
  }

  // ======================================================
  // LIMPIAR CAMPOS
  // ======================================================
  function limpiarCampos() {
    if (numOrdenEl) numOrdenEl.value = "";
    if (textoRefEl) textoRefEl.value = "";
    if (franjasEl) franjasEl.value = "";
    if (fechaVigenciaEl) fechaVigenciaEl.value = "";
    if (fechaCaducidadInput) fechaCaducidadInput.value = "";
    if (chkFinalizar) chkFinalizar.checked = false;
    ordenSeleccionadaIdx = null;
    if (selectOrdenExistente) selectOrdenExistente.value = "";
  }

  // ======================================================
  // LIMPIAR ÓRDENES CADUCADAS
  // ======================================================
  function limpiarOrdenesCaducadas() {
    if (typeof StorageApp === "undefined" || !StorageApp.cargarOrdenes || !StorageApp.guardarOrdenes) return;
    if (typeof OrdersSync === "undefined" || !OrdersSync.filtrarCaducadas) return;

    const ordenes = StorageApp.cargarOrdenes();
    const filtradas = OrdersSync.filtrarCaducadas(ordenes);
    StorageApp.guardarOrdenes(filtradas);
  }

  // ======================================================
  // AGREGAR / ACTUALIZAR ORDEN
  // ======================================================
  function agregarOrden() {
    if (typeof StorageApp === "undefined" || !StorageApp.cargarOrdenes || !StorageApp.guardarOrdenes) {
      alert("Error: StorageApp no está disponible.");
      return;
    }

    const num = (numOrdenEl?.value || "").trim();
    const textoRef = (textoRefEl?.value || "").trim();
    const vigencia = (fechaVigenciaEl?.value || "").trim();
    const caducidad = (fechaCaducidadInput?.value || "").trim();
    const rawFranjas = (franjasEl?.value || "").trim();

    if (!num) return alert("Número de Orden: obligatorio");
    if (!vigencia) return alert("Fecha de Vigencia: obligatoria");
    if (!caducidad) return alert("Fecha de Caducidad: obligatoria (o A FINALIZAR)");
    if (!rawFranjas) return alert("Franjas: obligatorias");

    const parsed = parseFranjas(rawFranjas);
    if (!parsed.ok) return alert(parsed.error || "Error en franjas");

    const nueva = { num, textoRef, vigencia, caducidad, franjas: parsed.franjas };

    const ordenes = StorageApp.cargarOrdenes();
    if (ordenSeleccionadaIdx !== null && ordenes[ordenSeleccionadaIdx]) {
      ordenes[ordenSeleccionadaIdx] = nueva;
    } else {
      ordenes.push(nueva);
    }
    StorageApp.guardarOrdenes(ordenes);

    actualizarSelector();
    limpiarCampos();
    marcarCambio();

    alert("Orden guardada.");
  }

  // Enlace al puente global
  window.__adm_agregarOrden = agregarOrden;

  // ======================================================
  // FINALIZAR / CADUCIDAD
  // ======================================================
  if (typeof CaducidadFinalizar !== "undefined") {
    CaducidadFinalizar.bindAFinalizar({
      checkboxEl: chkFinalizar,
      inputEl: fechaCaducidadInput
    });
  }

  // ======================================================
  // SELECT ORDEN EXISTENTE
  // ======================================================
  if (selectOrdenExistente) {
    selectOrdenExistente.addEventListener("change", () => {
      const v = selectOrdenExistente.value;
      if (v === "") {
        limpiarCampos();
        return;
      }

      const idx = Number(v);
      if (isNaN(idx)) return;

      const ordenes = StorageApp.cargarOrdenes();
      const o = ordenes[idx];
      if (!o) return;

      ordenSeleccionadaIdx = idx;

      if (numOrdenEl) numOrdenEl.value = o.num || "";
      if (textoRefEl) textoRefEl.value = o.textoRef || "";
      if (fechaVigenciaEl) fechaVigenciaEl.value = o.vigencia || "";
      if (fechaCaducidadInput) fechaCaducidadInput.value = o.caducidad || "";

      if (franjasEl) {
        franjasEl.value = (o.franjas || [])
          .map(f => `${f.horario} - ${f.lugar} - ${f.titulo}`)
          .join("\n");
      }
    });
  }

  // ======================================================
  // ELIMINAR ORDEN (con confirmación)
  // ======================================================
  const btnEliminar = document.getElementById("btnEliminar");

  function eliminarOrden() {
    // 1) Validar selección
    if (ordenSeleccionadaIdx === null || ordenSeleccionadaIdx === undefined) {
      alert("Primero seleccioná una orden para eliminar.");
      return;
    }

    if (typeof StorageApp === "undefined" || !StorageApp.cargarOrdenes || !StorageApp.guardarOrdenes) {
      alert("Error: StorageApp no está disponible.");
      return;
    }

    const ordenes = StorageApp.cargarOrdenes();
    const o = ordenes[ordenSeleccionadaIdx];

    if (!o) {
      alert("La orden seleccionada no existe (puede haber cambiado).");
      ordenSeleccionadaIdx = null;
      actualizarSelector();
      limpiarCampos();
      return;
    }

    // 2) Confirmar
    const ok = confirm(`¿Está seguro de eliminar la orden "${o.num}"?`);
    if (!ok) return;

    // 3) Eliminar
    ordenes.splice(ordenSeleccionadaIdx, 1);
    StorageApp.guardarOrdenes(ordenes);

    // 4) Reset UI
    ordenSeleccionadaIdx = null;
    limpiarCampos();
    actualizarSelector();

    // 5) Marcar cambio (para habilitar Publicar)
    marcarCambio();

    alert("Orden eliminada.");
  }

  // Soporta HTML con onclick="eliminarOrden()"
  window.eliminarOrden = eliminarOrden;

  // Soporta botón con id="btnEliminar"
  if (btnEliminar) {
    btnEliminar.addEventListener("click", (e) => {
      e.preventDefault();
      eliminarOrden();
    });
  }

  // ======================================================
  // PUBLICAR ÓRDENES (REPARADO)
  // ======================================================
  async function publicarOrdenes() {
    if (!puedePublicar()) {
      alert("Primero cargue una orden");
      return;
    }
    if (typeof StorageApp === "undefined" || !StorageApp.cargarOrdenes) {
      alert("Error: StorageApp no está disponible para publicar.");
      return;
    }

    // Verificar sesión real (RLS write suele exigir authenticated)
    const { data: sessionData, error: sessionErr } = await supabaseClient.auth.getSession();
    const session = sessionData?.session;

    if (sessionErr || !session) {
      console.error("[ADM] No hay sesión válida:", sessionErr);
      alert("No hay sesión iniciada. Inicie sesión antes de publicar.");
      return;
    }

    const ordenes = StorageApp.cargarOrdenes();
    console.log("[ADM] ordenes a publicar:", Array.isArray(ordenes) ? ordenes.length : "no-array", ordenes);

    if (!Array.isArray(ordenes) || ordenes.length === 0) {
      alert("No hay órdenes cargadas para publicar.");
      return;
    }

    // ✅ Normalizar vigencia ISO -> DD/MM/YYYY antes de publicar
    const payloadPublicar = ordenes.map(normalizarOrdenParaPublicar);
    console.log("[ADM] primera orden normalizada:", payloadPublicar[0]);

    // ✅ Upsert robusto en id=1
    const { data, error } = await supabaseClient
      .from("ordenes_store")
      .upsert(
        { id: 1, payload: payloadPublicar, updated_at: new Date().toISOString() },
        { onConflict: "id" }
      )
      .select("id, updated_at");

    if (error) {
      console.error("[ADM] Error publicando:", error);
      alert("Error publicando: " + error.message);
      return;
    }

    console.log("[ADM] Publicado OK:", data);

    // Readback (para confirmar que quedó guardado)
    const { data: rb, error: rbErr } = await supabaseClient
      .from("ordenes_store")
      .select("id, updated_at, payload")
      .eq("id", 1)
      .single();

    if (rbErr) {
      console.warn("[ADM] Readback error:", rbErr);
    } else {
      console.log("[ADM] READBACK:", rb);
    }

    ultimoPublicadoId = cambiosId;
    actualizarEstadoPublicar();
    alert("Órdenes publicadas.");
  }

  // Enlace al puente global
  window.__adm_publicarOrdenes = publicarOrdenes;

  // ======================================================
  // CONTROL DE SESIÓN + INIT
  // ======================================================
  function initAdm() {
    limpiarOrdenesCaducadas();
    actualizarSelector();
    cambiosId = 0;
    ultimoPublicadoId = 0;
    actualizarEstadoPublicar();
  }

  const { data: { session }, error } = await supabaseClient.auth.getSession();

  if (error || !session) {
    if (loginContainer) loginContainer.style.display = "block";
    if (admContainer) admContainer.style.display = "none";
  } else {
    if (loginContainer) loginContainer.style.display = "none";
    if (admContainer) admContainer.style.display = "block";
    initAdm();
  }

  // ======================================================
  // LOGIN
  // ======================================================
  if (btnLogin) {
    btnLogin.addEventListener("click", async () => {
      if (loginError) loginError.style.display = "none";

      const email = (loginEmail?.value || "").trim();
      const password = (loginPassword?.value || "").trim();

      if (!email || !password) {
        if (loginError) {
          loginError.textContent = "Complete email y contraseña";
          loginError.style.display = "block";
        }
        return;
      }

      const { error } = await supabaseClient.auth.signInWithPassword({ email, password });

      if (error) {
        if (loginError) {
          loginError.textContent = "Credenciales inválidas";
          loginError.style.display = "block";
        }
        return;
      }

      if (loginContainer) loginContainer.style.display = "none";
      if (admContainer) admContainer.style.display = "block";
      initAdm();
    });
  }

  // ======================================================
  // OLVIDÉ MI CONTRASEÑA
  // ======================================================
  if (btnForgot) {
    btnForgot.addEventListener("click", async () => {
      const email = (loginEmail?.value || "").trim();
      if (!email) return alert("Escribí tu email primero.");

      const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
        redirectTo: "https://kusne.github.io/operativos-wsp-adm/reset.html"
      });

      if (error) return alert("Error enviando mail: " + error.message);

      alert("Te enviamos un correo para restablecer la contraseña.");
    });
  }

});





























