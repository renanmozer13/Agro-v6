
import React, { useState, useEffect, useRef } from 'react';
import { Message, MessageRole, Attachment, UserLocation, WeatherInfo, ViewMode } from './types';
import { sendMessageToGemini, generateSpeechFromText } from './services/geminiService';
import { fetchLocalWeather } from './services/weatherService';
import { playRawAudio } from './utils/audioUtils';
import { dbService } from './services/dbService';

// Components
import Sidebar from './components/Sidebar';
import ChatMessage from './components/ChatMessage';
import InputArea from './components/InputArea';
import CropPlanner from './components/CropPlanner';
import CameraGrid from './components/CameraGrid';
import AutomationControl from './components/AutomationControl';
import FarmDashboard from './components/FarmDashboard';
import LoginScreen from './components/LoginScreen';
import EmaterChannel from './components/EmaterChannel';
import SystemPresentation from './components/SystemPresentation';
import Settings from './components/Settings';
import PlantRegistry from './components/PlantRegistry';

import { Menu, Square, Bot, Camera, Flower2 } from 'lucide-react';

const INITIAL_MESSAGE: Message = {
  id: 'init-1',
  role: MessageRole.ASSISTANT,
  content: `Olá! Sou o IAC Farm, seu assistente agronômico. Posso ajudar com diagnósticos de pragas, planejamento de safra ou dúvidas técnicas. Envie uma foto ou faça uma pergunta!`,
  timestamp: new Date()
};

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [view, setView] = useState<ViewMode | 'registry'>('chat');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [weatherInfo, setWeatherInfo] = useState<WeatherInfo | null>(null);
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [audioStopper, setAudioStopper] = useState<(() => void) | null>(null);
  const [playingMessageId, setPlayingMessageId] = useState<string | null>(null);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  useEffect(() => { if (view === 'chat') scrollToBottom(); }, [messages, view]);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const loc = { lat: position.coords.latitude, lng: position.coords.longitude };
          setUserLocation(loc);
          const weather = await fetchLocalWeather(loc);
          setWeatherInfo(weather);
        }
      );
    }
  }, []);

  const stopAudio = () => { if (audioStopper) { audioStopper(); setAudioStopper(null); setPlayingMessageId(null); } };

  const handleToggleAudio = async (messageId: string) => {
    if (playingMessageId === messageId) { stopAudio(); return; }
    stopAudio();
    const msg = messages.find(m => m.id === messageId);
    if (!msg) return;
    if (msg.audioBase64) {
      setPlayingMessageId(messageId);
      const stopFn = await playRawAudio(msg.audioBase64, () => { setAudioStopper(null); setPlayingMessageId(null); });
      setAudioStopper(() => stopFn);
      return;
    }
    setMessages(prev => prev.map(m => m.id === messageId ? { ...m, isAudioLoading: true } : m));
    try {
      const audioBase64 = await generateSpeechFromText(msg.content);
      setMessages(prev => prev.map(m => m.id === messageId ? { ...m, isAudioLoading: false, audioBase64: audioBase64 || undefined } : m));
      if (audioBase64) {
        setPlayingMessageId(messageId);
        const stopFn = await playRawAudio(audioBase64, () => { setAudioStopper(null); setPlayingMessageId(null); });
        setAudioStopper(() => stopFn);
      }
    } catch (e) { setMessages(prev => prev.map(m => m.id === messageId ? { ...m, isAudioLoading: false } : m)); }
  };

  const handleSendMessage = async (text: string, attachment?: Attachment) => {
    stopAudio();
    const newMessage: Message = { id: Date.now().toString(), role: MessageRole.USER, content: text, attachment, timestamp: new Date() };
    setMessages(prev => [...prev, newMessage]);
    setIsLoading(true);
    const thinkingId = 'thinking-' + Date.now();
    setMessages(prev => [...prev, { id: thinkingId, role: MessageRole.ASSISTANT, content: '', timestamp: new Date(), isThinking: true }]);

    try {
      const responseText = await sendMessageToGemini(messages, text, attachment ? { base64: attachment.base64, mimeType: attachment.mimeType } : undefined, userLocation);
      
      setMessages(prev => {
        const filtered = prev.filter(msg => msg.id !== thinkingId);
        return [...filtered, { id: Date.now().toString(), role: MessageRole.ASSISTANT, content: responseText, timestamp: new Date() }];
      });

      // Lógica de Salvamento Automático no Supabase para Diagnósticos com Imagem
      if (attachment && attachment.type === 'image') {
        const publicUrl = await dbService.uploadImage(attachment.base64, "plant_chat");
        if (publicUrl) {
          // Extrai diagnóstico básico da resposta do Gemini para salvar
          // Em um app real, poderíamos pedir ao Gemini uma resposta estruturada JSON paralela
          await dbService.savePlantDiagnosis({
            commonName: "Planta Identificada",
            scientificName: "Análise via Chat",
            date: new Date().toISOString(),
            imageUrl: publicUrl,
            healthStatus: responseText.toLowerCase().includes('doença') ? 'diseased' : 'healthy',
            diagnosisSummary: "Análise Automática Chat",
            fullDiagnosis: responseText,
            confidence: 85,
            location: userLocation ? `${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)}` : 'Não informada'
          });
        }
      }
    } catch (error) {
       setMessages(prev => prev.filter(msg => msg.id !== thinkingId));
       setMessages(prev => [...prev, { id: Date.now().toString(), role: MessageRole.ASSISTANT, content: "Opa, deu um problema na conexão.", timestamp: new Date() }]);
    } finally { setIsLoading(false); }
  };

  const getHeaderTitle = () => {
    switch (view) {
      case 'chat': return 'IAC Farm - Assistente';
      case 'planner': return 'Planejamento';
      case 'cameras': return 'Segurança';
      case 'automations': return 'Acionamentos';
      case 'dashboard': return 'Minha Fazenda';
      case 'emater': return 'Canal EMATER';
      case 'presentation': return 'Relatório Executivo';
      case 'settings': return 'Configurações';
      case 'registry': return 'Minhas Plantas';
      default: return 'IAC Farm';
    }
  };

  if (!isAuthenticated) return <LoginScreen onLogin={() => setIsAuthenticated(true)} />;

  return (
    <div className="flex h-screen w-full relative overflow-hidden bg-white font-sans text-stone-900 animate-fade-in">
      <Sidebar 
        view={view as ViewMode} 
        setView={(v) => setView(v as ViewMode | 'registry')} 
        isSidebarOpen={isSidebarOpen} 
        setIsSidebarOpen={setIsSidebarOpen}
        isSidebarCollapsed={isSidebarCollapsed}
        setIsSidebarCollapsed={setIsSidebarCollapsed}
        userLocation={userLocation}
        weatherInfo={weatherInfo}
      />

      {isSidebarOpen && <div className="fixed inset-0 bg-stone-900/50 backdrop-blur-sm z-30 md:hidden" onClick={() => setIsSidebarOpen(false)} />}

      <main className="flex-1 flex flex-col h-full relative z-10 w-full bg-transparent transition-all duration-300">
        <div className="md:hidden flex items-center justify-between p-4 bg-white/80 backdrop-blur-md border-b border-stone-200 sticky top-0 z-20">
          <button onClick={() => setIsSidebarOpen(true)} className="text-farm-800 p-2 hover:bg-stone-100 rounded-lg"><Menu size={24} /></button>
          <span className="text-farm-900 font-bold text-lg tracking-tight">{getHeaderTitle()}</span>
          <div className="w-6" />
        </div>

        {view === 'chat' && (
          <>
            <div className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth bg-white">
              <div className="max-w-4xl mx-auto min-h-full flex flex-col pb-4">
                <div className="bg-gradient-to-r from-farm-600 to-farm-500 rounded-3xl p-6 md:p-8 text-white mb-6 flex justify-between items-center shadow-lg shadow-farm-600/20">
                   <div>
                      <h1 className="text-2xl md:text-3xl font-black mb-1 tracking-tight">IAC Farm</h1>
                      <p className="text-farm-100 text-sm font-medium opacity-90">Sua lavoura na palma da mão</p>
                   </div>
                   <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm"><Bot size={32} className="text-white" /></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                   <button onClick={() => setView('registry')} className="bg-white border border-stone-100 shadow-sm rounded-2xl p-6 flex flex-col items-center text-center hover:shadow-md hover:border-farm-100 transition-all group cursor-pointer">
                      <div className="w-14 h-14 bg-farm-50 text-farm-600 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform"><Flower2 size={26} /></div>
                      <h3 className="font-bold text-stone-800 text-lg">Histórico de Plantas</h3>
                      <p className="text-xs text-stone-500 font-medium">Ver diagnósticos arquivados</p>
                   </button>
                   <button className="bg-white border border-stone-100 shadow-sm rounded-2xl p-6 flex flex-col items-center text-center hover:shadow-md hover:border-blue-100 transition-all group cursor-pointer">
                      <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform"><Bot size={26} /></div>
                      <h3 className="font-bold text-stone-800 text-lg">Consultor Virtual</h3>
                      <p className="text-xs text-stone-500 font-medium">Tire dúvidas de manejo</p>
                   </button>
                </div>
                {messages.map((msg) => (
                  <ChatMessage key={msg.id} message={msg} isPlaying={playingMessageId === msg.id} onToggleAudio={handleToggleAudio} />
                ))}
                <div ref={messagesEndRef} />
              </div>
            </div>
            {audioStopper && (
              <div className="absolute bottom-28 right-6 z-30 animate-fade-in">
                 <button onClick={stopAudio} className="flex items-center gap-2 bg-farm-600 text-white pl-3 pr-4 py-3 rounded-full shadow-xl hover:bg-red-600 transition-colors border border-white/20">
                    <span className="relative flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span></span>
                    <span className="text-sm font-bold">Ouvindo...</span>
                    <div className="h-4 w-[1px] bg-white/20 mx-1"></div>
                    <Square size={14} fill="currentColor" />
                 </button>
              </div>
            )}
            <InputArea onSendMessage={handleSendMessage} isLoading={isLoading} />
          </>
        )}

        {view === 'planner' && <CropPlanner userLocation={userLocation} />}
        {view === 'cameras' && <CameraGrid />}
        {view === 'automations' && <AutomationControl />}
        {view === 'dashboard' && <FarmDashboard />}
        {view === 'emater' && <EmaterChannel />}
        {view === 'presentation' && <SystemPresentation />}
        {view === 'settings' && <Settings />}
        {view === 'registry' && <PlantRegistry />}

      </main>
    </div>
  );
};

export default App;
