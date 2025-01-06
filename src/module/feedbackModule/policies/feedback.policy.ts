import { Question } from '../../../models/Feedback/question';
import { dataFromRequest } from '../../../helpers/basic_helper';
import { templateConstants } from '../../../common/templateConstants';
import createError from 'http-errors';
import { Form } from '../../../models/Feedback/form';
import {
  isNullOrUndefined,
  isEmailValid,
  isStringOnlyContainsNumber,
} from '../../../common/utility';
import { TransactionsFeedback } from '../../../models/Feedback/TransactionsFeedback';
import { Op } from 'sequelize';
import { validate as isValidUUID } from 'uuid';
import moment from 'moment';

class FeedbackPolicy {
  /**
   * store
   *
   * @param req
   * @param res
   * @param next
   *
   */
  store = async (req: any, res: any, next: any) => {
    const data = dataFromRequest(req);

    return next();
  };

  /**
   * index
   *
   * @param req
   * @param res
   * @param next
   *
   */
  index = async (req: any, res: any, next: any) => {
    try {
      let {
        fromDate,
        toDate,
        regionIds,
        oemIds,
        stateIds,
        cityIds,
        dealerIds,
        machineIds,
        search,
      } = req.query;
      const formWhereCondition: any = { isDeleted: false };
      if (search) {
        formWhereCondition['name'] = { [Op.iLike]: `%${search}%` };
      }
      if (fromDate && toDate) {
        formWhereCondition['createdAt'] = {
          [Op.between]: [
            moment(fromDate).startOf('day').toISOString(),
            moment(toDate).endOf('day').toISOString(),
          ],
        };
      }
      let machineIdsCondition: any = feedbackPolicy.splitAndValidateGuids(
        'machineGuid',
        machineIds
      );
      let dealerIdsCondition: any = feedbackPolicy.splitAndValidateGuids(
        'userId',
        dealerIds
      );
      let cityIdsCondition: any = feedbackPolicy.splitAndValidateGuids(
        'cityId',
        cityIds
      );
      let stateIdsCondition: any = feedbackPolicy.splitAndValidateGuids(
        'stateId',
        stateIds
      );
      let oemIdsCondition: any = feedbackPolicy.splitAndValidateGuids(
        'oemId',
        oemIds
      );
      let regionIdsCondition: any = feedbackPolicy.splitAndValidateGuids(
        'regionId',
        regionIds
      );

      res.locals.request = {
        formWhereCondition,
        dealerIdsCondition,
        cityIdsCondition,
        machineIdsCondition,
        stateIdsCondition,
        oemIdsCondition,
        regionIdsCondition,
      };
      next();
    } catch (err) {
      next(err);
    }
  };

  validateQuestion = async (req: any, res: any, next: any) => {
    try {
      const { questionId } = req.params;
      const question = await Question.findOne({
        where: { questionId: questionId },
        attributes: ['description', 'questionId', 'order'],
      });
      if (!question) {
        throw createError(400, templateConstants.INVALID('Question ID'));
      }
      res.locals.response = { question: question };
      next();
    } catch (err) {
      next(err);
    }
  };

  validateFormId = async (req: any, res: any, next: any) => {
    try {
      const { formId } = req.params;
      const isValid = await Form.count({
        where: { formId: formId },
      });
      if (isValid === 0) {
        throw createError(400, templateConstants.INVALID('Form ID'));
      }
      next();
    } catch (err) {
      next(err);
    }
  };

  async validateCustomerRequest(req: any, res: any, next: any) {
    try {
      const { email_id, phone, name, hsrp_number } = req.body;
      const { transactionFeedbackId } = req.params;
      let missingParameter;
      if (isNullOrUndefined(name)) {
        missingParameter = 'name';
      }

      if (isNullOrUndefined(hsrp_number)) {
        missingParameter = 'hsrp_number';
      }

      if (missingParameter) {
        throw createError(
          400,
          templateConstants.PARAMETER_MISSING(missingParameter)
        );
      }
      if (email_id && !isEmailValid(email_id)) {
        throw createError(400, templateConstants.INVALID('email_id'));
      }
      if (phone && !isStringOnlyContainsNumber(phone)) {
        throw createError(400, templateConstants.INVALID('phone'));
      }
      const isValid = await TransactionsFeedback.count({
        where: {
          transactionFeedbackId: transactionFeedbackId,
          isCompleted: false,
        },
      });
      if (isValid === 0) {
        throw createError(
          400,
          templateConstants.INVALID('transactionFeedbackId')
        );
      }

      next();
    } catch (err) {
      next(err);
    }
  }
  splitAndValidateGuids(conditionColumn: string, idsString: string) {
    let obj: any = {};
    if (idsString) {
      let arr = [];
      for (const id of idsString.split(',')) {
        if (isValidUUID(id)) {
          arr.push(id);
        }
      }
      if (arr.length) obj[conditionColumn] = { [Op.in]: arr };
    }
    return obj;
  }
}

const feedbackPolicy = new FeedbackPolicy();
export { feedbackPolicy };
