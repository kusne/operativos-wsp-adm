(function () {
  "use strict";

  window.WSP = window.WSP || {};
  window.WSP.modules = window.WSP.modules || {};

  function getEl(id) {
    return document.getElementById(id);
  }

  function defaultRefs() {
    return {
      bloqueInformeAlcoholemia: getEl("bloqueInformeAlcoholemia"),
      infAlco460: getEl("infAlco460"),
      infAlcoTipoVehiculo: getEl("infAlcoTipoVehiculo"),
      wrapInfAlcoTipoOtro: getEl("wrapInfAlcoTipoOtro"),
      infAlcoTipoOtro: getEl("infAlcoTipoOtro"),
      infAlcoMarca: getEl("infAlcoMarca"),
      infAlcoModelo: getEl("infAlcoModelo"),
      infAlcoDominio: getEl("infAlcoDominio"),
      infAlcoConductor: getEl("infAlcoConductor"),
      infAlcoGraduacion: getEl("infAlcoGraduacion"),
      infAlcoActa: getEl("infAlcoActa"),
      infAlcoLicenciaClase: getEl("infAlcoLicenciaClase"),
      infAlcoLicenciaDigital: getEl("infAlcoLicenciaDigital"),
      infAlcoOtrosCodigos: getEl("infAlcoOtrosCodigos"),
      infAlcoMedProhibicion: getEl("infAlcoMedProhibicion"),
      infAlcoMedCesion: getEl("infAlcoMedCesion"),
      infAlcoMedRemision: getEl("infAlcoMedRemision"),
      infAlcoMedRetencion: getEl("infAlcoMedRetencion"),
      infAlcoDependenciaRemite: getEl("infAlcoDependenciaRemite"),
      infAlcoCorralon: getEl("infAlcoCorralon"),
      infAlcoInventario: getEl("infAlcoInventario"),
      bloqueAlcoRemisionDestino: getEl("bloqueAlcoRemisionDestino"),
      infAlcoObservacionExtra: getEl("infAlcoObservacionExtra"),
      infAlcoResultadoAuto: getEl("infAlcoResultadoAuto"),
      infAlcoFotos: [1, 2, 3, 4].map((n) => getEl(`infAlcoFoto${n}`)).filter(Boolean),
    };
  }

  function withRefs(refs) {
    return Object.assign(defaultRefs(), refs || {});
  }

  function limpiarTextoSimple(txt) {
    return String(txt || "")
      .replace(/\s+/g, " ")
      .trim();
  }

  function normalizarBasicoSinAcentos(txt) {
    return String(txt || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();
  }

  function normalizarMayusInforme(value) {
    return limpiarTextoSimple(value || "").toUpperCase();
  }

  function normalizarMayusInformeInput(value) {
    return String(value || "")
      .replace(/[–—]/g, "-")
      .toUpperCase();
  }

  function normalizarNumeroActaInforme(value) {
    return String(value || "").replace(/\D+/g, "").slice(0, 12);
  }

  function normalizarLicenciaInforme(value) {
    return normalizarMayusInforme(value || "").replace(/\s+/g, "");
  }

  function normalizarGraduacionInforme(value) {
    return String(value || "")
      .replace(",", ".")
      .replace(/[^\d.]/g, "")
      .replace(/^(\d*\.?\d{0,2}).*$/, "$1");
  }

  function graduacionNumeroInforme(value) {
    const n = Number(normalizarGraduacionInforme(value));
    return Number.isFinite(n) ? n : null;
  }

  function normalizarDominioInforme(value) {
    return normalizarMayusInforme(value || "").replace(/[^A-Z0-9]/g, "");
  }

  function parseCodigosInputInforme(value) {
    return String(value || "")
      .split(/[\s,;/]+/)
      .map((v) => v.replace(/\D+/g, ""))
      .filter(Boolean)
      .filter((codigo, idx, arr) => arr.indexOf(codigo) === idx);
  }

  function labelTipoVehiculoInforme(refs = {}) {
    const r = withRefs(refs);
    const val = r.infAlcoTipoVehiculo?.value || "";
    if (val === "otros") return normalizarMayusInforme(r.infAlcoTipoOtro?.value || "OTROS");
    const opt = r.infAlcoTipoVehiculo?.selectedOptions?.[0];
    return normalizarMayusInforme(opt?.textContent || val);
  }

  function es460Seleccionado(refs = {}) {
    const r = withRefs(refs);
    return !!r.infAlco460?.checked;
  }

  function infoLicencia(refs = {}) {
    const r = withRefs(refs);
    const valor = normalizarLicenciaInforme(r.infAlcoLicenciaClase?.value || "");
    const digital = !!r.infAlcoLicenciaDigital?.checked;
    const esDniSinLicencia = /^\d{7,8}$/.test(valor);
    const esClaseLicencia = !esDniSinLicencia && /^[A-Z0-9.]{2,5}$/.test(valor);

    return {
      valor,
      digital: digital && !esDniSinLicencia,
      esDniSinLicencia,
      esClaseLicencia,
      retencionAutomatica: !!valor && esClaseLicencia && !digital,
      codigoSinLicencia: esDniSinLicencia ? "9119" : "",
    };
  }

  function sincronizarCodigosAutomaticos(refs = {}, calc = null) {
    const r = withRefs(refs);
    const input = r.infAlcoOtrosCodigos;
    if (!input) return;

    const info = infoLicencia(r);
    let codigos = parseCodigosInputInforme(input.value);

    const autoAlcoAnterior = input.dataset.codigoAlcoAuto || "";
    const autoLicAnterior = input.dataset.codigoLicenciaAuto || "";
    const codigoAlco = calc?.codigo ? String(calc.codigo).replace(/\D+/g, "") : "";
    const codigoLicencia = info.codigoSinLicencia ? String(info.codigoSinLicencia).replace(/\D+/g, "") : "";

    if (autoAlcoAnterior && autoAlcoAnterior !== codigoAlco) {
      codigos = codigos.filter((codigo) => codigo !== autoAlcoAnterior);
      delete input.dataset.codigoAlcoAuto;
    }

    if (codigoAlco) {
      if (!codigos.includes(codigoAlco)) codigos.unshift(codigoAlco);
      input.dataset.codigoAlcoAuto = codigoAlco;
    }

    if (autoLicAnterior && autoLicAnterior !== codigoLicencia) {
      codigos = codigos.filter((codigo) => codigo !== autoLicAnterior);
      delete input.dataset.codigoLicenciaAuto;
    }

    if (codigoLicencia) {
      if (!codigos.includes(codigoLicencia)) codigos.push(codigoLicencia);
      input.dataset.codigoLicenciaAuto = codigoLicencia;
    }

    input.value = codigos.filter((codigo, idx, arr) => arr.indexOf(codigo) === idx).join("/");
  }

  function grupoVehiculo(value) {
    const v = normalizarBasicoSinAcentos(value || "").replace(/[\-_]+/g, " ").trim();
    if (/\bmoto\b|motovehiculo|motovehiculo/.test(v)) return "moto";
    if (/\bcamion\b|transporte de pasajeros|chasis con cabina|chasis sin cabina|tractor de carretera|carreton/.test(v)) return "profesional";
    return "general";
  }

  function calcular(tipoVehiculo, graduacion) {
    const n = graduacionNumeroInforme(graduacion);
    if (n == null || n <= 0) return null;

    const grupo = grupoVehiculo(tipoVehiculo);

    if (grupo === "moto") {
      return { grupo, codigo: "2020", sancionable: n > 0.20, noSancionable: n > 0 && n <= 0.20 };
    }

    if (grupo === "profesional") {
      return { grupo, codigo: "2033", sancionable: n > 0, noSancionable: false };
    }

    return { grupo, codigo: "2016", sancionable: n > 0.50, noSancionable: n > 0 && n <= 0.50 };
  }

  function actualizarReglas(refs = {}, options = {}) {
    const r = withRefs(refs);

    if (r.infAlco460?.checked && r.infAlcoTipoVehiculo && r.infAlcoTipoVehiculo.value !== "moto") {
      r.infAlcoTipoVehiculo.value = "moto";
    }

    if (r.wrapInfAlcoTipoOtro && r.infAlcoTipoVehiculo) {
      const esOtro = r.infAlcoTipoVehiculo.value === "otros";
      r.wrapInfAlcoTipoOtro.classList.toggle("hidden", !esOtro);
      if (r.bloqueInformeAlcoholemia) r.bloqueInformeAlcoholemia.classList.toggle("alco-tipo-otros", esOtro);
    }

    if (r.infAlcoActa) r.infAlcoActa.value = normalizarNumeroActaInforme(r.infAlcoActa.value);
    if (r.infAlcoLicenciaClase) r.infAlcoLicenciaClase.value = normalizarLicenciaInforme(r.infAlcoLicenciaClase.value);

    const info = infoLicencia(r);

    if (info.esDniSinLicencia && r.infAlcoLicenciaDigital) r.infAlcoLicenciaDigital.checked = false;

    if (r.infAlcoMedRetencion) {
      if (info.digital) {
        r.infAlcoMedRetencion.checked = false;
        r.infAlcoMedRetencion.disabled = true;
      } else if (info.retencionAutomatica) {
        r.infAlcoMedRetencion.checked = true;
        r.infAlcoMedRetencion.disabled = true;
      } else if (info.esDniSinLicencia) {
        r.infAlcoMedRetencion.checked = false;
        r.infAlcoMedRetencion.disabled = true;
      } else {
        r.infAlcoMedRetencion.disabled = false;
      }
    }

    if (r.infAlco460?.checked && r.infAlcoMedRemision) {
      r.infAlcoMedRemision.checked = true;
      r.infAlcoMedRemision.disabled = true;
    } else if (r.infAlcoMedRemision) {
      r.infAlcoMedRemision.disabled = false;
    }

    const mostrarDestino = !!(r.infAlco460?.checked || r.infAlcoMedRemision?.checked);
    if (r.bloqueAlcoRemisionDestino) r.bloqueAlcoRemisionDestino.classList.toggle("hidden", !mostrarDestino);
    if (mostrarDestino && typeof options.completarDestinoRemisionSiVacio === "function") {
      options.completarDestinoRemisionSiVacio();
    }

    const tipo = typeof options.labelTipoVehiculoInforme === "function"
      ? options.labelTipoVehiculoInforme()
      : labelTipoVehiculoInforme(r);

    const grad = normalizarGraduacionInforme(r.infAlcoGraduacion?.value || "");
    const calc = calcular(tipo, grad);

    sincronizarCodigosAutomaticos(r, calc);

    if (r.infAlcoResultadoAuto) {
      if (!calc) {
        r.infAlcoResultadoAuto.textContent = "Complete tipo de vehículo y graduación mayor a cero.";
      } else {
        const tag460 = r.infAlco460?.checked ? "  >460/22" : "";
        r.infAlcoResultadoAuto.textContent = `${calc.sancionable ? "POSITIVA SANCIONABLE" : "POSITIVA NO SANCIONABLE"} - CÓDIGO ${calc.codigo}${tag460} - ${grad} G/L`;
      }
    }
  }

  function aplicarMayusculasInputs(refs = {}) {
    const r = withRefs(refs);
    const root = r.bloqueInformeAlcoholemia || document;
    root.querySelectorAll(".upper-input").forEach((el) => {
      const pos = el.selectionStart;
      const end = el.selectionEnd;
      el.value = normalizarMayusInformeInput(el.value);
      try {
        if (pos != null && end != null) el.setSelectionRange(pos, end);
      } catch {}
    });
  }

  function limpiar(refs = {}, options = {}) {
    const r = withRefs(refs);
    const limpiarErrorCampo = typeof options.limpiarErrorCampo === "function" ? options.limpiarErrorCampo : () => {};

    const campos = [
      r.infAlcoTipoVehiculo,
      r.infAlcoTipoOtro,
      r.infAlcoMarca,
      r.infAlcoModelo,
      r.infAlcoDominio,
      r.infAlcoConductor,
      r.infAlcoGraduacion,
      r.infAlcoActa,
      r.infAlcoLicenciaClase,
      r.infAlcoOtrosCodigos,
      r.infAlcoDependenciaRemite,
      r.infAlcoCorralon,
      r.infAlcoObservacionExtra,
    ];

    campos.forEach((el) => {
      if (!el) return;
      el.value = "";
      limpiarErrorCampo(el);
    });

    if (r.infAlcoOtrosCodigos) {
      delete r.infAlcoOtrosCodigos.dataset.codigoLicenciaAuto;
      delete r.infAlcoOtrosCodigos.dataset.codigoAlcoAuto;
    }

    [
      r.infAlco460,
      r.infAlcoLicenciaDigital,
      r.infAlcoMedProhibicion,
      r.infAlcoMedCesion,
      r.infAlcoMedRemision,
      r.infAlcoMedRetencion,
      r.infAlcoInventario,
    ].forEach((el) => {
      if (!el) return;
      el.checked = false;
      el.disabled = false;
    });

    (Array.isArray(r.infAlcoFotos) ? r.infAlcoFotos : []).forEach((el) => {
      if (el) el.value = "";
    });

    actualizarReglas(r, options);
  }

  function codigos(refs = {}, codigoPrincipal) {
    const r = withRefs(refs);
    const out = [];

    if (codigoPrincipal) out.push(String(codigoPrincipal).replace(/\D+/g, ""));

    parseCodigosInputInforme(r.infAlcoOtrosCodigos?.value || "")
      .forEach((codigo) => {
        if (codigo && !out.includes(codigo)) out.push(codigo);
      });

    const codigoLicencia = infoLicencia(r).codigoSinLicencia;
    if (codigoLicencia && !out.includes(codigoLicencia)) out.push(codigoLicencia);

    return out;
  }

  function medidas(refs = {}) {
    const r = withRefs(refs);
    const lic = infoLicencia(r);

    return {
      prohibicion: !!r.infAlcoMedProhibicion?.checked,
      cesion: !!r.infAlcoMedCesion?.checked,
      remision: !!r.infAlcoMedRemision?.checked,
      retencion: !!r.infAlcoMedRetencion?.checked || lic.retencionAutomatica,
    };
  }

  function fotos(refs = {}) {
    const r = withRefs(refs);
    return (Array.isArray(r.infAlcoFotos) ? r.infAlcoFotos : [])
      .map((el) => el?.files?.[0] || null)
      .filter(Boolean)
      .slice(0, 4);
  }

  function validar(refs = {}, options = {}) {
    const r = withRefs(refs);
    const marcarErrorCampo = typeof options.marcarErrorCampo === "function"
      ? options.marcarErrorCampo
      : ((el, mensaje) => {
          if (el) {
            el.classList.add("input-error");
            try { el.focus({ preventScroll: false }); } catch { try { el.focus(); } catch {} }
          }
          alert(mensaje);
          return false;
        });

    if (!options.franjaSeleccionada) return marcarErrorCampo(options.selHorario || null, "Debe seleccionar un operativo.");

    const tipo = typeof options.labelTipoVehiculoInforme === "function"
      ? options.labelTipoVehiculoInforme()
      : labelTipoVehiculoInforme(r);

    if (!r.infAlcoTipoVehiculo?.value) return marcarErrorCampo(r.infAlcoTipoVehiculo, "Debe seleccionar tipo de vehículo.");
    if (r.infAlcoTipoVehiculo.value === "otros" && !normalizarMayusInforme(r.infAlcoTipoOtro?.value)) {
      return marcarErrorCampo(r.infAlcoTipoOtro, "Debe escribir el tipo de vehículo.");
    }
    if (!normalizarMayusInforme(r.infAlcoMarca?.value)) return marcarErrorCampo(r.infAlcoMarca, "Debe completar marca.");
    if (!normalizarDominioInforme(r.infAlcoDominio?.value)) return marcarErrorCampo(r.infAlcoDominio, "Debe completar dominio.");

    const grad = normalizarGraduacionInforme(r.infAlcoGraduacion?.value);
    const calc = calcular(tipo, grad);
    if (!/^\d+(?:\.\d+)?$/.test(grad) || !calc) {
      return marcarErrorCampo(r.infAlcoGraduacion, "Graduación inválida. Use 0.51 o 0,51 y debe ser mayor a cero.");
    }

    if (!normalizarNumeroActaInforme(r.infAlcoActa?.value)) {
      return marcarErrorCampo(r.infAlcoActa, "Debe completar N° de acta. Solo números.");
    }

    const lic = infoLicencia(r);
    if (lic.valor && !lic.esClaseLicencia && !lic.esDniSinLicencia) {
      return marcarErrorCampo(r.infAlcoLicenciaClase, "Licencia: ingrese clase de 2 a 5 caracteres o DNI de 7/8 dígitos si no posee licencia.");
    }

    if (lic.digital && !lic.esClaseLicencia) {
      return marcarErrorCampo(r.infAlcoLicenciaClase, "Si marca Digital debe ingresar la clase de licencia, no DNI.");
    }

    if (r.infAlco460?.checked || r.infAlcoMedRemision?.checked) {
      if (!normalizarMayusInforme(r.infAlcoCorralon?.value)) {
        return marcarErrorCampo(r.infAlcoCorralon, "Debe completar corralón.");
      }
    }

    const codigosFinales = codigos(r, calc.codigo);
    if (typeof options.codigosInvalidosNomenclador === "function") {
      const invalidos = options.codigosInvalidosNomenclador(codigosFinales);
      if (invalidos.length) {
        return marcarErrorCampo(r.infAlcoOtrosCodigos, `Código/s fuera del nomenclador o no permitidos: ${invalidos.join(" / ")}.`);
      }
    }

    return true;
  }

  function diagnosticar(refs = {}) {
    const r = withRefs(refs);
    const tipo = labelTipoVehiculoInforme(r);
    const grad = normalizarGraduacionInforme(r.infAlcoGraduacion?.value || "");

    return {
      modulo: "wsp-alcoholemia",
      cargado: true,
      activo460: es460Seleccionado(r),
      tipoVehiculoValue: r.infAlcoTipoVehiculo?.value || "",
      tipoVehiculoLabel: tipo,
      graduacion: grad,
      calculo: calcular(tipo, grad),
      licencia: infoLicencia(r),
      codigos: codigos(r, calcular(tipo, grad)?.codigo || ""),
      fotosCantidad: fotos(r).length,
    };
  }

  window.WSP.modules.alcoholemia = {
    defaultRefs,
    withRefs,
    limpiarTextoSimple,
    normalizarBasicoSinAcentos,
    normalizarMayusInforme,
    normalizarMayusInformeInput,
    normalizarNumeroActaInforme,
    normalizarLicenciaInforme,
    normalizarGraduacionInforme,
    graduacionNumeroInforme,
    normalizarDominioInforme,
    parseCodigosInputInforme,
    labelTipoVehiculoInforme,
    es460Seleccionado,
    infoLicencia,
    sincronizarCodigosAutomaticos,
    grupoVehiculo,
    calcular,
    actualizarReglas,
    aplicarMayusculasInputs,
    limpiar,
    codigos,
    medidas,
    fotos,
    validar,
    diagnosticar,
  };

  console.log("[WSP alcoholemia] cargado", diagnosticar());
})();
