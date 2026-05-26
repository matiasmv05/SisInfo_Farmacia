export interface LoginRequest {
  username: string;
  password: string;
  email?: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: number;
    name: string;
    email: string;
  };
}