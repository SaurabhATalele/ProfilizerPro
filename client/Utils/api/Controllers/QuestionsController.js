const Questions = require('../Models/Question.js');

const getQuestions = async (req, res) => {
    try {
        const questions = await Questions.find();
        res.status(200).json({ questions });
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}

const getQuestionsByAssignment = async (req, res) => {
    const { id } = req.params;
    try {
        const question = await Questions.find({AssignmentId:id});
        res.status(200).json({ question });
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}

const createQuestion = async (req, res) => {
    const question = req.body;
    const newQuestion = new Questions(question);
    try {
        await newQuestion.save();
        res.status(201).json({ newQuestion });
    } catch (error) {
        res.status(409).json({ message: error.message });
    }
}

const updateQuestion = async (req, res) => {
    const { id } = req.params;
    const question = req.body;
    try {
        
        const update = await Questions.findOneAndUpdate({_id:id},question);
        res.status(200).json({ update });

    } catch (error) {
        console.log(error);
    }
}

const deleteQuestion = async (req, res) => {
    const { id } = req.params;
    try {
        await Questions.findByIdAndRemove(id);
        res.status(200).json({ message: "Question deleted successfully." });
        
    } catch (error) {
        
    }
}


module.exports = { getQuestions, getQuestionsByAssignment, createQuestion, updateQuestion, deleteQuestion };