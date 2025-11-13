const db = require('../config/db.js');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'fecap_pi_2ads_segredo_2025';

// 🟢 Registro de novo usuário
exports.registerUser = async (req, res) => {
  try {
    const { nome, email, senha } = req.body;

    if (!nome || !email || !senha) {
      return res.status(400).json({ message: 'Nome, Email e Senha são obrigatórios.' });
    }

    // Verifica se o usuário já existe
    const [existingUser] = await db.query("SELECT * FROM usuarios WHERE email = ?", [email]);
    if (existingUser.length > 0) {
      return res.status(400).json({ message: 'Este email já está cadastrado.' });
    }

    // Criptografa a senha
    const salt = await bcrypt.genSalt(10);
    const senhaHash = await bcrypt.hash(senha, salt);

    // Insere novo usuário
    await db.query("INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)", [nome, email, senhaHash]);

    console.log('✅ Novo Usuário Registrado:', email);
    res.status(201).json({ message: 'Usuário criado com sucesso! Você já pode fazer o login.' });

  } catch (error) {
    console.error('🚨 Erro no registro de usuário:', error);
    res.status(500).json({ message: 'Erro interno no servidor ao registrar usuário.' });
  }
};

// 🟢 Login de usuário
exports.loginUser = async (req, res) => {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ message: 'Email e Senha são obrigatórios.' });
    }

    // Busca o usuário
    const [users] = await db.query("SELECT * FROM usuarios WHERE email = ?", [email]);
    if (users.length === 0) {
      return res.status(401).json({ message: 'Email ou senha inválidos.' });
    }

    const usuario = users[0];

    // Compara a senha
    const senhaCorreta = await bcrypt.compare(senha, usuario.senha);
    if (!senhaCorreta) {
      return res.status(401).json({ message: 'Email ou senha inválidos.' });
    }

    console.log(`✅ Login bem-sucedido | Email: ${usuario.email} | Role: ${usuario.role}`);

    // Cria o token JWT
    const payload = {
      id: usuario.id,
      email: usuario.email,
      role: usuario.role
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });

    res.status(200).json({
      message: 'Login bem-sucedido!',
      token,
      user: {
        nome: usuario.nome,
        email: usuario.email,
        role: usuario.role
      }
    });

  } catch (error) {
    console.error('🚨 Erro no login:', error);
    res.status(500).json({ message: 'Erro interno no servidor ao realizar login.' });
  }
};
