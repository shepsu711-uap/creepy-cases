/* header.js — shrinks the top header (CREEPY CASES) once you scroll down. You should not need to edit this.
   The look is in style.css under ".site-header.scrolled".
   It shrinks after 160px of scrolling and only grows back near the very top (under 30px).
   The gap between those two numbers stops the header from flickering. */
(function () {
  var h = document.querySelector('.site-header');
  if (!h) return;
  var on = false, ticking = false;
  function check() {
    ticking = false;
    var y = window.scrollY || document.documentElement.scrollTop;
    if (!on && y > 160) { on = true; h.classList.add('scrolled'); }
    else if (on && y < 30) { on = false; h.classList.remove('scrolled'); }
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(check); }
  }, { passive: true });
  check();
})();
