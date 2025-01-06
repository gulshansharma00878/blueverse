import { validate } from 'express-validation';
import { verifyClient } from '../../services/common/requestResponseHandler';
import { hazardousWasteController } from './controllers/hazardousWaste.controller';
import { hazardousWastePolicy } from './policies/hazardousWaste.policy';
import {
  validateAddWasteCollection,
  validateAddWasteDisposal,
  validateUpdatedWasteDisposal,
  validateUpdateWasteCollection,
} from './validators/hazardousWaste.chain';
class HazardousWasteRoutes {
  constructor(private hazardousWasteRouter: any) {
    this.hazardousWasteRouter = hazardousWasteRouter;
    this.registerRoutes();
  }
  registerRoutes() {
    // API  to get list of waste collections
    this.hazardousWasteRouter.get(
      '/collection/report',
      verifyClient.bind(verifyClient),
      hazardousWastePolicy.validateCollictionAndDisposalListParams,
      hazardousWasteController.getWasteCollectionReport
    );

    // API  to get list of waste collections
    this.hazardousWasteRouter.get(
      '/collection/report/exportCSV',
      verifyClient.bind(verifyClient),
      hazardousWastePolicy.validateCollictionAndDisposalListParams,
      hazardousWasteController.exportWasteCollectionReport
    );
    // API to add waste collection details
    this.hazardousWasteRouter.post(
      '/collection/add',
      verifyClient.bind(verifyClient),
      validate(validateAddWasteCollection, {}, {}),
      hazardousWastePolicy.validateNewWasteCollection,
      hazardousWasteController.addWasteCollection
    );
    // API to get waste collection details
    this.hazardousWasteRouter.get(
      '/collection/details/:wasteCollectionId',
      verifyClient.bind(verifyClient),
      hazardousWasteController.getWasteCollectionDetail
    );

    // API to update waste collection details
    this.hazardousWasteRouter.put(
      '/collection/details/:wasteCollectionId',
      verifyClient.bind(verifyClient),
      validate(validateUpdateWasteCollection, {}, {}),
      hazardousWastePolicy.validateUpdateWasteCollection,
      hazardousWasteController.updateWasteCollectionDetail
    );
    // API to get last waste collection details
    this.hazardousWasteRouter.get(
      '/collection/lastDetails/:machineId',
      verifyClient.bind(verifyClient),
      hazardousWasteController.getLastWasteCollection
    );

    // DISPOSAL API

    // API to get last waste collection details
    this.hazardousWasteRouter.get(
      '/disposal/lastDetails/:machineId',
      verifyClient.bind(verifyClient),
      hazardousWasteController.getLastWasteDisposalDetail
    );

    // API to get list of waste disposal
    this.hazardousWasteRouter.get(
      '/disposal/report',
      verifyClient.bind(verifyClient),
      hazardousWastePolicy.validateCollictionAndDisposalListParams,
      hazardousWasteController.getWasteDisposalReport
    );

    // API to get list of waste disposal
    this.hazardousWasteRouter.get(
      '/disposal/report/exportCSV',
      verifyClient.bind(verifyClient),
      hazardousWastePolicy.validateCollictionAndDisposalListParams,
      hazardousWasteController.exportWasteDisposalReport
    );
    // API to add waste disposal details
    this.hazardousWasteRouter.post(
      '/disposal/add',
      verifyClient.bind(verifyClient),
      validate(validateAddWasteDisposal, {}, {}),
      hazardousWastePolicy.validateNewWasteDisposal,
      hazardousWasteController.addWasteDisposal
    );

    // API to get waste disposal details
    this.hazardousWasteRouter.get(
      '/disposal/details/:wasteDisposalId',
      verifyClient.bind(verifyClient),
      hazardousWasteController.getWasteDisposalDetails
    );

    // API to get waste disposal details
    this.hazardousWasteRouter.put(
      '/disposal/details/:wasteDisposalId',
      verifyClient.bind(verifyClient),
      validate(validateUpdatedWasteDisposal, {}, {}),
      hazardousWastePolicy.validateUpdateWasteDisposal,
      hazardousWasteController.updateWasteDisposalDetails
    );
    //  API for graph of waste collections
    this.hazardousWasteRouter.get(
      '/collectionDisposal/graph',
      verifyClient.bind(verifyClient),
      hazardousWastePolicy.validateWasteCollectionDisposalGraphInput,
      hazardousWasteController.getMonthlyWasteCollectionDisposalDetails
    );

    //  API to get machine current net collected waste weight
    this.hazardousWasteRouter.get(
      '/machineCollectedWaste/:machineId',
      verifyClient.bind(verifyClient),
      hazardousWasteController.getMachineNetCollectedWasteWeight
    );

    // API to delete waste collection details
    this.hazardousWasteRouter.delete(
      '/:wasteCollectionId',
      verifyClient.bind(verifyClient),
      hazardousWasteController.getWasteCollectionDetail
    );
  }
}
const hazardousWasteRoutes = (hazardousWasteRouter: any) => {
  return new HazardousWasteRoutes(hazardousWasteRouter);
};

export = {
  HazardousWasteRoutes: HazardousWasteRoutes,
  hazardousWasteRoutes: hazardousWasteRoutes,
};
