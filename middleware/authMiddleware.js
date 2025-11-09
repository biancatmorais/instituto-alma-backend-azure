const jwt = require('jsonwebtoken');
const JWT_SECRET = 'fecap_pi_2ads_segredo_2025';

exports.checkAdmin = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; 

    if (token == null) {
      return res.status(401).json({ message: 'Acesso negado. Nenhum token fornecido.' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (err) {
        return res.status(403).json({ message: 'Acesso negado. Token inválido.' });
      }
      if (user.role !== 'admin') {
        return res.status(403).json({ message: 'Acesso negado. Requer privilégios de Administrador.' });
      }
      req.user = user; 
      next(); 
    });
  } catch (error) {
    console.error('Erro no middleware checkAdmin:', error);
    res.status(500).json({ message: 'Erro interno no servidor.' });
  }
};