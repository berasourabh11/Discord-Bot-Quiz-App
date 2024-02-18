// Import models from the database for different levels of problems
import easyProblems from "../db/models/easy.js";
import mediumProblems from "../db/models/medium.js";
import hardProblems from "../db/models/hard.js";

/**
 * Function to add a question to the database based on its difficulty type.
 * @param {string} type - The difficulty type of the question (easy, medium, or hard).
 * @param {object} channel - The channel object where messages will be sent and collected.
 * @param {string} userId - The user's ID to filter messages for collecting the question and answer.
 */
const addQuestion = async (type, channel, userId) => {
  // Helper function to ask a question and collect the response
  const askQuestion = async (prompt) => {
    await channel.send(prompt);
    return new Promise((resolve) => {
      const filter = (response) => response.author.id === userId;
      const collector = channel.createMessageCollector({ filter, time: 5*60000, max: 1 }); // Collect a maximum of 1 message within 5 minutes

      collector.on('collect', (message) => {
        if (message.content.toLowerCase() === "cancel") {
          collector.stop('cancel');
        } else {
          resolve(message.content); // Resolve the promise with the collected message content
        }
      });

      collector.on('end', (collected, reason) => {
        if (reason === 'cancel') {
          resolve('cancel'); // Resolve with 'cancel' if the collection was stopped due to cancellation
        } else if (collected.size === 0) {
          channel.send("You did not provide any input in time. Please try again.");
          resolve('timeout'); // Resolve with 'timeout' if no messages were collected
        }
      });
    });
  };

  try {
    const question = await askQuestion("Enter the question:");
    if (question === "cancel" || question === "timeout") return;

    let answer;
    switch (type) {
      case "easy":
        // Collect true or false answer for easy questions
        answer = await askQuestion("Enter the answer for the question. The answer should be true or false.");
        if (answer.toLowerCase() !== "true" && answer.toLowerCase() !== "false") {
          await channel.send("The answer should be either true or false.");
          return;
        }
        const newIndex = await easyProblems.countDocuments();
        (await easyProblems.create({id: newIndex+1, problem:question, answer })).save();
        break;
      case "medium":
        // Collect options and correct answer for medium questions
        const options = await askQuestion("Enter the question options in the following format: option1,option2,option3,option4.");
        if (options.split(",").length !== 4) {
          await channel.send("Invalid Input. Please enter the options in the correct format.");
          return;
        }
        answer = await askQuestion("Enter the answer as the correct option number. The correct option should be a number between 1 and 4.");
        if (![1, 2, 3, 4].includes(parseInt(answer))) {
          await channel.send("The answer should be a number between 1 and 4.");
          return;
        }
        const newIndex2 = await mediumProblems.countDocuments();
        await mediumProblems.create({ id:newIndex2+1,problem:question, options: options.split(","), answer: parseInt(answer) - 1 }); // Create and save the new question
        break;
      case "hard":
        // Collect open-ended answer for hard questions
        answer = await askQuestion("Enter the answer for the question:");
        const newIndex3 = await hardProblems.countDocuments();
        await hardProblems.create({id:newIndex3+1, problem:question, answer });
        break;
    }
    await channel.send("Question added successfully!"); // Notify user of successful addition
  } catch (error) {
    console.error(error);
    await channel.send("An error occurred while adding the question. Please try again.");
  }
};

export default addQuestion;
