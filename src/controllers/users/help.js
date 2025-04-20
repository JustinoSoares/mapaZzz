const { Op, where } = require("sequelize");
const db = require("../../../models"); // Importa todos os modelos
const User = db.User; // Certifique-se de que o nome do modelo está correto
const DangerZone = db.danger_zone;
const help = db.help;
const bcrypt = require("bcrypt");
const { validationResult, body } = require("express-validator");
const { getCoordinates } = require("../../general/geocoding");
const { main } = require("../../general/trainingAi/help");
const { welcome } = require("../../controllers/users/sendEmail");
const axios = require("axios");
const mailjet = require("node-mailjet");
const { marked } = require("marked");
require("dotenv").config();

exports.createHelp = async (req, res) => {
  try {
    const { name, email, phone, message, kind } = req.body;
    const userId = req.userId;

    if (!name || !email || !message) {
      return res.status(422).json({
        status: false,
        errors: [
          {
            message: "Nome, email e mensagem são obrigatórios",
          },
        ],
      });
    }

    const findALL = await help.findAll({
      where: { email },
    });

    if (findALL.length !== 0) {
      return res.status(400).json({
        status: false,
        errors: [
          {
            message: "Essa organização já foi registrada",
          },
        ],
      });
    }

    // Verifica se o usuário existe
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        status: false,
        errors: [
          {
            message: "Usuário não encontrado",
          },
        ],
      });
    }

    // Cria o pedido de ajuda
    const helpRequest = await help.create({
      name,
      email,
      phone,
      message,
      kind,
      userId,
    });
    await welcome(name, email);
    return res.status(201).json({
      status: true,
      data: helpRequest,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: false,
      errors: [
        {
          message: "Erro ao criar pedido de ajuda",
          error: error.message,
        },
      ],
    });
  }
};
