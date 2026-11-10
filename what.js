// Блок «О продукте»: картинки мозаики переворачиваются по очереди, когда блок выезжает на экран.
(function () {
  if (!window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);
  const mm = gsap.matchMedia();
  mm.add('(prefers-reduced-motion: no-preference)', () => {
    const imgs = gsap.utils.toArray('.mosaic__img');
    gsap.set(imgs, { rotationY: 90, transformPerspective: 700, opacity: 0 });
    ScrollTrigger.create({ trigger: '.mosaic', start: 'top 85%', once: true, onEnter: () => gsap.to(imgs, { rotationY: 0, opacity: 1, duration: 1.1, ease: 'power3.out', stagger: { each: 0.12, from: 'random' } }) });
    // Абзац: буквы проявляются по очереди от прозрачности 0.5 до 1, пока вы листаете (как у novaform)
    const para = document.querySelector('.manifesto__text');
    if (para) {
      const txt = para.textContent;
      para.setAttribute('aria-label', txt);
      para.textContent = '';
      const letters = [];
      txt.split(' ').forEach((w, i, all) => {
        const word = document.createElement('span');
        word.style.whiteSpace = 'nowrap';
        w.split('').forEach((ch) => { const s = document.createElement('span'); s.textContent = ch; s.setAttribute('aria-hidden', 'true'); word.appendChild(s); letters.push(s); });
        para.appendChild(word);
        if (i < all.length - 1) para.appendChild(document.createTextNode(' '));
      });
      gsap.set(letters, { opacity: 0.5 });
      gsap.to(letters, { opacity: 1, duration: 0.02, ease: 'none', stagger: { amount: 1 }, scrollTrigger: { trigger: para, start: 'top 72%', end: 'top 22%', scrub: true } });
    }
    return () => gsap.set(imgs, { clearProps: 'all' });
  });
})();
