// customerModule/routes.ts
import { Router } from 'express';
import { authRoutes } from './authModule/routes'; // Ensure correct import path
import { vehicleRoutes } from './vechicleModule/routes';
import { customerRoutes } from './customerModule/route';
import { merchantRoutes } from './merchantModule/routes';
import { additionalServiceRoutes } from './additionalService/route';
import { bookingRoutes } from './bookingModule/route';
import { slotRoutes } from './slotModule/routes';
import { couponRoutes } from './couponModule/routes';
import { badgeRoutes } from './badgeModule/routes';
import { walletRoutes } from './walletModule/routes';
import { washWalletRoutes } from './washWalletModule/routes';
import { subscriptionRoutes } from './suscriptionModule/routes';
import { notificationEngineRoutes } from './notificationEngineModule/routes';
import { customerPaymentRoutes } from './paymentModule/routes';
import { holidayRoutes } from './holidayModule/routes';
import { brandRoutes } from './bradModule/routes';
import { referAndEarnRoutes } from './referAndEarnModule/routes';
import { analyticsRoutes } from './analyticsModule/route';

const customerRouter = Router();

// Pass the customerRouter to authRoutes
authRoutes(customerRouter);
vehicleRoutes(customerRouter);
customerRoutes(customerRouter);
additionalServiceRoutes(customerRouter);
bookingRoutes(customerRouter);
merchantRoutes(customerRouter); // custom
slotRoutes(customerRouter);
couponRoutes(customerRouter);
walletRoutes(customerRouter);
washWalletRoutes(customerRouter);
badgeRoutes(customerRouter);
subscriptionRoutes(customerRouter);
notificationEngineRoutes(customerRouter);
customerPaymentRoutes(customerRouter);
holidayRoutes(customerRouter);
brandRoutes(customerRouter);
referAndEarnRoutes(customerRouter)
analyticsRoutes(customerRouter)

export { customerRouter };
