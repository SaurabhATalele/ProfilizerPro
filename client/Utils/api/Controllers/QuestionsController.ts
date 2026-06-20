import Questions from "../Models/Question";

interface QuestionBody {
  [key: string]: unknown;
}

export const getQuestions = async (): Promise<unknown> => {
  try {
    const questions = await Questions.find();
    return questions;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return { message };
  }
};

export const getQuestionsByAssignment = async (id: string): Promise<unknown> => {
  try {
    const question = await Questions.find({ AssignmentId: id });
    return question;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return { message };
  }
};

export const createQuestion = async (question: QuestionBody): Promise<unknown> => {
  const newQuestion = new Questions(question);
  try {
    await newQuestion.save();
    return newQuestion;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return { message };
  }
};

export const updateQuestion = async (id: string, question: QuestionBody): Promise<unknown> => {
  try {
    const update = await Questions.findOneAndUpdate({ _id: id }, question);
    return update;
  } catch (error) {
    console.log(error);
    return null;
  }
};

export const deleteQuestion = async (id: string): Promise<unknown> => {
  try {
    await Questions.findByIdAndDelete(id);
    return { message: "Question deleted successfully." };
  } catch (error) {
    console.log(error);
    return null;
  }
};
