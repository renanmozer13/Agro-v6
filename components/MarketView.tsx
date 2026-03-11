
import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Store, 
  Truck, 
  Search, 
  Plus, 
  Calendar,
  ArrowRight,
  Info,
  BrainCircuit,
  Filter
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { MarketQuote, MarketOffer } from '../types';

// Mock Data for CEASA-RJ
const MOCK_QUOTES: MarketQuote[] = [
  { product: 'Tomate Saladete', price: 85.00, unit: 'Cx 20kg', trend: 'up', lastUpdate: '08/03/2026', source: 'CEASA-RJ' },
  { product: 'Batata Inglesa', price: 120.00, unit: 'Sc 50kg', trend: 'down', lastUpdate: '08/03/2026', source: 'CEASA-RJ' },
  { product: 'Cebola Nacional', price: 65.00, unit: 'Sc 20kg', trend: 'stable', lastUpdate: '08/03/2026', source: 'CEASA-RJ' },
  { product: 'Pimentão Verde', price: 45.00, unit: 'Cx 10kg', trend: 'up', lastUpdate: '08/03/2026', source: 'CEASA-RJ' },
  { product: 'Cenoura Especial', price: 70.00, unit: 'Cx 20kg', trend: 'up', lastUpdate: '08/03/2026', source: 'CEASA-RJ' },
  { product: 'Alface Crespa', price: 25.00, unit: 'Dz', trend: 'stable', lastUpdate: '08/03/2026', source: 'CEASA-RJ' },
];

const HISTORICAL_DATA = [
  { date: '01/03', price: 78 },
  { date: '02/03', price: 80 },
  { date: '03/03', price: 85 },
  { date: '04/03', price: 82 },
  { date: '05/03', price: 88 },
  { date: '06/03', price: 92 },
  { date: '07/03', price: 90 },
  { date: '08/03', price: 95 },
];

const MarketView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'quotes' | 'marketplace'>('quotes');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredQuotes = useMemo(() => {
    return MOCK_QUOTES.filter(q => q.product.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [searchTerm]);

  return (
    <div className="flex flex-col h-full bg-[#FDFBF7] overflow-hidden">
      {/* Header */}
      <header className="p-6 border-b border-stone-200 bg-white/50 backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-stone-900 tracking-tight flex items-center gap-2">
            <Store className="text-orange-500" />
            MERCADO & COTAÇÕES
          </h2>
          <p className="text-stone-500 text-sm font-medium italic">Conectando o roçado ao varejo com inteligência CEASA-RJ</p>
        </div>

        <div className="flex bg-stone-100 p-1 rounded-xl border border-stone-200">
          <button 
            onClick={() => setActiveTab('quotes')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'quotes' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
          >
            COTAÇÕES CEASA
          </button>
          <button 
            onClick={() => setActiveTab('marketplace')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'marketplace' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
          >
            CONEXÃO DIRETA
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        {activeTab === 'quotes' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Quotes Grid */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center justify-between">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
                  <input 
                    type="text" 
                    placeholder="Buscar produto no CEASA..."
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <button className="p-2.5 bg-white border border-stone-200 rounded-xl text-stone-600 hover:bg-stone-50 transition-colors">
                  <Filter size={20} />
                </button>
              </div>

              {/* Quotes Table - Recipe 1 style */}
              <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm">
                <div className="grid grid-cols-4 p-4 bg-stone-50 border-b border-stone-200 text-[10px] font-black text-stone-400 uppercase tracking-widest">
                  <span>Produto</span>
                  <span className="text-center">Preço Médio</span>
                  <span className="text-center">Unidade</span>
                  <span className="text-right">Tendência</span>
                </div>
                <div className="divide-y divide-stone-100">
                  {filteredQuotes.map((quote, idx) => (
                    <div key={idx} className="grid grid-cols-4 p-4 items-center hover:bg-stone-50 transition-colors cursor-pointer group">
                      <span className="text-sm font-bold text-stone-800 group-hover:text-orange-600 transition-colors">{quote.product}</span>
                      <span className="text-center font-mono text-sm font-bold text-stone-600">R$ {quote.price.toFixed(2)}</span>
                      <span className="text-center text-xs font-medium text-stone-500">{quote.unit}</span>
                      <div className="flex justify-end">
                        {quote.trend === 'up' && <div className="flex items-center gap-1 text-red-500 font-bold text-xs bg-red-50 px-2 py-1 rounded-full"><TrendingUp size={12}/> ALTA</div>}
                        {quote.trend === 'down' && <div className="flex items-center gap-1 text-green-600 font-bold text-xs bg-green-50 px-2 py-1 rounded-full"><TrendingDown size={12}/> BAIXA</div>}
                        {quote.trend === 'stable' && <div className="flex items-center gap-1 text-stone-400 font-bold text-xs bg-stone-50 px-2 py-1 rounded-full"><Minus size={12}/> ESTÁVEL</div>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI Insight Card */}
              <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl p-6 text-white shadow-lg shadow-orange-500/20 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-10 transform translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform">
                  <BrainCircuit size={120} />
                </div>
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="p-2 bg-white/20 rounded-lg backdrop-blur-md">
                      <BrainCircuit size={20} />
                    </div>
                    <span className="text-xs font-black uppercase tracking-widest">Estratégia IAC Farm</span>
                  </div>
                  <h3 className="text-xl font-bold mb-2">Previsão de Alta para o Tomate</h3>
                  <p className="text-orange-50 text-sm leading-relaxed mb-6 max-w-md">
                    Baseado no histórico do CEASA-RJ e nas condições climáticas de Cachoeiras de Macacu, prevemos uma alta de 15% nos próximos 10 dias. Recomendamos antecipar a colheita se possível.
                  </p>
                  <button className="px-6 py-2.5 bg-white text-orange-600 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-orange-50 transition-colors shadow-lg">
                    Ver Análise Completa
                  </button>
                </div>
              </div>
            </div>

            {/* Side Panel: Predictions & Info */}
            <div className="space-y-8">
              <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
                <h3 className="text-xs font-black text-stone-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                  <TrendingUp size={14} className="text-orange-500" />
                  Tendência de Preço (30 dias)
                </h3>
                <div className="h-48 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={HISTORICAL_DATA}>
                      <defs>
                        <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f1f1" />
                      <XAxis dataKey="date" hide />
                      <YAxis hide domain={['dataMin - 5', 'dataMax + 5']} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                        labelStyle={{ fontWeight: 'bold' }}
                      />
                      <Area type="monotone" dataKey="price" stroke="#f97316" strokeWidth={3} fillOpacity={1} fill="url(#colorPrice)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 flex items-center justify-between text-[10px] font-bold text-stone-400">
                  <span>01 MAR</span>
                  <span className="text-orange-500">HOJE: R$ 95,00</span>
                  <span>30 MAR (PREV)</span>
                </div>
              </div>

              <div className="bg-stone-900 rounded-2xl p-6 text-white shadow-xl">
                <h3 className="text-xs font-black text-white/50 uppercase tracking-widest mb-4">Dica do Especialista</h3>
                <p className="text-sm text-stone-300 leading-relaxed italic">
                  "O mercado tá agitado pro lado do Hortifruti. Quem tiver mercadoria de qualidade e souber a hora de soltar no CEASA vai fazer um bom negócio. Fica de olho no frete, que tá subindo também!"
                </p>
                <div className="mt-4 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-[10px] font-bold">IAC</div>
                  <span className="text-xs font-bold">Consultor AgroBrasil</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Marketplace Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex gap-4">
                <div className="bg-white border border-stone-200 p-4 rounded-2xl shadow-sm flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-green-600">
                    <Truck size={24} />
                  </div>
                  <div>
                    <div className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Minhas Ofertas</div>
                    <div className="text-xl font-black text-stone-900">12 Ativas</div>
                  </div>
                </div>
                <div className="bg-white border border-stone-200 p-4 rounded-2xl shadow-sm flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
                    <Store size={24} />
                  </div>
                  <div>
                    <div className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Demandas Varejo</div>
                    <div className="text-xl font-black text-stone-900">45 Novas</div>
                  </div>
                </div>
              </div>
              <button className="flex items-center gap-2 px-6 py-3 bg-stone-900 text-white rounded-2xl font-bold text-sm hover:bg-stone-800 transition-all shadow-lg shadow-stone-200">
                <Plus size={18} />
                ANUNCIAR MINHA SAFRA
              </button>
            </div>

            {/* Marketplace Grid - Recipe 10 style (Bold Background Color / List) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Producer Offers */}
              <div className="space-y-6">
                <h3 className="text-sm font-black text-stone-900 uppercase tracking-widest flex items-center gap-2">
                  <Truck size={18} className="text-green-500" />
                  Ofertas de Produtores (Cachoeiras de Macacu)
                </h3>
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="bg-white border border-stone-200 rounded-2xl p-5 hover:border-green-500 transition-all cursor-pointer group shadow-sm">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="text-lg font-black text-stone-900 group-hover:text-green-600 transition-colors">Milho Verde Especial</h4>
                          <p className="text-xs text-stone-500 font-medium">Sítio Boa Esperança • 5km de distância</p>
                        </div>
                        <span className="px-3 py-1 bg-green-100 text-green-700 text-[10px] font-black rounded-full uppercase">Disponível</span>
                      </div>
                      <div className="flex items-center justify-between border-t border-stone-100 pt-4">
                        <div className="flex gap-4">
                          <div>
                            <div className="text-[10px] font-bold text-stone-400 uppercase">Qtd</div>
                            <div className="text-sm font-black">500kg</div>
                          </div>
                          <div>
                            <div className="text-[10px] font-bold text-stone-400 uppercase">Preço</div>
                            <div className="text-sm font-black text-green-600">R$ 2,50/kg</div>
                          </div>
                        </div>
                        <button className="p-2 bg-stone-50 rounded-xl text-stone-400 group-hover:text-green-600 group-hover:bg-green-50 transition-all">
                          <ArrowRight size={20} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Retailer Demands */}
              <div className="space-y-6">
                <h3 className="text-sm font-black text-stone-900 uppercase tracking-widest flex items-center gap-2">
                  <Store size={18} className="text-blue-500" />
                  Demandas de Hortifrutis & Sacolões
                </h3>
                <div className="space-y-4">
                  {[1, 2].map(i => (
                    <div key={i} className="bg-stone-900 rounded-2xl p-5 border border-stone-800 hover:border-blue-500 transition-all cursor-pointer group shadow-xl">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="text-lg font-black text-white group-hover:text-blue-400 transition-colors">Hortifruti Real RJ</h4>
                          <p className="text-xs text-stone-400 font-medium">Rio de Janeiro • Centro</p>
                        </div>
                        <div className="flex items-center gap-1 text-blue-400 text-[10px] font-black uppercase">
                          <Info size={12} /> URGENTE
                        </div>
                      </div>
                      <div className="bg-stone-800/50 rounded-xl p-3 mb-4">
                        <p className="text-xs text-stone-300 font-medium leading-relaxed">
                          "Buscamos fornecedores de Alface e Tomate para entrega semanal. Pagamento à vista na descarga."
                        </p>
                      </div>
                      <div className="flex items-center justify-between border-t border-stone-800 pt-4">
                        <div className="flex gap-4">
                          <div>
                            <div className="text-[10px] font-bold text-stone-500 uppercase">Volume</div>
                            <div className="text-sm font-black text-white">Grande</div>
                          </div>
                          <div>
                            <div className="text-[10px] font-bold text-stone-500 uppercase">Frequência</div>
                            <div className="text-sm font-black text-blue-400">Semanal</div>
                          </div>
                        </div>
                        <button className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-500 transition-all">
                          Candidatar-se
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MarketView;
