
export enum MessageRole {
  USER = 'user',
  ASSISTANT = 'assistant',
  SYSTEM = 'system'
}

export interface Attachment {
  type: 'image' | 'video';
  url: string; // Blob URL for preview
  base64: string; // Base64 data for API
  mimeType: string;
}

export interface UserLocation {
  lat: number;
  lng: number;
}

export interface WeatherInfo {
  locationName: string; // Bairro or City
  temperature: number;
  humidity: number;
  windSpeed: number;
  loading: boolean;
}

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  attachment?: Attachment;
  timestamp: Date;
  isThinking?: boolean;
  audioBase64?: string;
  isAudioLoading?: boolean;
}

export interface GeminiConfig {
  temperature: number;
  topK: number;
  topP: number;
}

// New interfaces for Crop Planner
export interface CropPlan {
  cropName: string;
  scientificName: string;
  description: string;
  bestSeason: string;
  cycleDuration: string; // e.g. "90 - 120 dias"
  cycleDaysMin: number; // Numeric for calculation
  cycleDaysMax: number; // Numeric for calculation
  soilRequirements: {
    ph: string;
    texture: string;
    nutrientFocus: string;
  };
  // Data specifically for the chart
  soilData: {
    nitrogen: number; // 0-10 scale
    phosphorus: number; // 0-10 scale
    potassium: number; // 0-10 scale
    phValue: number; // absolute value
  };
  irrigation: {
    frequency: string;
    method: string;
  };
  plantingSteps: string[];
  commonPests: string[];
  // NEW: Seasonal Disease Calendar
  seasonalRisks: {
    period: string; // e.g., "Novembro - Dezembro"
    stage: string; // e.g., "Floração"
    risks: string[]; // e.g., ["Sarna", "Pulgão"]
    prevention: string; // Brief tip
  }[];
  harvestIndicators: string;
}

// Interface for the Plant History/Registry
export interface IdentifiedPlant {
  id: string;
  commonName: string;
  scientificName: string;
  date: string; // ISO string or formatted date
  imageUrl: string;
  healthStatus: 'healthy' | 'diseased' | 'pest' | 'deficiency';
  diagnosisSummary: string; // Short title of issue (e.g., "Ferrugem Asiática")
  fullDiagnosis: string; // Detailed text
  confidence: number; // 0-100
  location?: string; // e.g., "Talhão 03"
}

export type ViewMode = 'chat' | 'planner' | 'cameras' | 'automations' | 'dashboard' | 'emater' | 'presentation' | 'settings';

// Interfaces for System Presentation Data
export interface PresentationPillar {
  id: string;
  title: string;
  description: string;
  iconType: 'brain' | 'cctv' | 'zap' | 'chart';
  items: string[];
  color: 'blue' | 'red' | 'amber' | 'green';
}

export interface TechSpec {
  title: string;
  description: string;
  iconType: 'globe' | 'mobile' | 'shield';
  color: 'farm' | 'blue' | 'green';
}
