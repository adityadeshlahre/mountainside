import { WebSocket, WebSocketServer } from "ws";
import { RoomMap } from "@repo/types/index";
import { MessageType } from "./constants";
import { handleJoin } from "./handle/handleJoin";
import { handleMessageRouter } from "./handle/handleMessageRouter";

const wss = new WebSocketServer({ port: 8080 });

const roomMap: RoomMap = new Map();

wss.on("connection", (ws: WebSocket) => {
  // @ts-expect-error prefer-const
  let currentRoomRef = { current: null };

  ws.on("error", (err) => {
    console.error("WebSocket error", err);
  });
  ws.on("message", (rawMessage) => {
    const message = JSON.parse(rawMessage.toString());
    handleMessageRouter({
      ws,
      message,
      roomMap,
      currentRoomRef,
    });
  });

  ws.on("close", () => {
    console.log("Connection closed");
    // Remove ws from roomMap when the connection closes
    if (currentRoomRef.current) {
      const roomClients = roomMap.get(currentRoomRef.current);
      roomClients?.delete(ws);
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
