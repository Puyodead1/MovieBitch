const Discord = require("discord.js");
const osu = require("node-os-utils");
const cpu = osu.cpu;

exports.run = async (client, msg, args) => {
  String.prototype.toHHMMSS = function() {
    var sec_num = parseInt(this, 10); // don't forget the second param
    var hours = Math.floor(sec_num / 3600);
    var minutes = Math.floor((sec_num - hours * 3600) / 60);
    var seconds = sec_num - hours * 3600 - minutes * 60;

    if (hours < 10) {
      hours = "0" + hours;
    }
    if (minutes < 10) {
      minutes = "0" + minutes;
    }
    if (seconds < 10) {
      seconds = "0" + seconds;
    }
    var time = hours + ":" + minutes + ":" + seconds;
    return time;
  };
  var time = process.uptime();
  var uptime = (time + "").toHHMMSS();

  const mssg = await msg.channel.send("Thinking....................");
  let botStats = [];
  let systemStats = [];
  botStats.push(
    `**Bot Latency**: ${mssg.createdTimestamp - msg.createdTimestamp}ms`
  );
  botStats.push(`**API Latency**: ${Math.round(client.ping)}ms`);
  systemStats.push(`**Uptime**: ${uptime}`);
  let cpuUsage = await cpu.usage();
  systemStats.push(`**CPU Usage**: ${cpuUsage}%`);
  systemStats.push(
    `**Memory**: ${Math.round(
      (process.memoryUsage().heapTotal / 1024 / 1024) * 100
    ) / 100}MB`
  );
  const statsEmbed = new Discord.RichEmbed()
    .setAuthor(client.user.username, client.user.avatarURL)
    .setFooter(msg.author.username, msg.author.avatarURL)
    .setColor("#FF0000")
    .setTitle("Bot Technical Information")
    .setDescription("MovieBitch by Puyodead1.")
    .addField("> Bot Info", botStats, true)
    .addField("> System Info", systemStats, true);

  let embed = new Discord.RichEmbed()
    .setAuthor(client.user.username, client.user.avatarURL)
    .setColor("#FF0000")
    .setTitle("Pong!")
    .setFooter(msg.author.username, msg.author.avatarURL)
    .setTimestamp()
    .addField(
      "Bot Latency",
      `${mssg.createdTimestamp - msg.createdTimestamp}ms`,
      true
    )
    .addField("API Latency", `${Math.round(client.ping)}ms`, true);
  await mssg.edit(statsEmbed);
};
