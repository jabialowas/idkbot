module.exports = {
  name: "dump",
  description: "clear messages!",

  async execute(message, args) {
    if (!args[0])
      return message.reply(
        "Podaj liczbę wiadomości do usunięcia."
      );
    if (isNaN(args[0])) return message.reply("Podaj liczbę wiadomości do usunięcia.");
    if (args[0] > 100)
      return message.reply("Nie możesz usunąć wiecej niz 100 linijek.");
    if (args[0] < 1)
      return message.reply("Musisz usunąć przynajmniej jedną wiadmość.");

    await message.channel.messages
      .fetch({ limit: args[0] })
      .then((messages) => {
        message.channel.bulkDelete(messages);
      });
  },
};
