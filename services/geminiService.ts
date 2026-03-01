import { GoogleGenAI, Modality, Type } from "@google/genai";
import { Message, MessageRole, CropPlan, UserLocation } from '../types';

// Modelo 1.5 Flash: O mais estável e rápido para o plano gratuito
const MODEL_NAME = 'gemini-1.5-flash';
const TTS_MODEL_NAME = 'gemini-1.5-flash';

// Função auxiliar para pegar a chave de forma robusta
const getApiKey = () => {
  return import.meta.env.VITE_GEMINI_API_KEY || '';
};

export const sendMessageToGemini = async (
  history: Message[],
  newMessage: string,
  attachment?: { base64: string; mimeType: string },
  location?: UserLocation | null
): Promise<string> => {
  try {
    const apiKey = getApiKey();
    
    if (!apiKey || apiKey.length < 10) {
      return "Atenção: A chave VITE_GEMINI_API_KEY não foi encontrada. Verifique se você salvou a variável na Vercel e se o arquivo vite.config.ts foi atualizado corretamente.";
    }

    const ai = new GoogleGenAI({ apiKey });
    const currentParts: any[] = [];
    let textToSend = newMessage || '';
    
    if (location) {
        textToSend += `\n\n[SISTEMA]: Lat: ${location.lat}, Long: ${location.lng}.`;
    }

    if (attachment) {
      currentParts.push({ inlineData: { mimeType: attachment.mimeType, data: attachment.base64 } });
    }

    if (textToSend.trim()) {
      currentParts.push({ text: textToSend });
    }

    const contents = history
        .filter(msg => msg.role !== MessageRole.SYSTEM && !msg.isThinking && (msg.content.trim() !== '' || msg.attachment))
        .map(msg => ({
            role: msg.role === MessageRole.USER ? 'user' : 'model' as any,
            parts: [{ text: msg.content || ' ' }]
        }));

    const chat = ai.chats.create({
      model: MODEL_NAME,
      config: { 
        systemInstruction: "Você é o IAC Farm, um assistente agronômico simpático e técnico. Ajude o agricultor com diagnósticos e planos de safra." 
      },
      history: contents
    });

    const result = await chat.sendMessage({ message: currentParts });
    return result.text || "Opa, não consegui processar agora.";

  } catch (error: any) {
    console.error("Erro Gemini:", error);
    return `Erro na IA: ${error.message || 'Verifique sua chave na Vercel'}`;
  }
};

export const generateSpeechFromText = async (text: string): Promise<string | null> => {
  try {
    if (!text) return null;
    const apiKey = getApiKey();
    if (!apiKey) return null;

    const ai = new GoogleGenAI({ apiKey });
    const cleanText = text.replace(/[*#]/g, '').substring(0, 800);

    const response = await ai.models.generateContent({
      model: TTS_MODEL_NAME,
      contents: { parts: [{ text: cleanText }] },
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Puck' } },
        },
      },
    });

    return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || null;
  } catch (error) {
    return null;
  }
};

const cropPlanSchema = {
  type: Type.OBJECT,
  properties: {
    cropName: { type: Type.STRING },
    scientificName: { type: Type.STRING },
    description: { type: Type.STRING },
    bestSeason: { type: Type.STRING },
    cycleDuration: { type: Type.STRING },
    cycleDaysMin: { type: Type.INTEGER },
    cycleDaysMax: { type: Type.INTEGER },
    soilRequirements: {
      type: Type.OBJECT,
      properties: { ph: { type: Type.STRING }, texture: { type: Type.STRING }, nutrientFocus: { type: Type.STRING } }
    },
    soilData: {
      type: Type.OBJECT,
      properties: { nitrogen: { type: Type.INTEGER }, phosphorus: { type: Type.INTEGER }, potassium: { type: Type.INTEGER }, phValue: { type: Type.NUMBER } },
      required: ["nitrogen", "phosphorus", "potassium", "phValue"]
    },
    irrigation: { type: Type.OBJECT, properties: { frequency: { type: Type.STRING }, method: { type: Type.STRING } } },
    plantingSteps: { type: Type.ARRAY, items: { type: Type.STRING } },
    commonPests: { type: Type.ARRAY, items: { type: Type.STRING } },
    seasonalRisks: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: { period: { type: Type.STRING }, stage: { type: Type.STRING }, risks: { type: Type.ARRAY, items: { type: Type.STRING } }, prevention: { type: Type.STRING } }
      }
    },
    harvestIndicators: { type: Type.STRING }
  },
  required: ["cropName", "bestSeason", "cycleDuration", "cycleDaysMin", "cycleDaysMax", "plantingSteps", "irrigation", "soilRequirements", "soilData", "seasonalRisks"]
};

export const generateCropPlan = async (cropInput: string, location?: UserLocation | null): Promise<CropPlan | null> => {
  try {
    const apiKey = getApiKey();
    const ai = new GoogleGenAI({ apiKey });
    let prompt = `Gere um relatório técnico de planejamento de safra para a cultura: ${cropInput}.`;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: { parts: [{ text: prompt }] },
      config: {
        responseMimeType: "application/json",
        responseSchema: cropPlanSchema,
      }
    });

    return JSON.parse(response.text) as CropPlan;
  } catch (error) {
    return null;
  }
};
