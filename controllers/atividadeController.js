const db = require('../config/db.js');
const fs = require('fs');
const path = require('path');

// --- (Público) LER TODAS as Atividades ---
exports.getAtividades = (req, res) => {
  const sql = "SELECT * FROM atividades ORDER BY id DESC LIMIT 4";
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ message: 'Erro interno ao buscar atividades.' });
    res.status(200).json(results);
  });
};

// --- (NOVO - Admin) LER UMA Atividade (para Edição) ---
exports.getOneAtividade = (req, res) => {
  const { id } = req.params;
  const sql = "SELECT * FROM atividades WHERE id = ?";
  db.query(sql, [id], (err, results) => {
    if (err) return res.status(500).json({ message: 'Erro interno ao buscar atividade.' });
    if (results.length === 0) return res.status(404).json({ message: 'Atividade não encontrada.' });
    res.status(200).json(results[0]); // Envia o primeiro (e único) resultado
  });
};

// --- (Admin) CRIAR uma Atividade ---
exports.createAtividade = (req, res) => {
  try {
    const checkSql = "SELECT COUNT(*) AS total FROM atividades";
    db.query(checkSql, (err, results) => {
      if (err) return res.status(500).json({ message: 'Erro de servidor ao verificar limite.' });

      if (results[0].total >= 4) {
        deleteUploadedFilesOnError(req.files); // Limpa as imagens
        return res.status(400).json({ message: 'Limite de 4 atividades atingido. Exclua uma antiga para adicionar uma nova.' });
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

      db.query(sql, values, (err, result) => {
        if (err) return res.status(500).json({ message: 'Erro interno ao salvar atividade.' });
        console.log('--- Nova Atividade Criada ---', req.body);
        res.status(201).json({ message: 'Atividade criada com sucesso!', id: result.insertId });
      });
    });
  } catch (error) {
    res.status(500).json({ message: 'Erro no servidor.' });
  }
};

// --- (NOVO - Admin) ATUALIZAR uma Atividade (Editar) ---
exports.updateAtividade = (req, res) => {
  try {
    const { id } = req.params;
    const { titulo, descricao } = req.body;
    const files = req.files; // Ficheiros novos (se houver)

    if (!titulo || !descricao) {
      deleteUploadedFilesOnError(req.files); // Limpa ficheiros novos
      return res.status(400).json({ message: 'Título e Descrição são obrigatórios.' });
    }
    
    // Objeto para guardar os novos caminhos das imagens
    const newImageUrls = {};
    if (files['imagem_1']) newImageUrls.imagem_url_1 = files['imagem_1'][0].filename;
    if (files['imagem_2']) newImageUrls.imagem_url_2 = files['imagem_2'][0].filename;
    if (files['imagem_3']) newImageUrls.imagem_url_3 = files['imagem_3'][0].filename;
    if (files['imagem_4']) newImageUrls.imagem_url_4 = files['imagem_4'][0].filename;

    // 1. Buscar os nomes dos ficheiros antigos (para apagar depois)
    const findSql = "SELECT imagem_url_1, imagem_url_2, imagem_url_3, imagem_url_4 FROM atividades WHERE id = ?";
    db.query(findSql, [id], (err, results) => {
      if (err) return res.status(500).json({ message: 'Erro ao procurar atividade antiga.' });
      if (results.length === 0) return res.status(404).json({ message: 'Atividade não encontrada.' });

      const oldImageUrls = results[0];

      // 2. Construir o comando de UPDATE
      // Começa com os dados de texto
      let updateSql = "UPDATE atividades SET titulo = ?, descricao = ?";
      const values = [titulo, descricao];

      // Adiciona as imagens novas (se houver)
      Object.keys(newImageUrls).forEach(key => {
        updateSql += `, ${key} = ?`;
        values.push(newImageUrls[key]);
      });

      updateSql += " WHERE id = ?";
      values.push(id);

      // 3. Executar o UPDATE
      db.query(updateSql, values, (err, result) => {
        if (err) {
          console.error('Erro ao atualizar atividade:', err);
          return res.status(500).json({ message: 'Erro interno ao atualizar atividade.' });
        }

        // 4. Apagar os ficheiros de imagem antigos (apenas os que foram substituídos)
        Object.keys(newImageUrls).forEach(key => {
          const oldFilename = oldImageUrls[key];
          if (oldFilename) { // Se existia um ficheiro antigo
            deleteFile(oldFilename);
          }
        });

        console.log(`--- Atividade ID ${id} Atualizada ---`);
        res.status(200).json({ message: 'Atividade atualizada com sucesso.' });
      });
    });

  } catch (error) {
    console.error('Erro no updateAtividade:', error);
    res.status(500).json({ message: 'Erro no servidor.' });
  }
};


// --- (Admin) DELETAR uma Atividade ---
exports.deleteAtividade = (req, res) => {
  // ... (código do deleteAtividade - sem alteração) ...
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
        console.log(`--- Atividade ID ${id} Apagada ---`);
        res.status(200).json({ message: 'Atividade apagada com sucesso.' });
      });
    });
  } catch (error) {
    console.error('Erro no deleteAtividade:', error);
    res.status(500).json({ message: 'Erro no servidor.' });
  }
};

// --- Funções Utilitárias ---
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