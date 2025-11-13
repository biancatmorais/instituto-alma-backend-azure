require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');


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

// Variáveis de ambiente
// AGORA ACESSAMOS USANDO process.env PARA EVITAR O ReferenceError
const FRONTEND_URL_PROD = process.env.FRONTEND_URL;

// === 🛡️ Configuração CORS (Única e Completa) ===

app.use(express.json());

// Middleware do CORS
app.use(cors({
    origin: (origin, callback) => {
        // 1. Permite o ambiente de desenvolvimento local
        if (origin === 'http://localhost:5173') {
            return callback(null, true);
        }
        
        // 2. Permite a URL de produção principal (Ex: https://instituto-alma-frontend-deploy.vercel.app)
        if (origin === FRONTEND_URL_PROD) {
            return callback(null, true);
        }

        // 3. Permite qualquer subdomínio que termine com .vercel.app (para branches/previews)
        if (origin && origin.endsWith('.vercel.app')) {
            return callback(null, true);
        }

        // 4. Permite requisições sem origem (como ferramentas REST ou requisições do próprio servidor)
        if (!origin) {
             return callback(null, true);
        }

        // Bloqueia qualquer outra origem
        return callback(new Error('Not allowed by CORS'), false);
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
}));

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
app.use('/api/pagamentos', pagamentoRoutes); // Rota de Pagamentos

// === ▶️ Inicia o servidor ===
app.listen(PORT, () => {
    console.log(`✅ Servidor rodando na porta ${PORT}`);
    console.log(`🌐 CORS habilitado para: ${FRONTEND_URL_PROD}, localhost e Vercel Previews.`);
});