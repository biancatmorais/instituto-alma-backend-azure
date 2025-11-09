const express = require('express');
const router = express.Router();
const ouvidoriaController = require('../controllers/ouvidoriaController');

// 1. IMPORTAR O NOSSO NOVO "SEGURANÇA"
const { checkAdmin } = require('../middleware/authMiddleware.js');

// Rota para ENVIAR mensagem (Pública - qualquer um pode enviar)
router.post('/', ouvidoriaController.submitOuvidoria);

// Rota para LER as mensagens (Protegida)
// 2. APLICAR O "SEGURANÇA" AQUI
// (Agora, só quem passar no 'checkAdmin' chega no 'ouvidoriaController.getMensagens')
router.get('/', checkAdmin, ouvidoriaController.getMensagens);

module.exports = router;