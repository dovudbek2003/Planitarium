const { Router } = require('express');
const { header, param } = require('express-validator');

const {
  create,
  findAll,
  findOne,
  update,
  remove,
} = require('../controllers/star.controller');

const upload = require('../middlewares/file-upload');
const { protected, adminAccess, apiKeyAccess } = require('../middlewares/auth');

const router = new Router();

router.post('/', [protected, adminAccess, upload.single('image')], create);
router.get(
  '/',
  [
    header('apikey')
      .exists()
      .withMessage('apikey header is required')
      .isString()
      .withMessage('apikey header must be a string')
      .notEmpty()
      .withMessage('apikey header cannot be empty'),
    apiKeyAccess,
  ],
  findAll
);
router.get(
  '/:id',
  [
    header('apikey')
      .exists()
      .withMessage('apikey header is required')
      .isString()
      .withMessage('apikey header must be a string')
      .notEmpty()
      .withMessage('apikey header cannot be empty'),
    param('id', 'Invalid MongoDB ID').isMongoId(),
    apiKeyAccess,
  ],
  findOne
);
router.put(
  '/:id',
  [param('id', 'Invalid MongoDB ID').isMongoId(), protected, adminAccess],
  update
);
router.delete(
  '/:id',
  [param('id', 'Invalid MongoDB ID').isMongoId(), protected, adminAccess],
  remove
);

module.exports = router;
