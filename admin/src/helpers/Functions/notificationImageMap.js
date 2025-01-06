// import isWashes from "assets/images/notifications/isWashes.svg"
// import isFeedBack from "assets/images/notifications/isFeedback.svg"
import isDealerShip from "assets/images/notifications/isDealerShip.svg"
import isService from "assets/images/notifications/isServicec.svg"
// import isSubAdmin from "assets/images/notifications/isSubAdmin.svg"
import isBilling from "assets/images/notifications/isBilling.svg"
import isPending from "assets/images/notifications/isPendingBill.svg"

export const imageMapNotification = (type) => {
  if (
    type === "ADVANCE_MEMO_GENERATE" ||
    type === "TOPU_UP_GENERATE" ||
    type === "TAX_INVOICE_GENERATE" ||
    type === "BLUEVERSE_CREDIT_CARRYFORWARD" ||
    type === "DEALER_PAYMENT_DONE" ||
    type === "ADVANCE_MEMO_PAYMENT_SUCCESS"
  ) {
    return isBilling
  } else {
    switch (type) {
      case "MACHINE_HEALTH_SENSOR_FAILED":
        return isService
      case "SERVICE_REQUEST_RECEIVED":
        return isService
      case "NEW_DEALER_ONBOARDED":
        return isDealerShip
      case "DEALER_PAYMENT_PENDING":
        return isPending
      case "DEALER_PAYMENT_FAILED":
        return isPending
      case "ADVANCE_MEMO_PAYMENT_FAILED":
        return isPending
    }
  }
}

export const permissionMapNotification = (subAdminPermission, permissions) => {
  let permission = subAdminPermission[permissions]

  switch (permissions) {
    case "advance":
      if (permission?.viewPermission) {
        return "ADVANCE_MEMO_GENERATE"
      }
      break
    case "topup":
      if (permission?.viewPermission) {
        return "TOPU_UP_GENERATE,DEALER_PAYMENT_DONE,DEALER_PAYMENT_FAILED"
      }
      break
    case "taxInvoice":
      if (permission?.viewPermission) {
        return "TAX_INVOICE_GENERATE"
      }
      break
    case "blueverseCredit":
      if (permission?.viewPermission) {
        return "BLUEVERSE_CREDIT_CARRYFORWARD"
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
    case "dealer":
      if (permission?.viewPermission) {
        return "NEW_DEALER_ONBOARDED"
      }
      break
    default:
      break
  }
}

export const allNotification = [
  "ADVANCE_MEMO_GENERATE",
  "TOPU_UP_GENERATE",
  "TAX_INVOICE_GENERATE",
  "DEALER_PAYMENT_DONE",
  "MACHINE_HEALTH_SENSOR_FAILED",
  "SERVICE_REQUEST_RECEIVED",
  "NEW_DEALER_ONBOARDED",
  "DEALER_PAYMENT_FAILED",
  "DEALER_PAYMENT_PENDING"
]
