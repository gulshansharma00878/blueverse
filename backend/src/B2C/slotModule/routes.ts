import { slotController } from './controllers/slot.controller';

import {
  authCustomerGuard,
  verifyClient,
} from '../../services/common/requestResponseHandler';
import { validate } from 'express-validation';
import { getSlot } from './dto/slot.dto';

class SlotRoutes {
  private slotController: typeof slotController;

  constructor(private slotRouter: any) {
    this.slotRouter = slotRouter;
    this.slotController = slotController;
    this.slotRoutes();
  }

  private slotRoutes() {
    this.slotRouter.get(
      '/slot',
      validate(getSlot, {}, {}),
      authCustomerGuard.bind(authCustomerGuard),
      this.slotController.getBookedSlot.bind(this.slotController)
    );
  }
}

export const slotRoutes = (slotRouter: any) => {
  return new SlotRoutes(slotRouter);
};
