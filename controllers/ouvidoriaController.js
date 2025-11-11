const db = require('../config/db.js');

exports.submitOuvidoria = (req, res) => {
    try {
        const { nome, email, telefone, mensagem } = req.body;

        if (!nome || !email || !mensagem) {
            return res.status(400).json({ message: 'Nome, Email e Mensagem são obrigatórios.' });
        }

        const sql = "INSERT INTO ouvidoria (nome, email, telefone, mensagem) VALUES (?, ?, ?, ?)";
        const values = [nome, email, telefone, mensagem];

        db.query(sql, values, (err, result) => {
            if (err) {
                console.error('Erro ao salvar no banco:', err);
                return res.status(500).json({ message: 'Erro interno no servidor ao salvar mensagem.' });
            }
            
            console.log('--- Mensagem da Ouvidoria SALVA NO BANCO ---');
            console.log(req.body); 
            
            res.status(201).json({ message: 'Mensagem recebida com sucesso! Obrigado pelo seu contato.' });
        });

    } catch (error) {
        console.error('Erro no controller da ouvidoria:', error);
        res.status(500).json({ message: 'Erro interno no servidor.' });
    }
};

exports.getMensagens = (req, res) => {
    try {
        const sql = "SELECT id, nome, email, telefone, mensagem, DATE_FORMAT(data_envio, '%d/%m/%Y %H:%i') AS data_formatada FROM ouvidoria ORDER BY data_envio DESC";

        db.query(sql, (err, results) => {
            if (err) {
                console.error('Erro ao buscar no banco:', err);
                return res.status(500).json({ message: 'Erro interno no servidor ao buscar mensagens.' });
            }

            res.status(200).json(results);
        });

    } catch (error) {
        console.error('Erro no controller getMensagens:', error);
        res.status(500).json({ message: 'Erro interno no servidor.' });
    }
};