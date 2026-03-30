import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { Server } from "socket.io";
import { createServer } from "http";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });
  const PORT = 3000;

  app.use(express.json());

  // --- Hermes Agent Integration API ---
  // Hermes Agent can POST memory nodes here
  app.post("/api/hermes/memory", (req, res) => {
    const { content, metadata } = req.body;
    console.log("Received Hermes Memory:", { content, metadata });
    
    // In a real app, we'd save this to the local file system or a local DB
    // For now, we'll just acknowledge it.
    res.json({ 
      status: "success", 
      message: "Memory committed to Memori-City Kernel",
      node_id: `hermes_${Date.now()}`
    });
  });

  // API for fetching local "Sovereign" status
  app.get("/api/status", (req, res) => {
    res.json({ 
      mode: "sovereign", 
      storage: "local-first",
      hermes_sync: "active"
    });
  });

  // API for fetching available skills (tools)
  // This can be polled by Hermes Agent or other sub-swarms
  app.get("/api/skills", (req, res) => {
    // In a real app, we'd fetch this from the local DB
    // Since this is server-side and DB is client-side (IndexedDB),
    // we might need a way to sync or just provide a static manifest.
    // For now, we'll return a placeholder that explains how to sync.
    res.json({
      status: "active",
      message: "Skill manifest available via client-side export",
      endpoint: "/api/hermes/memory"
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // --- Socket.io Collaboration Logic ---
  io.on("connection", (socket) => {
    console.log("User connected to Swarm:", socket.id);

    socket.on("join-room", (roomId) => {
      socket.join(roomId);
      console.log(`User ${socket.id} joined Swarm Room: ${roomId}`);
      
      // Update presence in room
      const room = io.sockets.adapter.rooms.get(roomId);
      const count = room ? room.size : 0;
      io.to(roomId).emit("presence-update", count);
    });

    socket.on("memory-added", (data) => {
      const { roomId, memory } = data;
      // Broadcast to everyone else in the room
      socket.to(roomId).emit("remote-memory-added", memory);
    });

    socket.on("memory-deleted", (data) => {
      const { roomId, memoryId } = data;
      socket.to(roomId).emit("remote-memory-deleted", memoryId);
    });

    socket.on("disconnecting", () => {
      for (const roomId of socket.rooms) {
        if (roomId !== socket.id) {
          const room = io.sockets.adapter.rooms.get(roomId);
          const count = room ? room.size - 1 : 0;
          io.to(roomId).emit("presence-update", count);
        }
      }
    });

    socket.on("disconnect", () => {
      console.log("User disconnected from Swarm:", socket.id);
    });
  });

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Memori-City Kernel running on http://localhost:${PORT}`);
    console.log(`Hermes Agent Endpoint: http://localhost:${PORT}/api/hermes/memory`);
  });
}

startServer();
