const express = require('express');

const notificationCtrl = require('../controllers/notification');

const router = express.Router();

router.get('/notification', notificationCtrl.getNotification);

router.post('/reject', notificationCtrl.rejectRequest);

router.post('/accept', notificationCtrl.acceptRequest);

module.exports = router;