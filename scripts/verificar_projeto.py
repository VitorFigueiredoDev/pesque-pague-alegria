#!/usr/bin/env python3
"""Validação local de links internos e arquivos necessários (sem rede)."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit,unquote
class Links(HTMLParser):
    def __init__(self): super().__init__();self.links=[]
    def handle_starttag(self,tag,attrs):
        a=dict(attrs)
        if tag in ('a','script','link','img'):
            ref=a.get('href') or a.get('src')
            if ref:self.links.append((tag,ref))
root=Path(__file__).resolve().parents[1]
errors=[]; count=0
for page in sorted(root.rglob('*.html')):
    parser=Links();parser.feed(page.read_text(encoding='utf-8'))
    for tag,ref in parser.links:
        parts=urlsplit(ref)
        if parts.scheme or parts.netloc or ref.startswith(('//','mailto:','tel:','data:','#')):continue
        candidate=(root/unquote(parts.path).lstrip('/')) if parts.path.startswith('/') else (page.parent/unquote(parts.path))
        if not candidate.exists():errors.append(f'{page.relative_to(root)} -> {ref}')
        count+=1
print(f'Validados {count} caminhos internos.')
if errors:
    print('Arquivos não encontrados:')
    for err in errors:print(' -',err)
    raise SystemExit(1)
print('OK: nenhum caminho interno quebrado encontrado.')
