import { CONSTANT } from '../constant';
import { Request, Response, NextFunction } from 'express';
import { dataFromRequest } from '../../../helpers/basic_helper';
import { SlotService } from '../services/slot.service';

export class SlotController {
  private slotService: typeof SlotService;
  constructor() {
    this.slotService = SlotService;
  }

  async getBookedSlot(req: Request, res: Response, next: NextFunction) {
    try {
      const data = dataFromRequest(req);

      // Getting the one slot details details
      const slotData = await this.slotService.getBookedSlot(data.date,data.merchantId);

      res.locals.response = {
        message: CONSTANT.SLOT_DETAILS,
        body: { data: { slotData: slotData } },
      };
      next();
    } catch (err) {
      next(err);
    }
  }
}

const slotController = new SlotController();
export { slotController };
