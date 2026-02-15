import { sql } from "bun";
import { createCanvas } from "canvas";

interface Message {
  id: number;
  name: string;
  message: string;
  timestamp: Date;
}

/**
 * Fetches all messages from the database
 */
async function getMessages(): Promise<Message[]> {
  const result = await sql`
    SELECT id, name, message, timestamp 
    FROM messages 
    ORDER BY timestamp DESC
  `;
  return result as Message[];
}

/**
 * Renders messages to a PNG image using canvas
 */
export async function renderMessagesImage(): Promise<Buffer> {
  const messages = await getMessages();
  
  // Canvas dimensions
  const width = 600;
  const lineHeight = 30;
  const padding = 20;
  const headerHeight = 60;
  const messageHeight = messages.length * lineHeight + (messages.length > 0 ? 20 : 0);
  const height = headerHeight + messageHeight + padding * 2;
  
  // Create canvas
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");
  
  // Background
  ctx.fillStyle = "#f0f0f0";
  ctx.fillRect(0, 0, width, height);
  
  // Header
  ctx.fillStyle = "#333";
  ctx.font = "bold 24px Arial";
  ctx.fillText("Jendova epická Nástěnka", padding, 40);
  
  // Messages
  ctx.font = "16px Arial";
  let y = headerHeight + padding;
  
  if (messages.length === 0) {
    ctx.fillStyle = "#999";
    ctx.fillText("Žádné zprávy, buď první!", padding, y);
  } else {
    messages.forEach((msg, index) => {
      ctx.fillStyle = "#000";
      ctx.font = "bold 16px Arial";
      ctx.fillText(`${msg.name}:`, padding, y);
      
      ctx.font = "16px Arial";
      ctx.fillStyle = "#333";
      const nameWidth = ctx.measureText(`${msg.name}:`).width;
      ctx.fillText(msg.message, padding + nameWidth + 10, y);
      
      ctx.font = "12px Arial";
      ctx.fillStyle = "#999";
      const timestamp = new Date(msg.timestamp).toLocaleString();
      ctx.fillText(timestamp, width - padding - 150, y);
      
      y += lineHeight;
    });
  }
  
  // Return PNG buffer
  return canvas.toBuffer("image/png");
}

/**
 * Submits a new message to the database
 */
export async function submitMessage(name: string, message: string): Promise<{ id: number }> {
  if (!name || !message) {
    throw new Error("Name and message are required");
  }
  
  if (name.length > 100 || message.length > 500) {
    throw new Error("Name or message too long");
  }
  
  const result = await sql`
    INSERT INTO messages (name, message)
    VALUES (${name}, ${message})
    RETURNING id
  `;
  
  return result[0] as { id: number };
}

