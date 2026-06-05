(function () {
  "use strict";

  const WSP_BOOTSTRAP_VERSION = "paso22-detalles-modular-20260605";

  const SCRIPTS_WSP = [
    "./modules/wsp-namespace.js",
    "./modules/wsp-utils.js",
    "./nomenclador.js",
    "./modules/wsp-whatsapp.js",
    "./modules/wsp-guardia.js",
    "./modules/wsp-ui.js",
    "./modules/wsp-alcoholimetro.js",
    "./modules/wsp-detalles.js",

    /*
      LEGACY ACTUAL:
      Por ahora sigue cargando el wsp.js completo.
      A medida que modularicemos, vamos sacando partes de wsp.js
      y agregando nuevos módulos arriba de esta línea.
    */
    "./wsp.js"
  ];

  function cargarScript(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = src + "?v=" + encodeURIComponent(WSP_BOOTSTRAP_VERSION);
      script.defer = false;

      script.onload = () => {
        console.log("[WSP bootstrap] cargado:", src);
        resolve(src);
      };

      script.onerror = () => {
        console.error("[WSP bootstrap] ERROR cargando:", src);
        reject(new Error("No se pudo cargar " + src));
      };

      document.body.appendChild(script);
    });
  }

  async function iniciarBootstrapWsp() {
    try {
      console.log("[WSP bootstrap] iniciando carga modular...");

      for (const src of SCRIPTS_WSP) {
        await cargarScript(src);
      }

      console.log("[WSP bootstrap] carga modular completa.");
    } catch (error) {
      console.error("[WSP bootstrap] fallo crítico:", error);

      alert(
        "Error cargando WSP.\n\n" +
        "Archivo con problema: revisá la consola.\n\n" +
        error.message
      );
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", iniciarBootstrapWsp);
  } else {
    iniciarBootstrapWsp();
  }
})();
