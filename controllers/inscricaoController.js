const db = require('../config/db.js');

// --- (Público) CRIAR uma Inscrição ---
exports.createInscricao = (req, res) => {
  try {
    console.log('--- REQUISIÇÃO POST /api/inscricoes RECEBIDA ---'); // <--- LOG DE DEBUG
    console.log('Dados recebidos:', req.body); // <--- LOG DE DEBUG

    const { nome, email } = req.body;

    if (!nome || !email) {
      return res.status(400).json({ message: 'Nome e Email são obrigatórios.' });
    }

    // 1. Verificar se o email JÁ existe
    const checkSql = "SELECT * FROM inscricoes_eventos WHERE email = ?";
    db.query(checkSql, [email], function (err, results) {
        if (err) {
          console.error('Erro de SQL ao verificar email:', err); 
          return res.status(500).json({ message: 'Erro de servidor ao verificar email.' });
        }

        // 2. Se o email já existe, apenas avise
        if (results.length > 0) {
          return res.status(409).json({ message: 'Este email já está cadastrado para receber notificações!' });
        }

        // 3. Se não existe, insira (Com data)
        const insertSql = "INSERT INTO inscricoes_eventos (nome, email, data_inscricao) VALUES (?, ?, NOW())";
        db.query(insertSql, [nome, email], (err, result) => {
          if (err) {
            console.error('--- ERRO FATAL AO SALVAR INSCRIÇÃO ---', err); 
            return res.status(500).json({ message: 'Erro interno ao salvar inscrição.' });
          }
          console.log('Inscrição salva com ID:', result.insertId); // <--- LOG DE SUCESSO
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
    console.log('--- REQUISIÇÃO GET /api/inscricoes RECEBIDA (ADMIN) ---'); // <--- LOG DE DEBUG
    const sql = "SELECT id, nome, email, DATE_FORMAT(data_inscricao, '%d/%m/%Y') AS data_formatada FROM inscricoes_eventos ORDER BY data_inscricao DESC";
    
    db.query(sql, (err, results) => {
      if (err) {
        console.error('Erro ao buscar inscrições (GET):', err);
        return res.status(500).json({ message: 'Erro ao buscar inscrições.' });
      }
      res.status(200).json(results);
    });
  } catch (error) {
    res.status(500).json({ message: 'Erro no servidor.' });
  }
};