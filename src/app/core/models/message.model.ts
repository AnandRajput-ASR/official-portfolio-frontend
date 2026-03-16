export interface Message {
  id: string;
  name: string;
  email: string;
  message: string;
  read: boolean;
  starred: boolean;
  receivedAt: string;
}

export interface MessagesResponse {
  messages: Message[];
  unreadCount: number;
}
