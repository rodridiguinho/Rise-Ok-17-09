import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { 
  Calendar,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Target,
  FileText
} from 'lucide-react';
import { useToast } from '../../hooks/use-toast';
import api from '../../services/api';

const SalesReports = () => {
  const [salesData, setSalesData] = useState(null);
  const [completeData, setCompleteData] = useState(null);
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

  const fetchSalesAnalysis = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/reports/sales-analysis?start_date=${startDate}&end_date=${endDate}`);
      setSalesData(response.data);
    } catch (error) {
      console.error('Error fetching sales analysis:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao carregar análise de vendas",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCompleteAnalysis = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/reports/complete-analysis?start_date=${startDate}&end_date=${endDate}`);
      setCompleteData(response.data);
    } catch (error) {
      console.error('Error fetching complete analysis:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao carregar análise completa",
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Relatórios de Vendas</h2>
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
          
          <div className="flex space-x-2">
            <Button onClick={fetchSalesAnalysis} disabled={loading}>
              Análise de Vendas
            </Button>
            <Button onClick={fetchCompleteAnalysis} disabled={loading} variant="outline">
              Análise Completa
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Sales Analysis Results */}
      {salesData && (
        <div className="space-y-6">
          <h3 className="text-xl font-bold text-gray-900">
            Análise de Vendas - {formatDate(salesData.period.start_date)} a {formatDate(salesData.period.end_date)}
          </h3>
          
          {/* Sales Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="border-l-4 border-l-green-500">
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2 mb-2">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  <span className="text-sm font-medium text-gray-600">VENDAS TOTAIS</span>
                </div>
                <div className="text-3xl font-bold text-gray-900">
                  {formatCurrency(salesData.sales.total_sales)}
                </div>
                <div className="text-sm text-gray-600">
                  {salesData.sales.sales_count} vendas
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-red-500">
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2 mb-2">
                  <TrendingDown className="h-5 w-5 text-red-600" />
                  <span className="text-sm font-medium text-gray-600">CUSTOS FORNECEDORES</span>
                </div>
                <div className="text-3xl font-bold text-gray-900">
                  {formatCurrency(salesData.sales.total_supplier_costs)}
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-yellow-500">
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2 mb-2">
                  <Users className="h-5 w-5 text-yellow-600" />
                  <span className="text-sm font-medium text-gray-600">COMISSÕES</span>
                </div>
                <div className="text-3xl font-bold text-gray-900">
                  {formatCurrency(salesData.sales.total_commissions)}
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-blue-500">
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2 mb-2">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  <span className="text-sm font-medium text-gray-600">LUCRO LÍQUIDO</span>
                </div>
                <div className={`text-3xl font-bold ${salesData.sales.net_profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(salesData.sales.net_profit)}
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-purple-500">
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2 mb-2">
                  <Target className="h-5 w-5 text-purple-600" />
                  <span className="text-sm font-medium text-gray-600">TICKET MÉDIO</span>
                </div>
                <div className="text-3xl font-bold text-gray-900">
                  {formatCurrency(salesData.sales.average_sale)}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sales Transactions List */}
          <Card>
            <CardHeader>
              <CardTitle>Detalhamento das Vendas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {salesData.transactions.map((transaction) => (
                  <div key={transaction.id || transaction._id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold">{transaction.description}</h4>
                      <Badge variant="default">
                        {formatCurrency(transaction.saleValue || transaction.amount)}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-600">
                      <span>Data: {formatDate(transaction.date)}</span>
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
        </div>
      )}

      {/* Complete Analysis Results */}
      {completeData && (
        <div className="space-y-6">
          <h3 className="text-xl font-bold text-gray-900">
            Análise Completa - {formatDate(completeData.period.start_date)} a {formatDate(completeData.period.end_date)}
          </h3>
          
          {/* Summary Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-l-4 border-l-green-500">
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2 mb-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  <span className="text-sm font-medium text-gray-600">ENTRADAS</span>
                </div>
                <div className="text-3xl font-bold text-green-600">
                  {formatCurrency(completeData.summary.total_entradas)}
                </div>
                <div className="text-sm text-gray-600">
                  {completeData.summary.entradas_count} transações
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-red-500">
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2 mb-2">
                  <TrendingDown className="h-5 w-5 text-red-600" />
                  <span className="text-sm font-medium text-gray-600">SAÍDAS</span>
                </div>
                <div className="text-3xl font-bold text-red-600">
                  {formatCurrency(completeData.summary.total_saidas)}
                </div>
                <div className="text-sm text-gray-600">
                  {completeData.summary.saidas_count} transações
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-blue-500">
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2 mb-2">
                  <DollarSign className="h-5 w-5 text-blue-600" />
                  <span className="text-sm font-medium text-gray-600">SALDO</span>
                </div>
                <div className={`text-3xl font-bold ${completeData.summary.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(completeData.summary.balance)}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* All Transactions List */}
          <Card>
            <CardHeader>
              <CardTitle>Todas as Transações</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {completeData.all_transactions.map((transaction) => (
                  <div key={transaction.id || transaction._id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center space-x-2">
                        <Badge variant={transaction.type === 'entrada' ? 'default' : 'destructive'}>
                          {transaction.type === 'entrada' ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                          {transaction.type.toUpperCase()}
                        </Badge>
                        <span className="font-semibold">{transaction.description}</span>
                      </div>
                      <div className={`text-lg font-bold ${transaction.type === 'entrada' ? 'text-green-600' : 'text-red-600'}`}>
                        {transaction.type === 'entrada' ? '+' : '-'}{formatCurrency(transaction.amount)}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-2 text-sm text-gray-600">
                      <span>Data: {formatDate(transaction.date)}</span>
                      <span>Categoria: {transaction.category}</span>
                      {transaction.client && <span>Cliente: {transaction.client}</span>}
                      {transaction.supplier && <span>Fornecedor: {transaction.supplier}</span>}
                      {transaction.seller && <span>Vendedor: {transaction.seller}</span>}
                      <span>Pagamento: {transaction.paymentMethod}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default SalesReports;