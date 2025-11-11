const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Rota para CRIAR CONTA (Registro)
// (Caminho completo: POST /api/auth/register)
router.post('/register', authController.registerUser);

// Rota para ENTRAR (Login)
// (Caminho completo: POST /api/auth/login)
router.post('/login', authController.loginUser);

module.exports = router;