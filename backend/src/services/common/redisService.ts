import { Redis } from 'ioredis';
import { config } from '../../config/config';
import stringConstants from '../../common/stringConstants';
import createError from 'http-errors';

// const client: any = new Redis(config.redisConfig.port, config.redisConfig.host)
const client: any = new Redis({
  port: config.redisConfig.port,
  host: config.redisConfig.host,
  username: config.redisConfig.username,
  password: config.redisConfig.password,
});
class RedisService {
  setWithExpiry(key: string, value: string, expiryTime: number) {
    return new Promise((resolve, reject) => {
      this.set(key, value)
        .then((success) => {
          client.expire(key, expiryTime, (err: any) => {
            if (err) {
              reject(err);
            } else {
              resolve(success);
            }
          });
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  set(key: string, value: string) {
    return new Promise((resolve, reject) => {
      if (key && value) {
        client.set(key, value, (err: any, reply: any) => {
          if (err) {
            reject(err);
          } else {
            if (reply === 'OK') resolve(true);
            else {
              reject(
                createError(
                  500,
                  stringConstants.redisServiceMessage.REDIS_ERROR
                )
              );
            }
          }
        });
      } else {
        if (key === undefined || key === null) {
          reject(
            createError(400, stringConstants.redisServiceMessage.KEY_IS_INVALID)
          );
        } else {
          reject(
            createError(
              400,
              stringConstants.redisServiceMessage.VALUE_IS_INVALID
            )
          );
        }
      }
    });
  }

  get(key: string) {
    return new Promise((resolve, reject) => {
      if (key) {
        client.get(key, (err: any, reply: any) => {
          if (err) {
            reject(err);
          } else {
            if (reply === null) {
              reject(
                createError(
                  400,
                  stringConstants.redisServiceMessage.KEY_DOES_NOT_EXIST
                )
              );
            } else resolve(reply);
          }
        });
      } else {
        reject(
          createError(400, stringConstants.redisServiceMessage.KEY_IS_INVALID)
        );
      }
    });
  }

  delete(key: string) {
    return new Promise((resolve, reject) => {
      if (key) {
        client.del(key, (err: any, reply: any) => {
          if (err) {
            reject(err);
          } else {
            if (reply === 0) {
              reject(
                createError(
                  400,
                  stringConstants.redisServiceMessage.KEY_DOES_NOT_EXIST
                )
              );
            } else resolve(true);
          }
        });
      } else {
        reject(
          createError(400, stringConstants.redisServiceMessage.KEY_IS_INVALID)
        );
      }
    });
  }
}
const redisService = new RedisService();
export { redisService };
