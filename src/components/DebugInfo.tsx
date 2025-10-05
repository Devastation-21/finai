"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function DebugInfo() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="text-sm">Debug Information</CardTitle>
      </CardHeader>
      <CardContent className="text-xs space-y-2">
        <div>
          <strong>Supabase URL:</strong> {supabaseUrl ? '✅ Set' : '❌ Missing'}
        </div>
        <div>
          <strong>Supabase Key:</strong> {supabaseKey ? '✅ Set' : '❌ Missing'}
        </div>
        <div>
          <strong>Clerk Key:</strong> {clerkKey ? '✅ Set' : '❌ Missing'}
        </div>
        <div className="mt-2 p-2 bg-muted rounded text-xs">
          <strong>Environment:</strong> {process.env.NODE_ENV}
        </div>
      </CardContent>
    </Card>
  );
}

