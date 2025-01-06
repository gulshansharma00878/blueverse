import compile from 'string-template/compile';

const notificationConstant = {
  adminNotificationObject: {
    ADVANCE_MEMO_GENERATE: {
      type: 'ADVANCE_MEMO_GENERATE',
      url: 'billing-accounting/advance-memo',
      msg: compile(
        'A new advance memo {memoId} of machine {machineName} generate'
      ),
      emailSubject: compile(
        'A new advance memo {memoId} of machine {machineName} generate'
      ),
      emailBody: compile(
        'A new advance memo {memoId} of machine {machineName} generate.<a href="{url}">click here'
      ),
    },
    ADVANCE_MEMO_PAYMENT_SUCCESS: {
      type: 'ADVANCE_MEMO_PAYMENT_SUCCESS',
      url: 'billing-accounting/advance-memo',
      msg: compile(
        'Payment of advance memo amount {amount} success  {memoId}  of machine {machineName} '
      ),
      emailSubject: compile(
        'Payment of advance memo amount {amount} success  {memoId}  of machine {machineName} '
      ),
      emailBody: compile(
        'Payment of advance memo amount {amount} success  {memoId}  of machine {machineName} .<a href="{url}">click here'
      ),
    },
    ADVANCE_MEMO_PAYMENT_FAILED: {
      type: 'ADVANCE_MEMO_PAYMENT_FAILED',
      url: 'billing-accounting/advance-memo',
      msg: compile(
        'Payment of advance memo amount {amount} failed  {memoId}  of machine {machineName} '
      ),
      emailSubject: compile(
        'Payment of advance memo amount {amount} failed  {memoId}  of machine {machineName} '
      ),
      emailBody: compile(
        'Payment of advance memo amount {amount} failed  {memoId}  of machine {machineName} .<a href="{url}">click here'
      ),
    },
    TOPU_UP_GENERATE: {
      type: 'TOPU_UP_GENERATE',
      url: 'billing-accounting/topup-memo',
      msg: compile(
        'A new topup memo {memoId} of machine {machineName} generate'
      ),
      emailSubject: compile(
        'A new topup memo {memoId} of machine {machineName} generate'
      ),
      emailBody: compile(
        'A new topup memo memo {memoId} of machine {machineName} generate.<a href="{url}">click here'
      ),
    },
    TAX_INVOICE_GENERATE: {
      type: 'TAX_INVOICE_GENERATE',
      url: 'billing-accounting/tax-invoice',
      msg: compile(
        'A new tax invoice memo {memoId}  of machine {machineName} generate'
      ),
      emailSubject: compile(
        'A new tax invoice memo {memoId}  of machine {machineName} generate'
      ),
      emailBody: compile(
        'A new tax invoice memo {memoId}  of machine {machineName} generate.<a href="{url}">click here'
      ),
    },
    BLUEVERSE_CREDIT_CARRYFORWARD: {
      type: 'BLUEVERSE_CREDIT_CARRYFORWARD',
      url: 'billing-accounting/blueverse-credit',
      msg: compile(
        'A new blueverse credit memo {memoId}  of machine {machineName} generate'
      ),
      emailSubject: compile(
        'A new blueverse credit memo {memoId}  of machine {machineName} generate'
      ),
      emailBody: compile(
        'A new blueverse credit memo {memoId}  of machine {machineName} generate.<a href="{url}">click here'
      ),
    },
    DEALER_PAYMENT_DONE: {
      type: 'DEALER_PAYMENT_DONE',
      url: 'billing-accounting/topup-memo',
      msg: compile(
        'A payment success of amount {amount} {memoId} machine {machineName} generate'
      ),
      emailSubject: compile(
        'A payment success of amount {amount} {memoId} machine {machineName} generate'
      ),
      emailBody: compile(
        'A payment success of amount {amount} {memoId} machine {machineName} generate.<a href="{url}">click here'
      ),
    },
    DEALER_PAYMENT_FAILED: {
      type: 'DEALER_PAYMENT_FAILED',
      url: 'billing-accounting/topup-memo',
      msg: compile(
        'A payment failed of {memoId}  machine {machineName} generate'
      ),
      emailSubject: compile(
        'A payment failed of {memoId}  machine {machineName} generate'
      ),
      emailBody: compile(
        'A payment failed of {memoId}  machine {machineName} generate.<a href="{url}">click here'
      ),
    },
    DEALER_PAYMENT_PENDING: {
      type: 'DEALER_PAYMENT_PENDING',
      url: '',
      msg: compile(
        'A payment pending of {memoId}  machine {machineName} generate'
      ),
      emailSubject: compile(
        'A payment pending of {memoId}  machine {machineName} generate'
      ),
      emailBody: compile(
        'A payment pending of {memoId}  machine {machineName} generate.<a href="{url}">click here'
      ),
    },
    MACHINE_HEALTH_SENSOR_FAILED: {
      type: 'MACHINE_HEALTH_SENSOR_FAILED',
      url: 'manage-machines/details',
      msg: compile('A machine {machineName} sensor has failed'),
      emailSubject: compile('A machine {machineName} failed'),
      emailBody: compile(
        'Hi {userName} a machine {machineName} raise a alarm {alarmName},current status,Weightage:{weightage}, Critical :{critical},Escalate :{escalate}, IsValid:{isValid} .<a href="{url}">click here'
      ),
    },
    NEW_DEALER_ONBOARDED: {
      type: 'NEW_DEALER_ONBOARDED',
      url: 'dealer-detail',
      msg: compile('A new dealer {dealerId} {dealerName} onBoard'),
      emailSubject: compile('A new dealer {dealerId} {dealerName} onBoard'),
      emailBody: compile(
        'Hi {userName} a new dealer of Id {dealerId}  {dealerName} from oem {oemName} .<a href="{url}">click here'
      ),
    },
    SERVICE_REQUEST_RECEIVED: {
      type: 'SERVICE_REQUEST_RECEIVED',
      url: 'serviceRequest',
      msg: compile('A new service request {0} is received'),
      emailSubject: compile('A new service request {0} is received'),
      emailBody: compile(
        'Hi {userName} a new service request of Id {serviceId} of machine {machineName} from service center {outletName} is received.<a href="{url}">click here'
      ),
    },
    LOW_MACHINE_BALANCE: {
      type: 'LOW_MACHINE_BALANCE',
      url: 'manage-machines/details',
      msg: compile(
        'Machine {machineName} balance is {machineBalance}, below the threshold of 5000. '
      ),
      emailSubject: compile('Urgent: Machine {machineName} Balance Alert'),
      emailBody: compile(
        'Hi {userName}, one of dealer {dealerName} machines {machineName} has a balance of {machineBalance}, which is below the threshold of 5000. Please take immediate action to ensure uninterrupted service..<a href="{url}">click here'
      ),
    },
  },
  dealerNotificationObject: {
    ADVANCE_MEMO_GENERATE_BY_ADMIN: {
      type: 'ADVANCE_MEMO_GENERATE_BY_ADMIN',
      url: 'billing-accounting/advance-memo',
      msg: compile('A new advance memo {memoId} of machine {machineName}'),
      emailSubject: compile(
        'A new advance memo {memoId} of machine {machineName}'
      ),
      emailBody: compile(
        'A new advance memo {memoId} of machine {machineName}.<a href="{url}">click here'
      ),
    },
    ADVANCE_MEMO_PAYMENT_SUCCESS: {
      type: 'ADVANCE_MEMO_PAYMENT_SUCCESS',
      url: 'billing-accounting/advance-memo',
      msg: compile(
        'Payment of advance memo amount {amount} success  {memoId}  of machine {machineName} '
      ),
      emailSubject: compile(
        'Payment of advance memo amount {amount} success  {memoId}  of machine {machineName} '
      ),
      emailBody: compile(
        'Payment of advance memo amount {amount} success  {memoId}  of machine {machineName} .<a href="{url}">click here'
      ),
    },
    ADVANCE_MEMO_PAYMENT_FAILED: {
      type: 'ADVANCE_MEMO_PAYMENT_FAILED',
      url: 'billing-accounting/advance-memo',
      msg: compile(
        'Payment of advance memo amount {amount} failed  {memoId}  of machine {machineName} '
      ),
      emailSubject: compile(
        'Payment of advance memo amount {amount} failed  {memoId}  of machine {machineName} '
      ),
      emailBody: compile(
        'Payment of advance memo amount {amount} failed  {memoId}  of machine {machineName} .<a href="{url}">click here'
      ),
    },
    TOP_UP_GENERATE_BY_ADMIN: {
      type: 'TOP_UP_GENERATE_BY_ADMIN',
      url: 'billing-accounting/topup-memo',
      msg: compile('A new topup memo {memoId} of machine {machineName}'),
      emailSubject: compile(
        'A new topup memo {memoId} of machine {machineName}'
      ),
      emailBody: compile(
        'A new topup memo memo {memoId} of machine {machineName}.<a href="{url}">click here'
      ),
    },
    TAX_INVOICE_GENERATE_BY_ADMIN: {
      type: 'TAX_INVOICE_GENERATE_BY_ADMIN',
      url: 'billing-accounting/taxinvoice-memo',
      msg: compile('A new tax invoice memo {memoId}  of machine {machineName}'),
      emailSubject: compile(
        'A new tax invoice memo {memoId}  of machine {machineName}'
      ),
      emailBody: compile(
        'A new tax invoice memo {memoId}  of machine {machineName}.<a href="{url}">click here'
      ),
    },
    BLUEVERSE_CREDIT_GENERATE_BY_ADMIN: {
      type: 'BLUEVERSE_CREDIT_GENERATE_BY_ADMIN',
      url: 'billing-accounting/credits-memo',
      msg: compile(
        'A new blueverse credit memo {memoId}  of machine {machineName}'
      ),
      emailSubject: compile(
        'A new blueverse credit memo {memoId}  of machine {machineName}'
      ),
      emailBody: compile(
        'A new blueverse credit memo {memoId}  of machine {machineName}.<a href="{url}">click here'
      ),
    },
    MACHINE_HEALTH_SENSOR_FAILED: {
      type: 'MACHINE_HEALTH_SENSOR_FAILED',
      url: 'machines/details',
      msg: compile('A machine {machineName} sensor failed'),
      emailSubject: compile('A machine {machineName} failed'),
      emailBody: compile(
        'Hi {userName} a machine {machineName} raise a alarm {alarmName},current status,Weightage:{weightage}, Critical :{critical},Escalate :{escalate}, IsValid:{isValid} .<a href="{url}">click here'
      ),
    },
    NEW_EMPLOYEE_ONBOARDED: {
      type: 'NEW_EMPLOYEE_ONBOARDED',
      url: 'manage-employees/details',
      msg: compile(
        'a new employee {employeeName} of Id {employeeId} from dealer {dealerName}'
      ),
      emailSubject: compile(
        'A new employee {employeeId} {employeeName} onBoard'
      ),
      emailBody: compile(
        'Hi {userName} a new employee {employeeName} of Id {employeeId} from dealer {dealerName} .<a href="{url}">click here'
      ),
    },
    PAYEMENT_FAILED: {
      type: 'PAYEMENT_FAILED',
      url: 'billing-accounting/topup-memo',
      msg: compile(
        'A payment amount {amount} failed  {memoId}  of machine {machineName}'
      ),
      emailSubject: compile(
        'A payment amount {amount} failed  {memoId}  of machine {machineName}'
      ),
      emailBody: compile(
        'A payment amount {amount} failed  {memoId}  of machine {machineName}.<a href="{url}">click here'
      ),
    },
    PAYEMENT_SUCCESS: {
      type: 'PAYEMENT_SUCCESS',
      url: 'billing-accounting/topup-memo',
      msg: compile(
        'A payment amount {amount} success  {memoId}  of machine {machineName} '
      ),
      emailSubject: compile(
        'A payment amount {amount} success  {memoId}  of machine {machineName} '
      ),
      emailBody: compile(
        'A payment amount {amount} success  {memoId}  of machine {machineName} .<a href="{url}">click here'
      ),
    },
    LOW_MACHINE_BALANCE: {
      type: 'LOW_MACHINE_BALANCE',
      url: 'machines/details',
      msg: compile(
        'Machine {machineName} balance is {machineBalance}, below the threshold of 5000'
      ),
      emailSubject: compile(
        'Action Required: Machine {machineName} Balance Alert'
      ),
      emailBody: compile(
        'Hi {userName}, the machine {machineName} you manage has a balance of {machineBalance}, falling below the threshold of 5000. Kindly recharge it promptly to avoid service disruption.<a href="{url}">click here'
      ),
    },
  },
  types: {
    ADVANCE_MEMO: 'ADVANCE_MEMO',
    TOPUP_UP_MEMO: 'TOPU_UP_MEMO',
    TAX_INVOICE_MEMO: 'TAX_INVOICE_MEMO',
    BLUEVERSE_CREDIT_MEMO: 'BLUEVERSE_CREDIT_MEMO',
    MACHINE_DETAIL: 'MACHINE_DETAIL',
    NEW_DEALER_ONBOARDED: 'NEW_DEALER_ONBOARDED',
    SERVICE_REQUEST: 'SERVICE_REQUEST',
    NEW_EMPLOYEE_ONBOARDED: 'NEW_EMPLOYEE_ONBOARDED',
    INVOICE: 'INVOICE',
    LOW_MACHINE_BALANCE: 'LOW_MACHINE_BALANCE',
  },
};

const filterKeyType = {
  ADMIN_BILLING: [
    'ADVANCE_MEMO_GENERATE',
    'TOPU_UP_GENERATE',
    'TAX_INVOICE_GENERATE',
    'BLUEVERSE_CREDIT_CARRYFORWARD',
  ],
  DEALER_BILLING: [
    'ADVANCE_MEMO_GENERATE_BY_ADMIN',
    'ADVANCE_MEMO_PAYMENT_SUCCESS',
    'ADVANCE_MEMO_PAYMENT_FAILED',
    'TOP_UP_GENERATE_BY_ADMIN',
    'TAX_INVOICE_GENERATE_BY_ADMIN',
    'BLUEVERSE_CREDIT_GENERATE_BY_ADMIN',
    'PAYEMENT_FAILED',
    'PAYEMENT_SUCCESS',
  ],
};

export { notificationConstant, filterKeyType };
