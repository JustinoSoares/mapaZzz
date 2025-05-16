const {
    GoogleGenerativeAI,
    HarmCategory,
    HarmBlockThreshold,
  } = require("@google/generative-ai");
  const fs = require("node:fs");
  const mime = require("mime-types");
  require("dotenv").config();
  
  const apiKey = process.env.GEMINI_API_KEY;
  const modelEnv  = process.env.GEMINI_MODEL;
  const genAI = new GoogleGenerativeAI(apiKey);
  
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash-lite" || "gemini-2.0-flash" || "gemini-1.5-pro-latest",
    systemInstruction: "Estou a fazer um projecto de combate a malária, e o principal objectivo é a prevenção conscencialização da população sobre os surtos, e eu quero criar um jogo interessante e educativo para os meu usuários, e o jogo consiste em que o meu programa vai formular um problema curto relacionado ao assunto e ele deve respoder, nesse caso eu irei te fornecer a pergunta e tu irás me dizer se ela está correta(é correta quando ele pelomenos teve um bom raciocinio proximo) ou não(é incorreta quando ele não passou proximo), caso de centires que a resposta está errada ou está certa mas falta alguma coisa dê uma  recomendação curta de modo que o usuário sinta que a sua resposta foi validade",
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
        is_right: {
          type: "boolean"
        },
        recommendation: {
          type: "string"
        }
      },
      required: [
        "is_right"
      ]
    },
  };
  
  async function run(problem, response) {
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
        {
          role: "user",
          parts: [
            {text: "Numa comunidade, observou-se um aumento de água parada em pneus velhos e vasos de plantas após as chuvas. Que ação prioritária deve ser tomada para prevenir um surto de malária?\n\nminha resposta:\nO mais certo é retirar o pneu daí"},
          ],
        },
        {
          role: "model",
          parts: [
            {text: "The user provided an answer to the previously generated problem.\nThe problem describes a situation where stagnant water is accumulating in old tires and plant pots, increasing the risk of malaria. The question asks for the *priority action* to prevent an outbreak.\nThe user's answer is \"O mais certo é retirar o pneu daí\" (The most correct thing is to remove the tire from there).\n\nLet's analyze the answer:\n1.  **Relevance:** The answer addresses one source of stagnant water mentioned in the problem (tires).\n2.  **Correctness:** Removing tires that collect water is indeed a valid preventive measure against malaria, as it eliminates breeding sites for mosquitoes.\n3.  **Completeness:** The problem mentions *tires* and *plant pots*. The answer only focuses on the tires. The priority action should ideally address *all* sources of stagnant water mentioned or the general principle. Removing only the tires might not be sufficient if the plant pots are also significant breeding sites.\n4.  **\"Priority Action\":** The most encompassing priority action is eliminating *all* stagnant water sources to prevent mosquito breeding. Removing tires is part of this, but focusing solely on tires might miss the broader point.\n\nSo, the answer is partially correct but incomplete. It shows good reasoning (removing the tire eliminates a breeding site) but doesn't address the full scope of the problem (tires *and* plant pots) or the general principle (eliminating stagnant water).\n\nTherefore:\n*   `is_right` should be `true` because the reasoning is sound and it's a correct action, even if incomplete. It's a good start.\n*   A `recommendation` is needed to guide the user towards a more complete answer, highlighting the need to eliminate *all* stagnant water sources.\n\nRecommendation idea: \"Remover os pneus é uma boa ideia! Mas lembre-se que a prioridade é eliminar *toda* a água parada, incluindo a dos vasos de plantas, para impedir a reprodução dos mosquitos.\" (Removing the tires is a good idea! But remember that the priority is to eliminate *all* stagnant water, including that in the plant pots, to prevent mosquitoes from breeding.)\n\nConstraint Checklist & Confidence Score:\n1. Generate valid, parseable JSON? Yes.\n2. Scalars, booleans, null okay? Yes.\n3. Other values double-quoted strings? Yes.\n4. No comments? Yes.\n5. No control tokens (\\n, \\t)? Yes.\n6. Single JSON array for multiple requests? N/A (single request).\n7. No extra text outside JSON? Yes.\n8. Follow schema? Yes (`is_right`: boolean, `recommendation`: string).\n\nConfidence Score: 5/5\n\nMental Sandbox:\n*   If `is_right` was `false`: This would be too harsh, as removing the tire *is* a correct action.\n*   If `recommendation` was just \"Eliminate all stagnant water\": This is less encouraging and doesn't acknowledge the user's correct idea.\n*   If `recommendation` focused only on plant pots: This might seem like nitpicking the user's answer rather than guiding them to the general principle.\n\nThe chosen approach (`is_right: true` + recommendation covering both sources and the general principle) seems the most balanced and educational."},
            {text: "{\n  \"is_right\": true,\n  \"recommendation\": \"Remover os pneus é um passo importante! Lembre-se que a ação prioritária é eliminar *toda* a água parada, incluindo a dos vasos de plantas, para evitar que os mosquitos se reproduzam.\"\n}"},
          ],
        },
      ],
    });
  
    const result = await chatSession.sendMessage(`o problema: ${problem}\n\n\n minha resposta:${response}`);
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

  module.exports = { run };
//   run("Numa comunidade, observou-se um aumento de água parada em pneus velhos e vasos de plantas após as chuvas. Que ação prioritária deve ser tomada para prevenir um surto de malária?",
//     "O mais certo é retirar o pneu daí",
//   );