import { WebSocket } from "ws";
import { RoomMap } from "@repo/types";
import { MessageType } from "@repo/common/constants";

export function handleLeave(
  ws: WebSocket,
  message: any, // `message.data` will contain the relevant data
  roomMap: RoomMap,
  currentRoomRef: { current: string | null }
) {
  // Remove the client from the room map
  if (currentRoomRef.current) {
    const clients = roomMap.get(currentRoomRef.current);
    if (clients) {
      clients.delete(ws);
      // Notify others in the room that a peer has left
      for (const client of clients) {
        if (client.readyState === WebSocket.OPEN) {
          client.send(
            JSON.stringify({ type: MessageType.LEAVE, data: message.data })
          );
        }
      }
      // If the room is empty, delete it from the map
      if (clients.size === 0) {
        roomMap.delete(currentRoomRef.current);
      }
      currentRoomRef.current = null;
    }
  }
  console.log("Client is leaving the room");
}
