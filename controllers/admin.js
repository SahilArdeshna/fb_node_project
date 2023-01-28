const fs = require("fs");

const mongoose = require("mongoose");

const User = require("../models/User");
const Feed = require("../models/Feed");
const feedTimeChange = require("../utils/feedTime");
const { createImage } = require("../utils/createImage");

exports.getProfile = async (req, res, next) => {
  try {
    const userId = req.params.id;
    let showDeleteBtn;

    const feeds = await Feed.find({ user: userId })
      .populate("user")
      .sort({ createdAt: -1 });
    const user = await User.findById(userId);
    if (!user) {
      const error = new Error("User not found!");
      error.statusCode = 404;
      throw error;
    }

    const admin = await User.findById(req.user._id);
    if (!admin) {
      const error = new Error("User not found!");
      error.statusCode = 404;
      throw error;
    }

    if (admin._id.toString() === user._id.toString()) {
      showDeleteBtn = true;
    }

    const numOfNotification = admin.notification.length;
    const users = await User.find({ _id: { $in: admin.friends } });

    const updatedFeeds = feedTimeChange(feeds);

    const commentUserMap = new Map();

    for (let feed of feeds) {
      for (let comment of feed.comments) {
        const commentUser = await User.findById(comment.commenter);
        commentUserMap.set(commentUser._id.toString(), commentUser);
      }
    }

    const roomId = new mongoose.Types.ObjectId();

    res.render("admin/admin", {
      title: `${req.user.firstname} ${req.user.surname}`,
      numOfNotification,
      commentUserMap,
      showDeleteBtn,
      id: roomId,
      visitedUser: user,
      user: admin,
      userFriends: users,
      feeds: updatedFeeds,
      appUrl: process.env.APP_URL,
      defaultImage: "images/profile-images/default-profile.png",
    });
  } catch (err) {
    const error = new Error(err);
    error.statusCode = 500;
    return next(error);
  }
};

exports.deleteFeed = async (req, res, next) => {
  const feedId = req.body.feedId;

  const user = await User.findById(req.user._id);
  if (!user) {
    const error = new Error("User not found!");
    error.statusCode = 404;
    throw error;
  }

  let feed = await Feed.findOne({ _id: feedId, user: user._id });
  if (!feed) {
    error.statusCode = 404;
    throw error;
  }

  fs.unlinkSync(feed.image);
  const filterFeeds = user.feeds.filter((feed) => {
    if (feed.toString() !== feedId.toString()) {
      return feed;
    }
  });

  user.feeds = filterFeeds;
  await user.save();
  await feed.remove();

  res.redirect(`/admin/${req.user._id}`);
};

exports.postCoverImage = async (req, res, next) => {
  const coverImage = req.file;
  if (!coverImage) {
    const error = new Error("Please upload image file!");
    error.statusCode = 422;
    return next(error);
  }

  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      const error = new Error("User not found!");
      error.statusCode = 404;
      throw error;
    }

    if (user.coverImage) {
      fs.unlinkSync(user.coverImage);
    }

    const width = 850;
    const height = 360;
    let time = new Date().toISOString();
    const path = "cover-images";

    const resizeImage = await createImage(
      coverImage,
      path,
      width,
      height,
      time
    );
    if (resizeImage) {
      user.coverImage = `images/${path}/${time}-${coverImage.originalname}`;
      await user.save();

      res.redirect(`/admin/${user._id}`);
    } else {
      throw Error();
    }
  } catch (err) {
    const error = new Error(err);
    error.statusCode = 500;
    return next(error);
  }
};

exports.postProfileImage = async (req, res, next) => {
  const image = req.file;
  if (!image) {
    const error = new Error("Please upload image file!");
    error.statusCode = 422;
    return next(error);
  }

  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      const error = new Error("User not found!");
      error.statusCode = 404;
      throw error;
    }

    if (user.profileImage) {
      fs.unlinkSync(user.profileImage);
    }

    const width = 140;
    const height = 140;
    let time = new Date().toISOString();
    const path = "profile-images";

    const resizeImage = await createImage(image, path, width, height, time);
    if (resizeImage) {
      user.profileImage = `images/${path}/${time}-${image.originalname}`;
      await user.save();

      res.redirect(`/admin/${user._id}`);
    } else {
      throw Error();
    }
  } catch (err) {
    const error = new Error(err);
    error.statusCode = 500;
    return next(error);
  }
};

exports.friends = async (req, res, next) => {
  const profileId = req.params.id;

  try {
    const user = await User.findById(profileId);
    if (!user) {
      const error = new Error("User not found!");
      error.statusCode = 404;
      throw error;
    }

    const users = await User.find({ _id: { $in: user.friends } });

    const admin = await User.findById(req.user._id);
    if (!admin) {
      const error = new Error("User not found!");
      error.statusCode = 404;
      throw error;
    }

    const numOfNotification = user.notification.length;
    const adminFriends = await User.find({ _id: { $in: admin.friends } });

    res.render("admin/friends", {
      title: `${user.firstname} ${user.surname}`,
      user,
      firstname: user.firstname,
      surname: user.surname,
      userFriends: users,
      adminFriends,
      numOfNotification,
      appUrl: process.env.APP_URL,
      defaultImage: "images/profile-images/default-profile.png",
    });
  } catch (err) {
    const error = new Error(err);
    error.statusCode = 500;
    return next(error);
  }
};
