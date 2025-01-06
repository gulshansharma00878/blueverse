import { templateConstants } from '../../../common/templateConstants';
import awsDeleteService from '../../../services/common/awsService/deleteService';

class Upload {
  async uploadProfileImage(req: any, res: any, next: any) {
    try {
      res.locals.response = {
        message: templateConstants.UPLOADED_SUCCESSFULLY('Profile image'),
        body: { data: { url: req.file.location } },
      };
      next();
    } catch (err) {
      next(err);
    }
  }
  async uploadDoc(req: any, res: any, next: any) {
    try {
      res.locals.response = {
        message: templateConstants.UPLOADED_SUCCESSFULLY('Document'),
        body: { data: { url: req.file.location } },
      };
      next();
    } catch (err) {
      next(err);
    }
  }

  async deleteUploadedFile(req: any, res: any, next: any) {
    try {
      const { url } = req.body;
      const imageToRemove = url.split('/').slice(-1)[0];
      await awsDeleteService.deleteUploadedProfileImage(
        decodeURIComponent(imageToRemove)
      );
      res.locals.response = {
        message: templateConstants.DELETED_SUCCESSFULLY('Document'),
      };
      next();
    } catch (err) {
      next(err);
    }
  }
}
const uploadController = new Upload();
export { uploadController };
