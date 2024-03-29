module.exports = (Discord, client, message) => {
    const prefix = '>';

    if(!message.content.startsWith(prefix) || message.author.bot) return;

    const args = message.content.slice(prefix.length).split(/ +/);
    const cmd = args.shift().toLowerCase();

    const command = client.commands.get(cmd) || client.commands.find(temp => temp.aliases && temp.aliases.includes(cmd));
    if(command) command.execute(message, args, cmd, client, Discord)
}