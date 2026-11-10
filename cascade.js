// Ховер «Letter Cascade» (идея Componentry): буквы по очереди переворачиваются, как табло, с 3D-перспективой, лёгким размытием и пружиной.
// Уважает «уменьшить движение». Применяется к пунктам меню, кнопкам и ссылкам подвала.
(function () {
  if (!window.gsap || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const SEL = ['#gnav .nav a', '#gnav .nav-button > span:first-child', '.hero__button > span:first-child', '.mosaic__button > span:first-child', '.footer__col a', '.dash__reset'];
  const FROM = { '.mosaic__button > span:first-child': 'center', '.hero__button > span:first-child': 'center', '#gnav .nav-button > span:first-child': 'center' };
  SEL.forEach((sel) => document.querySelectorAll(sel).forEach((el) => {
    const text = el.textContent.trim(); if (!text) return;
    const from = FROM[sel] || 'start';
    el.setAttribute('aria-label', text);
    el.textContent = '';
    const letters = [...text].map((ch) => {
      const w = document.createElement('span'); w.className = 'lc'; w.setAttribute('aria-hidden', 'true');
      const a = document.createElement('span'); a.className = 'lc__a'; a.textContent = ch === ' ' ? ' ' : ch;
      const b = document.createElement('span'); b.className = 'lc__b'; b.textContent = a.textContent;
      w.append(a, b); el.appendChild(w); return { a, b };
    });
    el.classList.add('lc-host');
    let tl = null;
    const play = () => {
      if (tl && tl.isActive()) return;
      const n = letters.length, mid = (n - 1) / 2;
      tl = gsap.timeline({ onComplete: () => letters.forEach(({ a, b }) => { gsap.set(a, { clearProps: 'all' }); gsap.set(b, { opacity: 0 }); }) });
      letters.forEach(({ a, b }, i) => {
        const at = (from === 'center' ? Math.abs(i - mid) : i) * 0.04;
        tl.fromTo(a, { rotationX: 0, yPercent: 0, opacity: 1, filter: 'blur(0px)' }, { rotationX: -85, yPercent: -40, opacity: 0, filter: 'blur(2px)', duration: 0.28, ease: 'power2.in', transformOrigin: '50% 100%' }, at);
        tl.fromTo(b, { rotationX: 85, yPercent: 45, opacity: 0, filter: 'blur(2px)' }, { rotationX: 0, yPercent: 0, opacity: 1, filter: 'blur(0px)', duration: 0.6, ease: 'back.out(2.4)', transformOrigin: '50% 0%' }, at + 0.12);
      });
    };
    el.addEventListener('mouseenter', play);
    el.addEventListener('focus', play);
  }));
})();
