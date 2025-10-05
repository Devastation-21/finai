"use client";

import React, { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Header } from "@/components/Header";
import { FileUpload } from "@/components/FileUpload";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Upload, 
  BarChart3, 
  Brain, 
  Shield, 
  Zap, 
  ArrowRight,
  CheckCircle,
  Star,
  Users,
  TrendingUp,
  CreditCard,
  Target,
  Bot,
  FileText,
  Settings,
  Home,
  PieChart,
  DollarSign,
  Activity,
  Sparkles
} from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  const { isLoaded, isSignedIn, user } = useUser();
  const [isUploading, setIsUploading] = useState(false);

  // Show loading while Clerk is loading
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const handleFileUpload = async (file: File) => {
    // Check if user is authenticated
    if (!isSignedIn) {
      // Redirect to login page
      window.location.href = '/login';
      return;
    }

    setIsUploading(true);
    // Simulate upload process
    setTimeout(() => {
      setIsUploading(false);
      // Redirect to dashboard after upload
      window.location.href = '/dashboard';
    }, 2000);
  };

  const quickActions = [
    {
      title: "Upload Financial Data",
      description: "Upload CSV, Excel, or PDF files to get started",
      icon: Upload,
      href: "#upload",
      color: "bg-blue-500",
      action: () => document.getElementById('upload-section')?.scrollIntoView({ behavior: 'smooth' })
    },
    {
      title: "View Dashboard",
      description: "See your financial overview and insights",
      icon: BarChart3,
      href: "/dashboard",
      color: "bg-green-500"
    },
    {
      title: "Manage Transactions",
      description: "Add, edit, and categorize transactions",
      icon: CreditCard,
      href: "/transactions",
      color: "bg-purple-500"
    },
    {
      title: "AI Assistant",
      description: "Get personalized financial advice",
      icon: Bot,
      href: "/ai-assistant",
      color: "bg-orange-500"
    }
  ];

  const features = [
    {
      title: "AI-Powered Analysis",
      description: "Smart categorization and insights from your financial data",
      icon: Brain,
      color: "text-blue-600"
    },
    {
      title: "Real-Time Analytics",
      description: "Beautiful charts and graphs to understand your spending patterns",
      icon: PieChart,
      color: "text-green-600"
    },
    {
      title: "Budget Tracking",
      description: "Set goals and track your progress with smart alerts",
      icon: Target,
      color: "text-purple-600"
    },
    {
      title: "Secure & Private",
      description: "Bank-level security with end-to-end encryption",
      icon: Shield,
      color: "text-red-600"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header onToggleChat={() => {}} />
      
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <section className="text-center py-16">
          <div className="max-w-4xl mx-auto">
            <Badge variant="outline" className="mb-4">
              <Sparkles className="mr-2 h-3 w-3" />
              AI-Powered
            </Badge>
            
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
              Smart <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">Finance</span>
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Upload. Analyze. Optimize.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button 
                size="lg" 
                className="gap-2" 
                onClick={() => {
                  if (!isSignedIn) {
                    window.location.href = '/login';
                    return;
                  }
                  document.getElementById('upload-section')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                <Upload className="h-5 w-5" />
                Upload Data
              </Button>
              <Link href="/dashboard">
                <Button size="lg" variant="outline" className="gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Dashboard
                </Button>
              </Link>
            </div>

            {/* Quick Stats */}
            
          </div>
        </section>

        {/* Quick Actions */}
        <section className="py-16">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2">Quick Start</h2>
          </div>
          
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer group border-muted">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                      <Icon className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <h3 className="font-semibold mb-2">{action.title}</h3>
                    <p className="text-xs text-muted-foreground mb-3">{action.description}</p>
                    {action.action ? (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => {
                          if (action.title === "Upload Financial Data" && !isSignedIn) {
                            window.location.href = '/login';
                            return;
                          }
                          action.action?.();
                        }} 
                        className="w-full"
                      >
                        Start
                      </Button>
                    ) : (
                      <Link href={action.href}>
                        <Button variant="outline" size="sm" className="w-full">
                          Start
                        </Button>
                      </Link>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Upload Section */}
        <section id="upload-section" className="py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Upload Your Financial Data</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Simply drag and drop your financial files to get instant AI-powered analysis and insights
            </p>
          </div>
          
          <div className="max-w-2xl mx-auto">
            {!isSignedIn ? (
              <Card className="border-muted">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <Upload className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Sign In Required</h3>
                  <p className="text-muted-foreground mb-6">
                    Please sign in to upload and analyze your financial data
                  </p>
                  <Button onClick={() => window.location.href = '/login'} className="gap-2">
                    <Upload className="h-4 w-4" />
                    Sign In to Upload
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <>
                <FileUpload 
                  onFileUpload={handleFileUpload}
                  uploadStatus={{ status: "idle" }}
                />
                
                {isUploading && (
                  <div className="mt-6 text-center">
                    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    <p className="text-muted-foreground">Processing your data...</p>
                  </div>
                )}
              </>
            )}
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-16">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2">Features</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="text-center border-muted">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center mx-auto mb-4">
                      <Icon className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <h3 className="font-semibold mb-2">{feature.title}</h3>
                    <p className="text-xs text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* CTA Section */}
        
      </main>
    </div>
  );
}