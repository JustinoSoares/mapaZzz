const Question  = require("../../general/trainingAi/question_to_game");
const ResponseAI = require("../../general/trainingAi/response");
const alert = require("../../general/trainingAi/alert");
const db = require('../../../models/index');
const notification = db.notification;
exports.getQuestion = async (req, res) => {
    try {

        // Call the function to get the question
        const question = await Question.run();

        // Send the result back to the client
        res.json(question);
    } catch (error) {
        console.error("Error processing question:", error);
        res.status(500).json({ 
            error: "An error occurred while processing the question." 
        });
    }
}

exports.getResponse = async (req, res) => {
    try {
        const { problem, response } = req.body;
        if (!problem || !response) {
            return res.status(400).json({ 
                message: "O problema e a resposta são importantes." 
            });
        }
        // Call the function to get the response
        const result = await ResponseAI.run(problem, response);

        // Send the result back to the client
        res.json(result);
    } catch (error) {
        console.error("Error processing question:", error);
        res.status(500).json({ 
            error: "An error occurred while processing the question.",
            message: error.message
        });
    }
}

exports.alert = async (req, res) => {
    const userId = req.userId;
    try {
        const result = await alert.run();
        const notificationCreate = await notification.create({
            lat: 0.0,
            lon: 0.0,
            typeNotification: 'educação',
            title: 'Aviso Importante',
            describe: result.recommendation,
            userId: userId,
            users: [],
        });
        // Emitir notificação via Socket.IO
        const io = req.app.get('socketio');
        io.emit('notification', {
            data: notificationCreate,
        });
        return res.status(200).json({
            message: 'Notificação criada com sucesso.',
            notificationCreate,
        });
        // res.json(result);
    } catch (error) {
        console.error("Error processing question:", error);
        res.status(500).json({ 
            error: "An error occurred while processing the question.",
            message: error.message
        });
    }
}


