import { RoomMap } from "@repo/types";
import { MessageType } from "./../constants";
import { WebSocket } from "ws";

export function handleJoin({
  ws,
  room,
  roomMap,
}: {
  ws: WebSocket;
  room: string;
  roomMap: RoomMap;
}): void {
  if (!roomMap.has(room)) {
    roomMap.set(room, new Set());
  }

  const clients = roomMap.get(room)!;
  clients.add(ws);

  console.log(`Client joined room: ${room}`);

  // Notify other clients in the room
  clients.forEach((client) => {
    if (client !== ws && client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ type: MessageType.USER_JOINED }));
    }
  });
}
