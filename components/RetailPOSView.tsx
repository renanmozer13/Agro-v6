
import React, { useState } from 'react';
import { 
  ShoppingCart, 
  Search, 
  Plus, 
  Minus, 
  Trash2, 
  CreditCard, 
  Banknote, 
  User,
  History,
  Leaf,
  BarChart3,
  CheckCircle2
} from 'lucide-react';

interface POSItem {
  id: string;
  name: string;
  price: number;
  unit: string;
  isOrganic: boolean;
  stock: number;
  category: string;
}

const MOCK_INVENTORY: POSItem[] = [
  { id: '1', name: 'Tomate Saladete', price: 6.50, unit: 'kg', isOrganic: true, stock: 45, category: 'Legumes' },
  { id: '2', name: 'Batata Inglesa', price: 4.20, unit: 'kg', isOrganic: false, stock: 120, category: 'Raízes' },
  { id: '3', name: 'Alface Crespa', price: 3.50, unit: 'un', isOrganic: true, stock: 30, category: 'Folhas' },
  { id: '4', name: 'Cenoura Especial', price: 5.80, unit: 'kg', isOrganic: true, stock: 25, category: 'Raízes' },
  { id: '5', name: 'Pimentão Verde', price: 8.90, unit: 'kg', isOrganic: false, stock: 15, category: 'Legumes' },
  { id: '6', name: 'Banana Prata', price: 7.50, unit: 'kg', isOrganic: true, stock: 60, category: 'Frutas' },
];

const RetailPOSView: React.FC = () => {
  const [cart, setCart] = useState<{ item: POSItem; quantity: number }[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const addToCart = (item: POSItem) => {
    setCart(prev => {
      const existing = prev.find(c => c.item.id === item.id);
      if (existing) {
        return prev.map(c => c.item.id === item.id ? { ...c, quantity: c.quantity + 1 } : c);
      }
      return [...prev, { item, quantity: 1 }];
    });
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(c => c.item.id !== id));
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(c => {
      if (c.item.id === id) {
        const newQty = Math.max(1, c.quantity + delta);
        return { ...c, quantity: newQty };
      }
      return c;
    }));
  };

  const total = cart.reduce((acc, curr) => acc + (curr.item.price * curr.quantity), 0);

  const filteredItems = MOCK_INVENTORY.filter(i => i.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="flex h-full bg-[#FDFBF7] overflow-hidden">
      {/* Inventory Section */}
      <div className="flex-1 flex flex-col border-r border-stone-200">
        <header className="p-6 bg-white border-b border-stone-200">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-black text-stone-900 tracking-tight flex items-center gap-2">
                <ShoppingCart className="text-emerald-600" />
                PDV VAREJO
              </h2>
              <p className="text-stone-500 text-sm font-medium italic">Gestão de vendas e estoque em tempo real</p>
            </div>
            <div className="flex gap-2">
              <button className="flex items-center gap-2 px-4 py-2.5 bg-orange-100 text-orange-700 rounded-xl hover:bg-orange-200 transition-colors font-bold text-xs">
                <Plus size={16} />
                REPOR ESTOQUE (PRODUTORES)
              </button>
              <button className="p-2.5 bg-stone-100 text-stone-600 rounded-xl hover:bg-stone-200 transition-colors">
                <History size={20} />
              </button>
              <button className="p-2.5 bg-stone-100 text-stone-600 rounded-xl hover:bg-stone-200 transition-colors">
                <BarChart3 size={20} />
              </button>
            </div>
          </div>

          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={20} />
            <input 
              type="text" 
              placeholder="Buscar produto no estoque..."
              className="w-full pl-12 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredItems.map(item => (
              <button 
                key={item.id}
                onClick={() => addToCart(item)}
                className="bg-white border border-stone-200 rounded-2xl p-4 text-left hover:border-emerald-500 hover:shadow-md transition-all group relative overflow-hidden"
              >
                {item.isOrganic && (
                  <div className="absolute top-2 right-2 bg-emerald-100 text-emerald-700 p-1 rounded-lg">
                    <Leaf size={12} />
                  </div>
                )}
                <div className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1">{item.category}</div>
                <div className="font-bold text-stone-900 mb-2 truncate">{item.name}</div>
                <div className="flex items-end justify-between">
                  <div>
                    <div className="text-lg font-black text-emerald-600">R$ {item.price.toFixed(2)}</div>
                    <div className="text-[10px] font-bold text-stone-400 uppercase">por {item.unit}</div>
                  </div>
                  <div className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.stock < 20 ? 'bg-red-100 text-red-600' : 'bg-stone-100 text-stone-600'}`}>
                    Estoque: {item.stock}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Cart Section */}
      <div className="w-96 bg-white flex flex-col shadow-2xl z-10">
        <header className="p-6 border-b border-stone-200">
          <h3 className="text-lg font-black text-stone-900 flex items-center gap-2">
            Carrinho Atual
            <span className="bg-emerald-600 text-white text-[10px] px-2 py-0.5 rounded-full">{cart.length}</span>
          </h3>
        </header>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-40">
              <ShoppingCart size={48} className="text-stone-300" />
              <p className="text-sm font-bold text-stone-400">O carrinho está vazio.<br/>Selecione produtos ao lado.</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.item.id} className="flex items-center gap-4 bg-stone-50 p-3 rounded-2xl border border-stone-100">
                <div className="flex-1">
                  <div className="text-sm font-bold text-stone-900">{item.item.name}</div>
                  <div className="text-xs text-stone-500">R$ {item.item.price.toFixed(2)} / {item.item.unit}</div>
                </div>
                <div className="flex items-center gap-2 bg-white border border-stone-200 rounded-xl p-1">
                  <button onClick={() => updateQuantity(item.item.id, -1)} className="p-1 hover:text-emerald-600"><Minus size={14} /></button>
                  <span className="text-sm font-black w-6 text-center">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.item.id, 1)} className="p-1 hover:text-emerald-600"><Plus size={14} /></button>
                </div>
                <button onClick={() => removeFromCart(item.item.id)} className="text-stone-300 hover:text-red-500 transition-colors">
                  <Trash2 size={18} />
                </button>
              </div>
            ))
          )}
        </div>

        <div className="p-6 bg-stone-50 border-t border-stone-200 space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm font-bold text-stone-500">
              <span>Subtotal</span>
              <span>R$ {total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xl font-black text-stone-900">
              <span>Total</span>
              <span>R$ {total.toFixed(2)}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button className="flex flex-col items-center justify-center gap-2 p-4 bg-white border border-stone-200 rounded-2xl hover:border-emerald-500 hover:text-emerald-600 transition-all group">
              <Banknote size={24} className="text-stone-400 group-hover:text-emerald-500" />
              <span className="text-[10px] font-black uppercase">Dinheiro</span>
            </button>
            <button className="flex flex-col items-center justify-center gap-2 p-4 bg-white border border-stone-200 rounded-2xl hover:border-emerald-500 hover:text-emerald-600 transition-all group">
              <CreditCard size={24} className="text-stone-400 group-hover:text-emerald-500" />
              <span className="text-[10px] font-black uppercase">Cartão/PIX</span>
            </button>
          </div>

          <button 
            disabled={cart.length === 0}
            className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 disabled:opacity-50 disabled:shadow-none"
          >
            Finalizar Venda
          </button>
        </div>
      </div>
    </div>
  );
};

export default RetailPOSView;
