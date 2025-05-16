require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function main(Texto) {
  const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

  const tools = [
    { codeExecution: {} },
  ];

  const config = {
    tools,
    responseMimeType: 'text/plain',
    systemInstruction: [
      {
        text: `Eu quero que tu escrevas um relatório formal (será enviado como email) para instituições de apoio sem fim lucrativos, nesse email deve explicar como eles poderiam ajudar a eliminar uma zona de perigo à malária. Deixa o texto bem detalhado de como eles poderiam ajudar especificamente aquela zona. Eu irei passar um texto que essas organizações disseram sobre como poderiam ajudar, vou passar o nome da organização, também vou passar os objetos que conseguimos identificar naquela zona e o nível de perigo que a IA classificou e a latitude e longitude.
. Caso eu não passe algum desses dados não precisa dizer que não passei pula e faz o relatório com base no que eu passei
O nome da nossa organização é Salõnis e do app é MapaZZZ. Nosso email é salonis@gmail.com, nosso telefone é 946671828. Se por acaso eu não passar uma informação sobre nós, não precisa colocar na resposta. Na resposta, não dê recomendação para mim nem me explique o que irás fazer, você apenas chega no ponto.

No cabeçalho da mensagem passe apenas o Assunto e sempre na primeira linha.\
você deve dizer exatamente como é que a organização vai poder ajudar a eliminar a zona de perigo à malária.`,
      }
    ],
  };
  const modelEnv = process.env.GEMINI_MODEL;
  const model = ai.getGenerativeModel({
    model: "gemini-2.0-flash-lite" || "gemini-2.0-flash" || "gemini-1.5-pro-latest",

    generationConfig: config
  });

  const chat = model.startChat({
    history: [],
    generationConfig: {
      temperature: 0.7,
    },
  });

  const result = await chat.sendMessage(Texto);
  const response = result.response;
  const text = response.text();

  console.log('\n--- RESPOSTA ---\n');
  // console.log(text);
  return text;
}

// Substitua o texto abaixo com os dados reais que deseja enviar para a IA
const textoOrganizacao = `
Organização: Ajuda+
Oferece: Ajuda financeira, sem apoio humano
Zona de risco: Lama, lixo, água parada
Nível de perigo: Alto, identificado por IA
`;

module.exports = { main };
// main(textoOrganizacao);
