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
    <div className="min-h-screen flex">
      {/* Left side - Login Form */}
      <div className="flex-1 flex items-center justify-center bg-white p-8">
        <div className="w-full max-w-md space-y-6">
          {/* Logo */}
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">R</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Rise Travel</h1>
              <p className="text-xs text-gray-500">Controle de Caixa</p>
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-gray-900">Login</h2>
            <p className="text-gray-600">Faça login utilizando suas credenciais</p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Digite seu e-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Senha</Label>
                <button
                  type="button"
                  className="text-sm text-blue-600 hover:text-blue-500"
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
                  className="h-12 pr-10"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white font-medium"
              disabled={loading}
            >
              {loading ? "Entrando..." : "Login"}
            </Button>
          </form>

          <p className="text-center text-sm text-gray-600">
            Não possui conta?{' '}
            <button className="text-blue-600 hover:text-blue-500 underline">
              Entre em contato
            </button>
          </p>
        </div>
      </div>

      {/* Right side - Branding */}
      <div className="flex-1 bg-gradient-to-br from-emerald-600 via-blue-700 to-indigo-800 flex items-center justify-center p-8 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0">
          <div className="absolute top-20 right-20 w-32 h-32 bg-white/10 rounded-full"></div>
          <div className="absolute bottom-32 left-16 w-20 h-20 bg-white/15 rounded-full"></div>
          <div className="absolute top-1/2 right-32 w-16 h-16 bg-white/10 rounded-full"></div>
          <div className="absolute top-40 left-1/3 w-12 h-12 bg-white/5 rounded-full"></div>
        </div>

        <div className="relative z-10 text-center text-white">
          <div className="mb-8">
            <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl font-bold">R</span>
            </div>
            <h1 className="text-5xl font-bold mb-2">Rise Travel</h1>
            <p className="text-xl opacity-90">SISTEMA DE CONTROLE DE CAIXA</p>
          </div>
          
          {/* Travel icons */}
          <div className="relative mx-auto w-96 h-48 mb-8">
            {/* Airplane */}
            <svg viewBox="0 0 400 200" className="w-full h-full">
              <path
                d="M80 100 L140 85 L220 95 L260 100 L290 102 L260 104 L220 105 L140 115 L80 100 Z"
                fill="rgba(255,255,255,0.3)"
                className="animate-pulse"
              />
              <path
                d="M140 85 L155 75 L170 80 L140 95 Z"
                fill="rgba(255,255,255,0.4)"
              />
              <path
                d="M140 115 L155 125 L170 120 L140 105 Z"
                fill="rgba(255,255,255,0.4)"
              />
              {/* Trail */}
              <path
                d="M60 100 L80 98 L80 102 L60 100 Z"
                fill="rgba(255,255,255,0.6)"
              />
            </svg>
            
            {/* Location pins */}
            <div className="absolute top-8 right-16 w-6 h-6 bg-white/30 rounded-full flex items-center justify-center">
              <div className="w-3 h-3 bg-white rounded-full"></div>
            </div>
            <div className="absolute bottom-8 left-20 w-6 h-6 bg-white/30 rounded-full flex items-center justify-center">
              <div className="w-3 h-3 bg-white rounded-full"></div>
            </div>
          </div>

          <p className="text-lg opacity-80">
            Controle financeiro completo para sua agência de viagens
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;