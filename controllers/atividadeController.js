const db = require('../config/db.js');
const fs = require('fs');
const path = require('path');

const deleteFile = (filename) => {
  const localPath = path.resolve(__dirname, '..', 'uploads', filename);
  fs.unlink(localPath, (unlinkErr) => {
    if (unlinkErr) console.error(`Erro ao apagar o ficheiro ${localPath}:`, unlinkErr);
    else console.log(`Ficheiro ${filename} apagado.`);
  });
};

const deleteUploadedFilesOnError = (files) => {
  if (!files) return;
  const filenames = [];
  if (files['imagem_1']) filenames.push(files['imagem_1'][0].filename);
  if (files['imagem_2']) filenames.push(files['imagem_2'][0].filename);
  if (files['imagem_3']) filenames.push(files['imagem_3'][0].filename);
  if (files['imagem_4']) filenames.push(files['imagem_4'][0].filename);
  filenames.forEach(filename => deleteFile(filename));
};

// 🟢 Buscar últimas 4 atividades
exports.getAtividades = async (req, res) => {
  try {
    const [results] = await db.query("SELECT * FROM atividades ORDER BY id DESC LIMIT 4");
    res.status(200).json(results);
  } catch (err) {
    console.error("Erro ao buscar atividades:", err);
    res.status(500).json({ message: 'Erro interno ao buscar atividades.' });
  }
};

// 🟢 Buscar atividade por ID
exports.getAtividadeById = async (req, res) => {
  const { id } = req.params;
  try {
    const [results] = await db.query("SELECT * FROM atividades WHERE id = ?", [id]);
    if (results.length === 0) return res.status(404).json({ message: 'Atividade não encontrada.' });

    const atividade = results[0];
    const baseUrl = process.env.BASE_URL || 'https://instituto-alma-backend-azure-production.up.railway.app/uploads/';

    atividade.imagem_url_1 = atividade.imagem_url_1 ? baseUrl + atividade.imagem_url_1 : null;
    atividade.imagem_url_2 = atividade.imagem_url_2 ? baseUrl + atividade.imagem_url_2 : null;
    atividade.imagem_url_3 = atividade.imagem_url_3 ? baseUrl + atividade.imagem_url_3 : null;
    atividade.imagem_url_4 = atividade.imagem_url_4 ? baseUrl + atividade.imagem_url_4 : null;

    res.status(200).json(atividade);
  } catch (err) {
    console.error("Erro ao buscar atividade:", err);
    res.status(500).json({ message: 'Erro interno ao buscar atividade.' });
  }
};

// 🟢 Criar nova atividade
exports.createAtividade = async (req, res) => {
  try {
    const [countRows] = await db.query("SELECT COUNT(*) AS total FROM atividades");
    if (countRows[0].total >= 4) {
      deleteUploadedFilesOnError(req.files);
      return res.status(400).json({ message: 'Limite de 4 atividades atingido.' });
    }

    const { titulo, descricao } = req.body;
    const files = req.files;

    if (!titulo || !descricao) {
      deleteUploadedFilesOnError(req.files);
      return res.status(400).json({ message: 'Título e Descrição são obrigatórios.' });
    }
    if (!files || !files['imagem_1']) {
      deleteUploadedFilesOnError(req.files);
      return res.status(400).json({ message: 'A Imagem 1 é obrigatória.' });
    }

    const img1 = files['imagem_1'][0].filename;
    const img2 = files['imagem_2'] ? files['imagem_2'][0].filename : null;
    const img3 = files['imagem_3'] ? files['imagem_3'][0].filename : null;
    const img4 = files['imagem_4'] ? files['imagem_4'][0].filename : null;

    const sql = "INSERT INTO atividades (titulo, descricao, imagem_url_1, imagem_url_2, imagem_url_3, imagem_url_4) VALUES (?, ?, ?, ?, ?, ?)";
    const values = [titulo, descricao, img1, img2, img3, img4];

    const [result] = await db.query(sql, values);
    res.status(201).json({ message: 'Atividade criada com sucesso!', id: result.insertId });

  } catch (error) {
    console.error("Erro ao criar atividade:", error);
    deleteUploadedFilesOnError(req.files);
    res.status(500).json({ message: 'Erro no servidor ao criar atividade.' });
  }
};

// 🟢 Atualizar atividade
exports.updateAtividade = async (req, res) => {
  try {
    const { id } = req.params;
    const { titulo, descricao } = req.body;
    const files = req.files;

    if (!titulo || !descricao) {
      deleteUploadedFilesOnError(req.files);
      return res.status(400).json({ message: 'Título e Descrição são obrigatórios.' });
    }

    const newImageUrls = {};
    if (files && files['imagem_1']) newImageUrls.imagem_url_1 = files['imagem_1'][0].filename;
    if (files && files['imagem_2']) newImageUrls.imagem_url_2 = files['imagem_2'][0].filename;
    if (files && files['imagem_3']) newImageUrls.imagem_url_3 = files['imagem_3'][0].filename;
    if (files && files['imagem_4']) newImageUrls.imagem_url_4 = files['imagem_4'][0].filename;

    const [oldRows] = await db.query("SELECT imagem_url_1, imagem_url_2, imagem_url_3, imagem_url_4 FROM atividades WHERE id = ?", [id]);
    if (oldRows.length === 0) {
      deleteUploadedFilesOnError(req.files);
      return res.status(404).json({ message: 'Atividade não encontrada.' });
    }

    const oldImageUrls = oldRows[0];
    let updateSql = "UPDATE atividades SET titulo = ?, descricao = ?";
    const values = [titulo, descricao];

    Object.keys(newImageUrls).forEach(key => {
      updateSql += `, ${key} = ?`;
      values.push(newImageUrls[key]);
    });

    updateSql += " WHERE id = ?";
    values.push(id);

    await db.query(updateSql, values);

    Object.keys(newImageUrls).forEach(key => {
      const oldFilename = oldImageUrls[key];
      if (oldFilename) deleteFile(oldFilename);
    });

    res.status(200).json({ message: 'Atividade atualizada com sucesso.' });
  } catch (error) {
    console.error("Erro ao atualizar atividade:", error);
    res.status(500).json({ message: 'Erro no servidor ao atualizar atividade.' });
  }
};

// 🟢 Deletar atividade
exports.deleteAtividade = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query("SELECT imagem_url_1, imagem_url_2, imagem_url_3, imagem_url_4 FROM atividades WHERE id = ?", [id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Atividade não encontrada.' });

    const atividade = rows[0];
    await db.query("DELETE FROM atividades WHERE id = ?", [id]);

    const imagesToDelete = [atividade.imagem_url_1, atividade.imagem_url_2, atividade.imagem_url_3, atividade.imagem_url_4];
    imagesToDelete.forEach(filename => {
      if (filename) deleteFile(filename);
    });

    res.status(200).json({ message: 'Atividade apagada com sucesso.' });
  } catch (error) {
    console.error("Erro ao deletar atividade:", error);
    res.status(500).json({ message: 'Erro no servidor ao apagar atividade.' });
  }
};
