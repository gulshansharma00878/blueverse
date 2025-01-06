import { verifyClient } from '../../services/common/requestResponseHandler';
import { oemManagerController } from './controllers/oemManager.controller';
import { validateOEMManagerApis } from './policies/oemManager.policies';

class OEMManagerRoutes {
  constructor(private oemManagerRouter: any) {
    this.oemManagerRouter = oemManagerRouter;
    this.registerRoutes();
  }
  registerRoutes() {
    this.oemManagerRouter.get(
      '/list',
      verifyClient.bind(verifyClient),
      oemManagerController.getOEMMangerlist
    );
    this.oemManagerRouter.post(
      '/create',
      verifyClient.bind(verifyClient),
      validateOEMManagerApis.validateRegisterRequest.bind(
        validateOEMManagerApis
      ),
      oemManagerController.addOEMManger
    );
    this.oemManagerRouter.get(
      '/oemManagerDetails/:userId',
      verifyClient.bind(verifyClient),
      validateOEMManagerApis.validateUUID.bind(validateOEMManagerApis),
      oemManagerController.getOEMManagerDetail
    );
    this.oemManagerRouter.put(
      '/updateOEMManagerDetails/:userId',
      verifyClient.bind(verifyClient),
      validateOEMManagerApis.validateUpdateOEM.bind(validateOEMManagerApis),
      oemManagerController.updateOEMManagerDetail
    );
    this.oemManagerRouter.delete(
      '/deleteOEMManager/:userId',
      verifyClient.bind(verifyClient),
      validateOEMManagerApis.validateUUID.bind(validateOEMManagerApis),
      oemManagerController.deleteOEMManagerDetail
    );
  }
}

const oemManagerRoutes = (oemManagerRouter: any) => {
  return new OEMManagerRoutes(oemManagerRouter);
};

export = {
  AreaManagerRoutes: OEMManagerRoutes,
  oemManagerRoutes: oemManagerRoutes,
};
