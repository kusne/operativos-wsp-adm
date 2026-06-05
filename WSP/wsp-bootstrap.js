(function () {
  "use strict";

  const WSP_BOOTSTRAP_VERSION = "paso16-snapshot-estado-evento-completo-20260605-0015";

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
      console.log("[WSP bootstrap] iniciando...");

      /*
        PASO SEGURO:
        Primero cargamos el wsp.js actual estable.
        Cuando esto funcione, recién después empezamos a separar módulos.
      */
      await cargarScript("./wsp.js");

      console.log("[WSP bootstrap] WSP cargado correctamente.");
    } catch (error) {
      console.error("[WSP bootstrap] fallo crítico:", error);

      alert(
        "Error cargando WSP.\n\n" +
        "Revisá que exista el archivo WSP/wsp.js y que no tenga errores de JavaScript.\n\n" +
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