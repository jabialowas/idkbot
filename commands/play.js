const ytdl = require("ytdl-core");
const ytSearch = require("ytsr");
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

module.exports = {
  name: "play",
  description: "Music from yt",
  async execute(message, args) {
    const voiceChannel = message.member.voice.channel;
    const permissions = voiceChannel.permissionsFor(message.client.user);

    if (!voiceChannel)
      return message.channel.send(
        "Dołącz do kanału głosowego przed wezwaniem bota"
      );
    if (!permissions.has("CONNECT"))
      return message.channel.send("Nie posiadasz uprawnień");
    if (!permissions.has("SPEAK"))
      return message.channel.send("Nie posiadasz uprawnień");
    if (!args.length) return message.channel.send("Brak argumentu");

    //Checking if argument is valid url
    const urlValid = (str) => {
      const regExpression =
        /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/;
      if (regExpression.test(str)) {
        return true;
      } else {
        return false;
      }
    };

    if (urlValid(args[0])) {
      const connection = await voiceChannel.join();
      const stream = ytdl(args[0], { filter: "audioonly" });
      connection.play(stream, { seek: 0, volume: 1 }).on("finish", () => {
        voiceChannel.leave();
      });

      fetch(`https://noembed.com/embed?url=${args[0]}&format=json`, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      })
        .then((response) => response.json())
        .then((data) => message.reply(`🤢${data.title}`));

      return;
    }

    const connection = await voiceChannel.join();
    const videoFinder = async (query) => {
      const videoResult = await ytSearch(query);
      return videoResult.items.length > 1 ? videoResult.items[0] : null;
    };
    const video = await videoFinder(args.join(""));
    if (video) {
      const stream = ytdl(video.url, { filter: "audioonly" });
      connection.play(stream, { seek: 0, volume: 1 }).on("finish", () => {
        voiceChannel.leave();
      });
      await message.reply(`🤢${video.title}`);
    } else {
      message.channel.reply("Nie znaleziono muzyki.");
    }
  },
};
