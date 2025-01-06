import compile from 'string-template/compile';

const templateConstants = {
  INVALID_OTP: compile(
    'The {0} you have entered is invalid please enter a valid {0}.'
  ),
  INVALID: compile('Invalid {0}'),
  PARAMETER_MISSING: compile('Parameter {0} is missing'),
  USER_KYC_PENDING: compile('{0} KYC is pending'),
  FORGOT_PASSWORD_EMAIL_SUBJECT: compile('Reset your Password | Blueverse'),
  FORGOT_PASSWORD_EMAIL_BODY: compile(`Hi {userName} ,<br><br>
  We have received a request to reset your account password. If you aren’t the one who made this, you may safely ignore this mail.<br>
  Otherwise, you can use the following code on the app to reset your password:<br>
  <b>{code}</b> <br>
  For any query or assistance, contact us at {contactDetail}.<br><br>
  Thanks,<br>
  Team Blueverse
  `),
  CREATED_SUCCESSFULLY: compile('{0} has been created successfully'),
  ADDED_SUCCESSFULLY: compile('{0} has been added successfully'),
  SEND_SUCCESSFULLY: compile('{0} has been sent successfully'),
  UPLOADED_SUCCESSFULLY: compile('{0} has been uploaded successfully'),
  UPDATED_SUCCESSFULLY: compile('{0} has been updated successfully'),
  DELETED_SUCCESSFULLY: compile('{0} has been deleted successfully'),
  DEACTIVATED_SUCCESSFULLY: compile('{0} deactivated successfully'),
  ACTIVATED_SUCCESSFULLY: compile('{0} activated successfully'),
  EXPORTED_SUCCESSFULLY: compile('{0} exported successfully'),
  LIST_OF: compile('List of {0}'),
  ALREADY_EXIST: compile('{0} already exist'),
  CREATE_USER: compile('A new {0} {1} has been created!'),
  AGENT_CREATE_EMAIL_BODY: compile(`Hi {userName} ,<br>
  Congratulations you are registered successfully on Blueverse as Agent, <br>
  Login Link: <a href="{loginURL}">click here </a> <br>
  Your temporary password is: {password}<br><br>
  Thanks,<br>
  Team Blueverse`),
  AGENT_CREATE_EMAIL_SUBJECT: compile('Registered successfully on Blueverse'),
  EMPLOYEE_CREATE_EMAIL_BODY: compile(`Hi {userName} ,<br>
  Congratulations you are registered successfully on Blueverse as a {userType}, <br>
  Login Link: <a href="{loginURL}">click here </a> <br>
  Your temporary password is: {password}<br><br>
  Thanks,<br>
  Team Blueverse`),
  MANAGER_CREATE_EMAIL_BODY: compile(`Hi {userName} ,<br>
  Congratulations you are registered successfully on Blueverse as {userRole}, <br>
  Login Link: <a href="{loginURL}">click here </a> <br>
  Your temporary password is: {password}<br><br>
  Thanks,<br>
  Team Blueverse`),
  DOES_NOT_EXIST: compile('{0} does not exist'),
  DETAIL: compile('{0} detail fetched successfully'),
  SMS_TEMPLATE: compile(
    'Your OTP is {0} for order. Thanks for Using Blueverse'
  ),
  SIGN_IN_SMS_TEMPLATE: compile(
    'Your OTP is {0}. Thanks for Choosing Blueverse'
  ),
  SUCCESSFULLY: compile('{0} successfully'),
  ROLE_ALREADY_MAPPED: compile('This role {0} is associated with {1} user'),
  REQUIRED_VALUE: compile('{0} is required'),
  EXPORT_FILE_MESSAGE: compile(
    'Export complete! You can now view your {0} data.'
  ),
  COUNT: compile('Count of {0}'),
  MAPPED_TO_USER: compile('{0} successfully mapped to user {1}'),
  ALREADY_MAPPED: compile('{0} already mapped to user'),
  REMOVE_ASSOCIATION: compile(
    'Please remove the {0} from the associated {1} before attempting to delete it.'
  ),
  BOOKING_REFUND_DUE_TO_MERCHANT_CLOSURE: compile(
    "Successfully refunded {0} bookings due to the merchant's closure from ${1} to ${2}."
  ),
};
export { templateConstants };
