// 1. Importa a conexão com o banco de dados
const db = require('../config/db.js');
const fs = require('fs');
const path = require('path');

<<<<<<< HEAD

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


exports.getAtividades = (req, res) => {
  const sql = "SELECT * FROM atividades ORDER BY id DESC LIMIT 4";
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ message: 'Erro interno ao buscar atividades.' });
    res.status(200).json(results);
  });
};


exports.getAtividadeById = (req, res) => {
  const { id } = req.params;
  const sql = "SELECT * FROM atividades WHERE id = ?";
  db.query(sql, [id], (err, results) => {
    if (err) return res.status(500).json({ message: 'Erro interno ao buscar atividade.' });
    if (results.length === 0) return res.status(404).json({ message: 'Atividade não encontrada.' });
    
    const atividade = results[0];
    
    
    const baseUrl = `http://localhost:4000/uploads/`;
    
    
    atividade.imagem_url_1 = atividade.imagem_url_1 ? baseUrl + atividade.imagem_url_1 : null;
    atividade.imagem_url_2 = atividade.imagem_url_2 ? baseUrl + atividade.imagem_url_2 : null;
    atividade.imagem_url_3 = atividade.imagem_url_3 ? baseUrl + atividade.imagem_url_3 : null;
    atividade.imagem_url_4 = atividade.imagem_url_4 ? baseUrl + atividade.imagem_url_4 : null;

    res.status(200).json(atividade);
  });
};


exports.createAtividade = (req, res) => { 
  try {
    const checkSql = "SELECT COUNT(*) AS total FROM atividades";
    db.query(checkSql, (err, results) => {
      if (err) return res.status(500).json({ message: 'Erro de servidor ao verificar limite.' });

      if (results[0].total >= 4) {
        deleteUploadedFilesOnError(req.files); 
        return res.status(400).json({ message: 'Limite de 4 atividades atingido.' });
      }
=======
// --- Funções Utilitárias (PARA DELETAR ARQUIVOS) ---
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
// --- Fim das Funções Utilitárias ---


// --- (Público) LER TODAS as Atividades ---
exports.getAtividades = (req, res) => {
  const sql = "SELECT * FROM atividades ORDER BY id DESC LIMIT 4";
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ message: 'Erro interno ao buscar atividades.' });
    res.status(200).json(results);
  });
};

// --- (Admin) LER UMA Atividade (para Edição) ---
exports.getAtividadeById = (req, res) => {
  const { id } = req.params;
  const sql = "SELECT * FROM atividades WHERE id = ?";
  db.query(sql, [id], (err, results) => {
    if (err) return res.status(500).json({ message: 'Erro interno ao buscar atividade.' });
    if (results.length === 0) return res.status(404).json({ message: 'Atividade não encontrada.' });
    
    const atividade = results[0];
    
    // Definindo a URL para ambiente local
    const baseUrl = `http://localhost:4000/uploads/`;
    
    // Mapeia os nomes dos ficheiros para URLs (se existirem)
    atividade.imagem_url_1 = atividade.imagem_url_1 ? baseUrl + atividade.imagem_url_1 : null;
    atividade.imagem_url_2 = atividade.imagem_url_2 ? baseUrl + atividade.imagem_url_2 : null;
    atividade.imagem_url_3 = atividade.imagem_url_3 ? baseUrl + atividade.imagem_url_3 : null;
    atividade.imagem_url_4 = atividade.imagem_url_4 ? baseUrl + atividade.imagem_url_4 : null;

    res.status(200).json(atividade);
  });
};

// --- (Admin) CRIAR uma Atividade ---
exports.createAtividade = (req, res) => { // <<< ESSA FUNÇÃO ESTAVA FALTANDO!
  try {
    const checkSql = "SELECT COUNT(*) AS total FROM atividades";
    db.query(checkSql, (err, results) => {
      if (err) return res.status(500).json({ message: 'Erro de servidor ao verificar limite.' });

      if (results[0].total >= 4) {
        deleteUploadedFilesOnError(req.files); 
        return res.status(400).json({ message: 'Limite de 4 atividades atingido.' });
      }
>>>>>>> eb02db80e35b0130d499aa434643a10ba9b4403e

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

<<<<<<< HEAD
      db.query(sql, values, (err, result) => {
        if (err) return res.status(500).json({ message: 'Erro interno ao salvar atividade.' });
        res.status(201).json({ message: 'Atividade criada com sucesso!', id: result.insertId });
      });
    });
  } catch (error) {
    res.status(500).json({ message: 'Erro no servidor.' });
  }
};


exports.updateAtividade = (req, res) => { 
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

    const findSql = "SELECT imagem_url_1, imagem_url_2, imagem_url_3, imagem_url_4 FROM atividades WHERE id = ?";
    db.query(findSql, [id], (err, results) => {
      if (err) return res.status(500).json({ message: 'Erro ao procurar atividade antiga.' });
      if (results.length === 0) {
        deleteUploadedFilesOnError(req.files);
        return res.status(404).json({ message: 'Atividade não encontrada.' });
      }

      const oldImageUrls = results[0];
      let updateSql = "UPDATE atividades SET titulo = ?, descricao = ?";
      const values = [titulo, descricao];

      Object.keys(newImageUrls).forEach(key => {
        updateSql += `, ${key} = ?`;
        values.push(newImageUrls[key]);
      });
=======
      db.query(sql, values, (err, result) => {
        if (err) return res.status(500).json({ message: 'Erro interno ao salvar atividade.' });
        res.status(201).json({ message: 'Atividade criada com sucesso!', id: result.insertId });
      });
    });
  } catch (error) {
    res.status(500).json({ message: 'Erro no servidor.' });
  }
};

// --- (Admin) ATUALIZAR uma Atividade (Editar) ---
exports.updateAtividade = (req, res) => { // <<< ESSA FUNÇÃO ESTAVA FALTANDO!
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

    const findSql = "SELECT imagem_url_1, imagem_url_2, imagem_url_3, imagem_url_4 FROM atividades WHERE id = ?";
    db.query(findSql, [id], (err, results) => {
      if (err) return res.status(500).json({ message: 'Erro ao procurar atividade antiga.' });
      if (results.length === 0) {
        deleteUploadedFilesOnError(req.files);
        return res.status(404).json({ message: 'Atividade não encontrada.' });
      }

      const oldImageUrls = results[0];
      let updateSql = "UPDATE atividades SET titulo = ?, descricao = ?";
      const values = [titulo, descricao];

      Object.keys(newImageUrls).forEach(key => {
        updateSql += `, ${key} = ?`;
        values.push(newImageUrls[key]);
      });

      updateSql += " WHERE id = ?";
      values.push(id);
>>>>>>> eb02db80e35b0130d499aa434643a10ba9b4403e

      db.query(updateSql, values, (err, result) => {
        if (err) {
          return res.status(500).json({ message: 'Erro interno ao atualizar atividade.' });
        }

<<<<<<< HEAD
      db.query(updateSql, values, (err, result) => {
        if (err) {
          return res.status(500).json({ message: 'Erro interno ao atualizar atividade.' });
        }

        Object.keys(newImageUrls).forEach(key => {
          const oldFilename = oldImageUrls[key];
          if (oldFilename) { 
            deleteFile(oldFilename);
          }
        });

        res.status(200).json({ message: 'Atividade atualizada com sucesso.' });
      });
    });

  } catch (error) {
    res.status(500).json({ message: 'Erro no servidor.' });
  }
};


exports.deleteAtividade = (req, res) => { 
  try {
    const { id } = req.params;
    const findSql = "SELECT imagem_url_1, imagem_url_2, imagem_url_3, imagem_url_4 FROM atividades WHERE id = ?";
    db.query(findSql, [id], (err, results) => {
      if (err) return res.status(500).json({ message: 'Erro ao procurar atividade para apagar.' });
      if (results.length === 0) return res.status(404).json({ message: 'Atividade não encontrada.' });
      
      const atividade = results[0];
      const deleteSql = "DELETE FROM atividades WHERE id = ?";
      
      db.query(deleteSql, [id], (err, result) => {
        if (err) return res.status(500).json({ message: 'Erro ao apagar atividade do banco.' });
        
        const imagesToDelete = [atividade.imagem_url_1, atividade.imagem_url_2, atividade.imagem_url_3, atividade.imagem_url_4];
        imagesToDelete.forEach(filename => {
          if (filename) deleteFile(filename);
        });
        res.status(200).json({ message: 'Atividade apagada com sucesso.' });
      });
    });
  } catch (error) {
    res.status(500).json({ message: 'Erro no servidor.' });
  }
=======
        Object.keys(newImageUrls).forEach(key => {
          const oldFilename = oldImageUrls[key];
          if (oldFilename) { 
            deleteFile(oldFilename);
          }
        });

        res.status(200).json({ message: 'Atividade atualizada com sucesso.' });
      });
    });

  } catch (error) {
    res.status(500).json({ message: 'Erro no servidor.' });
  }
};


// --- (Admin) DELETAR uma Atividade ---
exports.deleteAtividade = (req, res) => { // <<< ESSA FUNÇÃO ESTAVA FALTANDO!
  try {
    const { id } = req.params;
    const findSql = "SELECT imagem_url_1, imagem_url_2, imagem_url_3, imagem_url_4 FROM atividades WHERE id = ?";
    db.query(findSql, [id], (err, results) => {
      if (err) return res.status(500).json({ message: 'Erro ao procurar atividade para apagar.' });
      if (results.length === 0) return res.status(404).json({ message: 'Atividade não encontrada.' });
      
      const atividade = results[0];
      const deleteSql = "DELETE FROM atividades WHERE id = ?";
      
      db.query(deleteSql, [id], (err, result) => {
        if (err) return res.status(500).json({ message: 'Erro ao apagar atividade do banco.' });
        
        const imagesToDelete = [atividade.imagem_url_1, atividade.imagem_url_2, atividade.imagem_url_3, atividade.imagem_url_4];
        imagesToDelete.forEach(filename => {
          if (filename) deleteFile(filename);
        });
        res.status(200).json({ message: 'Atividade apagada com sucesso.' });
      });
    });
  } catch (error) {
    res.status(500).json({ message: 'Erro no servidor.' });
  }
>>>>>>> eb02db80e35b0130d499aa434643a10ba9b4403e
};