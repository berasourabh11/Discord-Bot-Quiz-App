// Import necessary modules from discord.js, the environment variables handler, database connection function,
// the quiz conducting function, quiz messages, and the leaderboard model.
import { ChannelType, Client, GatewayIntentBits } from "discord.js";
import dotenv from "dotenv";
import { connectdb } from "./db/dbconnect.js";
import conductQuiz from "./services/conductQuiz.js";
import { initialQuizMessagePart1, initialQuizMessagePart2 } from "./data/quizmessge.js";
import Leaderboard from "./db/models/leaderboard.js";
import adminActions from "./services/adminActions.js";

dotenv.config();

// Create a new Discord client with specific intents to listen to guilds, messages, message content, and reactions.
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions,
  ],
});

// Log in the Discord bot using the token from the .env file.
client.login(process.env.BOT_TOKEN);

// Event listener for when the bot is ready and logged in.
client.on("ready", async () => {
  await connectdb(); // Connect to the database.
  console.log(`Logged in as ${client.user.tag}!`); // Log the bot's tag to the console.
});

// admin actions
const type=["!edit","!add","!remove","!view"];
client.on("messageCreate", async (message) => {
  if(message.channelId == "1208652273224388671" && type.includes(message.content)){
    const channel=client.channels.cache.get("1208652273224388671");
    const userId=message.author.id;
    adminActions(message.content,channel,userId);
  }
});







// Event listener for new messages.
client.on("messageCreate", async (message) => {
  if (message.author.bot) return; // Ignore messages from bots.
  if (message.content.toLowerCase() === '!leaderboard') {
    // Fetch the top 10 leaderboard entries sorted by score in descending order.
    const leaderboard = await Leaderboard.find({}).sort({ score: -1 }).limit(10);
    let leaderboardString = '🏆 **Leaderboard** 🏆 \n\n';
    leaderboardString += leaderboard.map((entry, index) => `${index + 1}. ${entry.name} - ${entry.score}`).join('\n');
    message.channel.send(">>> " + leaderboardString);
  }
});

// Event listener for interactions with the bot, such as slash commands.
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return; // Ignore non-command interactions.
  const { commandName } = interaction;
  if (commandName === "ping") {
    interaction.reply("Pong!"); // Simple ping-pong command for testing.
  }

  if (commandName === 'quiz') {
    // Handle the quiz command, create a dedicated channel for the quiz, and start the quiz.
    const channel = await handleQuizCommand(interaction);
    channel.send(initialQuizMessagePart1);
    channel.send(initialQuizMessagePart2);
    await conductQuiz(channel);
  }
});

// Function to handle the quiz command: creates a private text channel for the quiz.
async function handleQuizCommand(interaction) {
  const guild = interaction.guild;
  const member = interaction.member;

  try {
    // Create a new private text channel named after the user with specific permissions.
    const channel = await guild.channels.create({
      name: `quiz-${member.user.username}`,
      type: ChannelType.GuildText,
      permissionOverwrites: [
        {
          id: guild.id, // Deny view access to everyone in the guild.
          deny: ['ViewChannel'],
        },
        {
          id: member.id, // Allow the initiating member to view the channel.
          allow: ['ViewChannel'],
        },
        {
          id: client.user.id, // Allow the bot itself to view the channel.
          allow: ['ViewChannel'],
        },
      ],
    });

    // Reply to the interaction indicating the channel has been created.
    await interaction.reply({ content: `Quiz channel created: ${channel}`, ephemeral: true });
    return channel; // Return the newly created channel.
  } catch (error) {
    console.error(error);
    await interaction.reply({ content: 'There was an error creating the quiz channel.', ephemeral: true });
  }
}
