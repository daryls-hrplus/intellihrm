import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Send, Brain, User, Loader2, Info } from "lucide-react";
import { AIGuidelinesDialog } from "./AIGuidelinesDialog";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface AIAssistantDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AIAssistantDialog({ open, onOpenChange }: AIAssistantDialogProps) {
  const { t } = useTranslation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showGuidelines, setShowGuidelines] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: input.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error(t("auth.sessionExpired"));
        return;
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-chat`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            messages: [...messages, userMessage],
            feature: "assistant",
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 402) {
          toast.error(errorData.error || t("ai.budgetExceeded"));
        } else if (response.status === 403) {
          toast.error(errorData.error || t("ai.accessDisabled"));
        } else if (response.status === 429) {
          toast.error(t("ai.rateLimitExceeded"));
        } else {
          toast.error(errorData.error || t("common.error"));
        }
        return;
      }

      const data = await response.json();
      const assistantMessage: Message = { role: "assistant", content: data.message };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error("AI chat error:", error);
      toast.error(t("common.error"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px] h-[600px] flex flex-col p-0">
          <DialogHeader className="px-6 py-4 border-b">
            <div className="flex items-center justify-between w-full">
              <DialogTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-sky-400 animate-heartbeat" />
                {t("ai.assistantTitle")}
              </DialogTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowGuidelines(true)}
                className="text-muted-foreground hover:text-foreground"
              >
                <Info className="h-4 w-4 mr-1" />
                {t("ai.viewGuidelines", "Guidelines")}
              </Button>
            </div>
          </DialogHeader>

          <ScrollArea className="flex-1 px-6 py-4" ref={scrollRef}>
            <div className="space-y-4">
              {messages.length === 0 && (
                <div className="text-center text-muted-foreground py-8">
                  <Brain className="h-12 w-12 mx-auto mb-4 text-sky-400 animate-heartbeat" />
                  <p>{t("ai.welcomeMessage")}</p>
                  <p className="text-xs mt-2 text-muted-foreground/70">
                    {t("ai.disclaimer", "Responses are based on company policies and SOPs. Verify with HR for official decisions.")}
                  </p>
                </div>
              )}
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {message.role === "assistant" && (
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-sky-400/20 text-sky-400">
                        <Brain className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={`max-w-[80%] rounded-lg px-4 py-2 ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>
                  {message.role === "user" && (
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-sky-400/20 text-sky-400">
                      <Brain className="h-4 w-4 animate-heartbeat" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-muted rounded-lg px-4 py-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          <div className="px-6 py-4 border-t space-y-2">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={t("ai.inputPlaceholder")}
                disabled={isLoading}
                className="flex-1"
              />
              <Button onClick={sendMessage} disabled={isLoading || !input.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-[10px] text-center text-muted-foreground">
              {t("ai.footerDisclaimer", "AI responses are for guidance only. Consult HR for official decisions.")}
            </p>
          </div>
        </DialogContent>
      </Dialog>
      
      <AIGuidelinesDialog open={showGuidelines} onOpenChange={setShowGuidelines} />
    </>
  );
}
