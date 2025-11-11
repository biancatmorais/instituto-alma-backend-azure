const mysql = require('mysql2');


const connectionString = process.env.DATABASE_URL;


if (!connectionString) {
    console.error("ERRO: Variável DATABASE_URL não encontrada. Certifique-se de que o MySQL está no Railway.");
    
}


const pool = mysql.createPool(connectionString);


pool.getConnection((err, connection) => {
  if (err) {
    console.error('--- ERRO AO INICIALIZAR O POOL DE CONEXÕES ---');
    console.error('Causa:', err.code);
    console.error('Detalhes:', err.stack);
    return;
  }
  console.log('>>> POOL de Conexões MySQL iniciado com sucesso! (Conexões máximas: 10)');
  
 
  connection.release();
});


module.exports = pool;