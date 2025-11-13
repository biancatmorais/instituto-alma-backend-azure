const express = require('express');
const router = express.Router();
const metaController = require('../controllers/metaController');


const { checkAdmin } = require('../middleware/authMiddleware.js');

// --- ROTAS PÚBLICAS ---
// (GET /api/metas) - Buscar todas as metas
router.get('/', metaController.getMetas);

// (GET /api/metas/:id) - Buscar uma meta específica
router.get('/:id', metaController.getOneMeta);


// --- ROTAS PRIVADAS (Só Admin pode acessar) ---

// (POST /api/metas) - Criar uma nova meta
router.post('/', checkAdmin, metaController.createMeta);

// (PUT /api/metas/:id) - Atualizar uma meta
router.put('/:id', checkAdmin, metaController.updateMeta);

// (DELETE /api/metas/:id) - Apagar uma meta
router.delete('/:id', checkAdmin, metaController.deleteMeta);

module.exports = router;