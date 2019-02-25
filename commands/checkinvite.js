exports.run = async (client, msg, args) => {
  if (args.length === 0) {
    return msg.channel.send("Please specify an invite code.");
  }
  await msg.guild
    .fetchInvites()
    .then(guildInvites => {
      const invite = guildInvites.get(args[0]);
      return msg.channel.send(`That invite has \`\`${invite.uses}\`\` uses!`);
    })
    .catch(err =>
      msg.channel.send(
        "Error! That is either not a valid invite or there was an issue checking."
      )
    );
};
