import { WebSocket } from "ws";

export type RoomMap = Map<string, Set<WebSocket>>;
