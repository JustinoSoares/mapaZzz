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
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({
        status: false,
        errors: errors.array(),
      });
    }

    const secret = process.env.JWT_SECRET_KEY;
    const { username, password } = req.body;

    const invalidCredentialsError = {
      status: false,
      errors: [{ message: "Usuário ou senha inválida" }],
    };

    if (!username || !password) {
      return res.status(400).json(invalidCredentialsError);
    }

    const user = await User.findOne({
      where: {
        [Op.or]: [{ email: username }, { phone: username }],
      },
    });

    if (!user) {
      return res.status(401).json(invalidCredentialsError);
    }

    const senhaValida = await bcrypt.compare(password, user.password);

    if (!senhaValida) {
      return res.status(401).json(invalidCredentialsError);
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        phone: user.phone,
        role: user.tipo_user,
      },
      secret,
    );

    return res.status(200).json({
      status: true,
      message: "Login efetuado com sucesso",
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
      },
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
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
