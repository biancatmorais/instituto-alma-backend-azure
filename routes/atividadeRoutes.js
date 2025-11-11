const express = require('express');
const router = express.Router();
const cors = require('cors'); 
// AQUI: Certifique-se que o nome do arquivo está correto.
const atividadeController = require('../controllers/atividadeController'); 

// Importa os "seguranças" (middlewares)
// Verifique se o caminho abaixo está correto em relação à sua pasta 'routes'
const { checkAdmin } = require('../middleware/authMiddleware.js');
const { uploadAtividadeImages } = require('../middleware/uploadMiddleware.js');

// Configuração do CORS
const corsOptions = {
    origin: '*', 
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
};

// --- ROTAS PÚBLICAS ---
router.get('/', atividadeController.getAtividades);

// --- ROTAS PRIVADAS ---

// Rota para LER UMA ATIVIDADE ESPECÍFICA POR ID
router.get('/:id', cors(corsOptions), checkAdmin, atividadeController.getAtividadeById);

// Rota para CRIAR (LINHA 28 no seu erro)
router.post('/', cors(corsOptions), checkAdmin, uploadAtividadeImages, atividadeController.createAtividade);

// Rota para ATUALIZAR
router.put('/:id', cors(corsOptions), checkAdmin, uploadAtividadeImages, atividadeController.updateAtividade);

// Rota para DELETAR
router.delete('/:id', cors(corsOptions), checkAdmin, atividadeController.deleteAtividade);

module.exports = router;