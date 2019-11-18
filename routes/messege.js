const express = require('express');
const { body } = require('express-validator');

const messegeController = require('../controllers/messege');

const router = express.Router();

router.get('/messeges/:id', messegeController.getMesseges);

router.get('/chatUser/:id', messegeController.getChatUser);

router.post('/messeges/:id', messegeController.postMessege);

module.exports = router;