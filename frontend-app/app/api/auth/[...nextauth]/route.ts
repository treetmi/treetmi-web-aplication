import NextAuth, { type NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import { API_BASE_URL } from "@/lib/api"

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        id: { label: "Id", type: "text" },
        username: { label: "Username", type: "text" },
        email: { label: "Email", type: "email" },
        token: { label: "Token", type: "text" },
        action: { label: "Action", type: "text" }
      },
      async authorize(credentials) {
        if (!credentials) return null;
        const { id, username, email, token, action } = credentials;

        try {
          if (action === "login_verified") {
            return {
              id: id || username,
              name: username,
              email: email,
              token: token
            };
          }

          // Fallback just in case
          return null;
        } catch (err: any) {
          console.error("NextAuth authorize error:", err);
          throw new Error(err.message || "Gagal melakukan otentikasi.");
        }
      }
    })
  ],
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (account?.provider === "google" && user) {
        try {
          // Sync Gmail sign-in with our backend PostgreSQL database
          const res = await fetch(`${API_BASE_URL}/users/google-auth`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: user.email,
              name: user.name,
              avatarUrl: user.image
            })
          });
          const json = await res.json();
          if (json.success && json.data) {
            token.id = json.data.id;
            token.accessToken = json.token;
            token.name = json.data.username;
            token.picture = json.data.avatar_url;
          }
        } catch (err) {
          console.error("Error syncing Google account with backend:", err);
        }
      } else if (user) {
        token.id = user.id;
        token.accessToken = (user as any).token;
        token.name = user.name;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).accessToken = token.accessToken;
        session.user.name = token.name;
        session.user.image = token.picture as string || null;
      }
      return session;
    },
  },
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
