import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GithubProvider from "next-auth/providers/github";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { sendEmail } from "@/lib/email";
import WelcomeEmail from "@/components/emails/WelcomeEmail";
import React from "react";

export const authOptions: NextAuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
        GithubProvider({
            clientId: process.env.GITHUB_ID!,
            clientSecret: process.env.GITHUB_SECRET!,
        }),
    ],
    pages: {
        signIn: '/login', // We might create a custom login page or just redirect
    },
    callbacks: {
        async signIn({ user }) {
            if (!user.email) return false;
            
            try {
                await dbConnect();
                const existingUser = await User.findOne({ email: user.email });
                
                if (!existingUser) {
                    await User.create({
                        email: user.email,
                        name: user.name,
                        plan: 'free'
                    });
                    
                    // Send welcome email in background
                    sendEmail({
                        to: user.email,
                        subject: "Welcome to QuantaCipher",
                        react: React.createElement(WelcomeEmail, { name: user.name || "User" })
                    }).catch(err => console.error("Failed to send welcome email:", err));
                }
                return true;
            } catch (error) {
                console.error("Error in signIn callback:", error);
                return true;
            }
        },
        async session({ session, token }) {
            return session;
        },
    },
    secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
