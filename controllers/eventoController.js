const db = require('../config/db.js');

// --- (Público) LER TODOS os Eventos ---
// (Chamado pela HomePage)
exports.getEventos = (req, res) => {
  try {
    // Vamos pegar eventos futuros, ordenados pelo mais próximo
    const sql = "SELECT id, titulo, descricao, DATE_FORMAT(data_evento, '%d/%m/%Y') AS data_formatada, local FROM eventos WHERE data_evento >= CURDATE() ORDER BY data_evento ASC";
    
    db.query(sql, (err, results) => {
      if (err) {
        console.error('Erro ao buscar eventos:', err);
        return res.status(500).json({ message: 'Erro interno ao buscar eventos.' });
      }
      res.status(200).json(results);
    });
  } catch (error) {
    res.status(500).json({ message: 'Erro no servidor.' });
  }
};

// --- (Admin) CRIAR um Evento ---
// (Chamado pela AdminPage)
exports.createEvento = (req, res) => {
  try {
    const { titulo, descricao, data_evento, local } = req.body;

    if (!titulo || !descricao || !data_evento || !local) {
      return res.status(400).json({ message: 'Todos os campos (título, descrição, data, local) são obrigatórios.' });
    }

    const sql = "INSERT INTO eventos (titulo, descricao, data_evento, local) VALUES (?, ?, ?, ?)";
    const values = [titulo, descricao, data_evento, local];

    db.query(sql, values, (err, result) => {
      if (err) {
        console.error('Erro ao criar evento:', err);
        return res.status(500).json({ message: 'Erro interno ao salvar evento.' });
      }
      console.log('--- Novo Evento Criado ---', req.body);
      res.status(201).json({ message: 'Evento criado com sucesso!', id: result.insertId });
    });
  } catch (error) {
    res.status(500).json({ message: 'Erro no servidor.' });
  }
};

// --- (Admin) DELETAR um Evento ---
// (Chamado pela AdminPage)
exports.deleteEvento = (req, res) => {
  try {
    // O :id virá da URL (ex: /api/eventos/5)
    const { id } = req.params; 

    const sql = "DELETE FROM eventos WHERE id = ?";
    
    db.query(sql, [id], (err, result) => {
      if (err) {
        console.error('Erro ao deletar evento:', err);
        return res.status(500).json({ message: 'Erro interno ao deletar evento.' });
      }

      if (result.affectedRows === 0) {
        // Se o ID não existia
        return res.status(404).json({ message: 'Evento não encontrado.' });
      }

      console.log(`--- Evento ID ${id} Deletado ---`);
      res.status(200).json({ message: 'Evento deletado com sucesso.' });
    });
  } catch (error) {
    res.status(500).json({ message: 'Erro no servidor.' });
  }
};