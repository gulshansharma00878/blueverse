import AWS from 'aws-sdk';
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY, // store it in .env file to keep it safe
  secretAccessKey: process.env.AWS_SECRET_KEY,
  region: process.env.AWS_S3_REGION_NAME,
});

const deleteUploadedProfileImage = async (image: string) => {
  try {
    var params = {
      Bucket: process.env.S3_STORE_NAME,
      Key: image,
    };
    s3.deleteObject(params, (err, data) => {
      if (err) console.log(err, err.stack); // an error occurred
      else console.log(data); // successful response
    });
    return;
  } catch (err) {
    return Promise.reject(err);
  }
};

export = { deleteUploadedProfileImage };
