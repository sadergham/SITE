// Mostra o site gerado (dist/) no computador, para testar antes de publicar.
// Rodar: node build.mjs && node scripts/servir.mjs   →   http://localhost:8765
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { join, extname, normalize } from 'node:path';

const raiz = join(import.meta.dirname, '..', 'dist');
const porta = Number(process.env.PORT || 8765);
const tipos = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.png': 'image/png', '.svg': 'image/svg+xml', '.mp4': 'video/mp4' };

createServer(async (req, res) => {
  try {
    const caminho = normalize(decodeURIComponent(new URL(req.url, 'http://x').pathname)).replace(/^([/\\])+/, '');
    let arq = join(raiz, caminho);
    if (!arq.startsWith(raiz)) { res.writeHead(403).end(); return; }
    if ((await stat(arq).catch(() => null))?.isDirectory()) arq = join(arq, 'index.html');
    const dados = await readFile(arq);
    const tipo = tipos[extname(arq).toLowerCase()] || 'application/octet-stream';
    // vídeos precisam responder a pedidos por partes (Range)
    const range = req.headers.range && /bytes=(\d*)-(\d*)/.exec(req.headers.range);
    if (range) {
      const ini = range[1] ? +range[1] : 0, fim = range[2] ? +range[2] : dados.length - 1;
      res.writeHead(206, { 'content-type': tipo, 'content-range': `bytes ${ini}-${fim}/${dados.length}`, 'accept-ranges': 'bytes', 'content-length': fim - ini + 1 });
      res.end(dados.subarray(ini, fim + 1));
      return;
    }
    res.writeHead(200, { 'content-type': tipo, 'accept-ranges': 'bytes' }).end(dados);
  } catch (e) {
    res.writeHead(e.code === 'ENOENT' ? 404 : 500).end(e.code === 'ENOENT' ? 'não encontrado' : 'erro');
  }
}).listen(porta, () => console.log(`Site em http://localhost:${porta}`));
