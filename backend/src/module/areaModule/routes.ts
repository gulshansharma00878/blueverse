import {
  validateStoreState,
  validateIndexState,
  updateStateValidation,
} from './validators/state.chain';
import {
  validateStoreRegion,
  validateIndexRegion,
} from './validators/region.chain';
import {
  validateStoreCity,
  validateIndexCity,
  updateCityValidation,
} from './validators/city.chain';
import {
  updateOEMValidation,
  validateIndexOem,
  validateStoreOem,
} from './validators/oem.chain';
import { _validate } from '../../helpers/validate';

//policies
import { statePolicy } from './policies/state.policy';
import { regionPolicy } from './policies/region.policy';
import { cityPolicy } from './policies/city.policy';
import { oemPolicy } from './policies/oem.policy';
import { outletPolicy } from './policies/outlet.policy';

//controllers
import { stateController } from './controllers/state.controller';
import { regionController } from './controllers/region.controller';
import { cityController } from './controllers/city.controller';
import { oemController } from './controllers/oem.controller';
import { outletController } from './controllers/outlet.controller';
import {
  authCustomerGuard,
  verifyClient,
} from '../../services/common/requestResponseHandler';
import { validateIndexOutlet } from './validators/outlet.chain';
import { validate } from 'express-validation';

class AreaRoutes {
  constructor(private areaRouter: any) {
    this.areaRouter = areaRouter;
    this.registerRoutes();
  }
  registerRoutes() {
    this.areaRouter.post(
      '/state/create',
      verifyClient.bind(verifyClient),
      _validate(validateStoreState),
      statePolicy.store,
      stateController.store
    );

    this.areaRouter.get(
      '/state/list',
      verifyClient.bind(verifyClient),
      _validate(validateIndexState),
      statePolicy.index,
      stateController.index
    );

    // State list for customer
    this.areaRouter.get(
      '/customer/state/list',
      authCustomerGuard.bind(authCustomerGuard),
      _validate(validateIndexState),
      statePolicy.index,
      stateController.getStateListForCustomer
    );
    // state list for oem and area manager
    this.areaRouter.get(
      '/multipleState/list',
      verifyClient.bind(verifyClient),
      _validate(validateIndexState),
      stateController.getMultipleStateList
    );

    this.areaRouter.put(
      '/city/update/:cityId',
      verifyClient.bind(verifyClient),
      validate(updateCityValidation, {}, {}),
      cityPolicy.updateCityRequestValidation,
      cityController.updateCity
    );
    this.areaRouter.put(
      '/state/update/:stateId',
      verifyClient.bind(verifyClient),
      validate(updateStateValidation, {}, {}),
      statePolicy.updateStateRequestValidation,
      stateController.updateState
    );
    this.areaRouter.put(
      '/oem/update/:oemId',
      verifyClient.bind(verifyClient),
      validate(updateOEMValidation, {}, {}),
      oemPolicy.updateOEMRequestValidation,
      oemController.updateOEM
    );

    this.areaRouter.post(
      '/region/create',
      verifyClient.bind(verifyClient),
      _validate(validateStoreRegion),
      regionPolicy.store,
      regionController.store
    );

    this.areaRouter.get(
      '/region/list',
      verifyClient.bind(verifyClient),
      _validate(validateIndexRegion),
      regionPolicy.index,
      regionController.index
    );

    this.areaRouter.post(
      '/city/create',
      verifyClient.bind(verifyClient),
      _validate(validateStoreCity),
      cityPolicy.store,
      cityController.store
    );

    this.areaRouter.get(
      '/city/list',
      verifyClient.bind(verifyClient),
      _validate(validateIndexCity),
      cityPolicy.index,
      cityController.index
    );

    // State list for customer
    this.areaRouter.get(
      '/customer/city/list',
      authCustomerGuard.bind(authCustomerGuard),
      _validate(validateIndexCity),
      cityPolicy.index,
      cityController.getCityListForCustomer
    );

    // city list for oem and area manager
    this.areaRouter.get(
      '/multipleCity/list',
      verifyClient.bind(verifyClient),
      _validate(validateIndexState),
      cityController.getMultipleCityList
    );

    this.areaRouter.get(
      '/city/detail',
      verifyClient.bind(verifyClient),
      validate(updateStateValidation, {}, {}),
      statePolicy.validateStateNameExist,
      cityController.getCityDetail
    );

    this.areaRouter.post(
      '/oem/create',
      verifyClient.bind(verifyClient),
      _validate(validateStoreOem),
      oemPolicy.store,
      oemController.store
    );

    this.areaRouter.get(
      '/oem/list',
      verifyClient.bind(verifyClient),
      _validate(validateIndexOem),
      oemPolicy.index,
      oemController.index
    );

    this.areaRouter.get(
      '/outlet/list',
      verifyClient.bind(verifyClient),
      _validate(validateIndexOutlet),
      outletPolicy.index,
      outletController.index
    );
    this.areaRouter.get('/city-sync', cityController.syncCityFromState);

    this.areaRouter.get(
      '/oem/:oemId',
      verifyClient.bind(verifyClient),
      oemController.getByIdOem
    );
  }
}
const areaRoutes = (areaRouter: any) => {
  return new AreaRoutes(areaRouter);
};

export = {
  AreaRoutes: AreaRoutes,
  areaRoutes: areaRoutes,
};
