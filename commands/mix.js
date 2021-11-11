const Discord = require("discord.js");
const fs = require("fs");
const ytdl = require("ytdl-core");
const ytSearch = require("ytsr");
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));
let playlists;
module.exports = {
  name: "mixadd",
  aliases: ["mixdelete", "showmix", "mixcreate", "mixlist"],
  description: "Playlist music",

  async execute(message, args, cmd, client, Discord) {
    const voiceChannel = message.member.voice.channel;
    fs.stat("./playlists/playlists.json", function(err, stat) {
    if(err == null) {
      playlists = JSON.parse(fs.readFileSync("./playlists/playlists.json"));
     
    } else {
      message.channel.send("Brak pliku z playlistami. Tworzenie pliku. Wpisz polecenie ponownie.");
      fs.writeFile("./playlists/playlists.json", "[]", function (err) {
        if (err) {
          return console.log(err);
        }
        console.log("The file was saved!");
      });
    }
});
    
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

    
    if (cmd === "mixadd") {
      if (!args.length) return message.channel.send("Musisz podać nazwe mixu.");
    const shiftedURL = args[1];
      console.log("args", args, "shifted", shiftedURL);
      let song = {};
      const tempPlaylists = playlists;
      //if arg is url get song info from url

      if (ytdl.validateURL(args[1])) {
        const songInfo = await ytdl.getInfo(args[1]);
        song = {
          title: songInfo.videoDetails.title,
          url: songInfo.videoDetails.video_url,
        };
        if (song.title !== undefined || song.url !== undefined) {
          tempPlaylists.forEach((playlistItem) => {
            if (playlistItem.name === args[0]) {
              playlistItem.items.push(song);
            }
          });
          fs.writeFile(
            "./playlists/playlists.json",
            JSON.stringify(tempPlaylists),
            (error) => {
              if (error) throw error;
            }
          );
        }
      }
    } else if (cmd === "mixcreate") {
      if (!args.length) return message.channel.send("Musisz podać nazwe mixu.");
      const newMixName = args[0];
      const playlists = JSON.parse(
        fs.readFileSync("./playlists/playlists.json")
      );
      const tempPlaylists = playlists;
      const newMixObj = {
        name: newMixName,
        items: [{}],
      };

      if (tempPlaylists.some((e) => e.name === newMixName)) {
        return message.channel.send("Podany mix już istnieje!");
      } else {
        tempPlaylists.push(newMixObj);
        fs.writeFileSync(
          "./playlists/playlists.json",
          JSON.stringify(tempPlaylists),
          (error) => {
            if (error) throw error;
          }
        );
      }
    } else if (cmd === "mixlist") {
      if (!args.length) return message.channel.send("Musisz podać nazwe mixu.");
      const playlists = JSON.parse(
        fs.readFileSync("./playlists/playlists.json")
      );
      if (playlists.some((e) => e.name === args[0])) {
        const selectedPlaylist = playlists.find(e => e.name === args[0])
        console.log(selectedPlaylist)
        const newEmbed = new Discord.MessageEmbed()
          .setColor("#424632")
          .setTitle(selectedPlaylist.name);
        selectedPlaylist.items.forEach((playlistItem, index) => {
            newEmbed.addFields({ name: index + 1, value: playlistItem.title });
        });
        return message.channel.send(newEmbed);
      }
     }else if (cmd === "showmix") {
      const playlists = JSON.parse(
        fs.readFileSync("./playlists/playlists.json")
      );
        const newEmbed = new Discord.MessageEmbed()
          .setColor("#424632")
          .setTitle("Wszystkie mixy");
       playlists.forEach((playlistItem, index) => {
             newEmbed.addFields({ name: index + 1, value: playlistItem.name });
        });
        return message.channel.send(newEmbed);
      }
    
  },
};
