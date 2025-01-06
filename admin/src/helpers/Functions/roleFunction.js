import { DashboardMenus } from "router/routes/dashboardRoutes"

export const modifyPermissionKeys = (data) => {
  return (
    data &&
    data.map((obj) => {
      const newObj = { moduleId: obj.moduleId }
      for (const key in obj.permissions) {
        if (key === "edit") {
          newObj[`updatePermission`] = obj.permissions[key]
        } else {
          newObj[`${key}Permission`] = obj.permissions[key]
        }
      }
      return newObj
    })
  )
}

export const modifyPermissionObj = (data) => {
  return (
    data &&
    data.map((obj) => {
      const newObj = { moduleId: obj.moduleId, action: "UPDATE" }
      for (const key in obj.permissionObj) {
        newObj[`${key}`] = obj.permissionObj[key]
      }
      return newObj
    })
  )
}

export const removeFalsePermissions = (data) => {
  data &&
    data.forEach((item) => {
      for (let key in item.permissions) {
        if (item.permissions[key] === false) {
          delete item.permissions[key]
        } else {
          item.permissions[key] = false
        }
      }
    })
  return data
}

export const checkAndModifyString = (str) => {
  // Check if the string contains "Permission"
  if (str.includes("Permission")) {
    if (str === "updatePermission") {
      str = "Edit"
    }
    // Remove "Permission" from the string
    str = str.replace("Permission", "")
    // Capitalize the string
    str = str.charAt(0).toUpperCase() + str.slice(1)
  }
  return str
}

export const getModulePermissions = (data, moduleName) => {
  return data.filter((item) => item?.module.name === moduleName)
}
// export const addCmsObject = (data) => {
//   let addCms
//   const cmsModules = ["cms pages", "cms cities", "cms states", "cms oem"]

//   let allCmsModulesViewable = false

//   for (let module of data) {
//     if (cmsModules.includes(module.module.name)) {
//       if (module.permissionObj.viewPermission) {
//         allCmsModulesViewable = true
//         break
//       }
//     }
//   }

//   if (allCmsModulesViewable) {
//     addCms = { module: { name: "cms" }, permissionObj: { viewPermission: true } }
//     const addJson = [...data, addCms]
//     return addJson
//   } else {
//     return data
//   }
// }

export const addModules = (data) => {
  const cmsModules = ["cms pages", "cms cities", "cms states", "cms oem"]
  const billingModules = [
    "Billing & Accounting Advance Memo",
    "Billing & Accounting Top Up Memo",
    "Billing & Accounting Tax Invoice",
    "Billing & Accounting Blueverse credits"
  ]

  let allCmsModulesViewable = false
  let allBillingModulesViewable = false

  for (let module of data) {
    if (cmsModules.includes(module.module.name) && module.permissionObj.viewPermission) {
      allCmsModulesViewable = true
    } else if (billingModules.includes(module.module.name) && module.permissionObj.viewPermission) {
      allBillingModulesViewable = true
    }

    if (allCmsModulesViewable && allBillingModulesViewable) {
      break
    }
  }

  if (allCmsModulesViewable || allBillingModulesViewable) {
    const addCms = allCmsModulesViewable
      ? { module: { name: "cms" }, permissionObj: { viewPermission: true } }
      : null
    const addBilling = allBillingModulesViewable
      ? { module: { name: "billingAccounting" }, permissionObj: { viewPermission: true } }
      : null
    const addJson = [...data]

    if (addCms) {
      addJson.push(addCms)
    }

    if (addBilling) {
      addJson.push(addBilling)
    }
    return addJson
  } else {
    return data
  }
}

export const getPermissionJson = (data, moduleName) => {
  let modulePermission = getModulePermissions(data?.permissions?.permission, moduleName)
  let getView = modulePermission.find((item) => {
    return item
  })
  return getView
}

export const screenPermission = (permArray) => {
  let menuPath = {}
  let flag = true
  for (let i = 0; i < DashboardMenus.length; i++) {
    const element = DashboardMenus[i]
    if (Array.isArray(element?.alias) && element.alias.length > 0) {
      for (let j = 0; j < element.alias.length; j++) {
        const subMenu = element.alias[j]
        if (subMenu) {
          const submenu_per = permArray.find((item) => {
            return item.module.name === subMenu.module
          })
          if (submenu_per?.permissionObj?.viewPermission === true) {
            menuPath = submenu_per
            flag = false
            break
          }
        }
      }
    } else {
      const menu_per = permArray.find((item) => {
        return item.module.name === element.module
      })
      if (menu_per?.permissionObj?.viewPermission === true) {
        menuPath = menu_per
        flag = false
        break
      }
    }

    if (!flag) {
      break
    }
  }
  return menuPath
}

export const getMenuRoute = (perJson) => {
  let menuJson = {}
  let flag = true
  if (perJson?.module) {
    for (let i = 0; i < DashboardMenus.length; i++) {
      const element = DashboardMenus[i]
      if (Array.isArray(element?.alias) && element.alias.length > 0) {
        for (let j = 0; j < element.alias.length; j++) {
          const subMenu = element.alias[j]
          if (subMenu.module === perJson.module.name) {
            menuJson = subMenu
            flag = false
            break
          }
        }
      } else {
        if (element.module === perJson.module.name) {
          menuJson = element
          flag = false
          break
        }
      }

      if (!flag) {
        break
      }
    }
  }
  return menuJson
}
