"""Inject hardcoded site-nav into all pages that don't have one."""
import os, re

DEPLOY = r'F:\OPC测评系统\deploy'

NAV_ZH = '''<nav class="site-nav" aria-label="主导航">
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
    <a href="/en/" class="lang-toggle">EN</a>
  </div>
</nav>'''

NAV_EN = '''<nav class="site-nav" aria-label="Main navigation">
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
    <a href="/" class="lang-toggle">中文</a>
  </div>
</nav>'''

count = 0
for root, dirs, files in os.walk(DEPLOY):
    dirs[:] = [d for d in dirs if d not in ('node_modules', '.git', 'templates', 'scripts', 'worker')]
    for fn in files:
        if not fn.endswith('.html'):
            continue
        fpath = os.path.join(root, fn)
        rel = os.path.relpath(fpath, DEPLOY).replace('\\', '/')

        with open(fpath, 'r', encoding='utf-8') as f:
            content = f.read()

        # Skip if hardcoded nav already exists
        if '<nav class="site-nav"' in content:
            continue

        is_en = '/en/' in rel or rel.startswith('en/')
        nav = NAV_EN if is_en else NAV_ZH

        # Find skip-to-content and insert nav right after it
        if '<a class="skip-to-content"' in content:
            content = content.replace(
                '<a class="skip-to-content"',
                nav + '\n<a class="skip-to-content"',
                1
            )
        else:
            # No skip link: insert nav after <body>
            content = re.sub(r'(<body[^>]*>)', r'\1\n' + nav, content, count=1)

        with open(fpath, 'w', encoding='utf-8') as f:
            f.write(content)
        count += 1

print(f'Injected hardcoded nav into {count} pages')
