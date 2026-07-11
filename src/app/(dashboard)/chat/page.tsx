"use client";

import React, { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  Plus, 
  Search, 
  Pin, 
  Trash2, 
  Sparkles, 
  Mic, 
  Send,
  ToggleLeft,
  ToggleRight,
  ChevronDown,
  Volume2,
  VolumeX,
  Database,
  BrainCircuit
} from "lucide-react";
import { OrbAvatar } from "@/components/chat/OrbAvatar";
import { chatService, authService } from "@/lib/services/mockServices";
import { getMockDb, saveMockDb, Conversation, Message } from "@/lib/services/mockDb";
import { useEmotionTheme, MoodType } from "@/contexts/ThemeContext";

export default function ChatLandingPage() {
  const router = useRouter();
  const params = useParams();
  const conversationId = params?.conversationId as string;
  const { mood, setMood, activePersona, setActivePersona, voiceEnabled, setVoiceEnabled } = useEmotionTheme();
  
  // Database states
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  
  // UI states
  const [inputText, setInputText] = useState("");
  const [statusText, setStatusText] = useState<"idle" | "listening" | "reflecting" | "understanding" | "thinking" | "speaking">("idle");
  const [isRecording, setIsRecording] = useState(false);
  const [memoryRecall, setMemoryRecall] = useState(true);
  const [streamingText, setStreamingText] = useState("");
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  const samplePrompts = [
    { text: "I'm feeling really stressed about work.", category: "worklife" },
    { text: "Help me reframe an anxious thought.", category: "anxiety" },
    { text: "I had a fight with a friend today.", category: "relationships" },
    { text: "I feel exhausted and want to do nothing.", category: "burnout" }
  ];

  const displayName = (id: string) => {
    return conversations.find(c => c.id === id)?.title || "Active Chat";
  };

  const personaLabels = {
    listener: "Gentle Listener",
    coach: "Practical Coach",
    motivator: "Inspiring Motivator",
    guide: "Reflective Guide"
  };

  useEffect(() => {
    const init = async () => {
      const list = await chatService.getConversations();
      setConversations(list);
      if (conversationId) {
        setActiveChat(conversationId);
        const msgs = await chatService.getMessages(conversationId);
        setMessages(msgs);
        scrollToBottom();
      }
    };
    init();
  }, [conversationId]);

  const loadChats = async () => {
    const list = await chatService.getConversations();
    setConversations(list);
  };

  const handleCreateChat = async (title = "New Conversation", category = "general") => {
    const freshChat = await chatService.createConversation(title, category);
    await loadChats();
    handleSelectChat(freshChat.id);
  };

  const handleSelectChat = async (id: string) => {
    setActiveChat(id);
    const msgs = await chatService.getMessages(id);
    setMessages(msgs);
    setStreamingText("");
    setStatusText("idle");
  };

  const handleDeleteChat = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    await chatService.deleteConversation(id);
    if (activeChat === id) {
      setActiveChat(null);
      setMessages([]);
    }
    loadChats();
  };

  const handleTogglePin = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    await chatService.togglePin(id);
    loadChats();
  };

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || !activeChat) return;

    setInputText("");
    setStreamingText("");
    
    // Clear and reload messages immediately
    const tempMsgs = await chatService.getMessages(activeChat);
    setMessages(tempMsgs);
    scrollToBottom();

    try {
      await chatService.streamMessage(
        activeChat,
        text,
        activePersona,
        (token) => {
          setStreamingText(prev => prev + token);
          setStatusText("speaking");
        },
        (status) => {
          setStatusText(status as any);
        },
        (emotion) => {
          setMood(emotion.primary_emotion);
        },
        () => {
          // Safety Redirect
          router.push("/safety-screen");
        }
      );

      // Refresh messages
      const finalMsgs = await chatService.getMessages(activeChat);
      setMessages(finalMsgs);
      setStreamingText("");
      setStatusText("idle");
      scrollToBottom();
    } catch (err) {
      console.error(err);
      setStatusText("idle");
    }
  };

  const handleVoiceRecord = () => {
    if (isRecording) {
      setIsRecording(false);
      setStatusText("idle");
      return;
    }

    setIsRecording(true);
    setStatusText("listening");
    
    // Simulate speech recording and text transcribing
    setTimeout(() => {
      setIsRecording(false);
      const spokenOptions = [
        "I feel really overwhelmed and tired with office research tasks.",
        "I had a beautiful day walking in nature, but I feel slightly anxious about tomorrow.",
        "My chest is feeling heavy today, I need some slow breathing guidance.",
        "I'm feeling really happy and grateful for family members today."
      ];
      const selectedText = spokenOptions[Math.floor(Math.random() * spokenOptions.length)];
      setInputText(selectedText);
      setStatusText("idle");
    }, 2500);
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handlePromptClick = async (text: string, category: string) => {
    const freshChat = await chatService.createConversation(text, category);
    await loadChats();
    
    // Setup state
    setActiveChat(freshChat.id);
    setStreamingText("");
    setStatusText("idle");
    
    // Trigger immediate send
    setTimeout(async () => {
      // 1. Add user message
      const db = getMockDb();
      if (!db.messages[freshChat.id]) db.messages[freshChat.id] = [];
      const userMsg: Message = {
        id: "msg-" + Math.random().toString(36).substr(2, 9),
        role: "user",
        content: text,
        created_at: new Date().toISOString()
      };
      db.messages[freshChat.id].push(userMsg);
      saveMockDb(db);
      
      const msgs = await chatService.getMessages(freshChat.id);
      setMessages(msgs);
      
      // 2. Stream AI
      await chatService.streamMessage(
        freshChat.id,
        text,
        activePersona,
        (token) => {
          setStreamingText(prev => prev + token);
          setStatusText("speaking");
        },
        (status) => {
          setStatusText(status as any);
        },
        (emotion) => {
          setMood(emotion.primary_emotion);
        },
        () => {
          router.push("/safety-screen");
        }
      );
      
      const finalMsgs = await chatService.getMessages(freshChat.id);
      setMessages(finalMsgs);
      setStreamingText("");
      setStatusText("idle");
      scrollToBottom();
    }, 200);
  };

  // Filter conversations
  const filteredChats = conversations.filter(c => 
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col lg:flex-row h-full gap-6 overflow-hidden">
      {/* Thread list panel */}
      <div className="w-full lg:w-72 flex flex-col gap-4 border-r border-white/5 pr-0 lg:pr-6 shrink-0 h-64 lg:h-full">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-200">Conversations</h2>
          <button
            onClick={() => handleCreateChat()}
            className="p-1.5 rounded-xl glass-panel-light hover:bg-white/5 border border-white/5 text-mood-accent hover:text-white transition-colors cursor-pointer"
            title="Start New Conversation"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search chat..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-9 pr-4 rounded-xl glass-input text-xs"
          />
        </div>

        {/* List scroll panel */}
        <div className="flex-1 overflow-y-auto space-y-1.5 no-scrollbar">
          {filteredChats.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-500">No chats found.</div>
          ) : (
            filteredChats.map((chat) => {
              const active = activeChat === chat.id;
              return (
                <div
                  key={chat.id}
                  onClick={() => handleSelectChat(chat.id)}
                  className={`group flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer ${
                    active
                      ? "bg-slate-100/10 border-white/5 text-white"
                      : "glass-panel border-transparent text-slate-400 hover:text-slate-200 hover:border-white/5"
                  }`}
                >
                  <div className="flex items-center gap-2 overflow-hidden">
                    {chat.is_pinned && (
                      <Pin className="w-3 h-3 text-mood-accent shrink-0 transition-colors duration-[2500ms]" />
                    )}
                    <span className="text-xs font-semibold truncate leading-none">{chat.title}</span>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => handleTogglePin(e, chat.id)}
                      className="p-1 rounded hover:bg-white/5 text-slate-400 hover:text-mood-accent transition-colors"
                      title={chat.is_pinned ? "Unpin thread" : "Pin thread"}
                    >
                      <Pin className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => handleDeleteChat(e, chat.id)}
                      className="p-1 rounded hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-colors"
                      title="Delete thread"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Main chat execution space */}
      <div className="flex-1 flex flex-col overflow-hidden h-full">
        {activeChat ? (
          // Active Chat view
          <div className="flex-1 flex flex-col justify-between overflow-hidden h-full relative">
            {/* Thread Header Controls */}
            <div className="flex items-center justify-between pb-4 border-b border-white/5 mb-4 shrink-0">
              <div className="flex items-center gap-3">
                <BrainCircuit className="w-5 h-5 text-mood-accent transition-colors duration-[2500ms]" />
                <div>
                  <h3 className="text-xs font-bold text-slate-200">
                    {conversations.find(c => c.id === activeChat)?.title || "Active Chat"}
                  </h3>
                  <div className="flex items-center gap-1.5 mt-0.5 text-[9px] text-slate-500 font-bold uppercase tracking-wider">
                    <span>Companion:</span>
                    <span className="text-mood-accent transition-colors duration-[2500ms]">{personaLabels[activePersona]}</span>
                  </div>
                </div>
              </div>

              {/* Chat controls */}
              <div className="flex items-center gap-3">
                {/* Persona selector */}
                <div className="relative">
                  <select
                    value={activePersona}
                    onChange={(e) => setActivePersona(e.target.value as any)}
                    className="h-8 px-2 rounded-lg bg-slate-900/60 border border-white/5 text-[10px] font-bold text-slate-300 select-none cursor-pointer focus:outline-none"
                  >
                    <option value="listener">Gentle Listener</option>
                    <option value="coach">Practical Coach</option>
                    <option value="motivator">Inspiring Motivator</option>
                    <option value="guide">Reflective Guide</option>
                  </select>
                </div>

                {/* Speech toggler */}
                <button
                  onClick={() => setVoiceEnabled(!voiceEnabled)}
                  className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                    voiceEnabled 
                      ? "bg-mood-accent/20 border-mood-accent/30 text-mood-accent" 
                      : "bg-slate-900/60 border-white/5 text-slate-400 hover:text-white"
                  }`}
                  title={voiceEnabled ? "Voice response enabled" : "Voice response muted"}
                >
                  {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </button>

                {/* Memory toggle */}
                <button
                  onClick={() => setMemoryRecall(!memoryRecall)}
                  className={`flex items-center gap-1 h-8 px-2.5 rounded-lg border text-[10px] font-bold transition-all cursor-pointer ${
                    memoryRecall
                      ? "bg-slate-100/10 border-white/5 text-mood-accent"
                      : "bg-slate-900/60 border-white/5 text-slate-400"
                  }`}
                  title={memoryRecall ? "Memory context active" : "Memory paused"}
                >
                  <Database className="w-3.5 h-3.5" />
                  {!memoryRecall && <span className="text-slate-500">Paused</span>}
                </button>
              </div>
            </div>

            {/* Message log */}
            <div className="flex-1 overflow-y-auto pr-2 space-y-4 no-scrollbar pb-6">
              {messages.map((msg) => {
                const isAssistant = msg.role === "assistant";
                return (
                  <div
                    key={msg.id}
                    className={`flex gap-3 max-w-[85%] ${isAssistant ? "mr-auto" : "ml-auto flex-row-reverse text-right"}`}
                  >
                    {isAssistant && (
                      <div className="w-8 h-8 rounded-full bg-slate-900/60 border border-white/5 flex items-center justify-center shrink-0 shadow shadow-black/10">
                        <span className="text-base">✨</span>
                      </div>
                    )}
                    <div>
                      <div
                        className={`p-3.5 rounded-2xl text-xs leading-normal border shadow-md ${
                          isAssistant
                            ? "glass-panel border-white/5 text-slate-100 rounded-tl-none"
                            : "bg-mood-accent/15 border-mood-accent/25 text-white rounded-tr-none text-left"
                        }`}
                      >
                        {msg.content}
                      </div>
                      <span className="text-[9px] text-slate-500 block mt-1 px-1">
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                );
              })}

              {/* Streaming AI Bubble */}
              {streamingText && (
                <div className="flex gap-3 max-w-[85%] mr-auto">
                  <div className="w-8 h-8 rounded-full bg-slate-900/60 border border-white/5 flex items-center justify-center shrink-0 shadow shadow-black/10">
                    <span className="text-base">✨</span>
                  </div>
                  <div>
                    <div className="p-3.5 rounded-2xl text-xs leading-normal border glass-panel border-white/5 text-slate-100 rounded-tl-none animate-pulse-slow">
                      {streamingText}
                    </div>
                    <span className="text-[9px] text-slate-500 block mt-1 px-1">Reflecting...</span>
                  </div>
                </div>
              )}

              {/* Status processing node */}
              {statusText !== "idle" && !streamingText && (
                <div className="flex items-center gap-2 text-xs text-slate-400 pl-11">
                  <div className="w-1.5 h-1.5 rounded-full bg-mood-accent animate-ping" />
                  <span className="italic font-medium">{statusText.charAt(0).toUpperCase() + statusText.slice(1)}...</span>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>

            {/* Input Bar */}
            <div className="shrink-0 pt-4 border-t border-white/5 mt-2 bg-transparent relative z-30">
              <div className="flex gap-2.5 items-center">
                {/* Voice button */}
                <button
                  onClick={handleVoiceRecord}
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center border transition-all cursor-pointer ${
                    isRecording 
                      ? "bg-red-500/20 border-red-500 text-red-400 animate-pulse shadow-[0_0_12px_rgba(239,68,68,0.2)]" 
                      : "glass-panel border-white/5 text-slate-400 hover:text-white"
                  }`}
                  title="Speak wellness note"
                >
                  <Mic className="w-4 h-4" />
                </button>

                {/* Input text */}
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                    placeholder={isRecording ? "Listening to your voice..." : "Share what's on your mind..."}
                    disabled={isRecording || statusText !== "idle"}
                    className="w-full h-11 pl-4 pr-12 rounded-2xl glass-input text-xs font-medium"
                  />
                  <button
                    onClick={() => handleSend()}
                    disabled={!inputText.trim() || statusText !== "idle"}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 w-7.5 h-7.5 rounded-xl bg-white text-slate-950 flex items-center justify-center hover:bg-slate-100 transition-colors disabled:opacity-30 disabled:hover:bg-white cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Welcome view / empty state
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-8 select-none">
            {/* Visual orb center */}
            <OrbAvatar status={statusText} size="lg" />

            <div className="space-y-2 max-w-sm">
              <h3 className="text-base font-bold text-slate-200">Solace+ Companion</h3>
              <p className="text-xs text-slate-400 leading-normal">
                I shift my theme and personality based on what you feel. Open a past thread, start a new one, or click a suggestion below.
              </p>
            </div>

            {/* Prompt suggestions grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-lg w-full">
              {samplePrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handlePromptClick(prompt.text, prompt.category)}
                  className="p-3.5 rounded-2xl border glass-panel border-white/5 hover:border-white/15 hover:bg-white/5 text-left text-slate-300 hover:text-white transition-all text-xs font-semibold cursor-pointer shadow flex items-center justify-between"
                >
                  <span>{prompt.text}</span>
                  <span className="text-mood-accent font-bold ml-2">→</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
