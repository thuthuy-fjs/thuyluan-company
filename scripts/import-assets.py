"""Import only verified image assets from the source website; never scripts/plugins.

Usage: python3 scripts/import-assets.py /tmp/thuyluan-home.html /tmp/thuyluan-brand-media.json
Pillow and lxml are required only for this optional one-time import.
"""
import concurrent.futures
import hashlib
import io
import json
from pathlib import Path
import re
import sys
from urllib.parse import quote, urlsplit, urlunsplit
from urllib.request import Request, urlopen
from lxml import html
from PIL import Image, ImageDraw, ImageOps

root = Path(__file__).resolve().parents[1]
out = root / 'public' / 'assets'
out.mkdir(parents=True, exist_ok=True)
source = html.parse(sys.argv[1])
jobs = []
seen = set()
meal = 0
for image in source.xpath('//img'):
    url = image.get('src', '')
    if url in seen or 'wp-content/uploads/' not in url:
        continue
    seen.add(url)
    name = url.rsplit('/', 1)[-1]
    if 'removebg' in name:
        label = 'logo'
    elif name in ['bn1-2.png', 'bn2-2.png', 'UYTIN.png', 'CHATLUONG.png', 'CHUYENNGHIEP.png', 'HIEUQUA.png', 'bacground-chan-trang3.png', 'banner8-87900.jpg']:
        continue
    elif '500x480' in name:
        label = ['news-quality', 'news-storage', 'news-nutrition'][sum(j[0].startswith('news-') for j in jobs)]
    elif name in ['sơ-đồ-scaled.png', 'giá-trị-1.png', 'quy-trinh1.png', 'setup-1.png']:
        label = {'sơ-đồ-scaled.png':'document-organization','giá-trị-1.png':'document-values','quy-trinh1.png':'document-process','setup-1.png':'document-setup'}[name]
    else:
        meal += 1
        label = f'meal-{meal:02d}'
    jobs.append((label, url))

media = json.load(open(sys.argv[2]))
gallery = [m for m in media if m.get('mime_type', '').startswith('image/') and '/2024/' in m.get('source_url', '')]
for i, item in enumerate(gallery[:24], 1):
    jobs.append((f'gallery-{i:02d}', item['source_url']))

def download(job):
    label, url = job
    parts = urlsplit(url)
    safe_url = urlunsplit((parts.scheme, parts.netloc, quote(parts.path), parts.query, ''))
    request = Request(safe_url, headers={'User-Agent':'Mozilla/5.0'})
    with urlopen(request, timeout=45) as response:
        image = Image.open(io.BytesIO(response.read()))
        image.load()
    image = ImageOps.exif_transpose(image)
    image.thumbnail((1800,1800) if label.startswith('document') else (1500,1500))
    # Keep document PNG alpha intact; converting RGBA directly to RGB makes
    # transparent pixels black and hides the original dark text and connectors.
    ext = 'png' if label == 'logo' or label.startswith('document-') else 'webp'
    path = out / f'{label}.{ext}'
    if ext == 'png':
        image.save(path, optimize=True)
    else:
        image.convert('RGB').save(path, quality=87, method=6)
    return {'id':label,'src':f'/assets/{path.name}','source':url,'width':image.width,'height':image.height,'sha256':hashlib.sha256(path.read_bytes()).hexdigest()}

results=[]
with concurrent.futures.ThreadPoolExecutor(max_workers=5) as executor:
    for future in concurrent.futures.as_completed([executor.submit(download,j) for j in jobs]):
        results.append(future.result())
results.sort(key=lambda x:x['id'])
(out/'source-manifest.json').write_text(json.dumps(results,ensure_ascii=False,indent=2)+'\n')
columns=6
thumbs=[x for x in results if not x['id'].startswith('document') and x['id']!='logo']
sheet=Image.new('RGB',(columns*230,((len(thumbs)+columns-1)//columns)*190),'#f5f3ee')
draw=ImageDraw.Draw(sheet)
for i,item in enumerate(thumbs):
    thumb=Image.open(root/'public'/item['src'].lstrip('/'))
    thumb.thumbnail((220,155))
    x=(i%columns)*230
    y=(i//columns)*190
    sheet.paste(thumb,(x+(220-thumb.width)//2,y))
    draw.text((x+8,y+160),item['id'],fill='#152f27')
sheet.save('/tmp/thuyluan-contact-sheet.jpg')
print(json.dumps({'images':len(results),'bytes':sum(p.stat().st_size for p in out.glob('*')),'contact_sheet':'/tmp/thuyluan-contact-sheet.jpg'}))
