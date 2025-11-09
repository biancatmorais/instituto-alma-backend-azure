const express = require('express');
const router = express.Router();
const eventoController = require('../controllers/eventoController');

// Importa nosso "segurança" (middleware)
const { checkAdmin } = require('../middleware/authMiddleware.js');

// --- ROTAS PÚBLICAS (Qualquer um pode ver) ---

// (GET /api/eventos) - Rota para a HomePage buscar os eventos
router.get('/', eventoController.getEventos);

// --- ROTAS PRIVADAS (Só Admin pode acessar) ---

// (POST /api/eventos) - Rota para o Admin criar um evento
// (Usamos o checkAdmin para proteger esta rota)
router.post('/', checkAdmin, eventoController.createEvento);

// (DELETE /api/eventos/:id) - Rota para o Admin deletar um evento
// (Usamos o checkAdmin para proteger esta rota)
router.delete('/:id', checkAdmin, eventoController.deleteEvento);

module.exports = router;