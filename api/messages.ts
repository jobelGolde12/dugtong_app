import { CreateMessageRequest, Message, MessageFilter, PaginatedMessages } from "../types/message.types";
import { db, queryRows, querySingle } from "../src/lib/turso";
import { getCurrentUserId } from "./auth";

const mapMessageRow = (row: Record<string, any>): Message => ({
  id: String(row.id),
  sender_id: row.sender_id ? String(row.sender_id) : "",
  subject: row.subject,
  content: row.content,
  is_read: Boolean(row.is_read),
  is_closed: Boolean(row.is_closed),
  created_at: row.created_at,
  updated_at: row.updated_at || undefined,
  sender: row.sender_id
    ? {
        id: String(row.sender_id),
        full_name: row.sender_full_name || "",
        contact_number: row.sender_contact_number || "",
      }
    : undefined,
});

export const messageApi = {
  /**
   * Send a message to admin from donor
   */
  sendMessage: async (data: CreateMessageRequest): Promise<Message> => {
    const now = new Date().toISOString();
    const senderId = await getCurrentUserId();

    const result = await db.execute(`INSERT INTO messages (
        sender_id,
        subject,
        content,
        is_read,
        is_closed,
        created_at
      ) VALUES (?, ?, ?, ?, ?, ?)`, [senderId, data.subject, data.content, 0, 0, now]);

    const insertedId = Number(result?.lastInsertRowid ?? 0);
    const row = await querySingle<Record<string, any>>(
      `SELECT m.*, u.full_name as sender_full_name, u.contact_number as sender_contact_number
       FROM messages m
       LEFT JOIN users u ON u.id = m.sender_id
       WHERE m.id = ?`,
      [insertedId],
    );

    if (!row) {
      throw new Error("Failed to send message.");
    }

    return mapMessageRow(row);
  },

  /**
   * Get list of messages (admin only)
   */
  getMessages: async (
    filter: MessageFilter & { page?: number; page_size?: number }
  ): Promise<PaginatedMessages> => {
    const conditions: string[] = [];
    const args: unknown[] = [];

    if (filter.is_read !== undefined) {
      conditions.push("m.is_read = ?");
      args.push(filter.is_read ? 1 : 0);
    }
    if (filter.is_closed !== undefined) {
      conditions.push("m.is_closed = ?");
      args.push(filter.is_closed ? 1 : 0);
    }
    if (filter.search_query) {
      conditions.push("(m.subject LIKE ? OR m.content LIKE ?)");
      const search = `%${filter.search_query}%`;
      args.push(search, search);
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
    const pageSize = filter.page_size ?? 50;
    const page = filter.page ?? 0;
    const offset = Math.max(0, page) * pageSize;

    const rows = await queryRows<Record<string, any>>(
      `SELECT m.*, u.full_name as sender_full_name, u.contact_number as sender_contact_number
       FROM messages m
       LEFT JOIN users u ON u.id = m.sender_id
       ${whereClause}
       ORDER BY m.created_at DESC
       LIMIT ? OFFSET ?`,
      [...args, pageSize, offset],
    );

    const totalRow = await querySingle<{ count: number }>(
      `SELECT COUNT(*) as count FROM messages m ${whereClause}`,
      args,
    );

    return {
      items: rows.map(mapMessageRow),
      total: Number(totalRow?.count ?? rows.length),
      page,
      page_size: pageSize,
    };
  },

  /**
   * Close a message (admin only)
   */
  closeMessage: async (id: string): Promise<Message> => {
    const now = new Date().toISOString();

    await db.execute("UPDATE messages SET is_closed = 1, updated_at = ? WHERE id = ?", [now, id]);

    const row = await querySingle<Record<string, any>>(
      `SELECT m.*, u.full_name as sender_full_name, u.contact_number as sender_contact_number
       FROM messages m
       LEFT JOIN users u ON u.id = m.sender_id
       WHERE m.id = ?`,
      [id],
    );

    if (!row) {
      throw new Error("Message not found.");
    }

    return mapMessageRow(row);
  },
};
