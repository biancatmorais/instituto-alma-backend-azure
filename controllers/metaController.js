const db = require('../config/db.js');

// --- (Público) LER TODAS as Metas ---
exports.getMetas = (req, res) => {
  const sql = "SELECT * FROM metas ORDER BY id DESC LIMIT 4"; // Limite de 4 metas
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ message: 'Erro ao buscar metas.' });
    res.status(200).json(results);
  });
};

// --- (Admin) LER UMA Meta (para o Modal de Edição) ---
exports.getOneMeta = (req, res) => {
  const { id } = req.params;
  const sql = "SELECT * FROM metas WHERE id = ?";
  db.query(sql, [id], (err, results) => {
    if (err) return res.status(500).json({ message: 'Erro ao buscar meta.' });
    if (results.length === 0) return res.status(404).json({ message: 'Meta não encontrada.' });
    res.status(200).json(results[0]);
  });
};

// --- (Admin) CRIAR uma Meta ---
exports.createMeta = (req, res) => {
  try {
    const { titulo, valor_meta } = req.body;
    // O valor_atual começa em 0
    const valor_atual = 0; 

    if (!titulo || !valor_meta) {
      return res.status(400).json({ message: 'Título e Valor da Meta são obrigatórios.' });
    }

    const sql = "INSERT INTO metas (titulo, valor_meta, valor_atual) VALUES (?, ?, ?)";
    db.query(sql, [titulo, valor_meta, valor_atual], (err, result) => {
      if (err) {
        console.error('Erro ao criar meta:', err);
        return res.status(500).json({ message: 'Erro interno ao salvar meta.' });
      }
      res.status(201).json({ message: 'Meta criada com sucesso!', id: result.insertId });
    });
  } catch (error) {
    res.status(500).json({ message: 'Erro no servidor.' });
  }
};

// --- (Admin) ATUALIZAR uma Meta (Editar) ---
exports.updateMeta = (req, res) => {
  try {
    const { id } = req.params;
    // O Admin pode atualizar os 3 campos no modal de edição
    const { titulo, valor_meta, valor_atual } = req.body;

    if (!titulo || !valor_meta || valor_atual === undefined) {
      return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });
    }

    const sql = "UPDATE metas SET titulo = ?, valor_meta = ?, valor_atual = ? WHERE id = ?";
    const values = [titulo, valor_meta, valor_atual, id];

    db.query(sql, values, (err, result) => {
      if (err) {
        console.error('Erro ao atualizar meta:', err);
        return res.status(500).json({ message: 'Erro ao atualizar meta.' });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Meta não encontrada.' });
      }
      res.status(200).json({ message: 'Meta atualizada com sucesso.' });
    });
  } catch (error) {
    res.status(500).json({ message: 'Erro no servidor.' });
  }
};

// --- (Admin) DELETAR uma Meta ---
exports.deleteMeta = (req, res) => {
  try {
    const { id } = req.params;
    const sql = "DELETE FROM metas WHERE id = ?";
    
    db.query(sql, [id], (err, result) => {
      if (err) {
        console.error('Erro ao deletar meta:', err);
        return res.status(500).json({ message: 'Erro ao deletar meta.' });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Meta não encontrada.' });
      }
      res.status(200).json({ message: 'Meta deletada com sucesso.' });
    });
  } catch (error) {
    res.status(500).json({ message: 'Erro no servidor.' });
  }
};