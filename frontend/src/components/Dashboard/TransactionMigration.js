import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { useToast } from '../../hooks/use-toast';
import api from '../../services/api';
import { 
  CheckCircle, 
  XCircle, 
  ArrowRight, 
  RefreshCw,
  DollarSign,
  TrendingDown,
  Package,
  Building
} from 'lucide-react';

const TransactionMigration = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [migrating, setMigrating] = useState(false);
  const [migratedCount, setMigratedCount] = useState(0);
  const { toast } = useToast();

  // Load old transactions (entrada/saida only)
  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await api.get('/transactions');
      
      // Filter only old format transactions
      const oldTransactions = response.data.filter(t => 
        t.type === 'entrada' || t.type === 'saida'
      );
      
      setTransactions(oldTransactions);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao carregar transações"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  // Migrate single transaction
  const migrateTransaction = async (transactionId, newType) => {
    try {
      setMigrating(true);
      
      const transaction = transactions.find(t => t.id === transactionId);
      if (!transaction) return;
      
      // Update transaction with new type
      const updatedTransaction = {
        ...transaction,
        type: newType
      };
      
      await api.put(`/transactions/${transactionId}`, updatedTransaction);
      
      // Update local state
      setTransactions(prev => 
        prev.map(t => 
          t.id === transactionId 
            ? { ...t, type: newType, migrated: true }
            : t
        )
      );
      
      setMigratedCount(prev => prev + 1);
      
      toast({
        title: "Migração realizada",
        description: `Transação migrada para: ${getTypeLabel(newType)}`
      });
      
    } catch (error) {
      console.error('Error migrating transaction:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao migrar transação"
      });
    } finally {
      setMigrating(false);
    }
  };

  const getTypeLabel = (type) => {
    const labels = {
      'entrada': 'Entrada - Outras',
      'saida': 'Saída - Outras', 
      'entrada_vendas': 'Entrada - Vendas',
      'saida_vendas': 'Saída - Vendas'
    };
    return labels[type] || type;
  };

  const getTypeIcon = (type) => {
    const icons = {
      'entrada': <DollarSign className="h-4 w-4 text-green-600" />,
      'saida': <TrendingDown className="h-4 w-4 text-red-600" />,
      'entrada_vendas': <Package className="h-4 w-4 text-blue-600" />,
      'saida_vendas': <Building className="h-4 w-4 text-orange-600" />
    };
    return icons[type] || null;
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0);
  };

  // Auto-suggest migration type based on content
  const suggestMigrationType = (transaction) => {
    const description = transaction.description?.toLowerCase() || '';
    const category = transaction.category?.toLowerCase() || '';
    
    if (transaction.type === 'entrada') {
      // If it has travel-related fields or seems like a sale
      if (transaction.clientNumber || transaction.reservationLocator || 
          description.includes('passagem') || description.includes('viagem') ||
          description.includes('emissão') || category.includes('venda')) {
        return 'entrada_vendas';
      }
      return 'entrada'; // Keep as other income
    }
    
    if (transaction.type === 'saida') {
      // If it's supplier payment or commission
      if (transaction.supplier || category.includes('fornecedor') ||
          description.includes('pagamento a') || description.includes('comissão')) {
        return 'saida_vendas';
      }
      return 'saida'; // Keep as other expense
    }
    
    return transaction.type;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-gray-500" />
        <span className="ml-2">Carregando transações...</span>
      </div>
    );
  }

  const oldFormatCount = transactions.filter(t => !t.migrated).length;
  const migratedTransactions = transactions.filter(t => t.migrated).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <RefreshCw className="h-6 w-6 text-blue-600" />
            <span>Migração de Transações</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{oldFormatCount}</div>
              <div className="text-sm text-gray-600">Pendentes de Migração</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{migratedTransactions}</div>
              <div className="text-sm text-gray-600">Já Migradas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{transactions.length}</div>
              <div className="text-sm text-gray-600">Total</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transactions List */}
      <div className="space-y-4">
        {transactions.filter(t => !t.migrated).map(transaction => {
          const suggestedType = suggestMigrationType(transaction);
          
          return (
            <Card key={transaction.id} className="border-l-4 border-l-yellow-400">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      {getTypeIcon(transaction.type)}
                      <Badge variant={transaction.type === 'entrada' ? 'success' : 'destructive'}>
                        {getTypeLabel(transaction.type)}
                      </Badge>
                      <span className="text-sm text-gray-500">{transaction.date}</span>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="font-medium">{transaction.description}</div>
                      <div className="text-sm text-gray-600">
                        {transaction.category} • {formatCurrency(transaction.amount)}
                      </div>
                      {transaction.client && (
                        <div className="text-sm text-blue-600">Cliente: {transaction.client}</div>
                      )}
                      {transaction.supplier && (
                        <div className="text-sm text-orange-600">Fornecedor: {transaction.supplier}</div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <ArrowRight className="h-4 w-4 text-gray-400" />
                    
                    <div className="flex flex-col space-y-2">
                      {/* Suggested migration */}
                      {suggestedType !== transaction.type && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-green-500 text-green-700 hover:bg-green-50"
                          onClick={() => migrateTransaction(transaction.id, suggestedType)}
                          disabled={migrating}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          {getTypeLabel(suggestedType)}
                        </Button>
                      )}
                      
                      {/* Manual options */}
                      {transaction.type === 'entrada' && (
                        <div className="flex space-x-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => migrateTransaction(transaction.id, 'entrada_vendas')}
                            disabled={migrating}
                          >
                            Venda
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => migrateTransaction(transaction.id, 'entrada')}
                            disabled={migrating}
                          >
                            Outra
                          </Button>
                        </div>
                      )}
                      
                      {transaction.type === 'saida' && (
                        <div className="flex space-x-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => migrateTransaction(transaction.id, 'saida_vendas')}
                            disabled={migrating}
                          >
                            Venda
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => migrateTransaction(transaction.id, 'saida')}
                            disabled={migrating}
                          >
                            Outra
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {oldFormatCount === 0 && (
        <Card>
          <CardContent className="pt-6 text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Migração Concluída!
            </h3>
            <p className="text-gray-600">
              Todas as transações foram migradas para os novos tipos.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TransactionMigration;