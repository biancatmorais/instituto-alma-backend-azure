const express = require('express');
const router = express.Router();
const inscricaoController = require('../controllers/inscricaoController');
const { checkAdmin } = require('../middleware/authMiddleware.js');

// --- ROTA PÚBLICA (Para o Modal "Me Notifique") ---
// (POST /api/inscricoes)
router.post('/', inscricaoController.createInscricao);

// --- ROTA PRIVADA (Para o Admin ver a lista) ---
// (GET /api/inscricoes)
router.get('/', checkAdmin, inscricaoController.getInscricoes);

module.exports = router;