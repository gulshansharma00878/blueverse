'use strict';

// import upload from './controller/upload.controller';
import { authCustomerGuard, verifyClient } from '../../services/common/requestResponseHandler';
import awsUploadService from '../../services/common/awsService/uploadService';
import { uploadController } from './controller/upload.controller';
// export default router;
class UploadRoutes {
  constructor(private uploadRouter: any) {
    this.uploadRouter = uploadRouter;
    this.registerRoutes();
  }
  registerRoutes() {
    this.uploadRouter.post(
      '/profile/image',
      verifyClient.bind(verifyClient),
      awsUploadService.uploadImage.single('image'),
      uploadController.uploadProfileImage
    );

    this.uploadRouter.post(
      '/multiple/images',
      verifyClient.bind(verifyClient),
      awsUploadService.uploadImage.array('images', 10),
      uploadController.uploadMultipleImages
    );
    this.uploadRouter.post(
      '/doc',
      verifyClient.bind(verifyClient),
      awsUploadService.uploadDocs.single('doc'),
      uploadController.uploadDoc
    );

    this.uploadRouter.delete(
      '/delete',
      verifyClient.bind(verifyClient),
      uploadController.deleteUploadedFile
    );

    this.uploadRouter.post(
      '/customer/profile/image',
      authCustomerGuard.bind(authCustomerGuard),
      awsUploadService.uploadImage.single('image'),
      uploadController.uploadProfileImage
    );
  }
}
const uploadRoutes = (arerRouter: any) => {
  return new UploadRoutes(arerRouter);
};

export = {
  UploadRoutes,
  uploadRoutes,
};
