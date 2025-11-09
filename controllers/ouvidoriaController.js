// 1. Importa a conexão com o banco de dados
const db = require('../config/db.js');

// --- FUNÇÃO DE ENVIAR (CREATE) ---
// (Esta função é chamada pelo POST /api/ouvidoria)
exports.submitOuvidoria = (req, res) => {
  try {
    const { nome, email, telefone, mensagem } = req.body;

    // Validação
    if (!nome || !email || !mensagem) {
      return res.status(400).json({ message: 'Nome, Email e Mensagem são obrigatórios.' });
    }

    // 2. AGORA SALVA NO BANCO DE DADOS
    const sql = "INSERT INTO ouvidoria (nome, email, telefone, mensagem) VALUES (?, ?, ?, ?)";
    const values = [nome, email, telefone, mensagem];

    db.query(sql, values, (err, result) => {
      if (err) {
        console.error('Erro ao salvar no banco:', err);
        return res.status(500).json({ message: 'Erro interno no servidor ao salvar mensagem.' });
      }
      
      console.log('--- Mensagem da Ouvidoria SALVA NO BANCO ---');
      console.log(req.body); // Mostra os dados no console do back-end
      
      // 3. Envia sucesso para o front-end
      res.status(201).json({ message: 'Mensagem recebida com sucesso! Obrigado pelo seu contato.' });
    });

  } catch (error) {
    console.error('Erro no controller da ouvidoria:', error);
    res.status(500).json({ message: 'Erro interno no servidor.' });
  }
};

// --- FUNÇÃO DE LER (READ) ---
// (Esta função é chamada pelo GET /api/ouvidoria)
exports.getMensagens = (req, res) => {
  try {
    // Seleciona tudo da tabela e formata a data para o padrão BR
    const sql = "SELECT id, nome, email, telefone, mensagem, DATE_FORMAT(data_envio, '%d/%m/%Y %H:%i') AS data_formatada FROM ouvidoria ORDER BY data_envio DESC";

    db.query(sql, (err, results) => {
      if (err) {
        console.error('Erro ao buscar no banco:', err);
        return res.status(500).json({ message: 'Erro interno no servidor ao buscar mensagens.' });
      }

      // Envia as mensagens (results) como resposta em JSON
      res.status(200).json(results);
    });

  } catch (error) {
    console.error('Erro no controller getMensagens:', error);
    res.status(500).json({ message: 'Erro interno no servidor.' });
  }
};