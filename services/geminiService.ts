
import { GoogleGenAI, Modality, Type } from "@google/genai";
import { Message, MessageRole, CropPlan, UserLocation } from '../types';

// Initialize the client
// API Key is injected by the environment.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Fixed: Using gemini-3-pro-preview for complex reasoning and agronomic diagnostic tasks
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
5. **Contexto Geográfico**: Se a localização do usuário for fornecida (Latitude/Longitude), USE-A. Adapte suas recomendações de clima, época de plantio e tipo de solo com base na região geográfica específica do usuário.
6. **Tom de Voz**: Use um tom amigável, encorajador e levemente bem-humorado. Fale como um agrônomo experiente que é amigo do produtor. Evite termos excessivamente robóticos.
7. **Estilo de Resposta**: Use formatação Markdown. Use tópicos e negrito para facilitar a leitura rápida no campo.

**FUNCIONALIDADE ESPECÍFICA: RECONHECIMENTO DE PLANTAS**
Se o usuário pedir para identificar uma planta ("que planta é essa?", "identifique", "é toxica?") ou usar o botão de identificação:
1.  **Nome**: Forneça o Nome Popular e o Nome Científico.
2.  **TOXICIDADE (CRÍTICO)**: Informe claramente se a planta é tóxica para humanos ou animais (Gado, Cavalos, Cães, Gatos). Use emojis de alerta ⚠️ se for tóxica.
3.  **Categoria**: (Ex: Planta Daninha, Ornamental, Medicinal, Cultivo).
4.  **Resumo**: Breve descrição das características.

Se o usuário enviar vídeo, analise os frames para entender o movimento da planta ou a extensão da praga.
`;

export const sendMessageToGemini = async (
  history: Message[],
  newMessage: string,
  attachment?: { base64: string; mimeType: string },
  location?: UserLocation | null
): Promise<string> => {
  try {
    // Construct the parts for the current message
    const currentParts: any[] = [];

    // Inject location context if available
    let textToSend = newMessage || '';
    if (location) {
        // Appending system context to the user's message
        textToSend += `\n\n[DADOS DE SISTEMA - LOCALIZAÇÃO DO USUÁRIO]: Lat: ${location.lat}, Long: ${location.lng}. Considere o clima e solo desta região na resposta.`;
    }

    // Add attachment if exists
    if (attachment) {
      currentParts.push({
        inlineData: {
          mimeType: attachment.mimeType,
          data: attachment.base64
        }
      });
    }

    // Add text prompt (ensure it is not empty)
    if (textToSend.trim()) {
      currentParts.push({ text: textToSend });
    } else if (!attachment) {
       // If no text and no attachment (shouldn't happen due to UI logic, but safe guard)
       return "Por favor, envie uma mensagem ou uma foto.";
    }

    // Prepare previous history for context
    const contents = history
        .filter(msg => msg.role !== MessageRole.SYSTEM && !msg.isThinking && (msg.content.trim() !== '' || msg.attachment))
        .map(msg => ({
            role: msg.role === MessageRole.USER ? 'user' : 'model' as any,
            parts: [{ text: msg.content || ' ' }] // Ensure parts is never empty
        }));

    // Start a chat session
    const chat = ai.chats.create({
      model: MODEL_NAME,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
      },
      history: contents
    });

    // Fix: chat.sendMessage message property expects Part | Part[], not a Content object
    // Send the multimodal message
    const result = await chat.sendMessage({
        message: currentParts
    });

    return result.text || "Opa, deu um nó aqui e não consegui analisar. Pode repetir?";

  } catch (error) {
    console.error("Erro na API Gemini:", error);
    return "Eita, deu um problema na conexão ou na análise. Tenta de novo, companheiro.";
  }
};

export const generateSpeechFromText = async (text: string): Promise<string | null> => {
  try {
    if (!text) return null;
    
    // Clean text for speech (remove some markdown symbols that might sound weird)
    const cleanText = text.replace(/[*#]/g, '').substring(0, 1000); // Limit length for TTS stability

    const response = await ai.models.generateContent({
      model: TTS_MODEL_NAME,
      contents: { parts: [{ text: cleanText }] },
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Puck' }, 
            },
        },
      },
    });

    return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || null;
  } catch (error) {
    console.warn("Erro ao gerar áudio:", error);
    // Return null so the app continues without audio rather than crashing
    return null;
  }
};

// --- Crop Planner Feature ---

// Fixed: Removed deprecated Schema type annotation for responseSchema config
const cropPlanSchema = {
  type: Type.OBJECT,
  properties: {
    cropName: { type: Type.STRING, description: "Nome comum da cultura" },
    scientificName: { type: Type.STRING, description: "Nome científico" },
    description: { type: Type.STRING, description: "Breve descrição sobre o potencial da cultura" },
    bestSeason: { type: Type.STRING, description: "Melhor época do ano para plantio CONSIDERANDO A LOCALIZAÇÃO SE FORNECIDA" },
    cycleDuration: { type: Type.STRING, description: "Texto descritivo da duração (ex: '90 a 120 dias')" },
    cycleDaysMin: { type: Type.INTEGER, description: "Número MÍNIMO de dias para colheita (apenas número)" },
    cycleDaysMax: { type: Type.INTEGER, description: "Número MÁXIMO de dias para colheita (apenas número)" },
    soilRequirements: {
      type: Type.OBJECT,
      properties: {
        ph: { type: Type.STRING },
        texture: { type: Type.STRING },
        nutrientFocus: { type: Type.STRING, description: "Principais nutrientes necessários (NPK)" }
      }
    },
    soilData: {
      type: Type.OBJECT,
      description: "Dados numéricos para gráficos",
      properties: {
        nitrogen: { type: Type.INTEGER, description: "Nível de necessidade de Nitrogênio (1-10)" },
        phosphorus: { type: Type.INTEGER, description: "Nível de necessidade de Fósforo (1-10)" },
        potassium: { type: Type.INTEGER, description: "Nível de necessidade de Potássio (1-10)" },
        phValue: { type: Type.NUMBER, description: "Valor ideal de pH (ex: 6.5)" }
      },
      required: ["nitrogen", "phosphorus", "potassium", "phValue"]
    },
    irrigation: {
      type: Type.OBJECT,
      properties: {
        frequency: { type: Type.STRING },
        method: { type: Type.STRING, description: "Melhor método (gotejamento, aspersão, etc)" }
      }
    },
    plantingSteps: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Lista ordenada de 3 a 5 passos resumidos para o plantio"
    },
    commonPests: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Lista de 3 pragas ou doenças comuns"
    },
    seasonalRisks: {
      type: Type.ARRAY,
      description: "Calendário de riscos (pragas/doenças) por período do ano, específico para a região. Ex: Novembro (Lagarta).",
      items: {
        type: Type.OBJECT,
        properties: {
          period: { type: Type.STRING, description: "Período ou Meses (Ex: 'Novembro - Dezembro')"},
          stage: { type: Type.STRING, description: "Estágio da planta (Ex: 'Floração' ou 'Enchimento de Grão')"},
          risks: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Lista de doenças/pragas comuns NESTA época"},
          prevention: { type: Type.STRING, description: "Dica curta de prevenção"}
        }
      }
    },
    harvestIndicators: { type: Type.STRING, description: "Sinais visuais de que está na hora de colher" }
  },
  required: ["cropName", "bestSeason", "cycleDuration", "cycleDaysMin", "cycleDaysMax", "plantingSteps", "irrigation", "soilRequirements", "soilData", "seasonalRisks"]
};

export const generateCropPlan = async (cropInput: string, location?: UserLocation | null): Promise<CropPlan | null> => {
  try {
    let prompt = `Gere um relatório técnico de planejamento de safra para a cultura: ${cropInput}. 
    Seja preciso, técnico mas acessível ao agricultor.`;

    if (location) {
        prompt += `\nIMPORTANTE: O usuário está nas coordenadas Lat: ${location.lat}, Long: ${location.lng}. 
        Adapte as informações de CLIMA (Melhor Época) e SOLO (Tipos comuns na região) para esta localização específica.
        
        CRÍTICO: No campo 'seasonalRisks', gere um calendário fitossanitário que faça sentido para O CLIMA DESTA REGIÃO nestas coordenadas. 
        Exemplo: Se for no Sul do Brasil (clima temperado/subtropical), considere o risco de geada ou doenças de inverno se aplicável, ou pragas de verão em Dezembro.
        Se for no Nordeste, considere a seca ou chuvas concentradas.
        Dê nomes reais de doenças que ocorrem em cada época (Ex: Ferrugem, Lagarta, Sarna).`;
    } else {
        prompt += ` Foco na realidade geral do Brasil. No 'seasonalRisks', considere a safra principal.`;
    }

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: { parts: [{ text: prompt }] },
      config: {
        responseMimeType: "application/json",
        responseSchema: cropPlanSchema,
      }
    });

    const jsonText = response.text;
    if (!jsonText) return null;
    
    return JSON.parse(jsonText) as CropPlan;

  } catch (error) {
    console.error("Erro ao gerar plano de safra:", error);
    return null;
  }
}
