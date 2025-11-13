const db = require('../config/db.js');

exports.getEventos = (req, res) => {
    try {
        const sql = "SELECT id, titulo, descricao, data_evento, local FROM eventos ORDER BY id DESC";
        
        db.query(sql, (err, results) => {
            if (err) {
                console.error('ERRO CRÍTICO NA QUERY GET EVENTOS:', err);
                return res.status(500).json({ message: 'Erro interno ao buscar eventos.' });
            }
            console.log('GET EVENTOS SUCESSO. Retornando:', results.length, 'registros.');
            res.status(200).json(results);
        });
    } catch (error) {
        res.status(500).json({ message: 'Erro no servidor.' });
    }
};

exports.getEventoById = (req, res) => {
    try {
        const { id } = req.params;
        const sql = "SELECT id, titulo, descricao, data_evento, local FROM eventos WHERE id = ?";
        
        db.query(sql, [id], (err, results) => {
            if (err) {
                console.error('Erro ao buscar evento por ID:', err);
                return res.status(500).json({ message: 'Erro interno ao buscar evento.' });
            }

            if (results.length === 0) {
                return res.status(404).json({ message: 'Evento não encontrado.' });
            }

            res.status(200).json(results[0]); 
        });
    } catch (error) {
        res.status(500).json({ message: 'Erro no servidor.' });
    }
};

exports.createEvento = (req, res) => {
    try {
        const { titulo, descricao, data, local } = req.body; 

        if (!titulo || !descricao || !data || !local) {
            console.error('Tentativa de criação com campos incompletos:', req.body); 
            return res.status(400).json({ message: 'Todos os campos (título, descrição, data, local) são obrigatórios.' });
        }

        const sql = "INSERT INTO eventos (titulo, descricao, data_evento, local) VALUES (?, ?, ?, ?)";
        const values = [titulo, descricao, data, local]; 

        db.query(sql, values, (err, result) => {
            if (err) {
                console.error('Erro ao criar evento:', err);
                return res.status(500).json({ message: 'Erro interno ao salvar evento.' });
            }
            console.log(`--- Novo Evento Criado (ID: ${result.insertId}) ---`, req.body);
            res.status(201).json({ message: 'Evento criado com sucesso!', id: result.insertId });
        });
    } catch (error) {
        res.status(500).json({ message: 'Erro no servidor.' });
    }
};

exports.updateEvento = (req, res) => {
    try {
        const { id } = req.params; 
        const { titulo, descricao, data, local } = req.body;

        if (!titulo || !descricao || !data || !local) {
            return res.status(400).json({ message: 'Todos os campos são obrigatórios para a atualização.' });
        }

        const sql = "UPDATE eventos SET titulo = ?, descricao = ?, data_evento = ?, local = ? WHERE id = ?";
        const values = [titulo, descricao, data, local, id];

        db.query(sql, values, (err, result) => {
            if (err) {
                console.error('Erro ao atualizar evento:', err);
                return res.status(500).json({ message: 'Erro interno ao atualizar evento.' });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({ message: 'Evento não encontrado para atualização.' });
            }

            console.log(`--- Evento ID ${id} Atualizado ---`);
            res.status(200).json({ message: 'Evento atualizado com sucesso.' });
        });
    } catch (error) {
        res.status(500).json({ message: 'Erro no servidor.' });
    }
};

exports.deleteEvento = (req, res) => {
    try {
        const { id } = req.params; 

        const sql = "DELETE FROM eventos WHERE id = ?";
        
        db.query(sql, [id], (err, result) => {
            if (err) {
                console.error('Erro ao deletar evento:', err);
                return res.status(500).json({ message: 'Erro interno ao deletar evento.' });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({ message: 'Evento não encontrado.' });
            }

            console.log(`--- Evento ID ${id} Deletado ---`);
            res.status(200).json({ message: 'Evento deletado com sucesso.' });
        });
    } catch (error) {
        res.status(500).json({ message: 'Erro no servidor.' });
    }
};

module.exports = {
    getEventos: exports.getEventos,
    getEventoById: exports.getEventoById, 
    createEvento: exports.createEvento,
    updateEvento: exports.updateEvento,
    deleteEvento: exports.deleteEvento,
};