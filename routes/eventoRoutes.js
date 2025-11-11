const express = require('express');
const router = express.Router();
const eventoController = require('../controllers/eventoController');


const { checkAdmin } = require('../middleware/authMiddleware.js');




router.get('/', eventoController.getEventos); 

router.get('/:id', eventoController.getEventoById); 


router.post('/', checkAdmin, (req, res) => {
    
    console.log('--- API EVENTOS: REQ.BODY RECEBIDO DO FRONTEND ---');
    console.log(req.body);
    console.log('--------------------------------------------------');
   
    eventoController.createEvento(req, res);
});


router.put('/:id', checkAdmin, eventoController.updateEvento); 


router.delete('/:id', checkAdmin, eventoController.deleteEvento);

module.exports = router;