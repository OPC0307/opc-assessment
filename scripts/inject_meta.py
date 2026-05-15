"""Inject og:image, twitter:card, and hreflang tags into all HTML files in deploy/."""
import os
import re
import hashlib

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
EXCLUDE_DIRS = {'templates', 'scripts', '.git', 'workers', 'node_modules'}

# Available 1200x675 cover images
COVER_DIR = os.path.join(ROOT, 'assets', 'images', 'blog-covers')
available_covers = set()
if os.path.isdir(COVER_DIR):
    for f in os.listdir(COVER_DIR):
        if f.endswith('.png'):
            available_covers.add(f)

DEFAULT_COVER = 'assets/images/blog-covers/china-whole-nation-opc-push-2026.png'
CITY_COVER = 'assets/images/blog-covers/policy-dividend-for-ordinary-2026.png'
CASE_COVER = 'assets/images/blog-covers/solo-founder-case-study-40w.png'

# EN↔ZH page pairs for hreflang
# Maps ZH path -> EN path (relative to ROOT)
HREFLANG_PAIRS = {
    'about.html': 'en/about.html',
    'cases.html': 'en/cases.html',
    'checkout.html': 'en/checkout.html',
    'privacy.html': 'en/privacy.html',
    '404.html': 'en/404.html',
    'services/index.html': 'en/services/index.html',
    'services/process.html': 'en/services/process.html',
    'services/registration.html': 'en/services/registration.html',
    'services/subsidy.html': 'en/services/subsidy.html',
    'services/tax-basics.html': 'en/services/tax-basics.html',
    'subsidy/index.html': 'en/subsidy/index.html',
    'subsidy/checklist.html': 'en/subsidy/checklist.html',
}

def pick_cover(rel_path):
    """Pick appropriate cover image for a page."""
    # Blog posts: try matching slug to cover filename
    if 'blog/posts/' in rel_path:
        stem = os.path.splitext(os.path.basename(rel_path))[0]
        target = stem + '.png'
        if target in available_covers:
            return f'assets/images/blog-covers/{target}'
        return DEFAULT_COVER

    # City pages
    if 'subsidy/city/' in rel_path:
        return CITY_COVER

    # Case pages
    if 'cases/' in rel_path and rel_path != 'cases.html':
        return CASE_COVER

    return DEFAULT_COVER

def extract_meta(content, prop_name):
    """Extract og:title or og:description from existing meta tags."""
    pattern = rf'<meta\s+property="og:{prop_name}"\s+content="([^"]*)"'
    m = re.search(pattern, content)
    if m:
        return m.group(1)
    return None

def extract_html_title(content):
    """Extract title from <title> tag."""
    m = re.search(r'<title>([^<]*)</title>', content)
    if m:
        return m.group(1).strip()
    return 'OPC 一人公司孵化器'

def get_twitter_title(content):
    """Get appropriate twitter title."""
    t = extract_meta(content, 'title')
    if t:
        # Truncate to reasonable twitter title length
        if len(t) > 70:
            # Try to cut at last dash or pipe
            for sep in [' — ', ' | ', ' - ']:
                idx = t.rfind(sep, 0, 70)
                if idx > 0:
                    return t[:idx].strip()
            return t[:67] + '...'
        return t
    return extract_html_title(content)[:70]

def get_twitter_desc(content):
    """Get appropriate twitter description."""
    d = extract_meta(content, 'description')
    if d:
        return d[:200]
    return ''

def get_lang(rel_path):
    """Determine language from path."""
    if rel_path.startswith('en/') or rel_path.startswith('en\\'):
        return 'en'
    return 'zh'

def build_og_image_block(cover_path):
    """Build og:image meta tags block."""
    return (
        f'<meta property="og:image" content="https://fhopc.top/{cover_path}">\n'
        f'  <meta property="og:image:width" content="1200">\n'
        f'  <meta property="og:image:height" content="675">'
    )

def build_twitter_block(content, cover_path):
    """Build twitter meta tags block."""
    title = get_twitter_title(content)
    desc = get_twitter_desc(content)
    parts = [
        '<meta name="twitter:card" content="summary_large_image">',
    ]
    if title:
        parts.append(f'<meta name="twitter:title" content="{title}">')
    if desc:
        parts.append(f'<meta name="twitter:description" content="{desc}">')
    parts.append(f'<meta name="twitter:image" content="https://fhopc.top/{cover_path}">')
    return '\n  '.join(parts)

def build_hreflang_links(rel_path, lang):
    """Build hreflang links for a page that has a counterpart."""
    # Find the counterpart
    zh_path = None
    en_path = None

    if lang == 'zh':
        zh_path = rel_path
        en_path = HREFLANG_PAIRS.get(rel_path)
    else:
        # Look up reverse
        en_path = rel_path
        for z, e in HREFLANG_PAIRS.items():
            if e == rel_path:
                zh_path = z
                break

    if not zh_path or not en_path:
        return None

    # Convert to URL paths
    zh_url = '/' + zh_path.replace('\\', '/')
    en_url = '/' + en_path.replace('\\', '/')
    # Remove /index.html for clean URLs
    if zh_url.endswith('/index.html'):
        zh_url = zh_url[:-10]
    if en_url.endswith('/index.html'):
        en_url = en_url[:-10]
    # Remove .html extension? No, keep it for GitHub Pages

    links = (
        f'<link rel="alternate" hreflang="zh" href="https://fhopc.top{zh_url}">\n'
        f'  <link rel="alternate" hreflang="en" href="https://fhopc.top{en_url}">'
    )
    return links

def process_file(filepath, rel_path):
    """Process a single HTML file."""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original = content
    lang = get_lang(rel_path)
    cover_path = pick_cover(rel_path)
    modified = False

    # 1. Inject og:image if missing
    if 'og:image' not in content:
        og_block = build_og_image_block(cover_path)
        # Insert after last existing og:* tag or after og:url
        # Find the last og:* meta tag
        last_og = None
        for m in re.finditer(r'<meta\s+property="og:[^"]*"[^>]*>', content):
            last_og = m

        if last_og:
            insert_pos = last_og.end()
            content = content[:insert_pos] + '\n  ' + og_block + content[insert_pos:]
        else:
            # Insert after <meta charset or after <head>
            m = re.search(r'<meta\s+charset="[^"]*"[^>]*>\n', content)
            if m:
                content = content[:m.end()] + '  ' + og_block + '\n' + content[m.end():]
            else:
                content = content.replace('<head>', '<head>\n  ' + og_block)
        modified = True
        print(f'  [+] og:image -> {rel_path}')

    # 2. Fix twitter:card from "summary" to "summary_large_image"
    if '<meta name="twitter:card" content="summary">' in content:
        content = content.replace(
            '<meta name="twitter:card" content="summary">',
            '<meta name="twitter:card" content="summary_large_image">'
        )
        modified = True
        print(f'  [~] twitter:card fixed -> {rel_path}')

    # 3. Inject twitter tags if missing
    if 'twitter:card' not in content:
        tw_block = build_twitter_block(content, cover_path)
        # Insert after last og:* tag
        last_og = None
        for m in re.finditer(r'<meta\s+property="og:[^"]*"[^>]*>', content):
            last_og = m

        if last_og:
            insert_pos = last_og.end()
            content = content[:insert_pos] + '\n  ' + tw_block + content[insert_pos:]
        else:
            m = re.search(r'<meta\s+charset="[^"]*"[^>]*>\n', content)
            if m:
                content = content[:m.end()] + '  ' + tw_block + '\n' + content[m.end():]
        modified = True
        print(f'  [+] twitter -> {rel_path}')

    # 4. Inject hreflang if missing and page has a counterpart
    if 'hreflang' not in content:
        hl_links = build_hreflang_links(rel_path, lang)
        if hl_links:
            # Insert after canonical link, or before first og: meta
            m = re.search(r'<link\s+rel="canonical"[^>]*>', content)
            if m:
                insert_pos = m.end()
                content = content[:insert_pos] + '\n  ' + hl_links + content[insert_pos:]
            else:
                # Insert before first og: tag
                m = re.search(r'<meta\s+property="og:', content)
                if m:
                    content = content[:m.start()] + hl_links + '\n  ' + content[m.start():]
            modified = True
            print(f'  [+] hreflang -> {rel_path}')

    if modified:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        return True
    return False

def main():
    total = 0
    for dirpath, dirnames, filenames in os.walk(ROOT):
        dirnames[:] = [d for d in dirnames if d not in EXCLUDE_DIRS and not d.startswith('.')]
        for f in filenames:
            if not f.endswith('.html'):
                continue
            filepath = os.path.join(dirpath, f)
            rel = os.path.relpath(filepath, ROOT).replace('\\', '/')
            if process_file(filepath, rel):
                total += 1

    print(f'\nProcessed {total} files.')

if __name__ == '__main__':
    main()
