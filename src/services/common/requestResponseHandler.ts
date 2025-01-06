import { templateConstants } from '../../common/templateConstants';
import stringConstants from '../../common/stringConstants';
import * as utility from '../../common/utility';
import { jwtService } from '../user/jwtService';
import { User } from '../../models/User/user';
import { ValidationError } from 'express-validation';
import HTTPErrors from 'http-errors';
import createError from 'http-errors';
import { config } from '../../config/config';
import { logger } from '../logger/logger';

// This middleware handles any route which is not defined in any of the controllers
const handle404 = (req: any, res: any, next: any) => {
  const err = createError(404, templateConstants.INVALID('Link'));
  next(err);
};

// This middleware generates error response
const handleError = (err: any, req: any, res: any, _next: any) => {
  let error = err;
  if (err instanceof HTTPErrors.HttpError) {
    res.status(err.statusCode || 500);
    res.send({
      code: err.statusCode,
      status: err.status,
      error: true,
      message: err.message,
      data: err.name,
    });
  } else if (err instanceof ValidationError) {
    res.status(err.statusCode || 500);
    res.send({
      code: err.statusCode,
      status: err.statusCode,
      error: true,
      message: err.details.body[0].message,
      data: err.details.body,
    });
  } else {
    logger.error(err);
    error = createError(500, stringConstants.genericMessage.SERVER_ERROR);
    res.status(error.statusCode || 500);
    if (
      utility.isNullOrUndefined(res.locals.responseStatus) ||
      res.locals.responseStatus === false
    ) {
      res.send({
        code: error.subCode,
        status: error.subCode,
        error: true,
        message: error.message,
        data: null,
      });
    }
  }
};

// This middleware generates success response
const handleResponse = (req: any, res: any, next: any) => {
  if (res.locals.response) {
    let response = {
      code: 0,
      status: 200,
      message: res.locals.response.message,
      error: false,
    };
    if (res.locals.response.body) {
      response = {
        ...response,
        ...res.locals.response.body,
      };
    }
    res.locals.responseStatus = true; //response sent
    res.send(response);
  } else {
    next();
  }
};

// This middleware verifies client
const verifyClient = async (req: any, res: any, next: any) => {
  try {
    res.locals.requestIdentifier = utility.getTimeInMilliSeconds();
    const auth = req.headers['authorization'];
    if (!auth) {
      throw createError(
        400,
        templateConstants.PARAMETER_MISSING('Header: authorization')
      );
    }
    var tmp = auth.split(' ');
    if (tmp.length !== 2) {
      throw createError(
        400,
        templateConstants.INVALID('Header: authorization')
      );
    }
    // Verify the extracted token
    let decodedToken;
    decodedToken = await jwtService.verifyToken(auth);
    if (!decodedToken) {
      throw createError(
        400,
        stringConstants.genericMessage.USER_NOT_AUTHORIZED
      );
    }

    const user = await User.findOne({
      where: { userId: decodedToken.userId },
      attributes: ['isActive', 'deletedAt', 'parentUserId'],
      raw: true,
    });
    if (!user.isActive) {
      throw createError(
        400,
        stringConstants.authServiceMessage.ACCOUNT_NOT_ACTIVATED
      );
    }
    if (user.deletedAt !== null) {
      throw createError(
        400,
        stringConstants.genericMessage.USER_NOT_AUTHORIZED
      );
    }
    if (
      decodedToken.role === config.userRolesObject.DEALER &&
      user.parentUserId
    ) {
      // check dealer status
      const parentUser = await User.findOne({
        attributes: ['isKycDone', 'isActive', 'deletedAt'],
        where: {
          userId: user.parentUserId,
        },
      });
      if (!parentUser.isActive || parentUser.deletedAt !== null) {
        throw createError(
          401,
          stringConstants.genericMessage.DEALER_NOT_AUTHORIZED
        );
      }
    }
    res.user = decodedToken;
    next();
  } catch (err) {
    next(err);
  }
};

const verifyRoleAndApp = (role: string, app: string) => {
  try {
    let _role = '';
    if (
      role === config.userRolesObject.FEEDBACK_AGENT ||
      config.userRolesObject.ADMIN
    ) {
      _role = config.userRolesObject.ADMIN;
    }
    if (role === config.userRolesObject.DEALER) {
      _role = config.userRolesObject.DEALER;
    }
    if (app !== _role) {
      throw createError(400, stringConstants.genericMessage.ACCESS_DENIED);
    }
    return;
  } catch (err) {
    return Promise.reject(err);
  }
};

export {
  handle404,
  handleError,
  handleResponse,
  verifyClient,
  verifyRoleAndApp,
};
