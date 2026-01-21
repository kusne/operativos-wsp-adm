// ===== CONFIG SUPABASE =====
const SUPABASE_URL = "https://ugeydxozfewzhldjbkat.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_ZeLC2rOxhhUXlQdvJ28JkA_qf802-pX";

const supabase = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

document.addEventListener("DOMContentLoaded", async () => {
  const btn = document.getElementById("btnSavePassword");
  const input = document.getElementById("newPassword");
  const msg = document.getElementById("msg");

  if (!btn || !input) {
    console.error("Elementos de reset no encontrados");
    return;
  }

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
      alert("Error al guardar la contraseña: " + error.message);
      return;
    }

    msg.textContent = "Contraseña actualizada correctamente.";
    msg.style.display = "block";

    // redirigir al ADM
    setTimeout(() => {
      window.location.href = "./adm/index.html";
    }, 1500);
  });
});
