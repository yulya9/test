// Демо «Попробуйте свой день». Главный график: круг дня на 24 часа, у каждого дела своя яркая дуга в своё время суток.
// Отметил дело, и дуга выезжает с свечением и яркой «головой»; когда закрыты все пять, круг замыкается и вспыхивают искры. Рисуется на canvas без библиотек.
(function () {
  const root = document.getElementById('demo');
  if (!root || !window.gsap) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const D = (s) => (reduce ? 0 : s);
  const $ = (s, p = root) => p.querySelector(s), $$ = (s, p = root) => [...p.querySelectorAll(s)];
  const tasks = $$('.task'), N = tasks.length;
  const els = { count: $('#dCount'), pct: $('#dPct'), say: $('#dSay') };
  // дела на круге: время суток (часы) и цвет
  const SEG = { water: [7.5, 9, '#008cff'], quiet: [10.5, 12, '#8f7be3'], walk: [13.5, 15.5, '#ff8a5c'], plan: [17.5, 19.5, '#ffbf3f'], phone: [20.5, 23, '#38c6e8'] };
  const segs = tasks.map((t) => { const s = SEG[t.dataset.t]; return { id: t.dataset.t, h0: s[0], h1: s[1], color: s[2], p: 0 }; });
  const sparks = [];

  function makeWheel(host) {
    const cv = document.createElement('canvas'); host.prepend(cv); const ctx = cv.getContext('2d');
    let W = 0, dpr = 1, vis = true, raf = 0, t0 = performance.now();
    const ang = (h) => ((h - 12) / 24) * Math.PI * 2 - Math.PI / 2;   // полдень сверху, полночь снизу
    const rgba = (hex, a) => { const n = parseInt(hex.slice(1), 16); return 'rgba(' + (n >> 16) + ',' + ((n >> 8) & 255) + ',' + (n & 255) + ',' + a + ')'; };
    const size = () => { dpr = Math.min(devicePixelRatio || 1, 2); W = host.clientWidth; cv.width = W * dpr; cv.height = W * dpr; draw(performance.now()); };
    function draw(now) {
      const w = W * dpr, c = w / 2, lw = w * 0.07, R = c - lw * 1.9, t = (now - t0) / 1000;
      ctx.clearRect(0, 0, w, w); ctx.lineCap = 'round';
      // часовые метки
      for (let h = 0; h < 24; h++) { const a = ang(h), big = h % 6 === 0, r0 = R + lw * 1.15, r1 = r0 + lw * (big ? 0.55 : 0.28); ctx.strokeStyle = big ? 'rgba(16,16,16,0.32)' : 'rgba(16,16,16,0.14)'; ctx.lineWidth = Math.max(1, w * (big ? 0.007 : 0.004)); ctx.beginPath(); ctx.moveTo(c + r0 * Math.cos(a), c + r0 * Math.sin(a)); ctx.lineTo(c + r1 * Math.cos(a), c + r1 * Math.sin(a)); ctx.stroke(); }
      // дорожка
      ctx.lineWidth = lw; ctx.strokeStyle = 'rgba(16,16,16,0.055)'; ctx.beginPath(); ctx.arc(c, c, R, 0, Math.PI * 2); ctx.stroke();
      // солнце сверху, луна снизу (внутри круга)
      ctx.save(); ctx.strokeStyle = 'rgba(255,170,60,0.9)'; ctx.fillStyle = 'rgba(255,200,90,0.9)'; ctx.lineWidth = w * 0.006; const sx = c, sy = c - R + lw * 2.4, sr = w * 0.017; ctx.beginPath(); ctx.arc(sx, sy, sr, 0, 7); ctx.fill(); for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; ctx.beginPath(); ctx.moveTo(sx + Math.cos(a) * sr * 1.6, sy + Math.sin(a) * sr * 1.6); ctx.lineTo(sx + Math.cos(a) * sr * 2.2, sy + Math.sin(a) * sr * 2.2); ctx.stroke(); } ctx.restore();
      ctx.save(); ctx.fillStyle = 'rgba(120,110,230,0.85)'; const mx = c, my = c + R - lw * 2.4, mr = w * 0.019; ctx.beginPath(); ctx.arc(mx, my, mr, 0, 7); ctx.fill(); ctx.globalCompositeOperation = 'destination-out'; ctx.beginPath(); ctx.arc(mx + mr * 0.55, my - mr * 0.3, mr * 0.85, 0, 7); ctx.fill(); ctx.restore();
      // дуги дел
      segs.forEach((s) => {
        const a0 = ang(s.h0), a1 = ang(s.h1);
        ctx.lineWidth = lw * 0.5; ctx.strokeStyle = rgba(s.color, 0.2); ctx.beginPath(); ctx.arc(c, c, R, a0, a1); ctx.stroke();   // «пустая» дуга
        if (s.p <= 0.001) return;
        const end = a0 + (a1 - a0) * s.p;
        ctx.save(); ctx.shadowColor = rgba(s.color, 0.6); ctx.shadowBlur = lw * 1.1; ctx.lineWidth = lw; ctx.strokeStyle = s.color; ctx.beginPath(); ctx.arc(c, c, R, a0, end); ctx.stroke(); ctx.restore();
        const n = 14, span = (end - a0); for (let i = 0; i < n; i++) { const q = (i + 1) / n; ctx.strokeStyle = 'rgba(255,255,255,' + (0.5 * q * q) + ')'; ctx.lineWidth = lw * (0.25 + 0.4 * q); ctx.beginPath(); ctx.arc(c, c, R, a0 + span * i / n, a0 + span * q + 0.01); ctx.stroke(); }   // яркий хвост
        const hx = c + R * Math.cos(end), hy = c + R * Math.sin(end); ctx.save(); ctx.shadowColor = rgba(s.color, 0.9); ctx.shadowBlur = lw * 1.6; ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(hx, hy, lw * 0.34, 0, 7); ctx.fill(); ctx.restore();
      });
      // бегущая точка: время идёт
      const oa = t * 0.35 - Math.PI / 2; ctx.fillStyle = 'rgba(16,16,16,0.55)'; ctx.beginPath(); ctx.arc(c + (R + lw * 1.15) * Math.cos(oa) * 0.999, c + (R + lw * 1.15) * Math.sin(oa) * 0.999, w * 0.008, 0, 7); ctx.fill();
      // искры
      for (let i = sparks.length - 1; i >= 0; i--) { const p = sparks[i]; p.life -= 0.018; if (p.life <= 0) { sparks.splice(i, 1); continue; } p.x += p.vx; p.y += p.vy; p.vy += 0.02; ctx.fillStyle = rgba(p.c, Math.min(1, p.life)); ctx.beginPath(); ctx.arc(c + p.x * w, c + p.y * w, w * 0.006 * p.life + 0.6, 0, 7); ctx.fill(); }
    }
    const loop = (now) => { raf = requestAnimationFrame(loop); if (vis && !document.hidden) draw(now); };
    new ResizeObserver(size).observe(host); size();
    new IntersectionObserver((e) => { vis = e[0].isIntersecting; }).observe(host);
    if (!reduce) raf = requestAnimationFrame(loop);
    return { draw: () => draw(performance.now()), burst: () => { for (let i = 0; i < 46; i++) { const s = segs[i % segs.length], h = s.h0 + Math.random() * (s.h1 - s.h0), a = ang(h), r = 0.31; sparks.push({ x: r * Math.cos(a), y: r * Math.sin(a), vx: Math.cos(a) * (0.002 + Math.random() * 0.004), vy: Math.sin(a) * (0.002 + Math.random() * 0.004) - 0.002, life: 1 + Math.random() * 0.6, c: s.color }); } } };
  }
  const wheel = makeWheel($('#dWheel'));
  const redraw = () => wheel.draw();

  // ---------- тексты и состояния ----------
  let count = 0, prevCount = 0;
  const sayFor = () => {
    if (count === 0) return 'Начнём с одного дела. Любого.';
    if (count === N) return 'День закрыт. Телефон лежит в стороне, можно отдыхать.';
    const next = tasks.find((t) => !t.classList.contains('is-done'));
    return 'Хорошо идёте. Дальше можно: ' + $('.task__label', next).textContent.toLowerCase() + '.';
  };
  function update() {
    count = tasks.filter((t) => t.classList.contains('is-done')).length;
    els.count.textContent = count; els.pct.textContent = Math.round(count / N * 100) + '%';
    gsap.fromTo(els.count, { y: 6, opacity: 0 }, { y: 0, opacity: 1, duration: D(0.35), ease: 'power2.out' });
    tasks.forEach((t, i) => {
      const on = t.classList.contains('is-done'), li = $('.legend li[data-t="' + t.dataset.t + '"]'); if (li) li.classList.toggle('is-on', on);
      gsap.to(segs[i], { p: on ? 1 : 0, duration: D(on ? 1.0 : 0.5), ease: on ? 'back.out(1.3)' : 'power2.in', overwrite: 'auto', onUpdate: redraw });
    });
    const text = sayFor();
    if (els.say.textContent !== text) { els.say.textContent = text; gsap.fromTo(els.say, { y: 6, opacity: 0 }, { y: 0, opacity: 1, duration: D(0.35), ease: 'power2.out' }); }
    if (count === N && prevCount < N && !reduce) setTimeout(wheel.burst, 700);
    if (window.__demoBot) { const d = count - prevCount; if (count === N) window.__demoBot.react('heart'); else if (d < 0) window.__demoBot.react('sad'); else if (count === 1) window.__demoBot.react('wave'); else if (d > 0) window.__demoBot.react('hop'); }
    prevCount = count;
  }
  tasks.forEach((t) => t.addEventListener('click', () => {
    const on = !t.classList.contains('is-done');
    t.classList.toggle('is-done', on); t.setAttribute('aria-pressed', on);
    gsap.to($('.task__tick', t), { strokeDashoffset: on ? 0 : 20, duration: D(0.25), ease: 'power2.out' });
    gsap.fromTo($('.task__box', t), { scale: on ? 0.7 : 1 }, { scale: 1, duration: D(0.5), ease: 'back.out(4)' });
    update();
  }));
  // круг «собирается» при появлении: пустые дуги проявляются по очереди
  if (window.ScrollTrigger && !reduce) { gsap.registerPlugin(ScrollTrigger); const intro = { a: 0 }; ScrollTrigger.create({ trigger: $('.dash'), start: 'top 80%', once: true, onEnter: () => segs.forEach((s, i) => { const keep = s.p; gsap.fromTo(s, { p: 0.0001 }, { p: keep, duration: 0.7, delay: i * 0.12, ease: 'power2.out', onUpdate: redraw }); }) }); }
})();
