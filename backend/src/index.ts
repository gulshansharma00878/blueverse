import express from 'express';
import * as dotenv from 'dotenv';
dotenv.config();
import bodyParser from 'body-parser';
import cors from 'cors';
import cron from 'node-cron';
// for hbs
import { engine } from 'express-handlebars';
import {
  handle404,
  handleError,
  handleResponse,
} from './services/common/requestResponseHandler';
import db from './models/index';
import { customerRouter } from './B2C/routes';
import userRoutes from './module/userModule/routes';
import washRoutes from './module/washModule/routes';
import areaRoutes from './module/areaModule/routes';
import feedbackRoutes from './module/feedbackModule/routes';
import machineRoutes from './module/machineModule/routes';
import machineWalletRoutes from './module/machineWalletModule/routes';
import billingAndAccountingRoutes from './module/billingAndAccounting/routes';
import areaManagerRoutes from './module/areaManagerModule/routes';
import oemManagerRoutes from './module/oemManager/routes';
import serviceRequestRoutes from './module/serviceRequestModule/routes';
import { config } from './config/config';
import externalRoutes from './routes/externalRoutes';
import uploadRoutes from './module/upload/routes';
import notificationRoutes from './module/notificationModule/routes';
//import feedbackRoutes from './routes/feedbackRoutes'
import termsAndPolicyRoutes from './routes/termsAndPolicy';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import paymentRoutes from './module/paymenModule/routes';
import { memoService } from './services/cron/machineMemo/machineMemo';
import dashboardRoutes from './module/dashboardModule/routes';
import hazardousWasteRoutes from './module/hazardousWasteModule/routes';
import waterQualityRoutes from './module/waterQualityModule/routes';
import moment from 'moment';
import { machineService } from './module/machineModule/services/machine.service';
import {
  cancelBooking,
  deductWashFromRecentWallets,
  deleteBooking,
  updateExpiredSubscriptions,
} from './services/cron/deleteBooking';
import { NotificationEngineService } from './B2C/notificationEngineModule/services/notificationEngine.service';


const Handlebars = require('handlebars');

// express app initialised
const app = express();
// import the sagger lib

// Set up Handlebars as the view engine
app.engine('handlebars', engine()); // Use engine() instead of exphbs()
app.set('view engine', 'handlebars');

// Register Handlebars helpers
Handlebars.registerHelper('increment', function(index:any) {
    return index + 1;
});

//After creating any declare in postman collection and then go this link and paste postman json here copy and then paste in swagger yaml file
//Link :- https://metamug.com/util/postman-to-swagger/
const swaggerDocument = YAML.load('src/swagger/swagger.yaml');
app.get('/api-docs/swagger.json', (req, res) => res.json(swaggerDocument));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use("/files", express.static("src/uploads"));
// enable cors request from browser
app.use(cors());
app.use(express.static("resources"));

//body parser to retrieve data from form body
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(bodyParser.json({ limit: '50mb' }));

// Handlebars settings
app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', './views');

// expressSwagger(options)
const userRouter = express.Router();
const washRouter = express.Router();
const areaRouter = express.Router();
const externalIntegrationRouter = express.Router();
const feedbackRouter = express.Router();
const machineRouter = express.Router();
const termsAndPolicyRouter = express.Router();
const uploadRouter = express.Router();
const machineWalletRouter = express.Router();
const billingAndAccountingRouter = express.Router();
const paymentRouter = express.Router();
const areaManagerRouter = express.Router();
const notificationRouter = express.Router();
const oemManagerRouter = express.Router();
const serviceRequestRouter = express.Router();
const dashboardRouter = express.Router();
const hazardousWasteRouter = express.Router();
const waterQualityRouter = express.Router();

//To access certificates zip at src/certificates

// Function to serve all static files
// inside public directory.
// app.use(express.static('public/certificates'));
app.use('/certificates', express.static(__dirname + '/certificates'));

app.use('/api/v1/b2c', customerRouter);
app.use('/api/v1/user', userRouter);
app.use('/api/v1/wash', washRouter);
app.use('/api/v1/area', areaRouter);
app.use('/api/v1/integration', externalIntegrationRouter);
app.use('/api/v1/feedback', feedbackRouter);
app.use('/api/v1/machine', machineRouter);
app.use('/api/v1/terms-and-policy', termsAndPolicyRouter);
app.use('/api/v1/external', externalIntegrationRouter);
app.use('/api/v1/upload', uploadRouter);
app.use('/api/v1/machineWallet', machineWalletRouter);
app.use('/api/v1/billing', billingAndAccountingRouter);
app.use('/api/v1/payment', paymentRouter);
app.use('/api/v1/notification', notificationRouter);
app.use('/api/v1/areaManager', areaManagerRouter);
app.use('/api/v1/oemManager', oemManagerRouter);
app.use('/api/v1/serviceRequest', serviceRequestRouter);
app.use('/api/v1/dashboard', dashboardRouter);
app.use('/api/v1/hazardousWaste', hazardousWasteRouter);
app.use('/api/v1/waterQuality', waterQualityRouter);

userRoutes.userRoutes(userRouter);
washRoutes.washRoutes(washRouter);
areaRoutes.areaRoutes(areaRouter);
externalRoutes.externalRoutes(externalIntegrationRouter);
feedbackRoutes.feedbackRoutes(feedbackRouter);
machineRoutes.machineRoutes(machineRouter);
termsAndPolicyRoutes.termsAndPolicyRoutes(termsAndPolicyRouter);
uploadRoutes.uploadRoutes(uploadRouter);
machineWalletRoutes.machineWalletRoutes(machineWalletRouter);
billingAndAccountingRoutes.billingAndAccountingRoutes(
  billingAndAccountingRouter
);
paymentRoutes.paymentRoutes(paymentRouter);
areaManagerRoutes.areaManagerRoutes(areaManagerRouter);
oemManagerRoutes.oemManagerRoutes(oemManagerRouter);
serviceRequestRoutes.serviceRequestRoutes(serviceRequestRouter);
dashboardRoutes.dashboardRoutes(dashboardRouter);
hazardousWasteRoutes.hazardousWasteRoutes(hazardousWasteRouter);
waterQualityRoutes.waterQualityRoutes(waterQualityRouter);

notificationRoutes.notificationRoutes(notificationRouter);
// Success Response
app.use(handleResponse);

//404 error handling
app.use(handle404);

// Generic Error Handling
app.use(handleError);

app.use((err: any, req: any, res: any, next: any) => {
  res.status(err.status || 500);
  res.send({
    error: {
      status: err.status || 500,
      message: err.message,
    },
  });
});

// App listening on port
app.listen(config.serverConfig.PORT, () => {
  console.log(`Server running on port ${config.serverConfig.PORT}`);
});

db.sequelize
  .sync({ force: false, alter: false })
  .then(() => {
    console.log('Database connected successfully');
  })
  .catch((error: any) => {
    console.error('Database connection error', error);
  });

//Scheduler Services
// Generate Advance Memo For Every Month
cron.schedule('1 4 1 * *', () => {
  memoService.generateAdvanceMemo();
});

//Generate blueverse tax invoice every month last date and blueverse credit memo
cron.schedule('1 23 28-31 * *', () => {
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  if (today.getMonth() !== tomorrow.getMonth()) {
    memoService.generateTaxInvoice();
    memoService.generateBlueverseCreditMemo();
    // run your cron job
  }
});

//Create Commencement advance memo at every day for new dealer
cron.schedule('0 0 0 * * *', () => {
  memoService.generateCommencementAdvanceMemo();
  deductWashFromRecentWallets();
});

//Cron job which run every day at 10 am wii send low machine wallet balance notification to admin and dealer
cron.schedule('0 10 * * *', () => {
  machineService.generateLowBalanceMachineNotifications();
});

// Crone job which run every minute to delete pending payment booking
cron.schedule('* * * * *', () => {
  deleteBooking();
  NotificationEngineService.sendNotificationEngineNotification();
 
});

// Cron job that runs every hour
cron.schedule('0 * * * *', () => {
  cancelBooking();
  // Add other functions to run if needed, e.g., cancelBooking();
});

// Schedule the updateExpiredSubscriptions function to run daily at 6:00 AM
cron.schedule('0 6 * * *', () => {
  updateExpiredSubscriptions();
});
export = app; // for testing
