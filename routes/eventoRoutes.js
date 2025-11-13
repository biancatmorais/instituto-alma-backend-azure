const express = require('express');
const router = express.Router();
const eventoController = require('../controllers/eventoController');

// Importa os "seguranças" (middlewares)
const { checkAdmin } = require('../middleware/authMiddleware.js');

// --- ROTAS PÚBLICAS ---
// (GET /api/eventos) - Buscar todos os eventos
router.get('/', eventoController.getEventos);

// (GET /api/eventos/:id) - Buscar um evento específico
router.get('/:id', eventoController.getEventoById);


// --- ROTAS PRIVADAS (Só Admin pode acessar) ---

// (POST /api/eventos) - Criar um novo evento
// Nota: A lógica de console.log foi removida daqui e deve ser colocada no createEvento do Controller, se necessário.
router.post('/', checkAdmin, eventoController.createEvento);


// (PUT /api/eventos/:id) - Atualizar um evento
router.put('/:id', checkAdmin, eventoController.updateEvento);


// (DELETE /api/eventos/:id) - Apagar um evento
router.delete('/:id', checkAdmin, eventoController.deleteEvento);

module.exports = router;