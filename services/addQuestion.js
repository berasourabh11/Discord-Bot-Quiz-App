import Discord from 'discord.js'; // Ensure you import Discord.js
import easyProblems from "../db/models/easy.js";
import mediumProblems from "../db/models/medium.js";
import hardProblems from "../db/models/hard.js";

const addQuestion = async (type, channel, userId) => {
  const askQuestion = async (prompt) => {
    await channel.send(prompt);
    return new Promise((resolve) => {
      const filter = (response) => response.author.id === userId;
      const collector = channel.createMessageCollector({ filter, time: 5*60000, max: 1 });

      collector.on('collect', (message) => {
        if (message.content.toLowerCase() === "cancel") {
          collector.stop('cancel');
        } else {
          resolve(message.content);
        }
      });

      collector.on('end', (collected, reason) => {
        if (reason === 'cancel') {
          resolve('cancel');
        } else if (collected.size === 0) {
          channel.send("You did not provide any input in time. Please try again.");
          resolve('timeout');
        }
      });
    });
  };

  try {
    const question = await askQuestion("Enter the question:");
    if (question === "cancel" || question === "timeout") return;
    console.log(typeof type);
    console.log(type);
    let answer;
    switch (type) {
      case "easy":
        answer = await askQuestion("Enter the answer for the question. The answer should be true or false.");
        if (answer.toLowerCase() !== "true" && answer.toLowerCase() !== "false") {
          await channel.send("The answer should be either true or false.");
          return;
        }
        const newIndex = await easyProblems.countDocuments();
        (await easyProblems.create({id: newIndex+1, problem:question, answer })).save();
        break;
      case "medium":
        const options = await askQuestion("Enter the question options in the following format: option1,option2,option3,option4.");
        console.log(options.split(",").length);
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
        await mediumProblems.create({ id:newIndex2+1,problem:question, options: options.split(","), answer: parseInt(answer) - 1 });
        break;
      case "hard":
        answer = await askQuestion("Enter the answer for the question:");
        const newIndex3 = await hardProblems.countDocuments();
        await hardProblems.create({id:newIndex3+1, problem:question, answer });
        break;
    }
    await channel.send("Question added successfully!");
  } catch (error) {
    console.error(error);
    await channel.send("An error occurred while adding the question. Please try again.");
  }
};


export default addQuestion;