const Question  = require("../../general/trainingAi/question_to_game");
const ResponseAI = require("../../general/trainingAi/response");
const alert = require("../../general/trainingAi/alert");
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
    try {
        const result = await alert.run();
        res.json(result);
    } catch (error) {
        console.error("Error processing question:", error);
        res.status(500).json({ 
            error: "An error occurred while processing the question.",
            message: error.message
        });
    }
}


