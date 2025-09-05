import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { transactionsAPI } from '../../services/api';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  Calendar,
  ArrowUpCircle,
  ArrowDownCircle
} from 'lucide-react';
import { useToast } from '../../hooks/use-toast';

const Overview = () => {
  const [summary, setSummary] = useState({
    totalEntradas: 0,
    totalSaidas: 0,
    saldoAtual: 0,
    transacoesHoje: 0,
    clientesAtendidos: 0,
    ticketMedio: 0
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Buscar resumo
        const summaryData = await transactionsAPI.getSummary();
        setSummary(summaryData);
        
        // Buscar transações recentes
        const transactionsData = await transactionsAPI.getTransactions({ limit: 5 });
        setTransactions(transactionsData);
        
      } catch (error) {
        console.error('Error fetching overview data:', error);
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Erro ao carregar dados do dashboard",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Entradas Hoje
            </CardTitle>
            <ArrowUpCircle className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">
              {formatCurrency(summary.totalEntradas)}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              +12.5% em relação a ontem
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Saídas Hoje
            </CardTitle>
            <ArrowDownCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(summary.totalSaidas)}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              -8.2% em relação a ontem
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Saldo Atual
            </CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(summary.saldoAtual)}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Atualizado agora
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Clientes Hoje
            </CardTitle>
            <Users className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {summary.clientesAtendidos}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Ticket médio: {formatCurrency(summary.ticketMedio)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="mr-2 h-5 w-5" />
            Transações Recentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {transactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    transaction.type === 'entrada' 
                      ? 'bg-emerald-100 text-emerald-600' 
                      : 'bg-red-100 text-red-600'
                  }`}>
                    {transaction.type === 'entrada' ? (
                      <TrendingUp className="h-5 w-5" />
                    ) : (
                      <TrendingDown className="h-5 w-5" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{transaction.description}</p>
                    <p className="text-sm text-gray-500">
                      {transaction.category} • {formatDate(transaction.date)} {transaction.time}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-semibold ${
                    transaction.type === 'entrada' 
                      ? 'text-emerald-600' 
                      : 'text-red-600'
                  }`}>
                    {transaction.type === 'entrada' ? '+' : '-'}{formatCurrency(transaction.amount)}
                  </p>
                  <p className="text-sm text-gray-500">{transaction.paymentMethod}</p>
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

export default Overview;