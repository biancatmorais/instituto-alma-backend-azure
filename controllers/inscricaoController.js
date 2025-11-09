const db = require('../config/db.js');

// --- (Público) CRIAR uma Inscrição ---
exports.createInscricao = (req, res) => {
  try {
    const { nome, email } = req.body;

    if (!nome || !email) {
      return res.status(400).json({ message: 'Nome e Email são obrigatórios.' });
    }

    // 1. Verificar se o email JÁ existe
    const checkSql = "SELECT * FROM inscricoes_eventos WHERE email = ?";
    db.query(checkSql, [email], (err, results) => {
      if (err) {
        return res.status(500).json({ message: 'Erro de servidor ao verificar email.' });
      }
      
      // 2. Se o email já existe, apenas avise
      if (results.length > 0) {
        return res.status(409).json({ message: 'Este email já está cadastrado para receber notificações!' }); // 409 = Conflito
      }

      // 3. Se não existe, insira
      const insertSql = "INSERT INTO inscricoes_eventos (nome, email) VALUES (?, ?)";
      db.query(insertSql, [nome, email], (err, result) => {
        if (err) {
          console.error('Erro ao salvar inscrição:', err);
          return res.status(500).json({ message: 'Erro interno ao salvar inscrição.' });
        }
        res.status(201).json({ message: 'Inscrição realizada com sucesso! Avisaremos sobre novos eventos.' });
      });
    });

  } catch (error) {
    res.status(500).json({ message: 'Erro no servidor.' });
  }
};

// --- (Admin) LER TODAS as Inscrições ---
exports.getInscricoes = (req, res) => {
  try {
    const sql = "SELECT id, nome, email, DATE_FORMAT(data_inscricao, '%d/%m/%Y') AS data_formatada FROM inscricoes_eventos ORDER BY data_inscricao DESC";
    
    db.query(sql, (err, results) => {
      if (err) {
        console.error('Erro ao buscar inscrições:', err);
        return res.status(500).json({ message: 'Erro ao buscar inscrições.' });
      }
      res.status(200).json(results);
    });
  } catch (error) {
    res.status(500).json({ message: 'Erro no servidor.' });
  }
};