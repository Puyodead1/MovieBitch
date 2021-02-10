const Discord = require("discord.js"),
  { get, post } = require("./util.js"),
  client = new Discord.Client(),
  fs = require("fs"),
  config = require("./config/config.json"),
  https = require("https"),
  User = require("./models/User"),
  mongoose = require("mongoose"),
  Enmap = require("enmap"),
  statuses = require("./statuses.json");
const wait = require("util").promisify(setTimeout);

client.commands = new Enmap();
client.commandNames = [];
client.admins = require("./admins.json");
const invites = {};
fs.readdir("./commands/", (err, files) => {
  if (err) return console.error(err);
  files.forEach(file => {
    if (!file.endsWith(".js")) return;
    // Load the command file itself
    let props = require(`./commands/${file}`);
    // Get just the command name from the file name
    let commandName = file.split(".")[0];
    console.log(`Attempting to load command ${commandName}`);
    client.commandNames.push(commandName);
    // Here we simply store the whole thing in the command Enmap. We're not running it right now.
    client.commands.set(commandName, props);
  });
});
let mongoURL;
let mode;
if (process.argv[2] === "-d") {
  mongoURL = config.MONGODEV;
  mode = "Development";
} else {
  mongoURL = "mongodb://localhost:27017/MovieBitch";
  mode = "Production";
}

mongoose.connect(mongoURL, {
  useNewUrlParser: true,
  useFindAndModify: true
});

const db = mongoose.connection;
db.on("error", err => console.log(err));

db.once("open", async () => {
  await console.log(`Mongoose Ready! Running in ${mode} mode`);
});

client.on("ready", () => {
  wait(1000);
  // Load all invites for all guilds and save them to the cache.
  client.guilds.forEach(g => {
    g.fetchInvites().then(guildInvites => {
      invites[g.id] = guildInvites;
    });
  });

  console.log(`Logged in as ${client.user.tag}!`);

  const status = statuses[Math.floor(Math.random() * statuses.length)];
  client.user.setActivity(status.title, { type: "WATCHING" }).then(async () => {
    setInterval(async () => {
      const netStatus = statuses[Math.floor(Math.random() * statuses.length)];
      await client.user.setActivity(netStatus.title, { type: "WATCHING" });
      console.log(`Set new status :)`);
    }, 7200000);
  });
});
client.on("message", async msg => {
  if (msg.author.bot) return;
  if (msg.author.id === "541378318151188491") {
    console.log(`Recieved notification`);
    // Forward it
    await client.channels.forEach(async c => {
      if (c.name === "🎥systemxds-movie-server") {
        let embed = await new Discord.RichEmbed()
          //.setAuthor(client.user.username, client.user.avatarURL)
          .setColor("#FF0000")
          .setTimestamp()
          .setFooter(
            `MovieBitch by Puyodead1`,
            client.guilds
              .get("473726968651710464")
              .members.get("213247101314924545").user.avatarURL
          );

        await c.send(msg.content);
        if (msg.embeds[0].image) {
          embed.setImage(msg.embeds[0].image.url);
          await c.send(embed);
        }
      }
    });
    return console.log("Done");
  }
  if (msg.content.toLowerCase().indexOf("o!") !== 0) return;
  const args = msg.content
    .slice(2)
    .trim()
    .split(/ +/g);
  const command = args.shift().toLowerCase();
  const cmd = client.commands.get(command);
  if (!cmd) return;
  console.log(
    `${msg.author.username} ran comamnd ${command} (${msg.author.id})`
  );
  cmd.run(client, msg, args);
});

client.login(config.TOKEN);

client.on("error", async err => {
  await console.log(err);
  await client.guilds
    .get("473726968651710464")
    .channels.get("538855443099942932")
    .send(`Oof, We cought an err for you. x_x \`\`\`${err.message}\`\`\``);
  return client.guilds
    .get("473726968651710464")
    .members.get("213247101314924545")
    .send(`Oof, We cought an err for you. x_x \`\`\`${err.message}\`\`\``);
});
