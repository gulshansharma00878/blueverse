import { verifyClient } from '../../services/common/requestResponseHandler';
import { dashboardController } from './controllers/dashboard.controller';

class DashboardRoutes {
  constructor(private dashboardRouter: any) {
    this.dashboardRouter = dashboardRouter;
    this.registerRoutes();
  }
  registerRoutes() {
    this.dashboardRouter.get(
      '/dealer/washes',
      verifyClient.bind(verifyClient),
      dashboardController.getAdminWashes
    );
    this.dashboardRouter.get(
      '/dealer/water',
      verifyClient.bind(verifyClient),
      dashboardController.getAdminTreatedWater
    );
    this.dashboardRouter.get(
      '/dealer/electricity',
      verifyClient.bind(verifyClient),
      dashboardController.getDealerElectricityConsumed
    );
    this.dashboardRouter.get(
      '/dealer/water/quality',
      verifyClient.bind(verifyClient),
      dashboardController.getDealerWaterQuality
    );
    this.dashboardRouter.get(
      '/dealer/machine/runtime',
      verifyClient.bind(verifyClient),
      dashboardController.getDealerMachineRuntime
    );

    this.dashboardRouter.get(
      '/admin/machine/list',
      verifyClient.bind(verifyClient),
      dashboardController.getAdminMachineList
    );
    this.dashboardRouter.get(
      '/admin/washes',
      verifyClient.bind(verifyClient),
      dashboardController.getAdminWashes
    );
    this.dashboardRouter.get(
      '/admin/water',
      verifyClient.bind(verifyClient),
      dashboardController.getAdminTreatedWater
    );
    this.dashboardRouter.get(
      '/admin/dealership/count',
      verifyClient.bind(verifyClient),
      dashboardController.getAdminDealershipCount
    );

    this.dashboardRouter.get(
      '/admin/oem/machine/list',
      verifyClient.bind(verifyClient),
      dashboardController.getAdminOEMMachines
    );

    this.dashboardRouter.get(
      '/oem/manager/washes',
      verifyClient.bind(verifyClient),
      dashboardController.getOEMManagerWashes
    );

    this.dashboardRouter.get(
      '/oem/manager/dealers',
      verifyClient.bind(verifyClient),
      dashboardController.getOEMManagerDealers
    );

    this.dashboardRouter.get(
      '/oem/manager/electricity',
      verifyClient.bind(verifyClient),
      dashboardController.getOEMManagerElectricityConsumed
    );

    this.dashboardRouter.get(
      '/oem/manager/water',
      verifyClient.bind(verifyClient),
      dashboardController.getOEMManagerTreatedWater
    );

    this.dashboardRouter.get(
      '/oem/manager/machine/list',
      verifyClient.bind(verifyClient),
      dashboardController.getOEMManagerMachines
    );

    this.dashboardRouter.get(
      '/oem/manager/top/dealership',
      verifyClient.bind(verifyClient),
      dashboardController.getOEMManagerTopDealership
    );
    // Water qaulity dashboard API endpoint for OEM
    this.dashboardRouter.get(
      '/oem/water/quality',
      verifyClient.bind(verifyClient),
      dashboardController.getOEMWaterQuality
    );

    this.dashboardRouter.get(
      '/area/manager/dealers',
      verifyClient.bind(verifyClient),
      dashboardController.getAreaManagerDealerships
    );

    this.dashboardRouter.get(
      '/area/manager/top/dealers',
      verifyClient.bind(verifyClient),
      dashboardController.getAreaManagerTopDealerships
    );

    this.dashboardRouter.get(
      '/area/manager/washes',
      verifyClient.bind(verifyClient),
      dashboardController.getAreaManagerWashes
    );

    this.dashboardRouter.get(
      '/area/manager/dealers/count',
      verifyClient.bind(verifyClient),
      dashboardController.getAreaManagerDealerCount
    );

    this.dashboardRouter.get(
      '/area/manager/electricity',
      verifyClient.bind(verifyClient),
      dashboardController.getAreaManagerElectricityConsumed
    );

    this.dashboardRouter.get(
      '/area/manager/water',
      verifyClient.bind(verifyClient),
      dashboardController.getAreaManagerTreatedWater
    );

    this.dashboardRouter.get(
      '/area/manager/machine/list',
      verifyClient.bind(verifyClient),
      dashboardController.getAreaManagerMachines
    );
    // for admin
    this.dashboardRouter.get(
      '/dealers/machines',
      verifyClient.bind(verifyClient),
      dashboardController.getDealersMachines
    );

    // single API for all chart data at admin dashboard
    this.dashboardRouter.get(
      '/admin/graphData',
      verifyClient.bind(verifyClient),
      dashboardController.getAdminAllGraphData
    );
  }
}

const dashboardRoutes = (dashboardRouter: any) => {
  return new DashboardRoutes(dashboardRouter);
};

export = {
  DashboardRoutes: DashboardRoutes,
  dashboardRoutes: dashboardRoutes,
};
