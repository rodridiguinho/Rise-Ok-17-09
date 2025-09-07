import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  DollarSign,
  BarChart3,
  Award,
  Target,
  Percent
} from 'lucide-react';
import { useToast } from '../../hooks/use-toast';
import api from '../../services/api';

const SalesAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatPercentage = (value) => {
    const isPositive = value >= 0;
    return (
      <span className={`flex items-center ${isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
        {isPositive ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
        {Math.abs(value).toFixed(2)}% {value >= 0 ? 'Mês anterior' : 'Mês anterior'}
      </span>
    );
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await api.get('/analytics/sales');
      setAnalytics(response.data);
    } catch (error) {
      console.error('Error fetching sales analytics:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao carregar análises de vendas",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Dashboard Vendas</h2>
          <div className="text-sm text-gray-500">01 jul. 2025 - 07 set. 2025</div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <div className="animate-pulse">
                  <div className="h-6 bg-gray-200 rounded mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!analytics) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Dashboard Vendas</h2>
        <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded">
          01 jul. 2025 - 07 set. 2025
        </div>
      </div>

      {/* Main Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Valor Total */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2 mb-2">
              <DollarSign className="h-5 w-5 text-purple-600" />
              <span className="text-sm font-medium text-gray-600">VALOR TOTAL</span>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {formatCurrency(analytics.valorTotal)}
            </div>
            <div className="text-sm">
              {formatPercentage(analytics.percentualVariacao)}
            </div>
          </CardContent>
        </Card>

        {/* Comissões */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2 mb-2">
              <Percent className="h-5 w-5 text-purple-600" />
              <span className="text-sm font-medium text-gray-600">COMISSÕES</span>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {formatCurrency(analytics.comissoes)}
            </div>
            <div className="text-sm">
              {formatPercentage(analytics.percentualComissoes)}
            </div>
          </CardContent>
        </Card>

        {/* Número de Vendas */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2 mb-2">
              <BarChart3 className="h-5 w-5 text-purple-600" />
              <span className="text-sm font-medium text-gray-600">NÚMERO DE VENDAS</span>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {analytics.numeroVendas}
            </div>
            <div className="text-sm">
              {formatPercentage(analytics.percentualVendas)}
            </div>
          </CardContent>
        </Card>

        {/* Novos Clientes */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2 mb-2">
              <Users className="h-5 w-5 text-purple-600" />
              <span className="text-sm font-medium text-gray-600">NOVOS CLIENTES</span>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {analytics.novosClientes}
            </div>
            <div className="text-sm">
              {formatPercentage(analytics.percentualClientes)}
            </div>
          </CardContent>
        </Card>

        {/* Ticket Médio */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2 mb-2">
              <Target className="h-5 w-5 text-purple-600" />
              <span className="text-sm font-medium text-gray-600">TICKET MÉDIO</span>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {formatCurrency(analytics.ticketMedio)}
            </div>
            <div className="text-sm">
              {formatPercentage(analytics.percentualTicket)}
            </div>
          </CardContent>
        </Card>

        {/* Taxa de Conversão */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2 mb-2">
              <Award className="h-5 w-5 text-purple-600" />
              <span className="text-sm font-medium text-gray-600">TAXA DE CONVERSÃO</span>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-2">
              Vendas por cotações
            </div>
            <div className="text-lg font-semibold">
              {analytics.taxaConversao.vendasPorCotacoes}/0
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ranking de Vendedores */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Award className="h-5 w-5" />
            <span>RANKING DE VENDEDORES</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics.rankingVendedores.map((vendedor, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-orange-400 rounded-full flex items-center justify-center text-white font-bold">
                    {vendedor.posicao}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{vendedor.nome}</p>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${vendedor.percentual}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600">{vendedor.percentual}%</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">{formatCurrency(vendedor.valor)}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SalesAnalytics;