// ============================================================
// Capa de comunicación con el backend (Google Apps Script + Google Sheets)
// ============================================================
const Api = {
  async _post(payload) {
    if (!CONFIG.APPS_SCRIPT_URL || CONFIG.APPS_SCRIPT_URL.indexOf("PEGAR_AQUI") === 0) {
      throw new Error("Falta configurar APPS_SCRIPT_URL en js/config.js");
    }
    // Content-Type text/plain evita el preflight CORS (Apps Script no maneja bien OPTIONS).
    const res = await fetch(CONFIG.APPS_SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Error de red: " + res.status);
    return res.json();
  },

  async _get(params) {
    if (!CONFIG.APPS_SCRIPT_URL || CONFIG.APPS_SCRIPT_URL.indexOf("PEGAR_AQUI") === 0) {
      throw new Error("Falta configurar APPS_SCRIPT_URL en js/config.js");
    }
    const qs = new URLSearchParams(params || {}).toString();
    const res = await fetch(CONFIG.APPS_SCRIPT_URL + (qs ? "?" + qs : ""), { method: "GET" });
    if (!res.ok) throw new Error("Error de red: " + res.status);
    return res.json();
  },

  getPersonal() {
    return this._get({ action: "personal" });
  },

  getObservaciones(filtros) {
    return this._get(Object.assign({ action: "observaciones" }, filtros || {}));
  },

  addObservacion(data) {
    return this._post({ action: "nueva_observacion", data });
  },

  resolverObservacion(id, resuelto_por) {
    return this._post({ action: "resolver", data: { id, resuelto_por } });
  },
};
