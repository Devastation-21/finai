"use client";

import React from "react";
import { SignIn } from "@clerk/nextjs";
import { 
  Wallet, 
  Sparkles, 
  Sun,
  Moon
} from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const { theme, setTheme } = useTheme();
  const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_60%,transparent_100%)] -z-10" />
      
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 p-4">
        <div className="container flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="relative">
              <Wallet className="h-8 w-8 text-primary" />
              <div className="absolute -top-1 -right-1">
                <Sparkles className="h-3 w-3 text-yellow-500" />
              </div>
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                FinAI
              </h1>
              <p className="text-xs text-muted-foreground -mt-1">
                Financial Intelligence Platform
              </p>
            </div>
          </Link>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="h-8 w-8"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
        </div>
      </header>

      {/* Clerk Sign In */}
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold mb-2">Welcome to FinAI</h1>
          <p className="text-muted-foreground">
            Sign in to access your financial dashboard
          </p>
        </div>
        
        {!clerkKey ? (
          <div className="text-center p-8 border border-border rounded-lg bg-card">
            <h2 className="text-lg font-semibold mb-4">Setup Required</h2>
            <p className="text-muted-foreground mb-4">
              Please configure Clerk authentication to use the login feature.
            </p>
            <div className="text-left bg-muted p-4 rounded-lg mb-4">
              <p className="text-sm font-mono">
                1. Go to <a href="https://clerk.com" target="_blank" className="text-primary hover:underline">clerk.com</a> and create an account<br/>
                2. Create a new application<br/>
                3. Copy your publishable key<br/>
                4. Create a <code className="bg-background px-1 rounded">.env.local</code> file with:<br/>
                <code className="bg-background px-1 rounded">NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_key_here</code>
              </p>
            </div>
            <Link href="/dashboard">
              <Button>Continue to Demo</Button>
            </Link>
          </div>
        ) : (
          <SignIn 
            appearance={{
              elements: {
                formButtonPrimary: "bg-primary hover:bg-primary/90 text-primary-foreground",
                card: "bg-card border-border shadow-lg",
                headerTitle: "text-foreground",
                headerSubtitle: "text-muted-foreground",
                socialButtonsBlockButton: "border-border hover:bg-accent",
                formFieldInput: "bg-background border-border",
                footerActionLink: "text-primary hover:text-primary/80",
              },
            }}
          />
        )}
      </div>
    </div>
  );
}
