const config = {
  serverConfig: {
    PORT: process.env.SERVER_PORT,
    env: process.env.NODE_ENV,
  },
  dbConfig: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    define: {
      freezeTableName: true,
      underscored: true,
      timestamps: true,
    },
  },
  authConfig: {
    tokenExpiry: 2592000,
    secretKey: process.env.JWT_SECRET_KEY,
    hashSaltRounds: 8,
  },
  redisConfig: {
    username: process.env.REDIS_USERNAME,
    password: process.env.REDIS_PASSWORD,
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT),
    // dbNo: Number(process.env.REDIS_DATABASE),
  },
  secret: process.env.APP_SECRET,
  nodemailerConfig: {
    username: process.env.NODEMAILER_USERNAME,
    password: process.env.NODEMAILER_PASSWORD,
    fromEmail: process.env.NODEMAILER_FROM_EMAIL,
    host: process.env.NODEMAILER_EMAIL_HOST,
    port: 587,
  },
  notificationContactConfig: {
    contactDetails: 'support@blueverse.com',
    appName: 'blueverse',
    link: 'www.blueverse.com',
  },
  otpConfig: { otpExpiry: 1800 },
  feedbackBaseUrl: 'http:localhost:2000',
  washListProgressType: [
    'FEEDBACK_NOT_STARTED',
    'FEEDBACK_IN_PROGRESS',
    'FEEDBACK_COMPLETED',
  ],
  washListProgressTypeObject: {
    FEEDBACK_NOT_STARTED: 'FEEDBACK_NOT_STARTED',
    FEEDBACK_IN_PROGRESS: 'FEEDBACK_IN_PROGRESS',
    FEEDBACK_COMPLETED: 'FEEDBACK_COMPLETED',
  },
  authHeaderName: 'Authorization',
  superAdmin: {
    email: 'blueverse@gmail.com',
    password: 'Password@1',
  },
  userRoles: [
    'ADMIN',
    'FEEDBACK_AGENT',
    'SUB_ADMIN',
    'AREA_MANAGER',
    'OEM',
    'DEALER',
    'EMPLOYEE',
  ],
  userRolesObject: {
    ADMIN: 'ADMIN',
    FEEDBACK_AGENT: 'FEEDBACK_AGENT',
    SUB_ADMIN: 'SUB_ADMIN',
    AREA_MANAGER: 'AREA_MANAGER',
    OEM: 'OEM',
    DEALER: 'DEALER',
    EMPLOYEE: 'EMPLOYEE',
  },
  questionType: ['MULTIPLE_CHOICE', 'RATING', 'COMMENT'],
  questionTypeObject: {
    MULTIPLE_CHOICE: 'MULTIPLE_CHOICE',
    RATING: 'RATING',
    COMMENT: 'COMMENT',
  },
  SECRET_KEY_FOR_PASSWORD_FORGOT: 'secret_01@34',
  waterSaves: {
    GOLD: 140,
    SILVER: 150,
    PLATINUM: 200,
  },
  temporaryPassword: 'dealer@123dealert',
  actionType: {
    DELETE: 'DELETE',
    CREATE: 'CREATE',
    UPDATE: 'UPDATE',
  },
  smsService: {
    SMS_API_KEY: process.env.SMS_API_KEY,
    SMS_SENDER_ID: process.env.SMS_SENDER_ID,
    SMS_SERVICE_NAME: process.env.SMS_SERVICE_NAME,
    SMS_BASE_URL: 'https://smsapi.24x7sms.com/api_2.0/SendSMS.aspx',
    OTP_VERIFICATION_KEYWORD: 'KYC_OTP_VERIFICATION',
  },
  cgstPercentage: 9,
  sgstPercentage: 9,
  machineWalletTransactionType: {
    ADDED: 'ADDED',
    DEBITED: 'DEBITED',
  },
  machineWalletSourceType: {
    WALLET: 'WALLET',
    CREDIT: 'CREDIT',
    TOPUP: 'TOPUP',
  },
  machineMemoStatusObject: {
    PENDING: 'PENDING',
    PROCESSING: 'PROCESSING',
    FAILED: 'FAILED',
    PAID: 'PAID',
  },
  machineMemoStatusArr: ['PENDING', 'PROCESSING', 'FAILED', 'PAID'],
  machineMemoTypeArr: [
    'ADVANCE_MEMO',
    'TOPUP_MEMO',
    'TAX_INVOICE',
    'BLUEVERSE_CREDIT',
  ],
  machineMemoTypeObject: {
    ADVANCE_MEMO: 'ADVANCE_MEMO',
    TOPUP_MEMO: 'TOPUP_MEMO',
    TAX_INVOICE: 'TAX_INVOICE',
    BLUEVERSE_CREDIT: 'BLUEVERSE_CREDIT',
  },
  machineMemoHSN_SAC: {
    HSN: 999717,
  },
  washType: {
    GOLD: 'GOLD',
    SILVER: 'SILVER',
    PLATINUM: 'PLATINUM',
  },
  washTypeArr: ['GOLD', 'SILVER', 'PLATINUM'],

  walletCSVType: {
    ALL_TRANSACTION: 'ALL_TRANSACTION',
    ONE_MACHINE_TRANSACTION: 'ONE_MACHINE_TRANSACTION',
    WALLET_BALANCE_TRANSACTION: 'WALLET_BALANCE_TRANSACTION',
    BLUEVERSECREDIT_BALANCE_TRANSACTION: 'BLUEVERSECREDIT_BALANCE_TRANSACTION',
  },
  walletCSVTypeArr: [
    'ALL_TRANSACTION',
    'ONE_MACHINE_TRANSACTION',
    'WALLET_BALANCE_TRANSACTION',
    'BLUEVERSECREDIT_BALANCE_TRANSACTION',
  ],

  whatsAppCredentials: {
    baseUrlBulk:
      'https://control.msg91.com/api/v5/whatsapp/whatsapp-outbound-message/bulk/',
    baseUrl: 'https://api.msg91.com/api/v5/whatsapp/whatsapp-outbound-message/',
    integrated_number: '917807977103',
    abandonedTemplateName: 'abandoned_feedback',
    feedbackSubmitTemplateName: 'feedback_submit ',
    defaultTemplateName: 'hello_world',
    language: {
      code: 'en_US',
      policy: 'deterministic',
    },
    type: 'template',
    content_type: 'template',
    messaging_product: 'whatsapp',
    authKey: process.env.WHATS_APP_AUTH_KEY,
  },
  payUPaymentGatewayCredentials: {
    merchantKey: process.env.PAYU_MERCHANT_KEY,
    merchantSaltKeyVersionOne: process.env.PAYU_MERCHANT_SALT_KEY_VERSION_ONE,
    productInfoObject: { WALLET: 'WALLET', TOPUP: 'TOPUP' },
    productInfoArr: ['WALLET', 'TOPUP'],
    ENVIRONMENT: process.env.ENVIRONMENT,
    status: { failure: 'failure', success: 'success', pending: 'pending' },
  },
  paymentTransactionStatusObject: {
    PENDING: 'PENDING',
    PROCESSING: 'PROCESSING',
    FAILED: 'FAILED',
    SUCCESS: 'SUCCESS',
    FAILURE: 'FAILURE',
  },
  machineStatusObject: {
    ACTIVE: 'ACTIVE',
    INACTIVE: 'INACTIVE',
    SUSPENDED: 'SUSPENDED',
  },
  machineConsumptionObject: {
    ELECTRICITY_CONSUMPTION: 'ELECTRICITY_CONSUMPTION',
    WATER_CONSUMPTION: 'WATER_CONSUMPTION',
    CHEMICAL_PERFORMANCE: 'CHEMICAL_PERFORMANCE',
    WATER_QUALITY: 'WATER_QUALITY',
    WASHES: 'WASHES',
  },

  adminPermission: {
    BILLING_TAX_INVOICE: 'Billing & Accounting Tax Invoice',
    BILLING_BLUEVERSECREDIT: 'Billing & Accounting Blueverse credits',
    BILLING_TOPUP_MEMO: 'Billing & Accounting Top Up Memo',
    BILLING_ADVANCE_MEMO: 'Billing & Accounting Advance Memo',
    BILLING_ACCOUNTING: 'billing & accounting',
    WASHES: 'washes',
    DEALER: 'dealer',
    MANAGE_WASH: 'manage washes',
    MACHINE_DETAIL: 'machine details',
    SERVICE_REQUEST: 'service request',
  },
  dealerPermission: {
    BILLING_TAX_INVOICE: 'Billing & Accounting Tax Invoice',
    BILLING_BLUEVERSECREDIT: 'Billing & Accounting Blueverse credits',
    BILLING_TOPUP_MEMO: 'Billing & Accounting Top Up Memo',
    BILLING_ADVANCE_MEMO: 'Billing & Accounting Advance Memo',
    BILLING_ACCOUNTING: 'billing & accounting',
    WASHES: 'manage washes',
    EMPLOYEE: 'manage employees',
    MANAGE_WASH: 'manage washes',
    MACHINE_DETAIL: 'machine details',
  },
  ccAvenueDetail: {
    merchantId: process.env.CCAVENUE_MERCHANT_ID,
    frontAccessCode: process.env.CCAVENUE_FRONT_ACCESS_CODE,
    frontWorkingKey: process.env.CCAVENUE_FRONT_WORKING_KEY,
    backAccessCode: process.env.CCAVENUE_BACK_ACCESS_CODE,
    backWorkingKey: process.env.CCAVENUE_BACK_WORKING_KEY,
    currency: 'INR',
    country: 'India',
    redirectURL: process.env.DEALER_BASE_URL + '/dealer/wallet/success-payment',
    cancelURLL: process.env.DEALER_BASE_URL + '/dealer/wallet/fail-payment',
    billingUrl: process.env.CCAVENUE_BILLING_URL,
    apiURl: process.env.CCAVENUE_API_URL,
    status: {
      successful: 'successful',
      unsuccessful: 'unsuccessful',
      awaited: 'awaited',
      initiated: 'initiated',
      shipped: 'shipped',
    },
    productInfoObject: { WALLET: 'WALLET', TOPUP: 'TOPUP' },
    productInfoArr: ['WALLET', 'TOPUP'],
    pendingStatus: ['awaited', 'initiated'],
    successStatus: ['shipped', 'successful'],
    failStatus: [
      'aborted',
      'auto-cancelled',
      'auto-reveresed',
      'cancelled',
      'invalid',
      'fraud',
      'refunded',
      'system refund',
      'unsuccessful',
    ],
  },
  certificatePath: process.env.API_BASE_PATH,
  exportFileMaxQueryLimit: 500000,

  // These are all machines from which data is coming from the client side, so to reduce the CPU load at QA, we use only these machines for any CPU-consuming operation
  machinesIdArr: [
    'ab630888-b018-4659-b673-f40f66f02b10',
    'b89497e5-cafe-423f-ac12-b187acd2164a',
    'fdf31a72-c798-4a82-96aa-ff9fcb9bc7d3',
    'f70f8927-330b-4544-8db3-f3b98b531d07',
    'e22dff6a-577f-4d1e-af30-9518f3946630',
  ],
  defaulFreshWaterQty: '4.08',
  machineMinimumBalanceLimit: '5000',
  earthRadius: '6371',

  cancellation: {
    feeStructure: [
      { maxMinutes: 30, feePercentage: 0 }, // No fee for cancellations under 30 minutes
      { maxMinutes: 60, feePercentage: 30 }, // 30% fee for cancellations between 30 and 60 minutes
      { maxMinutes: Infinity, feePercentage: 50 }, // 50% fee for cancellations after 60 minutes
    ],
  },
  blueverseDetails: {
    email: 'Finance@blueverseindia.com',
    panNo: 'CRDP5201Q',
  },

  googleConfig: {
    googleClientId: process.env.APP_CLIENT_ID,
  },

  appleConfig: {
    appleClientId: process.env.APPLE_CLIENT_ID,
  },
  waterSavedPerWashForTwoWheeler: 167,
  waterSavedPerWashForFourWheeler: 110,
};

export { config };
