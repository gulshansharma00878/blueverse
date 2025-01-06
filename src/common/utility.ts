import { validate as isValidUUID } from 'uuid';
import crypto from 'crypto';
import password from 'secure-random-password';

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
};
