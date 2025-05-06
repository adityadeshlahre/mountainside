import chokidar from "chokidar";
import axios from "axios";
import fs from "fs";
import FormData from "form-data";
import path from "path";

const WATCH_DIR = path.resolve(__dirname, "./../video_chunks"); // Directory where chunks are saved
const ID_FILE = path.resolve(__dirname, "./../upload_ids.txt"); // File to store uploaded chunk IDs
const BIN_FILE = path.resolve(__dirname, "./../current_bin.txt"); // File to store the current bin ID

// Function to append uploaded file ID to a text file
const appendFileId = (fileId: string) => {
  fs.appendFileSync(ID_FILE, `${fileId}\n`, "utf8");
  console.log(`Appended file ID: ${fileId}`);
};

// Function to get the current bin ID from the file
const getCurrentBin = () => {
  if (fs.existsSync(BIN_FILE)) {
    return fs.readFileSync(BIN_FILE, "utf8").trim();
  }
  return null;
};

// Function to create a new bin via the API
const createNewBin = async () => {
  try {
    // Make GET request to create a new bin
    const response = await axios.get("https://filebin.net/"); // Endpoint to create new bin
    const htmlContent = response.data; // Assuming the API returns HTML content

    // Use regex to extract the bin ID from the HTML content
    const regex = /filebin\.net\/(\w+)/;
    const match = htmlContent.match(regex);

    if (match && match[1]) {
      const newBinId = match[1]; // Extracted bin ID

      console.log("New bin created:", newBinId);

      // Store the new bin ID locally
      fs.writeFileSync(BIN_FILE, newBinId, "utf8");
      return newBinId;
    } else {
      console.error("Failed to extract bin ID from HTML:", htmlContent);
      return null;
    }
  } catch (error) {
    console.error("Failed to create new bin:", error);
    return null;
  }
};

// Function to check if the bin is empty (for now, assuming we can check with a GET request)
const isBinEmpty = async (binId: string) => {
  try {
    const response = await axios.get(`https://filebin.net/${binId}`);
    console.log(response.data?.files); // Assuming the response contains a list of files in the bin
    return response.data.files === null; // Assuming the response contains a list of files in the bin
  } catch (error) {
    console.error("Failed to check if bin is empty:", error);
    return false;
  }
};

// Function to upload a file to the bin
const uploadFile = async (filePath: string) => {
  console.log(`Uploading file: ${filePath}`);

  // Get the current bin, if available
  let currentBin = getCurrentBin();
  if (!currentBin || (await isBinEmpty(currentBin))) {
    currentBin = await createNewBin(); // Create a new bin if necessary
  }

  const form = new FormData();
  form.append("file", fs.createReadStream(filePath));

  try {
    const response = await axios.post(
      `https://filebin.net/${currentBin}`,
      form,
      {
        headers: form.getHeaders(),
      }
    );

    // Extract the file ID from the response (assuming it's in the response data)
    const fileId = response.data.id; // Assuming response contains file ID
    console.log("Upload successful, file ID:", fileId);

    // Store the file ID in the .txt file
    appendFileId(fileId);
  } catch (error) {
    console.error("Upload failed:", error);
    // Optionally push to retry queue or log for further action
  }
};

// Set up file watcher
const watcher = chokidar.watch(WATCH_DIR, {
  persistent: true,
  awaitWriteFinish: {
    stabilityThreshold: 500,
    pollInterval: 100,
  },
});

// Watch for new files and upload .webm files
watcher.on("add", (filePath) => {
  if (filePath.endsWith(".webm")) {
    uploadFile(filePath);
  }
});

console.log(`Watching ${WATCH_DIR} for new files...`);

// wget -q -O - "https://filebin.net/" | grep -oP 'filebin\.net/\K[\w\d]+(?=")'
