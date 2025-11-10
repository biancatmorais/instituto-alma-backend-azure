require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path'); 

// Força a conexão com o banco
require('./config/db.js'); 

// Importação das rotas
const ouvidoriaRoutes = require('./routes/ouvidoriaRoutes');
const authRoutes = require('./routes/authRoutes');
const eventoRoutes = require('./routes/eventoRoutes');
const atividadeRoutes = require('./routes/atividadeRoutes');
const documentoRoutes = require('./routes/documentoRoutes'); 
const metaRoutes = require('./routes/metaRoutes'); 
const inscricaoRoutes = require('./routes/inscricaoRoutes'); 
// 💡 CORREÇÃO 1: Importe as rotas de pagamento
const paymentRoutes = require('./routes/paymentRoutes'); 

// Inicializa o Express
const app = express();
const PORT = process.env.PORT || 4000;

// === Middlewares ===

// Configuração CORS robusta (para ambiente local)
app.use(cors({
    origin: '*', 
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], 
    allowedHeaders: ['Content-Type', 'Authorization'], 
})); 

// 🚨 ATENÇÃO: Esta é a configuração padrão. Para Webhooks, você precisa de um middleware especial.
// Vamos ajustar o middleware para suportar o Webhook do Stripe:
app.use(express.json({
    // Aumenta o limite para garantir que o corpo do webhook não seja rejeitado
    limit: '50mb', 
    // É crucial que o Webhook do Stripe NÃO use este parser.
    // Ele será aplicado a todas as rotas, exceto a rota específica do Webhook (se você a adicionar).
    verify: (req, res, buf) => {
        // Armazena o corpo RAW da requisição para o processamento do Webhook
        if (req.originalUrl === '/api/webhook-stripe') { 
            req.rawBody = buf.toString();
        }
    }
}));


// Torna a pasta 'uploads' publicamente acessível
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// === Rotas da API ===
app.get('/', (req, res) => {
  res.send('API do Instituto Alma está no ar!');
});

// Rotas de Entidades
app.use('/api/ouvidoria', ouvidoriaRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/eventos', eventoRoutes);
app.use('/api/atividades', atividadeRoutes);
app.use('/api/documentos', documentoRoutes); 
app.use('/api/metas', metaRoutes); 
app.use('/api/inscricoes', inscricaoRoutes); 

// 💡 CORREÇÃO 2: Adicione a rota de pagamento
app.use('/api', paymentRoutes); // Note que o seu paymentRoutes já contém o /create-payment-intent

// Inicia o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log('Acesse http://localhost:4000');
});