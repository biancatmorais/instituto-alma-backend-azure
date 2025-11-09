const multer = require('multer');
const path = require('path');

// 1. Configurar o Armazenamento (igual ao upload de imagens)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Salva na MESMA pasta 'uploads/'
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// 2. (NOVO) Filtro de Ficheiros (para aceitar APENAS PDF)
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true); // Aceita o ficheiro
  } else {
    // Rejeita o ficheiro (não é um PDF)
    cb(new Error('Formato de arquivo inválido. Apenas PDFs são permitidos.'), false);
  }
};

// 3. Inicializar o Multer com o filtro
const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 1024 * 1024 * 20 } // Limite de 20MB por PDF
});

// 4. Exportar o middleware (vamos esperar um ficheiro chamado 'arquivo')
exports.uploadPdf = upload.single('arquivo');