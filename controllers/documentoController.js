const db = require('../config/db.js');
const fs = require('fs');
const path = require('path');

exports.getDocumentos = (req, res) => {
  const sql = "SELECT * FROM documentos ORDER BY id DESC LIMIT 4";
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ message: 'Erro ao buscar documentos.' });
    res.status(200).json(results);
  });
};

exports.getOneDocumento = (req, res) => {
  const { id } = req.params;
  const sql = "SELECT * FROM documentos WHERE id = ?";
  db.query(sql, [id], (err, results) => {
    if (err) return res.status(500).json({ message: 'Erro ao buscar documento.' });
    if (results.length === 0) return res.status(404).json({ message: 'Documento não encontrado.' });
    res.status(200).json(results[0]);
  });
};

exports.createDocumento = (req, res) => {
  try {
    const checkSql = "SELECT COUNT(*) AS total FROM documentos";
    db.query(checkSql, (err, results) => {
      if (err) return res.status(500).json({ message: 'Erro de servidor ao verificar limite.' });

      if (results[0].total >= 4) {
        if (req.file) deleteFile(req.file.filename); 
        return res.status(400).json({ message: 'Limite de 4 documentos atingido. Exclua um antigo para adicionar um novo.' });
      }

      const { titulo } = req.body;
      const file = req.file; 

      if (!titulo || !file) {
        if (req.file) deleteFile(req.file.filename);
        return res.status(400).json({ message: 'Título e Ficheiro PDF são obrigatórios.' });
      }

      const arquivo_url = file.filename;

      const sql = "INSERT INTO documentos (titulo, arquivo_url) VALUES (?, ?)";
      db.query(sql, [titulo, arquivo_url], (err, result) => {
        if (err) {
          deleteFile(arquivo_url); 
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

exports.updateDocumento = (req, res) => {
  try {
    const { id } = req.params;
    const { titulo } = req.body;
    const newFile = req.file; 

    if (!titulo) {
      if (newFile) deleteFile(newFile.filename); 
      return res.status(400).json({ message: 'O Título é obrigatório.' });
    }

    const findSql = "SELECT arquivo_url FROM documentos WHERE id = ?";
    db.query(findSql, [id], (err, results) => {
      if (err) return res.status(500).json({ message: 'Erro ao procurar documento antigo.' });
      if (results.length === 0) return res.status(404).json({ message: 'Documento não encontrado.' });

      const oldFilename = results[0].arquivo_url;
      
      let sql;
      let values;

      if (newFile) {
        sql = "UPDATE documentos SET titulo = ?, arquivo_url = ? WHERE id = ?";
        values = [titulo, newFile.filename, id];
      } else {
        sql = "UPDATE documentos SET titulo = ? WHERE id = ?";
        values = [titulo, id];
      }

      db.query(sql, values, (err, result) => {
        if (err) {
          if (newFile) deleteFile(newFile.filename); 
          return res.status(500).json({ message: 'Erro ao atualizar documento.' });
        }
        
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


exports.deleteDocumento = (req, res) => {
  try {
    const { id } = req.params;

    const findSql = "SELECT arquivo_url FROM documentos WHERE id = ?";
    db.query(findSql, [id], (err, results) => {
      if (err) return res.status(500).json({ message: 'Erro ao procurar documento.' });
      if (results.length === 0) return res.status(404).json({ message: 'Documento não encontrado.' });

      const filename = results[0].arquivo_url;

      const deleteSql = "DELETE FROM documentos WHERE id = ?";
      db.query(deleteSql, [id], (err, result) => {
        if (err) return res.status(500).json({ message: 'Erro ao apagar documento do banco.' });

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

const deleteFile = (filename) => {
  const localPath = path.resolve(__dirname, '..', 'uploads', filename);
  fs.unlink(localPath, (unlinkErr) => {
    if (unlinkErr) console.error(`Erro ao apagar o ficheiro ${localPath}:`, unlinkErr);
    else console.log(`Ficheiro PDF ${filename} apagado.`);
  });
};