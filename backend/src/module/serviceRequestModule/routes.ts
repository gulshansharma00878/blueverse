import { verifyClient } from '../../services/common/requestResponseHandler';
import { serviceRequestController } from './controllers/serviceRequest.controller';

class ServiceRequestRoutes {
  constructor(private ServiceRequestRouter: any) {
    this.ServiceRequestRouter = ServiceRequestRouter;
    this.registerRoutes();
  }
  registerRoutes() {
    this.ServiceRequestRouter.get(
      '/list',
      verifyClient.bind(verifyClient),
      serviceRequestController.getServiceRequestlist
    );
    this.ServiceRequestRouter.get(
      '/exportList',
      verifyClient.bind(verifyClient),
      serviceRequestController.exportServiceRequestlist
    );
  }
}

const serviceRequestRoutes = (ServiceRequestRouter: any) => {
  return new ServiceRequestRoutes(ServiceRequestRouter);
};

export = {
  ServiceRequestRoutes: ServiceRequestRoutes,
  serviceRequestRoutes: serviceRequestRoutes,
};
