const multer = require('multer');
const path = require('path'); // Módulo nativo do Node.js

// 1. Configurar o Armazenamento (Storage)
const storage = multer.diskStorage({
  // Define a pasta de destino
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Salva na pasta 'uploads/' que criámos
  },
  // Define o nome do ficheiro
  filename: (req, file, cb) => {
    // Cria um nome de ficheiro único
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// 2. Inicializar o Multer com a configuração de armazenamento
const upload = multer({ storage: storage });

// 3. Configurar os campos de upload
// (Esperando 4 imagens, como o seu design pede)
exports.uploadAtividadeImages = upload.fields([
  { name: 'imagem_1', maxCount: 1 },
  { name: 'imagem_2', maxCount: 1 },
  { name: 'imagem_3', maxCount: 1 },
  { name: 'imagem_4', maxCount: 1 }
]);