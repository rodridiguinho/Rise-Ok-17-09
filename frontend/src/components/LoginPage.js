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
          <div className="flex items-center space-x-2 mb-8">
            <div className="w-8 h-8 bg-gradient-to-r from-emerald-400 to-blue-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">A</span>
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-gray-900">Login</h1>
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
              className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white font-medium"
              disabled={loading}
            >
              {loading ? "Entrando..." : "Login"}
            </Button>
          </form>

          <p className="text-center text-sm text-gray-600">
            Não possui conta?{' '}
            <button className="text-blue-600 hover:text-blue-500 underline">
              Cadastre-se
            </button>
          </p>
        </div>
      </div>

      {/* Right side - Branding */}
      <div className="flex-1 bg-gradient-to-br from-indigo-900 via-blue-800 to-purple-900 flex items-center justify-center p-8 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0">
          <div className="absolute top-20 right-20 w-32 h-32 bg-emerald-400 rounded-full opacity-20"></div>
          <div className="absolute bottom-32 left-16 w-20 h-20 bg-emerald-400 rounded-full opacity-30"></div>
          <div className="absolute top-1/2 right-32 w-16 h-16 bg-blue-400 rounded-full opacity-25"></div>
        </div>

        <div className="relative z-10 text-center text-white">
          <h1 className="text-5xl font-bold mb-4">agentepro</h1>
          <p className="text-xl mb-8 opacity-90">SISTEMA PARA AGÊNCIAS DE TURISMO</p>
          
          {/* Airplane illustration */}
          <div className="relative mx-auto w-96 h-64 mb-8">
            <svg viewBox="0 0 400 300" className="w-full h-full">
              {/* Airplane */}
              <path
                d="M100 150 L180 130 L280 140 L320 145 L340 150 L320 155 L280 160 L180 170 L100 150 Z"
                fill="#60A5FA"
                className="opacity-90"
              />
              <path
                d="M180 130 L200 120 L220 125 L180 140 Z"
                fill="#3B82F6"
                className="opacity-80"
              />
              <path
                d="M180 170 L200 180 L220 175 L180 160 Z"
                fill="#3B82F6"
                className="opacity-80"
              />
              {/* Trail */}
              <path
                d="M80 150 L100 148 L100 152 L80 150 Z"
                fill="#34D399"
                className="opacity-60"
              />
            </svg>
            
            {/* Location pins */}
            <div className="absolute top-16 right-8 w-8 h-8 bg-emerald-400 rounded-full flex items-center justify-center">
              <div className="w-4 h-4 bg-emerald-600 rounded-full"></div>
            </div>
            <div className="absolute bottom-16 left-12 w-8 h-8 bg-emerald-400 rounded-full flex items-center justify-center">
              <div className="w-4 h-4 bg-emerald-600 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;