const Discord = require("discord.js"),
  util = require("../util");

exports.run = async (client, msg, args) => {
  if (msg.author.id === "213247101314924545") {
    return msg.channel.send(`Rebooting.... Bye`).then(() => {
      process.exit(0);
    });
  } else {
    return util.noPerm(msg);
  }
};
