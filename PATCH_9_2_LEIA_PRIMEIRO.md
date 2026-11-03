# PATCH 9.2 — Menos downloads, sem alterar as funções existentes

## O que mudou

- A Home não baixa as fotos genéricas de reserva quando os banners do Supabase estão funcionando; elas seguem disponíveis sob demanda, um banner por vez, se não houver banners ou houver erro na consulta.
- Apenas o banner atual é requisitado imediatamente. O próximo é pré-carregado após 4,5 segundos para manter a passagem automática a cada 7 segundos e os controles manuais. Os demais são carregados sob demanda.
- A imagem da pesca noturna (inclusive a personalizada do admin) só é solicitada quando o bloco se aproxima da tela, evitando desperdício no topo da página.
- As fotos da prévia da galeria são solicitadas apenas perto da rolagem, além da indicação nativa de loading=lazy.
- A logo pública compartilha a consulta já utilizada pelas outras configurações, eliminando uma consulta duplicada. A logo do painel administrativo continua independente.
- Novos uploads no Storage usam um ano de cache HTTP porque cada arquivo recebe um caminho único e não é sobrescrito. O cache dos arquivos que já existiam permanece igual.
- Versão do cache PWA atualizada.

## Como aplicar

1. Envie o conteúdo da pasta `pesque-pague-alegria/` ao repositório.
2. Aguarde o GitHub Pages publicar e faça um teste de navegação em janela anônima.
3. No Chrome, rode o Lighthouse Mobile da Home três vezes; compare a mediana com os resultados anteriores (71, 2,5 MB, LCP simulado 11,9s).

Nenhum comando SQL é necessário. Não é preciso reenviar os banners existentes.

**Observação:** a economia de transferência é previsível pelo código, mas as novas notas de Lighthouse e o LCP real dependem de medições depois da publicação. O teste de carga de usuários simultâneos é independente desta otimização.
