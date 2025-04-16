const {
    GoogleGenerativeAI,
    HarmCategory,
    HarmBlockThreshold,
} = require("@google/generative-ai");
const axios = require("axios");
const path = require("path");

const { GoogleAIFileManager } = require("@google/generative-ai/server");
const fs = require("fs");
const mime = require("mime-types");
require("dotenv").config();

const apiKey = process.env.GEMINI_API_KEY;
console.log(apiKey);
const genAI = new GoogleGenerativeAI(apiKey);
const fileManager = new GoogleAIFileManager(apiKey);

/**
 * Faz upload da imagem para o Gemini e retorna o objeto do arquivo.
 */
async function uploadToGemini(path) {
    const mimeType = mime.lookup(path) || "image/jpeg"; // Define o tipo MIME
    const uploadResult = await fileManager.uploadFile(path, {
        mimeType,
        displayName: path,
    });
    console.log(`Arquivo enviado: ${uploadResult.file.displayName}`);
    return uploadResult.file;
}

const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    systemInstruction: "Diga se a imagem é uma zona de risco de malária. na description dê uma descrição resumida de tomar cuidado com a malária.",
    generationConfig: {
        temperature: 1,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 8192,
        responseModalities: [],
        responseMimeType: "application/json",
        responseSchema: {
            type: "object",
            properties: {
                isDangerZone: { type: "boolean" },
                objectsFinds: {
                    type: "array",
                    items: { type: "string" }
                },
                level_dange: {
                    type: "string",
                    enum: ["low", "medium", "high", "without"]
                },
                description : {
                    type: "string",
                    description: "Descrição da imagem analisada"
                },
                how_to_help: {
                    type: "string",
                    description: "Como as instituições de saúde podem ajudar nessa zona"
                },
            },
            required: ["isDangerZone", "level_dange"]
        },
    },
});

// Função para converter o arquivo em base64
async function encodeFileToBase64(filePath) {
    if (filePath.startsWith("http")) {
      // É uma URL, vamos baixar a imagem e converter para base64
      const response = await axios.get(filePath, {
        responseType: "arraybuffer",
      });
      return Buffer.from(response.data, "binary").toString("base64");
    } else {
      // É um arquivo local
      return fs.readFileSync(filePath, { encoding: "base64" });
    }
  }
// Função para verificar se a URL da imagem é válida
function isValidImageUrl(url) {
    const imageExtensions = [".jpg", ".jpeg", ".png"];
    return imageExtensions.some(ext => url.toLowerCase().endsWith(ext));
}
async function run(PATH_TO_FILE) {
    try {
        // Verifica se a URL da imagem é válida
        if (!PATH_TO_FILE || !isValidImageUrl(PATH_TO_FILE)) {
            return [{
                message: "Imagem inválida." 
            }];
        }
        const base64Image = await encodeFileToBase64(PATH_TO_FILE);
        const prompt = "Eu quero que você analise a imagem e diga se é \
                        uma zona de risco de malária, por menor risco que \
                        seja. e na descrição dê uma descrição leve de \
                        cuidado com essa zona e não pode passar de 200 \
                        caracteres. Se não for uma zona de risco, diga que\
                        não é uma zona de risco e não pode passar de 200\
                        caracteres. E não pode ser uma resposta padrão, \
                        tem que ser algo mais humano e leve. E a resposta \
                        tem que ser em português. e o how_to_help diga como as instituições \
                        de saúde podem ajudar aquela zona. ";

        const requestBody = {
            contents: [
                {
                    parts: [
                        { text: prompt },
                        {
                            inline_data: {
                                mime_type: "image/jpeg",
                                data: base64Image // Deve ser uma string base64 válida
                            }
                        }
                    ]
                }
            ]
        };

        try {
            const result = await model.generateContent(requestBody);
            
            // Verifica se há resposta e exibe corretamente
            if (result.response?.candidates?.length > 0) {
                const resultJson = result.response.candidates[0].content.parts[0].text;
                return JSON.parse(resultJson);
            } else {
                return JSON.parse([{
                    isDangerZone: false,
                    objectsFinds: [],
                    message: "Nenhuma resposta válida recebida.",
                    level_dange: "without",
                }]);
            }

        } catch (error) {
            return [{
                isDangerZone: false,
                objectsFinds: [],
                message: "Erro ao processar a imagem",
                error: error.message,
                level_dange: "without",
            }];
        }

    } catch (error) {
        return [{
            isDangerZone: false,
            objectsFinds: [],
            message: "Erro ao processar a imagem",
            error: error.message,
            level_dange: "without",
        }];
    }
}

module.exports = {run}