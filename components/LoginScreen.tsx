import React, { useState } from 'react';
import { User, Lock, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';

interface LoginScreenProps {
  onLogin: () => void;
}

// Vector Logo Component for AgroBrasil (Large)
const AgroBrasilLogoLarge = () => (
  <div className="flex items-center gap-4">
    {/* Corn Icon Circle */}
    <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center shadow-inner ring-2 ring-white/30 relative overflow-hidden group">
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="transform">
        <path d="M7 5C7 3.34315 8.34315 2 10 2H14C15.6569 2 17 3.34315 17 5V16C17 19.3137 14.3137 22 11 22H13C9.68629 22 7 19.3137 7 16V5Z" fill="#FBBF24" />
        <path d="M7 6H17" stroke="#D97706" strokeWidth="0.5" strokeLinecap="round"/>
        <path d="M7 9H17" stroke="#D97706" strokeWidth="0.5" strokeLinecap="round"/>
        <path d="M7 12H17" stroke="#D97706" strokeWidth="0.5" strokeLinecap="round"/>
        <path d="M7 15H15" stroke="#D97706" strokeWidth="0.5" strokeLinecap="round"/>
        <path d="M10 2V18" stroke="#D97706" strokeWidth="0.5" strokeLinecap="round"/>
        <path d="M14 2V18" stroke="#D97706" strokeWidth="0.5" strokeLinecap="round"/>
        <path d="M7 14C5 14 2 16 2 19C2 21 5 22 7 20" fill="#4ADE80" stroke="#16A34A" strokeWidth="1" strokeLinejoin="round"/>
        <path d="M17 14C19 14 22 16 22 19C22 21 19 22 17 20" fill="#4ADE80" stroke="#16A34A" strokeWidth="1" strokeLinejoin="round"/>
      </svg>
    </div>
    
    {/* Text */}
    <div className="flex flex-col leading-none">
        <h1 className="text-3xl font-black tracking-tighter">
          <span className="text-[#4ADE80]">AGRO</span>
          <span className="text-[#60A5FA]">BRASIL</span>
        </h1>
        <span className="text-[10px] font-bold tracking-[0.4em] text-white/60 uppercase pl-1">Tecnologia</span>
    </div>
  </div>
);

// Vector Logo for Form Header (Dark Text)
const AgroBrasilLogoForm = () => (
  <div className="flex items-center justify-center gap-3 mb-6">
    <div className="w-12 h-12 bg-stone-900 rounded-full flex items-center justify-center ring-2 ring-farm-500">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M7 5C7 3.34315 8.34315 2 10 2H14C15.6569 2 17 3.34315 17 5V16C17 19.3137 14.3137 22 11 22H13C9.68629 22 7 19.3137 7 16V5Z" fill="#FBBF24" />
        <path d="M7 14C5 14 2 16 2 19C2 21 5 22 7 20" fill="#4ADE80" />
        <path d="M17 14C19 14 22 16 22 19C22 21 19 22 17 20" fill="#4ADE80" />
      </svg>
    </div>
    <div className="text-2xl font-black tracking-tighter">
       <span className="text-[#35ad73]">AGRO</span>
       <span className="text-[#3b82f6]">BRASIL</span>
    </div>
  </div>
);


const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulate network delay for realism
    setTimeout(() => {
      // Validação: Aceita o usuário antigo (IAC/iac2010) OU o novo Master (iac/123)
      const isLegacyUser = username === 'IAC' && password === 'iac2010';
      const isMasterUser = username.toLowerCase() === 'iac' && password === '123';

      if (isLegacyUser || isMasterUser) {
        setIsSuccess(true);
        setTimeout(() => {
            onLogin();
        }, 800);
      } else {
        setError('Usuário ou senha incorretos.');
        setIsLoading(false);
      }
    }, 1200);
  };

  return (
    <div className="min-h-screen w-full flex bg-stone-50 font-sans">
      
      {/* Left Side - Image & Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-farm-900">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1625246333195-0929b7c3835b?q=80&w=1974&auto=format&fit=crop')] bg-cover bg-center opacity-60 mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-farm-950 via-farm-900/60 to-transparent"></div>
        
        <div className="relative z-10 p-16 flex flex-col justify-between h-full text-white">
          <div>
             <AgroBrasilLogoLarge />
          </div>

          <div className="space-y-6">
            <h1 className="text-5xl font-bold leading-tight max-w-lg">
              Cultivando o futuro com <span className="text-[#4ADE80]">inteligência</span> e <span className="text-[#60A5FA]">precisão</span>.
            </h1>
            <p className="text-lg text-gray-300 max-w-md leading-relaxed">
              Acesse sua central de monitoramento AgroBrasil. Diagnósticos via IA, segurança e controle total da sua lavoura em um só lugar.
            </p>
          </div>

          <div className="text-xs text-gray-500 font-mono">
            © 2024 AGROBRASIL & EMATER. Todos os direitos reservados.
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white relative">
        <div className="w-full max-w-md space-y-8 animate-slide-up">
          
          <div className="text-center lg:text-left">
            <div className="lg:hidden mb-8">
               <AgroBrasilLogoForm />
            </div>
            <h2 className="text-3xl font-bold text-stone-900 tracking-tight">Bem-vindo de volta!</h2>
            <p className="mt-2 text-stone-500">Acesse o sistema AgroBrasil com suas credenciais.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div className="space-y-4">
              {/* Username Input */}
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-stone-400 group-focus-within:text-farm-600 transition-colors" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full pl-12 pr-4 py-4 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-farm-500/20 focus:border-farm-500 transition-all font-medium"
                  placeholder="Usuário (iac)"
                />
              </div>

              {/* Password Input */}
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-stone-400 group-focus-within:text-farm-600 transition-colors" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-12 pr-4 py-4 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-farm-500/20 focus:border-farm-500 transition-all font-medium"
                  placeholder="Senha"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-farm-600 focus:ring-farm-500 border-stone-300 rounded cursor-pointer"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-stone-600 cursor-pointer select-none">
                  Lembrar de mim
                </label>
              </div>
              <div className="text-sm">
                <a href="#" className="font-medium text-farm-600 hover:text-farm-500 hover:underline">
                  Esqueceu a senha?
                </a>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg flex items-center gap-2 animate-shake">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || isSuccess}
              className={`
                w-full flex justify-center items-center py-4 px-4 border border-transparent rounded-xl text-sm font-bold text-white transition-all duration-300
                ${isSuccess 
                  ? 'bg-green-500 shadow-lg shadow-green-500/30 scale-105' 
                  : 'bg-stone-900 hover:bg-stone-800 shadow-lg shadow-stone-900/30 hover:-translate-y-0.5'
                }
                ${isLoading ? 'cursor-not-allowed opacity-90' : ''}
              `}
            >
              {isLoading ? (
                isSuccess ? (
                   <CheckCircle2 className="animate-bounce" size={20} />
                ) : (
                   <Loader2 className="animate-spin" size={20} />
                )
              ) : (
                <span className="flex items-center gap-2">
                  Entrar no Sistema <ArrowRight size={18} />
                </span>
              )}
            </button>
          </form>
          
          <div className="relative">
             <div className="absolute inset-0 flex items-center">
               <div className="w-full border-t border-stone-200"></div>
             </div>
             <div className="relative flex justify-center text-sm">
               <span className="px-2 bg-white text-stone-400">Suporte AgroBrasil</span>
             </div>
          </div>

          <div className="text-center">
             <p className="text-stone-400 text-xs">
               Em caso de problemas, contate o suporte da EMATER.
             </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default LoginScreen;