import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Bot,
  Send,
  Loader2,
  Sparkles,
  FileText,
  BookOpen,
  Rocket,
  ClipboardList,
  BarChart3,
  Search,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ChatMessage, ActionSuggestion } from "@/hooks/useContentCreationAgent";
import ReactMarkdown from "react-markdown";

interface ContentCreationAgentChatProps {
  messages: ChatMessage[];
  isStreaming: boolean;
  onSendMessage: (message: string) => void;
  onQuickAction: (action: string, params?: Record<string, unknown>) => void;
  onClearChat: () => void;
  suggestions?: ActionSuggestion[];
  selectedModule?: string;
  selectedFeature?: string;
}

const QUICK_ACTIONS = [
  {
    id: "analyze_context",
    label: "Analyze Coverage",
    icon: BarChart3,
    description: "Scan all features and calculate documentation coverage",
  },
  {
    id: "identify_gaps",
    label: "Find Gaps",
    icon: Search,
    description: "Identify undocumented features and missing content",
  },
  {
    id: "generate_manual_section",
    label: "Generate Manual Section",
    icon: BookOpen,
    description: "Create an Administrator Manual section",
    requiresFeature: true,
  },
  {
    id: "generate_kb_article",
    label: "Create KB Article",
    icon: FileText,
    description: "Generate a Help Center article",
    requiresFeature: true,
  },
  {
    id: "generate_quickstart",
    label: "Build Quick Start",
    icon: Rocket,
    description: "Create a module setup guide",
    requiresModule: true,
  },
  {
    id: "generate_sop",
    label: "Generate SOP",
    icon: ClipboardList,
    description: "Create a Standard Operating Procedure",
    requiresFeature: true,
  },
];

export function ContentCreationAgentChat({
  messages,
  isStreaming,
  onSendMessage,
  onQuickAction,
  onClearChat,
  suggestions = [],
  selectedModule,
  selectedFeature,
}: ContentCreationAgentChatProps) {
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() || isStreaming) return;
    onSendMessage(input.trim());
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleQuickAction = (actionId: string) => {
    const action = QUICK_ACTIONS.find(a => a.id === actionId);
    if (!action) return;

    if (action.requiresFeature && !selectedFeature) {
      onSendMessage(`I want to ${action.label.toLowerCase()}. Please help me select a feature first.`);
      return;
    }

    if (action.requiresModule && !selectedModule) {
      onSendMessage(`I want to ${action.label.toLowerCase()}. Please help me select a module first.`);
      return;
    }

    onQuickAction(actionId, {
      featureCode: selectedFeature,
      moduleCode: selectedModule,
    });
  };

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="pb-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <Bot className="h-4 w-4 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base">Documentation Agent</CardTitle>
              <p className="text-xs text-muted-foreground">AI-powered content creation</p>
            </div>
          </div>
          {messages.length > 0 && (
            <Button variant="ghost" size="sm" onClick={onClearChat}>
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>

      <Separator />

      {/* Quick Actions */}
      {messages.length === 0 && (
        <div className="p-4 space-y-3 flex-shrink-0">
          <p className="text-sm text-muted-foreground">Quick Actions</p>
          <div className="grid grid-cols-2 gap-2">
            {QUICK_ACTIONS.map((action) => {
              const Icon = action.icon;
              const isDisabled = (action.requiresFeature && !selectedFeature) ||
                                 (action.requiresModule && !selectedModule);

              return (
                <button
                  key={action.id}
                  onClick={() => handleQuickAction(action.id)}
                  disabled={isDisabled}
                  className={cn(
                    "p-3 rounded-lg border text-left transition-all",
                    "hover:border-primary/50 hover:bg-primary/5",
                    isDisabled && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">{action.label}</span>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-1">
                    {action.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Chat Messages */}
      <ScrollArea className="flex-1 px-4" ref={scrollRef}>
        <div className="space-y-4 py-4">
          {messages.length === 0 ? (
            <div className="text-center py-8">
              <Sparkles className="h-8 w-8 mx-auto text-muted-foreground/50 mb-3" />
              <p className="text-sm text-muted-foreground">
                Ask me to generate documentation, analyze coverage, or help with any content creation task.
              </p>
            </div>
          ) : (
            messages.map((message, index) => (
              <div
                key={index}
                className={cn(
                  "flex gap-3",
                  message.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                {message.role === "assistant" && (
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                )}
                <div
                  className={cn(
                    "rounded-lg p-3 max-w-[85%]",
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  )}
                >
                  <div className={cn(
                    "text-sm prose prose-sm max-w-none",
                    message.role === "user" && "prose-invert"
                  )}>
                    <ReactMarkdown>{message.content}</ReactMarkdown>
                  </div>
                  
                  {/* Suggested Actions */}
                  {message.suggestedActions && message.suggestedActions.length > 0 && (
                    <div className="mt-3 pt-2 border-t border-border/50">
                      <p className="text-xs text-muted-foreground mb-2">Suggested Actions:</p>
                      <div className="flex flex-wrap gap-1">
                        {message.suggestedActions.map((actionId, idx) => {
                          const action = QUICK_ACTIONS.find(a => a.id === actionId);
                          if (!action) return null;
                          return (
                            <Button
                              key={idx}
                              variant="secondary"
                              size="sm"
                              className="h-7 text-xs"
                              onClick={() => handleQuickAction(actionId)}
                            >
                              <action.icon className="h-3 w-3 mr-1" />
                              {action.label}
                            </Button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
                {message.role === "user" && (
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                    <span className="text-xs font-medium text-primary-foreground">You</span>
                  </div>
                )}
              </div>
            ))
          )}

          {isStreaming && (
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Bot className="h-4 w-4 text-primary" />
              </div>
              <div className="rounded-lg p-3 bg-muted">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Thinking...
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* AI Suggestions from Analysis */}
      {suggestions.length > 0 && (
        <>
          <Separator />
          <div className="p-3 flex-shrink-0">
            <p className="text-xs text-muted-foreground mb-2">AI Suggestions</p>
            <div className="flex flex-wrap gap-2">
              {suggestions.slice(0, 3).map((suggestion, idx) => (
                <Badge
                  key={idx}
                  variant={suggestion.priority === 'high' ? 'destructive' : 
                           suggestion.priority === 'medium' ? 'default' : 'secondary'}
                  className="cursor-pointer"
                  onClick={() => onQuickAction(suggestion.action)}
                >
                  {suggestion.title}
                </Badge>
              ))}
            </div>
          </div>
        </>
      )}

      <Separator />

      {/* Input Area */}
      <CardContent className="p-3 flex-shrink-0">
        <div className="flex gap-2">
          <Textarea
            ref={inputRef}
            placeholder="Ask me to generate documentation..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isStreaming}
            className="min-h-[60px] max-h-[120px] resize-none"
            rows={2}
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isStreaming}
            className="h-auto"
          >
            {isStreaming ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
