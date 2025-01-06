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
];

const db: any = {};
const dbConfig = config.dbConfig;
let sequelize: Sequelize;

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



sequelize.addModels(models);

async function initializeDatabase() {
  await sequelize.sync();
}
initializeDatabase();
db.sequelize = sequelize;
db.Sequelize = Sequelize;
export default db;
