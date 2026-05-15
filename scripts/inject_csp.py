"""Inject CSP meta tag into all HTML files in deploy/ (excluding templates/ and scripts/)."""
import os
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
EXCLUDE_DIRS = {'templates', 'scripts', '.git', 'workers'}

CSP_TAG = '<meta http-equiv="Content-Security-Policy" content="default-src \'self\'; script-src \'self\' \'unsafe-inline\' https://hm.baidu.com https://zz.bdstatic.com https://push.zhanzhang.baidu.com; style-src \'self\' \'unsafe-inline\' https://fonts.googleapis.com; font-src \'self\' https://fonts.gstatic.com; img-src \'self\' data: https:; connect-src \'self\' https://hm.baidu.com; frame-src \'none\';">'

count = 0
for dirpath, dirnames, filenames in os.walk(ROOT):
    dirnames[:] = [d for d in dirnames if d not in EXCLUDE_DIRS and not d.startswith('.')]
    for f in filenames:
        if not f.endswith('.html'):
            continue
        filepath = os.path.join(dirpath, f)
        with open(filepath, 'r', encoding='utf-8') as fh:
            content = fh.read()

        if 'http-equiv="Content-Security-Policy"' in content:
            print(f'  Skip (already has CSP): {os.path.relpath(filepath, ROOT)}')
            continue

        # Insert after <meta charset="UTF-8"> or after <head>
        if '<meta charset="UTF-8">' in content:
            content = content.replace(
                '<meta charset="UTF-8">',
                '<meta charset="UTF-8">\n  ' + CSP_TAG,
                1
            )
        elif '<head>' in content:
            content = content.replace('<head>', '<head>\n  ' + CSP_TAG, 1)
        else:
            print(f'  WARN: No <head> found in {os.path.relpath(filepath, ROOT)}')
            continue

        with open(filepath, 'w', encoding='utf-8') as fh:
            fh.write(content)
        count += 1
        print(f'  OK: {os.path.relpath(filepath, ROOT)}')

print(f'\nInjected CSP into {count} files.')
