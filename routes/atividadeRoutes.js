const express = require('express');
const router = express.Router();
const atividadeController = require('../controllers/atividadeController');


const { checkAdmin } = require('../middleware/authMiddleware.js');

const { uploadAtividadeImages } = require('../middleware/uploadMiddleware.js');


router.get('/', atividadeController.getAtividades);

router.get('/:id', checkAdmin, atividadeController.getAtividadeById);

router.post('/', checkAdmin, uploadAtividadeImages, atividadeController.createAtividade);

router.put('/:id', checkAdmin, uploadAtividadeImages, atividadeController.updateAtividade);

router.delete('/:id', checkAdmin, atividadeController.deleteAtividade);

module.exports = router;