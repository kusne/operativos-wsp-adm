// ===== CONFIG SUPABASE (SOLO ADM - SIMPLE) =====
const SUPABASE_URL = "https://ugeydxozfewzhldjbkat.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_ZeLC2rOxhhUXlQdvJ28JkA_qf802-pX";
const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

(function () {
  // ===== DOM refs =====
  const chkFinalizar = document.getElementById("aFinalizarCheckbox");
  const fechaCaducidadInput = document.getElementById("fechaCaducidad");

  const numOrdenEl = document.getElementById("numOrden");
  const textoRefEl = document.getElementById("textoRef");
  const franjasEl = document.getElementById("franjas");
  const fechaVigenciaEl = document.getElementById("fechaVigencia");

  const selectOrdenExistente = document.getElementById("ordenExistente");
  const infoOrdenEl = document.getElementById("infoOrden");

  const exportBoxEl = document.getElementById("exportBox");
  const importBoxEl = document.getElementById("importBox");
  const toggleExportImport = document.getElementById("toggleExportImport");
  const exportImportContainer = document.getElementById("exportImportContainer");

  const btnPublicar = document.getElementById("btnPublicarOrdenes");

  let cambiosId = 0;
  let ultimoPublicadoId = 0;
  let ordenSeleccionadaIdx = null;

  function marcarCambio() {
    cambiosId += 1;
    actualizarEstadoPublicar();
  }

  function puedePublicar() {
    return cambiosId > ultimoPublicadoId;
  }

  function actualizarEstadoPublicar() {
    if (!btnPublicar) return;
    btnPublicar.disabled = !puedePublicar();
  }

  if (typeof CaducidadFinalizar !== "undefined") {
    CaducidadFinalizar.bindAFinalizar({
      checkboxEl: chkFinalizar,
      inputEl: fechaCaducidadInput
    });
  }

  // ===== EVENTO SELECT ORDEN =====
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

  function actualizarSelector() {
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

  function limpiarCampos() {
    numOrdenEl.value = "";
    textoRefEl.value = "";
    franjasEl.value = "";
    fechaVigenciaEl.value = "";
    fechaCaducidadInput.readOnly = false;
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

    return out.length ? { ok: true, franjas: out } : { ok: false };
  }

  async function publicarOrdenes(modo) {
    if (!puedePublicar()) {
      alert("primero cargue orden");
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

  (function init() {
    limpiarOrdenesCaducadas();
    actualizarSelector();
    cambiosId = 0;
    ultimoPublicadoId = 0;
    actualizarEstadoPublicar();
  })();

})();
document.addEventListener("DOMContentLoaded", async () => {
  const login = document.getElementById("loginContainer");
  const adm = document.getElementById("admContainer");

  if (!login || !adm) {
    console.error("No se encontraron loginContainer o admContainer");
    return;
  }

  const { data: { session }, error } = await supabaseClient.auth.getSession();

  if (error) {
    console.error("Error obteniendo sesión:", error);
    login.style.display = "block";
    adm.style.display = "none";
    return;
  }

  if (session) {
    login.style.display = "none";
    adm.style.display = "block";
  } else {
    login.style.display = "block";
    adm.style.display = "none";
  }
});
const btnLogin = document.getElementById("btnLogin");
const loginEmail = document.getElementById("loginEmail");
const loginPassword = document.getElementById("loginPassword");
const loginError = document.getElementById("loginError");

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

    // login OK → mostrar ADM
    document.getElementById("loginContainer").style.display = "none";
    document.getElementById("admContainer").style.display = "block";
  });
}



















