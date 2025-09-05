import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { reportsAPI, transactionsAPI } from '../../services/api';
import { 
  FileText, 
  Download, 
  Calendar,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart
} from 'lucide-react';
import { useToast } from '../../hooks/use-toast';

const Reports = () => {
  const [dateFrom, setDateFrom] = useState('2025-01-01');
  const [dateTo, setDateTo] = useState('2025-01-05');
  const [reportType, setReportType] = useState('summary');
  const [summary, setSummary] = useState({
    totalEntradas: 0,
    totalSaidas: 0,
    resultadoLiquido: 0
  });
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  useEffect(() => {
    fetchReportsData();
  }, []);

  const fetchReportsData = async () => {
    try {
      setLoading(true);
      
      const [summaryData, transactionsData] = await Promise.all([
        transactionsAPI.getSummary(),
        transactionsAPI.getTransactions({ limit: 8 })
      ]);
      
      setSummary({
        totalEntradas: summaryData.totalEntradas,
        totalSaidas: summaryData.totalSaidas,
        resultadoLiquido: summaryData.saldoAtual
      });
      
      setTransactions(transactionsData);
      
    } catch (error) {
      console.error('Error fetching reports data:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao carregar dados dos relatórios",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = async () => {
    try {
      toast({
        title: "Exportando PDF",
        description: "O relatório está sendo gerado e será baixado em breve.",
      });
      
      await reportsAPI.exportPDF({
        start_date: dateFrom,
        end_date: dateTo
      });
      
      toast({
        title: "PDF exportado com sucesso",
        description: "O arquivo foi gerado com sucesso.",
      });
      
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast({
        variant: "destructive", 
        title: "Erro",
        description: "Erro ao exportar PDF",
      });
    }
  };

  const handleExportExcel = async () => {
    try {
      toast({
        title: "Exportando Excel",
        description: "A planilha está sendo gerada e será baixada em breve.",
      });
      
      await reportsAPI.exportExcel({
        start_date: dateFrom,
        end_date: dateTo
      });
      
      toast({
        title: "Excel exportado com sucesso",
        description: "O arquivo foi gerado com sucesso.",
      });
      
    } catch (error) {
      console.error('Error exporting Excel:', error);
      toast({
        variant: "destructive",
        title: "Erro", 
        description: "Erro ao exportar Excel",
      });
    }
  };

  const getCategoryData = () => {
    const categoryTotals = {};
    transactions.forEach(transaction => {
      if (transaction.type === 'entrada') {
        categoryTotals[transaction.category] = (categoryTotals[transaction.category] || 0) + transaction.amount;
      }
    });
    
    const total = Object.values(categoryTotals).reduce((sum, amount) => sum + amount, 0);
    
    return Object.entries(categoryTotals).map(([category, amount]) => ({
      category,
      amount,
      percentage: total > 0 ? ((amount / total) * 100).toFixed(1) : 0
    }));
  };

  const categoryData = getCategoryData();

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Relatórios</h2>
          <div className="animate-pulse flex space-x-2">
            <div className="h-10 w-32 bg-gray-200 rounded"></div>
            <div className="h-10 w-32 bg-gray-200 rounded"></div>
          </div>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="animate-pulse">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-10 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Relatórios</h2>
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            onClick={handleExportPDF}
            className="text-red-600 border-red-600 hover:bg-red-50"
          >
            <FileText className="mr-2 h-4 w-4" />
            Exportar PDF
          </Button>
          <Button 
            variant="outline" 
            onClick={handleExportExcel}
            className="text-green-600 border-green-600 hover:bg-green-50"
          >
            <Download className="mr-2 h-4 w-4" />
            Exportar Excel
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="mr-2 h-5 w-5" />
            Filtros do Relatório
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Data Inicial</Label>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Data Final</Label>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Tipo de Relatório</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="summary">Resumo Financeiro</SelectItem>
                  <SelectItem value="detailed">Relatório Detalhado</SelectItem>
                  <SelectItem value="category">Por Categoria</SelectItem>
                  <SelectItem value="daily">Diário</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button className="w-full bg-indigo-600 hover:bg-indigo-700" onClick={fetchReportsData}>
                Gerar Relatório
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total de Entradas
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">
              {formatCurrency(summary.totalEntradas)}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Período: {dateFrom} a {dateTo}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total de Saídas
            </CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(summary.totalSaidas)}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Período: {dateFrom} a {dateTo}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Resultado Líquido
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(summary.resultadoLiquido)}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Lucro do período
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Category Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <PieChart className="mr-2 h-5 w-5" />
            Análise por Categoria (Entradas)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {categoryData.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className={`w-4 h-4 rounded-full ${
                    index % 6 === 0 ? 'bg-blue-500' :
                    index % 6 === 1 ? 'bg-emerald-500' :
                    index % 6 === 2 ? 'bg-purple-500' :
                    index % 6 === 3 ? 'bg-orange-500' :
                    index % 6 === 4 ? 'bg-pink-500' : 'bg-indigo-500'
                  }`}></div>
                  <span className="font-medium text-gray-900">{item.category}</span>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{formatCurrency(item.amount)}</p>
                    <p className="text-sm text-gray-500">{item.percentage}% do total</p>
                  </div>
                  <div className="w-16 bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        index % 6 === 0 ? 'bg-blue-500' :
                        index % 6 === 1 ? 'bg-emerald-500' :
                        index % 6 === 2 ? 'bg-purple-500' :
                        index % 6 === 3 ? 'bg-orange-500' :
                        index % 6 === 4 ? 'bg-pink-500' : 'bg-indigo-500'
                      }`}
                      style={{ width: `${Math.min(item.percentage, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
            
            {categoryData.length === 0 && (
              <div className="text-center text-gray-500 py-8">
                <PieChart className="mx-auto h-12 w-12 text-gray-300 mb-2" />
                <p>Nenhuma categoria encontrada</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent Transactions Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Últimas Transações do Período</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {transactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    transaction.type === 'entrada' 
                      ? 'bg-emerald-100 text-emerald-600' 
                      : 'bg-red-100 text-red-600'
                  }`}>
                    {transaction.type === 'entrada' ? (
                      <TrendingUp className="h-4 w-4" />
                    ) : (
                      <TrendingDown className="h-4 w-4" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{transaction.description}</p>
                    <p className="text-xs text-gray-500">{transaction.category}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-semibold text-sm ${
                    transaction.type === 'entrada' 
                      ? 'text-emerald-600' 
                      : 'text-red-600'
                  }`}>
                    {transaction.type === 'entrada' ? '+' : '-'}{formatCurrency(transaction.amount)}
                  </p>
                  <p className="text-xs text-gray-500">{new Date(transaction.date).toLocaleDateString('pt-BR')}</p>
                </div>
              </div>
            ))}
            
            {transactions.length === 0 && (
              <div className="text-center text-gray-500 py-8">
                <Calendar className="mx-auto h-12 w-12 text-gray-300 mb-2" />
                <p>Nenhuma transação encontrada</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;