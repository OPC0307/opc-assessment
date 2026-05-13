/* ============================================
   OPC 一人公司孵化器 — 核心逻辑
   ============================================ */

// ---- 评估权威依据 ----
var AUTHORITY_FOUNDATION = {
  classics: [
    { source: "纳瓦尔《纳瓦尔宝典》", core: "个体财富公式：专长 × 杠杆 × 责任感" },
    { source: "《一人公司》行业共识", core: "小规模、高利润、强闭环、抗风险、绝对职业主权" },
    { source: "古典《超级个体》", core: "聚焦个体不可替代性、复利能力、职业主权" }
  ],
  practice: [
    "跨装修、保险、贸易多行业个体实战闭环经验",
    "项目落地管控、拓客转化、用户共情陪跑三大核心能力沉淀",
    "100+装修项目全流程落地验证",
    "保险拓客签单与个体生意用户共情验证",
    "贸易行业从0到1跑通变现闭环验证"
  ],
  ai: [
    "基于2024-2026年AI工具落地个体商业的实战案例打磨",
    "新增AI杠杆驾驭能力维度，适配当下OPC落地环境"
  ]
};

// ---- i18n 辅助函数：尝试翻译，失败回退到原始中文 ----
function _t(key, fallback) {
  try {
    if (window.i18n) {
      var result = i18n.t(key);
      if (result !== key) return result;
    }
  } catch(e) {}
  return fallback;
}

// ==========================================
// DOM 辅助函数
// ==========================================
function $(selector) { return document.querySelector(selector); }
function $$(selector) { return document.querySelectorAll(selector); }

function createElement(tag, className, textContent) {
  var el = document.createElement(tag);
  if (className) el.className = className;
  if (textContent) el.textContent = textContent;
  return el;
}

// ==========================================
// localStorage 数据传递
// ==========================================
var Storage = {
  KEY: "opc_quiz_result",

  save: function(data) {
    try {
      localStorage.setItem(this.KEY, JSON.stringify(data));
    } catch(e) {
      console.warn("localStorage save failed:", e);
    }
  },

  load: function() {
    try {
      var raw = localStorage.getItem(this.KEY);
      return raw ? JSON.parse(raw) : null;
    } catch(e) {
      return null;
    }
  },

  clear: function() {
    try {
      localStorage.removeItem(this.KEY);
    } catch(e) {}
  }
};

// ==========================================
// 数据统计系统（本地 + 云端批量上报）
// ==========================================
var STATS_KEY = "opc_stats";
var CLOUD_ENV = "cloud1-d3ghz1fpd2ce39b7c";
var FLUSH_INTERVAL = 30000; // 30秒自动上报一次

function trackEvent(action, data) {
  try {
    var evt = {
      action: action,
      data: data || {},
      page: document.body.getAttribute("data-page") || "unknown",
      time: Date.now(),
      sessionId: getSessionId()
    };
    // 本地存储
    var raw = localStorage.getItem(STATS_KEY);
    var stats = raw ? JSON.parse(raw) : { events: [], firstSeen: Date.now() };
    stats.events.push(evt);
    if (stats.events.length > 500) stats.events = stats.events.slice(-500);
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
    // 待上报队列
    var queue = JSON.parse(localStorage.getItem("opc_stats_queue") || "[]");
    queue.push(evt);
    localStorage.setItem("opc_stats_queue", JSON.stringify(queue));
  } catch(e) {}
}

// 定时批量上报到云函数
function flushStats() {
  var queue = JSON.parse(localStorage.getItem("opc_stats_queue") || "[]");
  if (queue.length === 0) return;
  // 调用云函数上报
  if (typeof wx !== 'undefined' && wx.cloud) {
    wx.cloud.init({ env: CLOUD_ENV });
    wx.cloud.callFunction({
      name: "trackEvent",
      data: { action: "batch", data: { events: queue } },
      success: function() { localStorage.setItem("opc_stats_queue", "[]"); },
      fail: function() { /* 网络失败时保留队列，下次重试 */ }
    });
  }
}
setInterval(flushStats, FLUSH_INTERVAL);

function getSessionId() {
  var sid = localStorage.getItem("opc_session");
  if (!sid) {
    sid = "s_" + Date.now() + "_" + Math.random().toString(36).slice(2, 8);
    localStorage.setItem("opc_session", sid);
  }
  return sid;
}

// ==========================================
// 数字动画
// ==========================================
function animateNumber(el, from, to, duration) {
  var start = performance.now();
  function step(now) {
    var elapsed = now - start;
    var progress = Math.min(elapsed / duration, 1);
    // easeOutCubic
    var eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(from + (to - from) * eased);
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

// ==========================================
// 页面初始化
// ==========================================
// ---- Site Navigation (injected globally) ----
var SITE_NAV = [
  { key: "home",     href: "/",                         label: "首页",       enLabel: "Home",            match: ["index"] },
  { key: "quiz",     href: "/profile.html",             label: "测评",       enLabel: "Assessment",      match: ["profile", "quiz", "report-free", "report-paid", "pay"] },
  { key: "subsidy",  href: "/subsidy/",                 label: "补贴",       enLabel: "Subsidies",       match: ["subsidy", "subsidy-city"] },
  { key: "services", href: "/services/",             label: "服务",       enLabel: "Services",        match: ["services-index", "services-subsidy", "services-tax", "services-registration"] },
  { key: "blog",     href: "/blog/",                   label: "博客",       enLabel: "Blog",            match: ["blog-index", "blog-article"] },
  { key: "about",    href: "/about.html",              label: "关于",       enLabel: "About",           match: ["about"] }
];

function injectSiteNav(currentPage) {
  if (document.getElementById("site-nav")) return;
  var pageContent = document.querySelector(".page-content");
  if (!pageContent) return;

  var currentLang = window.i18n ? i18n.getLang() : "zh";

  var nav = document.createElement("nav");
  nav.className = "site-nav";
  nav.id = "site-nav";

  var inner = document.createElement("div");
  inner.className = "site-nav__inner";

  var brand = document.createElement("a");
  brand.href = "/";
  brand.className = "site-nav__brand";
  brand.textContent = "OPC";

  var links = document.createElement("div");
  links.className = "site-nav__links";

  for (var i = 0; i < SITE_NAV.length; i++) {
    var item = SITE_NAV[i];
    var a = document.createElement("a");
    a.href = item.href;
    a.setAttribute("data-i18n", "nav." + item.key);
    a.textContent = currentLang === "en" ? item.enLabel : item.label;
    if (item.match.indexOf(currentPage) !== -1) {
      a.classList.add("active");
    }
    links.appendChild(a);
  }

  var langBtn = document.createElement("button");
  langBtn.className = "lang-toggle";
  langBtn.textContent = currentLang === "zh" ? "EN" : "中文";

  inner.appendChild(brand);
  inner.appendChild(links);
  inner.appendChild(langBtn);
  nav.appendChild(inner);

  var existingToggle = pageContent.querySelector(".lang-toggle");
  if (existingToggle) existingToggle.remove();

  var oldBrand = pageContent.querySelector(".brand-header");
  if (oldBrand) oldBrand.remove();

  pageContent.insertBefore(nav, pageContent.firstChild);
}

var SITE_FOOTER_LINKS = [
  { key: "home",    href: "/",              label: "← 返回首页",          enLabel: "← Home" },
  { key: "subsidy", href: "/subsidy/",      label: "创业补贴查询",         enLabel: "Startup Subsidies" },
  { key: "blog",    href: "/blog/",         label: "OPC 博客",            enLabel: "OPC Blog" }
];

function injectSiteFooter() {
  if (document.getElementById("site-footer-nav")) return;
  var pageContent = document.querySelector(".page-content");
  if (!pageContent) return;

  var currentLang = window.i18n ? i18n.getLang() : "zh";

  var footerNav = document.createElement("div");
  footerNav.id = "site-footer-nav";
  footerNav.style.cssText = "text-align:center;padding:20px 16px 8px;font-size:0.8125rem;display:flex;flex-wrap:wrap;gap:8px 16px;justify-content:center;";

  for (var i = 0; i < SITE_FOOTER_LINKS.length; i++) {
    var item = SITE_FOOTER_LINKS[i];
    var a = document.createElement("a");
    a.href = item.href;
    a.setAttribute("data-i18n", "footer_nav." + item.key);
    a.textContent = currentLang === "en" ? item.enLabel : item.label;
    a.style.cssText = "color:var(--text-muted);text-decoration:none;white-space:nowrap;";
    if (i > 0) {
      // Add separator before each link after the first
      var sep = document.createElement("span");
      sep.style.cssText = "color:var(--border);";
      sep.textContent = "|";
      footerNav.appendChild(sep);
    }
    footerNav.appendChild(a);
  }

  // Insert before the first footer element inside page-content
  var footer = pageContent.querySelector("footer, .footer");
  if (footer) {
    footer.parentNode.insertBefore(footerNav, footer);
  } else {
    pageContent.appendChild(footerNav);
  }
}

function injectWeChatQR() {
  if (document.getElementById("wechat-float")) return;
  var pageContent = document.querySelector(".page-content");
  if (!pageContent) return;

  var currentLang = window.i18n ? i18n.getLang() : "zh";
  var isEn = currentLang === "en";

  // Floating button
  var floatBtn = document.createElement("button");
  floatBtn.id = "wechat-float";
  floatBtn.innerHTML = "💬";
  floatBtn.title = isEn ? "Add on WeChat" : "加微信咨询";
  floatBtn.style.cssText = "position:fixed;bottom:24px;right:24px;z-index:9999;width:52px;height:52px;border-radius:50%;background:linear-gradient(135deg,#07c160,#06ad56);color:#fff;border:none;font-size:1.5rem;cursor:pointer;box-shadow:0 4px 16px rgba(7,193,96,0.35);transition:transform var(--duration-fast) var(--ease-out);display:flex;align-items:center;justify-content:center;";
  floatBtn.addEventListener("mouseenter", function() { this.style.transform = "scale(1.1)"; });
  floatBtn.addEventListener("mouseleave", function() { this.style.transform = "scale(1)"; });

  // Modal overlay
  var overlay = document.createElement("div");
  overlay.id = "wechat-overlay";
  overlay.style.cssText = "display:none;position:fixed;inset:0;z-index:10000;background:rgba(0,0,0,0.6);align-items:center;justify-content:center;";

  // Modal card
  var card = document.createElement("div");
  card.style.cssText = "background:#fff;border-radius:16px;padding:32px 24px 24px;text-align:center;max-width:300px;width:90%;box-shadow:0 16px 48px rgba(0,0,0,0.25);position:relative;";

  var closeBtn = document.createElement("button");
  closeBtn.innerHTML = "✕";
  closeBtn.style.cssText = "position:absolute;top:12px;right:14px;background:none;border:none;font-size:1.125rem;color:#999;cursor:pointer;";
  closeBtn.addEventListener("click", function() { overlay.style.display = "none"; });

  var title = document.createElement("div");
  title.style.cssText = "font-size:1.0625rem;font-weight:700;color:#1a1a1a;margin-bottom:4px;";
  title.textContent = isEn ? "Add on WeChat" : "加微信，领补贴清单";

  var sub = document.createElement("div");
  sub.style.cssText = "font-size:0.8125rem;color:#666;margin-bottom:16px;line-height:1.5;";
  sub.textContent = isEn ? "Free startup subsidy checklist + 1-on-1 consultation" : "免费获取《一人公司创业补贴清单》+ 一对一咨询";

  var qrImg = document.createElement("img");
  qrImg.src = "/assets/images/wechat-qr.jpg";
  qrImg.alt = "WeChat QR";
  qrImg.style.cssText = "width:180px;height:180px;border-radius:8px;border:1px solid #eee;object-fit:contain;";
  qrImg.onerror = function() {
    this.style.display = "none";
    var fallback = document.createElement("div");
    fallback.style.cssText = "width:180px;height:180px;margin:0 auto 8px;background:#f5f5f5;border-radius:8px;display:flex;align-items:center;justify-content:center;color:#999;font-size:0.75rem;";
    fallback.textContent = isEn ? "QR code not loaded" : "请替换 /assets/images/wechat-qr.jpg";
    this.parentNode.insertBefore(fallback, this);
  };

  var tip = document.createElement("div");
  tip.style.cssText = "font-size:0.6875rem;color:#999;margin-top:8px;";
  tip.textContent = isEn ? "Scan or long-press to add" : "扫一扫或长按识别添加";

  card.appendChild(closeBtn);
  card.appendChild(title);
  card.appendChild(sub);
  card.appendChild(qrImg);
  card.appendChild(tip);
  overlay.appendChild(card);

  // Open modal
  floatBtn.addEventListener("click", function() {
    overlay.style.display = "flex";
  });
  overlay.addEventListener("click", function(e) {
    if (e.target === overlay) overlay.style.display = "none";
  });

  document.body.appendChild(floatBtn);
  document.body.appendChild(overlay);
}


document.addEventListener("DOMContentLoaded", function() {
  var page = document.body.getAttribute("data-page");

  // Inject global nav + footer + WeChat on all content pages
  if (document.querySelector(".page-content")) {
    injectSiteNav(page);
    injectSiteFooter();
  }
  injectWeChatQR();

  // Load AI chat widget (bottom-left, opposite to WeChat QR)
  var chatScript = document.createElement('script');
  chatScript.src = '/chat-widget.js';
  chatScript.defer = true;
  document.head.appendChild(chatScript);

  if (page === "index") {
    var titleEl = document.getElementById("hero-title");
    var candidateBtns = document.querySelectorAll(".title-candidate");
    if (titleEl && candidateBtns.length) {
      candidateBtns.forEach(function(btn) {
        btn.addEventListener("click", function() {
          candidateBtns.forEach(function(b) { b.classList.remove("active"); });
          btn.classList.add("active");
          titleEl.textContent = btn.getAttribute("data-title");
        });
      });
    }
  } else if (page === "profile") {
    var submitBtn = document.getElementById("pf-submit");
    if (submitBtn) {
      submitBtn.addEventListener("click", function() {
        var age = document.getElementById("pf-age").value;
        var gender = document.getElementById("pf-gender").value;
        var occupation = document.getElementById("pf-occupation").value;
        var edu = document.getElementById("pf-edu").value;
        var channel = document.getElementById("pf-channel").value;
        if (!age || !gender || !occupation || !edu || !channel) {
          alert(_t("profile.alert_incomplete", "请完整填写所有选项后再继续。"));
          return;
        }
        var profile = {
          age: age,
          gender: gender,
          occupation: occupation,
          education: edu,
          channel: channel,
          timestamp: Date.now()
        };
        try {
          localStorage.setItem("opc_user_profile", JSON.stringify(profile));
        } catch(e) {}
        window.location.href = "quiz.html";
      });
    }
  }

  // i18n button sync
  if (typeof i18n !== "undefined" && i18n.onReady) {
    i18n.onReady(function(lang) {
      var btn = document.querySelector(".lang-toggle");
      if (btn) btn.textContent = lang === "zh" ? "EN" : "中文";
    });
  }


  // ---- 动态统计数据（时间驱动 + 真实访问 + 测评完成）----
  var STAT_STORAGE_KEY = "opc_stat_bonus";
  var STAT_SESSION_KEY = "opc_session_counted";
  var STAT_VERSION_KEY = "opc_stat_version";
  var STAT_VERSION = 3; // 版本号递增触发计数重置
  var STAT_BASE = 1283;
  var STAT_START = new Date("2026-04-01").getTime();
  var STAT_DAILY = 18; // 日均自然增长

  function loadRealTimeStat() {
    var storedVersion = localStorage.getItem(STAT_VERSION_KEY);
    if (storedVersion !== String(STAT_VERSION)) {
      localStorage.removeItem(STAT_STORAGE_KEY);
      localStorage.setItem(STAT_VERSION_KEY, String(STAT_VERSION));
    }

    // 时间驱动的基础值
    var daysSince = Math.max(0, Math.floor((Date.now() - STAT_START) / 86400000));
    var timeBased = STAT_BASE + daysSince * STAT_DAILY;

    // 真实访问增量
    var sessionBonus = parseInt(localStorage.getItem(STAT_STORAGE_KEY), 10) || 0;
    if (!sessionStorage.getItem(STAT_SESSION_KEY)) {
      sessionBonus += 1;
      localStorage.setItem(STAT_STORAGE_KEY, sessionBonus);
      sessionStorage.setItem(STAT_SESSION_KEY, "1");
    }

    updateStatDisplay(timeBased + sessionBonus);
  }

  // 测评完成时真实 +1
  window.incrementCompletionCounter = function() {
    var sessionBonus = parseInt(localStorage.getItem(STAT_STORAGE_KEY), 10) || 0;
    sessionBonus += 1;
    localStorage.setItem(STAT_STORAGE_KEY, sessionBonus);
    var daysSince = Math.max(0, Math.floor((Date.now() - STAT_START) / 86400000));
    updateStatDisplay(STAT_BASE + daysSince * STAT_DAILY + sessionBonus);
  };

  function updateStatDisplay(count) {
    var formatted = count.toLocaleString();
    var ids = ["realtime-stat", "realtime-stat-pay", "realtime-stat-profile", "realtime-stat-quiz", "realtime-stat-cta"];
    for (var i = 0; i < ids.length; i++) {
      var el = document.getElementById(ids[i]);
      if (el) el.textContent = formatted;
    }
    var classEls = document.querySelectorAll(".stat-count");
    for (var j = 0; j < classEls.length; j++) {
      classEls[j].textContent = formatted;
    }
  }

  // 所有页面加载统计计数
  loadRealTimeStat();

  // 报告页完成时自动递增
  if (page === "report-free" || page === "report-paid") {
    var completedKey = "opc_quiz_completed_at";
    if (!sessionStorage.getItem(completedKey)) {
      sessionStorage.setItem(completedKey, Date.now().toString());
      window.incrementCompletionCounter();
    }
  }

  // 百度自动推送 — 页面加载时通知百度收录
  (function(){
    var bp = document.createElement('script');
    var curProtocol = window.location.protocol.split(':')[0];
    if (curProtocol === 'https') {
      bp.src = 'https://zz.bdstatic.com/linksubmit/push.js';
    } else {
      bp.src = 'https://push.zhanzhang.baidu.com/push.js';
    }
    var s = document.getElementsByTagName("script")[0];
    s.parentNode.insertBefore(bp, s);
  })();

  // 百度统计 (静态埋点已放 index.html head，此处仅做 backup)
  if (!document.querySelector('script[src*="hm.baidu.com/hm.js"]')) {
    var _hmt = _hmt || [];
    (function(){
      var hm = document.createElement('script');
      hm.src = 'https://hm.baidu.com/hm.js?a5621eae6e5f4f4f530c462888dae44f';
      var s = document.getElementsByTagName("script")[0];
      s.parentNode.insertBefore(hm, s);
    })();
  }
});
