import { GoogleGenAI, Modality, Type } from "@google/genai";
import { Message, MessageRole, CropPlan, UserLocation } from '../types';

// Alterado para o nome mais universal e estável
const MODEL_NAME = 'gemini-flash-latest';
const TTS_MODEL_NAME = 'gemini-flash-latest';

export const sendMessageToGemini = async (
  history: Message[],
  newMessage: string,
  attachment?: { base64: string; mimeType: string },
  location?: UserLocation | null
): Promise<string> => {
  try {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
    
    if (!apiKey) {
      return "Atenção: A chave VITE_GEMINI_API_KEY não foi encontrada. Verifique as variáveis na Vercel.";
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

    // Usando o método correto para a versão mais comum da biblioteca
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: { parts: currentParts },
      config: { 
        systemInstruction: "Você é o IAC Farm, um assistente agronômico simpático e técnico. Ajude o agricultor com diagnósticos e planos de safra." 
      }
    });

    return response.text || "Opa, não consegui processar agora.";

  } catch (error: any) {
    console.error("Erro Gemini:", error);
    return `Erro na IA: ${error.message || 'Verifique sua chave na Vercel'}`;
  }
};

// ... (Mantenha o restante das funções)
