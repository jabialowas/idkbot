const ytdl = require("ytdl-core");
const ytSearch = require("ytsr");

module.exports = {
  name: "play",
  description: "Music from yt",
  async execute(message, args) {
    const voiceChannel = message.member.voice.channel;
    
    const permissions = voiceChannel.permissionsFor(message.client.user);
    if (!voiceChannel) return message.channel.send("Dołącz do kanału głosowego przed wezwaniem bota");
    
    if (!permissions.has("CONNECT"))
      return message.channel.send("Nie posiadasz uprawnień");
    if (!permissions.has("SPEAK"))
      return message.channel.send("Nie posiadasz uprawnień");
    if (!args.length) return message.channel.send("Brak argumentu");

    const connection = await voiceChannel.join();

    const videoFinder = async (query) => {
      const videoResult = await ytSearch(query);
      return (videoResult.items.length > 1) ? videoResult.items[0] : null;
    }
    const video = await videoFinder(args.join(''))
    if(video) {
      const stream = ytdl(video.url, {filter: 'audioonly'});
      console.log('===================================')
      console.log(video)
      connection.play(stream, {seek:0, volume: 1})
      .on('finish',() => {
        voiceChannel.leave();
      })
      await message.reply(`🤢&${video.title}`)
    } else { 
      message.channel.reply("Nie znaleziono muzyki.")
  }
  },
};
