export type Role = "admin" | "doctor" | "nurse" | "receptionist";

export type User = {
  id: string;
  name: string;
  email: string;
  role: Role;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = {
  name: string;
  email: string;
  password: string;
  role: Role;
};

export type AuthResponse = {
  token: string;
  user: User;
};