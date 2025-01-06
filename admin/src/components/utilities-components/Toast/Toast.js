import { toast } from "react-toastify"
import "./toast.scss"

const showErrorToast = (message) => {
  toast.error(message, {
    position: "bottom-center",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    className: "custom-toast",
    theme: "colored"
  })
}

const showInfoToast = (message) => {
  toast.info(message, {
    position: "bottom-center",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    className: "toast-custom-info",
    theme: "colored"
  })
}

const showWarnToast = (message, position) => {
  toast.warn(message, {
    position: position ? position : "bottom-center",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    className: "toast-custom-warn",
    theme: "colored"
  })
}
const showNotificationToast = (message) => {
  toast.info(message, {
    position: "top-right",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    className: "toast-custom-notify",
    theme: "colored"
  })
}

const Toast = {
  showErrorToast,
  showInfoToast,
  showWarnToast,
  showNotificationToast
}

export default Toast
