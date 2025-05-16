const {
    GoogleGenerativeAI,
    HarmCategory,
    HarmBlockThreshold,
  } = require("@google/generative-ai");
  const fs = require("node:fs");
  const mime = require("mime-types");
  require("dotenv").config();
  
  const apiKey = process.env.GEMINI_API_KEY;
  console.log("ApI KWY", apiKey);
  const modelEnv  = process.env.GEMINI_MODEL;
  const genAI = new GoogleGenerativeAI(apiKey);

  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash-lite" || "gemini-2.0-flash" || "gemini-1.5-pro-latest",
    systemInstruction: "Estou a fazer um projecto de combate a malária, e o principal objectivo é a prevenção conscencialização da população sobre os surtos, e eu quero criar um jogo interessante e educativo para os meu usuários, e o jogo consiste em que o meu programa vai formular um problema curto relacionado ao assunto e ele deve respoder",
  });
  
  const generationConfig = {
    temperature: 1,
    topP: 0.95,
    topK: 64,
    maxOutputTokens: 65536,
    responseModalities: [
    ],
    responseMimeType: "application/json",
    responseSchema: {
      type: "object",
      properties: {
        problem: {
          type: "string"
        }
      },
      required: [
        "problem"
      ]
    },
  };
  
  async function run() {
    const chatSession = model.startChat({
      generationConfig,
      history: [
        {
          role: "user",
          parts: [
            {text: "me dê um problema"},
          ],
        },
        {
          role: "model",
          parts: [
            {text: "The user wants a short problem related to malaria prevention and awareness, suitable for an educational game. The output must be a valid JSON object following the provided schema: `{\"problem\": \"string\"}`.\n\n1.  **Identify the core topic:** Malaria prevention and awareness.\n2.  **Brainstorm problem scenarios:**\n    *   Identifying mosquito breeding grounds.\n    *   Recognizing malaria symptoms.\n    *   Choosing appropriate preventive measures (nets, repellents).\n    *   Understanding the transmission cycle.\n    *   Knowing when to seek medical help.\n3.  **Select a scenario:** Identifying breeding grounds is a practical and important aspect of prevention.\n4.  **Formulate a short problem:** \"Uma família vive perto de um pântano e notou muitos mosquitos à noite. Qual é a medida preventiva MAIS eficaz que eles podem tomar DENTRO de casa para evitar picadas de mosquito enquanto dormem?\" (A family lives near a swamp and has noticed many mosquitoes at night. What is the MOST effective preventive measure they can take INSIDE the house to avoid mosquito bites while sleeping?) This focuses on a specific action (using nets).\n5.  **Format as JSON:** Create a JSON object with the key \"problem\" and the formulated question as the string value.\n6.  **Validate:** Ensure the output is a single, valid JSON object adhering to the schema, with no extra text or comments."},
            {text: "{\n  \"problem\": \"Numa comunidade, observou-se um aumento de água parada em pneus velhos e vasos de plantas após as chuvas. Que ação prioritária deve ser tomada para prevenir um surto de malária?\"\n}"},
          ],
        },
      ],
    });
  
    const result = await chatSession.sendMessage("me dê um problema");
    // TODO: Following code needs to be updated for client-side apps.
    const candidates = result.response.candidates;
    for(let candidate_index = 0; candidate_index < candidates.length; candidate_index++) {
      for(let part_index = 0; part_index < candidates[candidate_index].content.parts.length; part_index++) {
        const part = candidates[candidate_index].content.parts[part_index];
        if(part.inlineData) {
          try {
            const filename = `output_${candidate_index}_${part_index}.${mime.extension(part.inlineData.mimeType)}`;
            fs.writeFileSync(filename, Buffer.from(part.inlineData.data, 'base64'));
            console.log(`Output written to: ${filename}`);
          } catch (err) {
            console.error(err);
          }
        }
      }
    }
        return JSON.parse(result.response.text());
  }
  module.exports = {run};