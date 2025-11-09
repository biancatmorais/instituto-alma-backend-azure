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
// === 1. Configuração Específica do CORS (CORREÇÃO) ===
// =======================================================

// 1. Defina as origens base permitidas (Desenvolvimento Local)
let allowedOrigins = [
    // As portas mais comuns para o frontend em desenvolvimento
    'http://localhost:3000', 
    'http://localhost:5173', 
    'http://127.0.0.1:3000',
    'http://127.0.0.1:5173',
];

// 2. Adicione a URL de produção do frontend (Netlify) se definida
if (process.env.FRONTEND_URL) {
    // ⚠️ Adicione o domínio do seu site Netlify, ex: https://instituto-alma.netlify.app
    allowedOrigins.push(process.env.FRONTEND_URL);
}

const corsOptions = {
  origin: function (origin, callback) {
    // Permite requisições sem 'origin' (Postman, scripts de servidor)
    if (!origin) return callback(null, true); 

    // Se a origem for permitida na lista
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      // Se não for permitida
      console.log(`Origem não permitida: ${origin}. Acesso Negado.`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', 
  credentials: true, // Necessário para enviar cookies/tokens (JWT)
};

// Aplica a configuração de CORS
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

// Inclui as rotas
app.use('/api/ouvidoria', ouvidoriaRoutes);
// ... (inclua suas outras rotas aqui)

// Inicia o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log('Acesse http://localhost:4000');
});