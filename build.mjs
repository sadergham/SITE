// Monta o site (dist/) a partir de conteudo/site.json, que a Sarah edita pelo painel /admin.
// Rodar: node build.mjs
import { readFileSync, writeFileSync, mkdirSync, cpSync, rmSync, existsSync, copyFileSync } from 'node:fs';
import { lerPecas, gerarMiniaturas, reduzirFotosGrandes, vitrine, paginaCatalogo } from './catalogo.mjs';
import { montarPagina } from './pagina.mjs';

const c = JSON.parse(readFileSync('conteudo/site.json', 'utf8'));
const css = readFileSync('estilo.css', 'utf8');

// Catálogo próprio (conteudo/pecas). As miniaturas vão direto para dist/.
if (existsSync('dist')) rmSync('dist', { recursive: true, force: true });
mkdirSync('dist', { recursive: true });
const pecas = lerPecas();
const mini = await gerarMiniaturas(pecas, 'dist');
const htmlVitrine = pecas.length ? vitrine(pecas, mini) : '';

// Página inicial (o mesmo molde que o painel usa)
writeFileSync('dist/index.html', montarPagina(c, { css, vitrine: htmlVitrine, totalPecas: pecas.length, temCatalogo: pecas.length > 0 }));
if (existsSync('fotos')) cpSync('fotos', 'dist/fotos', { recursive: true });
if (pecas.length) {
  await reduzirFotosGrandes(pecas, 'dist');
  mkdirSync('dist/catalogo', { recursive: true });
  writeFileSync('dist/catalogo/index.html', paginaCatalogo({ c, css, pecas, mini }));
  console.log(`Catálogo: ${pecas.length} peças`);
}

// Painel de edição: /admin (cópia do site com "Editar" em cada parte)
mkdirSync('dist/admin', { recursive: true });
copyFileSync('painel/index.html', 'dist/admin/index.html');
copyFileSync('pagina.mjs', 'dist/admin/pagina.mjs');
writeFileSync('dist/admin/estilo.css', css);
writeFileSync('dist/admin/vitrine.html', htmlVitrine);
writeFileSync('dist/admin/info.json', JSON.stringify({ totalPecas: pecas.length, temCatalogo: pecas.length > 0 }));
// /painel continua levando ao painel
mkdirSync('dist/painel', { recursive: true });
writeFileSync('dist/painel/index.html', '<!doctype html><meta charset="utf-8"><title>Painel</title><meta http-equiv="refresh" content="0;url=../admin/"><a href="../admin/">Abrir o painel</a>');
console.log('Site gerado em dist/');
