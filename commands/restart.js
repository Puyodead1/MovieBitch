const Discord = require("discord.js"),
  util = require("../util"),
  config = require("../config/config.json");

exports.run = async (client, msg, args) => {
  if (msg.author.id === "213247101314924545") {
    let loading = msg.guild.emojis.get("550140165297799178");
    let success = msg.guild.emojis.get("550140686440071188");

    let embed = new Discord.RichEmbed()
      .setAuthor(client.user.username, client.user.avatarURL)
      .setColor("#FF0000")
      .setDescription(`${loading} Reboot in progress! Please wait....`);

    let successEmbed = new Discord.RichEmbed()
      .setAuthor(client.user.username, client.user.avatarURL)
      .setColor("#FF0000")
      .setDescription(`${success} Reboot Success!`);
    let mssg = await msg.channel.send(embed);
    return client
      .destroy()
      .then(async () => {
        await client.login(config.TOKEN);
      })
      .then(async () => {
        await mssg.edit(successEmbed);
      });
  } else {
    return util.noPerm(msg);
  }
};
