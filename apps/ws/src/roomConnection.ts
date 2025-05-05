import { WebSocket } from "ws";
import WSClient from "./WSClient";

class RoomConnection {
  private static instance: RoomConnection;
  private socket: WebSocket;
  private room: string | null = null;

  private constructor(room: string) {
    this.room = room;
    this.socket = WSClient.getInstance() as unknown as WebSocket;

    this.socket.on("open", () => {
      console.log("WebSocket connection opened");
      this.socket.send(JSON.stringify({ type: "join", room }));
    });

    this.socket.onmessage = (event: any) => {
      const { type, data } = JSON.parse(event.data);
      console.log(`[Room ${room}] Received:`, type, data);
    };
  }

  static getInstance(room: string): RoomConnection {
    if (!RoomConnection.instance) {
      RoomConnection.instance = new RoomConnection(room);
    }
    return RoomConnection.instance;
  }

  send(type: string, data: any) {
    this.socket.send(JSON.stringify({ type, room: this.room, data }));
  }

  close() {
    this.socket.close();
    RoomConnection.instance = null!;
  }
}
