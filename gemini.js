// gemini.js
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();

const client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function interpretarMensagem(texto) {
  const prompt = `
Você é um parser financeiro. Transforme frases como:
"gastei 20 reais em mercado ontem"
"minha esposa gastou 40 reais em farmácia"
"recebi 300 reais do meu pai"

Em um JSON válido **APENAS JSON**, no formato:

{
  "tipo": "despesa" | "receita",
  "valor": number,
  "data": "YYYY-MM-DD",
  "categoria": string,
  "responsavel": string,
  "descricao": string
}

Se faltar data, usar hoje.
Se mencionar "ontem", converter para a data correta.
Responsável padrão = "eu".
Categoria = principal palavra após "em" ou "de".
Descrição = a frase original.
`;

  try {
    // -------------- MODELO -----------------
    const model = client.getGenerativeModel({
      model: "gemini-2.5-flash"
    });
    // -----------------------------------------------------

    const result = await model.generateContent(prompt + "\n\nFrase: " + texto);

    const raw = await result.response.text();

    // Garantir que estamos extraindo só o JSON
    const inicio = raw.indexOf("{");
    const fim = raw.lastIndexOf("}");

    const json = raw.slice(inicio, fim + 1);

    let parsed = JSON.parse(json);

    // Corrigir data se faltar
    // Ajuste REAL da data (corrige erros do Gemini)
const textoLower = texto.toLowerCase();
const hoje = new Date();

// HOJE
if (textoLower.includes("hoje")) {
  parsed.data = hoje.toISOString().split("T")[0];sim
}

// ONTEM
else if (textoLower.includes("ontem")) {
  const ontem = new Date();
  ontem.setDate(hoje.getDate() - 1);
  parsed.data = ontem.toISOString().split("T")[0];
}

// SE IA MANDAR DATA ERRADA / SEM ANO / SUBSTITUIR
else {
  // SE IA NÃO MANDAR DATA → HOJE
  if (!parsed.data || !parsed.data.match(/\d{4}-\d{2}-\d{2}/)) {
    parsed.data = hoje.toISOString().split("T")[0];
  }
}


    return parsed;

  } catch (err) {
    console.error("Erro Gemini:", err);
    throw new Error("Não consegui interpretar a mensagem.");
  }
}
