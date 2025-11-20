// -------------------------------------------------------------
// BOT FINANCEIRO - BAILEYS + GEMINI + GOOGLE SHEETS (ATUALIZADO)
// -------------------------------------------------------------

import makeWASocket, {
  useMultiFileAuthState,
  Browsers,
  DisconnectReason
} from "@whiskeysockets/baileys";

import qrcode from "qrcode-terminal";
import P from "pino";

import { interpretarMensagem } from "./gemini.js";
import {
  salvarLancamento,
  maiorGastoMes,
  resumoFinanceiroPeriodo,
  gastosPorPessoa,
  gastosPorCategoria,
  topCategorias,
  ultimosLancamentos,
  totalDoMes,
  buscarLancamentos,
  resumoSemanal
} from "./sheets.js";

import { classificarCategoria } from "./categorias.js";

const logger = P({ level: "silent" });

function fmtValor(v = 0) {
  return Number(v).toFixed(2).replace(".", ",");
}
function fmtDataISOtoBR(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

async function start() {

  const { state, saveCreds } = await useMultiFileAuthState("auth_info");

  const sock = makeWASocket({
    logger,
    printQRInTerminal: true,
    browser: Browsers.macOS("Desktop"),
    auth: state
  });

  sock.ev.on("creds.update", saveCreds);

  // ------------------------------------------------
  // STATUS DA CONEXÃO
  // ------------------------------------------------
  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      console.log("📱 ESCANEIE ESTE QR CODE:");
      qrcode.generate(qr, { small: true });
    }

    if (connection === "close") {
      const reason = lastDisconnect?.error?.output?.statusCode;

      if (reason === DisconnectReason.loggedOut) {
        console.log("Sessão perdida. Apague a pasta auth_info e reinicie.");
      } else {
        console.log("Reconectando...");
        start();
      }
    }

    if (connection === "open") {
      console.log("🔥 BOT CONECTADO AO WHATSAPP!");
    }
  });

  // ------------------------------------------------
  // RECEBENDO MENSAGENS
  // ------------------------------------------------
  sock.ev.on("messages.upsert", async (messageUpdate) => {
    const msg = messageUpdate.messages[0];
    if (!msg.message || msg.key.fromMe) return;

    const from = msg.key.remoteJid;

    const texto =
      msg.message.conversation ||
      msg.message.extendedTextMessage?.text ||
      "";

    if (!texto) return;

    console.log("📩 Mensagem recebida:", texto);

    const lc = texto.toLowerCase().trim();

     // ------------------------------------------------
      // COMANDO: /menu
      // ------------------------------------------------
      if (lc === "/menu" || lc === "menu") {
        const menuMsg = `
📌 *MENU FINANCEIRO*

Escolha uma opção abaixo:

━━━━━━━━━━━━━━━━━━━━━━
💰 *LANÇAMENTOS (IA)*
Digite frases como:
• gastei 25 no mercado
• recebi 300 do meu pai
• minha esposa gastou 40 ontem

━━━━━━━━━━━━━━━━━━━━━━
📊 *RELATÓRIOS*
• status financeiro
• total do mês
• resumo semanal
• maior gasto

━━━━━━━━━━━━━━━━━━━━━━
📂 *CATEGORIAS*
• gastos por categoria
• top categorias

━━━━━━━━━━━━━━━━━━━━━━
👥 *POR PESSOA*
• gastos da esposa
• gastos do joão
• gastos do pai
• gastos da mãe

━━━━━━━━━━━━━━━━━━━━━━
📄 *EXTRATOS / BUSCAS*
• extrato
• buscar <termo>

━━━━━━━━━━━━━━━━━━━━━━
🛠️ *OUTROS*
• /menu — mostrar este menu novamente
`;


        await sock.sendMessage(from, { text: menuMsg });
        return;
      }

    try {
      // --------------------------
      // MAIOR GASTO
      // --------------------------
      if (lc.startsWith("maior gasto")) {
        await sock.sendMessage(from, { text: "🔍 Consultando maior gasto..." });

        const hoje = new Date();
        const param = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, "0")}`;
        const maior = await maiorGastoMes(param);

        if (!maior) {
          await sock.sendMessage(from, { text: "Nenhum gasto encontrado neste mês." });
        } else {
          await sock.sendMessage(from, {
            text:
              `💰 *Maior gasto do mês*\n\n` +
              `Valor: R$ ${fmtValor(maior.valor)}\n` +
              `📌 Categoria: ${maior.categoria}\n` +
              `👤 Pessoa: ${maior.responsavel}\n` +
              `📅 Data: ${fmtDataISOtoBR(maior.data)}`
          });
        }
        return;
      }

      // --------------------------
      // STATUS FINANCEIRO / TOTAL DO MÊS
      // --------------------------
      if (lc.startsWith("status financeiro") || lc.startsWith("total do mês") || lc.startsWith("total do mes")) {
        await sock.sendMessage(from, { text: "📊 Calculando resumo financeiro..." });

        const hoje = new Date();
        const yyyyMM = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, "0")}`;
        const tot = await totalDoMes(yyyyMM);
        const resumo = await resumoFinanceiroPeriodo(`${yyyyMM}-01`, `${yyyyMM}-31`);

        await sock.sendMessage(from, {
          text:
            `📅 *Total do mês (${yyyyMM})*\n\n` +
            `Receitas: R$ ${fmtValor(tot.receita)}\n` +
            `Despesas: R$ ${fmtValor(tot.despesa)}\n` +
            `💵 Saldo: R$ ${fmtValor(tot.saldo)}\n` +
            `Lançamentos no período: ${resumo.totalLancamentos}`
        });
        return;
      }

      // --------------------------
      // GASTOS POR CATEGORIA
      // --------------------------
      if (lc.startsWith("gastos por categoria")) {
        await sock.sendMessage(from, { text: "📊 Gerando gastos por categoria..." });

        const hoje = new Date();
        const yyyyMM = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, "0")}`;
        const mapa = await gastosPorCategoria(`${yyyyMM}-01`, `${yyyyMM}-31`);

        let txt = `📊 Gastos por categoria (${yyyyMM}):\n\n`;
        let total = 0;
        for (const cat of Object.keys(mapa)) {
          txt += `• ${cat}: R$ ${fmtValor(mapa[cat])}\n`;
          total += mapa[cat];
        }
        txt += `\nTotal: R$ ${fmtValor(total)}`;
        await sock.sendMessage(from, { text: txt });
        return;
      }

      // --------------------------
      // TOP CATEGORIAS
      // --------------------------
      if (lc.startsWith("top categorias") || lc.startsWith("top categorias")) {
        await sock.sendMessage(from, { text: "🏆 Calculando top categorias..." });

        const hoje = new Date();
        const yyyyMM = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, "0")}`;
        const tops = await topCategorias(`${yyyyMM}-01`, `${yyyyMM}-31`);

        if (!tops || tops.length === 0) {
          await sock.sendMessage(from, { text: "Nenhuma categoria encontrada neste período." });
          return;
        }

        let txt = `🏆 Top categorias (${yyyyMM}):\n\n`;
        tops.slice(0, 10).forEach((t, i) => {
          txt += `${i + 1}️⃣ ${t.categoria} — R$ ${fmtValor(t.valor)}\n`;
        });

        await sock.sendMessage(from, { text: txt });
        return;
      }

      // --------------------------
      // EXTRATO (últimos lançamentos)
      // --------------------------
      if (lc === "extrato" || lc.startsWith("extrato ")) {
        await sock.sendMessage(from, { text: "📄 Buscando últimos lançamentos..." });

        const ultimos = await ultimosLancamentos(10);
        if (!ultimos || ultimos.length === 0) {
          await sock.sendMessage(from, { text: "Nenhum lançamento encontrado." });
          return;
        }

        let txt = `📄 Últimos ${ultimos.length} lançamentos:\n\n`;
        for (const l of ultimos) {
          txt += `• ${fmtDataISOtoBR(l.data)} — R$ ${fmtValor(l.valor)} — ${l.categoria} — ${l.responsavel}\n`;
        }

        await sock.sendMessage(from, { text: txt });
        return;
      }

      // --------------------------
      // BUSCAR <termo>
      // --------------------------
      if (lc.startsWith("buscar ")) {
        const termo = texto.slice(7).trim();
        if (!termo) {
          await sock.sendMessage(from, { text: "Use: buscar <termo> (ex: buscar mercado)" });
          return;
        }
        await sock.sendMessage(from, { text: `🔎 Buscando por "${termo}"...` });

        const resultados = await buscarLancamentos(termo);
        if (!resultados || resultados.length === 0) {
          await sock.sendMessage(from, { text: "Nenhum resultado encontrado." });
          return;
        }

        let txt = `🔎 Resultados para "${termo}":\n\n`;
        for (const r of resultados.slice(0, 20)) {
          txt += `• ${fmtDataISOtoBR(r.data)} — R$ ${fmtValor(r.valor)} — ${r.categoria} — ${r.responsavel}\n  ${r.descricao}\n\n`;
        }

        await sock.sendMessage(from, { text: txt });
        return;
      }

      // --------------------------
      // GASTOS DA PESSOA (ex: "gastos da esposa")
      // --------------------------
      if (lc.startsWith("gastos da ") || lc.startsWith("gastos do ") || lc.startsWith("gastos de ")) {
        // extrair nome
        const parts = lc.split(" ");
        const nome = parts.slice(2).join(" ").replace(/[^a-zA-Z0-9çãõáéíóúâêôü ]/g, "").trim();
        if (!nome) {
          await sock.sendMessage(from, { text: "Use: gastos da <nome> (ex: gastos da esposa)" });
          return;
        }
        await sock.sendMessage(from, { text: `👥 Calculando gastos de "${nome}"...` });

        const hoje = new Date();
        const inicio = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, "0")}-01`;
        const fim = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, "0")}-31`;

        // usamos buscarLancamentos e filtramos por responsavel
        const todos = await buscarLancamentos(nome);
        const filtrado = todos.filter(t => (t.responsavel || "").toLowerCase() === nome.toLowerCase());

        if (!filtrado.length) {
          await sock.sendMessage(from, { text: `Nenhum gasto encontrado para "${nome}" no mês.` });
          return;
        }

        let total = 0;
        let txt = `👥 Gastos de ${nome} (${inicio} → ${fim}):\n\n`;
        for (const f of filtrado) {
          txt += `• ${fmtDataISOtoBR(f.data)} — R$ ${fmtValor(f.valor)} — ${f.categoria}\n`;
          total += f.valor;
        }
        txt += `\nTotal: R$ ${fmtValor(total)}`;

        await sock.sendMessage(from, { text: txt });
        return;
      }

      // --------------------------
      // RESUMO SEMANAL
      // --------------------------
      if (lc.startsWith("resumo semanal") || lc.startsWith("resumo da semana")) {
        await sock.sendMessage(from, { text: "📅 Gerando resumo semanal..." });

        const r = await resumoSemanal();
        let txt = `📅 Resumo dos últimos 7 dias:\n\n` +
          `Receitas: R$ ${fmtValor(r.receita)}\n` +
          `Despesas: R$ ${fmtValor(r.despesa)}\n` +
          `💵 Saldo: R$ ${fmtValor(r.saldo)}\n` +
          `Lançamentos: ${r.total}\n`;

        if (r.maiorGasto) {
          txt += `\nMaior gasto: R$ ${fmtValor(r.maiorGasto.valor)} — ${r.maiorGasto.categoria} — ${fmtDataISOtoBR(r.maiorGasto.data)}`;
        }

        await sock.sendMessage(from, { text: txt });
        return;
      }

      // --------------------------
      // Se não for comando: tratar como lançamento
      // --------------------------
      await sock.sendMessage(from, { text: "🤖 Analisando lançamento..." });

      let dados = await interpretarMensagem(texto);

      if (!dados.valor) {
        await sock.sendMessage(from, { text: "❗ Não consegui entender o valor informado." });
        return;
      }


      // CLASSIFICAÇÃO DE CATEGORIA FIXA
      dados.categoria = classificarCategoria(dados.descricao || texto);

      // CORREÇÃO DE DATA REAL
      const txt = texto.toLowerCase();
      const hoje = new Date();

      if (txt.includes("hoje")) {
        dados.data = hoje.toISOString().split("T")[0];
      } else if (txt.includes("ontem")) {
        const ontem = new Date();
        ontem.setDate(hoje.getDate() - 1);
        dados.data = ontem.toISOString().split("T")[0];
      } else {
        if (!dados.data || !dados.data.match(/\d{4}-\d{2}-\d{2}/)) {
          dados.data = hoje.toISOString().split("T")[0];
        }
      }

      await salvarLancamento(dados);

      await sock.sendMessage(from, {
        text:
          `✔ *Registro salvo!*\n\n` +
          `📅 Data: ${dados.data}\n` +
          `💰 Valor: R$ ${fmtValor(dados.valor)}\n` +
          `📌 Categoria: ${dados.categoria}\n` +
          `👤 Pessoa: ${dados.responsavel}`
      });

    } catch (e) {
      console.error("Erro no handler:", e);
      await sock.sendMessage(from, { text: "❌ Ocorreu um erro ao processar sua solicitação." });
    }
  });
}

start();
