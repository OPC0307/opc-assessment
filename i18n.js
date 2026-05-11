/* ============================================
   OPC i18n Engine v1.0
   纯前端多语言引擎 — 零依赖 · 零构建 · 即时切换
   ============================================ */
(function () {
  "use strict";

  /* ---- 配置 ---- */
  var SUPPORTED = ["zh", "en"];
  var DEFAULT = "zh";
  var STORAGE_KEY = "opc_lang";
  var DICT_PATH = "/i18n/";
  var currentLang = DEFAULT;
  var dictionary = {};
  var onReadyCallbacks = [];
  var isReady = false;

  /* ---- 语言检测 ---- */
  function detectLang() {
    var stored;
    try {
      stored = localStorage.getItem(STORAGE_KEY);
    } catch (e) {
      /* localStorage 不可用时回退 */
    }
    if (stored && SUPPORTED.indexOf(stored) !== -1) return stored;
    var navLang = (navigator.language || "").slice(0, 2);
    return SUPPORTED.indexOf(navLang) !== -1 ? navLang : DEFAULT;
  }

  /* ---- 加载字典 ---- */
  function loadDictionary(lang) {
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

  /* ---- 翻译 key（支持点号路径） ---- */
  function translate(key) {
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

  /* ---- 防闪烁：注入一个全局 CSS 到 head ---- */
  function injectNoFlashCSS() {
    if (document.querySelector("#i18n-noscript")) return;
    var style = document.createElement("style");
    style.id = "i18n-noscript";
    style.textContent = "[data-i18n] { opacity: 0; }";
    document.head.appendChild(style);
  }

  /* ---- 移除防闪烁 ---- */
  function removeNoFlashCSS() {
    var el = document.querySelector("#i18n-noscript");
    if (el) el.remove();
  }

  /* ---- 更新 DOM ---- */
  function updateDOM() {
    /* lang 属性 */
    document.documentElement.lang = currentLang === "zh" ? "zh-CN" : "en";

    /* data-i18n 文本元素 */
    var nodes = document.querySelectorAll("[data-i18n]");
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      var key = el.getAttribute("data-i18n");
      var isHTML = el.getAttribute("data-i18n-html") !== null;
      if (isHTML) {
        el.innerHTML = translate(key);
      } else {
        el.textContent = translate(key);
      }
      el.style.opacity = "1";
    }

    /* data-i18n-placeholder */
    var inputs = document.querySelectorAll("[data-i18n-placeholder]");
    for (var j = 0; j < inputs.length; j++) {
      inputs[j].placeholder = translate(inputs[j].getAttribute("data-i18n-placeholder"));
    }

    /* data-i18n-alt 图片 alt 属性 */
    var imgs = document.querySelectorAll("[data-i18n-alt]");
    for (var k = 0; k < imgs.length; k++) {
      imgs[k].alt = translate(imgs[k].getAttribute("data-i18n-alt"));
    }

    /* data-i18n-attr-* 通用属性翻译 */
    var attrEls = document.querySelectorAll("[data-i18n-attr]");
    for (var a = 0; a < attrEls.length; a++) {
      var el = attrEls[a];
      var raw = el.getAttribute("data-i18n-attr");
      if (!raw) continue;
      var pairs = raw.split(",");
      for (var p = 0; p < pairs.length; p++) {
        var parts = pairs[p].trim().split(":");
        if (parts.length === 2) {
          var attrName = parts[0].trim();
          var transKey = parts[1].trim();
          el.setAttribute(attrName, translate(transKey));
        }
      }
    }

    /* 语言切换按钮 */
    var toggle = document.querySelector(".lang-toggle");
    if (toggle) {
      toggle.textContent = currentLang === "zh" ? "EN" : "中文";
    }

    removeNoFlashCSS();
    isReady = true;
    for (var c = 0; c < onReadyCallbacks.length; c++) {
      onReadyCallbacks[c](currentLang, dictionary);
    }
    onReadyCallbacks = [];
  }

  /* ---- 切换语言 ---- */
  function switchLang(lang) {
    if (lang === currentLang) return Promise.resolve();
    if (SUPPORTED.indexOf(lang) === -1) lang = DEFAULT;
    currentLang = lang;
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch (e) {}
    return loadDictionary(lang).then(function (dict) {
      dictionary = dict;
      updateDOM();
    });
  }

  /* ---- 初始化 ---- */
  function init() {
    currentLang = detectLang();
    injectNoFlashCSS();
    loadDictionary(currentLang).then(function (dict) {
      dictionary = dict;
      updateDOM();

      /* 绑定切换按钮（事件委托，支持动态生成） */
      document.addEventListener("click", function (e) {
        var toggle = e.target.closest(".lang-toggle");
        if (toggle) {
          e.preventDefault();
          var next = currentLang === "zh" ? "en" : "zh";
          switchLang(next);
        }
      });
    });
  }

  /* ---- 暴露全局 API ---- */
  window.i18n = {
    t: translate,
    getLang: function () {
      return currentLang;
    },
    switchLang: switchLang,
    onReady: function (cb) {
      if (isReady) {
        cb(currentLang, dictionary);
      } else {
        onReadyCallbacks.push(cb);
      }
    },
  };

  /* ---- 启动 ---- */
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
