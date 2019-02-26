const Discord = require("discord.js");

exports.run = async (client, msg, args) => {
  let helpEmbed = new Discord.RichEmbed()
    .setAuthor(client.user.username, client.user.avatarURL)
    .setDescription(`More Updates are coming!`)
    .setColor("#FF0000")
    .setTimestamp()
    .setFooter(
      `MovieBitch by Puyodead1`,
      client.guilds.get("473726968651710464").members.get("213247101314924545")
        .user.avatarURL
    )
    .addField(`Developed by`, "Puyodead1#0001", true)
    .addField(
      `Support Server`,
      "[Discord Server](https://discord.gg/KhgGUwG)",
      true
    )
    .addField(
      `Bug Reporting and Progress tracking`,
      `[Trello](https://trello.com/b/SZHqWTzo/moviebitch-bugs)`,
      true
    )
    .addField(`Bot Version`, require("../package.json").version, true)
    .addField(`Commands`, client.commandNames.join("\n"));
  return msg.channel.send(helpEmbed);
};
