// Export all routes that should be in the side menu
import React from "react"
import HomeIcon from "@mui/icons-material/Dashboard"
import dealerManagementIcon from "assets/images/icons/dealerManagementIcon.svg"
import homeIcon from "assets/images/icons/homeIcon.svg"
import agentManagementIcon from "assets/images/icons/agentManagementIcon.svg"
import washManagementIcon from "assets/images/icons/washManagementIcon.svg"
import feedBackIcon from "assets/images/icons/feedBack.svg"
import cmsIcon from "assets/images/icons/cmsIcon.svg"
import Published from "assets/images/icons/PublishedForms.svg"
import Feedback from "assets/images/icons/FeedbackResponse.svg"
import Abandoned from "assets/images/icons/Abandoned.svg"
import FormMapping from "assets/images/icons/FormMapping.svg"
import SubAdminIcon from "assets/images/icons/subAdminIcon2.svg"
import AreaManagerIcon from "assets/images/icons/areaManagerIcon.svg"
import OemManagerIcon from "assets/images/icons/oemManagerIcon.svg"
import RoleIcon from "assets/images/icons/roleIcon.svg"
import Billing from "assets/images/icons/Billing.svg"
import ManageMachine from "assets/images/icons/manageMachines.svg"
import ServiceRequest from "assets/images/icons/serviceRequest.svg"

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
    "Dashboard",
    <IconWrapper iconSrc={homeIcon} altText="Dashboard" />,
    "/dashboard",
    ["admin", "subadmin", "areaManager", "oemManager"],
    "dashboard"
  ),
  new MenuPath(
    "Feedback Management",
    <IconWrapper iconSrc={feedBackIcon} altText="Manage Washes" />,
    "/feedback/published-forms",
    ["admin", "subadmin"],
    "",
    [
      new MenuPath(
        "Published Forms",
        <IconWrapper iconSrc={Published} altText="Agent Management" />,
        "/feedback/published-forms",
        ["admin", "subadmin"],
        "published form"
      ),
      new MenuPath(
        "Form Mapping",
        <IconWrapper iconSrc={FormMapping} altText="Agent Management" />,
        "/feedback/form-mapping",
        ["admin", "subadmin"],
        "form mapping"
      ),
      new MenuPath(
        "Feedback Responses",
        <IconWrapper iconSrc={Feedback} altText="feedback" />,
        "/feedback/feedback-response",
        ["admin", "subadmin"],
        "feedback response"
      ),
      new MenuPath(
        "Abandoned Feedbacks",
        <IconWrapper iconSrc={Abandoned} altText="Abandoned Feedbacks" />,
        "/feedback/abandoned-feedbacks",
        ["admin", "subadmin"],
        "abandoned feedbacks"
      )
    ]
  ),
  new MenuPath(
    "Agent Management",
    <IconWrapper iconSrc={agentManagementIcon} altText="Agent Management" />,
    "/agent/list",
    ["admin", "subadmin"],
    "agent"
  ),
  new MenuPath(
    "Dealership Management",
    <IconWrapper iconSrc={dealerManagementIcon} altText="Dealership Management" />,
    "/dealers",
    ["admin", "subadmin"],
    "dealer"
  ),
  new MenuPath(
    "Wash Management",
    <IconWrapper iconSrc={washManagementIcon} altText="Wash Management" />,
    "/washes",
    ["agent"]
  ),
  new MenuPath(
    "Manage Washes",
    <IconWrapper iconSrc={washManagementIcon} altText="Manage Washes" />,
    "/wash-list",
    ["admin", "subadmin", "areaManager", "oemManager"],
    "washes"
  ),
  new MenuPath(
    "Manage Machines",
    <IconWrapper iconSrc={ManageMachine} altText="Manage Machines" />,
    "/manage-machines",
    ["admin", "subadmin"],
    "machine details"
  ),
  new MenuPath(
    "Service Requests",
    <IconWrapper iconSrc={ServiceRequest} altText="Service Requests" />,
    "/serviceRequest",
    ["admin", "subadmin"],
    "service request"
  ),
  new MenuPath(
    "Roles & Permission",
    <IconWrapper iconSrc={RoleIcon} altText="Roles" />,
    "/roles",
    ["admin", "subadmin"],
    "roles & permission"
  ),
  new MenuPath(
    "Sub-Admin",
    <IconWrapper iconSrc={SubAdminIcon} altText="Sub-Admin" />,
    "/manage-subAdmins",
    ["admin", "subadmin"],
    "sub admin"
  ),
  new MenuPath("Subadmin Dashboard", <HomeIcon />, "/dashboard", ["subadmin"]),
  new MenuPath(
    "Area Manager",
    <IconWrapper iconSrc={AreaManagerIcon} altText="Area Manager" />,
    "/area-manager",
    ["admin", "subadmin"],
    "area manager"
  ),
  new MenuPath(
    "OEM Manager",
    <IconWrapper iconSrc={OemManagerIcon} altText="OEM Manager" />,
    "/oem-manager",
    ["admin", "subadmin"],
    "oem manager"
  ),
  new MenuPath(
    "CMS",
    <IconWrapper iconSrc={cmsIcon} altText="CMS" />,
    "/cms",
    ["admin", "subadmin"],
    "cms"
  ),
  new MenuPath(
    "Billing & Accounting",
    <IconWrapper iconSrc={Billing} altText="BillingAccounting" />,
    "/billing-accounting",
    ["admin", "subadmin"],
    "billingAccounting"
  )
]
