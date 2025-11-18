export interface ChatRoomRequest {
  chatId?: string;
  name?: string;
  participantIds: string[];
}