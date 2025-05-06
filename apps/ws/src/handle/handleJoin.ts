import { RoomMap } from "@repo/types";
import { MessageType } from "@repo/common/constants";
import { WebSocket } from "ws";
import { isRoomReady } from "./handleMessageRouter";

export function handleJoin({
  ws,
  room,
  roomMap,
  currentRoomRef,
}: {
  ws: WebSocket;
  room: string;
  roomMap: RoomMap;
  currentRoomRef: { current: string | null };
}): void {
  const roomId = currentRoomRef.current!;

  if (!roomMap.has(roomId)) {
    roomMap.set(roomId, new Set());
  }

  const clients = roomMap.get(room)!;
  clients.add(ws);

  // if (clients.has(ws)) {
  //   console.log("Client already in the room.");
  //   return;
  // }

  // if (isRoomReady(roomMap, roomId)) {
  //   console.log("Room is ready for offer exchange.");
  //   // Notify both clients that the room is ready for offer exchange
  //   clients.forEach((client) => {
  //     if (client.readyState === WebSocket.OPEN) {
  //       client.send(JSON.stringify({ type: MessageType.ROOM_READY }));
  //     }
  //   });
  // } else {
  //   console.log("Waiting for another participant to join.");
  // }

  // Notify other clients in the room
  clients.forEach((client) => {
    if (client !== ws && client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ type: MessageType.USER_JOINED }));
    }
  });
}

// implement room check
