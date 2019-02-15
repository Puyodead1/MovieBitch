const mongoose = require("mongoose"),
  timestamp = require("mongoose-timestamp");

const RequesterSchema = new mongoose.Schema({
  guildID: {
    type: String,
    required: true
  },
  userID: {
    type: String,
    required: true
  },
  isEnabled: {
    type: Boolean,
    default: true
  }
});

RequesterSchema.plugin(timestamp);
const Requester = new mongoose.model("Requester", RequesterSchema);
module.exports = Requester;
