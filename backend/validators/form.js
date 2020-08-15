const { check } = require('express-validator');

exports.contactFormValidator = [
    check('name')
        .not()
        .isEmpty()
        .withMessage('Your name is required'),
    check('email')
        .isEmail()
        .withMessage('Must be valid email')
    check('message')
        .not()
        .isEmpty()
        .isLength({ min: 10 })
        .withMessage('Message must be at least 10 characters long')
];