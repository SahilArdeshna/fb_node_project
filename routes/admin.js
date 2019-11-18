const express = require("express");
const multer = require("multer");

const adminController = require("../controllers/admin");

const router = express.Router();

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/png"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

router.get("/admin/:id", adminController.getProfile);

router.post("/admin/:id/deleteFeed", adminController.deleteFeed);

router.post(
  "/coverImage",
  multer({ fileFilter }).single("coverImage"),
  adminController.postCoverImage
);

router.post(
  "/profileImage",
  multer({ fileFilter }).single("profileImage"),
  adminController.postProfileImage
);

router.get("/admin/:id/friends", adminController.friends);

module.exports = router;