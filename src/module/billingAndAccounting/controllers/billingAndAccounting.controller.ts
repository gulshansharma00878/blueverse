import e, { NextFunction } from 'express';
import { config } from '../../../config/config';
import { Request, Response } from 'ts-express-decorators';
import { MachineMemo } from '../../../models/Machine/MachineMemo';
import {
  paginatorParamFormat,
  paginatorService,
} from '../../../services/commonService';
import { Op } from 'sequelize';
import moment from 'moment';
import * as utility from '../../../common/utility';
import { parse, Parser } from 'json2csv';
import { validate as isValidUUID } from 'uuid';
import { Outlet } from '../../../models/outlet';
import { templateConstants } from '../../../common/templateConstants';
import { OutletMachine } from '../../../models/outlet_machine';
import { Machine } from '../../../models/Machine/Machine';
import { State } from '../../../models/state';
import { City } from '../../../models/city';
import { PaymentTransaction } from '../../../models/payment_transactions';
import { Region } from '../../../models/region';
import { User } from '../../../models/User/user';
import { OEM } from '../../../models/oem';
import { billingAndAccountingService } from '../services/billingAndAccounting.service';
import upload from '../../../services/common/awsService/uploadService';
import db from '../../../models/index';
class BillingAndAccountingController {
  async getBillingAndAccountingList(
    req: Request,
    res: any,
    next: NextFunction
  ) {
    try {
      const { offset, limit } = req.query;
      const { _limit, _offset } = paginatorParamFormat(limit, offset);
      const {
        whereCondition,
        _order,
        outletWhereCondition,
        adminIncludeTables,
      } = await billingAndAccountingService.getBillingAccountListQueryFormatter(
        req,
        res
      );
      const memo = await MachineMemo.findAndCountAll({
        where: whereCondition,
        order: _order,
        limit: _limit,
        offset: _offset,
        include: [
          {
            model: Outlet,
            attributes: ['name', 'outletId'],
            where: outletWhereCondition,
            include: adminIncludeTables,
          },
          { model: Machine, attributes: ['name', 'machineGuid'] },
        ],
      });

      res.locals.response = {
        body: {
          data: {
            memoList: memo.rows,
            pagination: paginatorService(
              _limit,
              _offset / _limit + 1,
              memo.count
            ),
          },
        },
        message: templateConstants.LIST_OF('Memo List'),
      };
      next();
    } catch (err) {
      next(err);
    }
  }
  async getBillingAndAccountingDetail(
    req: Request,
    res: any,
    next: NextFunction
  ) {
    try {
      const memo = await MachineMemo.findOne({
        where: { machineMemoId: req.params.machineMemoId },
        include: [
          {
            model: Outlet,
            attributes: ['name', 'outletId', 'address', 'gstNo'],
            include: [
              {
                model: City,
                attributes: ['name'],
                include: [
                  {
                    model: State,
                    attributes: ['name'],
                    include: [
                      {
                        model: Region,
                        attributes: ['name'],
                      },
                    ],
                  },
                ],
              },
            ],
          },
          { model: Machine, attributes: ['name', 'machineGuid'] },
          {
            model: User,
            attributes: ['username'],
          },
          {
            model: PaymentTransaction,
            attributes: ['paymentTransactionId', 'status'],
          },
        ],
      });
      res.locals.response = {
        body: { data: memo },
        message: templateConstants.DETAIL('Memo'),
      };
      next();
    } catch (err) {
      next(err);
    }
  }

  async exportAdminAdvanceMemo(req: Request, res: any, next: NextFunction) {
    try {
      const { role, userId } = res.user;
      const {
        whereCondition,
        _order,
        outletWhereCondition,
        adminIncludeTables,
      } = await billingAndAccountingService.getBillingAccountListQueryFormatter(
        req,
        res
      );
      const memo = await MachineMemo.findAndCountAll({
        where: whereCondition,
        order: _order,
        include: [
          {
            model: Outlet,
            attributes: ['name', 'outletId'],
            where: outletWhereCondition,
            include: adminIncludeTables,
          },
          { model: Machine, attributes: ['name', 'machineGuid'] },
        ],
      });
      let result: any = [];
      let csvFields: string[] = [];
      let i = 1;
      let fileName = config.machineMemoTypeObject.ADVANCE_MEMO;
      if (config.userRolesObject.ADMIN == role) {
        if (
          whereCondition['type'] == config.machineMemoTypeObject.ADVANCE_MEMO
        ) {
          memo.rows.forEach((data) => {
            result.push({
              'Sr.No': i,
              'Memo ID': data.memoId,
              'Service Centre': data.outlet?.name,
              Dealership: data.outlet?.dealer?.username,
              OEM: data.outlet?.dealer?.oem?.name,
              Region: data.outlet?.city?.state?.region?.name,
              State: data.outlet?.city?.state?.name,
              City: data.outlet?.city?.name,
              Machine: data.machine?.name,
              'Date of Memo': moment(data.createdAt)
                .utcOffset('+05:30')
                .format('MM/DD/YYYY hh:mm A'),
              'Due Date': moment(data.dueDate)
                .utcOffset('+05:30')
                .format('MM/DD/YYYY hh:mm A'),
              TotalAmount: data.totalAmount,
              Month: utility.getMonthName(data.month),
              Status: data.status,
            });
            i += 1;
          });
          csvFields = [
            'Sr.No',
            'Memo ID',
            'Service Centre',
            'Dealership',
            'OEM',
            'Region',
            'State',
            'City',
            'Machine',
            'Date of Memo',
            'Due Date',
            'TotalAmount',
            'Month',
            'Status',
          ];
        } else if (
          whereCondition['type'] == config.machineMemoTypeObject.TOPUP_MEMO
        ) {
          memo.rows.forEach((data) => {
            result.push({
              'Sr.No': i,
              'Memo ID': data.memoId,
              Dealership: data.outlet?.dealer?.username,
              'Service Centre': data.outlet?.name,
              OEM: data.outlet?.dealer?.oem?.name,
              Region: data.outlet?.city?.state?.region?.name,
              State: data.outlet?.city?.state?.name,
              City: data.outlet?.city?.name,
              Machine: data.machine?.name,
              'Invoice Date': moment(data.createdAt)
                .utcOffset('+05:30')
                .format('MM/DD/YYYY hh:mm A'),
              'TotalAmount Incl. GST(INR)': data.totalAmount,
              Status: data.status,
            });
            i += 1;
          });
          csvFields = [
            'Sr.No',
            'Memo ID',
            'Dealership',
            'Service Centre',
            'OEM',
            'Region',
            'State',
            'City',
            'Machine',
            'Invoice Date',
            'TotalAmount Incl. GST(INR)',
            'Status',
          ];
          fileName = config.machineMemoTypeObject.TOPUP_MEMO;
        } else if (
          whereCondition['type'] == config.machineMemoTypeObject.TAX_INVOICE
        ) {
          memo.rows.forEach((data) => {
            result.push({
              'Sr.No': i,
              'Invoice ID': data.memoId,
              Dealership: data.outlet?.dealer?.username,
              'Service Centre': data.outlet?.name,
              OEM: data.outlet?.dealer?.oem?.name,
              State: data.outlet?.city?.state?.name,
              City: data.outlet?.city?.name,
              Machine: data.machine?.name,
              Month: utility.getMonthName(data.month),
              'Invoice Date': moment(data.createdAt)
                .utcOffset('+05:30')
                .format('MM/DD/YYYY hh:mm A'),
              'TotalAmount Incl. GST(INR)': data.totalAmount,
            });
            i += 1;
          });
          csvFields = [
            'Sr.No',
            'Invoice ID',
            'Dealership',
            'Service Centre',
            'OEM',
            'State',
            'City',
            'Machine',
            'Month',
            'Invoice Date',
            'TotalAmount Incl. GST(INR)',
          ];
          fileName = config.machineMemoTypeObject.TAX_INVOICE;
        } else if (
          whereCondition['type'] ==
          config.machineMemoTypeObject.BLUEVERSE_CREDIT
        ) {
          memo.rows.forEach((data) => {
            result.push({
              'Sr.No': i,
              'Memo ID': data.memoId,
              Dealership: data.outlet?.dealer?.username,
              'Service Centre': data.outlet?.name,
              OEM: data.outlet?.dealer?.oem?.name,
              Region: data.outlet?.city?.state?.region?.name,
              State: data.outlet?.city?.state?.name,
              City: data.outlet?.city?.name,
              Machine: data.machine?.name,
              Month: utility.getMonthName(data.month),
              'Invoice Date': moment(data.createdAt)
                .utcOffset('+05:30')
                .format('MM/DD/YYYY hh:mm A'),
              TotalAmount: data.totalAmount,
            });
            i += 1;
          });
          csvFields = [
            'Sr.No',
            'Memo ID',
            'Dealership',
            'Service Centre',
            'OEM',
            'Region',
            'State',
            'City',
            'Machine',
            'Month',
            'Invoice Date',
            'TotalAmount',
          ];
          fileName = config.machineMemoTypeObject.BLUEVERSE_CREDIT;
        }
      }
      const csvParser = new Parser({ fields: csvFields });
      const csvData = csvParser.parse(result);
      const uploadLoc = await upload.uploadFile(csvData, fileName);
      console.log(uploadLoc, "loook");
      res.locals.response = {
        body: {
          data: {
            records: uploadLoc,
          },
        }, 
        message: templateConstants.EXPORTED_SUCCESSFULLY(fileName),
      };
      next();
    } catch (err) {
      next(err);
    }
  }

  async exportDealerAdvanceMemo(req: Request, res: any, next: NextFunction) {
    try {
      const { role, userId } = res.user;
      const {
        whereCondition,
        _order,
        outletWhereCondition,
        adminIncludeTables,
      } = await billingAndAccountingService.getBillingAccountListQueryFormatter(
        req,
        res
      );
      const memo = await MachineMemo.findAndCountAll({
        where: whereCondition,
        order: _order,
        include: [
          {
            model: Outlet,
            attributes: ['name', 'outletId'],
            where: outletWhereCondition,
            include: adminIncludeTables,
          },
          { model: Machine, attributes: ['name', 'machineGuid'] },
        ],
      });
      let result: any = [];
      let csvFields: string[] = [];
      let fileName = config.machineMemoTypeObject.ADVANCE_MEMO;
      let i = 1;
      if (config.userRolesObject.DEALER == role) {
        if (
          whereCondition['type'] == config.machineMemoTypeObject.ADVANCE_MEMO
        ) {
          memo.rows.forEach((data) => {
            result.push({
              'Sr.No': i,
              'Memo ID': data.memoId,
              'Service Centre': data.outlet?.name,
              Machine: data.machine?.name,
              'Date of Memo': moment(data.createdAt)
                .utcOffset('+05:30')
                .format('MM/DD/YYYY hh:mm A'),
              'Due Date': moment(data.dueDate)
                .utcOffset('+05:30')
                .format('MM/DD/YYYY hh:mm A'),
              TotalAmount: data.totalAmount,
              Month: utility.getMonthName(data.month),
              Status: data.status,
            });
            i += 1;
          });
          csvFields = [
            'Sr.No',
            'Memo ID',
            'Service Centre',
            'Machine',
            'Date of Memo',
            'Due Date',
            'TotalAmount',
            'Month',
            'Status',
          ];
          fileName = config.machineMemoTypeObject.ADVANCE_MEMO;
        } else if (
          whereCondition['type'] == config.machineMemoTypeObject.TOPUP_MEMO
        ) {
          memo.rows.forEach((data) => {
            result.push({
              'Sr.No': i,
              'Memo ID': data.memoId,
              'Service Centre': data.outlet?.name,
              Machine: data.machine?.name,
              'Invoice Date': moment(data.createdAt)
                .utcOffset('+05:30')
                .format('MM/DD/YYYY hh:mm A'),
              'TotalAmount Incl. GST (INR)': data.totalAmount,
              Status: data.status,
            });
            i += 1;
          });
          csvFields = [
            'Sr.No',
            'Memo ID',
            'Service Centre',
            'Machine',
            'Invoice Date',
            'TotalAmount Incl. GST (INR)',
            'Status',
          ];
          fileName = config.machineMemoTypeObject.TOPUP_MEMO;
        } else if (
          whereCondition['type'] == config.machineMemoTypeObject.TAX_INVOICE
        ) {
          memo.rows.forEach((data) => {
            result.push({
              'Sr.No': i,
              'Invoice ID': data.memoId,
              'Service Centre': data.outlet?.name,
              Machine: data.machine?.name,
              'Invoice Date': moment(data.createdAt)
                .utcOffset('+05:30')
                .format('MM/DD/YYYY hh:mm A'),
              Month: utility.getMonthName(data.month),
              'TotalAmount Incl. GST (INR)': data.totalAmount,
            });
            i += 1;
          });
          csvFields = [
            'Sr.No',
            'Invoice ID',
            'Service Centre',
            'Machine',
            'Invoice Date',
            'Month',
            'TotalAmount Incl. GST (INR)',
          ];
          fileName = config.machineMemoTypeObject.TAX_INVOICE;
        } else if (
          whereCondition['type'] ==
          config.machineMemoTypeObject.BLUEVERSE_CREDIT
        ) {
          memo.rows.forEach((data) => {
            result.push({
              'Sr.No': i,
              'Memo ID': data.memoId,
              'Service Centre': data.outlet?.name,
              Machine: data.machine?.name,
              'Invoice Date': moment(data.createdAt)
                .utcOffset('+05:30')
                .format('MM/DD/YYYY hh:mm A'),
              Month: utility.getMonthName(data.month),
              TotalAmount: data.totalAmount,
            });
            i += 1;
          });
          csvFields = [
            'Sr.No',
            'Memo ID',
            'Service Centre',
            'Machine',
            'Invoice Date',
            'Month',
            'TotalAmount',
          ];
          fileName = config.machineMemoTypeObject.BLUEVERSE_CREDIT;
        }
      }
      const csvParser = new Parser({ fields: csvFields });
      const csvData = csvParser.parse(result);
      const uploadLoc = await upload.uploadFile(csvData, fileName);     
     
      res.locals.response = {
        body: {
          data: {
            records: uploadLoc,
          },
        },
        message: templateConstants.EXPORTED_SUCCESSFULLY(fileName),
      };
      next();
    } catch (err) {
      next(err);
    }
  }

  async getAmountDetails(req: Request, res: any, next: NextFunction) {
    try {
      const { startDate, endDate }: any = req.query;
      let whereCondition: any = {
        type: config.machineMemoTypeObject.ADVANCE_MEMO,
        status: {
          [Op.ne]: config.machineMemoStatusObject.PAID,
        },
      };
      if (startDate && endDate) {
        if (moment(startDate).isValid() && moment(endDate).isValid()) {
          whereCondition['createdAt'] = {
            [Op.between]: [
              moment(startDate).startOf('day').toISOString(),
              moment(endDate).endOf('day').toISOString(),
            ],
          };
        }
      }

      const totalAmountDue = await MachineMemo.findOne({
        attributes: [
          [
            db.sequelize.fn('SUM', db.sequelize.col('total_amount')),
            'totalAmountDue',
          ],
        ],
        where: whereCondition,
      });

      whereCondition['status'] = config.machineMemoStatusObject.PAID;
      const totalAmountDueReceived = await MachineMemo.findOne({
        attributes: [
          [
            db.sequelize.fn('SUM', db.sequelize.col('total_amount')),
            'totalAmountDueReceived',
          ],
        ],
        where: whereCondition,
      });
      const totalAmount = {
        totalAmountDue,
        totalAmountDueReceived,
      };
      res.locals.response = {
        body: { data: totalAmount },
        message: templateConstants.DETAIL('Advance memo amounts'),
      };
      next();
    } catch (err) {
      next(err);
    }
  }
}
const billingAndAccountingController = new BillingAndAccountingController();
export { billingAndAccountingController };
