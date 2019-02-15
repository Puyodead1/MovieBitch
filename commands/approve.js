const Discord = require("discord.js"),
  config = require("../config/config.json"),
  https = require("https"),
  Approvers = require("../models/Approvers"),
  fetch = require("node-fetch"),
  Bluebird = require("bluebird");
fetch.Promise = Bluebird;

exports.run = async (client, msg, args) => {
  let access = false;
  //Check for patreon
  await client.guilds.get("538808292722475019").members.forEach(async m => {
    await msg.guild.members.forEach(async m1 => {
      if (m.id === m1.id && m.roles.has("545413502668636191")) {
        //Access granted
        access = true;

        let embed = new Discord.RichEmbed()
          .setAuthor(client.user.username, client.user.avatarURL)
          .setColor("#FF0000")
          .setTimestamp()
          .setFooter(
            `MovieBitch by Puyodead1`,
            client.guilds
              .get("538808292722475019")
              .members.get("213247101314924545").user.avatarURL
          );
        let record = await Approvers.findOne({
          guildID: msg.guild.id,
          userID: msg.author.id
        });

        if (!record) {
          return msg.channel.send("You are not an approver!");
        }
        if (!record.isEnabled) {
          return msg.channel.send("Your Approval Permissions were revoked!");
        }
        // Authorized to approve
        if (args.length === 0 || args.length === 1) {
          let invalidSyntaxEmbed = embed
            .setDescription("Invalid Syntax")
            .addField("Usage", "o!approve <type> <show or movie id>", true)
            .addField("Valid Types", "Movie and TV", true);
          return msg.channel.send(invalidSyntaxEmbed);
        }
        let type = args[0].toLowerCase();
        if (!type === "movie" || !type === "tv") {
          let invalidTypeEmbed = embed
            .setDescription("Invalid Type")
            .addField("Usage", "o!approve <type> <show or movie id>", true)
            .addField("Valid Types", "Movie and TV", true);
          return msg.channel.send(invalidTypeEmbed);
        }
        const id = args.slice(1);
        if (isNaN(id)) {
          return msg.channel.send("Please enter a valid ID");
        }
        if (type === "movie") {
          //get confirmation
          const confirmEmbed = new Discord.RichEmbed()
            .setAuthor(client.user.username, client.user.avatarURL)
            .setColor("#FF0000")
            .setTimestamp()
            .setFooter(
              `MovieBitch by Puyodead1`,
              client.guilds
                .get("538808292722475019")
                .members.get("213247101314924545").user.avatarURL
            )
            .setDescription("Are you sure you want to approve this title?");
          //we set the first setting and show it.
          await msg.channel.send(confirmEmbed);
          const collected1 = await msg.channel.awaitMessages(
              m => m.author.id === msg.author.id,
              { max: 1, time: 30000 }
            ),
            content1 = collected1.first().content;

          if (content1.toLowerCase() === "yes") {
            //Post Request

            const body = { id: Number(args[1]) };

            await fetch(
              "https://server101.andy10gbit.org/ombi/api/v1/Request/movie/approve",
              {
                method: "post",
                body: JSON.stringify(body),
                headers: {
                  accept: "application/json",
                  "Content-Type": "application/json",
                  ApiKey: config.OMBI_APIKEY
                }
              }
            )
              .then(res => res.json())
              .then(async json => {
                if (json.isError) {
                  return msg.channel.send(json.errorMessage);
                }

                let successEmbed = new Discord.RichEmbed()
                  .setAuthor(client.user.username, client.user.avatarURL)
                  .setColor("#FF0000")
                  .setTimestamp()
                  .setFooter(
                    `MovieBitch by Puyodead1`,
                    client.guilds
                      .get("538808292722475019")
                      .members.get("213247101314924545").user.avatarURL
                  )
                  .setDescription(
                    `Successfully approved title with id ${Number(args[1])}!`
                  );
                return msg.channel.send(successEmbed);
              });
          } else {
            return msg.channel.send("Cancelled Approval!");
          }
        } else {
          // TV
          //get confirmation
          const confirmEmbed = new Discord.RichEmbed()
            .setAuthor(client.user.username, client.user.avatarURL)
            .setColor("#FF0000")
            .setTimestamp()
            .setFooter(
              `MovieBitch by Puyodead1`,
              client.guilds
                .get("538808292722475019")
                .members.get("213247101314924545").user.avatarURL
            )
            .setDescription("Are you sure you want to approve this title?");
          //we set the first setting and show it.
          await msg.channel.send(confirmEmbed);
          const collected3 = await msg.channel.awaitMessages(
              m => m.author.id === msg.author.id,
              { max: 1, time: 30000 }
            ),
            content3 = collected3.first().content;

          if (content3.toLowerCase() === "yes") {
            //Post Request
            const body = { id: Number(args[1]) };
            await fetch(
              "https://server101.andy10gbit.org/ombi/api/v1/Request/tv/approve",
              {
                method: "post",
                body: JSON.stringify(body),
                headers: {
                  accept: "application/json",
                  "Content-Type": "application/json",
                  ApiKey: config.OMBI_APIKEY
                }
              }
            )
              .then(res => res.json())
              .then(async json => {
                if (json.isError) {
                  return msg.channel.send(json.errorMessage);
                }

                let successEmbed = new Discord.RichEmbed()
                  .setAuthor(client.user.username, client.user.avatarURL)
                  .setColor("#FF0000")
                  .setTimestamp()
                  .setFooter(
                    `MovieBitch by Puyodead1`,
                    client.guilds
                      .get("538808292722475019")
                      .members.get("213247101314924545").user.avatarURL
                  )
                  .setDescription(
                    `Successfully approved title with id ${Number(args[1])}!`
                  );
                return msg.channel.send(successEmbed);
              });
          }
        }
      }
    });
  });
  if (!access) {
    return msg.channel.send(
      new Discord.RichEmbed()
        .setAuthor(client.user.username, client.user.avatarURL)
        .setDescription(
          ":no_entry_sign: Sorry, That is a Patreon Only Command!\nhttps://www.patreon.com/Puyodead1"
        )
        .setColor("#FF0000")
        .setTimestamp()
        .setFooter(
          `MovieBitch by Puyodead1`,
          client.guilds
            .get("538808292722475019")
            .members.get("213247101314924545").user.avatarURL
        )
    );
  }
};
