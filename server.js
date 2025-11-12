require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');

// 🧩 Corrige a URL do frontend (sem barra no final)
const FRONTEND_URL = process.env.FRONTEND_URL?.replace(/\/$/, '') 
  || 'https://instituto-alma-frontend-deploy-w70nvoo6b.vercel.app'; // ✅ usa o domínio correto do Vercel

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

// 🚀 Inicializa o Express
const app = express();
const PORT = process.env.PORT || 4000;

// === 🛡️ Middlewares ===

// ⚙️ CORS: permite seu frontend no Vercel e localhost
app.use(cors({
  origin: [
    'http://localhost:5173',
    FRONTEND_URL
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// 🔄 Middleware para lidar com preflight requests
app.options('*', cors());

// 🔍 Middleware de parsing JSON
app.use(express.json());

// 📂 Pasta pública para imagens e uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// === 🌐 Rotas ===
app.get('/', (req, res) => {
  res.send('🚀 API do Instituto Alma está no ar e protegida com CORS!');
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
