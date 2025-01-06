import express from 'express';
import * as dotenv from 'dotenv';
dotenv.config();
import bodyParser from 'body-parser';
import cors from 'cors';
import cron from 'node-cron';
import {
  handle404,
  handleError,
  handleResponse,
} from './services/common/requestResponseHandler';
import db from './models/index';
import userRoutes from './module/userModule/routes';
import washRoutes from './module/washModule/routes';
import areaRoutes from './module/areaModule/routes';
import feedbackRoutes from './module/feedbackModule/routes';
import machineRoutes from './module/machineModule/routes';
import machineWalletRoutes from './module/machineWalletModule/routes';
import billingAndAccountingRoutes from './module/billingAndAccounting/routes';
import { config } from './config/config';
import externalRoutes from './routes/externalRoutes';
import uploadRoutes from './module/upload/routes';
//import feedbackRoutes from './routes/feedbackRoutes'
import termsAndPolicyRoutes from './routes/termsAndPolicy';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import paymentRoutes from './module/paymenModule/routes';
import { memoService } from './services/cron/machineMemo/machineMemo';
import moment from 'moment';
// express app initialised
const app = express();
// import the sagger lib

//After creating any declare in postman collection and then go this link and paste postman json here copy and then paste in swagger yaml file
//Link :- https://metamug.com/util/postman-to-swagger/
const swaggerDocument = YAML.load('src/swagger/swagger.yaml');
app.get('/api-docs/swagger.json', (req, res) => res.json(swaggerDocument));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
// app.use("/files", express.static("/src/services/common/awsService/uploads"));
// app.use("/uploads", express.static(__dirname + "/uploads"));
app.use("/files", express.static("src/uploads"));
// enable cors request from browser
app.use(cors());

app.use(express.static("resources"));

//body parser to retrieve data from form body
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

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

async function syncDB(){
  try {
    await db.sequelize.sync({ force: false, alter: false });
    console.log('Database synchronized successfully');
  } catch (error) {
    console.error('Error synchronizing database:', error);
  }
}

syncDB()


// db.sequelize
//   .sync({ force: false, alter: true })
//   .then(() => {
//     console.log('Database connected successfully');
//   })
//   .catch((error: any) => {
//     console.error('Database connection error', error);
//   });

//Scheduler Services
// Generate Advance Memo For Every Month
if (process.env.NODE_ENV === 'development') {
  cron.schedule('0 */8 * * *', () => {
    memoService.generateAdvanceMemo();
  });
} else {
  cron.schedule('* 4 1 * *', () => {
    memoService.generateAdvanceMemo();
  });
}
//Generate blueverse tax invoice every month last date and blueverse credit memo
cron.schedule('* 23 28-31 * *', () => {
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  if (today.getMonth() !== tomorrow.getMonth()) {
    memoService.generateTaxInvoice();
    memoService.generateBlueverseCreditMemo();
    // run your cron job
  }
});

export = app; // for testing
