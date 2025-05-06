import { WebSocket, WebSocketServer } from "ws";
import { RoomMap } from "@repo/types/index";
import { handleMessageRouter } from "./handle/handleMessageRouter";
import { MessageType } from "@repo/common/constants";

const wss = new WebSocketServer({ port: 8080 });

const roomMap: RoomMap = new Map();

wss.on("connection", (ws: WebSocket) => {
  let currentRoomRef = { current: null };

  ws.on("error", (err) => {
    console.error("WebSocket error", err);
  });

  ws.on("message", (rawMessage) => {
    const message = JSON.parse(rawMessage.toString());
    console.log("Received message:", message);
    handleMessageRouter({
      ws,
      message,
      roomMap,
      currentRoomRef,
    });
  });

  ws.on("close", () => {
    console.log("Connection closed");
    const room = currentRoomRef.current;
    if (room && roomMap.has(room)) {
      const roomClients = roomMap.get(room);
      roomClients?.delete(ws);
      if (roomClients?.size === 0) {
        roomMap.delete(room);
      }
    }
  });
});

wss.on("listening", () => {
  const address = wss.address();
  if (address && typeof address === "object") {
    console.log(
      `WebSocket server is listening on ws://${address.address}:${address.port}`
    );
  } else {
    console.log("WebSocket server is listening");
  }
});
