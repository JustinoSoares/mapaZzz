const db = require("../../../models");
const User = db.User;
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const { Op } = require("sequelize");
require("dotenv").config();


//Controller para autenticação de usuários
exports.login = async (req, res) => {
  try {
    // const errors = validationResult(req);
    // if (!errors.isEmpty()) {
    //   return res.status(422).json({
    //     status: false,
    //     errors: errors.array(),
    //   });
    // }
    const secret = process.env.JWT_SECRET_KEY;
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({
        status: false,
        errors: [
          {
            message: "Usuário ou senha inválida",
          },
        ],
      });
    }
    const user = await User.findOne({
      where: {
        [Op.or]: {
          email: username,
          phone : username,
        },
      },
    });

    if (!user) {
      return res.status(400).json({
        status: false,
        errors: [
          {
            message: "Usuário ou  senha inválida",
          },
        ],
      });
    }

    const senhaValida = await bcrypt.compare(password, user.password);

    if (!senhaValida) {
      return res.status(400).json({
        status: false,
        errors: [
          {
            message: "Usuário ou  senha inválida",
          },
        ],
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        phone: user.phone,
        role: user.tipo_user,
      },
      secret,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    return res.status(200).json({
      status: true,
      message: "Login efetuado com sucesso",
      id: user.id,
      email : user.email,
      phone : user.phone,
      token,
    });
  } catch (error) {
    res.status(400).json({
      status: false,
      errors: [
        {
          msg: "Erro ao efetuar o login",
          param: "username",
          location: "body",
        },
      ],
    });
  }
};

exports.verifyToken = async (req, res) => {
  const token = req.params.token;
  const secret = process.env.JWT_SECRET_KEY;

  jwt.verify(token, secret, (err, decoded) => {
    if (err) {
      return res.status(401).json({
        status: false,
        msg: "Token inválido",
      });
    }
    req.user = decoded;
    return res.status(200).json({
      status: true,
      data: decoded,
    });
  });
};
