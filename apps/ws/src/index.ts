import { WebSocket, WebSocketServer } from "ws";

const wss = new WebSocketServer({ port: 8080 });

wss.on("connection", (ws: WebSocket) => {
  ws.on("error", (err) => {
    console.error("WebSocket error", err);
  });

  ws.on("message", (message: string) => {
    console.log("Received message:", message);
    ws.send(`Echo: ${message}`);
  });

  ws.on("close", () => {
    console.log("WebSocket connection closed");
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
