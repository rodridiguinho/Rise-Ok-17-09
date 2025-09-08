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
import { transactionsAPI, clientsAPI, suppliersAPI, usersAPI } from '../../services/api';
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
  const [clients, setClients] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [users, setUsers] = useState([]);
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
    seller: '',
    saleValue: '',
    supplierValue: '',
    commissionValue: '',
    transactionDate: new Date().toISOString().split('T')[0]
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

  const calculateCommissionPercentage = () => {
    if (newTransaction.saleValue && newTransaction.commissionValue) {
      const percentage = (parseFloat(newTransaction.commissionValue) / parseFloat(newTransaction.saleValue)) * 100;
      return percentage.toFixed(2);
    }
    return '0.00';
  };

  const calculateProfit = () => {
    const saleValue = parseFloat(newTransaction.saleValue) || 0;
    const supplierValue = parseFloat(newTransaction.supplierValue) || 0;
    const commissionValue = parseFloat(newTransaction.commissionValue) || 0;
    const profit = saleValue - supplierValue - commissionValue;
    return profit;
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [transactionsData, categoriesData, paymentMethodsData, clientsData, suppliersData, usersData] = await Promise.all([
        transactionsAPI.getTransactions(),
        transactionsAPI.getCategories(),
        transactionsAPI.getPaymentMethods(),
        clientsAPI.getClients(),
        suppliersAPI.getSuppliers(),
        usersAPI.getUsers()
      ]);
      
      setTransactions(transactionsData);
      setCategories(categoriesData.categories || []);
      setPaymentMethods(paymentMethodsData.paymentMethods || []);
      setClients(clientsData);
      setSuppliers(suppliersData);
      setUsers(usersData);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao carregar dados",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (transaction.client && transaction.client.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (transaction.supplier && transaction.supplier.toLowerCase().includes(searchTerm.toLowerCase()));
    
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
      const createdTransaction = await transactionsAPI.createTransaction({
        ...newTransaction,
        amount: parseFloat(newTransaction.amount),
        saleValue: newTransaction.saleValue ? parseFloat(newTransaction.saleValue) : null,
        supplierValue: newTransaction.supplierValue ? parseFloat(newTransaction.supplierValue) : null,
        commissionValue: newTransaction.commissionValue ? parseFloat(newTransaction.commissionValue) : null
      });
      
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
        seller: '',
        saleValue: '',
        supplierValue: '',
        commissionValue: '',
        transactionDate: new Date().toISOString().split('T')[0]
      });
      
      setIsAddModalOpen(false);
      
      toast({
        title: "Transação adicionada",
        description: "A transação foi criada com sucesso.",
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

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Transações</h2>
          <div className="text-sm text-gray-500">Carregando...</div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <div className="animate-pulse">
                  <div className="h-6 bg-gray-200 rounded mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded"></div>
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
        <h2 className="text-2xl font-bold text-gray-900">Transações</h2>
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-pink-500 to-orange-400 hover:from-pink-600 hover:to-orange-500">
              <Plus className="mr-2 h-4 w-4" />
              Nova Transação
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Nova Transação</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
              {/* Tipo */}
              <div className="space-y-2">
                <Label>Tipo *</Label>
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

              {/* Categoria */}
              <div className="space-y-2">
                <Label>Categoria *</Label>
                <Select value={newTransaction.category} onValueChange={(value) => setNewTransaction({...newTransaction, category: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Descrição */}
              <div className="space-y-2 md:col-span-2">
                <Label>Descrição *</Label>
                <Input
                  placeholder="Descrição da transação"
                  value={newTransaction.description}
                  onChange={(e) => setNewTransaction({...newTransaction, description: e.target.value})}
                />
              </div>

              {/* Data da Transação */}
              <div className="space-y-2">
                <Label>Data da Transação *</Label>
                <Input
                  type="date"
                  value={newTransaction.transactionDate}
                  onChange={(e) => setNewTransaction({...newTransaction, transactionDate: e.target.value})}
                />
              </div>

              {/* Forma de Pagamento */}
              <div className="space-y-2">
                <Label>Forma de Pagamento *</Label>
                <Select value={newTransaction.paymentMethod} onValueChange={(value) => setNewTransaction({...newTransaction, paymentMethod: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a forma" />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentMethods.map(method => (
                      <SelectItem key={method} value={method}>{method}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Cliente */}
              <div className="space-y-2">
                <Label>Cliente</Label>
                <Select value={newTransaction.client} onValueChange={(value) => setNewTransaction({...newTransaction, client: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map(client => (
                      <SelectItem key={client.id} value={client.name}>{client.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Fornecedor */}
              <div className="space-y-2">
                <Label>Fornecedor</Label>
                <Select value={newTransaction.supplier} onValueChange={(value) => setNewTransaction({...newTransaction, supplier: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o fornecedor" />
                  </SelectTrigger>
                  <SelectContent>
                    {suppliers.map(supplier => (
                      <SelectItem key={supplier.id} value={supplier.name}>{supplier.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Vendedor */}
              <div className="space-y-2">
                <Label>Vendedor</Label>
                <Select value={newTransaction.seller} onValueChange={(value) => setNewTransaction({...newTransaction, seller: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o vendedor" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map(user => (
                      <SelectItem key={user.id} value={user.name}>{user.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Valor da Venda */}
              <div className="space-y-2">
                <Label>Valor da Venda</Label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  value={newTransaction.saleValue}
                  onChange={(e) => setNewTransaction({...newTransaction, saleValue: e.target.value})}
                />
              </div>

              {/* Valor do Fornecedor */}
              <div className="space-y-2">
                <Label>Valor do Fornecedor</Label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  value={newTransaction.supplierValue}
                  onChange={(e) => setNewTransaction({...newTransaction, supplierValue: e.target.value})}
                />
              </div>

              {/* Valor da Comissão */}
              <div className="space-y-2">
                <Label>Valor da Comissão</Label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  value={newTransaction.commissionValue}
                  onChange={(e) => setNewTransaction({...newTransaction, commissionValue: e.target.value})}
                />
              </div>

              {/* Percentual da Comissão */}
              <div className="space-y-2">
                <Label>Percentual da Comissão</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    type="text"
                    readOnly
                    value={`${calculateCommissionPercentage()}%`}
                    className="bg-gray-100"
                  />
                  <span className="text-sm text-gray-600">calculado automaticamente</span>
                </div>
              </div>

              {/* Valor Total da Transação */}
              <div className="space-y-2">
                <Label>Valor Total da Transação *</Label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  value={newTransaction.amount}
                  onChange={(e) => setNewTransaction({...newTransaction, amount: e.target.value})}
                />
              </div>

              {/* Lucro Final */}
              <div className="space-y-2">
                <Label>Lucro Final</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    type="text"
                    readOnly
                    value={formatCurrency(calculateProfit())}
                    className={`bg-gray-100 ${calculateProfit() >= 0 ? 'text-green-600' : 'text-red-600'}`}
                  />
                  <span className="text-sm text-gray-600">calculado automaticamente</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleAddTransaction} className="bg-gradient-to-r from-pink-500 to-orange-400 hover:from-pink-600 hover:to-orange-500">
                Salvar Transação
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar transações..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-[200px]">
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

      {/* Transactions List */}
      <div className="grid gap-4">
        {filteredTransactions.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center text-gray-500">
                {transactions.length === 0 ? "Nenhuma transação encontrada." : "Nenhuma transação corresponde aos filtros aplicados."}
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredTransactions.map((transaction) => (
            <Card key={transaction.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <Badge variant={transaction.type === 'entrada' ? 'default' : 'destructive'}>
                        {transaction.type === 'entrada' ? (
                          <TrendingUp className="h-3 w-3 mr-1" />
                        ) : (
                          <TrendingDown className="h-3 w-3 mr-1" />
                        )}
                        {transaction.type.toUpperCase()}
                      </Badge>
                      <span className="text-sm text-gray-500">{transaction.category}</span>
                      <span className="text-sm text-gray-500">{formatDate(transaction.date)}</span>
                    </div>
                    <h3 className="font-semibold text-gray-900">{transaction.description}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-2 text-sm text-gray-600">
                      {transaction.client && <span>Cliente: {transaction.client}</span>}
                      {transaction.supplier && <span>Fornecedor: {transaction.supplier}</span>}
                      {transaction.seller && <span>Vendedor: {transaction.seller}</span>}
                      <span>Pagamento: {transaction.paymentMethod}</span>
                      {transaction.saleValue && <span>Venda: {formatCurrency(transaction.saleValue)}</span>}
                      {transaction.supplierValue && <span>Fornecedor: {formatCurrency(transaction.supplierValue)}</span>}
                      {transaction.commissionValue && (
                        <span>Comissão: {formatCurrency(transaction.commissionValue)} ({transaction.commissionPercentage?.toFixed(2)}%)</span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-xl font-bold ${transaction.type === 'entrada' ? 'text-green-600' : 'text-red-600'}`}>
                      {transaction.type === 'entrada' ? '+' : '-'}{formatCurrency(transaction.amount)}
                    </div>
                    <div className="text-sm text-gray-500">{transaction.time}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default Transactions;