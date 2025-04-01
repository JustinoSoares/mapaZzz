const { run } = require("../../general/trainingAi");
const path = require("path");
const fs = require("fs");

exports.AnalicyImage = async (req, res) => {
    try {
        // Verifica se a imagem foi enviada
        const { image } = req.body;
        const result = await run(image);
        return res.status(200).json({
            data : result,
        });
    } catch (error) {
        return res.status(500).json({ 
            message: "Erro ao processar a imagem",
            error : error,
        });
    }
}