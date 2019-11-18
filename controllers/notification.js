const User = require("../models/User");
const FriendRequest = require('../models/FriendRequest');

exports.getNotification = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      const error = new Error("User not found!");
      error.statusCode = 404;
      throw error;
    }
    
    let requestedUser;
    if (user.notification.length > 0) {
      const userIds = user.notification.map(notif => {
        if (notif._id && notif.status === "friend request") {
          return notif.requester;
        }
      });

      const notifUser = await User.find({ _id: { $in: userIds } });
      if (!notifUser) {
        const error = new Error("User not found!");
        error.statusCode = 404;
        throw error;  
      }
    
      const userObj = notifUser.map(user => {
        return {
          firstname: user.firstname,
          surname: user.surname,
          _id: user._id,
          profileImage: user.profileImage
        };
      });

      requestedUser = userObj;
    }

    const users = await User.find({ _id: { $in: user.friends } });

    res.render("notification/notification", {
      title: "Your Notification",
      user,
      requestedUser: requestedUser || '',
      numOfNotification: "",
      userFriends: users
    });
  } catch (err) {
    const error = new Error(err);
    error.statusCode = 500;
    return next(error);
  }
};

exports.rejectRequest = async (req, res, next) => {
  const requesterId = req.body.requesterId;

  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      const error = new Error('User not found!');
      error.statusCode = 404;
      throw error;
    }
    
    const friendReq = user.notification.filter(un => {
      if (un.requester.toString() === requesterId.toString() && un.status === 'friend request') {
        return un;
      }
    });

    user.notification.pop(friendReq);
    await user.save();
    await FriendRequest.deleteMany({ requester: friendReq[0].requester, requestTo: user._id });

    res.redirect('/notification');

  } catch(err) {
    const error = new Error(err);
    error.statusCode = 500;
    return next(error);
  }
};

exports.acceptRequest = async (req, res, next) => {
  const requesterId = req.body.requesterId;

  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      const error = new Error('User not found!');
      error.statusCode = 404;
      throw error;
    }
  
    
    const friendReq = user.notification.filter(un => {
      if (un.requester.toString() === requesterId.toString() && un.status === 'friend request') {
        return un;
      }
    });
    
    user.notification.pop(friendReq);
    user.friends.push(requesterId);
    await user.save();

    const requester = await User.findById(requesterId);
    if (!requester) {
      const error = new Error('User not found!');
      error.statusCode = 404;
      throw error;
    }

    requester.friends.push(user._id);
    await requester.save();
    await FriendRequest.deleteMany({ requester: requesterId, requestTo: user._id });


    res.redirect('/notification');

  } catch (err) {
    const error = new Error(err);
    error.statusCode = 500;
    return next(error);
  }
};