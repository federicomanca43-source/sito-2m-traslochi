/* Banner cookie del sito 2M Traslochi (29/10/2026).
 * Oggi il sito usa solo strumenti tecnici (i font sono serviti dal sito stesso): il banner raccoglie comunque la scelta, così un domani
 * Pixel di Meta o altri strumenti di misurazione partono SOLO dopo «Accetta». Per aggiungerne uno basta scrivere lo script come
 *   <script type="text/plain" data-consent="optional" src="https://…"></script>
 * (o con il codice dentro): il banner lo attiva solo se l'utente ha accettato, e lo riattiva/blocca a ogni cambio di scelta al caricamento successivo.
 * La scelta è in localStorage («2m-cookie-consent»), vale 12 mesi. window.cookieConsent.open() riapre il banner. */
(function () {
  'use strict';
  var KEY = '2m-cookie-consent', VER = 1, MS = 365 * 864e5;
  function read() { try { var v = JSON.parse(localStorage.getItem(KEY) || 'null'); if (v && v.v === VER && Date.now() - v.t < MS) return v; } catch (e) {} return null; }
  function save(optional) { try { localStorage.setItem(KEY, JSON.stringify({ v: VER, t: Date.now(), optional: !!optional })); } catch (e) {} }
  function activate() {
    var list = document.querySelectorAll('script[type="text/plain"][data-consent="optional"]');
    for (var i = 0; i < list.length; i++) {
      var o = list[i], s = document.createElement('script');
      for (var j = 0; j < o.attributes.length; j++) { var a = o.attributes[j]; if (a.name !== 'type' && a.name !== 'data-consent') s.setAttribute(a.name, a.value); }
      s.text = o.text; o.parentNode.replaceChild(s, o);
    }
  }
  var css = '#cc2m{position:fixed;left:50%;bottom:16px;transform:translateX(-50%);width:min(780px,calc(100% - 24px));z-index:2147483000;background:rgba(14,20,36,.97);color:#f6f7fb;border:1px solid rgba(246,247,251,.22);border-radius:16px;padding:16px 18px;box-shadow:0 18px 60px rgba(0,0,0,.55);font:400 14px/1.5 Inter,system-ui,sans-serif;display:grid;gap:12px;backdrop-filter:blur(10px)}' +
    '#cc2m p{margin:0;color:rgba(246,247,251,.86)}#cc2m b{color:#fff}#cc2m a{color:#f2b705}' +
    '#cc2m .b{display:flex;gap:10px;flex-wrap:wrap}#cc2m button{flex:1 1 150px;cursor:pointer;font:700 14px Inter,system-ui,sans-serif;padding:12px 18px;border-radius:10px;border:2px solid #f2b705;background:transparent;color:#f6f7fb}' +
    '#cc2m button[data-a=yes]{background:#f2b705;color:#171100}#cc2m button:hover{filter:brightness(1.1)}#cc2m button:focus-visible,#cc2m a:focus-visible{outline:3px solid #fff;outline-offset:2px}' +
    '.cc2m-link{color:inherit;text-decoration:underline;cursor:pointer;background:none;border:0;font:inherit;padding:0}' +
    '@media(max-width:640px){#cc2m{bottom:8px;padding:14px;font-size:13.5px}}';
  function style() { if (document.getElementById('cc2m-css')) return; var s = document.createElement('style'); s.id = 'cc2m-css'; s.textContent = css; document.head.appendChild(s); }
  function hide() { var e = document.getElementById('cc2m'); if (e) e.remove(); }
  function choose(optional) { save(optional); hide(); if (optional) activate(); try { window.dispatchEvent(new CustomEvent('cookie-consent', { detail: { optional: !!optional } })); } catch (e) {} }
  function show() {
    style(); hide();
    var d = document.createElement('div'); d.id = 'cc2m'; d.setAttribute('role', 'dialog'); d.setAttribute('aria-label', 'Preferenze sui cookie'); d.setAttribute('aria-live', 'polite');
    d.innerHTML = '<p><b>Cookie e privacy.</b> Questo sito usa solo strumenti tecnici necessari al suo funzionamento. Con il tuo consenso potremo attivare anche strumenti di misurazione e marketing (per esempio il Pixel di Meta) per capire come viene usato il sito e valutare le nostre campagne. Puoi cambiare idea quando vuoi. <a href="/cookie-policy/">Cookie policy</a></p>' +
      '<div class="b"><button type="button" data-a="no">Rifiuta</button><button type="button" data-a="yes">Accetta</button></div>';
    d.addEventListener('click', function (e) { var a = e.target && e.target.getAttribute && e.target.getAttribute('data-a'); if (a) choose(a === 'yes'); });
    document.body.appendChild(d);
  }
  function footerLink() {
    if (document.getElementById('cc2m-open')) return;
    var f = document.querySelector('footer'), wrap = document.createElement('span');
    wrap.innerHTML = ' · <a href="/cookie-policy/" style="color:inherit">Cookie policy</a> · <button type="button" id="cc2m-open" class="cc2m-link">Preferenze cookie</button>';
    if (f) f.appendChild(wrap); else { wrap.style.cssText = 'display:block;text-align:center;padding:14px 12px 90px;font:13px Inter,system-ui,sans-serif;color:#555'; document.body.appendChild(wrap); }
    style(); wrap.querySelector('#cc2m-open').addEventListener('click', show);
  }
  window.cookieConsent = { open: show, get: function () { var c = read(); return c ? c.optional : null; } };
  function init() { footerLink(); var c = read(); if (!c) show(); else if (c.optional) activate(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
