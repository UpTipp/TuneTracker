// session.d.ts
import 'express-session';

declare module 'express-session' {
  interface SessionData {
    passport: [];
    userId: string;
    isAdmin: boolean;
    email?: string;
    // Add other properties as needed
  }
}