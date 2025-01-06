const billingModules = [
  "Billing & Accounting Advance Memo",
  "Billing & Accounting Top Up Memo",
  "Billing & Accounting Tax Invoice",
  "Billing & Accounting Blueverse credits"
]

const machineModules = ["machine details", "service request"]

export const getModulePermissions = (data, moduleName) => {
  return data.filter((item) => item?.module?.name === moduleName)
}

export const getPermissionJson = (data, moduleName) => {
  let modulePermission = getModulePermissions(data?.permissions?.permission, moduleName)
  let getView = modulePermission.find((item) => {
    return item
  })
  return getView
}

const getBillingPermission = (module) => {
  for (let item of module) {
    if (billingModules.indexOf(item?.module?.name) != -1) {
      if (item?.permissionObj?.viewPermission) {
        return item
      }
    }
  }
}

const getMachinePermission = (module) => {
  for (let item of module) {
    if (machineModules.indexOf(item?.module?.name) != -1) {
      if (item?.permissionObj?.viewPermission) {
        return item
      }
    }
  }
}

export function validateUserLogin(user, item) {
  if (user.role == "employee") {
    if (item?.module == "home") {
      return { viewPermission: true }
    }
    if (user?.permissions?.permission.length > 0) {
      let permissionJson = getPermissionJson(user, item?.module)
      let checkBillingPermissions = getBillingPermission(user?.permissions?.permission)

      let checkMachinePermissions = getMachinePermission(user?.permissions?.permission)

      if (checkBillingPermissions?.module?.name?.toLowerCase()?.includes(item?.module)) {
        return checkBillingPermissions?.permissionObj
      } else {
        if (
          checkMachinePermissions?.permissionObj?.viewPermission &&
          item?.module == "machine details"
        ) {
          return checkMachinePermissions?.permissionObj
        } else {
          return permissionJson?.permissionObj
        }
      }
    }
  } else {
    if (user.role == "dealer") {
      return {
        viewPermission: true,
        updatePermission: true,
        deletePermission: true,
        createPermission: true
      }
    }
  }
  return null // return null if user does not have the necessary permissions
}

export const showPermission = (role, permission) => {
  switch (role) {
    case "employee":
      return permission
    case "dealer":
      return true
    default:
      break
  }
}
