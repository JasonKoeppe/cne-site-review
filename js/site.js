/* CNE v2 behaviors: nav toggle, measurement hooks, form handoff, reveal-on-
   scroll, exclusive FAQ fallback. No analytics IDs, no network calls — the
   dataLayer contract matches deliverables/campaign-prep/03 exactly. */
window.dataLayer = window.dataLayer || [];
function track(event, params) {
  window.dataLayer.push(Object.assign({ event: event, page: location.pathname }, params || {}));
}

/* mobile nav */
var toggle = document.querySelector(".nav-toggle");
var nav = document.querySelector("nav.main");
if (toggle && nav) {
  toggle.addEventListener("click", function () {
    var open = nav.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(open));
  });
}

/* tel/sms click tracking */
document.querySelectorAll('a[href^="tel:"], a[href^="sms:"]').forEach(function (a) {
  a.addEventListener("click", function () {
    track(a.getAttribute("href").indexOf("sms:") === 0 ? "text_click" : "call_click", {
      link_location: a.dataset.loc || "body",
    });
  });
});

/* lead form: validate, track, hand off to thank-you (no backend on review build) */
var form = document.querySelector("form.lead");
if (form) {
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!form.reportValidity()) return;
    var data = new FormData(form);
    track("lead_form_submit", {
      form_id: form.id || "lead",
      service: String(data.get("service") || ""),
      zip: String(data.get("zip") || ""),
      contact_pref: String(data.get("contact_pref") || ""),
    });
    window.location.href = form.dataset.thanks || "/thank-you/";
  });
}

/* reveal on scroll (skipped for reduced motion via CSS) */
var io = new IntersectionObserver(
  function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) {
        en.target.classList.add("in");
        io.unobserve(en.target);
      }
    });
  },
  { threshold: 0.18 }
);
document.querySelectorAll(".reveal").forEach(function (el) { io.observe(el); });

/* section-view hooks */
var seen = {};
var io2 = new IntersectionObserver(
  function (entries) {
    entries.forEach(function (en) {
      var id = en.target.getAttribute("data-section");
      if (en.isIntersecting && id && !seen[id]) {
        seen[id] = 1;
        track("section_view", { section: id });
      }
    });
  },
  { threshold: 0.4 }
);
document.querySelectorAll("[data-section]").forEach(function (el) { io2.observe(el); });

/* exclusive FAQ accordion: native `name` attr where supported, JS fallback */
document.querySelectorAll("details.faq").forEach(function (d) {
  d.addEventListener("toggle", function () {
    if (!d.open) return;
    document.querySelectorAll('details.faq[open]').forEach(function (other) {
      if (other !== d && other.parentElement === d.parentElement) other.open = false;
    });
  });
});

/* clipboard highlight cycler (decorative; off under reduced motion) */
if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  document.querySelectorAll("[data-clipboard]").forEach(function (board) {
    var rows = board.querySelectorAll("li");
    if (rows.length < 2) return;
    var i = 0;
    setInterval(function () {
      rows[i].classList.remove("hot");
      i = (i + 1) % rows.length;
      rows[i].classList.add("hot");
    }, 2600);
  });
}

track("page_view_enhanced", { title: document.title });
