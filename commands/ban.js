exports.run = async (client, msg, args) => {
  if (args.length === 0) {
    return msg.channel.send("Please specify a user id or mention a user!");
  }
  if (msg.mentions.members.first() && args.length > 1) {
    const user = msg.mentions.members.first();
    await args.shift();
    return msg.channel.send(
      `✅ Banned **${user.user.username}** for **${args.join(" ")}**`
    );
  } else {
    const user = msg.mentions.members.first();
    args.shift();
    return msg.channel.send(`✅ Banned **${user.user.username}**`);
  }
};
