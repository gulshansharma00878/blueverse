import stringConstants from '../../../common/stringConstants';
import { templateConstants } from '../../../common/templateConstants';
import { TransactionsFeedback } from '../../../models/Feedback/TransactionsFeedback';
import createError from 'http-errors';

class ValidateWashApis {
  async validateUpdateFeedbackRequest(req: any, res: any, next: any) {
    try {
      const { id } = req.params;
      const isFeedbackExist = await TransactionsFeedback.findByPk(id, {
        attributes: ['transactionFeedbackId', 'isCompleted'],
      });
      if (!isFeedbackExist) {
        throw createError(400, templateConstants.INVALID('id'));
      }
      if (isFeedbackExist.isCompleted) {
        throw createError(
          400,
          stringConstants.washCOntrollerMessage
            .FEEDBACK_NOT_UPDATED_AFTER_COMPLETE
        );
      }

      next();
    } catch (err) {
      next(err);
    }
  }
}
export = new ValidateWashApis();
