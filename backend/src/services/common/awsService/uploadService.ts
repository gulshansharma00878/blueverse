const multer = require('multer');
const multerS3 = require('multer-s3');
const { S3Client } = require('@aws-sdk/client-s3');
import { logger } from '../../logger/logger';
import AWS from 'aws-sdk';
import path from 'path';
import createError from 'http-errors';
import fs from 'fs-extra';
import { config } from '../../../config/config';




//  live code

// AWS.config.update({
//   accessKeyId: process.env.AWS_ACCESS_KEY,
//   secretAccessKey: process.env.AWS_SECRET_KEY,
//   region: process.env.AWS_S3_REGION_NAME,
// });

// create s3 instance using S3Client
// (this is how we create s3 instance in v3)

// const s3 = new S3Client({
//   credentials: {
//     accessKeyId: process.env.AWS_ACCESS_KEY, // store it in .env file to keep it safe
//     secretAccessKey: process.env.AWS_SECRET_KEY,
//   },
//   region: process.env.AWS_S3_REGION_NAME, // this is the region that you select in AWS account
// });

// const s3Storage = multerS3({
//   s3: s3, // s3 instance
//   bucket: process.env.S3_STORE_NAME, // change it as per your project requirement
//   acl: 'public-read', // storage access type
//   metadata: (req: any, file: any, cb: any) => {
//     cb(null, { fieldname: file.fieldname });
//   },
//   key: (req: any, file: any, cb: any) => {
//     let fileName = Date.now() + '_' + file.fieldname + '_' + file.originalname;
//     fileName = `${config.serverConfig.env}/${fileName}`;
//     cb(null, fileName);
//   },
// });

// function to sanitize files and send error for unsupported files
function sanitizeFile(file: any, cb: any) {
  // Define the allowed extension
  const fileExts = ['.png', '.jpg', '.jpeg', '.gif'];

  // Check allowed extensions
  const isAllowedExt = fileExts.includes(
    path.extname(file.originalname.toLowerCase())
  );

  // Mime type must be an image
  const isAllowedMimeType = file.mimetype.startsWith('image/');

  if (isAllowedExt && isAllowedMimeType) {
    return cb(null, true); // no errors
  } else {
    // pass error msg to callback, which can be displaye in frontend
    cb('Error: File type not allowed!');
  }
}

// our middleware
// const uploadImage = multer({
//   storage: s3Storage,
//   fileFilter: (req: any, file: any, callback: any) => {
//     sanitizeFile(file, callback);
//   },
//   limits: {
//     fileSize: 1024 * 1024 * 10, // 2mb file size
//   },
// });
// function to sanitize files and send error for unsupported files
function sanitizeDocFile(req: any, file: any, cb: any) {
  // Define the allowed extension
  const fileExts = [
    '.pdf',
    '.doc',
    '.docx',
    '.xls',
    '.xlsx',
    '.ppt',
    '.txt',
    '.rtx',
    '.csv',
    '.png',
    '.jpg',
    '.jpeg',
  ];
  // Check allowed extensions
  const isAllowedExt = fileExts.includes(
    path.extname(file.originalname.toLowerCase())
  );
  // Mime type must be an image
  // const isAllowedMimeType = file.mimetype.startsWith('doc/');
  if (isAllowedExt) {
    const fileSize = parseInt(req.headers['content-length']);
    if (fileSize > 1024 * 1024 * 5) {
      cb(createError(400, 'File size exceeds maximum limit(5 MB).'));
    }
    return cb(null, true); // no errors
  } else {
    // pass error msg to callback, which can be displaye in frontend
    cb(createError(400, 'Unsupported document format.'));
  }
}
// const uploadDocs = multer({
//   storage: s3Storage,
//   fileFilter: (req: any, file: any, callback: any) => {
//     sanitizeDocFile(req, file, callback);
//   },
//   limits: {
//     fileSize: 1024 * 1024 * 5, // 5mb file size
//   },
// });
// const s3bucket = new AWS.S3();
// const uploadFile = async (data: any, fileName: string) => {
//   try {
//     const params = {
//       Bucket: process.env.S3_STORE_NAME,
//       Key: `${config.serverConfig.env}/${fileName}`,
//       Body: data,
//       ContentType: 'text/csv',
//       ContentDisposition: 'attachment',
//     };
//     const response = await s3bucket.upload(params).promise();
//     return response?.Location;
//   } catch (err) {
//     logger.error(`Error in upload csv file ${err}`, err);
//   }
// };

// const uploadPDF = async (fileDetail: any) => {
//   try {
//     const { fileName, path } = fileDetail;
//     const fileContent = fs.readFileSync(path);
//     const params = {
//       Bucket: process.env.S3_STORE_NAME,
//       Key: `${config.serverConfig.env}/${fileName}`,
//       Body: fileContent,
//       ContentType: 'application/pdf',
//       ContentDisposition: 'attachment',
//     };
//     const response = await s3bucket.upload(params).promise();
//     return response?.Location;
//   } catch (err) {
//     console.log(err);
//     logger.error(`Error in upload pdf file ${err}`, err);
//   }
// };

//  test code 

const storage = multer.diskStorage({
  destination: (req: any, file: any, cb: any) => {
    cb(null, path.join(__dirname, 'uploads'));
  },
  filename: (req: any, file: any, cb: any) => {
    const fileName = Date.now() + '_' + file.fieldname + '_' + file.originalname;
    cb(null, fileName);
  },
});

const uploadImage = multer({
  storage: storage,
  fileFilter: (req: any, file: any, callback: any) => {
    sanitizeFile(file, callback);
  },
  limits: {
    fileSize: 1024 * 1024 * 2, // 2mb file size
  },
});


const uploadDocs = multer({
  storage: storage,
  fileFilter: (req: any, file: any, callback: any) => {
    sanitizeDocFile(req, file, callback);
  },
  limits: {
    fileSize: 1024 * 1024 * 4, // 4mb file size
  },
});

const uploadFile = async (data: any, fileName: string) => {
  try {
    // Save the file to a local directory
    // const localPath = path.join(__dirname, 'uploads', fileName);
    const localPath = path.join('src/uploads', fileName+".csv");

    require('fs').writeFileSync(localPath, data);
    const newPath = `http://localhost:3000/files/${fileName}`
    return newPath;  
  } catch (err) {
    console.error(err);
  }
};

const uploadPDF = async (fileDetail: any) => {
  try {
    const { fileName, path } = fileDetail;
    const localPath = path.join('src/uploads', fileName);
    require('fs').writeFileSync(path, localPath);
    const newPath = `http://localhost:3000/files/${fileName}.csv`
    return newPath;  
  } catch (err) {
    console.log(err);
    logger.error(`Error in upload pdf file ${err}`, err);
  }
};

export = { uploadImage, uploadFile, uploadDocs, uploadPDF };
