'use strict';

// import upload from './controller/upload.controller';
import { verifyClient } from '../../services/common/requestResponseHandler';
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
  }
}
const uploadRoutes = (arerRouter: any) => {
  return new UploadRoutes(arerRouter);
};

export = {
  UploadRoutes,
  uploadRoutes,
};
