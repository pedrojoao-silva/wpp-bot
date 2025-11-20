// ----------------------------------------------
// MAPEAMENTO DE CATEGORIAS FIXAS DO FINANCEIRO
// ----------------------------------------------

export const categoriasFixas = [
    { nome: "Supermercado", palavras: ["supermercado", "mercado", "compras", "feira", "alimento"] },
    { nome: "Lanches", palavras: ["lanche", "salgado", "hamburguer", "pizza"] },
    { nome: "Restaurante", palavras: ["restaurante", "almoço", "jantar", "refeição fora"] },
    { nome: "Padaria", palavras: ["padaria", "pão", "bolo"] },
    { nome: "Delivery", palavras: ["ifood", "ubereats", "delivery", "99food"] },

    { nome: "Aluguel", palavras: ["aluguel"] },
    { nome: "Condomínio", palavras: ["condominio"] },
    { nome: "Energia", palavras: ["energia", "luz"] },
    { nome: "Água", palavras: ["agua"] },
    { nome: "Internet", palavras: ["internet", "wifi"] },

    { nome: "Combustível", palavras: ["gasolina", "etanol", "diesel", "posto"] },
    { nome: "Uber", palavras: ["uber", "taxi", "99"] },
    { nome: "Manutenção do veículo", palavras: ["óleo", "oleo", "mecânico", "mecanico", "manutenção", "pneu"] },

    { nome: "Farmácia", palavras: ["remédio", "farmacia", "medicamento"] },
    { nome: "Consulta médica", palavras: ["consulta", "médico", "medico"] },
    { nome: "Exames", palavras: ["exame"] },
    { nome: "Academia", palavras: ["academia", "gym", "fitness"] },

    { nome: "Cursos", palavras: ["curso", "aula"] },
    { nome: "Escola", palavras: ["escola", "creche"] },

    { nome: "Lazer", palavras: ["cinema", "passeio", "bar", "balada"] },
    { nome: "Assinaturas", palavras: ["netflix", "spotify", "prime", "hbo", "globo"] },

    { nome: "Roupas", palavras: ["camisa", "roupa", "bermuda", "calça"] },
    { nome: "Beleza", palavras: ["barbearia", "cabelo", "unha", "manicure"] },

    { nome: "Outros", palavras: [] }
];

export function classificarCategoria(texto) {
    const frase = texto.toLowerCase();

    for (const cat of categoriasFixas) {
        for (const palavra of cat.palavras) {
            if (frase.includes(palavra.toLowerCase())) {
                return cat.nome;
            }
        }
    }

    // Se não bater em nada → Outros
    return "Outros";
}
