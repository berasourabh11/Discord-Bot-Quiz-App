import Leaderboard from "../db/models/leaderboard.js";

const updateLeaderboard = async (name, score) => {
  try {
    // Find an existing entry by name
    const existingEntry = await Leaderboard.findOne({ name }).exec();
    if (existingEntry) {
      // Update the score if the new score is higher
      if (existingEntry.score < score) {
        existingEntry.score = score;
        await existingEntry.save();
      }
    } else {
      // If no existing entry, create a new one
      const newEntry = new Leaderboard({ name, score });
      await newEntry.save();
    }
  } catch (error) {
    console.log(error);
    throw new Error("Error updating leaderboard");
  }
};

export default updateLeaderboard;
