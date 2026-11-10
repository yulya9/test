// Отзывы: закреплённый блок. Анимация снята с novaform (Webflow, scroll scrub 0.8, линейно):
// колонка фото едет вверх на шаг, старая карточка уходит вниз (0 -> 101%), новая входит сверху (-101% -> 0), шаги по 0.14, длина шага 0.1.
(function () {
  if (!window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);
  const mm = gsap.matchMedia();
  mm.add('(min-width: 861px)', () => {
    const sec = document.querySelector('.reviews'), box = sec.querySelector('.reviews__box');
    const tilesCol = sec.querySelector('.rv__tiles'), dotsCol = sec.querySelector('.rv__dots');
    const dots = [...sec.querySelectorAll('.rv__dot')], cards = [...sec.querySelectorAll('.rv__card')];
    const N = cards.length, K = () => box.clientWidth / 1400, pitch = () => 216 * K();
    const base = () => box.clientHeight / 2 - 100 * K();      // первая плитка стоит по центру
    const state = { f: 0 };
    const paint = () => {
      const f = state.f, y = base() - f * pitch();
      gsap.set([tilesCol, dotsCol], { y });
      dots.forEach((d, i) => { const a = Math.max(0, 1 - Math.abs(i - f)); d.style.setProperty('--a', a.toFixed(3)); d.style.setProperty('--s', (0.6 + 0.4 * a).toFixed(3)); });
    };
    gsap.set(cards, { yPercent: (i) => (i === 0 ? 0 : -101) });
    const STEP = 0.14, DUR = 0.1, T0 = 0.04;
    const tl = gsap.timeline({ defaults: { ease: 'none' }, paused: true });
    for (let s = 1; s < N; s++) {
      const p = T0 + STEP * (s - 1);
      tl.to(state, { f: s, duration: DUR, onUpdate: paint }, p);
      tl.to(cards[s - 1], { yPercent: 101, duration: DUR }, p);
      tl.fromTo(cards[s], { yPercent: -101 }, { yPercent: 0, duration: DUR }, p);
    }
    tl.to({}, { duration: 0.001 }, T0 + STEP * (N - 2) + DUR + 0.04);
    const st = ScrollTrigger.create({ trigger: sec, start: 'center center', end: () => '+=' + (N - 1) * Math.round(innerHeight * 0.67), pin: true, scrub: 0.8, anticipatePin: 1, animation: tl, invalidateOnRefresh: true });
    paint();
    window.addEventListener('resize', paint);
    return () => { st.kill(); tl.kill(); gsap.set([tilesCol, dotsCol, ...cards], { clearProps: 'all' }); window.removeEventListener('resize', paint); };
  });
})();
