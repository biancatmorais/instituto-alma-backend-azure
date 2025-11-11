const express = require('express');
const router = express.Router();
const inscricaoController = require('../controllers/inscricaoController');
const { checkAdmin } = require('../middleware/authMiddleware.js');


router.post('/', inscricaoController.createInscricao);


router.get('/', checkAdmin, inscricaoController.getInscricoes);

module.exports = router;