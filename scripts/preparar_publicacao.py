#!/usr/bin/env python3
"""Use: python scripts/preparar_publicacao.py https://seu-dominio.com
Gera sitemap.xml, robots.txt e URLs canônicas depois de escolher domínio.
Não faz deploy nem precisa de bibliotecas externas.
"""
from pathlib import Path
from urllib.parse import urlparse
from xml.sax.saxutils import escape
import sys,re
if len(sys.argv)!=2:
    sys.exit("Uso: python scripts/preparar_publicacao.py https://seu-dominio.com")
url=sys.argv[1].strip().rstrip("/")
parsed=urlparse(url)
if parsed.scheme!="https" or not parsed.netloc or parsed.username or parsed.password or parsed.query or parsed.fragment or parsed.path not in ("", "/"):
    sys.exit("Use um domínio HTTPS público, sem caminho, usuário, query ou fragmento.")
base=Path(__file__).resolve().parents[1]
pages=["index.html","pages/galeria.html","pages/peixes.html","pages/informacoes.html"]
xml='<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
for rel in pages:
    target=base/rel
    if not target.exists():sys.exit(f"Arquivo ausente: {rel}")
    address=url+("/" if rel=="index.html" else "/"+rel)
    xml+=f'  <url><loc>{escape(address)}</loc></url>\n'
    source=target.read_text(encoding="utf-8")
    source=re.sub(r'<link rel="canonical" href="[^"]*">',"",source)
    source=re.sub(r'<meta property="og:url" content="[^"]*">',"",source)
    from html import escape as attr
    source=source.replace("</head>",f'<link rel="canonical" href="{attr(address,quote=True)}"><meta property="og:url" content="{attr(address,quote=True)}"></head>',1)
    target.write_text(source,encoding="utf-8")
xml+='</urlset>\n'
(base/'sitemap.xml').write_text(xml,encoding="utf-8")
(base/'robots.txt').write_text(f'User-agent: *\nDisallow: /admin/\n\nSitemap: {url}/sitemap.xml\n',encoding="utf-8")
print('Sitemap, robots e tags canonical atualizados para',url)
