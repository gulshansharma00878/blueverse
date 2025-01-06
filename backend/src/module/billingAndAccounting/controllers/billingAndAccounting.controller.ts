import e, { NextFunction } from 'express';
import createError from 'http-errors';

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
import { Transactions } from '../../../models/transactions';
import { compile, generateAndUploadMemoPdf } from '../../../services/htmlToPdf';
import { notificationConstant } from '../../../common/notificationConstants';
import { deleteFile, isNullOrUndefined } from '../../../common/utility';
// import {} from "../../../views/"
import {
  // ccAvenEncryptData,
  // ccAvenDecryptData,
  // backendEncrytpion,
  // decryotData,
  ccEncryptData,
  ccDecryptData,
} from '../../../services/common/ccAvenue/ccAvenue';
import * as crypto from 'crypto';
import qs from 'qs';
import axios from 'axios';
import path from 'path';
import fs from 'fs-extra';

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
      const memos = await MachineMemo.findAndCountAll({
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
          {
            model: Machine,
            attributes: ['name', 'machineGuid'],
            include: [
              {
                model: OutletMachine,
                attributes: ['isCommencementDone', 'invoiceDate'],
              },
            ],
          },
        ],
      });
      // update advance memo amounts
      memos.rows.forEach((memo: any) => {
        const washCount =
          billingAndAccountingService.getWashesForCommencmentMemo(memo);
        if (washCount > 0) {
          const { updatedTotalAmount } =
            billingAndAccountingService.getCommencmentMemoAmount(
              memo,
              washCount
            );
          if (updatedTotalAmount) {
            memo['totalAmount'] = Number(updatedTotalAmount).toFixed(2);
            memo['minimumWashCommitment'] = Number(washCount).toFixed(2);
          }
        }
      });

      res.locals.response = {
        body: {
          data: {
            memoList: memos.rows,
            pagination: paginatorService(
              _limit,
              _offset / _limit + 1,
              memos.count
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
      const memo =
        await billingAndAccountingService.getBillingAndAccountingDetails(
          req.params.machineMemoId
        );
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
      memo.rows.forEach((memo: any) => {
        const washCount =
          billingAndAccountingService.getWashesForCommencmentMemo(memo);
        if (washCount > 0) {
          const { updatedTotalAmount } =
            billingAndAccountingService.getCommencmentMemoAmount(
              memo,
              washCount
            );
          if (updatedTotalAmount) {
            memo['totalAmount'] = updatedTotalAmount;
            memo['minimumWashCommitment'] = washCount;
          }
        }
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
      memo.rows.forEach((memo: any) => {
        const washCount =
          billingAndAccountingService.getWashesForCommencmentMemo(memo);
        if (washCount > 0) {
          const { updatedTotalAmount } =
            billingAndAccountingService.getCommencmentMemoAmount(
              memo,
              washCount
            );
          if (updatedTotalAmount) {
            memo['totalAmount'] = updatedTotalAmount;
            memo['minimumWashCommitment'] = washCount;
          }
        }
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
      const { startDate, endDate, topUp, blueVerseCredit }: any = req.query;

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
      const totalAmount: any = {
        totalAmountDue,
        totalAmountDueReceived,
      };
      if (!isNullOrUndefined(topUp)) {
        whereCondition['status'] = config.machineMemoStatusObject.PAID;
        whereCondition['type'] = config.machineMemoTypeObject.TOPUP_MEMO;

        const topUpPaidAmount = await MachineMemo.findOne({
          attributes: [
            [
              db.sequelize.fn('SUM', db.sequelize.col('total_amount')),
              'topUpPaidAmount',
            ],
          ],
          where: whereCondition,
        });
        totalAmount['topUpPaidAmount'] = topUpPaidAmount;
      }
      //
      if (!isNullOrUndefined(blueVerseCredit)) {
        delete whereCondition['status'];
        whereCondition['type'] = config.machineMemoTypeObject.BLUEVERSE_CREDIT;

        const blueVerseCredit = await MachineMemo.findOne({
          attributes: [
            [
              db.sequelize.fn('SUM', db.sequelize.col('total_amount')),
              'blueVerseCredit',
            ],
          ],
          where: whereCondition,
        });
        totalAmount['blueVerseCredit'] = blueVerseCredit;
      }
      res.locals.response = {
        body: { data: totalAmount },
        message: templateConstants.DETAIL('Memo amounts'),
      };
      next();
    } catch (err) {
      next(err);
    }
  }

  async getInvoiceAddress(req: Request, res: any, next: NextFunction) {
    try {
      const { machineMemoId } = req.params;
      const formatMemoDetails =
        await billingAndAccountingService.getBillingDetails(machineMemoId);
      const fileDetails = await generateAndUploadMemoPdf(
        notificationConstant.types.INVOICE,
        config.userRolesObject.DEALER,
        formatMemoDetails,
        true
      );
      await deleteFile(fileDetails.file[0].path);

      res.locals.response = {
        body: { data: fileDetails.s3Address },
        message: 'Download successfulyy',
      };
      next();
    } catch (err) {
      next(err);
    }
  }

  // to generate encryption data
  async getEncryptData(req: Request, res: any, next: NextFunction) {
    try {
      const { merchantId, frontAccessCode } = config.ccAvenueDetail;
      const orderId = Date.now();
      let paymentBody: any = {
        merchant_id: config.ccAvenueDetail.merchantId,
        order_id: orderId,
        currency: 'INR',
        amount: 1000,
        redirect_url:
          'https://api.dev.blueverse.foxlabs.in/api/v1/billing/testPayment/successResponse',
        cancel_url:
          'https://api.dev.blueverse.foxlabs.in/api/v1/billing/testPayment/failedResponse',
      };

      const stringify_payload = qs.stringify({
        ...paymentBody,
      });
      console.log(
        '🚀 ~ file: billingAndAccounting.controller.ts:578 ~ BillingAndAccountingController ~ getEncryptData ~ stringify_payload:',
        stringify_payload
      );
      const enc = ccEncryptData(
        stringify_payload,
        config.ccAvenueDetail.frontWorkingKey
      );
      let form =
        '<form id="nonseamless" method="post" name="redirect" action="https://test.ccavenue.com/transaction/transaction.do?command=initiateTransaction"/> <input type="hidden" id="encRequest" name="encRequest" value="' +
        enc +
        '"><input type="hidden" name="access_code" id="access_code" value="' +
        frontAccessCode +
        '"><script language="javascript">document.redirect.submit();</script></form>';

      res.locals.response = {
        body: {
          data: {
            enc,
            access: frontAccessCode,
            hash: form,
          },
        },
        message: 'cc encryption',
      };
      next();
    } catch (err) {
      next(err);
    }
  }

  // to decrypt the body data
  getDecryptData(req: Request, res: any, next: NextFunction) {
    try {
      const { frontEncResp, backEncResp } = req.body;
      let frontDecryptResult;
      let backDecryptResult;
      if (frontEncResp) {
        frontDecryptResult = ccDecryptData(
          frontEncResp,
          config.ccAvenueDetail.frontWorkingKey
        );
      }
      if (backEncResp) {
        // for backend decryption
        backDecryptResult = ccDecryptData(
          backEncResp,
          config.ccAvenueDetail.backWorkingKey
        );
      }
      res.locals.response = {
        body: {
          data: {
            frontDecryptResult,
            backDecryptResult,
          },
        },
        message: 'cc decryption',
      };
      next();
    } catch (err) {
      next(err);
    }
  }

  // to decrypt the body data
  async getOrderStatus(orderId: any) {
    try {
      const { backAccessCode } = config.ccAvenueDetail;
      let payload = {
        order_no: orderId, // your order_no that you sent to payment gateway
      };
      const stringify_payload = JSON.stringify(payload);
      const enc = ccEncryptData(
        stringify_payload,
        config.ccAvenueDetail.backWorkingKey
      );
      let ccave_payload = {
        command: 'orderStatusTracker',
        enc_request: enc,
        access_code: backAccessCode, // your access code
        request_type: 'JSON',
        response_type: 'JSON',
        version: 1.1,
      };
      let ccave_response: any = {};
      let ccav_base_url =
        'https://apitest.ccavenue.com/apis/servlet/DoWebTrans';
      let params = `enc_request=${ccave_payload.enc_request}&access_code=${ccave_payload.access_code}&command=${ccave_payload.command}&request_type=${ccave_payload.request_type}&response_type=${ccave_payload.response_type}&version=${ccave_payload.version}`;
      let fullUrl = `${ccav_base_url}?${params}`;
      ccave_response = await axios.post(fullUrl, {}, {});

      return ccave_response.data;
    } catch (err) {
      Promise.reject(err);
    }
  }

  // success Response
  async getSuccessResponse(req: Request, res: any, next: NextFunction) {
    try {
      const orderNo = req.body.orderNo;

      const OrderResponse = await billingAndAccountingController.getOrderStatus(
        orderNo
      );
      let backDecryptResult = '';
      if (OrderResponse) {
        let ccavPost: any = qs.parse(OrderResponse);
        if (ccavPost) {
          let encryption = ccavPost.enc_response;
          backDecryptResult = ccDecryptData(
            encryption,
            config.ccAvenueDetail.backWorkingKey
          );
        }
      }
      let jsonData;
      if (backDecryptResult) {
        jsonData = JSON.parse(backDecryptResult);
      }
      res.locals.response = {
        body: {
          data: OrderResponse,
          orderNo,
          backDecryptResult,
          jsonData,
        },
        message: 'cc encryption success',
      };
      next();
    } catch (err) {
      console.log(
        '🚀 ~ file: billingAndAccounting.controller.ts:681 ~ BillingAndAccountingController ~ getSuccessResponse ~ err:',
        err
      );

      next(err);
    }
  }
  // falied Response
  getFailedResponse(req: Request, res: any, next: NextFunction) {
    try {
      console.log(
        '🚀 ~ file: billingAndAccounting.controller.ts:677 ~ BillingAndAccountingController ~ getFailedResponse ~ req.body:',
        req.body
      );
      res;
      res.locals.response = {
        body: {
          data: '',
        },
        message: 'cc encryption falied',
      };
      next();
    } catch (err) {
      console.log(
        '🚀 ~ file: billingAndAccounting.controller.ts:678 ~ BillingAndAccountingController ~ getFailedResponse ~ err:',
        err
      );

      next(err);
    }
  }
}
const billingAndAccountingController = new BillingAndAccountingController();
export { billingAndAccountingController };
