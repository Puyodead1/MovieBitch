const Discord = require("discord.js");

exports.run = async (client, msg, args) => {
  let inviteEmbed = new Discord.RichEmbed()
    .setAuthor(client.user.username, client.user.avatarURL)
    .setDescription(
      `MovieBitch cannot be added by just anyone, this bot can only be added by the owner (Puyodead1).
    If you would like the bot please contact Puyodead1.`
    )
    .setColor("#FF0000")
    .setTimestamp()
    .setFooter(
      `MovieBitch by Puyodead1`,
      client.guilds.get("538808292722475019").members.get("213247101314924545")
        .user.avatarURL
    );
  return msg.channel.send(inviteEmbed);
};
