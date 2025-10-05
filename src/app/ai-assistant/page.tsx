"use client";

import React, { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Header } from "@/components/Header";
import { ChatBot } from "@/components/ChatBot";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Bot, 
  MessageSquare, 
  Brain, 
  Lightbulb, 
  TrendingUp,
  DollarSign,
  Target,
  AlertCircle,
  CheckCircle,
  Sparkles
} from "lucide-react";
import Link from "next/link";

export default function AIAssistantPage() {
  const { isLoaded, isSignedIn, user } = useUser();
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Show loading while Clerk is loading
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not signed in
  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-muted-foreground mb-6">Please sign in to access the AI Assistant.</p>
          <Link href="/login" className="text-primary hover:underline">
            Go to Sign In
          </Link>
        </div>
      </div>
    );
  }

  const aiCapabilities = [
    {
      title: "Financial Analysis",
      description: "Get insights into your spending patterns, income trends, and financial health",
      icon: TrendingUp,
      color: "text-blue-600"
    },
    {
      title: "Budget Recommendations",
      description: "Receive personalized budget suggestions based on your financial data",
      icon: Target,
      color: "text-green-600"
    },
    {
      title: "Investment Advice",
      description: "Get guidance on investment opportunities and portfolio optimization",
      icon: DollarSign,
      color: "text-purple-600"
    },
    {
      title: "Goal Setting",
      description: "Set and track financial goals with AI-powered recommendations",
      icon: CheckCircle,
      color: "text-orange-600"
    },
    {
      title: "Expense Optimization",
      description: "Identify areas where you can save money and reduce unnecessary expenses",
      icon: AlertCircle,
      color: "text-red-600"
    },
    {
      title: "Financial Education",
      description: "Learn about personal finance concepts and best practices",
      icon: Brain,
      color: "text-indigo-600"
    }
  ];

  const sampleQuestions = [
    "How can I improve my savings rate?",
    "What are my biggest spending categories?",
    "Should I invest in stocks or bonds?",
    "How much should I save for retirement?",
    "What's the best way to pay off debt?",
    "How can I reduce my monthly expenses?"
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header onToggleChat={() => {}} />
      
      <main 
        className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-all duration-300 ease-in-out"
        style={{
          transform: isChatOpen ? 'translateX(-12rem)' : 'translateX(0)',
          width: isChatOpen ? 'calc(100% - 24rem)' : '100%'
        }}
      >
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Bot className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight mb-4">
            🤖 AI Financial Assistant
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Get personalized financial advice, insights, and recommendations powered by advanced AI technology.
          </p>
          <Button 
            size="lg" 
            onClick={() => setIsChatOpen(true)}
            className="gap-2"
          >
            <MessageSquare className="h-5 w-5" />
            Start Chatting with AI
          </Button>
        </div>

        {/* AI Capabilities */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">What Can AI Help You With?</h2>
            <p className="text-muted-foreground">Our AI assistant is trained to help with all aspects of personal finance</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {aiCapabilities.map((capability, index) => {
              const Icon = capability.icon;
              return (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                        <Icon className={`h-6 w-6 ${capability.color}`} />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-2">{capability.title}</h3>
                        <p className="text-sm text-muted-foreground">{capability.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Sample Questions */}
        <section className="mb-16">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                Try These Questions
              </CardTitle>
              <CardDescription>
                Click on any question below to start a conversation with the AI assistant
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {sampleQuestions.map((question, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="justify-start h-auto p-4 text-left hover:bg-accent"
                    onClick={() => setIsChatOpen(true)}
                  >
                    <MessageSquare className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="text-sm">{question}</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* How It Works */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">How It Works</h2>
            <p className="text-muted-foreground">Simple, secure, and intelligent</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Ask Your Question</h3>
              <p className="text-muted-foreground">
                Type any financial question or concern you have. The AI understands natural language.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">AI Analysis</h3>
              <p className="text-muted-foreground">
                Our AI analyzes your financial data and provides personalized, data-driven insights.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Get Actionable Advice</h3>
              <p className="text-muted-foreground">
                Receive specific recommendations and next steps to improve your financial health.
              </p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center bg-muted/50 rounded-lg p-12">
          <div className="max-w-2xl mx-auto">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-muted-foreground mb-8">
              Start chatting with your AI financial assistant and get personalized advice in seconds.
            </p>
            <Button 
              size="lg" 
              onClick={() => setIsChatOpen(true)}
              className="gap-2"
            >
              <Bot className="h-5 w-5" />
              Start AI Chat
            </Button>
          </div>
        </section>
      </main>

      {/* Chat Bot */}
      <ChatBot isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </div>
  );
}
