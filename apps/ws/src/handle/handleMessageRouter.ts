import { WebSocket } from "ws";
import { RoomMap } from "@repo/types";
import { handleJoin } from "./handleJoin";
import { handleAnswer } from "./handleAnswer";
import { handleCandidate } from "./handleCandidate";
import { handleLeave } from "./handleLeave";
import { handleOffer } from "./handleOffer";
import { MessageType } from "@repo/common/constants";

interface MessagePayload {
  type: string;
  room: string;
  data?: any;
}

type handlerFucntion = (
  ws: WebSocket,
  message: MessagePayload,
  roomMap: RoomMap,
  currentRoomRef: { current: string | null }
) => void;

const handlers: Record<string, handlerFucntion> = {
  ping: (ws, message) => {
    ws.send(
      JSON.stringify({
        type: MessageType.PONG,
        room: message.room,
      })
    );
  },

  join: (ws, message, roomMap, currentRoomRef) => {
    if (message.data.room) {
      currentRoomRef.current = message.data.room;
      handleJoin({ ws, room: message.data.room!, roomMap, currentRoomRef });
    }
  },

  offer: (ws, message, roomMap, currentRoomRef) => {
    const { data: offer } = message;
    handleOffer(ws, offer, roomMap, currentRoomRef);
  },

  answer: (ws, message, roomMap, currentRoomRef) => {
    const { data: answer } = message;
    handleAnswer(ws, answer, roomMap, currentRoomRef);
  },

  candidate: (ws, message, roomMap, currentRoomRef) => {
    const { data: candidate } = message;
    handleCandidate(ws, candidate, roomMap, currentRoomRef);
  },

  leave: (ws, message, roomMap, currentRoomRef) => {
    handleLeave(ws, message, roomMap, currentRoomRef);
  },
};

export function handleMessageRouter({
  ws,
  message,
  roomMap,
  currentRoomRef,
}: {
  ws: WebSocket;
  message: MessagePayload;
  roomMap: RoomMap;
  currentRoomRef: { current: string | null };
}) {
  const handler = handlers[message.type];

  if (handler) {
    handler(ws, message, roomMap, currentRoomRef);
  } else {
    // Fallback to default relay
    const clients = roomMap.get(currentRoomRef.current!);
    if (clients) {
      for (const client of clients) {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(
            JSON.stringify({ type: message.type, data: message.data })
          );
        }
      }
    }
  }
}

export function isRoomReady(roomMap: RoomMap, roomId: string): boolean {
  const clients = roomMap.get(roomId);
  if (clients && clients.size === 2) {
    return true;
  }
  return false;
}
