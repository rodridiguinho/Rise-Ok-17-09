import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Eye, EyeOff } from 'lucide-react';
import { useToast } from '../hooks/use-toast';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e) => {
    e.preventDefault();
    const result = await login(email, password);
    
    if (result.success) {
      toast({
        title: "Login realizado com sucesso!",
        description: "Redirecionando para o dashboard...",
      });
      navigate('/dashboard');
    } else {
      toast({
        variant: "destructive",
        title: "Erro no login",
        description: result.error || "Credenciais inválidas",
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Mobile Header - Only visible on mobile */}
      <div className="lg:hidden bg-gradient-to-r from-pink-500 to-orange-400 p-6 text-center text-white">
        <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4">
          <div className="w-10 h-8 bg-white rounded-lg relative">
            <svg viewBox="0 0 24 24" className="w-5 h-5 absolute top-1.5 left-2.5 text-pink-500 fill-current">
              <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
            </svg>
          </div>
        </div>
        <h1 className="text-2xl font-bold mb-1">RISE TRAVEL</h1>
        <p className="text-sm opacity-90">Sistema de Controle de Caixa</p>
      </div>

      {/* Left side - Login Form */}
      <div className="flex-1 flex items-center justify-center bg-white p-4 sm:p-8">
        <div className="w-full max-w-md space-y-6">
          {/* Desktop Logo - Hidden on mobile */}
          <div className="hidden lg:flex items-center space-x-3 mb-8">
            <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-orange-400 rounded-xl flex items-center justify-center relative">
              <div className="w-8 h-6 bg-white rounded-sm relative">
                <svg viewBox="0 0 24 24" className="w-4 h-4 absolute top-1 left-2 text-pink-500 fill-current">
                  <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
                </svg>
              </div>
              <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-3 h-2 border-2 border-white rounded-t-lg"></div>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Rise Travel</h1>
              <p className="text-xs text-gray-500">Controle de Caixa</p>
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2 text-center lg:text-left">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Login</h2>
            <p className="text-gray-600 text-sm sm:text-base">Faça login utilizando suas credenciais</p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Digite seu e-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12 text-base"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-medium">Senha</Label>
                <button
                  type="button"
                  className="text-sm text-pink-600 hover:text-pink-500 underline"
                  onClick={() => {/* Handle forgot password */}}
                >
                  Esqueceu sua senha?
                </button>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Digite sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-12 pr-12 text-base"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-gradient-to-r from-pink-500 to-orange-400 hover:from-pink-600 hover:to-orange-500 text-white font-medium shadow-lg text-base"
              disabled={loading}
            >
              {loading ? "Entrando..." : "Login"}
            </Button>
          </form>

          <p className="text-center text-sm text-gray-600">
            Não possui conta?{' '}
            <button className="text-pink-600 hover:text-pink-500 underline font-medium">
              Entre em contato
            </button>
          </p>
        </div>
      </div>

      {/* Right side - Branding - Hidden on mobile */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-pink-500 via-pink-600 to-orange-500 items-center justify-center p-8 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0">
          <div className="absolute top-20 right-20 w-32 h-32 bg-white/10 rounded-full animate-pulse"></div>
          <div className="absolute bottom-32 left-16 w-20 h-20 bg-white/15 rounded-full animate-pulse delay-75"></div>
          <div className="absolute top-1/2 right-32 w-16 h-16 bg-white/10 rounded-full animate-pulse delay-150"></div>
          <div className="absolute top-40 left-1/3 w-12 h-12 bg-white/5 rounded-full animate-pulse delay-300"></div>
        </div>

        <div className="relative z-10 text-center text-white">
          <div className="mb-8">
            <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
              <div className="w-16 h-12 bg-white rounded-lg relative">
                <svg viewBox="0 0 24 24" className="w-8 h-8 absolute top-2 left-4 text-pink-500 fill-current">
                  <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
                </svg>
              </div>
              <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-6 h-4 border-4 border-white rounded-t-xl"></div>
              <div className="absolute -bottom-1 left-2 w-2 h-2 bg-white rounded-full"></div>
              <div className="absolute -bottom-1 right-2 w-2 h-2 bg-white rounded-full"></div>
            </div>
            
            <h1 className="text-5xl font-bold mb-2 tracking-wide">RISE</h1>
            <h2 className="text-4xl font-light mb-4 tracking-widest">TRAVEL</h2>
            <p className="text-xl opacity-90 font-medium">SISTEMA DE CONTROLE DE CAIXA</p>
          </div>
          
          <div className="relative mx-auto w-96 h-32 mb-8">
            <svg viewBox="0 0 400 120" className="w-full h-full">
              <path
                d="M50 60 Q200 20 350 60"
                stroke="rgba(255,255,255,0.4)"
                strokeWidth="2"
                fill="none"
                strokeDasharray="5,5"
                className="animate-pulse"
              />
              <circle cx="350" cy="60" r="6" fill="white" className="animate-bounce">
                <animateMotion
                  dur="8s"
                  repeatCount="indefinite"
                  path="M50,60 Q200,20 350,60 Q200,100 50,60"
                />
              </circle>
            </svg>
            
            <div className="absolute top-4 left-12 w-4 h-4 bg-white/40 rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
            <div className="absolute bottom-4 right-12 w-4 h-4 bg-white/40 rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
          </div>

          <p className="text-lg opacity-90 max-w-md mx-auto leading-relaxed">
            Controle financeiro completo para sua agência de viagens
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;