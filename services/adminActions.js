import addQuestion from "./addQuestion.js";
import displayAllQuestionsOfType from "./displayQuestions.js";
import editQuestion from "./editQuestion.js";
import removeQuestion from "./removeQuestion.js";

const adminActions = async (type, channel, userId) => {
  const ProblemTypes = ["easy", "medium", "hard"];
  await channel.send("Select the type of channel you want to perform action on");
  await channel.send("1. Easy\n2. Medium\n3. Hard");

  const filter = m => (ProblemTypes.includes(m.content.toLowerCase()) || [1, 2, 3].includes(parseInt(m.content))) && m.author.id === userId;

  let userSelectedType = await channel.awaitMessages({filter, max: 1, time: 10 * 60000, errors: ['time'] });
  userSelectedType = userSelectedType.first().content.toLowerCase();
  if (userSelectedType === "cancel") return;

  // Convert numeric selection to corresponding string type
  if (userSelectedType.length==1) {
    userSelectedType = ProblemTypes[parseInt(userSelectedType) - 1];
  }

  if (type === "!add") {
    await addQuestion(userSelectedType, channel, userId);
  }
  if(type === "!remove"){
    await removeQuestion(userSelectedType, channel, userId);
  }
 if(type === "!view"){
    await displayAllQuestionsOfType(userSelectedType, channel);
  }
  if(type === "!edit"){
    await editQuestion(userSelectedType, channel, userId);
  }
};

export default adminActions;