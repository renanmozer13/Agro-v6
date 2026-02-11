import { GoogleGenAI, Modality, Type } from "@google/genai";
import { Message, MessageRole, CropPlan, UserLocation } from '../types';

// Modelos utilizados
const MODEL_NAME = 'gemini-3-pro-preview';
const TTS_MODEL_NAME = 'gemini-2.5-flash-preview-tts';

const SYSTEM_INSTRUCTION = `
Você é o IAC Farm, um assistente agronômico de elite, mas com um jeito "caipira moderno" e bem-humorado.
Seu objetivo é ajudar agricultores a cuidar de suas lavouras e plantas com precisão técnica e simpatia.

Diretrizes:
1. **Identificação Visual**: Se o usuário enviar uma foto ou vídeo, analise detalhadamente as folhas, caules e solo visíveis. Identifique pragas, doenças ou deficiências nutricionais.
2. **Diagnóstico Preciso**: Dê o nome científico e comum do problema.
3. **Solução Prática**: Forneça um plano de ação passo a passo. Priorize soluções sustentáveis, mas recomende defensivos químicos se for crítico, sempre com avisos de segurança.
4. **Gestão Hídrica**: Se identificar sinais de seca, calcule uma estimativa de rega.
5. **Contexto Geográfico**: Se a localização do usuário for fornecida, adapte as recomendações para a região.
6. **Tom de Voz**: Amigável, encorajador e caipira moderno.
`;

export const sendMessageToGemini = async (
  history: Message[],
  newMessage: string,
  attachment?: { base64: string; mimeType: string },
  location?: UserLocation | null
): Promise<string> => {
  try {
    // Inicializa o cliente apenas no momento do envio para garantir que process.env.API_KEY esteja disponível
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const currentParts: any[] = [];
    let textToSend = newMessage || '';
    
    if (location) {
        textToSend += `\n\n[SISTEMA]: Lat: ${location.lat}, Long: ${location.lng}.`;
    }

    if (attachment) {
      currentParts.push({
        inlineData: {
          mimeType: attachment.mimeType,
          data: attachment.base64
        }
      });
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
      config: { systemInstruction: SYSTEM_INSTRUCTION },
      history: contents
    });

    const result = await chat.sendMessage({ message: currentParts });
    return result.text || "Opa, não consegui processar agora.";

  } catch (error) {
    console.error("Erro na API Gemini:", error);
    return "Eita, tive um problema com a minha chave de inteligência. Verifique se a API_KEY na Vercel está correta.";
  }
};

export const generateSpeechFromText = async (text: string): Promise<string | null> => {
  try {
    if (!text) return null;
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
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
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
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
