import { apiRequest } from "@/shared/api";

export type AuthUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  createdAt?: string;
};

export type LoginResponse = {
  user: AuthUser;
  accessToken: string;
};

export type SignupResponse = {
  user: AuthUser;
  accessToken: string;
  wallets: unknown[];
};

export type LoginBody = {
  email: string;
  password: string;
};

export type SignupBody = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
};

/** `POST /auth/login` — no Bearer. */
export function login(body: LoginBody): Promise<LoginResponse> {
  return apiRequest<LoginResponse>("/auth/login", {
    method: "POST",
    auth: false,
    body,
  });
}

/** `POST /auth/signup` — no Bearer. */
export function signup(body: SignupBody): Promise<SignupResponse> {
  return apiRequest<SignupResponse>("/auth/signup", {
    method: "POST",
    auth: false,
    body,
  });
}

/** `POST /auth/logout` — Bearer; 204 empty body. */
export function logout(): Promise<null> {
  return apiRequest<null>("/auth/logout", {
    method: "POST",
  });
}

/** `GET /auth/me` — Bearer session check. */
export function getMe(): Promise<AuthUser> {
  return apiRequest<AuthUser>("/auth/me");
}
