const mongoose = require("mongoose");

const feedSchema = new mongoose.Schema({
  image: {
    type: String,
    require: true
  },
  text: {
    type: String,
    trim: true
  },
  comments: [
    {
      text: {
        type: String,
        trim: true
      },
      commenter: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        require: true
      }
    }
  ],
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    require: true
  }
}, {
  timestamps: true
}); 

module.exports = mongoose.model("Feed", feedSchema);
