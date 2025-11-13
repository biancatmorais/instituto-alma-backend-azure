const multer = require('multer');
const path = require('path'); 


const storage = multer.diskStorage({
  
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); 
  },
  
  filename: (req, file, cb) => {
    
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});


const upload = multer({ storage: storage });


exports.uploadAtividadeImages = upload.fields([
  { name: 'imagem_1', maxCount: 1 },
  { name: 'imagem_2', maxCount: 1 },
  { name: 'imagem_3', maxCount: 1 },
  { name: 'imagem_4', maxCount: 1 }
]);