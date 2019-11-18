const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  firstname: {
    type: String,
    require: true
  },
  surname: {
    type: String,
    require: true
  },
  email: {
    type: String,
    require: true
  },
  password: {
    type: String,
    require: true
  },
  feeds: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Feed'
    }
  ],
  profileImage: {
    type: String
  },
  coverImage: {
    type: String
  },
  friends: [
    {
      type: mongoose.Schema.Types.ObjectId
    }
  ],
  notification: [
    {
      requester: {
        type: mongoose.Schema.Types.ObjectId
      },
      status: {
        type: String
      }
    }
  ],
  messages: [
    {
      sendFrom: {
        type: mongoose.Schema.Types.ObjectId
      },
      msg: {
        type: String
      }
    }
  ]
}, {
  timestamps: true
});

module.exports = mongoose.model("User", userSchema);
