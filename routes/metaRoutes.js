const express = require('express');
const router = express.Router();
const metaController = require('../controllers/metaController');

const { checkAdmin } = require('../middleware/authMiddleware.js');

router.get('/', metaController.getMetas);
router.get('/:id', metaController.getOneMeta);

router.post('/', checkAdmin, metaController.createMeta);

router.put('/:id', checkAdmin, metaController.updateMeta);

router.delete('/:id', checkAdmin, metaController.deleteMeta);

module.exports = router;