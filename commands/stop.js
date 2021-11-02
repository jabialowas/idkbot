module.exports = {
  name: "stop",
  description: "Stopped music",
  async execute(message, args) {
    const voiceChannel = message.member.voice.channel;

    if (!voiceChannel) return message.channel.send("Dołącz do kanału głosowego aby zatrzymać muzykę");
    await voiceChannel.leave();

  },
};
