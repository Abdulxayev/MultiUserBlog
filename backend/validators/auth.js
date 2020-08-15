const { cheack } = require('express-validator');

exports.userSignupValidator = [
    check('name')
        .not()
        .isEmpty()
        .withMessage('Your name is required'),
    check('email')
        .isEmail()
        .withMessage('Type valid mail'),
    check('password')
        .isLength({ min: 3 })
        .withMessage('Password must be at least 3 characters for hacking')
];

exports.userSigninValidator = [
    check('email')
        .isEmail()
        .withMessage('Type valid email'),
    check('password')
        .isLength({ min: 3 })
        .withMessage('Password must be at least 3 characters for hacking')
];

exports.forgotPasswordValidator = [
    chech('email')
        .not()
        .isEmpty()
        .isEmail()
        .withMessage('Type valid email')
];

exports.resetPasswordValidator = [
    check('newPssword')
        .not()
        .isEmpty()
        .isLength({ min: 3 })
        .withMEssage('Password must be at least 3 characters for hacking hahaha')
];
