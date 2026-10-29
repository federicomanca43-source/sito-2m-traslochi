/* Interazioni minime dei siti clonati da GHL (senza GHL): domande frequenti, menu su mobile, moduli verso Vendenta. */
(function () {
  var C = window.VENDENTA || {};

  // Domande frequenti
  document.querySelectorAll(".hl-faq-child").forEach(function (item) {
    var head = item.querySelector(".hl-faq-child-heading");
    var panel = item.querySelector(".hl-faq-child-panel");
    if (!head || !panel) return;
    head.style.cursor = "pointer";
    head.setAttribute("role", "button");
    head.setAttribute("tabindex", "0");
    var toggle = function () {
      var open = item.classList.toggle("is-open");
      head.setAttribute("aria-expanded", open ? "true" : "false");
      panel.style.height = open ? "auto" : "0";
      panel.style.opacity = open ? "1" : "0";
      panel.style.padding = open ? "" : "0";
      panel.style.overflow = "hidden";
    };
    head.addEventListener("click", toggle);
    head.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle(); } });
  });

  // Menu su mobile (pulsante a tre righe dell'intestazione)
  document.querySelectorAll(".hl_nav-header .hamburger, .nav-menu-mobile, [class*='mobile-menu'] , .hl-nav-mobile-trigger").forEach(function (btn) {
    btn.style.cursor = "pointer";
    btn.addEventListener("click", function () {
      var nav = document.querySelector(".hl_nav-header nav, .nav-menu, header nav");
      if (nav) nav.classList.toggle("is-open");
    });
  });

  // Moduli → Vendenta
  var wrap = document.querySelector(".form-builder--wrap");
  if (!wrap || !C.funnelId) return;
  var submit = wrap.querySelector("button[type=submit], button.button-element");
  var msg = document.createElement("p");
  msg.setAttribute("role", "status");
  msg.style.cssText = "margin:12px 0 0;text-align:center;font-size:15px";
  if (submit) submit.parentNode.appendChild(msg);

  function labelOf(item) {
    var l = item.querySelector("label.field-label");
    return l ? l.textContent.replace("*", "").trim() : "";
  }

  function collect() {
    var data = { name: "", email: "", phone: "", q: [], qi: {} };
    var missing = [];
    wrap.querySelectorAll(".form-builder--item").forEach(function (item) {
      var inputs = item.querySelectorAll("input[data-q], textarea[data-q], select[data-q]");
      if (!inputs.length) return;
      var first = inputs[0];
      var key = first.getAttribute("data-q");
      var type = (first.getAttribute("type") || "").toLowerCase();
      if (type === "file") return;
      var value;
      if (type === "checkbox") {
        value = Array.prototype.filter.call(inputs, function (i) { return i.checked; }).map(function (i) { return i.value; }).join(", ");
      } else {
        value = (first.value || "").trim();
      }
      var required = first.getAttribute("data-required") === "true";
      if (required && !value) missing.push(labelOf(item) || key);
      if (key === "full_name" || key === "name") data.name = value;
      else if (key === "first_name") data.name = (value + " " + data.name).trim();
      else if (key === "last_name") data.name = (data.name + " " + value).trim();
      else if (key === "email" || type === "email") data.email = value;
      else if (key === "phone" || type === "tel") data.phone = value;
      else { var vq = first.getAttribute("data-vq"); if (vq !== null) data.qi[vq] = value; else data.q.push(value); }
    });
    return { data: data, missing: missing };
  }

  function send() {
    var r = collect();
    msg.style.color = "#b00020";
    if (r.missing.length) { msg.textContent = "Compila i campi obbligatori: " + r.missing.join(", "); return; }
    var d = r.data;
    if (!d.email && !d.phone) { msg.textContent = "Indica almeno un telefono o un'email."; return; }
    var body = { name: d.name || "Contatto dal sito", email: d.email, phone: d.phone, website: "" };
    d.q.slice(0, 5).forEach(function (v, i) { if (v) body["q" + i] = v; });
    Object.keys(d.qi).forEach(function (k) { if (d.qi[k]) body["q" + k] = d.qi[k]; });
    if (submit) { submit.disabled = true; submit.style.opacity = "0.6"; }
    msg.style.color = "inherit";
    msg.textContent = "Invio in corso…";
    fetch((C.api || "https://www.vendenta.com") + "/api/funnels/" + C.funnelId + "/lead", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
      .then(function (res) { return res.json().then(function (j) { return { ok: res.ok && j.ok, j: j }; }); })
      .then(function (x) {
        if (x.ok) {
          wrap.innerHTML = '<p style="text-align:center;padding:40px 16px;font-size:18px">' + (C.successMessage || "Grazie! Ti ricontatteremo al più presto.") + "</p>";
          window.location.assign("/grazie/");
        } else {
          msg.style.color = "#b00020";
          msg.textContent = (x.j && x.j.error) || "Non è stato possibile inviare. Riprova o chiamaci.";
          if (submit) { submit.disabled = false; submit.style.opacity = ""; }
        }
      })
      .catch(function () {
        msg.style.color = "#b00020";
        msg.textContent = "Connessione non riuscita. Riprova o chiamaci.";
        if (submit) { submit.disabled = false; submit.style.opacity = ""; }
      });
  }

  if (submit) submit.addEventListener("click", function (e) { e.preventDefault(); send(); });
  wrap.addEventListener("submit", function (e) { e.preventDefault(); send(); });
  // il caricamento di foto non è disponibile fuori da GHL: si indica la strada alternativa
  wrap.querySelectorAll("input[type=file]").forEach(function (f) {
    var item = f.closest(".form-builder--item");
    if (item) { item.innerHTML = '<p style="font-size:14px;opacity:.8">Per inviarci le foto degli oggetti scrivici su WhatsApp.</p>'; }
  });
})();
