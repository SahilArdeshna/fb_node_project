const express = require('express');

const friReqController = require('../controllers/friendRequest');

const router = express.Router();

router.post('/sendRequest', friReqController.sendFriendReq);

router.post('/cancleRequest', friReqController.cancelFriendReq);

router.post("/unfriend", friReqController.unfriend);

module.exports = router;