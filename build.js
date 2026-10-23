// Usage: node build.js word.json outDir
// word.json: {level, word, english, pos, example, exampleEnglish, tip}
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const F = '/usr/share/fonts/opentype/inter/';
const w = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const outDir = process.argv[3] || path.join(__dirname, '..');

const css = `
@font-face{font-family:Inter;font-weight:500;src:url(file://${F}Inter-Medium.otf)}
@font-face{font-family:Inter;font-weight:600;src:url(file://${F}Inter-SemiBold.otf)}
@font-face{font-family:Inter;font-weight:700;src:url(file://${F}Inter-Bold.otf)}
@font-face{font-family:Inter;font-weight:800;src:url(file://${F}Inter-ExtraBold.otf)}
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:1080px;height:1350px;overflow:hidden}
body{font-family:Inter;background:#101A2F;color:#fff;position:relative}
.bg{position:absolute;inset:0;background:
 radial-gradient(620px 520px at 8% 22%, rgba(35,197,184,.22), transparent 70%),
 radial-gradient(700px 600px at 95% 85%, rgba(46,109,246,.28), transparent 70%),
 linear-gradient(180deg,#0E1729,#101A2F 50%,#0E1729)}
.dots{position:absolute;inset:0;background-image:radial-gradient(rgba(255,255,255,.06) 1.5px,transparent 2px);background-size:34px 34px}
.wrap{position:absolute;inset:0;padding:80px 84px;display:flex;flex-direction:column}
.top{display:flex;justify-content:space-between;align-items:center}
.lockup{display:flex;align-items:center;gap:12px}
.name{font-size:40px;font-weight:700;letter-spacing:-1px;line-height:1}
.vai{background:linear-gradient(90deg,#2E8FDE,#23C5B8 55%,#5B7CF0);-webkit-background-clip:text;color:transparent}
.count{font-size:26px;font-weight:600;color:#7F8BA3;letter-spacing:1px}
.chip{font-weight:700;font-size:24px;letter-spacing:3px;padding:10px 22px;border-radius:999px;border:2px solid rgba(35,197,184,.6);color:#5FE0D4;background:rgba(35,197,184,.1)}
.wotd{font-size:30px;font-weight:800;letter-spacing:5px;color:#E4F56C}
.head{margin-top:64px;display:flex;justify-content:space-between;align-items:center}
.cardno{text-align:center;margin-top:56px;font-size:24px;font-weight:700;letter-spacing:2px;color:#7F8BA3}
.card{margin-top:22px;height:620px;border-radius:36px;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:0 60px;
 box-shadow:0 30px 70px rgba(0,0,0,.5),0 0 0 6px rgba(255,255,255,.07);border:2px solid #E3E7EF}
.front{background:#fff}.back{background:#EDF0F7}
.lbl{font-size:28px;font-weight:700;letter-spacing:3px;color:#5B6478}
.word{margin-top:26px;font-size:${w.word.length > 14 ? 88 : 112}px;font-weight:800;letter-spacing:-3px;color:#101A2F;line-height:1.05}
.pos{margin-top:22px;font-size:30px;font-weight:600;color:#7F8BA3;font-style:italic}
.ex{margin-top:44px;padding-top:36px;border-top:2px solid #D6DCE7;width:100%}
.ex .t{font-size:36px;font-weight:700;color:#101A2F;line-height:1.3}
.ex .e{margin-top:10px;font-size:30px;font-weight:500;color:#5B6478;line-height:1.3}
.hl{color:#101A2F;background:#E4F56C;border-radius:8px;padding:0 8px}
.foot{margin-top:auto;display:flex;justify-content:space-between;align-items:center;font-size:30px;font-weight:600;color:#AEB9CE}
.btn{background:#101A2F;color:#fff;font-weight:700;font-size:26px;padding:14px 26px;border-radius:12px}
.swipe{color:#23C5B8;font-weight:700}
`;
const logo = `<div class="lockup"><svg width="58" height="51" viewBox="0 0 30 26.4"><defs><linearGradient id="g" x1="0" y1="0" x2=".6" y2="1"><stop offset="0" stop-color="#2E8FDE"/><stop offset="1" stop-color="#23C5B8"/></linearGradient></defs><path d="M1.5 6.5 L7.2 6.5 L12 17 L17.6 6.5 L22.6 6.5 L14.6 22.5 L9.6 22.5 Z" fill="url(#g)"/><circle cx="24.6" cy="3.6" r="3.1" fill="#3D74F5"/></svg><div class="name">Learn<span class="vai">Vai</span></div></div>`;
const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
const mark = (s, t) => esc(s).replace(new RegExp(`(${t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'i'), '<span class="hl">$1</span>');
const page = (n, body, foot) => `<!doctype html><html><head><meta charset="utf-8"><style>${css}</style></head><body><div class="bg"></div><div class="dots"></div>
<div class="wrap"><div class="top">${logo}<div class="count">${n} / 2</div></div>
<div class="head"><div class="wotd">WORD OF THE DAY</div><div class="chip">${esc(w.level.toUpperCase())}</div></div>
<div class="cardno">${n === 1 ? 'FRONT' : 'BACK'}</div>${body}<div class="foot">${foot}</div></div></body></html>`;

const slides = {
  '01-front.png': page(1, `<div class="card front"><div class="lbl">TRANSLATE</div><div class="word">${esc(w.word)}</div>${w.pos ? `<div class="pos">${esc(w.pos)}</div>` : ''}</div>`,
    `<span>Know it? Guess first…</span><span class="swipe">Flip →</span>`),
  '02-back.png': page(2, `<div class="card back"><div class="lbl">ENGLISH</div><div class="word">${esc(w.english)}</div>
    <div class="ex"><div class="t">${mark(w.example, w.exampleMatch || w.word.replace(/^(el|la|los|las|le|l'|les|der|die|das|un|une|ein|eine) /i, ''))}</div><div class="e">${esc(w.exampleEnglish)}</div></div></div>`,
    `<span>Practice your class's vocab at <b style="color:#fff">learnvai.com</b></span>`),
};

(async () => {
  const b = await chromium.launch();
  fs.mkdirSync(outDir, { recursive: true });
  for (const [out, html] of Object.entries(slides)) {
    const p = await b.newPage({ viewport: { width: 1080, height: 1350 } });
    await p.setContent(html, { waitUntil: 'load' });
    await p.waitForTimeout(150);
    await p.screenshot({ path: path.join(outDir, out) });
    await p.close();
    console.log(path.join(outDir, out));
  }
  await b.close();
})();
