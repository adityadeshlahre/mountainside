import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import dotenv from "dotenv";
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (
  localFilePath: string,
  folderName: string
) => {
  try {
    if (!localFilePath) return { error: "No file path provided" };
    const response = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload(
        localFilePath,
        { resource_type: "video", folder: folderName },
        (error, result) => {
          if (error) {
            console.error("Error uploading to Cloudinary:", error);
            reject(error); // Reject the promise on error
          } else {
            console.log("Upload successful:", result);
            resolve(result); // Resolve the promise with the result
          }
        }
      );
    });
    fs.unlinkSync(localFilePath);
    return response;
  } catch (error: any) {
    console.error("Error uploading to Cloudinary:", error);
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }
    return null;
  }
};

export { uploadOnCloudinary };
