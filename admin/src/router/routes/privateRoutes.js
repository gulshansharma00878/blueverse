// Export all the private routes
// For subadmin we define module and permission type for protect permission based route
// module name same as dashboard route parent module and permission type is : viewPermission,createPermisson,updatePermission
// permission schema is define in the backend database
import Dashboard from "pages/private/admin/dashboard"

// SubAdmin dynamic permission based routing not required
// import SubAdminDashboard from "pages/private/sub-admin/dashboard

import AdminProfile from "pages/private/common-pages/profile"
import Washes from "pages/private/common-pages/washes"
import Cms from "pages/private/common-pages/cms"
import AddState from "pages/private/common-pages/cms/statedetails/addState"
import AddPage from "pages/private/common-pages/cms/pagedetails/addPage"
import AddCities from "pages/private/common-pages/cms/citiesdetails/addCities"
import AddOem from "pages/private/common-pages/cms/oemdetails/addOem"
import EditPage from "pages/private/common-pages/cms/pagedetails/editPage"
import EditCities from "pages/private/common-pages/cms/citiesdetails/editCites"
import EditOem from "pages/private/common-pages/cms/oemdetails/editOem"
import EditState from "pages/private/common-pages/cms/statedetails/editState"
import ViewPage from "pages/private/common-pages/cms/pagedetails/viewPage"
import PublishedForms from "pages/private/admin/Feedback/PublishedForms"
import MappedForms from "pages/private/admin/Feedback/MappedForms"
import FeedbackResponses from "pages/private/admin/Feedback/FeedbackResponses"
import Form from "pages/private/admin/Feedback/Form"
import FormMapping from "pages/private/admin/Feedback/FormMapping"
import Agent from "pages/private/admin/Agent/Agent"
import AgentList from "components/AgentModule/AgentList/AgentList"
// import AgentDetail from "components/AgentModule/AgentDetail/AgentDetail"
import AbandonedFeedbacks from "pages/private/admin/Feedback/AbandonedFeedbacks"
import AddAgentDetail from "components/AgentModule/AgentDetail/AddAgentDetail"
import EditAgentDetail from "components/AgentModule/AgentDetail/EditAgentDetail"
import Dealers from "pages/private/admin/dealers"
import WashList from "pages/private/common-pages/wash-management"
import WashListimport from "pages/private/common-pages/wash-management/import"

import WashDetails from "pages/private/common-pages/wash-management/wash-details"
import FeedbackAnalytics from "pages/private/admin/Feedback/FeedbackAnalytics"
import ManageRoles from "pages/private/common-pages/roles"
import CreateRole from "pages/private/common-pages/roles/CreateRole"
import ViewRole from "pages/private/common-pages/roles/ViewRole"
import EditRole from "pages/private/common-pages/roles/EditRole"
import DealerInfo from "components/DealerPanel/DealerInfo"
import EditDealer from "pages/private/admin/dealers/EditDealer"
import CreateDealer from "pages/private/admin/dealers/CreateDealer"
import SubAdminListing from "pages/private/admin/ManageSubAdmin/SubAdminListing"
import CreateSubAdmin from "pages/private/admin/ManageSubAdmin/CreateSubAdmin"
import SubAdminDetails from "pages/private/admin/ManageSubAdmin/SubAdminDetails"
import AddEmployee from "components/DealerPanel/DealerInfo/Emplyoee/AddEmployee"
import EditEmployee from "components/DealerPanel/DealerInfo/Emplyoee/EditEmployee"
import AddDealerRole from "components/DealerPanel/DealerInfo/Role/AddRole/index"
import EditDealerRole from "components/DealerPanel/DealerInfo/Role/EditRole/index"
import NoPermission from "pages/private/sub-admin/no-permission"
import ViewDealerRole from "components/DealerPanel/DealerInfo/Role/ViewRole"
import BillingAccounting from "pages/private/common-pages/billing-accounting"
import ViewAdvanceMemo from "components/BillingAccounting/AdvanceMemo"
import AreaManager from "pages/private/common-pages/AreaManager"
import CreateAreaManager from "pages/private/common-pages/AreaManager/CreateAreaManager"
import ManageMachines from "pages/private/common-pages/ManageMachine"
import MachineDetailSection from "pages/private/common-pages/ManageMachine/MachineDetailSection"
import ElectricityConsumption from "pages/private/common-pages/ManageMachine/MachineDetailSection/Matrix/ElectricityConsumption"
import WaterQuality from "pages/private/common-pages/ManageMachine/MachineDetailSection/Matrix/WaterQuality"
import WaterConsumption from "pages/private/common-pages/ManageMachine/MachineDetailSection/Matrix/WaterConsumption"
import ChemicalPerformance from "pages/private/common-pages/ManageMachine/MachineDetailSection/Matrix/ChemicalPerformance"
import WaterUsed from "pages/private/common-pages/ManageMachine/MachineDetailSection/Matrix/WaterUsed"
import OemManager from "pages/private/common-pages/OemManager"
import AllServiceRequest from "pages/private/common-pages/ServiceRequest"
import CreateOemManager from "pages/private/common-pages/OemManager/CreateOemManager"
import Notifications from "pages/private/common-pages/Notifications"
import TransactionHistory from "pages/private/admin/Wallet/TransactionHistory"
import ViewBalance from "pages/private/admin/Wallet/ViewBalance"
import CreditHistory from "pages/private/admin/Wallet/CreditHistory"
import WalletBalanceHistory from "pages/private/admin/Wallet/WalletBalanceHistory"
import MachineTransactionHistory from "components/Wallet/MachineBalance"
export const PrivateRoutes = {
  admin: [
    {
      path: "/admin/dashboard",
      component: Dashboard,
      exact: true
    },
    {
      path: "/admin/profile",
      component: AdminProfile,
      exact: true
    },
    {
      path: "/admin/feedback/published-forms",
      component: PublishedForms,
      exact: true
    },

    {
      path: "/admin/createagent",
      component: Agent,
      exact: true
    },
    {
      path: "/admin/agent/list",
      component: AgentList,
      exact: true
    },
    {
      path: "/admin/agent/add",
      component: AddAgentDetail,
      exact: true
    },
    {
      path: "/admin/agent/edit",
      component: EditAgentDetail,
      exact: true
    },
    {
      path: "/admin/feedback/form-mapping",
      component: MappedForms,
      exact: true
    },
    {
      path: "/admin/feedback/feedback-response/:id",
      component: FeedbackAnalytics,
      exact: true
    },
    {
      path: "/admin/feedback/feedback-response",
      component: FeedbackResponses,
      exact: true
    },
    {
      path: "/admin/cms",
      component: Cms,
      exact: true
    },
    {
      path: "/admin/feedback/abandoned-feedbacks",
      component: AbandonedFeedbacks,
      exact: true
    },
    {
      path: "/admin/cms/create-page",
      component: AddPage,
      exact: true
    },
    {
      path: "/admin/cms/create-state",
      component: AddState,
      exact: true
    },
    {
      path: "/admin/cms/create-cities",
      component: AddCities,
      exact: true
    },
    {
      path: "/admin/cms/create-oem",
      component: AddOem,
      exact: true
    },
    {
      path: "/admin/cms/edit-page/:id",
      component: EditPage,
      exact: true
    },
    {
      path: "/admin/cms/view-page/:id",
      component: ViewPage,
      exact: true
    },
    {
      path: "/admin/cms/edit-oem/:id",
      component: EditOem,
      exact: true
    },
    {
      path: "/admin/cms/edit-cities/:id",
      component: EditCities,
      exact: true
    },
    {
      path: "/admin/cms/edit-state/:id",
      component: EditState,
      exact: true
    },
    {
      path: "/admin/feedback/create-feedback",
      component: Form,
      exact: true
    },
    {
      path: "/admin/feedback/edit-feedback/:id",
      component: Form,
      exact: true
    },
    {
      path: "/admin/feedback/create-form-map/",
      component: FormMapping,
      exact: true
    },
    {
      path: "/admin/feedback/edit-form-map/:id",
      component: FormMapping,
      exact: true
    },
    {
      path: "/admin/dealers",
      component: Dealers,
      exact: true
    },
    {
      path: "/admin/dealers/create-dealer",
      component: CreateDealer,
      exact: true
    },
    {
      path: "/admin/dealers/edit-dealer/:id",
      component: EditDealer,
      exact: true
    },
    {
      path: "/admin/wash-list",
      component: WashList,
      exact: true
    },
    {
      path: "/admin/wash-list/import",
      component: WashListimport,
      exact: true
    },
    {
      path: "/admin/wash-list/:washId",
      component: WashDetails,
      exact: true
    },
    {
      path: "/admin/roles",
      component: ManageRoles,
      exact: true
    },
    {
      path: "/admin/roles/create-role",
      component: CreateRole,
      exact: true
    },
    {
      path: "/admin/create-role/:dealerId",
      component: AddDealerRole,
      exact: true
    },
    {
      path: "/admin/view-role/:subRoleId",
      component: ViewDealerRole,
      exact: true
    },
    {
      path: "/admin/roles/:subRoleId",
      component: ViewRole,
      exact: true
    },
    {
      path: "/admin/roles/edit-role/:subRoleId",
      component: EditRole,
      exact: true
    },
    {
      path: "/admin/dealer-detail/:dealerId",
      component: DealerInfo,
      exact: true
    },
    {
      path: "/admin/manage-subAdmins",
      component: SubAdminListing,
      exact: true
    },
    {
      path: "/admin/add-subAdmin",
      component: CreateSubAdmin,
      exact: true
    },
    {
      path: "/admin/edit-subAdmin/:subAdminId",
      component: CreateSubAdmin,
      exact: true
    },
    {
      path: "/admin/subAdmin-details/:subAdminId",
      component: SubAdminDetails,
      exact: true
    },
    {
      path: "/admin/create-employee/:dealerId",
      component: AddEmployee,
      exact: true
    },
    {
      path: "/admin/edit-employee/:dealerId",
      component: EditEmployee,
      exact: true
    },
    {
      path: "/admin/create-dealer-role/:dealerId",
      component: AddDealerRole,
      exact: true
    },
    {
      path: "/admin/edit-dealer-role/:subRoleId",
      component: EditDealerRole,
      exact: true
    },
    {
      path: "/admin/billing-accounting",
      component: BillingAccounting,
      exact: true
    },
    {
      path: "/admin/billing-accounting/advance-memo/:memoId",
      component: ViewAdvanceMemo,
      exact: true
    },
    {
      path: "/admin/billing-accounting/topup-memo/:memoId",
      component: ViewAdvanceMemo,
      exact: true
    },

    {
      path: "/admin/area-manager/",
      component: AreaManager,
      exact: true
    },
    {
      path: "/admin/manage-machines/",
      component: ManageMachines,
      exact: true
    },
    {
      path: "/admin/manage-machines/details/:machineId",
      component: MachineDetailSection,
      exact: true
    },
    {
      path: "/admin/manage-machines/details/electricity-consumption/:machineId",
      component: ElectricityConsumption,
      exact: true
    },
    {
      path: "/admin/manage-machines/details/water-quality/:machineId",
      component: WaterQuality,
      exact: true
    },
    {
      path: "/admin/manage-machines/details/water-consumption/:machineId",
      component: WaterConsumption,
      exact: true
    },
    {
      path: "/admin/manage-machines/details/chemical-performance/:machineId",
      component: ChemicalPerformance,
      exact: true
    },
    {
      path: "/admin/manage-machines/details/water-washes/:machineId",
      component: WaterUsed,
      exact: true
    },
    {
      path: "/admin/area-manager/create-area-manager/",
      component: CreateAreaManager,
      exact: true
    },
    {
      path: "/admin/area-manager/edit-area-manager/:userId",
      component: CreateAreaManager,
      exact: true
    },
    {
      path: "/admin/oem-manager/",
      component: OemManager,
      exact: true
    },
    { path: "/admin/oem-manager/create-oem-manager", component: CreateOemManager, exact: true },
    {
      path: "/admin/oem-manager/edit-oem-manager/:id",
      component: CreateOemManager,
      exact: true
    },
    {
      path: "/admin/serviceRequest/",
      component: AllServiceRequest,
      exact: true
    },
    {
      path: "/admin/notifications",
      component: Notifications,
      exact: true
    },
    {
      path: "/admin/wallet/transaction-history/:dealerId",
      component: TransactionHistory,
      exact: true
    },
    {
      path: "/admin/wallet/view-balance/:dealerId",
      component: ViewBalance,
      exact: true
    },
    {
      path: "/admin/wallet/credit-balance-history",
      component: CreditHistory,
      exact: true
    },
    {
      path: "/admin/wallet/wallet-balance-history",
      component: WalletBalanceHistory,
      exact: true
    },
    {
      path: "/admin/wallet/machine-transaction",
      component: MachineTransactionHistory,
      exact: true
    },
    {
      path: "/admin/billing-accounting/blueverse-credit/:memoId",
      component: ViewAdvanceMemo,
      exact: true
    },
    {
      path: "/admin/billing-accounting/tax-invoice/:memoId",
      component: ViewAdvanceMemo,
      exact: true
    }
  ],
  subadmin: [
    {
      path: "/subadmin/dashboard",
      exact: true,
      component: Dashboard,
      module: "dashboard"
    },
    {
      component: AdminProfile,
      path: "/subadmin/profile",
      exact: true,
      module: "dashboard"
    },
    {
      path: "/subadmin/feedback/published-forms",
      component: PublishedForms,
      exact: true,
      module: "published form",
      permissionType: "viewPermission"
    },
    {
      path: "/subadmin/agent/list",
      component: AgentList,
      exact: true,
      module: "agent",
      permissionType: "viewPermission"
    },
    {
      path: "/subadmin/agent/add",
      component: AddAgentDetail,
      exact: true,
      module: "agent",
      permissionType: "createPermission"
    },
    {
      component: EditAgentDetail,
      path: "/subadmin/agent/edit",
      exact: true,
      module: "agent",
      permissionType: "updatePermission"
    },
    {
      path: "/subadmin/feedback/form-mapping",
      component: MappedForms,
      exact: true,
      module: "form mapping",
      permissionType: "viewPermission"
    },
    {
      path: "/subadmin/feedback/feedback-response",
      component: FeedbackResponses,
      exact: true,
      module: "feedback response",
      permissionType: "viewPermission"
    },
    {
      path: "/subadmin/feedback/feedback-response/:id",
      component: FeedbackAnalytics,
      exact: true,
      module: "feedback response",
      permissionType: "viewPermission"
    },
    {
      path: "/subadmin/feedback/abandoned-feedbacks",
      component: AbandonedFeedbacks,
      exact: true,
      module: "abandoned feedbacks",
      permissionType: "viewPermission"
    },
    {
      path: "/subadmin/cms",
      component: Cms,
      exact: true,
      module: "cms",
      permissionType: "viewPermission"
    },
    {
      path: "/subadmin/cms/create-page",
      component: AddPage,
      exact: true,
      module: "cms pages",
      permissionType: "createPermission"
    },
    {
      path: "/subadmin/cms/create-state",
      component: AddState,
      exact: true,
      module: "cms states",
      permissionType: "createPermission"
    },
    {
      path: "/subadmin/cms/create-cities",
      component: AddCities,
      exact: true,
      module: "cms cities",
      permissionType: "createPermission"
    },
    {
      component: AddOem,
      path: "/subadmin/cms/create-oem",
      exact: true,
      module: "cms oem",
      permissionType: "createPermission"
    },
    {
      path: "/subadmin/cms/edit-page/:id",
      component: EditPage,
      exact: true,
      module: "cms pages",
      permissionType: "editPermission"
    },
    {
      path: "/subadmin/cms/view-page/:id",
      component: ViewPage,
      exact: true,
      module: "cms pages",
      permissionType: "viewPermission"
    },
    {
      path: "/subadmin/cms/edit-oem/:id",
      component: EditOem,
      exact: true,
      module: "cms oem",
      permissionType: "updatePermission"
    },
    {
      path: "/subadmin/cms/edit-cities/:id",
      component: EditCities,
      exact: true,
      module: "cms cities",
      permissionType: "updatePermission"
    },
    {
      path: "/subadmin/cms/edit-state/:id",
      component: EditState,
      exact: true,
      module: "cms states",
      permissionType: "updatePermission"
    },
    {
      path: "/subadmin/feedback/create-feedback",
      component: Form,
      exact: true,
      module: "published form",
      permissionType: "createPermission"
    },
    {
      component: Form,
      path: "/subadmin/feedback/edit-feedback/:id",
      exact: true,
      module: "published form",
      permissionType: "updatePermission"
    },
    {
      path: "/subadmin/feedback/create-form-map/",
      component: FormMapping,
      exact: true,
      module: "form mapping",
      permissionType: "createPermission"
    },
    {
      path: "/subadmin/feedback/edit-form-map/:id",
      component: FormMapping,
      exact: true,
      module: "form mapping",
      permissionType: "updatePermission"
    },
    {
      path: "/subadmin/dealers",
      component: Dealers,
      exact: true,
      module: "dealer",
      permissionType: "viewPermission"
    },
    {
      component: CreateDealer,
      path: "/subadmin/dealers/create-dealer",
      exact: true,
      module: "dealer",
      permissionType: "createPermission"
    },
    {
      component: EditDealer,
      path: "/subadmin/dealers/edit-dealer/:id",
      exact: true,
      module: "dealer",
      permissionType: "updatePermission"
    },
    {
      path: "/subadmin/wash-list",
      component: WashList,
      exact: true,
      module: "washes",
      permissionType: "viewPermission"
    },
    {
      path: "/subadmin/wash-list/:washId",
      component: WashDetails,
      exact: true,
      module: "washes",
      permissionType: "viewPermission"
    },
    {
      path: "/subadmin/roles",
      component: ManageRoles,
      exact: true,
      module: "roles & permission",
      permissionType: "viewPermission"
    },
    {
      component: CreateRole,
      path: "/subadmin/roles/create-role",
      exact: true,
      module: "roles & permission",
      permissionType: "createPermission"
    },
    {
      path: "/subadmin/roles/:subRoleId",
      component: ViewRole,
      exact: true,
      module: "roles & permission",
      permissionType: "viewPermission"
    },
    {
      path: "/subadmin/roles/edit-role/:subRoleId",
      component: EditRole,
      exact: true,
      module: "roles & permission",
      permissionType: "updatePermission"
    },
    {
      path: "/subadmin/dealer-detail/:dealerId",
      component: DealerInfo,
      exact: true,
      module: "dealer",
      permissionType: "viewPermission"
    },
    {
      component: SubAdminListing,
      path: "/subadmin/manage-subAdmins",
      exact: true,
      module: "sub admin",
      permissionType: "viewPermission"
    },
    {
      path: "/subadmin/add-subAdmin",
      component: CreateSubAdmin,
      exact: true,
      module: "sub admin",
      permissionType: "createPermission"
    },
    {
      path: "/subadmin/edit-subAdmin/:subAdminId",
      component: CreateSubAdmin,
      exact: true,
      module: "sub admin",
      permissionType: "updatePermission"
    },
    {
      component: SubAdminDetails,
      path: "/subadmin/subAdmin-details/:subAdminId",
      exact: true,
      module: "sub admin",
      permissionType: "viewPermission"
    },
    {
      path: "/subadmin/create-employee/:dealerId",
      component: AddEmployee,
      exact: true,
      module: "dealer",
      permissionType: "viewPermission"
    },
    {
      path: "/subadmin/edit-employee/:dealerId",
      component: EditEmployee,
      exact: true,
      module: "dealer",
      permissionType: "viewPermission"
    },
    {
      path: "/subadmin/create-role/:dealerId",
      component: AddDealerRole,
      exact: true,
      module: "dealer",
      permissionType: "viewPermission"
    },
    {
      path: "/subadmin/view-role/:subRoleId",
      component: ViewDealerRole,
      exact: true,
      module: "dealer",
      permissionType: "viewPermission"
    },
    {
      path: "/subadmin/no-permission",
      component: NoPermission,
      exact: true,
      module: "dashboard"
    },
    {
      path: "/subadmin/edit-dealer-role/:subRoleId",
      component: EditDealerRole,
      exact: true,
      module: "dealer",
      permissionType: "viewPermission"
    },
    {
      path: "/subadmin/billing-accounting",
      component: BillingAccounting,
      exact: true,
      module: "billingAccounting",
      permissionType: "viewPermission"
    },
    {
      path: "/subadmin/billing-accounting/advance-memo/:memoId",
      component: ViewAdvanceMemo,
      exact: true,
      module: "Billing & Accounting Advance Memo",
      permissionType: "viewPermission"
    },
    {
      path: "/subadmin/billing-accounting/topup-memo/:memoId",
      component: ViewAdvanceMemo,
      exact: true,
      module: "Billing & Accounting Top Up Memo",
      permissionType: "viewPermission"
    },
    {
      path: "/subadmin/billing-accounting/blueverse-credit/:memoId",
      component: ViewAdvanceMemo,
      exact: true,
      module: "Billing & Accounting Blueverse credits",
      permissionType: "viewPermission"
    },
    {
      path: "/subadmin/billing-accounting/tax-invoice/:memoId",
      component: ViewAdvanceMemo,
      exact: true,
      module: "Billing & Accounting Tax Invoice",
      permissionType: "viewPermission"
    },
    {
      path: "/subadmin/area-manager/",
      component: AreaManager,
      exact: true,
      module: "area manager",
      permissionType: "viewPermission"
    },
    {
      path: "/subadmin/area-manager/create-area-manager/",
      component: CreateAreaManager,
      exact: true,
      module: "area manager",
      permissionType: "createPermission"
    },
    {
      path: "/subadmin/area-manager/edit-area-manager/:userId",
      component: CreateAreaManager,
      exact: true,
      module: "area manager",
      permissionType: "editPermission"
    },
    {
      path: "/subadmin/oem-manager/",
      component: OemManager,
      exact: true,
      module: "oem manager",
      permissionType: "viewPermission"
    },
    {
      path: "/subadmin/oem-manager/create-oem-manager",
      component: CreateOemManager,
      exact: true,
      module: "oem manager",
      permissionType: "createPermission"
    },
    {
      path: "/subadmin/oem-manager/edit-oem-manager/:id",
      component: CreateOemManager,
      exact: true,
      module: "oem manager",
      permissionType: "editPermission"
    },
    {
      path: "/subadmin/serviceRequest/",
      component: AllServiceRequest,
      exact: true,
      module: "service request",
      permissionType: "viewPermission"
    },
    {
      path: "/subadmin/notifications",
      component: Notifications,
      exact: true,
      module: "dashboard"
    },
    {
      path: "/subadmin/manage-machines/",
      component: ManageMachines,
      exact: true,
      module: "machine details",
      permissionType: "viewPermission"
    },
    {
      path: "/subadmin/manage-machines/details/:machineId",
      component: MachineDetailSection,
      exact: true,
      module: "machine details",
      permissionType: "viewPermission"
    },
    {
      path: "/subadmin/manage-machines/details/electricity-consumption/:machineId",
      component: ElectricityConsumption,
      exact: true,
      module: "machine details",
      permissionType: "viewPermission"
    },
    {
      path: "/subadmin/manage-machines/details/water-quality/:machineId",
      component: WaterQuality,
      exact: true,
      module: "machine details",
      permissionType: "viewPermission"
    },
    {
      path: "/subadmin/manage-machines/details/water-consumption/:machineId",
      component: WaterConsumption,
      exact: true,
      module: "machine details",
      permissionType: "viewPermission"
    },
    {
      path: "/subadmin/manage-machines/details/chemical-performance/:machineId",
      component: ChemicalPerformance,
      exact: true,
      module: "machine details",
      permissionType: "viewPermission"
    },
    {
      path: "/subadmin/manage-machines/details/water-washes/:machineId",
      component: WaterUsed,
      exact: true,
      module: "machine details",
      permissionType: "viewPermission"
    },
    {
      path: "/subadmin/wallet/transaction-history/:dealerId",
      component: TransactionHistory,
      exact: true,
      module: "dealer",
      permissionType: "viewPermission"
    },
    {
      path: "/subadmin/wallet/view-balance/:dealerId",
      component: ViewBalance,
      exact: true,
      module: "dealer",
      permissionType: "viewPermission"
    },
    {
      path: "/subadmin/wallet/credit-balance-history",
      component: CreditHistory,
      exact: true,
      module: "dealer",
      permissionType: "viewPermission"
    },
    {
      path: "/subadmin/wallet/wallet-balance-history",
      component: WalletBalanceHistory,
      exact: true,
      module: "dealer",
      permissionType: "viewPermission"
    },
    {
      path: "/subadmin/wallet/machine-transaction",
      component: MachineTransactionHistory,
      exact: true,
      module: "dealer",
      permissionType: "viewPermission"
    }
  ],
  agent: [
    {
      path: "/agent/washes",
      component: Washes,
      exact: true
    },
    {
      path: "/agent/profile",
      component: AdminProfile,
      exact: true
    },
    {
      path: "/agent/notifications",
      component: Notifications,
      exact: true
    }
  ],
  areaManager: [
    {
      path: "/areaManager/dashboard",
      component: Dashboard,
      exact: true
    },
    {
      path: "/areaManager/wash-list",
      component: WashList,
      exact: true
    },
    {
      component: AdminProfile,
      path: "/areaManager/profile",
      exact: true
    },
    {
      path: "/area-manager/notifications",
      component: Notifications,
      exact: true
    },
    {
      path: "/areaManager/wash-list/:washId",
      component: WashDetails,
      exact: true
    }
  ],
  oemManager: [
    {
      path: "/oemManager/dashboard",
      component: Dashboard,
      exact: true
    },
    {
      path: "/oemManager/wash-list/:washId",
      component: WashDetails,
      exact: true
    },
    {
      path: "/oemManager/wash-list",
      component: WashList,
      exact: true
    },
    {
      component: AdminProfile,
      path: "/oemManager/profile",
      exact: true
    },
    {
      path: "/oem-manager/notifications",
      component: Notifications,
      exact: true
    }
  ]
}
