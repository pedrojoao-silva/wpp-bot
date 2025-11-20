// sheets.js
import { google } from "googleapis";
import dotenv from "dotenv";
dotenv.config();

const SHEET_ID = process.env.SHEET_ID;
const TAB = process.env.SHEET_TAB_NAME || "LANCAMENTOS";

const auth = new google.auth.GoogleAuth({
  keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
  scopes: ["https://www.googleapis.com/auth/spreadsheets"]
});

async function getSheets() {
  const client = await auth.getClient();
  return google.sheets({ version: "v4", auth: client });
}

// ------------------------------------------
// SALVAR LANÇAMENTO
// ------------------------------------------
export async function salvarLancamento(dados) {
  const sheets = await getSheets();

  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: `${TAB}!A:F`,
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [
        [
          dados.data,
          dados.tipo,
          dados.valor,
          dados.categoria,
          dados.responsavel,
          dados.descricao
        ]
      ]
    }
  });
}

// ------------------------------------------
// BUSCAR TUDO
// ------------------------------------------
export async function buscarTudo() {
  const sheets = await getSheets();

  const result = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `${TAB}!A:F`
  });

  const values = result.data.values || [];

  // Removendo cabeçalho, se existir
  if (values.length > 0 && values[0][0] === "data") {
    values.shift();
  }

  return values.map(r => ({
    data: r[0],
    tipo: r[1],
    valor: Number(r[2] ?? 0),
    categoria: r[3],
    responsavel: r[4],
    descricao: r[5]
  }));
}

// ------------------------------------------
// MAIOR GASTO DO MÊS
// ------------------------------------------
export async function maiorGastoMes(yyyyMM) {
  const lancs = await buscarTudo();
  const despesas = lancs.filter(x => x.tipo?.toLowerCase().includes("desp"));

  const filtrado = despesas.filter(x => x.data?.startsWith(yyyyMM));

  if (filtrado.length === 0) return null;

  filtrado.sort((a, b) => b.valor - a.valor);

  return filtrado[0];
}

// ------------------------------------------
// RESUMO FINANCEIRO DO PERÍODO
// ------------------------------------------
export async function resumoFinanceiroPeriodo(inicio, fim) {
  const lancs = await buscarTudo();

  const filtrado = lancs.filter(l => {
    const data = new Date(l.data);
    return data >= new Date(inicio) && data <= new Date(fim);
  });

  let receita = 0, despesa = 0;

  for (const l of filtrado) {
    if (l.tipo.includes("receita")) receita += l.valor;
    else despesa += l.valor;
  }

  return {
    totalReceita: receita,
    totalDespesa: despesa,
    saldo: receita - despesa,
    totalLancamentos: filtrado.length
  };
}

// ------------------------------------------
// GASTOS POR PESSOA (VALOR TOTAL)
// ------------------------------------------
export async function gastosPorPessoa(inicio, fim) {
  const lancs = await buscarTudo();

  const filtrado = lancs.filter(l => {
    const data = new Date(l.data);
    return data >= new Date(inicio) && data <= new Date(fim);
  });

  const mapa = {};

  for (const l of filtrado) {
    const r = l.responsavel || "eu";
    if (!mapa[r]) mapa[r] = 0;
    mapa[r] += l.valor;
  }

  return mapa;
}

// ------------------------------------------
// RELATÓRIO: GASTOS POR CATEGORIA
// ------------------------------------------
export async function gastosPorCategoria(inicio, fim) {
  const lancs = await buscarTudo();

  const filtrado = lancs.filter(l => {
    const data = new Date(l.data);
    return l.tipo.includes("desp") &&
           data >= new Date(inicio) &&
           data <= new Date(fim);
  });

  const mapa = {};

  for (const l of filtrado) {
    if (!mapa[l.categoria]) mapa[l.categoria] = 0;
    mapa[l.categoria] += l.valor;
  }

  return mapa;
}

// ------------------------------------------
// RELATÓRIO: TOP CATEGORIAS MAIS CARAS
// ------------------------------------------
export async function topCategorias(inicio, fim) {
  const mapa = await gastosPorCategoria(inicio, fim);

  return Object.entries(mapa)
    .sort((a, b) => b[1] - a[1]) // ordenar por maior valor
    .map(([categoria, valor]) => ({ categoria, valor }));
}

// ------------------------------------------
// RELATÓRIO: ÚLTIMOS LANÇAMENTOS
// ------------------------------------------
export async function ultimosLancamentos(qtd = 10) {
  const lancs = await buscarTudo();

  const ordenado = lancs.sort((a, b) => new Date(b.data) - new Date(a.data));

  return ordenado.slice(0, qtd);
}

// ------------------------------------------
// RELATÓRIO: TOTAL DO MÊS
// ------------------------------------------
export async function totalDoMes(yyyyMM) {
  const lancs = await buscarTudo();

  const filtrado = lancs.filter(x => x.data.startsWith(yyyyMM));

  let receita = 0, despesa = 0;

  for (const l of filtrado) {
    if (l.tipo.includes("receita")) receita += l.valor;
    else despesa += l.valor;
  }

  return { receita, despesa, saldo: receita - despesa };
}

// ------------------------------------------
// RELATÓRIO: BUSCAR POR TEXTO
// ------------------------------------------
export async function buscarLancamentos(texto) {
  const lancs = await buscarTudo();
  const palavra = texto.toLowerCase();

  return lancs.filter(l =>
    l.descricao?.toLowerCase().includes(palavra) ||
    l.categoria?.toLowerCase().includes(palavra)
  );
}

// ------------------------------------------
// RESUMO SEMANAL (últimos 7 dias)
// ------------------------------------------
export async function resumoSemanal() {
  const lancs = await buscarTudo();

  const hoje = new Date();
  const semanaPassada = new Date();
  semanaPassada.setDate(hoje.getDate() - 7);

  const filtrado = lancs.filter(l => {
    const data = new Date(l.data);
    return data >= semanaPassada && data <= hoje;
  });

  let receita = 0, despesa = 0;
  let maiorGasto = null;

  for (const l of filtrado) {
    if (l.tipo.includes("receita")) receita += l.valor;
    else {
      despesa += l.valor;

      if (!maiorGasto || l.valor > maiorGasto.valor) {
        maiorGasto = l;
      }
    }
  }

  return {
    receita,
    despesa,
    saldo: receita - despesa,
    maiorGasto,
    total: filtrado.length
  };
}
