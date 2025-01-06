import { logger } from '../logger/logger';
import puppeteer from 'puppeteer';
import handlebars from 'handlebars';
import fs from 'fs-extra';
import path from 'path';
import upload from '../common/awsService/uploadService';
import { notificationConstant } from '../../common/notificationConstants';
import { config } from '../../config/config';
import {
  toTitleCase,
  deleteFile,
  isNullOrUndefined,
} from '../../common/utility';

// Registering the "eq" helper
handlebars.registerHelper('eq', (arg1, arg2) => {
  return arg1 === arg2;
});

const compile = async (hbsFilePath: string, data: any) => {
  try {
    // Attempt to read the file and compile the template
    const html = await fs.readFile(hbsFilePath, 'utf-8');
    return handlebars.compile(html)(data);
  } catch (error) {
    // Catch and log the error for debugging purposes
    console.error('Error during template compilation:', error);
    throw new Error('Template compilation failed.'); // Optional: re-throw error if needed
  }
};

const convertHtmlToPdf = async (
  folderPath: any,
  hbsFilePath: any,
  pdfFilePath: string,
  data?: any
) => {
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();

    const compileResult = await compile(hbsFilePath, data);

    const htmlFilePath = path.join(
      folderPath,
      `${Date.now()}_${Math.floor(Math.random() * 10000)}_newHtmlPdf.html`
    );

    await fs.writeFile(htmlFilePath, compileResult);

    await page.goto(`file:${htmlFilePath}`, { waitUntil: 'networkidle0' });

    await page.setContent(compileResult);

    await page.pdf({
      path: pdfFilePath,
      format: 'A4',
      printBackground: true,
    });

    await fs.unlink(htmlFilePath);
  } catch (err) {
    logger.error('Error in HTML to PDF generation', err);
    throw err;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
};

const getFileDetails = (fileType: string, role: string, modelId: string) => {
  const file = {
    folderPath: __dirname + '../../../views/memo',
    hbsFilePath: '',
    pdfFilePath: '',
  };
  let pdfFolder = '';
  if (role == config.userRolesObject.ADMIN) {
    pdfFolder = `${file.folderPath}/adminFiles`;
  } else if (role == config.userRolesObject.DEALER) {
    pdfFolder = `${file.folderPath}/dealerFiles`;
  }
  switch (fileType) {
    case notificationConstant.types.ADVANCE_MEMO:
      file['hbsFilePath'] = path.join(file.folderPath, 'advanceMemo.hbs');
      file['pdfFilePath'] = path.join(pdfFolder, `${modelId}_advanceMemo.pdf`);
      break;
    case notificationConstant.types.TAX_INVOICE_MEMO:
      file['hbsFilePath'] = path.join(file.folderPath, 'taxInvoiceMemo.hbs');
      file['pdfFilePath'] = path.join(pdfFolder, `${modelId}_taxInvoice.pdf`);
      break;
    case notificationConstant.types.TOPUP_UP_MEMO:
      file['hbsFilePath'] = path.join(file.folderPath, 'topUpMemo.hbs');
      file['pdfFilePath'] = path.join(pdfFolder, `${modelId}_topUpMemo.pdf`);
      break;
    case notificationConstant.types.BLUEVERSE_CREDIT_MEMO:
      file['hbsFilePath'] = path.join(
        file.folderPath,
        'blueverseCreditMemo.hbs'
      );
      file['pdfFilePath'] = path.join(
        pdfFolder,
        `${modelId}_blueverseCredit.pdf`
      );
      break;
    case notificationConstant.types.INVOICE:
      file['hbsFilePath'] = path.join(file.folderPath, 'invoice.hbs');
      file['pdfFilePath'] = path.join(pdfFolder, `${modelId}_invoice.pdf`);
      break;
    default:
      console.log('File Type not defined');
  }
  return file;
};

const generateAndUploadMemoPdf = async (
  fileType: string,
  role: string,
  data: any,
  allowUpload: boolean
) => {
  try {
    const { folderPath, hbsFilePath, pdfFilePath } = getFileDetails(
      fileType,
      role,
      data.machineMemoId
    );

    await convertHtmlToPdf(folderPath, hbsFilePath, pdfFilePath, data);

    let tempFileName = pdfFilePath.split('/');
    const pdfFileDetails = {
      fileName: tempFileName[tempFileName.length - 1],
      path: pdfFilePath,
    };
    let result: any = {
      file: [pdfFileDetails],
    };
    if (allowUpload) {
      result['s3Address'] = await upload.uploadPDF(pdfFileDetails);
    }
    console.log('🚀 ~ result:', result);

    return result;
  } catch (err) {
    logger.error('Error in html to pdf genration', err);
  }
};

const generateAndCustomerMemoPdf = async (data: any, allowUpload: boolean) => {
  try {
    let folderPath = __dirname + '../../../views/memo';
    let hbsFilePath = path.join(folderPath, 'customerMemo.hbs');
    let pdfFolder = `${folderPath}/adminFiles`;
    let pdfFilePath = path.join(pdfFolder, `${data.bookingId}_invoice.pdf`);

    await convertHtmlToPdf(folderPath, hbsFilePath, pdfFilePath, data);

    let tempFileName = pdfFilePath.split('/');
    const pdfFileDetails = {
      fileName: tempFileName[tempFileName.length - 1],
      path: pdfFilePath,
    };
    let result: any = {
      file: [pdfFileDetails],
    };
    if (allowUpload) {
      result['s3Address'] = await upload.uploadPDF(pdfFileDetails);
    }
    console.log('🚀 ~ result:', result);

    deleteFile(result.file[0].path);

    return result;
  } catch (err) {
    logger.error('Error in html to customer pdf generation', err);
  }
};

const generateAndUploadMemoOldPdfFormat = async (
  fileType: string,
  role: string,
  data: any,
  allowUpload: boolean
) => {
  try {
    let folderPath = __dirname + '../../../views/memo';
    let hbsFilePath = path.join(folderPath, 'oldTaxInvoice.hbs');
    let pdfFolder = `${folderPath}/adminFiles`;
    let pdfFilePath = path.join(pdfFolder, `${data.machineMemoId}_invoice.pdf`);

    await convertHtmlToPdf(folderPath, hbsFilePath, pdfFilePath, data);

    let tempFileName = pdfFilePath.split('/');
    const pdfFileDetails = {
      fileName: tempFileName[tempFileName.length - 1],
      path: pdfFilePath,
    };
    let result: any = {
      file: [pdfFileDetails],
    };
    if (allowUpload) {
      result['s3Address'] = await upload.uploadPDF(pdfFileDetails);
    }
    console.log('🚀 ~ result:', result);

    deleteFile(result.file[0].path);

    return result;
  } catch (err) {
    logger.error('Error in html to customer pdf generation', err);
  }
};
export {
  convertHtmlToPdf,
  generateAndUploadMemoPdf,
  compile,
  generateAndCustomerMemoPdf,
  generateAndUploadMemoOldPdfFormat,
};
