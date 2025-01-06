import * as jwt from 'jsonwebtoken';
import { config } from '../../config/config';
import stringConstants from '../../common/stringConstants';
import { tokenService } from '../common/tokenService';
import createError from 'http-errors';

class JWTService {
  /**
   * Genereate token
   * @param {*} payload
   * @returns
   */
  async generateToken(payload: any) {
    try {
      let token = jwt.sign(payload, config.secret, {
        expiresIn: config.authConfig.tokenExpiry,
      });
      return `Bearer ${token}`;
    } catch (err) {
      return Promise.reject(err);
    }
  }
  /**
   * Verify token
   * @param {*} token
   * @returns
   */
  async verifyToken(token: any) {
    try {
      const jwtToken = token.split(' ')[1];
      const decodedToken: any = await jwt.verify(jwtToken, config.secret);
      await tokenService.getToken(decodedToken.userId);
      return decodedToken;
    } catch (err) {
      let error = err;
      if (err instanceof jwt.TokenExpiredError) {
        error = createError(
          401,
          stringConstants.authServiceMessage.TOKEN_EXPIRED
        );
      }
      if (
        err instanceof jwt.NotBeforeError ||
        err instanceof jwt.JsonWebTokenError
      ) {
        error = createError(
          401,
          stringConstants.genericMessage.USER_NOT_AUTHORIZED
        );
      }
      return Promise.reject(error);
    }
  }
}
const jwtService = new JWTService();
export { jwtService };
