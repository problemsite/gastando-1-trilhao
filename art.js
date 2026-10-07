// =====================================================================
//  Ilustrações das compras (desenhadas em SVG, mesmo traço do mapa)
//  window.ART.svg(cat, opts) -> string SVG 240x150
// =====================================================================
(function () {
  const K = '#0d1726';
  const S = `stroke="${K}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"`;
  const s2 = `stroke="${K}" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"`;

  // fundos: céu, chão, mar
  const sky = (c1, c2) => `<defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient></defs><rect width="240" height="150" fill="url(#g)"/>`;
  const sun = (x = 196, y = 34, r = 14, c = '#ffd36b') => `<circle cx="${x}" cy="${y}" r="${r}" fill="${c}"/>`;
  const cloud = (x, y, k = 1) => `<g transform="translate(${x} ${y}) scale(${k})" fill="#fff" opacity=".95"><ellipse cx="0" cy="0" rx="16" ry="8"/><ellipse cx="12" cy="-5" rx="11" ry="9"/><ellipse cx="24" cy="1" rx="13" ry="7"/></g>`;
  const ground = (c = '#cdeedb', y = 118) => `<rect y="${y}" width="240" height="${150 - y}" fill="${c}"/><path d="M0 ${y}H240" ${S}/>`;
  const sea = (y = 110, c = '#bfe9f5') => `<rect y="${y}" width="240" height="${150 - y}" fill="${c}"/><path d="M0 ${y} q10 -4 20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0" fill="none" ${s2}/>`;
  const palm = (x, y, k = 1) => `<g transform="translate(${x} ${y}) scale(${k})"><path d="M0 0 q4 -22 -2 -42" fill="none" ${S}/><path d="M-2 -42 q-16 -6 -26 4 q12 -12 26 -4 q-6 -16 -20 -18 q16 2 20 18 q6 -16 22 -16 q-14 4 -22 16 q16 -2 26 8 q-12 -8 -26 -8z" fill="#7fd39f" ${s2}/></g>`;
  const wheel = (x, y, r = 13) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${K}"/><circle cx="${x}" cy="${y}" r="${r * .42}" fill="#e6ebf0"/>`;
  const win = (x, y, w = 10, h = 12, c = '#cfefff') => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="1.5" fill="${c}" ${s2}/>`;

  const A = {};
  A.car = sky('#e9f7fc', '#fdf6ec') + sun() + cloud(40, 34) + ground('#e5e9ee', 116) +
    `<path d="M34 104 L58 84 Q88 72 128 71 L156 72 Q184 78 202 94 L208 104 Q209 112 200 113 L42 113 Q32 112 34 104Z" fill="#ff6b6b" ${S}/>
     <path d="M76 85 Q98 75 126 74 L148 75 L162 88 L80 90Z" fill="#cfefff" ${s2}/><path d="M124 74 L122 89" ${s2}/>
     <path d="M190 96 h12" ${s2}/>` + wheel(76, 113) + wheel(172, 113);
  A.house = sky('#e9f7fc', '#fff8ee') + sun(204, 30) + ground('#cdeedb', 120) + palm(28, 120, .9) +
    `<rect x="62" y="64" width="124" height="56" fill="#fff6e6" ${S}/><path d="M52 66 L124 28 L196 66Z" fill="#ffb4a2" ${S}/>
     ${win(76, 78, 16, 14)}${win(152, 78, 16, 14)}${win(76, 98, 16, 14)}${win(152, 98, 16, 14)}
     <rect x="112" y="88" width="24" height="32" rx="2" fill="#9ad7e8" ${S}/><circle cx="131" cy="104" r="2" fill="${K}"/>
     <rect x="186" y="96" width="34" height="24" fill="#bfe9f5" ${s2}/><path d="M190 106 q4 -3 8 0 t8 0 t8 0" fill="none" ${s2}/>`;
  A.watch = sky('#f1f6ff', '#fef4ea') +
    `<rect x="102" y="10" width="36" height="34" rx="6" fill="#c7a46b" ${S}/><rect x="102" y="106" width="36" height="34" rx="6" fill="#c7a46b" ${S}/>
     <circle cx="120" cy="75" r="40" fill="#f2d48f" ${S}/><circle cx="120" cy="75" r="31" fill="#fff" ${S}/>
     <path d="M120 75 V54 M120 75 L136 82" ${S}/><circle cx="120" cy="75" r="3" fill="${K}"/><rect x="159" y="70" width="8" height="10" rx="2" fill="#f2d48f" ${s2}/>
     <path d="M120 48v4M120 98v4M93 75h4M143 75h4" ${s2}/>`;
  A.jet = sky('#d9f2fb', '#f3fbff') + cloud(30, 110, 1.2) + cloud(170, 40) + cloud(60, 36, .8) +
    `<path d="M30 86 Q40 74 70 72 L176 70 Q206 72 214 82 Q206 92 176 92 L70 94 Q40 96 30 86Z" fill="#fff" ${S}/>
     <path d="M54 74 L42 50 L58 50 L80 72Z" fill="#7fd4e6" ${S}/><path d="M110 92 L92 116 L112 116 L140 92Z" fill="#e6ebf0" ${S}/>
     <path d="M190 74 Q204 76 210 82 L192 82Z" fill="#cfefff" ${s2}/>
     ${[96, 112, 128, 144, 160].map(x => `<circle cx="${x}" cy="80" r="3.5" fill="#cfefff" ${s2}/>`).join('')}
     <path d="M70 87 H180" stroke="#00b6d6" stroke-width="4"/>`;
  A.heli = sky('#dff4fb', '#f6fcff') + cloud(36, 40) + cloud(176, 110, .9) +
    `<path d="M40 42 H200" ${S}/><path d="M120 42 V54" ${S}/>
     <path d="M64 86 Q66 58 104 56 L132 56 Q158 58 160 84 Q158 100 132 100 L88 100 Q64 100 64 86Z" fill="#ffd36b" ${S}/>
     <path d="M108 60 L134 60 Q152 62 154 80 L108 80Z" fill="#cfefff" ${s2}/>
     <path d="M160 78 L210 72 L214 62 L222 62 L218 82 L160 90" fill="#ffd36b" ${S}/>
     <path d="M78 100 L74 114 M142 100 L146 114 M60 114 H162" ${S}/>`;
  A.farm = sky('#e6f6fc', '#fff6e2') + sun(40, 34, 15) +
    `<rect y="100" width="240" height="50" fill="#f3dc8c"/>${[108, 118, 128, 138, 148].map(y => `<path d="M0 ${y} H240" stroke="#d9b75c" stroke-width="2"/>`).join('')}<path d="M0 100H240" ${S}/>
     <rect x="120" y="58" width="74" height="46" fill="#e2574c" ${S}/><path d="M112 60 L157 30 L202 60Z" fill="#c9433a" ${S}/>
     <rect x="146" y="76" width="22" height="28" fill="#fff" ${S}/><path d="M146 76 L168 104 M168 76 L146 104" ${s2}/>
     <rect x="200" y="46" width="18" height="58" rx="9" fill="#e6ebf0" ${S}/>
     <path d="M60 104 q0 -14 8 -20 M72 104 q0 -16 -6 -24" fill="none" stroke="#3e9a5f" stroke-width="3"/>`;
  A.island = sky('#d8f3fb', '#eefbff') + sun(200, 32) + cloud(40, 30) + sea(102, '#9fe0f0') +
    `<path d="M50 112 Q120 76 190 112Z" fill="#f6dc9a" ${S}/>` + palm(116, 102, 1.05) + palm(146, 106, .75) +
    `<path d="M196 126 l10 -8 l10 8z" fill="#fff" ${s2}/>`;
  A.yacht = sky('#dcf4fb', '#f3fbff') + sun(42, 32) + sea(104, '#a8e3f2') +
    `<path d="M26 100 L206 100 L190 120 L50 120Z" fill="#fff" ${S}/><path d="M50 112 H192" stroke="#00b6d6" stroke-width="4"/>
     <path d="M56 100 L70 80 L170 80 L184 100Z" fill="#fff" ${S}/>${[82, 100, 118, 136, 154].map(x => `<rect x="${x}" y="86" width="12" height="7" rx="2" fill="#7fd4e6" ${s2}/>`).join('')}
     <path d="M84 80 L96 64 L150 64 L158 80Z" fill="#fff" ${S}/><path d="M118 64 V46 M112 52 h12" ${S}/>`;
  A.ship = sky('#ddf3fb', '#f4fbff') + cloud(180, 36) + sea(108, '#a8e3f2') +
    `<path d="M20 104 L222 104 L208 124 L34 124Z" fill="#2c4a6b" ${S}/><path d="M28 112 H214" stroke="#e2574c" stroke-width="5"/>
     ${[['#e2574c', 40], ['#ffd36b', 64], ['#00b6d6', 88], ['#7fd39f', 112], ['#ff9f6b', 136], ['#b39ddb', 160]].map(([c, x], i) => `<rect x="${x}" y="${84 - (i % 2) * 18}" width="22" height="${20 + (i % 2) * 18}" fill="${c}" ${s2}/>`).join('')}
     <rect x="186" y="62" width="24" height="42" fill="#fff" ${S}/><rect x="190" y="68" width="16" height="6" fill="#7fd4e6"/>`;
  A.building = sky('#e3f4fb', '#fdf8f0') + cloud(26, 30) + ground('#e5e9ee', 128) +
    `<rect x="40" y="58" width="44" height="70" fill="#cfe8f5" ${S}/><rect x="96" y="18" width="50" height="110" fill="#9ad7e8" ${S}/><rect x="158" y="44" width="44" height="84" fill="#dcd2f4" ${S}/>
     ${[30, 44, 58, 72, 86, 100].map(y => `<path d="M104 ${y} h34" stroke="#fff" stroke-width="4"/>`).join('')}
     ${[66, 80, 94, 108].map(y => `<path d="M48 ${y} h28 M166 ${y - 8} h28" stroke="#fff" stroke-width="4"/>`).join('')}<path d="M121 18 V6" ${S}/>`;
  A.art = sky('#fbf3ea', '#f6efe6') + `<rect y="120" width="240" height="30" fill="#e9dccb"/><path d="M0 120H240" ${S}/>
     <path d="M84 132 L104 52 M156 132 L136 52 M120 132 V48" ${S}/>
     <rect x="62" y="22" width="116" height="84" fill="#fff" stroke="#b07a3c" stroke-width="7"/>
     <rect x="70" y="30" width="100" height="68" fill="#bfe9f5"/><circle cx="150" cy="46" r="9" fill="#ffd36b"/>
     <path d="M70 98 L100 62 L120 84 L136 70 L170 98Z" fill="#7fd39f" ${s2}/><rect x="62" y="22" width="116" height="84" fill="none" ${S}/>`;
  A.trophy = sky('#e2f5fb', '#f6fcff') + cloud(200, 30, .8) +
    `<ellipse cx="120" cy="96" rx="104" ry="40" fill="#e6ebf0" ${S}/><ellipse cx="120" cy="92" rx="84" ry="28" fill="#cfd8e1" ${s2}/>
     <ellipse cx="120" cy="96" rx="64" ry="18" fill="#7fd39f" ${S}/><path d="M120 78 V114 M56 96 H184" stroke="#fff" stroke-width="2.5"/><ellipse cx="120" cy="96" rx="9" ry="4" fill="none" stroke="#fff" stroke-width="2.5"/>
     <path d="M30 70 V40 M210 70 V40" ${S}/><rect x="22" y="30" width="16" height="10" fill="#ffd36b" ${s2}/><rect x="202" y="30" width="16" height="10" fill="#ffd36b" ${s2}/>`;
  A.hotel = sky('#e6f5fb', '#fff8ef') + sun(30, 30, 12) + ground('#e5e9ee', 130) + palm(214, 130, .8) +
    `<rect x="56" y="30" width="128" height="100" fill="#fff6e6" ${S}/>
     ${[42, 60, 78, 96].map(y => [68, 92, 116, 140, 164].map(x => `<rect x="${x}" y="${y}" width="10" height="10" rx="1.5" fill="#9ad7e8" ${s2}/>`).join('')).join('')}
     <rect x="80" y="14" width="80" height="18" rx="4" fill="#00b6d6" ${S}/><text x="120" y="28" text-anchor="middle" font-family="Arial" font-weight="900" font-size="12" fill="#fff">HOTEL</text>${[0,1,2,3,4].map(i => `<circle cx="${92 + i * 14}" cy="40" r="0" />`).join('')}
     <rect x="104" y="112" width="32" height="18" fill="#ffb4a2" ${S}/>`;
  A.casino = sky('#2a1e4a', '#3d2a66') + `${[30, 70, 110, 150, 190, 220].map((x, i) => `<circle cx="${x}" cy="${18 + (i % 3) * 8}" r="2" fill="#ffd36b"/>`).join('')}
     <rect x="64" y="22" width="112" height="112" rx="16" fill="#e2574c" ${S}/><rect x="78" y="44" width="84" height="44" rx="6" fill="#fff" ${S}/>
     <path d="M106 44 V88 M134 44 V88" ${s2}/>${[92, 120, 148].map(x => `<text x="${x}" y="76" text-anchor="middle" font-family="Arial" font-weight="900" font-size="24" fill="#e2574c">7</text>`).join('')}
     <path d="M176 60 h14 v-22" ${S}/><circle cx="190" cy="34" r="7" fill="#ffd36b" ${S}/><rect x="90" y="100" width="60" height="16" rx="4" fill="#ffd36b" ${S}/>`;
  A.company = sky('#e7f4fb', '#f9fbfd') + cloud(196, 34, .9) + ground('#e5e9ee', 128) +
    `<rect x="34" y="70" width="96" height="58" fill="#e6ebf0" ${S}/><path d="M34 70 L58 54 V70 L82 54 V70 L106 54 V70" fill="#cfd8e1" ${S}/>
     <rect x="112" y="30" width="12" height="40" fill="#cfd8e1" ${S}/><path d="M118 26 q-6 -8 2 -14 q8 -6 4 -12" fill="none" stroke="#a7b3c0" stroke-width="3"/>
     ${[46, 70, 94].map(x => `<rect x="${x}" y="88" width="16" height="12" fill="#9ad7e8" ${s2}/>`).join('')}
     <rect x="142" y="36" width="64" height="92" fill="#9ad7e8" ${S}/>${[48, 62, 76, 90, 104].map(y => `<path d="M150 ${y} h48" stroke="#fff" stroke-width="4"/>`).join('')}
     <rect x="156" y="20" width="36" height="16" rx="3" fill="#ffd36b" ${S}/><text x="174" y="32" text-anchor="middle" font-family="Arial" font-weight="900" font-size="10" fill="${K}">SEU</text>`;
  A.city = sky('#fff1d9', '#fde6c2') + sun(204, 30, 16, '#ffbf5a') + `<rect y="116" width="240" height="34" fill="#f2cf8e"/><path d="M0 116H240" ${S}/>
     ${[[30, 70], [62, 44], [96, 84], [128, 58], [162, 76]].map(([x, h]) => `<rect x="${x}" y="${116 - h}" width="26" height="${h}" fill="#fff" ${S}/><path d="M${x + 6} ${126 - h} h14 M${x + 6} ${138 - h} h14" stroke="#9ad7e8" stroke-width="3"/>`).join('')}
     <path d="M200 116 V20 M190 26 H232 M200 26 L214 20 L226 26" ${S}/><path d="M228 26 V52" ${s2}/><rect x="222" y="52" width="12" height="9" fill="#ffd36b" ${s2}/>`;
  A.park = sky('#e3f6fc', '#fff6f0') + cloud(30, 30) + ground('#cdeedb', 124) +
    `<circle cx="78" cy="70" r="44" fill="none" ${S}/>${Array.from({ length: 8 }, (_, i) => { const a = i * Math.PI / 4; const x = 78 + Math.cos(a) * 44, y = 70 + Math.sin(a) * 44; return `<path d="M78 70 L${x.toFixed(1)} ${y.toFixed(1)}" ${s2}/><rect x="${(x - 7).toFixed(1)}" y="${(y - 4).toFixed(1)}" width="14" height="10" rx="3" fill="${['#ff6b6b', '#ffd36b', '#00b6d6', '#7fd39f'][i % 4]}" ${s2}/>`; }).join('')}
     <path d="M58 124 L78 70 L98 124" fill="none" ${S}/>
     <path d="M128 124 Q140 40 162 70 T204 50 Q220 46 228 124" fill="none" stroke="#ff6b6b" stroke-width="5"/><path d="M128 124 Q140 40 162 70 T204 50 Q220 46 228 124" fill="none" ${s2}/>
     ${[146, 166, 186, 206].map(x => `<path d="M${x} 124 V${x === 146 ? 70 : x === 166 ? 74 : x === 186 ? 60 : 54}" ${s2}/>`).join('')}`;
  A.train = sky('#e3f5fc', '#f8fcff') + cloud(180, 32) + `<rect y="110" width="240" height="40" fill="#e5e9ee"/><path d="M0 120 H240 M0 128 H240" ${s2}/>${[10, 40, 70, 100, 130, 160, 190, 220].map(x => `<path d="M${x} 120 v8" ${s2}/>`).join('')}
     <path d="M10 70 H170 Q218 72 230 104 Q232 112 222 112 H10Z" fill="#fff" ${S}/><path d="M10 96 H226" stroke="#00b6d6" stroke-width="5"/>
     <path d="M176 76 Q206 80 218 98 L186 98Z" fill="#9ad7e8" ${s2}/>${[24, 56, 88, 120, 150].map(x => `<rect x="${x}" y="78" width="22" height="10" rx="3" fill="#9ad7e8" ${s2}/>`).join('')}`;
  A.plane = sky('#d6f1fb', '#f2fbff') + cloud(40, 112, 1.2) + cloud(190, 36) +
    `<path d="M20 82 Q24 70 60 68 L196 66 Q222 68 228 80 Q222 92 196 92 L60 94 Q26 94 20 82Z" fill="#fff" ${S}/>
     <path d="M36 70 L22 38 L42 38 L72 68Z" fill="#00b6d6" ${S}/><path d="M104 90 L80 126 L106 126 L148 90Z" fill="#e6ebf0" ${S}/>
     <path d="M100 70 L84 50 L104 50 L130 68Z" fill="#e6ebf0" ${s2}/>
     ${[70, 84, 98, 112, 126, 140, 154, 168, 182].map(x => `<circle cx="${x}" cy="78" r="3" fill="#9ad7e8" ${s2}/>`).join('')}
     <path d="M206 72 Q220 74 224 80 L208 80Z" fill="#9ad7e8" ${s2}/>`;
  A.film = sky('#1f2a3e', '#2c3a55') + `<circle cx="40" cy="30" r="2" fill="#fff"/><circle cx="200" cy="24" r="2" fill="#fff"/><circle cx="170" cy="50" r="1.5" fill="#fff"/>
     <rect x="58" y="62" width="124" height="70" rx="6" fill="#fff" ${S}/><path d="M58 84 H182" ${S}/>
     <path d="M58 62 L64 30 L190 44 L184 70" fill="#fff" ${S}/>${[0, 1, 2, 3, 4].map(i => `<path d="M${76 + i * 24} ${34 + i * 2.2} l-10 ${28 + 0} " stroke="${K}" stroke-width="9"/>`).join('')}
     <path d="M74 100 h40 M74 114 h70" stroke="#a7b3c0" stroke-width="5" stroke-linecap="round"/>`;
  A.bag = sky('#fff0f3', '#fdf6f0') + `<rect y="124" width="240" height="26" fill="#f2e3e6"/><path d="M0 124H240" ${S}/>
     <path d="M90 56 Q90 22 120 22 Q150 22 150 56" fill="none" ${S}/>
     <path d="M62 56 H178 L190 124 H50Z" fill="#c78a5a" ${S}/><path d="M62 56 H178 L174 76 H66Z" fill="#a8693f" ${S}/>
     <rect x="110" y="70" width="20" height="14" rx="3" fill="#ffd36b" ${s2}/><path d="M60 100 H180" stroke="#a8693f" stroke-width="3" stroke-dasharray="4 4"/>`;
  A.castle = sky('#e8f4fb', '#fdf6ec') + sun(204, 28, 12) + ground('#cdeedb', 124) +
    `<rect x="44" y="50" width="30" height="74" fill="#efe6d8" ${S}/><rect x="166" y="50" width="30" height="74" fill="#efe6d8" ${S}/>
     <path d="M40 52 L59 22 L78 52Z M162 52 L181 22 L200 52Z" fill="#7aa7e0" ${S}/>
     <rect x="74" y="66" width="92" height="58" fill="#efe6d8" ${S}/><path d="M74 66 v-10 h12 v10 h12 v-10 h12 v10 h12 v-10 h12 v10 h12 v-10 h12 v10" fill="none" ${S}/>
     <path d="M106 124 V102 Q120 88 134 102 V124" fill="#a8693f" ${S}/>${win(54, 66, 10, 14)}${win(176, 66, 10, 14)}
     <path d="M20 124 q0 -18 10 -22 q10 4 10 22" fill="#7fd39f" ${s2}/><path d="M206 124 q0 -14 8 -18 q8 4 8 18" fill="#7fd39f" ${s2}/>`;
  A.game = sky('#ece6ff', '#f6f2ff') + `<path d="M48 64 Q52 40 84 42 H156 Q188 40 192 64 L204 112 Q206 128 188 126 Q176 124 166 104 H74 Q64 124 52 126 Q34 128 36 112Z" fill="#fff" ${S}/>
     <path d="M80 66 v24 M68 78 h24" stroke="${K}" stroke-width="7" stroke-linecap="round"/>
     <circle cx="160" cy="68" r="7" fill="#ff6b6b" ${s2}/><circle cx="176" cy="82" r="7" fill="#00b6d6" ${s2}/><circle cx="144" cy="82" r="7" fill="#ffd36b" ${s2}/><circle cx="160" cy="96" r="7" fill="#7fd39f" ${s2}/>
     <rect x="108" y="74" width="10" height="5" rx="2" fill="${K}"/><rect x="122" y="74" width="10" height="5" rx="2" fill="${K}"/>`;
  A.cart = sky('#e9f7fc', '#fdf7ef') + ground('#e5e9ee', 126) +
    `<path d="M30 40 H54 L74 104 H188 L204 56 H62" fill="none" ${S}/>
     <rect x="80" y="40" width="26" height="22" fill="#ffd36b" ${s2}/><rect x="110" y="34" width="20" height="28" fill="#ff6b6b" ${s2}/><rect x="134" y="44" width="30" height="18" fill="#7fd39f" ${s2}/><circle cx="178" cy="50" r="10" fill="#ffb26b" ${s2}/>
     <path d="M66 62 H202 M70 80 H196" ${s2}/>` + wheel(88, 118, 9) + wheel(176, 118, 9);
  A.bag2 = A.bag;

  // faixa de "obra" por cima de qualquer arte
  const OBRA = `<g><rect x="0" y="128" width="240" height="22" fill="#ffd36b"/><path d="M0 128H240" ${s2}/>${Array.from({ length: 14 }, (_, i) => `<path d="M${i * 20 - 6} 150 L${i * 20 + 8} 128" stroke="${K}" stroke-width="6"/>`).join('')}<rect x="72" y="131" width="96" height="16" rx="4" fill="#fff" ${s2}/><text x="120" y="143" text-anchor="middle" font-family="Arial" font-weight="900" font-size="11" fill="${K}">EM OBRA</text></g>`;

  let n = 0;
  window.ART = {
    has: c => !!A[c],
    svg(cat, opts = {}) {
      const body = A[cat] || A.company;
      const id = 'a' + (++n);
      return `<svg viewBox="0 0 240 150" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">${body.replace(/id="g"/g, `id="${id}"`).replace(/url\(#g\)/g, `url(#${id})`)}${opts.obra ? OBRA : ''}</svg>`;
    }
  };
})();
