import { useState, useEffect } from "react";

// eslint-disable-next-line no-constant-binary-expression
const WS_URL = `ws://localhost:8080`;
// const WS_URL = `wss://mountainside-ws.onrender.com`;

export function useSocket(): { socket: WebSocket; loading: boolean } {
  const [socket, setSocket] = useState<WebSocket>();
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const ws = new WebSocket(WS_URL);

    ws.onopen = () => {
      console.log("connected to server");
      setLoading(false);
    };

    ws.onclose = () => {
      console.log("disconnected from server");
      setLoading(true);
    };

    ws.onerror = (error) => {
      console.error("WebSocket error: ", error);
      setLoading(true);
    };

    setSocket(ws);

    return () => {
      ws.close();
    };
  }, []);

  return { socket: socket as WebSocket, loading };
}
