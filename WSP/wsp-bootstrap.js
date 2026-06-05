(function () {
  "use strict";

  const WSP_BOOTSTRAP_VERSION = "paso40-fotos-informes-20260605";

  const SCRIPTS_WSP = [
    "./modules/wsp-namespace.js",
    "./modules/wsp-utils.js",

    /*
      NOMENCLADOR LOCAL FALLBACK:
      Define getReferenciaFalta / getNomencladorFalta / NOMENCLADOR_CODIGOS.
      Debe cargarse antes de wsp-nomenclador.js y wsp-detalles.js.
    */
    "./nomenclador.js",

    /*
      SERVICIO NOMENCLADOR:
      Envuelve el nomenclador local en window.WSP.services.nomenclador.
      Más adelante este módulo podrá leer desde Supabase y usar nomenclador.js como fallback.
    */
    "./modules/wsp-nomenclador.js",

    "./modules/wsp-whatsapp.js",
    "./modules/wsp-guardia.js",
    "./modules/wsp-ui.js",
    "./modules/wsp-alcoholimetro.js",
    "./modules/wsp-detalles.js",
    "./modules/wsp-selector.js",
    "./modules/wsp-control-superior.js",
    "./modules/wsp-informes.js",
    "./modules/wsp-decto460.js",
    "./modules/wsp-control-moviles.js",
    "./modules/wsp-estadisticas-ui.js",
    "./modules/wsp-operativo-ui.js",
    "./modules/wsp-selector-operativo-ui.js",
    "./modules/wsp-texto-operativo.js",
    "./modules/wsp-mensajes-operativo.js",
    "./modules/wsp-formulario-operativo.js",
    "./modules/wsp-payload-operativo.js",
    "./modules/wsp-historial-service.js",
    "./modules/wsp-historial-operativo.js",
    "./modules/wsp-historial-informes.js",
    "./modules/wsp-fotos-informes.js",

    /*
      LEGACY ACTUAL:
      Sigue cargando el wsp.js completo mientras se continúa modularizando.
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
