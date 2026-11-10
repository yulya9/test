// «Три шага»: россыпь маленьких предметов. Дрейфуют сами, отскакивают от стен и друг от друга,
// мышь их гоняет: отталкивает и передаёт им скорость курсора. Простая физика, без библиотек.
(function () {
  const box = document.querySelector('.steps__box'), field = document.getElementById('stepsField');
  if (!box || !field || innerWidth <= 860 || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const SRC = ['drop', 'moon', 'hourglass', 'leaf', 'tea', 'lotus', 'sun'], COUNT = 26;
  let W = 0, H = 0, k = 1, vis = false, mx = -9999, my = -9999, pvx = 0, pvy = 0, lx = 0, ly = 0, lt = 0;
  const ps = [];
  function measure() { const r = box.getBoundingClientRect(); W = r.width; H = r.height; k = innerWidth / 1440; ps.forEach((p) => { p.r = p.s * k * 0.5; }); }
  for (let i = 0; i < COUNT; i++) {
    const img = new Image(); img.src = 'assets/o_' + SRC[i % SRC.length] + '.png'; img.alt = ''; img.className = 'steps__obj'; img.draggable = false;
    const s = 44 + Math.random() * 56;                       // размер 44–100 (в k)
    img.style.width = img.style.height = s + 'px'; field.appendChild(img);
    ps.push({ el: img, s, r: s / 2, x: Math.random(), y: Math.random(), vx: (Math.random() - 0.5) * 1.2, vy: (Math.random() - 0.5) * 1.2, a: Math.random() * 360, va: (Math.random() - 0.5) * 0.8, ph: Math.random() * 6.28 });
  }
  measure(); ps.forEach((p) => { p.x = p.r + p.x * (W - 2 * p.r); p.y = p.r + p.y * (H - 2 * p.r); p.el.style.width = p.el.style.height = p.s * k + 'px'; });
  addEventListener('resize', () => { measure(); ps.forEach((p) => { p.el.style.width = p.el.style.height = p.s * k + 'px'; p.x = Math.min(Math.max(p.x, p.r), W - p.r); p.y = Math.min(Math.max(p.y, p.r), H - p.r); }); });
  new IntersectionObserver((e) => { vis = e[0].isIntersecting; if (vis) measure(); }, { rootMargin: '80px' }).observe(box);
  box.addEventListener('pointermove', (e) => {
    const r = box.getBoundingClientRect(), now = performance.now(), x = e.clientX - r.left, y = e.clientY - r.top;
    if (lt) { const dt = Math.max(8, now - lt); pvx = (x - lx) / dt * 16; pvy = (y - ly) / dt * 16; }
    lx = mx = x; ly = my = y; lt = now;
  });
  box.addEventListener('pointerleave', () => { mx = my = -9999; lt = 0; pvx = pvy = 0; });
  let t0 = performance.now();
  function frame(now) {
    requestAnimationFrame(frame);
    if (!vis || document.hidden) return;
    const dt = Math.min(2, (now - t0) / 16.67); t0 = now; const t = now / 1000;
    const R = 150 * k;
    pvx *= 0.9; pvy *= 0.9;
    for (let i = 0; i < ps.length; i++) {
      const p = ps[i];
      // собственный дрейф: медленный «ветер», чтобы никогда не замирали
      p.vx += Math.sin(t * 0.6 + p.ph) * 0.012 * dt; p.vy += Math.cos(t * 0.5 + p.ph * 1.7) * 0.012 * dt;
      // курсор
      const dx = p.x - mx, dy = p.y - my, d = Math.hypot(dx, dy), rr = R + p.r;
      if (d < rr && d > 0.01) { const f = (1 - d / rr); p.vx += (dx / d) * f * 2.2 * dt + pvx * f * 0.35; p.vy += (dy / d) * f * 2.2 * dt + pvy * f * 0.35; p.va += (dx / d) * f * 0.8; }
      // столкновения друг с другом
      for (let j = i + 1; j < ps.length; j++) {
        const q = ps[j], ex = q.x - p.x, ey = q.y - p.y, ed = Math.hypot(ex, ey), md = (p.r + q.r) * 0.8;
        if (ed < md && ed > 0.01) { const nx = ex / ed, ny = ey / ed, push = (md - ed) * 0.06; p.vx -= nx * push; p.vy -= ny * push; q.vx += nx * push; q.vy += ny * push; }
      }
      // скорость: трение + минимальный ход
      p.vx *= Math.pow(0.992, dt); p.vy *= Math.pow(0.992, dt); p.va *= Math.pow(0.99, dt);
      const sp = Math.hypot(p.vx, p.vy); if (sp < 0.25) { p.vx += (p.vx / (sp || 1)) * 0.01; p.vy += (p.vy / (sp || 1)) * 0.01; }
      if (sp > 14) { p.vx *= 14 / sp; p.vy *= 14 / sp; }
      p.x += p.vx * dt * k; p.y += p.vy * dt * k; p.a += (p.va + p.vx * 0.4) * dt;
      // стены
      if (p.x < p.r) { p.x = p.r; p.vx = Math.abs(p.vx) * 0.85; } else if (p.x > W - p.r) { p.x = W - p.r; p.vx = -Math.abs(p.vx) * 0.85; }
      if (p.y < p.r) { p.y = p.r; p.vy = Math.abs(p.vy) * 0.85; } else if (p.y > H - p.r) { p.y = H - p.r; p.vy = -Math.abs(p.vy) * 0.85; }
      p.el.style.transform = 'translate3d(' + (p.x - p.r).toFixed(1) + 'px,' + (p.y - p.r).toFixed(1) + 'px,0) rotate(' + p.a.toFixed(1) + 'deg)';
    }
  }
  requestAnimationFrame(frame);
})();
