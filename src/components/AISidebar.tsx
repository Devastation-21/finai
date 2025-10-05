"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  X, 
  Send, 
  Bot, 
  Sparkles, 
  Loader2,
  MessageSquare,
  TrendingUp,
  DollarSign,
  Target,
  BarChart3
} from "lucide-react";
import { ChatMessage } from "@/types";
import { useUser } from "@clerk/nextjs";
import { useSidebar } from "@/contexts/SidebarContext";

interface AISidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AISidebar({ isOpen, onClose }: AISidebarProps) {
  const { user, isLoaded } = useUser();
  const { sidebarWidth, setSidebarWidth, isResizing, setIsResizing } = useSidebar();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Function to strip bold formatting from AI responses
  const stripBoldFormatting = (text: string) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '$1') // Remove **bold** formatting
      .replace(/\*(.*?)\*/g, '$1');    // Remove *italic* formatting
  };
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Resize functionality
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isResizing) return;
    
    const newWidth = window.innerWidth - e.clientX;
    const minWidth = 300; // Minimum width
    const maxWidth = 600; // Maximum width
    
    if (newWidth >= minWidth && newWidth <= maxWidth) {
      setSidebarWidth(newWidth);
    }
  };

  const handleMouseUp = () => {
    setIsResizing(false);
  };

  // Add event listeners for resize
  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading || !isLoaded) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: inputValue.trim(),
      role: "user",
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message: inputValue.trim(),
          userId: user?.id || null,
          context: 'financial_assistant'
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        const aiResponse: ChatMessage = {
          id: (Date.now() + 1).toString(),
          content: data.message,
          role: "assistant",
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, aiResponse]);
      } else {
        throw new Error(data.error || 'Failed to get response');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      const errorResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: `Sorry, I encountered an error: ${errorMessage}. Please try again.`,
        role: "assistant",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickActions = [
    { label: "💰 Save Money", prompt: "How can I save more money?" },
    { label: "📊 Analyze", prompt: "Analyze my spending patterns" },
    { label: "❤️ Health", prompt: "What's my financial health?" },
    { label: "📋 Budget", prompt: "Budget tips for me" },
    { label: "💡 Tips", prompt: "Give me financial tips" },
    { label: "🎯 Goals", prompt: "Help me set financial goals" }
  ];

  return (
    <>
      {/* Sidebar */}
      <div 
        className="fixed top-0 right-0 h-full bg-background border-l z-[9999]"
        style={{ 
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: isResizing ? 'none' : 'transform 0.3s ease-in-out',
          width: `${sidebarWidth}px`
        }}
      >
        {/* Resize Handle */}
        <div
          className="absolute left-0 top-0 w-1 h-full bg-border hover:bg-primary/50 cursor-col-resize z-10"
          onMouseDown={handleMouseDown}
        />
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-primary" />
              <h2 className="font-semibold">AI Assistant</h2>
              <Badge variant="outline" className="text-xs">
                <Sparkles className="h-3 w-3 mr-1" />
                AI
              </Badge>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="hover:bg-muted/50"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Quick Actions */}
          <div className="p-4 border-b bg-muted/30">
            <div className="grid grid-cols-2 gap-2">
              {quickActions.map((action, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => setInputValue(action.prompt)}
                  className="text-xs justify-start"
                >
                  {action.label}
                </Button>
              ))}
            </div>
          </div>

              {/* Messages */}
              <ScrollArea className="flex-1 p-4 h-0">
                <div className="space-y-4 min-h-full">
                  {!isLoaded && (
                    <div className="text-center py-8">
                      <Bot className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-sm text-muted-foreground">Loading AI Assistant...</p>
                    </div>
                  )}
                  
                  {isLoaded && messages.length === 0 && (
                <div className="text-center py-8">
                  <Bot className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">AI Financial Assistant</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Ask me anything about your finances!
                  </p>
                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setInputValue("How can I improve my financial health?")}
                      className="w-full justify-start"
                    >
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Improve Financial Health
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setInputValue("Analyze my spending habits")}
                      className="w-full justify-start"
                    >
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Analyze Spending
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setInputValue("Help me create a budget")}
                      className="w-full justify-start"
                    >
                      <Target className="h-4 w-4 mr-2" />
                      Create Budget
                    </Button>
                  </div>
                </div>
              )}

              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap break-words">
                      {message.role === 'assistant' ? stripBoldFormatting(message.content) : message.content}
                    </p>
                    <p className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm text-muted-foreground">AI is thinking...</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Input */}
          <div className="p-4 border-t">
            <div className="flex gap-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={!isLoaded ? "Loading..." : "Ask about your finances..."}
                disabled={isLoading || !isLoaded}
                className="flex-1"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isLoading || !isLoaded}
                size="icon"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline" className="text-xs">
                <Sparkles className="h-3 w-3 mr-1" />
                AI-Powered
              </Badge>
              <span className="text-xs text-muted-foreground">
                Press Enter to send
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
