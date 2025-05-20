const db = require("../../../models/index");
const notification = db.notification;
const User = db.User;
exports.getQuestion = async (req, res) => {
  try {
    const Question = require("../../general/trainingAi/question_to_game");
    // Call the function to get the question
    const question = await Question.run();
    // Send the result back to the client
    res.json(question);
  } catch (error) {
    console.error("Error processing question:", error);
    res.status(500).json({
      error: "An error occurred while processing the question.",
      message: error.message,
    });
  }
};

exports.getResponse = async (req, res) => {
    try {
      const { problem, response } = req.body;
      const userId = req.userId;
      const user = await User.findByPk(userId);
  
      if (!problem || !response) {
        return res.status(400).json({
          message: "O problema e a resposta são importantes.",
        });
      }
  
      const ResponseAI = require("../../general/trainingAi/response");
  
      // Chama a função para verificar a resposta
      const result = await ResponseAI.run(problem, response);
  
      // Se a resposta estiver correta, incrementa a pontuação
      if (result.is_right) {
        user.points = (user.points || 0) + 1; // garante que score começa em 0 se for null
        await user.save(); // salva a atualização no banco de dados
      }
  
      // Retorna o resultado para o cliente
      res.json(result);
    } catch (error) {
      console.error("Error processing question:", error);
      res.status(500).json({
        error: "An error occurred while processing the question.",
        message: error.message,
      });
    }
  };
  
exports.alert = async (req, res) => {
  const userId = req.userId;
  try {
    const alert = require("../../general/trainingAi/alert");
    const result = await alert.run();
    const notificationCreate = await notification.create({
      lat: 0.0,
      lon: 0.0,
      typeNotification: "educação",
      title: "Aviso Importante",
      describe: result.recommendation,
      userId: userId,
      users: [],
    });
    // Emitir notificação via Socket.IO
    const io = req.app.get("socketio");
    io.emit("notification", {
      data: notificationCreate,
    });
    return res.status(200).json({
      message: "Notificação criada com sucesso.",
      notificationCreate,
    });
    // res.json(result);
  } catch (error) {
    console.error("Error processing question:", error);
    res.status(500).json({
      error: "An error occurred while processing the question.",
      message: error.message,
    });
  }
};
