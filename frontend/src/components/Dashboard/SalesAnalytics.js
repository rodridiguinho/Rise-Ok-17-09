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
  const [previousAnalytics, setPreviousAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0);
  };

  const formatPercentage = (current, previous) => {
    if (!previous || previous === 0) return { value: 0, isPositive: true };
    const percentage = ((current - previous) / previous) * 100;
    return { value: Math.abs(percentage), isPositive: percentage >= 0 };
  };

  const generateChartData = (data) => {
    if (!data || !data.sales) return null;
    
    const total = data.sales.total_sales || 0;
    const costs = data.sales.total_supplier_payments || 0;
    const commissions = data.sales.total_commissions || 0;
    const profit = data.sales.net_sales_profit || 0;
    
    if (total === 0) return null;
    
    return {
      vendas: ((profit / total) * 100).toFixed(1),
      fornecedores: ((costs / total) * 100).toFixed(1),
      comissoes: ((commissions / total) * 100).toFixed(1)
    };
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      // Get current month data
      const now = new Date();
      const currentStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
      const currentEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
      
      // Get previous month data for comparison
      const prevStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().split('T')[0];
      const prevEnd = new Date(now.getFullYear(), now.getMonth(), 0).toISOString().split('T')[0];
      
      const [currentResponse, prevResponse] = await Promise.all([
        api.get(`/reports/sales-performance?start_date=${currentStart}&end_date=${currentEnd}`),
        api.get(`/reports/sales-performance?start_date=${prevStart}&end_date=${prevEnd}`)
      ]);
      
      setAnalytics(currentResponse.data);
      setPreviousAnalytics(prevResponse.data);
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
          <div className="text-sm text-gray-500">Carregando...</div>
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

  if (!analytics) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Dashboard Vendas</h2>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-gray-500">
              <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Nenhum dado de vendas encontrado para este período.</p>
              <p className="text-sm mt-2">Adicione algumas transações de entrada para ver as análises.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const chartData = generateChartData(analytics);
  const prevSales = previousAnalytics?.sales;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Dashboard Vendas</h2>
        <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded">
          {new Date().toLocaleDateString('pt-BR', { year: 'numeric', month: 'long' })}
        </div>
      </div>

      {/* Main Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Valor Total */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2 mb-2">
              <DollarSign className="h-5 w-5 text-purple-600" />
              <span className="text-sm font-medium text-gray-600">VENDAS TOTAIS</span>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {formatCurrency(analytics.sales.total_sales)}
            </div>
            {prevSales && (
              <div className="text-sm">
                {(() => {
                  const comparison = formatPercentage(analytics.sales.total_sales, prevSales.total_sales);
                  return (
                    <span className={`flex items-center ${comparison.isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
                      {comparison.isPositive ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                      {comparison.value.toFixed(1)}% vs mês anterior
                    </span>
                  );
                })()}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Custos Fornecedores */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2 mb-2">
              <TrendingDown className="h-5 w-5 text-red-600" />
              <span className="text-sm font-medium text-gray-600">CUSTOS FORNECEDORES</span>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {formatCurrency(analytics.sales.total_supplier_payments)}
            </div>
            {prevSales && (
              <div className="text-sm">
                {(() => {
                  const comparison = formatPercentage(analytics.sales.total_supplier_payments, prevSales.total_supplier_payments);
                  return (
                    <span className={`flex items-center ${comparison.isPositive ? 'text-red-600' : 'text-emerald-600'}`}>
                      {comparison.isPositive ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                      {comparison.value.toFixed(1)}% vs mês anterior
                    </span>
                  );
                })()}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Comissões */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2 mb-2">
              <Users className="h-5 w-5 text-yellow-600" />
              <span className="text-sm font-medium text-gray-600">COMISSÕES</span>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {formatCurrency(analytics.sales.total_commissions)}
            </div>
            {prevSales && (
              <div className="text-sm">
                {(() => {
                  const comparison = formatPercentage(analytics.sales.total_commissions, prevSales.total_commissions);
                  return (
                    <span className={`flex items-center ${comparison.isPositive ? 'text-red-600' : 'text-emerald-600'}`}>
                      {comparison.isPositive ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                      {comparison.value.toFixed(1)}% vs mês anterior
                    </span>
                  );
                })()}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Lucro Líquido */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2 mb-2">
              <Target className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium text-gray-600">LUCRO LÍQUIDO</span>
            </div>
            <div className={`text-3xl font-bold mb-2 ${analytics.sales.net_sales_profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(analytics.sales.net_sales_profit)}
            </div>
            {prevSales && (
              <div className="text-sm">
                {(() => {
                  const comparison = formatPercentage(analytics.sales.net_sales_profit, prevSales.net_sales_profit);
                  return (
                    <span className={`flex items-center ${comparison.isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
                      {comparison.isPositive ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                      {comparison.value.toFixed(1)}% vs mês anterior
                    </span>
                  );
                })()}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Número de Vendas */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2 mb-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium text-gray-600">NÚMERO DE VENDAS</span>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {analytics.sales.sales_count}
            </div>
            {prevSales && (
              <div className="text-sm">
                {(() => {
                  const comparison = formatPercentage(analytics.sales.sales_count, prevSales.sales_count);
                  return (
                    <span className={`flex items-center ${comparison.isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
                      {comparison.isPositive ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                      {comparison.value.toFixed(1)}% vs mês anterior
                    </span>
                  );
                })()}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Ticket Médio */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2 mb-2">
              <Award className="h-5 w-5 text-purple-600" />
              <span className="text-sm font-medium text-gray-600">TICKET MÉDIO</span>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {formatCurrency(analytics.sales.average_sale)}
            </div>
            {prevSales && (
              <div className="text-sm">
                {(() => {
                  const comparison = formatPercentage(analytics.sales.average_sale, prevSales.average_sale);
                  return (
                    <span className={`flex items-center ${comparison.isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
                      {comparison.isPositive ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                      {comparison.value.toFixed(1)}% vs mês anterior
                    </span>
                  );
                })()}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Distribuição de Custos */}
      {chartData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Percent className="h-5 w-5" />
              <span>DISTRIBUIÇÃO DE CUSTOS</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Pie Chart Representation */}
              <div className="flex items-center justify-center">
                <div className="relative w-48 h-48">
                  <svg width="192" height="192" className="transform -rotate-90">
                    <circle
                      cx="96"
                      cy="96"
                      r="88"
                      fill="none"
                      stroke="#e5e7eb"
                      strokeWidth="8"
                    />
                    {/* Lucro */}
                    <circle
                      cx="96"
                      cy="96"
                      r="88"
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="8"
                      strokeDasharray={`${(chartData.vendas / 100) * 552.92} 552.92`}
                      strokeDashoffset="0"
                    />
                    {/* Fornecedores */}
                    <circle
                      cx="96"
                      cy="96"
                      r="88"
                      fill="none"
                      stroke="#f59e0b"
                      strokeWidth="8"
                      strokeDasharray={`${(chartData.fornecedores / 100) * 552.92} 552.92`}
                      strokeDashoffset={`-${(chartData.vendas / 100) * 552.92}`}
                    />
                    {/* Comissões */}
                    <circle
                      cx="96"
                      cy="96"
                      r="88"
                      fill="none"
                      stroke="#ef4444"
                      strokeWidth="8"
                      strokeDasharray={`${(chartData.comissoes / 100) * 552.92} 552.92`}
                      strokeDashoffset={`-${((parseFloat(chartData.vendas) + parseFloat(chartData.fornecedores)) / 100) * 552.92}`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">
                        {analytics.sales.sales_count}
                      </div>
                      <div className="text-sm text-gray-600">Vendas</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Legend */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                    <span className="font-medium">Lucro Líquido</span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-green-600">{chartData.vendas}%</div>
                    <div className="text-sm text-gray-600">{formatCurrency(analytics.sales.net_profit)}</div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                    <span className="font-medium">Custos Fornecedores</span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-yellow-600">{chartData.fornecedores}%</div>
                    <div className="text-sm text-gray-600">{formatCurrency(analytics.sales.total_supplier_costs)}</div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                    <span className="font-medium">Comissões</span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-red-600">{chartData.comissoes}%</div>
                    <div className="text-sm text-gray-600">{formatCurrency(analytics.sales.total_commissions)}</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Transactions List */}
      {analytics.transactions && analytics.transactions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Vendas do Período</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.transactions.map((transaction) => (
                <div key={transaction.id || transaction._id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold">{transaction.description}</h4>
                    <Badge variant="default">
                      {formatCurrency(transaction.saleValue || transaction.amount)}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-600">
                    <span>Data: {new Date(transaction.date).toLocaleDateString('pt-BR')}</span>
                    {transaction.client && <span>Cliente: {transaction.client}</span>}
                    {transaction.seller && <span>Vendedor: {transaction.seller}</span>}
                    {transaction.supplier && <span>Fornecedor: {transaction.supplier}</span>}
                    {transaction.supplierValue && <span>Custo: {formatCurrency(transaction.supplierValue)}</span>}
                    {transaction.commissionValue && <span>Comissão: {formatCurrency(transaction.commissionValue)}</span>}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SalesAnalytics;