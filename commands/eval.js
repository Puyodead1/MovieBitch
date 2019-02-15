const Discord = require("discord.js");

exports.run = async (client, msg, args) => {
  if (!msg.author.id === "213247101314924545")
    return msg.channel.send("Only Puyodead1 can do that!");
  const code = args.join(" ");
  try {
    /* eslint-disable */
    const evaled = eval(code);
    /* eslint-enable */
    return msg.channel.send(`\`\`\`js\n${evaled}\n\`\`\``);
  } catch (err) {
    return msg.channel.send(`\`ERROR\` \`\`\`xl\n${err}\n\`\`\``);
  }
};
