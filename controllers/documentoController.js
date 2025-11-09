const db = require('../config/db.js');
const fs = require('fs');
const path = require('path');

// --- (Público) LER TODOS os Documentos ---
exports.getDocumentos = (req, res) => {
  // Pega os 4 mais recentes
  const sql = "SELECT * FROM documentos ORDER BY id DESC LIMIT 4";
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ message: 'Erro ao buscar documentos.' });
    res.status(200).json(results);
  });
};

// --- (Admin) LER UM Documento ---
exports.getOneDocumento = (req, res) => {
  const { id } = req.params;
  const sql = "SELECT * FROM documentos WHERE id = ?";
  db.query(sql, [id], (err, results) => {
    if (err) return res.status(500).json({ message: 'Erro ao buscar documento.' });
    if (results.length === 0) return res.status(404).json({ message: 'Documento não encontrado.' });
    res.status(200).json(results[0]);
  });
};

// --- (Admin) CRIAR um Documento ---
exports.createDocumento = (req, res) => {
  try {
    // 1. Verificar o limite (máximo 4)
    const checkSql = "SELECT COUNT(*) AS total FROM documentos";
    db.query(checkSql, (err, results) => {
      if (err) return res.status(500).json({ message: 'Erro de servidor ao verificar limite.' });

      if (results[0].total >= 4) {
        if (req.file) deleteFile(req.file.filename); // Apaga o PDF que o multer salvou
        return res.status(400).json({ message: 'Limite de 4 documentos atingido. Exclua um antigo para adicionar um novo.' });
      }

      // 2. Continuar se o limite estiver OK
      const { titulo } = req.body;
      const file = req.file; // O ficheiro PDF vem do 'req.file'

      if (!titulo || !file) {
        if (req.file) deleteFile(req.file.filename);
        return res.status(400).json({ message: 'Título e Ficheiro PDF são obrigatórios.' });
      }

      const arquivo_url = file.filename;

      // 3. Salvar no banco
      const sql = "INSERT INTO documentos (titulo, arquivo_url) VALUES (?, ?)";
      db.query(sql, [titulo, arquivo_url], (err, result) => {
        if (err) {
          deleteFile(arquivo_url); // Se der erro ao salvar, apaga o ficheiro
          return res.status(500).json({ message: 'Erro interno ao salvar documento.' });
        }
        res.status(201).json({ message: 'Documento salvo com sucesso!', id: result.insertId });
      });
    });
  } catch (error) {
    if (req.file) deleteFile(req.file.filename);
    res.status(500).json({ message: 'Erro no servidor.' });
  }
};

// --- (Admin) ATUALIZAR um Documento (Editar) ---
exports.updateDocumento = (req, res) => {
  try {
    const { id } = req.params;
    const { titulo } = req.body;
    const newFile = req.file; // O ficheiro NOVO (pode ser nulo)

    if (!titulo) {
      if (newFile) deleteFile(newFile.filename); // Se o user enviou um ficheiro mas não um título
      return res.status(400).json({ message: 'O Título é obrigatório.' });
    }

    // 1. Buscar o nome do PDF antigo (para apagar)
    const findSql = "SELECT arquivo_url FROM documentos WHERE id = ?";
    db.query(findSql, [id], (err, results) => {
      if (err) return res.status(500).json({ message: 'Erro ao procurar documento antigo.' });
      if (results.length === 0) return res.status(404).json({ message: 'Documento não encontrado.' });

      const oldFilename = results[0].arquivo_url;
      
      // 2. Decidir o que atualizar
      let sql;
      let values;

      if (newFile) {
        // Se o user enviou um NOVO PDF, atualize o título E o ficheiro
        sql = "UPDATE documentos SET titulo = ?, arquivo_url = ? WHERE id = ?";
        values = [titulo, newFile.filename, id];
      } else {
        // Se o user NÃO enviou um novo PDF, atualize SÓ o título
        sql = "UPDATE documentos SET titulo = ? WHERE id = ?";
        values = [titulo, id];
      }

      // 3. Executar o UPDATE
      db.query(sql, values, (err, result) => {
        if (err) {
          if (newFile) deleteFile(newFile.filename); // Se der erro, apaga o ficheiro novo
          return res.status(500).json({ message: 'Erro ao atualizar documento.' });
        }
        
        // 4. Se o update deu certo E o user enviou um ficheiro novo, apague o PDF antigo
        if (newFile && oldFilename) {
          deleteFile(oldFilename);
        }

        res.status(200).json({ message: 'Documento atualizado com sucesso.' });
      });
    });
  } catch (error) {
    if (req.file) deleteFile(req.file.filename);
    res.status(500).json({ message: 'Erro no servidor.' });
  }
};


// --- (Admin) DELETAR um Documento ---
exports.deleteDocumento = (req, res) => {
  try {
    const { id } = req.params;

    // 1. Buscar o nome do ficheiro (para apagar do disco)
    const findSql = "SELECT arquivo_url FROM documentos WHERE id = ?";
    db.query(findSql, [id], (err, results) => {
      if (err) return res.status(500).json({ message: 'Erro ao procurar documento.' });
      if (results.length === 0) return res.status(404).json({ message: 'Documento não encontrado.' });

      const filename = results[0].arquivo_url;

      // 2. Apagar do banco
      const deleteSql = "DELETE FROM documentos WHERE id = ?";
      db.query(deleteSql, [id], (err, result) => {
        if (err) return res.status(500).json({ message: 'Erro ao apagar documento do banco.' });

        // 3. Apagar o ficheiro PDF do disco
        if (filename) {
          deleteFile(filename);
        }
        res.status(200).json({ message: 'Documento apagado com sucesso.' });
      });
    });
  } catch (error) {
    res.status(500).json({ message: 'Erro no servidor.' });
  }
};

// --- Função Utilitária ---
const deleteFile = (filename) => {
  const localPath = path.resolve(__dirname, '..', 'uploads', filename);
  fs.unlink(localPath, (unlinkErr) => {
    if (unlinkErr) console.error(`Erro ao apagar o ficheiro ${localPath}:`, unlinkErr);
    else console.log(`Ficheiro PDF ${filename} apagado.`);
  });
};