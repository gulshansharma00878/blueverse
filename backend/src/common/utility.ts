import { validate as isValidUUID } from 'uuid';
import crypto from 'crypto';
import password from 'secure-random-password';
import { ToWords } from 'to-words';
import moment from 'moment-timezone';
import fs from 'fs-extra';
import { config } from '../config/config';
import qs from 'qs';
import { logger } from '../services/logger/logger';

const isNullOrUndefined = (param: any) => {
  if (param === null || param === undefined) {
    return true;
  }
  return false;
};
const getTimeInMilliSeconds = () => {
  return new Date().getTime();
};

const isEmailValid = (email: string) => {
  // eslint-disable-next-line no-control-regex
  let emailValidator =
    /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;
  if (!emailValidator.test(email.toLowerCase())) {
    return false;
  }
  return true;
};
const otpGenerator = () => {
  return Math.floor(Math.random() * (999999 - 100000)) + 100000;
};
const isStringOnlyContainsNumber = (string: string) => {
  return /^\d+$/.test(string);
};
const isValidGuid = (id: string) => {
  if (!isValidUUID(id)) {
    return false;
  }
  return true;
};

const getUniqueValidUUIDs = (uuids: string[]) => {
  const uniqueUUIDs = [...new Set(uuids)];
  return uniqueUUIDs.filter((uuid: string) => isValidUUID(uuid));
};
const isSKUNumber = (skuString: string) => {
  let skuValidator = /^(SP|GP|PP)([\d]{9})$/;
  if (!skuValidator.test(skuString)) {
    return false;
  }
  return true;
};
const isHSRPNumber = (hsrpString: string) => {
  let hsrpValidator = /^([A-Z]{2})([\d]{2})([A-Z]{2})([0-9]{4})$/;
  if (!hsrpValidator.test(hsrpString)) {
    return false;
  }
  return true;
};

const isNumber = (num: any) => {
  return typeof num === 'number' ? true : false;
};

const isString = (str: any) => {
  return typeof str === 'string' && str.trim().length > 0;
};

const isValidString = (param: any) => {
  if (!isNullOrUndefined(param) && isString(param)) {
    return true;
  }
  return false;
};
const isBoolean = (val: any) => {
  return typeof val === 'boolean' ? true : false;
};

const generatePassword = () => {
  return password.randomPassword({
    characters: [
      password.lower,
      password.upper,
      password.digits,
      password.symbols,
    ],
  });
};

const randomValueHex = (len: any) => {
  return crypto
    .randomBytes(Math.ceil(len / 2))
    .toString('hex') // convert to hexadecimal format
    .slice(0, len)
    .toUpperCase(); // return required number of characters
};

const toTitleCase = (str: string) =>
  str.replace(
    /(^\w|\s\w)(\S*)/g,
    (_, m1, m2) => m1.toUpperCase() + m2.toLowerCase()
  );

function calcPercent(num: number, percentage: number) {
  return Number(num * (percentage / 100));
}

function calcActualAmount(totalAmount: number, percentage: number) {
  return Number((totalAmount * 100) / (100 + percentage));
}

const getMonthName = (monthNumber: any) => {
  monthNumber = Number(monthNumber) - 1;
  if (monthNumber < 0 || monthNumber > 11) {
    return '';
  } else {
    const months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];
    return months[monthNumber];
  }
};

const numberToWords = (amount: any) => {
  const toWords = new ToWords();
  return toWords.convert(Number(amount), { currency: true });
};

const getMonthStartDate = (date: any) => {
  return moment(date).startOf('month').format('MMM DD, YYYY');
};
const getMonthEndDate = (date: any) => {
  return moment(date).endOf('month').format('MMM DD, YYYY');
};
const getYear = (date: any) => {
  return moment(date).year();
};

const deleteFile = async (fileName: string) => {
  const isExist = fs.existsSync(fileName);
  if (isExist) {
    return await fs.unlink(fileName);
  }
  return;
};

const calculateAverage = (array: any) => {
  if (array.length) {
    return array
      .map((x: any) => x / array.length)
      .reduce((adder: any, value: any) => adder + value);
  }
  return 0;
};
const calculateSum = (array: any) => {
  if (array.length) {
    return array.reduce((adder: any, value: any) => adder + value);
  }
  return 0;
};

const getDateFromFullDate = (date: any) => {
  return Number(moment(date).date());
};

const deleteAllPdfFileInFolder = (folderPath: any) => {
  try {
    const files = fs.readdir(folderPath, (err: any, files: any) => {
      if (err) throw err;

      files.forEach((file: any) => {
        // Check if the file is with a PDF extension, remove it
        if (file.split('.').pop().toLowerCase() == 'pdf') {
          fs.unlinkSync(folderPath + '/' + file);
        }
      });
    });
  } catch (err) {
    logger.error(`Error in deleting  pdf file ${err}`, err);
  }
};

const fourDigitOtpGenerator = () => {
  return Math.floor(Math.random() * (9999 - 1000)) + 1000;
};

// Calculate the amount before tax, CGST amount, and SGST amount.

// Parameters:
// total_amount (float): The total amount including tax.
// cgst_rate (float): The CGST rate (default is 9%).
// sgst_rate (float): The SGST rate (default is 9%).
const calculate_tax_details = (total_amount: number) => {
  const cgst_rate = config.cgstPercentage / 100;
  const sgst_rate = config.sgstPercentage / 100;
  const total_tax_rate = cgst_rate + sgst_rate;
  const amount_before_tax = total_amount / (1 + total_tax_rate);
  const cgst_amount = amount_before_tax * cgst_rate;
  const sgst_amount = amount_before_tax * sgst_rate;
  return {
    grossAmount: amount_before_tax,
    cgstAmount: cgst_amount,
    sgstAmount: sgst_amount,
  };
};
const getNotificationStatus = (lastNotificationDate: any) => {
  const currentDate = moment().tz('Asia/Kolkata'); // Current date and time
  const notificationDate = moment(lastNotificationDate).tz('Asia/Kolkata'); // Convert to moment object

  // Check if the date parts are the same
  const isSameDate = currentDate.isSame(notificationDate, 'day');

  // Check if the notification date is before the current date
  const isBefore = notificationDate.isBefore(currentDate);

  if (isSameDate && isBefore) {
    return 'Sent';
  } else {
    return 'Schedule';
  }
};

const getSKUUniqueDigitNumeric = (SKUNUmber: any) => {
  // Extract the date (DDMMYY) part from the unique number
  const datePart: string = SKUNUmber.slice(4, 10); // '230824' from 'M3SW230824032'
  const incrementedNumber: string = SKUNUmber.slice(10); // '032' from 'M3SW230824032'

  // Parse the date part into day, month, and year
  const day: string = datePart.slice(0, 2);
  const month: string = datePart.slice(2, 4);
  const year: string = `20${datePart.slice(4, 6)}`; // Add century to the year to get '2024'

  // Convert to Date object
  const inputDate: Date = new Date(`${year}-${month}-${day}`);
  const baseDate: Date = new Date('2015-01-01');

  // Calculate the difference in days
  const diffInMilliseconds: number = inputDate.getTime() - baseDate.getTime();
  const daysSince1979: number = Math.floor(
    diffInMilliseconds / (1000 * 60 * 60 * 24)
  );

  // Concatenate the number of days with the incremented number
  const result: string = `${daysSince1979}${incrementedNumber}`;

  return result;
};

const separateDateAndTime = (
  timestamp: any
): { date: string; time: string } => {
  console.log('🚀 ~ timestamp:', timestamp);

  // If the timestamp is a Date object, convert it to a moment object
  const timestampMoment = moment(timestamp).tz('Asia/Kolkata');

  // Format the date and time using moment
  const datePart = timestampMoment.format('YYYY-MM-DD'); // Format date as "YYYY-MM-DD"
  const timePart = timestampMoment.format('hh:mm:ss A'); // Format time as "hh:mm:ss AM/PM"

  return {
    date: datePart,
    time: timePart,
  };
};

export {
  isNullOrUndefined,
  getTimeInMilliSeconds,
  isEmailValid,
  otpGenerator,
  isStringOnlyContainsNumber,
  isValidGuid,
  isSKUNumber,
  isHSRPNumber,
  isNumber,
  isString,
  isValidString,
  isBoolean,
  generatePassword,
  randomValueHex,
  toTitleCase,
  calcPercent,
  getMonthName,
  numberToWords,
  getMonthStartDate,
  getMonthEndDate,
  getYear,
  deleteFile,
  calcActualAmount,
  calculateAverage,
  getDateFromFullDate,
  calculateSum,
  deleteAllPdfFileInFolder,
  fourDigitOtpGenerator,
  calculate_tax_details,
  getUniqueValidUUIDs,
  getNotificationStatus,
  getSKUUniqueDigitNumeric,
  separateDateAndTime,
};
