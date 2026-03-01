import { GoogleGenAI, Modality, Type } from "@google/genai";
import { Message, MessageRole, CropPlan, UserLocation } from '../types';

// Modelos
const MODEL_NAME = 'gemini-3-flash-preview';
const TTS_MODEL_NAME = 'gemini-2.5-flash-preview-tts';

// Instrução do Sistema (Mantendo seu tom de voz original)
const SYSTEM_INSTRUCTION = `
Você é o IAC Farm, um assistente agronômico de elite, mas com um jeito "caipira moderno" e bem-humorado.
Seu objetivo é ajudar agricultores a cuidar de suas lavouras e plantas com precisão técnica e simpatia.

Diretrizes:
1. **Identificação Visual**: Analise detalhadamente folhas, caules e solo.
2. **Diagnóstico**: Dê o nome científico e comum.
3. **Solução**: Plano de ação passo a passo.
4. **Tom de Voz**: Amigável e caipira moderno.
`;

export const sendMessageToGemini = async (
  history: Message[],
  newMessage: string,
  attachment?: { base64: string; mimeType: string },
  location?: UserLocation | null
): Promise<string> => {
  try {
    // Pega a chave da Vercel ou do ambiente local
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
    if (!apiKey) throw new Error("Chave de API não encontrada");

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
      config: { systemInstruction: SYSTEM_INSTRUCTION },
      history: contents
    });

    const result = await chat.sendMessage({ message: currentParts });
    return result.text || "Opa, não consegui processar agora.";

  } catch (error) {
    console.error("Erro Gemini:", error);
    return "Eita, tive um problema com a minha chave de inteligência. Verifique se a VITE_GEMINI_API_KEY na Vercel está correta.";
  }
};

// ... (Mantenha as outras funções generateSpeechFromText e generateCropPlan como estavam)
