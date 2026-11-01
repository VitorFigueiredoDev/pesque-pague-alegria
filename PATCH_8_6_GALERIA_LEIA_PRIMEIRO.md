# Patch 8.6 — Galeria com legendas opcionais e editáveis

## Novidades
- **Nova foto:** apenas o arquivo de imagem é obrigatório. Título e descrição podem ficar em branco.
- **Editar textos:** em Admin > Galeria > Imagens cadastradas > **Editar texto**, ajuste título e descrição de uma foto sem reenviar a imagem.
- **Site público:** imagens sem ambos os campos não exibem título genérico, legenda, nem camada escura na Galeria ou na prévia da Home; continuam abrindo normalmente no visualizador.
- **Descrição sem título:** aparece como legenda no card; no visualizador, só aparece a descrição.
- **Fotos existentes:** preservadas; continuam com seus títulos e descrições até você editá-las.

## Instalação
1. Faça backup da pasta do site atual.
2. Copie o conteúdo interno de `pesque-pague-alegria/` do ZIP para a raiz do seu projeto, substituindo arquivos.
3. Teste no Live Server: `/admin/login.html`, em seguida abra a aba Galeria.
4. Publique os arquivos alterados no GitHub Pages.

**Não exige SQL.** A coluna `gallery_images.title` pode ser `NOT NULL`, porque uma legenda vazia é gravada como string vazia (`''`), não como `NULL`.

A edição de texto atualiza somente `title` e `description` do registro em `gallery_images`; não muda a imagem, a publicação nem os arquivos no Storage. O banco existente e as políticas RLS permanecem inalterados.
