(function () {
  "use strict";

  const WSP_BOOTSTRAP_VERSION = "paso110-wsp-optimizacion-carga-ventana-unica-20260614";

  const WSP_SUPABASE_URL_PRELOAD = "https://ugeydxozfewzhldjbkat.supabase.co";
  const WSP_SUPABASE_ANON_KEY_PRELOAD = "sb_publishable_ZeLC2rOxhhUXlQdvJ28JkA_qf802-pX";

  function pad2WspBootstrap(n) {
    return String(n).padStart(2, "0");
  }

  function getGuardiaFechaISOBootstrapWsp(now = new Date()) {
    const desde = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 6, 0, 0, 0);
    if (now < desde) desde.setDate(desde.getDate() - 1);
    return `${desde.getFullYear()}-${pad2WspBootstrap(desde.getMonth() + 1)}-${pad2WspBootstrap(desde.getDate())}`;
  }

  function iniciarPreloadOperativosPublicadosWsp() {
    if (window.__WSP_OPERATIVOS_PUBLICADOS_PRELOAD__?.promise) {
      return window.__WSP_OPERATIVOS_PUBLICADOS_PRELOAD__;
    }

    const guardiaFecha = getGuardiaFechaISOBootstrapWsp();
    const params = new URLSearchParams({
      select: "id,operativo_key,guardia_fecha,fecha_operativo,inicio_operativo,hora_desde,hora_hasta,lugar,lugar_normalizado,tipo,ordenes_origen,archivos_origen,activo,sin_efecto,error_en_la_orden,error_motivo,registro_original,updated_at",
      guardia_fecha: `eq.${guardiaFecha}`,
      activo: "eq.true",
      sin_efecto: "eq.false",
      order: "inicio_operativo.asc",
    });

    const preload = {
      version: WSP_BOOTSTRAP_VERSION,
      guardiaFecha,
      startedAt: Date.now(),
      promise: fetch(`${WSP_SUPABASE_URL_PRELOAD}/rest/v1/operativos_publicados?${params.toString()}`, {
        cache: "no-store",
        headers: {
          apikey: WSP_SUPABASE_ANON_KEY_PRELOAD,
          Authorization: `Bearer ${WSP_SUPABASE_ANON_KEY_PRELOAD}`,
          Accept: "application/json",
          "Cache-Control": "no-cache",
        },
      }).then(async (respuesta) => {
        if (!respuesta.ok) {
          return {
            ok: false,
            guardiaFecha,
            status: respuesta.status,
            error: await respuesta.text().catch(() => ""),
            data: null,
          };
        }
        return {
          ok: true,
          guardiaFecha,
          status: respuesta.status,
          data: await respuesta.json(),
        };
      }).catch((error) => ({
        ok: false,
        guardiaFecha,
        status: 0,
        error: String(error?.message || error || ""),
        data: null,
      })),
    };

    window.__WSP_OPERATIVOS_PUBLICADOS_PRELOAD__ = preload;
    return preload;
  }

  function mostrarVentanaDuplicadaBloqueadaWsp(motivo) {
    const render = () => {
      try {
        document.title = "WSP ya está abierto";
        if (document.body) {
          document.body.innerHTML = `
            <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 40px auto; padding: 22px; border: 1px solid #d9d9d9; border-radius: 14px; line-height: 1.35;">
              <h2 style="margin: 0 0 10px; font-size: 20px;">La app WSP ya está abierta</h2>
              <p style="margin: 0 0 12px;">Se detectó otra ventana activa de la app. Usá esa ventana para evitar duplicar cargas o envíos.</p>
              <p style="margin: 0; color: #666; font-size: 13px;">${motivo || "Ventana duplicada bloqueada."}</p>
            </div>
          `;
        }
      } catch (e) {
        console.warn("[WSP ventana única] No se pudo mostrar aviso de ventana duplicada.", e);
      }
    };

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", render, { once: true });
    } else {
      render();
    }

    [40, 350, 1000].forEach((ms) => {
      setTimeout(() => {
        try { window.close(); } catch {}
      }, ms);
    });
  }

  function prepararVentanaUnicaWsp() {
    const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const startedAt = Date.now();
    const channelName = "bmzcn-wsp-ventana-unica-v2";
    let channel = null;

    try {
      if (typeof BroadcastChannel !== "undefined") {
        channel = new BroadcastChannel(channelName);
        window.__WSP_SINGLE_WINDOW_CHANNEL__ = channel;
        channel.onmessage = (event) => {
          const msg = event?.data || {};
          if (!msg || msg.id === id) return;

          if (msg.type === "wsp_focus_request") {
            try { window.focus(); } catch {}
            return;
          }

          if (msg.type === "wsp_hello" && (window.__WSP_SINGLE_WINDOW_IS_PRIMARY__ || startedAt <= Number(msg.startedAt || 0))) {
            try { window.focus(); } catch {}
            try {
              channel.postMessage({ type: "wsp_active", id, to: msg.id, startedAt });
            } catch {}
          }
        };
      }
    } catch (e) {
      console.warn("[WSP ventana única] BroadcastChannel no disponible.", e);
      channel = null;
    }

    function avisarFocoVentanaExistente() {
      try { channel?.postMessage({ type: "wsp_focus_request", id, startedAt }); } catch {}
    }

    function bloquearDuplicada(motivo) {
      avisarFocoVentanaExistente();
      mostrarVentanaDuplicadaBloqueadaWsp(motivo);
      return false;
    }

    if (navigator?.locks && typeof navigator.locks.request === "function") {
      let resolverResultado;
      const resultado = new Promise((resolve) => { resolverResultado = resolve; });

      navigator.locks.request("bmzcn-wsp-app-unica", { ifAvailable: true }, (lock) => {
        if (!lock) {
          resolverResultado(false);
          return undefined;
        }

        window.__WSP_SINGLE_WINDOW_IS_PRIMARY__ = true;
        resolverResultado(true);

        // Mantiene el lock mientras esta ventana siga abierta.
        return new Promise(() => {});
      }).catch((error) => {
        console.warn("[WSP ventana única] Web Locks no disponible. Se usa fallback.", error);
        resolverResultado(true);
      });

      return Promise.race([
        resultado,
        new Promise((resolve) => setTimeout(() => resolve(true), 180)),
      ]).then((ok) => ok ? true : bloquearDuplicada("Se conservó la ventana que ya estaba abierta."));
    }

    if (!channel) return Promise.resolve(true);

    let existeVentanaMasAntigua = false;
    const listenerOriginal = channel.onmessage;
    channel.onmessage = (event) => {
      if (typeof listenerOriginal === "function") listenerOriginal(event);
      const msg = event?.data || {};
      if (!msg || msg.id === id) return;
      if (msg.type === "wsp_active" && msg.to === id && Number(msg.startedAt || 0) < startedAt) {
        existeVentanaMasAntigua = true;
      }
    };

    try { channel.postMessage({ type: "wsp_hello", id, startedAt }); } catch {}

    return new Promise((resolve) => {
      setTimeout(() => {
        if (existeVentanaMasAntigua) {
          resolve(bloquearDuplicada("Se conservó la ventana que ya estaba abierta."));
          return;
        }
        window.__WSP_SINGLE_WINDOW_IS_PRIMARY__ = true;
        resolve(true);
      }, 160);
    });
  }

  iniciarPreloadOperativosPublicadosWsp();
  const WSP_VENTANA_UNICA_READY = prepararVentanaUnicaWsp();


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
    "./modules/wsp-actas-ocr460.js",
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

      const ventanaUnicaOk = await WSP_VENTANA_UNICA_READY;
      if (!ventanaUnicaOk) return;

      limpiarCacheWebAppWsp().catch((error) => {
        console.warn("[WSP cache] limpieza diferida falló:", error);
      });
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
