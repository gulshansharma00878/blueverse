const multer = require('multer');
import path from 'path';

const storage = multer.diskStorage({
  destination: (req: any, file: any, cb: any) => {
    cb(null, path.join(__dirname, 'uploads'));
  },
  filename: (req: any, file: any, cb: any) => {
    const fileName = Date.now() + '_' + file.fieldname + '_' + file.originalname;
    cb(null, fileName);
  },
});

function sanitizeFile(file: any, cb: any) {
  const fileExts = ['.png', '.jpg', '.jpeg', '.gif'];
  const isAllowedExt = fileExts.includes(path.extname(file.originalname.toLowerCase()));
  const isAllowedMimeType = file.mimetype.startsWith('image/');

  if (isAllowedExt && isAllowedMimeType) {
    return cb(null, true);
  } else {
    cb('Error: File type not allowed!');
  }
}

const uploadImage = multer({
  storage: storage,
  fileFilter: (req: any, file: any, callback: any) => {
    sanitizeFile(file, callback);
  },
  limits: {
    fileSize: 1024 * 1024 * 2, // 2mb file size
  },
});

function sanitizeDocFile(file: any, cb: any) {
  const fileExts = ['.png', '.jpg', '.jpeg', '.gif', '.csv', '.pdf'];
  const isAllowedExt = fileExts.includes(path.extname(file.originalname.toLowerCase()));

  if (isAllowedExt) {
    return cb(null, true);
  } else {
    cb('Error: File type not allowed!');
  }
}

const uploadDocs = multer({
  storage: storage,
  fileFilter: (req: any, file: any, callback: any) => {
    sanitizeDocFile(file, callback);
  },
  limits: {
    fileSize: 1024 * 1024 * 4, // 4mb file size
  },
});

const uploadFile = async (data: any, fileName: string) => {
  try {
    // Save the file to a local directory
    // const localPath = path.join(__dirname, 'uploads', fileName);
    const localPath = path.join('src/uploads', fileName);

    require('fs').writeFileSync(localPath, data);
    const newPath = `http://localhost:3000/files/${fileName}.csv`
    return newPath;  
  } catch (err) {
    console.error(err);
  }
};

export = { uploadImage, uploadFile, uploadDocs };
