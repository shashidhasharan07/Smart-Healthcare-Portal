import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { ScrollArea } from '../components/ui/scroll-area';
import {
  MessageSquare,
  Send,
  Loader2,
  Bot,
  User,
  Sparkles,
  Heart,
  Activity,
  Apple,
  Moon,
} from 'lucide-react';

const API_URL = `${process.env.REACT_APP_BACKEND_URL}/api`;

const suggestedQuestions = [
  { icon: Heart, text: 'How can I improve my heart health?' },
  { icon: Activity, text: 'What exercises are good for beginners?' },
  { icon: Apple, text: 'Tips for a balanced diet?' },
  { icon: Moon, text: 'How can I improve my sleep quality?' },
];

const AIAssistantPage = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    // Add welcome message
    setMessages([
      {
        role: 'assistant',
        content: `Hello! I'm your AI health assistant powered by VitalSync. I can help you with:

• General health questions and information
• Wellness tips and lifestyle advice
• Understanding symptoms (not diagnosis)
• Nutrition and exercise guidance
• Mental health support and resources

How can I help you today?`,
        timestamp: new Date().toISOString(),
      },
    ]);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async (messageText) => {
    if (!messageText.trim()) return;

    const userMessage = {
      role: 'user',
      content: messageText,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage('');
    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/ai/chat`, {
        message: messageText,
      });

      const aiMessage = {
        role: 'assistant',
        content: response.data.response,
        timestamp: response.data.timestamp,
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage = {
        role: 'assistant',
        content: 'I apologize, but I encountered an error. Please try again later.',
        timestamp: new Date().toISOString(),
        isError: true,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(inputMessage);
  };

  const handleSuggestionClick = (question) => {
    sendMessage(question);
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <DashboardLayout>
      <div data-testid="ai-assistant-page" className="h-[calc(100vh-12rem)] flex flex-col">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[hsl(var(--ai-glow))]/10 flex items-center justify-center ai-glow">
              <Bot className="w-6 h-6 text-[hsl(var(--ai-glow))]" />
            </div>
            <div>
              <h1 className="font-heading font-bold text-2xl text-foreground">AI Health Assistant</h1>
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                Online • Powered by GPT-5.1
              </p>
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <Card className="flex-1 flex flex-col overflow-hidden" data-testid="chat-container">
          <ScrollArea ref={scrollRef} className="flex-1 p-6">
            <div className="space-y-6">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  data-testid={`chat-message-${index}`}
                >
                  {message.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-lg bg-[hsl(var(--ai-glow))]/10 flex items-center justify-center shrink-0">
                      <Bot className="w-4 h-4 text-[hsl(var(--ai-glow))]" />
                    </div>
                  )}
                  
                  <div className={`max-w-[80%] ${message.role === 'user' ? 'order-1' : ''}`}>
                    <div
                      className={`${
                        message.role === 'user'
                          ? 'chat-message-user'
                          : message.isError
                          ? 'bg-destructive/10 text-destructive rounded-2xl rounded-bl-sm px-4 py-3'
                          : 'chat-message-ai'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    </div>
                    <p className={`text-xs text-muted-foreground mt-1 ${message.role === 'user' ? 'text-right' : ''}`}>
                      {formatTime(message.timestamp)}
                    </p>
                  </div>
                  
                  {message.role === 'user' && (
                    <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
                      <User className="w-4 h-4 text-primary-foreground" />
                    </div>
                  )}
                </div>
              ))}
              
              {loading && (
                <div className="flex gap-3" data-testid="loading-indicator">
                  <div className="w-8 h-8 rounded-lg bg-[hsl(var(--ai-glow))]/10 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-[hsl(var(--ai-glow))]" />
                  </div>
                  <div className="chat-message-ai">
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm">Thinking...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Suggestions */}
          {messages.length === 1 && (
            <div className="px-6 pb-4">
              <p className="text-sm text-muted-foreground mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Try asking:
              </p>
              <div className="flex flex-wrap gap-2">
                {suggestedQuestions.map((suggestion, index) => {
                  const Icon = suggestion.icon;
                  return (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      className="text-sm"
                      onClick={() => handleSuggestionClick(suggestion.text)}
                      data-testid={`suggestion-${index}`}
                    >
                      <Icon className="w-3 h-3 mr-2" />
                      {suggestion.text}
                    </Button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Input Area */}
          <CardContent className="p-4 border-t border-border/50">
            <form onSubmit={handleSubmit} className="flex gap-3">
              <Input
                ref={inputRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask me anything about your health..."
                disabled={loading}
                className="bg-secondary/30 border-transparent focus:border-primary"
                data-testid="chat-input"
              />
              <Button
                type="submit"
                disabled={loading || !inputMessage.trim()}
                className="btn-scale shrink-0"
                data-testid="send-message-btn"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </form>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              VitalSync AI provides general health information. Always consult a healthcare professional for medical advice.
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AIAssistantPage;
