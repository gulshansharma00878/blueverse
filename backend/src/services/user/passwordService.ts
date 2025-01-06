import * as bcrypt from 'bcrypt'
import stringContants from '../../common/stringConstants'
import { config } from '../../config/config'
const authConfig = config.authConfig
import createError from 'http-errors'

class PasswordService {
  /**
   * Convert string password into hash password
   * @param {String} password
   * @returns
   */
  async hashPassword(password: string) {
    try {
      return await bcrypt.hash(password, authConfig.hashSaltRounds)
    } catch (err) {
      return Promise.reject(err)
    }
  }
  /**
   * Compare hash password and string password
   * @param {String} password
   * @param {String} hashedPassword
   * @returns
   */
  async verifyPassword(password: string, hashedPassword: string) {
    try {
      const isSame = await bcrypt.compare(password, hashedPassword)
      if (isSame) {
        return stringContants.passwordServiceMessage.PASSWORD_MATCHED
      }
      throw createError(
        401,
        stringContants.passwordServiceMessage.WRONG_PASSWORD
      )
    } catch (err) {
      return Promise.reject(err)
    }
  }
  /**
   * Compare hash password and string password
   * @param {String} password
   * @param {String} hashedPassword
   * @returns
   */
  async comparePassword(password: string, hashedPassword: string) {
    try {
      return await bcrypt.compare(password, hashedPassword)
    } catch (err) {
      return Promise.reject(err)
    }
  }
}
const passwordService = new PasswordService()
export { passwordService }
