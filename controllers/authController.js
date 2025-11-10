const db = require('../config/db.js');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Chave secreta definida diretamente (ambiente LOCAL)
const JWT_SECRET = 'fecap_pi_2ads_segredo_2025';

// --- FUNÇÃO DE REGISTRAR (Criar Conta) ---
exports.registerUser = async (req, res) => {
  // ... (código igual) ...
  try {
    const { nome, email, senha } = req.body;
    if (!nome || !email || !senha) {
      return res.status(400).json({ message: 'Nome, Email e Senha são obrigatórios.' });
    }
    const checkUserSql = "SELECT * FROM usuarios WHERE email = ?";
    db.query(checkUserSql, [email], async (err, results) => {
      if (err) {
        console.error('Erro ao checar usuário:', err);
        return res.status(500).json({ message: 'Erro interno no servidor.' });
      }
      if (results.length > 0) {
        return res.status(400).json({ message: 'Este email já está cadastrado.' });
      }
      const salt = await bcrypt.genSalt(10);
      const senhaHash = await bcrypt.hash(senha, salt);
      const insertSql = "INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)";
      db.query(insertSql, [nome, email, senhaHash], (err, result) => {
        if (err) {
          console.error('Erro ao salvar usuário:', err);
          return res.status(500).json({ message: 'Erro interno ao registrar usuário.' });
        }
        console.log('--- Novo Usuário (Doador) Registrado ---');
        console.log('Email:', email);
        res.status(201).json({ message: 'Usuário criado com sucesso! Você já pode fazer o login.' });
      });
    });
  } catch (error) {
    console.error('Erro no controller de registro:', error);
    res.status(500).json({ message: 'Erro interno no servidor.' });
  }
};


// --- FUNÇÃO DE LOGIN (Entrar) ---
exports.loginUser = (req, res) => {
  try {
    const { email, senha } = req.body;
    if (!email || !senha) {
      return res.status(400).json({ message: 'Email e Senha são obrigatórios.' });
    }
    const sql = "SELECT * FROM usuarios WHERE email = ?";
    db.query(sql, [email], async (err, results) => {
      if (err) {
        console.error('Erro ao buscar usuário:', err);
        return res.status(500).json({ message: 'Erro interno no servidor.' });
      }
      if (results.length === 0) {
        return res.status(401).json({ message: 'Email ou senha inválidos.' });
      }
      const usuario = results[0];
      const senhaCorreta = await bcrypt.compare(senha, usuario.senha);
      if (!senhaCorreta) {
        return res.status(401).json({ message: 'Email ou senha inválidos.' });
      }

      console.log(`--- Login bem-sucedido ---`);
      console.log(`Email: ${usuario.email}, Papel: ${usuario.role}`);

      const payload = {
        id: usuario.id,
        email: usuario.email,
        role: usuario.role 
      };

      const token = jwt.sign(
        payload, 
        JWT_SECRET, // Usa a chave secreta local
        { expiresIn: '24h' }
      );

      res.status(200).json({ 
        message: 'Login bem-sucedido!',
        token: token,
        user: {
          nome: usuario.nome,
          email: usuario.email,
          role: usuario.role
        }
      });
    });
  } catch (error) {
    console.error('Erro no controller de login:', error);
    res.status(500).json({ message: 'Erro interno no servidor.' });
  }
};