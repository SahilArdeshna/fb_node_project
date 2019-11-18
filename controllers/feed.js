const fs = require('fs');

const { validationResult } = require('express-validator');

const Feed = require('../models/Feed');
const User = require('../models/User');
const feedTimeChange = require('../utils/feedTime');
const { createPostImage } = require('../utils/createImage');

exports.getFeeds = async (req, res, next) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    const error = new Error('User not found!');
    error.statusCode = 404;
    throw error;
  }
  
  let userWithFriendsIds = user.friends;
  const adminFriends = await User.find({ _id: { $in: userWithFriendsIds } });
  userWithFriendsIds.push(user._id);

  const feeds = await Feed.find({ user: { $in: userWithFriendsIds } }).populate('user').sort({ createdAt: -1 });
  const updatedFeeds = feedTimeChange(feeds);
  
  const commentUserMap = new Map();

  for (let feed of feeds) {
    for (let comment of feed.comments) {
      const commentUser = await User.findById(comment.commenter);
      commentUserMap.set(commentUser._id.toString(), commentUser);
    }
  }

  const notificationLength = user.notification.length;   

  res.render('feed/feed', {
    title: 'FB',
    user,
    commentUserMap,
    feeds: updatedFeeds,
    adminFriends,
    numOfNotification: notificationLength || ''
  });
};

exports.postFeed = async (req, res, next) => {
  const text = req.body.text;
  const file = req.file;

  if (!file) {
    const error = new Error("Please upload image or video file!");
    error.statusCode = 422;
    return next(error);
  }

  try {
    let feed;
    const width = 580;  
    let time = new Date().toISOString();
    const path = checkVideoType(file) ? 'post-videos' : 'post-images';

    if (checkVideoType(file)) {
      file.originalname = `${file.originalname.split('.')[0]}.mp4`;
      const video = fs.createWriteStream(`images/${path}/${time}-${file.originalname}`);
      if (!video) {
        throw Error("Uploading video failed!");
      }
      
      video.write(file.buffer);

    } else {
      file.originalname = `${file.originalname.split('.')[0]}.png`;      
      const resized = await createPostImage(file, path, width, time);
      if (!resized) {
        return Error('Uploading image failed!');
      }
    }
    
    feed = new Feed({
      image: `images/${path}/${time}-${file.originalname}`,
      text,
      user: req.user._id
    });
  
    const createdFeed = await feed.save();
    const user = await User.findById(req.user._id);
    if (!user) {
      return next(new Error("User not found!"));
    }

    user.feeds.push(createdFeed);
    await user.save();

    res.redirect('/feed');

  } catch(err) {
    const error = new Error(err);
    error.statusCode = 500;
    return next(error);
  }
};

exports.postComment = async (req, res, next) => {
  const errors = validationResult(req);  
  if (!errors.isEmpty()) {
    return res.redirect(`/feed`);
  }
  
  const commenterId = req.body.commenterId;
  const commentText = req.body.comment;
  const feedId = req.body.feedId;
  
  const comment = {
    text: commentText,
    commenter: commenterId
  };

  try {
    const feed = await Feed.findById(feedId);
    feed.comments.push(comment);
    await feed.save();

    res.redirect('/feed');

  } catch (err) {
    const error = new Error(err);
    error.statusCode = 500;
    return next(error);
  }
};

const checkVideoType = (file) => {
  if (file.mimetype === 'video/mp4' ||
    file.mimetype === "video/x-matroska" ||
    file.mimetype === "video/x-msvideo" ||
    file.mimetype === "video/x-flv" || 
    file.mimetype === "video/3gpp"
  ) {
    return true;
  }
  return false;
}; 