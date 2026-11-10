// Форма регистрации: открывается по кнопкам [data-open-form] и по #signup. Esc, клик по фону и × закрывают.
// Проверка полей на месте. Данные пока никуда не отправляются: подключается к вашей почтовой службе в onSubmit.
(function () {
  const root = document.getElementById('signup'), form = document.getElementById('signupForm');
  if (!root || !form) return;
  const done = document.getElementById('signupDone'), err = document.getElementById('signupError');
  let last = null;
  const open = (e) => {
    if (e) e.preventDefault();
    last = document.activeElement; root.hidden = false; document.body.style.overflow = 'hidden';
    requestAnimationFrame(() => root.classList.add('is-open'));
    setTimeout(() => (form.hidden ? root.querySelector('.signup__done button') : form.elements.name).focus(), 60);
  };
  const close = () => {
    root.classList.remove('is-open'); document.body.style.overflow = '';
    setTimeout(() => { root.hidden = true; form.hidden = false; done.hidden = true; form.reset(); err.hidden = true; }, 250);
    if (last && last.focus) last.focus();
    if (location.hash === '#signup') history.replaceState(null, '', location.pathname + location.search);
  };
  document.querySelectorAll('[data-open-form]').forEach((a) => a.addEventListener('click', open));
  root.querySelectorAll('[data-close-form]').forEach((b) => b.addEventListener('click', close));
  addEventListener('keydown', (e) => { if (e.key === 'Escape' && !root.hidden) close(); });
  if (location.hash === '#signup') open();
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const f = form.elements, name = f.name.value.trim(), mail = f.email.value.trim();
    let msg = '';
    if (!name) msg = 'Напишите, как к вам обращаться';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(mail)) msg = 'Проверьте почту, кажется, в адресе опечатка';
    else if (!f.agree.checked) msg = 'Нужно согласие на обработку данных';
    err.hidden = !msg; err.textContent = msg;
    if (msg) { (!name ? f.name : !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(mail) ? f.email : f.agree).focus(); return; }
    // onSubmit: здесь отправка на сервер или в почтовую службу
    form.hidden = true; done.hidden = false; done.querySelector('button').focus();
  });
})();
