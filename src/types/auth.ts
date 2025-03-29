
export interface User {
  id: string;
  phoneNumber: string;
  name: string | null;
  email: string;
  balance: number;
  createdAt: string;
}

export interface AuthResponse {
  message: string;
  token: string;
}
