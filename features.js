// Блок «Возможности»: как у novaform. Карточки sticky, следующая выезжает снизу,
// а предыдущая в это время уменьшается (первая до 70%, дальше мягче) и остаётся лежать полоской.
(function () {
  if (!window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);
  const mm = gsap.matchMedia();
  mm.add('(min-width: 861px) and (prefers-reduced-motion: no-preference)', () => {
    const blocks = gsap.utils.toArray('.fblock');
    const final = [0.68, 0.74, 0.8];
    blocks.slice(0, -1).forEach((b, i) => {
      gsap.to(b.firstElementChild, {
        scale: final[i], ease: 'none', transformOrigin: '50% 0%',
        scrollTrigger: {
          trigger: blocks[i + 1],
          start: () => 'top bottom+=' + Math.round(innerHeight * 0.89), // как у novaform: начинает уменьшаться заранее
          end: () => 'top 62%',
          scrub: true, invalidateOnRefresh: true,
        },
      });
    });
    // Выезд блока: последняя карточка тоже уменьшается до 80%, пока вся стопка уезжает вверх (как у novaform)
    const last = blocks[blocks.length - 1];
    gsap.to(last.firstElementChild, {
      scale: 0.8, ease: 'none', transformOrigin: '50% 0%',
      scrollTrigger: { trigger: last, start: 'top 62%', endTrigger: '.deck', end: 'bottom top', scrub: true, invalidateOnRefresh: true },
    });
    window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
  });
})();
