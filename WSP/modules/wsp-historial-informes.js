(function () {
  "use strict";

  window.WSP = window.WSP || {};
  window.WSP.services = window.WSP.services || {};
  window.WSP.modules = window.WSP.modules || {};

  const TIPOS = Object.freeze({
    ALCOHOLEMIA_POSITIVA: "ALCOHOLEMIA_POSITIVA",
    DECTO_460_22: "DECTO_460_22",
  });

  function limpiarTextoSimple(valor) {
    return String(valor || "")
      .replace(/\s+/g, " ")
      .trim();
  }

  function normalizarBasicoSinAcentos(valor) {
    return String(valor || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();
  }

  function normalizarComponenteInformeKeyWsp(value) {
    return normalizarBasicoSinAcentos(String(value || ""))
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "")
      .slice(0, 120);
  }

  function normalizarNumeroActa(value) {
    return String(value || "").replace(/\D+/g, "").slice(0, 12);
  }

  function getDeps(deps = {}) {
    return {
      limpiarTextoSimple: typeof deps.limpiarTextoSimple === "function" ? deps.limpiarTextoSimple : limpiarTextoSimple,
      normalizarBasicoSinAcentos: typeof deps.normalizarBasicoSinAcentos === "function" ? deps.normalizarBasicoSinAcentos : normalizarBasicoSinAcentos,
      normalizarNumeroActaInforme: typeof deps.normalizarNumeroActaInforme === "function" ? deps.normalizarNumeroActaInforme : normalizarNumeroActa,
      getGuardiaFechaISO: typeof deps.getGuardiaFechaISO === "function" ? deps.getGuardiaFechaISO : (() => ""),
      construirOperativoKeyEstable: typeof deps.construirOperativoKeyEstable === "function" ? deps.construirOperativoKeyEstable : (() => ""),
      alert: typeof deps.alert === "function" ? deps.alert : ((msg) => { try { window.alert(msg); } catch {} }),
      console: deps.console || window.console || console,
    };
  }

  function clasificacionEventoInformeWsp(tipoEvento) {
    const tipo = String(tipoEvento || "").toUpperCase();

    if (tipo === TIPOS.ALCOHOLEMIA_POSITIVA) {
      return {
        categoria_evento: "PREVENTIVO",
        subtipo_evento: TIPOS.ALCOHOLEMIA_POSITIVA,
        area_interes: ["SEGURIDAD_VIAL", "POLICIAL"],
        requiere_fiscalia: false,
        requiere_traslado_comisaria: false,
        requiere_word_semanal: true,
        informe_word_destino: ["ALCOHOLEMIAS_SEMANAL"],
        alimenta_finalizado: false,
        alimenta_estadisticas: false,
        contador_circular: true,
      };
    }

    if (tipo === TIPOS.DECTO_460_22) {
      return {
        categoria_evento: "PREVENTIVO",
        subtipo_evento: TIPOS.DECTO_460_22,
        area_interes: ["SEGURIDAD_VIAL", "POLICIAL"],
        requiere_fiscalia: false,
        requiere_traslado_comisaria: false,
        requiere_word_semanal: true,
        informe_word_destino: ["PROCEDIMIENTOS_SEMANAL"],
        alimenta_finalizado: false,
        alimenta_estadisticas: false,
        contador_circular: true,
      };
    }

    return {
      categoria_evento: "OPERATIVO",
      subtipo_evento: tipo || "INFORME",
      area_interes: ["POLICIAL"],
      requiere_fiscalia: false,
      requiere_traslado_comisaria: false,
      requiere_word_semanal: false,
      informe_word_destino: [],
      alimenta_finalizado: false,
      alimenta_estadisticas: false,
      contador_circular: false,
    };
  }

  function construirInformeKeyWsp(tipoEvento, payload = {}, nroActa = "", ctx = {}) {
    const deps = getDeps(ctx.deps || {});
    const franja = ctx.franja || null;

    const guardia = deps.limpiarTextoSimple(payload?.guardia_fecha || deps.getGuardiaFechaISO());
    const operativoKey = deps.limpiarTextoSimple(
      payload?.operativo_key ||
      franja?.__operativoKey ||
      deps.construirOperativoKeyEstable(franja) ||
      "sin_operativo"
    );
    const tipo = String(tipoEvento || payload?.tipo_evento || "").toUpperCase() || "INFORME";
    const acta = deps.normalizarNumeroActaInforme(nroActa || payload?.payload_completo?.datos_formulario?.nro_acta || "");

    return [
      guardia,
      normalizarComponenteInformeKeyWsp(operativoKey) || "sin_operativo",
      tipo,
      acta || "sin_acta",
    ].join("|");
  }

  function prepararPayloadInformeEventoWsp(tipoEvento, payload = {}, nroActa = "", ctx = {}) {
    const deps = getDeps(ctx.deps || {});
    const franja = ctx.franja || null;
    const clasificacion = clasificacionEventoInformeWsp(tipoEvento);
    const guardiaFecha = deps.limpiarTextoSimple(payload?.guardia_fecha || deps.getGuardiaFechaISO());
    const operativoKey = deps.limpiarTextoSimple(payload?.operativo_key || franja?.__operativoKey || deps.construirOperativoKeyEstable(franja));
    const informeKey = deps.limpiarTextoSimple(
      payload?.informe_key ||
      construirInformeKeyWsp(tipoEvento, { ...payload, guardia_fecha: guardiaFecha, operativo_key: operativoKey }, nroActa, ctx)
    );

    return {
      ...payload,
      tipo_evento: tipoEvento,
      guardia_fecha: guardiaFecha,
      operativo_key: operativoKey,
      informe_key: informeKey,

      categoria_evento: clasificacion.categoria_evento,
      subtipo_evento: clasificacion.subtipo_evento,
      area_interes: clasificacion.area_interes,
      requiere_fiscalia: clasificacion.requiere_fiscalia,
      requiere_traslado_comisaria: clasificacion.requiere_traslado_comisaria,
      requiere_word_semanal: clasificacion.requiere_word_semanal,
      informe_word_destino: clasificacion.informe_word_destino,

      // Regla actual: los informes NO alimentan el FINALIZADO ni los numerales estadísticos.
      // Quedan guardados para historial/Word/fotos y solo alimentan contador visual cuando corresponda.
      alimenta_finalizado: false,
      alimenta_estadisticas: false,
      contador_circular: clasificacion.contador_circular,

      payload_completo: {
        ...(payload?.payload_completo || {}),
        informe_key: informeKey,
        categoria_evento: clasificacion.categoria_evento,
        subtipo_evento: clasificacion.subtipo_evento,
        area_interes: clasificacion.area_interes,
        alimenta_finalizado: false,
        alimenta_estadisticas: false,
        contador_circular: clasificacion.contador_circular,
      },
      metadata: {
        ...(payload?.metadata || {}),
        tipo_evento: tipoEvento,
        informe_key: informeKey,
        generado_desde: "wsp.js",
        guardado_por_upsert: true,
        alimenta_finalizado: false,
        alimenta_estadisticas: false,
        contador_circular: clasificacion.contador_circular,
      },
    };
  }

  function payloadInformeEventoParaSupabaseWsp(data = {}) {
    return {
      fuente: data.fuente || "WSP",
      operativo_key: data.operativo_key || "",
      tipo_evento: data.tipo_evento,
      guardia_fecha: data.guardia_fecha,
      informe_key: data.informe_key,

      horario: data.horario || "",
      lugar: data.lugar || "",
      tipo_operativo: data.tipo_operativo || "",
      resultados: data.resultados || {},
      medidas_cautelares: data.medidas_cautelares || {},
      detalles: Array.isArray(data.detalles) ? data.detalles : [],
      observaciones: data.observaciones || "",
      texto_generado: data.texto_generado || "",
      payload_completo: data.payload_completo || {},

      categoria_evento: data.categoria_evento,
      subtipo_evento: data.subtipo_evento,
      area_interes: Array.isArray(data.area_interes) ? data.area_interes : [],
      requiere_fiscalia: !!data.requiere_fiscalia,
      requiere_traslado_comisaria: !!data.requiere_traslado_comisaria,
      requiere_word_semanal: !!data.requiere_word_semanal,
      informe_word_destino: Array.isArray(data.informe_word_destino) ? data.informe_word_destino : [],
      alimenta_finalizado: false,
      alimenta_estadisticas: false,
      contador_circular: !!data.contador_circular,
    };
  }

  function resultadoInformeSinSupabaseWsp(data = {}, motivo = "", ctx = {}) {
    const deps = getDeps(ctx.deps || {});
    return {
      evento: {
        id: null,
        operativo_key: data?.operativo_key || "",
        guardia_fecha: data?.guardia_fecha || deps.getGuardiaFechaISO(),
        informe_key: data?.informe_key || "",
        tipo_evento: data?.tipo_evento || "INFORME",
        payload_completo: data?.payload_completo || {},
      },
      estado: null,
      informe_key: data?.informe_key || "",
      supabase_ok: false,
      motivo_error: motivo,
    };
  }

  async function guardarInformeEventoWsp(tipoEvento, payload = {}, nroActa = "", ctx = {}) {
    const deps = getDeps(ctx.deps || {});
    const franja = ctx.franja || null;
    const data = prepararPayloadInformeEventoWsp(tipoEvento, payload, nroActa, { ...ctx, deps });

    try {
      const repo = window.BMZCN?.OperativosRepo;
      if (repo?.guardarInforme) {
        const resultado = await repo.guardarInforme(tipoEvento, {
          ...data,
          nro_acta: nroActa,
          acta: nroActa,
          operativo_estado_id: franja?.__inicioGuardadoPayload?.operativo_estado_id || data.operativo_estado_id || null,
        });
        return { ...resultado, supabase_ok: true };
      }
    } catch (e) {
      deps.console.error("[WSP historial informes] Error guardando informe mediante OperativosRepo.", e);
      deps.alert("Error guardando el informe en Supabase. Se enviará igual por WhatsApp; revise conexión/RLS/bucket para archivar fotos.");
      return resultadoInformeSinSupabaseWsp(data, String(e?.message || e || "error"), { ...ctx, deps });
    }

    // Respaldo sin REST si OperativosRepo no está cargado.
    // No se usa on_conflict ni guardados directos duplicados. El guardado canónico de informes
    // debe pasar por BMZCN.OperativosRepo para mantener una sola fuente de verdad.
    deps.console.error("[WSP historial informes] OperativosRepo no disponible para guardar informe. No se usa fallback REST.");
    deps.alert("No se pudo guardar el informe en Supabase porque OperativosRepo no está disponible. Se enviará igual por WhatsApp; las fotos no quedarán archivadas.");
    return resultadoInformeSinSupabaseWsp(data, "OperativosRepo no disponible", { ...ctx, deps });
  }

  const api = {
    TIPOS,
    normalizarComponenteInformeKeyWsp,
    clasificacionEventoInformeWsp,
    construirInformeKeyWsp,
    prepararPayloadInformeEventoWsp,
    payloadInformeEventoParaSupabaseWsp,
    resultadoInformeSinSupabaseWsp,
    guardarInformeEventoWsp,
  };

  window.WSP.services.historialInformes = api;
  window.WSP.modules.historialInformes = api;

  console.log("[WSP historial informes] cargado");
})();
