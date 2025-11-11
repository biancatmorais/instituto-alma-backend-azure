const express = require('express');
const router = express.Router();
const documentoController = require('../controllers/documentoController');

// Importa os "seguranças" (middlewares)
const { checkAdmin } = require('../middleware/authMiddleware.js');
const { uploadPdf } = require('../middleware/uploadPdfMiddleware.js'); // O nosso novo upload de PDF

// --- ROTAS PÚBLICAS (Qualquer um pode ver) ---
// (GET /api/documentos) - Rota para a HomePage/RelatoriosPage buscar os PDFs
router.get('/', documentoController.getDocumentos);

// (GET /api/documentos/:id) - Rota para o modal de Edição buscar 1 documento
router.get('/:id', documentoController.getOneDocumento);


// --- ROTAS PRIVADAS (Só Admin pode acessar) ---
// (POST /api/documentos) - Rota para o Admin criar um documento
router.post('/', checkAdmin, uploadPdf, documentoController.createDocumento);

// (PUT /api/documentos/:id) - Rota para o Admin editar um documento
router.put('/:id', checkAdmin, uploadPdf, documentoController.updateDocumento);

// (DELETE /api/documentos/:id) - Rota para o Admin apagar um documento
router.delete('/:id', checkAdmin, documentoController.deleteDocumento);

module.exports = router;