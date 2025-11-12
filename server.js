require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');

// 🧩 Corrige a URL do frontend (sem barra no final)
const FRONTEND_URL =
  (process.env.FRONTEND_URL?.replace(/\/$/, '')) ||
  'https://instituto-alma-frontend-deploy-w70nvoo6b.vercel.app';

// 🔌 Conexão com o banco
require('./config/db.js');

// 📦 Importação das rotas
const ouvidoriaRoutes = require('./routes/ouvidoriaRoutes');
const authRoutes = require('./routes/authRoutes');
const eventoRoutes = require('./routes/eventoRoutes');
const atividadeRoutes = require('./routes/atividadeRoutes');
const documentoRoutes = require('./routes/documentoRoutes');
const metaRoutes = require('./routes/metaRoutes');
const inscricaoRoutes = require('./routes/inscricaoRoutes');
const pagamentoRoutes = require('./routes/pagamentosRoutes');

const app = express();
const PORT = process.env.PORT || 4000;

// === 🛡️ CORS global e forçado ===
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', FRONTEND_URL);
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Middleware do cors (em segundo lugar)
app.use(cors({
  origin: [FRONTEND_URL, 'http://localhost:5173'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

app.use(express.json());

// 📂 Pasta pública
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// === 🌐 Rotas ===
app.get('/', (req, res) => {
  res.send('🚀 API do Instituto Alma está no ar com CORS habilitado!');
});

app.use('/api/ouvidoria', ouvidoriaRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/eventos', eventoRoutes);
app.use('/api/atividades', atividadeRoutes);
app.use('/api/documentos', documentoRoutes);
app.use('/api/metas', metaRoutes);
app.use('/api/inscricoes', inscricaoRoutes);
app.use('/api/pagamentos', pagamentoRoutes);

// === ▶️ Inicia o servidor ===
app.listen(PORT, () => {
  console.log(`✅ Servidor rodando na porta ${PORT}`);
  console.log(`🌐 CORS habilitado para:`);
  console.log(`   - ${FRONTEND_URL}`);
  console.log(`   - http://localhost:5173`);
});
