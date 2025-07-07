const express = require("express");
const http = require("http");
const WebSocket = require("ws");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

let rooms = {};

app.use(express.static("public"));

wss.on("connection", (ws) => {
  let currentRoom = null;
  console.log("✅ WebSocket client connected");

  ws.on("message", (message) => {
    const data = JSON.parse(message);

    if (data.type === "join") {
      const room = data.room;
      currentRoom = room;

      rooms[room] = rooms[room] || [];
      rooms[room].push(ws);

      if (rooms[room].length > 2) {
        ws.send(JSON.stringify({ type: "error", message: "Room full" }));
        return;
      }

      ws.send(JSON.stringify({ type: "init", player: rooms[room].length }));

      if (rooms[room].length === 2) {
        rooms[room].forEach((client, idx) =>
          client.send(JSON.stringify({ type: "start", symbol: idx === 0 ? "X" : "O" }))
        );
      }
    }

    if (data.type === "move" && currentRoom) {
      rooms[currentRoom].forEach(client => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({ type: "move", index: data.index }));
        }
      });
    }
  });

  ws.on("close", () => {
    if (currentRoom) {
      rooms[currentRoom] = rooms[currentRoom].filter(client => client !== ws);
      if (rooms[currentRoom].length === 0) delete rooms[currentRoom];
    }
  });
});

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
