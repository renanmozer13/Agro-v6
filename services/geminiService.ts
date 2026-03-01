import { GoogleGenAI, Modality, Type } from "@google/genai";
import { Message, MessageRole, CropPlan, UserLocation } from '../types';

// Modelo 1.5 Flash: O mais estável e compatível para contas gratuitas
const MODEL_NAME = 'gemini-1.5-flash';
const TTS_MODEL_NAME = 'gemini-1.5-flash'; // Usando o mesmo para estabilidade

export const sendMessageToGemini = async (
  history: Message[],
  newMessage: string,
  attachment?: { base64: string; mimeType: string },
  location?: UserLocation | null
): Promise<string> => {
  try {
    // Tenta ler de várias formas para garantir que funcione na Vercel
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
    
    if (!apiKey) {
      return "Atenção: A chave VITE_GEMINI_API_KEY não foi encontrada no sistema. Verifique se você salvou a variável na Vercel e fez um novo Deploy.";
    }

    const ai = new GoogleGenAI({ apiKey });
    const currentParts: any[] = [];
    let textToSend = newMessage || '';
    
    if (location) {
        textToSend += `\n\n[SISTEMA]: Localização do usuário: Lat: ${location.lat}, Long: ${location.lng}.`;
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
    return result.text || "Opa, recebi uma resposta vazia. Tente novamente.";

  } catch (error: any) {
    console.error("Erro detalhado:", error);
    return `Erro na IA: ${error.message || 'Erro desconhecido'}. Verifique se sua chave do Gemini está ativa.`;
  }
};
