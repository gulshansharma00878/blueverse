import AdmZip from 'adm-zip';
import { logger } from '../logger/logger';
import { config } from '../../config/config';
import path from 'path';

const convertFolderToZip = async (pdfFolderPath: any, folderPath: any) => {
  try {
    const zip = new AdmZip();
    const uId = Math.random() * 1000;
    const fileName = `certificatePdfs_${uId}.zip`; //file name
    const localFilePath = path.join('certificates', fileName); //local folder path
    const outputFile = path.join(__dirname, `../../${localFilePath}`); // full file location

    const outputFilePath = `${config.certificatePath}/${localFilePath}`; // api reponse file path
    zip.addLocalFolder(pdfFolderPath);
    zip.writeZip(outputFile);
    return outputFilePath;
  } catch (err) {
    logger.error('Error in zip conversion ' + err?.message);
  }
};

export { convertFolderToZip };
