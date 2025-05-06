import { useEffect, useState } from "react";
import { useWebRTC } from "../lib/webRTCService";
import { v4 as uuidv4 } from "uuid";
import usePersistentRecorder from "../recorder/usePersistentRecorder";
import {
  uploadVideoChunksTocloudinary,
  uploadVideoChunksToServer,
} from "../chunks_uploader/videoUploader";

const VideoChat = () => {
  const { handleJoin, loading } = useWebRTC();
  const [roomCode, setRoomCode] = useState<string>();
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [sessionId, setSessionId] = useState<string>("");
  const {
    startRecording,
    stopRecording,
    exportChunks,
    exportMergedVideo,
    isRecording,
  } = usePersistentRecorder(mediaStream, sessionId);

  useEffect(() => {
    const handleDisconnect = () => {
      if (isRecording) {
        stopRecording();
      }
    };

    window.addEventListener("beforeunload", handleDisconnect);

    return () => {
      window.removeEventListener("beforeunload", handleDisconnect);
    };
  }, [isRecording, stopRecording]);

  useEffect(() => {
    const setupStream = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        setMediaStream(stream);
        const localVideo = document.getElementById(
          "local-video"
        ) as HTMLVideoElement;
        if (localVideo) {
          localVideo.srcObject = stream;
        }
      } catch (err) {
        console.error("Error accessing media devices:", err);
      }
    };

    setupStream();
  }, []);

  useEffect(() => {
    if (roomCode && !sessionId) {
      setSessionId(`${roomCode}-${uuidv4()}`);
    }
  }, [roomCode]);

  useEffect(() => {
    const remoteVideo = document.getElementById(
      "remote-video"
    ) as HTMLVideoElement;
    const observer = new MutationObserver(() => {
      if (remoteVideo.srcObject) {
        startRecording();
      }
    });

    observer.observe(remoteVideo, {
      attributes: true,
      attributeFilter: ["srcObject"],
    });

    return () => observer.disconnect();
  }, [startRecording]);

  return (
    <div className="flex flex-col items-center gap-3">
      <div>
        <video
          id="local-video"
          autoPlay
          muted
          style={{ width: "300px", height: "200px" }}
        ></video>
      </div>
      <div>
        <video
          id="remote-video"
          autoPlay
          muted
          style={{ width: "300px", height: "200px" }}
        ></video>
      </div>
      <input
        type="text"
        placeholder="Room ID"
        id="room-id"
        onChange={(e) => {
          setRoomCode(e.target.value);
        }}
        className="border p-2 rounded"
        value={roomCode || ""}
        disabled={loading}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            if (roomCode) {
              handleJoin(roomCode);
            } else {
              console.error("Room code is required");
            }
          }
        }}
      />
      <button
        onClick={() => {
          if (roomCode) {
            handleJoin(roomCode);
          } else {
            console.error("Room code is required");
          }
        }}
        disabled={loading}
        className="bg-blue-500 text-white p-2 rounded"
      >
        Start Call
      </button>
      <button
        onClick={startRecording}
        disabled={isRecording}
        className="bg-blue-500 text-white p-2 rounded"
      >
        start
      </button>
      <button
        onClick={stopRecording}
        disabled={!isRecording}
        className="bg-blue-500 text-white p-2 rounded"
      >
        stop
      </button>
      <button
        onClick={exportMergedVideo}
        className="bg-blue-500 text-white p-2 rounded"
      >
        exportMergedVideo
      </button>
      <button
        onClick={exportChunks}
        className="bg-blue-500 text-white p-2 rounded"
      >
        Export
      </button>
      <button
        onClick={async () => {
          await uploadVideoChunksToServer(sessionId);
        }}
        className="bg-blue-500 text-white p-2 rounded"
      >
        save video (local)
      </button>
      <button
        onClick={async () => {
          await uploadVideoChunksTocloudinary(sessionId);
        }}
        className="bg-blue-500 text-white p-2 rounded"
      >
        upload video (cloud)
      </button>
      {isRecording && (
        <p className="text-green-500 mt-2">Recording has started!</p>
      )}
    </div>
  );
};

export default VideoChat;
