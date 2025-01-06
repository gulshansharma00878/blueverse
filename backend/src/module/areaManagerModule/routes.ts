import { verifyClient } from '../../services/common/requestResponseHandler';
import { areaManagerController } from './controllers/areaManager.controller';
import { validateAreaManagerApis } from './policies/areaManager.policies';

class AreaManagerRoutes {
  constructor(private areaManagerRouter: any) {
    this.areaManagerRouter = areaManagerRouter;
    this.registerRoutes();
  }
  registerRoutes() {
    this.areaManagerRouter.get(
      '/list',
      verifyClient.bind(verifyClient),
      areaManagerController.getAreaManagerlist
    );
    this.areaManagerRouter.post(
      '/create',
      verifyClient.bind(verifyClient),
      validateAreaManagerApis.validateRegisterRequest.bind(
        validateAreaManagerApis
      ),
      areaManagerController.addAreaManager
    );
    this.areaManagerRouter.get(
      '/areaManagerDetails/:userId',
      verifyClient.bind(verifyClient),
      validateAreaManagerApis.validateUUID.bind(validateAreaManagerApis),
      areaManagerController.getAreaManagerDetail
    );
    this.areaManagerRouter.put(
      '/updateAreaManager/:userId',
      verifyClient.bind(verifyClient),
      validateAreaManagerApis.validateUpdateAreaManager.bind(
        validateAreaManagerApis
      ),
      areaManagerController.updateAreaManagerDetail
    );
    this.areaManagerRouter.delete(
      '/deleteAreaManager/:userId',
      verifyClient.bind(verifyClient),
      validateAreaManagerApis.validateUUID.bind(validateAreaManagerApis),
      areaManagerController.deleteAreaMangerDetail
    );
  }
}

const areaManagerRoutes = (areaManagerRouter: any) => {
  return new AreaManagerRoutes(areaManagerRouter);
};

export = {
  AreaManagerRoutes: AreaManagerRoutes,
  areaManagerRoutes: areaManagerRoutes,
};
