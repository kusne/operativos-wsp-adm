(function () {
  "use strict";

  window.WSP = window.WSP || {};
  window.WSP.services = window.WSP.services || {};

  const AUTO_CIERRE_WSP_MS = 5 * 60 * 1000;
  let autoCierreWspTimer = null;

  function programarCierreVentanaWsp() {
    if (autoCierreWspTimer) {
      clearTimeout(autoCierreWspTimer);
      autoCierreWspTimer = null;
    }

    autoCierreWspTimer = setTimeout(() => {
      try {
        if (window.electronAPI && typeof window.electronAPI.closeCurrentWindow === "function") {
          window.electronAPI.closeCurrentWindow();
          return;
        }
      } catch (e) {
        console.warn("[WSP WhatsApp] No se pudo cerrar mediante electronAPI.closeCurrentWindow.", e);
      }

      try {
        if (window.electronAPI && typeof window.electronAPI.cerrarVentanaActual === "function") {
          window.electronAPI.cerrarVentanaActual();
          return;
        }
      } catch (e) {
        console.warn("[WSP WhatsApp] No se pudo cerrar mediante electronAPI.cerrarVentanaActual.", e);
      }

      try {
        window.close();
      } catch (e) {
        console.warn("[WSP WhatsApp] El navegador bloqueó window.close().", e);
      }
    }, AUTO_CIERRE_WSP_MS);
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
          console.warn("[WSP WhatsApp] El usuario canceló o el navegador bloqueó compartir fotos.", e);
          return false;
        }
        console.warn("[WSP WhatsApp] No se pudo compartir texto + fotos. Se enviará solo texto por WhatsApp.", e);
      }
    } else if (fotos.length) {
      alert("Este navegador no permite adjuntar fotos automáticamente desde la app. Se abrirá WhatsApp solo con el texto del informe.");
    }

    return abrirWhatsappTextoWsp(texto);
  }

  function abrirWhatsappYCerrarWspLuego(texto, files = []) {
    programarCierreVentanaWsp();
    compartirWhatsappConFotosSiCorresponde(texto, files);
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
