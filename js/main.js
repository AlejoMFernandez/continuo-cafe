// Continuo · Café & Música — demo web
import { initKit } from '../kit/kit.js?v=1';

const html = document.documentElement;
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const esperar = (ms) => new Promise((r) => setTimeout(r, ms));
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const desk = () => matchMedia('(min-width: 1024px)').matches;
const TZ = 'America/Argentina/Buenos_Aires';
const DIAS_C = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const DIAS_N = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
// horario del local (min desde 00:00) · dom=0
const HORARIO = { 0: [570, 1200], 2: [540, 1200], 3: [540, 1200], 4: [540, 1200], 5: [540, 1200], 6: [570, 1200] };
const hhmm = (m) => `${Math.floor(m / 60)}:${String(m % 60).padStart(2, '0')}`;

function ahoraBA() {
  const p = Object.fromEntries(new Intl.DateTimeFormat('en-GB', { timeZone: TZ, weekday: 'short', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })
    .formatToParts(new Date()).map((x) => [x.type, x.value]));
  const dow = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(p.weekday);
  return { dow, min: Number(p.hour) * 60 + Number(p.minute), fecha: `${p.year}-${p.month}-${p.day}` };
}
const AHORA = ahoraBA();

/* =========================================================
   LADO A / LADO B
   ========================================================= */
const qLado = new URLSearchParams(location.search).get('lado');
// sin ?lado: de noche (desde las 20:00 hs, cuando cierra el café) abre en el Lado B
if (!qLado && (AHORA.min >= 1200 || AHORA.min < 360)) html.classList.add('lado-b');
const metaTema = $('meta[name="theme-color"]');
function pintarLado() {
  const b = html.classList.contains('lado-b');
  $$('[data-lado-btn]').forEach((x) => x.setAttribute('aria-pressed', String((x.dataset.ladoBtn === 'b') === b)));
  metaTema?.setAttribute('content', b ? '#141414' : '#F0EDE6');
}
pintarLado();
let volteando = false;
async function setLado(l) {
  const b = l === 'b';
  if (b === html.classList.contains('lado-b') || volteando) return;
  volteando = true;
  const disco = $('[data-disco]');
  if (!reduce && disco) {
    disco.classList.add('voltea');
    await esperar(350);
  }
  html.classList.toggle('lado-b', b);
  pintarLado();
  if (disco) { await esperar(360); disco.classList.remove('voltea'); }
  volteando = false;
}
$$('[data-lado-btn]').forEach((x) => x.addEventListener('click', () => setLado(x.dataset.ladoBtn)));

/* =========================================================
   INTRO · cae la púa
   ========================================================= */
function cargada(img) {
  if (!img || img.complete) return Promise.resolve();
  return new Promise((r) => { img.addEventListener('load', r, { once: true }); img.addEventListener('error', r, { once: true }); });
}
const hero = $('.hero');
$$('.hero .m > span').forEach((s, i) => s.style.setProperty('--d', i % 4));
function arrancarHero() {
  hero.classList.add('entra');
  setTimeout(() => { hero.classList.add('suena'); }, reduce ? 0 : 900);
  setTimeout(() => { $('[data-disco]')?.classList.add('suena'); }, reduce ? 0 : 1500);
}
async function intro() {
  const el = $('.intro');
  if (!html.classList.contains('con-intro') || !el) { html.classList.add('listo'); el?.remove(); arrancarHero(); return; }
  const cel = innerWidth < 900;
  const fotoHero = $(cel ? '.funda picture img' : '.funda picture img');
  const recursos = Promise.race([Promise.all([document.fonts?.ready, cargada($('.intro__logo')), cargada(fotoHero)]), esperar(2400)]);
  await cargada($('.intro__logo'));
  await esperar(80);
  el.classList.add('cae');
  await esperar(cel ? 380 : 480);
  el.classList.add('surcos');
  await esperar(cel ? 560 : 820);
  el.classList.add('linea');
  await Promise.all([esperar(cel ? 260 : 420), recursos]);
  el.classList.add('abre');
  html.classList.add('listo');
  arrancarHero();
  await esperar(800);
  el.remove();
}
intro();

/* =========================================================
   ENTRADAS AL SCROLL
   ========================================================= */
const io = 'IntersectionObserver' in window ? new IntersectionObserver((ents) => {
  ents.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('visto'); io.unobserve(e.target); } });
}, { threshold: 0.18, rootMargin: '0px 0px -6% 0px' }) : null;
const observar = (root = document) => $$('.rv:not(.visto)', root).forEach((el) => (io ? io.observe(el) : el.classList.add('visto')));
observar();

// la píldora del panel no tapa los botones del hero
if (io) new IntersectionObserver(([e]) => html.classList.toggle('en-hero', e.isIntersecting), { threshold: 0.35 }).observe(hero);
new MutationObserver(() => html.classList.toggle('pop-abierto', !!document.querySelector('.kit-pop'))).observe(document.body, { childList: true });

/* =========================================================
   BARRA + MENÚ
   ========================================================= */
const barra = $('[data-barra]');
let rafBarra = 0;
addEventListener('scroll', () => {
  if (rafBarra) return;
  rafBarra = requestAnimationFrame(() => { barra.classList.toggle('solida', scrollY > 24); rafBarra = 0; });
}, { passive: true });
barra.classList.toggle('solida', scrollY > 24);
const linksNav = $$('.barra__nav a');
if (io) {
  const ioNav = new IntersectionObserver((ents) => ents.forEach((e) => {
    if (!e.isIntersecting) return;
    linksNav.forEach((a) => a.classList.toggle('on', a.getAttribute('href') === '#' + e.target.id));
  }), { rootMargin: '-45% 0px -50% 0px' });
  ['carta', 'noche', 'discos', 'llegar'].forEach((id) => { const s = document.getElementById(id); if (s) ioNav.observe(s); });
}
const menu = $('#menu');
const btnMenu = $('[data-menu-abrir]');
let scrollMenu = 0;
function abrirMenu() {
  scrollMenu = scrollY;
  menu.hidden = false; menu.classList.add('abierto');
  btnMenu.setAttribute('aria-expanded', 'true');
  html.classList.add('menu-abierto');
  document.body.style.cssText = `position:fixed;top:-${scrollMenu}px;left:0;right:0`;
  $('[data-menu-cerrar]').focus();
}
function cerrarMenu(destino) {
  menu.hidden = true; menu.classList.remove('abierto');
  btnMenu.setAttribute('aria-expanded', 'false');
  html.classList.remove('menu-abierto');
  document.body.style.cssText = '';
  html.style.scrollBehavior = 'auto';
  scrollTo(0, scrollMenu);
  html.style.scrollBehavior = '';
  if (destino) document.querySelector(destino)?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
  btnMenu.focus({ preventScroll: true });
}
btnMenu.addEventListener('click', abrirMenu);
$('[data-menu-cerrar]').addEventListener('click', () => cerrarMenu());
$$('.menu__nav a').forEach((a) => a.addEventListener('click', (e) => { e.preventDefault(); cerrarMenu(a.getAttribute('href')); }));
addEventListener('keydown', (e) => { if (e.key === 'Escape' && !menu.hidden) cerrarMenu(); });

/* =========================================================
   HORARIOS + ESTADO
   ========================================================= */
$$('[data-horarios] li').forEach((li) => li.classList.toggle('hoy', Number(li.dataset.d) === AHORA.dow));
function estadoHoy() {
  const h = HORARIO[AHORA.dow];
  if (h && AHORA.min >= h[0] && AHORA.min < h[1]) return { abierto: true, txt: `Abierto ahora · hasta las ${hhmm(h[1])} hs` };
  if (h && AHORA.min < h[0]) return { abierto: false, txt: `Hoy abrimos a las ${hhmm(h[0])} hs` };
  for (let i = 1; i <= 7; i++) {
    const d = (AHORA.dow + i) % 7; const hh = HORARIO[d];
    if (hh) return { abierto: false, txt: `Abrimos ${i === 1 ? 'mañana' : 'el ' + DIAS_N[d]} a las ${hhmm(hh[0])} hs` };
  }
  return { abierto: false, txt: '' };
}
const EST = estadoHoy();
const estadoEl = $('[data-estado]');
if (estadoEl) { $('span', estadoEl).textContent = EST.txt; $('.punto', estadoEl).classList.toggle('punto--vivo', EST.abierto); }

/* =========================================================
   ARRASTRE CON EL MOUSE (filas deslizables)
   ========================================================= */
function arrastrable(el) {
  if (!el || el.dataset.drag) return;
  el.dataset.drag = '1';
  let x0 = 0, s0 = 0, activo = false, movio = false, v = 0, tPrev = 0, xPrev = 0, raf = 0;
  el.addEventListener('pointerdown', (e) => {
    if (e.pointerType !== 'mouse' || e.button !== 0) return;
    if (el.scrollWidth <= el.clientWidth + 2) return;
    cancelAnimationFrame(raf);
    activo = true; movio = false; x0 = xPrev = e.clientX; s0 = el.scrollLeft; tPrev = performance.now(); v = 0;
  });
  addEventListener('pointermove', (e) => {
    if (!activo) return;
    const dx = e.clientX - x0;
    if (!movio && Math.abs(dx) > 5) { movio = true; el.classList.add('arrastrando'); el.style.scrollSnapType = 'none'; }
    if (movio) {
      const t = performance.now(); v = (e.clientX - xPrev) / Math.max(1, t - tPrev); xPrev = e.clientX; tPrev = t;
      el.scrollLeft = s0 - dx; e.preventDefault();
    }
  });
  addEventListener('pointerup', () => {
    if (!activo) return; activo = false;
    if (!movio) return;
    // inercia suave
    let vel = v * 16;
    const paso = () => {
      if (Math.abs(vel) < 0.5) { el.style.scrollSnapType = ''; el.classList.remove('arrastrando'); return; }
      el.scrollLeft -= vel; vel *= 0.92; raf = requestAnimationFrame(paso);
    };
    raf = requestAnimationFrame(paso);
    const bloquear = (ev) => { ev.stopPropagation(); ev.preventDefault(); };
    el.addEventListener('click', bloquear, { capture: true, once: true });
    setTimeout(() => el.removeEventListener('click', bloquear, { capture: true }), 60);
  });
  el.addEventListener('dragstart', (e) => e.preventDefault());
}
arrastrable($('.noche__fotos'));

/* =========================================================
   KIT
   ========================================================= */
const thumb = (src) => (src ? src.replace('-640.webp', '-240.webp') : '');
const cuenta = (id) => (kit?.carrito?.lineas || []).filter((l) => l.id === id).reduce((s, l) => s + l.cant, 0);

function opcionesHTML(p) {
  const vars = (p.variantes || []).filter((v) => v && v.precio != null);
  const ops = (p.opciones || [])[0];
  let h = '';
  if (vars.length > 1) h += `<div class="it__ops" role="radiogroup" aria-label="Tamaño" data-var-grupo>${vars.map((v, k) => `<button type="button" role="radio" class="it__op" aria-checked="${k === 0}" data-var="${esc(v.id)}" data-precio="${v.precio}">${esc(v.nombre)}</button>`).join('')}</div>`;
  if (ops) h += `<div class="it__ops" role="radiogroup" aria-label="${esc(ops.nombre)}" data-op-grupo="${esc(ops.id)}">${ops.valores.map((v, k) => `<button type="button" role="radio" class="it__op" aria-checked="${k === 0}" data-op-val="${esc(v.id)}">${esc(v.nombre)}</button>`).join('')}</div>`;
  return h;
}
function itemTpl(p, ctx) {
  const vars = (p.variantes || []).filter((v) => v && v.precio != null);
  const conElegir = vars.length > 1 || (p.opciones || []).length;
  const pedible = ctx.carrito && ctx.pedible(p);
  const precio = vars.length ? ctx.money(vars[0].precio) : (ctx.money(p.precio) ?? 'Consultar');
  const accion = !pedible ? '' : conElegir
    ? `<button type="button" class="it__sumar" data-sumar="${esc(p.id)}">Sumar</button>`
    : `<div data-kit-qty="${esc(p.id)}"></div>`;
  const tags = (p.etiquetas || []).map((t) => ctx.etiquetaHTML(t)).join('');
  return `${p.foto ? `<img class="it__mini" src="${esc(thumb(ctx.asset(p.foto)))}" alt="" width="60" height="60" loading="lazy" decoding="async">` : ''}
    <div class="it__cuerpo">
      <h3 class="it__nom">${esc(p.nombre)}${tags}${p.foto ? '<span class="it__punto" aria-hidden="true"></span>' : ''}</h3>
      <span class="it__precio" data-it-precio>${esc(precio)}</span>
      ${p.descripcion ? `<p class="it__desc">${esc(p.descripcion)}</p>` : ''}
    </div>
    <div class="it__acc">${accion}</div>
    ${opcionesHTML(p)}
    ${conElegir && pedible ? `<p class="it__en" data-en="${esc(p.id)}" aria-live="polite"></p>` : ''}`;
}
function simpleTpl(p, ctx) {
  const pedible = ctx.carrito && ctx.pedible(p);
  const n = String((ctx.index ?? 0) + 1).padStart(2, '0');
  return `<div class="simple">
    <div class="simple__funda">
      <div class="simple__vinilo" aria-hidden="true"><img src="img/vinilo.svg" alt="" width="1000" height="1000" loading="lazy" draggable="false"></div>
      <div class="simple__sobre${p.foto ? '' : ' simple__sobre--b'}">
        ${p.foto ? `<img src="${esc(ctx.asset(p.foto))}" alt="" width="640" height="640" loading="lazy" decoding="async" draggable="false">` : `<span class="simple__sinfoto">${esc(p.nombre)}</span>`}
        <span class="simple__n">Simple ${n}</span>
      </div>
    </div>
    <h3 class="simple__nom">${esc(p.nombre)}</h3>
    ${p.descripcion ? `<p class="simple__desc">${esc(p.descripcion)}</p>` : ''}
    <div class="simple__pie"><span class="simple__precio">${esc(ctx.money(p.precio) ?? 'Consultar')}</span>${pedible ? `<div data-kit-qty="${esc(p.id)}"></div>` : ''}</div>
  </div>`;
}
function lpTpl(p, ctx) {
  const i = (ctx.index ?? 0) % 6 + 1;
  const pedible = ctx.carrito && ctx.pedible(p);
  return `<div class="lp lp--${i}">
    <div class="lp__disco" aria-hidden="true"><img src="img/vinilo.svg" alt="" width="1000" height="1000" loading="lazy" draggable="false"></div>
    <div class="lp__funda"><span class="lp__k">Continuo · selección</span><h3 class="lp__t">${esc(p.nombre)}</h3></div>
    <div class="lp__info">
      ${p.descripcion ? `<p class="lp__d">${esc(p.descripcion)}</p>` : ''}
      <div class="lp__pie"><span class="lp__precio">${esc(ctx.money(p.precio) ?? 'Precio a confirmar')}</span>
      ${pedible ? `<button type="button" class="lp__btn" data-separar="${esc(p.id)}">Separar</button>` : ''}</div>
    </div>
  </div>`;
}

let kit = null;
try {
  kit = await initKit({
    config: 'cliente.json',
    imagenes: { lqip: 'img/lqip.json' },
    cartas: {
      'carta-kit': { itemClass: 'it', template: itemTpl },
      'promos-kit': { itemClass: 'simple-it', template: simpleTpl },
      'batea-kit': { itemClass: 'lp-it', template: lpTpl, tienda: true },
    },
    carrito: { label: 'Tu selección', fab: false },
    badge: true,
  });
} catch (err) { console.warn('Kit no disponible', err); }

/* ---------- contador de la selección ---------- */
const nSel = $('[data-sel-n]');
const btnSel = $('.sel-btn');
function contar(bump) {
  const n = (kit?.carrito?.lineas || []).reduce((s, l) => s + l.cant, 0);
  nSel.textContent = n; nSel.hidden = n === 0;
  if (bump) { btnSel.classList.remove('bump'); void btnSel.offsetWidth; btnSel.classList.add('bump'); }
  $$('[data-en]').forEach((el) => { const k = cuenta(el.dataset.en); el.textContent = k ? `${k} en tu selección` : ''; });
  $$('[data-separar]').forEach((b) => { const k = cuenta(b.dataset.separar); b.classList.toggle('si', k > 0); b.textContent = k ? 'Separado ✓' : 'Separar'; });
}
document.addEventListener('kit:carrito', (e) => contar(e.detail?.delta > 0));
kit?.carrito?.listo?.then(() => contar());

/* ---------- opciones, "Sumar" con elección y "Separar" ---------- */
document.addEventListener('click', (e) => {
  const v = e.target.closest('[data-var]');
  if (v) {
    $$('[data-var]', v.parentElement).forEach((b) => b.setAttribute('aria-checked', String(b === v)));
    const it = v.closest('.kit-item'); const pr = $('[data-it-precio]', it);
    if (pr && kit) pr.textContent = kit.money(Number(v.dataset.precio));
    return;
  }
  const op = e.target.closest('[data-op-val]');
  if (op) { $$('[data-op-val]', op.parentElement).forEach((b) => b.setAttribute('aria-checked', String(b === op))); return; }
  const add = e.target.closest('[data-sumar]');
  if (add && kit?.carrito) {
    const it = add.closest('.kit-item'); const opc = {};
    $$('[data-op-grupo]', it).forEach((g) => { const x = $('[aria-checked="true"]', g); if (x) opc[g.dataset.opGrupo] = x.dataset.opVal; });
    const vx = $('[data-var][aria-checked="true"]', it);
    kit.carrito.agregar(add.dataset.sumar, 1, { opc, ...(vx ? { variante: vx.dataset.var } : {}), origen: add });
    return;
  }
  const sep = e.target.closest('[data-separar]');
  if (sep && kit?.carrito) {
    if (cuenta(sep.dataset.separar) > 0) { kit.carrito.abrir(); return; }
    kit.carrito.agregar(sep.dataset.separar, 1, { origen: sep });
  }
});

/* =========================================================
   LA CARTA · el tocadiscos
   ========================================================= */
const DOS = new Set(['cafe', 'frias']);
const ANG = [0, 6.5, 13, 19.5]; // ángulo del brazo por pista (afuera → adentro)
const ANG_REPOSO = -26;
const td = $('[data-tocadiscos]');
const tdBrazo = $('[data-td-brazo]');
const tdPistas = $('[data-td-pistas]');
const tdLabel = $('[data-td-label]');
const tdFoto = $('[data-td-foto]');
let cartaEl = null, cats = [], actual = 0;

function setBrazo(ang) { tdBrazo?.style.setProperty('--ang', ang + 'deg'); }
function marcarPista(i) {
  actual = i;
  $$('.td__pista', tdPistas).forEach((b, k) => b.setAttribute('aria-current', String(k === i)));
  tdBrazo?.setAttribute('aria-valuenow', String(i + 1));
  if (td?.classList.contains('en-vista')) setBrazo(ANG[i] ?? 0);
}
function irA(i, { scroll = false } = {}) {
  if (!cartaEl || !cats.length) return;
  i = Math.max(0, Math.min(cats.length - 1, i));
  const tab = $$('.kit-tab', cartaEl)[i];
  if (tab && !tab.classList.contains('is-on')) tab.click();
  tab?.scrollIntoView({ block: 'nearest', inline: 'center', behavior: reduce ? 'auto' : 'smooth' });
  marcarPista(i);
  const panel = $$('.kit-carta__panel', cartaEl)[i];
  const d = panel && $('.cc__disco', panel);
  if (d) { d.classList.remove('gira-una'); void d.offsetWidth; d.classList.add('gira-una'); }
  if (td && !reduce) { td.classList.remove('suena'); void td.offsetWidth; td.classList.add('suena'); }
  if (scroll && panel) {
    const top = panel.getBoundingClientRect().top;
    if (top < 0 || top > innerHeight * 0.6) scrollTo({ top: scrollY + top - (desk() ? 140 : 130), behavior: reduce ? 'auto' : 'smooth' });
  }
}
function armarCarta(el, categorias) {
  cartaEl = el; el.dataset.listo = '1';
  const tabs = $$('.kit-tab', el);
  cats = tabs.map((t) => ({ id: t.dataset.cat, nombre: t.textContent.trim() }));
  const activo = Math.max(0, tabs.findIndex((t) => t.classList.contains('is-on')));
  // pistas del tocadiscos
  if (tdPistas) {
    tdPistas.innerHTML = cats.map((c, i) => {
      const n = $$('.kit-item', $$('.kit-carta__panel', el)[i]).length;
      return `<li><button type="button" class="td__pista" data-pista="${i}" aria-current="${i === activo}"><span>${String(i + 1).padStart(2, '0')}</span><span>${esc(c.nombre)}</span><span>${n}</span></button></li>`;
    }).join('');
  }
  $$('.kit-carta__panel', el).forEach((panel, i) => {
    const cat = cats[i]?.id;
    const info = categorias.find((c) => c.id === cat) || {};
    const items = $$('.kit-item', panel);
    panel.classList.toggle('dos', DOS.has(cat));
    const cab = document.createElement('div');
    cab.className = 'cc';
    cab.innerHTML = `<p class="cc__k"><span><span class="solo-desk">Lado A · </span>pista ${String(i + 1).padStart(2, '0')}</span><span aria-hidden="true">///</span><span>${items.length} opciones</span><span aria-hidden="true">///</span><span>para llevar</span></p>
      <div class="cc__fila"><span class="cc__disco" aria-hidden="true"><img src="img/vinilo.svg" alt="" width="44" height="44"></span><h3 class="cc__t">${esc(cats[i]?.nombre || info.nombre || '')}</h3></div>
      ${info.bajada ? `<p class="cc__sub">${esc(info.bajada)}</p>` : ''}`;
    const cont = document.createElement('div');
    cont.className = 'carta-items';
    items.forEach((it) => { it.classList.toggle('it--foto', !!$('.it__mini', it)); cont.appendChild(it); });
    const nav = document.createElement('div');
    nav.className = 'carta-nav';
    nav.innerHTML = `<button type="button" data-carta-ir="${i - 1}" ${i === 0 ? 'disabled' : ''}>← ${esc(cats[i - 1]?.nombre || '')}</button><button type="button" data-carta-ir="${i + 1}" ${i === cats.length - 1 ? 'disabled' : ''}>${esc(cats[i + 1]?.nombre || '')} →</button>`;
    panel.replaceChildren(cab, cont, nav);
  });
  marcarPista(activo);
}
document.addEventListener('click', (e) => {
  const ir = e.target.closest('[data-carta-ir]'); if (ir) { irA(Number(ir.dataset.cartaIr), { scroll: true }); return; }
  const p = e.target.closest('[data-pista]'); if (p) { irA(Number(p.dataset.pista)); return; }
  const tab = e.target.closest('#carta-kit .kit-tab');
  if (tab) { const i = $$('.kit-tab', cartaEl).indexOf(tab); setTimeout(() => marcarPista(i), 0); }
});
// el brazo se arrastra (mouse y dedo) y se suelta en la pista más cercana
if (tdBrazo) {
  const img = $('img', tdBrazo);
  let arr = false, angAct = 0;
  const pivote = () => { const r = img.getBoundingClientRect(); return { x: r.left + r.width * 0.7, y: r.top + r.width * (640 / 300) * 0.11 }; };
  const BASE = Math.atan2(-60, 490) * 180 / Math.PI;
  tdBrazo.addEventListener('pointerdown', (e) => {
    arr = true; tdBrazo.classList.add('arrastra'); tdBrazo.setPointerCapture(e.pointerId); e.preventDefault();
  });
  tdBrazo.addEventListener('pointermove', (e) => {
    if (!arr) return;
    const pv = pivote();
    const phi = Math.atan2(e.clientX - pv.x, e.clientY - pv.y) * 180 / Math.PI;
    angAct = Math.max(ANG_REPOSO, Math.min(24, BASE - phi));
    setBrazo(angAct);
  });
  const soltar = () => {
    if (!arr) return; arr = false; tdBrazo.classList.remove('arrastra');
    let mejor = 0; ANG.forEach((a, k) => { if (Math.abs(a - angAct) < Math.abs(ANG[mejor] - angAct)) mejor = k; });
    irA(mejor);
  };
  tdBrazo.addEventListener('pointerup', soltar);
  tdBrazo.addEventListener('pointercancel', soltar);
  tdBrazo.addEventListener('keydown', (e) => {
    if (['ArrowRight', 'ArrowDown'].includes(e.key)) { e.preventDefault(); irA(actual + 1); }
    if (['ArrowLeft', 'ArrowUp'].includes(e.key)) { e.preventDefault(); irA(actual - 1); }
  });
}
// cuando el tocadiscos entra en vista, el brazo baja y el disco gira
if (td && io) {
  new IntersectionObserver(([e]) => {
    td.classList.toggle('en-vista', e.isIntersecting);
    td.classList.toggle('suena', e.isIntersecting && !reduce);
    setBrazo(e.isIntersecting ? (ANG[actual] ?? 0) : ANG_REPOSO);
  }, { threshold: 0.4 }).observe(td);
}
// hover en un plato: su foto aparece en la etiqueta del disco
let rafFoto = 0, fotoAct = '';
document.addEventListener('pointerover', (e) => {
  if (e.pointerType !== 'mouse' || !desk()) return;
  const it = e.target.closest('#carta-kit .kit-item');
  cancelAnimationFrame(rafFoto);
  rafFoto = requestAnimationFrame(() => {
    $$('#carta-kit .it.foco').forEach((x) => x !== it && x.classList.remove('foco'));
    const src = it?.dataset.photo;
    if (it) it.classList.add('foco');
    if (src) {
      if (src !== fotoAct) { fotoAct = src; tdFoto.src = thumb(src); }
      tdLabel.classList.add('ver');
    } else tdLabel?.classList.remove('ver');
  });
});
$('#carta-kit')?.addEventListener('pointerleave', () => { tdLabel?.classList.remove('ver'); $$('#carta-kit .it.foco').forEach((x) => x.classList.remove('foco')); });

function procesarCarta(el, categorias) {
  if (el.id === 'carta-kit') armarCarta(el, categorias || []);
  if (el.id === 'promos-kit' || el.id === 'batea-kit') {
    const panel = $('.kit-carta__panel', el);
    arrastrable(panel);
    if (el.id === 'batea-kit') batea(panel);
  }
  contar();
}
document.addEventListener('kit:carta', (e) => procesarCarta(e.detail.el, e.detail.categorias));
// la primera carta pudo renderizarse antes de llegar acá
$$('[data-kit="carta"]').forEach((el) => { if ($('.kit-carta__panel', el) && !$('.cc', el) && !el.dataset.listo) procesarCarta(el, kit?.config?.carta?.categorias || []); });

/* =========================================================
   LA BATEA · tocar levanta la funda (dedo)
   ========================================================= */
function batea(panel) {
  panel.closest('[data-kit]').dataset.listo = '1';
  if (!panel || panel.dataset.batea) return;
  panel.dataset.batea = '1';
  panel.addEventListener('click', (e) => {
    if (e.target.closest('button')) return;
    const lp = e.target.closest('.lp'); if (!lp) return;
    const on = !lp.classList.contains('alza');
    $$('.lp.alza', panel).forEach((x) => x.classList.remove('alza'));
    lp.classList.toggle('alza', on);
  });
}

/* =========================================================
   LADO B · la agenda (eventos del panel)
   ========================================================= */
const fFecha = (f) => { const [y, m, d] = f.split('-').map(Number); const dow = new Date(Date.UTC(y, m - 1, d)).getUTCDay(); return { dow, d, m, txt: `${DIAS_C[dow]} ${d} ${MESES[m - 1]}` }; };
async function pintarAgenda() {
  const box = $('[data-tracklist]'); if (!box) return;
  const evs = kit?.eventos ? kit.eventos.proximos() : [];
  if (!evs.length) { box.innerHTML = '<li class="tracklist__cargando">Estamos armando las próximas fechas. Seguinos en Instagram para enterarte primero.</li>'; pintarFranja([]); return; }
  const filas = await Promise.all(evs.slice(0, 6).map(async (ev) => {
    let libres = ev.cupo;
    if (ev.reserva && kit.reservas) { try { const ts = await kit.reservas.turnos(ev.fecha, 1); const t = ts.find((x) => x.hora === ev.hora); if (t) libres = t.libres; } catch (_) { /* nada */ } }
    return { ev, libres };
  }));
  const tipos = kit.config.eventosTipos || [];
  box.innerHTML = filas.map(({ ev, libres }, i) => {
    const f = fFecha(ev.fecha);
    const hoy = ev.fecha === AHORA.fecha;
    const tipo = tipos.find((x) => x.id === ev.tipo)?.nombre || 'Evento';
    const ocu = ev.cupo ? Math.round(((ev.cupo - libres) / ev.cupo) * 10) : 0;
    const surcos = Array.from({ length: 10 }, (_, k) => `<i class="${k < ocu ? 'ocu' : ''}"></i>`).join('');
    const lado = i < 3 ? 'A' : 'B';
    return `<li class="pista" style="--i:${i}">
      <span class="pista__n">${lado}${(i % 3) + 1}</span>
      <p class="pista__cuando">${hoy ? '<span class="pista__hoy"><i class="punto punto--vivo"></i>Hoy</span>' : ''}<span>${esc(f.txt)} · ${esc(ev.hora)} hs</span><span>${esc(tipo)}</span></p>
      <div class="pista__cuerpo">
        <h3 class="pista__t">${esc(ev.nombre)}</h3>
        ${ev.descripcion ? `<p class="pista__d">${esc(ev.descripcion)}</p>` : ''}
        <div class="pista__acc">
          ${ev.reserva
            ? `<button type="button" class="btn btn--rec" data-reservar="${esc(ev.fecha)}|${esc(ev.hora)}" ${libres > 0 ? '' : 'disabled'}>${libres > 0 ? 'Reservar mesa' : 'Completo'}</button>
               <span class="pista__cupo"><span class="surcos" aria-hidden="true">${surcos}</span>${libres > 0 ? `Quedan ${libres} lugares` : 'Sin lugares'}</span>`
            : '<p class="pista__libre">Sin reserva · por orden de llegada</p>'}
        </div>
      </div>
    </li>`;
  }).join('');
  pintarFranja(evs);
}
function pintarFranja(evs) {
  const fr = $('[data-franja]'); if (!fr) return;
  const items = [];
  const hoyEv = evs.find((e) => e.fecha === AHORA.fecha);
  if (hoyEv) items.push(`<p class="franja__item"><i class="punto punto--vivo"></i><a href="#noche"><b>Hoy ${esc(hoyEv.hora)} hs</b> · ${esc((kit.config.eventosTipos || []).find((x) => x.id === hoyEv.tipo)?.nombre || hoyEv.nombre)}</a></p>`);
  else items.push(`<p class="franja__item"><i class="punto${EST.abierto ? ' punto--vivo' : ''}"></i><span>${esc(EST.txt)}</span></p>`);
  evs.filter((e) => e !== hoyEv).slice(0, 2).forEach((e) => {
    const f = fFecha(e.fecha);
    items.push(`<p class="franja__item"><a href="#noche"><b>${esc(f.txt)}</b> · ${esc(e.hora)} hs · ${esc((kit.config.eventosTipos || []).find((x) => x.id === e.tipo)?.nombre || e.nombre)}</a></p>`);
  });
  fr.innerHTML = items.join('');
}
document.addEventListener('click', (e) => {
  const b = e.target.closest('[data-reservar]'); if (!b || !kit?.reservas) return;
  const [fecha, hora] = b.dataset.reservar.split('|');
  kit.reservas.abrir({ fecha, hora, personas: 2 });
});
document.addEventListener('kit:reserva-lista', (e) => {
  e.preventDefault();
  const { resumen, el } = e.detail;
  const txt = `Hola Continuo! Reservé desde la web: ${resumen.servicio}, ${resumen.dia} a las ${resumen.hora}, ${resumen.personas}. A nombre de ${resumen.nombre}.`;
  el.innerHTML = `<div class="ok-noche">
    <img src="img/vinilo-b.svg" alt="" width="96" height="96">
    <h3>Quedó sonando.</h3>
    <p>${esc(resumen.servicio)} · ${esc(resumen.dia)} a las ${esc(resumen.hora)} hs · ${esc(resumen.personas)}. Te guardamos la mesa a nombre de ${esc(resumen.nombre)}.</p>
    <a class="kit-btn" href="https://ig.me/m/continuo____?text=${encodeURIComponent(txt)}" target="_blank" rel="noopener">Avisar por Instagram</a>
  </div>`;
  pintarAgenda();
});
document.addEventListener('kit:eventos', () => pintarAgenda());
pintarAgenda();

/* =========================================================
   USTEDES · el mazo (celu)
   ========================================================= */
const mazo = $('[data-mazo]');
if (mazo) {
  const cartas = $$('.gal', mazo);
  let orden = cartas.map((_, i) => i);
  const posicionar = () => orden.forEach((ci, pos) => cartas[ci].setAttribute('data-pos', String(pos)));
  posicionar();
  let x0 = 0, y0 = 0, dx = 0, activo = null, decidido = false, horizontal = false;
  const siguiente = (dir = 1) => {
    const top = cartas[orden[0]];
    top.classList.remove('arrastra'); top.classList.add('vuela');
    top.style.transform = `translateX(${dir * 120}%) rotate(${dir * 16}deg)`;
    setTimeout(() => { top.classList.remove('vuela'); top.style.transform = ''; orden.push(orden.shift()); posicionar(); }, 420);
  };
  mazo.addEventListener('pointerdown', (e) => {
    if (desk()) return;
    const c = e.target.closest('.gal'); if (!c || c !== cartas[orden[0]]) return;
    activo = c; x0 = e.clientX; y0 = e.clientY; dx = 0; decidido = false; horizontal = false;
  });
  mazo.addEventListener('pointermove', (e) => {
    if (!activo) return;
    dx = e.clientX - x0; const dy = e.clientY - y0;
    if (!decidido && (Math.abs(dx) > 8 || Math.abs(dy) > 8)) { decidido = true; horizontal = Math.abs(dx) > Math.abs(dy); if (horizontal) { activo.classList.add('arrastra'); activo.setPointerCapture?.(e.pointerId); } }
    if (horizontal) activo.style.transform = `translateX(${dx}px) rotate(${dx / 18}deg)`;
  });
  const fin = () => {
    if (!activo) return;
    const c = activo; activo = null;
    if (horizontal && Math.abs(dx) > 70) { siguiente(Math.sign(dx)); return; }
    c.classList.remove('arrastra'); c.style.transform = '';
    if (!decidido) siguiente(1); // un toque también pasa la foto
  };
  mazo.addEventListener('pointerup', fin);
  mazo.addEventListener('pointercancel', () => { if (activo) { activo.classList.remove('arrastra'); activo.style.transform = ''; activo = null; } });
}
