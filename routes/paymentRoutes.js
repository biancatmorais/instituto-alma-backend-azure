// routes/paymentRoutes.js

const express = require('express');
const router = express.Router();
// ATENÇÃO: Ajuste o caminho conforme a localização do seu Controller
const { createPaymentIntent } = require('../controllers/paymentController'); 

// Rota POST para iniciar o processo de doação
router.post('/create-payment-intent', createPaymentIntent);

module.exports = router;