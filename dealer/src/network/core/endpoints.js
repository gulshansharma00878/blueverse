// List all endpoints here
import { HTTP_METHODS, APIRouter, APIWithOfflineRouter } from "./httpHelper"
import { OFFLINE } from "network/offlineResponse"

// ******************
// Endpoint class takes 3 params in constructor ==> "endpoint", "http-method", "API-version"
// By default, version is set to v1
// ******************
export const API = {
  TEST: {
    LIST: new APIRouter("/products", HTTP_METHODS.GET),
    HTTP: new APIRouter("/http", HTTP_METHODS.GET)
  },
  AUTH: {
    // LOGIN: new APIRouter("/user/authenticate", HTTP_METHODS.POST),
    LOGIN: new APIWithOfflineRouter("/user/authenticate", HTTP_METHODS.POST, OFFLINE.LOGIN),
    LOGOUT: new APIRouter("/user/authenticate", HTTP_METHODS.DEL),
    RESETPASSWORD: new APIRouter("/user/password/reset", HTTP_METHODS.PUT),
    UPDATEPASSWORD: new APIRouter("/user/password/update", HTTP_METHODS.PUT),
    FORGETPASSWORD: new APIRouter("/user/password/forgot", HTTP_METHODS.POST),
    SENDOTP: new APIRouter("/user/dealer/kyc/otp", HTTP_METHODS.POST),
    // VERIFYOTP: new APIRouter("/user/dealer/verify/kyc/otp", HTTP_METHODS.POST)
    VERIFYOTP: new APIWithOfflineRouter(
      "/user/dealer/verify/kyc/otp",
      HTTP_METHODS.POST,
      OFFLINE.LOGIN
    ),
    VERIFYRESETOTP: new APIWithOfflineRouter("/user/verify/otp", HTTP_METHODS.POST, OFFLINE.LOGIN),
    TERMS: new APIRouter("/terms-and-policy", HTTP_METHODS.GET)
  },
  SETTINGS: {
    GET_SUBSCRIPTIONS: new APIRouter("/user/dealer/detail", HTTP_METHODS.GET)
  },
  FILE: {
    UPLOAD: new APIRouter("/test-api/upload.php", HTTP_METHODS.POST)
  },
  MANAGEWASH: {
    WASHLIST: new APIRouter("/wash/dealer/washList", HTTP_METHODS.POST),
    DOWNLOADWASHLIST: new APIRouter("/wash/dealer/exportCSV", HTTP_METHODS.POST),
    WASHDETAIL: new APIRouter("/wash/dealer/washDetail", HTTP_METHODS.GET),
    GET_MACHINES: new APIRouter("/machine/list", HTTP_METHODS.GET),
    GET_OUTLET: new APIRouter("/user/dealer/outlet/list", HTTP_METHODS.GET),
    GET_WASHLIST: new APIRouter("/wash/washTypes", HTTP_METHODS.GET),
    WASHCOUNT: new APIRouter("/wash/washTypeCount", HTTP_METHODS.POST)
  },
  MANAGEMPLOYEES: {
    GET_EMPLOYEES_LIST: new APIRouter("/user/employee/list", HTTP_METHODS.GET),
    GET_EMPLOYEE_DETAILS: new APIRouter("/user/employee/detail", HTTP_METHODS.GET)
  },
  WALLET: {
    GET_TRANSACTIONHISTORY: new APIRouter(
      "/machineWallet/dealer/transactionHistory",
      HTTP_METHODS.POST
    ),
    GET_MACHINEBALANCE: new APIRouter("/machineWallet/dealer/machineAllbalance", HTTP_METHODS.POST),
    MACHINEDETAIL: new APIRouter("/user/dealer/detail", HTTP_METHODS.GET),
    EXPORT_HISTORY: new APIRouter(
      "/machineWallet/dealer/exportTransactionHistory",
      HTTP_METHODS.POST
    ),
    CREATE_PAYMENT: new APIRouter("/payment/generate/hash", HTTP_METHODS.POST),
    PAYMENT_STATUS: new APIRouter("/payment/status", HTTP_METHODS.GET),
    GET_MEMODETAIL: new APIRouter("/payment/machineMemoDetail", HTTP_METHODS.GET)
  },
  BILLING: {
    BILLINGLIST: new APIRouter("/billing/list", HTTP_METHODS.GET),
    MEMODETAIL: new APIRouter("/billing/detail", HTTP_METHODS.GET),
    EXPORTMEMO: new APIRouter("/billing/dealer/exportAdvanceMemo", HTTP_METHODS.GET),
    GETINVOICE: new APIRouter("/billing/getInvoice", HTTP_METHODS.GET),
    DUMMYPAYMENT: new APIRouter("/billing/testPayment/encryption", HTTP_METHODS.POST)
  },
  MANAGEMACHINES: {
    SERVICEREQUEST: new APIRouter("machine/service/request", HTTP_METHODS.POST),
    MACHINESLIST: new APIRouter("/machine", HTTP_METHODS.GET),
    MACHINESSTATUS: new APIRouter("/machine/status/count", HTTP_METHODS.GET),
    MAACHINEDETAIL: new APIRouter("/machine/detail", HTTP_METHODS.GET),
    WATERQUALITY: new APIRouter("/machine/water/metrics", HTTP_METHODS.POST),
    WATERCONSUMPTION: new APIRouter("/machine/consumption/metrics", HTTP_METHODS.GET),
    MACHINETRANSACTIONS: new APIRouter("/machine/transactions", HTTP_METHODS.GET),
    EXPORTTRANSACTIONS: new APIRouter("/machine/exportTransactions", HTTP_METHODS.GET),
    GETMACHINEHEALTH: new APIRouter("/machine/health", HTTP_METHODS.GET),
    GETMACHINEWASHES: new APIRouter("/machine/washes", HTTP_METHODS.GET),
    GETMACHINETRANSACTION: new APIRouter("/machine/detail", HTTP_METHODS.GET),
    GETMACHINES: new APIRouter("/machine/list", HTTP_METHODS.GET),
    GET_MACHINE_SERVICE_REQUESTS: new APIRouter("/machine/service/request/list", HTTP_METHODS.GET),
    EXPORT_MACHINE_SERVICE_REQUESTS: new APIRouter(
      "/machine/service/request/exportList",
      HTTP_METHODS.GET
    ),
    GENERATE_MACHINE_REQUESTS: new APIRouter("/machine/service/request", HTTP_METHODS.POST)
  },
  SERVICEREQUEST: {
    GET_SERVICE_REQUEST_LISTING: new APIRouter("/serviceRequest/list", HTTP_METHODS.GET),
    EXPORT_SERVICE_REQUEST_LISTING: new APIRouter("/serviceRequest/exportList", HTTP_METHODS.GET)
  },
  DASHBOARD: {
    GET_WASH_DETAIL: new APIRouter("/dashboard/dealer/washes", HTTP_METHODS.GET),
    GET_WATER_DETAIL: new APIRouter("/dashboard/dealer/water", HTTP_METHODS.GET),
    GET_ELECTRICITY_DETAIL: new APIRouter("/dashboard/dealer/electricity", HTTP_METHODS.GET),
    GET_MACHINE_RUNTIME_DETAIL: new APIRouter(
      "/dashboard/dealer/machine/runtime",
      HTTP_METHODS.GET
    ),
    GET_WATER_QUALITY_DETAIL: new APIRouter("/dashboard/dealer/water/quality", HTTP_METHODS.GET),
    MACHINE_STATUS: new APIRouter("/machine/status/count", HTTP_METHODS.GET),
    NOTIFICATION_STATUS: new APIRouter("/notification/list", HTTP_METHODS.GET)
  },
  NOTIFICATION: {
    GET_NOTIFICATION_LISTING: new APIRouter("/notification/list", HTTP_METHODS.GET),
    READ_SINGLENOTIFICATION: new APIRouter("/notification/status", HTTP_METHODS.PUT),
    GET_UNREAD_COUNT: new APIRouter("/notification/unReadCount", HTTP_METHODS.GET),
    STORE_DEVICE_TOKEN: new APIRouter("/user/addDevice", HTTP_METHODS.POST),
    DELETE_DEVICE_TOKEN: new APIRouter("/user/userDeviceTokens", HTTP_METHODS.DEL),
    READ_ALL_NOTIFICATONS: new APIRouter("/notification/markAllRead", HTTP_METHODS.PUT)
  }
}
