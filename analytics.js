/* analytics.js — optional visitor stats + ad-pixel events. Included on every page.
   ============================ HOW TO TURN IT ON ============================
   Paste an ID between the quotes below. Leave a service EMPTY ('') and it is completely OFF:
   nothing is downloaded and no request is sent to it. Step-by-step: see ANALYTICS-SETUP.md.
   Nothing here ever sends names, emails or phone numbers. Visitors who send "Do Not Track" or
   Global Privacy Control are skipped entirely (no trackers load for them). */
var ANALYTICS = {
  GOATCOUNTER_CODE: '',   // free visit stats. The part before .goatcounter.com, e.g. 'creepycases'
  TIKTOK_PIXEL_ID:  '',   // TikTok Pixel ID from TikTok Ads Manager > Events (letters + numbers)
  META_PIXEL_ID:    '',   // optional. Facebook/Instagram Pixel ID (numbers)
  GA4_ID:           ''    // optional. Google Analytics 4 ID, looks like 'G-XXXXXXXXXX'
};
(function () {
  var A = ANALYTICS, noop = function () {};
  window.ccTrack = noop;                       // other scripts call ccTrack('event_name'); safe when tracking is off
  var optedOut = navigator.doNotTrack === '1' || window.doNotTrack === '1' || navigator.msDoNotTrack === '1' || !!navigator.globalPrivacyControl;
  if (optedOut) return;
  var gc = /^[a-z0-9-]+$/i.test(A.GOATCOUNTER_CODE || '') ? A.GOATCOUNTER_CODE : '';
  var tt = /^[A-Za-z0-9]+$/.test(A.TIKTOK_PIXEL_ID || '') ? A.TIKTOK_PIXEL_ID : '';
  var fb = /^[0-9]+$/.test(A.META_PIXEL_ID || '') ? A.META_PIXEL_ID : '';
  var ga = /^G-[A-Za-z0-9]+$/.test(A.GA4_ID || '') ? A.GA4_ID : '';
  if (!gc && !tt && !fb && !ga) return;        // nothing configured: no network calls at all

  function load(src, attrs, onload) {
    var s = document.createElement('script'); s.async = true; s.src = src;
    for (var k in (attrs || {})) s.setAttribute(k, attrs[k]);
    if (onload) s.onload = onload;
    document.head.appendChild(s);
  }

  /* ---- GoatCounter (page views + custom events) ---- */
  var gcQueue = [];
  if (gc) {
    window.goatcounter = { allow_local: false };
    load('https://gc.zgo.at/count.js', { 'data-goatcounter': 'https://' + gc + '.goatcounter.com/count' }, function () {
      var q = gcQueue; gcQueue = null; q.forEach(gcSend);
    });
  }
  function gcSend(n) { try { window.goatcounter.count({ path: 'event/' + n, title: n, event: true }); } catch (e) {} }

  /* ---- TikTok Pixel ---- */
  if (tt) {
    (function (w, d, t) {
      w.TiktokAnalyticsObject = t; var ttq = w[t] = w[t] || [];
      ttq.methods = ['page', 'track', 'identify', 'instances', 'debug', 'on', 'off', 'once', 'ready', 'alias', 'group', 'enableCookie', 'disableCookie'];
      ttq.setAndDefer = function (t, e) { t[e] = function () { t.push([e].concat(Array.prototype.slice.call(arguments, 0))); }; };
      for (var i = 0; i < ttq.methods.length; i++) ttq.setAndDefer(ttq, ttq.methods[i]);
      ttq.load = function (e) { ttq._i = ttq._i || {}; ttq._i[e] = []; ttq._t = ttq._t || {}; ttq._t[e] = +new Date(); load('https://analytics.tiktok.com/i18n/pixel/events.js?sdkid=' + e + '&lib=' + t); };
      ttq.load(tt); ttq.page();
    })(window, document, 'ttq');
  }

  /* ---- Meta (Facebook/Instagram) Pixel ---- */
  if (fb) {
    (function (f) {
      var n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); };
      if (!f._fbq) f._fbq = n; n.push = n; n.loaded = true; n.version = '2.0'; n.queue = [];
      load('https://connect.facebook.net/en_US/fbevents.js');
    })(window);
    window.fbq('init', fb); window.fbq('track', 'PageView');
  }

  /* ---- Google Analytics 4 ---- */
  if (ga) {
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date()); window.gtag('config', ga);
    load('https://www.googletagmanager.com/gtag/js?id=' + ga);
  }

  /* ---- Our events -> each service's own standard events ---- */
  var priceEl = document.querySelector('.info .price');
  var nameEl = document.querySelector('.info h1');
  var item = {
    content_name: nameEl ? nameEl.textContent.trim() : document.title,
    content_type: 'product', currency: 'USD'
  };
  var pm = priceEl && priceEl.textContent.match(/\$\s*(\d+(?:\.\d+)?)/);
  if (pm) item.value = Number(pm[1]);

  var TT = { view_product: 'ViewContent', add_to_cart: 'AddToCart', signup_submit: 'CompleteRegistration' };
  var FB = { view_product: 'ViewContent', add_to_cart: 'AddToCart', signup_submit: 'Lead' };
  var sent = {};
  window.ccTrack = function (name, once) {
    if (once) { if (sent[name]) return; sent[name] = 1; }
    var withItem = name === 'view_product' || name === 'add_to_cart';
    var data = withItem ? item : {};
    if (gc) { if (gcQueue) gcQueue.push(name); else gcSend(name); }
    if (tt && TT[name]) { try { window.ttq.track(TT[name], withItem ? data : {}); } catch (e) {} }
    if (fb && FB[name]) { try { window.fbq('track', FB[name], withItem ? { content_name: data.content_name, content_type: 'product', currency: 'USD', value: data.value } : {}); } catch (e) {} }
    if (ga) { try { window.gtag('event', name, withItem ? { item_name: data.content_name, currency: 'USD', value: data.value } : {}); } catch (e) {} }
  };

  // product pages
  if (document.getElementById('slides') && nameEl) window.ccTrack('view_product', true);
  document.addEventListener('click', function (e) {
    var t = e.target && e.target.closest ? e.target : null; if (!t) return;
    if (t.closest('#thumbs')) { if (t.closest('img,button')) window.ccTrack('click_thumbnail'); return; }
    var a = t.closest('a.btn');
    if (a && /cart|buy/i.test(a.textContent)) { window.ccTrack('add_to_cart'); return; }
    var p = t.closest('a[href*="policies.html"]');
    if (p) window.ccTrack('click_shipping_policies');
  });
})();
