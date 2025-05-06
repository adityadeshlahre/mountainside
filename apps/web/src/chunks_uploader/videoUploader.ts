import axios from "axios";
import { openDB } from "idb";

const DB_NAME = "video-recording-db";
const STORE_NAME = "chunks";

export const uploadChunksToServer = async (sessionId: string) => {
  const db = await openDB(DB_NAME, 2);
  const tx = db.transaction(STORE_NAME, "readonly");
  const store = tx.objectStore(STORE_NAME);
  const allChunks = await store.getAll();

  const sessionChunks = allChunks.filter(
    (chunk) => chunk.sessionId === sessionId
  );

  for (const chunk of sessionChunks) {
    const formData = new FormData();
    formData.append("file", chunk.chunk, `chunk-${chunk.timestamp}.webm`);
    formData.append("sessionId", chunk.sessionId);

    await axios.post("/api/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  }

  console.log("Upload complete.");
};
