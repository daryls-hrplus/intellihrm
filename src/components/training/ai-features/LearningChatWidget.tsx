import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { MessageCircle, Send, Bot, User, ThumbsUp, ThumbsDown, Minimize2, X, Sparkles } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  created_at: string;
  was_helpful?: boolean;
  intent_detected?: string;
}

interface LearningChatWidgetProps {
  isOpen?: boolean;
  onClose?: () => void;
  defaultMinimized?: boolean;
}

export function LearningChatWidget({ 
  isOpen = true, 
  onClose,
  defaultMinimized = false 
}: LearningChatWidgetProps) {
  const [isMinimized, setIsMinimized] = useState(defaultMinimized);
  const [message, setMessage] = useState('');
  const [sessionId] = useState(() => crypto.randomUUID());
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [localMessages, setLocalMessages] = useState<ChatMessage[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: chatConfig } = useQuery({
    queryKey: ['learning-chatbot-config'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('learning_chatbot_config')
        .select('*')
        .eq('is_active', true)
        .single();
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
  });

  const { data: messages = [], refetch: refetchMessages } = useQuery({
    queryKey: ['chatbot-messages', conversationId],
    queryFn: async () => {
      if (!conversationId) return [];
      const { data, error } = await supabase
        .from('chatbot_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data as ChatMessage[];
    },
    enabled: !!conversationId,
  });

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id || null));
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      setLocalMessages(messages);
    }
  }, [messages]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [localMessages]);

  useEffect(() => {
    if (!isMinimized && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isMinimized]);

  const startConversationMutation = useMutation({
    mutationFn: async () => {
      if (!userId) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('chatbot_conversations')
        .insert({
          employee_id: userId,
          session_id: sessionId,
          message_count: 0,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      setConversationId(data.id);
      // Add welcome message
      const welcomeMessage: ChatMessage = {
        id: 'welcome',
        role: 'assistant',
        content: chatConfig?.welcome_message || "Hi! I'm your learning assistant. How can I help you today?",
        created_at: new Date().toISOString(),
      };
      setLocalMessages([welcomeMessage]);
    },
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (userMessage: string) => {
      if (!conversationId) throw new Error('No conversation started');

      // Add user message to DB
      const { data: userMsgData, error: userMsgError } = await supabase
        .from('chatbot_messages')
        .insert({
          conversation_id: conversationId,
          role: 'user',
          content: userMessage,
        })
        .select()
        .single();
      if (userMsgError) throw userMsgError;

      // Simulate AI response (in production, this would call an edge function)
      const aiResponses = [
        "I can help you find relevant courses! What topic are you interested in learning about?",
        "Based on your learning history, I'd recommend checking out our advanced courses in that area.",
        "Great question! Let me find some resources for you. Have you completed the prerequisite courses?",
        "I can see you're making good progress on your current learning path. Would you like some tips to accelerate?",
        "That's a common challenge. Many learners find it helpful to break down the material into smaller sections.",
      ];
      const randomResponse = aiResponses[Math.floor(Math.random() * aiResponses.length)];

      // Add AI response to DB
      const { data: aiMsgData, error: aiMsgError } = await supabase
        .from('chatbot_messages')
        .insert({
          conversation_id: conversationId,
          role: 'assistant',
          content: randomResponse,
          response_time_ms: Math.floor(Math.random() * 1000) + 500,
        })
        .select()
        .single();
      if (aiMsgError) throw aiMsgError;

      // Update conversation message count
      await supabase
        .from('chatbot_conversations')
        .update({ message_count: localMessages.length + 2 })
        .eq('id', conversationId);

      return { userMsg: userMsgData, aiMsg: aiMsgData };
    },
    onSuccess: () => {
      refetchMessages();
    },
    onError: (error) => {
      toast.error('Failed to send message: ' + error.message);
    },
  });

  const feedbackMutation = useMutation({
    mutationFn: async ({ messageId, wasHelpful }: { messageId: string; wasHelpful: boolean }) => {
      const { error } = await supabase
        .from('chatbot_messages')
        .update({ was_helpful: wasHelpful })
        .eq('id', messageId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Thanks for your feedback!');
      refetchMessages();
    },
  });

  const handleSend = async () => {
    if (!message.trim()) return;

    // Start conversation if not started
    if (!conversationId) {
      await startConversationMutation.mutateAsync();
    }

    const userMessage = message;
    setMessage('');

    // Optimistically add user message
    const tempUserMsg: ChatMessage = {
      id: `temp-${Date.now()}`,
      role: 'user',
      content: userMessage,
      created_at: new Date().toISOString(),
    };
    setLocalMessages(prev => [...prev, tempUserMsg]);

    // Send message
    await sendMessageMutation.mutateAsync(userMessage);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen) return null;

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          className="rounded-full h-14 w-14 shadow-lg"
          onClick={() => setIsMinimized(false)}
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      </div>
    );
  }

  return (
    <Card className="fixed bottom-4 right-4 z-50 w-96 h-[500px] shadow-xl flex flex-col">
      <CardHeader className="flex-shrink-0 pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-full bg-primary/10">
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <CardTitle className="text-base">
              {chatConfig?.chatbot_name || 'Learning Assistant'}
            </CardTitle>
          </div>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" onClick={() => setIsMinimized(true)}>
              <Minimize2 className="h-4 w-4" />
            </Button>
            {onClose && (
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
        <ScrollArea className="flex-1 px-4" ref={scrollRef}>
          <div className="space-y-4 py-4">
            {localMessages.length === 0 && !conversationId && (
              <div className="text-center text-muted-foreground py-8">
                <Bot className="h-12 w-12 mx-auto mb-4 text-primary/50" />
                <p className="text-sm">
                  {chatConfig?.welcome_message || "Hi! I'm your learning assistant. How can I help you today?"}
                </p>
                <div className="flex flex-wrap justify-center gap-2 mt-4">
                  <Badge 
                    variant="outline" 
                    className="cursor-pointer hover:bg-muted"
                    onClick={() => setMessage("What courses should I take next?")}
                  >
                    Course recommendations
                  </Badge>
                  <Badge 
                    variant="outline" 
                    className="cursor-pointer hover:bg-muted"
                    onClick={() => setMessage("How do I track my learning progress?")}
                  >
                    Track progress
                  </Badge>
                  <Badge 
                    variant="outline" 
                    className="cursor-pointer hover:bg-muted"
                    onClick={() => setMessage("What skills should I develop?")}
                  >
                    Skill gaps
                  </Badge>
                </div>
              </div>
            )}
            {localMessages.map((msg, index) => (
              <div
                key={msg.id || index}
                className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary/10">
                      <Bot className="h-4 w-4 text-primary" />
                    </AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={`rounded-lg px-3 py-2 max-w-[80%] ${
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  <p className="text-sm">{msg.content}</p>
                  {msg.role === 'assistant' && msg.id !== 'welcome' && !msg.id.startsWith('temp-') && (
                    <div className="flex gap-1 mt-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => feedbackMutation.mutate({ messageId: msg.id, wasHelpful: true })}
                      >
                        <ThumbsUp className={`h-3 w-3 ${msg.was_helpful === true ? 'text-green-600' : ''}`} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => feedbackMutation.mutate({ messageId: msg.id, wasHelpful: false })}
                      >
                        <ThumbsDown className={`h-3 w-3 ${msg.was_helpful === false ? 'text-red-600' : ''}`} />
                      </Button>
                    </div>
                  )}
                </div>
                {msg.role === 'user' && (
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
            {sendMessageMutation.isPending && (
              <div className="flex gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary/10">
                    <Bot className="h-4 w-4 text-primary" />
                  </AvatarFallback>
                </Avatar>
                <div className="bg-muted rounded-lg px-3 py-2">
                  <div className="flex gap-1">
                    <span className="animate-bounce">●</span>
                    <span className="animate-bounce" style={{ animationDelay: '0.1s' }}>●</span>
                    <span className="animate-bounce" style={{ animationDelay: '0.2s' }}>●</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
        <div className="flex-shrink-0 p-4 border-t">
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              placeholder="Ask me anything about learning..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              disabled={sendMessageMutation.isPending}
            />
            <Button 
              size="icon" 
              onClick={handleSend}
              disabled={sendMessageMutation.isPending || !message.trim()}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
