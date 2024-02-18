// Main function to conduct the quiz. It waits for a user to type 'start' in a channel,
// then runs the quiz, updates the leaderboard, and handles errors.



import getQuestions from "./getQuestions.js";
import updateLeaderboard from "./updateLeaderboard.js";

async function conductQuiz(channel) {
  try {
    // Filter messages to find 'start' command.
    const filter = (response) => response.content.toLowerCase() === 'start';
    // Await a 'start' message for up to 10 minutes.
    const response = await channel.awaitMessages({ filter, max: 1, time: 10000 * 60 * 10, errors: ['time'] });
    if (response) {
      await channel.send('Starting the quiz!');
      // Begin the quiz process.
      const score = await startQuiz(channel);
      const username = channel.name.split('-')[1];
      await channel.send(`Your final score is: ${score}`);
      // Update leaderboard with the user's score.
      await updateLeaderboard(username, score);
      await channel.send(`Congratulations ${username}! You've completed the quiz! Your score has been recorded!`);
    }
  } catch (error) {
    // Handle specific errors, such as time expiration or leaderboard update failure.
    if (error.code === 'time') {
      await channel.send('Quiz Expired due to inactivity! Please start again!');
      return;
    }
    if (error.message === 'Error updating leaderboard') {
      await channel.send('Sorry there was an error updating the leaderboard! Please try again!');
      return;
    }
  }
}

// Function to start the quiz, ask questions, and calculate the score.
async function startQuiz(channel) {
  // Fetch questions and categorize them by difficulty.
  const questions = await getQuestions();
  const { easyQuestions, mediumQuestions, hardQuestions } = questions;
  // Define scoring rules based on answer speed and difficulty.
  let points = {
    easy: {
      quick: 3,
      slow: 2,
      treshold: 5
    },
    medium: {
      quick: 7,
      slow: 5,
      treshold: 10
    },
    hard: {
      quick: 13,
      slow: 10,
      treshold: 15
    }
  }

  // Initialize quiz variables.
  let score = 0;
  let totalQuestions = 10;
  let currentDifficulty = 1;
  let easyQuestionIndex = 0;
  let mediumQuestionIndex = 0;
  let hardQuestionIndex = 0;
  let currentDifficultyStreak = 0;


  // Main quiz loop to ask questions and manage difficulty progression.
  for (let i = 0; i < totalQuestions; i++) {

     // Logic for asking questions based on current difficulty and processing responses.
    // Includes difficulty adjustment based on consecutive correct answers.
    // (Details of askQuestion, askMCQQuestion functions, and difficulty adjustment logic are omitted for brevity.)

    // Wait for user to type 'next' to proceed with the quiz, or end the quiz on timeout.
    if (currentDifficulty === 1) {
      const question = easyQuestions[easyQuestionIndex];
      const response = await askQuestion(channel, question,'Easy');
        const correctAnswer=(question.answer)?"true":"false";
        if (response!=="not answered" && response.answer === correctAnswer) {
        let currentPoints = 0;
        currentDifficultyStreak++;
        if (response.timeTaken < points.easy.treshold) {
          score += points.easy.quick;
          currentPoints = points.easy.quick;
        } else {
          score += points.easy.slow;
          currentPoints = points.easy.slow;
        }
        channel.send(`Correct! Your time was ${response.timeTaken} seconds. You've earned ${currentPoints} points!`);
        if(currentDifficultyStreak>=2){
          currentDifficulty++;
          currentDifficultyStreak=0;
        }
      } else {
        currentDifficultyStreak = 0;
        if(!response)channel.send('Time is up! ⏰');
        channel.send(`The correct answer is: ${question.answer}`);
      }
      easyQuestionIndex++;
    } else if (currentDifficulty === 2) {

      const question = mediumQuestions[mediumQuestionIndex];
      const response = await askMCQQuestion(channel, question);
      if (response.answer === question.answer) {
        currentDifficultyStreak++;
        let currentPoints = 0;
        if (response.timeTaken < points.medium.treshold) {
          currentPoints = points.medium.quick;
        } else {
          currentPoints = points.medium.slow;
        }
        score+=currentPoints;
        if(currentDifficultyStreak>=2){
          currentDifficulty++;
          currentDifficultyStreak=0;
        }
        channel.send(`Correct! Your time was ${response.timeTaken} seconds. You've earned ${currentPoints} points!`);
      } else {
        if(response)channel.send(`Thats Incorrect!`);
        channel.send(`The correct answer is: ${question.options[question.answer]}`);
        currentDifficultyStreak = 0;
        currentDifficulty = 1;
      }
      mediumQuestionIndex++;
    }else{
      const question = hardQuestions[hardQuestionIndex];
      const response = await askQuestion(channel, question, 'Hard');
      if (response !== "not answered" && response.answer.toLowerCase() === question.answer.toLowerCase()) {
          currentDifficultyStreak++;
          let currentPoints = 0;
          if (response.timeTaken < points.hard.treshold) {
              currentPoints = points.hard.quick;
          } else {
              currentPoints = points.hard.slow;
          }
          if (currentDifficultyStreak > 2) {
            currentPoints += 5; //bonus points for streak
        }
          score += currentPoints;
          channel.send(`Correct! Your time was ${response.timeTaken} seconds. You've earned ${currentPoints} points!`);

      } else {
          channel.send(`The correct answer is: ${question.answer}`);
          currentDifficultyStreak = 0;
          currentDifficulty = 2;
      }
      hardQuestionIndex++;
    }


    if(i===totalQuestions-1){
      return score;
    }


    channel.send(`Your current score is: ${score} Press next to continue to the next question!`);

    const next = await waitForNext(channel);
    if(!next){
      return score;
    }
  }
  return score;
}
// Waits for the user to type 'next' to continue the quiz, handling timeouts.
const waitForNext = async (channel) => {
  try{
    const filter = (response) => response.content.toLowerCase() === 'next';
    const response = await channel.awaitMessages({ filter, max: 1, time: 10000*60*10, errors: ['time'] });
    if(response){
      return true;
    }
  }catch(error){
    if(error.code==='time'){
      await channel.send('Quiz Expired due to inactivity! Please start again!');
      return false;
    }
  }
};

// Asks a question to the user, waits for a reply, and returns the answer and time taken.
const askQuestion = async (channel, question, type) => {
  try {
    // Wait for the question to be sent and capture its message object
    const sentMessage = await channel.send(`>>> 🌟 **Type: ${type}** 🌟

📝 ***${question.problem}***

_Reply with your answer below!_ 🚀`);

    const time = type === 'Easy' ? 15_000 : 30_000;
    const filter = m => !m.author.bot;
    const startTime = sentMessage.createdTimestamp;

    return new Promise((resolve) => {
      const collector = channel.createMessageCollector({ filter, time });

      collector.on('collect', m => {
        const timeTaken = (m.createdTimestamp - startTime) / 1000;
        resolve({ answer: m.content.toLowerCase(), timeTaken });
        collector.stop();
      });

      collector.on('end', (collected, reason) => {
        if (reason === 'time') {
          channel.send('Time is up! ⏰');
          resolve('not answered');
        }
      });
    });
  } catch (error) {
    console.error(error);
    channel.send('Woops! There was an error asking the question. Please try again.');
  }
};

// Asks a multiple-choice question (MCQ) and waits for the user's reaction as an answer.
const askMCQQuestion = async (channel, question) => {
  try {
    const emojis = [":regional_indicator_a:", ":regional_indicator_b:", ":regional_indicator_c:", ":regional_indicator_d:"];
    const emojiNames=['🇦','🇧','🇨','🇩'];
    const message = await channel.send(`>>> 🌟 **Type: Medium** 🌟

📝 ***${question.problem}*** \n\n
${emojis[0]} ${question.options[0]} \n
${emojis[1]} ${question.options[1]} \n
${emojis[2]} ${question.options[2]} \n
${emojis[3]} ${question.options[3]} \n\n
_Reply with your answer below!_ 🚀`,);
    const collectorFilter = (reaction, user) => {
      return !user.bot && ['🇦','🇧','🇨','🇩'].indexOf(reaction._emoji.name)!=-1;
    };
    const questionTimestamp = message.createdTimestamp;
    const result=await promisifyReactionCollector(message,collectorFilter);
    const reaction = result.first();
    if(emojiNames.indexOf(reaction._emoji.name)==-1){
      await channel.send('Invalid emoji');
      return false;
    }
    const userAnswer = emojiNames.indexOf(reaction._emoji.name.toUpperCase());
    const timeTaken = (Date.now() - questionTimestamp) / 1000;
    return { answer: userAnswer, timeTaken };

  } catch (error) {

    if(error==='Times up'){
      await channel.send('Time is up! ⏰');
      return false;
    }

  }
};

// Utility function to handle reaction collection with a promise.
const promisifyReactionCollector = (message, filter) => {
  return new Promise((resolve, reject) => {
    message.awaitReactions({ filter: filter, max: 1, time: 30_000, errors: ['time'] })
    .then(collected => {return resolve(collected)})
    .catch(collected => {
      return reject("Times up");
    });
  });
}






export default conductQuiz;
