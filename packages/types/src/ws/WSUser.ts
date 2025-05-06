export interface WSUser {
  socket: WebSocket;
  room: string;
  currentRoomRef: { current: string | null };
  roomMap: Map<string, Set<WebSocket>>;
}
