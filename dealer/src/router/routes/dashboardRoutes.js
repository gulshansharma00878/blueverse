// Export all routes that should be in the side menu
import React from "react"
import WashManagementIcon from "assets/images/icons/washManagementIcon.svg"
import HomeIcon from "assets/images/icons/homeIcon.svg"
import AccountSettingsIcon from "assets/images/icons/accountSettingsIcon.svg"
import EmployeesIcon from "assets/images/icons/employeeIcon.svg"
import WalletIcon from "assets/images/icons/wallet.svg"
import Billing from "assets/images/icons/Billing.svg"
import MachineIcon from "assets/images/icons/manageMachines.svg"

class MenuPath {
  constructor(title, icon, route, role, module, alias = null) {
    this.title = title
    this.icon = icon
    this.route = route
    this.role = role
    this.module = module
    this.alias = alias || title.replace(" ", "_").toLowerCase()
  }
}

const IconWrapper = ({ iconSrc, altText }) => {
  return <img src={iconSrc} alt={altText} width="24px" height="24px" />
}

export const DashboardMenus = [
  new MenuPath(
    "Home",
    <IconWrapper iconSrc={HomeIcon} altText="Home-icon" />,
    "/dashboard",
    ["dealer", "employee"],
    "home"
  ),
  new MenuPath(
    "Manage Washes",
    <IconWrapper iconSrc={WashManagementIcon} altText="Wash-management" />,
    "/wash-list",
    ["dealer", "employee"],
    "manage washes"
  ),
  new MenuPath(
    "Manage Machines",
    <IconWrapper iconSrc={MachineIcon} altText="machine-details" />,
    "/machines",
    ["dealer", "employee"],
    "machine details"
  ),
  new MenuPath(
    "Wallet",
    <IconWrapper iconSrc={WalletIcon} altText="Accounts Settings Icon" />,
    "/wallet/transaction-history",
    ["dealer", "employee"],
    "wallet"
  ),
  new MenuPath(
    "Manage Employees",
    <IconWrapper iconSrc={EmployeesIcon} altText="Wash-management" />,
    "/manage-employees",
    ["dealer", "employee"],
    "manage employees"
  ),
  new MenuPath(
    "Billing & Accounting",
    <IconWrapper iconSrc={Billing} altText="Billing & Accounting" />,
    "/billing-accounting",
    ["dealer", "employee"],
    "billing & accounting"
  ),
  new MenuPath(
    "Account Settings",
    <IconWrapper iconSrc={AccountSettingsIcon} altText="Accounts Settings Icon" />,
    "/account",
    ["dealer", "employee"],
    "account setting"
  )
]
