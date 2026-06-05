(function () {
  "use strict";

  window.WSP = window.WSP || {};
  window.WSP.services = window.WSP.services || {};

  function limpiarTextoLocal(valor) {
    return String(valor || "").trim().replace(/\s+/g, " ");
  }

  function getVentanaOperativosWsp(now = new Date()) {
    /*
      Ventana operativa BMZCN:
      - NO cambia a las 00:00.
      - Cambia recién a las 06:00.
      - Desde 06:00 inclusive hasta 06:00 del día siguiente exclusivo.
      Ejemplo: si son las 02:00 del jueves, la guardia vigente sigue siendo
      miércoles 06:00 → jueves 06:00.
    */
    const desde = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      6,
      0,
      0,
      0
    );

    if (now < desde) {
      desde.setDate(desde.getDate() - 1);
    }

    const hasta = new Date(desde);
    hasta.setDate(hasta.getDate() + 1);

    return { desde, hasta };
  }

  function getGuardiaInicio() {
    return getVentanaOperativosWsp().desde;
  }

  function extraerHoraInicio(h) {
    const hora = extraerHoraInicioCompleta(h);
    return hora ? hora.hh : null;
  }

  function extraerHoraInicioCompleta(h) {
    const s = String(h || "").toLowerCase();

    let m = s.match(/(\d{1,2})\s*[:.]\s*(\d{2})/);
    if (m) {
      const hh = parseInt(m[1], 10);
      const mm = parseInt(m[2], 10);
      if (hh >= 0 && hh <= 23 && mm >= 0 && mm <= 59) return { hh, mm };
    }

    m = s.match(/(?:^|desde|de|horario|hs|h|a\s+las)\s*(\d{1,2})\b/);
    if (m) {
      const hh = parseInt(m[1], 10);
      if (hh >= 0 && hh <= 23) return { hh, mm: 0 };
    }

    m = s.match(/\b(\d{1,2})\b/);
    if (!m) return null;

    const hh = parseInt(m[1], 10);
    return hh >= 0 && hh <= 23 ? { hh, mm: 0 } : null;
  }

  function franjaEnGuardia(h) {
    const hora = extraerHoraInicioCompleta(h);
    if (!hora) return true;

    const { desde, hasta } = getVentanaOperativosWsp();
    const f = new Date(desde.getFullYear(), desde.getMonth(), desde.getDate(), hora.hh, hora.mm, 0, 0);

    if (f < desde) f.setDate(f.getDate() + 1);

    return f >= desde && f < hasta;
  }

  function obtenerFechaFranjaOperativo(franja, orden) {
    return limpiarTextoLocal(franja?.fecha || franja?.__fechaOperativo || orden?.vigencia || "");
  }

  function construirFechaHoraInicioFranja(franja, orden) {
    const ts = Number(franja?.__inicioTs || franja?.sortKey || franja?.inicioTs || franja?.inicio_ts || NaN);
    if (Number.isFinite(ts)) {
      const d = new Date(ts);
      if (!isNaN(d.getTime())) return d;
    }

    const fechaBase = parseVigenciaFlexible(obtenerFechaFranjaOperativo(franja, orden));
    const horaInicio = extraerHoraInicioCompleta(franja?.horario || "");

    if (!(fechaBase instanceof Date) || isNaN(fechaBase.getTime())) return null;
    if (!horaInicio) return null;

    return new Date(
      fechaBase.getFullYear(),
      fechaBase.getMonth(),
      fechaBase.getDate(),
      horaInicio.hh,
      horaInicio.mm,
      0,
      0
    );
  }

  function franjaIniciaEnGuardiaActual(franja, orden) {
    const fechaHoraInicio = construirFechaHoraInicioFranja(franja, orden);

    if (!fechaHoraInicio) {
      return franjaEnGuardia(franja?.horario || "");
    }

    const { desde, hasta } = getVentanaOperativosWsp();
    return fechaHoraInicio >= desde && fechaHoraInicio < hasta;
  }

  function parseVigenciaFlexible(v) {
    const iso = String(v || "").match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (iso) return new Date(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3]));

    const latam = String(v || "").match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (latam) return new Date(Number(latam[3]), Number(latam[2]) - 1, Number(latam[1]));

    const latamCorto = String(v || "").match(/^(\d{1,2})\/(\d{1,2})\/(\d{2})$/);
    if (latamCorto) return new Date(2000 + Number(latamCorto[3]), Number(latamCorto[2]) - 1, Number(latamCorto[1]));

    return null;
  }

  function pad2(n) {
    return String(n).padStart(2, "0");
  }

  function toFechaISO(d) {
    return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
  }

  function getGuardiaFechaISO() {
    return toFechaISO(getGuardiaInicio());
  }

  function getFechasBusquedaInicio() {
    const base = getGuardiaInicio();
    const anterior = new Date(base);
    anterior.setDate(anterior.getDate() - 1);
    return [toFechaISO(base), toFechaISO(anterior)];
  }

  function getDiaGuardiaTexto() {
    const nombres = ["domingo", "lunes", "martes", "miercoles", "jueves", "viernes", "sabado"];
    return nombres[getGuardiaInicio().getDay()] || "";
  }

  window.WSP.services.guardia = {
    getVentanaOperativosWsp,
    getGuardiaInicio,
    extraerHoraInicio,
    extraerHoraInicioCompleta,
    franjaEnGuardia,
    obtenerFechaFranjaOperativo,
    construirFechaHoraInicioFranja,
    franjaIniciaEnGuardiaActual,
    parseVigenciaFlexible,
    pad2,
    toFechaISO,
    getGuardiaFechaISO,
    getFechasBusquedaInicio,
    getDiaGuardiaTexto,
  };

  console.log("[WSP guardia] cargado");
})();
