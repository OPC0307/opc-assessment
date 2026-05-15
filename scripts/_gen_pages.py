"""Generate missing pages: FAQ, Terms, Contact (ZH + EN)."""
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

CSP = '<meta http-equiv="Content-Security-Policy" content="default-src \'self\'; script-src \'self\' \'unsafe-inline\' https://hm.baidu.com https://zz.bdstatic.com https://push.zhanzhang.baidu.com; style-src \'self\' \'unsafe-inline\' https://fonts.googleapis.com; font-src \'self\' https://fonts.gstatic.com; img-src \'self\' data: https:; connect-src \'self\' https://hm.baidu.com; frame-src \'none\';">'
FONT_LINKS = '<link rel="preconnect" href="https://fonts.googleapis.com">\n  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;600;700;800&display=swap">'

# ========== FAQ PAGE (ZH) ==========
FAQ_ZH = """<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  {csp}
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
  <title>常见问题 — OPC 一人公司孵化器 | 测评·补贴·注册 FAQ</title>
  <meta name="description" content="OPC一人公司孵化器常见问题解答：测评费用、补贴申请、工商注册、报税代办、退款政策等。快速找到你关心的问题答案。">
  <meta name="keywords" content="一人公司FAQ,OPC常见问题,创业测评问题,补贴申请FAQ,个体户注册问题">
  <meta name="robots" content="index, follow">
  <link rel="canonical" href="https://fhopc.top/faq.html">
  <link rel="alternate" hreflang="zh" href="https://fhopc.top/faq.html">
  <link rel="alternate" hreflang="en" href="https://fhopc.top/en/faq.html">
  <meta property="og:title" content="常见问题 — OPC 一人公司孵化器 FAQ">
  <meta property="og:description" content="OPC一人公司孵化器常见问题解答：测评费用、补贴申请、工商注册、报税代办、退款政策等。">
  <meta property="og:type" content="website">
  <meta property="og:url" content="https://fhopc.top/faq.html">
  <meta property="og:site_name" content="OPC 一人公司孵化器">
  <meta property="og:image" content="https://fhopc.top/assets/images/blog-covers/china-whole-nation-opc-push-2026.png">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="675">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="OPC 一人公司孵化器 — 常见问题">
  <meta name="twitter:description" content="测评费用、补贴申请、工商注册、报税代办等常见问题解答。">
  <meta name="twitter:image" content="https://fhopc.top/assets/images/blog-covers/china-whole-nation-opc-push-2026.png">
  <script type="application/ld+json">
  {{
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {{"@type": "Question", "name": "OPC测评是免费的吗？", "acceptedAnswer": {{"@type": "Answer", "text": "基础测评完全免费，包含6维度能力评估和适配度总分。完整版报告¥19.9，包含30天SOP行动计划、3条定制赛道推荐、避坑指南等。"}}}},
      {{"@type": "Question", "name": "补贴申请成功率有多高？", "acceptedAnswer": {{"@type": "Answer", "text": "首次申请驳回率约62%，主要原因是材料不完整或条件不符。建议先使用我们的补贴查询工具了解当地政策，或选择补贴代办服务(¥399)提高通过率。"}}}},
      {{"@type": "Question", "name": "工商注册代办需要多久？", "acceptedAnswer": {{"@type": "Answer", "text": "通常情况下3-5个工作日可完成工商注册（含营业执照）。部分城市有OPC绿色通道（如深圳、杭州），最快当天可取。"}}}},
      {{"@type": "Question", "name": "可以退款吗？", "acceptedAnswer": {{"@type": "Answer", "text": "测评报告属于数字产品，交付后不支持退款。工商注册代办在材料提交前可全额退款。补贴代办在初审未通过时扣除¥99工本费后退还余额。"}}}}
    ]
  }}
  </script>
  <link rel="icon" type="image/svg+xml" href="favicon.svg">
  <link rel="stylesheet" href="style.css">
  {fonts}
</head>
<body>

<nav class="site-nav" id="site-nav">
  <div class="site-nav__inner">
    <a href="/" class="site-nav__brand">OPC</a>
    <div class="site-nav__links">
      <a href="/profile.html">测评</a>
      <a href="/subsidy/">补贴查询</a>
      <a href="/services/">服务</a>
      <a href="/cases.html">案例</a>
      <a href="/blog/">博客</a>
      <a href="/about.html">关于</a>
    </div>
    <a href="/en/faq.html" class="lang-toggle">EN</a>
  </div>
</nav>

<section class="fw-hero" style="padding:100px 32px 80px;">
  <div class="fw-inner">
    <div class="fw-hero__note" style="margin-top:0;margin-bottom:16px;">常见问题</div>
    <h1 class="fw-hero__title" style="font-size:clamp(2.5rem,5vw,3.5rem);">FAQ · 常见问题</h1>
    <p class="fw-hero__sub">大家都关心的问题，一次性回答清楚</p>
  </div>
</section>

<section class="fw-section">
  <div class="fw-inner" style="max-width:780px;">

    <h2 style="font-size:1.5rem;font-weight:600;color:#1d1d1f;margin-bottom:32px;letter-spacing:-0.02em;">测评相关</h2>
    <div style="margin-bottom:32px;">
      <div style="font-size:1.0625rem;font-weight:600;color:#1d1d1f;margin-bottom:8px;">Q: OPC测评是免费的吗？</div>
      <div style="font-size:0.9375rem;color:#6e6e73;line-height:1.7;">A: 基础测评完全免费，只需15分钟完成15道题，即可获得6大维度能力评估和适配度总分。如果你需要更深入的分析，完整版报告¥19.9，包含30天SOP行动计划、3条定制赛道推荐、详细避坑指南和行业对标数据。</div>
    </div>
    <div style="margin-bottom:32px;">
      <div style="font-size:1.0625rem;font-weight:600;color:#1d1d1f;margin-bottom:8px;">Q: 测评需要多长时间？</div>
      <div style="font-size:0.9375rem;color:#6e6e73;line-height:1.7;">A: 15道选择题，约3-5分钟即可完成。建议在安静环境下认真作答，结果会更准确。</div>
    </div>
    <div style="margin-bottom:32px;">
      <div style="font-size:1.0625rem;font-weight:600;color:#1d1d1f;margin-bottom:8px;">Q: 测评结果准确吗？</div>
      <div style="font-size:0.9375rem;color:#6e6e73;line-height:1.7;">A: 测评基于6大维度（独立决策力、资源整合力、抗风险韧性、品牌构建力、系统运营力、持续学习力），采用加权评分模型。已有超过5,000人完成测评，用户反馈准确率约85%。但它是一个参考工具，最终决策还需要结合你自己的判断。</div>
    </div>

    <h2 style="font-size:1.5rem;font-weight:600;color:#1d1d1f;margin-bottom:32px;margin-top:48px;letter-spacing:-0.02em;">补贴相关</h2>
    <div style="margin-bottom:32px;">
      <div style="font-size:1.0625rem;font-weight:600;color:#1d1d1f;margin-bottom:8px;">Q: 我能领多少创业补贴？</div>
      <div style="font-size:0.9375rem;color:#6e6e73;line-height:1.7;">A: 补贴金额因城市和个人条件差异较大。深圳补贴力度最大（年度最高6万+），杭州、上海等地也不错。建议先查看我们的<a href="/subsidy/">全国20城补贴查询</a>，输入你所在城市获取具体数据。</div>
    </div>
    <div style="margin-bottom:32px;">
      <div style="font-size:1.0625rem;font-weight:600;color:#1d1d1f;margin-bottom:8px;">Q: 补贴申请成功率有多高？</div>
      <div style="font-size:0.9375rem;color:#6e6e73;line-height:1.7;">A: 首次申请驳回率约62%，主要是因为材料不完整、条件不符或填写有误。我们提供<a href="/services/subsidy.html">补贴代办服务</a>(¥399)，由专业团队协助准备材料和申请流程，可显著提高通过率。</div>
    </div>
    <div style="margin-bottom:32px;">
      <div style="font-size:1.0625rem;font-weight:600;color:#1d1d1f;margin-bottom:8px;">Q: 不同城市的补贴能叠加吗？</div>
      <div style="font-size:0.9375rem;color:#6e6e73;line-height:1.7;">A: 通常不能跨城市叠加。你需要在一个城市注册企业并实际经营。但同一城市内的市、区两级补贴一般可以叠加享受。具体以当地政策为准。</div>
    </div>

    <h2 style="font-size:1.5rem;font-weight:600;color:#1d1d1f;margin-bottom:32px;margin-top:48px;letter-spacing:-0.02em;">注册与服务</h2>
    <div style="margin-bottom:32px;">
      <div style="font-size:1.0625rem;font-weight:600;color:#1d1d1f;margin-bottom:8px;">Q: 工商注册代办需要多久？</div>
      <div style="font-size:0.9375rem;color:#6e6e73;line-height:1.7;">A: 通常3-5个工作日可完成工商注册（含营业执照）。部分地区支持网上全流程办理，最快当天即可完成。深圳、杭州等城市有OPC绿色通道。代办服务¥399起，包含核名、注册、银行开户辅导等。</div>
    </div>
    <div style="margin-bottom:32px;">
      <div style="font-size:1.0625rem;font-weight:600;color:#1d1d1f;margin-bottom:8px;">Q: 可以退款吗？</div>
      <div style="font-size:0.9375rem;color:#6e6e73;line-height:1.7;">A: 测评报告属于数字产品，交付后不支持退款（建议先查看<a href="/report-sample.html">免费报告样例</a>）。工商注册代办在材料提交前可全额退款。补贴代办在初审未通过时扣除¥99工本费后退还余额。1v1深度诊断服务在诊断前可全额退款。</div>
    </div>
    <div style="margin-bottom:32px;">
      <div style="font-size:1.0625rem;font-weight:600;color:#1d1d1f;margin-bottom:8px;">Q: 需要亲自到场吗？</div>
      <div style="font-size:0.9375rem;color:#6e6e73;line-height:1.7;">A: 大部分流程可以在线完成。测评和报告查看完全在线。工商注册部分地区支持全程电子化。但如果涉及银行开户或特定审批，可能需要本人到场一次。</div>
    </div>

  </div>
</section>

<section class="fw-section" style="text-align:left;">
  <div class="fw-inner" style="max-width:780px;">
    <div style="border-top:1px solid #e5e5e5;padding-top:48px;">
      <p style="font-size:1.1875rem;color:#1d1d1f;font-weight:600;margin-bottom:12px;letter-spacing:-0.02em;">还有问题？</p>
      <p style="font-size:1rem;color:#6e6e73;margin-bottom:28px;line-height:1.5;">先测测你的适配度，或直接联系我们获取一对一咨询。</p>
      <a href="/profile.html" class="fw-hero__cta" style="margin-right:12px;">免费测评</a>
      <a href="/contact.html" style="font-size:0.9375rem;color:#1d1d1f;text-decoration:none;border-bottom:1px solid #1d1d1f;padding-bottom:2px;">联系我们 →</a>
    </div>
  </div>
</section>

<footer class="fw-footer">
  <div class="fw-inner">
    一人公司孵化器 <span class="fw-footer__sep">|</span> fhopc.top <span class="fw-footer__sep">|</span> <a href="/">首页</a> <span class="fw-footer__sep">|</span> <a href="/privacy.html">隐私政策</a> <span class="fw-footer__sep">|</span> <a href="/terms.html">服务条款</a>
    <div style="font-size:0.6875rem;color:#86868b;margin-top:4px;">最后更新：2026年5月</div>
  </div>
</footer>

<script src="app-core.js"></script>
</body>
</html>"""

# ========== TERMS PAGE (ZH) ==========
TERMS_ZH = """<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  {csp}
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
  <title>服务条款 — OPC 一人公司孵化器</title>
  <meta name="description" content="OPC一人公司孵化器服务条款：使用条件、服务说明、退款政策、知识产权声明、免责条款。使用本网站即表示同意以下条款。">
  <meta name="robots" content="index, follow">
  <link rel="canonical" href="https://fhopc.top/terms.html">
  <link rel="alternate" hreflang="zh" href="https://fhopc.top/terms.html">
  <link rel="alternate" hreflang="en" href="https://fhopc.top/en/terms.html">
  <meta property="og:title" content="服务条款 — OPC 一人公司孵化器">
  <meta property="og:description" content="使用条件、服务说明、退款政策、知识产权声明、免责条款。">
  <meta property="og:type" content="website">
  <meta property="og:url" content="https://fhopc.top/terms.html">
  <meta property="og:site_name" content="OPC 一人公司孵化器">
  <meta property="og:image" content="https://fhopc.top/assets/images/blog-covers/china-whole-nation-opc-push-2026.png">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="675">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="OPC 一人公司孵化器 — 服务条款">
  <meta name="twitter:description" content="使用条件、服务说明、退款政策、知识产权声明、免责条款。">
  <meta name="twitter:image" content="https://fhopc.top/assets/images/blog-covers/china-whole-nation-opc-push-2026.png">
  <link rel="icon" type="image/svg+xml" href="favicon.svg">
  <link rel="stylesheet" href="style.css">
  {fonts}
</head>
<body>

<nav class="site-nav" id="site-nav">
  <div class="site-nav__inner">
    <a href="/" class="site-nav__brand">OPC</a>
    <div class="site-nav__links">
      <a href="/profile.html">测评</a>
      <a href="/subsidy/">补贴查询</a>
      <a href="/services/">服务</a>
      <a href="/cases.html">案例</a>
      <a href="/blog/">博客</a>
      <a href="/about.html">关于</a>
    </div>
    <a href="/en/terms.html" class="lang-toggle">EN</a>
  </div>
</nav>

<section class="fw-hero" style="padding:100px 32px 80px;">
  <div class="fw-inner">
    <div class="fw-hero__note" style="margin-top:0;margin-bottom:16px;">法律信息</div>
    <h1 class="fw-hero__title" style="font-size:clamp(2.5rem,5vw,3.5rem);">服务条款</h1>
    <p class="fw-hero__sub">使用本网站即表示同意以下服务条款</p>
  </div>
</section>

<section class="fw-section">
  <div class="fw-inner" style="max-width:780px;">

    <h2 style="font-size:1.25rem;font-weight:600;color:#1d1d1f;margin-bottom:16px;">1. 服务说明</h2>
    <p style="font-size:0.9375rem;color:#6e6e73;line-height:1.8;margin-bottom:32px;">OPC一人公司孵化器（以下简称"本网站"）提供一人公司适配度测评、创业补贴查询、工商注册代办、税务代办、补贴申请代办等服务。所有服务内容以本网站实际展示为准。</p>

    <h2 style="font-size:1.25rem;font-weight:600;color:#1d1d1f;margin-bottom:16px;">2. 用户责任</h2>
    <p style="font-size:0.9375rem;color:#6e6e73;line-height:1.8;margin-bottom:32px;">用户应保证提供的所有信息和材料真实、准确、完整。因用户提供虚假信息导致的任何后果由用户自行承担。用户不得利用本网站从事违法活动。</p>

    <h2 style="font-size:1.25rem;font-weight:600;color:#1d1d1f;margin-bottom:16px;">3. 服务费用与支付</h2>
    <p style="font-size:0.9375rem;color:#6e6e73;line-height:1.8;margin-bottom:32px;">各项服务价格以购买时页面显示为准。我们保留调整价格的权利。所有价格均为人民币（¥）计价。</p>

    <h2 style="font-size:1.25rem;font-weight:600;color:#1d1d1f;margin-bottom:16px;">4. 退款政策</h2>
    <p style="font-size:0.9375rem;color:#6e6e73;line-height:1.8;margin-bottom:32px;">测评报告属于数字产品，一经交付不支持退款。建议在购买完整报告前先查看免费报告样例。工商注册代办：材料提交至工商部门前可全额退款，提交后不予退款。补贴代办：初审阶段扣除¥99工本费后退还余额，提交至政府部门后不予退款。1v1深度诊断：诊断服务开始前可全额退款。</p>

    <h2 style="font-size:1.25rem;font-weight:600;color:#1d1d1f;margin-bottom:16px;">5. 知识产权</h2>
    <p style="font-size:0.9375rem;color:#6e6e73;line-height:1.8;margin-bottom:32px;">本网站所有内容（包括但不限于文字、图表、测评模型、报告模板）的知识产权归本网站所有，受著作权法保护。未经书面授权，禁止复制、转载或用于商业用途。</p>

    <h2 style="font-size:1.25rem;font-weight:600;color:#1d1d1f;margin-bottom:16px;">6. 免责声明</h2>
    <p style="font-size:0.9375rem;color:#6e6e73;line-height:1.8;margin-bottom:32px;">测评结果仅供参考，不构成任何形式的职业建议或商业保证。补贴信息力求准确但可能因政策变化而更新延迟，具体以当地政府部门公布为准。工商注册和补贴代办服务的结果取决于政府部门审批，本网站不对审批结果做任何保证。因不可抗力（包括但不限于政策变更、自然灾害）导致服务无法履行的，本网站不承担责任。</p>

    <h2 style="font-size:1.25rem;font-weight:600;color:#1d1d1f;margin-bottom:16px;">7. 隐私保护</h2>
    <p style="font-size:0.9375rem;color:#6e6e73;line-height:1.8;margin-bottom:32px;">我们重视您的隐私。详细信息请参阅我们的<a href="/privacy.html">隐私政策</a>。</p>

    <h2 style="font-size:1.25rem;font-weight:600;color:#1d1d1f;margin-bottom:16px;">8. 条款修改</h2>
    <p style="font-size:0.9375rem;color:#6e6e73;line-height:1.8;margin-bottom:32px;">我们保留随时修改本服务条款的权利。修改后的条款将在本页面公布，继续使用本网站即表示接受修改后的条款。</p>

  </div>
</section>

<footer class="fw-footer">
  <div class="fw-inner">
    一人公司孵化器 <span class="fw-footer__sep">|</span> fhopc.top <span class="fw-footer__sep">|</span> <a href="/">首页</a> <span class="fw-footer__sep">|</span> <a href="/privacy.html">隐私政策</a> <span class="fw-footer__sep">|</span> <a href="/faq.html">常见问题</a>
    <div style="font-size:0.6875rem;color:#86868b;margin-top:4px;">最后更新：2026年5月15日</div>
  </div>
</footer>

<script src="app-core.js"></script>
</body>
</html>"""

# ========== CONTACT PAGE (ZH) ==========
CONTACT_ZH = """<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  {csp}
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
  <title>联系我们 — OPC 一人公司孵化器 | 微信·邮箱·社群</title>
  <meta name="description" content="联系OPC一人公司孵化器：微信扫码咨询、邮件联系、加入一人公司创业者社群。专业团队为你的创业之路保驾护航。">
  <meta name="keywords" content="OPC联系方式,一人公司咨询,创业咨询,微信咨询,创业者社群">
  <meta name="robots" content="index, follow">
  <link rel="canonical" href="https://fhopc.top/contact.html">
  <link rel="alternate" hreflang="zh" href="https://fhopc.top/contact.html">
  <link rel="alternate" hreflang="en" href="https://fhopc.top/en/contact.html">
  <meta property="og:title" content="联系我们 — OPC 一人公司孵化器">
  <meta property="og:description" content="微信扫码咨询、邮件联系、加入一人公司创业者社群。">
  <meta property="og:type" content="website">
  <meta property="og:url" content="https://fhopc.top/contact.html">
  <meta property="og:site_name" content="OPC 一人公司孵化器">
  <meta property="og:image" content="https://fhopc.top/assets/images/blog-covers/china-whole-nation-opc-push-2026.png">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="675">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="OPC 一人公司孵化器 — 联系我们">
  <meta name="twitter:description" content="微信扫码咨询、邮件联系、加入一人公司创业者社群。">
  <meta name="twitter:image" content="https://fhopc.top/assets/images/blog-covers/china-whole-nation-opc-push-2026.png">
  <link rel="icon" type="image/svg+xml" href="favicon.svg">
  <link rel="stylesheet" href="style.css">
  {fonts}
</head>
<body>

<nav class="site-nav" id="site-nav">
  <div class="site-nav__inner">
    <a href="/" class="site-nav__brand">OPC</a>
    <div class="site-nav__links">
      <a href="/profile.html">测评</a>
      <a href="/subsidy/">补贴查询</a>
      <a href="/services/">服务</a>
      <a href="/cases.html">案例</a>
      <a href="/blog/">博客</a>
      <a href="/about.html">关于</a>
    </div>
    <a href="/en/contact.html" class="lang-toggle">EN</a>
  </div>
</nav>

<section class="fw-hero" style="padding:100px 32px 80px;">
  <div class="fw-inner">
    <div class="fw-hero__note" style="margin-top:0;margin-bottom:16px;">联系我们</div>
    <h1 class="fw-hero__title" style="font-size:clamp(2.5rem,5vw,3.5rem);">联系我们</h1>
    <p class="fw-hero__sub">有任何问题，通过以下方式联系我们</p>
  </div>
</section>

<section class="fw-section">
  <div class="fw-inner" style="max-width:780px;">

    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:32px;margin-bottom:48px;">

      <div style="padding:32px 24px;border:1px solid #e5e5e5;text-align:center;">
        <div style="font-size:1.5rem;margin-bottom:12px;">微信咨询</div>
        <div style="font-size:0.9375rem;color:#6e6e73;line-height:1.6;margin-bottom:16px;">扫描二维码添加客服微信，免费咨询</div>
        <img src="assets/wechat-qr.png" alt="微信客服二维码" style="width:150px;height:150px;border-radius:10px;border:2px solid #e5e5e5;">
        <div style="font-size:0.75rem;color:#86868b;margin-top:8px;">工作日 9:00-18:00</div>
      </div>

      <div style="padding:32px 24px;border:1px solid #e5e5e5;text-align:center;">
        <div style="font-size:1.5rem;margin-bottom:12px;">邮件联系</div>
        <div style="font-size:0.9375rem;color:#6e6e73;line-height:1.6;margin-bottom:16px;">发送邮件至以下地址，我们将在24小时内回复</div>
        <div style="font-size:1.0625rem;font-weight:600;color:#1d1d1f;margin-bottom:8px;">support@fhopc.top</div>
        <div style="font-size:0.75rem;color:#86868b;">适合：商务合作、媒体咨询、投诉建议</div>
      </div>

      <div style="padding:32px 24px;border:1px solid #e5e5e5;text-align:center;">
        <div style="font-size:1.5rem;margin-bottom:12px;">创业者社群</div>
        <div style="font-size:0.9375rem;color:#6e6e73;line-height:1.6;margin-bottom:16px;">加入全国一人公司创业者社群，与同行交流经验</div>
        <div style="font-size:0.9375rem;color:#6e6e73;line-height:1.6;margin-bottom:16px;">添加客服微信时备注"入群"，即可免费加入</div>
        <div style="font-size:0.75rem;color:#86868b;">已有 2,000+ 创业者加入</div>
      </div>

    </div>

    <div style="border-top:1px solid #e5e5e5;padding-top:48px;text-align:center;">
      <p style="font-size:1.1875rem;color:#1d1d1f;font-weight:600;margin-bottom:12px;letter-spacing:-0.02em;">还不知道从哪里开始？</p>
      <p style="font-size:1rem;color:#6e6e73;margin-bottom:28px;line-height:1.5;">先做测评，看清自己的方向，再决定下一步。</p>
      <a href="/profile.html" class="fw-hero__cta">免费测评 →</a>
    </div>

  </div>
</section>

<footer class="fw-footer">
  <div class="fw-inner">
    一人公司孵化器 <span class="fw-footer__sep">|</span> fhopc.top <span class="fw-footer__sep">|</span> <a href="/">首页</a> <span class="fw-footer__sep">|</span> <a href="/privacy.html">隐私政策</a> <span class="fw-footer__sep">|</span> <a href="/terms.html">服务条款</a>
    <div style="font-size:0.6875rem;color:#86868b;margin-top:4px;">最后更新：2026年5月</div>
  </div>
</footer>

<script src="app-core.js"></script>
</body>
</html>"""

# ========== FAQ (EN) ==========
FAQ_EN = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  {csp}
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
  <title>FAQ — OPC One-Person Company Incubator | Assessment · Subsidies · Registration</title>
  <meta name="description" content="OPC Incubator FAQ: assessment pricing, subsidy application, business registration, tax filing, refund policy. Find answers to common questions.">
  <meta name="robots" content="index, follow">
  <link rel="canonical" href="https://fhopc.top/en/faq.html">
  <link rel="alternate" hreflang="en" href="https://fhopc.top/en/faq.html">
  <link rel="alternate" hreflang="zh" href="https://fhopc.top/faq.html">
  <meta property="og:title" content="FAQ — OPC One-Person Company Incubator">
  <meta property="og:description" content="Assessment pricing, subsidy application, business registration, tax filing, and refund policy FAQ.">
  <meta property="og:type" content="website">
  <meta property="og:url" content="https://fhopc.top/en/faq.html">
  <meta property="og:site_name" content="OPC One-Person Company Incubator">
  <meta property="og:image" content="https://fhopc.top/assets/images/blog-covers/china-whole-nation-opc-push-2026.png">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="675">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="OPC Incubator — FAQ">
  <meta name="twitter:description" content="Assessment pricing, subsidy application, business registration, and refund policy FAQ.">
  <meta name="twitter:image" content="https://fhopc.top/assets/images/blog-covers/china-whole-nation-opc-push-2026.png">
  <link rel="icon" type="image/svg+xml" href="/favicon.svg">
  <link rel="stylesheet" href="/style.css">
  {fonts}
</head>
<body>

<nav class="site-nav" id="site-nav">
  <div class="site-nav__inner">
    <a href="/en/" class="site-nav__brand">OPC</a>
    <div class="site-nav__links">
      <a href="/profile.html">Assessment</a>
      <a href="/en/subsidy/">Subsidies</a>
      <a href="/en/services/">Services</a>
      <a href="/en/cases.html">Cases</a>
      <a href="/blog/">Blog</a>
      <a href="/en/about.html">About</a>
    </div>
    <a href="/faq.html" class="lang-toggle">中文</a>
  </div>
</nav>

<section class="fw-hero" style="padding:100px 32px 80px;">
  <div class="fw-inner">
    <div class="fw-hero__note" style="margin-top:0;margin-bottom:16px;">Frequently Asked Questions</div>
    <h1 class="fw-hero__title" style="font-size:clamp(2.5rem,5vw,3.5rem);">FAQ</h1>
    <p class="fw-hero__sub">Common questions, answered clearly</p>
  </div>
</section>

<section class="fw-section">
  <div class="fw-inner" style="max-width:780px;">

    <h2 style="font-size:1.5rem;font-weight:600;color:#1d1d1f;margin-bottom:32px;letter-spacing:-0.02em;">Assessment</h2>
    <div style="margin-bottom:32px;">
      <div style="font-size:1.0625rem;font-weight:600;color:#1d1d1f;margin-bottom:8px;">Q: Is the OPC assessment free?</div>
      <div style="font-size:0.9375rem;color:#6e6e73;line-height:1.7;">A: The basic assessment is completely free. You get a 6-dimension capability evaluation and an overall fitness score. The full report (¥19.9) adds a 30-day SOP action plan, 3 customized career track recommendations, pitfall guide, and industry benchmarking data.</div>
    </div>
    <div style="margin-bottom:32px;">
      <div style="font-size:1.0625rem;font-weight:600;color:#1d1d1f;margin-bottom:8px;">Q: How long does the assessment take?</div>
      <div style="font-size:0.9375rem;color:#6e6e73;line-height:1.7;">A: 15 questions, approximately 3-5 minutes. We recommend taking it in a quiet environment for more accurate results.</div>
    </div>
    <div style="margin-bottom:32px;">
      <div style="font-size:1.0625rem;font-weight:600;color:#1d1d1f;margin-bottom:8px;">Q: How accurate is the assessment?</div>
      <div style="font-size:0.9375rem;color:#6e6e73;line-height:1.7;">A: Based on 6 dimensions with a weighted scoring model, tested by 5,000+ users with ~85% accuracy. It's a reference tool — combine with your own judgment for final decisions.</div>
    </div>

    <h2 style="font-size:1.5rem;font-weight:600;color:#1d1d1f;margin-bottom:32px;margin-top:48px;letter-spacing:-0.02em;">Subsidies</h2>
    <div style="margin-bottom:32px;">
      <div style="font-size:1.0625rem;font-weight:600;color:#1d1d1f;margin-bottom:8px;">Q: How much subsidy can I get?</div>
      <div style="font-size:0.9375rem;color:#6e6e73;line-height:1.7;">A: Amounts vary by city and personal qualifications. Shenzhen offers the most (up to ¥60,000+/year). Check our <a href="/en/subsidy/">20-city subsidy lookup</a> for your city.</div>
    </div>
    <div style="margin-bottom:32px;">
      <div style="font-size:1.0625rem;font-weight:600;color:#1d1d1f;margin-bottom:8px;">Q: What is the subsidy approval rate?</div>
      <div style="font-size:0.9375rem;color:#6e6e73;line-height:1.7;">A: First-time rejection rate is ~62%, mostly due to incomplete paperwork. Our <a href="/en/services/subsidy.html">subsidy application service</a> (¥399) helps improve your chances.</div>
    </div>

    <h2 style="font-size:1.5rem;font-weight:600;color:#1d1d1f;margin-bottom:32px;margin-top:48px;letter-spacing:-0.02em;">Services & Refunds</h2>
    <div style="margin-bottom:32px;">
      <div style="font-size:1.0625rem;font-weight:600;color:#1d1d1f;margin-bottom:8px;">Q: How long does business registration take?</div>
      <div style="font-size:0.9375rem;color:#6e6e73;line-height:1.7;">A: Typically 3-5 business days. Some cities (Shenzhen, Hangzhou) offer same-day processing via OPC green lanes. Our service starts at ¥399.</div>
    </div>
    <div style="margin-bottom:32px;">
      <div style="font-size:1.0625rem;font-weight:600;color:#1d1d1f;margin-bottom:8px;">Q: Can I get a refund?</div>
      <div style="font-size:0.9375rem;color:#6e6e73;line-height:1.7;">A: Digital reports are non-refundable after delivery (check the <a href="/report-sample.html">free sample</a> first). Registration service: full refund before submission. Subsidy service: ¥99 processing fee deducted if pre-approval fails. 1-on-1 consultation: full refund before the session starts.</div>
    </div>

  </div>
</section>

<section class="fw-section" style="text-align:left;">
  <div class="fw-inner" style="max-width:780px;">
    <div style="border-top:1px solid #e5e5e5;padding-top:48px;">
      <p style="font-size:1.1875rem;color:#1d1d1f;font-weight:600;margin-bottom:12px;letter-spacing:-0.02em;">Still have questions?</p>
      <p style="font-size:1rem;color:#6e6e73;margin-bottom:28px;line-height:1.5;">Take the free assessment or contact us directly.</p>
      <a href="/profile.html" class="fw-hero__cta" style="margin-right:12px;">Free Assessment</a>
      <a href="/en/contact.html" style="font-size:0.9375rem;color:#1d1d1f;text-decoration:none;border-bottom:1px solid #1d1d1f;padding-bottom:2px;">Contact Us →</a>
    </div>
  </div>
</section>

<footer class="fw-footer">
  <div class="fw-inner">
    OPC Incubator <span class="fw-footer__sep">|</span> fhopc.top <span class="fw-footer__sep">|</span> <a href="/en/">Home</a> <span class="fw-footer__sep">|</span> <a href="/en/privacy.html">Privacy</a> <span class="fw-footer__sep">|</span> <a href="/en/terms.html">Terms</a>
    <div style="font-size:0.6875rem;color:#86868b;margin-top:4px;">Last updated: May 2026</div>
  </div>
</footer>

<script src="/app-core.js"></script>
</body>
</html>"""

# ========== TERMS (EN) ==========
TERMS_EN = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  {csp}
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
  <title>Terms of Service — OPC One-Person Company Incubator</title>
  <meta name="description" content="OPC Incubator Terms of Service: usage conditions, service descriptions, refund policy, intellectual property, disclaimers. By using this site you agree to these terms.">
  <meta name="robots" content="index, follow">
  <link rel="canonical" href="https://fhopc.top/en/terms.html">
  <link rel="alternate" hreflang="en" href="https://fhopc.top/en/terms.html">
  <link rel="alternate" hreflang="zh" href="https://fhopc.top/terms.html">
  <meta property="og:title" content="Terms of Service — OPC One-Person Company Incubator">
  <meta property="og:description" content="Usage conditions, service descriptions, refund policy, intellectual property, disclaimers.">
  <meta property="og:type" content="website">
  <meta property="og:url" content="https://fhopc.top/en/terms.html">
  <meta property="og:site_name" content="OPC One-Person Company Incubator">
  <meta property="og:image" content="https://fhopc.top/assets/images/blog-covers/china-whole-nation-opc-push-2026.png">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="675">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="OPC Incubator — Terms of Service">
  <meta name="twitter:description" content="Usage conditions, service descriptions, refund policy, intellectual property, disclaimers.">
  <meta name="twitter:image" content="https://fhopc.top/assets/images/blog-covers/china-whole-nation-opc-push-2026.png">
  <link rel="icon" type="image/svg+xml" href="/favicon.svg">
  <link rel="stylesheet" href="/style.css">
  {fonts}
</head>
<body>

<nav class="site-nav" id="site-nav">
  <div class="site-nav__inner">
    <a href="/en/" class="site-nav__brand">OPC</a>
    <div class="site-nav__links">
      <a href="/profile.html">Assessment</a>
      <a href="/en/subsidy/">Subsidies</a>
      <a href="/en/services/">Services</a>
      <a href="/en/cases.html">Cases</a>
      <a href="/blog/">Blog</a>
      <a href="/en/about.html">About</a>
    </div>
    <a href="/terms.html" class="lang-toggle">中文</a>
  </div>
</nav>

<section class="fw-hero" style="padding:100px 32px 80px;">
  <div class="fw-inner">
    <div class="fw-hero__note" style="margin-top:0;margin-bottom:16px;">Legal</div>
    <h1 class="fw-hero__title" style="font-size:clamp(2.5rem,5vw,3.5rem);">Terms of Service</h1>
    <p class="fw-hero__sub">By using this site you agree to these terms</p>
  </div>
</section>

<section class="fw-section">
  <div class="fw-inner" style="max-width:780px;">

    <h2 style="font-size:1.25rem;font-weight:600;color:#1d1d1f;margin-bottom:16px;">1. Service Description</h2>
    <p style="font-size:0.9375rem;color:#6e6e73;line-height:1.8;margin-bottom:32px;">OPC One-Person Company Incubator provides OPC fitness assessments, startup subsidy lookup, business registration, tax filing, and subsidy application services. All services are as described on this website.</p>

    <h2 style="font-size:1.25rem;font-weight:600;color:#1d1d1f;margin-bottom:16px;">2. User Responsibilities</h2>
    <p style="font-size:0.9375rem;color:#6e6e73;line-height:1.8;margin-bottom:32px;">Users must provide true, accurate, and complete information. Consequences of submitting false information are the user's sole responsibility. Users may not use this site for illegal activities.</p>

    <h2 style="font-size:1.25rem;font-weight:600;color:#1d1d1f;margin-bottom:16px;">3. Fees & Payment</h2>
    <p style="font-size:0.9375rem;color:#6e6e73;line-height:1.8;margin-bottom:32px;">Service prices are as shown at time of purchase. We reserve the right to adjust prices. All prices are in Chinese Yuan (¥).</p>

    <h2 style="font-size:1.25rem;font-weight:600;color:#1d1d1f;margin-bottom:16px;">4. Refund Policy</h2>
    <p style="font-size:0.9375rem;color:#6e6e73;line-height:1.8;margin-bottom:32px;">Digital assessment reports: non-refundable after delivery (check free sample first). Business registration: full refund before document submission to government. Subsidy application: ¥99 processing fee retained if pre-approval fails; no refund after government submission. 1-on-1 consultation: full refund before the session.</p>

    <h2 style="font-size:1.25rem;font-weight:600;color:#1d1d1f;margin-bottom:16px;">5. Intellectual Property</h2>
    <p style="font-size:0.9375rem;color:#6e6e73;line-height:1.8;margin-bottom:32px;">All content on this website (including text, graphics, assessment models, report templates) is our intellectual property, protected by copyright law. Reproduction or commercial use requires written authorization.</p>

    <h2 style="font-size:1.25rem;font-weight:600;color:#1d1d1f;margin-bottom:16px;">6. Disclaimer</h2>
    <p style="font-size:0.9375rem;color:#6e6e73;line-height:1.8;margin-bottom:32px;">Assessment results are for reference only, not professional or business advice. Subsidy information is updated regularly but may lag policy changes — verify with local government. Registration and subsidy application outcomes depend on government approval. We are not liable for service interruptions due to force majeure (policy changes, natural disasters).</p>

    <h2 style="font-size:1.25rem;font-weight:600;color:#1d1d1f;margin-bottom:16px;">7. Privacy</h2>
    <p style="font-size:0.9375rem;color:#6e6e73;line-height:1.8;margin-bottom:32px;">We value your privacy. See our <a href="/en/privacy.html">Privacy Policy</a> for details.</p>

    <h2 style="font-size:1.25rem;font-weight:600;color:#1d1d1f;margin-bottom:16px;">8. Changes to Terms</h2>
    <p style="font-size:0.9375rem;color:#6e6e73;line-height:1.8;margin-bottom:32px;">We reserve the right to modify these terms. Changes will be posted on this page. Continued use of the site constitutes acceptance.</p>

  </div>
</section>

<footer class="fw-footer">
  <div class="fw-inner">
    OPC Incubator <span class="fw-footer__sep">|</span> fhopc.top <span class="fw-footer__sep">|</span> <a href="/en/">Home</a> <span class="fw-footer__sep">|</span> <a href="/en/privacy.html">Privacy</a> <span class="fw-footer__sep">|</span> <a href="/en/faq.html">FAQ</a>
    <div style="font-size:0.6875rem;color:#86868b;margin-top:4px;">Last updated: May 15, 2026</div>
  </div>
</footer>

<script src="/app-core.js"></script>
</body>
</html>"""

# ========== CONTACT (EN) ==========
CONTACT_EN = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  {csp}
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
  <title>Contact Us — OPC One-Person Company Incubator | WeChat · Email · Community</title>
  <meta name="description" content="Contact OPC Incubator: WeChat QR code consultation, email support, join the OPC entrepreneur community. Professional team to support your solo business journey.">
  <meta name="robots" content="index, follow">
  <link rel="canonical" href="https://fhopc.top/en/contact.html">
  <link rel="alternate" hreflang="en" href="https://fhopc.top/en/contact.html">
  <link rel="alternate" hreflang="zh" href="https://fhopc.top/contact.html">
  <meta property="og:title" content="Contact Us — OPC One-Person Company Incubator">
  <meta property="og:description" content="WeChat QR code consultation, email support, join the OPC entrepreneur community.">
  <meta property="og:type" content="website">
  <meta property="og:url" content="https://fhopc.top/en/contact.html">
  <meta property="og:site_name" content="OPC One-Person Company Incubator">
  <meta property="og:image" content="https://fhopc.top/assets/images/blog-covers/china-whole-nation-opc-push-2026.png">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="675">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="OPC Incubator — Contact Us">
  <meta name="twitter:description" content="WeChat QR code consultation, email support, join the OPC entrepreneur community.">
  <meta name="twitter:image" content="https://fhopc.top/assets/images/blog-covers/china-whole-nation-opc-push-2026.png">
  <link rel="icon" type="image/svg+xml" href="/favicon.svg">
  <link rel="stylesheet" href="/style.css">
  {fonts}
</head>
<body>

<nav class="site-nav" id="site-nav">
  <div class="site-nav__inner">
    <a href="/en/" class="site-nav__brand">OPC</a>
    <div class="site-nav__links">
      <a href="/profile.html">Assessment</a>
      <a href="/en/subsidy/">Subsidies</a>
      <a href="/en/services/">Services</a>
      <a href="/en/cases.html">Cases</a>
      <a href="/blog/">Blog</a>
      <a href="/en/about.html">About</a>
    </div>
    <a href="/contact.html" class="lang-toggle">中文</a>
  </div>
</nav>

<section class="fw-hero" style="padding:100px 32px 80px;">
  <div class="fw-inner">
    <div class="fw-hero__note" style="margin-top:0;margin-bottom:16px;">Contact</div>
    <h1 class="fw-hero__title" style="font-size:clamp(2.5rem,5vw,3.5rem);">Contact Us</h1>
    <p class="fw-hero__sub">Have questions? Reach out through any of these channels</p>
  </div>
</section>

<section class="fw-section">
  <div class="fw-inner" style="max-width:780px;">

    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:32px;margin-bottom:48px;">

      <div style="padding:32px 24px;border:1px solid #e5e5e5;text-align:center;">
        <div style="font-size:1.5rem;margin-bottom:12px;">WeChat</div>
        <div style="font-size:0.9375rem;color:#6e6e73;line-height:1.6;margin-bottom:16px;">Scan the QR code to add our customer service on WeChat for free consultation</div>
        <img src="/assets/wechat-qr.png" alt="WeChat QR Code" style="width:150px;height:150px;border-radius:10px;border:2px solid #e5e5e5;">
        <div style="font-size:0.75rem;color:#86868b;margin-top:8px;">Weekdays 9:00-18:00 (Beijing time)</div>
      </div>

      <div style="padding:32px 24px;border:1px solid #e5e5e5;text-align:center;">
        <div style="font-size:1.5rem;margin-bottom:12px;">Email</div>
        <div style="font-size:0.9375rem;color:#6e6e73;line-height:1.6;margin-bottom:16px;">Send us an email, we'll respond within 24 hours</div>
        <div style="font-size:1.0625rem;font-weight:600;color:#1d1d1f;margin-bottom:8px;">support@fhopc.top</div>
        <div style="font-size:0.75rem;color:#86868b;">Best for: business inquiries, media, complaints & suggestions</div>
      </div>

      <div style="padding:32px 24px;border:1px solid #e5e5e5;text-align:center;">
        <div style="font-size:1.5rem;margin-bottom:12px;">Community</div>
        <div style="font-size:0.9375rem;color:#6e6e73;line-height:1.6;margin-bottom:16px;">Join our nationwide OPC entrepreneur community to connect with peers</div>
        <div style="font-size:0.9375rem;color:#6e6e73;line-height:1.6;margin-bottom:16px;">Add us on WeChat and mention "community" to join for free</div>
        <div style="font-size:0.75rem;color:#86868b;">2,000+ entrepreneurs already joined</div>
      </div>

    </div>

    <div style="border-top:1px solid #e5e5e5;padding-top:48px;text-align:center;">
      <p style="font-size:1.1875rem;color:#1d1d1f;font-weight:600;margin-bottom:12px;letter-spacing:-0.02em;">Not sure where to start?</p>
      <p style="font-size:1rem;color:#6e6e73;margin-bottom:28px;line-height:1.5;">Take the free assessment first to understand your direction.</p>
      <a href="/profile.html" class="fw-hero__cta">Free Assessment →</a>
    </div>

  </div>
</section>

<footer class="fw-footer">
  <div class="fw-inner">
    OPC Incubator <span class="fw-footer__sep">|</span> fhopc.top <span class="fw-footer__sep">|</span> <a href="/en/">Home</a> <span class="fw-footer__sep">|</span> <a href="/en/privacy.html">Privacy</a> <span class="fw-footer__sep">|</span> <a href="/en/terms.html">Terms</a>
    <div style="font-size:0.6875rem;color:#86868b;margin-top:4px;">Last updated: May 2026</div>
  </div>
</footer>

<script src="/app-core.js"></script>
</body>
</html>"""

PAGES = {
    'faq.html': FAQ_ZH,
    'terms.html': TERMS_ZH,
    'contact.html': CONTACT_ZH,
    'en/faq.html': FAQ_EN,
    'en/terms.html': TERMS_EN,
    'en/contact.html': CONTACT_EN,
}

def main():
    count = 0
    for rel_path, template in PAGES.items():
        style_href = '/style.css' if '/en/' in rel_path else 'style.css'
        out_path = os.path.join(ROOT, rel_path)

        html = template.format(csp=CSP, fonts=FONT_LINKS)

        with open(out_path, 'w', encoding='utf-8') as f:
            f.write(html)
        count += 1
        print(f'Created: {rel_path}')

    print(f'\nGenerated {count} pages.')

if __name__ == '__main__':
    main()
