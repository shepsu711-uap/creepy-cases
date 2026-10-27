/* signup.js — the small "$5 off" sign-up tab at the bottom of the screen (email + optional phone).
   Shown on every page except Policies and Privacy. It slides in after a couple of seconds, expands when tapped,
   and can be closed with the X (it then stays away for 7 days).
   ============================ HOW TO TURN IT ON ============================
   1. Make a free form that collects entries (Formspree.io is easiest; steps are in ANALYTICS-SETUP.md).
   2. Paste its web address between the quotes on the FORM_URL line below. That one line is the only switch.
   3. Until you do, the tab is HIDDEN for visitors (so nobody types into nothing).
      To preview it yourself any time, open the site with  ?signup=preview  on the end of the address.
   Everything you may want to edit is in this first block. */
var SIGNUP = {
  FORM_URL: 'PASTE-FORM-ADDRESS-HERE',        // <-- THE ONE-LINE SWITCH. e.g. 'https://formspree.io/f/abcdwxyz'
  EXTRA_FIELDS: {},                            // only for some form services, e.g. { access_key: 'YOUR-KEY' } for Web3Forms
  TITLE: 'Lighter case $35 \u2192 $30',
  SUBLINE: 'Get $5 off your first case when you sign up for texts or email.',
  BUTTON: 'Get $5 off',
  DELAY_MS: 2500,                              // how long after the page opens before the tab slides in
  HIDE_DAYS: 7                                 // after someone closes it or signs up, stay away this many days
};
(function () {
  if (/policies\.html|privacy\.html/.test(location.pathname)) return;
  var preview = /[?&]signup=preview/.test(location.search);
  var connected = SIGNUP.FORM_URL.indexOf('PASTE') === -1;
  if (!connected && !preview) return;
  var KEY = 'cc-signup-until', SKEY = 'cc-signup-shown';
  function snoozed() { try { return Date.now() < Number(localStorage.getItem(KEY) || 0); } catch (e) { return false; } }
  function snooze() { try { localStorage.setItem(KEY, String(Date.now() + SIGNUP.HIDE_DAYS * 864e5)); } catch (e) {} }
  function shownThisSession() { try { return !!sessionStorage.getItem(SKEY); } catch (e) { return false; } }
  var blocked = !preview && (snoozed() || shownThisSession());

  var t = document.createElement('aside');
  t.className = 'su-tab'; t.hidden = true; t.setAttribute('aria-label', 'Sign-up offer');
  t.innerHTML =
    '<button type="button" class="su-x" aria-label="Close sign-up offer">\u00d7</button>' +
    '<button type="button" class="su-head" aria-expanded="false" aria-controls="su-panel">' +
      '<strong id="su-title">' + SIGNUP.TITLE + '</strong>' +
      '<span class="su-sub">' + SIGNUP.SUBLINE + '</span>' +
      '<span class="su-cta">Tap to sign up</span>' +
    '</button>' +
    '<div class="su-panel" id="su-panel" hidden>' +
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
  document.body.appendChild(t);
  var head = t.querySelector('.su-head'), panel = t.querySelector('.su-panel'),
      form = t.querySelector('form'), err = t.querySelector('.su-err'), done = t.querySelector('.su-done');

  function show() {
    if (!t.hidden) return;
    t.hidden = false;
    try { sessionStorage.setItem(SKEY, '1'); } catch (e) {}
    if (!preview && window.ccTrack) window.ccTrack('open_signup_popup');
    requestAnimationFrame(function () { requestAnimationFrame(function () { t.classList.add('on'); }); });
  }
  function expand(focus) {
    show();
    panel.hidden = false; head.setAttribute('aria-expanded', 'true'); t.classList.add('open');
    if (focus) setTimeout(function () { try { t.querySelector('#su-email').focus({ preventScroll: true }); } catch (e) {} }, 50);
  }
  function collapse() { panel.hidden = true; head.setAttribute('aria-expanded', 'false'); t.classList.remove('open'); }
  function close() {
    t.classList.remove('on'); setTimeout(function () { t.hidden = true; }, 300); snooze();
  }
  head.onclick = function () { if (panel.hidden) expand(true); else collapse(); };
  t.querySelector('.su-x').onclick = close;
  t.addEventListener('keydown', function (e) { if (e.key === 'Escape') { if (!panel.hidden) { collapse(); head.focus(); } else close(); } });

  // links on the page (data-signup-link) open the form directly
  Array.prototype.forEach.call(document.querySelectorAll('[data-signup-link]'), function (a) {
    a.hidden = false;
    a.addEventListener('click', function (e) { e.preventDefault(); expand(true); });
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
  if (!blocked) setTimeout(show, SIGNUP.DELAY_MS);

})();
