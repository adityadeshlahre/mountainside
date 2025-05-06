import { WebSocket } from "ws";
import { RoomMap } from "@repo/types";
import { MessageType } from "@repo/common/constants";

export function handleOffer(
  ws: WebSocket,
  offer: RTCSessionDescriptionInit,
  roomMap: RoomMap,
  currentRoomRef: { current: string | null }
) {
  // Broadcast the offer to the other client in the room
  const clients = roomMap.get(currentRoomRef.current!);
  if (clients) {
    for (const client of clients) {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ type: MessageType.OFFER, data: offer }));
      }
    }
  }
}
