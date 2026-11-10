// Первый экран: при прокрутке картинка в центре расширяется до размера всей рамки, тексты белеют.
(function () {
  if (!window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);
  const mm = gsap.matchMedia();
  mm.add('(min-width: 861px) and (prefers-reduced-motion: no-preference)', () => {
    const wrap = document.getElementById('hero-wrap'), hero = document.getElementById('hero'), box = hero.querySelector('.hero__box'), slot = hero.querySelector('.hero__img'),
      card = hero.querySelector('.hero__card'), tint = hero.querySelector('.hero__tint'),
      texts = hero.querySelectorAll('.hero__title, .hero__stat, .hero__text');
    let lenis = null;
    if (window.Lenis) {
      lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 0.9 });
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add((t) => lenis.raf(t * 1000));
      gsap.ticker.lagSmoothing(0);
    }
    const slotRect = () => { const b = box.getBoundingClientRect(), r = slot.getBoundingClientRect(); return { x: r.left - b.left, y: r.top - b.top, w: r.width, h: r.height }; };
    const radius = (el) => parseFloat(getComputedStyle(el).borderTopLeftRadius) || 0;
    // подменяем картинку карточкой только когда её картинка уже загружена и декодирована: до этого видна обычная
    const cardImg = card.querySelector('img');
    let swapped = false;
    const swap = () => {
      if (swapped) return; swapped = true;
      const r = slotRect();   // карточка встаёт ровно на место картинки до того, как картинка скрыта
      gsap.set(card, { left: r.x, top: r.y, width: r.w, height: r.h, borderRadius: radius(slot), opacity: 1 });
      slot.style.visibility = 'hidden';
      ScrollTrigger.refresh();
    };
    Promise.race([cardImg.decode ? cardImg.decode() : Promise.resolve(), new Promise((res) => setTimeout(res, 1500))]).then(swap, swap);
    const tl = gsap.timeline({ defaults: { ease: 'none' } });
    tl.fromTo(card,
      { left: () => slotRect().x, top: () => slotRect().y, width: () => slotRect().w, height: () => slotRect().h, borderRadius: () => radius(slot) },
      { left: 0, top: 0, width: () => box.clientWidth, height: () => box.clientHeight, borderRadius: () => radius(box) }, 0);
    // картинка при расширении не затемняется, тексты остаются тёмными
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => ScrollTrigger.refresh());
    window.addEventListener('load', () => ScrollTrigger.refresh());
    ScrollTrigger.create({ trigger: wrap, start: 'top top', end: '+=950', scrub: 0.8, animation: tl, invalidateOnRefresh: true });
    return () => { if (lenis) lenis.destroy(); slot.style.visibility = ''; gsap.set(card, { clearProps: 'all' }); gsap.set([tint, texts], { clearProps: 'all' }); };
  });
})();
