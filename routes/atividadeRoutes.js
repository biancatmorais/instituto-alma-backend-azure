const express = require('express');
const router = express.Router();
// CORS NÃO É MAIS NECESSÁRIO AQUI, POIS É APLICADO GLOBALMENTE NO server.js
// const cors = require('cors');

// AQUI: Certifique-se que o nome do arquivo está correto.
const atividadeController = require('../controllers/atividadeController');

// Importa os "seguranças" (middlewares)
// Verifique se o caminho abaixo está correto em relação à sua pasta 'routes'
const { checkAdmin } = require('../middleware/authMiddleware.js');
const { uploadAtividadeImages } = require('../middleware/uploadMiddleware.js');

// Configuração do CORS - REMOVIDO pois já é feito no server.js
// const corsOptions = {
//     origin: '*',
//     methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
//     allowedHeaders: ['Content-Type', 'Authorization'],
// };

// --- ROTAS PÚBLICAS ---
router.get('/', atividadeController.getAtividades);

// --- ROTAS PRIVADAS ---

// Rota para LER UMA ATIVIDADE ESPECÍFICA POR ID
// REMOVIDO: cors(corsOptions)
router.get('/:id', checkAdmin, atividadeController.getAtividadeById);

// Rota para CRIAR
// REMOVIDO: cors(corsOptions)
router.post('/', checkAdmin, uploadAtividadeImages, atividadeController.createAtividade);

// Rota para ATUALIZAR
// REMOVIDO: cors(corsOptions)
router.put('/:id', checkAdmin, uploadAtividadeImages, atividadeController.updateAtividade);

// Rota para DELETAR
// REMOVIDO: cors(corsOptions)
router.delete('/:id', checkAdmin, atividadeController.deleteAtividade);

module.exports = router;