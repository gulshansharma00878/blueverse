import { NextFunction } from 'express';
import { isAdmin } from '../../../services/commonService';
import { City } from '../../../models/city';
import { Form } from '../../../models/Feedback/form';
import { Question } from '../../../models/Feedback/question';
import {
  isBoolean,
  isNullOrUndefined,
  isNumber,
  isValidString,
  randomValueHex,
} from '../../../common/utility';
import { templateConstants } from '../../../common/templateConstants';
import { config } from '../../../config/config';
import { Transactions } from '../../../models/transactions';
import createError from 'http-errors';
import { CONSTANT } from '../constant';
import { TransactionsFeedback } from '../../../models/Feedback/TransactionsFeedback';
import { Machine } from '../../../models/Machine/Machine';
import { QuestionOption } from '../../../models/Feedback/question_option';
import { State } from '../../../models/state';
import { Region } from '../../../models/region';
import { OEM } from '../../../models/oem';
import { FormDealer } from '../../../models/Feedback/FormDealer';
import { User } from '../../../models/User/user';
import { Op } from 'sequelize';

class FeedbackService {
  async store(data: any): Promise<any> {
    const result = await Form.create({ ...data });
    return result;
  }

  async validateCreateFeedbackRequest(req: any, res: any, next: NextFunction) {
    try {
      const { form_name, questions } = req.body;
      if (isNullOrUndefined(form_name)) {
        throw createError(
          400,
          templateConstants.PARAMETER_MISSING('form_name')
        );
      }
      if (isNullOrUndefined(questions) || !questions.length) {
        throw createError(
          400,
          templateConstants.PARAMETER_MISSING('questions')
        );
      }
      for (const question of questions) {
        if (!config.questionType.includes(question.question_type)) {
          throw createError(400, templateConstants.INVALID('question_type'));
        }
        if (isNullOrUndefined(question.is_optional)) {
          throw createError(
            400,
            templateConstants.PARAMETER_MISSING('is_optional')
          );
        }
        if (!isBoolean(question.is_optional)) {
          throw createError(400, templateConstants.INVALID('is_optional'));
        }

        if (!isValidString(question.question_name)) {
          throw createError(400, templateConstants.INVALID('question_name'));
        }
        if (
          question.question_type === config.questionTypeObject.MULTIPLE_CHOICE
        ) {
          await validateRatingQuestion(question);
        } else if (
          question.question_type === config.questionTypeObject.RATING
        ) {
          await validateRatingQuestion(question);
        } else {
          await validateCommentQuestion(question);
        }
      }
      next();
    } catch (err) {
      next(err);
    }
  }

  async validateFormDelete(req: any, res: any, next: NextFunction) {
    try {
      const { formId } = req.params;
      const isExist = await Form.findOne({ where: { formId: formId } });
      if (!isExist) {
        throw createError(404, templateConstants.DOES_NOT_EXIST('Form Id'));
      }
      const chk = await Machine.findOne({ where: { feedbackFormId: formId } });
      if (chk) {
        throw createError(
          409,
          'To delete this form, please ensure that it is not currently mapped with any machines.'
        );
      }
      next();
    } catch (err) {
      next(err);
    }
  }

  async validateAgentAssign(req: any, res: any, next: NextFunction) {
    try {
      const { formId } = req.params;
      const { regionId, stateId, cityId, oemId, dealerIds, machineAgentData } =
        req.body;
      const isExist = await Form.findOne({ where: { formId: formId } });
      if (!isExist) {
        throw createError(404, templateConstants.DOES_NOT_EXIST('Form Id'));
      }
      const regionChk = await Region.findOne({ where: { regionId: regionId } });
      if (!regionChk) {
        throw createError(404, templateConstants.DOES_NOT_EXIST('Region Id'));
      }
      const stateChk = await State.findOne({
        where: { stateId: stateId, regionId: regionId },
      });
      if (!stateChk) {
        throw createError(404, templateConstants.DOES_NOT_EXIST('State Id'));
      }
      const cityChk = await City.findOne({
        where: { cityId: cityId, stateId: stateId },
      });
      if (!cityChk) {
        throw createError(404, templateConstants.DOES_NOT_EXIST('City Id'));
      }

      const oemChk = await OEM.findOne({
        where: { oemId: oemId },
      });
      if (!oemChk) {
        throw createError(404, templateConstants.DOES_NOT_EXIST('OEM Id'));
      }

      if (dealerIds.length === 0) {
        throw createError(
          409,
          templateConstants.PARAMETER_MISSING('Dealer Id')
        );
      }
      const dealerCount = await User.count({
        where: {
          userId: { [Op.in]: dealerIds },
          isActive: true,
          role: config.userRolesObject.DEALER,
          oemId: oemId,
        },
      });
      if (dealerCount !== dealerIds.length) {
        throw createError(409, templateConstants.INVALID('Dealer ID'));
      }

      if (machineAgentData.length === 0) {
        throw createError(
          409,
          templateConstants.PARAMETER_MISSING('Machine and Agent')
        );
      } else {
        const agentIds = [];
        const machineIds = [];
        const agentMap: any = {};
        const machineMap: any = {};
        for (const machineData of machineAgentData) {
          if (machineData.agentId !== '' && machineData.machineId !== '') {
            if (!agentMap[machineData.agentId]) {
              agentIds.push(machineData.agentId);
              agentMap[machineData.agentId] = true;
            }

            if (!machineMap[machineData.machineId]) {
              machineIds.push(machineData.machineId);
              machineMap[machineData.machineId] = true;
            }
          }
        }
        if (machineIds.length === 0) {
          throw createError(
            409,
            templateConstants.PARAMETER_MISSING('Machine and Agent')
          );
        }
        const agentCount = await User.count({
          where: {
            userId: { [Op.in]: agentIds },
            isActive: true,
            role: config.userRolesObject.FEEDBACK_AGENT,
          },
        });
        if (agentIds.length !== agentCount) {
          throw createError(409, templateConstants.INVALID('Agent ID'));
        }

        const machineCount = await Machine.count({
          where: { machineGuid: { [Op.in]: machineIds } },
        });

        if (machineIds.length !== machineCount) {
          throw createError(409, templateConstants.INVALID('Machine ID'));
        }
      }

      res.locals.request = { name: isExist.name };

      next();
    } catch (err) {
      next(err);
    }
  }

  async validateGetCustomerFeedbackForm(
    req: any,
    res: any,
    next: NextFunction
  ) {
    try {
      const { skuNumber } = req.params;
      const isSkuExist: any = await Transactions.findOne({
        where: { SkuNumber: skuNumber },
        attributes: [
          'MachineGuid',
          'QRGenerated',
          'Guid',
          'WaterUsed',
          'WaterWastage',
        ],
        raw: true,
      });
      if (!isSkuExist) {
        throw createError(400, CONSTANT.SKU_NUMBER_DOES_NOT_EXIST);
      }
      if (!isSkuExist.QRGenerated) {
        throw createError(400, CONSTANT.SKU_NUMBER_DOES_NOT_EXIST);
      }
      const isFeedbackCompleted = await TransactionsFeedback.findOne({
        where: { transactionGuid: isSkuExist.Guid },
        raw: true,
      });
      if (isFeedbackCompleted.isCompleted) {
        res.locals.request = {
          certificateId: isFeedbackCompleted.certificate,
          name: isFeedbackCompleted.name,
          phone: isFeedbackCompleted.phone,
          emailId: isFeedbackCompleted.emailId,
          hsrpNumber: isFeedbackCompleted.hsrpNumber,
          manufacturer: isFeedbackCompleted.manufacturer,
          bikeModel: isFeedbackCompleted.bikeModel,
          isProfileCompleted: isFeedbackCompleted.isProfileCompleted,
          washTime: isFeedbackCompleted.washTime,
          waterSaved: isSkuExist.WaterUsed - isSkuExist.WaterWastage,
        };
      } else {
        const machine = await Machine.findOne({
          where: { machineGuid: isSkuExist.MachineGuid },
          raw: true,
        });

        res.locals.request = {
          transactionFeedback: {
            name: isFeedbackCompleted.name,
            createdAt: isFeedbackCompleted.createdAt,
            waterSaved: isSkuExist.WaterUsed - isSkuExist.WaterWastage,
            hsrpNumber: isFeedbackCompleted.hsrpNumber,
            bikeModel: isFeedbackCompleted.bikeModel,
            manufacturer: isFeedbackCompleted.manufacturer,
            skuNumber: isFeedbackCompleted.skuNumber,
            transactionFeedbackId: isFeedbackCompleted.transactionFeedbackId,
            formId: isFeedbackCompleted.formId,
            washType: isFeedbackCompleted.transactionType,
          },
          transaction: isSkuExist,
          machine: machine,
        };
      }
      next();
    } catch (err) {
      next(err);
    }
  }
  async validateSubmitCustomerFeedbackForm(
    req: any,
    res: any,
    next: NextFunction
  ) {
    try {
      const { form_id, question_responses, sku_number } = req.body;
      const dataToSave = [];
      const isTransactionFeedbackExist = await Transactions.findOne({
        where: { SkuNumber: sku_number },
        attributes: ['QRGenerated', 'MachineGuid', 'WaterUsed', 'WaterWastage'],
      });
      if (!isTransactionFeedbackExist) {
        throw createError(400, templateConstants.DOES_NOT_EXIST('sku_number'));
      }

      if (!isTransactionFeedbackExist.QRGenerated) {
        throw createError(400, templateConstants.DOES_NOT_EXIST('sku_number'));
      }
      const isFormExist: any = await Machine.findOne({
        where: { machineGuid: isTransactionFeedbackExist.MachineGuid },
        attributes: ['feedbackFormId', 'name'],
        include: [
          {
            model: Form,
            attributes: ['name', 'formId'],
            include: [
              {
                model: Question,
                as: 'questions',
                attributes: [
                  'questionId',
                  'name',
                  'description',
                  'isOptional',
                  'questionType',
                  'commentQuestionMaxChar',
                  'order',
                ],
                order: [['order', 'ASC']],
                separate: true,
                where: { isDeleted: false },
                include: [
                  {
                    model: QuestionOption,
                    attributes: [
                      'QuestionOptionId',
                      'questionId',
                      'text',
                      'order',
                    ],
                    order: [['order', 'ASC']],
                    separate: true,
                  },
                ],
              },
            ],
          },
        ],
      });

      if (!isFormExist) {
        throw createError(400, templateConstants.INVALID('form_id'));
      }

      if (!isFormExist.dataValues.feedbackForm) {
        throw createError(400, templateConstants.INVALID('form_id'));
      }
      if (isFormExist.dataValues.feedbackForm.dataValues.formId !== form_id) {
        throw createError(400, templateConstants.INVALID('form_id'));
      }

      if (!isFormExist.dataValues.feedbackForm.dataValues.questions) {
        throw createError(400, templateConstants.INVALID('form_id'));
      }
      const questions =
        isFormExist.dataValues.feedbackForm.dataValues.questions;
      const questionMap = new Map();
      let totalRequiredQuestion = 0;
      let requiredQuestionIds: any = {};
      for (const question of questions) {
        if (!questionMap.has(question.questionId)) {
          if (!question.isOptional) {
            totalRequiredQuestion += 1;
            requiredQuestionIds[question.questionId] = question.questionId;
          }
          questionMap.set(question.questionId, {
            questionId: question.questionId,
            questionText: question.name,
            isOptional: question.isOptional,
            questionType: question.questionType,
            commentQuestionMaxChar: question.commentQuestionMaxChar,
            questionOption: question.questionOption
              ? question.questionOption.map((el: any) => el.dataValues)
              : [],
          });
        }
      }
      const transactionFeedback = await TransactionsFeedback.findOne({
        where: { skuNumber: sku_number },
        raw: true,
        attributes: ['transactionFeedbackId', 'isCompleted', 'phone'],
      });
      if (transactionFeedback.isCompleted) {
        throw createError(400, CONSTANT.THIS_SKU_NUMBER_RESPONSE_EXIST);
      }
      var stringHex =
        randomValueHex(4) + '-' + randomValueHex(4) + '-' + randomValueHex(4);
      for (const response of question_responses) {
        let questionOptionId;
        if (requiredQuestionIds[response.question_id]) {
          delete requiredQuestionIds[response.question_id];
        }
        const question = questionMap.get(response.question_id);
        if (!question) {
          throw createError(400, templateConstants.INVALID('question_id'));
        }
        if (
          question.questionType === config.questionTypeObject.MULTIPLE_CHOICE ||
          question.questionType === config.questionTypeObject.RATING
        ) {
          if (question.questionOption.length) {
            let isOptionMatched = false;
            for (const option of question.questionOption) {
              if (option.text === response.response) {
                isOptionMatched = true;
                questionOptionId = option.QuestionOptionId;
              }
            }

            if (!isOptionMatched && response.response) {
              throw createError(
                400,
                CONSTANT.OPTIONAL_QUESTION_RESPONSE_MUST_BE_FROM_OPTIONS
              );
            }
          }
        }
        dataToSave.push({
          transactionFeedbackId: transactionFeedback.transactionFeedbackId,
          questionId: response.question_id,
          questionText: question.questionText,
          questionResponse: response.response,
          questionOptionId: questionOptionId,
        });
      }
      if (Object.keys(requiredQuestionIds).length) {
        throw createError(400, CONSTANT.NOT_OPTIONAL_QUESTIONS_IS_REQUIRED);
      }
      res.locals.request = {
        dataToSave: dataToSave,
        certificate: stringHex,
        formId: form_id,
        transactionFeedbackId: transactionFeedback.transactionFeedbackId,
        phone: transactionFeedback.phone,
      };
      next();
    } catch (err) {
      next(err);
    }
  }
}
async function validateRatingQuestion(question: any) {
  try {
    if (isNullOrUndefined(question.options)) {
      throw createError(400, templateConstants.PARAMETER_MISSING('options'));
    }
    if (!question.options.length) {
      throw createError(400, templateConstants.INVALID('options'));
    }
    let isOrderExist = new Map();
    for (const option of question.options) {
      if (!isValidString(option.option_text)) {
        throw createError(
          400,
          templateConstants.PARAMETER_MISSING('option_text')
        );
      }
      if (isNullOrUndefined(option.order)) {
        throw createError(400, templateConstants.PARAMETER_MISSING('order'));
      }
      if (!isNumber(option.order)) {
        throw createError(400, templateConstants.INVALID('order'));
      }
      if (isOrderExist.has(option.order)) {
        throw createError(400, templateConstants.INVALID('order'));
      }
      isOrderExist.set(option.order, question.order);
    }
    return;
  } catch (err) {
    return Promise.reject(err);
  }
}
async function validateCommentQuestion(question: any) {
  try {
    if (isNullOrUndefined(question.char_limit)) {
      throw createError(400, templateConstants.PARAMETER_MISSING('char_limit'));
    }
    if (!isNumber(question.char_limit)) {
      throw createError(400, templateConstants.INVALID('char_limit'));
    }
    return;
  } catch (err) {
    return Promise.reject(err);
  }
}

const feedbackService = new FeedbackService();
export { feedbackService };
