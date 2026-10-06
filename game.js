/* =====================================================================
   GASTE 1 TRILHÃO — lógica do jogo
   ===================================================================== */
(() => {
  'use strict';
  const D = window.GAMEDATA, M = window.MAPDATA;
  const LS_STATE = 'trilhao_state_v1', LS_OVR = 'trilhao_overrides_v1', LS_CMD = 'trilhao_cmd_v1', LS_SET = 'trilhao_settings_v1';
  const $ = s => document.querySelector(s);
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  /* ------------------------------------------------------------------ */
  /*  Armazenamento                                                     */
  /* ------------------------------------------------------------------ */
  const store = {
    get(k) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : null; } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  };
  const cityOf = id => M.cities[id];
  const countryName = code => (M.names && M.names[code]) || code;

  function freshState() {
    return { v: 2, started: false, balance: D.START_BALANCE, minutes: D.START_MINUTES, city: D.START_CITY,
      history: [], visited: [cityOf(D.START_CITY).country], ended: null, undo: [] };
  }
  let S = store.get(LS_STATE);
  if (!S || S.v !== 2) S = freshState();
  let SET = Object.assign({ skipAnim: false, mute: false, winThreshold: D.WIN_THRESHOLD, advance: 'click', hints: 'categoria' }, store.get(LS_SET) || {});
  let OVR = store.get(LS_OVR) || {};
  const save = () => store.set(LS_STATE, S);
  const saveSet = () => store.set(LS_SET, SET);
  const saveOvr = () => store.set(LS_OVR, OVR);

  function getAction(id) {
    const a = D.ACTIONS.find(x => x.id === id);
    if (!a) return null;
    const o = OVR[id];
    return o ? Object.assign({}, a, o) : a;
  }

  /* ------------------------------------------------------------------ */
  /*  Formatação                                                        */
  /* ------------------------------------------------------------------ */
  const nf = new Intl.NumberFormat('pt-BR');
  const fmtFull = v => (v < 0 ? '-' : '') + 'R$ ' + nf.format(Math.round(Math.abs(v)));
  function trimNum(x, d) { return nf.format(Number(x.toFixed(d))); }
  function fmtShort(v) {
    const a = Math.abs(v);
    if (a >= 1e12) return 'R$ ' + trimNum(v / 1e12, 2) + ' tri';
    if (a >= 1e9) return 'R$ ' + trimNum(v / 1e9, a >= 1e11 ? 0 : (a >= 1e10 ? 1 : 2)) + ' bi';
    if (a >= 1e6) return 'R$ ' + trimNum(v / 1e6, 1) + ' mi';
    return fmtFull(v);
  }
  function fmtWords(v) { // "R$ 143 bilhões"
    const a = Math.abs(v);
    if (a >= 1e12) return 'R$ ' + trimNum(v / 1e12, 2) + (a >= 2e12 ? ' trilhões' : ' trilhão');
    if (a >= 1e9) return 'R$ ' + trimNum(v / 1e9, 0) + ' bilhões';
    if (a >= 1e6) return 'R$ ' + trimNum(v / 1e6, 0) + ' milhões';
    return fmtFull(v);
  }
  function fmtPct(p) {
    if (p <= 0) return '0%';
    let d = p < 0.001 ? 5 : p < 0.01 ? 4 : p < 10 ? 3 : 1;
    if (p >= 99.95 && p < 100) d = 2;
    let s = p.toFixed(d).replace(/0+$/, '').replace(/\.$/, '');
    return s.replace('.', ',') + '%';
  }
  function fmtRemain(min) {
    min = Math.max(0, Math.round(min));
    if (min >= 1440) { const d = Math.floor(min / 1440), h = Math.floor((min % 1440) / 60); return `${d} ${d > 1 ? 'dias' : 'dia'} ${h}h`; }
    const h = Math.floor(min / 60), m = min % 60;
    return `${h}h ${String(m).padStart(2, '0')}min`;
  }
  function fmtDur(min) {
    min = Math.round(min);
    if (min >= 1440) { const d = Math.floor(min / 1440), h = Math.round((min % 1440) / 60); return `${d} ${d > 1 ? 'dias' : 'dia'}` + (h ? ` ${h}h` : ''); }
    const h = Math.floor(min / 60), m = min % 60;
    if (!h) return `${m}min`;
    return `${h}h` + (m ? ` ${m}min` : '');
  }
  function fmtDurLong(min) {
    if (min < 1440 && min % 60 === 0) { const h = min / 60; return `${h} ${h === 1 ? 'hora' : 'horas'}`; }
    return fmtDur(min);
  }
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  /* ------------------------------------------------------------------ */
  /*  Viagem / tempo                                                    */
  /* ------------------------------------------------------------------ */
  function distKm(a, b) {
    const R = 6371, r = Math.PI / 180;
    const dLat = (b.lat - a.lat) * r, dLon = (b.lon - a.lon) * r;
    const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.sin(dLon / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(h));
  }
  function travelFor(a, fromCity) {
    fromCity = fromCity || S.city;
    if (a.remote || !a.city || a.city === fromCity) return { minutes: 0, kind: a.remote ? 'remote' : 'none' };
    const A = cityOf(fromCity), B = cityOf(a.city);
    const d = distKm(A, B);
    if (A.country === B.country) return { minutes: Math.max(1, Math.round(d / 800 + 0.5)) * 60, kind: 'domestic', from: fromCity, to: a.city };
    return { minutes: Math.round(d / 900 + 1.5) * 60, kind: 'intl', from: fromCity, to: a.city };
  }
  const flexMinutes = (a, budget) => Math.round(a.flex.base + a.flex.k * Math.sqrt(budget / 1e9)) * 60;
  function quote(a, budget) {
    const price = a.flex ? budget : a.price;
    const buyMin = a.flex ? flexMinutes(a, budget) : Math.round(a.hours * 60);
    const tr = travelFor(a);
    return { price, buyMin, travel: tr, total: buyMin + tr.minutes };
  }
  function anyFeasible() {
    for (const base of D.ACTIONS) {
      if (base.block || owned(base.id)) continue;
      const a = getAction(base.id);
      if (a.flex) {
        if (a.flex.min > S.balance) continue;
        if (quote(a, a.flex.min).total <= S.minutes) return true;
      } else {
        if (a.price > S.balance) continue;
        if (quote(a).total <= S.minutes) return true;
      }
    }
    return false;
  }

  /* ------------------------------------------------------------------ */
  /*  Interpretação de texto (falsa liberdade)                          */
  /* ------------------------------------------------------------------ */
  const STOP = new Set(('quero queria vou eu comprar compro compra comprando comprei adquirir adquiro um uma uns umas o a os as de da do das dos ' +
    'e em no na nos nas pra pro para por com me meu minha meus minhas que tipo algum alguma ai la aqui esse essa esses essas isso ' +
    'desse dessa deste desta este esta mais muito bem so agora tambem levar pegar ter gastar gostaria seria inteiro inteira inteiros inteiras ' +
    'ja vamos bora entao acho sei la ne cara mano tipo qualquer coisa').split(/\s+/));
  const norm = s => String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
  function stem(w) {
    if (w.length <= 3) return w;
    if (/(oes|aes)$/.test(w)) return w.slice(0, -3) + 'ao';
    if (/eis$/.test(w)) return w.slice(0, -3) + 'el';
    if (/ais$/.test(w) && w.length > 4) return w.slice(0, -2) + 'l';
    if (/(res|zes)$/.test(w)) return w.slice(0, -2);
    if (/s$/.test(w) && !/ss$/.test(w)) return w.slice(0, -1);
    return w;
  }
  const toks = s => norm(s).split(' ').filter(w => w && !STOP.has(w)).map(stem);
  function lev(a, b) {
    if (Math.abs(a.length - b.length) > 2) return 9;
    const m = a.length, n = b.length; let prev = Array.from({ length: n + 1 }, (_, i) => i);
    for (let i = 1; i <= m; i++) {
      const cur = [i];
      for (let j = 1; j <= n; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = cur;
    }
    return prev[n];
  }
  function sim(q, t, partial) {
    if (q === t) return 1;
    const mn = Math.min(q.length, t.length);
    if (partial && q.length >= 2 && t.startsWith(q)) return 0.75;
    if (mn >= 4 && (t.startsWith(q) || q.startsWith(t))) return 0.8;
    if (mn >= 5 && lev(q, t) <= 1) return 0.75;
    if (mn >= 7 && lev(q, t) <= 2) return 0.6;
    return 0;
  }
  // índice de lugares (cidades + países) para dar peso à localização digitada
  const PLACE = new Map(); // token -> Set(country codes)
  function addPlace(text, code) { for (const t of toks(text)) { if (t.length < 3) continue; if (!PLACE.has(t)) PLACE.set(t, new Set()); PLACE.get(t).add(code); } }
  for (const [id, c] of Object.entries(M.cities)) addPlace(c.name, c.country);
  for (const [code, n] of Object.entries(M.names)) addPlace(n, code);
  [['eua', 'US'], ['usa', 'US'], ['america', 'US'], ['beverly hills', 'US'], ['hollywood', 'US'], ['manhattan', 'US'], ['inglaterra', 'GB'], ['europa', 'FR'], ['caribe', 'BS'], ['arabia', 'SA'], ['japao', 'JP']].forEach(([t, c]) => addPlace(t, c));

  const INDEX = D.ACTIONS.map(a => {
    const w = new Map();
    const put = (txt, wt) => toks(txt).forEach(t => w.set(t, Math.max(w.get(t) || 0, wt)));
    put(a.name, 1.5); (a.aliases || []).forEach(x => put(x, 2)); (a.keys || []).forEach(x => put(x, 3));
    const phrases = [a.name, ...(a.aliases || [])].map(x => toks(x).join(' ')).filter(Boolean);
    const raws = [a.name, ...(a.aliases || [])].map(x => norm(x)).filter(x => x.length > 2);
    const city = a.city && cityOf(a.city);
    return { id: a.id, w, phrases, raws, country: city && city.country, block: !!a.block };
  });

  // países à venda? (ex.: "quero comprar o Brasil")
  const COUNTRY_PHRASES = Object.entries(M.names).map(([code, n]) => ({ code, name: n, t: toks(n).join(' ') }))
    .concat([{ code: 'US', name: 'Estados Unidos', t: 'eua' }, { code: 'US', name: 'Estados Unidos', t: 'usa' }]);
  const ARTICLE = { BR: 'O ', JP: 'O ', CA: 'O ', MX: 'O ', PE: 'O ', CL: 'O ', EG: 'O ', IR: 'O ', IQ: 'O ', US: 'OS ', CN: 'A ', FR: 'A ', AR: 'A ', IT: 'A ', DE: 'A ', ES: 'A ', RU: 'A ', IN: 'A ', AU: 'A ', GB: 'O ', CO: 'A ', VE: 'A ', BO: 'A ', AO: 'A ' };
  function countryBlock(q) {
    const t = toks(q).filter(x => !['pai', 'territorio', 'nacao', 'todo', 'tod'].includes(x)).join(' ');
    const raw = toks(q);
    if (!raw.length) return null;
    if (!t && raw.includes('pai')) return { title: 'PAÍSES NÃO ESTÃO À VENDA.', msg: 'Nenhum país pode ser comprado — nem com um trilhão.' };
    const hit = COUNTRY_PHRASES.find(c => c.t === t);
    if (!hit) return null;
    const art = ARTICLE[hit.code] || '';
    const plural = hit.code === 'US';
    return { title: `${art}${hit.name.toUpperCase()} NÃO ${plural ? 'ESTÃO' : 'ESTÁ'} À VENDA.`, msg: 'Países não são propriedade privada. Nem por um trilhão.' };
  }

  function scoreAll(q, partial) {
    const qt = [...new Set(toks(q))];
    const qPhrase = ' ' + qt.join(' ') + ' ';
    const qRaw = ' ' + norm(q) + ' ';
    const placeCodes = new Set(); qt.forEach(t => { const p = PLACE.get(t); if (p) p.forEach(c => placeCodes.add(c)); });
    const out = [];
    for (const it of INDEX) {
      let s = 0;
      qt.forEach((q1, i) => {
        let best = 0;
        const isLast = i === qt.length - 1;
        for (const [t, wt] of it.w) { const v = sim(q1, t, partial && isLast) * wt; if (v > best) best = v; }
        if (best > 0) s += best; else if (!PLACE.has(q1) && !/^\d+$/.test(q1)) s -= 1.0;
      });
      let pb = 0;
      for (const p of it.phrases) if (qPhrase.includes(' ' + p + ' ')) pb = Math.max(pb, 2 + p.split(' ').length * 1.2);
      s += pb;
      let rb = 0;
      for (const p of it.raws) if (qRaw.includes(' ' + p + ' ')) rb = Math.max(rb, 1.2 + p.split(' ').length * 0.6);
      s += rb;
      if (placeCodes.size && it.country) s += placeCodes.has(it.country) ? 1.2 : -1.5;
      out.push({ id: it.id, score: s, block: it.block });
    }
    return out.sort((a, b) => b.score - a.score);
  }
  function interpret(q) {
    if (!norm(q)) return { type: 'empty' };
    const cb = countryBlock(q);
    if (cb) return { type: 'block', block: Object.assign({ type: 'venda' }, cb), name: 'País' };
    const r = scoreAll(q, false);
    const best = r[0];
    if (best && best.score >= 3.4) {
      if (best.block) return { type: 'block', id: best.id };
      if (owned(best.id)) {
        const alt = r.find(x => !x.block && !owned(x.id) && x.score >= 3.4 && x.score >= best.score * 0.7);
        if (alt) return { type: 'action', id: alt.id, score: alt.score };
        return { type: 'owned', id: best.id, alt: altFor(best.id) };
      }
      return { type: 'action', id: best.id, score: best.score };
    }
    const firstOk = r.find(x => !x.block && !owned(x.id));
    if (firstOk && firstOk.score >= 0.9) return { type: 'suggest', id: firstOk.id, score: firstOk.score };
    return { type: 'notfound' };
  }
  function suggestions(q) {
    if (norm(q).length < 2) return [];
    return scoreAll(q, true).filter(x => !x.block && !owned(x.id) && x.score >= 1.2).slice(0, 4).map(x => x.id);
  }
  function owned(id) { return S.history.some(h => h.id === id); }
  function altFor(id) { // algo parecido que ainda está à venda
    const a = getAction(id);
    const same = D.ACTIONS.filter(x => !x.block && !owned(x.id) && x.id !== id && (x.cat === a.cat || x.tier === a.tier));
    same.sort((x, y) => (x.country === a.country ? -1 : 0) - (y.country === a.country ? -1 : 0) || Math.abs(Math.log((x.price || x.flex.max) / (a.price || a.flex.max))) - Math.abs(Math.log((y.price || y.flex.max) / (a.price || a.flex.max))));
    return same[0] ? same[0].id : null;
  }

  /* ------------------------------------------------------------------ */
  /*  Ícones                                                            */
  /* ------------------------------------------------------------------ */
  const IC = {
    car: '<path d="M5 17h14M3 17v-4l2.2-5.2A2 2 0 0 1 7 6.5h10a2 2 0 0 1 1.8 1.3L21 13v4"/><path d="M3 13h18"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/>',
    house: '<path d="M3 11 12 4l9 7"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/>',
    watch: '<circle cx="12" cy="12" r="6"/><path d="M12 9v3l2 1.5M9 6.5 9.6 3h4.8l.6 3.5M9 17.5l.6 3.5h4.8l.6-3.5"/>',
    jet: '<path d="M2.5 13.5 21 8.5c.6 1.3 0 2.4-1.2 2.8L6 15l-3.5-1.5Z"/><path d="m9 11-3-5h2.5l5.5 3.8M10 14.2 8.5 19H11l4-6"/>',
    plane: '<path d="M2.5 13.5 21 8.5c.6 1.3 0 2.4-1.2 2.8L6 15l-3.5-1.5Z"/><path d="m9 11-3-5h2.5l5.5 3.8M10 14.2 8.5 19H11l4-6"/>',
    heli: '<path d="M3 5h15M10.5 5v3"/><path d="M6 13a4.5 4.5 0 0 1 4.5-5H15a3 3 0 0 1 3 3v2H6Z"/><path d="M18 11h3M8 17h9M10 13v4M15 13v4"/>',
    farm: '<path d="M12 21V9"/><path d="M12 9c0-3 2-5 5-5 0 3-2 5-5 5ZM12 13c0-3-2-5-5-5 0 3 2 5 5 5ZM12 17c0-3 2-5 5-5 0 3-2 5-5 5Z"/>',
    island: '<path d="M3 20c3-1.5 6-1.5 9 0s6 1.5 9 0"/><path d="M12 18V9"/><path d="M12 9c-1.5-2.5-4.5-3-7-2 1.5.5 3 1.5 4 3M12 9c1.5-2.5 4.5-3 7-2-1.5.5-3 1.5-4 3M12 9c0-2.5-1-4.5-3-5.5"/>',
    yacht: '<path d="M3 16h18l-2.5 4h-13L3 16Z"/><path d="M5 16V12h10l3 4M8 12V9h5l2 3"/>',
    ship: '<path d="M3 15h18l-2.5 5h-13L3 15Z"/><path d="M6 15V8h12v7M9 8V5h6v3M9 11h1M12 11h1M15 11h1"/>',
    building: '<path d="M4 21V5l8-2v18M12 7l8 2v12M3 21h18"/><path d="M7 8h2M7 12h2M7 16h2M15 12h2M15 16h2"/>',
    art: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="m3 16 5-5 4 4 3-3 6 6"/><circle cx="15.5" cy="8.5" r="1.5"/>',
    stadium: '<ellipse cx="12" cy="9" rx="9" ry="4"/><path d="M3 9v6c0 2.2 4 4 9 4s9-1.8 9-4V9"/><ellipse cx="12" cy="9" rx="4.5" ry="1.8"/>',
    trophy: '<path d="M8 4h8v5a4 4 0 0 1-8 0V4Z"/><path d="M8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4M12 13v4M8.5 20h7"/>',
    hotel: '<path d="M3 19V7M21 19v-6a3 3 0 0 0-3-3h-8v5"/><path d="M3 13h18"/><circle cx="6.5" cy="10" r="1.5"/>',
    casino: '<rect x="4" y="4" width="16" height="16" rx="3"/><circle cx="9" cy="9" r="1" fill="currentColor"/><circle cx="15" cy="15" r="1" fill="currentColor"/><circle cx="15" cy="9" r="1" fill="currentColor"/><circle cx="9" cy="15" r="1" fill="currentColor"/>',
    cart: '<path d="M3 4h2.5l2.2 11h10.8L21 7H6.4"/><circle cx="9" cy="19" r="1.5"/><circle cx="17" cy="19" r="1.5"/>',
    company: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M3 12h18"/>',
    city: '<path d="M3 21h18M5 21V10l4-2v13M9 21V4l6 3v14M15 21v-9l4 2v7"/>',
    park: '<circle cx="12" cy="10" r="6"/><path d="M12 4v12M6 10h12M7.8 5.8l8.4 8.4M16.2 5.8l-8.4 8.4M9 21l3-5 3 5"/>',
    train: '<rect x="5" y="3" width="14" height="14" rx="4"/><path d="M5 11h14M8 21l2-4M16 21l-2-4"/><circle cx="9" cy="14" r=".8" fill="currentColor"/><circle cx="15" cy="14" r=".8" fill="currentColor"/>',
    block: '<circle cx="12" cy="12" r="9"/><path d="m5.6 5.6 12.8 12.8"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
    question: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.3-1 .9-1 1.6v.6"/><circle cx="12" cy="17" r=".6" fill="currentColor"/>',
    alert: '<path d="M12 3 2 20h20L12 3Z"/><path d="M12 10v4"/><circle cx="12" cy="17" r=".6" fill="currentColor"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    bag: '<path d="M5 8h14l-1 12H6L5 8Z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>',
    film: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M7 5v14M17 5v14M3 9h4M3 15h4M17 9h4M17 15h4"/>',
    castle: '<path d="M4 21V9h3V6h2v3h2V6h2v3h2V6h2v3h3v12Z"/><path d="M10 21v-4a2 2 0 0 1 4 0v4"/>',
    game: '<rect x="2" y="7" width="20" height="11" rx="5"/><path d="M7 11v3M5.5 12.5h3"/><circle cx="16" cy="11.5" r="1" fill="currentColor"/><circle cx="18" cy="13.5" r="1" fill="currentColor"/>'
  };
  const icon = (k, cls = 'icon') => `<svg class="${cls}" viewBox="0 0 24 24">${IC[k] || IC.bag}</svg>`;
  const CHECK = '<svg viewBox="0 0 24 24"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>';

  /* ------------------------------------------------------------------ */
  /*  Sons (WebAudio, discretos)                                        */
  /* ------------------------------------------------------------------ */
  let AC = null;
  function ac() { if (!AC) { try { AC = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) {} } if (AC && AC.state === 'suspended') AC.resume(); return AC; }
  function tone(f, dur, { type = 'sine', vol = 0.08, at = 0, slide = 0 } = {}) {
    const c = ac(); if (!c || SET.mute) return;
    const t = c.currentTime + at, o = c.createOscillator(), g = c.createGain();
    o.type = type; o.frequency.setValueAtTime(f, t); if (slide) o.frequency.exponentialRampToValueAtTime(slide, t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.012); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(c.destination); o.start(t); o.stop(t + dur + 0.05);
  }
  function noise(dur, { vol = 0.06, f0 = 400, f1 = 1600, at = 0 } = {}) {
    const c = ac(); if (!c || SET.mute) return;
    const t = c.currentTime + at, len = Math.floor(c.sampleRate * dur), buf = c.createBuffer(1, len, c.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    const src = c.createBufferSource(), bp = c.createBiquadFilter(), g = c.createGain();
    src.buffer = buf; bp.type = 'bandpass'; bp.Q.value = 1.4;
    bp.frequency.setValueAtTime(f0, t); bp.frequency.exponentialRampToValueAtTime(f1, t + dur * 0.55); bp.frequency.exponentialRampToValueAtTime(f0 * 0.8, t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + dur * 0.4); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(bp).connect(g).connect(c.destination); src.start(t); src.stop(t + dur);
  }
  const SFX = {
    found() { tone(660, .12, { vol: .06 }); tone(990, .18, { vol: .05, at: .08 }); },
    buy() { tone(1568, .14, { type: 'triangle', vol: .07 }); tone(2093, .32, { type: 'triangle', vol: .06, at: .09 }); tone(130, .18, { vol: .08 }); },
    tick() { tone(2400, .025, { type: 'square', vol: .012 }); },
    error() { tone(330, .16, { type: 'triangle', vol: .07, slide: 250 }); tone(240, .24, { type: 'triangle', vol: .06, at: .13, slide: 190 }); },
    travel() { noise(1.8, { vol: .05, f0: 350, f1: 1500 }); },
    win() { [523, 659, 784, 1046, 1318].forEach((f, i) => tone(f, .35, { type: 'triangle', vol: .07, at: i * .11 })); },
    lose() { [392, 330, 262, 196].forEach((f, i) => tone(f, .4, { type: 'sine', vol: .08, at: i * .2 })); },
    click() { tone(1200, .04, { vol: .03 }); }
  };

  /* ------------------------------------------------------------------ */
  /*  Mapa em tela cheia                                                */
  /* ------------------------------------------------------------------ */
  let stageScale = 1;
  const MW = M.w, MH = M.h, SW = M.sw || M.w, SH = M.sh || M.h, RS = MW / SW, VW = 1920, VH = 1080, W0 = 1920, H0 = 1920 * SH / SW, KX = W0 / SW, KY = H0 / SH;
  const IDX = new Uint8Array(MW * MH);
  (function decode() { let p = 0; const r = M.rle; for (let i = 0; i < r.length; i += 2) { IDX.fill(r[i], p, p + r[i + 1]); p += r[i + 1]; } })();
  const CODES = M.codes;
  const codeIndex = {}; CODES.forEach((c, i) => codeIndex[c] = i + 1);
  const PIX = [], BOX = [];
  (function build() {
    const n = CODES.length + 1, cnt = new Uint32Array(n);
    const bx = Array.from({ length: n }, () => [1e9, 1e9, -1, -1]);
    for (let i = 0; i < IDX.length; i++) {
      const k = IDX[i]; cnt[k]++;
      if (k) { const x = i % MW, y = (i / MW) | 0, b = bx[k]; if (x < b[0]) b[0] = x; if (y < b[1]) b[1] = y; if (x > b[2]) b[2] = x; if (y > b[3]) b[3] = y; }
    }
    for (let k = 0; k < n; k++) PIX.push(new Uint32Array(cnt[k]));
    const pos = new Uint32Array(n);
    for (let i = 0; i < IDX.length; i++) { const k = IDX[i]; if (k) PIX[k][pos[k]++] = i; }
    bx.forEach(b => BOX.push(b));
  })();
  const cv = $('#mapCanvas'); cv.width = MW; cv.height = MH;
  const cx = cv.getContext('2d');
  const img = cx.createImageData(MW, MH);
  const buf32 = new Uint32Array(img.data.buffer);
  const rgba = (r, g, b) => (255 << 24) | (b << 16) | (g << 8) | r;
  const COL = { current: rgba(150, 226, 243), visited: rgba(228, 247, 251), dest: rgba(190, 236, 246) };
  const PASTEL = [[214, 232, 255], [255, 240, 196], [255, 218, 230], [214, 244, 224], [233, 222, 252], [255, 226, 200], [206, 242, 240]];
  function pastelOf(code) { let h = 0; for (const ch of code) h = (h * 31 + ch.charCodeAt(0)) >>> 0; return PASTEL[h % PASTEL.length]; }
  let hoverCode = null, destCode = null;
  function paint(code, color) { const k = codeIndex[code]; if (!k) return; const L = PIX[k]; for (let i = 0; i < L.length; i++) buf32[L[i]] = color; }
  let lastPainted = [];
  function renderMapColors() {
    const cur = cityOf(S.city).country;
    const jobs = [];
    S.visited.forEach(c => { if (c !== cur) jobs.push([c, COL.visited]); });
    if (destCode && destCode !== cur) jobs.push([destCode, COL.dest]);
    if (hoverCode && hoverCode !== cur) { const p = pastelOf(hoverCode); jobs.push([hoverCode, rgba(p[0], p[1], p[2])]); }
    jobs.push([cur, COL.current]);
    // limpa só o que foi pintado antes e atualiza só a área afetada (mapa em alta resolução)
    const touched = new Set(lastPainted.concat(jobs.map(j => j[0])));
    lastPainted.forEach(c => { const k = codeIndex[c]; if (k) { const L = PIX[k]; for (let i = 0; i < L.length; i++) buf32[L[i]] = 0; } });
    jobs.forEach(([c, col]) => paint(c, col));
    lastPainted = jobs.map(j => j[0]);
    let x0 = 1e9, y0 = 1e9, x1 = -1, y1 = -1;
    touched.forEach(c => { const k = codeIndex[c]; if (!k) return; const b = BOX[k]; if (b[2] < 0) return; x0 = Math.min(x0, b[0]); y0 = Math.min(y0, b[1]); x1 = Math.max(x1, b[2]); y1 = Math.max(y1, b[3]); });
    if (x1 >= 0) cx.putImageData(img, 0, 0, x0, y0, x1 - x0 + 1, y1 - y0 + 1);
  }

  /* --- câmera --- */
  const wrap = $('#mapWrap'), inner = $('#mapInner'), tip = $('#mapTip');
  const ZMAX = 2.6;
  function clampView(v) {
    const z = clamp(v.z, 1, ZMAX), h = H0 * z;
    const ty = h <= VH ? (VH - h) / 2 : clamp(v.ty, VH - h, 0);
    return { z, tx: clamp(v.tx, VW - W0 * z, 0), ty };
  }
  const worldView = () => clampView({ z: 1, tx: 0, ty: 0 });
  let view = worldView();
  function applyView() {
    inner.style.transform = `translate(${view.tx}px,${view.ty}px) scale(${view.z})`;
    wrap.classList.toggle('zoomed', view.z > 1.01);
    scaleMarkers();
  }
  function viewOn(mx, my, z, fy = 0.5) { return clampView({ z, tx: VW / 2 - mx * KX * z, ty: VH * fy - my * KY * z }); }
  function viewFit(pts, pad = 1.6, fy = 0.52) { // enquadra vários pontos (px da imagem)
    const xs = pts.map(p => p.x), ys = pts.map(p => p.y);
    const w = (Math.max(...xs) - Math.min(...xs)) * KX * pad + 300, h = (Math.max(...ys) - Math.min(...ys)) * KY * pad + 300;
    const z = clamp(Math.min(VW / w, (VH - 260) / h), 1, 2.2);
    return viewOn((Math.max(...xs) + Math.min(...xs)) / 2, (Math.max(...ys) + Math.min(...ys)) / 2, z, fy);
  }
  let viewAnim = 0;
  function animateView(target, ms) {
    target = clampView(target);
    const run = ++viewAnim;
    return new Promise(res => {
      if (SET.skipAnim || ms <= 0) { view = target; applyView(); return res(); }
      const a = Object.assign({}, view), t0 = performance.now();
      const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      (function step(now) {
        if (run !== viewAnim) return res();
        const t = clamp((now - t0) / ms, 0, 1), e = ease(t);
        view = { z: a.z + (target.z - a.z) * e, tx: a.tx + (target.tx - a.tx) * e, ty: a.ty + (target.ty - a.ty) * e };
        applyView();
        if (t < 1) requestAnimationFrame(step); else res();
      })(t0);
    });
  }
  function localPt(e) { const r = $('#stage').getBoundingClientRect(); return { x: (e.clientX - r.left) / stageScale, y: (e.clientY - r.top) / stageScale }; }
  function zoomAt(px, py, nz) {
    const m = { x: (px - view.tx) / view.z, y: (py - view.ty) / view.z };
    nz = clamp(nz, 1, ZMAX);
    viewAnim++; view = clampView({ z: nz, tx: px - m.x * nz, ty: py - m.y * nz }); applyView();
  }
  wrap.addEventListener('wheel', e => { if (busy) return; e.preventDefault(); const p = localPt(e); zoomAt(p.x, p.y, view.z * Math.exp(-e.deltaY * 0.0016)); }, { passive: false });
  let drag = null;
  wrap.addEventListener('mousedown', e => { if (e.button !== 0 || view.z <= 1.01 || busy) return; const p = localPt(e); drag = { x: p.x, y: p.y, tx: view.tx, ty: view.ty }; wrap.classList.add('dragging'); });
  window.addEventListener('mousemove', e => { if (!drag) return; const p = localPt(e); viewAnim++; view = clampView({ z: view.z, tx: drag.tx + p.x - drag.x, ty: drag.ty + p.y - drag.y }); applyView(); });
  window.addEventListener('mouseup', () => { drag = null; wrap.classList.remove('dragging'); });
  function codeAtEvent(e) {
    const r = inner.getBoundingClientRect();
    const fx = (e.clientX - r.left) / r.width, fy = (e.clientY - r.top) / r.height;
    const x = Math.floor(fx * MW), y = Math.floor(fy * MH);
    const k = (x >= 0 && y >= 0 && x < MW && y < MH) ? IDX[y * MW + x] : 0;
    return { code: k ? CODES[k - 1] : null, k, mx: fx * SW, my: fy * SH };
  }
  wrap.addEventListener('dblclick', e => {
    if (busy) return;
    const h = codeAtEvent(e);
    if (h.code) {
      const b = BOX[h.k].map(v => v / RS), bw = (b[2] - b[0] + 1) * KX, bh = (b[3] - b[1] + 1) * KY;
      const z = clamp(Math.min(VW / (bw * 2), VH / (bh * 2)), 1.6, ZMAX);
      animateView(viewOn((b[0] + b[2]) / 2, (b[1] + b[3]) / 2, z), 700);
    } else animateView(viewOn(h.mx, h.my, Math.min(ZMAX, view.z * 1.6)), 600);
  });
  $('#zoomCtl').addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b || busy) return;
    if (b.dataset.z === 'reset') return animateView(worldView(), 700);
    const cxp = (VW / 2 - view.tx) / view.z / KX, cyp = (VH / 2 - view.ty) / view.z / KY;
    animateView(viewOn(cxp, cyp, view.z * (b.dataset.z === 'in' ? 1.45 : 1 / 1.45)), 400);
  });

  /* --- hover: nome, viagem e dicas do país --- */
  const ACT_BY_COUNTRY = {};
  D.ACTIONS.forEach(a => { if (!a.block && a.country) (ACT_BY_COUNTRY[a.country] = ACT_BY_COUNTRY[a.country] || []).push(a.id); });
  function travelToCountry(code) {
    const c = M.centers && M.centers[code]; if (!c) return null;
    const A = cityOf(S.city), d = distKm(A, { lon: c[0], lat: c[1] });
    return Math.round(d / 900 + 1.5);
  }
  wrap.addEventListener('mousemove', e => {
    if (drag || busy) { tip.classList.remove('on'); return; }
    const h = codeAtEvent(e);
    if (h.code !== hoverCode) { hoverCode = h.code; renderMapColors(); }
    if (!h.code) { tip.classList.remove('on'); return; }
    const cur = cityOf(S.city).country;
    const tt = travelToCountry(h.code);
    const sub = h.code === cur ? 'Você está aqui' : (tt ? `Viagem daqui: ~${tt}h` : '');
    const p = pastelOf(h.code), sw = h.code === cur ? '#96e2f3' : `rgb(${p.join(',')})`;
    const ids = ACT_BY_COUNTRY[h.code] || [];
    let list = '';
    if (ids.length) {
      const items = ids.map(id => { const a = getAction(id); const own = owned(id);
        const txt = SET.hints === 'nome' ? `${(a.hint || '').split(' ')[0]} ${a.short || a.name}` : (a.hint || a.name);
        return { own, html: `<li class="${own ? 'own' : ''}">${esc(txt)}</li>` }; });
      items.sort((x, y) => x.own - y.own);
      const show = items.slice(0, 5);
      list = `<ul>${show.map(i => i.html).join('')}${items.length > 5 ? `<li class="more">+ ${items.length - 5} outras coisas</li>` : ''}${D.BLOCK_HINTS[h.code] ? `<li class="blk">${esc(D.BLOCK_HINTS[h.code])}</li>` : ''}</ul>`;
    } else if (D.BLOCK_HINTS[h.code]) list = `<ul><li class="blk">${esc(D.BLOCK_HINTS[h.code])}</li></ul>`;
    tip.innerHTML = `<div class="t"><span class="sw" style="background:${sw}"></span>${esc(countryName(h.code))}</div>${sub ? `<div class="s">${sub}</div>` : ''}${list}`;
    const lp = localPt(e);
    tip.classList.add('on');
    const w = tip.offsetWidth, ht = tip.offsetHeight;
    let x = lp.x + 22, y = lp.y + 22;
    if (x + w > VW - 20) x = lp.x - w - 22;
    if (y + ht > VH - 20) y = lp.y - ht - 22;
    tip.style.left = x + 'px'; tip.style.top = Math.max(20, y) + 'px';
  });
  wrap.addEventListener('mouseleave', () => { hoverCode = null; tip.classList.remove('on'); renderMapColors(); });

  /* --- camadas SVG --- */
  const NS = 'http://www.w3.org/2000/svg';
  const el = (tag, attrs, parent) => { const n = document.createElementNS(NS, tag); for (const k in attrs) n.setAttribute(k, attrs[k]); if (parent) parent.appendChild(n); return n; };
  const Ldots = $('#dotsLayer'), Lroute = $('#routeLayer'), Lmark = $('#markerLayer'), Lfx = $('#fxLayer');
  function marker(parent, x, y, s = 1) { const g = el('g', { 'data-x': x, 'data-y': y, 'data-s': s }, parent); placeMarker(g); return g; }
  function placeMarker(g) { const k = +g.dataset.s / Math.pow(view.z, 0.8); g.setAttribute('transform', `translate(${g.dataset.x} ${g.dataset.y}) scale(${k})`); }
  function scaleMarkers() { document.querySelectorAll('#mapSvg [data-x]').forEach(placeMarker); }
  function curvePath(A, B) {
    const dx = B.x - A.x, dy = B.y - A.y, d = Math.hypot(dx, dy) || 1;
    let nx = -dy / d, ny = dx / d; if (ny > 0) { nx = -nx; ny = -ny; }
    const off = Math.min(220, d * 0.28);
    const c = { x: (A.x + B.x) / 2 + nx * off, y: (A.y + B.y) / 2 + ny * off };
    return { d: `M${A.x} ${A.y} Q${c.x} ${c.y} ${B.x} ${B.y}`, mid: { x: (A.x + 2 * c.x + B.x) / 4, y: (A.y + 2 * c.y + B.y) / 4 }, c };
  }
  function drawCurrentMarker() {
    Lmark.innerHTML = '';
    const c = cityOf(S.city);
    const g = marker(Lmark, c.x, c.y);
    el('circle', { r: 11, class: 'm-ring' }, g);
    el('circle', { r: 9, class: 'm-core' }, g);
  }
  function badgePos(city, n) {
    const c = cityOf(city);
    if (n === 0) return { x: c.x + 22, y: c.y - 22 };
    const ang = -Math.PI / 4 + n * 1.05, r = 30 + Math.floor(n / 6) * 18;
    return { x: c.x + Math.cos(ang) * r, y: c.y + Math.sin(ang) * r };
  }
  function drawBadge(parent, h, n, fresh) {
    const a = getAction(h.id) || {};
    const p = badgePos(h.city, n);
    const g = marker(parent, p.x, p.y, fresh ? 2 : 0.85);
    const gi = el('g', fresh ? { class: 'pop' } : {}, g);
    el('circle', { r: 17, class: 'badge-bg' }, gi);
    const ic = el('g', { class: 'badge-ic', transform: 'translate(-11 -11) scale(.92)', style: 'color:#0790ad' }, gi);
    ic.innerHTML = IC[a.cat] || IC.bag;
    return g;
  }
  function renderMapLayers(freshIdx) {
    Ldots.innerHTML = ''; Lroute.innerHTML = '';
    S.history.forEach(h => { if (h.from && h.to && h.from !== h.to) el('path', { d: curvePath(cityOf(h.from), cityOf(h.to)).d, class: 'route-done' }, Lroute); });
    const perCity = {};
    let freshG = null;
    S.history.forEach((h, i) => {
      if (!h.city || !cityOf(h.city)) return;
      const n = perCity[h.city] = (perCity[h.city] == null ? 0 : perCity[h.city] + 1);
      const g = drawBadge(Ldots, h, n, i === freshIdx);
      if (i === freshIdx) freshG = g;
    });
    drawCurrentMarker();
    return freshG;
  }
  function floatLabel(city, text, ms = 2600) {
    if (SET.skipAnim) return;
    const c = cityOf(city);
    const g = marker(Lfx, c.x, c.y - 44);
    const t = el('text', { class: 'float-lbl', 'text-anchor': 'middle' }, g);
    t.textContent = text;
    const t0 = performance.now();
    (function step(now) {
      const k = clamp((now - t0) / ms, 0, 1);
      t.setAttribute('y', -k * 50); t.setAttribute('opacity', k < .75 ? 1 : 1 - (k - .75) / .25);
      if (k < 1) requestAnimationFrame(step); else g.remove();
    })(t0);
  }
  function animateTravel(fromId, toId, ms, label) {
    return new Promise(res => {
      const A = cityOf(fromId), B = cityOf(toId);
      Lmark.innerHTML = '';
      const og = marker(Lmark, A.x, A.y);
      el('circle', { r: 11, class: 'm-ring' }, og); el('circle', { r: 9, class: 'm-core' }, og);
      const dg = marker(Lmark, B.x, B.y);
      el('circle', { r: 12, class: 'm-dest' }, dg);
      el('circle', { r: 7, fill: '#0d1726', stroke: '#fff', 'stroke-width': 3 }, el('g', { class: 'pop' }, dg));
      const cp = curvePath(A, B);
      const guide = el('path', { d: cp.d, class: 'route' }, Lroute);
      const trail = el('path', { d: cp.d, fill: 'none', stroke: '#00b6d6', 'stroke-width': 4.5, 'stroke-linecap': 'round' }, Lroute);
      const L = guide.getTotalLength();
      trail.setAttribute('stroke-dasharray', `${L} ${L}`); trail.setAttribute('stroke-dashoffset', L);
      const lg = marker(Lfx, cp.mid.x, cp.mid.y - 20);
      const lt = el('text', { class: 'trip-lbl', 'text-anchor': 'middle' }, el('g', { class: 'pop' }, lg)); lt.textContent = label;
      const pg = marker(Lmark, A.x, A.y);
      const plane = el('path', { d: 'M20 0 L7 -3.2 L-1 -16 L-6 -16 L-1.5 -3.2 L-11 -3.2 L-15 -9 L-18.5 -9 L-15.5 0 L-18.5 9 L-15 9 L-11 3.2 L-1.5 3.2 L-6 16 L-1 16 L7 3.2 Z', class: 'plane' }, pg);
      const t0 = performance.now();
      const ease = t => t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      (function step(now) {
        const t = clamp((now - t0) / ms, 0, 1), e = ease(t);
        const p = guide.getPointAtLength(e * L), p2 = guide.getPointAtLength(Math.min(L, e * L + 1));
        const ang = Math.atan2(p2.y - p.y, p2.x - p.x) * 180 / Math.PI;
        pg.dataset.x = p.x; pg.dataset.y = p.y; pg.dataset.s = 1.4 + Math.sin(t * Math.PI) * 0.6; placeMarker(pg);
        plane.setAttribute('transform', `rotate(${ang})`);
        trail.setAttribute('stroke-dashoffset', L * (1 - e));
        if (t < 1) requestAnimationFrame(step); else setTimeout(() => { lg.remove(); res(); }, 250);
      })(t0);
    });
  }
  const bannerEl = $('#banner');
  function banner(html) { if (!html) { bannerEl.classList.remove('on'); return; } bannerEl.innerHTML = html; bannerEl.classList.add('on'); }

  /* ------------------------------------------------------------------ */
  /*  O trilhão físico: 1.000 quadradinhos de R$ 1 bilhão              */
  /* ------------------------------------------------------------------ */
  const COLS = 50, ROWS = 20;
  const MONEY = ['#33c385', '#2fbd7f', '#3ac98b', '#2bb779', '#36c687'];
  const cellColor = i => MONEY[(i * 2654435761 >>> 0) % MONEY.length];
  function rr(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
  function makePile(canvas, opt) {
    const ctx = canvas.getContext('2d'), W = canvas.width, H = canvas.height;
    const PITCH = opt.pitch, CELL = Math.round(PITCH * 0.8), PERSON = opt.person;
    const BX = W - (COLS * PITCH - (PITCH - CELL)) - 2, BY = H - (ROWS * PITCH - (PITCH - CELL)) - 2;
    const removedAt = new Float64Array(COLS * ROWS);
    const st = { lastFull: null, loop: false, bal: 0, lensCell: -1 };
    const cellXY = i => { const r = Math.floor(i / COLS), c = i % COLS; return { x: BX + c * PITCH, y: BY + (ROWS - 1 - r) * PITCH }; };
    function draw(bal) {
      st.bal = bal;
      const now = performance.now();
      const full = Math.floor(bal / 1e9 + 1e-9), frac = bal / 1e9 - full;
      if (opt.flash && st.lastFull != null && full < st.lastFull) for (let i = full; i < st.lastFull && i < 1000; i++) removedAt[i] = now;
      if (st.lastFull != null && full > st.lastFull) for (let i = st.lastFull; i < full; i++) removedAt[i] = 0;
      st.lastFull = full;
      ctx.clearRect(0, 0, W, H);
      let flashing = false; const rad = Math.max(2, CELL * .18);
      for (let i = 0; i < COLS * ROWS; i++) {
        const { x, y } = cellXY(i);
        if (i < full) {
          ctx.fillStyle = cellColor(i); rr(ctx, x, y, CELL, CELL, rad); ctx.fill();
          ctx.fillStyle = 'rgba(255,255,255,.28)'; ctx.fillRect(x + CELL * .2, y + CELL * .2, CELL * .6, Math.max(1, CELL * .12));
        } else {
          const age = now - removedAt[i];
          if (removedAt[i] && age < 900) {
            flashing = true;
            const k = age / 900, s = CELL * (1 - k * .6), o = (CELL - s) / 2;
            ctx.fillStyle = `rgba(255,176,32,${1 - k * .7})`; rr(ctx, x + o, y + o - k * CELL * .7, s, s, rad); ctx.fill();
          }
          ctx.fillStyle = '#e9eef2'; rr(ctx, x, y, CELL, CELL, rad); ctx.fill();
          if (i === full && frac > 0.0001) {
            const h = Math.max(1.5, CELL * frac);
            ctx.save(); rr(ctx, x, y, CELL, CELL, rad); ctx.clip(); ctx.fillStyle = cellColor(i); ctx.fillRect(x, y + CELL - h, CELL, h); ctx.restore();
          }
        }
        if (i === st.lensCell) { ctx.strokeStyle = '#0d1726'; ctx.lineWidth = Math.max(2, PITCH * .15); rr(ctx, x - PITCH * .2, y - PITCH * .2, CELL + PITCH * .4, CELL + PITCH * .4, rad + 2); ctx.stroke(); }
      }
      // bonequinho (escala humana)
      const u = PERSON, px = u * 3, base = H - 4;
      ctx.strokeStyle = '#0d1726'; ctx.fillStyle = '#0d1726'; ctx.lineWidth = u * .5; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.arc(px, base - u * 7.2, u, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.moveTo(px, base - u * 6); ctx.lineTo(px, base - u * 2.8);
      ctx.moveTo(px, base - u * 2.8); ctx.lineTo(px - u, base); ctx.moveTo(px, base - u * 2.8); ctx.lineTo(px + u, base);
      ctx.moveTo(px - u * 1.4, base - u * 5); ctx.lineTo(px, base - u * 5.5); ctx.lineTo(px + u * 1.4, base - u * 4.5);
      ctx.stroke();
      ctx.font = `700 ${Math.round(u * 2.4)}px ` + getComputedStyle(document.body).fontFamily; ctx.fillStyle = '#7a8799'; ctx.textAlign = 'center';
      ctx.fillText('você', px, base - u * 9.4);
      if (flashing && !st.loop) { st.loop = true; requestAnimationFrame(() => { st.loop = false; draw(st.bal); }); }
    }
    return { draw, st, cellXY, CELL };
  }
  const hudPile = makePile($('#pile'), { pitch: 15, person: 7, flash: false });
  const bigPile = makePile($('#bigPile'), { pitch: 26, person: 11, flash: true });

  const lensCv = $('#lensCv'), lctx = lensCv.getContext('2d');
  function drawLens(balBefore, balAfter, price) {
    const k = Math.min(999, Math.floor(balAfter / 1e9 + 1e-9));
    const fAfter = balAfter / 1e9 - k, fBefore = Math.min(1, balBefore / 1e9 - k);
    bigPile.st.lensCell = k;
    const N = 10, P = 36, C = 32;
    lctx.clearRect(0, 0, 360, 360);
    for (let s = 0; s < 100; s++) {
      const r = Math.floor(s / N), c = s % N, x = c * P + 2, y = (N - 1 - r) * P + 2;
      const lo = s / 100, hi = (s + 1) / 100;
      lctx.fillStyle = '#e9eef2'; rr(lctx, x, y, C, C, 5); lctx.fill();
      const seg = (a, b, col) => { const A = Math.max(lo, a), B = Math.min(hi, b); if (B <= A) return; const h0 = (A - lo) * 100 * C, h1 = (B - lo) * 100 * C; lctx.save(); rr(lctx, x, y, C, C, 5); lctx.clip(); lctx.fillStyle = col; lctx.fillRect(x, y + C - h1, C, h1 - h0); lctx.restore(); };
      seg(0, fAfter, cellColor(s));
      seg(fAfter, fBefore, '#ffb020');
    }
    const parts = price / 1e7;
    $('#lensCap').innerHTML = `− ${fmtShort(price)}<small>= ${trimNum(parts, parts < 1 ? 2 : 1)} de 100 pedacinhos de UM quadradinho</small>`;
  }

  /* ------------------------------------------------------------------ */
  /*  HUD: tempo e dinheiro                                             */
  /* ------------------------------------------------------------------ */
  const shown = { balance: S.balance, minutes: S.minutes };
  const dayPills = $('#dayPills');
  for (let i = 0; i < 7; i++) dayPills.insertAdjacentHTML('beforeend', '<div class="day-pill"><i></i></div>');
  function fmtLeftPct(bal) {
    const spentP = (D.START_BALANCE - bal) / D.START_BALANCE * 100;
    if (spentP <= 0) return '100%';
    if (bal <= 0) return '0%';
    const d = spentP < 0.001 ? 5 : spentP < 0.01 ? 4 : spentP < 10 ? 3 : 1;
    return (100 - spentP).toFixed(d).replace(/0+$/, '').replace(/\.$/, '').replace('.', ',') + '%';
  }
  function paintMoney() {
    $('#moneyValue').textContent = fmtFull(shown.balance);
    const spent = Math.max(0, D.START_BALANCE - shown.balance);
    $('#leftPct').textContent = fmtLeftPct(shown.balance) + ' restante';
    $('#spentValue').textContent = spent > 0 ? fmtShort(spent) + ' gastos' : 'nada gasto ainda';
    hudPile.draw(shown.balance);
  }
  function paintTime() { $('#timeValue').textContent = fmtRemain(shown.minutes); }
  function paintTop() { paintMoney(); paintTime(); }
  function paintTopStatic() {
    const elapsed = D.START_MINUTES - S.minutes;
    [...dayPills.children].forEach((p, i) => p.firstChild.style.transform = `scaleX(${clamp((elapsed - i * 1440) / 1440, 0, 1)})`);
    const tb = $('#timeBox'); tb.classList.remove('warn', 'danger');
    let u = '';
    if (S.minutes < 1440) { tb.classList.add('danger'); u = 'Menos de 1 dia!'; }
    else if (S.minutes < 2880) { tb.classList.add('warn'); u = 'Reta final'; }
    $('#urgency').textContent = u;
    const c = cityOf(S.city); $('#locName').textContent = `${c.name}, ${countryName(c.country)}`;
  }
  function tween(ms, fn, easing) {
    return new Promise(res => {
      if (SET.skipAnim || ms <= 0) { fn(1); return res(); }
      const t0 = performance.now();
      (function step(now) { const t = clamp((now - t0) / ms, 0, 1); fn(easing ? easing(t) : t); if (t < 1) requestAnimationFrame(step); else res(); })(t0);
    });
  }
  const easeInOut = t => t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  function animateMinutesTo(target, ms) {
    const m0 = shown.minutes; const tv = $('#timeValue');
    tv.classList.remove('bump'); void tv.offsetWidth; tv.classList.add('bump');
    let last = 0;
    return tween(ms, t => { shown.minutes = m0 + (target - m0) * t; paintTime(); const now = performance.now(); if (now - last > 160 && t < .98) { SFX.tick(); last = now; } }, easeInOut);
  }
  function animateMoneyTo(target, ms) {
    const b0 = shown.balance;
    return tween(ms, t => { shown.balance = b0 + (target - b0) * t; paintMoney(); }, easeInOut);
  }
  function animateTop(ms) { return Promise.all([animateMoneyTo(S.balance, ms), animateMinutesTo(S.minutes, ms)]); }

  /* ------------------------------------------------------------------ */
  /*  Avançar (estilo slide): clique / espaço / Enter / ADM             */
  /* ------------------------------------------------------------------ */
  let advanceResolve = null;
  function waitAdvance(autoMs) {
    return new Promise(res => {
      if (SET.skipAnim) return setTimeout(res, 600);
      advanceResolve = res;
      if (SET.advance === 'auto') setTimeout(() => { if (advanceResolve === res) { advanceResolve = null; res(); } }, autoMs || 4000);
    });
  }
  function advance() { if (advanceResolve) { const r = advanceResolve; advanceResolve = null; SFX.click(); r(); } }
  $('#moment').addEventListener('click', advance);
  window.addEventListener('keydown', e => {
    if (!advanceResolve) return;
    if (e.key === ' ' || e.key === 'Enter' || e.key === 'ArrowRight') { e.preventDefault(); advance(); }
  });

  /* ------------------------------------------------------------------ */
  /*  Histórico                                                         */
  /* ------------------------------------------------------------------ */
  function renderHistory() {
    const box = $('#histChips'); box.innerHTML = '';
    const n = S.history.length;
    $('#histAll').style.display = n ? '' : 'none';
    $('.hist-title').textContent = n ? `ÚLTIMAS COMPRAS · ${n}` : 'ÚLTIMAS COMPRAS';
    if (!n) { box.innerHTML = '<span class="empty">Suas compras aparecem aqui.</span>'; return; }
    S.history.slice(-3).reverse().forEach(h => {
      box.insertAdjacentHTML('beforeend', `<span class="ch"><span class="ck">✓</span><span class="nm">${esc(h.short || h.name)}</span><b>${fmtShort(h.price)}</b></span>`);
    });
  }
  $('#histAll').addEventListener('click', () => {
    const items = S.history.map((h, i) => `<li><span class="n">${i + 1}</span><span>${esc(h.name)}</span><span class="p">${fmtShort(h.price)}</span><span class="t">${fmtDur(h.minutes)}</span></li>`).join('');
    showOverlay(`<div class="modal hist-modal"><h3>Histórico de compras</h3><ol>${items}</ol><button class="btn btn-dark" data-close>Fechar</button></div>`, true);
  });

  /* ------------------------------------------------------------------ */
  /*  Busca + mini tela de confirmação                                  */
  /* ------------------------------------------------------------------ */
  const input = $('#searchInput'), sug = $('#suggest'), MB = $('#modalBack'), MD = $('#modal');
  let current = null;
  let busy = false;
  let noAnim = false;
  function openModal(html) { const was = !MB.classList.contains('hidden'); MD.innerHTML = html; MB.classList.remove('hidden'); MD.style.animation = 'none'; void MD.offsetWidth; MD.style.animation = (noAnim && was) ? 'none' : ''; noAnim = false; }
  function closeModal() { MB.classList.add('hidden'); MD.innerHTML = ''; current = null; }
  function idle() { closeModal(); }
  MB.addEventListener('mousedown', e => { if (e.target === MB && !busy) { closeModal(); input.focus(); } });
  window.addEventListener('keydown', e => { if (e.key === 'Escape' && !MB.classList.contains('hidden') && !busy) { closeModal(); input.focus(); } });

  let sugSel = -1, sugIds = [];
  function renderSuggest() {
    sugIds = busy ? [] : suggestions(input.value);
    sugSel = -1;
    if (!sugIds.length) { sug.classList.remove('on'); sug.innerHTML = ''; return; }
    sug.innerHTML = sugIds.map((id, i) => { const a = getAction(id); const c = cityOf(a.city); return `<li data-i="${i}"><span class="ic">${icon(a.cat)}</span>${esc(a.name)}<span class="where">${c ? esc(countryName(c.country)) : ''}</span></li>`; }).join('');
    sug.classList.add('on');
    sug.querySelectorAll('li').forEach(li => li.addEventListener('mousedown', e => { e.preventDefault(); pickSuggest(+li.dataset.i); }));
  }
  function pickSuggest(i) { const a = getAction(sugIds[i]); if (!a) return; input.value = a.name; sug.classList.remove('on'); runSearch(a.name, a.id); }
  input.addEventListener('input', renderSuggest);
  input.addEventListener('blur', () => setTimeout(() => sug.classList.remove('on'), 120));
  input.addEventListener('keydown', e => {
    if (!sug.classList.contains('on')) return;
    const items = sug.querySelectorAll('li');
    if (e.key === 'ArrowUp') { e.preventDefault(); sugSel = sugSel <= 0 ? items.length - 1 : sugSel - 1; }
    else if (e.key === 'ArrowDown') { e.preventDefault(); sugSel = (sugSel + 1) % items.length; }
    else if (e.key === 'Escape') { sug.classList.remove('on'); return; }
    else if (e.key === 'Enter' && sugSel >= 0) { e.preventDefault(); pickSuggest(sugSel); return; }
    else return;
    items.forEach((li, i) => li.classList.toggle('sel', i === sugSel));
  });
  $('#searchForm').addEventListener('submit', e => { e.preventDefault(); if (input.value.trim()) runSearch(input.value); });

  const LOAD_TXT = ['PROCURANDO VENDEDORES...', 'ESTIMANDO NEGOCIAÇÃO...', 'CALCULANDO...', 'VERIFICANDO DISPONIBILIDADE...', 'CONSULTANDO O MERCADO...'];
  async function runSearch(q, forceId) {
    if (busy || S.ended) return;
    busy = true; sug.classList.remove('on'); ac(); tip.classList.remove('on');
    const res = forceId ? (owned(forceId) ? { type: 'owned', id: forceId, alt: altFor(forceId) } : { type: 'action', id: forceId }) : interpret(q);
    openModal(`<div class="loading"><div class="loader"><i></i><i></i><i></i></div><div class="loading-txt">${LOAD_TXT[Math.floor(Math.random() * LOAD_TXT.length)]}</div></div>`);
    await wait(SET.skipAnim ? 120 : 1100 + Math.random() * 500);
    busy = false;
    showResult(res);
  }
  function showResult(res) {
    if (res.type === 'action') { const a = getAction(res.id); if (a.block) return showBlock(a.block, a); return showAction(a); }
    if (res.type === 'block') return showBlock(res.block || getAction(res.id).block, res.id ? getAction(res.id) : null);
    if (res.type === 'owned') return showOwned(getAction(res.id), res.alt ? getAction(res.alt) : null);
    if (res.type === 'suggest') return showSuggest(getAction(res.id));
    if (res.type === 'empty') return idle();
    return showNotFound();
  }
  function bigMoney(v) {
    const a = Math.abs(v);
    if (a >= 1e12) return 'R$ ' + trimNum(v / 1e12, 2) + (a >= 2e12 ? ' trilhões' : ' trilhão');
    if (a >= 1e9) return 'R$ ' + trimNum(v / 1e9, a >= 1e11 ? 0 : 1) + (a >= 2e9 ? ' bilhões' : ' bilhão');
    if (a >= 1e6) return 'R$ ' + trimNum(v / 1e6, 0) + (a >= 2e6 ? ' milhões' : ' milhão');
    return fmtFull(v);
  }
  const placeName = c => { const n = countryName(c.country); return `${c.name}, ${n === 'Estados Unidos' ? 'EUA' : n}`; };
  const okBtn = (label = 'TENTAR OUTRA COISA') => `<div class="btns"><button class="btn btn-dark" id="okBtn">${label}</button></div>`;
  function bindOk() { const b = $('#okBtn'); if (b) b.addEventListener('click', () => { closeModal(); input.select(); input.focus(); }); }

  function showAction(a, budget) {
    if (a.flex && budget == null) budget = Math.min(a.flex.options[1] || a.flex.min, a.flex.max);
    const q = quote(a, budget);
    current = { action: a, budget, quote: q };
    const tooLong = q.total > S.minutes, tooPoor = q.price > S.balance;
    const t = q.travel, city = cityOf(a.city);
    let travelLbl = 'Viagem', travelVal = 'você já está aqui';
    if (t.kind === 'remote') travelVal = 'não precisa (remota)';
    else if (t.kind === 'domestic') { travelLbl = `Deslocamento até ${esc(city.name)}`; travelVal = fmtDur(t.minutes); }
    else if (t.kind === 'intl') { const A = cityOf(t.from); travelLbl = `Viagem ${esc(countryName(A.country))} → ${esc(countryName(city.country))}`; travelVal = fmtDur(t.minutes); }
    let flexHtml = '';
    if (a.flex) {
      const maxB = a.flex.max, canAll = S.balance >= a.flex.min && S.balance <= maxB && S.balance !== budget;
      flexHtml = `<div class="flex-lbl">ORÇAMENTO DA OBRA · ${trimNum(a.flex.min / 1e9, 1)} A ${trimNum(maxB / 1e9, 0)} BI</div>
        <div class="chips">${a.flex.options.map(o => `<button class="chip ${o === budget ? 'on' : ''}" data-b="${o}">${fmtShort(o).replace('R$ ', '')}</button>`).join('')}</div>
        <label class="custom"><span>R$</span><input id="flexIn" type="number" step="0.1" min="${a.flex.min / 1e9}" max="${maxB / 1e9}" value="${+(budget / 1e9).toFixed(2)}"><span>bilhões</span>${canAll ? `<button type="button" class="mini" id="flexAll">Usar o saldo restante</button>` : ''}</label>`;
    }
    let alerts = '';
    if (tooPoor) alerts = `<div class="alert danger">${icon('alert')}<span>Saldo insuficiente — mesmo tendo ${fmtWords(S.balance)}.</span></div>`;
    else if (tooLong) alerts = `<div class="alert danger">${icon('clock')}<span>Não dá pra concluir dentro do prazo. Você só tem ${fmtRemain(S.minutes)}.</span></div>`;
    const tag = a.remote ? '<span class="tag remote">COMPRA REMOTA</span>' : (t.kind === 'intl' || t.kind === 'domestic' ? '<span class="tag need">PRECISA IR ATÉ LÁ</span>' : '<span class="tag">PRESENCIAL</span>');
    openModal(`<div class="${a.flex ? 'is-flex' : ''}">
      <div class="c-title"><span class="c-ico">${icon(a.cat)}</span>${esc(a.name)}</div>
      <div class="big3">
        <div class="price">${bigMoney(q.price)}<small>${fmtFull(q.price)} · ${fmtPct(q.price / D.START_BALANCE * 100)} do trilhão</small></div>
        <div class="time">${fmtDur(q.total)}<small>tempo total</small></div>
      </div>
      <div class="where"><span class="pin"></span>${esc(placeName(city))} ${tag}</div>
      <div class="why">${icon('clock')}<span>${esc(D.TIERS[a.tier] || '')}</span></div>
      ${flexHtml}
      <div class="dets">
        <div class="det">${a.flex ? 'Fechar o contrato da obra' : 'Fechar o negócio'}<i></i><b>${fmtDur(q.buyMin)}</b></div>
        <div class="det">${travelLbl}<i></i><b>${travelVal}</b></div>
      </div>
      ${alerts}
      <div class="btns"><button class="btn btn-buy" id="buyBtn" ${tooLong || tooPoor ? 'disabled' : ''}>COMPRAR</button><button class="btn btn-ghost" id="cancelBtn">CANCELAR</button></div>
    </div>`);
    $('#buyBtn').addEventListener('click', () => buy());
    $('#cancelBtn').addEventListener('click', () => { SFX.click(); closeModal(); input.focus(); });
    if (a.flex) {
      MD.querySelectorAll('.chip').forEach(c => c.addEventListener('click', () => { SFX.click(); noAnim = true; showAction(a, +c.dataset.b); }));
      const fi = $('#flexIn');
      fi.addEventListener('change', () => {
        let v = parseFloat(String(fi.value).replace(',', '.'));
        if (!isFinite(v)) v = a.flex.min / 1e9;
        v = clamp(v * 1e9, a.flex.min, a.flex.max);
        noAnim = true; showAction(a, Math.round(v / 1e6) * 1e6);
      });
      fi.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); fi.blur(); } });
      const fa = $('#flexAll'); if (fa) fa.addEventListener('click', e => { e.preventDefault(); SFX.click(); noAnim = true; showAction(a, S.balance); });
    } else SFX.found();
    if (tooLong || tooPoor) SFX.error();
  }
  function showBlock(b, a) {
    current = null;
    let extra = '';
    if (b.type === 'tempo') extra = `<div class="big3"><div class="price">${b.price ? bigMoney(b.price) : '—'}<small>valor estimado</small></div><div class="time">${b.days} dias<small>de aprovação</small></div></div>
        <div class="dets"><div class="det">Você tem<i></i><b>${fmtRemain(S.minutes)}</b></div></div>`;
    const title = b.type === 'tempo' && a ? (a.id === 'x_bigtech' ? 'Aquisição gigantesca' : a.name) : 'Compra impossível';
    openModal(`<div class="blocked"><div class="c-title"><span class="c-ico">${icon('block')}</span>${esc(title)}</div>
      <div class="block-title">${esc(b.title)}</div><div class="block-msg">${esc(b.msg)}</div>${extra}${okBtn()}</div>`);
    bindOk(); SFX.error();
  }
  function showOwned(a, alt) {
    current = null;
    openModal(`<div class="owned"><div class="c-title"><span class="c-ico">${icon(a.cat)}</span>${esc(a.name)}</div>
      <div class="block-title">VOCÊ JÁ É DONO DISSO.</div><div class="block-msg">Comprar de novo seria pagar pra você mesmo.</div>
      <div class="btns">${alt ? `<button class="btn btn-buy" id="altBtn">QUE TAL: ${esc((alt.short || alt.name).toUpperCase())}?</button>` : ''}<button class="btn ${alt ? 'btn-ghost' : 'btn-dark'}" id="okBtn">${alt ? 'NÃO' : 'TENTAR OUTRA COISA'}</button></div></div>`);
    bindOk();
    if (alt) $('#altBtn').addEventListener('click', () => { input.value = alt.name; runSearch(alt.name, alt.id); });
    SFX.error();
  }
  function showSuggest(a) {
    current = null;
    openModal(`<div class="notfound"><div class="c-title"><span class="c-ico">${icon('question')}</span>Não entendi direito.</div>
      <div class="block-msg" style="margin-top:20px;font-size:26px">Você quis dizer: <b>${esc(a.name)}</b>?</div>
      <div class="btns"><button class="btn btn-buy" id="yesBtn">SIM</button><button class="btn btn-ghost" id="okBtn">NÃO</button></div></div>`);
    $('#yesBtn').addEventListener('click', () => { input.value = a.name; runSearch(a.name, a.id); });
    bindOk(); SFX.found();
  }
  function showNotFound() {
    current = null;
    openModal(`<div class="notfound"><div class="c-title"><span class="c-ico">${icon('search')}</span>Não encontrei uma forma realista de adquirir isso.</div>
      <div class="block-msg">Tente explicar de outra maneira.</div>${okBtn('TENTAR DE NOVO')}</div>`);
    bindOk(); SFX.error();
  }

  /* ------------------------------------------------------------------ */
  /*  Comprar — sequência em ritmo de slide                             */
  /* ------------------------------------------------------------------ */
  function snapshot() { const { undo, ...rest } = S; return JSON.parse(JSON.stringify(rest)); }
  function pushUndo() { S.undo.push(snapshot()); if (S.undo.length > 40) S.undo.shift(); }
  const SHORT = {};
  D.ACTIONS.forEach(a => { if (a.short) SHORT[a.id] = a.short; });
  function shortName(a) { if (SHORT[a.id]) return SHORT[a.id]; const s = a.name.replace(/^(Um|Uma|O|A) /, ''); return s.charAt(0).toUpperCase() + s.slice(1); }

  async function buy(opts = {}) {
    if (!current || busy) return;
    const a = current.action;
    const q = opts.price != null || opts.minutes != null ? Object.assign({}, current.quote) : quote(a, current.budget);
    if (opts.price != null) q.price = opts.price;
    if (opts.minutes != null) { q.buyMin = opts.minutes; q.total = q.buyMin + q.travel.minutes; }
    if (!opts.force && (q.total > S.minutes || q.price > S.balance)) return;
    busy = true;
    const prevSkip = SET.skipAnim; if (opts.instant) SET.skipAnim = true;
    closeModal(); current = null; tip.classList.remove('on'); hoverCode = null;
    pushUndo();
    const fromCity = S.city, m0 = S.minutes, balBefore = S.balance;
    const dest = cityOf(a.city), from = cityOf(fromCity);
    SFX.click();
    // 1) VIAGEM — o mapa é o protagonista
    if (q.travel.minutes > 0) {
      await animateView(viewFit([from, dest]), 1300);
      destCode = dest.country; renderMapColors();
      banner(`${esc(from.name.toUpperCase())} → ${esc(dest.name.toUpperCase())} · ✈ <b>+${fmtDur(q.travel.minutes).toUpperCase()}</b>`);
      SFX.travel();
      await Promise.all([animateTravel(fromCity, a.city, 3400, `+${fmtDur(q.travel.minutes)}`), animateMinutesTo(m0 - q.travel.minutes, 3400)]);
      destCode = null;
      S.city = a.city; if (!S.visited.includes(dest.country)) S.visited.push(dest.country);
      paintTopStatic(); renderMapColors(); drawCurrentMarker();
      await animateView(viewOn(dest.x, dest.y, 2, 0.5), 1300);
    } else {
      if (a.remote) await animateView(viewOn(dest.x, dest.y, 1.6, 0.5), 1200);
      else await animateView(viewOn(dest.x, dest.y, Math.max(view.z, 1.6), 0.5), 1000);
    }
    // 2) NEGOCIAÇÃO
    const negTxt = a.tier === 'obra' ? 'ASSINANDO O CONTRATO DA OBRA' : a.remote ? 'FECHANDO POR VIDEOCHAMADA' : a.tier === 'empresa' ? 'NEGOCIANDO COM OS DONOS' : a.tier === 'clube' ? 'ESPERANDO A LIGA APROVAR' : 'FECHANDO O NEGÓCIO';
    banner(`${negTxt}… <b>+${fmtDur(q.buyMin).toUpperCase()}</b>`);
    await animateMinutesTo(m0 - q.total, 2400);
    await wait(SET.skipAnim ? 0 : 400);
    banner(null);
    // 3) aplica a compra
    S.balance = Math.max(0, S.balance - q.price);
    S.minutes = Math.max(0, S.minutes - q.total);
    if (!a.remote && a.city) { S.city = a.city; if (!S.visited.includes(dest.country)) S.visited.push(dest.country); }
    S.history.push({ id: a.id, name: a.flex ? `${a.name} (${fmtShort(q.price)})` : a.name, short: shortName(a), price: q.price, minutes: q.total,
      buyMin: q.buyMin, travelMin: q.travel.minutes, city: a.city, from: q.travel.minutes ? fromCity : null, to: q.travel.minutes ? a.city : null, remote: !!a.remote });
    save();
    paintTopStatic();
    // 4) MOMENTO DO DINHEIRO (slide)
    await moneyMoment(a, q.price, balBefore, S.balance);
    // 5) emblema no mapa
    SFX.buy();
    renderMapColors();
    const g = renderMapLayers(S.history.length - 1);
    floatLabel(a.city, '− ' + fmtShort(q.price).toUpperCase());
    renderHistory();
    await animateMoneyTo(S.balance, 900);
    await wait(SET.skipAnim ? 50 : 1500);
    if (g) { g.dataset.s = 0.85; g.style.transition = 'transform .6s cubic-bezier(.3,1.3,.5,1)'; placeMarker(g); }
    await animateView(worldView(), 1500);
    SET.skipAnim = prevSkip;
    busy = false;
    input.value = ''; input.focus();
    setTimeout(checkEnd, 400);
  }

  async function moneyMoment(a, price, balBefore, balAfter) {
    const mo = $('#moment'), moV = $('#moV'), moR = $('#moR'), next = $('#moNext'), lens = $('#moLens');
    mo.classList.remove('hidden', 'out'); moR.classList.remove('on'); next.classList.remove('on');
    $('#moK').textContent = a.tier === 'obra' ? 'VOCÊ PAGOU ADIANTADO' : 'VOCÊ GASTOU';
    bigPile.st.lastFull = null; bigPile.st.lensCell = -1; bigPile.draw(balBefore);
    moV.textContent = 'R$ 0';
    const small = price < 1e9;
    if (small) { drawLens(balBefore, balAfter, price); lens.classList.add('hidden'); } else lens.classList.add('hidden');
    await wait(SET.skipAnim ? 0 : 500);
    const dur = SET.skipAnim ? 0 : clamp(1800 + Math.log10(Math.max(price, 1e6) / 1e6) * 450, 1800, 3600);
    let last = 0;
    await tween(dur, t => {
      moV.textContent = fmtFull(price * t);
      bigPile.draw(balBefore - (balBefore - balAfter) * t);
      shown.balance = balBefore - (balBefore - balAfter) * t; paintMoney();
      const now = performance.now(); if (now - last > 110 && t < .98) { SFX.tick(); last = now; }
    }, t => 1 - Math.pow(1 - t, 2.2));
    moV.textContent = fmtFull(price);
    if (small) { bigPile.draw(balAfter); lens.classList.remove('hidden'); }
    await wait(SET.skipAnim ? 0 : 500);
    const left = fmtLeftPct(balAfter);
    moR.innerHTML = balAfter <= SET.winThreshold ? 'E NÃO SOBROU NADA.' : `ainda restam <span>${fmtFull(balAfter)}</span> · ${left}`;
    moR.classList.add('on');
    await wait(SET.skipAnim ? 0 : 700);
    next.textContent = SET.advance === 'auto' ? '' : 'clique para continuar ▸';
    next.classList.add('on');
    await waitAdvance(4500);
    mo.classList.add('out');
    await wait(SET.skipAnim ? 0 : 450);
    mo.classList.add('hidden'); mo.classList.remove('out'); lens.classList.add('hidden'); bigPile.st.lensCell = -1;
  }

  /* ------------------------------------------------------------------ */
  /*  Fim de jogo                                                       */
  /* ------------------------------------------------------------------ */
  function checkEnd() {
    if (S.ended || busy) return;
    if (S.balance <= SET.winThreshold) return endGame('win');
    if (S.minutes <= 0 || !anyFeasible()) return endGame('lose');
  }
  function statsGrid() {
    const h = S.history, prices = h.map(x => x.price);
    const used = D.START_MINUTES - S.minutes;
    const visited = new Set(S.visited).size;
    return `<div class="grid">
      <div><small>TEMPO UTILIZADO</small><b>${fmtRemain(used)}</b></div>
      <div><small>COMPRAS REALIZADAS</small><b>${h.length}</b></div>
      <div><small>PAÍSES VISITADOS</small><b>${visited}</b></div>
      <div><small>MAIOR COMPRA</small><b>${prices.length ? fmtShort(Math.max(...prices)) : '—'}</b></div>
      <div><small>MENOR COMPRA</small><b>${prices.length ? fmtShort(Math.min(...prices)) : '—'}</b></div>
      <div><small>TOTAL GASTO</small><b>${fmtShort(D.START_BALANCE - S.balance)}</b></div></div>`;
  }
  function endGame(kind, silent) {
    S.ended = kind; save();
    if (kind === 'win') {
      showOverlay(`<div class="modal win"><div class="kicker">VOCÊ CONSEGUIU</div><h1 class="win-num">${fmtFull(D.START_BALANCE - S.balance)}</h1><div class="win-sub">GASTOS</div>
        <p>Um trilhão de reais, gasto em menos de uma semana.</p>${statsGrid()}</div>`);
      if (!silent) { SFX.win(); confetti(); }
    } else {
      showOverlay(`<div class="modal lose"><div class="kicker">O TEMPO ACABOU</div><h1>Você não conseguiu.</h1>
        <div class="big">Saldo restante: ${fmtFull(S.balance)}</div>
        <p>Você tinha ${fmtWords(S.balance)} e não conseguiu gastar a tempo.</p>${statsGrid()}</div>`);
      if (!silent) SFX.lose();
    }
  }
  const ov = $('#overlay');
  function showOverlay(html, closable) {
    confettiRun++; cfx.clearRect(0, 0, 1920, 1080);
    ov.innerHTML = html; ov.classList.remove('hidden');
    ov.querySelectorAll('[data-close]').forEach(b => b.addEventListener('click', hideOverlay));
    ov.onclick = closable ? (e => { if (e.target === ov) hideOverlay(); }) : null;
  }
  function hideOverlay() { ov.classList.add('hidden'); ov.innerHTML = ''; confettiRun++; cfx.clearRect(0, 0, 1920, 1080); }

  function showIntro() {
    showOverlay(`<div class="modal intro"><div class="brand"><span class="brand-hex"></span>GASTE 1 TRILHÃO EM 7 DIAS</div>
      <h1>Gaste <span>R$ 1 trilhão</span><br>em 7 dias</h1>
      <div class="big">R$ 1.000.000.000.000</div>
      <div class="rules">
        <div><b>O relógio é a compra</b>O tempo só passa quando uma compra é confirmada.</div>
        <div><b>Vá até lá</b>Quase tudo exige viajar até o lugar. A viagem entra no tempo.</div>
        <div><b>Uma vez cada</b>Nada se compra duas vezes. Nada de doar, apostar ou investir.</div>
      </div>
      <button class="btn btn-buy" id="startBtn">COMEÇAR</button></div>`);
    $('#startBtn').addEventListener('click', () => { ac(); SFX.found(); S.started = true; save(); hideOverlay(); input.focus(); });
  }

  // confete
  const cf = $('#confetti'); cf.width = 1920; cf.height = 1080; const cfx = cf.getContext('2d');
  let confettiRun = 0;
  function confetti() {
    if (SET.skipAnim) return;
    const run = ++confettiRun;
    const cols = ['#00b6d6', '#6ad8ee', '#0d1726', '#ffc94d', '#ff8fab', '#c9f0f7'];
    const P = Array.from({ length: 220 }, () => ({ x: 960 + (Math.random() - .5) * 600, y: 380 + (Math.random() - .5) * 120, vx: (Math.random() - .5) * 26, vy: -Math.random() * 22 - 6, r: Math.random() * Math.PI, vr: (Math.random() - .5) * .4, w: 8 + Math.random() * 8, h: 5 + Math.random() * 6, c: cols[Math.floor(Math.random() * cols.length)] }));
    const t0 = performance.now();
    (function step(now) {
      const t = now - t0; cfx.clearRect(0, 0, 1920, 1080);
      P.forEach(p => { p.vy += .55; p.vx *= .985; p.x += p.vx; p.y += p.vy; p.r += p.vr;
        cfx.save(); cfx.globalAlpha = clamp(1 - (t - 2600) / 900, 0, 1); cfx.translate(p.x, p.y); cfx.rotate(p.r); cfx.fillStyle = p.c; cfx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); cfx.restore(); });
      if (t < 3500 && run === confettiRun) requestAnimationFrame(step); else if (run === confettiRun) cfx.clearRect(0, 0, 1920, 1080);
    })(t0);
  }

  /* ------------------------------------------------------------------ */
  /*  Escala do palco                                                   */
  /* ------------------------------------------------------------------ */
  const stage = $('#stage');
  function fit() {
    const dock = !$('#adminDock').classList.contains('hidden') ? 472 : 0;
    const W = window.innerWidth - dock, H = window.innerHeight;
    const s = Math.min(W / 1920, H / 1080);
    stageScale = s;
    stage.style.transform = `translate(${(W - 1920 * s) / 2}px, ${(H - 1080 * s) / 2}px) scale(${s})`;
  }
  window.addEventListener('resize', fit);

  /* ------------------------------------------------------------------ */
  /*  Render completo + API do ADM                                      */
  /* ------------------------------------------------------------------ */
  function renderAll() {
    shown.balance = S.balance; shown.minutes = S.minutes;
    paintTop(); paintTopStatic(); renderMapColors(); renderMapLayers(); renderHistory(); applyView();
  }
  function changed(prevSnapshot) { if (prevSnapshot) { S.undo.push(prevSnapshot); if (S.undo.length > 30) S.undo.shift(); } save(); }

  const API = {
    setBalance(v) { const p = snapshot(); S.balance = Math.max(0, +v); changed(p); paintTopStatic(); animateTop(500); },
    setMinutes(v) { const p = snapshot(); S.minutes = Math.max(0, Math.round(+v)); changed(p); paintTopStatic(); animateTop(500); },
    setCity(id) { if (!cityOf(id)) return; const p = snapshot(); S.city = id; const c = cityOf(id).country; if (!S.visited.includes(c)) S.visited.push(c); changed(p); renderAll(); },
    show(id, budget) { const a = getAction(id); if (!a || busy) return; hideOverlayIfEnd(); input.value = a.name; if (a.block) showBlock(a.block, a); else if (owned(id)) showOwned(a, getAction(altFor(id))); else showAction(a, budget); },
    advance() { advance(); },
    zoomReset() { animateView(worldView(), 700); },
    search(text) { input.value = text; runSearch(text); },
    async exec(id, o = {}) {
      const a = getAction(id); if (!a || a.block || busy) return;
      showAction(a, o.budget != null ? o.budget : undefined);
      await wait(SET.skipAnim || o.instant ? 30 : 500);
      await buy({ force: true, price: o.price, minutes: o.minutes, instant: o.instant });
    },
    confirm(instant) { if (current) buy({ force: true, instant }); },
    cancel() { idle(); },
    undo() {
      if (busy || !S.undo.length) return;
      const p = S.undo.pop();
      const u = S.undo; S = Object.assign(p, { undo: u }); save(); hideOverlay(); idle(); renderAll();
    },
    reset() { S = freshState(); save(); hideOverlay(); idle(); view = worldView(); renderAll(); input.value = ''; showIntro(); },
    start() { S.started = true; save(); hideOverlay(); },
    forceWin() { const p = snapshot(); changed(p); endGame('win'); },
    forceLose() { const p = snapshot(); changed(p); endGame('lose'); },
    reopenEnd() { if (S.ended) endGame(S.ended, true); },
    closeOverlay() { hideOverlay(); },
    clearEnded() { S.ended = null; save(); hideOverlay(); },
    setSetting(k, v) { SET[k] = v; saveSet(); },
    setOverride(id, o) { OVR[id] = Object.assign({}, OVR[id], o); saveOvr(); },
    clearOverride(id) { delete OVR[id]; saveOvr(); },
    clearAllOverrides() { OVR = {}; saveOvr(); }
  };
  function hideOverlayIfEnd() { if (!ov.classList.contains('hidden') && !S.ended) hideOverlay(); }
  function run(cmd) { if (!cmd || !API[cmd.cmd]) return; try { API[cmd.cmd](...(cmd.args || [])); } catch (e) { console.error(e); } }

  // comandos vindos de outra janela (admin.html)
  let lastCmd = null;
  window.addEventListener('storage', e => {
    if (e.key === LS_CMD && e.newValue) { const c = JSON.parse(e.newValue); if (c.nonce !== lastCmd) { lastCmd = c.nonce; run(c); } }
    if (e.key === LS_OVR) OVR = store.get(LS_OVR) || {};
    if (e.key === LS_SET) SET = Object.assign(SET, store.get(LS_SET) || {});
  });
  try { const bc = new BroadcastChannel('trilhao'); bc.onmessage = ev => { const c = ev.data; if (c && c.nonce !== lastCmd) { lastCmd = c.nonce; run(c); } }; } catch (e) {}

  window.TRILHAO = {
    API, run, interpret, suggestions, quote: (id, b) => quote(getAction(id), b), getAction,
    get state() { return S; }, get busy() { return busy; }, get settings() { return SET; }, get overrides() { return OVR; },
    fmt: { fmtFull, fmtShort, fmtRemain, fmtDur, fmtPct }, cities: M.cities, countryName, travelFor, owned, local: true
  };

  /* ------------------------------------------------------------------ */
  /*  Início                                                            */
  /* ------------------------------------------------------------------ */
  fit();
  renderAll();
  idle();
  if (S.ended) endGame(S.ended, true);
  else if (!S.started) showIntro();
  else input.focus();
  window.addEventListener('keydown', e => {
    if (e.ctrlKey && e.shiftKey && (e.key === 'A' || e.key === 'a')) { e.preventDefault(); window.TRILHAO_toggleAdmin && window.TRILHAO_toggleAdmin(); setTimeout(fit, 10); }
  });
  window.TRILHAO_fit = fit;
})();
