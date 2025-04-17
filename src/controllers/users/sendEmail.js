const { Op } = require("sequelize");
const db = require("../../../models"); // Importa todos os modelos
const User = db.User; // Certifique-se de que o nome do modelo está correto
const DangerZone = db.danger_zone;
const help = db.help;
const bcrypt = require("bcrypt");
const { validationResult, body } = require("express-validator");
const { getCoordinates } = require("../../general/geocoding");
const {main} = require("../../general/trainingAi/help");
const axios = require("axios");
const mailjet = require('node-mailjet')
const { marked } = require('marked');
require('dotenv').config();


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
    return array.map(item => item.trim()).join(", ");
}

const send_email = async (name, email, about, dangerZone) => {
    try {
      if (!email) {
        console.log("Email não fornecido");
        return ;
          
      }
      const mailjetClient = await mailjet.apiConnect(
        process.env.API_KEY_MAILJET,
        process.env.SECRET_KEY_MAILJET
      )
      const textoOrganizacao = `
        Organização: ${name}
        Oferece: ${about}
        objectos na Zona de risco: ${arrayToText(dangerZone.objectsFinds)}
        Nível de perigo: ${dangerZone.level}, identificado por IA
    `;
   
        const result = await main(textoOrganizacao);
      const request = await mailjetClient
        .post('send', { version: 'v3.1' })
        .request({
          Messages: [
            {
              From: {
                Email: process.env.EMAIL_FROM,
                Name: `MapaZZZ`
              },
              To: [
                {
                  Email: email,
                  Name: `${name} <${email}>`
                }
              ],
              Subject: getFirstLine(result),
              HTMLPart: marked(getTextFromSecondLine(result)), 
            }
          ]
        })
      const response = await request
      console.log("Email enviado com sucesso:");
    } catch (error) {
      console.log(error)
    }
  }

  module.exports = {
    send_email
  }