const db = require('../config/db.js');

// 🟢 Buscar todos os eventos
exports.getEventos = async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT id, titulo, descricao, data_evento, local FROM eventos ORDER BY id DESC"
    );
    console.log('✅ GET EVENTOS SUCESSO. Registros retornados:', rows.length);
    res.status(200).json(rows);
  } catch (error) {
    console.error('🚨 ERRO CRÍTICO NA QUERY GET EVENTOS:', error);
    res.status(500).json({ message: 'Erro interno ao buscar eventos.' });
  }
};

// 🟢 Buscar evento por ID
exports.getEventoById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query(
      "SELECT id, titulo, descricao, data_evento, local FROM eventos WHERE id = ?",
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Evento não encontrado.' });
    }

    res.status(200).json(rows[0]);
  } catch (error) {
    console.error('🚨 Erro ao buscar evento por ID:', error);
    res.status(500).json({ message: 'Erro interno ao buscar evento.' });
  }
};

// 🟢 Criar novo evento
exports.createEvento = async (req, res) => {
  try {
    const { titulo, descricao, data, local } = req.body;

    if (!titulo || !descricao || !data || !local) {
      console.warn('⚠️ Tentativa de criação com campos incompletos:', req.body);
      return res.status(400).json({
        message: 'Todos os campos (título, descrição, data, local) são obrigatórios.'
      });
    }

    const sql = "INSERT INTO eventos (titulo, descricao, data_evento, local) VALUES (?, ?, ?, ?)";
    const [result] = await db.query(sql, [titulo, descricao, data, local]);

    console.log(`🎉 Novo Evento Criado (ID: ${result.insertId})`, req.body);
    res.status(201).json({ message: 'Evento criado com sucesso!', id: result.insertId });
  } catch (error) {
    console.error('🚨 Erro ao criar evento:', error);
    res.status(500).json({ message: 'Erro interno ao salvar evento.' });
  }
};

// 🟢 Atualizar evento existente
exports.updateEvento = async (req, res) => {
  try {
    const { id } = req.params;
    const { titulo, descricao, data, local } = req.body;

    if (!titulo || !descricao || !data || !local) {
      return res.status(400).json({ message: 'Todos os campos são obrigatórios para a atualização.' });
    }

    const sql = "UPDATE eventos SET titulo = ?, descricao = ?, data_evento = ?, local = ? WHERE id = ?";
    const [result] = await db.query(sql, [titulo, descricao, data, local, id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Evento não encontrado para atualização.' });
    }

    console.log(`🛠️ Evento ID ${id} Atualizado`);
    res.status(200).json({ message: 'Evento atualizado com sucesso.' });
  } catch (error) {
    console.error('🚨 Erro ao atualizar evento:', error);
    res.status(500).json({ message: 'Erro interno ao atualizar evento.' });
  }
};

// 🟢 Deletar evento
exports.deleteEvento = async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await db.query("DELETE FROM eventos WHERE id = ?", [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Evento não encontrado.' });
    }

    console.log(`🗑️ Evento ID ${id} Deletado`);
    res.status(200).json({ message: 'Evento deletado com sucesso.' });
  } catch (error) {
    console.error('🚨 Erro ao deletar evento:', error);
    res.status(500).json({ message: 'Erro interno ao deletar evento.' });
  }
};
