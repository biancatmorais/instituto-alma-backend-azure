const db = require('../config/db.js');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Defina uma "chave secreta" para seus tokens. 
// Mantenha isso em segredo! No futuro, isso deve ir para um arquivo .env.
const JWT_SECRET = 'fecap_pi_2ads_segredo_2025';

// --- FUNÇÃO DE REGISTRAR (Criar Conta) ---
exports.registerUser = async (req, res) => {
  try {
    const { nome, email, senha } = req.body;

    // 1. Validação simples
    if (!nome || !email || !senha) {
      return res.status(400).json({ message: 'Nome, Email e Senha são obrigatórios.' });
    }

    // 2. Verificar se o usuário já existe
    const checkUserSql = "SELECT * FROM usuarios WHERE email = ?";
    db.query(checkUserSql, [email], async (err, results) => {
      if (err) {
        console.error('Erro ao checar usuário:', err);
        return res.status(500).json({ message: 'Erro interno no servidor.' });
      }
      
      if (results.length > 0) {
        return res.status(400).json({ message: 'Este email já está cadastrado.' });
      }

      // 3. Criptografar a senha (Requisito do PDF)
      const salt = await bcrypt.genSalt(10);
      const senhaHash = await bcrypt.hash(senha, salt);

      // 4. Salvar no banco
      // (Note que não passamos o 'role'. O banco de dados vai usar o DEFAULT 'doador')
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

    // 1. Validação
    if (!email || !senha) {
      return res.status(400).json({ message: 'Email e Senha são obrigatórios.' });
    }

    // 2. Encontrar o usuário no banco
    const sql = "SELECT * FROM usuarios WHERE email = ?";
    db.query(sql, [email], async (err, results) => {
      if (err) {
        console.error('Erro ao buscar usuário:', err);
        return res.status(500).json({ message: 'Erro interno no servidor.' });
      }

      // 3. Verificar se o usuário existe
      if (results.length === 0) {
        return res.status(401).json({ message: 'Email ou senha inválidos.' }); // 401 = Não autorizado
      }

      const usuario = results[0];

      // 4. Comparar a senha digitada com a senha criptografada do banco
      const senhaCorreta = await bcrypt.compare(senha, usuario.senha);

      if (!senhaCorreta) {
        return res.status(401).json({ message: 'Email ou senha inválidos.' });
      }

      // 5. SENHA CORRETA! Criar o Token JWT (Requisito do PDF)
      console.log(`--- Login bem-sucedido ---`);
      console.log(`Email: ${usuario.email}, Papel: ${usuario.role}`);

      // O payload do token inclui o ID e o PAPEL (role) do usuário
      const payload = {
        id: usuario.id,
        email: usuario.email,
        role: usuario.role // <-- AQUI ESTÁ A CHAVE DO SEU REQUISITO!
      };

      const token = jwt.sign(
        payload, 
        JWT_SECRET, 
        { expiresIn: '24h' } // Token expira em 24 horas
      );

      // 6. Enviar o token (e o papel) de volta para o Front-end
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