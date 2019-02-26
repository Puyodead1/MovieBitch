const Discord = require("discord.js"),
  config = require("../config/config.json"),
  utils = require("../util"),
  Bluebird = require("bluebird"),
  fetch = require("node-fetch");
fetch.Promise = Bluebird;

exports.run = async (client, msg, args) => {
  if (client.admins.indexOf(msg.author.id) > -1) {
    await fetch("https://server101.andy10gbit.org/ombi/api/v1/Request/tv/", {
      method: "get",
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
        ApiKey: config.OMBI_APIKEY,
        "User-Agent": `MovieBitch/1.0`
      }
    })
      .then(res => res.json())
      .then(async json => {
        let PendingAmountEmbed = new Discord.RichEmbed()
          .setAuthor(client.user.username, client.user.avatarURL)
          .setColor("#FF0000")
          .setTimestamp()
          .setFooter(
            `MovieBitch by Puyodead1`,
            client.guilds
              .get("473726968651710464")
              .members.get("213247101314924545").user.avatarURL
          )
          .setDescription(`Pending Requests`)
          .addField(`Amount`, json.length);
        await msg.channel.send(PendingAmountEmbed);

        for (var i = 0; i < json.length; i++) {
          let RequestEmbed = new Discord.RichEmbed()
            .setAuthor(client.user.username, client.user.avatarURL)
            .setColor("#FF0000")
            .setTimestamp()
            .setFooter(
              `MovieBitch by Puyodead1`,
              client.guilds
                .get("473726968651710464")
                .members.get("213247101314924545").user.avatarURL
            )
            .setDescription(`Current Pending Requests Number ${i + 1}`)
            .addField("Title", json[i].title, true)
            .setImage(json[i].posterPath, true)
            .addField("Request ID", json[i].id, true)
            .addField(`Approved`, json[i].childRequests[0].approved, true)
            .addField(`Available`, json[i].childRequests[0].available, true)
            .addField(
              `Requester`,
              json[i].childRequests[0].requestedUser.userName,
              true
            )
            .addField(`Approvable`, json[i].childRequests[0].canApprove, true);
          await msg.channel.send(RequestEmbed);
        }
      });
  } else {
    return utils.noPerm(msg);
  }
};
