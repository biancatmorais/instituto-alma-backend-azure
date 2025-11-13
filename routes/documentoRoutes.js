const express = require('express');
const router = express.Router();
const documentoController = require('../controllers/documentoController');


const { checkAdmin } = require('../middleware/authMiddleware.js');
const { uploadPdf } = require('../middleware/uploadPdfMiddleware.js'); 

router.get('/', documentoController.getDocumentos);

router.get('/:id', documentoController.getOneDocumento);

router.post('/', checkAdmin, uploadPdf, documentoController.createDocumento);

router.put('/:id', checkAdmin, uploadPdf, documentoController.updateDocumento);

router.delete('/:id', checkAdmin, documentoController.deleteDocumento);

module.exports = router;