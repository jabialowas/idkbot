module.exports = {
  name: "papajowa",
  description: "ile do papajowej",
  execute(message, args, cmd, client, Discord) {
    const countDownDate = new Date()
    countDownDate.setHours(21,37,0,0)
    countDownDate.getTime();
    const today = countDownDate.getDate();
  
      // Get today's date and time
      const now = new Date().getTime();
      // Find the distance between now and the count down date
      const distance = countDownDate - now;
      if(distance < 0){
        countDownDate.setDate(today + 1);
      } 
  
      // Time calculations for days, hours, minutes and seconds
      const days = Math.floor((countDownDate - now) / (1000 * 60 * 60 * 24));
      const hours = Math.floor(((countDownDate - now) % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor(((countDownDate - now) % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor(((countDownDate - now) % (1000 * 60)) / 1000);
    

    message.channel.send(`Do papajowej jest jeszcze: ${hours}h ${minutes}m ${seconds}s`);
  },
};
