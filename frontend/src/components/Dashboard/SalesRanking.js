import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { 
  Award,
  Trophy,
  Medal,
  DollarSign,
  TrendingUp,
  Users,
  Target,
  Crown,
  Calendar
} from 'lucide-react';
import { useToast } from '../../hooks/use-toast';
import api from '../../services/api';

const SalesRanking = () => {
  const [ranking, setRanking] = useState([]);
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const { toast } = useToast();

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const fetchRanking = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/reports/sales-analysis?start_date=${startDate}&end_date=${endDate}`);
      
      // Group transactions by seller
      const transactions = response.data.transactions || [];
      const sellerStats = {};
      
      transactions.forEach(transaction => {
        const seller = transaction.seller || 'Sem Vendedor';
        if (!sellerStats[seller]) {
          sellerStats[seller] = {
            name: seller,
            totalSales: 0,
            totalCommissions: 0,
            salesCount: 0,
            transactions: []
          };
        }
        
        sellerStats[seller].totalSales += transaction.saleValue || transaction.amount || 0;
        sellerStats[seller].totalCommissions += transaction.commissionValue || 0;
        sellerStats[seller].salesCount += 1;
        sellerStats[seller].transactions.push(transaction);
      });
      
      // Convert to array and sort by total sales
      const rankingArray = Object.values(sellerStats)
        .filter(seller => seller.name !== 'Sem Vendedor')
        .sort((a, b) => b.totalSales - a.totalSales)
        .map((seller, index) => ({
          ...seller,
          position: index + 1,
          averageSale: seller.totalSales / seller.salesCount
        }));
      
      setRanking(rankingArray);
    } catch (error) {
      console.error('Error fetching ranking:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao carregar ranking de vendedores",
      });
    } finally {
      setLoading(false);
    }
  };

  const setQuickDate = (days) => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days);
    
    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(end.toISOString().split('T')[0]);
  };

  const setMonthRange = (monthOffset = 0) => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1);
    const end = new Date(now.getFullYear(), now.getMonth() + monthOffset + 1, 0);
    
    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(end.toISOString().split('T')[0]);
  };

  const getRankingIcon = (position) => {
    switch(position) {
      case 1:
        return <Crown className="h-6 w-6 text-yellow-500" />;
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />;
      case 3:
        return <Award className="h-6 w-6 text-orange-500" />;
      default:
        return <Trophy className="h-6 w-6 text-blue-500" />;
    }
  };

  const getRankingColor = (position) => {
    switch(position) {
      case 1:
        return 'from-yellow-400 to-yellow-600 text-white';
      case 2:
        return 'from-gray-300 to-gray-500 text-white';
      case 3:
        return 'from-orange-400 to-orange-600 text-white';
      default:
        return 'from-blue-400 to-blue-600 text-white';
    }
  };

  useEffect(() => {
    // Set current month by default
    setMonthRange(0);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Ranking de Vendedores</h2>
        <div className="flex items-center space-x-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          <span className="text-sm text-gray-500">Performance</span>
        </div>
      </div>

      {/* Date Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Período de Análise</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div className="space-y-2">
              <Label>Data Inicial</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Data Final</Label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
          
          {/* Quick Date Buttons */}
          <div className="flex flex-wrap gap-2 mb-4">
            <Button variant="outline" size="sm" onClick={() => setQuickDate(7)}>
              Últimos 7 dias
            </Button>
            <Button variant="outline" size="sm" onClick={() => setQuickDate(15)}>
              Últimos 15 dias
            </Button>
            <Button variant="outline" size="sm" onClick={() => setQuickDate(30)}>
              Últimos 30 dias
            </Button>
            <Button variant="outline" size="sm" onClick={() => setMonthRange(0)}>
              Este mês
            </Button>
            <Button variant="outline" size="sm" onClick={() => setMonthRange(-1)}>
              Mês passado
            </Button>
          </div>
          
          <Button onClick={fetchRanking} disabled={loading} className="bg-gradient-to-r from-pink-500 to-orange-400">
            {loading ? 'Carregando...' : 'Gerar Ranking'}
          </Button>
        </CardContent>
      </Card>

      {/* Ranking Results */}
      {ranking.length > 0 && (
        <div className="space-y-6">
          <h3 className="text-xl font-bold text-gray-900">
            Ranking - {formatDate(startDate)} a {formatDate(endDate)}
          </h3>

          {/* Top 3 Podium */}
          {ranking.length >= 3 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {/* 2nd Place */}
              <Card className="border-2 border-gray-300 relative">
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-8 h-8 bg-gray-400 text-white rounded-full flex items-center justify-center text-lg font-bold">
                  2
                </div>
                <CardContent className="pt-8 text-center">
                  <Medal className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{ranking[1].name}</h3>
                  <div className="space-y-2">
                    <p className="text-2xl font-bold text-gray-600">{formatCurrency(ranking[1].totalSales)}</p>
                    <p className="text-sm text-gray-500">em vendas</p>
                    <p className="text-lg font-semibold text-green-600">{formatCurrency(ranking[1].totalCommissions)}</p>
                    <p className="text-xs text-gray-500">em comissões</p>
                    <Badge variant="outline">{ranking[1].salesCount} vendas</Badge>
                  </div>
                </CardContent>
              </Card>

              {/* 1st Place */}
              <Card className="border-2 border-yellow-400 relative transform scale-105">
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-8 h-8 bg-yellow-500 text-white rounded-full flex items-center justify-center text-lg font-bold">
                  1
                </div>
                <CardContent className="pt-8 text-center">
                  <Crown className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{ranking[0].name}</h3>
                  <div className="space-y-2">
                    <p className="text-3xl font-bold text-yellow-600">{formatCurrency(ranking[0].totalSales)}</p>
                    <p className="text-sm text-gray-500">em vendas</p>
                    <p className="text-xl font-semibold text-green-600">{formatCurrency(ranking[0].totalCommissions)}</p>
                    <p className="text-xs text-gray-500">em comissões</p>
                    <Badge className="bg-yellow-500">{ranking[0].salesCount} vendas</Badge>
                  </div>
                </CardContent>
              </Card>

              {/* 3rd Place */}
              <Card className="border-2 border-orange-300 relative">
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center text-lg font-bold">
                  3
                </div>
                <CardContent className="pt-8 text-center">
                  <Award className="h-12 w-12 text-orange-500 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{ranking[2].name}</h3>
                  <div className="space-y-2">
                    <p className="text-2xl font-bold text-orange-600">{formatCurrency(ranking[2].totalSales)}</p>
                    <p className="text-sm text-gray-500">em vendas</p>
                    <p className="text-lg font-semibold text-green-600">{formatCurrency(ranking[2].totalCommissions)}</p>
                    <p className="text-xs text-gray-500">em comissões</p>
                    <Badge variant="outline">{ranking[2].salesCount} vendas</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Complete Ranking Table */}
          <Card>
            <CardHeader>
              <CardTitle>Ranking Completo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {ranking.map((seller) => (
                  <div key={seller.name} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 bg-gradient-to-r ${getRankingColor(seller.position)} rounded-full flex items-center justify-center font-bold text-lg`}>
                        {seller.position}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 flex items-center space-x-2">
                          <span>{seller.name}</span>
                          {seller.position <= 3 && getRankingIcon(seller.position)}
                        </h4>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span>{seller.salesCount} vendas</span>
                          <span>Ticket médio: {formatCurrency(seller.averageSale)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-lg text-gray-900">{formatCurrency(seller.totalSales)}</div>
                      <div className="text-sm text-green-600 font-medium">{formatCurrency(seller.totalCommissions)} comissão</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Empty State */}
      {ranking.length === 0 && !loading && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-gray-500">
              <Trophy className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Nenhuma venda encontrada para este período.</p>
              <p className="text-sm mt-2">Selecione um período e clique em "Gerar Ranking" para ver os resultados.</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SalesRanking;