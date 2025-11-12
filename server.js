require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');

// URL do frontend no Vercel (sem barra no final)
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://instituto-alma-frontend-deploy.vercel.app';

// Conexão com o banco
require('./config/db.js');

// Importação das rotas
const ouvidoriaRoutes = require('./routes/ouvidoriaRoutes');
const authRoutes = require('./routes/authRoutes');
const eventoRoutes = require('./routes/eventoRoutes');
const atividadeRoutes = require('./routes/atividadeRoutes');
const documentoRoutes = require('./routes/documentoRoutes');
const metaRoutes = require('./routes/metaRoutes');
const inscricaoRoutes = require('./routes/inscricaoRoutes');
const pagamentoRoutes = require('./routes/pagamentosRoutes'); 

// Inicializa o Express
const app = express();
const PORT = process.env.PORT || 4000;

// === Middlewares ===
app.use(cors({
  origin: [
    'http://localhost:5173',
    FRONTEND_URL
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json());

// Pasta pública
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// === Rotas ===
app.get('/', (req, res) => {
  res.send('API do Instituto Alma está no ar!');
});

app.use('/api/ouvidoria', ouvidoriaRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/eventos', eventoRoutes);
app.use('/api/atividades', atividadeRoutes);
app.use('/api/documentos', documentoRoutes);
app.use('/api/metas', metaRoutes);
app.use('/api/inscricoes', inscricaoRoutes);
app.use('/api/pagamentos', pagamentoRoutes);

// === Inicia o servidor ===
app.listen(PORT, () => {
  console.log(`✅ Servidor rodando na porta ${PORT}`);
  console.log(`🌐 CORS permitido para: ${FRONTEND_URL} e http://localhost:5173`);
});
