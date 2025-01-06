import Toast from "components/utitlities-components/Toast/Toast"
import { NotificationService } from "network/notificationService"
import { permissionMapNotification } from "./notificationImageMap"

export const getNotifications = async (
  user = {},
  setDealerNotifications = () => {},
  setCount = () => {},
  setLoading = () => {},
  pagination = () => {},
  offset,
  limit,
  employeePermission
) => {
  setLoading(true)
  let perArr = []

  if (user?.role == "employee") {
    Object?.keys(employeePermission)?.map((item) => {
      let newPermission = permissionMapNotification(employeePermission, item)

      if (newPermission == undefined || perArr?.includes(newPermission)) {
        return
      } else {
        return perArr.push(permissionMapNotification(employeePermission, item))
      }
    })
  }

  const param = {
    offset: offset,
    limit: limit
  }
  if (user?.role === "employee") {
    param.restrictTypes = perArr.length > 0 ? perArr?.join(",") : "NO_DATA"
  }

  const response = await NotificationService.getNotification(param)
  if (response.success && response.code === 200) {
    setDealerNotifications(response?.data?.records)
    setCount(response?.data?.pagination?.totalItems)
    pagination(response?.data?.pagination)
    setLoading(false)
  } else {
    setLoading(false)
  }
}

export const readSingleNotification = async (id) => {
  await NotificationService.readOne(id)
}

export const readAllNotifications = async (setLoading, setRefetch) => {
  setLoading(true)
  const response = await NotificationService.readAllNotifications()
  if (response?.success && response?.code === 200) {
    setLoading(false)
    setRefetch((prev) => !prev)
  } else {
    setLoading(false)
    Toast.showErrorToast(`${response?.message}`)
  }
}
