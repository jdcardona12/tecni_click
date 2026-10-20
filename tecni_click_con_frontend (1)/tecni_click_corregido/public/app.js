'use strict';
const $ = (s, r = document) => r.querySelector(s);
const main = $('#main');
const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const S = { token: localStorage.getItem('tc_t'), user: JSON.parse(localStorage.getItem('tc_u') || 'null') };
const ESTADOS = { pendiente: 'Pendiente', en_proceso: 'En proceso', completado: 'Completado', cancelado: 'Cancelado' };
const PAGOS = ['pendiente', 'pagado', 'rechazado', 'reembolsado'];
const METODOS = ['efectivo', 'tarjeta', 'transferencia', 'nequi', 'daviplata'];
const fecha = d => d ? new Date(d).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' }) : '';
const cop = n => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n);
const stars = n => '★'.repeat(n) + '☆'.repeat(5 - n);
const badge = e => `<span class="badge ${e}">${esc(ESTADOS[e] || e)}</span>`;
const opts = (list, sel, lab = x => x) => list.map(x => `<option value="${esc(x)}" ${x === sel ? 'selected' : ''}>${esc(lab(x))}</option>`).join('');
let reload = () => {};

async function api(path, method = 'GET', body) {
  const r = await fetch('/api' + path, {
    method,
    headers: { 'Content-Type': 'application/json', ...(S.token ? { Authorization: 'Bearer ' + S.token } : {}) },
    body: body ? JSON.stringify(body) : undefined
  });
  let j = {};
  try { j = await r.json(); } catch { /* respuesta sin JSON */ }
  if (r.status === 401 && S.token && !path.startsWith('/auth')) { logout(); throw new Error('Tu sesión expiró. Inicia sesión de nuevo.'); }
  if (!r.ok || j.ok === false) throw new Error(j.msg || `Error ${r.status}`);
  return j;
}
function toast(msg, err) {
  const t = document.createElement('div');
  t.className = 'toast' + (err ? ' err' : ''); t.textContent = msg;
  $('#toasts').append(t); setTimeout(() => t.remove(), 4000);
}
function setSession(token, user) {
  S.token = token; S.user = user;
  localStorage.setItem('tc_t', token); localStorage.setItem('tc_u', JSON.stringify(user));
}
function logout() {
  S.token = S.user = null; localStorage.removeItem('tc_t'); localStorage.removeItem('tc_u');
  location.hash = '#/login'; nav();
}
function bind(sel, fn) {
  const f = $(sel);
  f.onsubmit = async e => {
    e.preventDefault();
    const b = f.querySelector('[type=submit]'); b.disabled = true;
    try { await fn(Object.fromEntries(new FormData(f)), f); } catch (x) { toast(x.message, 1); } finally { b.disabled = false; }
  };
}
function modal(html) {
  const d = document.createElement('dialog');
  d.innerHTML = `<button class="x" aria-label="Cerrar">×</button>${html}`;
  d.querySelector('.x').onclick = () => d.close(); d.onclose = () => d.remove();
  document.body.append(d); d.showModal(); return d;
}
function nav() {
  const u = S.user;
  $('#nav').innerHTML = `<a class="brand" href="#/">Tecni<b>Click</b></a>
    <a href="#/">Técnicos</a>` + (u
    ? `<a href="#/panel">Mi panel</a><span class="muted">${esc(u.nombre)}</span><button class="link" id="out">Salir</button>`
    : `<a href="#/login">Ingresar</a><a class="btn p" href="#/registro">Crear cuenta</a>`);
  const o = $('#out'); if (o) o.onclick = logout;
}

/* ---------- Vistas públicas ---------- */
async function home() {
  const t = (await api('/tecnicos')).data || [];
  main.innerHTML = `<section class="hero"><h1>Tu electrodoméstico, arreglado con un clic.</h1>
    <p>Pide un técnico para tu nevera, lavadora o estufa, sigue el estado de tu solicitud, paga y califica el servicio. Todo en un solo lugar.</p>
    <a class="btn p" href="#/${S.user ? 'panel' : 'registro'}">${S.user ? 'Ir a mi panel' : 'Solicitar un técnico'}</a>
    ${S.user ? '' : '<a class="btn" style="margin-left:.6rem" href="#/registro-tecnico">Quiero ser técnico</a>'}</section>
    <h2>Nuestros técnicos</h2>
    <div class="grid">${t.length ? t.map(x => `<article class="card tec"><div class="av">${esc((x.nombre || '?')[0])}</div>
      <strong>${esc(x.nombre)}</strong><span class="muted">${esc(x.especialidad || 'Técnico general')}</span>
      <span class="stars" data-rate="${x.id}"></span></article>`).join('') : '<p class="muted">Aún no hay técnicos registrados.</p>'}</div>`;
  if (S.token) for (const el of main.querySelectorAll('[data-rate]')) {
    api('/calificaciones/tecnico/' + el.dataset.rate).then(r => {
      el.textContent = r.data.promedio ? `★ ${r.data.promedio} (${r.data.total})` : '';
    }).catch(() => {});
  }
}
function auth(modo, tipoInicial = 'usuario') {
  const reg = modo === 'registro';
  const seg = (nombre, a, b) => `<div class="seg"><label><input type="radio" name="tipo" value="usuario" ${tipoInicial === 'usuario' ? 'checked' : ''}><span>${a}</span></label>
    <label><input type="radio" name="tipo" value="tecnico" ${tipoInicial === 'tecnico' ? 'checked' : ''}><span>${b}</span></label></div>`;
  main.innerHTML = `<section class="card auth"><h2>${reg ? 'Crea tu cuenta' : 'Bienvenido de nuevo'}</h2>
  <form id="fA">
    ${reg ? seg('tipo', 'Soy cliente', 'Soy técnico') : seg('tipo', 'Cliente / Admin', 'Técnico')}
    ${reg ? `<label>Nombre<input name="nombre" required></label><label>Teléfono<input name="telefono" type="tel"></label>
    <label id="esp">Especialidad<input name="especialidad" placeholder="Lavadoras, neveras, estufas…"></label>` : ''}
    <label>Correo<input name="email" type="email" required autocomplete="email"></label>
    <label>Contraseña<input name="password" type="password" required ${reg ? 'minlength="8"' : ''} autocomplete="${reg ? 'new' : 'current'}-password">
    ${reg ? '<span class="muted" style="font-weight:400">Mínimo 8 caracteres</span>' : ''}</label>
    <button class="p" type="submit" style="width:100%">${reg ? 'Registrarme' : 'Entrar'}</button>
  </form>
  <p class="muted">${reg ? '¿Ya tienes cuenta? <a href="#/login">Ingresa</a>' : '¿Primera vez? <a href="#/registro">Crea tu cuenta</a> · <a href="#/registro-tecnico">Quiero ser técnico</a>'}</p></section>`;
  const mostrarEsp = () => { const e = $('#esp'); if (e) e.style.display = $('[name=tipo]:checked').value === 'tecnico' ? '' : 'none'; };
  main.querySelectorAll('[name=tipo]').forEach(r => r.onchange = mostrarEsp); mostrarEsp();
  bind('#fA', async d => {
    const esTec = d.tipo === 'tecnico';
    const url = reg ? (esTec ? '/auth/register-tecnico' : '/auth/register') : (esTec ? '/auth/login-tecnico' : '/auth/login');
    const r = await api(url, 'POST', d);
    setSession(r.token, { id: r.data.id, nombre: r.data.nombre, email: r.data.email, rol: r.data.rol || 'cliente' });
    toast('¡Bienvenido, ' + r.data.nombre + '!'); location.hash = '#/panel';
  });
}

/* ---------- Componentes compartidos ---------- */
const ticket = (s, acciones = '') => `<article class="card ticket"><div class="stub">#${s.id}</div><div class="body">
  <div class="row"><strong>${esc(s.electrodomestico)}</strong>${badge(s.estado)}</div>
  <span class="muted">${fecha(s.fecha_solicitud)}${s.cliente_nombre && S.user.rol !== 'cliente' ? ' · Cliente: ' + esc(s.cliente_nombre) + (s.cliente_telefono ? ' (' + esc(s.cliente_telefono) + ')' : '') : ''}${s.tecnico_nombre ? ' · Técnico: ' + esc(s.tecnico_nombre) : ''}</span>
  ${s.descripcion ? `<span>${esc(s.descripcion)}</span>` : ''}<div class="row l">${acciones}</div></div></article>`;
const btnPagos = id => `<button class="sm" data-act="pagos" data-id="${id}">Pagos</button>`;
const selEstadoSol = s => `<select style="width:auto" data-chg="solEstado" data-id="${s.id}" aria-label="Estado">${opts(Object.keys(ESTADOS), s.estado, k => ESTADOS[k])}</select>`;

function buscador() {
  return `<section class="card"><h2>Buscar solicitud por número</h2><form id="fFind" class="row l"><input name="id" type="number" min="1" required placeholder="Ej: 12" style="width:140px"><button class="p" type="submit">Buscar</button></form><div id="found" style="margin-top:1rem"></div></section>`;
}
function bindBuscador() {
  bind('#fFind', async d => {
    const s = (await api('/solicitudes/' + d.id)).data;
    $('#found').innerHTML = ticket(s, selEstadoSol(s) + btnPagos(s.id));
  });
}

/* ---------- Panel por rol ---------- */
function panel() {
  if (!S.user) { location.hash = '#/login'; return; }
  return { cliente, tecnico, admin }[S.user.rol]?.();
}
async function cliente() {
  main.innerHTML = `<h1 style="font-size:2rem">Hola, ${esc(S.user.nombre)}</h1><div class="cols">
  <section class="card"><h2>Nueva solicitud</h2><form id="fNew">
    <label>Electrodoméstico<input name="electrodomestico" required placeholder="Nevera, lavadora, estufa…"></label>
    <label>¿Qué le pasa?<textarea name="descripcion" placeholder="Describe la falla"></textarea></label>
    <button class="p" type="submit" style="width:100%">Enviar solicitud</button></form></section>
  <section><h2>Mis solicitudes</h2><div id="list"></div></section></div>`;
  reload = async () => {
    const s = (await api(`/solicitudes/usuario/${S.user.id}`)).data || [];
    $('#list').innerHTML = s.length ? s.map(x => ticket(x, btnPagos(x.id) +
      (x.estado === 'completado' ? `<button class="sm p" data-act="rate" data-id="${x.id}" data-tec="${x.tecnico_id || ''}">Calificar</button>` : ''))).join('')
      : '<p class="muted">Aún no tienes solicitudes. Crea la primera.</p>';
  };
  bind('#fNew', async (d, f) => { await api('/solicitudes', 'POST', d); toast('Solicitud enviada'); f.reset(); reload(); });
  await reload();
}
async function tecnico() {
  const me = (await api('/tecnicos/actual')).data;
  const cal = (await api('/calificaciones/tecnico/' + me.id)).data;
  main.innerHTML = `<h1 style="font-size:2rem">Hola, ${esc(me.nombre)}</h1><div class="cols">
  <div><section class="card"><h2>Mi perfil</h2><form id="fMe">
    <label>Nombre<input name="nombre" required value="${esc(me.nombre)}"></label>
    <label>Teléfono<input name="telefono" value="${esc(me.telefono)}"></label>
    <label>Correo<input name="email" type="email" required value="${esc(me.email)}"></label>
    <label>Especialidad<input name="especialidad" value="${esc(me.especialidad)}"></label>
    <button class="p" type="submit" style="width:100%">Guardar</button></form></section></div>
  <div>
    <section><h2>Solicitudes disponibles</h2><div id="disp"></div></section>
    <section style="margin-top:1.5rem"><h2>Mis trabajos</h2><div id="mios"></div></section>
    <section class="card" style="margin-top:1.5rem"><h2>Mis calificaciones ${cal.promedio ? `<span class="stars">★ ${cal.promedio}</span> <span class="muted">(${cal.total})</span>` : ''}</h2>
    ${cal.calificaciones.length ? cal.calificaciones.map(c => `<p><span class="stars">${stars(c.puntuacion)}</span> ${esc(c.comentario || '')}<br><span class="muted">${fecha(c.fecha_calificacion)}</span></p>`).join('') : '<p class="muted">Todavía no tienes calificaciones.</p>'}</section></div></div>`;
  bind('#fMe', async d => { await api('/tecnicos/' + me.id, 'PUT', d); toast('Perfil actualizado'); });
  const [disp, mios] = await Promise.all([api('/solicitudes/disponibles'), api('/solicitudes/tecnico/' + me.id)]);
  $('#disp').innerHTML = disp.data.length ? disp.data.map(s => ticket(s, `<button class="sm p" data-act="aceptar" data-id="${s.id}">Aceptar solicitud</button>`)).join('')
    : '<p class="muted">No hay solicitudes nuevas por ahora.</p>';
  $('#mios').innerHTML = mios.data.length ? mios.data.map(s => ticket(s, selEstadoSol(s) + btnPagos(s.id))).join('')
    : '<p class="muted">Aún no has aceptado ninguna solicitud.</p>';
}
let adminTab = 'usuarios';
async function admin() {
  const tabs = { usuarios: 'Usuarios', tecnicos: 'Técnicos', buscar: 'Solicitudes y pagos' };
  main.innerHTML = `<h1 style="font-size:2rem">Administración</h1><div class="tabs">${Object.entries(tabs).map(([k, v]) => `<button class="${k === adminTab ? 'on' : ''}" data-act="tab" data-id="${k}">${v}</button>`).join('')}</div><div id="tab"></div>`;
  reload = admin;
  if (adminTab === 'usuarios') {
    const u = (await api('/usuarios')).data || [];
    $('#tab').innerHTML = `<div class="card tw"><table><tr><th>ID</th><th>Nombre</th><th>Correo</th><th>Tipo</th><th></th></tr>${u.map(x => `<tr><td>${x.id}</td><td>${esc(x.nombre)}</td><td>${esc(x.email)}</td><td>${esc(x.tipo_usuario)}</td>
      <td class="row l"><button class="sm" data-act="solsUser" data-id="${x.id}" data-n="${esc(x.nombre)}">Solicitudes</button>
      ${x.id !== S.user.id ? `<button class="sm danger" data-act="delUser" data-id="${x.id}">Eliminar</button>` : ''}</td></tr>`).join('')}</table></div>`;
  } else if (adminTab === 'tecnicos') {
    const t = (await api('/tecnicos')).data || [];
    $('#tab').innerHTML = `<div class="cols"><section class="card"><h2>Nuevo técnico</h2><form id="fTec">
      <label>Nombre<input name="nombre" required></label><label>Teléfono<input name="telefono"></label>
      <label>Correo<input name="email" type="email" required></label><label>Especialidad<input name="especialidad"></label>
      <label>Contraseña<input name="password" type="password" minlength="8" required></label>
      <button class="p" type="submit" style="width:100%">Crear técnico</button></form></section>
      <div class="card tw"><table><tr><th>ID</th><th>Nombre</th><th>Especialidad</th><th></th></tr>${t.map(x => `<tr><td>${x.id}</td><td>${esc(x.nombre)}<br><span class="muted">${esc(x.email)}</span></td><td>${esc(x.especialidad)}</td>
      <td class="row l"><button class="sm" data-act="cals" data-id="${x.id}" data-n="${esc(x.nombre)}">Calificaciones</button><button class="sm danger" data-act="delTec" data-id="${x.id}">Eliminar</button></td></tr>`).join('')}</table></div></div>`;
    bind('#fTec', async (d, f) => { await api('/tecnicos', 'POST', d); toast('Técnico creado'); f.reset(); admin(); });
  } else {
    $('#tab').innerHTML = buscador(); bindBuscador();
  }
}

/* ---------- Acciones (delegación de eventos) ---------- */
const acts = {
  async aceptar({ id }) {
    await api(`/solicitudes/${id}/aceptar`, 'PUT');
    toast('Solicitud aceptada. ¡Ya es tuya!'); tecnico();
  },
  tab: ({ id }) => { adminTab = id; admin(); },
  async pagos({ id }) {
    const puedePagar = S.user.rol !== 'tecnico';
    modal(`<h2>Pagos · solicitud #${id}</h2><div id="pl" class="tw">Cargando…</div>${puedePagar ? `<hr style="border:0;border-top:1px solid var(--line);margin:1rem 0"><form id="fPay">
      <label>Monto (COP)<input name="monto" type="number" min="1" step="any" required></label>
      <label>Método<select name="metodo_pago">${opts(METODOS, '', m => m[0].toUpperCase() + m.slice(1))}</select></label>
      <button class="p" type="submit">Registrar pago</button></form>` : ''}`);
    const load = async () => {
      const p = (await api('/pagos/solicitud/' + id)).data || [];
      $('#pl').innerHTML = p.length ? `<table><tr><th>Fecha</th><th>Monto</th><th>Método</th><th>Estado</th></tr>${p.map(x => `<tr><td>${fecha(x.fecha_pago)}</td><td>${cop(x.monto)}</td><td>${esc(x.metodo_pago)}</td>
        <td>${S.user.rol === 'admin' ? `<select data-chg="pagoEstado" data-id="${x.id}">${opts(PAGOS, x.estado)}</select>` : badge(x.estado)}</td></tr>`).join('')}</table>` : '<p class="muted">Sin pagos registrados.</p>';
    };
    await load();
    if (puedePagar) bind('#fPay', async (d, f) => { await api('/pagos', 'POST', { ...d, solicitud_id: Number(id) }); toast('Pago registrado'); f.reset(); load(); });
  },
  async rate({ id, tec }) {
    let previa = null;
    try { previa = (await api('/calificaciones/solicitud/' + id)).data; } catch { /* aún sin calificar */ }
    if (previa) { modal(`<h2>Tu calificación</h2><p class="stars" style="font-size:1.4rem">${stars(previa.puntuacion)}</p><p>${esc(previa.comentario || 'Sin comentario')}</p>`); return; }
    const tecs = tec ? [] : (await api('/tecnicos')).data || [];
    modal(`<h2>Califica el servicio #${id}</h2><form id="fRate">
      ${tec ? '' : `<label>Técnico que te atendió<select name="tecnico_id" required>${tecs.map(t => `<option value="${t.id}">${esc(t.nombre)}</option>`).join('')}</select></label>`}
      <label>Puntuación<select name="puntuacion">${[5, 4, 3, 2, 1].map(n => `<option value="${n}">${stars(n)}</option>`).join('')}</select></label>
      <label>Comentario<textarea name="comentario"></textarea></label><button class="p" type="submit">Enviar calificación</button></form>`);
    bind('#fRate', async d => {
      await api('/calificaciones', 'POST', { solicitud_id: Number(id), tecnico_id: Number(tec || d.tecnico_id), usuario_id: S.user.id, puntuacion: Number(d.puntuacion), comentario: d.comentario });
      toast('¡Gracias por tu calificación!'); document.querySelector('dialog').close();
    });
  },
  async solsUser({ id, n }) {
    const s = (await api('/solicitudes/usuario/' + id)).data || [];
    modal(`<h2>Solicitudes de ${esc(n)}</h2>${s.length ? s.map(x => ticket(x, selEstadoSol(x) + btnPagos(x.id))).join('') : '<p class="muted">Sin solicitudes.</p>'}`);
  },
  async cals({ id, n }) {
    const c = (await api('/calificaciones/tecnico/' + id)).data;
    modal(`<h2>${esc(n)} ${c.promedio ? `<span class="stars">★ ${c.promedio}</span>` : ''}</h2>${c.calificaciones.length ? c.calificaciones.map(x => `<p><span class="stars">${stars(x.puntuacion)}</span> ${esc(x.comentario || '')}</p>`).join('') : '<p class="muted">Sin calificaciones.</p>'}`);
  },
  async delUser({ id }) { if (confirm('¿Eliminar este usuario?')) { await api('/usuarios/' + id, 'DELETE'); toast('Usuario eliminado'); admin(); } },
  async delTec({ id }) { if (confirm('¿Eliminar este técnico?')) { await api('/tecnicos/' + id, 'DELETE'); toast('Técnico eliminado'); admin(); } }
};
const changes = {
  async solEstado({ id }, v) { await api(`/solicitudes/${id}/estado`, 'PUT', { estado: v }); toast('Estado actualizado'); },
  async pagoEstado({ id }, v) { await api(`/pagos/${id}/estado`, 'PUT', { estado: v }); toast('Pago actualizado'); }
};
document.addEventListener('click', async e => {
  const b = e.target.closest('[data-act]'); if (!b) return;
  try { await acts[b.dataset.act]?.(b.dataset); } catch (x) { toast(x.message, 1); }
});
document.addEventListener('change', async e => {
  const s = e.target.closest('[data-chg]'); if (!s) return;
  try { await changes[s.dataset.chg](s.dataset, s.value); } catch (x) { toast(x.message, 1); }
});

/* ---------- Router ---------- */
const routes = { '': home, login: () => auth('login'), registro: () => auth('registro'), 'registro-tecnico': () => auth('registro', 'tecnico'), panel };
async function route() {
  nav(); main.innerHTML = '<p class="muted">Cargando…</p>';
  try { await (routes[location.hash.replace(/^#\/?/, '')] || home)(); }
  catch (e) { main.innerHTML = `<div class="card"><strong>No se pudo cargar.</strong><p>${esc(e.message)}</p><p class="muted">¿Está encendido el servidor (<code>npm run dev</code>) y la base de datos?</p></div>`; }
}
addEventListener('hashchange', route); route();
