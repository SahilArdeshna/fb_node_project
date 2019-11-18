const User = require("../models/User");
const Messege = require('../models/Messege');

exports.getMesseges = async (req, res, next) => {
  const userMessengerId = req.params.id;
  const userId = req.user._id;

  try {
    const obj = await userMessegeDetail(userMessengerId, userId);

    res.render("message/message", {
      title: obj.title,
      user: obj.user,
      userFriends: obj.userFriends,
      chatUser: obj.chatUser,
      chatHistory: obj.chatHistory,
      numOfNotification: obj.numOfNotification
    });

  } catch (err) {
    const error = new Error(err);
    error.statusCode = 500;
    return next(error);
  }
};

exports.getChatUser = async (req, res, next) => {
  const userMessengerId = req.params.id;
  const userId = req.user._id;

  try {
    const obj = await userMessegeDetail(userMessengerId, userId);

    res.status(200).send({
      title: obj.title,
      user: obj.user,
      userFriends: obj.userFriends,
      chatUser: obj.chatUser,
      chatHistory: obj.chatHistory,
      numOfNotification: obj.numOfNotification
    });

  } catch (err) {
    const error = new Error(err);
    error.statusCode = 500;
    return next(error);
  }
};

exports.postMessege = async (req, res, next) => {
  const receiver = req.body.receiverId;
  const sender = req.body.senderId;
  const messegeData = req.body.messege;
  const messege = new Messege({
    sender,
    receiver,
    messege: messegeData
  });

  try {
    await messege.save();    
    
  } catch (err) {
    const error = new Error(err);
    error.statusCode = 500;
    return next(error);
  }
};

const userMessegeDetail = async (userMessengerId, userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      const error = new Error("User not found!");
      error.statusCode = 404;
      throw error;
    }

    const chatUser = await User.findById(userMessengerId);
    if (!chatUser) {
      const error = new Error("User not found!");
      error.statusCode = 404;
      throw error;
    }

    const msgSend = await Messege.find({ sender: userId, receiver: userMessengerId });
    const msgReceive = await Messege.find({ sender: userMessengerId, receiver: userId });

    const userFriends = await User.find({ _id: { $in: user.friends } }).sort({ createdAt: -1 });
    const numOfNotification = user.notification.length;


    const chatHistory = msgSend.concat(msgReceive);
    chatHistory.forEach(chat => {
      chat.createdAt = Date.parse(chat.createdAt);
    });

    chatHistory.sort((a, b) => {
      return a.createdAt - b.createdAt;
    });

    return {
      title: 'Messenger',
      user,
      userFriends,
      chatUser,
      numOfNotification,
      chatHistory
    }   
    
  } catch (err) {
    const error = new Error(err);
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    throw error;
  }
};
