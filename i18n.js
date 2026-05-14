/* ============================================
   OPC i18n Engine v2.0
   Hybrid: static pages use build-time i18n, dynamic pages use runtime t().
   ============================================ */
(function () {
  "use strict";

  var SUPPORTED = ["zh", "en"];
  var DEFAULT = "zh";
  var STORAGE_KEY = "opc_lang";
  var DICT_PATH = "/i18n/";
  var currentLang = DEFAULT;
  var dictionary = {};

  /* ---- Language detection: html[lang] first, then localStorage ---- */
  function detectLang() {
    var htmlLang = document.documentElement.lang;
    if (htmlLang === "zh-CN" || htmlLang === "zh") return "zh";
    if (htmlLang === "en") return "en";
    try {
      var stored = localStorage.getItem(STORAGE_KEY);
      if (stored && SUPPORTED.indexOf(stored) !== -1) return stored;
    } catch (e) {}
    return DEFAULT;
  }

  /* ---- Translate key (dot-path lookup) ---- */
  function t(key) {
    if (!key) return "";
    var keys = key.split(".");
    var value = dictionary;
    for (var i = 0; i < keys.length; i++) {
      if (value && typeof value === "object" && keys[i] in value) {
        value = value[keys[i]];
      } else {
        return key;
      }
    }
    return typeof value === "string" ? value : key;
  }

  /* ---- Async dictionary loader ---- */
  function loadDict(lang) {
    return fetch(DICT_PATH + lang + ".json")
      .then(function (r) {
        if (!r.ok) throw new Error("HTTP " + r.status);
        return r.json();
      })
      .catch(function (e) {
        console.warn("[i18n] Failed to load dictionary:", lang, e);
        return {};
      });
  }

  var EN_PAGES = ["/", "/index.html", "/about.html", "/privacy.html", "/checkout.html", "/404.html"];

  /* ---- URL-based language switch ---- */
  function switchLang(lang) {
    if (!lang || SUPPORTED.indexOf(lang) === -1) {
      lang = currentLang === "zh" ? "en" : "zh";
    }
    if (lang === currentLang) return;
    try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) {}

    var path = window.location.pathname;
    if (lang === "en") {
      if (path === "/" || path === "/index.html") {
        window.location.href = "/en/";
      } else if (path.indexOf("/en/") !== 0) {
        if (EN_PAGES.indexOf(path) !== -1) {
          var suffix = path.indexOf("/") === 0 ? path.slice(1) : path;
          window.location.href = "/en/" + suffix;
        } else {
          window.location.href = "/en/";
        }
      }
    } else {
      if (path.indexOf("/en/") === 0) {
        var newPath = path.replace("/en", "");
        window.location.href = newPath || "/";
      }
    }
  }

  /* ---- DOM translation for data-i18n elements (dynamic pages only) ---- */
  function translateDOM() {
    document.documentElement.lang = currentLang === "zh" ? "zh-CN" : "en";

    var nodes = document.querySelectorAll("[data-i18n]");
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      var key = el.getAttribute("data-i18n");
      var translated = t(key);
      if (translated !== key) {
        if (el.getAttribute("data-i18n-html") !== null) {
          el.innerHTML = translated;
        } else {
          el.textContent = translated;
        }
      }
      el.style.opacity = "1";
    }

    // Remove no-flash style if present
    var noFlash = document.getElementById("i18n-noscript");
    if (noFlash) noFlash.remove();

    var inputs = document.querySelectorAll("[data-i18n-placeholder]");
    for (var j = 0; j < inputs.length; j++) {
      var phKey = inputs[j].getAttribute("data-i18n-placeholder");
      var phTranslated = t(phKey);
      if (phTranslated !== phKey) inputs[j].placeholder = phTranslated;
    }

    var imgs = document.querySelectorAll("[data-i18n-alt]");
    for (var k = 0; k < imgs.length; k++) {
      var altKey = imgs[k].getAttribute("data-i18n-alt");
      var altTranslated = t(altKey);
      if (altTranslated !== altKey) imgs[k].alt = altTranslated;
    }

    var attrEls = document.querySelectorAll("[data-i18n-attr]");
    for (var a = 0; a < attrEls.length; a++) {
      var attrEl = attrEls[a];
      var raw = attrEl.getAttribute("data-i18n-attr");
      if (!raw) continue;
      var pairs = raw.split(",");
      for (var p = 0; p < pairs.length; p++) {
        var parts = pairs[p].trim().split(":");
        if (parts.length === 2) {
          var attrName = parts[0].trim();
          var transKey = parts[1].trim();
          var trans = t(transKey);
          if (trans !== transKey) attrEl.setAttribute(attrName, trans);
        }
      }
    }
  }

  /* ---- Init ---- */
  function init() {
    currentLang = detectLang();
    document.documentElement.lang = currentLang === "zh" ? "zh-CN" : "en";

    loadDict(currentLang).then(function (dict) {
      dictionary = dict;
      translateDOM();
      try {
        window.dispatchEvent(new CustomEvent("i18n-ready", { detail: { lang: currentLang } }));
      } catch (e) {}
    });
  }

  /* ---- Language toggle click handler ---- */
  document.addEventListener("click", function (e) {
    var toggle = e.target.closest(".lang-toggle");
    if (toggle) {
      e.preventDefault();
      var next = currentLang === "zh" ? "en" : "zh";
      switchLang(next);
    }
  });

  /* ---- Public API ---- */
  window.i18n = {
    t: t,
    getLang: function () { return currentLang; },
    switchLang: switchLang
  };

  /* ---- Start ---- */
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
