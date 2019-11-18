const express = require("express");
const { body } = require("express-validator");

const searchController = require("../controllers/search");

const router = express.Router();

router.post("/search", [
    body('personname')
        .trim()
], searchController.search);

router.get("/search", searchController.getSearch);

module.exports = router;
