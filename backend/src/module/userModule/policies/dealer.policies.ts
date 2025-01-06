import { OEM } from '../../../models/oem';
import createError from 'http-errors';
import { templateConstants } from '../../../common/templateConstants';
import stringConstants from '../../../common/stringConstants';
import { User } from '../../../models/User/user';
import { Op } from 'sequelize';
import { Outlet } from '../../../models/outlet';
import { City } from '../../../models/city';
import { Machine } from '../../../models/Machine/Machine';
import { config } from '../../../config/config';
import { OutletMachine } from '../../../models/outlet_machine';
import { DealerDocument } from '../../../models/User/Dealer/dealer_document';
import { isNullOrUndefined, isValidGuid } from '../../../common/utility';
import { SubRole } from '../../../models/User/SubRole';
import { redisService } from '../../../services/common/redisService';
import { verifyRoleAndApp } from '../../../services/common/requestResponseHandler';
import { paginatorParamFormat } from '../../../services/commonService';
import { washService } from '../../washModule/services/wash.service';

class DealerPolicies {
  async validateCreateDealerRequest(req: any, res: any, next: any) {
    try {
      const { oem_id, username, email, phone, pan_no, outlets, documents } =
        req.body;
      const isOemExist = await OEM.findOne({
        where: { oemId: oem_id, isDeleted: null, status: { [Op.eq]: 1 } },
        raw: true,
      });
      if (!isOemExist) {
        throw createError(400, templateConstants.INVALID('oem_id'));
      }
      const isUserExist = await User.findOne({
        where: {
          [Op.or]: [
            {
              email: email.toLowerCase(),
            },
            {
              phone: phone,
            },
            {
              panNo: pan_no,
            },
          ],
          deletedAt: null,
        },
        attributes: ['email', 'pan_no', 'phone'],
        raw: true,
      });
      if (isUserExist) {
        let errorMessage = null;
        if (isUserExist.phone === phone) {
          errorMessage = stringConstants.genericMessage.PHONE_ALREADY_EXIST;
        } else if (isUserExist.email === email)
          errorMessage = stringConstants.genericMessage.EMAIL_ALREADY_EXIST;
        else if (isUserExist.panNo === pan_no) {
          errorMessage = stringConstants.genericMessage.PAN_ALREADY_EXIST;
        }
        if (!!errorMessage) {
          throw createError(400, errorMessage);
        }
      }
      if (outlets.length) {
        for (const outlet of outlets) {
          const isGSTNoExist = await Outlet.findOne({
            where: { gstNo: outlet.gst_no },
            raw: true,
            attributes: ['outletId'],
          });
          if (isGSTNoExist) {
            throw createError(
              400,
              templateConstants.ALREADY_EXIST('GSTIN number')
            );
          }
          const isCityExist = await City.findOne({
            where: { cityId: outlet.city_id, status: { [Op.eq]: 1 } },
            raw: true,
            attributes: ['cityId'],
          });
          if (!isCityExist) {
            throw createError(400, templateConstants.INVALID('city_id'));
          }
        }
      }

      next();
    } catch (err) {
      next(err);
    }
  }
  async validateAssignMachineToDealerOutletRequest(
    req: any,
    res: any,
    next: any
  ) {
    try {
      const { data } = req.body;
      for (const id of data) {
        const isOutletExist = await Outlet.findOne({
          where: { outletId: id.outlet_id, status: { [Op.eq]: 1 } },
          include: [
            {
              model: User,
              attributes: ['userId', 'username', 'isActive'],
            },
          ],
          attributes: ['outletId'],
        });
        if (!isOutletExist) {
          throw createError(400, templateConstants.INVALID('outlet_id'));
        }
        if (isOutletExist.dealer && !isOutletExist.dealer.isActive) {
          throw createError(
            400,
            'The requested machine assignment cannot be completed as the dealer is currently inactive.'
          );
        }

        const isMachineExist = await Machine.findAll({
          where: {
            machineGuid: { [Op.in]: id.machine_ids },
            isAssigned: false,
            merchantId: null,
          },
        });
        if (isMachineExist.length !== id.machine_ids.length) {
          throw createError(
            400,
            templateConstants.INVALID(
              `one of machine_id or already assigned to other outlet`
            )
          );
        }

        //Remove old machine maping to outlet
        await OutletMachine.destroy({
          where: { machineId: { [Op.in]: id.machine_ids } },
        });
      }
      next();
    } catch (err) {
      next(err);
    }
  }

  async validateDeleteDealerRequest(req: any, res: any, next: any) {
    try {
      let id = null;
      if (res.user.role === config.userRolesObject.ADMIN) {
        if (req.query.dealerId) {
          id = req.query.dealerId;
        } else if (req.params.dealerId) {
          id = req.params.dealerId;
        }
      } else if (res.user.role === config.userRolesObject.DEALER) {
        //if not admin use dealer id
        id = res.user.parentUserId ? res.user.parentUserId : res.user.userId;
      }

      if (id) {
        const dealer = await validateDealerApis.isDealerExist(id);
        res.locals.response = {
          dealer: dealer,
        };
        if (!dealer) {
          throw createError(400, templateConstants.INVALID('dealerId'));
        }
      }
      next();
    } catch (err) {
      next(err);
    }
  }

  async validateGetDealerDetailById(req: any, res: any, next: any) {
    try {
      const dealerId = req.params.dealerId;
      const dealer = await User.findOne({
        where: {
          userId: dealerId,
          deletedAt: null,
          role: config.userRolesObject.DEALER,
        },
        attributes: [
          'userId',
          'subRoleId',
          'parentUserId',
          'role',
          'kycDoneAt',
          'username',
        ],
      });
      if (!dealer) {
        throw createError(400, templateConstants.INVALID('dealerId'));
      }
      res.locals.response = {
        dealer: dealer,
      };
      next();
    } catch (err) {
      next(err);
    }
  }
  async validateUpdateDealerRequest(req: any, res: any, next: any) {
    try {
      const {
        oem_id,
        is_active,
        username,
        email,
        phone,
        pan_no,
        outlets,
        documents,
      } = req.body;
      const { dealerId } = req.params;
      const dealerUpdateData: any = {};
      const dealerDocumentCreateData: any = [];
      const dealerDocumentUpdateData: any = [];
      const dealerDocumentDeleteData: any = [];
      let dealerOutletCreateData: any = [];
      let dealerOutletUpdateDate: any = [];
      const dealer = await validateDealerApis.isDealerExist(dealerId);
      if (!dealer) {
        throw createError(400, templateConstants.INVALID('dealerId'));
      }
      if (!isNullOrUndefined(is_active)) {
        dealerUpdateData['isActive'] = is_active;
      }
      if (username) dealerUpdateData['username'] = username;
      if (pan_no) dealerUpdateData['pan_no'] = pan_no;
      if (oem_id) {
        const isOemExist = await OEM.findOne({
          where: { oemId: oem_id, isDeleted: null, status: { [Op.eq]: 1 } },
        });
        if (!isOemExist) {
          throw createError(400, templateConstants.INVALID('oem_id'));
        }
        dealerUpdateData['oemId'] = oem_id;
      }
      if (phone || email || pan_no) {
        const orCondition = [];
        if (pan_no) {
          orCondition.push({ panNo: pan_no });
          dealerUpdateData['panNo'] = pan_no;
        }
        if (phone) {
          orCondition.push({ phone: phone });
          dealerUpdateData['phone'] = phone;
        }
        if (email) {
          orCondition.push({ email: email });
          dealerUpdateData['email'] = email;
        }
        const dealer = await User.findOne({
          where: {
            userId: { [Op.ne]: dealerId },
            deletedAt: null,
            [Op.or]: orCondition,
          },
          attributes: ['email', 'pan_no', 'phone'],
          raw: true,
        });
        if (dealer) {
          let errorMessage = null;
          if (dealer.phone === phone) {
            errorMessage = stringConstants.genericMessage.PHONE_ALREADY_EXIST;
          } else if (dealer.email === email) {
            errorMessage = stringConstants.genericMessage.EMAIL_ALREADY_EXIST;
          } else if (dealer.panNo === pan_no) {
            errorMessage = stringConstants.genericMessage.PAN_ALREADY_EXIST;
          }
          if (!!errorMessage) {
            throw createError(400, errorMessage);
          }
        }
      }

      if (outlets && outlets.length) {
        for (const outlet of outlets) {
          if (outlet.action === config.actionType.CREATE) {
            const isGSTNoExist = await Outlet.findOne({
              where: {
                gstNo: outlet.gst_no,
              },
              raw: true,
              attributes: ['outletId'],
            });
            if (isGSTNoExist) {
              throw createError(
                400,
                templateConstants.ALREADY_EXIST('GSTIN number')
              );
            }

            const isCityExist = await City.findOne({
              where: { cityId: outlet.city_id, status: { [Op.eq]: 1 } },
              raw: true,
              attributes: ['cityId'],
            });
            if (!isCityExist) {
              throw createError(400, templateConstants.INVALID('city_id'));
            }
            dealerOutletCreateData.push({
              name: outlet.name,
              address: outlet.address,
              cityId: outlet.city_id,
              dealerId: dealerId,
              gstNo: outlet.gst_no,
              latitude: outlet.latitude ? outlet.latitude : '',
              longitude: outlet.longitude ? outlet.longitude : '',
              isTwoWheeler: outlet.isTwoWheeler ? outlet.isTwoWheeler : false,
              isFourWheeler: outlet.isFourWheeler
                ? outlet.isFourWheeler
                : false,
            });
          }
          if (outlet.action === config.actionType.UPDATE) {
            const data: any = {};
            const isOutletExist = await Outlet.findOne({
              where: {
                dealerId: dealerId,
                outletId: outlet.outlet_id,
                status: { [Op.eq]: 1 },
              },
              attributes: ['outletId'],
            });
            if (!isOutletExist) {
              throw createError(
                400,
                templateConstants.INVALID(`outlet_id - ${outlet.outlet_id}`)
              );
            }
            if (outlet.gst_no) {
              const isGSTNoExist = await Outlet.findOne({
                where: {
                  gstNo: outlet.gst_no,
                  outletId: { [Op.ne]: outlet.outlet_id },
                },
                raw: true,
                attributes: ['outletId'],
              });
              if (isGSTNoExist) {
                throw createError(
                  400,
                  templateConstants.ALREADY_EXIST('GSTIN number')
                );
              }
              data['gstNo'] = outlet.gst_no;
            }
            if (outlet.city_id) {
              const isCityExist = await City.findOne({
                where: { cityId: outlet.city_id, status: { [Op.eq]: 1 } },
                raw: true,
                attributes: ['cityId'],
              });
              if (!isCityExist) {
                throw createError(400, templateConstants.INVALID('city_id'));
              }
              data['cityId'] = outlet.city_id;
            }
            if (outlet.name) data['name'] = outlet.name;
            if (outlet.address) data['address'] = outlet.address;
            data['outletId'] = outlet.outlet_id;
            if (outlet.latitude) {
              data['latitude'] = outlet.latitude;
            }
            if (outlet.longitude) {
              data['longitude'] = outlet.longitude;
            }

            data['isTwoWheeler'] = outlet.isTwoWheeler;

            data['isFourWheeler'] = outlet.isFourWheeler;

            dealerOutletUpdateDate.push(data);
          }
        }
      }
      if (documents && documents.length) {
        for (const document of documents) {
          if (document.action === config.actionType.UPDATE) {
            const isDocumentExist = await DealerDocument.findOne({
              where: {
                dealerDocumentId: document.document_id,
                dealerId: dealerId,
                deletedAt: null,
              },
            });
            if (!isDocumentExist) {
              throw createError(400, templateConstants.INVALID('document_id'));
            }
            dealerDocumentUpdateData.push({
              name: document.name,
              url: document.url,
              dealerId: dealerId,
              dealerDocumentId: document.document_id,
            });
          }
          if (document.action === config.actionType.CREATE) {
            dealerDocumentCreateData.push({
              name: document.name,
              url: document.url,
              dealerId: dealerId,
            });
          }
          if (document.action === config.actionType.DELETE) {
            dealerDocumentDeleteData.push(document);
          }
        }
      }

      res.locals.request = {
        dealerData: dealerUpdateData,
        dealerOutletUpdateDate: dealerOutletUpdateDate,
        dealerOutletCreateData: dealerOutletCreateData,
        dealerDocumentCreateData: dealerDocumentCreateData,
        dealerDocumentDeleteData: dealerDocumentDeleteData,
        dealerDocumentUpdateData: dealerDocumentUpdateData,
      };
      next();
    } catch (err) {
      next(err);
    }
  }

  async validateUpdateOutletAssignMachine(req: any, res: any, next: any) {
    try {
      const { data } = req.body;
      const { dealerId } = req.params;
      const dealer = await validateDealerApis.isDealerExist(dealerId);
      if (!dealer) {
        throw createError(400, templateConstants.INVALID('dealerId'));
      }
      for (const outlet of data) {
        const outletId = outlet.outlet_id;
        const isDealerOutletExist = await Outlet.findOne({
          where: {
            dealerId: dealerId,
            outletId: outletId,
            status: { [Op.eq]: 1 },
          },
        });
        if (!isDealerOutletExist) {
          throw createError(400, templateConstants.INVALID('outlet_id'));
        }
        const machines = outlet.machines;
        for (const machine of machines) {
          const isMachineExist = await Machine.findOne({
            where: {
              machineGuid: machine.machineGuid,
              // status: { [Op.eq]: 'ACTIVE' },
              IsDeleted: { [Op.or]: [null, false] },
              merchantId: null,
            },
          });
          if (!isMachineExist) {
            throw createError(400, templateConstants.INVALID('machineGuid'));
          }

          if (machine.action === config.actionType.CREATE) {
            if (!dealer.isActive) {
              throw createError(
                400,
                'The requested machine assignment cannot be completed as the dealer is currently inactive.'
              );
            }
            if (isMachineExist.isAssigned) {
              throw createError(
                400,
                templateConstants.ALREADY_EXIST(
                  `Machine outlet relation ${outletId} - ${machine.machineGuid}`
                )
              );
            }
          }
          if (machine.action === config.actionType.DELETE) {
            const isRelationExist = await OutletMachine.findOne({
              where: {
                outletId: outletId,
                machineId: machine.machineGuid,
                status: { [Op.eq]: 1 },
              },
            });
            if (!isRelationExist) {
              throw createError(
                400,
                templateConstants.DOES_NOT_EXIST(
                  `Machine outlet relation ${outletId} - ${machine.machineGuid}`
                )
              );
            }
          }
        }
      }
      next();
    } catch (err) {
      next(err);
    }
  }

  async validateDealerSubscriptionSettingRequest(
    req: any,
    res: any,
    next: any
  ) {
    try {
      const { policies } = req.body;
      const { dealerId } = req.params;
      const data = [];
      const dealer = await validateDealerApis.isDealerExist(dealerId);
      if (!dealer) {
        throw createError(400, templateConstants.INVALID('dealerId'));
      }

      for (const outlet of policies) {
        const isOutletAssigned = await Outlet.findOne({
          where: {
            dealerId: dealerId,
            outletId: outlet.outlet_id,
            status: { [Op.eq]: 1 },
          },
          attributes: ['outletId'],
        });

        if (!isOutletAssigned) {
          throw createError(
            400,
            templateConstants.INVALID(`outlet_id ${outlet.outlet_id}`)
          );
        }

        for (const machine of outlet.machines) {
          if (machine.action === config.actionType.CREATE) {
          }
          if (machine.action === config.actionType.UPDATE) {
          }
          const isRelationExist = await OutletMachine.findOne({
            where: {
              outletId: outlet.outlet_id,
              machineId: machine.machine_id,
              status: { [Op.eq]: 1 },
            },
          });
          if (!isRelationExist) {
            throw createError(
              400,
              templateConstants.INVALID(
                `outlet_id:${outlet.outlet_id}, machine_id:${machine.machine_id}`
              )
            );
          }
          data.push({
            where: {
              outletId: outlet.outlet_id,
              machineId: machine.machine_id,
            },
            data: {
              securityDeposited: machine.security_deposited,
              billingCycle: machine.billing_cycle,
              invoiceDate: machine.invoice_date,
              minimumWashCommitment: machine.minimum_wash_commitment,
              pricingTerms: machine.pricing_terms,
              taxableAmount: machine.taxable_amount,
              cgst: machine.cgst,
              sgst: machine.sgst,
              total: machine.total,
            },
          });
        }
      }
      res.locals.request = {
        data: data,
        dealershipName: dealer.username,
      };
      next();
    } catch (err) {
      next(err);
    }
  }

  async isDealerExist(dealerId: string) {
    try {
      const dealer = await User.findOne({
        where: {
          userId: dealerId,
          deletedAt: null,
          role: config.userRolesObject.DEALER,
          parentUserId: null,
          subRoleId: null,
        },
        attributes: [
          'userId',
          'subRoleId',
          'parentUserId',
          'role',
          'kycDoneAt',
          'username',
          'isActive',
        ],
      });
      if (dealer) return dealer;
      return null;
    } catch (err) {
      return Promise.reject(err);
    }
  }

  async validateVerifyDealerKycOtpRequest(req: any, _res: any, next: any) {
    try {
      const { email, otp, app } = req.body;
      let error = createError(404, templateConstants.INVALID('app'));
      if (!app) {
        throw error;
      }
      if (
        app !== config.userRolesObject.ADMIN &&
        app !== config.userRolesObject.DEALER
      ) {
        throw error;
      }
      const isDealerExist = await User.findOne({
        where: {
          email: email.toLowerCase(),
          role: config.userRolesObject.DEALER,
          deletedAt: null,
        },
        attributes: [
          'username',
          'userId',
          'isKycDone',
          'role',
          'kycDoneAt',
          'phone',
          'profileImg',
          'subRoleId',
          'parentUserId',
        ],
        raw: true,
      });
      if (!isDealerExist) {
        throw createError(400, templateConstants.INVALID('dealer'));
      }
      if (isDealerExist.isKycDone) {
        throw createError(400, templateConstants.INVALID('dealer'));
      }
      const data = await redisService.get(
        email + `${config.smsService.OTP_VERIFICATION_KEYWORD}`
      );
      if (Number(data) !== Number(otp)) {
        throw createError(400, templateConstants.INVALID('otp'));
      }
      await redisService.delete(
        email + `${config.smsService.OTP_VERIFICATION_KEYWORD}`
      );

      await verifyRoleAndApp(isDealerExist.role, app);
      _res.locals.request = {
        user: isDealerExist,
      };
      next();
    } catch (err) {
      if (
        err.message == stringConstants.redisServiceMessage.KEY_DOES_NOT_EXIST
      ) {
        err.message = stringConstants.genericMessage.INVALID_OTP;
      }
      next(err);
    }
  }

  async sendDealerKycOtpOnPhonePhone(req: any, _res: any, next: any) {
    try {
      const { email, phone } = req.body;
      if (isNullOrUndefined(email) || isNullOrUndefined(phone)) {
        throw createError(
          400,
          templateConstants.PARAMETER_MISSING('email || phone')
        );
      }
      const isDealerExist = await User.findOne({
        where: {
          email: email.toLowerCase(),
          phone: phone,
          deletedAt: null,
          role: config.userRolesObject.DEALER,
        },
      });
      if (!isDealerExist) {
        throw createError(
          400,
          'Verification Failed. Please check the mobile number and try again.'
        );
      }
      next();
    } catch (err) {
      next(err);
    }
  }

  async validateDealerListInput(req: any, res: any, next: any) {
    try {
      let {
        offset,
        limit,
        search,
        sort,
        mapping,
        oemIds,
        dealerIds,
        startDate,
        endDate,
        regionIds,
        revenueStartDate,
        revenueEndDate,
      } = req.query;
      const user = {
        userId: res.user.parentUserId ? res.user.parentUserId : res.user.userId,
        role: res.user.role,
      };
      const oemIdArr: string[] = [];
      const regionIdArr: string[] = [];
      const stateIdArr: string[] = [];
      const cityIdArr: string[] = [];
      const dealerIdArr: string[] = [];
      let showRecords: boolean = true; //key to tell controller to show records or not
      if (!isNullOrUndefined(oemIds)) {
        const _oemIds = oemIds.split(',');
        for (const oemId of _oemIds) {
          if (isValidGuid(oemId)) {
            oemIdArr.push(oemId);
          }
        }
      }

      if (!isNullOrUndefined(dealerIds)) {
        const _dealerIds = dealerIds.split(',');
        for (const dealerId of _dealerIds) {
          if (isValidGuid(dealerId)) {
            dealerIdArr.push(dealerId);
          }
        }
      }
      if (!isNullOrUndefined(regionIds)) {
        const _regionIds = regionIds.split(',');
        for (const regionId of _regionIds) {
          if (isValidGuid(regionId)) {
            regionIdArr.push(regionId);
          }
        }
      }

      // upddate dealerId for dealer
      if (user.role == config.userRolesObject.DEALER) {
        dealerIdArr.push(user.userId);
      } else if (
        user.role == config.userRolesObject.AREA_MANAGER ||
        user.role == config.userRolesObject.OEM
      ) {
        const managerFilters = await washService.getFiltersForManager(
          user.userId
        );
        if (regionIdArr.length == 0) {
          regionIdArr.push(...managerFilters['regionIds']);
        }
        if (stateIdArr.length == 0) {
          stateIdArr.push(...managerFilters['stateIds']);
        }
        if (cityIdArr.length == 0) {
          cityIdArr.push(...managerFilters['cityIds']);
        }
      }
      const { _limit, _offset } = paginatorParamFormat(limit, offset);
      const queryBody = {
        oemIdArr,
        regionIdArr,
        stateIdArr,
        cityIdArr,
        limit: _limit,
        offset: _offset,
        search: search ? search.trim() : null,
        showRecords,
        startDate,
        endDate,
        sort,
        mapping,
        revenueStartDate,
        revenueEndDate,
        dealerIdArr,
      };
      res.locals.request = {
        queryBody: queryBody,
      };
      next();
    } catch (err) {
      next(err);
    }
  }
}
const validateDealerApis = new DealerPolicies();
export { validateDealerApis };
