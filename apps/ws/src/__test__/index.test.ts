import { WebSocketServer, WebSocket } from "ws";

let server: WebSocketServer;

jest.setTimeout(1000);

describe("WebSocket Server", () => {
  beforeAll((done) => {
    server = new WebSocketServer({ port: 8081 });

    server.on("connection", (ws: WebSocket) => {
      ws.on("message", (message) => {
        ws.send(`Echo: ${message}`);
      });
    });

    server.on("listening", () => {
      console.log("WebSocket server is listening on ws://localhost:8081");
      done();
    });
  });

  afterAll((done) => {
    server.close(done);
  });

  test("WebSocket echo test", (done) => {
    const ws = new WebSocket("ws://localhost:8081");

    ws.on("open", () => {
      ws.send("Test message");
    });

    ws.on("message", (data) => {
      expect(data.toString()).toBe("Echo: Test message");
      ws.close();
      done();
    });

    ws.on("error", (err) => {
      done(err);
    });
  });
});
