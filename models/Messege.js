const mongoose = require("mongoose");

const messegeSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    messege: {
      type: String      
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Message", messegeSchema);
