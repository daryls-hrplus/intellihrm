import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
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
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ChatMessage } from "@/hooks/useContentCreationAgent";
import { ContextMode } from "./AgentContextPanel";
import ReactMarkdown from "react-markdown";

interface ContentCreationAgentChatProps {
  messages: ChatMessage[];
  isStreaming: boolean;
  onSendMessage: (message: string) => void;
  onQuickAction: (action: string, params?: Record<string, unknown>) => void;
  onClearChat: () => void;
  selectedModule?: string;
  selectedFeature?: string;
  contextMode: ContextMode;
  hasSection?: boolean;
}

// Contextual quick actions based on mode
const getQuickActions = (contextMode: ContextMode, hasFeature: boolean, hasSection: boolean) => {
  if (contextMode === "manual") {
    return [
      {
        id: "analyze_context",
        label: "Analyze Manual Coverage",
        icon: BarChart3,
        description: "Check coverage for the selected manual",
      },
      {
        id: "identify_gaps",
        label: "Find Gaps in Manual",
        icon: Search,
        description: "Identify missing content in manual scope",
      },
      {
        id: "regenerate_section",
        label: "Regenerate Section",
        icon: RefreshCw,
        description: "Regenerate the selected section",
        disabled: !hasSection,
      },
      {
        id: "regenerate_chapter",
        label: "Regenerate Chapter",
        icon: BookOpen,
        description: "Regenerate all sections in chapter",
        disabled: !hasSection,
      },
    ];
  }
  
  return [
    {
      id: "analyze_context",
      label: "Analyze Coverage",
      icon: BarChart3,
      description: "Scan features and calculate coverage",
    },
    {
      id: "identify_gaps",
      label: "Find Gaps",
      icon: Search,
      description: "Identify undocumented features",
    },
    {
      id: "generate_manual_section",
      label: "Generate Manual",
      icon: BookOpen,
      description: "Create an Administrator Manual section",
      disabled: !hasFeature,
    },
    {
      id: "generate_kb_article",
      label: "Create KB Article",
      icon: FileText,
      description: "Generate a Help Center article",
      disabled: !hasFeature,
    },
  ];
};

export function ContentCreationAgentChat({
  messages,
  isStreaming,
  onSendMessage,
  onQuickAction,
  onClearChat,
  selectedModule,
  selectedFeature,
  contextMode,
  hasSection = false,
}: ContentCreationAgentChatProps) {
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Get contextual quick actions
  const quickActions = getQuickActions(contextMode, !!selectedFeature, hasSection);

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
    const action = quickActions.find((a) => a.id === actionId);
    if (!action || action.disabled) return;

    onQuickAction(actionId, {
      featureCode: selectedFeature,
      moduleCode: selectedModule,
    });
  };

  // Placeholder based on context
  const getPlaceholder = () => {
    if (contextMode === "manual") {
      return hasSection
        ? "Ask about this section, or request changes..."
        : "Select a section to regenerate, or ask a question...";
    }
    return selectedFeature
      ? `Generate content for ${selectedFeature}...`
      : "Ask me to generate documentation...";
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
              <p className="text-xs text-muted-foreground">
                {contextMode === "manual" ? "Manual regeneration mode" : "Content generation mode"}
              </p>
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

      {/* Quick Actions - shown when no messages */}
      {messages.length === 0 && (
        <div className="p-4 space-y-3 flex-shrink-0">
          <p className="text-sm text-muted-foreground">Quick Actions</p>
          <div className="grid grid-cols-2 gap-2">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.id}
                  onClick={() => handleQuickAction(action.id)}
                  disabled={action.disabled}
                  className={cn(
                    "p-3 rounded-lg border text-left transition-all",
                    "hover:border-primary/50 hover:bg-primary/5",
                    action.disabled && "opacity-50 cursor-not-allowed"
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
                {contextMode === "manual"
                  ? "Select a manual section to regenerate, or ask me anything about documentation."
                  : "Ask me to generate documentation, analyze coverage, or help with any content task."}
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
                  <div
                    className={cn(
                      "text-sm prose prose-sm max-w-none",
                      message.role === "user" && "prose-invert"
                    )}
                  >
                    <ReactMarkdown>{message.content}</ReactMarkdown>
                  </div>

                  {/* Suggested Actions from response */}
                  {message.suggestedActions && message.suggestedActions.length > 0 && (
                    <div className="mt-3 pt-2 border-t border-border/50">
                      <p className="text-xs text-muted-foreground mb-2">Suggested Actions:</p>
                      <div className="flex flex-wrap gap-1">
                        {message.suggestedActions.map((actionId, idx) => {
                          const action = quickActions.find((a) => a.id === actionId);
                          if (!action) return null;
                          return (
                            <Button
                              key={idx}
                              variant="secondary"
                              size="sm"
                              className="h-7 text-xs"
                              onClick={() => handleQuickAction(actionId)}
                              disabled={action.disabled}
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

      <Separator />

      {/* Input Area */}
      <CardContent className="p-3 flex-shrink-0">
        <div className="flex gap-2">
          <Textarea
            ref={inputRef}
            placeholder={getPlaceholder()}
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
