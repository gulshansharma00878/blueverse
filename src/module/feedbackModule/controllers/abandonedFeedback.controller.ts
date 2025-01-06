import { NextFunction } from 'express';
import { Op, Sequelize } from 'sequelize';
import { FeedbackResponse } from '../../../models/Feedback/feedback_response';
import { Transactions } from '../../../models/transactions';
import { TransactionsFeedback } from '../../../models/Feedback/TransactionsFeedback';
import { paginatorService } from '../../../services/commonService';
import { templateConstants } from '../../../common/templateConstants';
import { WashType } from '../../../models/wash_type';
import { validate as isValidUUID } from 'uuid';
import { config } from '../../../config/config';

class AbandonedFeedbackController {
  async getAbandonedFeedbackList(req: any, res: any, next: NextFunction) {
    try {
      let { offset, limit, sort, skuNumber, washTypeIds } = req.query;
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

      const dayStartTime = new Date();
      dayStartTime.setUTCHours(0, 0, 0, 0);

      let skuWhereCondition: any = {};
      let washTypeWhereCondition = {};
      if (skuNumber) {
        skuWhereCondition['SkuNumber'] = { [Op.iLike]: `%${skuNumber}%` };
      }
      if (washTypeIds) {
        let arr = [];
        for (const id of washTypeIds.split(',')) {
          if (isValidUUID(id)) {
            arr.push(id);
          }
        }
        if (arr.length) {
          skuWhereCondition['WashTypeGuid'] = { [Op.in]: arr };
        } else {
          washTypeWhereCondition = { Name: { [Op.in]: config.washTypeArr } };
        }
      } else {
        washTypeWhereCondition = { Name: { [Op.in]: config.washTypeArr } };
      }
      const FeedbackList = await TransactionsFeedback.findAndCountAll({
        where: { isCompleted: false, createdAt: { [Op.lt]: dayStartTime } },
        limit: _limit,
        offset: _offset,
        order: order,
        include: [
          {
            model: Transactions,
            attributes: ['SkuNumber'],
            where: Object.keys(skuWhereCondition).length
              ? skuWhereCondition
              : null,
            include: [
              {
                model: WashType,
                attributes: ['Name'],
                where: washTypeWhereCondition,
              },
            ],
          },
        ],
      });
      res.locals.response = {
        body: {
          data: {
            feedbackList: FeedbackList.rows,
            pagination: paginatorService(
              _limit,
              _offset / _limit + 1,
              FeedbackList.count
            ),
          },
        },
        message: templateConstants.LIST_OF('Abandoned Feedback List'),
      };
      next();
    } catch (err) {
      next(err);
    }
  }

  async updateCustomerDetails(req: any, res: any, next: NextFunction) {
    try {
      const { email_id, phone, name, manufacturer, hsrp_number, bike_model } =
        req.body;
      const { transactionFeedbackId } = req.params;

      let isProfileCompleted = false;
      if (
        email_id &&
        phone &&
        name &&
        manufacturer &&
        hsrp_number &&
        bike_model
      ) {
        isProfileCompleted = true;
      }

      await TransactionsFeedback.update(
        {
          name: name,
          phone: phone ? phone : null,
          emailId: email_id ? email_id : null,
          hsrpNumber: hsrp_number,
          manufacturer: manufacturer ? manufacturer : null,
          bikeModel: bike_model ? bike_model : null,
          isProfileCompleted: isProfileCompleted,
        },
        { where: { transactionFeedbackId: transactionFeedbackId } }
      );
      res.locals.response = {
        body: {
          data: {
            formId: transactionFeedbackId,
          },
        },
        message: templateConstants.UPDATED_SUCCESSFULLY('Customer Details'),
      };
      next();
    } catch (err) {
      next(err);
    }
  }
}
const abandonedFeedbackController = new AbandonedFeedbackController();
export { abandonedFeedbackController };
