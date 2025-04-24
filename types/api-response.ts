export interface ApiResponse {
  message: string;
  statusCode?: number;
  [key: string]: any;
} 