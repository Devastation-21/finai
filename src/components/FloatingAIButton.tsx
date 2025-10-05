"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { MessageSquare, X, Bot, Sparkles } from "lucide-react";
import { AISidebar } from "./AISidebar";

export function FloatingAIButton() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Floating AI Button */}
      <div className="fixed bottom-6 right-6 z-[9999]">
        <Button
          onClick={toggleSidebar}
          className={`
            h-14 w-14 rounded-full shadow-lg transition-all duration-300 ease-in-out
            ${isOpen 
              ? 'bg-primary text-primary-foreground scale-110 shadow-xl' 
              : 'bg-primary text-primary-foreground hover:scale-105 hover:shadow-xl'
            }
            animate-pulse hover:animate-none
          `}
          size="icon"
        >
          {isOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <div className="flex flex-col items-center">
              <Bot className="h-5 w-5" />
              <Sparkles className="h-3 w-3 mt-0.5" />
            </div>
          )}
        </Button>
        
        {/* Tooltip */}
        {!isOpen && (
          <div className="absolute right-16 top-1/2 transform -translate-y-1/2 bg-foreground text-background px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none">
            AI Assistant
            <div className="absolute left-full top-1/2 transform -translate-y-1/2 w-0 h-0 border-l-4 border-l-foreground border-t-4 border-t-transparent border-b-4 border-b-transparent"></div>
          </div>
        )}
      </div>

      {/* AI Sidebar */}
      <AISidebar isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}

