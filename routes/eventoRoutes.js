const express = require('express');
const router = express.Router();
const eventoController = require('../controllers/eventoController');

// Importa nosso "segurança" (middleware)
const { checkAdmin } = require('../middleware/authMiddleware.js');

// --- ROTAS PÚBLICAS GERAIS (GET) ---

// 1. (GET /api/eventos) - Rota para a HomePage e AdminPage buscarem TODOS os eventos
// Esta rota é CRUCIAL para carregar as listas e o calendário.
router.get('/', eventoController.getEventos); 


// 2. (GET /api/eventos/:id) - Rota para buscar um evento específico
// Esta rota é PÚBLICA porque a HomePage precisa dela para o modal (se for o caso)
// ou para que o EditModal na AdminPage possa carregar os dados.
router.get('/:id', eventoController.getEventoById); 


// --- ROTAS PRIVADAS (Requer Autenticação Admin) ---

// 3. (POST /api/eventos) - Rota para o Admin criar um evento
router.post('/', checkAdmin, (req, res) => {
    // Código de Debugging Mantido
    console.log('--- API EVENTOS: REQ.BODY RECEBIDO DO FRONTEND ---');
    console.log(req.body);
    console.log('--------------------------------------------------');
    // Chama a função do controller
    eventoController.createEvento(req, res);
});

// 4. (PUT /api/eventos/:id) - Rota para o Admin editar um evento
router.put('/:id', checkAdmin, eventoController.updateEvento); 

// 5. (DELETE /api/eventos/:id) - Rota para o Admin deletar um evento
router.delete('/:id', checkAdmin, eventoController.deleteEvento);

module.exports = router;