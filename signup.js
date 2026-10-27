/* signup.js — the "get notified" pop-up (email + optional phone). Shown on every page except Policies.
   ============================ HOW TO TURN IT ON ============================
   1. Make a free form that collects entries (Formspree.io is easiest, or a Google Form).
   2. Paste its web address between the quotes on the FORM_URL line below.
   3. Until you do, the pop-up is HIDDEN for visitors (so nobody types into nothing).
      To preview it yourself any time, open the site with  ?signup=preview  on the end of the address.
   Everything you may want to edit is in this first block. */
var SIGNUP = {
  FORM_URL: 'PASTE-FORM-ADDRESS-HERE',        // e.g. 'https://formspree.io/f/abcdwxyz'
  TITLE: 'Get $5 off your first lighter case',
  TEXT: 'Sign up with your email (add your phone if you want texts) and we\u2019ll send you $5 off your first lighter case by email or text.',
  BUTTON: 'Get $5 off',
  DELAY_MS: 1500,                              // how long after the page opens before it pops up
  HIDE_DAYS: 14                                // after someone closes it or signs up, wait this many days
};
(function () {
  if (/policies\.html/.test(location.pathname)) return;
  var preview = /[?&]signup=preview/.test(location.search);
  var connected = SIGNUP.FORM_URL.indexOf('PASTE') === -1;
  if (!connected && !preview) return;
  var KEY = 'cc-signup-until';
  try { if (!preview && Date.now() < Number(localStorage.getItem(KEY) || 0)) return; } catch (e) {}
  function snooze() { try { localStorage.setItem(KEY, String(Date.now() + SIGNUP.HIDE_DAYS * 864e5)); } catch (e) {} }

  var o = document.createElement('div');
  o.className = 'su-overlay'; o.hidden = true;
  o.innerHTML =
    '<div class="su-box" role="dialog" aria-modal="true" aria-labelledby="su-title">' +
      '<button type="button" class="su-x" aria-label="Close">\u00d7</button>' +
      '<p class="su-logo">Creepy Cases</p>' +
      '<h2 id="su-title">' + SIGNUP.TITLE + '</h2>' +
      '<p class="su-text">' + SIGNUP.TEXT + '</p>' +
      '<form class="su-form" novalidate>' +
        '<label for="su-email">Email</label>' +
        '<input id="su-email" name="email" type="email" inputmode="email" autocomplete="email" placeholder="you@email.com" required>' +
        '<label for="su-phone">Phone <span>(optional, for text alerts)</span></label>' +
        '<input id="su-phone" name="phone" type="tel" inputmode="tel" autocomplete="tel" placeholder="(555) 555-5555">' +
        '<label class="su-consent"><input type="checkbox" name="sms_consent" value="yes"> <span>Yes, text me my $5 off and new drops. Msg &amp; data rates may apply. Reply STOP anytime to opt out.</span></label>' +
        '<input type="text" name="website" class="su-hp" tabindex="-1" autocomplete="off" aria-hidden="true">' +
        '<p class="su-err" role="alert" hidden></p>' +
        '<button type="submit" class="btn su-go">' + SIGNUP.BUTTON + '</button>' +
      '</form>' +
      '<p class="su-done" hidden></p>' +
      '<button type="button" class="su-no">No thanks</button>' +
    '</div>';
  document.body.appendChild(o);
  Array.prototype.forEach.call(document.querySelectorAll('[data-signup-link]'), function (a) {
    a.hidden = false;
    a.addEventListener('click', function (e) { e.preventDefault(); open(); });
  });
  var box = o.querySelector('.su-box'), form = o.querySelector('form'), err = o.querySelector('.su-err'),
      done = o.querySelector('.su-done'), lastFocus;
  function open() {
    lastFocus = document.activeElement; o.hidden = false;
    if (!preview && window.ccTrack) window.ccTrack('open_signup_popup');
    requestAnimationFrame(function () { o.classList.add('on'); o.querySelector('#su-email').focus({ preventScroll: true }); });
    document.documentElement.classList.add('su-lock');
  }
  function close() {
    o.classList.remove('on'); document.documentElement.classList.remove('su-lock');
    setTimeout(function () { o.hidden = true; }, 250); snooze();
    if (lastFocus && lastFocus.focus) try { lastFocus.focus({ preventScroll: true }); } catch (e) {}
  }
  o.querySelector('.su-x').onclick = close; o.querySelector('.su-no').onclick = close;
  o.addEventListener('mousedown', function (e) { if (e.target === o) close(); });
  document.addEventListener('keydown', function (e) {
    if (o.hidden) return;
    if (e.key === 'Escape') close();
    if (e.key === 'Tab') {                                   // keep Tab inside the pop-up
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
    function ok(msg) { form.hidden = true; o.querySelector('.su-no').textContent = 'Close'; done.textContent = msg; done.hidden = false; if (!preview) snooze(); }
    if (!connected) { ok('Preview only: nothing was saved.'); return; }
    var btn = form.querySelector('.su-go'); btn.disabled = true; btn.textContent = 'Sending\u2026';
    var fd = new FormData(form); fd.delete('website');
    fetch(SIGNUP.FORM_URL, { method: 'POST', body: fd, headers: { Accept: 'application/json' } })
      .then(function (r) { if (!r.ok) throw 0; if (window.ccTrack) window.ccTrack('signup_submit'); ok('You\u2019re on the list. Thank you! We\u2019ll send your $5 off by email or text.'); })
      .catch(function () { btn.disabled = false; btn.textContent = SIGNUP.BUTTON; showErr('Something went wrong. Please try again.'); });
  });
  setTimeout(open, preview ? 600 : SIGNUP.DELAY_MS);
})();
