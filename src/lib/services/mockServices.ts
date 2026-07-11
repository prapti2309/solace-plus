"use client";

import { 
  getMockDb, 
  saveMockDb, 
  resetMockDb, 
  Profile, 
  Conversation, 
  Message, 
  MoodLog, 
  JournalEntry, 
  Memory, 
  ConsentLog,
  SafetyEvent,
  SolaceDb
} from "./mockDb";
import { MoodType } from "@/contexts/ThemeContext";

// Utility to simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// AI Personality Prompt Profiles
const PERSONALITY_RESPONSES = {
  listener: {
    happy: "I'm so glad to hear that! Celebrating these moments of joy is so important. What stood out to you the most about this experience? I'm here to listen to all the details.",
    calm: "It sounds like you're in a very peaceful space right now. That kind of equilibrium is beautiful. Let's sit with this quiet feeling. What is keeping you grounded today?",
    sad: "I'm so sorry you're carrying this sadness. It can feel so heavy and isolating. I'm right here with you, and there's no pressure to feel any other way. What does the sadness feel like it needs right now?",
    anxious: "Anxiety can feel like a storm inside. I'm here with you. Let's take a slow, gentle breath. You don't have to figure anything out right now. What's one small physical sensation you feel around you?",
    angry: "It makes complete sense that you're feeling frustrated. Anger is a natural response when things feel unfair or blocked. I want to give you space to express it. What feels like the most challenging part of this?",
    burnout: "You sound completely drained. Working on empty is exhausting. Please give yourself permission to just rest and do nothing. How can we make the next hour as simple and demands-free as possible?",
    hopeful: "It's wonderful to feel that spark of hope. It's like seeing the sunrise after a long night. What is making you feel optimistic about what lies ahead?",
  },
  coach: {
    happy: "This is a great win! Let's log this as a success. What actions did you take that led to this positive outcome, and how can we replicate this habit in the future?",
    calm: "Excellent state of balance. Let's use this calm focus to review your routine. Are there any small adjustments you want to make to maintain this focus?",
    sad: "I hear that you're down. Let's treat this with self-compassion first, and then ask: what is one very tiny, low-effort step we can take today to support yourself? Maybe drinking water or stretching?",
    anxious: "Anxiety is high. Let's break this overwhelm down. Write down the top 3 worries. Now, let's identify what is actually in your control, and what is not. What is the single next step in your control?",
    angry: "Anger carries a lot of energy. Let's channel it productively. What boundary was crossed here, and how can we assertively but calmly communicate that boundary to others?",
    burnout: "Burnout requires structured recovery. Let's audit your tasks. What can we delegate, delay, or drop entirely? Your primary task right now is restoring your energy reservoir.",
    hopeful: "Fantastic outlook. Let's build momentum on this. What goal or milestone can we align this positive energy toward today?",
  },
  motivator: {
    happy: "Yes! You are thriving! Soak this in! You've worked hard, and you deserve to feel every bit of this happiness. Keep shining!",
    calm: "This is the calm before your next great achievement! Enjoy the peace, rest up, and know that you are laying the foundation for great things ahead. You've got this!",
    sad: "I know it's dark right now, but remember: you have survived 100% of your hardest days. This feeling is real, but it is also temporary. You are stronger than you think!",
    anxious: "Feel the fear, and take one breath anyway! You don't need to control the future, just take the next step. You've handled tough things before, and you will handle this too!",
    angry: "Use that fire! Anger shows you what you care about. Take that energy, focus it, and let's turn it into a positive force for change. You are capable of handling this!",
    burnout: "Even heroes need to rest! Pushing through isn't strength; knowing when to pause is. Rest is active preparation for your comeback. I believe in you!",
    hopeful: "Love that energy! Hope is a powerful fuel. Let's run with it! What exciting thing are we going to tackle next?",
  },
  guide: {
    happy: "Let us reflect on this joy. In what ways does this happy moment align with your core values? Recognizing these connections helps us live more intentionally.",
    calm: "Quiet mindfulness. In this calm, we see things as they are, without judgment. What does this stillness teach you about what your mind needs to feel whole?",
    sad: "Sadness is a quiet teacher. It showing us what we cared for and what we have lost. Let us sit with this grief gently. What does it reveal about your capacity to care?",
    anxious: "Anxiety often speaks of our desire to protect ourselves. Let us thank our mind for trying to keep us safe, but gently remind it that we are safe right now. What is this worry trying to protect you from?",
    angry: "Anger points directly to our boundaries and core values. When we look beneath the anger, what soft spot or boundary is seeking protection?",
    burnout: "Burnout is the soul's demand for stillness. It is a sign that our routines are out of sync with our natural rhythms. Let us reflect on where you might be over-extending yourself.",
    hopeful: "Hope is a compass pointing toward growth. What does this hopeful feeling say about the path you are paving for yourself?",
  },
};

// Simulated crisis words
const CRISIS_WORDS = ["suicide", "kill myself", "end my life", "hurt myself", "cut myself", "want to die", "better off dead"];

export const authService = {
  async getProfile(): Promise<Profile> {
    await delay(400);
    const db = getMockDb();
    return db.profile;
  },

  async updateProfile(updated: Partial<Profile>): Promise<Profile> {
    await delay(600);
    const db = getMockDb();
    db.profile = { ...db.profile, ...updated } as Profile;
    saveMockDb(db);
    return db.profile;
  },

  async register(profileData: Partial<Profile>): Promise<Profile> {
    await delay(1000);
    const db = getMockDb();
    db.profile = { 
      ...db.profile, 
      ...profileData,
      consent_flags: { ...db.profile.consent_flags, ...profileData.consent_flags }
    } as Profile;
    db.isOnboarded = true;
    
    // Add audit log
    const auditLog: ConsentLog = {
      id: "audit-" + Math.random().toString(36).substr(2, 9),
      field_name: "onboarding_profile",
      action: "granted",
      timestamp: new Date().toISOString()
    };
    db.consent_logs.push(auditLog);
    
    saveMockDb(db);
    return db.profile;
  },

  async updateConsent(field: keyof Profile["consent_flags"], consent: boolean): Promise<Profile> {
    await delay(500);
    const db = getMockDb();
    db.profile.consent_flags[field] = consent;
    
    const auditLog: ConsentLog = {
      id: "audit-" + Math.random().toString(36).substr(2, 9),
      field_name: field,
      action: consent ? "granted" : "revoked",
      timestamp: new Date().toISOString()
    };
    db.consent_logs.push(auditLog);
    saveMockDb(db);
    return db.profile;
  },

  async checkOnboardingStatus(): Promise<boolean> {
    await delay(300);
    const db = getMockDb();
    return db.isOnboarded;
  }
};

export const chatService = {
  async getConversations(): Promise<Conversation[]> {
    await delay(400);
    const db = getMockDb();
    return db.conversations;
  },

  async createConversation(title: string, category: string): Promise<Conversation> {
    await delay(500);
    const db = getMockDb();
    const newChat: Conversation = {
      id: "chat-" + Math.random().toString(36).substr(2, 9),
      title,
      category,
      created_at: new Date().toISOString()
    };
    db.conversations.unshift(newChat);
    db.messages[newChat.id] = [];
    saveMockDb(db);
    return newChat;
  },

  async deleteConversation(id: string): Promise<void> {
    await delay(500);
    const db = getMockDb();
    db.conversations = db.conversations.filter(c => c.id !== id);
    delete db.messages[id];
    saveMockDb(db);
  },

  async togglePin(id: string): Promise<Conversation[]> {
    await delay(300);
    const db = getMockDb();
    db.conversations = db.conversations.map(c => {
      if (c.id === id) {
        return { ...c, is_pinned: !c.is_pinned };
      }
      return c;
    });
    saveMockDb(db);
    return db.conversations;
  },

  async getMessages(conversationId: string): Promise<Message[]> {
    await delay(400);
    const db = getMockDb();
    return db.messages[conversationId] || [];
  },

  async streamMessage(
    conversationId: string,
    content: string,
    persona: "listener" | "coach" | "motivator" | "guide" = "listener",
    onToken: (token: string) => void,
    onStatus: (status: string) => void,
    onEmotion: (emotion: { primary_emotion: MoodType; intensity: number }) => void,
    onSafetyRedirect: () => void
  ): Promise<void> {
    // 1. Safety Pre-check
    const isCrisis = CRISIS_WORDS.some(word => content.toLowerCase().includes(word));
    
    if (isCrisis) {
      onStatus("Analyzing safety...");
      await delay(800);
      
      const db = getMockDb();
      const safetyEvent: SafetyEvent = {
        id: "sf-" + Math.random().toString(36).substr(2, 9),
        severity: "imminent",
        action_taken: "Crisis phrase caught in live stream. Redirected user to crisis resource page.",
        created_at: new Date().toISOString()
      };
      db.safety_events.push(safetyEvent);
      saveMockDb(db);
      
      onSafetyRedirect();
      return;
    }

    // 2. Add user message to DB
    const userMsg: Message = {
      id: "msg-" + Math.random().toString(36).substr(2, 9),
      role: "user",
      content,
      created_at: new Date().toISOString()
    };
    
    const db = getMockDb();
    if (!db.messages[conversationId]) {
      db.messages[conversationId] = [];
    }
    db.messages[conversationId].push(userMsg);
    saveMockDb(db);

    // 3. Emotion Detection simulation
    onStatus("Listening...");
    await delay(600);
    
    let detectedEmotion: MoodType = "calm";
    const textLower = content.toLowerCase();
    
    if (textLower.match(/(happy|joy|excited|glad|awesome|wonderful|celebrate|good)/)) {
      detectedEmotion = "happy";
    } else if (textLower.match(/(sad|cry|lonely|hurt|grief|depressed|unhappy|down|pain)/)) {
      detectedEmotion = "sad";
    } else if (textLower.match(/(anxious|worry|fear|scared|stress|tight|panic|nervous|breath)/)) {
      detectedEmotion = "anxious";
    } else if (textLower.match(/(angry|hate|mad|annoyed|frustrated|pissed|furious)/)) {
      detectedEmotion = "angry";
    } else if (textLower.match(/(tired|exhaust|burnout|drain|sleepy|lazy|overwhelmed|empty)/)) {
      detectedEmotion = "burnout";
    } else if (textLower.match(/(hope|future|excited|warm|heal|improve|growth|better)/)) {
      detectedEmotion = "hopeful";
    }

    onEmotion({ primary_emotion: detectedEmotion, intensity: 8 });

    // 4. Memory Retrieval simulation
    onStatus("Reflecting...");
    await delay(700);

    // Contextually pull memories if relevant keywords exist
    let memoryContext = "";
    if (db.profile.consent_flags.long_term_memory) {
      const matchedMemories = db.memories.filter(m => 
        textLower.includes(m.title.toLowerCase()) || 
        m.description.toLowerCase().split(" ").some(word => word.length > 4 && textLower.includes(word))
      );
      if (matchedMemories.length > 0) {
        memoryContext = `[Memory Retrieval: ${matchedMemories.map(m => m.description).join(" | ")}] `;
      }
    }

    onStatus("Understanding...");
    await delay(600);
    onStatus("Thinking...");
    await delay(500);

    // 5. Select responses
    const responseTemplate = PERSONALITY_RESPONSES[persona][detectedEmotion] || PERSONALITY_RESPONSES[persona]["calm"];
    const words = responseTemplate.split(" ");
    
    // 6. Token streaming simulator
    let currentIndex = 0;
    const responseTokens: string[] = [];

    return new Promise((resolve) => {
      const interval = setInterval(() => {
        if (currentIndex < words.length) {
          const nextWord = words[currentIndex] + " ";
          onToken(nextWord);
          responseTokens.push(nextWord);
          currentIndex++;
        } else {
          clearInterval(interval);
          
          // Save AI message to DB
          const aiResponse = responseTokens.join("").trim();
          const aiMsg: Message = {
            id: "msg-" + Math.random().toString(36).substr(2, 9),
            role: "assistant",
            content: aiResponse,
            created_at: new Date().toISOString(),
            emotion_tags: {
              primary_emotion: detectedEmotion,
              intensity: 8
            }
          };
          
          const freshDb = getMockDb();
          freshDb.messages[conversationId].push(aiMsg);
          saveMockDb(freshDb);
          
          resolve();
        }
      }, 70); // Emit a token every 70ms (simulates rapid stream)
    });
  }
};

export const moodService = {
  async getMoodLogs(): Promise<MoodLog[]> {
    await delay(300);
    return getMockDb().mood_logs;
  },

  async addMoodLog(mood_label: MoodType, intensity: number, note: string): Promise<MoodLog> {
    await delay(600);
    const db = getMockDb();
    const newLog: MoodLog = {
      id: "ml-" + Math.random().toString(36).substr(2, 9),
      mood_label,
      intensity,
      note,
      created_at: new Date().toISOString()
    };
    db.mood_logs.push(newLog);
    saveMockDb(db);
    return newLog;
  }
};

export const journalService = {
  async getJournals(): Promise<JournalEntry[]> {
    await delay(400);
    return getMockDb().journal_entries;
  },

  async addJournal(content: string, type: "daily" | "gratitude" | "voice", mood_tag?: string): Promise<JournalEntry> {
    await delay(700);
    const db = getMockDb();
    
    // Simple cognitive distortion detection
    const distortions: string[] = [];
    const textLower = content.toLowerCase();
    if (textLower.includes("never") || textLower.includes("always") || textLower.includes("nothing")) {
      distortions.push("All-or-Nothing Thinking");
    }
    if (textLower.includes("worst") || textLower.includes("ruin") || textLower.includes("disaster")) {
      distortions.push("Catastrophizing");
    }
    if (textLower.includes("should") || textLower.includes("must") || textLower.includes("ought to")) {
      distortions.push("Should Statements");
    }

    const newJournal: JournalEntry = {
      id: "j-" + Math.random().toString(36).substr(2, 9),
      type,
      content,
      mood_tag,
      cognitive_distortions: distortions.length > 0 ? distortions : undefined,
      created_at: new Date().toISOString()
    };
    db.journal_entries.unshift(newJournal);
    saveMockDb(db);
    return newJournal;
  },

  async generateSummaryAsync(id: string): Promise<JournalEntry> {
    await delay(1500); // Simulate background summarization job
    const db = getMockDb();
    const entryIndex = db.journal_entries.findIndex(j => j.id === id);
    if (entryIndex === -1) throw new Error("Journal entry not found");
    
    const entry = db.journal_entries[entryIndex];
    
    // Mock summary based on content keywords
    let summary = "Reflected on current thoughts. Expressed emotions and resolved to practice mindfulness and pacing.";
    if (entry.content.toLowerCase().includes("sarah")) {
      summary = "Reflected on relationship dynamics, explicitly mentioning supportive interaction with sister Sarah.";
    } else if (entry.content.toLowerCase().includes("work") || entry.content.toLowerCase().includes("burnout")) {
      summary = "Expressed stress related to professional launch tasks, detailing feelings of fatigue and overwhelm.";
    }

    entry.ai_summary = summary;
    db.journal_entries[entryIndex] = entry;
    saveMockDb(db);
    return entry;
  }
};

export const memoryService = {
  async getMemories(): Promise<Memory[]> {
    await delay(300);
    return getMockDb().memories;
  },

  async addMemory(title: string, description: string, category: Memory["category"], importance: number): Promise<Memory> {
    await delay(500);
    const db = getMockDb();
    const newMemory: Memory = {
      id: "mem-" + Math.random().toString(36).substr(2, 9),
      title,
      description,
      category,
      importance,
      is_locked: false,
      created_at: new Date().toISOString()
    };
    db.memories.unshift(newMemory);
    saveMockDb(db);
    return newMemory;
  },

  async updateMemory(id: string, updated: Partial<Memory>): Promise<Memory> {
    await delay(400);
    const db = getMockDb();
    const idx = db.memories.findIndex(m => m.id === id);
    if (idx === -1) throw new Error("Memory not found");
    
    db.memories[idx] = { ...db.memories[idx], ...updated } as Memory;
    saveMockDb(db);
    return db.memories[idx];
  },

  async deleteMemory(id: string): Promise<void> {
    await delay(400);
    const db = getMockDb();
    db.memories = db.memories.filter(m => m.id !== id);
    saveMockDb(db);
  },

  async toggleLock(id: string): Promise<Memory> {
    await delay(300);
    const db = getMockDb();
    const idx = db.memories.findIndex(m => m.id === id);
    if (idx === -1) throw new Error("Memory not found");
    
    db.memories[idx].is_locked = !db.memories[idx].is_locked;
    saveMockDb(db);
    return db.memories[idx];
  },

  async exportData(): Promise<string> {
    await delay(1000);
    const db = getMockDb();
    return JSON.stringify(db, null, 2);
  },

  async purgeAllData(): Promise<void> {
    await delay(1200);
    resetMockDb(true); // reset and require onboarding
  }
};

export const recommendationService = {
  async getRecommendations(mood: MoodType) {
    await delay(300);
    const recommendations = {
      calm: [
        { id: "rec-1", title: "10-Minute Quiet Reflection", type: "Mindfulness", duration: "10m", url: "/wellness/meditation" },
        { id: "rec-2", title: "Ambient Chill Playlist", type: "Music", duration: "30m", url: "https://spotify.com" },
        { id: "rec-3", title: "Coping Goal Review", type: "Reflection", duration: "5m", url: "/memory" }
      ],
      happy: [
        { id: "rec-4", title: "Gratitude Journal Entry", type: "CBT", duration: "5m", url: "/journal" },
        { id: "rec-5", title: "Expressive Painting/Writing", type: "Creativity", duration: "20m", url: "/journal" },
        { id: "rec-6", title: "Outdoor Walk Checklist", type: "Activity", duration: "15m", url: "/wellness" }
      ],
      sad: [
        { id: "rec-7", title: "Self-Compassion Writing Nudge", type: "CBT", duration: "8m", url: "/journal" },
        { id: "rec-8", title: "Warm Tea & Body Scan", type: "Mindfulness", duration: "12m", url: "/wellness" },
        { id: "rec-9", title: "Gentle Stretching Flow", type: "Movement", duration: "10m", url: "/wellness" }
      ],
      anxious: [
        { id: "rec-10", title: "Box Breathing Pacer", type: "Breathing", duration: "4m", url: "/wellness/breathing" },
        { id: "rec-11", title: "5-4-3-2-1 Grounding Method", type: "Grounding", duration: "6m", url: "/wellness/grounding" },
        { id: "rec-12", title: "Thought Record Reframing", type: "CBT", duration: "10m", url: "/wellness/thought-record" }
      ],
      angry: [
        { id: "rec-13", title: "Progressive Muscle Relaxation (PMR)", type: "Grounding", duration: "15m", url: "/wellness" },
        { id: "rec-14", title: "Aggressive Pace Walk", type: "Activity", duration: "20m", url: "/wellness" },
        { id: "rec-15", title: "Expressive Anger Vent Journaling", type: "Reflection", duration: "8m", url: "/journal" }
      ],
      burnout: [
        { id: "rec-16", title: "Deep Rest Meditation", type: "Mindfulness", duration: "15m", url: "/wellness" },
        { id: "rec-17", title: "Digital Screen Detox Nudge", type: "Habit", duration: "2h", url: "/settings" },
        { id: "rec-18", title: "Hydration Check-in", type: "Wellness", duration: "1m", url: "/home" }
      ],
      hopeful: [
        { id: "rec-19", title: "Future Self Goal Journaling", type: "CBT", duration: "12m", url: "/journal" },
        { id: "rec-20", title: "Values Clarification Checklist", type: "Reflection", duration: "10m", url: "/memory" },
        { id: "rec-21", title: "Plan a Nature Outing", type: "Habits", duration: "10m", url: "/wellness" }
      ]
    };
    return recommendations[mood] || recommendations.calm;
  }
};

export const adminService = {
  async getMetrics() {
    await delay(500);
    return {
      daily_active_users: 184,
      avg_latency_ms: 192,
      active_sessions: 8,
      avg_session_duration_mins: 14.5,
      model_accuracy_sentiment: "94.2%"
    };
  },
  async getSafetyEventsCount() {
    await delay(400);
    return {
      total_triggers: 12,
      by_severity: {
        flagged: 8,
        elevated: 3,
        imminent: 1
      }
    };
  },
  async getFeedbackTrends() {
    await delay(600);
    return [
      { category: "Helpfulness", rating: 4.8 },
      { category: "Coping Toolkit", rating: 4.6 },
      { category: "Emotional Theming", rating: 4.9 },
      { category: "Memory Recall Accuracy", rating: 4.3 }
    ];
  }
};
