// Molde da página inicial. Usado em dois lugares:
//  - build.mjs (gera o site publicado)
//  - painel /admin (mostra o mesmo site com um botão "Editar" em cada parte)
// Não usa nada do Node, para rodar também no navegador.

const esc = (v) => String(v ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const lista = (v) => (Array.isArray(v) ? v.filter((x) => x != null && x !== '') : []);
// valor com padrão: usa o texto salvo; se estiver vazio, usa o padrão
const g = (obj, chave, padrao = '') => (obj && obj[chave] != null && String(obj[chave]).trim() !== '' ? obj[chave] : padrao);
const linkSeguro = (u) => (/^(https?:\/\/|mailto:|tel:|#|\/)/i.test(String(u || '').trim()) ? String(u).trim() : '#');

export function montarPagina(c, opcoes = {}) {
  const { css = '', edicao = false, vitrine = '', totalPecas = 0, temCatalogo = false } = opcoes;
  const urlFoto = opcoes.urlFoto || ((p) => String(p || '').replace(/^\//, ''));
  const E = (id) => (edicao && id ? ` data-ed="${id}"` : '');
  const titulo = (t, d) => `${esc(t)}${d ? ` <em>${esc(d)}</em>` : ''}`;
  const src = (f) => esc(urlFoto(f?.imagem || ''));
  const foto = (f, classe = '', id = '') =>
    f?.imagem
      ? `<div class="foto ${classe}"${E(id)} style="background-image:url('${src(f)}');background-position:${esc(f.enquadramento || 'center center')}"></div>`
      : `<div class="foto ${classe}"${E(id)}></div>`;

  const k = c.contato || {};
  const t = c.textos || {};
  const marca = c.marca || {};
  const seo = c.seo || {};
  const ini = c.inicio || {};
  const sob = c.sobre || {};
  const col = c.colecoes || {};
  const cat = c.catalogo || {};
  const gal = c.galeria || {};
  const com = c.como_funciona || {};
  const ava = c.avaliacoes || {};
  const duv = c.duvidas_secao || {};
  const age = c.agende || {};
  const fm = age.form || {};
  const depoimentos = lista(ava.depoimentos).filter((d) => d.texto);
  const logo = esc(urlFoto(g(marca, 'logo', '/fotos/logo.webp')));
  const nomeSite = g(seo, 'titulo', 'Atelier Sarah Dergham');
  const botaoAgendar = g(t, 'botao_agendar', 'Agende seu horário');
  const instagram = linkSeguro(k.instagram);
  const linkCatalogo = temCatalogo ? 'catalogo/' : linkSeguro(k.catalogo_link);

  return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
${edicao ? '<base href="https://atelierdasarah.com.br/">' : ''}
<title>${esc(nomeSite)}</title>
<meta name="description" content="${esc(g(seo, 'descricao', `Atelier Sarah Dergham — aluguel de trajes para noivas, debutantes e festas em ${k.cidade || 'Ubatuba – SP'}. Atendimento exclusivo com horário marcado.`))}">
<meta property="og:title" content="${esc(nomeSite)}">
<meta property="og:description" content="${esc(ini.texto)}">
${ini.foto?.imagem ? `<meta property="og:image" content="${src(ini.foto)}">` : ''}
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Jost:wght@300;400;500&display=swap" rel="stylesheet">
<style>
${css}
</style>
</head>
<body${edicao ? ' class="modo-edicao"' : ''}>

<!-- ============ CABEÇALHO ============ -->
<header id="topo">
  <div class="container nav">
    <a href="#inicio" class="logo-img"${E('marca.logo')}><img src="${logo}" alt="Atelier da Sarah" width="1158" height="496"></a>
    <ul class="menu" id="menu"${E('textos.menu')}>
      <li><a href="#sobre">${esc(g(t, 'menu_sarah', 'A Sarah'))}</a></li>
      <li><a href="#colecoes">${esc(g(t, 'menu_colecoes', 'Coleções'))}</a></li>
      <li><a href="${esc(linkCatalogo)}">${esc(g(t, 'menu_catalogo', 'Catálogo'))}</a></li>
      <li><a href="#avaliacoes">${esc(g(t, 'menu_avaliacoes', 'Avaliações'))}</a></li>
      <li><a href="#duvidas">${esc(g(t, 'menu_duvidas', 'Dúvidas'))}</a></li>
      <li><a href="#agende">${esc(g(t, 'menu_contato', 'Contato'))}</a></li>
    </ul>
    <a href="#agende" class="btn btn-ouro"${E('textos.botao_agendar')}>${esc(botaoAgendar)}</a>
    <button class="hamb" id="hamb" aria-label="Abrir menu"><span></span></button>
  </div>
</header>

<!-- ============ INÍCIO ============ -->
<section class="hero-video" id="inicio" aria-label="Boas-vindas ao Atelier da Sarah! Que bom ter você aqui. Fique à vontade!">
  <h1 class="so-leitor">Boas-vindas ao Atelier da Sarah. ${esc(ini.titulo)} ${esc(ini.titulo_destaque)}</h1>
  <video class="video-boas-vindas"${E('inicio.video')} width="1920" height="1080" poster="${esc(urlFoto(g(ini, 'video_capa', '/fotos/boas-vindas-capa.jpg')))}" autoplay muted playsinline preload="auto" aria-hidden="true">
    <source src="${esc(urlFoto(g(ini, 'video', '/fotos/boas-vindas.mp4')))}" type="video/mp4">
  </video>
</section>
<section class="hero-chamada">
  <div class="container">
    <span class="eyebrow"${E('inicio.chamada')}>${esc(ini.chamada)}</span>
    <p${E('inicio.texto')}>${esc(ini.texto)}</p>
    <div class="hero-botoes"${E('textos.botoes_topo')}>
      <a href="#agende" class="btn btn-ouro">${esc(botaoAgendar)}</a>
      <a href="#duvidas" class="btn btn-linha">${esc(g(t, 'botao_duvidas', 'Dúvidas'))}</a>
    </div>
    ${ini.premio_titulo || edicao ? `<div class="premio"${E('inicio.premio')}>
      <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#b8975a" stroke-width="1"><circle cx="12" cy="9" r="6"/><path d="M8.5 14 7 22l5-3 5 3-1.5-8"/><path d="m12 6 .9 1.9 2.1.3-1.5 1.4.4 2.1L12 10.7l-1.9 1 .4-2.1L9 8.2l2.1-.3z"/></svg>
      <div><strong>${esc(ini.premio_titulo)}</strong>${esc(ini.premio_texto)}</div>
    </div>` : ''}
  </div>
</section>

<!-- ============ SOBRE A SARAH ============ -->
<section class="sobre" id="sobre">
  <div class="container sobre-grid">
    <div class="sobre-fotos revela">
      ${foto(sob.foto_principal, 'f1', 'sobre.foto_principal')}
      ${foto(sob.foto_menor, 'f2', 'sobre.foto_menor')}
    </div>
    <div class="sobre-texto revela">
      <span class="eyebrow"${E('sobre.chamada')}>${esc(sob.chamada)}</span>
      <h2${E('sobre.titulo')}>${titulo(sob.titulo, sob.titulo_destaque)}</h2>
      <div class="paragrafos"${E('sobre.paragrafos')}>
        ${lista(sob.paragrafos).map((p) => `<p>${esc(p)}</p>`).join('\n        ')}
      </div>
      <div class="assinatura"${E('textos.assinatura')}>${esc(g(t, 'assinatura', 'Sarah Dergham'))}</div>
      <div class="numeros"${E('sobre.numeros')}>
        ${lista(sob.numeros).map((n) => `<div><b>${esc(n.valor)}</b><span>${esc(n.rotulo)}</span></div>`).join('\n        ')}
      </div>
    </div>
  </div>
</section>

<!-- ============ COLEÇÕES ============ -->
<section class="colecoes" id="colecoes">
  <div class="container">
    <div class="titulo-secao revela">
      <span class="eyebrow"${E('colecoes.chamada')}>${esc(g(col, 'chamada', 'Coleções'))}</span>
      <h2${E('colecoes.titulo')}>${titulo(col.titulo, col.titulo_destaque)}</h2>
      <div class="divisor"><span></span></div>
      <p${E('colecoes.texto')}>${esc(col.texto)}</p>
    </div>
    <div class="cards"${E('colecoes.cards')}>
      ${lista(col.cards).map((card, i) => `<a href="#agende" class="card revela" data-ocasiao="${esc(card.ocasiao)}"${E(`colecoes.cards.${i}`)}>
        <div class="card-img">${foto(card.foto)}</div>
        <div class="card-info"><h3>${esc(card.nome)}</h3><p>${esc(card.texto)}</p><span class="eyebrow" style="color:var(--ouro-escuro)">${esc(g(col, 'botao_cartao', 'Agendar prova'))}</span></div>
      </a>`).join('\n      ')}
    </div>
    <div class="catalogo revela">
      <a href="${esc(linkCatalogo)}" class="btn btn-linha"${E('colecoes.botao')}>${esc(g(col, 'botao', 'Ver todos os trajes'))}</a>
    </div>
  </div>
</section>

<!-- ============ CATÁLOGO ============ -->
<section class="catalogo-secao" id="catalogo">
  <div class="container">
    <div class="titulo-secao revela">
      <span class="eyebrow"${E('catalogo.chamada')}>${esc(g(cat, 'chamada', 'Catálogo'))}</span>
      <h2${E('catalogo.titulo')}>${titulo(cat.titulo, cat.titulo_destaque)}</h2>
      <div class="divisor"><span></span></div>
      <p${E('catalogo.texto')}>${esc(cat.texto)}</p>
    </div>
    <div class="vitrine-area"${E('catalogo.pecas')}>
    ${temCatalogo ? vitrine : `<div class="catalogo-moldura revela"><iframe src="${esc(linkSeguro(k.catalogo_link))}" title="Catálogo de trajes" loading="lazy"></iframe></div>`}
    </div>
    <div class="catalogo revela">
      <a href="${esc(linkCatalogo)}" class="btn btn-ouro"${E('catalogo.botao')}>${esc(g(cat, 'botao', 'Ver o catálogo completo'))}${totalPecas ? ` · ${totalPecas} peças` : ''}</a>
    </div>
  </div>
</section>

<!-- ============ GALERIA ============ -->
<section class="galeria-secao" id="galeria">
  <div class="container">
    <div class="titulo-secao revela">
      <span class="eyebrow"${E('galeria.chamada')}>${esc(g(gal, 'chamada', 'Destaques'))}</span>
      <h2${E('galeria.titulo')}>${titulo(gal.titulo, gal.titulo_destaque)}</h2>
      <div class="divisor"><span></span></div>
    </div>
    <div class="galeria"${E('galeria.fotos')}>
      ${lista(gal.fotos).map((f, i) => `<a href="${esc(linkCatalogo)}" class="revela"${E(`galeria.fotos.${i}`)}>${foto(f)}</a>`).join('\n      ')}
    </div>
    <div class="catalogo revela">
      <a href="${esc(instagram)}" target="_blank" rel="noopener" class="btn btn-linha"${E('galeria.botao')}>${esc(g(gal, 'botao', 'Ver mais no Instagram'))}</a>
    </div>
  </div>
</section>

<!-- ============ COMO FUNCIONA ============ -->
<section id="como-funciona">
  <div class="container">
    <div class="titulo-secao revela">
      <span class="eyebrow"${E('como_funciona.chamada')}>${esc(g(com, 'chamada', 'Atendimento exclusivo'))}</span>
      <h2${E('como_funciona.titulo')}>${titulo(g(com, 'titulo', 'Como'), g(com, 'titulo_destaque', 'funciona'))}</h2>
    </div>
    <div class="passos revela"${E('como_funciona.passos')}>
      ${lista(com.passos).map((p, i) => `<div class="passo"${E(`como_funciona.passos.${i}`)}><div class="num">${String(i + 1).padStart(2, '0')}</div><h3>${esc(p.titulo)}</h3><p>${esc(p.texto)}</p></div>`).join('\n      ')}
    </div>
  </div>
</section>

<!-- ============ AVALIAÇÕES ============ -->
<section class="avaliacoes" id="avaliacoes">
  <div class="container">
    <div class="titulo-secao revela">
      <span class="eyebrow"${E('avaliacoes.chamada')}>${esc(g(ava, 'chamada', 'Avaliações'))}</span>
      <h2${E('avaliacoes.titulo')}>${titulo(g(ava, 'titulo', 'O que dizem'), g(ava, 'titulo_destaque', 'nossas clientes'))}</h2>
    </div>
    <div class="depo-wrap revela"${E('avaliacoes.depoimentos')}>
      <div class="aspas">“</div>
      ${depoimentos.length
        ? depoimentos.map((d, i) => `<div class="depo${i === 0 ? ' ativo' : ''}"${E(`avaliacoes.depoimentos.${i}`)}>
        <blockquote>${esc(d.texto)}</blockquote>
        <div class="estrelas">★★★★★</div>
        <cite>${esc(d.nome)}${d.detalhe ? `<span>${esc(d.detalhe)}</span>` : ''}</cite>
      </div>`).join('\n      ') + (depoimentos.length > 1 ? `
      <div class="pontos">${depoimentos.map((_, i) => `<button${i === 0 ? ' class="ativo"' : ''} aria-label="Depoimento ${i + 1}"></button>`).join('')}</div>` : '')
        : `<div class="depo ativo">
        <blockquote${E('avaliacoes.texto')}>${esc(ava.texto)}</blockquote>
        <div class="estrelas">★★★★★</div>
        <a class="btn btn-ouro" href="${esc(instagram)}" target="_blank" rel="noopener" style="margin-top:14px"${E('avaliacoes.botao')}>${esc(g(ava, 'botao', 'Ver avaliações no Instagram'))}</a>
      </div>`}
    </div>
    <div class="nota-geral revela"${E('avaliacoes.numeros')}>
      ${lista(ava.numeros).map((n) => `<div><b>${esc(n.valor)}</b><span>${esc(n.rotulo)}</span></div>`).join('\n      ')}
    </div>
  </div>
</section>

<!-- ============ DÚVIDAS ============ -->
<section id="duvidas">
  <div class="container">
    <div class="titulo-secao revela">
      <span class="eyebrow"${E('duvidas_secao.chamada')}>${esc(g(duv, 'chamada', 'Dúvidas frequentes'))}</span>
      <h2${E('duvidas_secao.titulo')}>${titulo(g(duv, 'titulo', 'Tudo o que você'), g(duv, 'titulo_destaque', 'precisa saber'))}</h2>
    </div>
    <div class="faq revela"${E('duvidas')}>
      ${lista(c.duvidas).map((d, i) => `<details${i === 0 || edicao ? ' open' : ''}${E(`duvidas.${i}`)}>
        <summary>${esc(d.pergunta)}</summary>
        <p>${esc(d.resposta)}</p>
      </details>`).join('\n      ')}
    </div>
    <div class="faq-cta revela"${E('duvidas_secao.cta')}>
      <p>${esc(g(duv, 'cta_texto', 'Ainda ficou com alguma dúvida?'))}</p>
      <a class="btn btn-linha js-whats" data-msg="Olá, Sarah! Tenho uma dúvida sobre o atelier." href="#" target="_blank" rel="noopener">${esc(g(duv, 'cta_botao', 'Fale com a Sarah'))}</a>
    </div>
  </div>
</section>

<!-- ============ AGENDE ============ -->
<section class="agende" id="agende">
  <div class="gotas" aria-hidden="true"><canvas></canvas><div class="tinta"></div></div>
  <div class="container agende-grid">
    <div class="agende-texto revela">
      <span class="eyebrow"${E('agende.chamada')}>${esc(g(age, 'chamada', 'Agendamento'))}</span>
      <h2${E('agende.titulo')}>${titulo(age.titulo, age.titulo_destaque)}</h2>
      <p${E('agende.texto')}>${esc(age.texto)}</p>
      <ul class="info">
        <li${E('contato.endereco')}><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke-width="1.2"><path d="M12 22s7-6.3 7-12a7 7 0 1 0-14 0c0 5.7 7 12 7 12z"/><circle cx="12" cy="10" r="2.5"/></svg>${k.endereco ? `<a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(k.endereco)}" target="_blank" rel="noopener">${esc(k.endereco)}<small>Ver no mapa</small></a>` : esc(k.cidade)}</li>
        <li${E('agende.horario')}><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke-width="1.2"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>${esc(age.horario)}</li>
        <li${E('contato.instagram_usuario')}><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke-width="1.2"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".6"/></svg>${esc(k.instagram_usuario)}</li>
      </ul>
    </div>
    <form id="form" class="revela"${E('agende.form')}>
      <h3>${esc(g(fm, 'titulo', 'Agende seu horário'))}</h3>
      <p class="sub">${esc(g(fm, 'sub', 'Resposta rápida pelo WhatsApp'))}</p>
      <label>${esc(g(fm, 'nome', 'Seu nome'))}<input name="nome" required placeholder="${esc(g(fm, 'nome_dica', 'Como podemos te chamar?'))}"></label>
      <div class="linha2">
        <label${E('agende.ocasioes')}>${esc(g(fm, 'ocasiao', 'Ocasião'))}
          <select name="ocasiao" id="ocasiao">
            ${lista(age.ocasioes).map((o) => `<option>${esc(o)}</option>`).join('')}
          </select>
        </label>
        <label>${esc(g(fm, 'data_evento', 'Data do evento'))}<input type="date" name="evento"></label>
      </div>
      <label>${esc(g(fm, 'data_prova', 'Melhor dia para a prova'))}<input type="date" name="prova"></label>
      <fieldset class="pessoas">
        <legend>${esc(g(fm, 'pessoas', 'Quantas pessoas vêm ao atendimento?'))}</legend>
        <div class="linha3">
          <label>${esc(g(fm, 'total', 'Total'))}<input type="number" name="total" min="1" max="20" inputmode="numeric" placeholder="Ex.: 3"></label>
          <label>${esc(g(fm, 'trajes', 'Vão provar trajes'))}<input type="number" name="trajes" min="0" max="20" inputmode="numeric" placeholder="Ex.: 1"></label>
          <label>${esc(g(fm, 'acompanhar', 'Só acompanhar'))}<input type="number" name="acompanhar" min="0" max="20" inputmode="numeric" placeholder="Ex.: 2"></label>
        </div>
      </fieldset>
      <fieldset class="cor-traje" id="cor-traje" hidden>
        <legend>${esc(g(fm, 'cor_pergunta', 'Já tem uma cor definida para o traje?'))}</legend>
        <div class="opcoes">
          <label class="opcao"><input type="radio" name="tem_cor" value="sim"> ${esc(g(fm, 'cor_sim', 'Sim'))}</label>
          <label class="opcao"><input type="radio" name="tem_cor" value="nao"> ${esc(g(fm, 'cor_nao', 'Ainda não tenho'))}</label>
        </div>
        <label id="qual-cor" hidden>${esc(g(fm, 'cor_qual', 'Qual cor?'))}<input name="cor" placeholder="${esc(g(fm, 'cor_dica', 'Ex.: azul serenity, rosê, marsala...'))}"></label>
      </fieldset>
      <label>${esc(g(fm, 'mensagem', 'Mensagem (opcional)'))}<textarea name="msg" placeholder="${esc(g(fm, 'mensagem_dica', 'Conte um pouco sobre o que você imagina...'))}"></textarea></label>
      <button class="btn btn-ouro" type="submit">${esc(g(fm, 'botao', 'Enviar pelo WhatsApp'))}</button>
    </form>
  </div>
</section>

<!-- ============ RODAPÉ ============ -->
<footer>
  <div class="container">
    <img class="logo-rodape" src="${logo}" alt="Atelier da Sarah" width="1158" height="496" loading="lazy">
    <div class="divisor"><span></span></div>
    <div class="redes"${E('contato.redes')}>
      <a href="${esc(instagram)}" target="_blank" rel="noopener" aria-label="Instagram"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke-width="1.4"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".6"/></svg></a>
      <a href="#" class="js-whats" data-msg="Olá, Sarah! Vim pelo site." target="_blank" rel="noopener" aria-label="WhatsApp"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke-width="1.4"><path d="M3 21l1.6-4.6A8.5 8.5 0 1 1 7.7 19.6z"/></svg></a>
    </div>
    <p class="copy"${E('textos.rodape')}>© <span id="ano"></span> ${esc(g(t, 'rodape', 'Atelier Sarah Dergham'))} · ${esc(k.cidade)}</p>
  </div>
</footer>

<a href="#" class="whats js-whats" data-msg="Olá, Sarah! Gostaria de agendar um horário." target="_blank" rel="noopener" aria-label="Falar no WhatsApp">
  <svg width="30" height="30" viewBox="0 0 32 32" fill="#fff"><path d="M16 3a13 13 0 0 0-11.2 19.6L3 29l6.6-1.7A13 13 0 1 0 16 3zm0 23.7c-2 0-4-.5-5.7-1.6l-.4-.2-3.9 1 1-3.8-.3-.4A10.7 10.7 0 1 1 16 26.7zm5.9-8c-.3-.2-1.9-1-2.2-1-.3-.1-.5-.2-.7.2-.2.3-.8 1-1 1.2-.2.2-.4.2-.7.1a8.8 8.8 0 0 1-4.4-3.8c-.3-.6.3-.5 1-1.7.1-.2 0-.4 0-.6l-1-2.4c-.3-.6-.5-.5-.7-.5h-.6c-.2 0-.6.1-.9.4-.3.3-1.2 1.1-1.2 2.8s1.2 3.3 1.4 3.5c.2.2 2.4 3.6 5.8 5 2.1.9 3 1 4 .8.7-.1 1.9-.8 2.2-1.5.3-.7.3-1.3.2-1.5-.1-.1-.3-.2-.6-.4z"/></svg>
</a>

<script>
  const WHATSAPP = ${JSON.stringify(String(k.whatsapp || '').replace(/\D/g, ''))};
  const EDICAO = ${edicao ? 'true' : 'false'};

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
    if (EDICAO) return;
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
  if (depos.length > 1 && !EDICAO) {
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

  // Gotas douradas que se fundem no fundo do agendamento (só anima quando a seção aparece)
  (function(){
    const box = document.querySelector('.gotas');
    if (!box || matchMedia('(prefers-reduced-motion:reduce)').matches) return;
    const cv = box.querySelector('canvas'), ctx = cv.getContext('2d');
    let bolhas = [], id = null, vivo = false;
    function medir(){
      cv.width = cv.clientWidth; cv.height = cv.clientHeight; bolhas = [];
      const esc = Math.max(.85, Math.min(1.3, cv.width / 1200)), qtd = Math.max(7, Math.min(10, Math.round(cv.width * cv.height / 60000)));
      for (let i = 0; i < qtd; i++) bolhas.push({
        x: Math.random() * cv.width, y: Math.random() * cv.height,
        vx: (Math.random() - .5) * 1.2, vy: (Math.random() - .5) * 1.2,
        r: (30 + Math.random() * 46) * esc
      });
    }
    function passo(){
      ctx.fillStyle = '#000'; ctx.fillRect(0, 0, cv.width, cv.height);
      ctx.fillStyle = '#fff';
      bolhas.forEach(b => {
        b.x += b.vx; b.y += b.vy;
        if (b.x < b.r || b.x > cv.width - b.r) b.vx *= -1;
        if (b.y < b.r || b.y > cv.height - b.r) b.vy *= -1;
        ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, 6.284); ctx.fill();
      });
      id = requestAnimationFrame(passo);
    }
    medir(); addEventListener('resize', medir);
    new IntersectionObserver(e => {
      if (e[0].isIntersecting && !vivo) { vivo = true; passo(); }
      else if (!e[0].isIntersecting && vivo) { vivo = false; cancelAnimationFrame(id); }
    }).observe(box);
  })();

  // Animação de entrada (no painel tudo já aparece)
  if (EDICAO) document.querySelectorAll('.revela').forEach(el => el.classList.add('visivel'));
  else {
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visivel'); io.unobserve(e.target); }
    }), {threshold:.12});
    document.querySelectorAll('.revela').forEach(el => io.observe(el));
  }

  document.getElementById('ano').textContent = new Date().getFullYear();
</script>
</body>
</html>
`;
}
