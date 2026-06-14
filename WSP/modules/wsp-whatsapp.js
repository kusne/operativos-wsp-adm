(function () {
  "use strict";

  window.WSP = window.WSP || {};
  window.WSP.services = window.WSP.services || {};

  let autoCierreWspTimer = null;

  function programarCierreVentanaWsp() {
    if (autoCierreWspTimer) {
      clearTimeout(autoCierreWspTimer);
      autoCierreWspTimer = null;
    }
    // Paso 111: no cerrar la app después de abrir WhatsApp.
    // Se conserva la función para no cambiar el flujo ni las llamadas existentes.
    return false;
  }

  function archivosCompartiblesWsp(files) {
    return (Array.isArray(files) ? files : [])
      .filter((file) => file && typeof File !== "undefined" && file instanceof File)
      .filter((file) => String(file.type || "").toLowerCase().startsWith("image/"))
      .slice(0, 4);
  }

  function abrirWhatsappTextoWsp(texto) {
    const url = "https://wa.me/?text=" + encodeURIComponent(texto || "");

    try {
      const win = window.open(url, "_blank");
      if (win) return true;
    } catch (e) {
      console.warn("[WSP WhatsApp] No se pudo abrir WhatsApp en ventana nueva. Se usa navegación actual.", e);
    }

    window.location.href = url;
    return true;
  }

  async function compartirWhatsappConFotosSiCorresponde(texto, files = []) {
    const fotos = archivosCompartiblesWsp(files);

    if (
      fotos.length &&
      typeof navigator !== "undefined" &&
      navigator.share &&
      (!navigator.canShare || navigator.canShare({ files: fotos }))
    ) {
      try {
        await navigator.share({
          title: "Informe BMZCN",
          text: texto || "",
          files: fotos,
        });
        return true;
      } catch (e) {
        const name = String(e?.name || "");
        if (name === "AbortError" || name === "NotAllowedError") {
          console.warn("[WSP WhatsApp] El usuario canceló o el navegador bloqueó compartir fotos. Se abrirá WhatsApp solo con texto.", e);
        } else {
          console.warn("[WSP WhatsApp] No se pudo compartir texto + fotos. Se enviará solo texto por WhatsApp.", e);
        }
        try {
          alert("No se pudieron adjuntar las fotos automáticamente. Se abrirá WhatsApp con el texto del informe.");
        } catch {}
        return abrirWhatsappTextoWsp(texto);
      }
    } else if (fotos.length) {
      alert("Este navegador no permite adjuntar fotos automáticamente desde la app. Se abrirá WhatsApp solo con el texto del informe.");
    }

    return abrirWhatsappTextoWsp(texto);
  }

  function abrirWhatsappYCerrarWspLuego(texto, files = []) {
    programarCierreVentanaWsp();
    return compartirWhatsappConFotosSiCorresponde(texto, files);
  }

  window.WSP.services.whatsapp = {
    programarCierreVentanaWsp,
    archivosCompartiblesWsp,
    abrirWhatsappTextoWsp,
    compartirWhatsappConFotosSiCorresponde,
    abrirWhatsappYCerrarWspLuego,
  };

  console.log("[WSP whatsapp] cargado");
})();
