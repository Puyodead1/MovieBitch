const Discord = require("discord.js"),
  config = require("../config/config.json"),
  utils = require("../util"),
  Bluebird = require("bluebird"),
  fetch = require("node-fetch");
fetch.Promise = Bluebird;

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

  if (args.length === 0 || args.length === 1) {
    let invalidSyntaxEmbed = embed
      .setDescription("Invalid Syntax")
      .addField("Usage", "o!search <type> <search query>", true)
      .addField("Valid Types", "Movie, Music and TV", true);
    return msg.channel.send(invalidSyntaxEmbed);
  }
  let type = args[0].toLowerCase();
  if (!type === "movie" || !type === "tv") {
    let invalidTypeEmbed = embed
      .setDescription("Invalid Type")
      .addField("Usage", "o!search <type> <search query>", true)
      .addField("Valid Types", "Movie, Music and TV", true);
    return msg.channel.send(invalidTypeEmbed);
  }
  let query = args.slice(1).join("-");

  if (type === "movie") {
    await fetch(`${config.OMBI_FULLURL}/ombi/api/v1/Search/movie/${query}`, {
      method: "get",
      headers: {
        accept: "application/json",
        ApiKey: config.OMBI_APIKEY,
        "User-Agent": `MovieBitch/1.0`
      }
    })
      .then(res => res.json())
      .then(async data => {
        // check if data contains any results
        if (data.length == 0) {
          let notFoundEmbed = embed.setDescription(
            "Couldn't find the Movie you were looking for. Is the name correct?"
          );
          return msg.channel.send(notFoundEmbed);
        }
        let selection = 0;
        if (data.length <= 1) {
          // output data into chat and request the tv show
          return utils.outputMovie(msg, data[selection]).catch(async error => {
            await msg.channel.send("[ERROR] Cancelled command.");
          });
        }

        //More then one result
        // populate results into string for embed
        let fieldContent = "";
        for (let i = 0; i < data.length; i++) {
          fieldContent += `${i + 1}) ${data[i].title}`;
          if (data[i].firstAired) fieldContent += ` (${data[i].firstAired})`;
          fieldContent += "\n";
        }

        // output search results in embed
        let searchEmed = embed
          .setTitle("Ombi Search")
          .setDescription(
            "Please select one of the search results. To abort answer **cancel**"
          )
          .addField("__Search Results__", fieldContent);
        await msg.channel.send(searchEmed);

        // wait for user selection
        await msg.channel
          .awaitMessages(
            m =>
              (!isNaN(parseInt(m.content)) || m.content.startsWith("cancel")) &&
              m.author.id == msg.author.id,
            { max: 1, time: 120000, errors: ["time"] }
          )
          .then(async collected => {
            if (
              collected
                .first()
                .content.toLowerCase()
                .startsWith("cancel")
            )
              return msg.channel.send("Cancelled command.");
            else if (
              parseInt(collected.first().content) >= 1 &&
              parseInt(collected.first().content) <= data.length
            ) {
              selection =
                parseInt(collected.first().content.match(/[1-9]+/)[0]) - 1;

              // output data into chat and request the tv show
              await utils.outputMovie(msg, data[selection]).catch(error => {
                return msg.channel.send("[ERROR] Cancelled command.");
              });
            }
          })
          .catch(collected => {
            console.log(collected);
            return msg.channel.send("[ERROR 112]:Cancelled command.");
          });
      })
      .catch(async err => {
        await msg.channel.send("Error 116. Cancelled");
        return console.log(`[Error 117] ${err}`);
      });
  } else if (type === "tv") {
    await fetch(`${config.OMBI_FULLURL}/ombi/api/v1/Search/tv/${query}`, {
      method: "get",
      headers: {
        accept: "application/json",
        ApiKey: config.OMBI_APIKEY,
        "User-Agent": `MovieBitch/1.0`
      }
    })
      .then(res => res.json())
      .then(async data => {
        // check if data contains any results
        if (data.length == 0) {
          let notFoundEmbed = embed.setDescription(
            "Couldn't find the tv show you were looking for. Is the name correct?"
          );
          return msg.channel.send(notFoundEmbed);
        }
        let selection = 0;
        if (data.length <= 1) {
          // output data into chat and request the tv show
          return utils.outputMovie(msg, data[selection]).catch(async error => {
            await msg.channel.send("[ERROR] Cancelled command.");
          });
        }

        //More then one result
        // populate results into string for embed
        let fieldContent = "";
        for (let i = 0; i < data.length; i++) {
          fieldContent += `${i + 1}) ${data[i].title}`;
          if (data[i].firstAired) fieldContent += ` (${data[i].firstAired})`;
          fieldContent += "\n";
        }

        // output search results in embed
        let searchEmed = embed
          .setTitle("Ombi Search")
          .setDescription(
            "Please select one of the search results. To abort answer **cancel**"
          )
          .addField("__Search Results__", fieldContent);
        await msg.channel.send(searchEmed);

        // wait for user selection
        await msg.channel
          .awaitMessages(
            m =>
              (!isNaN(parseInt(m.content)) || m.content.startsWith("cancel")) &&
              m.author.id == msg.author.id,
            { max: 1, time: 120000, errors: ["time"] }
          )
          .then(async collected => {
            if (
              collected
                .first()
                .content.toLowerCase()
                .startsWith("cancel")
            )
              return msg.channel.send("Cancelled command.");
            else if (
              parseInt(collected.first().content) >= 1 &&
              parseInt(collected.first().content) <= data.length
            ) {
              selection =
                parseInt(collected.first().content.match(/[1-9]+/)[0]) - 1;

              // output data into chat and request the tv show
              await utils.outputMovie(msg, data[selection]).catch(error => {
                return msg.channel.send("[ERROR] Cancelled command.");
              });
            }
          })
          .catch(collected => {
            console.log(collected);
            return msg.channel.send("[ERROR 195]:Cancelled command.");
          });
      })
      .catch(async err => {
        await msg.channel.send("Error 199. Cancelled");
        return console.log(`[Error 200] ${err}`);
      });
  } else if (type === "music") {
    await fetch(
      `https://server101.andy10gbit.org/ombi/api/v1/request/music/search/${query}`,
      {
        method: "get",
        headers: {
          accept: "application/json",
          "Content-Type": "application/json",
          ApiKey: config.OMBI_APIKEY
        }
      }
    )
      .then(res => res.json())
      .then(async json => {
        // check if data contains any results
        if (json.length == 0) {
          let notFoundEmbed = embed.setDescription(
            "Couldn't find the album you were looking for. Is the name correct?"
          );
          return msg.channel.send(notFoundEmbed);
        }
        let selection = 0;
        if (json.length <= 1) {
          // output data into chat and request the tv show
          return utils.outputMusic(msg, json[selection]).catch(async error => {
            await msg.channel.send("[ERROR] Cancelled command.");
          });
        }

        //More then one result
        // populate results into string for embed
        let fieldContent = "";
        for (let i = 0; i < json.length; i++) {
          fieldContent += `${i + 1}) ${json[i].title}`;
          if (json[i].firstAired) fieldContent += ` (${json[i].firstAired})`;
          fieldContent += "\n";
        }

        // output search results in embed
        let searchEmed = embed
          .setTitle("Ombi Search")
          .setDescription(
            "Please select one of the search results. To abort answer **cancel**"
          )
          .addField("__Search Results__", fieldContent);
        await msg.channel.send(searchEmed);

        // wait for user selection
        await msg.channel
          .awaitMessages(
            m =>
              (!isNaN(parseInt(m.content)) || m.content.startsWith("cancel")) &&
              m.author.id == msg.author.id,
            { max: 1, time: 120000, errors: ["time"] }
          )
          .then(async collected => {
            if (
              collected
                .first()
                .content.toLowerCase()
                .startsWith("cancel")
            )
              return msg.channel.send("Cancelled command.");
            else if (
              parseInt(collected.first().content) >= 1 &&
              parseInt(collected.first().content) <= json.length
            ) {
              selection =
                parseInt(collected.first().content.match(/[1-9]+/)[0]) - 1;

              // output data into chat and request the tv show
              await utils.outputMusic(msg, json[selection]).catch(error => {
                return msg.channel.send("[ERROR] Cancelled command.");
              });
            }
          })
          .catch(collected => {
            console.log(collected);
            return console.log("[ERROR 107]:Cancelled command.");
          });
      });
  }
};
