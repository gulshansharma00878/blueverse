/* eslint-disable no-undef */
'use strict';
import { Sequelize } from 'sequelize-typescript';
import path from 'path';
import { config } from '../config/config';
import { User } from './User/user';
import { Transactions } from './transactions';
import { TransactionsFeedback } from './Feedback/TransactionsFeedback';
import { Form } from './Feedback/form';
import { Question } from './Feedback/question';
import { QuestionOption } from './Feedback/question_option';
import { TermsAndPrivacyPolicy } from './termsAndPrivayPolicy';
import { City } from './city';
import { State } from './state';
import { Region } from './region';
import { OEM } from './oem';
import { Machine } from './Machine/Machine';
import { Outlet } from './outlet';
import { FeedbackResponse } from './Feedback/feedback_response';
import { MachineBusinessMode } from './Machine/machine_business_mode';
import { WashType } from './wash_type';
import { HealthMatrix } from './HealthMatrix';
import { MachineHealth } from './Machine/MachineHealth';
import { MachineHealthHistory } from './Machine/MachineHealthHistory';
import { MachineStatus } from './Machine/MachineStatus';
import { MachineStatusHistory } from './Machine/MachineStatusHistory';
import { DealerDocument } from './User/Dealer/dealer_document';
import { OutletMachine } from './outlet_machine';
import { MachineStatusLog } from './Machine/MachineStatusLog';
import { MachineParameters } from './Machine/MachineParameters';
import { MachineParametersAudit } from './Machine/MachineParametersAudit';
import { MachinesParameterUpperLowerAudit } from './Machine/MachinesParameterUpperLowerAudit';
import { EscalationContacts } from './Escalation/EscalationContacts';
import { EscalationMatrix } from './Escalation/EscalationMatrix';
import { EscalationMatrixMachine } from './Escalation/EscalationMatrixMachine';
import { EscalationMatrixParameter } from './Escalation/escalation_matrix_parameter';
import { MachineRuntime } from './Machine/MachineRuntime';
import { MachineRuntimeHistory } from './Machine/MachineRuntimeHistory';
import { FormDealer } from './Feedback/FormDealer';
import { MachineAgent } from './Machine/MachineAgent';
import { Module } from './User/Module';
import { SubRole } from './User/SubRole';
import { SubRoleModulePermission } from './User/SubRoleModulePermission';
import { Organisation } from './Organisation';
import { MachineWallet } from './Machine/MachineWallet';
import { MachineMemo } from './Machine/MachineMemo';
import { PaymentTransaction } from './payment_transactions';
import { Notification } from './Notification';
import { AreaManagerOEM } from './User/AreaManagerOEM';
import { UserArea } from './User/UserArea';
import { UserDevice } from './User/UserDevice';
import { AreaManagerDealers } from './User/AreaManagerDealers';
import { OEMManagerDealers } from './User/OEMManagerDealers';
import { ServiceRequest } from './ServiceRequest';
import fs from 'fs';
import { HazardousWasteCollection } from './HazardousWaste/hazardousWasteCollection';
import { HazardousWasteDisposal } from './HazardousWaste/hazardousWasteDisposal';
import { WaterQualityReport } from './waterQualityReport';

//B2C
import { Customer } from '../B2C/models/customer';
import { Vehicle } from '../B2C/models/vehicle';
import { Booking } from '../B2C/models/booking';
import { RecurringEvent } from '../B2C/models/recurring_event';
import { Slot } from '../B2C/models/slot';
import { Subscription } from '../B2C/models/subscription';
import { UserWallet } from '../B2C/models/user_wallet';
import { WalletTransaction } from '../B2C/models/wallet_transection';
import { WashOrder } from '../B2C/models/wash_order';
// Merchant
import { Merchant } from '../B2C/models/merchant';
import { MerchantImages } from '../B2C/models/merchant_images';
import { AdditionalService } from '../B2C/models/additional_service';
import { MerchantPricingTerm } from '../B2C/models/merchant_pricing_term';
import { MerchantAdditionalServicePrice } from '../B2C/models/merchant_additional_service_price';
import { BookingAdditionalService } from '../B2C/models/booking_additional_service';
// CouponcuscustomerRouter
import { Coupon } from '../B2C/models/coupon';
import { UserWashWallet } from '../B2C/models/user_wash_wallet';
import { WashWalletTransaction } from '../B2C/models/wash_wallet_transaction';
import { Badge } from '../B2C/models/badge';
import { NotificationEngine } from '../B2C/models/notification_engine';
import { CustomerPaymentTransaction } from '../B2C/models/customerPaymentTrasaction';
import { Referral } from '../B2C/models/reffer';
import { CustomerDeviceToken } from '../B2C/models/customerDeviceToken';
import { CustomerNotification } from '../B2C/models/customerNotification';
import { CustomerBadge } from '../B2C/models/customer_badge';
import { Holiday } from '../B2C/models/holiday';
import { MerchantHoliday } from '../B2C/models/merchant_holiday';
import { MasterBrandList } from '../B2C/models/master_brand_list';
import { NotificationEngineBadge } from '../B2C/models/notification_engine_badeges';
import { CustomerSubscription } from '../B2C/models/customer_subscription';
import { ReferAndEarn } from '../B2C/models/refer_earn_setting';
import { FormMerchant } from './Feedback/FormMerchant';
import { NotificationCity } from '../B2C/models/notification_city';
const models = [
  User,
  Transactions,
  TransactionsFeedback,
  Form,
  Question,
  QuestionOption,
  City,
  State,
  Region,
  OEM,
  TermsAndPrivacyPolicy,
  Machine,
  Outlet,
  FeedbackResponse,
  DealerDocument,
  OutletMachine,
  MachineBusinessMode,
  WashType,
  HealthMatrix,
  MachineHealth,
  MachineHealthHistory,
  MachineStatus,
  MachineStatusHistory,
  MachineStatusLog,
  MachineParameters,
  MachineParametersAudit,
  MachinesParameterUpperLowerAudit,
  EscalationContacts,
  EscalationMatrix,
  EscalationMatrixMachine,
  EscalationMatrixParameter,
  MachineRuntime,
  MachineRuntimeHistory,
  MachineWallet,
  FormDealer,
  MachineAgent,
  Module,
  SubRole,
  SubRoleModulePermission,
  Organisation,
  MachineMemo,
  PaymentTransaction,
  Notification,
  AreaManagerOEM,
  UserArea,
  OEMManagerDealers,
  ServiceRequest,
  UserDevice,
  AreaManagerDealers,
  HazardousWasteCollection,
  HazardousWasteDisposal,
  WaterQualityReport,
  Customer,
  Vehicle,
  Booking,
  RecurringEvent,
  Slot,
  Subscription,
  UserWallet,
  WalletTransaction,
  WashOrder,
  Merchant,
  MerchantImages,
  MerchantPricingTerm,
  AdditionalService,
  MerchantAdditionalServicePrice,
  BookingAdditionalService,
  Coupon,
  UserWashWallet,
  WashWalletTransaction,
  Badge,
  NotificationEngine,
  CustomerPaymentTransaction,
  Referral,
  CustomerDeviceToken,
  CustomerNotification,
  CustomerBadge,
  Holiday,
  MerchantHoliday,
  MasterBrandList,
  NotificationEngineBadge,
  CustomerSubscription,
  ReferAndEarn,
  FormMerchant,
  NotificationCity
];

// const modelsDir = path.join(__dirname, '..', 'B2C', 'models');
// const modelFiles = fs.readdirSync(modelsDir);

// const customerModels = [] as any;
// modelFiles.forEach((fileName) => {
//   const modelPath = path.join(modelsDir, fileName);
//   const modelObj = require(modelPath);
//   const modelsArray = Object.values(modelObj);
//   customerModels.push(modelsArray[0]);
// });

const db: any = {};
const dbConfig = config.dbConfig;
let sequelize: Sequelize;

// new key add
// sequelize = new Sequelize(
//   'postgres://' +
//     dbConfig.username +
//     ':' +
//     dbConfig.password +
//     `@${dbConfig.host}/` +
//     dbConfig.database,
//   {
//     dialect: 'postgres',
//     dialectOptions: {
//       ssl: {
//         require: true, // This will help you. But you will see nwe error
//         rejectUnauthorized: false, // This line will fix new error
//       },
//     },
//     host: dbConfig.host,
//     port: Number(dbConfig.port),
//     logging: false,
//   }
// );

sequelize = new Sequelize(
  'postgres://' +
    dbConfig.username +
    ':' +
    dbConfig.password +
    '@localhost/' +
    dbConfig.database,
  {
    dialect: 'postgres',
    host: dbConfig.host,
    port: Number(dbConfig.port),
  }
);

// sequelize.addModels([...models,...customerModels]);
sequelize.addModels([...models]);

async function initializeDatabase() {
  await sequelize.sync();
}
initializeDatabase();
db.sequelize = sequelize;
db.Sequelize = Sequelize;
export default db;
