const express = require('express');
const router = express.Router();
const metaController = require('../controllers/metaController');

// Importa o "segurança"
const { checkAdmin } = require('../middleware/authMiddleware.js');

// --- ROTAS PÚBLICAS ---
// (GET /api/metas) - Para o público ver as metas
router.get('/', metaController.getMetas);

// (GET /api/metas/:id) - Para o modal de edição buscar 1 meta
router.get('/:id', metaController.getOneMeta);


// --- ROTAS PRIVADAS (Só Admin) ---
// (POST /api/metas)
router.post('/', checkAdmin, metaController.createMeta);

// (PUT /api/metas/:id)
router.put('/:id', checkAdmin, metaController.updateMeta);

// (DELETE /api/metas/:id)
router.delete('/:id', checkAdmin, metaController.deleteMeta);

module.exports = router;