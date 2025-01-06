import Toast from "components/utilities-components/Toast/Toast"
import { NotificationService } from "network/services/notificationService"
import { permissionMapNotification } from "./notificationImageMap"

export const getNotifications = async (
  user = {},
  setDealerNotifications = () => {},
  setCount = () => {},
  setLoading = () => {},
  pagination = () => {},
  offset,
  limit,
  subAdminPermission
) => {
  setLoading(true)
  let perArr = []

  if (user?.role === "subadmin") {
    const newPermissions = Object?.keys(subAdminPermission)?.filter((item) => {
      const newPermission = permissionMapNotification(subAdminPermission, item)
      return newPermission !== undefined && !perArr?.includes(newPermission)
    })

    newPermissions.forEach((item) => {
      const newPermission = permissionMapNotification(subAdminPermission, item)
      return perArr.push(newPermission)
    })
  }

  const param = {
    offset: offset,
    limit: limit
  }
  if (user?.role === "subadmin") {
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
