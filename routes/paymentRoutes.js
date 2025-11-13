// routes/paymentRoutes.js

const express = require('express');
const router = express.Router();

// 💡 CORREÇÃO: Importe ambas as funções do controller
const { createPaymentIntent, processStripeWebhook } = require('../controllers/paymentController'); 

// Rota POST para iniciar o processo de doação (chamada pelo seu frontend)
router.post('/create-payment-intent', createPaymentIntent);

// 💡 NOVO: Rota POST para o Stripe Webhook (chamada pelo Stripe)
// É importante que esta rota não use express.json() para que o req.rawBody funcione,
// o que já foi configurado no seu server.js.
router.post('/webhook-stripe', processStripeWebhook); 

module.exports = router;