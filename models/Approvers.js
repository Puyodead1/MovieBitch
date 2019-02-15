const mongoose = require("mongoose"),
  timestamp = require("mongoose-timestamp");

const ApproverSchema = new mongoose.Schema({
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

ApproverSchema.plugin(timestamp);
const Approver = new mongoose.model("Approver", ApproverSchema);
module.exports = Approver;
