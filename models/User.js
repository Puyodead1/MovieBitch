const mongoose = require("mongoose"),
  timestamp = require("mongoose-timestamp");

const UserSchema = new mongoose.Schema({
  guildID: {
    type: String,
    required: true
  },
  userID: {
    type: String,
    required: true
  },
  discordUsername: {
    type: String,
    required: true
  },
  ombiUsername: {
    type: String,
    required: true
  }
});

UserSchema.plugin(timestamp);
const User = new mongoose.model("User", UserSchema);
module.exports = User;
