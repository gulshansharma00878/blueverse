// Export all the private routes

// import Settings from "pages/private/settings"
// import SubAdmins from "pages/private/sub-admins"
// import Users from "pages/private/users"
import Dashboard from "pages/private/dealer/dashboard"
import AccountSetting from "pages/private/dealer/AccountSetting"
import WashList from "pages/private/dealer/wash-management"
import WashDetails from "components/WashManagement/wash-details"
import ManageEmployees from "pages/private/dealer/manage-employees"
import EmployeeDetails from "pages/private/dealer/manage-employees/EmployeeDetails"
import TransactionHistory from "pages/private/dealer/Wallet/TransactionHistory"
import CreditHistory from "pages/private/dealer/Wallet/CreditHistory"
import ViewBalance from "pages/private/dealer/Wallet/ViewBalance"
import MachineTransactionHistory from "components/Wallet/MachineBalance"
import WalletBalanceHistory from "pages/private/dealer/Wallet/WalletBalanceHistory"
import BillingAccounting from "pages/private/dealer/billing-accounting"
import ViewAdvanceMemo from "components/BillingAccount/AdvanceMemo"
import SuccessPayment from "pages/private/dealer/Wallet/SuccessPayment"
import FailPayment from "pages/private/dealer/Wallet/FailPayment"
import PaymentSuccess from "components/BillingAccount/AdvanceMemo/PaymentSuccess"
import ProcessingPayment from "pages/private/dealer/Wallet/ProcessingPayment"
import Machines from "pages/private/dealer/Machine"
import MachineDetailSection from "pages/private/dealer/Machine/MachineDetailSection"
import AddService from "pages/private/dealer/Machine/MachineDetailSection/AddService"

import WaterQuality from "pages/private/dealer/Machine/MachineDetailSection/Matrix/WaterQuality"
import WaterUsed from "pages/private/dealer/Machine/MachineDetailSection/Matrix/WaterUsed"
import WaterConsumption from "pages/private/dealer/Machine/MachineDetailSection/Matrix/WaterConsumption"
import ElectricityConsumption from "pages/private/dealer/Machine/MachineDetailSection/Matrix/ElectricityConsumption"
import ChemicalPerformance from "pages/private/dealer/Machine/MachineDetailSection/Matrix/ChemicalPerformance"
import Notifications from "pages/private/dealer/Notifications"
export const PrivateRoutes = {
  dealer: [
    {
      path: "/dealer/dashboard",
      component: Dashboard,
      exact: true
    },
    {
      path: "/dealer/account",
      component: AccountSetting,
      exact: true
    },
    {
      path: "/dealer/wash-list",
      component: WashList,
      exact: true
    },
    {
      path: "/dealer/wash-list/:washId",
      component: WashDetails,
      exact: true
    },
    {
      path: "/dealer/manage-employees",
      component: ManageEmployees,
      exact: true
    },
    {
      path: "/dealer/manage-employees/details/:id",
      component: EmployeeDetails,
      exact: true
    },
    {
      path: "/dealer/wallet/transaction-history",
      component: TransactionHistory,
      exact: true
    },
    {
      path: "/dealer/wallet/machine-transaction/:machineId",
      component: MachineTransactionHistory,
      exact: true
    },
    {
      path: "/dealer/wallet/view-balance",
      component: ViewBalance,
      exact: true
    },
    {
      path: "/dealer/wallet/credit-balance-history/:machineId",
      component: CreditHistory,
      exact: true
    },
    {
      path: "/dealer/wallet/wallet-balance-history/:machineId",
      component: WalletBalanceHistory,
      exact: true
    },
    {
      path: "/dealer/billing-accounting",
      component: BillingAccounting,
      exact: true
    },
    {
      path: "/dealer/billing-accounting/advance-memo/:memoId",
      component: ViewAdvanceMemo,
      exact: true
    },
    {
      path: "/dealer/wallet/success-payment/:txnid",
      component: SuccessPayment,
      exact: true
    },
    {
      path: "/dealer/wallet/fail-payment/:txnid",
      component: FailPayment,
      exact: true
    },
    {
      path: "/dealer/billing-accounting/topup-memo/:memoId",
      component: ViewAdvanceMemo,
      exact: true
    },
    {
      path: "/dealer/billing-accounting/taxinvoice-memo/:memoId",
      component: ViewAdvanceMemo,
      exact: true
    },
    {
      path: "/dealer/billing-accounting/credits-memo/:memoId",
      component: ViewAdvanceMemo,
      exact: true
    },
    {
      path: "/dealer/advance-memo/payment-receipt",
      component: PaymentSuccess,
      exact: true
    },
    {
      path: "/dealer/advance-memo/payment-processing",
      component: ProcessingPayment,
      exact: true
    },
    {
      path: "/dealer/machines/details/water-quality/:machineId",
      component: WaterQuality,
      exact: true
    },
    {
      path: "/dealer/machines",
      component: Machines,
      exact: true
    },
    {
      path: "/dealer/machines/details/:machineId",
      component: MachineDetailSection,
      exact: true
    },
    {
      path: "/dealer/machines/create/service/:machineId",
      component: AddService,
      exact: true
    },
    {
      path: "/dealer/machines/details/water-consumption/:machineId",
      component: WaterConsumption,
      exact: true
    },
    {
      path: "/dealer/machines/details/electricity-consumption/:machineId",
      component: ElectricityConsumption,
      exact: true
    },
    {
      path: "/dealer/machines/details/chemical-performance/:machineId",
      component: ChemicalPerformance,
      exact: true
    },
    {
      path: "/dealer/notifications",
      component: Notifications,
      exact: true
    },
    {
      path: "/dealer/machines/details/water-washes/:machineId",
      component: WaterUsed,
      exact: true
    }
  ],
  employee: [
    {
      path: "/employee/dashboard",
      component: Dashboard,
      exact: true,
      module: "dashboard"
    },
    {
      path: "/employee/wallet/machine-transaction/:machineId",
      component: MachineTransactionHistory,
      exact: true,
      module: "wallet",
      permissionType: "viewPermission"
    },
    {
      path: "/employee/account",
      component: AccountSetting,
      exact: true,
      module: "account setting",
      permissionType: "viewPermission"
    },
    {
      path: "/employee/wash-list",
      component: WashList,
      exact: true,
      module: "manage washes",
      permissionType: "viewPermission"
    },
    {
      path: "/employee/wash-list/:washId",
      component: WashDetails,
      exact: true,
      module: "manage washes",
      permissionType: "viewPermission"
    },
    {
      path: "/employee/billing-accounting",
      component: BillingAccounting,
      exact: true,
      module: "billing & accounting",
      permissionType: "viewPermission"
    },
    {
      path: "/employee/machines",
      component: Machines,
      exact: true,
      module: "machine details",
      permissionType: "viewPermission"
    },
    {
      path: "/employee/wallet/transaction-history",
      component: TransactionHistory,
      exact: true,
      module: "wallet",
      permissionType: "viewPermission"
    },
    {
      path: "/employee/manage-employees",
      component: ManageEmployees,
      exact: true,
      module: "manage employees",
      permissionType: "viewPermission"
    },

    {
      path: "/employee/wallet/view-balance",
      component: ViewBalance,
      exact: true,
      module: "wallet",
      permissionType: "viewPermission"
    },
    {
      path: "/employee/wallet/wallet-balance-history/:machineId",
      component: WalletBalanceHistory,
      exact: true,
      module: "wallet",
      permissionType: "viewPermission"
    },

    {
      path: "/employee/detail/advance-memo/:memoId",
      component: ViewAdvanceMemo,
      exact: true,
      module: "billing & accounting",
      permissionType: "viewPermission"
    },
    {
      path: "/employee/manage-employees/details/:id",
      component: EmployeeDetails,
      exact: true,
      module: "manage employees",
      permissionType: "viewPermission"
    },
    {
      path: "/employee/wallet/success-payment/:txnid",
      component: SuccessPayment,
      exact: true,
      module: "wallet",
      permissionType: "payPermission"
    },
    {
      path: "/employee/wallet/credit-balance-history/:machineId",
      component: CreditHistory,
      exact: true,
      module: "wallet",
      permissionType: "viewPermission"
    },
    {
      path: "/employee/wallet/fail-payment/:txnid",
      component: FailPayment,
      exact: true,
      module: "wallet",
      permissionType: "payPermission"
    },

    {
      path: "/employee/advance-memo/payment-receipt",
      component: PaymentSuccess,
      exact: true,
      module: "billing & accounting",
      permissionType: "viewPermission"
    },
    {
      path: "/employee/advance-memo/payment-processing",
      component: ProcessingPayment,
      exact: true,
      module: "billing & accounting",
      permissionType: "viewPermission"
    },
    {
      path: "/employee/detail/topup-memo/:memoId",
      component: ViewAdvanceMemo,
      exact: true,
      module: "billing & accounting",
      permissionType: "viewPermission"
    },
    {
      path: "/employee/billing-accounting/advance-memo/:memoId",
      component: ViewAdvanceMemo,
      exact: true,
      module: "billing & accounting",
      permissionType: "viewPermission"
    },
    {
      path: "/employee/billing-accounting/topup-memo/:memoId",
      component: ViewAdvanceMemo,
      exact: true,
      module: "billing & accounting",
      permissionType: "viewPermission"
    },
    {
      path: "/employee/machines/details/electricity-consumption/:machineId",
      component: ElectricityConsumption,
      exact: true,
      module: "machine details",
      permissionType: "viewPermission"
    },
    {
      path: "/employee/billing-accounting/credits-memo/:memoId",
      component: ViewAdvanceMemo,
      exact: true,
      module: "billing & accounting",
      permissionType: "viewPermission"
    },
    {
      path: "/employee/machines/details/:machineId",
      component: MachineDetailSection,
      exact: true,
      module: "machine details",
      permissionType: "viewPermission"
    },
    {
      path: "/employee/machines/details/water-consumption/:machineId",
      component: WaterConsumption,
      exact: true,
      module: "machine details",
      permissionType: "viewPermission"
    },
    {
      path: "/employee/machines/details/water-quality/:machineId",
      component: WaterQuality,
      exact: true,
      module: "machine details",
      permissionType: "viewPermission"
    },
    {
      path: "/employee/machines/details/chemical-performance/:machineId",
      component: ChemicalPerformance,
      exact: true,
      module: "machine details",
      permissionType: "viewPermission"
    },
    {
      path: "/employee/billing-accounting/taxinvoice-memo/:memoId",
      component: ViewAdvanceMemo,
      exact: true,
      module: "billing & accounting",
      permissionType: "viewPermission"
    },
    {
      path: "/employee/notifications",
      component: Notifications,
      exact: true,
      module: "dashboard"
    },
    {
      path: "/employee/machines/details/water-washes/:machineId",
      component: WaterUsed,
      exact: true,
      module: "machine details",
      permissionType: "viewPermission"
    }
  ]
}
