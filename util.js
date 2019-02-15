const request = require("request");
const https = require("https");
const Promise = require("bluebird");
const Discord = require("discord.js");
const Requesters = require("./models/Requesters");
const config = require("./config/config.json");
const fetch = require("node-fetch");
const Bluebird = require("bluebird");
fetch.Promise = Bluebird;

const capitalizeFirstLetter = function(string) {
  return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
};
const noPerm = function(msg) {
  let newEmbed = new Discord.RichEmbed()
    .setAuthor(client.user.username, client.user.avatarURL)
    .setColor("#FF0000")
    .setTimestamp()
    .setDescription("You don't have access to use that command")
    .setFooter(
      `MovieBitch by Puyodead1`,
      client.guilds.get("538808292722475019").members.get("213247101314924545")
        .user.avatarURL
    );

  return msg.channel.send(newEmbed);
};

const momentFormat = function(date, client) {
  const moment = require("moment");

  return moment(date).format(
    `MMMM Do YYYY [at] ${
      client.provider.get("global", "timeformat", "24") === "24"
        ? "HH:mm:ss"
        : "hh:mm:ss A"
    } [UTC]Z`
  );
};

const get = function(options) {
  return new Promise(function(resolve, reject) {
    request.get(options, function(error, response, body) {
      if (!error && response.statusCode == 200) resolve({ response, body });
      else reject(body);
    });
  });
};
const outputMovie = function(msg, movie) {
  // populate basic selected result into embed
  let movieEmbed = new Discord.RichEmbed()
    .setTitle(
      `${movie.title} ${
        movie.releaseDate ? `(${movie.releaseDate.split("T")[0]})` : "(unknown)"
      }`
    )
    .setDescription(movie.overview.substr(0, 255) + "(...)")
    .setFooter("Click the thumbnail to get more information about the movie.")
    .setTimestamp(new Date())
    .setImage("https://image.tmdb.org/t/p/w500" + movie.posterPath)
    .setURL("https://www.themoviedb.org/movie/" + movie.theMovieDbId)
    .setThumbnail("https://i.imgur.com/K55EOJH.png");

  // populate only the data which is true, otherwise not
  if (movie.available) movieEmbed.addField("__Available__", "✅", true);
  if (movie.quality) movieEmbed.addField("__Quality__", movie.quality, true);
  if (movie.requested) movieEmbed.addField("__Requested__", "✅", true);
  if (movie.approved) movieEmbed.addField("__Approved__", "✅", true);
  if (movie.plexUrl)
    movieEmbed.addField("__Plex__", `[Watch now](${movie.plexUrl})`, true);
  if (movie.embyUrl)
    movieEmbed.addField("__Emby__", `[Watch now](${movie.embyUrl})`, true);

  // send embed into chat
  return msg.channel.send(movieEmbed);
};

const outputMusic = function(msg, album) {
  // populate basic selected result into embed
  let albumEmbed = new Discord.RichEmbed()
    .setTitle(
      `${album.title} ${
        album.releaseDate ? `(${album.releaseDate.split("T")[0]})` : "(unknown)"
      }`
    )
    .setDescription(`${album.title} by ${album.artistName}`)
    // .setFooter("Click the thumbnail to get more information about the movie.")
    .setTimestamp(new Date())
    .setImage(album.cover)
    //.setURL("https://www.themoviedb.org/movie/" + movie.theMovieDbId)
    .setThumbnail(album.disk);

  // populate only the data which is true, otherwise not
  if (album.available) albumEmbed.addField("__Available__", "✅", true);
  if (album.requested) albumEmbed.addField("__Requested__", "✅", true);
  if (album.approved) albumEmbed.addField("__Approved__", "✅", true);
  if (album.plexUrl)
    albumEmbed.addField("__Plex__", `[Listen now](${album.plexUrl})`, true);
  if (album.embyUrl)
    albumEmbed.addField("__Emby__", `[Listen now](${album.embyUrl})`, true);

  // send embed into chat
  return msg.channel.send(albumEmbed);
};

const requestTVShow = async function(msg, showMsg, show, client) {
  let record = await Requesters.findOne({
    guildID: msg.guild.id,
    userID: msg.author.id
  });
  if (
    record &&
    record.isEnabled &&
    (!show.available && !show.requested && !show.approved)
  ) {
    msg.reply(
      "If you want to request this tv show please click on the ⬇ reaction."
    );
    await showMsg.react("⬇");
    await showMsg.react(msg.guild.emojis.get("543235394326757376"));

    // wait for user reaction
    showMsg
      .awaitReactions((reaction, user) => user.id === msg.author.id, {
        max: 1,
        time: 120000
      })
      .then(async collected => {
        // request movie in ombi
        const reaction = collected.first();
        if (reaction.emoji.name === "⬇") {
          const body = { tvDbId: show.id, requestAll: true };

          await fetch(
            "https://server101.andy10gbit.org/ombi/api/v1/Request/tv/",
            {
              method: "post",
              body: JSON.stringify(body),
              headers: {
                accept: "application/json",
                "Content-Type": "application/json",
                ApiKey: config.OMBI_APIKEY,
                ApiAlias: `${msg.author.username} (${msg.author.id})`,
                "User-Agent": `MovieBitch/1.0`,
                UserName: msg.author.username
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
                .setDescription(json.message)
                .addField(`Request ID`, json.requestId);
              return msg.channel.send(successEmbed);
            });
        } else if (reaction.emoji.id === "543235394326757376") {
          await msg.channel.bulkDelete(5);
          return msg.channel.send("Cancelled").then(async mssg => {
            await mssg.delete(2000);
          });
        }
      })
      .catch(collected => {
        console.log(`Collected 145: ${collected}`);
        return showMsg;
      });
  }
  return showMsg;
};

// only works when the user has permission to request
const requestMovie = async function(msg, movieMsg, movie, client) {
  let record = await Requesters.findOne({
    guildID: msg.guild.id,
    userID: msg.author.id
  });
  // check if user has request role and if it's not available, requested and approved
  if (
    record &&
    record.isEnabled &&
    (!movie.available && !movie.requested && !movie.approved)
  ) {
    msg.reply(
      "If you want to request this movie please click on the ⬇ reaction."
    );
    await movieMsg.react("⬇");
    await movieMsg.react(msg.guild.emojis.get("543235394326757376"));

    // wait for user reaction
    movieMsg
      .awaitReactions((reaction, user) => user.id === msg.author.id, {
        max: 1,
        time: 120000
      })
      .then(async collected => {
        // request movie in ombi
        const reaction = collected.first();
        if (reaction.emoji.name === "⬇") {
          const body = { theMovieDbId: movie.theMovieDbId };
          await fetch(
            "https://server101.andy10gbit.org/ombi/api/v1/Request/movie/",
            {
              method: "post",
              body: JSON.stringify(body),
              headers: {
                accept: "application/json",
                "Content-Type": "application/json",
                ApiKey: config.OMBI_APIKEY,
                ApiAlias: `${msg.author.username} (${msg.author.id})`,
                "User-Agent": `MovieBitch/1.0`,
                UserName: msg.author.username
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
                .setDescription(json.message)
                .addField(`Request ID`, json.requestId);
              return msg.channel.send(successEmbed);
            });
        } else if (reaction.emoji.id === "543235394326757376") {
          await msg.channel.bulkDelete(5);
          return msg.channel.send("Cancelled").then(async mssg => {
            await mssg.delete(2000);
          });
        }
      })
      .catch(collected => {
        console.log(`Collected 204: ${collected}`);
        return movieMsg;
      });
  }
  return movieMsg;
};

const outputTVShow = function(msg, show) {
  // populate basic selected result into embed and output it
  let tvEmbed = new Discord.RichEmbed()
    .setTitle(
      `${show.title} ${show.firstAired ? `(${show.firstAired})` : "(unknown)"}`
    )
    .setDescription(show.overview.substr(0, 255) + "(...)")
    .setFooter(
      "Click the thumbnail to get more informations about the tv show."
    )
    .setTimestamp(new Date())
    .setImage(show.banner)
    .setURL(`https://www.thetvdb.com/?id=${show.id}&tab=series`)
    .setThumbnail("https://i.imgur.com/WBX4rf0.png")
    .addField("__Network__", show.network, true)
    .addField("__Status__", show.status, true);

  // populate only the data which is true, otherwise not
  if (show.available) tvEmbed.addField("__Available__", "✅", true);
  if (show.quality) tvEmbed.addField("__Quality__", show.quality, true);
  if (show.requested) tvEmbed.addField("__Requested__", "✅", true);
  if (show.approved) tvEmbed.addField("__Approved__", "✅", true);
  if (show.plexUrl)
    tvEmbed.addField("__Plex__", `[Watch now](${show.plexUrl})`, true);
  if (show.embyUrl)
    tvEmbed.addField("__Emby__", `[Watch now](${show.embyUrl})`, true);

  // send embed into chat
  return msg.channel.send(tvEmbed);
};

module.exports = {
  capitalizeFirstLetter,
  momentFormat,
  get,
  outputMovie,
  requestMovie,
  noPerm,
  outputTVShow,
  requestTVShow,
  outputMusic
};
