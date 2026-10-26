/* header.js — shrinks the top header (CREEPY CASES) once you scroll down. You should not need to edit this.
   The look is in style.css under ".site-header.scrolled". */
(function () {
  var h = document.querySelector('.site-header');
  if (!h) return;
  function check() { h.classList.toggle('scrolled', (window.scrollY || document.documentElement.scrollTop) > 40); }
  window.addEventListener('scroll', check, { passive: true });
  check();
})();
