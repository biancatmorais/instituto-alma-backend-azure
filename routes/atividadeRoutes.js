const express = require('express');
const router = express.Router();
const atividadeController = require('../controllers/atividadeController');

// Importa os "seguranças" (middlewares)
const { checkAdmin } = require('../middleware/authMiddleware.js');
// (AGORA ESTÁ LIGADO)
const { uploadAtividadeImages } = require('../middleware/uploadMiddleware.js');

// --- ROTAS PÚBLICAS (Qualquer um pode ver) ---
router.get('/', atividadeController.getAtividades);

// --- ROTAS PRIVADAS (Só Admin pode acessar) ---

// (AGORA ESTÁ LIGADO)
// A rota POST agora usa 3 middlewares em sequência:
// 1. Verifica se é Admin
// 2. Faz o upload das imagens
// 3. Salva os dados no banco
router.post('/', checkAdmin, uploadAtividadeImages, atividadeController.createAtividade);

router.delete('/:id', checkAdmin, atividadeController.deleteAtividade);

module.exports = router;