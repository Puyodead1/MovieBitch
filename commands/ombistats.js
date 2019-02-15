const Discord = require("discord.js"),
  config = require("../config/config.json"),
  utils = require("../util");

exports.run = async (client, msg, args) => {
  let embed = new Discord.RichEmbed()
    .setAuthor(client.user.username, client.user.avatarURL)
    .setColor("#FF0000")
    .setTimestamp()
    .setFooter(
      `MovieBitch by Puyodead1`,
      client.guilds.get("538808292722475019").members.get("213247101314924545")
        .user.avatarURL
    );
  await utils
    .get({
      headers: {
        accept: "application/json",
        ApiKey: config.OMBI_APIKEY
      },
      url: `${config.OMBI_FULLURL}/ombi/api/v1/Status`
    })
    .then(async resolve => {
      const data = JSON.parse(resolve.body);
      let statusEmbed = embed
        .setDescription("Current Ombi Status")
        .addField("Status Code", data, true);

      if (data === 200) {
        statusEmbed.addField("Meaning", "OK", true);
      }
      return msg.channel.send(statusEmbed);
    })
    .catch(async err => {
      await msg.channel.send("Error 96. Cancelled");
      return console.log(`[Error 97] ${err}`);
    });
};
