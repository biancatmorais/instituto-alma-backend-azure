const db = require('../config/db.js');

// 🟢 Enviar mensagem para a Ouvidoria
exports.submitOuvidoria = async (req, res) => {
  try {
    const { nome, email, telefone, mensagem } = req.body;

    if (!nome || !email || !mensagem) {
      return res.status(400).json({ message: 'Nome, Email e Mensagem são obrigatórios.' });
    }

    const sql = "INSERT INTO ouvidoria (nome, email, telefone, mensagem) VALUES (?, ?, ?, ?)";
    const values = [nome, email, telefone, mensagem];

    const [result] = await db.query(sql, values);

    console.log('✅ Mensagem da Ouvidoria salva com sucesso!');
    console.log('Dados recebidos:', req.body);

    res.status(201).json({ message: 'Mensagem recebida com sucesso! Obrigado pelo seu contato.' });
  } catch (err) {
    console.error('🚨 Erro ao salvar mensagem na Ouvidoria:', err);
    res.status(500).json({ message: 'Erro interno no servidor ao salvar mensagem.' });
  }
};

// 🟢 Listar mensagens da Ouvidoria (para admin)
exports.getMensagens = async (req, res) => {
  try {
    const sql = `
      SELECT id, nome, email, telefone, mensagem,
      DATE_FORMAT(data_envio, '%d/%m/%Y %H:%i') AS data_formatada
      FROM ouvidoria
      ORDER BY data_envio DESC
    `;

    const [results] = await db.query(sql);
    res.status(200).json(results);
  } catch (err) {
    console.error('🚨 Erro ao buscar mensagens da Ouvidoria:', err);
    res.status(500).json({ message: 'Erro interno no servidor ao buscar mensagens.' });
  }
};
