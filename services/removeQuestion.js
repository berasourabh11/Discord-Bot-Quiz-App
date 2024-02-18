
import easyProblems from "../db/models/easy.js";
import mediumProblems from "../db/models/medium.js";
import hardProblems from "../db/models/hard.js";

const removeQuestion = async (type, channel, userId) => {
  const askForId = async (prompt) => {
    await channel.send(prompt);
    return new Promise((resolve) => {
      const filter = (response) => response.author.id === userId;
      const collector = channel.createMessageCollector({ filter, time: 5 * 60000, max: 1 });

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
    const idToDelete = await askForId("Enter the ID of the question to remove:");
    if (idToDelete === "cancel" || idToDelete === "timeout") return;

    switch (type) {
      case "easy":
        await easyProblems.deleteOne({ id: idToDelete });
        break;
      case "medium":
        await mediumProblems.deleteOne({ id: idToDelete });
        break;
      case "hard":
        await hardProblems.deleteOne({ id: idToDelete });
        break;
    }
    await channel.send("Question removed successfully!");
  } catch (error) {
    console.error(error);
    await channel.send("An error occurred while removing the question. Please try again.");
  }
};

export default removeQuestion;
