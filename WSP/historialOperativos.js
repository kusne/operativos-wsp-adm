// ===== HISTORIAL OPERATIVOS WSP =====
// Servicio aislado para guardar INICIO / FINALIZADO / eventos intermedios en Supabase.
// No toca la UI ni el armado del WhatsApp. Si falla Supabase, WSP debe seguir enviando el informe.
(function () {
  const HIST_SUPABASE_URL = "https://ugeydxozfewzhldjbkat.supabase.co";
  const HIST_SUPABASE_ANON_KEY = "sb_publishable_ZeLC2rOxhhUXlQdvJ28JkA_qf802-pX";

  const TABLE_ESTADO = "operativos_estado";
  const TABLE_EVENTOS = "operativos_eventos";

  function clean(value) {
    return String(value ?? "").replace(/\s+/g, " ").trim();
  }

  function jsonArray(value) {
    if (Array.isArray(value)) return value.map(clean).filter(Boolean);
    if (value == null) return [];
    if (typeof value === "string") {
      const raw = value.trim();
      if (!raw || raw === "/") return [];
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed.map(clean).filter(Boolean);
      } catch {}
      return raw.split("/").map(clean).filter(Boolean).filter((v) => v !== "/");
    }
    return [];
  }

  function jsonObject(value) {
    if (value && typeof value === "object" && !Array.isArray(value)) return value;
    return {};
  }

  function fechaIso(value) {
    const raw = clean(value);
    if (!raw) return null;

    let m = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (m) return `${m[1]}-${m[2]}-${m[3]}`;

    m = raw.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})$/);
    if (m) {
      const dd = String(Number(m[1]) || 0).padStart(2, "0");
      const mm = String(Number(m[2]) || 0).padStart(2, "0");
      const yy = m[3].length === 2 ? `20${m[3]}` : m[3];
      return `${yy}-${mm}-${dd}`;
    }

    const d = new Date(raw);
    if (!isNaN(d.getTime())) {
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    }

    return null;
  }

  function horaPartesFromHorario(horario) {
    const raw = clean(horario).toUpperCase();
    const m = raw.match(/(\d{1,2}:\d{2})\s*A\s*((?:\d{1,2}:\d{2})|FINALIZAR)/i);
    if (!m) return { desde: "", hasta: "" };
    return { desde: clean(m[1]), hasta: clean(m[2]).toUpperCase() };
  }

  function buildOperativoKey(payload) {
    const directo = clean(payload?.operativo_key);
    if (directo) return directo;

    const partes = [
      clean(payload?.guardia_fecha),
      clean(payload?.fecha_operativo || payload?.fecha),
      clean(payload?.horario || `${payload?.hora_desde || ""} A ${payload?.hora_hasta || ""}`),
      clean(payload?.lugar),
      clean(payload?.tipo_operativo),
      jsonArray(payload?.ordenes_origen).join("/")
    ].map((v) => v.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9/ :.-]+/g, " ").replace(/\s+/g, " ").trim());

    return partes.filter(Boolean).join("|") || `sin-key-${Date.now()}`;
  }

  function headers(extra = {}) {
    return {
      apikey: HIST_SUPABASE_ANON_KEY,
      Authorization: `Bearer ${HIST_SUPABASE_ANON_KEY}`,
      Accept: "application/json",
      ...extra,
    };
  }

  async function request(path, options = {}) {
    const resp = await fetch(`${HIST_SUPABASE_URL}/rest/v1/${path}`, {
      ...options,
      headers: headers(options.headers || {}),
    });

    if (!resp.ok) {
      const txt = await resp.text().catch(() => "");
      throw new Error(`Supabase ${path}: HTTP ${resp.status} ${txt}`);
    }

    const text = await resp.text().catch(() => "");
    if (!text) return null;
    try { return JSON.parse(text); }
    catch { return text; }
  }

  function buildEstadoPayload(payload, estado) {
    const horarioPartes = horaPartesFromHorario(payload?.horario);
    const operativoKey = buildOperativoKey(payload);

    return {
      operativo_key: operativoKey,
      operativo_publicado_id: payload?.operativo_publicado_id || null,
      guardia_fecha: fechaIso(payload?.guardia_fecha) || null,
      fecha_operativo: fechaIso(payload?.fecha_operativo || payload?.fecha) || null,
      hora_desde: clean(payload?.hora_desde || horarioPartes.desde) || null,
      hora_hasta: clean(payload?.hora_hasta || horarioPartes.hasta) || null,
      lugar: clean(payload?.lugar) || null,
      lugar_normalizado: clean(payload?.lugar_normalizado || payload?.lugar) || null,
      tipo_operativo: clean(payload?.tipo_operativo) || null,
      ordenes_origen: jsonArray(payload?.ordenes_origen),
      estado,
      fuente_creacion: clean(payload?.fuente || "WSP") || "WSP",
      metadata: {
        ...(jsonObject(payload?.metadata)),
        titulo: clean(payload?.titulo),
        horario: clean(payload?.horario),
        operativo_publicado_id: payload?.operativo_publicado_id || null,
      },
      updated_at: new Date().toISOString(),
    };
  }

  function buildEventoPayload(estadoRow, tipoEvento, payload) {
    const horarioPartes = horaPartesFromHorario(payload?.horario);
    const operativoKey = estadoRow?.operativo_key || buildOperativoKey(payload);

    return {
      operativo_estado_id: estadoRow.id,
      operativo_key: operativoKey,
      tipo_evento: tipoEvento,
      fuente: clean(payload?.fuente || "WSP") || "WSP",
      fecha: clean(payload?.fecha) || null,
      horario: clean(payload?.horario) || null,
      hora_desde: clean(payload?.hora_desde || horarioPartes.desde) || null,
      hora_hasta: clean(payload?.hora_hasta || horarioPartes.hasta) || null,
      lugar: clean(payload?.lugar) || null,
      tipo_operativo: clean(payload?.tipo_operativo) || null,
      ordenes_origen: jsonArray(payload?.ordenes_origen),
      personal: jsonArray(payload?.personal),
      moviles: jsonArray(payload?.moviles),
      motos: jsonArray(payload?.motos),
      elementos: jsonObject(payload?.elementos),
      resultados: jsonObject(payload?.resultados),
      medidas_cautelares: jsonObject(payload?.medidas_cautelares),
      detalles: Array.isArray(payload?.detalles) ? payload.detalles : jsonArray(payload?.detalles),
      observaciones: clean(payload?.observaciones) || null,
      texto_generado: String(payload?.texto_generado || ""),
      payload_completo: jsonObject(payload?.payload_completo),
    };
  }

  async function upsertEstado(payload, estado) {
    const body = buildEstadoPayload(payload, estado);
    const rows = await request(`${TABLE_ESTADO}?on_conflict=operativo_key`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Prefer: "resolution=merge-duplicates,return=representation",
      },
      body: JSON.stringify(body),
    });

    const row = Array.isArray(rows) ? rows[0] : rows;
    if (!row?.id) throw new Error("No se pudo crear/actualizar operativos_estado.");
    return row;
  }

  async function insertarEvento(estadoRow, tipoEvento, payload) {
    const body = buildEventoPayload(estadoRow, tipoEvento, payload);
    const rows = await request(TABLE_EVENTOS, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify(body),
    });

    const row = Array.isArray(rows) ? rows[0] : rows;
    if (!row?.id) throw new Error("No se pudo insertar operativos_eventos.");
    return row;
  }

  async function patchEstado(id, patch) {
    if (!id) return null;
    const rows = await request(`${TABLE_ESTADO}?id=eq.${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify({ ...patch, updated_at: new Date().toISOString() }),
    });
    return Array.isArray(rows) ? rows[0] : rows;
  }

  async function guardarEvento(tipoEvento, payload = {}) {
    const tipo = clean(tipoEvento).toUpperCase();
    const estadoDestino = tipo === "FINALIZADO" ? "FINALIZADO" : "EN_CURSO";
    const estadoRow = await upsertEstado(payload, estadoDestino);
    const eventoRow = await insertarEvento(estadoRow, tipo, payload);

    if (tipo === "INICIO") {
      await patchEstado(estadoRow.id, { estado: "EN_CURSO", inicio_evento_id: eventoRow.id });
    } else if (tipo === "FINALIZADO") {
      await patchEstado(estadoRow.id, { estado: "FINALIZADO", finalizado_evento_id: eventoRow.id });
    }

    return { estado: estadoRow, evento: eventoRow };
  }

  async function guardarInicio(payload = {}) {
    return guardarEvento("INICIO", payload);
  }

  async function guardarFinalizado(payload = {}) {
    return guardarEvento("FINALIZADO", payload);
  }

  async function guardarControlSuperior(payload = {}) {
    return guardarEvento("CONTROL_SUPERIOR", payload);
  }

  async function listarEnCurso({ guardiaFecha = "", limit = 100 } = {}) {
    const params = new URLSearchParams({
      select: "*",
      estado: "eq.EN_CURSO",
      order: "created_at.asc",
      limit: String(limit),
    });
    const gf = fechaIso(guardiaFecha);
    if (gf) params.set("guardia_fecha", `eq.${gf}`);
    const rows = await request(`${TABLE_ESTADO}?${params.toString()}`, { method: "GET" });
    return Array.isArray(rows) ? rows : [];
  }

  async function buscarEnCursoPorKey(operativoKey) {
    const key = clean(operativoKey);
    if (!key) return null;
    const params = new URLSearchParams({
      select: "*",
      operativo_key: `eq.${key}`,
      estado: "eq.EN_CURSO",
      limit: "1",
    });
    const rows = await request(`${TABLE_ESTADO}?${params.toString()}`, { method: "GET" });
    return Array.isArray(rows) ? rows[0] || null : null;
  }

  window.WspHistorialOperativos = {
    guardarInicio,
    guardarFinalizado,
    guardarControlSuperior,
    guardarEvento,
    listarEnCurso,
    buscarEnCursoPorKey,
  };
})();
