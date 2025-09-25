import type { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "./prisma";
import { resolveDeviceHash } from "./device";

// Moderator authentication (existing)
export interface ModeratorSession {
  moderatorId: string;
}

const MODERATOR_SECRET = process.env.MODERATOR_SECRET;

export async function requireModerator(req: NextRequest): Promise<ModeratorSession> {
  if (!MODERATOR_SECRET) {
    throw new Error("MOD_AUTH_NOT_CONFIGURED");
  }

  const header =
    req.headers.get("x-moderator-secret") ?? req.headers.get("authorization") ?? "";

  const token = header.startsWith("Bearer ") ? header.slice(7) : header;

  if (!token || token !== MODERATOR_SECRET) {
    throw new Error("UNAUTHORIZED");
  }

  return {
    moderatorId: "secret",
  };
}

// User authentication (new)
const USER_SESSION_COOKIE = "rip_user_session";

export interface User {
  id: string;
  email: string;
  name?: string;
  picture?: string;
  isModerator?: boolean;
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    // Check session cookie first
    const sessionUser = getUserSession();
    if (sessionUser) {
      return sessionUser;
    }

    // If no session but we have device hash, try to find user in database
    const deviceHash = resolveDeviceHash();
    const user = await prisma.user.findFirst({
      where: { deviceHash },
      select: {
        id: true,
        email: true,
        name: true,
        picture: true,
        isModerator: true,
      }
    });
    
    return user ? {
      id: user.id,
      email: user.email,
      name: user.name || undefined,
      picture: user.picture || undefined,
      isModerator: user.isModerator,
    } : null;
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
}

// New moderator authentication based on user permissions
export async function requireUserModerator(): Promise<User> {
  const user = await getCurrentUser();
  
  if (!user) {
    throw new Error("AUTHENTICATION_REQUIRED");
  }
  
  if (!user.isModerator) {
    throw new Error("MODERATOR_PERMISSIONS_REQUIRED");
  }
  
  return user;
}

export async function createOrGetUser(username: string): Promise<User | null> {
  try {
    const deviceHash = resolveDeviceHash();
    
    // TODO: Uncomment when Prisma client is regenerated
    // // Check if user already exists for this device
    // const existingUser = await prisma.user.findFirst({
    //   where: { deviceHash }
    // });
    
    // if (existingUser) {
    //   return {
    //     id: existingUser.id,
    //     username: existingUser.username,
    //     deviceHash: existingUser.deviceHash
    //   };
    // }
    
    // // Create new user
    // const newUser = await prisma.user.create({
    //   data: {
    //     username: username.toLowerCase(),
    //     deviceHash
    //   }
    // });
    
    // return {
    //   id: newUser.id,
    //   username: newUser.username,
    //   deviceHash: newUser.deviceHash
    // };
    
    // Temporary placeholder
    return null;
  } catch (error) {
    console.error("Error creating user:", error);
    return null;
  }
}

export function setUserSession(user: User) {
  cookies().set(USER_SESSION_COOKIE, JSON.stringify(user), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
}

export function getUserSession(): User | null {
  try {
    const sessionCookie = cookies().get(USER_SESSION_COOKIE)?.value;
    if (!sessionCookie) return null;
    
    return JSON.parse(sessionCookie) as User;
  } catch {
    return null;
  }
}

export function clearUserSession() {
  cookies().delete(USER_SESSION_COOKIE);
}

export function getUserCookieName() {
  return USER_SESSION_COOKIE;
}
