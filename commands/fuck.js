exports.run = async (client, msg, args) => {
  if (args.length === 0) {
    return msg.channel.send("Please specify a user id or mention a user!");
  }
  if (args.length === 1) {
    return msg.channel.send(
      "Please specify a location :P *Ass, Pussy (maybe :/), mouth, ear, nose, idk something*!"
    );
  }
  if (msg.mentions.members.first()) {
    const user = msg.mentions.members.first();
    await args.shift();
    return msg.channel.send(
      `${msg.author.username} has fucked **${
        user.user.username
      }** in **${args.join(" ")}**`
    );
  }
};
