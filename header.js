/* header.js — the small bar that appears at the top (title + menu), the same way Shopify's own themes do it:
   scroll DOWN and it tucks away so it never covers the photos; scroll UP a little and it slides back in.
   It is a fixed overlay, so it never changes the page layout and can't make scrolling jitter.
   You should not need to edit this. The look is in style.css under ".sticky-bar". */
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
  var last = 0, ticking = false, on = false, upDistance = 0;
  function set(v) { if (v !== on) { on = v; bar.classList.toggle('show', v); } }
  function check() {
    ticking = false;
    var y = Math.max(0, window.scrollY || document.documentElement.scrollTop);
    var limit = h.offsetHeight;
    var d = y - last;
    if (y <= limit) { set(false); upDistance = 0; }
    else if (d > 0) { set(false); upDistance = 0; }          /* scrolling down: hide */
    else if (d < 0) { upDistance -= d; if (upDistance > 12) set(true); }  /* scrolling up: show */
    last = y;
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(check); }
  }, { passive: true });
  check();
})();
