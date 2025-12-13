import { useState, useRef, useEffect } from "react";
import { Message } from "@/hooks/useMessaging";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Paperclip,
  Send,
  Smile,
  X,
  Image as ImageIcon,
  File,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface MessageInputProps {
  onSendMessage: (content: string, replyToId?: string) => Promise<void>;
  onTyping: () => void;
  replyTo: Message | null;
  editingMessage: Message | null;
  onCancelReply: () => void;
  onCancelEdit: () => void;
  onEditMessage: (messageId: string, content: string) => Promise<void>;
  disabled?: boolean;
}

const EMOJI_PICKER = [
  "😀", "😃", "😄", "😁", "😅", "😂", "🤣", "😊",
  "😇", "🙂", "🙃", "😉", "😌", "😍", "🥰", "😘",
  "👍", "👎", "👏", "🙌", "🤝", "💪", "❤️", "🔥",
  "✨", "🎉", "🎊", "💯", "✅", "❌", "⭐", "🌟",
];

export const MessageInput = ({
  onSendMessage,
  onTyping,
  replyTo,
  editingMessage,
  onCancelReply,
  onCancelEdit,
  onEditMessage,
  disabled,
}: MessageInputProps) => {
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (editingMessage) {
      setMessage(editingMessage.content || "");
      textareaRef.current?.focus();
    }
  }, [editingMessage]);

  useEffect(() => {
    if (replyTo) {
      textareaRef.current?.focus();
    }
  }, [replyTo]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);

    // Debounced typing indicator
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    typingTimeoutRef.current = setTimeout(() => {
      onTyping();
    }, 500);
  };

  const handleSubmit = async () => {
    if (!message.trim() || sending) return;

    try {
      setSending(true);

      if (editingMessage) {
        await onEditMessage(editingMessage.id, message);
        onCancelEdit();
      } else {
        await onSendMessage(message, replyTo?.id);
        if (replyTo) onCancelReply();
      }

      setMessage("");
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
    if (e.key === "Escape") {
      if (editingMessage) onCancelEdit();
      if (replyTo) onCancelReply();
    }
  };

  const insertEmoji = (emoji: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newValue = message.substring(0, start) + emoji + message.substring(end);
    setMessage(newValue);

    // Move cursor after emoji
    setTimeout(() => {
      textarea.selectionStart = textarea.selectionEnd = start + emoji.length;
      textarea.focus();
    }, 0);
  };

  return (
    <div className="border-t p-4">
      {(replyTo || editingMessage) && (
        <div className="flex items-center gap-2 mb-2 px-2 py-1.5 bg-muted rounded-lg">
          <div className="flex-1 min-w-0">
            <span className="text-xs font-medium text-muted-foreground">
              {editingMessage ? "Editing message" : "Replying to"}
            </span>
            <p className="text-sm truncate">
              {(editingMessage || replyTo)?.content?.substring(0, 100)}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={editingMessage ? onCancelEdit : onCancelReply}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      <div className="flex items-end gap-2">
        <div className="flex-1 relative">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            disabled={disabled}
            className="min-h-[44px] max-h-[200px] resize-none pr-20"
            rows={1}
          />
          <div className="absolute right-2 bottom-2 flex items-center gap-1">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  disabled={disabled}
                >
                  <Smile className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-64 p-2">
                <div className="grid grid-cols-8 gap-1">
                  {EMOJI_PICKER.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => insertEmoji(emoji)}
                      className="text-lg hover:bg-muted rounded p-1 transition-colors"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <Button
          onClick={handleSubmit}
          disabled={!message.trim() || sending || disabled}
          size="icon"
          className="h-11 w-11"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
