📘 README – BOT FINANCEIRO (WhatsApp + IA + Google Sheets)

<sub>Desenvolvido por João Pedro</sub>

<h1 align="center">🤖 Bot Financeiro Inteligente</h1> <p align="center">Automatize seu controle financeiro usando WhatsApp + Inteligência Artificial + Google Sheets</p> <p align="center"> <img src="https://img.shields.io/badge/WhatsApp-Bot-green" /> <img src="https://img.shields.io/badge/Gemini-IA-orange" /> <img src="https://img.shields.io/badge/Google%20Sheets-API-yellow" /> <img src="https://img.shields.io/badge/Node.js-18+-blue" /> <img src="https://img.shields.io/badge/Status-Ativo-success" /> </p>
<p align="center"> <img src="https://raw.githubusercontent.com/joaopedro/github-images/main/bot-financeiro-preview.png" width="600" /> </p>
📌 Sobre o Projeto

O Bot Financeiro é um assistente automatizado que interpreta mensagens enviadas pelo WhatsApp, identifica despesas/receitas usando IA (Google Gemini), classifica categorias automaticamente e registra tudo em uma planilha do Google Sheets, servindo como banco de dados.

Além disso, o bot também gera relatórios prontos sobre sua vida financeira:

📊 Resumo mensal

📅 Resumo semanal

💰 Maior gasto do mês

📂 Gastos por categoria

👥 Gastos por pessoa

🔍 Busca de lançamentos

📄 Extrato dos últimos registros

Tudo isso apenas enviando mensagens pelo WhatsApp.

🚀 Funcionalidades
<details> <summary><strong>📥 Lançamentos Automáticos (IA)</strong></summary>

A IA entende frases como:

"gastei 25 reais em lanche ontem"

"minha esposa gastou 40 no mercado"

"recebi 300 reais hoje"

E transforma tudo em:

valor

tipo (despesa/receita)

categoria automática

data correta (interpreta "hoje", "ontem")

descrição

responsável

</details> <details> <summary><strong>📊 Relatórios e Consultas</strong></summary>

status financeiro

total do mês

resumo semanal

maior gasto

gastos por categoria

top categorias

extrato

buscar mercado

gastos da esposa

gastos do pai

</details> <details> <summary><strong>📂 Classificação Automática</strong></summary>

O bot reconhece categorias como:

Supermercado

Lanches

Restaurante

Energia

Uber

Farmácia

Academia

Assinaturas

Veículo

Outros

</details>
🧠 Tecnologias utilizadas
<table> <tr> <td><strong>WhatsApp</strong></td> <td>Baileys (WhatsApp Web API)</td> </tr> <tr> <td><strong>IA</strong></td> <td>Google Gemini 2.5 Flash</td> </tr> <tr> <td><strong>Banco de dados</strong></td> <td>Google Sheets API</td> </tr> <tr> <td><strong>Backend</strong></td> <td>Node.js (ES Modules)</td> </tr> </table>
📱 Comandos do Bot
/menu                → mostra o menu
maior gasto          → maior gasto do mês
status financeiro    → resumo mensal
total do mês         → receitas / despesas / saldo
resumo semanal       → últimos 7 dias
gastos por categoria → soma por categoria
top categorias       → ranking de gastos
extrato              → últimos lançamentos
buscar <termo>       → busca na planilha
gastos da <pessoa>   → gastos por responsável

📦 Instalação
git clone https://https://github.com/pedrojoao-silva/wpp-bot
cd bot-financeiro
npm install

🔧 Configuração

Crie um arquivo .env:

GEMINI_API_KEY=SUA_API_KEY
SHEET_ID=ID_DA_SUA_PLANILHA
SHEET_TAB_NAME=LANCAMENTOS
GOOGLE_APPLICATION_CREDENTIALS=service-account.json


Baixe também o arquivo de credenciais da conta de serviço do Google Cloud (JSON).

▶️ Como iniciar o bot
npm start


O terminal mostrará o QR Code:

<p align="center"> <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/QRCode_Example.png" width="200"> </p>

Escaneie com o WhatsApp → pronto! 🎉

📚 Estrutura do Projeto
bot-financeiro/
│── bot.js
│── gemini.js
│── sheets.js
│── categorias.js
│── auth_info/        # sessão do WhatsApp
│── service-account.json
│── .env
└── README.md
