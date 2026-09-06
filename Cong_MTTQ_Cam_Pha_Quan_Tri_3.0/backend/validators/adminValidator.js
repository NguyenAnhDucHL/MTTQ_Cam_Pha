const { body } = require('express-validator');

const updatePetitionStatusValidator = [
  body('status')
    .isString().withMessage('Trạng thái phải là chuỗi')
    .trim()
    .notEmpty().withMessage('Trạng thái không được để trống')
    .isLength({ max: 50 }).withMessage('Trạng thái tối đa 50 ký tự')
    .escape()
];

const updatePetitionNotesValidator = [
  body('notes')
    .optional({ checkFalsy: true })
    .isString().withMessage('Ghi chú phải là chuỗi')
    .trim()
    .isLength({ max: 2000 }).withMessage('Ghi chú tối đa 2000 ký tự')
    .escape()
];

const wardValidator = [
  body('name')
    .isString().withMessage('Tên phường xã phải là chuỗi')
    .trim()
    .notEmpty().withMessage('Tên phường xã không được để trống')
    .isLength({ max: 100 }).withMessage('Tên phường xã tối đa 100 ký tự')
    .escape()
];

const accountValidator = [
  body('username')
    .isString().withMessage('Tên đăng nhập phải là chuỗi')
    .trim()
    .notEmpty().withMessage('Tên đăng nhập không được để trống')
    .isLength({ min: 3, max: 50 }).withMessage('Tên đăng nhập từ 3 đến 50 ký tự')
    .escape(),
  body('password')
    .optional({ checkFalsy: true })
    .isString().withMessage('Mật khẩu phải là chuỗi')
    .trim()
    .isLength({ min: 6, max: 100 }).withMessage('Mật khẩu từ 6 đến 100 ký tự'),
  body('fullName')
    .isString().withMessage('Họ tên phải là chuỗi')
    .trim()
    .notEmpty().withMessage('Họ tên không được để trống')
    .isLength({ max: 100 }).withMessage('Họ tên tối đa 100 ký tự')
    .escape(),
  body('role')
    .isString().withMessage('Vai trò phải là chuỗi')
    .trim()
    .notEmpty().withMessage('Vai trò không được để trống')
    .isLength({ max: 50 }).withMessage('Vai trò tối đa 50 ký tự')
    .escape()
];

const documentValidator = [
  body('number')
    .optional({ checkFalsy: true })
    .isString().withMessage('Số hiệu phải là chuỗi')
    .trim()
    .isLength({ max: 100 }).withMessage('Số hiệu tối đa 100 ký tự')
    .escape(),
  body('name')
    .isString().withMessage('Tên văn bản phải là chuỗi')
    .trim()
    .notEmpty().withMessage('Tên văn bản không được để trống')
    .isLength({ max: 255 }).withMessage('Tên văn bản tối đa 255 ký tự')
    .escape(),
  body('type')
    .isString().withMessage('Loại văn bản phải là chuỗi')
    .trim()
    .notEmpty().withMessage('Loại văn bản không được để trống')
    .isLength({ max: 100 }).withMessage('Loại văn bản tối đa 100 ký tự')
    .escape(),
  body('date')
    .optional({ checkFalsy: true })
    .isString().withMessage('Ngày tháng phải là chuỗi')
    .trim()
    .escape(),
  body('signer')
    .optional({ checkFalsy: true })
    .isString().withMessage('Người ký phải là chuỗi')
    .trim()
    .isLength({ max: 100 }).withMessage('Người ký tối đa 100 ký tự')
    .escape()
];

module.exports = {
  updatePetitionStatusValidator,
  updatePetitionNotesValidator,
  wardValidator,
  accountValidator,
  documentValidator
};
