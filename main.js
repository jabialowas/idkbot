require("dotenv").config();

const Discord = require("discord.js");
const fs = require("fs");

const client = new Discord.Client({
  allowedMentions: {
    parse: ["users", "roles"],
    repliedUser: true,
  },

  intents: [
    "GUILDS",
    "GUILD_MESSAGES",
    "GUILD_PRESENCES",
    "GUILD_MEMBERS",
    "GUILD_MESSAGE_REACTIONS",
  ],
});

const prefix = ">";

client.commands = new Discord.Collection();
const commandFiles = fs
  .readdirSync("./commands/")
  .filter((file) => file.endsWith(".js"));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.name, command);
}

client.once("ready", () => {
  console.log("Bot rdy!");
});

client.on("message", (message) => {
  if (!message.content.startsWith(prefix) || message.author.bot) return;
  const args = message.content.slice(prefix.length).split(/ +/);
  const command = args.shift().toLowerCase();

  if (command === "help") {
    client.commands.get("help").execute(message, args, Discord);
  } else if (command === "dump") {
    client.commands.get("dump").execute(message, args);
  } else if (command === "play") {
    client.commands.get("play").execute(message, args);
  } else if (command === "stop") {
    client.commands.get("stop").execute(message, args);
  } 
});

client.login(process.env.BOT_TOKEN);
