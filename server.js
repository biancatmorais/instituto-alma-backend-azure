// Importações principais
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
const inscricaoRoutes = require('./routes/inscricaoRoutes'); // <-- (NOVO)

// Inicializa o Express
const app = express();
const PORT = process.env.PORT || 4000;

// === Middlewares ===
app.use(cors()); 
app.use(express.json()); 

// Torna a pasta 'uploads' publicamente acessível
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// === Rotas da API ===
app.get('/', (req, res) => {
  res.send('API do Instituto Alma está no ar!');
});

app.use('/api/ouvidoria', ouvidoriaRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/eventos', eventoRoutes);
app.use('/api/atividades', atividadeRoutes);
app.use('/api/documentos', documentoRoutes);
app.use('/api/metas', metaRoutes);
app.use('/api/inscricoes', inscricaoRoutes); // <-- (NOVO)


// Inicia o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log('Acesse http://localhost:4000');
});