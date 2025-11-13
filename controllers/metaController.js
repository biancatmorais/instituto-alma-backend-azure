const db = require('../config/db.js');

// 🟢 Buscar últimas metas (limite de 4)
exports.getMetas = async (req, res) => {
  try {
    const sql = "SELECT * FROM metas ORDER BY id DESC LIMIT 4";
    const [results] = await db.query(sql);
    res.status(200).json(results);
  } catch (err) {
    console.error('🚨 Erro ao buscar metas:', err);
    res.status(500).json({ message: 'Erro ao buscar metas.' });
  }
};

// 🟢 Buscar meta por ID
exports.getOneMeta = async (req, res) => {
  try {
    const { id } = req.params;
    const [results] = await db.query("SELECT * FROM metas WHERE id = ?", [id]);
    if (results.length === 0) {
      return res.status(404).json({ message: 'Meta não encontrada.' });
    }
    res.status(200).json(results[0]);
  } catch (err) {
    console.error('🚨 Erro ao buscar meta:', err);
    res.status(500).json({ message: 'Erro ao buscar meta.' });
  }
};

// 🟢 Criar nova meta
exports.createMeta = async (req, res) => {
  try {
    const { titulo, valor_meta } = req.body;
    const valor_atual = 0;

    if (!titulo || !valor_meta) {
      return res.status(400).json({ message: 'Título e Valor da Meta são obrigatórios.' });
    }

    const sql = "INSERT INTO metas (titulo, valor_meta, valor_atual) VALUES (?, ?, ?)";
    const [result] = await db.query(sql, [titulo, valor_meta, valor_atual]);

    console.log(`✅ Meta criada com ID: ${result.insertId}`);
    res.status(201).json({ message: 'Meta criada com sucesso!', id: result.insertId });
  } catch (err) {
    console.error('🚨 Erro ao criar meta:', err);
    res.status(500).json({ message: 'Erro interno ao salvar meta.' });
  }
};

// 🟢 Atualizar meta existente
exports.updateMeta = async (req, res) => {
  try {
    const { id } = req.params;
    const { titulo, valor_meta, valor_atual } = req.body;

    if (!titulo || !valor_meta || valor_atual === undefined) {
      return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });
    }

    const sql = "UPDATE metas SET titulo = ?, valor_meta = ?, valor_atual = ? WHERE id = ?";
    const [result] = await db.query(sql, [titulo, valor_meta, valor_atual, id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Meta não encontrada.' });
    }

    console.log(`✅ Meta ID ${id} atualizada com sucesso.`);
    res.status(200).json({ message: 'Meta atualizada com sucesso.' });
  } catch (err) {
    console.error('🚨 Erro ao atualizar meta:', err);
    res.status(500).json({ message: 'Erro ao atualizar meta.' });
  }
};

// 🟢 Deletar meta
exports.deleteMeta = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.query("DELETE FROM metas WHERE id = ?", [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Meta não encontrada.' });
    }

    console.log(`🗑️ Meta ID ${id} deletada.`);
    res.status(200).json({ message: 'Meta deletada com sucesso.' });
  } catch (err) {
    console.error('🚨 Erro ao deletar meta:', err);
    res.status(500).json({ message: 'Erro ao deletar meta.' });
  }
};
