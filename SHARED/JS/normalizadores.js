// ======================================================
// BMZCN - Normalizadores comunes
// Sin localStorage. Sin dependencia de UI.
// ======================================================
(function () {
  'use strict';

  const root = window.BMZCN = window.BMZCN || {};

  function clean(value) {
    return String(value ?? '').replace(/\s+/g, ' ').trim();
  }

  function upper(value) {
    return clean(value).toUpperCase();
  }

  function sinAcentos(value) {
    return clean(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  function normalizarKey(value) {
    return sinAcentos(value)
      .toLowerCase()
      .replace(/[^a-z0-9/ :._|-]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function normalizarCodigo(value) {
    return clean(value).replace(/[^0-9A-Za-z/-]+/g, '').toUpperCase();
  }

  function jsonArray(value) {
    if (Array.isArray(value)) return value.map(clean).filter(Boolean);
    if (value == null) return [];
    if (typeof value === 'string') {
      const raw = value.trim();
      if (!raw || raw === '/') return [];
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed.map(clean).filter(Boolean);
      } catch {}
      return raw.split('/').map(clean).filter(Boolean).filter((v) => v !== '/');
    }
    return [];
  }

  function jsonObject(value) {
    if (value && typeof value === 'object' && !Array.isArray(value)) return value;
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) return parsed;
      } catch {}
    }
    return {};
  }

  function fechaIso(value) {
    const raw = clean(value);
    if (!raw) return null;

    let m = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (m) return `${m[1]}-${m[2]}-${m[3]}`;

    m = raw.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})$/);
    if (m) {
      const dd = String(Number(m[1]) || 0).padStart(2, '0');
      const mm = String(Number(m[2]) || 0).padStart(2, '0');
      const yy = m[3].length === 2 ? `20${m[3]}` : m[3];
      return `${yy}-${mm}-${dd}`;
    }

    const d = new Date(raw);
    if (!Number.isNaN(d.getTime())) {
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    }

    return null;
  }

  function horaHHMM(value) {
    const raw = clean(value).toUpperCase().replace(/HS?\.?/g, '').trim();
    const m = raw.match(/(\d{1,2})[:.](\d{2})/);
    if (!m) return '';
    const hh = Math.max(0, Math.min(23, Number(m[1]) || 0));
    const mm = Math.max(0, Math.min(59, Number(m[2]) || 0));
    return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
  }

  function horarioPartes(horario) {
    const raw = upper(horario).replace(/HS?\.?/g, '').replace(/\s+/g, ' ');
    const m = raw.match(/(\d{1,2}[:.]\d{2})\s*A\s*((?:\d{1,2}[:.]\d{2})|FINALIZAR)/i);
    if (!m) return { desde: '', hasta: '' };
    return { desde: horaHHMM(m[1]), hasta: upper(m[2]) === 'FINALIZAR' ? 'FINALIZAR' : horaHHMM(m[2]) };
  }

  function compararTexto(a, b) {
    return normalizarKey(a) === normalizarKey(b);
  }

  function buildOperativoKeyBase(data = {}) {
    const horario = clean(data.horario || `${data.hora_desde || ''} A ${data.hora_hasta || ''}`);
    const ordenes = jsonArray(data.ordenes_origen).join('/');
    return [
      data.guardia_fecha,
      data.fecha_operativo || data.fecha,
      horario,
      data.lugar_normalizado || data.lugar,
      data.tipo_operativo,
      ordenes
    ].map(normalizarKey).filter(Boolean).join('|');
  }

  root.Normalizadores = {
    clean,
    upper,
    sinAcentos,
    normalizarKey,
    normalizarCodigo,
    jsonArray,
    jsonObject,
    fechaIso,
    horaHHMM,
    horarioPartes,
    compararTexto,
    buildOperativoKeyBase
  };
})();
