// List all endpoints here
// import { OFFLINE } from "network/offlineResponse"
import { HTTP_METHODS, APIRouter } from "./httpHelper"

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
    LOGIN: new APIRouter("/user/authenticate", HTTP_METHODS.POST),
    LOGOUT: new APIRouter("/user/authenticate", HTTP_METHODS.DEL),
    RESETPASSWORD: new APIRouter("/user/password/reset", HTTP_METHODS.PUT),
    UPDATEPASSWORD: new APIRouter("/user/password/update", HTTP_METHODS.PUT),
    FORGETPASSWORD: new APIRouter("/user/password/forgot", HTTP_METHODS.POST),
    VERIFYOTP: new APIRouter("/user/verify/otp", HTTP_METHODS.POST),
    USERPROFILE: new APIRouter("/user/profile", HTTP_METHODS.GET),
    TERMS: new APIRouter("/terms-and-policy", HTTP_METHODS.GET)
  },
  SETTINGS: {
    GET_SUBSCRIPTIONS: new APIRouter("/user/dealer/detail", HTTP_METHODS.GET)
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
  PROFILE: {
    UPDATEPROFILE: new APIRouter("/user/profile/update", HTTP_METHODS.PUT),
    UPLOADPROFILE: new APIRouter("/upload/profile/image", HTTP_METHODS.POST)
  },
  WASH: {
    WASHTILE: new APIRouter("/wash/list", HTTP_METHODS.POST),
    ADD_FEEDBACK: new APIRouter("/wash/generate/feedback", HTTP_METHODS.POST),
    EDIT_FEEDBACK: new APIRouter("/wash/generate/feedback", HTTP_METHODS.PUT)
  },
  FEEDBACK: {
    GET_REGION: new APIRouter("/area/region/list", HTTP_METHODS.GET),
    GET_STATE: new APIRouter("/area/state/list", HTTP_METHODS.GET),
    GET_CITY: new APIRouter("/area/city/list", HTTP_METHODS.GET),
    GET_OEM: new APIRouter("/area/oem/list", HTTP_METHODS.GET),
    PUBLISHED_FORMS: new APIRouter("/feedback/list", HTTP_METHODS.GET),
    GET_MACHINES: new APIRouter("/machine/list", HTTP_METHODS.GET),
    GET_OUTLETS: new APIRouter("/area/outlet/list", HTTP_METHODS.GET),
    GET_ALL_DEALERS: new APIRouter("/user/oem/dealer", HTTP_METHODS.GET),
    GET_AGENTS: new APIRouter("/user/agent/list", HTTP_METHODS.GET),
    CREATE_FORM: new APIRouter("/feedback/form/create", HTTP_METHODS.POST),
    GET_OUTLETS_MACHINES: new APIRouter("/feedback/outlet/machine/list", HTTP_METHODS.GET),
    UPDATE_FORM: new APIRouter("/feedback/form/update", HTTP_METHODS.PUT),
    GET_FORM: new APIRouter("/feedback/form", HTTP_METHODS.GET),
    DELETE_FORM: new APIRouter("/feedback/form/delete", HTTP_METHODS.DEL),
    GET_ANALYTICS: new APIRouter("/feedback/analytics/form", HTTP_METHODS.GET),
    GET_EXPORTURL: new APIRouter("/feedback/response/export", HTTP_METHODS.GET),
    GET_QUESTION_DETAILS: new APIRouter(
      "/feedback/analytics/question/response/list",
      HTTP_METHODS.GET
    ),
    MAP_FORM: new APIRouter("/feedback/form/machine/agent/assign", HTTP_METHODS.POST),
    GET_MAP_DETAILS: new APIRouter("/feedback/form/mapping", HTTP_METHODS.GET),
    GET_ABANDONED_FORM: new APIRouter("/feedback/abandoned/list", HTTP_METHODS.GET),
    UPDATE_CUSTOMER: new APIRouter("/feedback/abandoned/customer/update", HTTP_METHODS.PUT),
    SEND_ABANDONED_FEEDBACKS: new APIRouter(
      "/feedback/abandoned/whatsapp/notification",
      HTTP_METHODS.POST
    )
  },
  FILE: {
    UPLOAD: new APIRouter("/test-api/upload.php", HTTP_METHODS.POST)
  },
  AGENT: {
    AGENT_LIST: new APIRouter("/user/agent/list", HTTP_METHODS.GET),
    ADD_AGENT: new APIRouter("/user/agent", HTTP_METHODS.POST),
    EDIT_AGENT: new APIRouter("/user/agent", HTTP_METHODS.PUT),
    DELETE_AGENT: new APIRouter("/user/agent", HTTP_METHODS.DEL)
  },
  DEALER: {
    DEALER_LIST: new APIRouter("/user/dealer/list", HTTP_METHODS.GET),
    ADD_DEALER: new APIRouter("/user/dealer/create", HTTP_METHODS.POST),
    DELETE_DEALER: new APIRouter("/user/dealer/delete", HTTP_METHODS.DEL),
    OEM_LIST: new APIRouter("/area/oem/list", HTTP_METHODS.GET),
    REGION_LIST: new APIRouter("/area/region/list", HTTP_METHODS.GET),
    CITY_LIST: new APIRouter("/area/city/list", HTTP_METHODS.GET),
    STATE_LIST: new APIRouter("/area/state/list", HTTP_METHODS.GET),
    MACHINE_LIST: new APIRouter("/user/machine", HTTP_METHODS.GET),
    OUTLET_LIST: new APIRouter("/user/dealer/outlet/list", HTTP_METHODS.GET),
    ADD_MACHINE: new APIRouter("/user/dealer/outlet/machine/create", HTTP_METHODS.POST),
    SET_SUBSCRIPTION: new APIRouter("/user/dealer/subscription/setting", HTTP_METHODS.POST),
    DEALER_DETAILS: new APIRouter("/user/dealer/detail", HTTP_METHODS.GET),
    EDIT_DEALER: new APIRouter("/user/dealer/update", HTTP_METHODS.PUT),
    EDIT_OUTLET_MACHINE_MAPPING: new APIRouter(
      "/user/dealer/outlet/machine/update",
      HTTP_METHODS.PUT
    ),
    EMPLOYEE_LIST: new APIRouter("/user/employee/list", HTTP_METHODS.GET),
    ADD_EMPLOYEE: new APIRouter("/user/employee/create", HTTP_METHODS.POST),
    EDIT_EMPLOYEE: new APIRouter("/user/employee/update", HTTP_METHODS.PUT),
    DELETE_EMPLOYEE: new APIRouter("/user/employee/delete", HTTP_METHODS.DEL),
    ROLE_LIST: new APIRouter("/user/subrole/list", HTTP_METHODS.GET),
    EDIT_ROLE: new APIRouter("/user/subrole/update", HTTP_METHODS.PUT),
    DELETE_ROLE: new APIRouter("/user/subrole/delete", HTTP_METHODS.DEL)
  },
  CMS: {
    REGIONLIST: new APIRouter("/area/region/list", HTTP_METHODS.GET),
    STATELIST: new APIRouter("/area/state/list", HTTP_METHODS.GET),
    STATEBYREGION: new APIRouter("/area/state/list", HTTP_METHODS.GET),
    CREATESTATE: new APIRouter("/area/state/create", HTTP_METHODS.POST),
    EDITSTATE: new APIRouter("/area/state/update", HTTP_METHODS.PUT),
    PAGELIST: new APIRouter("/terms-and-policy/list", HTTP_METHODS.GET),
    EDITPAGE: new APIRouter("/terms-and-policy", HTTP_METHODS.PUT),
    CITYLIST: new APIRouter("/area/city/list", HTTP_METHODS.GET),
    CREATECITY: new APIRouter("/area/city/create", HTTP_METHODS.POST),
    EDITCITY: new APIRouter("/area/city/update", HTTP_METHODS.PUT),
    OEMLIST: new APIRouter("/area/oem/list", HTTP_METHODS.GET),
    CREATEOEM: new APIRouter("/area/oem/create", HTTP_METHODS.POST),
    EDITOEM: new APIRouter("/area/oem/update", HTTP_METHODS.PUT),
    DELETE_DEALER: new APIRouter("/user/dealer/delete", HTTP_METHODS.DEL)
  },
  MANAGEWASH: {
    WASHLIST: new APIRouter("/wash/admin/washList", HTTP_METHODS.POST),
    DOWNLOADWASHLIST: new APIRouter("/wash/admin/exportCSV", HTTP_METHODS.POST),
    WASHDETAIL: new APIRouter("/wash/admin/washDetail", HTTP_METHODS.GET),
    WASHFILTER: new APIRouter("/wash/washTypes", HTTP_METHODS.GET),
    FEEDBACKDETAIL: new APIRouter("/wash/admin/feedbackDetail", HTTP_METHODS.GET),
    WASHCOUNT: new APIRouter("/wash/washTypeCount", HTTP_METHODS.POST),
    GET_MACHINES: new APIRouter("/machine/list", HTTP_METHODS.GET),
    GET_OUTLET: new APIRouter("/user/dealer/outlet/list", HTTP_METHODS.GET),
    IMPORTWASHLIST: new APIRouter("/external/transactions-batch-update-upload", HTTP_METHODS.POST)
  },
  SUBADMIN: {
    SUBADMINLIST: new APIRouter("/user/employee/list", HTTP_METHODS.GET),
    DELETE_SUBADMIN: new APIRouter("/user/employee/delete", HTTP_METHODS.DEL),
    GET_SUBADMIN: new APIRouter("/user/employee/detail", HTTP_METHODS.GET),
    CREATE_SUBADMIN: new APIRouter("/user/employee/create", HTTP_METHODS.POST),
    GET_ROLES: new APIRouter("/user/subRole/list", HTTP_METHODS.GET),
    UPDATE_SUBADMIN: new APIRouter("/user/employee/update", HTTP_METHODS.PUT)
  },
  ROLE: {
    MODULELIST: new APIRouter("/user/module/list", HTTP_METHODS.GET),
    SUBROLECREATE: new APIRouter("/user/subrole/create", HTTP_METHODS.POST),
    SUBROLELIST: new APIRouter("/user/subrole/list", HTTP_METHODS.GET),
    DELETESUBROLE: new APIRouter("/user/subrole/delete", HTTP_METHODS.DEL),
    SUBROLEBYID: new APIRouter("/user/subrole/detail", HTTP_METHODS.GET),
    EDITSUBROLE: new APIRouter("/user/subrole/update", HTTP_METHODS.PUT)
  },
  DOCUMENT: {
    UPLOADDOCUMENT: new APIRouter("/upload/doc", HTTP_METHODS.POST),
    DELETEDOCUMENT: new APIRouter("/upload/delete", HTTP_METHODS.DEL)
  },
  BILLING: {
    BILLINGLIST: new APIRouter("/billing/list", HTTP_METHODS.GET),
    EXPORTMEMO: new APIRouter("/billing/admin/exportAdvanceMemo", HTTP_METHODS.GET),
    MEMODETAIL: new APIRouter("/billing/detail", HTTP_METHODS.GET),
    MEMOAMOUNT: new APIRouter("/billing/admin/advanceMemoAmounts", HTTP_METHODS.GET)
  },
  MANAGEMACHINES: {
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
    GET_MACHINE_SERVICE_REQUESTS: new APIRouter("/machine/service/request/list", HTTP_METHODS.GET),
    EXPORT_MACHINE_SERVICE_REQUESTS: new APIRouter(
      "/machine/service/request/exportList",
      HTTP_METHODS.GET
    ),
    DOWNLOADMACHINELIST: new APIRouter("/machine/exportList", HTTP_METHODS.GET)
  },
  SERVICEREQUEST: {
    GET_SERVICE_REQUEST_LISTING: new APIRouter("/serviceRequest/list", HTTP_METHODS.GET),
    EXPORT_SERVICE_REQUEST_LISTING: new APIRouter("/serviceRequest/exportList", HTTP_METHODS.GET)
  },
  AREAMANAGER: {
    CREATE_AREA_MANAGER: new APIRouter("/areaManager/create", HTTP_METHODS.POST),
    GET_AREA_MANAGER_LISTING: new APIRouter("/areaManager/list", HTTP_METHODS.GET),
    GET_AREA_MANAGER_DETAILS: new APIRouter("/areaManager/areaManagerDetails", HTTP_METHODS.GET),
    UPDATE_AREA_MANAGER_DETAILS: new APIRouter("/areaManager/updateAreaManager", HTTP_METHODS.PUT),
    DELETE_AREA_MANAGER: new APIRouter("/areaManager/deleteAreaManager", HTTP_METHODS.DEL),
    GET_STATES: new APIRouter("/area/multipleState/list", HTTP_METHODS.GET),
    GET_CITIES: new APIRouter("/area/multipleCity/list", HTTP_METHODS.GET)
  },
  OEMMANAGER: {
    CREATE_MANAGER: new APIRouter("/oemManager/create", HTTP_METHODS.POST),
    GET_OEM_MANAGER_LISTING: new APIRouter("/oemManager/list", HTTP_METHODS.GET),
    DELETE_OEM_MANAGER: new APIRouter("/oemManager/deleteOEMManager", HTTP_METHODS.DEL),
    UPDATE_OEM_MANAGER: new APIRouter("/oemManager/updateOEMManagerDetails", HTTP_METHODS.PUT),
    GET_OEM_MANAGER_DETAILS: new APIRouter("/oemManager/oemManagerDetails", HTTP_METHODS.GET)
  },
  DASHBOARD: {
    // ------> Dashboard Admin  API

    GET_WASH_DETAIL: new APIRouter("/dashboard/admin/washes", HTTP_METHODS.GET),
    GET_WATER_DETAIL: new APIRouter("/dashboard/admin/water", HTTP_METHODS.GET),
    GET_DEALER_DETAIL: new APIRouter("/dashboard/dealers/machines", HTTP_METHODS.GET),
    GET_DEALERSHIP_COUNT_DETAIL: new APIRouter(
      "/dashboard/admin/dealership/count",
      HTTP_METHODS.GET
    ),
    MACHINE_STATUS: new APIRouter("/machine/status/count", HTTP_METHODS.GET),
    MACHINE_LIST: new APIRouter("/machine/list", HTTP_METHODS.GET),
    MACHINE_MAP_LIST: new APIRouter("/dashboard/admin/machine/list", HTTP_METHODS.GET),
    TOP_DEALERSHIP: new APIRouter("/user/top/dealership", HTTP_METHODS.GET),
    NOTIFICATION_STATUS: new APIRouter("/notification/list", HTTP_METHODS.GET),
    // ------> Dashboard OEM  API

    GET_OEM_WASH_DETAIL: new APIRouter("/dashboard/oem/manager/washes", HTTP_METHODS.GET),
    GET_OEM_WATER_DETAIL: new APIRouter("/dashboard/oem/manager/water", HTTP_METHODS.GET),
    GET_OEM_DEALERSHIP_COUNT_DETAIL: new APIRouter(
      "/dashboard/oem/manager/dealers",
      HTTP_METHODS.GET
    ),
    OEM_MACHINE_LIST: new APIRouter("/dashboard/oem/manager/machine/list", HTTP_METHODS.GET),
    OEM_TOP_DEALERSHIP: new APIRouter("/dashboard/oem/manager/top/dealership", HTTP_METHODS.GET),
    GET_OEM_ELECTRICITY_DETAIL: new APIRouter(
      "/dashboard/oem/manager/electricity",
      HTTP_METHODS.GET
    ),

    // ------>Dashboard Area manager API

    GET_AREAMANAGER_WASH_DETAIL: new APIRouter("/dashboard/area/manager/washes", HTTP_METHODS.GET),
    GET_AREAMANAGER_WATER_DETAIL: new APIRouter("/dashboard/area/manager/water", HTTP_METHODS.GET),
    GET_AREAMANAGER_DEALERSHIP_COUNT_DETAIL: new APIRouter(
      "/dashboard/area/manager/dealers/count",
      HTTP_METHODS.GET
    ),
    AREAMANAGER_MACHINE_LIST: new APIRouter(
      "/dashboard/area/manager/machine/list",
      HTTP_METHODS.GET
    ),
    AREAMANAGER_TOP_DEALERSHIP: new APIRouter(
      "/dashboard/area/manager/top/dealers",
      HTTP_METHODS.GET
    ),
    GET_AREAMANAGER_ELECTRICITY_DETAIL: new APIRouter(
      "/dashboard/area/manager/electricity",
      HTTP_METHODS.GET
    )
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
