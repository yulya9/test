// Навигация шапки: активный пункт (блок на экране) выделяется цветом, остальные серые. Наведение тоже подсвечивает.
(function () {
  const bar = document.getElementById('gnav'), ph = document.querySelector('.header--ph');
  if (!bar) return;
  const nav = bar.querySelector('.nav'), links = [...nav.querySelectorAll('a')];
  const target = (a) => a.getAttribute('href').slice(1);
  let active = null;
  const place = (a) => links.forEach((l) => l.classList.toggle('is-lit', l === a));
  const syncTop = () => { if (ph && getComputedStyle(ph).visibility === 'hidden') bar.style.setProperty('--gnav-top', (ph.getBoundingClientRect().top + scrollY) + 'px'); };
  syncTop(); addEventListener('load', syncTop); addEventListener('resize', syncTop);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(syncTop);
  const secs = links.map((a) => [a, document.getElementById(target(a))]).filter((p) => p[1]);
  const pick = () => {
    const mid = innerHeight * 0.45; let cur = null;
    secs.forEach(([a, s]) => { const r = s.getBoundingClientRect(); if (r.top <= mid && r.bottom > mid) cur = a; });
    if (cur !== active) { active = cur; place(active); }
  };
  // под шапкой тёмная панель: стекло темнеет, текст светлеет
  const darks = [...document.querySelectorAll('.steps__box, .reviews__box')];
  const tone = () => { const r = bar.getBoundingClientRect(), y = r.top + r.height / 2; bar.classList.toggle('gnav--dark', darks.some((d) => { const q = d.getBoundingClientRect(); return q.top < y && q.bottom > y; })); };
  addEventListener('scroll', () => { pick(); tone(); }, { passive: true }); pick(); tone();
  if (window.gsap && window.ScrollTrigger) ScrollTrigger.addEventListener('refresh', pick);
})();
