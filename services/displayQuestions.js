import easyProblems from "../db/models/easy.js";
import HardProblems from "../db/models/hard.js";
import mediumProblems from "../db/models/medium.js";

const displayAllQuestionsOfType = async (type, channel) => {
  const fetchQuestions = async () => {
    switch (type) {
      case "easy":
        return await easyProblems.find({});
      case "medium":
        return await mediumProblems.find({});
      case "hard":
        return await HardProblems.find({});
      default:
        return [];
    }
  };

  try {
    const questions = await fetchQuestions();
    if (questions.length === 0) {
      await channel.send("No questions found for the given type.");
      return;
    }

    let messageContent = `**Questions of type ${type}:**\n\n`;
    for (const question of questions) {
      let questionDetails = `**Question ID:** ${question.id}\n**Question:** ${question.problem}\n`;

      switch (type) {
        case "medium":
          questionDetails += `**Options:**\n1⃣ ${question.options[0]}\n2⃣ ${question.options[1]}\n3⃣ ${question.options[2]}\n4⃣ ${question.options[3]}\n**Correct Option:** ${parseInt(question.answer) + 1}\n`;
          break;
        case "easy":
        case "hard":
          questionDetails += `**Answer:** ${question.answer}\n`;
          break;
      }

      questionDetails += `\n---\n`;

      if ((messageContent + questionDetails).length > 2000) {

        await channel.send(messageContent);

        messageContent = questionDetails;
      } else {

        messageContent += questionDetails;
      }
    }


    if (messageContent.length > 0) {
      await channel.send(messageContent);
    }
  } catch (error) {
    console.error(error);
    await channel.send("An error occurred while fetching the questions. Please try again.");
  }
};

export default displayAllQuestionsOfType;
