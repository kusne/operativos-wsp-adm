(function () {
  "use strict";

  window.WSP = window.WSP || {};
  window.WSP.ui = window.WSP.ui || {};

  function uiHelpers() {
    return window.WSP?.ui?.helpers || {};
  }

  function limpiarErrorCampo(el) {
    const ui = uiHelpers();
    if (ui && typeof ui.limpiarErrorCampo === "function") return ui.limpiarErrorCampo(el);
    if (!el) return;
    el.classList.remove("input-error");
  }

  function leerEnteroNoNegativo(valor) {
    const ui = uiHelpers();
    if (ui && typeof ui.leerEnteroNoNegativo === "function") return ui.leerEnteroNoNegativo(valor);
    const n = parseInt(String(valor ?? "").trim(), 10);
    return Number.isFinite(n) && n > 0 ? n : 0;
  }

  function leerEnteroInput(el) {
    const ui = uiHelpers();
    if (ui && typeof ui.leerEnteroInput === "function") return ui.leerEnteroInput(el);
    return leerEnteroNoNegativo(el?.value);
  }

  function formatearCantidad(n) {
    const ui = uiHelpers();
    if (ui && typeof ui.formatearCantidad === "function") return ui.formatearCantidad(n);
    const v = Math.max(0, parseInt(n, 10) || 0);
    return String(v).padStart(2, "0");
  }

  function normalizarTextoGraduacion(valor) {
    return String(valor || "").replace(/\s+/g, "").trim();
  }

  function graduacionTieneFormatoValido(valor) {
    return /^\d+[.,]\d{2}$/.test(normalizarTextoGraduacion(valor));
  }

  function graduacionEsCero(valor) {
    const limpio = normalizarTextoGraduacion(valor);
    if (!graduacionTieneFormatoValido(limpio)) return false;
    return Number(limpio.replace(",", ".")) === 0;
  }

  function crearInputGraduacion(valorInicial) {
    const slot = document.createElement("div");
    slot.className = "graduacion-slot";

    const abre = document.createElement("span");
    abre.className = "graduacion-paren";
    abre.textContent = "(";

    const input = document.createElement("input");
    input.type = "text";
    input.inputMode = "decimal";
    input.autocomplete = "off";
    input.maxLength = 4;
    input.placeholder = "0,86";
    input.value = valorInicial || "";

    input.addEventListener("input", () => limpiarErrorCampo(input));

    const cierra = document.createElement("span");
    cierra.className = "graduacion-paren";
    cierra.textContent = ")";

    slot.appendChild(abre);
    slot.appendChild(input);
    slot.appendChild(cierra);

    return slot;
  }

  function obtenerValoresGraduaciones(contenedor) {
    return Array.from(contenedor?.querySelectorAll('input[type="text"]') || []).map((inp) => inp.value || "");
  }

  function renderGraduaciones(contenedor, cantidad) {
    if (!contenedor) return;

    const cant = Math.max(0, parseInt(cantidad, 10) || 0);
    const actuales = obtenerValoresGraduaciones(contenedor);
    contenedor.innerHTML = "";

    for (let i = 0; i < cant; i += 1) {
      contenedor.appendChild(crearInputGraduacion(actuales[i] || ""));
    }
  }

  function limpiarGraduaciones(contenedor) {
    if (!contenedor) return;
    contenedor.innerHTML = "";
  }

  function sanitizarValorQrz(valor) {
    return String(valor || "").replace(/\D+/g, "").slice(0, 9);
  }

  function sanitizarValorDominio(valor) {
    return String(valor || "")
      .toUpperCase()
      .replace(/[^A-Z0-9 ]+/g, "")
      .slice(0, 16);
  }

  function crearInputDinamicoLista(tipo, valorInicial) {
    const wrap = document.createElement("div");
    wrap.className = "casillero-dinamico";

    const input = document.createElement("input");
    input.type = "text";
    input.autocomplete = "off";
    input.spellcheck = false;
    input.className = `casillero-${tipo}`;

    if (tipo === "qrz") {
      input.inputMode = "numeric";
      input.maxLength = 9;
      input.placeholder = "36459780";
      input.value = sanitizarValorQrz(valorInicial);
      input.addEventListener("input", () => {
        input.value = sanitizarValorQrz(input.value);
      });
    } else {
      input.inputMode = "text";
      input.maxLength = 16;
      input.placeholder = "AA123QK Sedan";
      input.value = sanitizarValorDominio(valorInicial);
      input.addEventListener("input", () => {
        input.value = sanitizarValorDominio(input.value);
      });
    }

    wrap.appendChild(input);
    return wrap;
  }

  function obtenerValoresListaDinamica(contenedor, tipo) {
    const inputs = Array.from(contenedor?.querySelectorAll('input[type="text"]') || []);
    return inputs.map((input) => {
      const valor = tipo === "qrz" ? sanitizarValorQrz(input.value) : sanitizarValorDominio(input.value);
      input.value = valor;
      return valor;
    });
  }

  function renderListaDinamica(contenedor, cantidad, tipo) {
    if (!contenedor) return;

    const cant = Math.max(0, parseInt(cantidad, 10) || 0);
    const actuales = obtenerValoresListaDinamica(contenedor, tipo);
    contenedor.innerHTML = "";

    for (let i = 0; i < cant; i += 1) {
      contenedor.appendChild(crearInputDinamicoLista(tipo, actuales[i] || ""));
    }
  }

  function limpiarListaDinamica(contenedor) {
    if (!contenedor) return;
    contenedor.innerHTML = "";
  }

  function sincronizarUIQrzDominio(refs = {}) {
    const cantidadQrz = leerEnteroInput(refs.inputQrz);
    refs.wrapQrzCasilleros?.classList.toggle("hidden", cantidadQrz <= 0);
    if (cantidadQrz > 0) renderListaDinamica(refs.qrzCasilleros, cantidadQrz, "qrz");
    else limpiarListaDinamica(refs.qrzCasilleros);

    const cantidadDominio = leerEnteroInput(refs.inputDominio);
    refs.wrapDominioCasilleros?.classList.toggle("hidden", cantidadDominio <= 0);
    if (cantidadDominio > 0) renderListaDinamica(refs.dominioCasilleros, cantidadDominio, "dominio");
    else limpiarListaDinamica(refs.dominioCasilleros);
  }

  function construirBloqueListaVertical(titulo, cantidad, valores) {
    const lineas = [`${titulo}: (${formatearCantidad(cantidad)})`];
    const completos = (Array.isArray(valores) ? valores : []).filter(Boolean);
    if (completos.length) lineas.push(...completos);
    return lineas;
  }

  function sincronizarUIAlcoholimetro(refs = {}) {
    const alcotest = leerEnteroInput(refs.inputAlcotest);
    const posSan = leerEnteroInput(refs.inputPositivaSancionable);
    const posNo = leerEnteroInput(refs.inputPositivaNoSancionable);

    limpiarErrorCampo(refs.inputAlcotest);

    const mostrarPositivos = alcotest > 0;
    refs.bloquePositivosAlcoholimetro?.classList.toggle("hidden", !mostrarPositivos);

    if (!mostrarPositivos) {
      if (refs.inputPositivaSancionable) refs.inputPositivaSancionable.value = "";
      if (refs.inputPositivaNoSancionable) refs.inputPositivaNoSancionable.value = "";
      refs.wrapGraduacionesSancionable?.classList.add("hidden");
      refs.wrapGraduacionesNoSancionable?.classList.add("hidden");
      refs.unitGraduacionesSancionable?.classList.add("hidden");
      refs.unitGraduacionesNoSancionable?.classList.add("hidden");
      limpiarGraduaciones(refs.graduacionesSancionable);
      limpiarGraduaciones(refs.graduacionesNoSancionable);
      return;
    }

    const mostrarGradSan = posSan > 0;
    refs.wrapGraduacionesSancionable?.classList.toggle("hidden", !mostrarGradSan);
    refs.unitGraduacionesSancionable?.classList.toggle("hidden", !mostrarGradSan);
    if (mostrarGradSan) renderGraduaciones(refs.graduacionesSancionable, posSan);
    else limpiarGraduaciones(refs.graduacionesSancionable);

    const mostrarGradNo = posNo > 0;
    refs.wrapGraduacionesNoSancionable?.classList.toggle("hidden", !mostrarGradNo);
    refs.unitGraduacionesNoSancionable?.classList.toggle("hidden", !mostrarGradNo);
    if (mostrarGradNo) renderGraduaciones(refs.graduacionesNoSancionable, posNo);
    else limpiarGraduaciones(refs.graduacionesNoSancionable);
  }

  function serializarGraduaciones(contenedor, etiqueta, { permiteCero = false } = {}) {
    const inputs = Array.from(contenedor?.querySelectorAll('input[type="text"]') || []);
    const valores = [];

    for (const input of inputs) {
      const valor = normalizarTextoGraduacion(input.value);

      if (!valor) {
        return {
          ok: false,
          mensaje: `Complete todas las graduaciones de ${etiqueta}.`,
          input,
        };
      }

      if (!graduacionTieneFormatoValido(valor)) {
        return {
          ok: false,
          mensaje: `Cada graduación de ${etiqueta} debe tener formato 0.00 o 0,00.`,
          input,
        };
      }

      if (!permiteCero && graduacionEsCero(valor)) {
        return {
          ok: false,
          mensaje: `En Positiva Sancionable no se permite 0.00 ni 0,00.`,
          input,
        };
      }

      valores.push(valor);
    }

    return { ok: true, valores };
  }

  function construirLineaGraduaciones(valores) {
    return `Graduaciones: ${valores.map((v) => `(${v})`).join(" ")} g/l`;
  }

  function construirBloqueAlcoholimetro(refs = {}) {
    const alcotest = leerEnteroInput(refs.inputAlcotest);

    if (alcotest <= 0) {
      return {
        ok: true,
        lineas: [`Test de Alcoholímetro: (${formatearCantidad(0)})`],
        cantidadSancionables: 0,
        cantidadNoSancionables: 0,
        totalValidos: 0,
        valoresSan: [],
        valoresNo: [],
      };
    }

    const posSan = leerEnteroInput(refs.inputPositivaSancionable);
    const posNo = leerEnteroInput(refs.inputPositivaNoSancionable);
    const sumaIngresada = posSan + posNo;

    if (posSan <= 0 && posNo <= 0) {
      const el = refs.inputPositivaSancionable || refs.inputPositivaNoSancionable || refs.inputAlcotest;
      return {
        ok: false,
        mensaje: 'Si "Test de Alcoholímetro" es mayor a 0, debe completar Positiva Sancionable o Positiva no Sancionable con un numeral mayor a cero.',
        input: el,
      };
    }

    if (alcotest !== sumaIngresada) {
      return {
        ok: false,
        mensaje: 'Revisar Numerales: Test de Alcoholímetro debe ser igual a Positiva Sancionable + Positiva no Sancionable.',
        input: refs.inputAlcotest,
      };
    }

    let valoresSan = [];
    let valoresNo = [];

    if (posSan > 0) {
      const validacionSan = serializarGraduaciones(refs.graduacionesSancionable, "Positiva Sancionable");
      if (!validacionSan.ok) return validacionSan;
      valoresSan = validacionSan.valores;
    }

    if (posNo > 0) {
      const validacionNo = serializarGraduaciones(refs.graduacionesNoSancionable, "Positiva no Sancionable", { permiteCero: true });
      if (!validacionNo.ok) return validacionNo;
      valoresNo = validacionNo.valores.filter((v) => !graduacionEsCero(v));
    }

    const totalValidos = valoresSan.length + valoresNo.length;
    if (totalValidos === 0) {
      return {
        ok: true,
        lineas: [`Test de Alcoholímetro: (${formatearCantidad(0)})`],
        cantidadSancionables: 0,
        cantidadNoSancionables: 0,
        totalValidos: 0,
        valoresSan: [],
        valoresNo: [],
      };
    }

    const lineas = [
      `Test de Alcoholímetro: (${formatearCantidad(totalValidos)})`,
      `Positiva Sancionable: (${formatearCantidad(valoresSan.length)})`,
    ];

    if (valoresSan.length > 0) {
      lineas.push(construirLineaGraduaciones(valoresSan));
    }

    lineas.push(`Positiva no Sancionable: (${formatearCantidad(valoresNo.length)})`);

    if (valoresNo.length > 0) {
      lineas.push(construirLineaGraduaciones(valoresNo));
    }

    return {
      ok: true,
      lineas,
      cantidadSancionables: valoresSan.length,
      cantidadNoSancionables: valoresNo.length,
      totalValidos,
      valoresSan,
      valoresNo,
    };
  }

  window.WSP.ui.alcoholimetro = {
    normalizarTextoGraduacion,
    graduacionTieneFormatoValido,
    graduacionEsCero,
    crearInputGraduacion,
    obtenerValoresGraduaciones,
    renderGraduaciones,
    limpiarGraduaciones,
    sanitizarValorQrz,
    sanitizarValorDominio,
    crearInputDinamicoLista,
    obtenerValoresListaDinamica,
    renderListaDinamica,
    limpiarListaDinamica,
    sincronizarUIQrzDominio,
    construirBloqueListaVertical,
    sincronizarUIAlcoholimetro,
    serializarGraduaciones,
    construirLineaGraduaciones,
    construirBloqueAlcoholimetro,
  };

  console.log("[WSP alcoholimetro] cargado");
})();
