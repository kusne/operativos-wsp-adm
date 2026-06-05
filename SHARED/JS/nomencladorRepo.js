// ======================================================
// BMZCN - Nomenclador Repository
// Fuente de verdad: Supabase tabla nomenclador_infracciones.
// Cache solo en memoria de la pagina; NO localStorage.
// ======================================================
(function () {
  'use strict';

  const root = window.BMZCN = window.BMZCN || {};
  root.Versiones = root.Versiones || {};
  root.Versiones.nomencladorRepo = 'PASO15_NOMENCLADOR_REPO_20260604_2355';

  const TABLE = 'nomenclador_infracciones';

  let cache = null;
  let cacheAt = 0;

  function deps() {
    if (!root.Supabase) throw new Error('BMZCN.Supabase no está cargado.');
    if (!root.Normalizadores) throw new Error('BMZCN.Normalizadores no está cargado.');
    return { db: root.Supabase, nf: root.Normalizadores };
  }

  function normalizeRow(row = {}) {
    const { nf } = deps();
    return {
      ...row,
      codigo: nf.normalizarCodigo(row.codigo),
      referencia: nf.clean(row.referencia || row.descripcion || row.texto),
      categoria: nf.clean(row.categoria),
      activo: row.activo !== false,
      aliases: nf.jsonArray(row.aliases).map(nf.normalizarKey),
      metadata: nf.jsonObject(row.metadata)
    };
  }

  async function cargar({ force = false } = {}) {
    const { db } = deps();
    if (!force && cache && (Date.now() - cacheAt) < 5 * 60 * 1000) return cache;

    const rows = await db.select(TABLE, {
      select: '*',
      activo: 'eq.true',
      order: 'codigo.asc',
      limit: 5000
    });

    cache = (Array.isArray(rows) ? rows : []).map(normalizeRow).filter((r) => r.codigo && r.referencia);
    cacheAt = Date.now();
    return cache;
  }

  async function obtener(codigo, { force = false } = {}) {
    const { nf } = deps();
    const cod = nf.normalizarCodigo(codigo);
    if (!cod) return null;
    const rows = await cargar({ force });
    return rows.find((r) => r.codigo === cod) || null;
  }

  async function referencia(codigo) {
    const row = await obtener(codigo);
    return row?.referencia || '';
  }

  async function buscar(texto, { limit = 20 } = {}) {
    const { nf } = deps();
    const q = nf.normalizarKey(texto);
    if (!q) return [];
    const rows = await cargar();
    return rows
      .map((row) => {
        const ref = nf.normalizarKey(row.referencia);
        const cod = nf.normalizarKey(row.codigo);
        const aliases = row.aliases || [];
        let score = 0;
        if (cod === q) score += 100;
        if (cod.includes(q)) score += 50;
        if (ref.includes(q)) score += 40;
        if (aliases.some((a) => a === q)) score += 80;
        if (aliases.some((a) => a.includes(q))) score += 30;
        return { row, score };
      })
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score || a.row.codigo.localeCompare(b.row.codigo))
      .slice(0, limit)
      .map((x) => x.row);
  }

  async function normalizarDetalle(detalle = {}) {
    const { nf } = deps();
    const codigo = nf.normalizarCodigo(detalle.codigo || detalle.cod || detalle.id || '');
    const cantidad = Math.max(1, parseInt(detalle.cantidad || detalle.numeral || detalle.qty || 1, 10) || 1);
    const row = codigo ? await obtener(codigo) : null;
    return {
      codigo,
      cantidad,
      referencia: row?.referencia || nf.clean(detalle.referencia || detalle.descripcion || ''),
      origen: row ? 'nomenclador_db' : 'manual_sin_match',
      metadata: {
        ...(detalle.metadata || {}),
        nomenclador_id: row?.id || null
      }
    };
  }

  function limpiarCache() {
    cache = null;
    cacheAt = 0;
  }

  root.NomencladorRepo = {
    TABLE,
    cargar,
    obtener,
    referencia,
    buscar,
    normalizarDetalle,
    limpiarCache
  };
})();
