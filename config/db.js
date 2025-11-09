const mysql = require('mysql2');

// Configure com os dados do seu banco MySQL (ex: do XAMPP)
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '', // Deixe em branco se você não usa senha
  database: 'instituto_alma_db'
});

// Tenta se conectar
connection.connect((err) => {
  if (err) {
    console.error('--- ERRO AO CONECTAR COM O BANCO DE DADOS ---');
    console.error('Verifique se o XAMPP/MySQL está ligado e se as credenciais em config/db.js estão corretas.');
    console.error(err.stack);
    return;
  }
  
  // Esta é a mensagem de sucesso que queremos ver!
  console.log('>>> Conectado ao banco de dados MySQL com sucesso! (ID: ' + connection.threadId + ')');
});

// Exporta a conexão
module.exports = connection;