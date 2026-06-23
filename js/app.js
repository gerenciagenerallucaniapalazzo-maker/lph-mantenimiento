// ============================================================
// App de Seguimiento de Mejoras de Habitaciones — Lucania Palazzo
// ============================================================
const state = {
  usuario: null, // {nombre, rol}
  personal: [],
  observacionesCache: [],
  vista: "carga", // carga | historial | reportes
};

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));

function fmtFecha(d) {
  return new Date(d).toLocaleString("es-AR", { dateStyle: "short", timeStyle: "short" });
}

// ---------- Acceso (código simple + selección de usuario) ----------
function checkAccess() {
  const saved = localStorage.getItem("lph_access_ok");
  if (saved === "1") return true;
  return false;
}

function renderGate() {
  $("#app").innerHTML = `
    <div class="gate">
      <h1>🏨 ${CONFIG.HOTEL_NOMBRE}</h1>
      <h2>Seguimiento de Mejoras de Habitaciones</h2>
      <p>Ingresá el código de acceso para continuar.</p>
      <input type="password" id="codeInput" placeholder="Código de acceso" />
      <button id="btnEnter">Entrar</button>
      <p id="gateError" class="error"></p>
    </div>`;
  $("#btnEnter").onclick = () => {
    const v = $("#codeInput").value.trim();
    if (v === CONFIG.ACCESS_CODE) {
      localStorage.setItem("lph_access_ok", "1");
      initApp();
    } else {
      $("#gateError").textContent = "Código incorrecto.";
    }
  };
  $("#codeInput").addEventListener("keydown", (e) => { if (e.key === "Enter") $("#btnEnter").click(); });
}

// ---------- Selección de usuario ----------
function renderUserPicker() {
  const savedUser = JSON.parse(localStorage.getItem("lph_user") || "null");
  if (savedUser) {
    state.usuario = savedUser;
    renderMain();
    return;
  }
  const opciones = state.personal.map(p => `<option value="${p.nombre}">${p.nombre}</option>`).join("");
  $("#app").innerHTML = `
    <div class="gate">
      <h1>🏨 ${CONFIG.HOTEL_NOMBRE}</h1>
      <h2>¿Quién está cargando información?</h2>
      <select id="userSelect">
        <option value="">Seleccioná tu nombre...</option>
        ${opciones}
      </select>
      <p class="hint">¿No estás en la lista? Pedile a Gerencia que te agregue en la pestaña "Personal" de la planilla.</p>
      <button id="btnUser">Continuar</button>
      <p id="userError" class="error"></p>
    </div>`;
  $("#btnUser").onclick = () => {
    const nombre = $("#userSelect").value;
    if (!nombre) { $("#userError").textContent = "Elegí tu nombre."; return; }
    const p = state.personal.find(x => x.nombre === nombre);
    state.usuario = p;
    localStorage.setItem("lph_user", JSON.stringify(p));
    renderMain();
  };
}

// ---------- Layout principal ----------
function renderMain() {
  $("#app").innerHTML = `
    <header>
      <div class="header-top">
        <h1>🏨 ${CONFIG.HOTEL_NOMBRE}</h1>
        <button id="btnLogout" class="link-btn">Cambiar usuario</button>
      </div>
      <p class="userline">Conectado como <strong>${state.usuario.nombre}</strong> (${state.usuario.rol})</p>
      <nav>
        <button data-vista="carga" class="navbtn">📝 Cargar observación</button>
        <button data-vista="historial" class="navbtn">📋 Historial por habitación</button>
        <button data-vista="reportes" class="navbtn">📊 Reportes</button>
      </nav>
    </header>
    <main id="main"></main>
  `;
  $("#btnLogout").onclick = () => { localStorage.removeItem("lph_user"); state.usuario = null; renderUserPicker(); };
  $$(".navbtn").forEach(b => b.onclick = () => { state.vista = b.dataset.vista; renderVista(); });
  renderVista();
}

function renderVista() {
  $$(".navbtn").forEach(b => b.classList.toggle("active", b.dataset.vista === state.vista));
  if (state.vista === "carga") renderCarga();
  if (state.vista === "historial") renderHistorial();
  if (state.vista === "reportes") renderReportes();
}

// ---------- Vista: Cargar observación ----------
function renderCarga() {
  const roomOptions = ROOMS.map(r => `<option value="${r.numero}">${r.numero} — Piso ${r.piso} — ${r.categoria}</option>`).join("");
  const itemOptions = ITEMS.map(i => `<option value="${i}">${i}</option>`).join("");
  const estadoOptions = ESTADOS.map(e => `<option value="${e}">${e}</option>`).join("");
  const prioOptions = PRIORIDADES.map(p => `<option value="${p}" ${p === "Media" ? "selected" : ""}>${p}</option>`).join("");

  $("#main").innerHTML = `
    <h2>Nueva observación</h2>
    <form id="formCarga" class="card">
      <label>Habitación
        <select id="fHabitacion" required>
          <option value="">Seleccionar...</option>
          ${roomOptions}
        </select>
      </label>
      <label>Ítem
        <select id="fItem" required>
          <option value="">Seleccionar...</option>
          ${itemOptions}
        </select>
      </label>
      <label>Estado
        <select id="fEstado" required>
          <option value="">Seleccionar...</option>
          ${estadoOptions}
        </select>
      </label>
      <label class="full">Detalle / observaciones (opcional)
        <textarea id="fDetalle" rows="3" placeholder="Describir brevemente..."></textarea>
      </label>
      <label>Prioridad
        <select id="fPrioridad">${prioOptions}</select>
      </label>
      <button type="submit">Guardar observación</button>
      <p id="formMsg"></p>
    </form>
  `;

  $("#fItem").onchange = () => {
    const item = $("#fItem").value;
    $("#fDetalle").placeholder = DETALLE_PLACEHOLDER[item] || "Describir brevemente...";
  };

  $("#formCarga").onsubmit = async (e) => {
    e.preventDefault();
    const habitacion = $("#fHabitacion").value;
    const room = ROOMS.find(r => String(r.numero) === habitacion);
    const data = {
      habitacion,
      piso: room ? room.piso : "",
      categoria: room ? room.categoria : "",
      item: $("#fItem").value,
      estado: $("#fEstado").value,
      detalle: $("#fDetalle").value,
      prioridad: $("#fPrioridad").value,
      cargado_por: state.usuario.nombre,
      rol: state.usuario.rol,
    };
    const msg = $("#formMsg");
    msg.textContent = "Guardando...";
    msg.className = "";
    try {
      await Api.addObservacion(data);
      msg.textContent = "✓ Observación guardada. Fecha y hora quedaron registradas automáticamente.";
      msg.className = "ok";
      $("#formCarga").reset();
    } catch (err) {
      msg.textContent = "Error al guardar: " + err.message;
      msg.className = "error";
    }
  };
}

// ---------- Vista: Historial por habitación ----------
async function renderHistorial() {
  const roomOptions = ROOMS.map(r => `<option value="${r.numero}">${r.numero} — Piso ${r.piso} — ${r.categoria}</option>`).join("");
  $("#main").innerHTML = `
    <h2>Historial por habitación</h2>
    <div class="card">
      <label>Habitación
        <select id="hHabitacion">
          <option value="">Seleccionar...</option>
          ${roomOptions}
        </select>
      </label>
      <label class="checkline"><input type="checkbox" id="hSoloPendientes" checked /> Mostrar solo pendientes</label>
    </div>
    <div id="hLista"></div>
  `;
  $("#hHabitacion").onchange = cargarHistorial;
  $("#hSoloPendientes").onchange = cargarHistorial;

  async function cargarHistorial() {
    const hab = $("#hHabitacion").value;
    const lista = $("#hLista");
    if (!hab) { lista.innerHTML = ""; return; }
    lista.innerHTML = "Cargando...";
    try {
      const obs = await Api.getObservaciones({ habitacion: hab });
      const soloPend = $("#hSoloPendientes").checked;
      const filtradas = (soloPend ? obs.filter(o => !o.Resuelto) : obs)
        .sort((a, b) => new Date(b.Timestamp) - new Date(a.Timestamp));
      if (filtradas.length === 0) {
        lista.innerHTML = `<p class="hint">No hay observaciones${soloPend ? " pendientes" : ""} para esta habitación.</p>`;
        return;
      }
      lista.innerHTML = filtradas.map(o => obsCardHtml(o)).join("");
      $$(".btnResolver").forEach(b => b.onclick = async () => {
        await Api.resolverObservacion(b.dataset.id, state.usuario.nombre);
        cargarHistorial();
      });
    } catch (err) {
      lista.innerHTML = `<p class="error">Error al cargar: ${err.message}</p>`;
    }
  }
}

function obsCardHtml(o) {
  const resuelto = !!o.Resuelto;
  return `
    <div class="obs-card ${resuelto ? "resuelto" : ""}">
      <div class="obs-top">
        <strong>${o.Item}</strong>
        <span class="badge prio-${(o.Prioridad || "Media").toLowerCase()}">${o.Prioridad || "Media"}</span>
        ${resuelto ? '<span class="badge ok">Resuelto</span>' : ""}
      </div>
      <div class="obs-estado">${o.Estado}</div>
      ${o.Detalle ? `<div class="obs-detalle">${o.Detalle}</div>` : ""}
      <div class="obs-meta">Cargado por <strong>${o.CargadoPor}</strong> (${o.Rol || ""}) el ${o.Fecha} a las ${o.Hora}</div>
      ${resuelto ? `<div class="obs-meta">Resuelto por ${o.ResueltoPor || "-"} el ${o.FechaResuelto || "-"}</div>` :
        `<button class="btnResolver" data-id="${o.ID}">Marcar como resuelto</button>`}
    </div>`;
}

// ---------- Vista: Reportes ----------
async function renderReportes() {
  $("#main").innerHTML = `
    <h2>Reportes</h2>
    <div class="card">
      <label>Piso
        <select id="rPiso"><option value="">Todos</option>${PISOS.map(p => `<option value="${p}">${p}</option>`).join("")}</select>
      </label>
      <label>Categoría
        <select id="rCategoria"><option value="">Todas</option>${CATEGORIAS.map(c => `<option value="${c}">${c}</option>`).join("")}</select>
      </label>
      <label class="checkline"><input type="checkbox" id="rSoloPendientes" checked /> Solo pendientes</label>
      <button id="rRefrescar">Actualizar</button>
      <button id="rExport">Exportar CSV</button>
    </div>
    <div id="rResumen"></div>
    <div id="rTabla"></div>
  `;
  $("#rRefrescar").onclick = cargarReporte;
  $("#rExport").onclick = exportarCSV;

  let datosActuales = [];

  async function cargarReporte() {
    $("#rResumen").innerHTML = "Cargando...";
    $("#rTabla").innerHTML = "";
    try {
      let obs = await Api.getObservaciones({});
      const piso = $("#rPiso").value;
      const cat = $("#rCategoria").value;
      const soloPend = $("#rSoloPendientes").checked;
      if (piso) obs = obs.filter(o => String(o.Piso) === piso);
      if (cat) obs = obs.filter(o => o.Categoria === cat);
      if (soloPend) obs = obs.filter(o => !o.Resuelto);
      datosActuales = obs;

      // Agrupar por Item + Estado
      const grupos = {};
      obs.forEach(o => {
        const key = o.Item + " — " + o.Estado;
        grupos[key] = (grupos[key] || 0) + 1;
      });
      const filas = Object.entries(grupos).sort((a, b) => b[1] - a[1]);

      $("#rResumen").innerHTML = `
        <p class="hint">${obs.length} observación(es) ${soloPend ? "pendiente(s)" : "en total"} con estos filtros.</p>
        <table class="report-table">
          <thead><tr><th>Ítem — Estado</th><th>Cantidad</th></tr></thead>
          <tbody>
            ${filas.map(([k, v]) => `<tr><td>${k}</td><td>${v}</td></tr>`).join("") || '<tr><td colspan="2">Sin datos</td></tr>'}
          </tbody>
        </table>`;

      $("#rTabla").innerHTML = `
        <h3>Detalle</h3>
        <table class="report-table">
          <thead><tr><th>Hab.</th><th>Piso</th><th>Categoría</th><th>Ítem</th><th>Estado</th><th>Detalle</th><th>Prioridad</th><th>Cargado por</th><th>Fecha</th></tr></thead>
          <tbody>
            ${obs.sort((a,b)=>new Date(b.Timestamp)-new Date(a.Timestamp)).map(o => `
              <tr>
                <td>${o.Habitacion}</td><td>${o.Piso}</td><td>${o.Categoria}</td><td>${o.Item}</td>
                <td>${o.Estado}</td><td>${o.Detalle || ""}</td><td>${o.Prioridad || ""}</td>
                <td>${o.CargadoPor}</td><td>${o.Fecha} ${o.Hora}</td>
              </tr>`).join("") || '<tr><td colspan="9">Sin datos</td></tr>'}
          </tbody>
        </table>`;
    } catch (err) {
      $("#rResumen").innerHTML = `<p class="error">Error al cargar: ${err.message}</p>`;
    }
  }

  function exportarCSV() {
    if (!datosActuales.length) { alert("No hay datos para exportar."); return; }
    const headers = ["Habitacion","Piso","Categoria","Item","Estado","Detalle","Prioridad","CargadoPor","Fecha","Hora","Resuelto","ResueltoPor","FechaResuelto"];
    const rows = datosActuales.map(o => headers.map(h => `"${(o[h] ?? "").toString().replace(/"/g,'""')}"`).join(","));
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `reporte_mantenimiento_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  cargarReporte();
}

// ---------- Inicio ----------
async function initApp() {
  $("#app").innerHTML = "Cargando...";
  try {
    state.personal = await Api.getPersonal();
  } catch (err) {
    $("#app").innerHTML = `<div class="gate"><p class="error">No se pudo conectar con la planilla. Verificá que CONFIG.APPS_SCRIPT_URL esté bien configurado en js/config.js.</p><p>${err.message}</p></div>`;
    return;
  }
  renderUserPicker();
}

document.addEventListener("DOMContentLoaded", () => {
  if (checkAccess()) initApp();
  else renderGate();
});
