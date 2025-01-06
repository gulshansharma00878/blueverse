import isService from "assets/images/notifications/isServicec.svg"
import isSubAdmin from "assets/images/notifications/isSubAdmin.svg"
import isBilling from "assets/images/notifications/isBilling.svg"
import isPending from "assets/images/notifications/isPendingBill.svg"

export const imageMapNotification = (type) => {
  if (
    type === "TAX_INVOICE_GENERATE_BY_ADMIN" ||
    type === "BLUEVERSE_CREDIT_GENERATE_BY_ADMIN" ||
    type === "TOP_UP_GENERATE_BY_ADMIN" ||
    type === "ADVANCE_MEMO_GENERATE_BY_ADMIN" ||
    type === "PAYEMENT_SUCCESS"
  ) {
    return isBilling
  } else {
    switch (type) {
      case "MACHINE_HEALTH_SENSOR_FAILED":
        return isService
      case "SERVICE_REQUEST_RECEIVED":
        return isService
      case "NEW_EMPLOYEE_ONBOARDED":
        return isSubAdmin
      case "PAYEMENT_FAILED":
        return isPending
    }
  }
}

export const permissionMapNotification = (employeePermission, permissions) => {
  let permission = employeePermission[permissions]

  switch (permissions) {
    case "advance":
      if (permission?.viewPermission) {
        return "ADVANCE_MEMO_GENERATE_BY_ADMIN,PAYEMENT_SUCCESS,PAYEMENT_FAILED"
      }
      break
    case "topup":
      if (permission?.viewPermission) {
        return "TOP_UP_GENERATE_BY_ADMIN,PAYEMENT_SUCCESS,PAYEMENT_FAILED"
      }
      break
    case "taxInvoice":
      if (permission?.viewPermission) {
        return "TAX_INVOICE_GENERATE_BY_ADMIN"
      }
      break
    case "blueverseCredit":
      if (permission?.viewPermission) {
        return "BLUEVERSE_CREDIT_GENERATE_BY_ADMIN"
      }
      break
    case "machine":
      if (permission?.viewPermission) {
        return "MACHINE_HEALTH_SENSOR_FAILED"
      }
      break
    case "service":
      if (permission?.viewPermission) {
        return "SERVICE_REQUEST_RECEIVED"
      }
      break
    case "employee":
      if (permission?.viewPermission) {
        return "NEW_EMPLOYEE_ONBOARDED"
      }
      break
    default:
      break
  }
}

export const allNotification = [
  "TAX_INVOICE_GENERATE_BY_ADMIN",
  "BLUEVERSE_CREDIT_GENERATE_BY_ADMIN",
  "TOP_UP_GENERATE_BY_ADMIN",
  "ADVANCE_MEMO_GENERATE_BY_ADMIN",
  "PAYEMENT_SUCCESS",
  "MACHINE_HEALTH_SENSOR_FAILED",
  "NEW_EMPLOYEE_ONBOARDED",
  "PAYEMENT_FAILED"
]
