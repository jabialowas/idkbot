const Discord = require("discord.js");
const fs = require('fs');
const ytdl = require("ytdl-core");
const ytSearch = require("ytsr");
const ytpl = require("ytpl");
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const playlists = JSON.parse(fs.readFileSync('./playlists/playlists.json'));


const queue = new Map();
let playlistArr = [];

module.exports = {
  
  name: "play",
  aliases: ["skip", "stop", "queue", "naura", "playrandom", "playnext", "mix"],
  description: "Music bot",

  async execute(message, args, cmd, client, Discord) {
    const voiceChannel = message.member.voice.channel;
    //checking sender permissions

    if (!voiceChannel)
      return message.channel.send(
        "Dołącz do kanału głosowego przed użyciem bota"
      );
    const permissions = voiceChannel.permissionsFor(message.client.user);
    if (!permissions.has("CONNECT"))
      return message.channel.send("Nie posiadasz uprawnień");
    if (!permissions.has("SPEAK"))
      return message.channel.send("Nie posiadasz uprawnień");

    const serverQueue = queue.get(message.guild.id);

    if (cmd.startsWith("play")) {
      if (!args.length)
        return message.channel.send("Musisz podać link/nazwe piosenki.");
      let song = {};

      //if arg is url get song info from url
      if (ytdl.validateURL(args[0])) {
        if (args[0].includes("list")) {
          const listID = args[0].split("list=")[1];
          if (ytpl.validateID(listID)) {
            const search = await ytpl(listID, { limit: 50 });
            search.items.forEach((item) => {
              song = {
                title: item.title,
                url: item.shortUrl,
                duration: item.duration,
              };
              playlistArr.push(song);
            });
          }else if (!ytpl.validateID(listID)) {
            message.channel.send("Nie można wrzucać YouTube Mix'ow");
          }
        }  else {
          const songInfo = await ytdl.getInfo(args[0]);
          song = {
            title: songInfo.videoDetails.title,
            artist: songInfo.videoDetails.author,
            url: songInfo.videoDetails.video_url,
            duration: songInfo.videoDetails.lengthSeconds,
          };
        }
      }
      //if arg isn't url then search in yt
      else {
        const songFinder = async (query) => {
          const songResult = await ytSearch(query);
          if (cmd === "playrandom") {
            return songResult.items.length > 1
              ? songResult.items[Math.floor(Math.random() * 20)]
              : null;
          } else
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
          playing: true,
        };
        if (playlistArr.length > 0) {
          queue.set(message.guild.id, queueConstructor);
          queueConstructor.songs = [...queueConstructor.songs, ...playlistArr];
        } else {
          queue.set(message.guild.id, queueConstructor);
          queueConstructor.songs.push(song);
        }

        try {
          const connection = await voiceChannel.join();
          queueConstructor.connection = connection;
          songPlayer(message.guild, queueConstructor.songs[0]);
          message.channel.send(`Gram: ${song.title}`);
        } catch (err) {
          queue.delete(message.guild.id);
          message.channel.send("Problem z połączeniem bota");
          throw err;
        }
      } else {
        if (cmd === "playnext") {
          serverQueue.songs.splice(1, 0, song);
          return message.channel.send(
            `***${song.title}*** - dodane na początek kolejki`
          );
        } else {
          if (playlistArr.length > 0) {
            serverQueue.songs = [...serverQueue.songs, ...playlistArr];
            return message.channel.send(`***Playlista*** dodana do kolejki`);
          } else {
            serverQueue.songs.push(song);
            return message.channel.send(
              `***${song.title}*** - dodane do kolejki`
            );
          }
        }
      }
    } else if (cmd === "stop") stopSong(message, serverQueue);
    else if (cmd === "skip") skipSong(message, serverQueue);
    else if (cmd === "queue") printQueue(message, serverQueue);
    else if (cmd === "naura") deleteQueueItem(message, args, serverQueue);
    else if (cmd === "mix") playPlaylist(message, args, serverQueue);
  },
};

const songPlayer = async (guild, song) => {
  const songQueue = queue.get(guild.id);
  if (!song) {
    songQueue.voiceChannel.leave();
    queue.delete(guild.id);
    return;
  }

  const stream = ytdl(song.url, {
    filter: "audioonly",
    quality: "highest",
    highWaterMark: 1 << 25,
    dlChunkSize: 0,
  });

  const dispatcher = songQueue.connection
    .play(stream, { seek: 0, volume: 1, bitrate: "auto" })
    .on("finish", () => {
      songQueue.songs.shift();
      songPlayer(guild, songQueue.songs[0]);
    });
};

const skipSong = (message, serverQueue) => {
  const songQueue = queue.get(message.guild.id);
  if (!message.member.voice.channel)
    return message.channel.send("Musisz być na kanale, żeby skipować piosenki");
  if (!serverQueue) {
    return message.channel.send("Kolejna piosenek jest pusta");
  }
  if (serverQueue.connection.dispatcher) {
    serverQueue.connection.dispatcher.end();
  } else {
    console.log("Connection was terminated");
    serverQueue.songs.shift();
    songPlayer(message.guild, songQueue.songs[0]);
  }
};

const stopSong = (message, serverQueue) => {
  const songQueue = queue.get(message.guild.id);
  if (!message.member.voice.channel)
    return message.channel.send("Musisz być na kanale, żeby zastopować bota");
  if (!serverQueue) return message.channel.send("Kolejka jest pusta.");
  serverQueue.songs = [];
  songQueue.voiceChannel.leave();
  // serverQueue.connection.dispatcher.end();
};

const printQueue = (message, serverQueue) => {
  if (!message.member.voice.channel)
    return message.channel.send("Musisz być na kanale, żeby zobaczyć kolejkę");
  if (!serverQueue) return message.channel.send("Kolejka jest pusta.");
  const newEmbed = new Discord.MessageEmbed()
    .setColor("#800080")
    .setTitle("Queue");
  serverQueue.songs.forEach(function (song, index) {
    if (index === 0) {
      newEmbed.addFields({ name: "Playing:", value: song.title });
    } else {
      newEmbed.addFields({ name: index + 1, value: song.title });
    }
  });
  message.channel.send(newEmbed);
};

const deleteQueueItem = (message, args, serverQueue) => {
  if (!message.member.voice.channel)
    return message.channel.send(
      "Musisz być na kanale, usunąć piosenkę z kolejki"
    );
  if (!serverQueue) return message.channel.send("Kolejka jest pusta.");
  else if (args[0] > 1 && args[0] <= serverQueue.songs.length) {
    message.channel.send(
      `Została usunięta piosenka: ${serverQueue.songs[args[0] - 1].title}`
    );
    serverQueue.songs.splice(args[0] - 1, 1);
  } else message.channel.send("Zły znacznik piosenki do usunięcia");
};

const playPlaylist = (message, args, serverQueue) => {
  
// let settings = { method: "Get" };
// fetch("playlists/playlists.json", settings)
//     .then(res => res.json())
//     .then((json) => {
//         console.log(JSON.stringify(json))
//     })
console.log(playlists.items[0]);
  }