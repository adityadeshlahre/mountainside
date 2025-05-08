import fs from "fs";
import dotenv from "dotenv";
import { Catbox } from "node-catbox";
dotenv.config();

const catbox = new Catbox(process.env.CATBOX_USER_HASH);

const uploadFileToAlbumCatbox = async (
  localFilePaths: string[],
  sessionId: string
) => {
  console.log(localFilePaths);
  const maxRetries = 3;
  let attempt = 0;

  while (attempt < maxRetries) {
    try {
      const results = [];
      for (const filePath of localFilePaths) {
        const result = await catbox.uploadFile({ path: filePath });
        results.push(result);
        console.log("Upload successful:", result);
        fs.unlinkSync(filePath);
      }
    } catch (error: any) {
      console.error(
        `Catbox upload attempt ${attempt + 1} failed:`,
        error.message
      );
      if (++attempt >= maxRetries) {
        console.error("Max retries reached. Cleaning up local files...");
        for (const filePath of localFilePaths) {
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        }
        break;
      }
      await new Promise((r) => setTimeout(r, 1000 * attempt));
    }
  }
};

export { uploadFileToAlbumCatbox };
