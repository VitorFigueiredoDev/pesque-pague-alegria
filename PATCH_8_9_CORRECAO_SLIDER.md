# Patch 8.9 — Correção do slider da Home

O Patch 8.7 retirou indevidamente o contador `01 / 03` do slider, mas `js/main.js` ainda dependia do elemento `#hero-counter` para iniciar o carrossel. Este patch:

- Restaura o contador funcional na barra do slider.
- Restaura a atualização automática do indicador ao trocar de banner.
- Mantém removidas as numerações decorativas dos cards de aluguel.
- Preserva o patch 8.8 do administrador (salvar sem rolar para o topo).

## Instalação

Substitua os arquivos do projeto pelos deste ZIP, ou, se quiser uma atualização mínima, apenas `index.html` e `js/main.js`. Depois atualize o navegador com Ctrl+F5. Não há SQL novo.
