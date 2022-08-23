const mongoose = require("mongoose");

const campaignSchema = mongoose.Schema({
  campaignId: { type: String, required: true },
  adopters: { type: [String], default: [] },
  createdAt: {
    type: Date,
    default: new Date(),
  },
});

module.exports = mongoose.model("Campaign", campaignSchema);
