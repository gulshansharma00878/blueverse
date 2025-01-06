import { feedbackService } from '../services/feedback.service';
import {
  createResponseObject,
  dataFromRequest,
} from '../../../helpers/basic_helper';
import { CONSTANT } from '../constant';
import e, { NextFunction } from 'express';
import { QuestionOption } from '../../../models/Feedback/question_option';
import { Question } from '../../../models/Feedback/question';
import { Form } from '../../../models/Feedback/form';
import { templateConstants } from '../../../common/templateConstants';
import { TransactionsFeedback } from '../../../models/Feedback/TransactionsFeedback';
import { Transactions } from '../../../models/transactions';
import { FeedbackResponse } from '../../../models/Feedback/feedback_response';
import { Outlet } from '../../../models/outlet';
import { Op } from 'sequelize';
import { Machine } from '../../../models/Machine/Machine';
import { MachineAgent } from '../../../models/Machine/MachineAgent';
import { FormDealer } from '../../../models/Feedback/FormDealer';
import { Request } from 'ts-express-decorators';
import { paginatorService } from '../../../services/commonService';
import { Region } from '../../../models/region';
import { State } from '../../../models/state';
import { City } from '../../../models/city';
import { OEM } from '../../../models/oem';
import { User } from '../../../models/User/user';
import {
  sendBulkAbandonedFeedbackNotification,
  sendFeedbackFormCertificateNotification,
} from '../../../services/common/whatsAppService';
import { isArray } from 'lodash';
import { Merchant } from '../../../B2C/models/merchant';
import { FormMerchant } from '../../../models/Feedback/FormMerchant';
import { isNullOrUndefined } from '../../../common/utility';

class FeedbackController {
  /**
   * Create Feedback
   *
   * @param req
   * @param res
   *
   * @returns {*}
   */
  store = async (req: any, res: any) => {
    const results = await feedbackService.store(dataFromRequest(req));

    return createResponseObject(
      res,
      CONSTANT.STORE.replace('ENTITY', 'Feedback Forms'),
      results,
      200
    );
  };

  /**
   * Get paginated list of feedbacks
   *
   * @param req
   * @param res
   *
   * @returns {*}
   */
  index = async (req: Request, res: any, next: any) => {
    try {
      let { sort } = req.query;
      const {
        formWhereCondition,
        dealerIdsCondition,
        cityIdsCondition,
        machineIdsCondition,
        stateIdsCondition,
        oemIdsCondition,
        regionIdsCondition,
        merchantIdsCondition,
      } = res.locals.request;

      let order: any = [];
      if (sort) {
        if (sort === 'NEW') {
          order = [['createdAt', 'DESC']];
        }
        if (sort === 'OLD') {
          order = [['createdAt', 'ASC']];
        }
      }

      const result: any = await Form.findAll({
        where: formWhereCondition,
        order: order,
        include: [
          {
            model: Question,
            where: { isDeleted: false },
            attributes: ['name', 'order'],
            required: true,
            order: [['order', 'ASC']],
            separate: true,
          },
          {
            model: Region,
            attributes: ['name'],
            where: Object.keys(regionIdsCondition).length
              ? regionIdsCondition
              : null,
          },
          {
            model: State,
            attributes: ['name'],
            where: Object.keys(stateIdsCondition).length
              ? stateIdsCondition
              : null,
          },
          {
            model: City,
            attributes: ['name'],
            where: Object.keys(cityIdsCondition).length
              ? cityIdsCondition
              : null,
          },
          {
            model: OEM,
            attributes: ['name'],
            where: Object.keys(oemIdsCondition).length ? oemIdsCondition : null,
          },
          {
            model: FormDealer,
            include: [
              {
                model: User,
                attributes: ['username'],
                where: Object.keys(dealerIdsCondition).length
                  ? dealerIdsCondition
                  : null,
              },
            ],
            required: Object.keys(dealerIdsCondition).length ? true : false,
          },
          {
            model: Machine,
            attributes: ['name'],

            where: Object.keys(machineIdsCondition).length
              ? machineIdsCondition
              : null,
          },
          {
            model: FormMerchant,
            include: [
              {
                model: Merchant,
                where: Object.keys(merchantIdsCondition).length
                  ? merchantIdsCondition
                  : null,
              },
            ],
            required: Object.keys(merchantIdsCondition).length ? true : false,
          },
        ],
      });
      for (const data of result) {
        data.dataValues['responsesReceived'] = await TransactionsFeedback.count(
          {
            where: { formId: data.dataValues.formId, isCompleted: true },
          }
        );
      }

      res.locals.response = {
        message: templateConstants.LIST_OF('Feedback'),
        body: {
          data: {
            feedbacks: result,
          },
        },
      };
      next();
    } catch (err) {
      next(err);
    }
  };

  async createFeedbackForm(req: any, res: any, next: NextFunction) {
    try {
      const { form_name, questions }: any = req.body;
      const form = await Form.create({
        name: form_name,
        createdBy: res['user'].userId,
      });
      let index = 0;
      for (const question of questions) {
        const questionRes = await Question.create({
          questionType: question.question_type,
          name: question.question_name,
          isOptional: question.is_optional,
          description: question?.description || null,
          commentQuestionMaxChar: question?.char_limit || null,
          formId: form.formId,
          order: question.order ? question.order : index,
        });
        index += 1;
        for (const option of question.options) {
          await QuestionOption.create({
            questionId: questionRes.questionId,
            order: option.order,
            text: option.option_text,
          });
        }
      }
      res.locals.response = {
        body: {
          data: {
            formId: form.formId,
          },
        },
        message: `A new feedback form "${form_name}" has been added to the system!`,
      };
      next();
    } catch (err) {
      next(err);
    }
  }

  async updateFeedbackForm(req: any, res: any, next: NextFunction) {
    try {
      const { form_name, questions } = req.body;
      const { formId } = req.params;
      //updating form
      const form = await Form.update(
        { name: form_name },
        { where: { formId: formId } }
      );
      //for delete question
      const updatedQuestionIds = [];
      let index = 0;
      for (const question of questions) {
        const questionObj: any = {
          questionType: question.question_type,
          name: question.question_name,
          isOptional: question.is_optional,
          description: question?.description || null,
          commentQuestionMaxChar: question?.char_limit || null,
          formId: formId,
          order: question.order ? question.order : index,
        };
        index += 1;
        if (question.questionId) {
          questionObj.questionId = question.questionId;
        }
        //if id exist update otherwise create
        const [questionRes, created] = await Question.upsert(questionObj);
        updatedQuestionIds.push(questionRes.questionId);
        for (const option of question.options) {
          const optionObj: any = {
            questionId: questionRes.questionId,
            order: option.order,
            text: option.option_text,
          };
          if (option.QuestionOptionId) {
            optionObj.QuestionOptionId = option.QuestionOptionId;
          }
          //if id exist update otherwise create
          await QuestionOption.upsert(optionObj);
        }
      }
      //deleting deleted questions from feedback
      await Question.update(
        { isDeleted: true, deletedAt: new Date() },
        {
          where: {
            questionId: { [Op.notIn]: updatedQuestionIds },
            formId: formId,
          },
        }
      );
      res.locals.response = {
        body: {
          data: {
            formId: formId,
          },
        },
        message: templateConstants.UPDATED_SUCCESSFULLY('Feedback Form'),
      };
      next();
    } catch (err) {
      next(err);
    }
  }

  async deleteFeedbackForm(req: any, res: any, next: NextFunction) {
    try {
      const { formId } = req.params;
      //updating form
      const form = await Form.update(
        { isDeleted: true, DeletedAt: new Date(), deletedBy: res.user.userId },
        { where: { formId: formId } }
      );
      res.locals.response = {
        body: {
          data: {
            formId: formId,
          },
        },
        message: templateConstants.DELETED_SUCCESSFULLY('Feedback Form'),
      };
      next();
    } catch (err) {
      next(err);
    }
  }

  async getCustomerFeedbackForm(req: Request, res: any, next: NextFunction) {
    try {
      const { transactionFeedback, machine, certificateId } =
        res.locals.request;

      if (certificateId) {
        res.locals.response = {
          body: { data: { ...res.locals.request } },
          message: CONSTANT.FEEDBACK_RESPONSE_ALREADY_SUBMITTED,
        };
      } else {
        let feedbackFormId = machine.feedbackFormId;
        if (transactionFeedback.formId) {
          feedbackFormId = transactionFeedback.formId;
        } else {
          // if form id is not updated then updating it
          TransactionsFeedback.update(
            { formId: feedbackFormId },
            {
              where: {
                transactionFeedbackId:
                  transactionFeedback.transactionFeedbackId,
              },
            }
          );
        }
        const form = await Form.findOne({
          where: { formId: feedbackFormId },
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
            {
              model: TransactionsFeedback,
              attributes: ['transactionFeedbackId','vehicleType'],
              include: [
                {
                  model: Transactions,
                  attributes: [
                    'Guid',
                    'WaterUsed',
                    'WaterWastage',
                    'WaterPrice',
                  ],
                },
              ],
            },
          ],
        });
        res.locals.response = {
          body: {
            data: {
              ...transactionFeedback,
              form: form,
            },
          },
          message: CONSTANT.FEEDBACK_FORM_DETAIL,
        };
      }

      next();
    } catch (err) {
      next(err);
    }
  }

  async submitCustomerFeedbackForm(req: Request, res: any, next: NextFunction) {
    try {
      const { dataToSave, formId, certificate, transactionFeedbackId, phone } =
        res.locals.request;
      await Promise.all([
        TransactionsFeedback.update(
          {
            isCompleted: true,
            completedAt: new Date().toISOString(),
            certificate: certificate,
          },
          {
            where: {
              transactionFeedbackId: transactionFeedbackId,
            },
          }
        ),
        FeedbackResponse.bulkCreate(dataToSave),
      ]);
      sendFeedbackFormCertificateNotification([], phone);
      res.locals.response = {
        body: {
          data: {
            certificateId: certificate,
          },
        },
        message: CONSTANT.FEEDBACK_FOR_SUBMITTED_SUCCESSFULLY,
      };
      next();
    } catch (err) {
      next(err);
    }
  }

  async getFeedbackFormById(req: any, res: any, next: NextFunction) {
    try {
      const { formId } = req.params;
      const form = await Form.findOne({
        where: { formId: formId },
        attributes: ['name', 'formId'],
        include: [
          {
            model: Question,
            as: 'questions',
            where: { isDeleted: false },
            attributes: [
              'questionId',
              'name',
              'description',
              'isOptional',
              'questionType',
              'commentQuestionMaxChar',
              'order',
            ],
            separate: true,
            order: [['order', 'ASC']],
            include: [
              {
                model: QuestionOption,
                attributes: ['QuestionOptionId', 'questionId', 'text', 'order'],
                order: [['order', 'ASC']],
                separate: true,
              },
            ],
          },
        ],
      });

      res.locals.response = {
        body: {
          data: {
            form: form,
          },
        },
        message: CONSTANT.FEEDBACK_FORM_DETAIL,
      };
      next();
    } catch (err) {
      next(err);
    }
  }

  async getOutletWithMachineAndAgents(req: any, res: any, next: NextFunction) {
    try {
      const { formId } = req.query;
      const { dealerIds } = res.locals.response;
      const whereOrCondition: any = [
        {
          feedbackFormId: { [Op.eq]: null },
        },
      ];
      if (formId) {
        whereOrCondition.push({ feedbackFormId: formId });
      }
      const outlets = await Outlet.findAll({
        where: { dealerId: { [Op.in]: dealerIds }, status: 1 },
        include: [
          {
            model: Machine,
            attributes: ['name', 'machineGuid'],
            where: {
              [Op.or]: whereOrCondition,
            },
            required: false,
            include: [
              {
                model: MachineAgent,
                attributes: ['agentId'],
                required: false,
              },
            ],
          },
        ],
        order: [['createdAt', 'DESC']],
      });
      res.locals.response = {
        body: {
          data: {
            outlets: outlets,
          },
        },
        message: CONSTANT.OUTLET_MACHINE_AGENT_LIST,
      };
      next();
    } catch (err) {
      next(err);
    }
  }

  async assignAgentFeedbackForm(req: any, res: any, next: NextFunction) {
    try {
      const { formId } = req.params;
      let {
        regionId,
        stateId,
        cityId,
        oemId,
        dealerIds,
        machineAgentData,
        merchantIds,
      } = req.body;
      const { name } = res.locals.request;

      if (isNullOrUndefined(oemId)) {
        oemId = null;
      }

      //removing all old machine mapping with form
      await Machine.update(
        { feedbackFormId: null },
        { where: { feedbackFormId: formId } }
      );
      //updating form
      await Form.update(
        { regionId: regionId, stateId: stateId, cityId: cityId, oemId: oemId },
        { where: { formId: formId } }
      );

      //drop old dealer data
      await FormDealer.destroy({ where: { formId: formId } });

      //drop old dealer data
      await FormMerchant.destroy({ where: { formId: formId } });
      if (merchantIds) {
        const MerchantData = [];
        for (const merchantId of merchantIds) {
          MerchantData.push({ merchantId: merchantId, formId: formId });
        }

        //creating form and dealer map
        await FormMerchant.bulkCreate(MerchantData);
      } else {
        const dealerData = [];
        for (const dealerId of dealerIds) {
          dealerData.push({ dealerId: dealerId, formId: formId });
        }

        //creating form and dealer map
        await FormDealer.bulkCreate(dealerData);
      }

      // mapping machine with form
      const machineIds = [];
      //getting all existed machine agents
      const agentMachineMapping = await MachineAgent.findAll({
        where: { formId: formId },
      });
      //creating a hashed map
      const agentMachineMap: any = {};
      for (const agentMachine of agentMachineMapping) {
        agentMachineMap[agentMachine.agentId + '_' + agentMachine.machineId] =
          agentMachine;
      }
      const machineAgentObj = [];
      for (const machineData of machineAgentData) {
        machineIds.push(machineData.machineId);
        //if data not exist in hashed map then insert into table
        if (
          !agentMachineMap[machineData.agentId + '_' + machineData.machineId]
        ) {
          machineAgentObj.push({
            machineId: machineData.machineId,
            agentId: machineData.agentId,
            formId: formId,
          });
        } else {
          delete agentMachineMap[
            machineData.agentId + '_' + machineData.machineId
          ];
        }
      }
      await Machine.update(
        { feedbackFormId: formId },
        { where: { machineGuid: { [Op.in]: machineIds } } }
      );
      //clearing removed machine agent entry
      for (const agentMachineIds in agentMachineMap) {
        await MachineAgent.destroy({
          where: {
            agentId: agentMachineMap[agentMachineIds].agentId,
            machineId: agentMachineMap[agentMachineIds].machineId,
            formId: formId,
          },
        });
      }
      await MachineAgent.bulkCreate(machineAgentObj);

      res.locals.response = {
        body: {
          data: {},
        },
        message: CONSTANT.PARAMETERS_ADDED_TO_FORM + name + '!',
      };
      next();
    } catch (err) {
      console.log(err);
      next(err);
    }
  }

  async getFormMappingDetailsByFormID(req: any, res: any, next: NextFunction) {
    try {
      const { formId } = req.params;
      const formData = await Form.findOne({
        where: { isDeleted: false, formId: formId },
        attributes: ['formId', 'cityId', 'stateId', 'regionId', 'oemId'],
        include: [
          {
            model: FormDealer,
            attributes: ['dealerId'],
            required: false,
          },
          {
            model: FormMerchant,
            required: false,
          },
        ],
      });
      res.locals.response = {
        body: {
          data: formData,
        },
        message: templateConstants.LIST_OF('Feedback Form mapping'),
      };
      next();
    } catch (err) {
      next(err);
    }
  }

  async sendAbandonedFormNotification(req: any, res: any, next: NextFunction) {
    try {
      const { skuNumbers } = req.body;
      if (skuNumbers && isArray(skuNumbers) && skuNumbers.length) {
        const transactionFeedbacks = await TransactionsFeedback.findAll({
          where: { skuNumber: { [Op.in]: skuNumbers }, isCompleted: false },
          attributes: ['phone', 'name'],
        });
        const toAndComponents: any = [];
        for (const feedback of transactionFeedbacks) {
          toAndComponents.push({
            to: [feedback.phone],
            components: {},
          });
        }
        if (toAndComponents.length) {
          await sendBulkAbandonedFeedbackNotification(toAndComponents);
          await TransactionsFeedback.update(
            {
              notifiedAt: new Date(),
            },
            {
              where: { skuNumber: { [Op.in]: skuNumbers } },
            }
          );
        }
      }
      res.locals.response = {
        message: templateConstants.SUCCESSFULLY('Message send'),
      };
      next();
    } catch (err) {
      next(err);
    }
  }

  async getMerchantWithMachineAndAgents(
    req: any,
    res: any,
    next: NextFunction
  ) {
    try {
      const { formId } = req.query;
      const { merchantIds } = res.locals.response;
      const whereOrCondition: any = [
        {
          feedbackFormId: { [Op.eq]: null },
        },
      ];
      if (formId) {
        whereOrCondition.push({ feedbackFormId: formId });
      }
      const merchants = await Merchant.findAll({
        where: { merchantId: { [Op.in]: merchantIds }, isActive: true },
        include: [
          {
            model: Machine,
            attributes: ['name', 'machineGuid'],
            where: {
              [Op.or]: whereOrCondition,
            },
            required: false,
            include: [
              {
                model: MachineAgent,
                attributes: ['agentId'],
                required: false,
              },
            ],
          },
        ],
        order: [['createdAt', 'DESC']],
      });
      res.locals.response = {
        body: {
          data: {
            merchants: merchants,
          },
        },
        message: CONSTANT.MERCHANT_MACHINE_AGENT_LIST,
      };
      next();
    } catch (err) {
      next(err);
    }
  }
}

const feedbackController = new FeedbackController();
export { feedbackController };
