/* signup.js — the thin scrolling announcement bar at the very top of the page ("LIGHTER CASE $35 → $30 · TAP TO SIGN UP")
   and the small sign-up form (email + optional phone) that opens when the bar is tapped.
   Shown on every page except Policies and Privacy. The bar is part of the page, so it scrolls away normally.
   ============================ HOW TO TURN IT ON ============================
   1. Make a free form that collects entries (Formspree.io is easiest; steps are in ANALYTICS-SETUP.md).
   2. Paste its web address between the quotes on the FORM_URL line below. That one line is the only switch.
   3. Until you do, the bar is HIDDEN for visitors (so nobody types into nothing).
      To preview it yourself any time, open the site with  ?signup=preview  on the end of the address.
   Everything you may want to edit is in this first block. */
var SIGNUP = {
  FORM_URL: 'PASTE-FORM-ADDRESS-HERE',        // <-- THE ONE-LINE SWITCH. e.g. 'https://formspree.io/f/abcdwxyz'
  EXTRA_FIELDS: {},                            // only for some form services, e.g. { access_key: 'YOUR-KEY' } for Web3Forms
  BAR_TEXT: 'LIGHTER CASE $35 \u2192 $30 \u00b7 TAP TO SIGN UP',
  TITLE: 'Get $5 off your first case',
  TEXT: 'Sign up with your email (add your phone if you want texts) and we\u2019ll send you $5 off your first case by email or text.',
  BUTTON: 'Get $5 off',
  HIDE_DAYS: 7                                 // after someone signs up, hide the bar this many days
};
(function () {
  var cc = window.__cc = window.__cc || { errors: [] };   /* tiny status record, read by ?signup=debug (see analytics.js) */
  cc.signup = true; cc.formSet = SIGNUP.FORM_URL.indexOf('PASTE') === -1;
  function init() {
  if (/policies\.html|privacy\.html/.test(location.pathname)) return;
  /* Preview mode: open any page with ?signup=preview once and this phone/browser remembers it, so the bar shows on
     every page you tap to. Turn it off with ?signup=off (or the PREVIEW tag at the bottom-left). Visitors never have it. */
  var PKEY = 'cc-signup-preview', preview = false;
  try {
    var href = String(location.href);      /* whole address, so extra ?params or a #hash can't hide it */
    if (/[?&#]signup=off/i.test(href)) { localStorage.removeItem(PKEY); }
    else if (/[?&#]signup=preview/i.test(href)) { localStorage.setItem(PKEY, '1'); preview = true; cc.previewSrc = 'address'; }
    else { preview = localStorage.getItem(PKEY) === '1'; if (preview) cc.previewSrc = 'remembered'; }
  } catch (e) { preview = /signup=preview/i.test(String(location.href)); cc.previewSrc = 'address (storage blocked)'; cc.errors.push('storage blocked: ' + (e && e.message)); }
  cc.preview = preview;
  var connected = cc.formSet;
  if (!connected && !preview) return;
  var KEY = 'cc-signup-until';
  function snoozed() { try { return Date.now() < Number(localStorage.getItem(KEY) || 0); } catch (e) { return false; } }
  cc.snoozed = snoozed();
  function snooze() { try { localStorage.setItem(KEY, String(Date.now() + SIGNUP.HIDE_DAYS * 864e5)); } catch (e) {} }

  /* ---- the announcement bar (first thing in <body>, above the header) ---- */
  var bar = null;
  if (preview || !snoozed()) {
    var item = '<span class="ab-item">' + SIGNUP.BAR_TEXT + '</span>', group = '';
    for (var n = 0; n < 8; n++) group += item;
    bar = document.createElement('div');
    bar.className = 'announce'; bar.setAttribute('role', 'button'); bar.tabIndex = 0;
    bar.setAttribute('aria-haspopup', 'dialog');
    bar.setAttribute('aria-label', SIGNUP.BAR_TEXT.replace('\u2192', 'to').replace('\u00b7', '.').toLowerCase());
    bar.innerHTML = '<span class="ab-track" aria-hidden="true"><span class="ab-group">' + group + '</span><span class="ab-group">' + group + '</span></span>';
    document.body.insertBefore(bar, document.body.firstChild);
  }
  cc.barShown = !!bar;

  /* ---- the sign-up form (opens in a small sheet) ---- */
  var o = document.createElement('div');
  o.className = 'su-overlay'; o.hidden = true;
  o.innerHTML =
    '<div class="su-box" role="dialog" aria-modal="true" aria-labelledby="su-title">' +
      '<button type="button" class="su-x" aria-label="Close">\u00d7</button>' +
      '<h2 id="su-title">' + SIGNUP.TITLE + '</h2>' +
      '<p class="su-text">' + SIGNUP.TEXT + '</p>' +
      '<form class="su-form" novalidate>' +
        '<label for="su-email">Email</label>' +
        '<input id="su-email" name="email" type="email" inputmode="email" autocomplete="email" placeholder="you@email.com" required>' +
        '<label for="su-phone">Phone <span>(optional, for texts)</span></label>' +
        '<input id="su-phone" name="phone" type="tel" inputmode="tel" autocomplete="tel" placeholder="(555) 555-5555">' +
        '<label class="su-consent"><input type="checkbox" name="sms_consent" value="yes"> <span>Yes, text me my $5 off and new drops. Msg &amp; data rates may apply. Reply STOP anytime to opt out.</span></label>' +
        '<input type="text" name="website" class="su-hp" tabindex="-1" autocomplete="off" aria-hidden="true">' +
        '<p class="su-err" role="alert" hidden></p>' +
        '<button type="submit" class="btn su-go">' + SIGNUP.BUTTON + '</button>' +
        '<p class="su-priv">We\u2019ll send the $5 off by email or text. <a href="privacy.html">Privacy</a></p>' +
      '</form>' +
      '<p class="su-done" hidden></p>' +
    '</div>';
  document.body.appendChild(o);
  var box = o.querySelector('.su-box'), form = o.querySelector('form'), err = o.querySelector('.su-err'),
      done = o.querySelector('.su-done'), lastFocus;
  function open() {
    lastFocus = document.activeElement; o.hidden = false;
    if (!preview && window.ccTrack) window.ccTrack('open_signup_popup');
    /* on phones don't auto-focus: it would pop the keyboard up before the person has seen the form */
    var touch = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
    requestAnimationFrame(function () { o.classList.add('on'); if (!touch) try { o.querySelector('#su-email').focus({ preventScroll: true }); } catch (e) {} });
    document.documentElement.classList.add('su-lock');
  }
  function close() {
    o.classList.remove('on'); document.documentElement.classList.remove('su-lock');
    setTimeout(function () { o.hidden = true; }, 250);
    if (lastFocus && lastFocus.focus) try { lastFocus.focus({ preventScroll: true }); } catch (e) {}
  }
  if (bar) {
    bar.addEventListener('click', open);
    bar.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } });
  }
  if (preview) {                                             // obvious "you're in preview mode" tag, only you see it
    var tag = document.createElement('button');
    tag.type = 'button'; tag.className = 'su-preview'; tag.textContent = 'PREVIEW \u00b7 only you see this \u00b7 tap to turn off';
    tag.addEventListener('click', function () { try { localStorage.removeItem(PKEY); } catch (e) {} location.href = location.pathname + '?signup=off'; });
    document.body.appendChild(tag);
  }
  Array.prototype.forEach.call(document.querySelectorAll('[data-signup-link]'), function (a) {
    a.hidden = false;
    a.addEventListener('click', function (e) { e.preventDefault(); open(); });
  });
  o.querySelector('.su-x').onclick = close;
  o.addEventListener('click', function (e) { if (e.target === o) close(); });
  document.addEventListener('keydown', function (e) {
    if (o.hidden) return;
    if (e.key === 'Escape') close();
    if (e.key === 'Tab') {                                   // keep Tab inside the form
      var f = box.querySelectorAll('button:not([hidden]), input:not(.su-hp), a[href]');
      f = Array.prototype.filter.call(f, function (x) { return x.offsetParent !== null; });
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
  function showErr(m) { err.textContent = m; err.hidden = false; }
  form.addEventListener('submit', function (e) {
    e.preventDefault(); err.hidden = true;
    var email = form.email.value.trim(), phone = form.phone.value.trim();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { showErr('Please enter a valid email.'); form.email.focus(); return; }
    if (phone && !form.sms_consent.checked) { showErr('Check the box if you want texts, or clear the phone number.'); return; }
    if (form.website.value) return;                          // bots fill the hidden field
    function ok(msg) { form.hidden = true; done.textContent = msg; done.hidden = false; if (!preview) snooze(); }
    if (!connected) { ok('Preview only: nothing was saved.'); return; }
    var btn = form.querySelector('.su-go'); btn.disabled = true; btn.textContent = 'Sending\u2026';
    var fd = new FormData(form); fd.delete('website');
    for (var k in SIGNUP.EXTRA_FIELDS) fd.append(k, SIGNUP.EXTRA_FIELDS[k]);
    fetch(SIGNUP.FORM_URL, { method: 'POST', body: fd, headers: { Accept: 'application/json' } })
      .then(function (r) { if (!r.ok) throw 0; if (window.ccTrack) window.ccTrack('signup_submit'); ok('You\u2019re on the list. Thank you! We\u2019ll send your $5 off by email or text.'); })
      .catch(function () { btn.disabled = false; btn.textContent = SIGNUP.BUTTON; showErr('Something went wrong. Please try again.'); });
  });
  }
  try { init(); } catch (e) { cc.errors.push('signup.js: ' + (e && e.message)); }
})();
