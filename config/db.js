const mysql = require('mysql2');

// --- ALTERADO: Usando createPool() em vez de createConnection() ---
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '', 
  database: 'instituto_alma_db',
  waitForConnections: true, // Espera se todas as conexões estiverem em uso
  connectionLimit: 10,      // Limite máximo de conexões simultâneas
  queueLimit: 0             // Sem limite de fila
});

// Obtém uma conexão e verifica se o Pool está funcionando
pool.getConnection((err, connection) => {
  if (err) {
    console.error('--- ERRO AO INICIALIZAR O POOL DE CONEXÕES ---');
    console.error('Causa:', err.code);
    console.error('Detalhes:', err.stack);
    return;
  }
  console.log('>>> POOL de Conexões MySQL iniciado com sucesso! (Conexões máximas: 10)');
  
  // Libera a conexão imediatamente após o teste
  connection.release();
});

// Exporta o pool (o pool tem o método .query, o que significa que
// você não precisa mudar nada nos seus controllers: db.query(...) continua funcionando).
module.exports = pool;