import { useEffect } from "react";
import { useSocket } from "../hooks/use-socket";
import { MessageType } from "@repo/common/constants";

let localStream: MediaStream;
let peerConnection: RTCPeerConnection;
let remoteStream: MediaStream;
let candidateQueue: RTCIceCandidateInit[] = [];
let isRemoteDescriptionSet = false;

const mediaConstraints = {
  video: true,
  audio: true,
};

export const useWebRTC = () => {
  const { socket, loading } = useSocket();

  useEffect(() => {
    if (!loading && socket) {
      initializeWebRTC(socket);
    }
  }, [socket, loading]);

  const initializeWebRTC = async (ws: WebSocket) => {
    if (peerConnection && localStream) {
      console.log("WebRTC already initialized, skipping reinitialization.");
      return;
    }

    try {
      // Get local media stream (camera and microphone)
      localStream = await navigator.mediaDevices.getUserMedia(mediaConstraints);
      const localVideo = document.getElementById(
        "local-video"
      ) as HTMLVideoElement;
      localVideo.srcObject = localStream;

      // Create peer connection
      peerConnection = new RTCPeerConnection();

      // Send ICE candidates as they are found
      peerConnection.onicecandidate = (event: any) => {
        if (event.candidate) {
          ws.send(
            JSON.stringify({
              type: MessageType.ICE_CANDIDATE,
              candidate: event.candidate,
            })
          );
        }
      };

      // Add local stream to the connection
      localStream.getTracks().forEach((track) => {
        peerConnection.addTrack(track, localStream);
      });

      // Set up signaling for remote stream
      peerConnection.ontrack = (event) => {
        remoteStream = event.streams[0];
        const remoteVideo = document.getElementById(
          "remote-video"
        ) as HTMLVideoElement;
        if (remoteVideo) remoteVideo.srcObject = remoteStream;
      };

      // WebSocket signaling: receive offer, answer, or ICE candidates
      ws.onmessage = (message) => {
        const data = JSON.parse(message.data);
        switch (data.type) {
          case MessageType.JOIN:
            handleJoin(data.data.room);
            break;
          case MessageType.USER_JOINED:
            handleCreateOffer();
            break;
          case MessageType.OFFER:
            handleOffer(data.data);
            break;
          case MessageType.ANSWER:
            handleAnswer(data.data);
            break;
          case MessageType.ICE_CANDIDATE:
            handleNewICECandidate(data.candidate);
            break;
          default:
            break;
        }
      };

      ws.send(
        JSON.stringify({
          type: MessageType.PING,
        })
      );
    } catch (err) {
      console.error("Error setting up WebRTC: ", err);
    }
  };

  const handleJoin = (room: string) => {
    if (socket) {
      socket.send(
        JSON.stringify({
          type: MessageType.JOIN,
          data: { room },
        })
      );
    }
  };

  // Create an offer to start the call
  const handleCreateOffer = async () => {
    try {
      if (!peerConnection) {
        console.warn("Peer connection not initialized yet");
        return;
      }
      if (!localStream) {
        console.warn("Local stream not initialized yet");
        return;
      }
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);
      socket?.send(JSON.stringify({ type: MessageType.OFFER, data: offer }));

      // Send ICE candidates after the offer has been created
      peerConnection.onicecandidate = (event: any) => {
        if (event.candidate) {
          socket?.send(
            JSON.stringify({
              type: MessageType.ICE_CANDIDATE,
              candidate: event.candidate,
            })
          );
        }
      };
    } catch (err) {
      console.error("Error creating offer: ", err);
    }
  };

  // Handle offer received from the signaling server
  const handleOffer = async (offer: RTCSessionDescriptionInit) => {
    if (!offer || !offer.sdp || !offer.type) {
      console.error("Invalid offer received:", offer);
      return;
    }

    if (!peerConnection) return;

    try {
      await peerConnection.setRemoteDescription(
        new RTCSessionDescription(offer)
      );
      isRemoteDescriptionSet = true;
      flushQueuedCandidates();

      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);
      socket?.send(JSON.stringify({ type: MessageType.ANSWER, data: answer }));
    } catch (err) {
      console.error("Error handling offer: ", err);
    }
  };

  // Handle answer received from the other peer
  const handleAnswer = async (answer: RTCSessionDescriptionInit) => {
    if (!peerConnection) return;

    try {
      await peerConnection.setRemoteDescription(
        new RTCSessionDescription(answer)
      );
      isRemoteDescriptionSet = true;
      flushQueuedCandidates();
    } catch (err) {
      console.error("Error handling answer: ", err);
    }
  };

  // Handle incoming ICE candidates
  const handleNewICECandidate = (candidate: RTCIceCandidateInit) => {
    console.log("ICE candidate received:", candidate);
    if (!peerConnection) {
      console.error("ICE candidate ignored: no peerConnection");
      return;
    }

    if (!candidate || !candidate.candidate) {
      console.error("ICE candidate ignored: invalid candidate data", candidate);
      return;
    }

    if (!isRemoteDescriptionSet) {
      console.log("Queuing ICE candidate until remote description is set");
      candidateQueue.push(candidate);
      return;
    }

    try {
      peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (err) {
      console.error("Error adding ICE candidate:", err);
    }
  };

  const flushQueuedCandidates = () => {
    candidateQueue.forEach((candidate) => {
      try {
        peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (err) {
        console.error("Error adding queued ICE candidate:", err);
      }
    });
    candidateQueue = [];
  };

  return {
    handleJoin,
    handleCreateOffer,
    flushQueuedCandidates,
    loading,
    socket,
  };
};
