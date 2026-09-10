import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { verifyTelegramAuth, type TelegramAuthData } from "@/lib/telegram";
import { ADMIN_ROLE_LIST } from "@/lib/roles";

export const ADMIN_ROLES = ADMIN_ROLE_LIST;

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  trustHost: true,
  providers: [
    // Staff / admin login with email + password
    Credentials({
      id: "credentials",
      name: "Email & Password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;
        if (!email || !password) return null;

        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.email, email.toLowerCase()))
          .limit(1);

        if (!user || !user.passwordHash) return null;
        if (user.banned) return null;

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role,
          username: user.username ?? undefined,
        };
      },
    }),
    // Telegram Login Widget
    Credentials({
      id: "telegram",
      name: "Telegram",
      credentials: {
        id: { label: "id", type: "text" },
        first_name: { label: "first_name", type: "text" },
        last_name: { label: "last_name", type: "text" },
        username: { label: "username", type: "text" },
        photo_url: { label: "photo_url", type: "text" },
        auth_date: { label: "auth_date", type: "text" },
        hash: { label: "hash", type: "text" },
      },
      async authorize(raw) {
        if (!raw) return null;
        const data = raw as unknown as TelegramAuthData;
        if (!data?.id || !data?.hash || !data?.auth_date) return null;

        const isValid = verifyTelegramAuth(raw as unknown as Record<string, unknown>);
        if (!isValid) {
          console.error("[telegram] hash verification failed");
          return null;
        }

        const telegramId = String(data.id);
        const [existing] = await db
          .select()
          .from(users)
          .where(eq(users.telegramId, telegramId))
          .limit(1);

        const fullName = [data.first_name, data.last_name].filter(Boolean).join(" ");

        if (existing) {
          if (existing.banned) return null;
          // keep profile info fresh
          await db
            .update(users)
            .set({
              name: fullName || existing.name,
              telegramUsername: data.username || existing.telegramUsername,
              image: data.photo_url || existing.image,
              updatedAt: new Date(),
            })
            .where(eq(users.id, existing.id));

          return {
            id: existing.id,
            name: fullName || existing.name,
            image: data.photo_url || existing.image,
            role: existing.role,
            username: existing.username ?? undefined,
          };
        }

        let chosenUsername = data.username || `user_${telegramId}`;
        const [existingUserWithUsername] = await db
          .select({ id: users.id })
          .from(users)
          .where(eq(users.username, chosenUsername))
          .limit(1);

        if (existingUserWithUsername) {
          chosenUsername = `${chosenUsername}_${Math.floor(1000 + Math.random() * 9000)}`;
        }

        const [created] = await db
          .insert(users)
          .values({
            name: fullName || chosenUsername,
            username: chosenUsername,
            telegramId,
            telegramUsername: data.username || null,
            image: data.photo_url || null,
            role: "USER",
          })
          .returning();

        return {
          id: created.id,
          name: created.name,
          image: created.image,
          role: created.role,
          username: created.username ?? undefined,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.role = (user as { role?: string }).role ?? "USER";
        token.username = (user as { username?: string }).username;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = (token.role as string) ?? "USER";
        session.user.username = token.username as string | undefined;
      }
      return session;
    },
  },
});

export { isStaffRole } from "@/lib/roles";
