const { body, query } = require('express-validator');

const createPetitionValidator = [
  body('fullName')
    .isString().withMessage('Họ và tên phải là chuỗi')
    .trim()
    .notEmpty().withMessage('Vui lòng nhập họ và tên')
    .isLength({ min: 2, max: 100 }).withMessage('Họ và tên phải từ 2 đến 100 ký tự')
    .escape(),
  body('phone')
    .isString().withMessage('Số điện thoại phải là chuỗi')
    .trim()
    .notEmpty().withMessage('Vui lòng nhập số điện thoại')
    .matches(/^[0-9]{9,11}$/).withMessage('Số điện thoại không hợp lệ')
    .escape(),
  body('cccd')
    .optional({ checkFalsy: true })
    .isString().withMessage('CCCD phải là chuỗi')
    .trim()
    .matches(/^[0-9]{12}$/).withMessage('CCCD phải đủ 12 chữ số')
    .escape(),
  body('ward')
    .isString().withMessage('Phường/Xã phải là chuỗi')
    .trim()
    .notEmpty().withMessage('Vui lòng chọn phường/xã')
    .isLength({ max: 100 }).withMessage('Phường xã tối đa 100 ký tự')
    .escape(),
  body('address')
    .isString().withMessage('Địa chỉ phải là chuỗi')
    .trim()
    .notEmpty().withMessage('Vui lòng nhập địa chỉ cụ thể')
    .isLength({ max: 255 }).withMessage('Địa chỉ tối đa 255 ký tự')
    .escape(),
  body('title')
    .isString().withMessage('Tiêu đề phải là chuỗi')
    .trim()
    .notEmpty().withMessage('Vui lòng nhập tiêu đề')
    .isLength({ max: 255 }).withMessage('Tiêu đề tối đa 255 ký tự')
    .escape(),
  body('category')
    .isString().withMessage('Lĩnh vực phải là chuỗi')
    .trim()
    .notEmpty().withMessage('Vui lòng chọn lĩnh vực')
    .isLength({ max: 100 }).withMessage('Lĩnh vực tối đa 100 ký tự')
    .escape(),
  body('content')
    .isString().withMessage('Nội dung phải là chuỗi')
    .trim()
    .notEmpty().withMessage('Vui lòng nhập nội dung')
    .isLength({ max: 5000 }).withMessage('Nội dung tối đa 5000 ký tự')
    .escape()
];

const getPetitionsValidator = [
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page phải là số nguyên dương')
    .toInt(),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limit phải là số nguyên từ 1 đến 100')
    .toInt()
];

module.exports = { createPetitionValidator, getPetitionsValidator };
