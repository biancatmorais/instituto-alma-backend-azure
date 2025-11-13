const db = require('../config/db.js');
const fs = require('fs');
const path = require('path');

// 🟢 Buscar últimos 4 documentos
exports.getDocumentos = async (req, res) => {
  try {
    const [results] = await db.query("SELECT * FROM documentos ORDER BY id DESC LIMIT 4");
    res.status(200).json(results);
  } catch (err) {
    console.error('Erro ao buscar documentos:', err);
    res.status(500).json({ message: 'Erro ao buscar documentos.' });
  }
};

// 🟢 Buscar um documento específico
exports.getOneDocumento = async (req, res) => {
  try {
    const { id } = req.params;
    const [results] = await db.query("SELECT * FROM documentos WHERE id = ?", [id]);

    if (results.length === 0)
      return res.status(404).json({ message: 'Documento não encontrado.' });

    res.status(200).json(results[0]);
  } catch (err) {
    console.error('Erro ao buscar documento:', err);
    res.status(500).json({ message: 'Erro ao buscar documento.' });
  }
};

// 🟢 Criar novo documento
exports.createDocumento = async (req, res) => {
  const conn = await db.getConnection();
  try {
    const [countResult] = await conn.query("SELECT COUNT(*) AS total FROM documentos");

    if (countResult[0].total >= 4) {
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
    const [result] = await conn.query(sql, [titulo, arquivo_url]);

    res.status(201).json({ message: 'Documento salvo com sucesso!', id: result.insertId });
  } catch (error) {
    console.error('Erro ao criar documento:', error);
    if (req.file) deleteFile(req.file.filename);
    res.status(500).json({ message: 'Erro interno ao salvar documento.' });
  } finally {
    conn.release();
  }
};

// 🟢 Atualizar documento existente
exports.updateDocumento = async (req, res) => {
  const conn = await db.getConnection();
  try {
    const { id } = req.params;
    const { titulo } = req.body;
    const newFile = req.file;

    if (!titulo) {
      if (newFile) deleteFile(newFile.filename);
      return res.status(400).json({ message: 'O Título é obrigatório.' });
    }

    const [oldDocs] = await conn.query("SELECT arquivo_url FROM documentos WHERE id = ?", [id]);
    if (oldDocs.length === 0) return res.status(404).json({ message: 'Documento não encontrado.' });

    const oldFilename = oldDocs[0].arquivo_url;

    let sql, values;
    if (newFile) {
      sql = "UPDATE documentos SET titulo = ?, arquivo_url = ? WHERE id = ?";
      values = [titulo, newFile.filename, id];
    } else {
      sql = "UPDATE documentos SET titulo = ? WHERE id = ?";
      values = [titulo, id];
    }

    const [result] = await conn.query(sql, values);

    if (result.affectedRows === 0)
      return res.status(404).json({ message: 'Documento não encontrado.' });

    if (newFile && oldFilename) deleteFile(oldFilename);

    res.status(200).json({ message: 'Documento atualizado com sucesso.' });
  } catch (error) {
    console.error('Erro ao atualizar documento:', error);
    if (req.file) deleteFile(req.file.filename);
    res.status(500).json({ message: 'Erro ao atualizar documento.' });
  } finally {
    conn.release();
  }
};

// 🟢 Deletar documento
exports.deleteDocumento = async (req, res) => {
  const conn = await db.getConnection();
  try {
    const { id } = req.params;
    const [results] = await conn.query("SELECT arquivo_url FROM documentos WHERE id = ?", [id]);

    if (results.length === 0)
      return res.status(404).json({ message: 'Documento não encontrado.' });

    const filename = results[0].arquivo_url;

    const [delResult] = await conn.query("DELETE FROM documentos WHERE id = ?", [id]);
    if (delResult.affectedRows === 0)
      return res.status(404).json({ message: 'Documento não encontrado.' });

    if (filename) deleteFile(filename);

    res.status(200).json({ message: 'Documento apagado com sucesso.' });
  } catch (error) {
    console.error('Erro ao deletar documento:', error);
    res.status(500).json({ message: 'Erro ao deletar documento.' });
  } finally {
    conn.release();
  }
};

// 🧹 Função auxiliar para deletar arquivo físico
const deleteFile = (filename) => {
  const localPath = path.resolve(__dirname, '..', 'uploads', filename);
  fs.unlink(localPath, (unlinkErr) => {
    if (unlinkErr) console.error(`Erro ao apagar o ficheiro ${localPath}:`, unlinkErr);
    else console.log(`Ficheiro PDF ${filename} apagado.`);
  });
};
