
require('dotenv').config(); 


const express = require('express');
const cors = require('cors'); 
const path = require('path'); 


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
app.use('/api/pagamentos', pagamentoRoutes);



// Inicializa o Express
const app = express();
// Usa a porta fornecida pelo ambiente (Railway), senão usa 4000 localmente
const PORT = process.env.PORT || 4000;

// === Middlewares ===

// Configuração CORS robusta (para produção, use o URL do seu Vercel aqui)
app.use(cors({
    origin: '*', // Idealmente, substitua '*' pelo seu FRONTEND_URL do Vercel na produção.
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], 
    allowedHeaders: ['Content-Type', 'Authorization'], 
})); 

app.use(express.json()); 

// Torna a pasta 'uploads' publicamente acessível
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// === Rotas da API ===
// Rota principal (apenas para verificar se a API está no ar)
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
app.use('/api/pagamentos', pagamentoRoutes); // Rota de Pagamentos

// Inicia o servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
    console.log(`Acesse localmente em: http://localhost:${PORT}`);
});