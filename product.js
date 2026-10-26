/* product.js — shared by product.html and product-2.html. You should not need to edit this.
   It does 3 things:  1) arrows + "1 / 10" counter   2) builds the clickable thumbnails from the photos
   3) keeps the highlighted thumbnail in sync when you swipe.
   Photos are listed ONLY in the HTML (one <li class="slide"> each). Thumbnails come from them automatically.
   Optional: put a small copy of a photo in assets/photos/thumbs/ with the SAME file name and it is used for the
   thumbnail (faster). If there is none, the full photo is used. */
(function () {
  document.documentElement.classList.add('js');
  var s = document.getElementById('slides'), c = document.getElementById('count'), t = document.getElementById('thumbs');
  if (!s) return;
  var imgs = s.querySelectorAll('img'), n = imgs.length, btns = [];
  function idx() { return Math.max(0, Math.min(n - 1, Math.round(s.scrollLeft / s.clientWidth))); }
  function show() {
    var i = idx();
    c.textContent = (i + 1) + ' / ' + n;
    btns.forEach(function (b, k) { if (k === i) b.setAttribute('aria-current', 'true'); else b.removeAttribute('aria-current'); });
  }
  function goTo(i) { s.scrollTo({ left: Math.max(0, Math.min(n - 1, i)) * s.clientWidth, behavior: 'smooth' }); }
  function keepThumbVisible() {   // scroll the thumbnail row sideways only (never moves the page)
    var b = btns[idx()]; if (!b || !t) return;
    if (t.scrollWidth > t.clientWidth) t.scrollTo({ left: b.offsetLeft - t.clientWidth / 2 + b.offsetWidth / 2, behavior: 'smooth' });
  }
  if (t) {
    imgs.forEach(function (im, k) {
      var b = document.createElement('button'), th = document.createElement('img'), full = im.getAttribute('src');
      b.type = 'button'; b.setAttribute('aria-label', 'Show photo ' + (k + 1) + ' of ' + n);
      th.alt = ''; th.loading = 'lazy'; th.decoding = 'async';
      th.onerror = function () { th.onerror = null; th.src = full; };           // no small copy? use the full photo
      th.src = full.replace('assets/photos/', 'assets/photos/thumbs/');
      b.appendChild(th); b.onclick = function () { goTo(k); }; t.appendChild(b); btns.push(b);
    });
  }
  var timer;
  s.addEventListener('scroll', function () { show(); clearTimeout(timer); timer = setTimeout(keepThumbVisible, 120); });
  window.addEventListener('resize', show);
  show();
  document.querySelector('.prev').onclick = function () { goTo(idx() - 1); };
  document.querySelector('.next').onclick = function () { goTo(idx() + 1); };
  s.tabIndex = 0;
  s.addEventListener('keydown', function (e) { if (e.key === 'ArrowRight') goTo(idx() + 1); if (e.key === 'ArrowLeft') goTo(idx() - 1); });
})();
