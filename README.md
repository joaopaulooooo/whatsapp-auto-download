# WhatsApp Auto-Download Bot

Bot WhatsApp open-source que baixa automaticamente arquivos enviados por contatos.

## 🎯 Funcionalidades

- **Download automático** de arquivos (imagens, CAD, documentos)
- **Suporte a 30+ formatos** de arquivo
- **Organização inteligente**: Cria pastas com `Nome_Telefone` ou apenas `Telefone`
- **Migração automática**: Move arquivos ao detectar nome do contato
- **Limpeza automática**: Remove arquivos antigos (configurável)
- **Open Source**: Código limpo e fácil de customizar

## 📁 Formatos Suportados

### Imagens
JPEG, PNG, GIF, WebP, HEIC, HEIF, BMP, TIFF

### CAD
.dxf, .dxf+, .dxf+x

### Documentos
PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, ODT, ODS, ODP, TXT, RTF, XPS, OXPS, PostScript, EPS

### Ignorados
Vídeos, áudios, listas de distribuição e grupos

## 🚀 Instalação Rápida

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/auto-download-whatsapp.git
cd auto-download-whatsapp

# Instale as dependências
npm install
```

## ⚙️ Configuração

Edite o arquivo `.env`:

```env
# Download Directory
DOWNLOAD_DIR=./whatsapp-downloads

# File Cleanup (hours)
CLEANUP_AFTER_HOURS=72
CLEANUP_INTERVAL_HOURS=6
```

## ▶️ Como Executar

### Primeira Execução

```bash
npm start
```

Escaneie o QR Code no terminal com o WhatsApp do seu celular.

### Produção com PM2

```bash
pm2 start bot.js --name whatsapp-auto-download
pm2 save
pm2 startup
```

## 📊 Estrutura de Arquivos

```
whatsapp-downloads/
├── Joao_Silva_351933502992/         # Nome_Telefone (se nome detectado)
│   ├── 1777036100000.jpg             # Imagem: timestamp.extensão
│   └── documento_8222.pdf            # Documento: nome_sufixo.extensão
└── 351912345678/                     # Apenas Telefone (se nome não detectado)
    └── 1777036200000.png
```

**Nota:** Quando o nome é detectado, arquivos da pasta antiga são movidos automaticamente.

## 🧹 Limpeza Automática

- **Período**: A cada 6 horas (configurável)
- **Idade limite**: 72 horas (configurável)
- **Pastas vazias**: Removidas automaticamente

## 📝 Monitorização

```bash
# Ver logs
pm2 logs whatsapp-auto-download

# Ver status
pm2 status

# Reiniciar
pm2 restart whatsapp-auto-download
```

## ⚙️ Customização

### Alterar diretório de download

Edite `DOWNLOAD_DIR` no arquivo `.env`:

```env
DOWNLOAD_DIR=/caminho/para/seus/downloads
```

### Alterar período de limpeza

```env
# Limpar arquivos com mais de 24 horas
CLEANUP_AFTER_HOURS=24

# Executar limpeza a cada 2 horas
CLEANUP_INTERVAL_HOURS=2
```

### Ver espaço usado

```bash
du -sh ./whatsapp-downloads
```

## 🔒 Privacidade e Segurança

- Arquivos são armazenados localmente
- Nada é enviado para servidores externos
- Limpeza automática ajuda a proteger privacidade
- Código open-source para auditoria

## 🚧 Limitações

- Não processa mensagens de grupos
- Não baixa vídeos ou áudios
- Apenas mensagens de contatos individuais
- Requer conexão estável com internet

## 🛠️ Desenvolvimento

### Estrutura do Projeto

```
auto-download-whatsapp/
├── bot.js                      # Bot principal
├── package.json                # Dependências
├── .env                        # Configurações
├── src/
│   ├── whatsapp/
│   │   └── client.js          # Cliente WhatsApp
│   └── utils/
│       └── logger.js          # Sistema de logs
└── logs/                       # Logs da aplicação
```

### Tecnologias

- [Node.js](https://nodejs.org/)
- [whatsapp-web.js](https://github.com/pedroslopez/whatsapp-web.js)
- [PM2](https://pm2.keymetrics.io/) (opcional, para produção)

## 🤝 Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para:

1. Fazer fork do projeto
2. Criar uma branch para sua feature (`git checkout -b feature/NovaFeature`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/NovaFeature`)
5. Abrir um Pull Request

## 📄 Licença

MIT License - sinta-se livre para usar este projeto em seus próprios projetos.

## ⚠️ Aviso de Responsabilidade

Este bot é fornecido "como está", sem garantias. Use-o por sua conta e risco. Os autores não são responsáveis por qualquer uso indevido do WhatsApp que possa violar os Termos de Serviço do WhatsApp.

---

**Versão**: 1.0.0
**Status**: ✅ Production Ready
**GitHub**: [https://github.com/seu-usuario/auto-download-whatsapp](https://github.com/seu-usuario/auto-download-whatsapp)
