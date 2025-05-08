import imageKit from "imagekit";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
dotenv.config();

const imagekit = new imageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY || "",
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY || "",
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT || "",
});

// create a new folder using sessionId
const createFolder = async (folderName: string) => {
  return new Promise((resolve, reject) => {
    imagekit.createFolder(
      {
        folderName: folderName,
        parentFolderPath: "/chunks/",
      },
      function (error, result) {
        if (error) {
          console.log("Error creating folder:", error);
          reject(error);
        } else {
          console.log("Folder created successfully:", result);
          resolve(result);
        }
      }
    );
  });
};

const uploadMultipleFiles = async (filePaths: string[], folderName: string) => {
  const uploadPromises = filePaths.map((filePath) => {
    const fileBuffer = fs.readFileSync(filePath);
    const fileName = path.basename(filePath);

    return new Promise((resolve, reject) => {
      imagekit.upload(
        {
          file: fileBuffer,
          fileName: fileName,
          folder: `/chunks/${folderName}`,
        },
        function (error, result) {
          if (error) {
            console.error("Error uploading file:", fileName, error);
            reject(error);
          } else {
            console.log("Uploaded:", fileName);
            try {
              fs.unlinkSync(filePath);
              console.log("Deleted local file:", fileName);
            } catch (unlinkErr) {
              console.warn("Failed to delete local file:", fileName, unlinkErr);
            }
            resolve(result);
          }
        }
      );
    });
  });

  return Promise.all(uploadPromises);
};

// get all folders
const getAllFolders = async () => {
  console.log("Fetching all folders...");
  return new Promise((resolve, reject) => {
    imagekit
      .listFiles({
        includeFolder: true,
        path: "/chunks/",
      })
      .then((result) => {
        console.log("Folders:", result);
        resolve(result);
      })
      .catch((error) => {
        console.error("Error fetching folders:", error);
        reject(error);
      });
  });
};

const getAllFiles = async (folderName: string) => {
  return new Promise((resolve, reject) => {
    imagekit
      .listFiles({
        path: `/chunks/${folderName}`,
        includeFolder: true,
      })
      .then((result) => {
        console.log("Files:", result);
        resolve(result);
      })
      .catch((error) => {
        console.error("Error fetching files:", error);
        reject(error);
      });
  });
};

export { uploadMultipleFiles, createFolder, getAllFolders, getAllFiles };
