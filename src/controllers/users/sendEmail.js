const { Op } = require("sequelize");
const db = require("../../../models"); // Importa todos os modelos
const User = db.User; // Certifique-se de que o nome do modelo está correto
const DangerZone = db.danger_zone;
const help = db.help;
const bcrypt = require("bcrypt");
const { validationResult, body } = require("express-validator");
const { getCoordinates } = require("../../general/geocoding");
const { main } = require("../../general/trainingAi/help");
const axios = require("axios");
const mailjet = require("node-mailjet");
const { marked } = require("marked");
require("dotenv").config();

// função que vai pegar a primeira linha de um texto
function getFirstLine(text) {
  const lines = text.split("\n");
  return lines[0].trim();
}
// que vai pegar o texto apartir  da segunda linha
function getTextFromSecondLine(text) {
  const lines = text.split("\n");
  return lines.slice(1).join("\n").trim();
}

// função para trandormar um array em um texto
function arrayToText(array) {
  return array.map((item) => item.trim()).join(", ");
}

const send_email = async (name, email, about, dangerZone) => {
  try {
    if (!email) {
      console.log("Email não fornecido");
      return;
    }
    const mailjetClient = await mailjet.apiConnect(
      process.env.API_KEY_MAILJET,
      process.env.SECRET_KEY_MAILJET
    );
    const textoOrganizacao = `
        Organização: ${name}
        Oferece: ${about}
        objectos na Zona de risco: ${arrayToText(dangerZone.objectsFinds)}
        Nível de perigo: ${dangerZone.level}, identificado por IA
        Endereço da zona de risco: ${dangerZone.address}
        Latitude: ${dangerZone.latitude}
        Longitude: ${dangerZone.longitude}
    `;

    const result = await main(textoOrganizacao);
    const request = await mailjetClient
      .post("send", { version: "v3.1" })
      .request({
        Messages: [
          {
            From: {
              Email: process.env.EMAIL_FROM,
              Name: `MapaZZZ`,
            },
            To: [
              {
                Email: email,
                Name: `${name} <${email}>`,
              },
            ],
            Subject: getFirstLine(result),
            HTMLPart: marked(getTextFromSecondLine(result)),
          },
        ],
      });
    const response = await request;
    console.log("Email enviado com sucesso:");
  } catch (error) {
    console.log(error);
  }
};

const welcome = async (name, email) => {
  try {
    if (!email || !name) {
      console.log("O nome e o email são obrigatórios");
      return;
    }
    const mailjetClient = await mailjet.apiConnect(
      process.env.API_KEY_MAILJET,
      process.env.SECRET_KEY_MAILJET
    );
    const request = await mailjetClient
      .post("send", { version: "v3.1" })
      .request({
        Messages: [
          {
            From: {
              Email: process.env.EMAIL_FROM,
              Name: `MapaZZZ`,
            },
            To: [
              {
                Email: email,
                Name: `${name} <${email}>`,
              },
            ],
            Subject: "Thank you very much for joining the support team.",
            HTMLPart: `
              <!DOCTYPE html>
              <html lang="pt-br">
              <title>Online HTML Editor</title>
  
              <head>
              <meta charset="utf-8">
              </head>
            <body style="display: flex; justify-content: center; align-items: center;">
             <div style="text-align: center; margin-top: 50px">
                    <div style="
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    gap: 20px;
                    width: 100%;
                      "
              >
          <div style="display : flex; justify-content: center; align-items :center; gap: 5px;">
       
          <h1
          style="
            color: #7f1734, 
            background-color : grey,
          "
          >MapaZZZ</h1>
          </div>
        </div>
        <h3>Muito obrigado por se Juntar a nós!</h3>
        <p>A sua perfil foi criado com sucesso, agora irá receber forma que poderá ajudar a combater a malária</p>
        <div
          style="
            padding: 2px 30px;
            margin-top: 20px;
            border-radius: 10px;
            border: 1px solid #ccc;
            display: inline-block;
          "
        >
        </div>
      </div>
      </body>
            `,
          },
        ],
      });

    const response = await request;
    console.log("E-mail enviado com sucesso!");
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  send_email,
  welcome,
};
