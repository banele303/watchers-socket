const express = require("express");
const { createServer } = require("http");
const next = require("next");
const webSocket = require("ws");

// ========================================
// 1 Setup Next Js and Express
// ========================================

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

const server = express();

const httpServer = createServer(server);

// ========================================
// 2 Setup WebSocket Server
// ========================================
const wss = new webSocket.Server({ server: httpServer });

const watchers = new Map();

wss.on("connection", (ws, res) => {
  const productId = req.url && req.url.split("/").pop();
  if (!productId) return;

  //Increment watchers count

  const currentCount = (watchers.get(productId) || 0) + 1;
  watchers.set(productId, currentCount);

  console.log(
    `New connection for Product ${productId} : ${currentCount} watchers`
  );
  //Notify all connected clients about the new watcher count
  wss.clients.forEach((client) => {
    if (client.readyState === webSocket.OPEN) {
      client.send(JSON.stringify({ productId, count: currentCount }));
    }
  });

  //Handle disconnection
  ws.on("close", () => {
    const updatedCount = Math.max((watchers.get(productId) || 0) - 1, 0);

    if (updatedCount === 0) {
      watchers.delete(productId);
    } else {
      watchers.set(productId, updatedCount);
    }
    console.log(
      `Connection closed for Product ${productId} : ${updatedCount} watchers`
    );

    //Notify all clients about the updated watcher count
    wss.clients.forEach((client) => {
      if (client.readyState === webSocket.OPEN) {
        client.send(JSON.stringify({ productId, count: updatedCount }));
      }
    });
  });

  //Send the initial Message
  ws.send(
    JSON.stringify({
      message: "connecter to the websocket server",
      productId,
      count: currentCount,
    })
  );
});

// ========================================
// 3  Handle  Next Js Routing
// ========================================

server.all("*", (req, res) => {
  return handle(req, res);
});

// ========================================
// 3  Start the Server
// ========================================

httpServer.listen(4000, (err) => {
  console.log("Server is running on port 4000");
});
