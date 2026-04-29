require('dotenv').config();
const { criarCliente } = require('./src/whatsapp/client');
const fs = require('fs');
const path = require('path');
const { logInfo, logError } = require('./src/utils/logger');

const DOWNLOAD_DIR = process.env.DOWNLOAD_DIR || './downloads';
const CLEANUP_HOURS = parseInt(process.env.CLEANUP_AFTER_HOURS) || 72;
const CLEANUP_INTERVAL = parseInt(process.env.CLEANUP_INTERVAL_HOURS) || 6;

// Armazenar nomes dos contatos
const contatos = new Map();

// Tipos de arquivo permitidos
const ALLOWED_MIMES = [
  'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
  'image/heic', 'image/heif', 'image/bmp', 'image/tiff',
  'application/dxf', 'application/dxf+', 'application/dxf+x',
  'image/vnd.dxf', 'image/vnd.dxf+x', 'application/pdf',
  'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-word', 'application/rtf', 'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/csv',
  'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.oasis.opendocument.text', 'application/vnd.oasis.opendocument.spreadsheet',
  'application/vnd.oasis.opendocument.presentation', 'text/plain', 'application/txt',
  'application/vnd.ms-xpsdocument', 'application/oxps', 'application/postscript', 'application/eps', 'application/x-eps'
];

// Sanitizar nome para usar em pasta
function sanitizarNome(nome) {
  return nome
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-zA-Z0-9]/g, '_')
    .substring(0, 50);
}

// Obter nome da pasta (com ou sem nome do contato)
function getNomePasta(numero, nome) {
  if (nome) {
    return `${sanitizarNome(nome)}_${numero}`;
  }
  return numero;
}

// Limpar arquivos antigos
function limparArquivosAntigos() {
  const maxAge = CLEANUP_HOURS * 60 * 60 * 1000;
  const agora = Date.now();
  let apagados = 0;

  try {
    if (!fs.existsSync(DOWNLOAD_DIR)) return;

    fs.readdirSync(DOWNLOAD_DIR).forEach(pasta => {
      const caminhoPasta = path.join(DOWNLOAD_DIR, pasta);
      if (!fs.statSync(caminhoPasta).isDirectory()) return;

      fs.readdirSync(caminhoPasta).forEach(arquivo => {
        const caminhoArquivo = path.join(caminhoPasta, arquivo);
        try {
          if (agora - fs.statSync(caminhoArquivo).mtimeMs > maxAge) {
            fs.unlinkSync(caminhoArquivo);
            apagados++;
          }
        } catch (err) {
          logError(`Erro ao apagar ${caminhoArquivo}: ${err.message}`);
        }
      });

      if (fs.readdirSync(caminhoPasta).length === 0) {
        fs.rmdirSync(caminhoPasta);
      }
    });

    if (apagados > 0) logInfo(`${apagados} arquivos apagados`);
  } catch (err) {
    logError(`Erro na limpeza: ${err.message}`);
  }
}

// Mover arquivos de pasta antiga para nova
function moverPastaAntiga(pastaAntiga, pastaNova) {
  try {
    if (!fs.existsSync(pastaAntiga)) return;

    const arquivos = fs.readdirSync(pastaAntiga);
    if (arquivos.length === 0) {
      fs.rmdirSync(pastaAntiga);
      return;
    }

    if (!fs.existsSync(pastaNova)) {
      fs.mkdirSync(pastaNova, { recursive: true });
    }

    arquivos.forEach(arquivo => {
      const origem = path.join(pastaAntiga, arquivo);
      const destino = path.join(pastaNova, arquivo);
      if (fs.statSync(origem).isFile()) {
        fs.renameSync(origem, destino);
      }
    });

    fs.rmdirSync(pastaAntiga);
    logInfo(`Pasta movida: ${path.basename(pastaAntiga)} -> ${path.basename(pastaNova)}`);
  } catch (err) {
    logError(`Erro ao mover pasta: ${err.message}`);
  }
}

// Baixar arquivo
async function baixarArquivo(msg, numero, nome) {
  try {
    const media = await msg.downloadMedia();
    if (!media.mimetype || !ALLOWED_MIMES.includes(media.mimetype)) return;

    const nomePasta = getNomePasta(numero, nome);
    const pastaCliente = path.join(DOWNLOAD_DIR, nomePasta);

    if (!fs.existsSync(pastaCliente)) {
      fs.mkdirSync(pastaCliente, { recursive: true });

      // Se temos nome e existe pasta antiga, mover arquivos
      if (nome) {
        const pastaAntiga = path.join(DOWNLOAD_DIR, numero);
        moverPastaAntiga(pastaAntiga, pastaCliente);
      }
    }

    let nomeArquivo;
    if (media.mimetype.startsWith('image/')) {
      nomeArquivo = `${Date.now()}.${media.mimetype.split('/')[1] || 'jpg'}`;
    } else if (msg.filename) {
      const nome = msg.filename.replace(/[^a-zA-Z0-9._-]/g, '_').substring(0, 100);
      const ext = path.extname(msg.filename);
      nomeArquivo = `${nome}_${Math.floor(Math.random() * 10000)}${ext}`;
    } else {
      nomeArquivo = `arquivo_${Date.now()}.bin`;
    }

    const caminhoArquivo = path.join(pastaCliente, nomeArquivo);
    fs.writeFileSync(caminhoArquivo, Buffer.from(media.data, 'base64'));
    logInfo(`Baixado: ${caminhoArquivo}`);
  } catch (err) {
    logError(`Erro ao baixar: ${err.message}`);
  }
}

const client = criarCliente();

client.on('message', async (msg) => {
  try {
    if (!msg.from || msg.from.includes('@g.us') || msg.from.includes('@broadcast') || msg.from.includes('@lid')) return;

    const numero = msg.from.split('@')[0];

    // Obter nome do contato se ainda não tiver
    if (!contatos.has(numero)) {
      try {
        const contato = await msg.getContact();
        if (contato && contato.name) {
          contatos.set(numero, contato.name);
          logInfo(`Contato: ${contato.name} (${numero})`);
        } else {
          contatos.set(numero, null);
        }
      } catch (err) {
        contatos.set(numero, null);
      }
    }

    if (msg.hasMedia) {
      const nome = contatos.get(numero);
      baixarArquivo(msg, numero, nome);
    }
  } catch (err) {
    logError(`Erro: ${err.message}`);
  }
});

client.initialize();

setTimeout(limparArquivosAntigos, 10000);
setInterval(limparArquivosAntigos, CLEANUP_INTERVAL * 60 * 60 * 1000);

logInfo('Auto-Download iniciado');
logInfo(`Diretório: ${DOWNLOAD_DIR}`);
logInfo(`Limpeza: ${CLEANUP_HOURS}h`);
