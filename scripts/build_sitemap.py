"""Generate complete sitemap.xml for fhopc.top"""
import os
import xml.etree.ElementTree as ET
from datetime import date

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
EXCLUDE_DIRS = {'templates', 'scripts', '.git', 'workers', 'node_modules'}
EXCLUDE_FILES = {'baidu_verify_codeva-ZAc7vhn5zi.html'}

PRIORITY_MAP = [
    # (path_pattern, priority, changefreq)
    # Exact matches first, then prefixes
    ('/index.html', 1.0, 'weekly'),
    ('/subsidy/index.html', 0.9, 'weekly'),
    ('/blog/index.html', 0.8, 'weekly'),
    ('/services/index.html', 0.7, 'weekly'),
    ('/en/index.html', 0.7, 'weekly'),
    ('/subsidy/', 0.8, 'weekly'),
    ('/blog/', 0.8, 'weekly'),
    ('/cases.html', 0.7, 'weekly'),
    ('/about.html', 0.6, 'monthly'),
    ('/subsidy/city/', 0.6, 'monthly'),
    ('/blog/posts/', 0.5, 'monthly'),
    ('/services/', 0.6, 'monthly'),
    ('/cases/', 0.5, 'monthly'),
    ('/en/services/', 0.5, 'monthly'),
    ('/en/subsidy/', 0.5, 'monthly'),
    ('/en/about.html', 0.5, 'monthly'),
    ('/en/cases.html', 0.5, 'monthly'),
    ('/en/checkout.html', 0.4, 'monthly'),
    ('/en/privacy.html', 0.3, 'monthly'),
    ('/en/404.html', 0.2, 'monthly'),
    ('/checkout.html', 0.4, 'monthly'),
    ('/privacy.html', 0.3, 'monthly'),
    ('/404.html', 0.2, 'monthly'),
    ('/', 0.5, 'monthly'),  # fallback
]

EXCLUDE_SITEMAP = {
    'baidu_verify_codeva-ZAc7vhn5zi.html',
    'en/404.html',
    '404.html',
}

def get_priority_and_freq(url_path):
    for pattern, pri, freq in PRIORITY_MAP:
        if url_path == pattern or url_path.startswith(pattern):
            return pri, freq
    return 0.5, 'monthly'

def build_url_element(url, loc, lastmod, pri, freq):
    el = ET.SubElement(url, '{http://www.sitemaps.org/schemas/sitemap/0.9}loc')
    el.text = loc
    el = ET.SubElement(url, '{http://www.sitemaps.org/schemas/sitemap/0.9}lastmod')
    el.text = lastmod
    el = ET.SubElement(url, '{http://www.sitemaps.org/schemas/sitemap/0.9}changefreq')
    el.text = freq
    el = ET.SubElement(url, '{http://www.sitemaps.org/schemas/sitemap/0.9}priority')
    el.text = str(pri)

def main():
    today = date.today().isoformat()
    ns = 'http://www.sitemaps.org/schemas/sitemap/0.9'
    ET.register_namespace('', ns)
    urlset = ET.Element(f'{{{ns}}}urlset')

    urls = []
    for dirpath, dirnames, filenames in os.walk(ROOT):
        dirnames[:] = [d for d in dirnames if d not in EXCLUDE_DIRS and not d.startswith('.')]
        for f in filenames:
            if not f.endswith('.html'):
                continue
            rel = os.path.relpath(os.path.join(dirpath, f), ROOT).replace('\\', '/')

            if rel in EXCLUDE_SITEMAP:
                continue

            # Convert file path to URL path
            url_path = '/' + rel
            if url_path.endswith('/index.html'):
                url_path = url_path[:-10]  # /blog/index.html -> /blog/

            loc = f'https://fhopc.top{url_path}'
            pri, freq = get_priority_and_freq(url_path)
            urls.append((loc, today, pri, freq, url_path))

    # Sort: highest priority first, then by path
    urls.sort(key=lambda x: (-x[2], x[4]))

    for loc, lastmod, pri, freq, _ in urls:
        url = ET.SubElement(urlset, f'{{{ns}}}url')
        build_url_element(url, loc, lastmod, pri, freq)

    xml_str = ET.tostring(urlset, encoding='unicode', xml_declaration=True)
    # Fix the namespace prefix issue
    xml_str = xml_str.replace('ns0:', '').replace(':ns0', '')
    xml_str = xml_str.replace('<urlset', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"')

    out = os.path.join(ROOT, 'sitemap.xml')
    with open(out, 'w', encoding='utf-8') as fh:
        fh.write(xml_str)
    print(f'Generated sitemap.xml with {len(urls)} URLs')

if __name__ == '__main__':
    main()
