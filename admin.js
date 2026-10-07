/* =====================================================================
   PAINEL ADM — funciona de dois jeitos:
   1) admin.html em outra janela/monitor (controla o jogo por localStorage)
   2) dentro do jogo com Ctrl+Shift+A ou index.html?admin
   ===================================================================== */
(() => {
  'use strict';
  const D = window.GAMEDATA, M = window.MAPDATA;
  const LS_STATE = 'trilhao2_state', LS_OVR = 'trilhao2_overrides', LS_CMD = 'trilhao2_cmd', LS_SET = 'trilhao2_settings';
  const get = k => { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } };
  const nf = new Intl.NumberFormat('pt-BR');
  const fmtFull = v => 'R$ ' + nf.format(Math.round(v || 0));
  function fmtShort(v) { const a = Math.abs(v); if (a >= 1e12) return 'R$ ' + nf.format(+(v / 1e12).toFixed(2)) + ' tri'; if (a >= 1e9) return 'R$ ' + nf.format(+(v / 1e9).toFixed(2)) + ' bi'; if (a >= 1e6) return 'R$ ' + nf.format(+(v / 1e6).toFixed(1)) + ' mi'; return fmtFull(v); }
  function fmtRemain(min) { min = Math.max(0, Math.round(min || 0)); const d = Math.floor(min / 1440), h = Math.floor((min % 1440) / 60), m = min % 60; return (d ? d + 'd ' : '') + h + 'h ' + String(m).padStart(2, '0') + 'min'; }
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  function parseMoney(s) {
    s = String(s).toLowerCase().replace(/r\$|\s/g, '');
    const m = s.match(/^([\d.,]+)(tri|trilh\w*|bi|bilh\w*|mi|milh\w*|mil|k)?$/);
    if (!m) return NaN;
    let num = m[1], unit = m[2] || '';
    if (unit) num = num.replace(/\./g, '').replace(',', '.'); else num = num.replace(/[.,]/g, '');
    const mult = unit.startsWith('tri') ? 1e12 : unit.startsWith('bi') ? 1e9 : unit.startsWith('mi') && unit !== 'mil' ? 1e6 : (unit === 'mil' || unit === 'k') ? 1e3 : 1;
    return parseFloat(num) * mult;
  }
  function parseTime(s) {
    s = String(s).toLowerCase().replace(',', '.');
    if (/^\s*[\d.]+\s*$/.test(s)) return Math.round(parseFloat(s) * 60); // número puro = horas
    let t = 0, ok = false;
    s.replace(/([\d.]+)\s*(d|dia|dias|h|hora|horas|m|min|mins|minutos)\b/g, (_, n, u) => { ok = true; n = parseFloat(n); t += u.startsWith('d') ? n * 1440 : u.startsWith('h') ? n * 60 : n; });
    return ok ? Math.round(t) : NaN;
  }

  const CSS = `
  .adm{font:13px/1.4 'Plus Jakarta Sans',system-ui,sans-serif;color:#e6edf3;background:#0f1722;height:100%;display:flex;flex-direction:column}
  .adm *{box-sizing:border-box}
  .adm header{padding:14px 16px;border-bottom:1px solid #223042;display:flex;align-items:center;gap:10px}
  .adm header b{font-size:15px;letter-spacing:.06em}
  .adm header .x{margin-left:auto}
  .adm .body{overflow:auto;padding:12px 14px 30px;flex:1}
  .adm h4{font-size:11px;letter-spacing:.14em;color:#7d8da1;margin:16px 0 8px;font-weight:800}
  .adm .astat{display:grid;grid-template-columns:1fr 1fr;gap:6px}
  .adm .astat div{background:#172231;border-radius:10px;padding:8px 10px}
  .adm .astat small{display:block;color:#7d8da1;font-size:10px;letter-spacing:.1em;font-weight:800}
  .adm .astat b{font-size:14px;font-variant-numeric:tabular-nums}
  .adm .line{display:flex;gap:6px;margin-bottom:6px;align-items:center}
  .adm input,.adm select{background:#0b121b;border:1px solid #2a3a4f;color:#e6edf3;border-radius:8px;padding:7px 9px;font:inherit;min-width:0}
  .adm input{flex:1}
  .adm select{flex:1}
  .adm button{background:#1d2b3d;border:1px solid #2c3e55;color:#e6edf3;border-radius:8px;padding:7px 10px;font:inherit;font-weight:700;cursor:pointer;white-space:nowrap}
  .adm button:hover{background:#26384f}
  .adm button.p{background:#00b6d6;border-color:#00b6d6;color:#00202a}
  .adm button.d{background:#3a1d22;border-color:#5b2a31;color:#ffb3b8}
  .adm button.g{background:#173527;border-color:#1f4a35;color:#9ff0c4}
  .adm .grid3{display:grid;grid-template-columns:repeat(3,1fr);gap:6px}
  .adm .grid4{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-bottom:6px}
  .adm label.ck{display:flex;align-items:center;gap:8px;padding:4px 0;cursor:pointer}
  .adm label.ck input{flex:none}
  .adm .act{background:#141e2b;border:1px solid #1f2c3d;border-radius:10px;padding:8px 9px;margin-bottom:6px}
  .adm .act .t{display:flex;gap:6px;align-items:baseline}
  .adm .act .t b{flex:1;font-size:13px}
  .adm .act .t span{color:#7d8da1;font-size:11px}
  .adm .act .meta{color:#93a4b8;font-size:11.5px;margin:3px 0 6px}
  .adm .act .edit{display:flex;gap:5px}
  .adm .act .edit input{width:0;padding:5px 7px;font-size:12px}
  .adm .act .edit button{padding:5px 8px;font-size:12px}
  .adm .act.blk{opacity:.75}
  .adm .act.ovr{border-color:#00b6d6}
  .adm .tag{font-size:10px;font-weight:800;padding:1px 6px;border-radius:6px;background:#22324a;color:#9fb3cc;margin-left:4px}
  .adm .hint{color:#7d8da1;font-size:11.5px;margin-top:4px}
  .adm .toast{position:sticky;bottom:0;background:#00b6d6;color:#00202a;font-weight:800;padding:8px 12px;border-radius:10px;margin-top:10px;display:none}
  `;

  function mount(root, opts) {
    const local = !!opts.local;
    if (!document.getElementById('adm-css')) { const st = document.createElement('style'); st.id = 'adm-css'; st.textContent = CSS; document.head.appendChild(st); }
    const send = (cmd, ...args) => {
      if (local && window.TRILHAO) { window.TRILHAO.API[cmd](...args); setTimeout(refresh, 60); return; }
      const msg = { cmd, args, nonce: Date.now() + '-' + Math.random() };
      try { localStorage.setItem(LS_CMD, JSON.stringify(msg)); } catch (e) {}
      try { new BroadcastChannel('trilhao2').postMessage(msg); } catch (e) {}
      setTimeout(refresh, 250);
    };
    const state = () => (local && window.TRILHAO ? window.TRILHAO.state : get(LS_STATE)) || {};
    const settings = () => Object.assign({ skipAnim: false, mute: false, winThreshold: D.WIN_THRESHOLD }, get(LS_SET) || {});
    const overrides = () => get(LS_OVR) || {};
    const setOverride = (id, o) => { if (local) send('setOverride', id, o); else { const all = overrides(); all[id] = Object.assign({}, all[id], o); localStorage.setItem(LS_OVR, JSON.stringify(all)); renderActions(); } };
    const clearOverride = id => { if (local) send('clearOverride', id); else { const all = overrides(); delete all[id]; localStorage.setItem(LS_OVR, JSON.stringify(all)); renderActions(); } };
    const setSetting = (k, v) => { if (local) send('setSetting', k, v); else { const s = settings(); s[k] = v; localStorage.setItem(LS_SET, JSON.stringify(s)); } };

    const cityOpts = Object.entries(M.cities).map(([id, c]) => `<option value="${id}">${esc(c.name)} — ${esc(M.names[c.country] || c.country)}</option>`).join('');
    root.innerHTML = `<div class="adm">
      <header><b>PAINEL ADM</b><span class="tag">${local ? 'no jogo' : 'janela separada'}</span>${local ? '<button class="x" data-a="close">Fechar ✕</button>' : ''}</header>
      <div class="body">
        <div class="astat" id="aStat"></div>

        <div class="line"><button class="p" data-a="advance" style="flex:1;height:44px;font-size:15px">▸ AVANÇAR (continuar a animação)</button></div>
        <h4>CARD ATUAL NO JOGO</h4>
        <div class="grid3"><button class="g" data-a="confirm">Concluir compra</button><button data-a="confirmInstant">Concluir sem animação</button><button data-a="cancel">Limpar card</button></div>
        <div class="line" style="margin-top:6px"><input id="aType" placeholder="Digitar pesquisa no jogo..."><button data-a="type">Pesquisar</button></div>

        <h4>SALDO / TEMPO / LOCAL</h4>
        <div class="line"><input id="aMoney" placeholder="ex: 187 bi · 1,2 tri · 500000000"><button data-a="money">Definir saldo</button></div>
        <div class="line"><input id="aTime" placeholder="ex: 1d 7h · 30h · 45min"><button data-a="time">Definir tempo</button></div>
        <div class="grid4"><button data-dt="-60">−1h</button><button data-dt="60">+1h</button><button data-dt="-1440">−1 dia</button><button data-dt="1440">+1 dia</button></div>
        <div class="line"><select id="aCity">${cityOpts}</select><button data-a="city">Mudar local</button></div>

        <h4>PARTIDA</h4>
        <div class="grid3">
          <button data-a="undo">↶ Desfazer</button><button class="g" data-a="win">Forçar vitória</button><button class="d" data-a="lose">Forçar derrota</button>
          <button data-a="closeOv">Fechar telas</button><button data-a="reopen">Reabrir final</button><button data-a="clearEnd">Continuar jogo</button>
        </div>
        <div class="line" style="margin-top:6px"><button class="d" data-a="reset" id="aReset" style="flex:1">Resetar partida</button></div>
        <label class="ck"><input type="checkbox" id="aSkip"> Pular animações</label>
        <label class="ck"><input type="checkbox" id="aMute"> Sem som</label>
        <div class="line"><span style="flex:none;color:#93a4b8">Avançar slides</span><select id="aAdv"><option value="click">No clique / espaço</option><option value="auto">Automático (4,5 s)</option></select></div>
        <div class="line"><span style="flex:none;color:#93a4b8">Dicas no mapa</span><select id="aHints"><option value="categoria">Só a categoria</option><option value="nome">Nome direto</option></select></div>
        <div class="line"><button data-a="zoomReset" style="flex:1">Mapa: voltar à visão mundial</button></div>
        <div class="line"><span style="flex:none;color:#93a4b8">Vitória com saldo ≤</span><input id="aThr"><button data-a="thr">OK</button></div>

        <h4>AÇÕES CADASTRADAS (${D.ACTIONS.length})</h4>
        <div class="line"><input id="aFilter" placeholder="Filtrar ações..."></div>
        <div id="aActs"></div>
        <div class="hint">Preço aceita "3,5 bi", "80 mi"… Tempo em horas ("14") ou "2d 6h". Ajustes ficam salvos neste navegador.</div>
        <div class="toast" id="aToast"></div>
      </div></div>`;
    const $ = s => root.querySelector(s);
    const toast = t => { const el = $('#aToast'); el.textContent = t; el.style.display = 'block'; clearTimeout(toast.t); toast.t = setTimeout(() => el.style.display = 'none', 1600); };

    function refresh() {
      const s = state(), st = settings();
      $('#aStat').innerHTML = `
        <div><small>SALDO</small><b>${fmtFull(s.balance)}</b></div>
        <div><small>TEMPO</small><b>${fmtRemain(s.minutes)}</b></div>
        <div><small>LOCAL</small><b>${esc((M.cities[s.city] || {}).name || '—')}</b></div>
        <div><small>COMPRAS · FIM</small><b>${(s.history || []).length} · ${s.ended ? (s.ended === 'win' ? 'VITÓRIA' : 'DERROTA') : (s.started ? 'jogando' : 'intro')}</b></div>`;
      if (document.activeElement !== $('#aSkip')) $('#aSkip').checked = !!st.skipAnim;
      if (document.activeElement !== $('#aMute')) $('#aMute').checked = !!st.mute;
      if (document.activeElement !== $('#aAdv')) $('#aAdv').value = st.advance || 'click';
      if (document.activeElement !== $('#aHints')) $('#aHints').value = st.hints || 'categoria';
      const own = new Set((s.history || []).map(h => h.id)); const key = [...own].join(',');
      if (key !== refresh.ownKey) { refresh.ownKey = key; renderActions(); }
      if (document.activeElement !== $('#aThr')) $('#aThr').value = fmtShort(st.winThreshold);
      if (document.activeElement !== $('#aCity')) $('#aCity').value = s.city || D.START_CITY;
    }

    function renderActions() {
      const f = ($('#aFilter').value || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
      const ov = overrides();
      const ownSet = new Set(((state() || {}).history || []).map(h => h.id));
      const list = D.ACTIONS.filter(a => !f || (a.name + ' ' + a.id + ' ' + (a.aliases || []).join(' ')).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(f));
      const groups = {};
      list.forEach(a => { const g = a.block ? 'zz' : (a.country || 'zz'); (groups[g] = groups[g] || []).push(a); });
      const order = Object.keys(groups).sort((x, y) => x === 'zz' ? 1 : y === 'zz' ? -1 : (M.names[x] || x).localeCompare(M.names[y] || y));
      $('#aActs').innerHTML = order.map(g => `<h4 style="margin-top:14px">${g === 'zz' ? 'BLOQUEADAS / IMPOSSÍVEIS' : esc((M.names[g] || g).toUpperCase())}</h4>` + groups[g].map(a0 => {
        const a = Object.assign({}, a0, ov[a0.id] || {});
        const c = a.city ? M.cities[a.city] : null;
        if (a.block) return `<div class="act blk"><div class="t"><b>${esc(a.name)}</b><span>${a.block.type}</span></div><div class="meta">${esc(a.block.title)}</div><div class="edit"><button data-show="${a.id}">Mostrar no jogo</button></div></div>`;
        const isOwn = ownSet.has(a.id);
        const meta = a.flex ? `obra ${fmtShort(a.flex.min)}–${fmtShort(a.flex.max)} · ${a.flex.base}h + ${a.flex.k}·√bi` : `${fmtShort(a.price)} · ${a.hours}h`;
        return `<div class="act ${ov[a.id] ? 'ovr' : ''}" data-id="${a.id}" style="${isOwn ? 'opacity:.55' : ''}">
          <div class="t"><b>${isOwn ? '✓ ' : ''}${esc(a.name)}</b><span>${isOwn ? 'COMPRADA' : esc(a.tier || '')}</span></div>
          <div class="meta">${meta} · ${c ? esc(c.name) : '—'} ${a.remote ? '<span class="tag">REMOTA</span>' : ''} ${ov[a.id] ? '<span class="tag">AJUSTADA</span>' : ''}</div>
          <div class="edit">
            ${a.flex ? `<input data-f="budget" placeholder="orçamento (ex 200 bi)">` : `<input data-f="price" placeholder="preço" value="${esc(fmtShort(a.price).replace('R$ ', ''))}"><input data-f="hours" placeholder="horas" value="${a.hours}" style="max-width:60px">`}
            ${a.flex ? '' : `<button data-save="${a.id}" title="Salvar preço/tempo">💾</button>`}${ov[a.id] ? `<button data-clr="${a.id}" title="Voltar ao padrão">↺</button>` : ''}
          </div>
          <div class="edit" style="margin-top:5px"><button data-show="${a.id}" style="flex:1">Mostrar</button><button class="p" data-exec="${a.id}" style="flex:1">Executar</button><button data-inst="${a.id}" style="flex:1">Instantâneo</button></div>
        </div>`;
      }).join('')).join('');
    }

    function flexBudget(card) { const i = card && card.querySelector('[data-f="budget"]'); if (!i || !i.value.trim()) return undefined; const v = parseMoney(i.value); return isFinite(v) ? v : undefined; }

    root.addEventListener('click', e => {
      const b = e.target.closest('button'); if (!b) return;
      const a = b.dataset.a;
      if (b.dataset.dt) { const s = state(); send('setMinutes', Math.max(0, (s.minutes || 0) + +b.dataset.dt)); return; }
      const card = b.closest('.act');
      if (b.dataset.show) { send('show', b.dataset.show, flexBudget(card)); toast('Card mostrado no jogo'); return; }
      if (b.dataset.exec || b.dataset.inst) {
        const id = b.dataset.exec || b.dataset.inst;
        send('exec', id, { budget: flexBudget(card), instant: !!b.dataset.inst }); toast('Compra executada'); return;
      }
      if (b.dataset.save) {
        const p = parseMoney(card.querySelector('[data-f="price"]').value), h = parseFloat(String(card.querySelector('[data-f="hours"]').value).replace(',', '.'));
        const ht = isFinite(h) ? h : parseTime(card.querySelector('[data-f="hours"]').value) / 60;
        const o = {}; if (isFinite(p)) o.price = p; if (isFinite(ht)) o.hours = ht;
        setOverride(b.dataset.save, o); toast('Ajuste salvo'); setTimeout(renderActions, 80); return;
      }
      if (b.dataset.clr) { clearOverride(b.dataset.clr); toast('Voltou ao padrão'); setTimeout(renderActions, 80); return; }
      switch (a) {
        case 'close': window.TRILHAO_toggleAdmin && window.TRILHAO_toggleAdmin(); break;
        case 'confirm': send('confirm', false); break;
        case 'confirmInstant': send('confirm', true); break;
        case 'cancel': send('cancel'); break;
        case 'zoomReset': send('zoomReset'); break;
        case 'advance': send('advance'); break;
        case 'type': { const t = $('#aType').value.trim(); if (t) send('search', t); break; }
        case 'money': { const v = parseMoney($('#aMoney').value); if (isFinite(v)) { send('setBalance', v); toast('Saldo: ' + fmtFull(v)); } else toast('Valor inválido'); break; }
        case 'time': { const v = parseTime($('#aTime').value); if (isFinite(v)) { send('setMinutes', v); toast('Tempo: ' + fmtRemain(v)); } else toast('Tempo inválido'); break; }
        case 'city': send('setCity', $('#aCity').value); break;
        case 'undo': send('undo'); toast('Desfeito'); break;
        case 'win': send('forceWin'); break;
        case 'lose': send('forceLose'); break;
        case 'closeOv': send('closeOverlay'); break;
        case 'reopen': send('reopenEnd'); break;
        case 'clearEnd': send('clearEnded'); break;
        case 'reset':
          if (b.dataset.armed) { send('reset'); b.textContent = 'Resetar partida'; delete b.dataset.armed; toast('Partida resetada'); }
          else { b.dataset.armed = 1; b.textContent = 'Clique de novo para confirmar o reset'; setTimeout(() => { if (b.dataset.armed) { delete b.dataset.armed; b.textContent = 'Resetar partida'; } }, 3000); }
          break;
        case 'thr': { const v = parseMoney($('#aThr').value); if (isFinite(v)) { setSetting('winThreshold', v); toast('Limite de vitória: ' + fmtShort(v)); } break; }
      }
    });
    $('#aSkip').addEventListener('change', e => setSetting('skipAnim', e.target.checked));
    $('#aMute').addEventListener('change', e => setSetting('mute', e.target.checked));
    $('#aAdv').addEventListener('change', e => setSetting('advance', e.target.value));
    $('#aHints').addEventListener('change', e => setSetting('hints', e.target.value));
    $('#aFilter').addEventListener('input', renderActions);
    $('#aType').addEventListener('keydown', e => { if (e.key === 'Enter') { const t = e.target.value.trim(); if (t) send('search', t); } });
    window.addEventListener('storage', e => { if ([LS_STATE, LS_SET].includes(e.key)) refresh(); if (e.key === LS_OVR) renderActions(); });
    refresh(); renderActions();
    const iv = setInterval(refresh, 1000);
    return { refresh, destroy() { clearInterval(iv); } };
  }

  window.TRILHAO_ADMIN = { mount };

  // modo "dentro do jogo"
  const dock = document.getElementById('adminDock');
  if (dock && window.TRILHAO) {
    let inst = null;
    window.TRILHAO_toggleAdmin = () => {
      const open = dock.classList.toggle('hidden') === false;
      if (open && !inst) inst = mount(dock, { local: true });
      if (!open && inst) { inst.destroy(); inst = null; dock.innerHTML = ''; }
      window.TRILHAO_fit && window.TRILHAO_fit();
    };
    if (/[?&]admin\b/.test(location.search)) window.TRILHAO_toggleAdmin();
  }
})();
