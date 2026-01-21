// ===== SUPABASE CONFIG =====
const SUPABASE_URL = "https://ugeydxozfewzhldjbkat.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_ZeLC2rOxhhUXlQdvJ28JkA_qf802-pX";

const supabase = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

document.addEventListener("DOMContentLoaded", async () => {
  console.log("reset.js cargado");

  // =========================================
  // 1️⃣ LEER TOKEN DE RECOVERY DESDE EL HASH
  // =========================================
  const hash = window.location.hash.substring(1);
  const params = new URLSearchParams(hash);

  const access_token = params.get("access_token");
  const refresh_token = params.get("refresh_token");

  if (!access_token || !refresh_token) {
    alert("Link de recuperación inválido o vencido");
    return;
  }

  // =========================================
  // 2️⃣ INYECTAR SESIÓN MANUALMENTE (CLAVE)
  // =========================================
  const { error: sessionError } = await supabase.auth.setSession({
    access_token,
    refresh_token
  });

  if (sessionError) {
    alert("Error estableciendo sesión de recuperación");
    console.error(sessionError);
    return;
  }

  console.log("Sesión recovery establecida");

  // =========================================
  // 3️⃣ DOM
  // =========================================
  const btn = document.getElementById("btnSavePassword");
  const input = document.getElementById("newPassword");

  if (!btn || !input) {
    alert("Formulario de reset incompleto");
    return;
  }

  // =========================================
  // 4️⃣ GUARDAR CONTRASEÑA (AHORA SÍ)
  // =========================================
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
      alert("Error guardando contraseña: " + error.message);
      console.error(error);
      return;
    }

    alert("Contraseña actualizada correctamente");

    // =========================================
    // 5️⃣ IR AL ADM
    // =========================================
    window.location.href =
      "https://kusne.github.io/operativos-wsp-adm/adm/index.html";
  });
});


