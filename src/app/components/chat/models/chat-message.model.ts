export interface ChatMessage {
  chatId: string;
  messageId: string;
  senderId: string;
  type: 'text' | 'file' | 'heartbeat';
  content: string;
  sequence?: number;
  fileUrl?: string;
  fileName?: string;
  createdAt: string;
  localUrl?: string;

  // Opzionale - per future features
  isRead?: boolean;
  reactions?: MessageReaction[];
  replyTo?: string; // messageId del messaggio a cui si risponde
  editedAt?: string;
}

export interface MessageReaction {
  userId: string;
  emoji: string;
}