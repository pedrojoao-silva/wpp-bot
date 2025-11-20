🤖 Bot Financeiro – WhatsApp + Baileys + Gemini + Google Sheets

Um assistente financeiro inteligente que funciona diretamente pelo WhatsApp.
Ele registra gastos automaticamente usando IA, gera relatórios, cria gráficos simples via texto e organiza tudo em uma planilha Google Sheets.

🚀 Funcionalidades
📌 1. Lançamentos automáticos com IA (Gemini)

O bot entende frases naturais e transforma em registros financeiros:

“gastei 25 no lanche ontem”

“minha esposa gastou 40 no mercado”

“recebi 300 do meu pai hoje”

Ele identifica automaticamente:

Tipo (despesa/receita)

Valor

Data (corrige hoje/ontem automaticamente)

Categoria fixa

Responsável

Descrição completa

📊 2. Relatórios financeiros

Comandos disponíveis:

status financeiro

total do mês

resumo semanal

maior gasto

gastos por categoria

top categorias

gastos por pessoa

extrato

buscar <termo>

📂 3. Classificação automática por categoria

As categorias são identificadas por palavras-chave, ex:

Supermercado

Lanches

Farmácia

Uber

Energia

Delivery

Academia

… e muito mais.

Se nada combinar, o bot usa “Outros”.

🧮 4. Persistência dos dados com Google Sheets

Cada lançamento é salvo automaticamente em uma planilha do Google Sheets usando a API oficial.

💬 5. Menu de ajuda

O usuário pode enviar:

/menu


E o bot responde com um menu completo e organizado no WhatsApp.

📁 Estrutura do Projeto
📦 wpp-bot
├── bot.js                # Core do bot WhatsApp (Baileys)
├── gemini.js             # Interpretação de texto com Gemini
├── sheets.js             # Integração com Google Sheets
├── categorias.js         # Classificação automática de categorias
├── package.json
├── auth_info/            # Arquivos de sessão do WhatsApp
└── README.md

🔧 Tecnologias utilizadas

Node.js

Baileys (API não oficial do WhatsApp)

Gemini API (Google Generative AI)

Google Sheets API

dotenv

pino

🔑 Variáveis de ambiente .env

Crie um arquivo .env com:

GEMINI_API_KEY=SUACHAVEAQUI
GOOGLE_APPLICATION_CREDENTIALS=credenciais.json
SHEET_ID=ID_DA_SUA_PLANILHA
SHEET_TAB_NAME=LANCAMENTOS

🛠️ Como rodar o projeto
1. Instale as dependências
npm install

2. Execute o bot
node bot.js

3. Escaneie o QR Code no WhatsApp

Após isso, o bot estará funcionando 24h.

📝 Exemplo de planilha

A aba deve conter as colunas:

Data | Tipo | Valor | Categoria | Responsável | Descrição


O bot preenche automaticamente.

🎯 Objetivo do projeto

Automatizar o controle financeiro pessoal usando IA, WhatsApp e Google Sheets — sem apps pagos ou planilhas manuais.
