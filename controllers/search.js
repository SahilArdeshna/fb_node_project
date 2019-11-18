const { validationResult } = require('express-validator');

const User = require("../models/User");
const FriendRequest = require('../models/FriendRequest');

exports.search = async (req, res, next) => {
  const errors = validationResult(req);
  // if (!errors.isEmpty()) {
  //   const error = 
  // }

  const searchName = req.body.personname;
  const adminId = req.user._id
  try {
    const obj = await search(searchName, adminId);

    res.render('search/search', {
        title: 'FB search',
        user: obj.admin,
        requestedToUsers: obj.requestedToUsers,
        searchName,
        usersFound: obj.users,
        userFriends: obj.userFriends,
        adminFriends: obj.adminFriends,
        numOfNotification: obj.numOfNotification
    });

  } catch(err) {
    const error = new Error(err);
    error.statusCode = 500;
    return next(err);
  }
}; 

exports.getSearch = async (req, res, next) => {
  const searchName = req.query.search;
  const adminId = req.user._id;
  try {
    const obj = await search(searchName, adminId);
 
    res.render('search/search', {
        title: 'FB search',
        user: obj.admin,
        requestedToUsers: obj.requestedToUsers,
        searchName,
        usersFound: obj.users,
        userFriends: obj.userFriends,
        adminFriends: obj.adminFriends,
        numOfNotification: obj.numOfNotification
    });

  } catch(err) {
    const error = new Error(err);
    error.statusCode = 500;
    return next(err);
  }
};

const search = async (searchName, adminId) => {
  let users;

  try{
    if (!searchName) {
      users = await User.find();
      if (!users) {
        const error = new Error('No users found on this name.');
        error.statusCode = 404;
        throw error;
      }
    } else {
      const string = searchName.split(" ");
      const firstname = string[0];
      const surname = string[1];

      users = await User.find({ firstname });
    }

    const friendRequests = await FriendRequest.find({ requester: adminId, status: 'requested'});
    const requestedToUsers = users.filter(user => {
      const requestToId = friendRequests.find(fr => {
        if (user._id.toString() === fr.requestTo.toString() && fr.status === 'requested') {
          return fr;
        }
      });
      return requestToId;
    });

    const requestedToUsersMap = new Map();
    requestedToUsers.forEach(user => {
      requestedToUsersMap.set(user._id, user);
    });

    const admin = await User.findById(adminId);
    if (!admin) {
      const error = new Error('User not found!');
      error.statusCode = 404;
      throw error;
    }
    
    const adminFriends = users.filter(user => {
      const findUser = admin.friends.find(friend => {
        if (user._id.toString() === friend.toString()) {
          return friend;
        }
      });
      return findUser;
    });
    const adminFriendsMap = new Map();
    adminFriends.forEach(friend => {
      adminFriendsMap.set(friend._id, friend);
    });
      
    const numOfNotification = admin.notification.length;
    const userFriends = await User.find({ _id: { $in: admin.friends } });

    return {
      numOfNotification,
      users,
      admin,
      userFriends,
      requestedToUsers: requestedToUsersMap,
      adminFriends: adminFriendsMap
    };
  } catch(err) {
    const error = new Error(err);
    error.statusCode = 500;
    throw error;
  }
};
