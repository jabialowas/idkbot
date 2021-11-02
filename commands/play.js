const Discord = require("discord.js");
const ytdl = require("ytdl-core");
const ytSearch = require("ytsr");

const queue = new Map();

module.exports = {
  name: "play",
  aliases: ["skip", "stop", "queue"],
  description: "Music bot",

  async execute(message, args, cmd, client, Discord) {
    const voiceChannel = message.member.voice.channel;
    //checking sender permissions
    const permissions = voiceChannel.permissionsFor(message.client.user);
    if (!voiceChannel)
      return message.channel.send(
        "Dołącz do kanału głosowego przed wezwaniem bota"
      );
    if (!permissions.has("CONNECT"))
      return message.channel.send("Nie posiadasz uprawnień");
    if (!permissions.has("SPEAK"))
      return message.channel.send("Nie posiadasz uprawnień");

    const serverQueue = queue.get(message.guild.id);

    if (cmd === "play") {
      if (!args.length)
        return message.channel.send("Musisz podać link/nazwe piosenki.");
      let song = {};

      if (ytdl.validateURL(args[0])) {
        const songInfo = await ytdl.getInfo(args[0]);
        song = {
          title: songInfo.videoDetails.title,
          artist: songInfo.videoDetails.author,
          url: songInfo.videoDetails.video_url,
          duration: songInfo.videoDetails.lengthSeconds,
        };
      } else {
        const songFinder = async (query) => {
          const songResult = await ytSearch(query);
          return songResult.items.length > 1 ? songResult.items[0] : null;
        };
        const fetchedSong = await songFinder(args.join(" "));
        if (fetchedSong) {
          song = {
            title: fetchedSong.title,
            artist: fetchedSong.artist,
            url: fetchedSong.url,
            duration: fetchedSong.duration,
          };
        } else {
          message.channel.send("Nie można znaleźć piosenki");
        }
      }
      if (!serverQueue) {
        const queueConstructor = {
          voiceChannel: voiceChannel,
          textChannel: message.channel,
          connection: null,
          songs: [],
        };

        queue.set(message.guild.id, queueConstructor);
        queueConstructor.songs.push(song);

        try {
          const connection = await voiceChannel.join();
          queueConstructor.connection = connection;
          songPlayer(message.guild, queueConstructor.songs[0]);
        } catch (err) {
          queue.delete(message.guild.id);
          message.channel.send("Problem z połączeniem bota");
          throw err;
        }
      } else {
        serverQueue.songs.push(song);
        return message.channel.send(`***${song.title}*** - dodane do kolejki`);
      }
    } else if (cmd === "stop") stopSong(message, serverQueue);
    else if (cmd === "skip") skipSong(message, serverQueue);
    else if (cmd === "queue") printQueue(message, serverQueue);
  },
};

const songPlayer = async (guild, song) => {
  const songQueue = queue.get(guild.id);
  if (!song) {
    songQueue.voiceChannel.leave();
    queue.delete(guild.id);
    return;
  }

  const stream = ytdl(song.url, { filter: "audioonly" });
  songQueue.connection
    .play(stream, { seek: 0, volume: 0.5 })
    .on("finish", () => {
      songQueue.songs.shift();
      songPlayer(guild, songQueue.songs[0]);
    });
};

const skipSong = (message, serverQueue) => {
  if (!message.member.voice.channel)
    return message.channel.send("Musisz być na kanale, żeby skipować piosenki");
  if (!serverQueue) {
    return message.channel.send("Kolejna piosenek jest pusta");
  }
  serverQueue.connection.dispatcher.end();
};

const stopSong = (message, serverQueue) => {
  if (!message.member.voice.channel)
    return message.channel.send("Musisz być na kanale, żeby zastopować bota");
  serverQueue.songs = [];
  serverQueue.connection.dispatcher.end();
};

const printQueue = (message, serverQueue) => {
  if (!message.member.voice.channel)
    return message.channel.send("Musisz być na kanale, żeby zobaczyć kolejkę");
    if(!serverQueue) return message.channel.send("Kolejka jest pusta.")
  //   serverQueue.songs.forEach(function (song, index) {
  //     message.channel.send(`${index + 1}. ${song.title}`)
      
  // })

  
  const newEmbed = new Discord.MessageEmbed()
      .setColor("#424632")
      .setTitle("Queue")
  
  serverQueue.songs.forEach(function (song, index) {
    newEmbed.addFields( {name: index + 1, value: song.title})
  });
  message.channel.send(newEmbed);
};