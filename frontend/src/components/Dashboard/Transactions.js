import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '../ui/dialog';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Badge } from '../ui/badge';
import { transactionsAPI } from '../../services/api';
import { 
  Plus, 
  Search, 
  Filter,
  TrendingUp,
  TrendingDown,
  Edit,
  Trash2
} from 'lucide-react';
import { useToast } from '../../hooks/use-toast';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const [newTransaction, setNewTransaction] = useState({
    type: 'entrada',
    category: '',
    description: '',
    amount: '',
    paymentMethod: '',
    client: '',
    supplier: '',
    transactionDate: new Date().toISOString().split('T')[0] // Default to today's date
  });

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
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Buscar transações, categorias e métodos de pagamento
      const [transactionsData, categoriesData, paymentMethodsData] = await Promise.all([
        transactionsAPI.getTransactions(),
        transactionsAPI.getCategories(),
        transactionsAPI.getPaymentMethods()
      ]);
      
      setTransactions(transactionsData);
      setCategories(categoriesData.categories);
      setPaymentMethods(paymentMethodsData.paymentMethods);
      
    } catch (error) {
      console.error('Error fetching transactions data:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao carregar dados das transações",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || transaction.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const handleAddTransaction = async () => {
    if (!newTransaction.category || !newTransaction.description || !newTransaction.amount || !newTransaction.transactionDate) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios.",
      });
      return;
    }

    try {
      const transactionData = {
        ...newTransaction,
        amount: parseFloat(newTransaction.amount)
      };
      
      const createdTransaction = await transactionsAPI.createTransaction(transactionData);
      
      // Adicionar a nova transação à lista
      setTransactions([createdTransaction, ...transactions]);
      
      // Resetar formulário
      setNewTransaction({
        type: 'entrada',
        category: '',
        description: '',
        amount: '',
        paymentMethod: '',
        client: '',
        supplier: '',
        transactionDate: new Date().toISOString().split('T')[0]
      });
      
      setIsAddModalOpen(false);
      
      toast({
        title: "Transação adicionada",
        description: "A transação foi adicionada com sucesso.",
      });
      
    } catch (error) {
      console.error('Error creating transaction:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao criar transação",
      });
    }
  };

  const handleDeleteTransaction = async (id) => {
    try {
      await transactionsAPI.deleteTransaction(id);
      setTransactions(transactions.filter(t => t.id !== id));
      
      toast({
        title: "Transação removida",
        description: "A transação foi removida com sucesso.",
      });
      
    } catch (error) {
      console.error('Error deleting transaction:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao remover transação",
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Transações</h2>
          <div className="animate-pulse h-10 w-32 bg-gray-200 rounded"></div>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="animate-pulse">
              <div className="h-10 bg-gray-200 rounded mb-4"></div>
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-16 bg-gray-200 rounded"></div>
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
        <h2 className="text-2xl font-bold text-gray-900">Transações</h2>
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-pink-500 to-orange-400 hover:from-pink-600 hover:to-orange-500 text-white shadow-lg">
              <Plus className="mr-2 h-4 w-4" />
              Nova Transação
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Nova Transação</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Tipo</Label>
                <Select value={newTransaction.type} onValueChange={(value) => setNewTransaction({...newTransaction, type: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="entrada">Entrada</SelectItem>
                    <SelectItem value="saida">Saída</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Categoria *</Label>
                <Select value={newTransaction.category} onValueChange={(value) => setNewTransaction({...newTransaction, category: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Descrição *</Label>
                <Input
                  placeholder="Descrição da transação"
                  value={newTransaction.description}
                  onChange={(e) => setNewTransaction({...newTransaction, description: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label>Valor *</Label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  value={newTransaction.amount}
                  onChange={(e) => setNewTransaction({...newTransaction, amount: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label>Data da Transação *</Label>
                <Input
                  type="date"
                  value={newTransaction.transactionDate}
                  onChange={(e) => setNewTransaction({...newTransaction, transactionDate: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label>Forma de Pagamento</Label>
                <Select value={newTransaction.paymentMethod} onValueChange={(value) => setNewTransaction({...newTransaction, paymentMethod: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a forma de pagamento" />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentMethods.map(method => (
                      <SelectItem key={method} value={method}>{method}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {newTransaction.type === 'entrada' && (
                <div className="space-y-2">
                  <Label>Cliente</Label>
                  <Input
                    placeholder="Nome do cliente"
                    value={newTransaction.client}
                    onChange={(e) => setNewTransaction({...newTransaction, client: e.target.value})}
                  />
                </div>
              )}

              {newTransaction.type === 'saida' && (
                <div className="space-y-2">
                  <Label>Fornecedor</Label>
                  <Input
                    placeholder="Nome do fornecedor"
                    value={newTransaction.supplier}
                    onChange={(e) => setNewTransaction({...newTransaction, supplier: e.target.value})}
                  />
                </div>
              )}

              <Button onClick={handleAddTransaction} className="w-full">
                Adicionar Transação
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar transações..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-40">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="entrada">Entradas</SelectItem>
                <SelectItem value="saida">Saídas</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Transactions List */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Transações ({filteredTransactions.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredTransactions.map((transaction) => (
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
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge variant="secondary" className="text-xs">
                        {transaction.category}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {formatDate(transaction.date)} • {transaction.time}
                      </span>
                    </div>
                    {transaction.client && (
                      <p className="text-sm text-gray-600 mt-1">Cliente: {transaction.client}</p>
                    )}
                    {transaction.supplier && (
                      <p className="text-sm text-gray-600 mt-1">Fornecedor: {transaction.supplier}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-4">
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
                  <div className="flex items-center space-x-1">
                    <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-red-600 hover:text-red-700"
                      onClick={() => handleDeleteTransaction(transaction.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            
            {filteredTransactions.length === 0 && (
              <div className="text-center text-gray-500 py-8">
                <Search className="mx-auto h-12 w-12 text-gray-300 mb-2" />
                <p>Nenhuma transação encontrada</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Transactions;