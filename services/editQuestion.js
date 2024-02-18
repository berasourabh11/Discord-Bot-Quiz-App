import easyProblems from "../db/models/easy.js";
import mediumProblems from "../db/models/medium.js";
import hardProblems from "../db/models/hard.js";


const editQuestion = async (type, channel, userId) => {
  // Helper function to ask a question and get a response
  const askQuestion = async (prompt) => {
    await channel.send(prompt);
    return new Promise((resolve) => {
      const filter = (response) => response.author.id === userId;
      const collector = channel.createMessageCollector({ filter, time: 5 * 60000, max: 1 });

      collector.on('collect', (message) => {
        resolve(message.content.trim());
      });

      collector.on('end', (collected) => {
        if (collected.size === 0) resolve('timeout');
      });
    });
  };

  // Function to fetch and update the question document
  const updateDocument = async (id, updates) => {
    switch (type) {
      case "easy":
        return await easyProblems.findOneAndUpdate({ id: parseInt(id) }, updates, { new: true });
      case "medium":
        return await mediumProblems.findOneAndUpdate({ id: parseInt(id) }, updates, { new: true });
      case "hard":
        return await hardProblems.findOneAndUpdate({ id: parseInt(id) }, updates, { new: true });
    }
  };

  try {
    const questionId = await askQuestion("Please enter the ID of the question you want to edit:");
    if (questionId === 'timeout') {
      await channel.send("You did not provide any input in time. Please try again.");
      return;
    }

    // Fetch the question
    const questionModel = type === 'easy' ? easyProblems : type === 'medium' ? mediumProblems : hardProblems;
    const question = await questionModel.findOne({ id: parseInt(questionId) });
    if (!question) {
      await channel.send(`Question with ID ${questionId} not found.`);
      return;
    }

    let questionDetails = `Current question: ${question.problem}`;
    if (type === 'medium' && question.options) {
      questionDetails += `\nOptions: ${question.options.join(', ')}`;
    }
    questionDetails += `\nAnswer: ${type === 'medium' ? question.options[question.answer] : question.answer}`;
    await channel.send(questionDetails);

    // Ask if they want to change the question
    const changeQuestion = await askQuestion("Do you want to change the question? (yes/no)");
    if (changeQuestion.toLowerCase() === 'yes') {
      const newQuestionText = await askQuestion("Enter the new question:");
      question.problem = newQuestionText;
    }

    // For medium questions, ask about changing options
    if (type === 'medium') {
      const changeOptions = await askQuestion("Do you want to change the options? (yes/no)");
      if (changeOptions.toLowerCase() === 'yes') {
        const newOptions = await askQuestion("Enter the new options in 'option1,option2,option3,option4' format:");
        const optionsArray = newOptions.split(',');
        // Validate that exactly four options are provided
        if (optionsArray.length !== 4) {
          await channel.send("Invalid number of options. Medium questions must have exactly 4 options.");
          return;
        }
        question.options = optionsArray;
      }
    }

    // Ask if they want to change the answer
    const changeAnswer = await askQuestion("Do you want to change the answer? (yes/no)");
    if (changeAnswer.toLowerCase() === 'yes') {
      const newAnswer = await askQuestion("Enter the new answer:");
      // Additional validation for easy questions
      if (type === 'easy' && !['true', 'false'].includes(newAnswer.toLowerCase())) {
        await channel.send("Invalid answer. Easy questions must have 'true' or 'false' as the answer.");
        return;
      }
      question.answer = type === 'medium' ? parseInt(newAnswer) - 1 : newAnswer; // Adjust for medium question option indexing
    }
    await updateDocument(questionId, { problem: question.problem, options: question.options, answer: question.answer });

    await channel.send("Question updated successfully.");
  } catch (error) {
    console.error(error);
    await channel.send("An error occurred while trying to edit the question. Please try again.");
  }
};

export default editQuestion;
