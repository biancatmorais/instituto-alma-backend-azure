const express = require('express');
const router = express.Router();
const pagamentoController = require('../controllers/pagamentoController');

// Rota 1: Início da Doação
// POST /api/pagamentos/preferencia
router.post('/preferencia', pagamentoController.criarPreferencia);

// Rota 2: Webhook (Chamada pelo Mercado Pago)
// POST /api/pagamentos/webhook
router.post('/webhook', pagamentoController.receberWebhook); 

module.exports = router;