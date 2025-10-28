import 'express-session';

declare module 'express-session' {
  interface SessionData {
    tokens?: {
      access_token: string;
      refresh_token?: string;
      scope: string;
      token_type: string;
      expiry_date: number;
    };
    user?: {
      id: string;
      email: string;
      name: string;
    };
  }
}
