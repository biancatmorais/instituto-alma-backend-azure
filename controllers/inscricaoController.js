const db = require('../config/db.js');

// 🟢 Criar nova inscrição
exports.createInscricao = async (req, res) => {
  try {
    console.log('--- REQUISIÇÃO POST /api/inscricoes RECEBIDA ---');
    console.log('Dados recebidos:', req.body);

    const { nome, email } = req.body;

    if (!nome || !email) {
      return res.status(400).json({ message: 'Nome e Email são obrigatórios.' });
    }

    // Verifica se o email já está cadastrado
    const [existing] = await db.query("SELECT * FROM inscricoes_eventos WHERE email = ?", [email]);
    if (existing.length > 0) {
      return res.status(409).json({ message: 'Este email já está cadastrado para receber notificações!' });
    }

    // Insere a nova inscrição
    const insertSql = "INSERT INTO inscricoes_eventos (nome, email, data_inscricao) VALUES (?, ?, NOW())";
    const [result] = await db.query(insertSql, [nome, email]);

    console.log('✅ Inscrição salva com ID:', result.insertId);
    res.status(201).json({ message: 'Inscrição realizada com sucesso! Avisaremos sobre novos eventos.' });

  } catch (error) {
    console.error('🚨 Erro ao criar inscrição:', error);
    res.status(500).json({ message: 'Erro no servidor.' });
  }
};

// 🟢 Buscar todas as inscrições (admin)
exports.getInscricoes = async (req, res) => {
  try {
    console.log('--- REQUISIÇÃO GET /api/inscricoes RECEBIDA (ADMIN) ---');
    const sql = `
      SELECT 
        id, 
        nome, 
        email, 
        DATE_FORMAT(data_inscricao, '%d/%m/%Y') AS data_formatada
      FROM inscricoes_eventos
      ORDER BY data_inscricao DESC
    `;

    const [results] = await db.query(sql);

    console.log(`✅ ${results.length} inscrições encontradas.`);
    res.status(200).json(results);

  } catch (error) {
    console.error('🚨 Erro ao buscar inscrições:', error);
    res.status(500).json({ message: 'Erro ao buscar inscrições.' });
  }
};
