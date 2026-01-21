// ===== CONFIG SUPABASE =====
const SUPABASE_URL = "https://ugeydxozfewzhldjbkat.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_ZeLC2rOxhhUXlQdvJ28JkA_qf802-pX";

const supabase = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

document.addEventListener("DOMContentLoaded", async () => {
  console.log("reset.js cargado");

  // ================================
  // PASO CRÍTICO OBLIGATORIO
  // CONSUMIR TOKEN DEL HASH (RECOVERY)
  // ================================
  const { data, error: sessionError } =
    await supabase.auth.getSessionFromUrl({ storeSession: true });

  if (sessionError) {
    alert("Error leyendo sesión de recuperación");
    console.error(sessionError);
    return;
  }

  if (!data || !data.session) {
    alert("Sesión de recuperación inválida o expirada");
    return;
  }

  console.log("Sesión recovery OK");

  // ================================
  // DOM
  // ================================
  const btn = document.getElementById("btnSavePassword");
  const input = document.getElementById("newPassword");
  const msg = document.getElementById("msg");

  if (!btn || !input) {
    alert("No se encontraron elementos del formulario");
    return;
  }

  // ================================
  // BOTÓN GUARDAR CONTRASEÑA
  // ================================
  btn.addEventListener("click", async () => {
    const password = input.value.trim();

    if (password.length < 6) {
      alert("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    const { error } = await supabase.auth.updateUser({
      password
    });

    if (error) {
      alert("Error al guardar contraseña: " + error.message);
      console.error(error);
      return;
    }

    alert("Contraseña actualizada correctamente");

    // ================================
    // REDIRECCIÓN AL ADM
    // ================================
    window.location.href =
      "https://kusne.github.io/operativos-wsp-adm/adm/index.html";
  });
});

