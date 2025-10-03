import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { transactionsAPI } from '../../services/api';
import { 
  Plus, 
  TrendingUp,
  TrendingDown,
  Calendar,
  DollarSign,
  Users
} from 'lucide-react';

const EnhancedTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const response = await transactionsAPI.getAll();
      setTransactions(response.data || []);
    } catch (error) {
      console.error('Erro ao carregar transações:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Transações</h2>
          <div className="text-sm text-gray-500">Carregando...</div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-5/6"></div>
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Transações Avançadas</h2>
        <Button className="bg-gradient-to-r from-pink-500 to-orange-400 hover:from-pink-600 hover:to-orange-500">
          <Plus className="mr-2 h-4 w-4" />
          Nova Transação
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Receitas</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(
                    transactions
                      .filter(t => t.type === 'entrada' || t.type === 'entrada_vendas')
                      .reduce((sum, t) => sum + (t.amount || 0), 0)
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingDown className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Despesas</p>
                <p className="text-2xl font-bold text-red-600">
                  {formatCurrency(
                    transactions
                      .filter(t => t.type === 'saida' || t.type === 'saida_vendas')
                      .reduce((sum, t) => sum + (t.amount || 0), 0)
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Saldo</p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatCurrency(
                    transactions.reduce((sum, t) => {
                      if (t.type === 'entrada' || t.type === 'entrada_vendas') {
                        return sum + (t.amount || 0);
                      } else {
                        return sum - (t.amount || 0);
                      }
                    }, 0)
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transactions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {transactions.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-500">Nenhuma transação encontrada.</p>
          </div>
        ) : (
          transactions.map((transaction) => {
            // Calculate profit for display
            const saleValue = transaction.saleValue || transaction.amount || 0;
            const directSupplierValue = transaction.supplierValue;
            const suppliersArrayValue = transaction.suppliers && transaction.suppliers.length > 0 ? 
              transaction.suppliers.reduce((total, supplier) => total + (parseFloat(supplier.value) || 0), 0) : 0;
            const totalSupplierValue = directSupplierValue || suppliersArrayValue;
            const commissionValue = transaction.commissionValue || 0;
            
            return (
              <Card key={transaction.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold flex items-center">
                      {transaction.type === 'entrada' || transaction.type === 'entrada_vendas' ? (
                        <TrendingUp className="w-5 h-5 text-green-500 mr-2" />
                      ) : (
                        <TrendingDown className="w-5 h-5 text-red-500 mr-2" />
                      )}
                      {transaction.description || 'Sem descrição'}
                    </CardTitle>
                  </div>
                  <div className="text-sm text-gray-500 flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    {formatDate(transaction.date)} • {transaction.time}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Valor:</span>
                      <span className={`font-semibold ${
                        transaction.type === 'entrada' || transaction.type === 'entrada_vendas' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {formatCurrency(transaction.amount)}
                      </span>
                    </div>

                    {transaction.category && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Categoria:</span>
                        <span className="text-sm font-medium">{transaction.category}</span>
                      </div>
                    )}

                    {transaction.client && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 flex items-center">
                          <Users className="w-3 h-3 mr-1" />
                          Cliente:
                        </span>
                        <span className="text-sm">{transaction.client}</span>
                      </div>
                    )}

                    {totalSupplierValue > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Fornecedor:</span>
                        <span className="text-sm text-orange-600 font-medium">
                          {formatCurrency(totalSupplierValue)}
                        </span>
                      </div>
                    )}

                    {commissionValue > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Comissão:</span>
                        <span className="text-sm text-green-600 font-medium">
                          {formatCurrency(commissionValue)}
                        </span>
                      </div>
                    )}

                    {/* Profit Display */}
                    {(transaction.type === 'entrada' || transaction.type === 'entrada_vendas') && saleValue > 0 && totalSupplierValue > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Lucro:</span>
                        <span className={`text-sm font-bold ${
                          (saleValue - totalSupplierValue - commissionValue) >= 0 ? 'text-blue-600' : 'text-red-600'
                        }`}>
                          {formatCurrency(saleValue - totalSupplierValue - commissionValue)}
                        </span>
                      </div>
                    )}

                    {transaction.paymentMethod && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Pagamento:</span>
                        <span className="text-sm">{transaction.paymentMethod}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};

export default EnhancedTransactions;