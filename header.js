/* header.js — builds a small fixed copy of the title + menu that slides in once you scroll past the big title.
   You should not need to edit this. The look is in style.css under ".sticky-bar".
   It never changes the page layout, so scrolling stays smooth. */
(function () {
  var h = document.querySelector('.site-header');
  if (!h) return;
  var bar = document.createElement('div');
  bar.className = 'sticky-bar';
  bar.setAttribute('aria-hidden', 'true');
  var w = h.querySelector('.wordmark'), n = h.querySelector('nav');
  if (w) { var w2 = w.cloneNode(true); w2.tabIndex = -1; bar.appendChild(w2); }
  if (n) { var n2 = n.cloneNode(true); n2.querySelectorAll('a').forEach(function (a) { a.tabIndex = -1; }); bar.appendChild(n2); }
  document.body.appendChild(bar);
  var on = false, ticking = false;
  function check() {
    ticking = false;
    var y = window.scrollY || document.documentElement.scrollTop;
    var limit = h.offsetHeight;
    if (!on && y > limit) { on = true; bar.classList.add('show'); }
    else if (on && y < limit - 20) { on = false; bar.classList.remove('show'); }
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(check); }
  }, { passive: true });
  check();
})();
