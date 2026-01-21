// ===== CONFIG SUPABASE (SOLO ADM) =====
const SUPABASE_URL = "https://ugeydxozfewzhldjbkat.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_ZeLC2rOxhhUXlQdvJ28JkA_qf802-pX";

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

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
  const toggleExportImport = document.getElementById("toggleExportImport");
  const exportImportContainer = document.getElementById("exportImportContainer");
  if (toggleExportImport && exportImportContainer) {
    toggleExportImport.addEventListener("change", () => {
      if (toggleExportImport.checked) {
        exportImportContainer.classList.remove("hidden");
      } else {
        exportImportContainer.classList.add("hidden");
      }
    });
  }
  const btnLogout = document.getElementById("btnLogout");
  if (btnLogout) {
    btnLogout.addEventListener("click", async () => {
      await supabaseClient.auth.signOut();

      // volver al login
      admContainer.style.display = "none";
      loginContainer.style.display = "block";
    });
  }
  function actualizarSelector() {
    console.log("actualizarSelector EJECUTADA");

    if (!selectOrdenExistente) return;

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
  // CONTROL DE SESIÓN
  // ======================================================
  const { data: { session }, error } = await supabaseClient.auth.getSession();

  if (error || !session) {
    loginContainer.style.display = "block";
    admContainer.style.display = "none";
  } else {
    loginContainer.style.display = "none";
    admContainer.style.display = "block";
  }

  // ======================================================
  // LOGIN
  // ======================================================
  if (btnLogin) {
    btnLogin.addEventListener("click", async () => {
      loginError.style.display = "none";

      const email = loginEmail.value.trim();
      const password = loginPassword.value.trim();

      if (!email || !password) {
        loginError.textContent = "Complete email y contraseña";
        loginError.style.display = "block";
        return;
      }

      const { error } = await supabaseClient.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        loginError.textContent = "Credenciales inválidas";
        loginError.style.display = "block";
        return;
      }

      // Login OK
      loginContainer.style.display = "none";
      admContainer.style.display = "block";
    });
  }

  // ======================================================
  // OLVIDÉ MI CONTRASEÑA (CONTROLADO – SIN RECOVERY SUPABASE)
  // ======================================================

  btnForgot.addEventListener("click", async () => {
    const email = loginEmail.value.trim();

    if (!email) {
      alert("Escribí tu email primero.");
      return;
    }

    const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
      redirectTo: "https://kusne.github.io/operativos-wsp-adm/reset.html"
    });

    if (error) {
      alert("Error enviando mail de recuperación: " + error.message);
      return;
    }

    alert("Te enviamos un correo para restablecer la contraseña.");
  });

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
    if (btnPublicar) {
      btnPublicar.disabled = !puedePublicar();
    }
  }

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

      numOrdenEl.value = o.num || "";
      textoRefEl.value = o.textoRef || "";
      fechaVigenciaEl.value = o.vigencia || "";
      fechaCaducidadInput.value = o.caducidad || "";

      franjasEl.value = (o.franjas || [])
        .map(f => `${f.horario} - ${f.lugar} - ${f.titulo}`)
        .join("\n");
    });
  }

  // ======================================================
  // FUNCIONES AUXILIARES
  // ======================================================
  function limpiarCampos() {
    numOrdenEl.value = "";
    textoRefEl.value = "";
    franjasEl.value = "";
    fechaVigenciaEl.value = "";
    fechaCaducidadInput.value = "";
    chkFinalizar.checked = false;
    ordenSeleccionadaIdx = null;
    selectOrdenExistente.value = "";
  }

  function limpiarOrdenesCaducadas() {
    const ordenes = StorageApp.cargarOrdenes();
    const filtradas = OrdersSync.filtrarCaducadas(ordenes);
    StorageApp.guardarOrdenes(filtradas);
  }

  async function publicarOrdenes() {
    if (!puedePublicar()) {
      alert("Primero cargue una orden");
      return;
    }

    const ordenes = StorageApp.cargarOrdenes();

    await fetch(`${SUPABASE_URL}/rest/v1/ordenes_store?id=eq.1`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        apikey: SUPABASE_ANON_KEY,
        Authorization: "Bearer " + SUPABASE_ANON_KEY
      },
      body: JSON.stringify({ payload: ordenes })
    });

    ultimoPublicadoId = cambiosId;
    actualizarEstadoPublicar();
  }

  window.publicarOrdenes = publicarOrdenes;

  // ======================================================
  // INIT
  // ======================================================
  limpiarOrdenesCaducadas();
  actualizarSelector();
  actualizarEstadoPublicar();

});
























