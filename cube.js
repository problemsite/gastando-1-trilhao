// =====================================================================
//  O TRILHÃO EM 3D: R$ 1 tri em notas de R$ 100 ≈ cubo de 22,2 m.
//  1.000 blocos de R$ 1 bi (cada bloco ≈ 2,22 m de lado).
//  Bonequinho em escala real (1,75 m) + lupa circular mostrando ele.
// =====================================================================
(function () {
  const C = Math.cos(Math.PI / 6);
  const HUMAN = 1.75 / 2.22; // altura da pessoa em "blocos"
  const COL = {
    top: '#4fd699', left: '#2fb877', right: '#229964',
    rtop: '#ff8a8a', rleft: '#e5484d', rright: '#c23a40',
    edge: 'rgba(13,23,38,.16)', ghost: 'rgba(122,135,153,.35)'
  };
  // ordem de desenho (pintor): camada, profundidade, x
  const ORDER = [];
  for (let z = 0; z < 10; z++) for (let d = 0; d <= 18; d++) for (let c = 0; c < 10; c++) { const r = d - c; if (r >= 0 && r < 10) ORDER.push(z * 100 + r * 10 + c); }

  /* ------------------------- bonequinho ------------------------- */
  // pose: idle | point | wow | shrug | watch | worried | celebrate | sad
  function stick(ctx, x, y, H, pose, t, lw) {
    const sin = Math.sin, cos = Math.cos;
    let jump = 0, lean = 0, headTilt = 0, aL = 0.18, aR = 0.18, fL = 0.1, fR = 0.1, legA = 0.22, legB = 0.22, extra = null;
    const br = sin(t * 2.2) * 0.02;
    switch (pose) {
      case 'point': aR = 2.25 + sin(t * 3) * 0.06; fR = -0.1; aL = 0.2; headTilt = -0.25; break;
      case 'wow': jump = Math.abs(sin(t * 7)) * 0.18; aL = 2.7 + sin(t * 14) * 0.15; aR = 2.7 + sin(t * 14 + 1) * 0.15; fL = fR = 0.2; legA = legB = 0.3; headTilt = -0.3; break;
      case 'shrug': { const k = (sin(t * 4) + 1) / 2; aL = aR = 0.9 + k * 0.25; fL = fR = -1.6; headTilt = sin(t * 2) * 0.15; extra = 'shrug'; break; }
      case 'watch': { const look = (t % 5) < 2.4; aL = look ? 1.25 : 0.2; fL = look ? -2.3 : 0.1; headTilt = look ? 0.45 : 0; legA = 0.22 + (look ? 0 : Math.max(0, sin(t * 9)) * 0.12); break; }
      case 'worried': { const look = (t % 3) < 1.8; aL = look ? 1.25 : 0.25; fL = look ? -2.3 : 0.1; aR = 0.35 + sin(t * 6) * 0.1; headTilt = look ? 0.45 : -0.1; legA = 0.22 + Math.max(0, sin(t * 12)) * 0.15; extra = 'sweat'; break; }
      case 'celebrate': jump = Math.abs(sin(t * 6)) * 0.22; aL = 2.6 + sin(t * 12) * 0.35; aR = 2.6 + sin(t * 12 + Math.PI) * 0.35; fL = fR = 0.2; legA = legB = 0.32; extra = 'spark'; break;
      case 'sad': lean = 0.18; headTilt = 0.7; aL = aR = 0.08; legA = legB = 0.12; break;
      default: aL = 0.18 + br * 2; aR = 0.18 - br * 2; headTilt = (t % 7) > 5.6 ? -0.35 : 0; break;
    }
    const by = y - jump * H;
    const hip = { x: x, y: by - H * 0.46 };
    const neck = { x: x + sin(lean) * H * 0.3, y: by - H * 0.78 + br * H };
    const sh = { x: neck.x, y: neck.y + H * 0.04 };
    const headR = H * 0.11;
    const head = { x: neck.x + sin(lean + headTilt * 0.4) * headR * 1.2, y: neck.y - headR * 1.05 };
    ctx.save();
    ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = '#0d1726'; ctx.fillStyle = '#0d1726'; ctx.lineWidth = lw;
    const seg = (p, ang, len) => ({ x: p.x + sin(ang) * len, y: p.y + cos(ang) * len });
    // pernas
    const fL1 = seg(hip, -legA, H * 0.47), fR1 = seg(hip, legB, H * 0.47);
    ctx.beginPath(); ctx.moveTo(fL1.x, fL1.y); ctx.lineTo(hip.x, hip.y); ctx.lineTo(fR1.x, fR1.y); ctx.stroke();
    // tronco
    ctx.beginPath(); ctx.moveTo(hip.x, hip.y); ctx.lineTo(neck.x, neck.y); ctx.stroke();
    // braços (esquerdo = lado do observador à esquerda)
    const ua = H * 0.2, fa = H * 0.19;
    const eL = seg(sh, -aL, ua), hL = seg(eL, -(aL + fL), fa);
    const eR = seg(sh, aR, ua), hR = seg(eR, aR + fR, fa);
    ctx.beginPath(); ctx.moveTo(hL.x, hL.y); ctx.lineTo(eL.x, eL.y); ctx.lineTo(sh.x, sh.y); ctx.lineTo(eR.x, eR.y); ctx.lineTo(hR.x, hR.y); ctx.stroke();
    // relógio no pulso
    if (pose === 'watch' || pose === 'worried') { ctx.fillStyle = '#ffd36b'; ctx.beginPath(); ctx.arc(hL.x, hL.y, lw * 0.9, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#0d1726'; }
    // cabeça
    ctx.beginPath(); ctx.arc(head.x, head.y, headR, 0, Math.PI * 2); ctx.fill();
    if (extra === 'sweat') {
      const k = (t * 1.3) % 1;
      ctx.fillStyle = '#5cc8e8'; ctx.beginPath();
      const sx = head.x + headR * 1.5, sy = head.y - headR * 0.2 + k * headR * 2.4;
      ctx.moveTo(sx, sy - headR * 0.7); ctx.quadraticCurveTo(sx + headR * 0.5, sy, sx, sy + headR * 0.3); ctx.quadraticCurveTo(sx - headR * 0.5, sy, sx, sy - headR * 0.7); ctx.fill();
    }
    if (extra === 'shrug') {
      ctx.font = `800 ${Math.round(headR * 2)}px sans-serif`; ctx.fillStyle = '#7a8799'; ctx.textAlign = 'center';
      ctx.fillText('?', head.x + headR * 2.2, head.y - headR * 1.2 + Math.sin(t * 4) * headR * 0.3);
    }
    if (extra === 'spark') {
      ['#ffd36b', '#00b6d6', '#ff8fab'].forEach((c, i) => {
        const a = t * 3 + i * 2.1, rr = headR * (3 + Math.sin(t * 5 + i) * 0.6);
        ctx.fillStyle = c; ctx.beginPath(); ctx.arc(head.x + Math.cos(a) * rr, head.y - headR + Math.sin(a) * rr * 0.6, headR * 0.35, 0, Math.PI * 2); ctx.fill();
      });
    }
    ctx.restore();
  }

  /* --------------------------- cubo --------------------------- */
  function make(canvas, o) {
    const ctx = canvas.getContext('2d');
    const W = canvas.width, Hh = canvas.height, s = o.s;
    const ox = o.ox, oy = o.oy;
    const P = (x, y, z) => [ox + (x - y) * s * C, oy + (x + y) * s * 0.5 - z * s];
    const st = { a: 1000, redTo: 1000, lift: 0, hi: -1, pose: 'idle', poseT0: performance.now() };
    function poly(pts, fill) { ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]); ctx.closePath(); ctx.fillStyle = fill; ctx.fill(); ctx.stroke(); }
    function prism(x, y, z0, h, red, alpha) {
      const zt = z0 + h;
      ctx.globalAlpha = alpha;
      poly([P(x, y + 1, z0), P(x + 1, y + 1, z0), P(x + 1, y + 1, zt), P(x, y + 1, zt)], red ? COL.rleft : COL.left);
      poly([P(x + 1, y, z0), P(x + 1, y + 1, z0), P(x + 1, y + 1, zt), P(x + 1, y, zt)], red ? COL.rright : COL.right);
      poly([P(x, y, zt), P(x + 1, y, zt), P(x + 1, y + 1, zt), P(x, y + 1, zt)], red ? COL.rtop : COL.top);
      ctx.globalAlpha = 1;
    }
    function ghost() {
      ctx.save(); ctx.strokeStyle = COL.ghost; ctx.lineWidth = Math.max(1, s * 0.05); ctx.setLineDash([s * 0.25, s * 0.2]);
      const e = (a, b) => { const p = P(...a), q = P(...b); ctx.beginPath(); ctx.moveTo(p[0], p[1]); ctx.lineTo(q[0], q[1]); ctx.stroke(); };
      const T = 10;
      e([0, 0, T], [T, 0, T]); e([T, 0, T], [T, T, T]); e([T, T, T], [0, T, T]); e([0, T, T], [0, 0, T]);
      e([0, T, 0], [T, T, 0]); e([T, T, 0], [T, 0, 0]); e([0, T, 0], [0, T, T]); e([T, T, 0], [T, T, T]); e([T, 0, 0], [T, 0, T]);
      ctx.restore();
    }
    function draw(now) {
      ctx.clearRect(0, 0, W, Hh);
      ghost();
      ctx.lineWidth = Math.max(1, s * 0.035); ctx.strokeStyle = COL.edge;
      const a = st.a, fullA = Math.floor(a + 1e-9), redTo = Math.max(st.redTo, a);
      const exists = i => i < fullA;
      for (const i of ORDER) {
        const z = Math.floor(i / 100), j = i % 100, r = Math.floor(j / 10), c = j % 10;
        const g = Math.max(0, Math.min(1, a - i));
        const r0 = g, r1 = Math.max(0, Math.min(1, redTo - i));
        if (g <= 0 && r1 <= r0) continue;
        if (g >= 1 && r1 <= r0 && z < 9 && exists(i + 100) && r < 9 && exists(i + 10) && c < 9 && exists(i + 1)) continue;
        if (g > 0) prism(c, r, z, g, false, 1);
        if (r1 > r0) prism(c, r, z + r0 + st.lift * 1.6, r1 - r0, true, 1 - st.lift);
      }
      if (st.hi >= 0) {
        const i = st.hi, z = Math.floor(i / 100), j = i % 100, r = Math.floor(j / 10), c = j % 10;
        ctx.save(); ctx.strokeStyle = '#0d1726'; ctx.lineWidth = Math.max(2, s * 0.09);
        const pts = [P(c, r, z + 1), P(c + 1, r, z + 1), P(c + 1, r + 1, z + 1), P(c + 1, r + 1, z), P(c, r + 1, z), P(c, r + 1, z + 1)];
        ctx.beginPath(); pts.forEach((p, k) => k ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); ctx.closePath(); ctx.stroke(); ctx.restore();
      }
      // pessoa em escala real
      const t = (now - st.poseT0) / 1000;
      const hp = P(o.human[0], o.human[1], 0), hH = HUMAN * s;
      stick(ctx, hp[0], hp[1], hH, st.pose, t, Math.max(1.2, hH * 0.075));
      // lupa da pessoa
      if (o.inset) {
        const [ix, iy, R] = o.inset;
        ctx.save();
        ctx.strokeStyle = 'rgba(13,23,38,.45)'; ctx.lineWidth = Math.max(1.5, R * 0.02); ctx.setLineDash([R * 0.06, R * 0.05]);
        ctx.beginPath(); ctx.moveTo(hp[0], hp[1] - hH * 0.5); ctx.lineTo(ix + R * 0.7, iy - R * 0.2); ctx.stroke(); ctx.setLineDash([]);
        ctx.beginPath(); ctx.arc(hp[0], hp[1] - hH * 0.5, hH * 0.85, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.arc(ix, iy, R, 0, Math.PI * 2); ctx.fillStyle = '#fff'; ctx.fill();
        ctx.lineWidth = Math.max(2, R * 0.035); ctx.strokeStyle = '#0d1726'; ctx.stroke();
        ctx.clip();
        ctx.fillStyle = '#eef2f5'; ctx.fillRect(ix - R, iy + R * 0.62, R * 2, R);
        ctx.strokeStyle = '#0d1726'; ctx.lineWidth = Math.max(1.5, R * 0.02); ctx.beginPath(); ctx.moveTo(ix - R, iy + R * 0.62); ctx.lineTo(ix + R, iy + R * 0.62); ctx.stroke();
        // pedaço do cubo ao lado, na mesma escala da lupa
        const bs = R * 1.15 / HUMAN * 0.62;
        if (st.a > 0.001) { ctx.fillStyle = COL.left; ctx.fillRect(ix + R * 0.38, iy + R * 0.62 - bs, R, bs); ctx.strokeStyle = COL.edge; ctx.strokeRect(ix + R * 0.38, iy + R * 0.62 - bs, R, bs); }
        else { ctx.setLineDash([R * 0.06, R * 0.05]); ctx.strokeStyle = COL.ghost; ctx.strokeRect(ix + R * 0.38, iy + R * 0.62 - bs, R, bs); ctx.setLineDash([]); }
        stick(ctx, ix - R * 0.12, iy + R * 0.62, R * 1.15 * 0.62 * HUMAN / HUMAN, st.pose, t, Math.max(2, R * 0.05));
        ctx.restore();
        if (o.insetLabel) {
          ctx.font = `800 ${Math.round(R * 0.2)}px ` + (o.font || 'sans-serif'); ctx.fillStyle = '#0d1726'; ctx.textAlign = 'center';
          ctx.fillText(o.insetLabel, ix, iy + R + R * 0.3);
        }
      }
    }
    return {
      st, draw, canvas,
      set(a, redTo) { st.a = a; st.redTo = redTo == null ? a : redTo; },
      pose(p) { if (st.pose !== p) { st.pose = p; st.poseT0 = performance.now(); } }
    };
  }

  window.CUBE = { make, stick };
})();
