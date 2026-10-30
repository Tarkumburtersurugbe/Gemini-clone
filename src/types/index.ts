export type StudioMode =
  | 'chat'
  | 'library'
  | 'imagen'
  | 'scheduled'
  | 'students'
  | 'customize'
  | 'notebooks'
  | 'video'
  | 'audio'
  | 'playground';

export type ThemeMode = 'light' | 'dark';

export interface NotebookItem {
  id: string;
  title: string;
  content: string;
  updatedAt: number;
  tags?: string[];
}

export interface ScheduledTask {
  id: string;
  title: string;
  prompt: string;
  frequency: string;
  category: string;
  active: boolean;
  lastRun?: number;
  lastResponse?: string;
}

export interface FileAttachment {
  id: string;
  name: string;
  mimeType: string;
  base64: string;
  previewUrl: string;
  size: number;
  type: 'image' | 'video' | 'audio' | 'document';
}

export interface GroundingSource {
  title?: string;
  uri?: string;
}

export interface GroundingMetadata {
  webSearchQueries?: string[];
  groundingChunks?: Array<{
    web?: {
      uri?: string;
      title?: string;
    };
  }>;
  groundingSupports?: any[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  thinkingProcess?: string;
  isThinkingOpen?: boolean;
  timestamp: number;
  files?: FileAttachment[];
  groundingMetadata?: GroundingMetadata;
  audioBase64?: string;
  isStreaming?: boolean;
  error?: string;
}

export interface ChatSession {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: ChatMessage[];
  model: string;
  systemInstruction?: string;
  temperature: number;
  topP: number;
  thinkingLevel?: 'MINIMAL' | 'LOW' | 'MEDIUM' | 'HIGH';
  enableSearch: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  signedInAt: number;
}

export interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  model: string;
  aspectRatio: string;
  timestamp: number;
  revisedPrompt?: string;
}

export interface SampleMediaItem {
  id: string;
  title: string;
  description: string;
  type: 'image' | 'video' | 'audio';
  url: string;
  mimeType: string;
  thumbnail?: string;
  suggestedPrompt: string;
}
