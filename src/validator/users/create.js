const { body } = require("express-validator");

const create = [
  body("name")
    .notEmpty()
    .withMessage("O nome é obrigatório")
    .isLength({ min: 3 })
    .withMessage("O nome deve ter pelo menos 3 caracteres"),
  body("phone")
    .notEmpty()
    .withMessage("O telefone é obrigatório")
    .isMobilePhone("any")
    .withMessage("O telefone deve ser um número de telefone válido"),
  body("password")
    .notEmpty()
    .withMessage("A senha é obrigatória")
    .isLength({ min: 6 })
    .withMessage("A senha deve ter pelo menos 6 caracteres"),
    body("address")
    .notEmpty()
    .withMessage("O endereço é obrigatório")
    .isLength({ min: 6 })
    .withMessage("O endereço deve ter pelo menos 6 caracteres"),
];
module.exports = {create};