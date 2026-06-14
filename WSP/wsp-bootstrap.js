(function () {
  "use strict";

  const WSP_BOOTSTRAP_VERSION = "paso106-wsp-foto-abre-camara-por-defecto-20260610";

  const WSP_SUPABASE_URL_BOOT = "https://ugeydxozfewzhldjbkat.supabase.co";
  const WSP_SUPABASE_ANON_KEY_BOOT = "sb_publishable_ZeLC2rOxhhUXlQdvJ28JkA_qf802-pX";
  const WSP_OPERATIVOS_PUBLICADOS_SELECT_BOOT = "id,operativo_key,guardia_fecha,fecha_operativo,inicio_operativo,hora_desde,hora_hasta,lugar,lugar_normalizado,tipo,ordenes_origen,archivos_origen,activo,sin_efecto,error_en_la_orden,error_motivo,registro_original,updated_at";

  function pad2BootWsp(n) {
    return String(n).padStart(2, "0");
  }

  function getGuardiaFechaIsoBootWsp(now = new Date()) {
    const desde = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 6, 0, 0, 0);
    if (now < desde) desde.setDate(desde.getDate() - 1);
    return `${desde.getFullYear()}-${pad2BootWsp(desde.getMonth() + 1)}-${pad2BootWsp(desde.getDate())}`;
  }

  function iniciarPrefetchOperativosPublicadosWsp() {
    if (window.__WSP_OPERATIVOS_PUBLICADOS_PREFETCH_PROMISE__) {
      return window.__WSP_OPERATIVOS_PUBLICADOS_PREFETCH_PROMISE__;
    }

    const guardiaFecha = getGuardiaFechaIsoBootWsp();
    const params = new URLSearchParams({
      select: WSP_OPERATIVOS_PUBLICADOS_SELECT_BOOT,
      guardia_fecha: `eq.${guardiaFecha}`,
      activo: "eq.true",
      sin_efecto: "eq.false",
      order: "inicio_operativo.asc",
    });

    const startedAt = Date.now();
    window.__WSP_OPERATIVOS_PUBLICADOS_PREFETCH_GUARDIA__ = guardiaFecha;
    window.__WSP_OPERATIVOS_PUBLICADOS_PREFETCH_DATA__ = null;
    window.__WSP_OPERATIVOS_PUBLICADOS_PREFETCH_CONSUMED__ = false;

    const promise = fetch(`${WSP_SUPABASE_URL_BOOT}/rest/v1/operativos_publicados?${params.toString()}`, {
      cache: "no-store",
      headers: {
        apikey: WSP_SUPABASE_ANON_KEY_BOOT,
        Authorization: `Bearer ${WSP_SUPABASE_ANON_KEY_BOOT}`,
        Accept: "application/json",
        "Cache-Control": "no-cache",
      },
    }).then(async (respuesta) => {
      if (!respuesta.ok) {
        const texto = await respuesta.text().catch(() => "");
        throw new Error(`operativos_publicados ${respuesta.status}: ${texto}`);
      }
      const rows = await respuesta.json();
      const data = {
        ok: true,
        guardiaFecha,
        rows: Array.isArray(rows) ? rows : [],
        startedAt,
        loadedAt: Date.now(),
      };
      window.__WSP_OPERATIVOS_PUBLICADOS_PREFETCH_DATA__ = data;
      return data;
    }).catch((error) => {
      const data = {
        ok: false,
        guardiaFecha,
        rows: null,
        startedAt,
        loadedAt: Date.now(),
        error: error?.message || String(error),
      };
      window.__WSP_OPERATIVOS_PUBLICADOS_PREFETCH_DATA__ = data;
      console.warn("[WSP bootstrap] prelectura de operativos_publicados no disponible; wsp.js hará lectura normal.", error);
      return data;
    });

    window.__WSP_OPERATIVOS_PUBLICADOS_PREFETCH_PROMISE__ = promise;
    console.log("[WSP bootstrap] prelectura de operativos_publicados iniciada:", guardiaFecha);
    return promise;
  }

  function iniciarControlVentanaUnicaWsp() {
    if (window.__WSP_VENTANA_UNICA_INICIADA__) return;
    window.__WSP_VENTANA_UNICA_INICIADA__ = true;

    const canalNombre = "wsp-bmzcn-ventana-unica";
    const instanciaId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;

    function mostrarVentanaDuplicadaWsp() {
      try {
        document.documentElement.innerHTML = `
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>WSP ya está abierto</title>
            <style>
              body { margin:0; min-height:100vh; display:flex; align-items:center; justify-content:center; background:#20262d; color:#fff; font-family:Arial, sans-serif; text-align:center; padding:24px; box-sizing:border-box; }
              .box { max-width:420px; border:2px solid #c9a227; border-radius:16px; padding:22px; background:#2b323a; }
              h1 { margin:0 0 12px; font-size:22px; color:#f1d06b; }
              p { margin:8px 0; line-height:1.35; }
              button { margin-top:14px; padding:12px 18px; border-radius:10px; border:0; font-weight:700; background:#d9dce1; color:#111; }
            </style>
          </head>
          <body>
            <div class="box">
              <h1>WSP ya está abierto</h1>
              <p>Para evitar dos ventanas de la app, seguí trabajando en la ventana anterior.</p>
              <p>Esta pestaña quedó bloqueada como duplicada.</p>
              <button onclick="window.close()">Cerrar esta pestaña</button>
            </div>
          </body>`;
      } catch (e) {
        console.warn("[WSP ventana única] No se pudo mostrar pantalla de duplicado.", e);
      }
    }

    if (navigator.locks && typeof navigator.locks.request === "function") {
      navigator.locks.request("wsp-bmzcn-app-activa", { mode: "exclusive", ifAvailable: true }, async (lock) => {
        if (!lock) {
          mostrarVentanaDuplicadaWsp();
          try { window.close(); } catch {}
          return;
        }
        await new Promise(() => {});
      }).catch((e) => console.warn("[WSP ventana única] Web Locks no disponible.", e));
      return;
    }

    try {
      const canal = new BroadcastChannel(canalNombre);
      let soyDuplicada = false;
      canal.onmessage = (ev) => {
        const msg = ev?.data || {};
        if (msg.tipo === "wsp-hay-ventana" && msg.instanciaId !== instanciaId) {
          canal.postMessage({ tipo: "wsp-ventana-activa", instanciaId });
        }
        if (msg.tipo === "wsp-ventana-activa" && msg.instanciaId !== instanciaId) {
          soyDuplicada = true;
          mostrarVentanaDuplicadaWsp();
          try { window.close(); } catch {}
        }
      };
      canal.postMessage({ tipo: "wsp-hay-ventana", instanciaId });
      setTimeout(() => {
        if (!soyDuplicada) canal.postMessage({ tipo: "wsp-ventana-activa", instanciaId });
      }, 250);
    } catch (e) {
      console.warn("[WSP ventana única] BroadcastChannel no disponible.", e);
    }
  }

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

      iniciarControlVentanaUnicaWsp();
      iniciarPrefetchOperativosPublicadosWsp();
      verificarVersionPublicadaWsp();

      for (const src of SCRIPTS_WSP) {
        await cargarScript(src);
      }

      limpiarCacheWebAppWsp();
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

  iniciarPrefetchOperativosPublicadosWsp();

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", iniciarBootstrapWsp);
  } else {
    iniciarBootstrapWsp();
  }
})();
