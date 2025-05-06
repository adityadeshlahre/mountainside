import { WebSocket } from "ws";
import { MessageType } from "@repo/common/constants";

type RoomConnectionMessageHandler = (type: string, data: any) => void;

class RoomManager {
  private static instance: RoomManager;
  private socket: WebSocket = new WebSocket("ws://localhost:8080");
  private room: string;
  private onMessage: RoomConnectionMessageHandler;

  private constructor(room: string, onMessage: RoomConnectionMessageHandler) {
    this.room = room;
    this.onMessage = onMessage;

    this.socket.addEventListener("open", () => {
      console.log(`[Room ${room}] WebSocket open`);
      this.send(MessageType.JOIN);
    });

    this.socket.addEventListener("message", (event: any) => {
      const { type, data } = JSON.parse(event.data);
      console.log(`[Room ${room}] Received:`, type, data);
      this.onMessage(type, data);
    });
  }

  static createNewRoomInstance(
    room: string,
    onMessage: RoomConnectionMessageHandler
  ): RoomManager {
    if (!RoomManager.instance) {
      RoomManager.instance = new RoomManager(room, onMessage);
    }
    return RoomManager.instance;
  }

  send(type: MessageType, data?: any) {
    const message = {
      type,
      room: this.room,
      data,
    };
    this.socket.send(JSON.stringify(message));
  }

  close() {
    this.socket.close();
    RoomManager.instance = null!;
  }
}

export default RoomManager;
