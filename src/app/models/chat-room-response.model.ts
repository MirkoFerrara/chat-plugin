export interface ChatRoomResponseModel {
  id: string;
  name?: string;
  participantIds: string[];
  createdAt: string;
}