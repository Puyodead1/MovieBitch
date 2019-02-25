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
client.on("guildMemberAdd", member => {
  // To compare, we need to load the current invite list.
  member.guild.fetchInvites().then(guildInvites => {
    // This is the *existing* invites for the guild.
    const ei = invites[member.guild.id];
    // Update the cached invites for the guild.
    invites[member.guild.id] = guildInvites;
    // Look through the invites, find the one for which the uses went up.
    const invite = guildInvites.find(i => ei.get(i.code).uses < i.uses);
    // This is just to simplify the message being sent below (inviter doesn't have a tag property)
    const inviter = client.users.get(invite.inviter.id);
    // Get the log channel (change to your liking)
    const logChannel = member.guild.channels.find(
      channel => channel.name === "join-logs"
    );
    if (
      invite.uses >= 10 &&
      !client.guilds
        .get("473726968651710464")
        .members.get(inviter.id)
        .roles.has("542476601133105153")
    ) {
      client.guilds
        .get("473726968651710464")
        .channels.get("473726968651710466")
        .send(
          `Congrats ${inviter}, you have invited 10 or more people! You have been granted the Staff role!`
        );
    }
    // A real basic message with the information we need.
    logChannel.send(
      `${member.user.tag} joined using invite code \`\`${
        invite.code
      }\`\` from ${inviter.tag}. Invite was used \`\`${invite.uses}\`\` times.`
    );
  });
});
client.on("message", async msg => {
  if (msg.channel.type === "dm") {
    if (msg.content.startsWith("set")) {
      const args = msg.content.trim().split(/ +/g);
      const command = args.shift().toLowerCase();
      client.pmforwardChannel = args[0];
      return msg.channel.send(
        `Set the channel id to ${client.pmforwardChannel}`
      );
    }
    if (msg.author.id === "213247101314924545") {
      if (!client.pmforwardChannel) {
        return client.guilds
          .get("473726968651710464")
          .channels.get("473726968651710466")
          .send(msg.content);
      }
      return client.guilds
        .get("473726968651710464")
        .channels.get(client.pmforwardChannel)
        .send(msg.content);
    }
  }
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
              .get("538808292722475019")
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
  if (msg.author.bot) return;
  if (msg.content.toLowerCase().includes("whore")) {
    return msg.reply("no u bitch");
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
    .get("538808292722475019")
    .channels.get("538855443099942932")
    .send(`Oof, We cought an err for you. x_x \`\`\`${err.message}\`\`\``);
  return client.guilds
    .get("538808292722475019")
    .members.get("213247101314924545")
    .send(`Oof, We cought an err for you. x_x \`\`\`${err.message}\`\`\``);
});
