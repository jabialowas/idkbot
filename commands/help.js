module.exports = {
  name: "help",
  description: "Help command",
  execute(message, args, Discord) {
    const newEmbed = new Discord.MessageEmbed()
      .setColor("#424632")
      .setTitle("Help")
      .setURL("https://google.com")
      .setDescription("Help description")
      .addFields({
        name: "F1",
        value: "v1",
      })
      .setImage(
        "https://cdn.discordapp.com/attachments/148516651321524224/904897738733408296/199762772_4042364775857348_9000992517974619960_n.png"
      )
      .setFooter("F1");
    message.channel.send(newEmbed);
  },
};
