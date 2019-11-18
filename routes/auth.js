const express = require('express');
const { body } = require('express-validator');

const authController = require('../controllers/auth');

const router = express.Router();

router.get('/', authController.loginAndSignup);

router.post('/signup', [
    body('firstname')
        .not()
        .isEmpty()
        .withMessage('Please enter firstname')
        .trim(),
    body('surname')
        .not()
        .isEmpty()
        .withMessage('Please enter surname')
        .trim(),
    body('email')
        .isEmail()
        .withMessage('Please enter valid email')
        .normalizeEmail(),
    body('password', "Please enter password with only numbers and text and at least 5 characters.")
        .isLength({ min: 5, max: 18 })
        .isAlphanumeric()
        .trim()
], authController.postSignup);

router.get('/login', authController.getLogin);

router.post('/login', [
    body('email')
        .isEmail()
        .withMessage('Please enter valid email')
        .normalizeEmail(),
    body('password', 'Please enter password with only numbers and text and at least 5 characters.')
        .isLength({ min: 5, max: 18 })
        .isAlphanumeric()
        .trim()
],
authController.postLogin);

router.post('/logout', authController.logout);

module.exports = router;