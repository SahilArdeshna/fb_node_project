const express = require("express");
const { body } = require("express-validator");
const multer = require('multer');

const feedController = require("../controllers/feed");

const router = express.Router();

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/png" ||
    file.mimetype === "video/mp4" ||
    file.mimetype === "video/x-matroska" ||
    file.mimetype === "video/x-msvideo" ||
    file.mimetype === "video/x-flv" || 
    file.mimetype === "video/3gpp"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

router.get("/feed", feedController.getFeeds);

router.post('/feed', multer({ fileFilter }).single('image'), [
  body('text')
    .trim()
], feedController.postFeed);

router.post(
  "/comment",
  [
    body("comment")
      .not()
      .isEmpty()
      .withMessage("Comment must be long enough!")
      .trim()
  ],
  feedController.postComment
);

module.exports = router;
