"""Inject accessibility features to all HTML pages."""
import os, re

DEPLOY = r'F:\OPC测评系统\deploy'

SKIP_CONTENT = '<a class="skip-to-content" href="#main-content">跳转到主内容</a>'

count = 0
for root, dirs, files in os.walk(DEPLOY):
    dirs[:] = [d for d in dirs if d not in ('node_modules', '.git', 'templates', 'scripts', 'worker')]
    for fn in files:
        if not fn.endswith('.html'):
            continue
        fpath = os.path.join(root, fn)
        with open(fpath, 'r', encoding='utf-8') as f:
            content = f.read()

        modified = False

        # 1. Skip-to-content link right after <body ...>
        if '<a class="skip-to-content"' not in content:
            content = re.sub(
                r'(<body[^>]*>)',
                r'\1\n' + SKIP_CONTENT,
                content,
                count=1
            )
            modified = True

        # 2. Add loading="lazy" to <img> tags that don't have it
        def add_lazy(m):
            tag = m.group(0)
            if 'loading=' in tag:
                return tag
            return tag.replace('<img ', '<img loading="lazy" ')
        content, n = re.subn(r'<img [^>]*>', add_lazy, content)
        if n > 0:
            modified = True

        # 3. Add role="main" to primary content area
        # Look for <section class="fw-hero" or <main or first <section after nav
        if 'role="main"' not in content:
            for tag in ['<section class="fw-hero"', '<main>', '<main ', '<section class="fw-section"']:
                if tag in content:
                    if tag.endswith('>'):
                        content = content.replace(tag, tag.replace('>', ' role="main">'), 1)
                    else:
                        content = content.replace(tag, tag + ' role="main"', 1)
                    modified = True
                    break

        # 4. Add role="contentinfo" to footer
        for tag in ['<footer class="fw-footer"', '<footer>', '<footer ']:
            if tag in content and 'role="contentinfo"' not in content.split(tag)[1].split('>')[0] + '>':
                if '>' in content.split(tag)[1][:20]:
                    end = content.index(tag) + len(tag)
                    if '>' in content[end:end+30]:
                        close = content.index('>', end)
                        if 'role=' not in content[end:close]:
                            insert = tag.replace('<footer', '<footer role="contentinfo"')
                            content = content.replace(tag, insert, 1)
                            modified = True
                            break

        # 5. Add aria-label to site-nav
        if '<nav class="site-nav"' in content and 'aria-label=' not in content:
            content = content.replace(
                '<nav class="site-nav"',
                '<nav class="site-nav" aria-label="主导航"',
                1
            )
            modified = True

        if modified:
            with open(fpath, 'w', encoding='utf-8') as f:
                f.write(content)
            count += 1

print(f'Accessibility features injected into {count} pages')
