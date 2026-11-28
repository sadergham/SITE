// Catálogo próprio: lê conteudo/pecas/*.json (cada peça é um arquivo, editado pelo painel)
// e gera a página /catalogo/ e a vitrine da página inicial.
import { readFileSync, readdirSync, existsSync, mkdirSync, statSync, copyFileSync } from 'node:fs';
import { join, basename, extname } from 'node:path';

const e = (v) => String(v ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const brl = (n) => 'R$ ' + Number(n).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const numero = (v) => (typeof v === 'number' ? v : parseFloat(String(v ?? '').replace(/[^\d,.-]/g, '').replace(/\.(?=\d{3}(\D|$))/g, '').replace(',', '.')));

// Ocasiões aparecem como filtros principais; o resto (Vestido + cor) vira filtro de cor
const OCASIOES = ['Noivas', 'Noiva civil', 'Debutante', 'Vestido daminha/ florista', 'Ternos', 'Vestido curtos/midi', 'Vestido gestante ensaio'];
const CORES = {
  amarelo: '#e9c84a', 'azul marinho': '#1f2a4d', 'azul royal': '#2747b8', 'azul serenity': '#9bb7e0', 'azul tifany': '#7fd3c8',
  'cinza / prata': '#b9bcc2', dourado: '#c9a54b', 'fúcsia / pink': '#d63384', lavanda: '#b9a6dc', marrom: '#6b4632',
  marsala: '#7b2335', nude: '#e3c4a8', preto: '#1b1b1b', 'rosa/rosê': '#efb6c0', roxo: '#6a3d9a', 'salmão/ coral': '#f08c74',
  terracota: '#b5583a', verde: '#2f7d55', vermelho: '#c0262d',
};
export const rotulo = (c) => {
  const t = c.replace(/^Vestido\s+/i, '').replace(/\s*\/\s*/g, ' / ').trim();
  return t.charAt(0).toUpperCase() + t.slice(1);
};
const corDe = (c) => CORES[c.replace(/^Vestido\s+/i, '').toLowerCase().trim()];

const caminho = (f) => String(f || '').replace(/^\//, '');

export function lerPecas(pasta = 'conteudo/pecas') {
  if (!existsSync(pasta)) return [];
  return readdirSync(pasta)
    .filter((f) => f.endsWith('.json'))
    .map((f) => {
      let p;
      try { p = JSON.parse(readFileSync(join(pasta, f), 'utf8')); } catch { console.warn('Peça com erro, ignorada:', f); return null; }
      const fotos = (Array.isArray(p.fotos) ? p.fotos : [p.fotos]).map(caminho).filter((x) => x && existsSync(x));
      const preco = numero(p.preco);
      const antigo = numero(p.preco_antigo);
      return {
        id: basename(f, '.json'),
        nome: String(p.nome || '').trim(),
        preco: Number.isFinite(preco) ? preco : null,
        antigo: Number.isFinite(antigo) && antigo > preco ? antigo : null,
        cats: (Array.isArray(p.categorias) ? p.categorias : [p.categorias]).filter(Boolean),
        fotos,
        desc: String(p.descricao || '').trim(),
        destaque: !!p.destaque,
        ok: p.disponivel !== false,
      };
    })
    .filter((p) => p && p.ok && p.nome && p.fotos.length)
    .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR', { numeric: true }));
}

// Miniaturas (480px) para a grade carregar rápido. Usa o sharp quando está instalado
// (no GitHub Actions ele é instalado pelo workflow); sem ele, usa a foto inteira.
export async function gerarMiniaturas(pecas, dist) {
  let sharp = null;
  try { sharp = (await import('sharp')).default; } catch { console.log('sharp não instalado: miniaturas = fotos originais'); }
  const mapa = new Map();
  if (!sharp) return mapa;
  const cache = '.cache/mini';
  mkdirSync(cache, { recursive: true });
  mkdirSync(join(dist, 'fotos/mini'), { recursive: true });
  const todas = [...new Set(pecas.flatMap((p) => p.fotos))];
  let feitas = 0;
  const fila = [...todas];
  await Promise.all(Array.from({ length: 6 }, async () => {
    while (fila.length) {
      const f = fila.shift();
      const nome = f.replace(/^fotos\//, '').replace(/[\/\\]/g, '_').replace(extname(f), '') + '.webp';
      const emCache = join(cache, nome);
      try {
        if (!existsSync(emCache) || statSync(emCache).mtimeMs < statSync(f).mtimeMs) {
          await sharp(f).rotate().resize({ width: 480, height: 640, fit: 'inside', withoutEnlargement: true }).webp({ quality: 74 }).toFile(emCache);
          feitas++;
        }
        copyFileSync(emCache, join(dist, 'fotos/mini', nome));
        mapa.set(f, 'fotos/mini/' + nome);
      } catch (err) { console.warn('Miniatura falhou:', f, err.message); }
    }
  }));
  console.log(`Miniaturas: ${todas.length} (${feitas} novas)`);
  return mapa;
}

// Fotos grandes enviadas pelo celular (> 600 KB) são reduzidas na publicação
export async function reduzirFotosGrandes(pecas, dist) {
  let sharp = null;
  try { sharp = (await import('sharp')).default; } catch { return; }
  for (const f of new Set(pecas.flatMap((p) => p.fotos))) {
    if (statSync(f).size < 600 * 1024) continue;
    try {
      const buf = await sharp(f).rotate().resize({ width: 1400, height: 1400, fit: 'inside', withoutEnlargement: true }).jpeg({ quality: 82 }).toBuffer();
      const { writeFileSync } = await import('node:fs');
      writeFileSync(join(dist, f), buf); // mesmo nome/caminho, só mais leve
    } catch (err) { console.warn('Não reduziu', f, err.message); }
  }
}

function filtros(pecas) {
  const conta = {};
  pecas.forEach((p) => p.cats.forEach((c) => (conta[c] = (conta[c] || 0) + 1)));
  const todas = Object.keys(conta);
  const ocasioes = OCASIOES.filter((c) => conta[c]).concat(todas.filter((c) => !OCASIOES.includes(c) && !/^Vestido\s/i.test(c)));
  const cores = todas.filter((c) => !ocasioes.includes(c)).sort((a, b) => rotulo(a).localeCompare(rotulo(b), 'pt-BR'));
  return { ocasioes, cores, conta };
}

// Vitrine da página inicial: peças marcadas como destaque ou, se não houver, uma de cada ocasião
export function vitrine(pecas, mini, qtd = 8) {
  let lista = pecas.filter((p) => p.destaque);
  if (lista.length < qtd) {
    const grupos = ['Noivas', 'Debutante', 'Vestido daminha/ florista', 'Ternos', 'Vestido azul serenity', 'Vestido verde', 'Vestido rosa/rosê', 'Vestido marsala', 'Vestido lavanda', 'Vestido terracota'];
    for (const g of grupos) {
      if (lista.length >= qtd) break;
      const p = pecas.find((x) => x.cats.includes(g) && !lista.includes(x) && x.fotos.length > 1) || pecas.find((x) => x.cats.includes(g) && !lista.includes(x));
      if (p) lista.push(p);
    }
  }
  lista = lista.slice(0, qtd);
  return `<div class="vitrine">
      ${lista.map((p) => `<a class="peca revela" href="catalogo/#${e(p.id)}">
        <div class="peca-img"><img src="${e(mini.get(p.fotos[0]) || p.fotos[0])}" alt="${e(p.nome)}" loading="lazy" width="480" height="640"></div>
        <div class="peca-info"><span class="peca-nome">${e(p.nome)}</span>${p.preco != null ? `<span class="peca-preco">${p.antigo ? `<s>${brl(p.antigo)}</s> ` : ''}${brl(p.preco)}</span>` : ''}</div>
      </a>`).join('\n      ')}
    </div>`;
}

export function paginaCatalogo({ c, css, pecas, mini }) {
  const k = c.contato || {};
  const cat = c.catalogo || {};
  const { ocasioes, cores, conta } = filtros(pecas);
  const catIdx = [...ocasioes, ...cores];
  const dados = pecas.map((p) => ({
    i: p.id, n: p.nome, p: p.preco, a: p.antigo, d: p.desc,
    c: p.cats.map((x) => catIdx.indexOf(x)).filter((x) => x >= 0),
    f: p.fotos.map((f) => '/' + f),
    m: '/' + (mini.get(p.fotos[0]) || p.fotos[0]),
  }));
  const titulo = `${e(cat.titulo)}${cat.titulo_destaque ? ` <em>${e(cat.titulo_destaque)}</em>` : ''}`;
  const chip = (cIdx, nome) => `<button type="button" class="chip" data-c="${cIdx}">${e(rotulo(nome))}<small>${conta[nome]}</small></button>`;
  const bolinha = (cIdx, nome) => `<button type="button" class="cor" data-c="${cIdx}" title="${e(rotulo(nome))}" aria-label="${e(rotulo(nome))}"><i style="background:${corDe(nome) || 'linear-gradient(135deg,#eee,#ccc)'}"></i><span>${e(rotulo(nome))}</span></button>`;

  return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Catálogo de trajes · Atelier Sarah Dergham</title>
<meta name="description" content="Catálogo de trajes para aluguel do Atelier Sarah Dergham em ${e(k.cidade)}: noivas, debutantes, festa, daminhas e ternos.">
<meta property="og:title" content="Catálogo · Atelier Sarah Dergham">
<meta property="og:description" content="${e(cat.texto)}">
<meta property="og:image" content="/${e(pecas[0]?.fotos[0] || 'fotos/logo.webp')}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Jost:wght@300;400;500&display=swap" rel="stylesheet">
<style>
${css}
</style>
</head>
<body class="pagina-catalogo">

<header id="topo" class="rolou">
  <div class="container nav">
    <a href="/" class="logo-img"><img src="/fotos/logo.webp" alt="Atelier da Sarah" width="1158" height="496"></a>
    <ul class="menu" id="menu">
      <li><a href="/">Início</a></li>
      <li><a href="/#colecoes">Coleções</a></li>
      <li><a href="/#duvidas">Dúvidas</a></li>
      <li><a href="/#agende">Contato</a></li>
    </ul>
    <a href="/#agende" class="btn btn-ouro">Agende seu horário</a>
    <button class="hamb" id="hamb" aria-label="Abrir menu"><span></span></button>
  </div>
</header>

<main class="cat">
  <div class="container">
    <div class="titulo-secao">
      <span class="eyebrow">Catálogo</span>
      <h1 class="h2">${titulo}</h1>
      <div class="divisor"><span></span></div>
      <p>${e(cat.texto)}</p>
    </div>

    <div class="cat-filtros">
      <div class="cat-linha">
        <label class="busca"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></svg><input id="busca" type="search" placeholder="Buscar: noiva, 38, verde..." autocomplete="off"></label>
        <select id="ordem" aria-label="Ordenar">
          <option value="nome">Ordem alfabética</option>
          <option value="menor">Menor preço</option>
          <option value="maior">Maior preço</option>
        </select>
      </div>
      <div class="chips" id="ocasioes"><button type="button" class="chip ativo" data-c="">Todos<small>${pecas.length}</small></button>${ocasioes.map((o) => chip(catIdx.indexOf(o), o)).join('')}</div>
      ${cores.length ? `<div class="cores" id="cores"><span class="cores-rot">Cor</span>${cores.map((o) => bolinha(catIdx.indexOf(o), o)).join('')}</div>` : ''}
    </div>

    <p class="cat-conta" id="conta" aria-live="polite"></p>
    <div class="grade" id="grade"></div>
    <p class="cat-vazio" id="vazio" hidden>Nenhuma peça encontrada. <button type="button" id="limpar">Limpar filtros</button></p>
    <div id="mais" class="cat-mais"></div>

    <div class="cat-ajuda">
      <p>Não achou o que procura? Temos mais opções no atelier.</p>
      <a class="btn btn-linha js-whats" data-msg="Olá, Sarah! Vi o catálogo no site e queria ajuda para escolher um traje." href="#" target="_blank" rel="noopener">Fale com a Sarah</a>
    </div>
  </div>
</main>

<dialog id="modal" class="modal" aria-label="Detalhes da peça">
  <button class="fechar" id="fechar" aria-label="Fechar">×</button>
  <div class="modal-grid">
    <div class="galeria-peca">
      <div class="foto-grande" id="fg">
        <button class="seta ant" id="ant" aria-label="Foto anterior">‹</button>
        <div class="trilho" id="trilho"></div>
        <button class="seta prox" id="prox" aria-label="Próxima foto">›</button>
      </div>
      <div class="miniaturas" id="minis"></div>
    </div>
    <div class="modal-info">
      <span class="eyebrow" id="m-cats"></span>
      <h2 id="m-nome"></h2>
      <div class="m-preco" id="m-preco"></div>
      <p class="m-desc" id="m-desc"></p>
      <a class="btn btn-ouro" id="m-quero" href="#" target="_blank" rel="noopener">Quero este traje</a>
      <a class="btn btn-linha" href="/#agende" id="m-agendar">Agendar prova</a>
      <button type="button" class="m-copiar" id="m-copiar">Copiar link da peça</button>
    </div>
  </div>
</dialog>

<footer>
  <div class="container">
    <img class="logo-rodape" src="/fotos/logo.webp" alt="Atelier da Sarah" width="1158" height="496" loading="lazy">
    <div class="divisor"><span></span></div>
    <p class="copy">© <span id="ano"></span> Atelier Sarah Dergham · ${e(k.cidade)}</p>
  </div>
</footer>

<a href="#" class="whats js-whats" data-msg="Olá, Sarah! Vim pelo catálogo do site." target="_blank" rel="noopener" aria-label="Falar no WhatsApp">
  <svg width="30" height="30" viewBox="0 0 32 32" fill="#fff"><path d="M16 3a13 13 0 0 0-11.2 19.6L3 29l6.6-1.7A13 13 0 1 0 16 3zm0 23.7c-2 0-4-.5-5.7-1.6l-.4-.2-3.9 1 1-3.8-.3-.4A10.7 10.7 0 1 1 16 26.7zm5.9-8c-.3-.2-1.9-1-2.2-1-.3-.1-.5-.2-.7.2-.2.3-.8 1-1 1.2-.2.2-.4.2-.7.1a8.8 8.8 0 0 1-4.4-3.8c-.3-.6.3-.5 1-1.7.1-.2 0-.4 0-.6l-1-2.4c-.3-.6-.5-.5-.7-.5h-.6c-.2 0-.6.1-.9.4-.3.3-1.2 1.1-1.2 2.8s1.2 3.3 1.4 3.5c.2.2 2.4 3.6 5.8 5 2.1.9 3 1 4 .8.7-.1 1.9-.8 2.2-1.5.3-.7.3-1.3.2-1.5-.1-.1-.3-.2-.6-.4z"/></svg>
</a>

<script>
const WHATSAPP = ${JSON.stringify(String(k.whatsapp || '').replace(/\D/g, ''))};
const CATS = ${JSON.stringify(catIdx.map(rotulo))};
const PECAS = ${JSON.stringify(dados)};
const linkWhats = msg => \`https://wa.me/\${WHATSAPP}?text=\${encodeURIComponent(msg)}\`;
document.querySelectorAll('.js-whats').forEach(a => a.href = linkWhats(a.dataset.msg));
const brl = n => n == null ? '' : n.toLocaleString('pt-BR', {style:'currency', currency:'BRL'});
const semAcento = s => s.normalize('NFD').replace(/[\\u0300-\\u036f]/g, '').toLowerCase();
PECAS.forEach(p => p.t = semAcento(p.n + ' ' + p.c.map(i => CATS[i]).join(' ')));

const $ = id => document.getElementById(id);
const grade = $('grade'), conta = $('conta'), vazio = $('vazio'), mais = $('mais');
let ocasiao = '', cor = '', termo = '', ordem = 'nome', lista = [], mostrando = 0;
const LOTE = 24;

function card(p) {
  const a = document.createElement('a');
  a.className = 'peca'; a.href = '#' + p.i;
  a.innerHTML = \`<div class="peca-img"><img src="\${p.m}" alt="" loading="lazy" width="480" height="640">\${p.f.length > 1 ? \`<span class="peca-n">\${p.f.length} fotos</span>\` : ''}\${p.a ? '<span class="peca-promo">Promoção</span>' : ''}</div>
    <div class="peca-info"><span class="peca-nome"></span><span class="peca-preco">\${p.a ? \`<s>\${brl(p.a)}</s> \` : ''}\${brl(p.p)}</span></div>\`;
  a.querySelector('.peca-nome').textContent = p.n;
  a.querySelector('img').alt = p.n;
  return a;
}
function filtrar() {
  const palavras = semAcento(termo).split(/\\s+/).filter(Boolean);
  lista = PECAS.filter(p =>
    (ocasiao === '' || p.c.includes(+ocasiao)) &&
    (cor === '' || p.c.includes(+cor)) &&
    palavras.every(w => p.t.includes(w)));
  if (ordem === 'menor') lista.sort((a, b) => (a.p ?? 1e9) - (b.p ?? 1e9));
  else if (ordem === 'maior') lista.sort((a, b) => (b.p ?? -1) - (a.p ?? -1));
  grade.innerHTML = ''; mostrando = 0;
  conta.textContent = lista.length === 1 ? '1 peça' : lista.length + ' peças';
  vazio.hidden = lista.length > 0;
  maisPecas();
}
function maisPecas() {
  const frag = document.createDocumentFragment();
  lista.slice(mostrando, mostrando + LOTE).forEach(p => frag.appendChild(card(p)));
  grade.appendChild(frag);
  mostrando += LOTE;
}
new IntersectionObserver(es => { if (es[0].isIntersecting && mostrando < lista.length) maisPecas(); }, {rootMargin: '900px'}).observe(mais);

$('ocasioes').addEventListener('click', ev => {
  const b = ev.target.closest('.chip'); if (!b) return;
  ocasiao = b.dataset.c;
  document.querySelectorAll('#ocasioes .chip').forEach(x => x.classList.toggle('ativo', x === b));
  filtrar();
});
$('cores')?.addEventListener('click', ev => {
  const b = ev.target.closest('.cor'); if (!b) return;
  cor = cor === b.dataset.c ? '' : b.dataset.c;
  document.querySelectorAll('#cores .cor').forEach(x => x.classList.toggle('ativo', x.dataset.c === cor));
  filtrar();
});
let espera; $('busca').addEventListener('input', ev => { clearTimeout(espera); espera = setTimeout(() => { termo = ev.target.value; filtrar(); }, 150); });
$('ordem').addEventListener('change', ev => { ordem = ev.target.value; filtrar(); });
$('limpar').onclick = () => { ocasiao = cor = termo = ''; $('busca').value = ''; document.querySelectorAll('.chip,.cor').forEach(x => x.classList.toggle('ativo', x.dataset.c === '' && x.classList.contains('chip'))); filtrar(); };

// Detalhe da peça (abre pelo endereço #id, então o link pode ser compartilhado)
const modal = $('modal'), trilho = $('trilho'), minis = $('minis');
let fotoAtual = 0, totalFotos = 0;
function irFoto(i) {
  fotoAtual = (i + totalFotos) % totalFotos;
  trilho.scrollTo({left: trilho.clientWidth * fotoAtual, behavior: 'smooth'});
  minis.querySelectorAll('img').forEach((m, j) => m.classList.toggle('ativo', j === fotoAtual));
}
trilho.addEventListener('scroll', () => {
  const i = Math.round(trilho.scrollLeft / trilho.clientWidth);
  if (i !== fotoAtual) { fotoAtual = i; minis.querySelectorAll('img').forEach((m, j) => m.classList.toggle('ativo', j === i)); }
}, {passive: true});
$('ant').onclick = () => irFoto(fotoAtual - 1);
$('prox').onclick = () => irFoto(fotoAtual + 1);
function abrir(p) {
  totalFotos = p.f.length; fotoAtual = 0;
  trilho.innerHTML = p.f.map(f => \`<img src="\${f}" alt="">\`).join('');
  trilho.querySelectorAll('img').forEach(i => i.alt = p.n);
  minis.innerHTML = p.f.length > 1 ? p.f.map((f, j) => \`<img src="\${f}" alt="" loading="lazy" class="\${j ? '' : 'ativo'}">\`).join('') : '';
  minis.querySelectorAll('img').forEach((m, j) => m.onclick = () => irFoto(j));
  $('fg').classList.toggle('uma', p.f.length < 2);
  $('m-cats').textContent = p.c.map(i => CATS[i]).join(' · ');
  $('m-nome').textContent = p.n;
  $('m-preco').innerHTML = (p.a ? \`<s>\${brl(p.a)}</s> \` : '') + brl(p.p) + '<small>aluguel</small>';
  $('m-desc').textContent = p.d;
  const link = location.origin + location.pathname + '#' + p.i;
  $('m-quero').href = linkWhats(\`Olá, Sarah! Tenho interesse neste traje do catálogo:\\n\\n\${p.n} — \${brl(p.p)}\\n\${link}\`);
  $('m-copiar').onclick = () => navigator.clipboard?.writeText(link).then(() => { $('m-copiar').textContent = 'Link copiado!'; setTimeout(() => $('m-copiar').textContent = 'Copiar link da peça', 2000); });
  document.title = p.n + ' · Atelier Sarah Dergham';
  if (!modal.open) modal.showModal();
  trilho.scrollLeft = 0;
}
function porEndereco() {
  const id = decodeURIComponent(location.hash.slice(1));
  const p = id && PECAS.find(x => x.i === id);
  if (p) abrir(p); else if (modal.open) modal.close();
}
addEventListener('hashchange', porEndereco);
modal.addEventListener('close', () => { document.title = 'Catálogo de trajes · Atelier Sarah Dergham'; if (location.hash) history.pushState('', '', location.pathname + location.search); });
$('fechar').onclick = () => modal.close();
modal.addEventListener('click', ev => { if (ev.target === modal) modal.close(); });
addEventListener('keydown', ev => { if (!modal.open) return; if (ev.key === 'ArrowLeft') irFoto(fotoAtual - 1); if (ev.key === 'ArrowRight') irFoto(fotoAtual + 1); });

// Menu mobile
const menu = $('menu');
$('hamb').onclick = () => menu.classList.toggle('aberto');
$('ano').textContent = new Date().getFullYear();

filtrar();
porEndereco();
</script>
</body>
</html>
`;
}
