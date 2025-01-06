import stringConstants from '../../../common/stringConstants'
import { isNullOrUndefined } from '../../../common/utility'
import { Transactions } from '../../../models/transactions'
import createError from 'http-errors'

class ValidateExternalApis {
  async validateCreateTxnRequest(req: any, res: any, next: any) {
    try {
      const { Guid } = req.body
      const txn = await Transactions.findOne({ where: { Guid: Guid } })
      if (!isNullOrUndefined(txn)) {
        throw createError(
          400,
          stringConstants.integrationMessage.DUPLICATE_ENTRY
        )
      }
      next()
    } catch (err) {
      next(err)
    }
  }
}
const validateExternalApis = new ValidateExternalApis()
export { validateExternalApis, ValidateExternalApis }
