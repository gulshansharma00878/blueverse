import qs from 'qs';
import { config } from '../../../config/config';
import axios from 'axios';
var crypto = require('crypto');

// new encryption
function getAlgorithm(keyBase64: any) {
  var key = Buffer.from(keyBase64, 'base64');
  switch (key.length) {
    case 16:
      return 'aes-128-cbc';
    case 32:
      return 'aes-256-cbc';
  }
  throw new Error('Invalid key length: ' + key.length);
}
// configure for backend connections

// for encryption
const encryptData = (plainText: any, keyBase64: any, ivBase64: any) => {
  const key = Buffer.from(keyBase64, 'base64');
  const iv = Buffer.from(ivBase64, 'base64');

  const cipher = crypto.createCipheriv(getAlgorithm(keyBase64), key, iv);
  let encrypted = cipher.update(plainText, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
};

const ccEncryptData = (body: any, workingKey: any) => {
  var md5 = crypto.createHash('md5').update(workingKey).digest();
  //Generate Md5 hash for the key and then convert in base64 string
  var md5 = crypto.createHash('md5').update(workingKey).digest();
  var keyBase64 = Buffer.from(md5).toString('base64');

  //Initializing Vector and then convert in base64 string
  var ivBase64 = Buffer.from([
    0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0a, 0x0b,
    0x0c, 0x0d, 0x0e, 0x0f,
  ]).toString('base64');
  return encryptData(body, keyBase64, ivBase64);
};

// for decryption

const decryptData = (messagebase64: any, keyBase64: any, ivBase64: any) => {
  const key = Buffer.from(keyBase64, 'base64');
  const iv = Buffer.from(ivBase64, 'base64');

  const decipher = crypto.createDecipheriv(getAlgorithm(keyBase64), key, iv);
  let decrypted = decipher.update(messagebase64, 'hex');
  decrypted += decipher.final();
  return decrypted;
};
const ccDecryptData = (ccavEncResponse: any, workingKey: any) => {
  //Generate Md5 hash for the key and then convert in base64 string
  var md5 = crypto.createHash('md5').update(workingKey).digest();
  var keyBase64 = Buffer.from(md5).toString('base64');

  //Initializing Vector and then convert in base64 string
  var ivBase64 = Buffer.from([
    0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0a, 0x0b,
    0x0c, 0x0d, 0x0e, 0x0f,
  ]).toString('base64');
  console.log(ccavEncResponse, keyBase64, ivBase64);
  return decryptData(ccavEncResponse, keyBase64, ivBase64);
};

// generate hash function
const ccPaymentIntEncrypt = (data: any) => {
  const { frontWorkingKey, frontAccessCode, billingUrl } =
    config.ccAvenueDetail;
  const stringify_payload = qs.stringify({
    ...data,
  });
  const enc = ccEncryptData(stringify_payload, frontWorkingKey);
  let form =
    '<form id="nonseamless" method="post" name="redirect" action="' +
    billingUrl +
    '"/> <input type="hidden" id="encRequest" name="encRequest" value="' +
    enc +
    '"><input type="hidden" name="access_code" id="access_code" value="' +
    frontAccessCode +
    '"><script language="javascript">document.redirect.submit();</script></form>';

  return { enc, form };
};
const getOrderStatus = async (orderId: any) => {
  const { backAccessCode, backWorkingKey, apiURl } = config.ccAvenueDetail;
  let payload = {
    order_no: orderId, // your order_no that you sent to payment gateway
  };
  const stringify_payload = JSON.stringify(payload); // convert object to JSON
  const enc = ccEncryptData(stringify_payload, backWorkingKey); //Encrypt request
  let ccave_payload = {
    command: 'orderStatusTracker',
    enc_request: enc,
    access_code: backAccessCode, // your access code
    request_type: 'JSON',
    response_type: 'JSON',
    version: 1.1,
  };
  let params = `enc_request=${ccave_payload.enc_request}&access_code=${ccave_payload.access_code}&command=${ccave_payload.command}&request_type=${ccave_payload.request_type}&response_type=${ccave_payload.response_type}&version=${ccave_payload.version}`;
  let fullUrl = `${apiURl}?${params}`;
  let ccave_response = await axios.post(fullUrl, {}, {}); //fetch order status response
  const OrderResponse = ccave_response.data;
  let jsonResult = {};
  let backDecryptResult = '';
  if (OrderResponse) {
    let ccavPost: any = qs.parse(OrderResponse);
    if (ccavPost) {
      let encryption = ccavPost.enc_response;
      backDecryptResult = ccDecryptData(
        // Decrypt response
        encryption,
        config.ccAvenueDetail.backWorkingKey
      );
    }
  }
  if (backDecryptResult) {
    jsonResult = JSON.parse(backDecryptResult); // convert JSON to object
  }
  return jsonResult;
};
export { ccEncryptData, ccDecryptData, ccPaymentIntEncrypt, getOrderStatus };
