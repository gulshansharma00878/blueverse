import { redisService } from './redisService';
import stringConstants from '../../common/stringConstants';
import createError from 'http-errors';

// it is used to generate the key
function keyGeneration(userID: any) {
  return userID + '_' + 'blueverse'.toUpperCase() + '_token';
}

class TokenService {
  // it is used to retrieve a token from redis database
  getToken(userID: any) {
    return new Promise((resolve, reject) => {
      var key = keyGeneration(userID);
      redisService
        .get(key)
        .then((reply: any) => {
          resolve(reply);
        })
        .catch((err: any) => {
          reject(
            createError(401, stringConstants.genericMessage.USER_NOT_AUTHORIZED)
          );
        });
    });
  }

  // it is used to store a token to redis database
  setToken(userID: any, token: string, expiryTime: number) {
    return new Promise((resolve, reject) => {
      var key = keyGeneration(userID);
      redisService
        .setWithExpiry(key, token, expiryTime)
        .then((reply: any) => {
          resolve(reply);
        })
        .catch((err: any) => {
          if (
            err.message === stringConstants.redisServiceMessage.KEY_IS_INVALID
          ) {
            reject(
              createError(
                400,
                stringConstants.tokenServiceMessage.USER_ID_IS_INVALID
              )
            );
          } else if (
            err.message === stringConstants.redisServiceMessage.VALUE_IS_INVALID
          ) {
            reject(
              createError(
                400,
                stringConstants.tokenServiceMessage.TOKEN_IS_INVALID
              )
            );
          } else reject(err);
        });
    });
  }

  // it is used to delete a token from redis database
  deleteToken(userID: any) {
    return new Promise((resolve, reject) => {
      var key = keyGeneration(userID);
      redisService
        .delete(key)
        .then((reply: any) => {
          resolve(reply);
        })
        .catch((err: any) => {
          if (
            err.message ===
            stringConstants.redisServiceMessage.KEY_DOES_NOT_EXIST
          ) {
            reject(
              createError(
                400,
                stringConstants.tokenServiceMessage.USER_ID_DOES_NOT_EXIST
              )
            );
          } else if (
            err.message === stringConstants.redisServiceMessage.KEY_IS_INVALID
          ) {
            reject(
              createError(
                400,
                stringConstants.tokenServiceMessage.USER_ID_IS_INVALID
              )
            );
          } else {
            reject(err);
          }
        });
    });
  }
}

const tokenService = new TokenService();
export { tokenService }; //exporting the token service object
