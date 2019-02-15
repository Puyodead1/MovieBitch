const Discord = require("discord.js"),
  utils = require("../util"),
  config = require("../config/config.json"),
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

        if (args.length === 0 || args.length === 1) {
          let invalidSyntaxEmbed = embed
            .setDescription("Invalid Syntax")
            .addField("Usage", "o!request <type> <search query>", true)
            .addField("Valid Types", "Movie, Music and TV", true);
          return msg.channel.send(invalidSyntaxEmbed);
        }
        let type = args[0].toLowerCase();
        if (!type === "movie" || !type === "tv") {
          let invalidTypeEmbed = embed
            .setDescription("Invalid Type")
            .addField("Usage", "o!request <type> <search query>", true)
            .addField("Valid Types", "Movie, Music and TV", true);
          return msg.channel.send(invalidTypeEmbed);
        }
        let query = args.slice(1).join("-");

        if (type === "movie") {
          await fetch(
            `https://server101.andy10gbit.org/ombi/api/v1/Search/movie/${query}`,
            {
              method: "get",
              headers: {
                accept: "application/json",
                ApiKey: config.OMBI_APIKEY,
                "User-Agent": `MovieBitch/1.0`
              }
            }
          )
            .then(res => res.json())
            .then(async data => {
              // parse body into json objects
              let movieEmbed = new Discord.RichEmbed();

              // check if data contains any results
              if (data.length == 0) {
                return msg.channel
                  .send(
                    "Couldn't find the movie you were looking for. Is the name correct?"
                  )
                  .then(() => {
                    msg.delete(5000);
                  });
              }

              // if only one search result exists output that
              let selection = 0;
              if (data.length <= 1) {
                // output data into chat and request the movie
                utils
                  .outputMovie(msg, data[selection])
                  .then(dataMsg => {
                    utils.requestMovie(msg, dataMsg, data[selection]);
                  })
                  .catch(error => {
                    msg.channel.send(`Error 69: ${error}`);
                    msg.reply("[ERROR 70]: Cancelled command.");
                  });
                return;
              }

              // populate results into string for embed
              let fieldContent = "";
              for (let i = 0; i < data.length; i++) {
                fieldContent += `${i + 1}) ${data[i].title}`;
                if (data[i].releaseDate)
                  fieldContent += ` (${data[i].releaseDate.split("T")[0]})`;
                fieldContent += "\n";
              }

              // output search results in embed
              movieEmbed
                .setTitle("Ombi Movie Search")
                .setDescription(
                  "Please select one of the search results. To abort answer **cancel**"
                )
                .addField("__Search Results__", fieldContent);
              msg.channel.send(movieEmbed);

              // wait for user selection
              msg.channel
                .awaitMessages(
                  m =>
                    (!isNaN(parseInt(m.content)) ||
                      m.content.startsWith("cancel")) &&
                    m.author.id == msg.author.id,
                  { max: 1, time: 120000, errors: ["time"] }
                )
                .then(collected => {
                  if (collected.first().content.startsWith("cancel"))
                    return msg.reply("Cancelled command.");
                  else if (
                    parseInt(collected.first().content) >= 1 &&
                    parseInt(collected.first().content) <= data.length
                  ) {
                    selection =
                      parseInt(collected.first().content.match(/[1-9]+/)[0]) -
                      1;

                    // output data into chat and request the movie
                    utils
                      .outputMovie(msg, data[selection])
                      .then(dataMsg => {
                        return utils.requestMovie(
                          msg,
                          dataMsg,
                          data[selection],
                          client
                        );
                      })
                      .catch(error => {
                        console.log(`Error 118: ${error}`);
                        return msg.reply("[ERORR 119]: Cancelled command.");
                      });
                  }
                })
                .catch(collected => {
                  console.log(`Collected 124: ${collected}`);
                  return msg.reply("[ERROR 125]: Cancelled command.");
                });
            })
            .catch(error => {
              console.error(error);
              return msg.reply("There was an error in your request. Error 130");
            });
        } else if (type === "tv") {
          await fetch(
            `https://server101.andy10gbit.org/ombi/api/v1/Search/tv/${query}`,
            {
              method: "get",
              headers: {
                accept: "application/json",
                ApiKey: config.OMBI_APIKEY,
                "User-Agent": `MovieBitch/1.0`
              }
            }
          )
            .then(res => res.json())
            .then(async data => {
              // parse body into json objects
              let movieEmbed = new Discord.RichEmbed();

              // check if data contains any results
              if (data.length == 0) {
                return msg.channel
                  .send(
                    "Couldn't find the tv show you were looking for. Is the name correct?"
                  )
                  .then(() => {
                    msg.delete(5000);
                  });
              }

              // if only one search result exists output that
              let selection = 0;
              if (data.length <= 1) {
                // output data into chat and request the movie
                utils
                  .outputTVShow(msg, data[selection])
                  .then(dataMsg => {
                    utils.requestTVShow(msg, dataMsg, data[selection]);
                  })
                  .catch(error => {
                    msg.channel.send(`Error 175: ${error}`);
                    msg.reply("[ERROR 176]: Cancelled command.");
                  });
                return;
              }

              // populate results into string for embed
              let fieldContent = "";
              for (let i = 0; i < data.length; i++) {
                fieldContent += `${i + 1}) ${data[i].title}`;
                if (data[i].releaseDate)
                  fieldContent += ` (${data[i].releaseDate.split("T")[0]})`;
                fieldContent += "\n";
              }

              // output search results in embed
              movieEmbed
                .setTitle("Ombi TV Show Search")
                .setDescription(
                  "Please select one of the search results. To abort answer **cancel**"
                )
                .addField("__Search Results__", fieldContent);
              msg.channel.send(movieEmbed);

              // wait for user selection
              msg.channel
                .awaitMessages(
                  m =>
                    (!isNaN(parseInt(m.content)) ||
                      m.content.startsWith("cancel")) &&
                    m.author.id == msg.author.id,
                  { max: 1, time: 120000, errors: ["time"] }
                )
                .then(collected => {
                  if (collected.first().content.startsWith("cancel"))
                    return msg.reply("Cancelled command.");
                  else if (
                    parseInt(collected.first().content) >= 1 &&
                    parseInt(collected.first().content) <= data.length
                  ) {
                    selection =
                      parseInt(collected.first().content.match(/[1-9]+/)[0]) -
                      1;

                    // output data into chat and request the movie
                    utils
                      .outputTVShow(msg, data[selection])
                      .then(dataMsg => {
                        return utils.requestTVShow(
                          msg,
                          dataMsg,
                          data[selection],
                          client
                        );
                      })
                      .catch(error => {
                        console.log(`Error 229: ${error}`);
                        return msg.reply("[ERORR 230]: Cancelled command.");
                      });
                  }
                })
                .catch(collected => {
                  console.log(`Collected 235: ${collected}`);
                  return msg.reply("[ERROR 236]: Cancelled command.");
                });
            })
            .catch(error => {
              console.error(error);
              return msg.reply("There was an error in your request. Error 240");
            });
        } else if (type === "music") {
          return msg.channel.send("WIP, Coming soon to headphones near you!");
          utils
            .get({
              headers: {
                accept: "application/json",
                ApiKey: "7a379fa0076b4a4c897fb4b6696dfd98",
                "User-Agent": `MovieBitch/1.0`
              },
              url: `https://server101.andy10gbit.org/ombi/api/v1/Search/music/${query}`
            })
            .then(resolve => {
              // parse body into json objects
              let data = JSON.parse(resolve.body);
              let movieEmbed = new Discord.RichEmbed();

              // check if data contains any results
              if (data.length == 0) {
                return msg.channel
                  .send(
                    "Couldn't find the movie you were looking for. Is the name correct?"
                  )
                  .then(() => {
                    msg.delete(5000);
                  });
              }

              // if only one search result exists output that
              let selection = 0;
              if (data.length <= 1) {
                // output data into chat and request the movie
                utils
                  .outputMovie(msg, data[selection])
                  .then(dataMsg => {
                    utils.requestMovie(msg, dataMsg, data[selection]);
                  })
                  .catch(error => {
                    msg.channel.send(`Error 69: ${error}`);
                    msg.reply("[ERROR 70]: Cancelled command.");
                  });
                return;
              }

              // populate results into string for embed
              let fieldContent = "";
              for (let i = 0; i < data.length; i++) {
                fieldContent += `${i + 1}) ${data[i].title}`;
                if (data[i].releaseDate)
                  fieldContent += ` (${data[i].releaseDate.split("T")[0]})`;
                fieldContent += "\n";
              }

              // output search results in embed
              movieEmbed
                .setTitle("Ombi Movie Search")
                .setDescription(
                  "Please select one of the search results. To abort answer **cancel**"
                )
                .addField("__Search Results__", fieldContent);
              msg.channel.send(movieEmbed);

              // wait for user selection
              msg.channel
                .awaitMessages(
                  m =>
                    (!isNaN(parseInt(m.content)) ||
                      m.content.startsWith("cancel")) &&
                    m.author.id == msg.author.id,
                  { max: 1, time: 120000, errors: ["time"] }
                )
                .then(collected => {
                  if (collected.first().content.startsWith("cancel"))
                    return msg.reply("Cancelled command.");
                  else if (
                    parseInt(collected.first().content) >= 1 &&
                    parseInt(collected.first().content) <= data.length
                  ) {
                    selection =
                      parseInt(collected.first().content.match(/[1-9]+/)[0]) -
                      1;

                    // output data into chat and request the movie
                    utils
                      .outputMovie(msg, data[selection])
                      .then(dataMsg => {
                        return utils.requestMovie(
                          msg,
                          dataMsg,
                          data[selection],
                          client
                        );
                      })
                      .catch(error => {
                        console.log(`Error 118: ${error}`);
                        return msg.reply("[ERORR 119]: Cancelled command.");
                      });
                  }
                })
                .catch(collected => {
                  console.log(`Collected 124: ${collected}`);
                  return msg.reply("[ERROR 125]: Cancelled command.");
                });
            })
            .catch(error => {
              console.error(error);
              return msg.reply("There was an error in your request. Error 130");
            });
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
