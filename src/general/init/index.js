const db = require("../../../models/index.js");
const User = db.User;
const bcrypt = require("bcrypt");

const create = async (req, res, next) => {
    try {
        const name = process.env.ADMIN_NAME;
        const email = process.env.ADMIN_EMAIL;
        const password = process.env.ADMIN_PASSWORD;

        // Verifica se o usuário já existe
        const existingUser = await User.findOne({ where: { email } });
        if (!existingUser) {
            // Criptografa a senha
        const hashedPassword = await bcrypt.hash(password, 10);
    
        // Cria o usuário
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
        });
        console.log("Usuário criado com sucesso!");
        }
        else
            console.log("...");
    } catch (error) {
        console.log("Não foi possível criar esse usuário...");
    }
}

module.exports = {
    create,
}