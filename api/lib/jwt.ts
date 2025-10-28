import { SignJWT, jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-this-in-production'
);

export interface UserData {
  id: string;
  email: string;
  name: string;
  tokens: any;
}

export async function createToken(data: UserData): Promise<string> {
  const token = await new SignJWT({ data })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(JWT_SECRET);

  return token;
}

export async function verifyToken(token: string): Promise<UserData | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload.data as UserData;
  } catch (error) {
    return null;
  }
}

export function getTokenFromCookie(cookieHeader: string | undefined): string | null {
  if (!cookieHeader) return null;

  const cookies = cookieHeader.split(';').map(c => c.trim());
  const authCookie = cookies.find(c => c.startsWith('auth='));

  if (!authCookie) return null;

  return authCookie.split('=')[1];
}
