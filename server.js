// Importações principais
const express = require('express');
const cors = require('cors');
const path = require('path'); 

// Força a conexão com o banco
require('./config/db.js'); 

// Importação das rotas
const ouvidoriaRoutes = require('./routes/ouvidoriaRoutes');
// ... (outras rotas)

// Inicializa o Express
const app = express();
const PORT = process.env.PORT || 4000;

// =======================================================
// === 1. Configuração Específica do CORS (NOVO BLOCO) ===
// =======================================================

// Defina as origens permitidas
// Use process.env para definir a URL de produção na nuvem (Railway)
const allowedOrigins = process.env.FRONTEND_URL ? 
  [process.env.FRONTEND_URL, 'http://localhost:3000'] : 
  ['http://localhost:3000', 'http://localhost:4000']; // Default para desenvolvimento

const corsOptions = {
  origin: function (origin, callback) {
    // Permite requisições sem 'origin' (como apps mobile, Postman ou requests do servidor)
    if (!origin) return callback(null, true); 

    // Se a origem for permitida na lista
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      // Se não for permitida
      console.log(`Origem não permitida: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', 
  credentials: true, // Necessário para enviar cookies/tokens (JWT)
};

// Substitua a linha app.use(cors()); pela configuração específica
app.use(cors(corsOptions)); 

// =======================================================
// === Middlewares ===
app.use(express.json()); 

// Torna a pasta 'uploads' publicamente acessível
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// === Rotas da API ===
app.get('/', (req, res) => {
  res.send('API do Instituto Alma está no ar!');
});

// ... (configuração das rotas)

// Inicia o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log('Acesse http://localhost:4000');
});