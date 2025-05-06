import { WebSocket } from "ws";
import { WSUser } from "../ws/WSUser";

export type RoomMap = Map<string, Set<WebSocket>>;

export interface Room {
  id: string;
  clients: WSUser[];
  currentRoomRef: { current: string | null };
  roomMap: Map<string, Set<WebSocket>>;
}
