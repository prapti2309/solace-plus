"use client";

export interface Profile {
  name: string;
  nickname: string;
  age_group: string;
  pronouns: string;
  timezone: string;
  language: string;
  goals: string[];
  interests: string[];
  occupation: string;
  routine: string[];
  communication_style: string;
  is_anonymous?: boolean;
  emergency_contact: {
    name: string;
    relationship: string;
    phone: string;
    consent: boolean;
  };
  consent_flags: {
    profile: boolean;
    chat_history: boolean;
    mood_tracking: boolean;
    journal_summary: boolean;
    long_term_memory: boolean;
    voice_analysis: boolean;
  };
}

export interface Conversation {
  id: string;
  title: string;
  category: string;
  created_at: string;
  is_pinned?: boolean;
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
  emotion_tags?: {
    primary_emotion: string;
    intensity: number;
  };
}

export interface MoodLog {
  id: string;
  mood_label: "happy" | "calm" | "sad" | "anxious" | "angry" | "burnout" | "hopeful";
  intensity: number; // 1 to 10
  note: string;
  created_at: string;
}

export interface JournalEntry {
  id: string;
  type: "daily" | "gratitude" | "voice";
  content: string;
  ai_summary?: string;
  mood_tag?: string;
  cognitive_distortions?: string[];
  created_at: string;
}

export interface Memory {
  id: string;
  title: string;
  description: string;
  category: "goals" | "family" | "relationships" | "triggers" | "preferences" | "coping" | "notes";
  importance: number; // 1 to 5
  is_locked: boolean;
  created_at: string;
}

export interface ConsentLog {
  id: string;
  field_name: string;
  action: "granted" | "revoked";
  timestamp: string;
}

export interface SafetyEvent {
  id: string;
  severity: "flagged" | "elevated" | "imminent";
  action_taken: string;
  created_at: string;
}

export interface SolaceDb {
  isOnboarded: boolean;
  profile: Profile;
  conversations: Conversation[];
  messages: Record<string, Message[]>;
  mood_logs: MoodLog[];
  journal_entries: JournalEntry[];
  memories: Memory[];
  consent_logs: ConsentLog[];
  safety_events: SafetyEvent[];
}

const DEFAULT_DB: SolaceDb = {
  isOnboarded: true,
  profile: {
    name: "Alex Mercer",
    nickname: "Al",
    age_group: "25-34",
    pronouns: "they/them",
    timezone: "GMT-5",
    language: "English",
    goals: ["Managing Stress", "Mindful Reflection", "Improving Sleep", "Building Boundaries"],
    interests: ["Creative Writing", "Nature Walks", "Yoga", "Electronic Music"],
    occupation: "Product UX Researcher",
    routine: ["Morning Coffee Meditation", "Midday Breathing Break", "10 PM Screen Shutdown"],
    communication_style: "Gentle and analytical, likes structure",
    emergency_contact: {
      name: "Sarah Mercer",
      relationship: "Sister",
      phone: "+1 (555) 932-8430",
      consent: true,
    },
    consent_flags: {
      profile: true,
      chat_history: true,
      mood_tracking: true,
      journal_summary: true,
      long_term_memory: true,
      voice_analysis: false,
    },
  },
  conversations: [
    {
      id: "chat-1",
      title: "Dealing with workday burnout",
      category: "worklife",
      created_at: new Date(Date.now() - 3600000 * 24).toISOString(), // 1 day ago
      is_pinned: true,
    },
    {
      id: "chat-2",
      title: "Feeling anxious about upcoming talk",
      category: "anxiety",
      created_at: new Date(Date.now() - 3600000 * 48).toISOString(), // 2 days ago
    },
  ],
  messages: {
    "chat-1": [
      {
        id: "m1",
        role: "user",
        content: "Hey Solace, I'm feeling really overwhelmed with this launch. There are too many moving parts and I feel like I'm running on empty.",
        created_at: new Date(Date.now() - 3600000 * 24 - 60000 * 5).toISOString(),
      },
      {
        id: "m2",
        role: "assistant",
        content: "I hear you, Alex. Running on empty makes even the smallest tasks feel like climbing a mountain. Take a slow breath. We don't have to fix the whole launch right now. Let's start by looking at just one tiny piece of the overwhelm. What's the main thing calling for your attention today?",
        created_at: new Date(Date.now() - 3600000 * 24 - 60000 * 4).toISOString(),
        emotion_tags: { primary_emotion: "calm", intensity: 8 },
      },
      {
        id: "m3",
        role: "user",
        content: "I have to present our layout design to the VP, and I feel like they won't like it. I just want to cancel the meeting.",
        created_at: new Date(Date.now() - 3600000 * 24 - 60000 * 3).toISOString(),
      },
      {
        id: "m4",
        role: "assistant",
        content: "That presentation is carrying a lot of weight. It makes sense you'd want to avoid that pressure. When we anticipate negative feedback, our minds often run to the worst-case scenarios. Let's try to gently reframe this: even if they suggest edits, does it mean your design failed, or is it just the normal collaborative process in action? What do you think?",
        created_at: new Date(Date.now() - 3600000 * 24 - 60000 * 2).toISOString(),
        emotion_tags: { primary_emotion: "hopeful", intensity: 7 },
      },
    ],
    "chat-2": [
      {
        id: "m5",
        role: "user",
        content: "I'm having a hard time catching my breath. My chest feels tight.",
        created_at: new Date(Date.now() - 3600000 * 48 - 60000 * 10).toISOString(),
      },
      {
        id: "m6",
        role: "assistant",
        content: "I'm right here with you, Alex. Let's pause everything. You don't need to explain anything right now. Let's do a simple grounding breath together. Breathe in slowly through your nose for 4 seconds... hold it for 4... now exhale slowly for 4... hold for 4. Shall we do that once more, or would you prefer a physical grounding exercises?",
        created_at: new Date(Date.now() - 3600000 * 48 - 60000 * 9).toISOString(),
        emotion_tags: { primary_emotion: "calm", intensity: 9 },
      },
    ],
  },
  mood_logs: [
    {
      id: "ml-1",
      mood_label: "calm",
      intensity: 7,
      note: "Quiet morning, did some yoga.",
      created_at: new Date(Date.now() - 3600000 * 24 * 14).toISOString(),
    },
    {
      id: "ml-2",
      mood_label: "happy",
      intensity: 8,
      note: "Had dinner with Sarah, felt very connected.",
      created_at: new Date(Date.now() - 3600000 * 24 * 13).toISOString(),
    },
    {
      id: "ml-3",
      mood_label: "anxious",
      intensity: 6,
      note: "Heavy workload, coffee jitters.",
      created_at: new Date(Date.now() - 3600000 * 24 * 12).toISOString(),
    },
    {
      id: "ml-4",
      mood_label: "calm",
      intensity: 8,
      note: "Took a long walk in the nature park.",
      created_at: new Date(Date.now() - 3600000 * 24 * 11).toISOString(),
    },
    {
      id: "ml-5",
      mood_label: "burnout",
      intensity: 7,
      note: "Meetings all day. Exhausted.",
      created_at: new Date(Date.now() - 3600000 * 24 * 10).toISOString(),
    },
    {
      id: "ml-6",
      mood_label: "sad",
      intensity: 5,
      note: "Felt lonely and nostalgic in the evening.",
      created_at: new Date(Date.now() - 3600000 * 24 * 9).toISOString(),
    },
    {
      id: "ml-7",
      mood_label: "hopeful",
      intensity: 8,
      note: "Cleaned my workspace, feeling fresh.",
      created_at: new Date(Date.now() - 3600000 * 24 * 8).toISOString(),
    },
    {
      id: "ml-8",
      mood_label: "calm",
      intensity: 7,
      note: "Smooth workday, paced myself.",
      created_at: new Date(Date.now() - 3600000 * 24 * 7).toISOString(),
    },
    {
      id: "ml-9",
      mood_label: "happy",
      intensity: 8,
      note: "Finished a major design research doc!",
      created_at: new Date(Date.now() - 3600000 * 24 * 6).toISOString(),
    },
    {
      id: "ml-10",
      mood_label: "anxious",
      intensity: 8,
      note: "Chest tightness before launch review.",
      created_at: new Date(Date.now() - 3600000 * 24 * 5).toISOString(),
    },
    {
      id: "ml-11",
      mood_label: "burnout",
      intensity: 8,
      note: "Slept poorly, work is overwhelming.",
      created_at: new Date(Date.now() - 3600000 * 24 * 4).toISOString(),
    },
    {
      id: "ml-12",
      mood_label: "sad",
      intensity: 6,
      note: "Tired and unmotivated today.",
      created_at: new Date(Date.now() - 3600000 * 24 * 3).toISOString(),
    },
    {
      id: "ml-13",
      mood_label: "hopeful",
      intensity: 7,
      note: "Starting to reframe work goals.",
      created_at: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
    },
    {
      id: "ml-14",
      mood_label: "calm",
      intensity: 8,
      note: "Used box breathing, felt much better.",
      created_at: new Date(Date.now() - 3600000 * 24 * 1).toISOString(),
    },
  ],
  journal_entries: [
    {
      id: "j-1",
      type: "daily",
      content: "Today was really tough at first. I felt like I couldn't catch my breath. I used the app for a guided breathing session, and it helped ease the tension in my chest. Then I spent an hour sorting out my desk. It is amazing how much a clean space helps. I realized that most of my stress comes from feeling out of control, so I'm focusing on pacing myself.",
      ai_summary: "Felt initial physical anxiety and chest tightness. De-escalated via guided breathing, followed by workspace cleaning. Noted stress stems from a perceived loss of control and resolved to prioritize pacing.",
      mood_tag: "calm",
      cognitive_distortions: ["All-or-Nothing Thinking", "Catastrophizing"],
      created_at: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
    },
    {
      id: "j-2",
      type: "gratitude",
      content: "I am grateful for my sister Sarah, who checked in on me when I was stressed. I'm grateful for the rain outside cooling down the evening. And I'm grateful for having the space to express my emotions without judgment.",
      ai_summary: "Expressed gratitude for sister Sarah's supportive outreach, refreshing rainfall, and safe self-reflection outlets.",
      mood_tag: "hopeful",
      created_at: new Date(Date.now() - 3600000 * 24 * 1).toISOString(),
    },
  ],
  memories: [
    {
      id: "mem-1",
      title: "Sister Sarah is emergency contact",
      description: "Sarah is Alex's sister and lives nearby. Alex feels safe calling her during high stress.",
      category: "relationships",
      importance: 5,
      is_locked: true,
      created_at: new Date(Date.now() - 3600000 * 24 * 10).toISOString(),
    },
    {
      id: "mem-2",
      title: "Triggered by VP design reviews",
      description: "Alex experiences elevated anxiety before presentations to leadership due to fear of negative critique.",
      category: "triggers",
      importance: 4,
      is_locked: false,
      created_at: new Date(Date.now() - 3600000 * 24 * 5).toISOString(),
    },
    {
      id: "mem-3",
      title: "Mindfulness routine preference",
      description: "Alex prefers breathing pacing over physical grounding exercises during early stages of anxiety.",
      category: "preferences",
      importance: 3,
      is_locked: false,
      created_at: new Date(Date.now() - 3600000 * 24 * 4).toISOString(),
    },
    {
      id: "mem-4",
      title: "Professional goal: Building boundaries",
      description: "Alex wants to practice saying no to late-evening meeting invites to protect sleep hygiene.",
      category: "goals",
      importance: 4,
      is_locked: false,
      created_at: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
    },
  ],
  consent_logs: [
    {
      id: "c-log-1",
      field_name: "long_term_memory",
      action: "granted",
      timestamp: new Date(Date.now() - 3600000 * 24 * 15).toISOString(),
    },
    {
      id: "c-log-2",
      field_name: "chat_history",
      action: "granted",
      timestamp: new Date(Date.now() - 3600000 * 24 * 15).toISOString(),
    },
  ],
  safety_events: [
    {
      id: "sf-1",
      severity: "flagged",
      action_taken: "Crisis keywords detected. Rendered custom safety disclaimer reminder.",
      created_at: new Date(Date.now() - 3600000 * 24 * 11).toISOString(),
    },
  ],
};

const LOCAL_STORAGE_KEY = "solace_plus_db";

export const getMockDb = (): SolaceDb => {
  if (typeof window === "undefined") return DEFAULT_DB;
  
  const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (!saved) {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(DEFAULT_DB));
    return DEFAULT_DB;
  }
  
  try {
    return JSON.parse(saved);
  } catch (e) {
    console.error("Failed to parse mock database, resetting...", e);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(DEFAULT_DB));
    return DEFAULT_DB;
  }
};

export const saveMockDb = (db: SolaceDb): void => {
  if (typeof window !== "undefined") {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(db));
  }
};

export const resetMockDb = (isOnboardingRequired = false): SolaceDb => {
  const newDb = {
    ...DEFAULT_DB,
    isOnboarded: !isOnboardingRequired,
    conversations: isOnboardingRequired ? [] : DEFAULT_DB.conversations,
    messages: isOnboardingRequired ? {} : DEFAULT_DB.messages,
    mood_logs: isOnboardingRequired ? [] : DEFAULT_DB.mood_logs,
    journal_entries: isOnboardingRequired ? [] : DEFAULT_DB.journal_entries,
    memories: isOnboardingRequired ? [] : DEFAULT_DB.memories,
    consent_logs: [],
    safety_events: [],
  };
  saveMockDb(newDb);
  return newDb;
};
