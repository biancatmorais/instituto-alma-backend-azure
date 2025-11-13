const express = require('express');
const router = express.Router();
const ouvidoriaController = require('../controllers/ouvidoriaController');

// Rota pública para envio de mensagens
router.post('/', ouvidoriaController.submitOuvidoria);

// Rota privada para Admin visualizar mensagens
router.get('/', ouvidoriaController.getMensagens);

module.exports = router;