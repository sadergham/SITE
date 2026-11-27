// Monta o site (dist/) a partir de conteudo/site.json, que a Sarah edita pelo painel.
// Rodar: node build.mjs
import { readFileSync, writeFileSync, mkdirSync, cpSync, rmSync, existsSync } from 'node:fs';

const c = JSON.parse(readFileSync('conteudo/site.json', 'utf8'));
const css = readFileSync('estilo.css', 'utf8');

// Escapa texto para HTML
const e = (v) => String(v ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const lista = (v) => (Array.isArray(v) ? v.filter(Boolean) : []);
const titulo = (t, d) => `${e(t)}${d ? ` <em>${e(d)}</em>` : ''}`;
// Caminho da foto: aceita "/fotos/x.jpg" ou "fotos/x.jpg"
const src = (f) => e(String(f?.imagem || '').replace(/^\//, ''));
const foto = (f, classe = '') =>
  f?.imagem
    ? `<div class="foto ${classe}" style="background-image:url('${src(f)}');background-position:${e(f.enquadramento || 'center center')}"></div>`
    : `<div class="foto ${classe}"></div>`;

const k = c.contato || {};
const ini = c.inicio || {};
const sob = c.sobre || {};
const col = c.colecoes || {};
const cat = c.catalogo || {};
const gal = c.galeria || {};
const ava = c.avaliacoes || {};
const age = c.agende || {};
const depoimentos = lista(ava.depoimentos).filter((d) => d.texto);

const html = `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Atelier Sarah Dergham</title>
<meta name="description" content="Atelier Sarah Dergham — aluguel de trajes para noivas, debutantes e festas em ${e(k.cidade)}. Atendimento exclusivo com horário marcado.">
<meta property="og:title" content="Atelier Sarah Dergham">
<meta property="og:description" content="${e(ini.texto)}">
${ini.foto?.imagem ? `<meta property="og:image" content="${src(ini.foto)}">` : ''}
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Jost:wght@300;400;500&display=swap" rel="stylesheet">
<style>
${css}
</style>
</head>
<body>

<!-- ============ CABEÇALHO ============ -->
<header id="topo">
  <div class="container nav">
    <a href="#inicio" class="logo-img"><img src="fotos/logo.webp" alt="Atelier da Sarah" width="1158" height="496"></a>
    <ul class="menu" id="menu">
      <li><a href="#sobre">A Sarah</a></li>
      <li><a href="#colecoes">Coleções</a></li>
      <li><a href="#catalogo">Catálogo</a></li>
      <li><a href="#avaliacoes">Avaliações</a></li>
      <li><a href="#duvidas">Dúvidas</a></li>
      <li><a href="#agende">Contato</a></li>
    </ul>
    <a href="#agende" class="btn btn-ouro">Agende seu horário</a>
    <button class="hamb" id="hamb" aria-label="Abrir menu"><span></span></button>
  </div>
</header>

<!-- ============ INÍCIO ============ -->
<section class="hero-video" id="inicio">
  <h1 class="so-leitor">Boas-vindas ao Atelier da Sarah. ${e(ini.titulo)} ${e(ini.titulo_destaque)}</h1>
  <video class="video-boas-vindas" src="fotos/boas-vindas.mp4" poster="fotos/boas-vindas-capa.jpg" autoplay muted loop playsinline preload="auto" aria-label="Vídeo de boas-vindas: Sarah dá as boas-vindas ao Atelier da Sarah"></video>
</section>
<section class="hero-chamada">
  <div class="container">
    <span class="eyebrow">${e(ini.chamada)}</span>
    <p>${e(ini.texto)}</p>
    <div class="hero-botoes">
      <a href="#agende" class="btn btn-ouro">Agende seu horário</a>
      <a href="#duvidas" class="btn btn-linha">Dúvidas</a>
    </div>
    ${ini.premio_titulo ? `<div class="premio">
      <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#b8975a" stroke-width="1"><circle cx="12" cy="9" r="6"/><path d="M8.5 14 7 22l5-3 5 3-1.5-8"/><path d="m12 6 .9 1.9 2.1.3-1.5 1.4.4 2.1L12 10.7l-1.9 1 .4-2.1L9 8.2l2.1-.3z"/></svg>
      <div><strong>${e(ini.premio_titulo)}</strong>${e(ini.premio_texto)}</div>
    </div>` : ''}
  </div>
</section>

<!-- ============ SOBRE A SARAH ============ -->
<section class="sobre" id="sobre">
  <div class="container sobre-grid">
    <div class="sobre-fotos revela">
      ${foto(sob.foto_principal, 'f1')}
      ${foto(sob.foto_menor, 'f2')}
    </div>
    <div class="sobre-texto revela">
      <span class="eyebrow">${e(sob.chamada)}</span>
      <h2>${titulo(sob.titulo, sob.titulo_destaque)}</h2>
      ${lista(sob.paragrafos).map((p) => `<p>${e(p)}</p>`).join('\n      ')}
      <div class="assinatura">Sarah Dergham</div>
      <div class="numeros">
        ${lista(sob.numeros).map((n) => `<div><b>${e(n.valor)}</b><span>${e(n.rotulo)}</span></div>`).join('\n        ')}
      </div>
    </div>
  </div>
</section>

<!-- ============ COLEÇÕES ============ -->
<section class="colecoes" id="colecoes">
  <div class="container">
    <div class="titulo-secao revela">
      <span class="eyebrow">Coleções</span>
      <h2>${titulo(col.titulo, col.titulo_destaque)}</h2>
      <div class="divisor"><span></span></div>
      <p>${e(col.texto)}</p>
    </div>
    <div class="cards">
      ${lista(col.cards).map((card) => `<a href="#agende" class="card revela" data-ocasiao="${e(card.ocasiao)}">
        <div class="card-img">${foto(card.foto)}</div>
        <div class="card-info"><h3>${e(card.nome)}</h3><p>${e(card.texto)}</p><span class="eyebrow" style="color:var(--ouro-escuro)">Agendar prova</span></div>
      </a>`).join('\n      ')}
    </div>
    <div class="catalogo revela">
      <a href="#catalogo" class="btn btn-linha">Ver todos os trajes</a>
    </div>
  </div>
</section>

<!-- ============ CATÁLOGO ============ -->
<section class="catalogo-secao" id="catalogo">
  <div class="container">
    <div class="titulo-secao revela">
      <span class="eyebrow">Catálogo</span>
      <h2>${titulo(cat.titulo, cat.titulo_destaque)}</h2>
      <div class="divisor"><span></span></div>
      <p>${e(cat.texto)}</p>
    </div>
    <div class="catalogo-moldura revela">
      <iframe src="${e(k.catalogo_link)}" title="Catálogo de trajes do Atelier Sarah Dergham" loading="lazy"></iframe>
    </div>
    <div class="catalogo revela">
      <a href="${e(k.catalogo_link)}" target="_blank" rel="noopener" class="btn btn-linha">Abrir catálogo em tela cheia</a>
    </div>
  </div>
</section>

<!-- ============ GALERIA ============ -->
<section class="galeria-secao" id="galeria">
  <div class="container">
    <div class="titulo-secao revela">
      <span class="eyebrow">Destaques</span>
      <h2>${titulo(gal.titulo, gal.titulo_destaque)}</h2>
      <div class="divisor"><span></span></div>
    </div>
    <div class="galeria">
      ${lista(gal.fotos).map((f) => `<a href="#catalogo" class="revela">${foto(f)}</a>`).join('\n      ')}
    </div>
    <div class="catalogo revela">
      <a href="${e(k.instagram)}" target="_blank" rel="noopener" class="btn btn-linha">Ver mais no Instagram</a>
    </div>
  </div>
</section>

<!-- ============ COMO FUNCIONA ============ -->
<section id="como-funciona">
  <div class="container">
    <div class="titulo-secao revela">
      <span class="eyebrow">Atendimento exclusivo</span>
      <h2>Como <em>funciona</em></h2>
    </div>
    <div class="passos revela">
      ${lista(c.como_funciona?.passos).map((p, i) => `<div class="passo"><div class="num">${String(i + 1).padStart(2, '0')}</div><h3>${e(p.titulo)}</h3><p>${e(p.texto)}</p></div>`).join('\n      ')}
    </div>
  </div>
</section>

<!-- ============ AVALIAÇÕES ============ -->
<section class="avaliacoes" id="avaliacoes">
  <div class="container">
    <div class="titulo-secao revela">
      <span class="eyebrow">Avaliações</span>
      <h2>O que dizem <em>nossas clientes</em></h2>
    </div>
    <div class="depo-wrap revela">
      <div class="aspas">“</div>
      ${depoimentos.length
        ? depoimentos.map((d, i) => `<div class="depo${i === 0 ? ' ativo' : ''}">
        <blockquote>${e(d.texto)}</blockquote>
        <div class="estrelas">★★★★★</div>
        <cite>${e(d.nome)}${d.detalhe ? `<span>${e(d.detalhe)}</span>` : ''}</cite>
      </div>`).join('\n      ') + (depoimentos.length > 1 ? `
      <div class="pontos">${depoimentos.map((_, i) => `<button${i === 0 ? ' class="ativo"' : ''} aria-label="Depoimento ${i + 1}"></button>`).join('')}</div>` : '')
        : `<div class="depo ativo">
        <blockquote>${e(ava.texto)}</blockquote>
        <div class="estrelas">★★★★★</div>
        <a class="btn btn-ouro" href="${e(k.instagram)}" target="_blank" rel="noopener" style="margin-top:14px">Ver avaliações no Instagram</a>
      </div>`}
    </div>
    <div class="nota-geral revela">
      ${lista(ava.numeros).map((n) => `<div><b>${e(n.valor)}</b><span>${e(n.rotulo)}</span></div>`).join('\n      ')}
    </div>
  </div>
</section>

<!-- ============ DÚVIDAS ============ -->
<section id="duvidas">
  <div class="container">
    <div class="titulo-secao revela">
      <span class="eyebrow">Dúvidas frequentes</span>
      <h2>Tudo o que você <em>precisa saber</em></h2>
    </div>
    <div class="faq revela">
      ${lista(c.duvidas).map((d, i) => `<details${i === 0 ? ' open' : ''}>
        <summary>${e(d.pergunta)}</summary>
        <p>${e(d.resposta)}</p>
      </details>`).join('\n      ')}
    </div>
    <div class="faq-cta revela">
      <p>Ainda ficou com alguma dúvida?</p>
      <a class="btn btn-linha js-whats" data-msg="Olá, Sarah! Tenho uma dúvida sobre o atelier." href="#" target="_blank" rel="noopener">Fale com a Sarah</a>
    </div>
  </div>
</section>

<!-- ============ AGENDE ============ -->
<section class="agende" id="agende">
  <div class="container agende-grid">
    <div class="agende-texto revela">
      <span class="eyebrow">Agendamento</span>
      <h2>${titulo(age.titulo, age.titulo_destaque)}</h2>
      <p>${e(age.texto)}</p>
      <ul class="info">
        <li><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke-width="1.2"><path d="M12 22s7-6.3 7-12a7 7 0 1 0-14 0c0 5.7 7 12 7 12z"/><circle cx="12" cy="10" r="2.5"/></svg>${k.endereco ? `<a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(k.endereco)}" target="_blank" rel="noopener">${e(k.endereco)}<small>Ver no mapa</small></a>` : e(k.cidade)}</li>
        <li><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke-width="1.2"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>${e(age.horario)}</li>
        <li><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke-width="1.2"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".6"/></svg>${e(k.instagram_usuario)}</li>
      </ul>
    </div>
    <form id="form" class="revela">
      <h3>Agende seu horário</h3>
      <p class="sub">Resposta rápida pelo WhatsApp</p>
      <label>Seu nome<input name="nome" required placeholder="Como podemos te chamar?"></label>
      <div class="linha2">
        <label>Ocasião
          <select name="ocasiao" id="ocasiao">
            ${lista(age.ocasioes).map((o) => `<option>${e(o)}</option>`).join('')}
          </select>
        </label>
        <label>Data do evento<input type="date" name="evento"></label>
      </div>
      <label>Melhor dia para a prova<input type="date" name="prova"></label>
      <fieldset class="pessoas">
        <legend>Quantas pessoas vêm ao atendimento?</legend>
        <div class="linha3">
          <label>Total<input type="number" name="total" min="1" max="20" inputmode="numeric" placeholder="Ex.: 3"></label>
          <label>Vão provar trajes<input type="number" name="trajes" min="0" max="20" inputmode="numeric" placeholder="Ex.: 1"></label>
          <label>Só acompanhar<input type="number" name="acompanhar" min="0" max="20" inputmode="numeric" placeholder="Ex.: 2"></label>
        </div>
      </fieldset>
      <fieldset class="cor-traje" id="cor-traje" hidden>
        <legend>Já tem uma cor definida para o traje?</legend>
        <div class="opcoes">
          <label class="opcao"><input type="radio" name="tem_cor" value="sim"> Sim</label>
          <label class="opcao"><input type="radio" name="tem_cor" value="nao"> Ainda não tenho</label>
        </div>
        <label id="qual-cor" hidden>Qual cor?<input name="cor" placeholder="Ex.: azul serenity, rosê, marsala..."></label>
      </fieldset>
      <label>Mensagem (opcional)<textarea name="msg" placeholder="Conte um pouco sobre o que você imagina..."></textarea></label>
      <button class="btn btn-ouro" type="submit">Enviar pelo WhatsApp</button>
    </form>
  </div>
</section>

<!-- ============ RODAPÉ ============ -->
<footer>
  <div class="container">
    <img class="logo-rodape" src="fotos/logo.webp" alt="Atelier da Sarah" width="1158" height="496" loading="lazy">
    <div class="divisor"><span></span></div>
    <div class="redes">
      <a href="${e(k.instagram)}" target="_blank" rel="noopener" aria-label="Instagram"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke-width="1.4"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".6"/></svg></a>
      <a href="#" class="js-whats" data-msg="Olá, Sarah! Vim pelo site." target="_blank" rel="noopener" aria-label="WhatsApp"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke-width="1.4"><path d="M3 21l1.6-4.6A8.5 8.5 0 1 1 7.7 19.6z"/></svg></a>
    </div>
    <p class="copy">© <span id="ano"></span> Atelier Sarah Dergham · ${e(k.cidade)}</p>
  </div>
</footer>

<a href="#" class="whats js-whats" data-msg="Olá, Sarah! Gostaria de agendar um horário." target="_blank" rel="noopener" aria-label="Falar no WhatsApp">
  <svg width="30" height="30" viewBox="0 0 32 32" fill="#fff"><path d="M16 3a13 13 0 0 0-11.2 19.6L3 29l6.6-1.7A13 13 0 1 0 16 3zm0 23.7c-2 0-4-.5-5.7-1.6l-.4-.2-3.9 1 1-3.8-.3-.4A10.7 10.7 0 1 1 16 26.7zm5.9-8c-.3-.2-1.9-1-2.2-1-.3-.1-.5-.2-.7.2-.2.3-.8 1-1 1.2-.2.2-.4.2-.7.1a8.8 8.8 0 0 1-4.4-3.8c-.3-.6.3-.5 1-1.7.1-.2 0-.4 0-.6l-1-2.4c-.3-.6-.5-.5-.7-.5h-.6c-.2 0-.6.1-.9.4-.3.3-1.2 1.1-1.2 2.8s1.2 3.3 1.4 3.5c.2.2 2.4 3.6 5.8 5 2.1.9 3 1 4 .8.7-.1 1.9-.8 2.2-1.5.3-.7.3-1.3.2-1.5-.1-.1-.3-.2-.6-.4z"/></svg>
</a>

<script>
  const WHATSAPP = ${JSON.stringify(String(k.whatsapp || '').replace(/\D/g, ''))};

  const linkWhats = msg => \`https://wa.me/\${WHATSAPP}?text=\${encodeURIComponent(msg)}\`;
  document.querySelectorAll('.js-whats').forEach(a => a.href = linkWhats(a.dataset.msg));

  // Pessoas: calcula "só acompanhar" e mostra a pergunta da cor quando alguém vai provar trajes
  const fm = document.getElementById('form');
  const corBox = document.getElementById('cor-traje');
  const qualCor = document.getElementById('qual-cor');
  let acompManual = false;
  fm.acompanhar.addEventListener('input', () => { acompManual = fm.acompanhar.value !== ''; });
  const atualizaPessoas = () => {
    const t = parseInt(fm.total.value, 10), p = parseInt(fm.trajes.value, 10);
    if (!acompManual && t >= 0 && p >= 0) fm.acompanhar.value = Math.max(0, t - p);
    corBox.hidden = !(p > 0);
  };
  fm.total.addEventListener('input', atualizaPessoas);
  fm.trajes.addEventListener('input', atualizaPessoas);
  fm.querySelectorAll('input[name=tem_cor]').forEach(r => r.addEventListener('change', () => { qualCor.hidden = fm.tem_cor.value !== 'sim'; }));

  // Formulário → mensagem pronta no WhatsApp
  const fmt = d => d ? d.split('-').reverse().join('/') : 'a combinar';
  fm.addEventListener('submit', e => {
    e.preventDefault();
    const f = e.target;
    let msg = \`Olá, Sarah! Gostaria de agendar um horário no atelier.\\n\\n\` +
      \`Nome: \${f.nome.value}\\nOcasião: \${f.ocasiao.value}\\n\` +
      \`Data do evento: \${fmt(f.evento.value)}\\nMelhor dia para a prova: \${fmt(f.prova.value)}\`;
    if (f.total.value || f.trajes.value || f.acompanhar.value) {
      msg += \`\\n\\nPessoas no atendimento: \${f.total.value || '?'}\\nVão provar trajes: \${f.trajes.value || '?'}\\nSó acompanhar: \${f.acompanhar.value || '?'}\`;
    }
    if (!corBox.hidden && f.tem_cor.value) {
      msg += f.tem_cor.value === 'sim' ? \`\\nCor do traje: \${f.cor.value.trim() || 'já tenho (a combinar)'}\` : \`\\nCor do traje: ainda não tenho\`;
    }
    if (f.msg.value.trim()) msg += \`\\n\\n\${f.msg.value.trim()}\`;
    window.open(linkWhats(msg), '_blank');
  });

  // Cards de coleção já escolhem a ocasião no formulário
  document.querySelectorAll('.card').forEach(c => c.addEventListener('click', () => {
    const sel = document.getElementById('ocasiao');
    if ([...sel.options].some(o => o.value === c.dataset.ocasiao)) sel.value = c.dataset.ocasiao;
  }));

  // Depoimentos: troca automática
  const depos = [...document.querySelectorAll('.depo')];
  const pontos = [...document.querySelectorAll('.pontos button')];
  if (depos.length > 1) {
    let atual = 0;
    const mostra = i => { atual = i; depos.forEach((d, j) => d.classList.toggle('ativo', j === i)); pontos.forEach((p, j) => p.classList.toggle('ativo', j === i)); };
    pontos.forEach((p, i) => p.onclick = () => mostra(i));
    setInterval(() => mostra((atual + 1) % depos.length), 7000);
  }

  // Cabeçalho ao rolar
  const topo = document.getElementById('topo');
  addEventListener('scroll', () => topo.classList.toggle('rolou', scrollY > 40), {passive:true});

  // Menu mobile
  const menu = document.getElementById('menu');
  document.getElementById('hamb').onclick = () => menu.classList.toggle('aberto');
  menu.querySelectorAll('a').forEach(a => a.onclick = () => menu.classList.remove('aberto'));

  // Animação de entrada
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('visivel'); io.unobserve(e.target); }
  }), {threshold:.12});
  document.querySelectorAll('.revela').forEach(el => io.observe(el));

  document.getElementById('ano').textContent = new Date().getFullYear();
</script>
</body>
</html>
`;

// Gera a pasta dist/ com a página e as fotos
if (existsSync('dist')) rmSync('dist', { recursive: true, force: true });
mkdirSync('dist', { recursive: true });
writeFileSync('dist/index.html', html);
if (existsSync('fotos')) cpSync('fotos', 'dist/fotos', { recursive: true });
// Atalhos para o painel de edição: /admin e /painel
const atalho = '<!doctype html><meta charset="utf-8"><title>Painel</title><meta http-equiv="refresh" content="0;url=https://app.pagescms.org"><a href="https://app.pagescms.org">Abrir o painel</a>';
for (const p of ['admin', 'painel']) { mkdirSync(`dist/${p}`, { recursive: true }); writeFileSync(`dist/${p}/index.html`, atalho); }
console.log('Site gerado em dist/');
