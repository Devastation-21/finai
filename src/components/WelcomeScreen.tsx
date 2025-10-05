"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Sparkles, 
  Shield, 
  Zap, 
  Upload, 
  BarChart3, 
  CreditCard,
  FileText,
  TrendingUp,
  PieChart,
  DollarSign
} from "lucide-react";

interface WelcomeScreenProps {
  onGetStarted: () => void;
}

export function WelcomeScreen({ onGetStarted }: WelcomeScreenProps) {
  const features = [
    {
      icon: <Sparkles className="h-6 w-6" />,
      title: "AI-Powered Analysis",
      description: "Smart categorization and insights from your financial data"
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Bank-Level Security",
      description: "Your data is encrypted and protected with enterprise-grade security"
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: "Real-Time Updates",
      description: "Get instant insights as you add transactions and upload documents"
    },
    {
      icon: <BarChart3 className="h-6 w-6" />,
      title: "Visual Analytics",
      description: "Beautiful charts and graphs to understand your spending patterns"
    },
    {
      icon: <CreditCard className="h-6 w-6" />,
      title: "Transaction Management",
      description: "Easily add, edit, and categorize your financial transactions"
    },
    {
      icon: <FileText className="h-6 w-6" />,
      title: "Document Upload",
      description: "Upload bank statements, receipts, and other financial documents"
    }
  ];

  const quickActions = [
    {
      icon: <Upload className="h-5 w-5" />,
      title: "Upload Documents",
      description: "Start by uploading your bank statements or receipts",
      action: "Upload Now"
    },
    {
      icon: <CreditCard className="h-5 w-5" />,
      title: "Add Transactions",
      description: "Manually add your recent transactions",
      action: "Add Transaction"
    },
    {
      icon: <BarChart3 className="h-5 w-5" />,
      title: "View Analytics",
      description: "Explore your financial insights and trends",
      action: "View Dashboard"
    }
  ];

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center py-12">
        <div className="w-20 h-20 bg-gradient-to-br from-primary to-primary/60 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Sparkles className="h-10 w-10 text-white" />
        </div>
        <h1 className="text-4xl font-bold mb-4">
          Welcome to <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">FinAI</span>
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Your AI-powered personal finance assistant. Upload documents, track transactions, and get intelligent insights to manage your money better.
        </p>
        
        <div className="flex justify-center gap-4 flex-wrap mb-8">
          <Badge variant="secondary" className="gap-2 px-4 py-2">
            <Sparkles className="h-4 w-4" />
            AI-Powered
          </Badge>
          <Badge variant="secondary" className="gap-2 px-4 py-2">
            <Shield className="h-4 w-4" />
            Secure
          </Badge>
          <Badge variant="secondary" className="gap-2 px-4 py-2">
            <Zap className="h-4 w-4" />
            Real-time
          </Badge>
        </div>

        <Button size="lg" onClick={onGetStarted} className="gap-2">
          <Upload className="h-5 w-5" />
          Get Started
        </Button>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-muted/50 rounded-2xl p-8">
        <h2 className="text-2xl font-bold text-center mb-8">Quick Start</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {quickActions.map((action, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4 text-primary">
                  {action.icon}
                </div>
                <h3 className="font-semibold mb-2">{action.title}</h3>
                <p className="text-sm text-muted-foreground mb-4">{action.description}</p>
                <Button variant="outline" size="sm" className="w-full">
                  {action.action}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Stats Preview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6 text-center">
            <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-green-600">$0</p>
            <p className="text-sm text-muted-foreground">Total Income</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <DollarSign className="h-8 w-8 text-red-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-red-600">$0</p>
            <p className="text-sm text-muted-foreground">Total Expenses</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <PieChart className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-blue-600">$0</p>
            <p className="text-sm text-muted-foreground">Savings</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <Shield className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-purple-600">0/100</p>
            <p className="text-sm text-muted-foreground">Health Score</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

