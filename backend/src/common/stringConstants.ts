import { randomUUID } from 'crypto';

const passwordServiceMessage = {
  WRONG_PASSWORD: 'The password you have entered is not valid.',
  PASSWORD_MATCHED: 'Password matched',
};
const genericMessage = {
  NOT_FOUND: 'Not Found',
  TOKEN_DOES_NOT_EXIST: 'Provide Token',
  SERVER_ERROR: 'Server Error',
  NO_NOTIFICATIONS: 'No Notifications',
  USER_EXISTS: 'You are already registered. Please login to continue.',
  NO_TRANSACTIONS: 'No Transactions',
  EMAIL_NOT_REGISTERED: 'Email not registered',
  USER_NOT_AUTHORIZED: 'User is not authorized',
  DEALER_NOT_AUTHORIZED: 'Dealer is not authorized',
  MISSING_EMAIL_DATA: 'Email is not available',
  EMAIL_ALREADY_EXIST: 'This email already exist',
  ONLY_ADMIN_ALLOWED: 'Only admin allowed',
  AGENT_EXISTS: 'Agent already exist',
  OTP_VERIFIED_SUCCESSFULLY: 'OTP verified successfully',
  ACCESS_DENIED: 'Access Denied',
  INVALID_OTP:
    'OTP is expired/invalid. Please request a new OTP and try again.',
  PHONE_ALREADY_EXIST:
    'This phone number has already been registered. Please enter a unique phone number to create a new dealer.',
  PAN_ALREADY_EXIST:
    'Duplicate PAN Number detected. Please enter a unique PAN Number to proceed with dealer creation.',
  OTP_SEND_SUCCESSFULLY: 'OTP send successfully',
  CUSTOMER_UPDATED: 'Customer update successfully',
  LIST_OF_CUSTOMER: 'List of customers',
  LOG_OUT: 'Logout successfully',
  LIST_OF_STATE: 'List of state and city',
  REFERRAL_APPLIED: 'Referral Applied Successfully',
  DATE_INVALID: 'Dates falls in existing referral date',
  DETAILS_OF_USER: 'Details of user',
  INVALID_MOBILE: 'Invalid mobile number / Invalid OTP',
};

const integrationMessage = {
  DUPLICATE_ENTRY:
    'Duplicate SKU attempt. There is already an entry with this SKU ID ',
};
const authServiceMessage = {
  UNAUTHORIZED_PLATFORM: 'Unauthorized Platform',
  UNAUTHORIZED_CLIENT: 'Unauthorized Client',
  TOKEN_VERIFIED: 'Token verified',
  TOKEN_EXPIRED: 'Token has expired. Login to continue',
  ACCOUNT_NOT_ACTIVATED:
    'Your account has been deactivated. Please contact super admin for assistance.',
  KYC_NOT_COMPLETED: 'KYC not completed',
};

const tokenServiceMessage = {
  USER_ID_DOES_NOT_EXIST: "User ID doesn't exist",
  USER_ID_IS_INVALID: 'Please provide User ID',
  TOKEN_IS_INVALID: 'Please provide token',
};

const userControllerMessage = {
  PASSWORD_CHANGED: 'Successfully changed password',
  INVALID_CURRENT_PASSWORD: 'Invalid current password',
  REGISTERED: 'Successfully registered',
  LOGGED_OUT: 'You have successfully logged out.',
  LOGGED_IN: 'Welcome! You have successfully logged in to your account. ',
  VERIFICATION_MAIL_SENT:
    'You can use this code for 30 minutes. Otherwise, please click on Resend code.',
  KYC_VERIFICATION_MAIL_SENT: 'KYC verification mail sent',

  RESET_PASSWORD:
    'Your password has been successfully reset. Please use your new password to log in.',
  ONE_TIME_PASSWORD_EXPIRED: 'Your one time password has expired',
  USER_UPDATED_SUCCESSFULLY: 'User updated successfully',
  USER_DOESNT_EXIST: 'User does not exist',
  FORGOT_PASSWORD_NOTIFICATION_TITLE: 'Password Changed',
  ACCOUNT_VERIFICATION_NOTIFICATION_TITLE: 'Account Verified',
  PASSWORD_USER_EARLIER:
    'Password not updated. Cannot use the same password which has been used earlier.',
  FEEDBACK_EXIST: 'Feedback is already exist',
  DEALER_ADD: 'A new Dealership profile has been added to the system',
};

const subscription = {
  SUBSCRITPION_ADD: 'Pricing subscription added successfully',
};
const washCOntrollerMessage = {
  FEEDBACK_NOT_UPDATED_AFTER_COMPLETE: 'Feedback not update after complete',
  FEEDBACK_URL_GENERATED_SUCCESSFULLY: 'Feedback url generated successfully',
  FEEDBACK_UPDATED_SUCCESSFULLY: 'Feedback updated successfully',
};

const redisServiceMessage = {
  KEY_DOES_NOT_EXIST: "Key doesn't exist",
  REDIS_ERROR: 'Redis Error',
  KEY_IS_INVALID: 'Please provide key',
  VALUE_IS_INVALID: 'Please provide value',
};

const systemMessage = {
  EMAIL_NOT_PROVIDED: 'Provide Email',
  PHONE_NOT_PROVIDED: 'Provide Phone',
  UNABLE_TO_SEND_EMAIL: 'Email cannot be sent',
  RECIPIENT_EMAIL_NOT_EXISTS: 'Provide Email and Name of recipient',
  EMAIL_BODY_NOT_EXISTS: 'Provide Email Body',
  EMAIL_SUBJECT_NOT_EXISTS: 'Provide Email Subject',
  EMAIL_SUCCESSFULLY_SENT: 'Email sent',
};
const otpServiceMessage = {
  OTP_EMAIL_SUBJECT: 'Verification code for email verification',
  OTP_SUCCESS_SENT_MESSAGE: 'Verification code sent',
  OTP_EXPIRED: 'Verification code has expired!',
};

const dummyTransactionsData = {
  Guid: randomUUID(),
  MachineGuid: (Math.random() + 1).toString(36).substring(7),
  PHValue: Math.floor(Math.random() * 100 + 1),
  TDSValue: Math.floor(Math.random() * 100 + 1),
  ElectricityUsed: Math.floor(Math.random() * 100 + 1),
  ElectricityPrice: Math.floor(Math.random() * 100 + 1),
  FoamUsed: Math.floor(Math.random() * 100 + 1),
  FoamPrice: Math.floor(Math.random() * 100 + 1),
  ShampooUsed: Math.floor(Math.random() * 100 + 1),
  ShampooPrice: Math.floor(Math.random() * 100 + 1),
  WaxUsed: Math.floor(Math.random() * 100 + 1),
  WaxPrice: Math.floor(Math.random() * 100 + 1),
  WaterUsed: Math.floor(Math.random() * 100 + 1),
  WaterWastage: Math.floor(Math.random() * 100 + 1),
  WaterPrice: Math.floor(Math.random() * 100 + 1),
  CODValue: Math.floor(Math.random() * 100 + 1),
  TSSValue: Math.floor(Math.random() * 100 + 1),
  OilAndGreaseValue: Math.floor(Math.random() * 100 + 1),
  WashTypeGuid: '',
  WashTypePrice: Math.floor(Math.random() * 100 + 1),
  WashTime: Math.floor(Math.random() * 100 + 1),
  BusinessModeGuid: (Math.random() + 1).toString(36).substring(7),
  IsWashCompleted: false,
  AddDate: new Date(),
  ElectricityTotalUsage: Math.floor(Math.random() * 100 + 1),
  Volt_R_N_IOT: Math.floor(Math.random() * 100 + 1),
  Volt_Y_N_IOT: Math.floor(Math.random() * 100 + 1),
  Volt_B_N_IOT: Math.floor(Math.random() * 100 + 1),
  WashCounter: Math.floor(Math.random() * 100 + 1),
  SerialNo: Math.floor(Math.random() * 100 + 1),
  SkuNumber: '',
};

const USERROLE = {
  ADMIN: 'ADMIN',
  FEEDBACK_AGENT: 'FEEDBACK_AGENT',
  SUB_ADMIN: 'SUB_ADMIN',
  AREA_MANAGER: 'AREA_MANAGER',
  OEM: 'OEM',
  DEALER: 'DEALER',
  EMPLOYEE: 'EMPLOYEE',
};
export = {
  passwordServiceMessage,
  genericMessage,
  authServiceMessage,
  tokenServiceMessage,
  userControllerMessage,
  redisServiceMessage,
  systemMessage,
  otpServiceMessage,
  dummyTransactionsData,
  integrationMessage,
  washCOntrollerMessage,
  USERROLE,
  subscription,
};
