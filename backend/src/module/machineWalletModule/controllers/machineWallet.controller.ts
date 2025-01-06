import {
  createResponseObject,
  dataFromRequest,
} from '../../../helpers/basic_helper';
import { templateConstants } from '../../../common/templateConstants';
import constant from '../../../common/stringConstants';
import { machineWalletService } from '../services/machineWallet.service';
import {
  paginatorService,
  paginatorParamFormat,
} from '../../../services/commonService';
import { parse, Parser } from 'json2csv';
import upload from '../../../services/common/awsService/uploadService';
import { config } from '../../../config/config';
import moment from 'moment';
class MachineWalletController {
  async getDealerTransactionHistory(req: any, res: any, next: any) {
    try {
      const user = {
        userId: res.user.parentUserId ? res.user.parentUserId : res.user.userId,
        role: res.user.role,
      };
      let { sort_by, status, filters, search, offset, limit, dealerId } =
        req.body;
      // external dealer Id in case of admins portal
      if (!!dealerId) {
        user.userId = dealerId;
      }
      const { _limit, _offset } = paginatorParamFormat(limit, offset);
      let filterKey: any = {};
      if (filters) {
        filterKey = {
          outletIds: filters.outletIds ? filters.outletIds : [],
          machineIds: filters.machineIds ? filters.machineIds : [],
          transactionType: filters.transactionType
            ? filters.transactionType
            : [],
          sourceType: filters.sourceType ? filters.sourceType : [],
          washTypeId: filters.washTypeId ? filters.washTypeId : [],
          startDate: filters.startDate
            ? new Date(filters.startDate).setDate(
                new Date(filters.startDate).getDate()
              )
            : '',
          endDate: filters.endDate
            ? new Date(filters.endDate).setDate(
                new Date(filters.endDate).getDate() + 1
              )
            : '',
        };
      }
      const body = {
        sort_by,
        filters,
        filterKey,
        search,
        _offset,
        _limit,
      };
      const transactions =
        await machineWalletService.getMachineTransactionHistory(user, body);
      res.locals.response = {
        body: {
          data: {
            transactions: transactions.rows,
            pagination: paginatorService(
              _limit,
              _offset / _limit + 1,
              transactions.count
            ),
          },
        },
        message: templateConstants.LIST_OF('Machine Transaction'),
      };
      next();
    } catch (err) {
      next(err);
    }
  }
  async exportDealerTransactionHistory(req: any, res: any, next: any) {
    try {
      const user = {
        userId: res.user.parentUserId ? res.user.parentUserId : res.user.userId,
        role: res.user.role,
      };
      let {
        sort_by,
        status,
        filters,
        search,
        offset,
        limit,
        messageKey,
        CSVType,
        dealerId,
      } = req.body;
      // external dealer Id in case of admins portal
      if (!!dealerId) {
        user.userId = dealerId;
      }

      let filterKey: any = {};
      if (filters) {
        filterKey = {
          outletIds: filters.outletIds ? filters.outletIds : [],
          machineIds: filters.machineIds ? filters.machineIds : [],
          transactionType: filters.transactionType
            ? filters.transactionType
            : [],
          sourceType: filters.sourceType ? filters.sourceType : [],
          washTypeId: filters.washTypeId ? filters.washTypeId : [],
          startDate: filters.startDate
            ? new Date(filters.startDate).setDate(
                new Date(filters.startDate).getDate()
              )
            : '',
          endDate: filters.endDate
            ? new Date(filters.endDate).setDate(
                new Date(filters.endDate).getDate() + 1
              )
            : '',
        };
      }
      const body = {
        sort_by,
        filters,
        filterKey,
        search,
      };
      const transactions =
        await machineWalletService.getMachineTransactionHistory(user, body);
      const { count, rows }: any = transactions;
      let result: any = [];
      let csvFields: any[] = [];
      let fileName = 'TransactionHistory';
      // if (user.role == constant.USERROLE.DEALER) {
      let i = 0;
      if (CSVType == config.walletCSVType.ONE_MACHINE_TRANSACTION) {
        // For single machine details
        rows.forEach((transaction: any) => {
          let transactionType = config.machineWalletTransactionType.ADDED;
          if (
            transaction.transactionType ==
            config.machineWalletTransactionType.DEBITED
          ) {
            transactionType = 'DEDUCTED';
          }
          if (transaction.sourceType != config.machineWalletSourceType.CREDIT) {
            transaction.sourceType = config.machineWalletSourceType.WALLET;
          }
          result.push({
            'Sr.No': i + 1,
            'Transaction ID': transaction.uniqueId,
            Source: transaction.sourceType,
            'Transaction Type': transactionType,
            SKU: transaction.skuNumber,
            'Date (MM/DD/YYYY hh:mm A)': moment(transaction.realCreatedAt)
              .utcOffset('+05:30')
              .format('MM/DD/YYYY hh:mm A'),
            'Wash Type': transaction.transactions?.washType.Name,
            'Base Amount': transaction.baseAmount,
            'Cgst (INR)': transaction.cgst,
            'Sgst (INR)': transaction.sgst,
            'Total Amount (INR)': (
              Number(transaction.baseAmount) +
              Number(transaction.cgst) +
              Number(transaction.sgst)
            ).toFixed(2),
            'Wallet Balance (INR)': (
              Number(transaction.walletBalance) +
              Number(transaction.topUpBalance)
            ).toFixed(2),
            'Credits Balance': transaction.blueverseCredit,
          });
          i += 1;
        });
        csvFields = [
          'Sr.No',
          'Transaction ID',
          'Source',
          'Transaction Type',
          'SKU',
          'Date (MM/DD/YYYY hh:mm A)',
          'Wash Type',
          'Base Amount',
          'Cgst (INR)',
          'Sgst (INR)',
          'Total Amount (INR)',
          'Wallet Balance (INR)',
          'Credits Balance',
        ];
      } else if (CSVType == config.walletCSVType.WALLET_BALANCE_TRANSACTION) {
        // For single macine wallet details
        rows.forEach((transaction: any) => {
          let transactionType = config.machineWalletTransactionType.ADDED;
          if (
            transaction.transactionType ==
            config.machineWalletTransactionType.DEBITED
          ) {
            transactionType = 'DEDUCTED';
          }
          result.push({
            'Sr.No': i + 1,
            'Transaction ID': transaction.uniqueId,
            'Total Amount (INR)': (
              Number(transaction.baseAmount) +
              Number(transaction.cgst) +
              Number(transaction.sgst)
            ).toFixed(2),
            'Transaction Type': transactionType,
            'Base Amount': transaction.baseAmount,
            'Cgst (INR)': transaction.cgst,
            'Sgst (INR)': transaction.sgst,
            'Date (MM/DD/YYYY hh:mm A)': moment(transaction.realCreatedAt)
              .utcOffset('+05:30')
              .format('MM/DD/YYYY hh:mm A'),
          });
          i += 1;
        });
        csvFields = [
          'Sr.No',
          'Transaction ID',
          'Total Amount (INR)',
          'Transaction Type',
          'Base Amount',
          'Cgst (INR)',
          'Sgst (INR)',
          'Date (MM/DD/YYYY hh:mm A)',
        ];
        messageKey = 'Wallet balance';
        fileName = 'WALLET_BALANCE';
      } else if (
        CSVType == config.walletCSVType.BLUEVERSECREDIT_BALANCE_TRANSACTION
      ) {
        //  // For single macine BLUEVERSECREDIT details
        rows.forEach((transaction: any) => {
          let transactionType = config.machineWalletTransactionType.ADDED;
          if (
            transaction.transactionType ==
            config.machineWalletTransactionType.DEBITED
          ) {
            transactionType = 'DEDUCTED';
          }
          result.push({
            'Sr.No': i + 1,
            'Transaction ID': transaction.uniqueId,
            'Transaction Type': transactionType,
            SKU: transaction.skuNumber,
            'Wash Type': transaction.transactions?.washType.Name,
            'Total Amount (INR)': (
              Number(transaction.baseAmount) +
              Number(transaction.cgst) +
              Number(transaction.sgst)
            ).toFixed(2),
            'Base Amount': transaction.baseAmount,
            'Cgst (INR)': transaction.cgst,
            'Sgst (INR)': transaction.sgst,
            'Credits Balance': transaction.blueverseCredit,
            'Date (MM/DD/YYYY hh:mm A)': moment(transaction.realCreatedAt)
              .utcOffset('+05:30')
              .format('MM/DD/YYYY hh:mm A'),
          });
          i += 1;
        });
        csvFields = [
          'Sr.No',
          'Transaction ID',
          'Transaction Type',
          'SKU',
          'Wash Type',
          'Total Amount (INR)',
          'Base Amount',
          'Cgst (INR)',
          'Sgst (INR)',
          'Credits Balance',
          'Date (MM/DD/YYYY hh:mm A)',
        ];
        messageKey = 'Credit balance';
        fileName = 'CREDIT_BALANCE';
      } else {
        // For all Transaction details
        rows.forEach((transaction: any) => {
          let transactionType = config.machineWalletTransactionType.ADDED;
          if (
            transaction.transactionType ==
            config.machineWalletTransactionType.DEBITED
          ) {
            transactionType = 'DEDUCTED';
          }
          if (transaction.sourceType != config.machineWalletSourceType.CREDIT) {
            transaction.sourceType = config.machineWalletSourceType.WALLET;
          }
          result.push({
            'Sr.No': i + 1,
            'Transaction ID': transaction.uniqueId,
            Source: transaction.sourceType,
            'Transaction Type': transactionType,
            SKU: transaction.skuNumber,
            'Service Centre': transaction.machine?.outlet.name,
            'Wash Type': transaction.transactions?.washType.Name,
            Machine: transaction.machine?.name,
            'Machine Wallet (INR)': (
              Number(transaction.walletBalance) +
              Number(transaction.topUpBalance)
            ).toFixed(2),
            'Base Amount': transaction.baseAmount,
            'Cgst (INR)': transaction.cgst,
            'Sgst (INR)': transaction.sgst,
            'Total Amount (INR)': (
              Number(transaction.baseAmount) +
              Number(transaction.cgst) +
              Number(transaction.sgst)
            ).toFixed(2),
            'BlueVerse Credit': transaction.blueverseCredit,
            'Date (MM/DD/YYYY hh:mm A)': moment(transaction.realCreatedAt)
              .utcOffset('+05:30')
              .format('MM/DD/YYYY hh:mm A'),
          });
          i += 1;
        });
        csvFields = [
          'Sr.No',
          'Transaction ID',
          'Source',
          'Transaction Type',
          'SKU',
          'Service Centre',
          'Wash Type',
          'Machine',
          'Machine Wallet (INR)',
          'Base Amount',
          'Cgst (INR)',
          'Sgst (INR)',
          'Total Amount (INR)',
          'BlueVerse Credit',
          'Date (MM/DD/YYYY hh:mm A)',
        ];
      }
      // }
      const csvParser = new Parser({ fields: csvFields });
      const csvData = csvParser.parse(result);
      const uploadLoc = await upload.uploadFile(csvData, fileName);
      if (!messageKey || messageKey == '') {
        messageKey = 'Transaction history';
      }
      res.locals.response = {
        body: {
          data: {
            transactions: uploadLoc,
          },
        },
        message: templateConstants.EXPORTED_SUCCESSFULLY(messageKey),
      };
      next();
    } catch (err) {
      next(err);
    }
  }
  async getDealerAllMachinebalance(req: any, res: any, next: any) {
    try {
      const user = {
        userId: res.user.parentUserId ? res.user.parentUserId : res.user.userId,
        role: res.user.role,
      };
      let { filters, dealerId } = req.body;
      // external dealer Id in case of admins portal
      if (!!dealerId) {
        user.userId = dealerId;
      }
      let machineIds = [];
      if (filters) {
        machineIds = filters.machineIds ? filters.machineIds : [];
      }
      const balance = await machineWalletService.getDealerMachineBalance(
        user,
        machineIds
      );
      res.locals.response = {
        body: {
          data: {
            transactions: balance,
          },
        },
        message: templateConstants.DETAIL('Machine Balance'),
      };
      next();
    } catch (err) {
      next(err);
    }
  }
}
const machineWalletController = new MachineWalletController();
export { machineWalletController };
