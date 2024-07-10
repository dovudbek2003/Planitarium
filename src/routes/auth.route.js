const { Router } = require('express');
const { body } = require('express-validator');

const {
  register,
  login,
  getProfile,
  update,
  updatePassword,
  activateProfile,
  paymentBalance,
} = require('../controllers/auth.controller');
const { protected } = require('../middlewares/auth');

const router = new Router();

router.post(
  '/register',
  [
    body('name', 'Name can contain only alphabetical characters').isAlpha(),
    body('email', 'Please enter valid email address').isEmail(),
    body('password', 'Password must be at least 6 characters').isLength({
      min: 6,
      max: 6,
    }),
  ],
  register
);
router.post(
  '/login',
  [
    body('email', 'Please enter valid email address').isEmail(),
    body('password', 'Password must be at least 6 characters').isLength({
      min: 6,
      max: 6,
    }),
  ],
  login
);
router.get('/profile', protected, getProfile);
router.put(
  '/update',
  [
    body('name', 'Name can contain only alphabetical characters').isAlpha(),
    body('email', 'Please enter valid email address').isEmail(),
  ],
  protected,
  update
);
router.put(
  '/update-password',
  [
    body('oldPassword')
      .isString()
      .withMessage('Password must be a string')
      .isLength({ min: 6, max: 6 })
      .withMessage('Password must be at least 6 characters'),
    body('newPassword')
      .isString()
      .withMessage('Password must be a string')
      .isLength({ min: 6, max: 6 })
      .withMessage('Password must be at least 6 characters'),
  ],
  protected,
  updatePassword
);
router.put(
  '/payment-balance',
  [
    body('payment')
      .custom((value) => {
        if (typeof value !== 'number') {
          throw new Error('payment must be a number');
        }
        return true;
      })
      .isInt()
      .withMessage('payment must be an integer'),
  ],
  protected,
  paymentBalance
);
router.put('/activate', protected, activateProfile);

module.exports = router;
