import { NextFunction } from 'express';
import { FeedbackResponse } from '../../../models/Feedback/feedback_response';
import { Transactions } from '../../../models/transactions';
import { TransactionsFeedback } from '../../../models/Feedback/TransactionsFeedback';
import { paginatorService } from '../../../services/commonService';
import { templateConstants } from '../../../common/templateConstants';
import { WashType } from '../../../models/wash_type';
import { Question } from '../../../models/Feedback/question';
import { QuestionOption } from '../../../models/Feedback/question_option';
import { config } from '../../../config/config';
import createHttpError from 'http-errors';
import { Form } from '../../../models/Feedback/form';
import { Region } from '../../../models/region';
import { State } from '../../../models/state';
import { City } from '../../../models/city';
import { OEM } from '../../../models/oem';
import { Outlet } from '../../../models/outlet';
import { User } from '../../../models/User/user';
import { Machine } from '../../../models/Machine/Machine';
import { Parser, parse } from 'json2csv';
import upload from '../../../services/common/awsService/uploadService';

class FeedbackAnalyticsController {
  async getFeedbackQuestionResponseList(
    req: any,
    res: any,
    next: NextFunction
  ) {
    try {
      const { question } = res.locals.response;
      let { offset, limit, sort } = req.query;
      let _limit = Number(limit);
      let _offset = Number(offset);
      if (!_limit) {
        _limit = 10;
      }
      if (!_offset) {
        _offset = 0;
      } else {
        _offset = (_offset - 1) * _limit;
      }

      let order: any = [];
      if (sort) {
        if (sort === 'NEW') {
          order = [['createdAt', 'DESC']];
        }
        if (sort === 'OLD') {
          order = [['createdAt', 'ASC']];
        }
      }

      const FeedbackAnswerList = await FeedbackResponse.findAndCountAll({
        where: { questionId: question.questionId },
        limit: _limit,
        offset: _offset,
        order: order,
        attributes: ['feedbackResponseId', 'question_response'],
        include: [
          {
            model: TransactionsFeedback,
            attributes: ['name', 'washTime'],
            include: [
              {
                model: Transactions,
                attributes: ['Guid', 'SkuNumber'],
                include: [{ model: WashType, attributes: ['Name'] }],
              },
            ],
          },
        ],
      });
      res.locals.response = {
        body: {
          data: {
            question: question,
            feedbackAnswerList: FeedbackAnswerList.rows,
            pagination: paginatorService(
              _limit,
              _offset / _limit + 1,
              FeedbackAnswerList.count
            ),
          },
        },
        message: templateConstants.LIST_OF('Feedback Answer List'),
      };
      next();
    } catch (err) {
      console.log(err);
      next(err);
    }
  }

  async getFormAnalytics(req: any, res: any, next: NextFunction) {
    try {
      const { formId } = req.params;
      const feedbackResponseCount: any = await TransactionsFeedback.count({
        where: { formId: formId, isCompleted: true },
      });
      let questions: any = await Question.findAll({
        where: { formId: formId },
        include: [
          { model: QuestionOption, attributes: ['QuestionOptionId', 'text'] },
        ],
        order: [['order', 'ASC']],
      });

      if (questions) {
        for (const question of questions) {
          if (
            question.questionType ===
              config.questionTypeObject.MULTIPLE_CHOICE ||
            question.questionType === config.questionTypeObject.RATING
          ) {
            const allQuestionOptions = [];
            for (const questionOption of question.questionOption) {
              const newQuestionOption: any = questionOption.dataValues;
              newQuestionOption.answerCount = await FeedbackResponse.count({
                where: { questionOptionId: newQuestionOption.QuestionOptionId },
                include: [
                  { model: TransactionsFeedback, where: { formId: formId } },
                ],
              });
              allQuestionOptions.push(newQuestionOption);
            }
            question.questionOption = allQuestionOptions;
          } else {
            question.dataValues.questionResponse =
              await FeedbackResponse.findAll({
                where: { questionId: question.questionId },
                limit: 15,
                offset: 0,
                order: [['createdAt', 'DESC']],
                attributes: ['feedbackResponseId', 'question_response'],
                include: [
                  {
                    model: TransactionsFeedback,
                    attributes: ['name'],
                    where: { formId: formId },
                  },
                ],
              });
          }
        }
        res.locals.response = {
          body: {
            data: {
              responseCount: feedbackResponseCount,
              question: questions,
            },
          },
          message: templateConstants.LIST_OF('Feedback Form Analytics'),
        };
      } else {
        throw createHttpError(
          400,
          templateConstants.DOES_NOT_EXIST('Question')
        );
      }
      next();
    } catch (err) {
      next(err);
    }
  }

  async exportFormResponse(req: any, res: any, next: NextFunction) {
    try {
      const { formId } = req.params;
      const feedbackResponse: any = await TransactionsFeedback.findAll({
        where: { formId: formId, isCompleted: true },
        attributes: ['name', 'phone', 'certificate'],
        include: [
          {
            model: Form,
            attributes: ['formId'],
            include: [
              { model: Region, attributes: ['name'] },
              { model: State, attributes: ['name'] },
              { model: City, attributes: ['name'] },
              { model: OEM, attributes: ['name'] },
              {
                model: Question,
                where: { isDeleted: false, deletedAt: null },
                order: [['order', 'ASC']],
                separate: true,
              },
            ],
          },
          {
            model: Transactions,
            attributes: ['Guid', 'SkuNumber'],
            include: [
              {
                model: WashType,
                attributes: ['Name'],
              },
              {
                model: Machine,
                attributes: ['name'],
                include: [
                  {
                    model: Outlet,
                    attributes: ['outletId'],
                    include: [{ model: User, attributes: ['username'] }],
                  },
                ],
              },
              {
                model: TransactionsFeedback,
                attributes: ['hsrpNumber'],
              },
            ],
          },
          {
            model: User,
            attributes: ['username'],
          },
          {
            model: FeedbackResponse,
            attributes: ['questionId', 'questionText', 'questionResponse'],
          },
        ],
      });

      const exportData: any = [];
      let j = 0;
      let FieldQuestion: any = [];
      let formQuestionCount = await Question.count({
        where: { formId: formId, isDeleted: false, deletedAt: null },
      });
      for (let i = 1; i <= formQuestionCount; i++) {
        FieldQuestion.push('Question ' + i);
        FieldQuestion.push('Answer ' + i);
      }
      for (const feedback of feedbackResponse) {
        exportData.push({
          'Wash Type': feedback.transactions.washType.Name,
          Region: feedback.form.region.name,
          State: feedback.form.state.name,
          City: feedback.form.city.name,
          OEM: feedback.form.oem.name,
          Dealership: feedback.transactions.machine.outlet.dealer.username,
          Machine: feedback.transactions.machine.name,
          'SKU Number': feedback.transactions.SkuNumber,
          'HSRP Number': feedback.transactions.transactionFeedback?.hsrpNumber,
          Agent: feedback.agent?.username,
          'Customer Name': feedback.name,
          'Phone Number': feedback.phone,
          'Certificate Number': feedback.certificate,
        });
        let i = 1;
        for (const question of feedback.formResponse) {
          exportData[j]['Question ' + i] = question.questionText;
          exportData[j]['Answer ' + i] = question.questionResponse;
          i++;
        }
        i = 1;
        j++;
      }
      const csvFields = [
        'Wash Type',
        'Region',
        'State',
        'City',
        'OEM',
        'Dealership',
        'Machine',
        'SKU Number',
        'HSRP Number',
        'Agent',
        'Customer Name',
        'Phone Number',
        'Certificate Number',
      ];
      const newCsvFields = csvFields.concat(FieldQuestion);
      const opts = { newCsvFields };
      const csvParser = new Parser({ fields: newCsvFields });
      const csvData = csvParser.parse(exportData);
      const fileName = 'FeedbackResponse.csv';
      const uploadLoc = await upload.uploadFile(csvData, fileName);
      res.locals.response = {
        body: {
          data: {
            records: uploadLoc,
          },
        },
        message: templateConstants.EXPORTED_SUCCESSFULLY('Feedback response'),
      };
      next();
    } catch (err) {
      next(err);
    }
  }
}
const feedbackAnalyticsController = new FeedbackAnalyticsController();
export { feedbackAnalyticsController };
