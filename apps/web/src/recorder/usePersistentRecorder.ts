import { useRef, useState } from "react";
import { openDB } from "idb";

const DB_NAME = "video-recording-db";
const STORE_NAME = "chunks";

const usePersistentRecorder = (
  mediaStream: MediaStream | null,
  sessionId: string
) => {
  const recorderRef = useRef<MediaRecorder | null>(null);
  const [isRecording, setIsRecording] = useState(false);

  const startRecording = async () => {
    if (!mediaStream) return;
    const db = await openDB(DB_NAME, 2, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, {
            keyPath: "id",
            autoIncrement: true,
          });
          store.createIndex("sessionId", "sessionId", { unique: false });
        }
      },
    });

    const recorder = new MediaRecorder(mediaStream, {
      mimeType: "video/webm; codecs=vp9",
      videoBitsPerSecond: 5_000_000, // Full HD bitrate
    });

    console.log(recorder);
    console.log(typeof recorder);

    recorder.ondataavailable = async (event) => {
      if (event.data.size > 0) {
        const tx = db.transaction(STORE_NAME, "readwrite");
        const store = tx.objectStore(STORE_NAME);
        await store.add({
          sessionId,
          chunk: event.data,
          timestamp: Date.now(),
        });
        await tx.done;
      }
    };

    recorder.start(4000); // every 5s
    recorderRef.current = recorder;
    setIsRecording(true);
  };

  const stopRecording = () => {
    recorderRef.current?.stop();
    setIsRecording(false);
  };

  const exportChunks = async () => {
    const db = await openDB(DB_NAME, 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, {
            keyPath: "id",
            autoIncrement: true,
          });
        }
      },
    });

    const store = db
      .transaction(STORE_NAME, "readonly")
      .objectStore(STORE_NAME);

    // Get all chunks for the given session ID
    const chunks = await store.getAll();
    const sessionChunks = chunks.filter(
      (chunk) => chunk.sessionId === sessionId
    );

    if (sessionChunks.length === 0) {
      console.log("No chunks found for this session.");
      return;
    }

    // Iterate over the chunks and create download links for each one
    sessionChunks.forEach((chunk, index) => {
      const fileName = `video_chunk_${sessionId}_${index}.webm`;

      // Create a Blob from the chunk data
      const blob = new Blob([chunk.chunk], { type: "video/webm" });

      // Create an anchor element to trigger download
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = fileName;

      // Trigger download programmatically
      link.click();
    });

    console.log("Chunks exported successfully!");
  };

  return {
    startRecording,
    stopRecording,
    isRecording,
    exportChunks,
  };
};

export default usePersistentRecorder;

/////////////////////////////////////

// (function () {
//     const request = indexedDB.open("video-recording-db", 1);

//     request.onsuccess = function (event) {
//       const db = event.target.result;
//       const transaction = db.transaction("chunks", "readonly");
//       const store = transaction.objectStore("chunks");

//       const getAllRequest = store.getAll();

//       getAllRequest.onsuccess = function () {
//         const records = getAllRequest.result;

//         if (!records.length) {
//           console.log("No chunks found.");
//           return;
//         }

//         const chunks = records.map(r => r.chunk);
//         const blob = new Blob(chunks, { type: "video/webm" });

//         const videoURL = URL.createObjectURL(blob);
//         const videoElement = document.createElement("video");

//         videoElement.src = videoURL;
//         videoElement.controls = true;
//         videoElement.autoplay = false;
//         videoElement.style = "width: 640px; position: fixed; bottom: 10px; right: 10px; background: black; z-index: 9999;";

//         document.body.appendChild(videoElement);
//       };

//       getAllRequest.onerror = function () {
//         console.error("Failed to read chunks from IndexedDB.");
//       };
//     };

//     request.onerror = function () {
//       console.error("Failed to open IndexedDB.");
//     };
//   })();

////////////////////////////////////
