(function () {
  "use strict";

  window.WSP = window.WSP || {};
  window.WSP.ui = window.WSP.ui || {};
  window.WSP.modules = window.WSP.modules || {};

  function limpiarTextoSimple(valor) {
    return String(valor || "")
      .replace(/\s+/g, " ")
      .trim();
  }

  function setTituloOperativos(refs = {}, modoIniciados = false) {
    if (typeof refs.setTituloOperativosIniciados === "function") {
      refs.setTituloOperativosIniciados(!!modoIniciados);
      return;
    }

    try {
      const label = document.querySelector(".operativos-title-label");
      if (label) label.textContent = modoIniciados ? "OPERATIVOS INICIADOS" : "OPERATIVOS";
    } catch {}
  }

  function setPlaceholder(sel, texto = "Seleccionar Operativo") {
    if (!sel) return;
    const label = limpiarTextoSimple(texto) || "Seleccionar Operativo";
    sel.innerHTML = `<option value="">${label}</option>`;
    sel.value = "";
  }

  function prepararBusquedaIniciados(refs = {}) {
    const sel = refs.selHorario;
    setTituloOperativos(refs, true);
    if (sel) {
      sel.disabled = true;
      setPlaceholder(sel, "Buscando operativos iniciados...");
    }
    if (typeof refs.actualizarContadorOperativosWsp === "function") {
      refs.actualizarContadorOperativosWsp(0);
    }
  }

  function prepararSelectorDisponibles(refs = {}) {
    const sel = refs.selHorario;
    setTituloOperativos(refs, false);
    if (sel) {
      sel.disabled = false;
      setPlaceholder(sel, "Seleccionar Operativo");
    }
  }

  function crearOpcionHorario(operativo = {}, deps = {}) {
    if (typeof deps.crearOpcionHorario === "function") {
      const opt = deps.crearOpcionHorario(operativo);
      if (opt) return opt;
    }

    const opt = document.createElement("option");
    opt.value = limpiarTextoSimple(operativo.__key || "");
    const texto = typeof deps.construirTextoOpcionHorario === "function"
      ? deps.construirTextoOpcionHorario(operativo)
      : limpiarTextoSimple(operativo.titulo || operativo.lugar || operativo.__key || "Operativo");
    opt.text = texto;
    opt.title = texto;
    return opt;
  }

  function resolverSeleccionDefault(operativos = [], valorSeleccionado = "", selectorDefault = null) {
    const items = Array.isArray(operativos) ? operativos : [];
    const valor = limpiarTextoSimple(valorSeleccionado);

    if (valor && items.some((item) => item && item.__key === valor)) return valor;
    if (!items.length) return "";

    if (typeof selectorDefault === "function") {
      const seleccionado = selectorDefault(items);
      if (typeof seleccionado === "string") return seleccionado;
      if (seleccionado && seleccionado.__key) return seleccionado.__key;
    }

    if (items.length === 1) return items[0].__key || "";
    return "";
  }

  function renderizarSelectorOperativos(config = {}) {
    const sel = config.selHorario;
    const operativos = Array.isArray(config.operativos) ? config.operativos : [];
    const placeholderConItems = limpiarTextoSimple(config.placeholderConItems || "Seleccionar Operativo");
    const placeholderVacio = limpiarTextoSimple(config.placeholderVacio || placeholderConItems || "Seleccionar Operativo");

    if (!sel) return "";

    sel.innerHTML = operativos.length
      ? `<option value="">${placeholderConItems}</option>`
      : `<option value="">${placeholderVacio}</option>`;

    const deps = config.deps || {};
    operativos.forEach((operativo) => {
      sel.appendChild(crearOpcionHorario(operativo, deps));
    });

    const selectedKey = resolverSeleccionDefault(
      operativos,
      config.valorSeleccionado || "",
      config.selectorDefault
    );
    sel.value = selectedKey || "";

    if (typeof config.actualizarContadorOperativosWsp === "function") {
      config.actualizarContadorOperativosWsp(operativos.length);
    }

    return sel.value || "";
  }

  const api = {
    limpiarTextoSimple,
    setTituloOperativos,
    setPlaceholder,
    prepararBusquedaIniciados,
    prepararSelectorDisponibles,
    crearOpcionHorario,
    resolverSeleccionDefault,
    renderizarSelectorOperativos,
  };

  window.WSP.ui.selectorCarga = api;
  window.WSP.modules.selectorCargaUi = api;

  console.log("[WSP selector carga UI] cargado");
})();
