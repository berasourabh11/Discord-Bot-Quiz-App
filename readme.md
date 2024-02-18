# Quizzify

Quizzify is a Discord bot built with Node.js, designed to enhance your Discord server by engaging users in a dynamic quiz experience. With a mix of features tailored to test knowledge, speed, and strategy, Quizzify offers an interactive and competitive environment for all participants.

## Features

- **Time-Limited Questions**: Participants must answer within specific time frames to earn points, encouraging quick thinking and prompt responses.
- **Streak Rewards**: Earn bonuses for consecutive correct answers, rewarding consistent performance and knowledge.
- **Dynamic Difficulty Levels**: The bot adjusts question difficulty based on participants' performance, ensuring a challenging experience for everyone.
- **Leaderboard Access**: Track top scores and compete for a spot on the server's leaderboard, adding a competitive edge.
- **Admin Features**: Server administrators can add, remove, or modify questions, allowing for tailored quiz experiences and fresh challenges.

## How It Works

- **Start the Challenge**: Initiate your quest by typing `!start`. Be quick, as a 10-minute window awaits your command!
- **Face Varied Difficulties**: Encounter Easy, Medium, and Hard questions, each designed to probe different areas of knowledge.
- **Score Points**: Correct answers boost your score, with the possibility of escalating to more challenging questions.
- **Proceed with Care**: After each question, type `!next` to proceed. Remember, inactivity marks the end of your journey.

## Scoring, Time Limits, and Difficulty Dynamics

- **Easy Questions**: Earn 3 points within 5 seconds, or 2 points within 15 seconds.
- **Medium Questions**: Gain 7 points if answered within 10 seconds, or 5 points within 30 seconds.
- **Hard Questions**: Secure 13 points for responses within 15 seconds, or 10 points within 30 seconds.

## Advancement and Setbacks

- **Ascend in Difficulty**: Two consecutive correct answers at your current level advance you to the next difficulty, offering higher point rewards.
- **Penalty for Errors**: Incorrect answers result in a demotion to the previous difficulty level, challenging you to recover.
- **Bonus for Brilliance**: Achieve a streak of correct answers on Hard questions to earn additional points, rewarding your accuracy and speed.

## 🎉 Leaderboard

Dominate the quiz to immortalize your score on the leaderboard. Master the art of rapid and precise answers to ascend as the ultimate quiz champion! 🎉

Ready to showcase your knowledge and reflexes? Type `!start` to embark on your quest for glory and knowledge! 🌠

## Getting Started

These instructions will guide you through setting up Quizzify on your local machine for development and testing purposes.

### Prerequisites

- Node.js (Latest Stable Version)
- npm (comes with Node.js)
- MongoDB (for storing questions, user scores, and configurations)
- A Discord account and a server for testing the bot

### Installing

Follow these steps to get your development environment up and running:

1. **Install Dependencies**
   ```bash
   yarn install ```

