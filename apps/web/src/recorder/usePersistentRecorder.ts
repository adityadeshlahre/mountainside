import { useRef, useState } from "react";
import { openDB } from "idb";

const DB_NAME = "video-recording-db";
const STORE_NAME = "chunks";

const usePersistentRecorder = (
  mediaStream: MediaStream | null,
  sessionId: string
) => {
  const [isRecording, setIsRecording] = useState(false);
  const CHUNK_DURATION = 5000;
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isRecordingRef = useRef(false);
  const startRecording = async () => {
    if (!mediaStream) return;

    const db = await openDB(DB_NAME, 2, {
      upgrade(db : any) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, {
            keyPath: "id",
            autoIncrement: true,
          });
          store.createIndex("sessionId", "sessionId", { unique: false });
        }
      },
    });

    setIsRecording(true);
    isRecordingRef.current = true;

    const recordNextChunk = async () => {
      if (!isRecordingRef.current) return;

      const recorder = new MediaRecorder(mediaStream, {
        mimeType: "video/webm; codecs=vp8,opus",
        audioBitsPerSecond: 128_000,
        videoBitsPerSecond: 5_000_000,
      });

      recorder.ondataavailable = async (event) => {
        if (event.data.size > 0) {
          const tx = db.transaction(STORE_NAME, "readwrite");
          const store = tx.objectStore(STORE_NAME);
          await store.add({
            sessionId,
            chunk: event.data,
            timestamp: Date.now(),
            meta: {
              mimeType: recorder.mimeType,
              duration: CHUNK_DURATION,
            },
          });
          await tx.done;
          console.log("Chunk saved");
        }
      };

      recorder.onstop = async () => {
        if (isRecordingRef.current) {
          setTimeout(recordNextChunk, 0);
        }
      };

      recorder.start();
      timerRef.current = setTimeout(() => {
        if (recorder.state === "recording") {
          recorder.stop();
        }
      }, CHUNK_DURATION);
    };

    recordNextChunk();
  };

  const stopRecording = () => {
    isRecordingRef.current = false;
    setIsRecording(false);
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  const exportChunks = async () => {
    const db = await openDB(DB_NAME, 2, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, {
            keyPath: "id",
            autoIncrement: true,
          });
          store.createIndex("sessionId", "sessionId", { unique: false });
        } else {
          const store = db
            .transaction(STORE_NAME, "versionchange")
            .objectStore(STORE_NAME);
          if (!store.indexNames.contains("sessionId")) {
            store.createIndex("sessionId", "sessionId", { unique: false });
          }
        }
      },
    });

    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const index = store.index("sessionId");
    const sessionChunks = await index.getAll(IDBKeyRange.only(sessionId));

    if (sessionChunks.length === 0) {
      console.log("No chunks found for this session.");
      return;
    }

    // Iterate over the chunks and create download links for each one
    sessionChunks.forEach((chunk, index) => {
      setTimeout(() => {
        const fileName = `video_chunk_${sessionId}_${index}.webm`;
        const blob = new Blob([chunk.chunk], { type: "video/webm" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }, index * 200);
    });

    console.log("Chunks exported successfully!");
  };

  const exportMergedVideo = async () => {
    const db = await openDB(DB_NAME, 2);
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const index = store.index("sessionId");
    const sessionChunks = await index.getAll(IDBKeyRange.only(sessionId));

    if (sessionChunks.length === 0) {
      console.log("No chunks found for this session.");
      return;
    }

    // Sort chunks by timestamp if necessary
    const sortedChunks = sessionChunks.sort(
      (a, b) => a.timestamp - b.timestamp
    );

    // Extract Blob parts
    const blobParts = sortedChunks.map((chunk) =>
      chunk.chunk instanceof Blob ? chunk.chunk : new Blob([chunk.chunk])
    );

    // Merge all chunks into one Blob
    const mergedBlob = new Blob(blobParts, { type: "video/webm" });

    // Trigger download
    const link = document.createElement("a");
    link.href = URL.createObjectURL(mergedBlob);
    link.download = `full_recording_${sessionId}.webm`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    console.log("Merged video downloaded successfully!");
  };

  return {
    startRecording,
    stopRecording,
    isRecording,
    exportChunks,
    exportMergedVideo,
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
