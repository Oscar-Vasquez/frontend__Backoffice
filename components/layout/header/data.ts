export const notifications: Notification[] = [];

export const messages: Message[] = [];

export interface Message {
  title: string;
  desc: string;
  active: boolean;
  hasnotifaction: boolean;
  notification_count?: number;
  image?: string;
  link: string;
  date: string;
}

export interface Notification {
  id: number;
  title: string;
  role: string;
  desc: string;
  avatar: string;
  status: string;
  unreadmessage: boolean;
  date: string;
}
