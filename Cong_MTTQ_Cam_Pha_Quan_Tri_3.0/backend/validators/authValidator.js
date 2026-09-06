const { body } = require('express-validator');

const loginValidator = [
  body('username')
    .isString().withMessage('Tên đăng nhập phải là chuỗi')
    .trim()
    .notEmpty().withMessage('Vui lòng nhập tên đăng nhập')
    .isLength({ max: 100 }).withMessage('Tên đăng nhập tối đa 100 ký tự')
    .escape(),
  body('password')
    .isString().withMessage('Mật khẩu phải là chuỗi')
    .trim()
    .notEmpty().withMessage('Vui lòng nhập mật khẩu')
    .isLength({ max: 100 }).withMessage('Mật khẩu tối đa 100 ký tự')
];

module.exports = { loginValidator };
