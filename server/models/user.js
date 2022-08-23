const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  id: { type: String },
  adopts: { type: [String], default: [] },
  campaignsCreated: { type: [String], default: [] },
  donations: [
    {
      account: String,
      contribution: Number,
      id: String,
    },
  ],
});

module.exports = mongoose.model("User", userSchema);
