# Patch 8.3 — banner somente com arte pronta

**Onde:** Admin → Banners.

Agora a imagem é o único conteúdo obrigatório para criar um banner. Escolha um arquivo JPG/PNG/WebP (até 6 MB) ou informe URL HTTPS.

Título, descrição, ordem de exibição, texto do botão e destino do botão são opcionais. O botão só aparece se ambos os seus campos estiverem preenchidos. Quando não existe nenhum texto ou botão, a Home mostra somente a arte completa, sem degradê preto e sem sobreposição textual. A proporção original é preservada e podem existir margens no celular.

## Atualização
Copie o conteúdo desta pasta para a raiz de seu projeto (onde está `index.html`), substituindo os arquivos correspondentes. Teste no Live Server e publique no GitHub Pages.

Não é necessário executar SQL. O título vazio é salvo como string vazia, compatível com colunas obrigatórias do Postgres. Nenhuma tabela ou registro antigo é excluído.

> **Atualização Patch 8.5:** no celular, banners somente com arte agora ajustam a altura à proporção real da imagem e não precisam exibir margens vazias.
