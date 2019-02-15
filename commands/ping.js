const Discord = require("discord.js");

exports.run = async (client, msg, args) => {
  const mssg = await msg.channel.send("Thinking....................");
  let embed = new Discord.RichEmbed()
    .setAuthor(client.user.username, client.user.avatarURL)
    .setColor("#FF0000")
    .setTitle("Pong!")
    .setFooter(msg.author.username, msg.author.avatarURL)
    .setTimestamp()
    .addField(
      "Bot Latency",
      `${mssg.createdTimestamp - msg.createdTimestamp}ms`,
      true
    )
    .addField("API Latency", `${Math.round(client.ping)}ms`, true);
  await mssg.edit(embed);
};
