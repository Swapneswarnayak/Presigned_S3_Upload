// import aws from "aws-sdk";
// import dotenv from "dotenv";
// import crypto from "crypto";
// import { promisify } from "util";

// dotenv.config();

// const generateBytes = promisify(crypto.randomBytes);

// const region = process.env.AWS_REGION;
// const accessKeyId = process.env.AWS_ACCESS_KEY;
// const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
// const bucketName = process.env.AWS_BUCKET_NAME;
// const s3 = new aws.S3({
//   region,
//   accessKeyId,
//   secretAccessKey,
//   signatureVersion: "v4",
// });

// const generateSignedUrlS3 = async () => {
//   const bytes = await generateBytes(16);
//   const imageName = bytes.toString("hex");
//   const params = {
//     Bucket: bucketName,
//     Key: imageName,
//     Expires: 60,
//   };

//   const signedUrl = await s3.getSignedUrlPromise("putObject", params);
//   return signedUrl;
// };

// export default generateSignedUrlS3;

import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import dotenv from "dotenv";
import crypto from "crypto";

dotenv.config();

const region = process.env.AWS_REGION;
const accessKeyId = process.env.AWS_ACCESS_KEY;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
const bucketName = process.env.AWS_BUCKET_NAME;

const s3Client = new S3Client({
  region,
  credentials: {
    accessKeyId,
    secretAccessKey
  }
});

const generateSignedUrlS3 = async () => {
  const imageName = crypto.randomBytes(16).toString("hex");
  
  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: imageName,
  });

  return getSignedUrl(s3Client, command, { expiresIn: 60 });
};

export default generateSignedUrlS3;