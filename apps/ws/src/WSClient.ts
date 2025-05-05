class WSClient {
  private static instance: WebSocket;
  private static url = "ws://localhost:8080";

  static getInstance(): WebSocket {
    if (
      !WSClient.instance ||
      WSClient.instance.readyState === WebSocket.CLOSED
    ) {
      WSClient.instance = new WebSocket(WSClient.url);
    }
    return WSClient.instance;
  }
}

export default WSClient;
