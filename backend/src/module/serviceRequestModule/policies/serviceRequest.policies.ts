import { templateConstants } from '../../../common/templateConstants';
import { isNullOrUndefined, isValidGuid } from '../../../common/utility';
import { User } from '../../../models/User/user';
import stringConstants from '../../../common/stringConstants';
import createError from 'http-errors';

class ValidateServiceRequestApis {}

const validateServiceRequestApis = new ValidateServiceRequestApis();
export { validateServiceRequestApis };
