// ======================================================
// BMZCN - Operativos Repository
// Fuente de verdad: Supabase. Sin localStorage. Sin polling.
// Cargar despues de supabaseClient.js, normalizadores.js y guardia.js.
// ======================================================
(function () {
  'use strict';

  const root = window.BMZCN = window.BMZCN || {};

  const TABLE_ESTADO = 'operativos_estado';
  const TABLE_EVENTOS = 'operativos_eventos';
  const TABLE_FOTOS = 'operativos_eventos_fotos';
  const VIEW_EN_CURSO = 'v_operativos_en_curso_wsp';
  const VIEW_GUARDIA = 'v_operativos_guardia_estadisticas';
  const VIEW_RESULTADOS = 'v_resultados_guardia';
  const BUCKET_FOTOS = 'operativos-historial-fotos';

  function deps() {
    if (!root.Supabase) throw new Error('BMZCN.Supabase no está cargado.');
    if (!root.Normalizadores) throw new Error('BMZCN.Normalizadores no está cargado.');
    if (!root.Guardia) throw new Error('BMZCN.Guardia no está cargado.');
    return { db: root.Supabase, nf: root.Normalizadores, guardia: root.Guardia };
  }

  function estadoOperativoReal(row = {}) {
    const estado = String(row.estado || '').toUpperCase();
    if (estado === 'BORRADO' || estado === 'ANULADO' || row.deleted_at) return 'BORRADO';
    if (estado === 'FINALIZADO' || row.finalizado_evento_id) return 'FINALIZADO';
    if ((estado === 'EN_CURSO' || estado === 'INICIADO' || estado === 'ACTIVO') && row.inicio_evento_id) return 'EN_CURSO';
    return estado || 'SIN_ESTADO';
  }

  function esEnCursoReal(row = {}) {
    return estadoOperativoReal(row) === 'EN_CURSO' && !!row.inicio_evento_id && !row.finalizado_evento_id && !row.deleted_at;
  }

  function normalizeEstadoRow(row = {}) {
    const { nf } = deps();
    return {
      ...row,
      operativo_key: nf.clean(row.operativo_key),
      guardia_fecha: nf.fechaIso(row.guardia_fecha),
      fecha_operativo: nf.fechaIso(row.fecha_operativo),
      hora_desde: nf.horaHHMM(row.hora_desde),
      hora_hasta: nf.clean(row.hora_hasta).toUpperCase() === 'FINALIZAR' ? 'FINALIZAR' : nf.horaHHMM(row.hora_hasta),
      lugar: nf.clean(row.lugar),
      lugar_normalizado: nf.clean(row.lugar_normalizado || row.lugar),
      tipo_operativo: nf.clean(row.tipo_operativo),
      ordenes_origen: nf.jsonArray(row.ordenes_origen),
      estado_real: estadoOperativoReal(row)
    };
  }

  function dedupeByKey(rows = []) {
    const map = new Map();
    rows.forEach((raw) => {
      const row = normalizeEstadoRow(raw);
      const key = row.operativo_key;
      if (!key) return;
      const prev = map.get(key);
      const currTs = new Date(row.updated_at || row.created_at || 0).getTime();
      const prevTs = new Date(prev?.updated_at || prev?.created_at || 0).getTime();
      if (!prev || currTs >= prevTs) map.set(key, row);
    });
    return Array.from(map.values());
  }

  function buildEstadoPayload(input = {}, estado = 'EN_CURSO') {
    const { nf, guardia } = deps();
    const partes = nf.horarioPartes(input.horario || '');
    const guardiaFecha = nf.fechaIso(input.guardia_fecha) || guardia.guardiaFecha();
    const operativoKey = nf.clean(input.operativo_key) || nf.buildOperativoKeyBase({ ...input, guardia_fecha: guardiaFecha });
    if (!operativoKey) throw new Error('No se pudo construir operativo_key.');

    return {
      operativo_key: operativoKey,
      operativo_publicado_id: input.operativo_publicado_id || null,
      guardia_fecha: guardiaFecha,
      fecha_operativo: nf.fechaIso(input.fecha_operativo || input.fecha) || null,
      hora_desde: nf.horaHHMM(input.hora_desde || partes.desde) || null,
      hora_hasta: nf.clean(input.hora_hasta || partes.hasta).toUpperCase() === 'FINALIZAR'
        ? 'FINALIZAR'
        : (nf.horaHHMM(input.hora_hasta || partes.hasta) || null),
      lugar: nf.clean(input.lugar) || null,
      lugar_normalizado: nf.clean(input.lugar_normalizado || input.lugar) || null,
      tipo_operativo: nf.clean(input.tipo_operativo || input.tipo_corto || input.titulo) || null,
      ordenes_origen: nf.jsonArray(input.ordenes_origen),
      estado,
      fuente_creacion: nf.clean(input.fuente || 'WSP') || 'WSP',
      metadata: {
        ...nf.jsonObject(input.metadata),
        horario: nf.clean(input.horario),
        titulo: nf.clean(input.titulo),
        actualizado_desde_repo: true
      },
      updated_at: new Date().toISOString(),
      deleted_at: null
    };
  }

  function buildEventoPayload(estadoRow, tipoEvento, input = {}) {
    const { nf, guardia } = deps();
    const partes = nf.horarioPartes(input.horario || '');
    const tipo = nf.clean(tipoEvento).toUpperCase();
    const operativoKey = nf.clean(estadoRow?.operativo_key || input.operativo_key);
    const guardiaFecha = nf.fechaIso(input.guardia_fecha || estadoRow?.guardia_fecha) || guardia.guardiaFecha();
    const eventoKey = nf.clean(input.evento_key) || [guardiaFecha, operativoKey, tipo].map(nf.normalizarKey).join('|');

    return {
      operativo_estado_id: estadoRow.id,
      operativo_key: operativoKey,
      evento_key: eventoKey,
      informe_key: nf.clean(input.informe_key) || null,
      guardia_fecha: guardiaFecha,
      tipo_evento: tipo,
      fuente: nf.clean(input.fuente || 'WSP') || 'WSP',
      fecha: nf.fechaIso(input.fecha || input.fecha_operativo) || null,
      horario: nf.clean(input.horario) || null,
      hora_desde: nf.horaHHMM(input.hora_desde || partes.desde) || null,
      hora_hasta: nf.clean(input.hora_hasta || partes.hasta).toUpperCase() === 'FINALIZAR'
        ? 'FINALIZAR'
        : (nf.horaHHMM(input.hora_hasta || partes.hasta) || null),
      lugar: nf.clean(input.lugar) || null,
      tipo_operativo: nf.clean(input.tipo_operativo || input.tipo_corto || input.titulo) || null,
      ordenes_origen: nf.jsonArray(input.ordenes_origen),
      personal: nf.jsonArray(input.personal),
      moviles: nf.jsonArray(input.moviles),
      motos: nf.jsonArray(input.motos),
      elementos: nf.jsonObject(input.elementos),
      resultados: nf.jsonObject(input.resultados),
      medidas_cautelares: nf.jsonObject(input.medidas_cautelares || input.medidas),
      detalles: Array.isArray(input.detalles) ? input.detalles : nf.jsonArray(input.detalles),
      observaciones: nf.clean(input.observaciones) || null,
      texto_generado: String(input.texto_generado || ''),
      payload_completo: {
        ...nf.jsonObject(input.payload_completo),
        guardia_fecha: guardiaFecha,
        operativo_key: operativoKey,
        tipo_evento: tipo,
        evento_key: eventoKey
      },
      metadata: {
        ...nf.jsonObject(input.metadata),
        actualizado_desde_repo: true
      }
    };
  }

  async function upsertEstado(input = {}, estado = 'EN_CURSO') {
    const { db } = deps();
    const body = buildEstadoPayload(input, estado);
    const rows = await db.upsert(TABLE_ESTADO, body, { onConflict: 'operativo_key', returning: true, merge: true });
    const row = Array.isArray(rows) ? rows[0] : rows;
    if (!row?.id) throw new Error('No se pudo crear/actualizar operativos_estado.');
    return row;
  }

  async function upsertEvento(estadoRow, tipoEvento, input = {}) {
    const { db } = deps();
    const body = buildEventoPayload(estadoRow, tipoEvento, input);
    const conflict = body.informe_key ? 'informe_key' : 'evento_key';
    const rows = await db.upsert(TABLE_EVENTOS, body, { onConflict: conflict, returning: true, merge: true });
    const row = Array.isArray(rows) ? rows[0] : rows;
    if (!row?.id) throw new Error('No se pudo crear/actualizar operativos_eventos.');
    return row;
  }

  async function patchEstado(id, patch = {}) {
    const { db } = deps();
    if (!id) throw new Error('patchEstado requiere id.');
    const rows = await db.update(TABLE_ESTADO, { id: `eq.${id}` }, { ...patch, updated_at: new Date().toISOString() }, { returning: true });
    return Array.isArray(rows) ? rows[0] : rows;
  }

  function validationError(code, message) {
    const err = new Error(message);
    err.code = code;
    err.esValidacionOperativa = true;
    return err;
  }

  async function leerEstadoPorKey(operativoKey, guardiaFecha = '') {
    const { db, nf } = deps();
    const key = nf.clean(operativoKey);
    if (!key) return null;
    const gf = nf.fechaIso(guardiaFecha);
    const params = {
      select: '*',
      operativo_key: `eq.${key}`,
      order: 'updated_at.desc',
      limit: '1'
    };
    if (gf) params.guardia_fecha = `eq.${gf}`;
    const rows = await db.select(TABLE_ESTADO, params);
    return Array.isArray(rows) ? rows[0] || null : rows || null;
  }

  async function leerEstadoPorId(id) {
    const { db, nf } = deps();
    const cleanId = nf.clean(id);
    if (!cleanId) return null;
    const rows = await db.select(TABLE_ESTADO, {
      select: '*',
      id: `eq.${cleanId}`,
      limit: '1'
    });
    return Array.isArray(rows) ? rows[0] || null : rows || null;
  }

  async function guardarInicio(input = {}) {
    const base = buildEstadoPayload(input, 'EN_CURSO');
    const existente = await leerEstadoPorKey(base.operativo_key, base.guardia_fecha);
    const estadoRealExistente = existente ? estadoOperativoReal(existente) : '';

    // Regla BMZCN:
    // - INICIO nuevo: permitido.
    // - INICIO existente EN_CURSO: permitido como actualización del inicio vigente.
    // - INICIO ya FINALIZADO: prohibido. Para modificar el finalizado, actualizar FINALIZADO.
    if (existente && estadoRealExistente === 'FINALIZADO') {
      throw validationError(
        'VALIDACION_INICIO_YA_FINALIZADO',
        'No se puede actualizar el INICIO porque el operativo ya está FINALIZADO. Para modificarlo, actualice el FINALIZADO.'
      );
    }

    const estado = await upsertEstado(input, 'EN_CURSO');
    const evento = await upsertEvento(estado, 'INICIO', input);
    const estadoActualizado = await patchEstado(estado.id, {
      estado: 'EN_CURSO',
      inicio_evento_id: evento.id,
      finalizado_evento_id: null,
      deleted_at: null
    });
    return { estado: estadoActualizado || estado, evento };
  }

  async function guardarFinalizado(input = {}) {
    const base = buildEstadoPayload(input, 'FINALIZADO');
    const estado = await leerEstadoPorKey(base.operativo_key, base.guardia_fecha);

    if (!estado || !estado.inicio_evento_id || estadoOperativoReal(estado) === 'BORRADO') {
      throw validationError(
        'VALIDACION_FINALIZADO_SIN_INICIO',
        'Debe iniciar el operativo antes de finalizarlo.'
      );
    }

    const estadoReal = estadoOperativoReal(estado);
    if (estadoReal !== 'EN_CURSO' && estadoReal !== 'FINALIZADO') {
      throw validationError(
        'VALIDACION_FINALIZADO_ESTADO_INVALIDO',
        'Debe iniciar el operativo antes de finalizarlo.'
      );
    }

    // Regla BMZCN:
    // - FINALIZADO de EN_CURSO: permitido, cierra el operativo.
    // - FINALIZADO de FINALIZADO: permitido como actualización del último finalizado válido.
    // - FINALIZADO sin INICIO: prohibido.
    const evento = await upsertEvento(estado, 'FINALIZADO', input);
    const estadoActualizado = await patchEstado(estado.id, {
      estado: 'FINALIZADO',
      finalizado_evento_id: evento.id,
      deleted_at: null
    });
    return { estado: estadoActualizado || estado, evento };
  }

  function informeKey(tipoEvento, input = {}) {
    const { nf, guardia } = deps();
    const guardiaFecha = nf.fechaIso(input.guardia_fecha) || guardia.guardiaFecha();
    const operativoKey = nf.clean(input.operativo_key) || 'sin_operativo';
    const tipo = nf.clean(tipoEvento || input.tipo_evento || 'INFORME').toUpperCase();
    const nroActa = nf.normalizarCodigo(input.nro_acta || input.acta || input?.payload_completo?.datos_formulario?.nro_acta || '') || 'sin_acta';
    return [guardiaFecha, operativoKey, tipo, nroActa].map(nf.normalizarKey).join('|');
  }

  async function guardarInforme(tipoEvento, input = {}) {
    const { nf } = deps();
    const key = nf.clean(input.informe_key) || informeKey(tipoEvento, input);
    let estado = input.operativo_estado_id ? await leerEstadoPorId(input.operativo_estado_id) : null;

    if (!estado) {
      const base = buildEstadoPayload(input, 'EN_CURSO');
      estado = await leerEstadoPorKey(base.operativo_key, base.guardia_fecha);
    }

    if (!estado?.id || !estado.inicio_evento_id || !esEnCursoReal(estado)) {
      throw validationError(
        'VALIDACION_INFORME_SIN_OPERATIVO_EN_CURSO',
        'Debe iniciar el operativo antes de cargar informes.'
      );
    }

    const evento = await upsertEvento(estado, tipoEvento, {
      ...input,
      informe_key: key,
      alimenta_finalizado: false,
      alimenta_estadisticas: false,
      contador_circular: input.contador_circular !== false,
      metadata: {
        ...nf.jsonObject(input.metadata),
        informe_key: key,
        alimenta_finalizado: false,
        alimenta_estadisticas: false
      }
    });
    return { estado, evento, informe_key: key };
  }

  async function leerOperativosEnCurso({ guardiaFecha = '', limit = 200 } = {}) {
    const { db, nf, guardia } = deps();
    const gf = nf.fechaIso(guardiaFecha) || guardia.guardiaFecha();

    try {
      const rows = await db.select(VIEW_EN_CURSO, {
        select: '*',
        guardia_fecha: `eq.${gf}`,
        order: 'hora_desde.asc,updated_at.desc',
        limit
      });
      return dedupeByKey(Array.isArray(rows) ? rows.filter(esEnCursoReal) : []);
    } catch (viewError) {
      console.warn('[BMZCN] Vista v_operativos_en_curso_wsp no disponible. Se usa operativos_estado con filtro estricto.', viewError);
      const rows = await db.select(TABLE_ESTADO, {
        select: '*',
        guardia_fecha: `eq.${gf}`,
        estado: 'eq.EN_CURSO',
        order: 'hora_desde.asc,updated_at.desc',
        limit
      });
      return dedupeByKey(Array.isArray(rows) ? rows.filter(esEnCursoReal) : []);
    }
  }

  async function leerOperativosGuardia({ guardiaFecha = '', limit = 500 } = {}) {
    const { db, nf, guardia } = deps();
    const gf = nf.fechaIso(guardiaFecha) || guardia.guardiaFecha();
    try {
      const rows = await db.select(VIEW_GUARDIA, {
        select: '*',
        guardia_fecha: `eq.${gf}`,
        order: 'hora_desde.asc,updated_at.desc',
        limit
      });
      return Array.isArray(rows) ? rows : [];
    } catch (viewError) {
      console.warn('[BMZCN] Vista v_operativos_guardia_estadisticas no disponible. Se usa operativos_estado.', viewError);
      const rows = await db.select(TABLE_ESTADO, {
        select: '*',
        guardia_fecha: `eq.${gf}`,
        order: 'hora_desde.asc,updated_at.desc',
        limit
      });
      return Array.isArray(rows) ? rows.map(normalizeEstadoRow) : [];
    }
  }

  async function leerResultadosGuardia({ guardiaFecha = '' } = {}) {
    const { db, nf, guardia } = deps();
    const gf = nf.fechaIso(guardiaFecha) || guardia.guardiaFecha();
    const rows = await db.select(VIEW_RESULTADOS, { select: '*', guardia_fecha: `eq.${gf}`, limit: 1 });
    return Array.isArray(rows) ? rows[0] || null : rows;
  }

  async function borrarOperativo(operativoKey, { motivo = 'BORRADO_DESDE_APP' } = {}) {
    const { db, nf } = deps();
    const key = nf.clean(operativoKey);
    if (!key) throw new Error('borrarOperativo requiere operativo_key.');
    const rows = await db.update(TABLE_ESTADO, { operativo_key: `eq.${key}` }, {
      estado: 'BORRADO',
      deleted_at: new Date().toISOString(),
      metadata: { motivo_borrado: motivo }
    }, { returning: true });
    return Array.isArray(rows) ? rows[0] || null : rows;
  }

  async function subirFotoEvento(evento, file, numero = 1) {
    const { db, nf, guardia } = deps();
    if (!evento?.id) throw new Error('subirFotoEvento requiere evento.id.');
    if (!file) throw new Error('subirFotoEvento requiere file.');

    const guardiaFecha = nf.fechaIso(evento.guardia_fecha) || guardia.guardiaFecha();
    const operativoKey = nf.normalizarKey(evento.operativo_key || 'sin_operativo').replace(/[^a-z0-9_-]+/g, '_');
    const tipo = nf.normalizarKey(evento.tipo_evento || 'evento').replace(/[^a-z0-9_-]+/g, '_');
    const ext = String(file.name || '').split('.').pop() || 'jpg';
    const path = `${guardiaFecha}/${operativoKey}/${evento.id}/${tipo}_${numero}.${ext}`;

    await db.uploadObject(BUCKET_FOTOS, path, file, { contentType: file.type || 'image/jpeg', upsert: true });
    const public_url = db.publicUrl(BUCKET_FOTOS, path);
    const row = {
      evento_id: evento.id,
      operativo_estado_id: evento.operativo_estado_id || null,
      operativo_key: evento.operativo_key || null,
      tipo_evento: evento.tipo_evento || null,
      foto_numero: numero,
      storage_bucket: BUCKET_FOTOS,
      storage_path: path,
      public_url
    };
    const rows = await db.upsert(TABLE_FOTOS, row, { onConflict: 'evento_id,foto_numero', returning: true, merge: true });
    return Array.isArray(rows) ? rows[0] : rows;
  }

  async function subirFotosEvento(evento, files = []) {
    const validas = Array.from(files || []).filter(Boolean).slice(0, 4);
    const out = [];
    for (let i = 0; i < validas.length; i += 1) {
      out.push(await subirFotoEvento(evento, validas[i], i + 1));
    }
    return out;
  }

  root.OperativosRepo = {
    TABLE_ESTADO,
    TABLE_EVENTOS,
    TABLE_FOTOS,
    VIEW_EN_CURSO,
    VIEW_GUARDIA,
    VIEW_RESULTADOS,
    BUCKET_FOTOS,
    estadoOperativoReal,
    esEnCursoReal,
    normalizeEstadoRow,
    dedupeByKey,
    upsertEstado,
    upsertEvento,
    patchEstado,
    validationError,
    leerEstadoPorKey,
    leerEstadoPorId,
    guardarInicio,
    guardarFinalizado,
    guardarInforme,
    informeKey,
    leerOperativosEnCurso,
    leerOperativosGuardia,
    leerResultadosGuardia,
    borrarOperativo,
    subirFotoEvento,
    subirFotosEvento
  };
})();
