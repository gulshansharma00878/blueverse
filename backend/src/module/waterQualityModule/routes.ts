import { validate } from 'express-validation';
import { verifyClient } from '../../services/common/requestResponseHandler';
import { validateAddWaterQuality } from './validators/waterQuality.chain';
import { waterQualityPolicy } from './policies/waterQuality.policy';
import { waterQualityController } from './controllers/waterQuality.controller';

class WaterQualitRoutes {
  constructor(private waterQualityRouter: any) {
    this.waterQualityRouter = waterQualityRouter;
    this.registerRoutes();
  }
  registerRoutes() {
    // API  to add list of water quality
    this.waterQualityRouter.post(
      '/add',
      verifyClient.bind(verifyClient),
      validate(validateAddWaterQuality, {}, {}),
      waterQualityPolicy.validateNewWaterQuality,
      waterQualityController.addWaterQualityReport
    );
    // API to get water quality report detail
    this.waterQualityRouter.get(
      '/detail/:waterQualityId',
      verifyClient.bind(verifyClient),
      waterQualityController.getWaterQualityReportDetails
    );

    // API to update water quality report detail
    this.waterQualityRouter.put(
      '/detail/:waterQualityId',
      verifyClient.bind(verifyClient),
      waterQualityPolicy.validateUpdateWaterQuality,
      waterQualityController.updateWaterQualityReportDetails
    );
    // API to get resport of water quality
    this.waterQualityRouter.get(
      '/report',
      verifyClient.bind(verifyClient),
      waterQualityPolicy.validateWaterQualityParams,
      waterQualityController.getWaterQualityReport
    );
    // API to get resport of water quality
    this.waterQualityRouter.get(
      '/report/exportCSV/',
      verifyClient.bind(verifyClient),
      waterQualityPolicy.validateWaterQualityParams,
      waterQualityController.exportWaterQualityReport
    );

    // API to list os water qualit with last wash details
    this.waterQualityRouter.get(
      '/list/washDetails/',
      verifyClient.bind(verifyClient),
      waterQualityPolicy.validateWaterQualityParams,
      waterQualityController.getWaterQualityListWithLastWash
    );

    // API to machine last water quality details
    this.waterQualityRouter.get(
      '/lastDetails/:machineId',
      verifyClient.bind(verifyClient),
      waterQualityController.getWaterQualitylastDetails
    );

    // API to get water quality report detail
    this.waterQualityRouter.delete(
      '/:waterQualityId',
      verifyClient.bind(verifyClient),
      waterQualityController.deleteWaterQualityReportDetails
    );
  }
}
const waterQualityRoutes = (hazardousWasteRouter: any) => {
  return new WaterQualitRoutes(hazardousWasteRouter);
};

export = {
  WaterQualitRoutes: WaterQualitRoutes,
  waterQualityRoutes: waterQualityRoutes,
};
