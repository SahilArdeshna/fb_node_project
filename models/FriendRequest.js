const mongoose = require("mongoose");

const friendRequst = new mongoose.Schema({
  requester: {
    type: mongoose.Schema.Types.ObjectId,
    require: true
  },
  requestTo: {
    type: mongoose.Schema.Types.ObjectId,
    require: true
  },
  status: {
    type: String,
    require: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model("FriendRequest", friendRequst);
