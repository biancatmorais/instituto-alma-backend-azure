const express = require('express');
const router = express.Router();
// Certifique-se de que o caminho para o seu controlador está correto:
const pagamentoController = require('../controllers/pagamentoController'); 

// Rota 1: Início da Doação
// POST /api/pagamentos/preferencia
// Chamada pelo Frontend (DoarPage.jsx) para criar o link de pagamento.
router.post('/preferencia', pagamentoController.criarPreferencia);

// Rota 2: Webhook (Chamada pelo Mercado Pago)
// POST /api/pagamentos/webhook
// Rota que recebe notificações automáticas sobre o status do pagamento.
router.post('/webhook', pagamentoController.receberWebhook); 

module.exports = router;