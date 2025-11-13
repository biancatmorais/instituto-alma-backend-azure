const express = require('express');
const router = express.Router();
const cors = require('cors'); 
const atividadeController = require('../controllers/atividadeController'); 


const { checkAdmin } = require('../middleware/authMiddleware.js');

const { uploadAtividadeImages } = require('../middleware/uploadMiddleware.js');


const corsOptions = {
    origin: '*', 
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
};


router.get('/', atividadeController.getAtividades);




router.get('/:id', cors(corsOptions), checkAdmin, atividadeController.getAtividadeById);


router.post('/', cors(corsOptions), checkAdmin, uploadAtividadeImages, atividadeController.createAtividade);


router.put('/:id', cors(corsOptions), checkAdmin, uploadAtividadeImages, atividadeController.updateAtividade);


router.delete('/:id', cors(corsOptions), checkAdmin, atividadeController.deleteAtividade);

module.exports = router;