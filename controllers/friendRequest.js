const FriendRequest = require("../models/FriendRequest");
const User = require('../models/User');

exports.sendFriendReq = async (req, res, next) => {
  const requester = req.body.requesterId;
  const requestTo = req.body.requestToId;
  const searchName = req.body.searchName;
  const status = "requested";
  const friendRequest = new FriendRequest({
    requester,
    requestTo,
    status
  });

  try {
    await friendRequest.save();
    const user = await User.findById({ _id: requestTo });
    if (!user) {
      const error = new Error('User not found!');
      error.statusCode = 404;
      throw error;
    }

    const notificationObj = {
      requester,
      status: 'friend request'
    };

    user.notification.push(notificationObj);
    await user.save();
    res.redirect(`/search?search=${searchName}`); 

  } catch (err) {
    const error = new Error(err);
    error.statusCode = 500;
    return next(error);
  }
};

exports.cancelFriendReq = async (req, res, next) => {
  const requester = req.body.requesterId;
  const requestTo = req.body.requestToId;
  const searchName = req.body.searchName;

  try {
    await FriendRequest.deleteMany({ requester, requestTo });
    const user = await User.findById({ _id: requestTo });
    if (!user) {
      const error = new Error('User not found!');
      error.statusCode = 404;
      throw error;
    }

    const filteredRequest = user.notification.filter(un => {
      if (un.requester.toString() === requester.toString() && un.status === 'friend request') {
        return un;
      }
    });
    user.notification.pop(filteredRequest);
    await user.save();
    res.redirect(`/search?search=${searchName}`);

  } catch(err) {
    const error = new Error(err);
    error.statusCode = 500;
    return next(err);
  }
};

exports.unfriend = async (req, res, next) => {
  const requesterId = req.body.requesterId;
  const requestToId = req.body.requestToId;

  try {
    const admin = await User.findById(requesterId);
    if (!admin) {
      const error = new Error('User not found!');
      error.statusCode = 404;
      throw error;
    }

    const filteredFriends = admin.friends.filter(friend => {
      if (friend.toString() !== requestToId.toString()) {
        return friend;
      }
    });

    admin.friends = filteredFriends;
    await admin.save();
  
    const friendOfAdmin = await User.findById(requestToId);
    if (!friendOfAdmin) {
      const error = new Error('User not found!');
      error.statusCode = 404;
      throw error;
    }
    

    const remainingFriends = friendOfAdmin.friends.filter(friend => {
      if (friend.toString() !== admin._id.toString()) {
        return friend;
      }
    });
    
    friendOfAdmin.friends = remainingFriends;
    await friendOfAdmin.save();
  
    res.redirect(`/admin/${requesterId}/friends`);

  } catch (err) {
    const error = new Error(err);
    error.statusCode = 500;
    return next(error);
  }
};
