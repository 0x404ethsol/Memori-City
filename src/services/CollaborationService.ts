import { io, Socket } from "socket.io-client";
import { db } from "../db";
import { MemoriNode } from "../types";

class CollaborationService {
  private socket: Socket | null = null;
  private roomId: string | null = null;
  private onPresenceUpdate: ((count: number) => void) | null = null;

  connect() {
    // In dev, we connect to the same host
    this.socket = io();
    this.setupListeners();
  }

  joinRoom(roomId: string) {
    this.roomId = roomId;
    this.socket?.emit("join-room", roomId);
  }

  setPresenceCallback(callback: (count: number) => void) {
    this.onPresenceUpdate = callback;
  }

  private setupListeners() {
    if (!this.socket) return;

    this.socket.on("connect", () => {
      console.log("Connected to Swarm Relay");
    });

    this.socket.on("remote-memory-added", async (memory: MemoriNode) => {
      console.log("Remote memory synced:", memory.id);
      try {
        const exists = await db.vault.get(memory.id);
        if (!exists) {
          await db.vault.add(memory);
        }
      } catch (err) {
        console.error("Failed to sync remote memory:", err);
      }
    });

    this.socket.on("remote-memory-deleted", async (memoryId: string) => {
      console.log("Remote memory purged:", memoryId);
      try {
        await db.vault.delete(memoryId);
      } catch (err) {
        console.error("Failed to purge remote memory:", err);
      }
    });

    this.socket.on("presence-update", (count: number) => {
      this.onPresenceUpdate?.(count);
    });
  }

  broadcastMemoryAdded(memory: MemoriNode) {
    if (this.roomId && this.socket?.connected) {
      this.socket.emit("memory-added", { roomId: this.roomId, memory });
    }
  }

  broadcastMemoryDeleted(memoryId: string) {
    if (this.roomId && this.socket?.connected) {
      this.socket.emit("memory-deleted", { roomId: this.roomId, memoryId });
    }
  }

  disconnect() {
    this.socket?.disconnect();
    this.socket = null;
    this.roomId = null;
  }

  get isConnected() {
    return this.socket?.connected || false;
  }
}

export const collaborationService = new CollaborationService();
