const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const { logInfo } = require('../utils/logger');

let client = null;

function criarCliente() {
  if (client) return client;

  client = new Client({
    authStrategy: new LocalAuth({ dataPath: './.wwebjs_auth' }),
    puppeteer: {
      headless: 'new',
      args: [
        '--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage',
        '--disable-gpu', '--no-zygote', '--disable-webgl',
        '--disable-blink-features=AutomationControlled'
      ]
    }
  });

  client.on('qr', qr => {
    logInfo('QR Code - escaneie no WhatsApp');
    qrcode.generate(qr, { small: true });
  });

  client.on('ready', () => logInfo('Conectado'));

  return client;
}

module.exports = { criarCliente };
