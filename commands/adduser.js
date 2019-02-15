const Discord = require("discord.js"),
  https = require("https"),
  config = require("../config/config.json"),
  utils = require("../util"),
  generator = require("generate-password"),
  fetch = require("node-fetch"),
  Bluebird = require("bluebird");
fetch.Promise = Bluebird;

exports.run = async (client, msg, args) => {
  if (client.admins.indexOf(msg.author.id) > -1) {
    let user = null;
    let startEmbed = new Discord.RichEmbed()
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
        "This wizard will take you through adding a new Ombi user. Do you want to continue?"
      );

    await msg.channel.send(startEmbed);

    const collected1 = await msg.channel.awaitMessages(
        m => m.author.id === msg.author.id,
        { max: 1, time: 30000 }
      ),
      content1 = collected1.first().content;
    if (content1.toLowerCase() === "yes") {
      let usernameEmbed = new Discord.RichEmbed()
        .setAuthor(client.user.username, client.user.avatarURL)
        .setColor("#FF0000")
        .setTimestamp()
        .setFooter(
          `MovieBitch by Puyodead1`,
          client.guilds
            .get("538808292722475019")
            .members.get("213247101314924545").user.avatarURL
        )
        .setDescription("What is the username for the account?");

      await msg.channel.send(usernameEmbed);

      //continue to get username
      const usernameCollector = await msg.channel.awaitMessages(
          m => m.author.id === msg.author.id,
          { max: 1, time: 30000 }
        ),
        username = usernameCollector.first().content;

      if (username.toLowerCase() === "cancel") {
        return msg.channel.send("Cancelled");
      } else {
        let settingsEmbed = new Discord.RichEmbed()
          .setAuthor(client.user.username, client.user.avatarURL)
          .setColor("#FF0000")
          .setTimestamp()
          .setFooter(
            `MovieBitch by Puyodead1`,
            client.guilds
              .get("538808292722475019")
              .members.get("213247101314924545").user.avatarURL
          )
          .setDescription("New User Settings")
          .addField("Username", username);
        //we set the first setting and show it.
        await msg.channel.send(settingsEmbed);

        let emailEmbed = new Discord.RichEmbed()
          .setAuthor(client.user.username, client.user.avatarURL)
          .setColor("#FF0000")
          .setTimestamp()
          .setFooter(
            `MovieBitch by Puyodead1`,
            client.guilds
              .get("538808292722475019")
              .members.get("213247101314924545").user.avatarURL
          )
          .setDescription("Enter the email for the account");
        await msg.channel.send(emailEmbed);
        //email collector
        const emailCollector = await msg.channel.awaitMessages(
            m => m.author.id === msg.author.id,
            { max: 1, time: 30000 }
          ),
          email = emailCollector.first().content;
        await settingsEmbed.addField(`Email`, email);
        await msg.channel.send(settingsEmbed);

        //gererate password
        const password = await generator.generate({
          length: 28,
          numbers: true,
          symbols: true,
          uppercase: true
        });
        let settingsEmbedFull = new Discord.RichEmbed()
          .setAuthor(client.user.username, client.user.avatarURL)
          .setColor("#FF0000")
          .setTimestamp()
          .setFooter(
            `MovieBitch by Puyodead1`,
            client.guilds
              .get("538808292722475019")
              .members.get("213247101314924545").user.avatarURL
          )
          .addField("Username", username)
          .addField("Email", email)
          .addField("Password", password);

        await settingsEmbed.addField("Password", "Auto Generated");
        let userEmbed = new Discord.RichEmbed()
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
            "Who is this account for? Mention the user or use a user ID. Otherwise type 'me'"
          );
        await msg.channel.send(userEmbed);

        let userCollector = await msg.channel.awaitMessages(
          m => m.author.id === msg.author.id,
          { max: 1, time: 30000 }
        );

        user = userCollector.first();

        if (user.mentions.users.first()) {
          user = user.mentions.users.first();
          await settingsEmbed.addField("User", user.username);
          await msg.channel.send(settingsEmbed);
        } else if (user.content.toLowerCase() === "me") {
          user = msg.author;
          await settingsEmbed.addField("User", user.username);
          await msg.channel.send(settingsEmbed);
        } else {
          user = await client.fetchUser(user.content);
          await settingsEmbed.addField("User", user.username);
          await msg.channel.send(settingsEmbed);
        }
        let wizardDoneEmbed = new Discord.RichEmbed()
          .setAuthor(client.user.username, client.user.avatarURL)
          .setColor("#FF0000")
          .setTimestamp()
          .setFooter(
            `MovieBitch by Puyodead1`,
            client.guilds
              .get("538808292722475019")
              .members.get("213247101314924545").user.avatarURL
          )
          .setDescription("Wizard Complete. Creating User...");
        await msg.channel.send(wizardDoneEmbed);

        //start post
        let body = {
          id: user.id,
          userName: username,
          alias: username,
          claims: [
            {
              value: "Requesttv",
              enabled: true
            },
            {
              value: "Requestmovie",
              enabled: true
            },
            {
              value: "Requestmusic",
              enabled: true
            },
            {
              value: "Autoapprovemusic",
              enabled: true
            },
            {
              value: "Requestmusic",
              enabled: true
            },
            {
              value: "Manageownrequests",
              enabled: true
            }
          ],
          emailAddress: email,
          password: password,
          userType: "LocalUser"
        };
        await fetch("https://server101.andy10gbit.org/ombi/api/v1/Identity", {
          method: "post",
          body: JSON.stringify(body),
          headers: {
            accept: "application/json",
            "Content-Type": "application/json",
            ApiKey: config.OMBI_APIKEY,
            "User-Agent": `MovieBitch/1.0`
          }
        })
          .then(res => res.json())
          .then(async json => {
            const successEmbed = new Discord.RichEmbed()
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
                `Successfully created user ${username}! I have sent ${
                  user.username
                } the information.`
              );
            try {
              await user.send(settingsEmbedFull);
            } catch (err) {
              // cant dm
              await msg.author.send(settingsEmbedFull);
              const errorDMEmbed = new Discord.RichEmbed()
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
                  `Failed to send the information to ${
                    user.username
                  }. I have sent it to ${msg.author.username}`
                );
              await msg.channel.send(errorDMEmbed);
            }
            await msg.channel.send(successEmbed);

            try {
              msg.channel.bulkDelete(14);
            } catch (err) {
              console.log(err);
            }
          });
      }
    } else {
      return msg.channel.send("Cancelled");
    }
  } else {
    // They cant
    return utils.noPerm(msg);
  }
};
