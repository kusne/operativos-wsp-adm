(function () {
  "use strict";

  const WSP_BOOTSTRAP_VERSION = "paso99-wsp-informes-observacion-no-duplica-orden-20260610";

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
    "./modules/wsp-modo-ui.js",
    "./modules/wsp-pantallas-ui.js",
    "./modules/wsp-transiciones-ui.js",
    "./modules/wsp-selector-operativo-ui.js",
    "./modules/wsp-selector-carga-ui.js",
    "./modules/wsp-selector-estado-ui.js",
    "./modules/wsp-selector-contexto-ui.js",
    "./modules/wsp-informes-flujo-ui.js",
    "./modules/wsp-finaliza-flujo-ui.js",
    "./modules/wsp-inicia-flujo-ui.js",
    "./modules/wsp-control-moviles-flujo-ui.js",
    "./modules/wsp-seleccion-principal-flujo-ui.js",
    "./modules/wsp-texto-operativo.js",
    "./modules/wsp-mensajes-operativo.js",
    "./modules/wsp-formulario-operativo.js",
    "./modules/wsp-payload-operativo.js",
    "./modules/wsp-historial-service.js",
    "./modules/wsp-operativos-repo.js",
    "./modules/wsp-historial-operativo.js",
    "./modules/wsp-selector-iniciados-canonico.js",
    "./modules/wsp-informes-operativos-activos.js",
    "./modules/wsp-historial-informes.js",
    "./modules/wsp-fotos-informes.js",

    /*
      LEGACY ACTUAL:
      Sigue cargando el wsp.js completo mientras se continúa modularizando.
    */
    "./wsp.js"
  ];


  const WSP_CACHE_TOKEN = String(window.__WSP_CACHE_TOKEN__ || (WSP_BOOTSTRAP_VERSION + "-" + Date.now()));

  window.WSP_CACHE_INFO = Object.freeze({
    version: WSP_BOOTSTRAP_VERSION,
    token: WSP_CACHE_TOKEN,
    loadedAt: new Date().toISOString()
  });

  function agregarNoCache(src) {
    const separador = src.includes("?") ? "&" : "?";
    return src + separador + "v=" + encodeURIComponent(WSP_CACHE_TOKEN);
  }

  async function limpiarCacheWebAppWsp() {
    try {
      if ("serviceWorker" in navigator && navigator.serviceWorker.getRegistrations) {
        const registros = await navigator.serviceWorker.getRegistrations();
        const appPath = new URL("./", location.href).pathname;
        await Promise.all(registros.map((registro) => {
          const scopePath = new URL(registro.scope).pathname;
          if (scopePath.includes("/operativos-wsp-adm/") || scopePath.startsWith(appPath)) {
            console.warn("[WSP cache] service worker desregistrado:", registro.scope);
            return registro.unregister();
          }
          return Promise.resolve(false);
        }));
      }
    } catch (error) {
      console.warn("[WSP cache] no se pudo revisar service workers:", error);
    }

    try {
      if ("caches" in window && window.caches && window.caches.keys) {
        const claves = await window.caches.keys();
        await Promise.all(claves.map((clave) => {
          if (/wsp|operativos|bmzcn/i.test(clave)) {
            console.warn("[WSP cache] cache eliminado:", clave);
            return window.caches.delete(clave);
          }
          return Promise.resolve(false);
        }));
      }
    } catch (error) {
      console.warn("[WSP cache] no se pudo revisar Cache Storage:", error);
    }
  }

  async function verificarVersionPublicadaWsp() {
    try {
      const respuesta = await fetch(agregarNoCache("./version.json"), {
        cache: "no-store",
        headers: { "Cache-Control": "no-cache" }
      });
      if (!respuesta.ok) return;
      const data = await respuesta.json();
      const versionPublicada = data && data.version ? String(data.version) : "";
      if (versionPublicada && versionPublicada !== WSP_BOOTSTRAP_VERSION) {
        console.warn("[WSP cache] versión distinta detectada. Recargando app.", {
          actual: WSP_BOOTSTRAP_VERSION,
          publicada: versionPublicada
        });
        const url = new URL(window.location.href);
        url.searchParams.set("wspv", versionPublicada);
        url.searchParams.set("_", String(Date.now()));
        window.location.replace(url.toString());
      }
    } catch (error) {
      console.warn("[WSP cache] no se pudo verificar version.json:", error);
    }
  }

  function cargarScript(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = agregarNoCache(src);
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
      console.log("[WSP bootstrap] iniciando carga modular sin cache...", window.WSP_CACHE_INFO);

      await limpiarCacheWebAppWsp();
      verificarVersionPublicadaWsp();

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
