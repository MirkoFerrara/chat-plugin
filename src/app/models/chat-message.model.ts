export interface ChatMessageModel {
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
  isRead?: boolean;
  reactions?: MessageReactionModel[];
  replyTo?: string;
  editedAt?: string;
}

export interface MessageReactionModel {
  userId: string;
  emoji: string;
}