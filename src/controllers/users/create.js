const { Op } = require("sequelize");
const db = require("../../../models"); // Importa todos os modelos
const User = db.User; // Certifique-se de que o nome do modelo está correto
const bcrypt = require("bcrypt");
const { validationResult } = require("express-validator");
const { getCoordinates } = require("../../general/geocoding");
const axios = require("axios");


async function getCountryFlag (country) {
  try {
    const bandeira = await axios.get(
      `https://restcountries.com/v3.1/name/${country}`
    )
    if (!bandeira.data || bandeira.data.length === 0) {
      return 0
    }
    return bandeira.data[0].flag
  } catch (error) {
    return 0
  }
}



exports.createUser = async (req, res) => {
  try {
    // Pegando os dados do request body
    const { name, phone, password, address } = req.body;

    // // Validar entrada do usuário
     const errors = validationResult(req);
     if (!errors.isEmpty()) {
       return res.status(422).json({
         status: false,
         errors: errors.array(),
       });
     }

    // Verificar se o usuário já existe no banco de dados
    const userExistente = await User.findOne({
      where: { phone: phone },
    });
    if (userExistente) {
      return res.status(400).json({
        status: false,
        errors: [{
            message: "Usuário já existe, tenta mudar o número",
          },],
      });
    }

     const { latitude, longitude, country } = await getCoordinates(address);
    const pontos_cordias = await getCoordinates(address);
    console.log(pontos_cordias)
  
    if (!latitude || !longitude) {
      return res.status(400).json({
        status: false,
        errors: [
          {
            message: "Endereço inválido",
          },
        ],
      });
    }

    // Buscar bandeira do país
    const bandeira = await getCountryFlag(country);
    if (!bandeira) {
      return res.status(404).json({
        status: false,
        errors: [
          {
            message: "País não encontrado",
          },
        ],
      });
    }

    // Criar usuário
    const user = await User.create({
      name,
      phone,
      password: bcrypt.hashSync(password, 10),
      lat: latitude,
      lon: longitude,
      country,
      address,
    });

    // Dados para enviar na resposta
    const data = {
      id: user.id,
      name: user.name,
      phone: user.phone,
      address: user.address,
      country: user.country,
      lat: user.lat,
      lon: user.lon,
      bandeira: bandeira,
      points: user.points,
    };

    // Emitir evento via Socket.io
    const io = req.app.get("socketio");
    if (io) {
      io.emit("create_user", data);
    }

    return res.status(201).json({
      status: true,
      message: "Usuário criado com sucesso",
      data,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      errors: [
        {
          message: error.message,
        },
      ],
    });
  }
};
