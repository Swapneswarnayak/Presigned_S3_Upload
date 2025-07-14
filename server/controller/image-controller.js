import generateSignedUrlS3 from "../s3.js";

export const getPresignedURL = async (req, res) => {
  const url = await generateSignedUrlS3();
  res.status(200).json({ url });
};
