<div align="center">

<h1>🤖 Bot Financeiro para WhatsApp</h1>

<p>Um assistente financeiro inteligente que registra gastos via WhatsApp usando IA (Gemini), Baileys e Google Sheets.</p>

<img src="https://img.shields.io/badge/Node.js-18+-green?logo=node.js" />
<img src="https://img.shields.io/badge/Gemini%20API-IA-blue?logo=google" />
<img src="https://img.shields.io/badge/Baileys-WhatsApp%20API-brightgreen" />
<img src="https://img.shields.io/badge/Google%20Sheets-Automação-yellow?logo=google-sheets" />

</div>

📌 Sobre o Projeto

Este bot permite registrar gastos e receitas pelo WhatsApp, usando linguagem natural, como:

gastei 30 reais em lanche ontem
recebi 500 reais hoje
minha esposa gastou 90 no mercado


A IA interpreta tudo automaticamente:

tipo (receita ou despesa)

valor

data

categoria

responsável

descrição

E grava os dados diretamente em uma planilha do Google Sheets.

🛠 Tecnologias utilizadas

Node.js

Baileys (API não-oficial do WhatsApp)

Gemini API (Google AI)

Google Sheets API

Google Cloud Credentials

🚀 Instalação
1️⃣ Clone o repositório
```bash
git clone https://github.com/SEU_USUARIO/wpp-bot-financeiro.git
cd wpp-bot-financeiro
```

2️⃣ Instale dependências
```bash
npm install
```
3️⃣ Crie o arquivo .env
```bash
GEMINI_API_KEY=SUA_CHAVE_AQUI
GOOGLE_APPLICATION_CREDENTIALS=./bot-financeiro.json
SHEET_ID=ID_DA_SUA_PLANILHA
SHEET_TAB_NAME=LANCAMENTOS
```
4️⃣ Adicione suas credenciais do Google

Baixe o arquivo JSON da Google Cloud e coloque na raiz do projeto.

📱 Como usar

Inicie o bot:
```bash
npm start
```

Escaneie o QR Code que aparecer no terminal.

Agora basta enviar mensagens no WhatsApp, exemplo:

gastei 25 reais em pizza ontem

🧾 Comandos disponíveis
📊 Financeiro
status financeiro
maior gasto
total do mês
resumo semanal

🗂 Categorias
gastos por categoria
top categorias

👥 Pessoas
gastos da esposa
gastos do joão
gastos do pai

📄 Extrato e buscas
extrato
buscar mercado

📋 Menu
/menu

📦 Estrutura do projeto
```bash
├── bot.js
├── gemini.js
├── sheets.js
├── categorias.js
├── auth_info/        # Login do WhatsApp
├── bot-financeiro.jso
├── .env
└── README.md
```
