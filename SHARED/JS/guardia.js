// ======================================================
// BMZCN - Guardia operativa 06:00 -> 06:00
// Sin localStorage.
// ======================================================
(function () {
  'use strict';

  const root = window.BMZCN = window.BMZCN || {};
  root.Versiones = root.Versiones || {};
  root.Versiones.guardia = 'PASO15_GUARDIA_20260604_2355';


  function pad(n) { return String(n).padStart(2, '0'); }

  function toDate(value) {
    if (value instanceof Date) return new Date(value.getTime());
    const d = value ? new Date(value) : new Date();
    return Number.isNaN(d.getTime()) ? new Date() : d;
  }

  function fechaIsoLocal(date) {
    const d = toDate(date);
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  }

  function guardiaInicio(date = new Date()) {
    const d = toDate(date);
    const inicio = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 6, 0, 0, 0);
    if (d < inicio) inicio.setDate(inicio.getDate() - 1);
    return inicio;
  }

  function guardiaFin(date = new Date()) {
    const inicio = guardiaInicio(date);
    const fin = new Date(inicio.getTime());
    fin.setDate(fin.getDate() + 1);
    return fin;
  }

  function guardiaFecha(date = new Date()) {
    return fechaIsoLocal(guardiaInicio(date));
  }

  function rangoGuardia(date = new Date()) {
    const desde = guardiaInicio(date);
    const hasta = guardiaFin(date);
    return {
      guardia_fecha: fechaIsoLocal(desde),
      desde,
      hasta,
      desde_iso: desde.toISOString(),
      hasta_iso: hasta.toISOString()
    };
  }

  function perteneceAGuardia(fecha, hora, guardiaFechaIso = guardiaFecha()) {
    const nf = window.BMZCN?.Normalizadores;
    const fechaIso = nf?.fechaIso ? nf.fechaIso(fecha) : String(fecha || '').slice(0, 10);
    const hhmm = nf?.horaHHMM ? nf.horaHHMM(hora) : String(hora || '').trim();
    if (!fechaIso || !hhmm) return false;
    const [hh, mm] = hhmm.split(':').map(Number);
    const d = new Date(`${fechaIso}T${pad(hh)}:${pad(mm)}:00`);
    return guardiaFecha(d) === guardiaFechaIso;
  }

  root.Guardia = {
    fechaIsoLocal,
    guardiaInicio,
    guardiaFin,
    guardiaFecha,
    rangoGuardia,
    perteneceAGuardia
  };
})();
