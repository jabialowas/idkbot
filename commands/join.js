module.exports = {
    name: "join",
    description: "Connect bot to channel",
    execute(message, args, cmd, client, Discord) {

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
      
        if(client.voice.connections.size === 0){
     voiceChannel.join();
    }  
     else if ((JSON.parse(JSON.stringify(client.voice.connections))[0].channel !== message.member.voice.channel.id)){
        voiceChannel.join();
     } else {
         return
     }
     }
  };
  