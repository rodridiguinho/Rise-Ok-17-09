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
import { Textarea } from '../ui/textarea';
import { Checkbox } from '../ui/checkbox';
import { transactionsAPI, clientsAPI, suppliersAPI, usersAPI } from '../../services/api';
import { 
  Plus, 
  Search, 
  Filter,
  TrendingUp,
  TrendingDown,
  Edit,
  Trash2,
  Plane,
  MapPin,
  Clock,
  Calendar,
  DollarSign,
  Users,
  Briefcase,
  Heart
} from 'lucide-react';
import { useToast } from '../../hooks/use-toast';
import api from '../../services/api';

const EnhancedTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [clients, setClients] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [users, setUsers] = useState([]);
  const [airlines, setAirlines] = useState([]);
  const [airports, setAirports] = useState([]);
  const [categories, setCategories] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);

  const [revenueCategories, setRevenueCategories] = useState([
    'Passagens Aéreas',
    'Pacotes',
    'Seguro Viagem', 
    'Transfer',
    'Hospedagem',
    'Airbnb',
    'Ingressos',
    'Parques',
    'Passeios',
    'Consultoria',
    'Saldo mês anterior',
    'Cash Back',
    'Outros'
  ]);

  const [expenseCategories, setExpenseCategories] = useState([
    'Marketing',
    'Aluguel',
    'Combustível',
    'Alimentação',
    'Material de Escritório',
    'Telefone/Internet',
    'Impostos',
    'Manutenção',
    'Seguros',
    'Outros'
  ]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState(null);
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
    // Multiple suppliers system (up to 6)
    suppliers: [{ 
      name: '', 
      value: '', 
      paymentDate: '', 
      paymentStatus: 'Pendente',
      usedMiles: false,
      milesQuantity: '',
      milesValue: '',
      milesProgram: ''
    }],
    seller: '',
    saleValue: '',
    supplierValue: '',
    supplierPaymentDate: '',
    supplierPaymentStatus: 'Pendente',
    commissionValue: '',
    commissionPaymentDate: '',
    commissionPaymentStatus: 'Pendente',
    customCategory: '',
    transactionDate: new Date().toISOString().split('T')[0],
    // Travel-specific fields
    clientNumber: '',
    reservationLocator: '',
    departureDate: '',
    returnDate: '',
    departureTime: '',
    arrivalTime: '',
    hasStops: false,
    originAirport: '',
    destinationAirport: '',
    tripType: 'Lazer',
    products: [{ name: '', cost: '', supplier: 'none' }],
    // Enhanced fields for client reservation and supplier miles
    clientReservationCode: '',
    departureCity: '',
    arrivalCity: '',
    productType: 'Passagem',
    supplierUsedMiles: false,
    supplierMilesQuantity: '',
    supplierMilesValue: '',
    supplierMilesProgram: '',
    airportTaxes: '',
    milesTaxes: '',
    // Escalas
    outboundStops: '',
    returnStops: '',
    // Additional fields for expenses
    saleReference: '',
    productPurchased: '',
    additionalInfo: ''
  });

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0);
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

  const calculateSupplierTotal = () => {
    const supplierValue = parseFloat(newTransaction.supplierValue) || 0;
    const airportTaxes = parseFloat(newTransaction.airportTaxes) || 0;
    return supplierValue + airportTaxes;
  };

  const calculateMilesTotal = () => {
    if (newTransaction.supplierMilesQuantity && newTransaction.supplierMilesValue) {
      const quantity = parseFloat(newTransaction.supplierMilesQuantity) || 0;
      const valuePerThousand = parseFloat(newTransaction.supplierMilesValue) || 0;
      return (quantity / 1000) * valuePerThousand;
    }
    return 0;
  };

  const calculateMilesTotalWithTaxes = () => {
    const milesValue = calculateMilesTotal();
    const taxesValue = parseFloat(newTransaction.milesTaxes) || 0;
    return milesValue + taxesValue;
  };

  const calculateProfit = () => {
    const saleValue = parseFloat(newTransaction.saleValue) || 0;
    const commissionValue = parseFloat(newTransaction.commissionValue) || 0;
    
    // Calculate total supplier costs from multiple suppliers
    let totalSupplierCost = 0;
    if (newTransaction.suppliers && newTransaction.suppliers.length > 0) {
      totalSupplierCost = newTransaction.suppliers.reduce((total, supplier) => {
        const supplierValue = parseFloat(supplier.value) || 0;
        return total + supplierValue;
      }, 0);
    }
    
    // Calculate total product costs
    let totalProductCost = 0;
    if (newTransaction.products && newTransaction.products.length > 0) {
      totalProductCost = newTransaction.products.reduce((total, product) => {
        const productCost = parseFloat(product.cost) || 0;
        return total + productCost;
      }, 0);
    }
    
    // Add old supplier fields for backward compatibility
    const oldSupplierValue = parseFloat(newTransaction.supplierValue) || 0;
    const airportTaxes = parseFloat(newTransaction.airportTaxes) || 0;
    const backwardCompatibilityCost = oldSupplierValue + airportTaxes;
    
    // If using miles, add miles costs
    let milesCost = 0;
    if (newTransaction.supplierUsedMiles) {
      const milesValue = calculateMilesTotal();
      const milesTaxes = parseFloat(newTransaction.milesTaxes) || 0;
      milesCost = milesValue + milesTaxes;
    }
    
    const totalCost = totalSupplierCost + totalProductCost + backwardCompatibilityCost + milesCost;
    const profit = saleValue - totalCost - commissionValue;
    return profit;
  };

  useEffect(() => {
    fetchData();
    loadCustomCategories();
  }, []);

  const loadCustomCategories = async () => {
    try {
      // Carregar categorias personalizadas do AdminSettings
      const storedRevenueCategories = localStorage.getItem('riseTravel_revenueCategories');
      const storedExpenseCategories = localStorage.getItem('riseTravel_expenseCategories');
      
      if (storedRevenueCategories) {
        const customRevenue = JSON.parse(storedRevenueCategories);
        setRevenueCategories(prev => [...new Set([...prev, ...customRevenue])]);
      }
      
      if (storedExpenseCategories) {
        const customExpense = JSON.parse(storedExpenseCategories);
        setExpenseCategories(prev => [...new Set([...prev, ...customExpense])]);
      }
    } catch (error) {
      console.error('Erro ao carregar categorias personalizadas:', error);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [
        transactionsData,
        categoriesData,
        paymentMethodsData,
        clientsData,
        suppliersData,
        usersData,
        airlinesData,
        airportsData
      ] = await Promise.all([
        transactionsAPI.getTransactions(),
        transactionsAPI.getCategories(),
        transactionsAPI.getPaymentMethods(),
        clientsAPI.getClients(),
        suppliersAPI.getSuppliers(),
        usersAPI.getUsers(),
        api.get('/travel/airlines'),
        api.get('/travel/airports')
      ]);
      
      setTransactions(transactionsData);
      setCategories(categoriesData.categories || []);
      setPaymentMethods(paymentMethodsData.paymentMethods || []);
      setClients(clientsData);
      setSuppliers(suppliersData);
      setUsers(usersData);
      setAirlines(airlinesData.airlines || []);
      setAirports(airportsData.airports || []);
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

  const addProduct = () => {
    setNewTransaction({
      ...newTransaction,
      products: [...newTransaction.products, { name: '', cost: '', supplier: 'none' }]
    });
  };

  const removeProduct = (index) => {
    const newProducts = newTransaction.products.filter((_, i) => i !== index);
    setNewTransaction({ ...newTransaction, products: newProducts });
  };

  const updateProduct = (index, field, value) => {
    const newProducts = [...newTransaction.products];
    newProducts[index][field] = value;
    setNewTransaction({ ...newTransaction, products: newProducts });
  };

  // Multiple suppliers management functions
  const addSupplier = () => {
    if (newTransaction.suppliers.length < 6) {
      setNewTransaction({
        ...newTransaction,
        suppliers: [...newTransaction.suppliers, { 
          name: '', 
          value: '', 
          paymentDate: '', 
          paymentStatus: 'Pendente',
          usedMiles: false,
          milesQuantity: '',
          milesValue: '',
          milesProgram: ''
        }]
      });
    } else {
      toast({
        variant: "destructive",
        title: "Limite atingido",
        description: "Máximo de 6 fornecedores por transação.",
      });
    }
  };

  const removeSupplier = (index) => {
    if (newTransaction.suppliers.length > 1) {
      const newSuppliers = newTransaction.suppliers.filter((_, i) => i !== index);
      setNewTransaction({ ...newTransaction, suppliers: newSuppliers });
    }
  };

  const updateSupplier = (index, field, value) => {
    const newSuppliers = [...newTransaction.suppliers];
    newSuppliers[index][field] = value;
    setNewTransaction({ ...newTransaction, suppliers: newSuppliers });
  };

  // Manual expense generation
  const generateExpensesManually = async (transactionId) => {
    try {
      const response = await transactionsAPI.generateExpenses(transactionId);
      
      toast({
        title: "Despesas geradas",
        description: response.expenseMessage || response.message,
        variant: response.generatedExpenses > 0 ? "default" : "secondary"
      });
      
      // Refresh the transaction list to show new expenses
      if (response.generatedExpenses > 0) {
        fetchData();
      }
    } catch (error) {
      console.error('Error generating expenses:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao gerar despesas. Tente novamente.",
      });
    }
  };

  const resetForm = () => {
    setNewTransaction({
      type: 'entrada',
      category: '',
      description: '',
      amount: '',
      paymentMethod: '',
      client: '',
      supplier: '',
      // Multiple suppliers system (up to 6)
      suppliers: [{ 
        name: '', 
        value: '', 
        paymentDate: '', 
        paymentStatus: 'Pendente',
        usedMiles: false,
        milesQuantity: '',
        milesValue: '',
        milesProgram: ''
      }],
      seller: '',
      saleValue: '',
      supplierValue: '',
      supplierPaymentDate: '',
      supplierPaymentStatus: 'Pendente',
      commissionValue: '',
      commissionPaymentDate: '',
      commissionPaymentStatus: 'Pendente',
      customCategory: '',
      transactionDate: new Date().toISOString().split('T')[0],
      // Travel-specific fields
      clientNumber: '',
      reservationLocator: '',
      departureDate: '',
      returnDate: '',
      departureTime: '',
      arrivalTime: '',
      hasStops: false,
      originAirport: '',
      destinationAirport: '',
      tripType: 'Lazer',
      products: [{ name: '', cost: '', supplier: 'none' }],
      // Enhanced fields for client reservation and supplier miles
      clientReservationCode: '',
      departureCity: '',
      arrivalCity: '',
      productType: 'Passagem',
      supplierUsedMiles: false,
      supplierMilesQuantity: '',
      supplierMilesValue: '',
      supplierMilesProgram: '',
      airportTaxes: '',
      milesTaxes: '',
      // Escalas
      outboundStops: '',
      returnStops: '',
      // Additional fields for expenses
      saleReference: '',
      productPurchased: '',
      additionalInfo: ''
    });
  };

  const handleAddTransaction = async (e) => {
    if (e) e.preventDefault();
    
    // Validação mais simples - apenas campos realmente essenciais
    if (!newTransaction.description || !newTransaction.amount || newTransaction.amount <= 0) {
      toast({
        variant: "destructive",
        title: "Erro de Validação",
        description: "Por favor, preencha a descrição e um valor maior que zero.",
      });
      return;
    }

    try {
      const transactionData = {
        ...newTransaction,
        amount: parseFloat(newTransaction.amount),
        saleValue: newTransaction.saleValue ? parseFloat(newTransaction.saleValue) : null,
        supplierValue: newTransaction.supplierValue ? parseFloat(newTransaction.supplierValue) : null,
        commissionValue: newTransaction.commissionValue ? parseFloat(newTransaction.commissionValue) : null,
        airportTaxes: newTransaction.airportTaxes ? parseFloat(newTransaction.airportTaxes) : null,
        milesTaxes: newTransaction.milesTaxes ? parseFloat(newTransaction.milesTaxes) : null,
        supplierMilesQuantity: newTransaction.supplierMilesQuantity ? parseFloat(newTransaction.supplierMilesQuantity) : null,
        supplierMilesValue: newTransaction.supplierMilesValue ? parseFloat(newTransaction.supplierMilesValue) : null,
        products: newTransaction.products.filter(p => p.name && p.cost),
        suppliers: newTransaction.suppliers.filter(s => s.name && s.value)
      };

      console.log('🔍 Transaction data being sent:', transactionData); // Debug log

      const response = await transactionsAPI.createTransaction(transactionData);
      
      // Extrair a transação criada da resposta (o backend retorna {message, ...transaction})
      const { message, ...createdTransaction } = response;
      
      console.log('✅ Transaction created successfully:', createdTransaction); // Debug log
      
      // Atualizar a lista imediatamente com a nova transação
      setTransactions(prevTransactions => [createdTransaction, ...prevTransactions]);
      
      setIsAddModalOpen(false);
      
      // Reset form COMPLETAMENTE usando a função dedicada
      resetForm();
      
      // Show success message with expense generation info
      const toastMessage = response.expenseMessage 
        ? `Transação criada com sucesso! ${response.expenseMessage}`
        : "A transação foi criada com sucesso.";
      
      toast({
        title: "Transação adicionada",
        description: toastMessage,
        variant: response.generatedExpenses ? "default" : "default"
      });
      
      // If expenses were generated, refresh the list to show them
      if (response.generatedExpenses > 0) {
        setTimeout(() => {
          fetchData();
        }, 1000);
      }
    } catch (error) {
      console.error('❌ Error creating transaction:', error);
      console.error('❌ Error response:', error.response?.data);
      console.error('❌ Error status:', error.response?.status);
      
      let errorMessage = "Erro ao criar transação";
      if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        variant: "destructive",
        title: "Erro ao salvar transação",
        description: errorMessage,
      });
    }
  };

  const handleEditTransaction = (transaction) => {
    setSelectedTransaction(transaction);
    
    // Handle backward compatibility for suppliers
    let suppliersArray = [];
    if (transaction.suppliers && Array.isArray(transaction.suppliers) && transaction.suppliers.length > 0) {
      // New format: use existing suppliers array
      suppliersArray = transaction.suppliers;
    } else if (transaction.supplier || transaction.supplierValue) {
      // Old format: convert old supplier fields to new array format
      suppliersArray = [{
        name: transaction.supplier || '',
        value: transaction.supplierValue || '',
        paymentDate: transaction.supplierPaymentDate || '',
        paymentStatus: transaction.supplierPaymentStatus || 'Pendente',
        usedMiles: transaction.supplierUsedMiles || false,
        milesQuantity: transaction.supplierMilesQuantity || '',
        milesValue: transaction.supplierMilesValue || '',
        milesProgram: transaction.supplierMilesProgram || ''
      }];
    } else {
      // No supplier data: create empty supplier
      suppliersArray = [{ 
        name: '', 
        value: '', 
        paymentDate: '', 
        paymentStatus: 'Pendente',
        usedMiles: false,
        milesQuantity: '',
        milesValue: '',
        milesProgram: ''
      }];
    }
    
    setNewTransaction({
      ...transaction,
      products: transaction.products || [{ name: '', cost: '', supplier: 'none' }],
      suppliers: suppliersArray
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateTransaction = async (e) => {
    e.preventDefault();
    
    if (!newTransaction.type || !newTransaction.category || !newTransaction.description || !newTransaction.amount || !newTransaction.paymentMethod) {
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
        amount: parseFloat(newTransaction.amount),
        saleValue: newTransaction.saleValue ? parseFloat(newTransaction.saleValue) : null,
        supplierValue: newTransaction.supplierValue ? parseFloat(newTransaction.supplierValue) : null,
        commissionValue: newTransaction.commissionValue ? parseFloat(newTransaction.commissionValue) : null,
        airportTaxes: newTransaction.airportTaxes ? parseFloat(newTransaction.airportTaxes) : null,
        milesTaxes: newTransaction.milesTaxes ? parseFloat(newTransaction.milesTaxes) : null,
        supplierMilesQuantity: newTransaction.supplierMilesQuantity ? parseFloat(newTransaction.supplierMilesQuantity) : null,
        supplierMilesValue: newTransaction.supplierMilesValue ? parseFloat(newTransaction.supplierMilesValue) : null,
        products: newTransaction.products.filter(p => p.name && p.cost),
        suppliers: newTransaction.suppliers.filter(s => s.name && s.value)
      };

      const response = await transactionsAPI.updateTransaction(selectedTransaction.id, transactionData);
      
      // Extrair a transação atualizada da resposta (o backend pode retornar {message, ...transaction})
      const updatedTransaction = response.message ? { ...response, message: undefined } : response;
      
      setTransactions(transactions.map(t => 
        t.id === selectedTransaction.id ? updatedTransaction : t
      ));
      
      setIsEditModalOpen(false);
      setSelectedTransaction(null);
      
      // Reset form
      setNewTransaction({
        type: 'entrada',
        category: '',
        description: '',
        amount: '',
        paymentMethod: '',
        client: '',
        supplier: '',
        // Multiple suppliers system (up to 6)
        suppliers: [{ 
          name: '', 
          value: '', 
          paymentDate: '', 
          paymentStatus: 'Pendente',
          usedMiles: false,
          milesQuantity: '',
          milesValue: '',
          milesProgram: ''
        }],
        seller: '',
        saleValue: '',
        supplierValue: '',
        supplierPaymentDate: '',
        supplierPaymentStatus: 'Pendente',
        commissionValue: '',
        commissionPaymentDate: '',
        commissionPaymentStatus: 'Pendente',
        customCategory: '',
        transactionDate: new Date().toISOString().split('T')[0],
        clientNumber: '',
        reservationLocator: '',
        departureDate: '',
        returnDate: '',
        departureTime: '',
        arrivalTime: '',
        hasStops: false,
        originAirport: '',
        destinationAirport: '',
        tripType: 'Lazer',
        products: [{ name: '', cost: '', supplier: 'none' }],
        clientReservationCode: '',
        departureCity: '',
        arrivalCity: '',
        productType: 'Passagem',
        supplierUsedMiles: false,
        supplierMilesQuantity: '',
        supplierMilesValue: '',
        supplierMilesProgram: '',
        airportTaxes: '',
        outboundStops: '',
        returnStops: '',
        // Additional fields for expenses
        saleReference: '',
        productPurchased: '',
        additionalInfo: ''
      });

      // Show success message with expense generation info
      const toastMessage = response.expenseMessage 
        ? `Transação atualizada com sucesso! ${response.expenseMessage}`
        : "A transação foi atualizada com sucesso.";

      toast({
        title: "Transação atualizada",
        description: toastMessage,
      });
    } catch (error) {
      console.error('Error updating transaction:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao atualizar transação.",
      });
    }
  };

  const handleDeleteTransaction = async () => {
    try {
      await transactionsAPI.deleteTransaction(transactionToDelete.id);
      setTransactions(transactions.filter(t => t.id !== transactionToDelete.id));
      
      setIsDeleteConfirmOpen(false);
      setTransactionToDelete(null);
      
      toast({
        title: "Transação excluída",
        description: "A transação foi excluída com sucesso.",
      });
    } catch (error) {
      console.error('Error deleting transaction:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao excluir transação.",
      });
    }
  };

  const confirmDeleteTransaction = (transaction) => {
    setTransactionToDelete(transaction);
    setIsDeleteConfirmOpen(true);
  };

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (transaction.client && transaction.client.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (transaction.reservationLocator && transaction.reservationLocator.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (transaction.clientReservationCode && transaction.clientReservationCode.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (transaction.departureCity && transaction.departureCity.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (transaction.arrivalCity && transaction.arrivalCity.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (transaction.productType && transaction.productType.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesFilter = filterType === 'all' || transaction.type === filterType;
    
    return matchesSearch && matchesFilter;
  });

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
        <h2 className="text-2xl font-bold text-gray-900">Transações Avançadas</h2>
        <Dialog open={isAddModalOpen} onOpenChange={(open) => {
          if (open) {
            resetForm(); // Limpar formulário ao abrir modal
          }
          setIsAddModalOpen(open);
        }}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-pink-500 to-orange-400 hover:from-pink-600 hover:to-orange-500">
              <Plus className="mr-2 h-4 w-4" />
              Nova Transação
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Nova Transação - Agência de Viagens</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddTransaction}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 py-4">
                
                {/* Basic Transaction Info */}
                <div className="lg:col-span-3 border-b pb-4 mb-4">
                  <h3 className="text-lg font-semibold mb-4">Informações Básicas</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

                  <div className="space-y-2">
                    <Label>Categoria *</Label>
                    <Select value={newTransaction.category} onValueChange={(value) => setNewTransaction({...newTransaction, category: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        {newTransaction.type === 'entrada' ? (
                          <>
                            <SelectItem disabled className="font-semibold text-green-700">💰 RECEITAS</SelectItem>
                            {revenueCategories.map(category => (
                              <SelectItem key={category} value={category} className="text-green-600">
                                {category}
                              </SelectItem>
                            ))}
                          </>
                        ) : (
                          <>
                            <SelectItem disabled className="font-semibold text-red-700">💸 DESPESAS</SelectItem>
                            {expenseCategories.map(category => (
                              <SelectItem key={category} value={category} className="text-red-600">
                                {category}
                              </SelectItem>
                            ))}
                          </>
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Data da Transação *</Label>
                    <Input
                      type="date"
                      value={newTransaction.transactionDate}
                      onChange={(e) => setNewTransaction({...newTransaction, transactionDate: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 mt-4">
                  <div className="space-y-2">
                    <Label>Descrição *</Label>
                    <Input
                      placeholder="Descrição da transação"
                      value={newTransaction.description}
                      onChange={(e) => setNewTransaction({...newTransaction, description: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              {/* Campos específicos para SAÍDAS/DESPESAS */}
              {newTransaction.type === 'saida' && (
                <div className="lg:col-span-3 border-b pb-4 mb-4">
                  <h3 className="text-lg font-semibold mb-4 text-red-600">💸 Informações da Despesa/Pagamento</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    
                    {/* Fornecedor */}
                    <div className="space-y-2">
                      <Label>Fornecedor *</Label>
                      <Select value={newTransaction.supplier} onValueChange={(value) => setNewTransaction({...newTransaction, supplier: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o fornecedor" />
                        </SelectTrigger>
                        <SelectContent>
                          {suppliers.map(supplier => (
                            <SelectItem key={supplier.id} value={supplier.name}>
                              {supplier.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Número da Venda Referência */}
                    <div className="space-y-2">
                      <Label>Nº Venda (Referência)</Label>
                      <Input
                        placeholder="Ex: V-2025-001"
                        value={newTransaction.saleReference}
                        onChange={(e) => setNewTransaction({...newTransaction, saleReference: e.target.value})}
                      />
                    </div>

                    {/* Produto Comprado */}
                    <div className="space-y-2">
                      <Label>Produto Comprado</Label>
                      <Input
                        placeholder="Ex: Passagem GRU-MIA"
                        value={newTransaction.productPurchased}
                        onChange={(e) => setNewTransaction({...newTransaction, productPurchased: e.target.value})}
                      />
                    </div>

                    {/* Data de Pagamento */}
                    <div className="space-y-2">
                      <Label>Data de Pagamento</Label>
                      <Input
                        type="date"
                        value={newTransaction.supplierPaymentDate}
                        onChange={(e) => setNewTransaction({...newTransaction, supplierPaymentDate: e.target.value})}
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
                            <SelectItem key={method} value={method}>
                              {method}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Valor Pago */}
                    <div className="space-y-2">
                      <Label>Valor Pago ao Fornecedor *</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0,00"
                        value={newTransaction.amount}
                        onChange={(e) => setNewTransaction({...newTransaction, amount: e.target.value})}
                      />
                    </div>

                    {/* Informações Adicionais */}
                    <div className="space-y-2 md:col-span-2 lg:col-span-3">
                      <Label>Informações Adicionais</Label>
                      <Textarea
                        placeholder="Observações, detalhes do pagamento, condições especiais..."
                        value={newTransaction.additionalInfo}
                        onChange={(e) => setNewTransaction({...newTransaction, additionalInfo: e.target.value})}
                        rows={3}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Campos para ENTRADAS (mantém como estava antes) */}
              {newTransaction.type === 'entrada' && (
                <>
                  <div className="lg:col-span-3 border-b pb-4 mb-4">
                    <h3 className="text-lg font-semibold mb-4">💰 Informações da Receita</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Valor da Transação *</Label>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0,00"
                          value={newTransaction.amount}
                          onChange={(e) => setNewTransaction({...newTransaction, amount: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Forma de Pagamento *</Label>
                        <Select value={newTransaction.paymentMethod} onValueChange={(value) => setNewTransaction({...newTransaction, paymentMethod: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a forma" />
                          </SelectTrigger>
                          <SelectContent>
                            {paymentMethods.map(method => (
                              <SelectItem key={method} value={method}>
                                {method}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Travel Details */}
              <div className="lg:col-span-3 border-b pb-4 mb-4">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Plane className="mr-2 h-5 w-5" />
                  Detalhes da Viagem
                </h3>
                
                {/* Primeira linha - Informações do cliente e produto */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div className="space-y-2">
                    <Label>Tipo de Produto *</Label>
                    <Select value={newTransaction.productType} onValueChange={(value) => setNewTransaction({...newTransaction, productType: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Passagem">✈️ Passagem Aérea</SelectItem>
                        <SelectItem value="Hotel">🏨 Hotel/Hospedagem</SelectItem>
                        <SelectItem value="Pacote">📦 Pacote Turístico</SelectItem>
                        <SelectItem value="Seguro">🛡️ Seguro Viagem</SelectItem>
                        <SelectItem value="Transfer">🚗 Transfer</SelectItem>
                        <SelectItem value="Outros">📋 Outros</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Código da Reserva do Cliente</Label>
                    <Input
                      placeholder="Ex: BR123456"
                      value={newTransaction.clientReservationCode}
                      onChange={(e) => setNewTransaction({...newTransaction, clientReservationCode: e.target.value})}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Cidade de Saída</Label>
                    <Input
                      placeholder="Ex: São Paulo"
                      value={newTransaction.departureCity}
                      onChange={(e) => setNewTransaction({...newTransaction, departureCity: e.target.value})}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Cidade de Chegada</Label>
                    <Input
                      placeholder="Ex: Rio de Janeiro"
                      value={newTransaction.arrivalCity}
                      onChange={(e) => setNewTransaction({...newTransaction, arrivalCity: e.target.value})}
                    />
                  </div>
                </div>

                {/* Segunda linha - Datas e tipo de viagem */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label>Tipo de Viagem</Label>
                    <Select value={newTransaction.tripType} onValueChange={(value) => setNewTransaction({...newTransaction, tripType: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Lazer">
                          <div className="flex items-center">
                            <Heart className="mr-2 h-4 w-4" />
                            Lazer
                          </div>
                        </SelectItem>
                        <SelectItem value="Negócios">
                          <div className="flex items-center">
                            <Briefcase className="mr-2 h-4 w-4" />
                            Negócios
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Data de Partida</Label>
                    <Input
                      type="date"
                      value={newTransaction.departureDate}
                      onChange={(e) => setNewTransaction({...newTransaction, departureDate: e.target.value})}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Data de Retorno</Label>
                    <Input
                      type="date"
                      value={newTransaction.returnDate}
                      onChange={(e) => setNewTransaction({...newTransaction, returnDate: e.target.value})}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 mt-6">
                      <input
                        type="checkbox"
                        id="hasStops"
                        checked={newTransaction.hasStops}
                        onChange={(e) => setNewTransaction({...newTransaction, hasStops: e.target.checked})}
                        className="rounded border-gray-300"
                      />
                      <Label htmlFor="hasStops">Possui escalas</Label>
                    </div>
                  </div>
                </div>

                {/* Campos de escalas (aparecem quando "Possui escalas" está marcado) */}
                {newTransaction.hasStops && (
                  <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <h4 className="font-medium text-yellow-800 mb-3 flex items-center">
                      ✈️ Detalhes das Escalas
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Escala da Ida</Label>
                        <Input
                          placeholder="Ex: Lisboa (LIS), Frankfurt (FRA)"
                          value={newTransaction.outboundStops || ''}
                          onChange={(e) => setNewTransaction({...newTransaction, outboundStops: e.target.value})}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Escala da Volta</Label>
                        <Input
                          placeholder="Ex: Paris (CDG), Amsterdam (AMS)"
                          value={newTransaction.returnStops || ''}
                          onChange={(e) => setNewTransaction({...newTransaction, returnStops: e.target.value})}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Multiple Products - MOVED UP */}
              <div className="lg:col-span-3 border-b pb-4 mb-4">
                <h3 className="text-lg font-semibold mb-4">📦 Produtos/Serviços da Venda</h3>
                {newTransaction.products.map((product, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 p-4 border rounded-lg bg-gray-50">
                    <div className="space-y-2">
                      <Label>Produto/Serviço</Label>
                      <Input
                        placeholder="Ex: Passagem, Seguro, Transfer"
                        value={product.name}
                        onChange={(e) => updateProduct(index, 'name', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Custo (R$)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0,00"
                        value={product.cost}
                        onChange={(e) => updateProduct(index, 'cost', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Fornecedor</Label>
                      <Select value={product.supplier || ''} onValueChange={(value) => updateProduct(index, 'supplier', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o fornecedor" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Nenhum</SelectItem>
                          {suppliers.map(supplier => (
                            <SelectItem key={supplier.id} value={supplier.name}>
                              {supplier.name} - {supplier.supplierCode}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-end">
                      {index > 0 && (
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => removeProduct(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={addProduct}
                  className="w-full"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar Produto/Serviço
                </Button>
              </div>

              {/* Financial Details */}
              <div className="lg:col-span-3 border-b pb-4 mb-4">
                <h3 className="text-lg font-semibold mb-4">💰 Detalhes Financeiros</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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

                  <div className="space-y-2">
                    <Label>Percentual da Comissão</Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        type="text"
                        readOnly
                        value={`${calculateCommissionPercentage()}%`}
                        className="bg-gray-100"
                      />
                      <span className="text-sm text-gray-600">automático</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Status Pagamento Comissão</Label>
                    <Select value={newTransaction.commissionPaymentStatus} onValueChange={(value) => setNewTransaction({...newTransaction, commissionPaymentStatus: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Pendente">🕐 Pendente</SelectItem>
                        <SelectItem value="Pago">✅ Pago</SelectItem>
                        <SelectItem value="Cancelado">❌ Cancelado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {newTransaction.commissionPaymentStatus === 'Pago' && (
                    <div className="space-y-2">
                      <Label>Data Pagamento Comissão</Label>
                      <Input
                        type="date"
                        value={newTransaction.commissionPaymentDate}
                        onChange={(e) => setNewTransaction({...newTransaction, commissionPaymentDate: e.target.value})}
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label>Valor Total *</Label>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0,00"
                      value={newTransaction.amount}
                      onChange={(e) => setNewTransaction({...newTransaction, amount: e.target.value})}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Lucro Final</Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        type="text"
                        readOnly
                        value={formatCurrency(calculateProfit())}
                        className={`bg-gray-100 ${calculateProfit() >= 0 ? 'text-green-600' : 'text-red-600'}`}
                      />
                      <span className="text-sm text-gray-600">automático</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Multiple Suppliers Section */}
              <div className="lg:col-span-3 border-b pb-4 mb-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold flex items-center">
                    🏢 Fornecedores (até 6)
                  </h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addSupplier}
                    disabled={newTransaction.suppliers.length >= 6}
                  >
                    <Plus className="mr-1 h-4 w-4" />
                    Adicionar Fornecedor
                  </Button>
                </div>

                {newTransaction.suppliers.map((supplier, index) => (
                  <div key={index} className="mb-6 p-4 border rounded-lg bg-gray-50">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-gray-700">Fornecedor {index + 1}</h4>
                      {index > 0 && (
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => removeSupplier(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="space-y-2">
                        <Label>Nome do Fornecedor</Label>
                        <Select value={supplier.name} onValueChange={(value) => updateSupplier(index, 'name', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o fornecedor" />
                          </SelectTrigger>
                          <SelectContent>
                            {suppliers.map(sup => (
                              <SelectItem key={sup.id} value={sup.name}>{sup.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Valor (R$)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0,00"
                          value={supplier.value}
                          onChange={(e) => updateSupplier(index, 'value', e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Data de Pagamento</Label>
                        <Input
                          type="date"
                          value={supplier.paymentDate}
                          onChange={(e) => updateSupplier(index, 'paymentDate', e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Status do Pagamento</Label>
                        <Select value={supplier.paymentStatus} onValueChange={(value) => updateSupplier(index, 'paymentStatus', value)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Pendente">🕐 Pendente</SelectItem>
                            <SelectItem value="Pago">✅ Pago</SelectItem>
                            <SelectItem value="Cancelado">❌ Cancelado</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Miles section for each supplier */}
                    <div className="mt-4">
                      <div className="flex items-center space-x-2 mb-3">
                        <Checkbox
                          id={`usedMiles-${index}`}
                          checked={supplier.usedMiles}
                          onCheckedChange={(checked) => updateSupplier(index, 'usedMiles', checked)}
                        />
                        <Label htmlFor={`usedMiles-${index}`} className="font-medium">
                          Fornecedor utilizou milhas
                        </Label>
                      </div>

                      {supplier.usedMiles && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-3 bg-blue-50 rounded-md">
                          <div className="space-y-2">
                            <Label>Quantidade de Milhas</Label>
                            <Input
                              type="number"
                              placeholder="Ex: 25000"
                              value={supplier.milesQuantity}
                              onChange={(e) => updateSupplier(index, 'milesQuantity', e.target.value)}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>Valor por 1.000 milhas (R$)</Label>
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="Ex: 26,00"
                              value={supplier.milesValue}
                              onChange={(e) => updateSupplier(index, 'milesValue', e.target.value)}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>Programa de Milhas</Label>
                            <Select value={supplier.milesProgram} onValueChange={(value) => updateSupplier(index, 'milesProgram', value)}>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione o programa" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="LATAM Pass">✈️ LATAM Pass</SelectItem>
                                <SelectItem value="Smiles">✈️ Smiles (GOL)</SelectItem>
                                <SelectItem value="TudoAzul">✈️ TudoAzul (Azul)</SelectItem>
                                <SelectItem value="Multiplus">✈️ Multiplus</SelectItem>
                                <SelectItem value="American Airlines">✈️ American Airlines</SelectItem>
                                <SelectItem value="United">✈️ United MileagePlus</SelectItem>
                                <SelectItem value="Delta">✈️ Delta SkyMiles</SelectItem>
                                <SelectItem value="Outros">📋 Outros</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" className="bg-gradient-to-r from-pink-500 to-orange-400 hover:from-pink-600 hover:to-orange-500">
                  Salvar Transação
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Edit Transaction Modal */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Editar Transação - Agência de Viagens</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleUpdateTransaction}>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-h-[80vh] overflow-y-auto">
                {/* Basic Information */}
                <div className="lg:col-span-3 border-b pb-4 mb-4">
                  <h3 className="text-lg font-semibold mb-4">Informações Básicas</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label>Tipo *</Label>
                      <Select value={newTransaction.type} onValueChange={(value) => setNewTransaction({...newTransaction, type: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="entrada">💰 Entrada (Receita)</SelectItem>
                          <SelectItem value="saida">💸 Saída (Despesa)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Categoria *</Label>
                      <Select value={newTransaction.category} onValueChange={(value) => setNewTransaction({...newTransaction, category: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a categoria" />
                        </SelectTrigger>
                        <SelectContent>
                          {newTransaction.type === 'entrada' ? (
                            <>
                              <SelectItem disabled className="font-semibold text-green-700">💰 RECEITAS</SelectItem>
                              {revenueCategories.map(category => (
                                <SelectItem key={category} value={category} className="text-green-600">
                                  {category}
                                </SelectItem>
                              ))}
                            </>
                          ) : (
                            <>
                              <SelectItem disabled className="font-semibold text-red-700">💸 DESPESAS</SelectItem>
                              {expenseCategories.map(category => (
                                <SelectItem key={category} value={category} className="text-red-600">
                                  {category}
                                </SelectItem>
                              ))}
                            </>
                          )}
                        </SelectContent>
                      </Select>
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
                      <Label>Descrição *</Label>
                      <Input
                        placeholder="Descrição da transação"
                        value={newTransaction.description}
                        onChange={(e) => setNewTransaction({...newTransaction, description: e.target.value})}
                      />
                    </div>
                  </div>
                </div>

                {/* Travel Details */}
                <div className="lg:col-span-3 border-b pb-4 mb-4">
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <Plane className="mr-2 h-5 w-5" />
                    Detalhes da Viagem
                  </h3>
                  
                  {/* Primeira linha - Informações do cliente e produto */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div className="space-y-2">
                      <Label>Tipo de Produto *</Label>
                      <Select value={newTransaction.productType} onValueChange={(value) => setNewTransaction({...newTransaction, productType: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Passagem">✈️ Passagem Aérea</SelectItem>
                          <SelectItem value="Hotel">🏨 Hotel/Hospedagem</SelectItem>
                          <SelectItem value="Pacote">📦 Pacote Turístico</SelectItem>
                          <SelectItem value="Seguro">🛡️ Seguro Viagem</SelectItem>
                          <SelectItem value="Transfer">🚗 Transfer</SelectItem>
                          <SelectItem value="Outros">📋 Outros</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Código da Reserva do Cliente</Label>
                      <Input
                        placeholder="Ex: BR123456"
                        value={newTransaction.clientReservationCode}
                        onChange={(e) => setNewTransaction({...newTransaction, clientReservationCode: e.target.value})}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Cidade de Saída</Label>
                      <Input
                        placeholder="Ex: São Paulo"
                        value={newTransaction.departureCity}
                        onChange={(e) => setNewTransaction({...newTransaction, departureCity: e.target.value})}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Cidade de Chegada</Label>
                      <Input
                        placeholder="Ex: Rio de Janeiro"
                        value={newTransaction.arrivalCity}
                        onChange={(e) => setNewTransaction({...newTransaction, arrivalCity: e.target.value})}
                      />
                    </div>
                  </div>

                  {/* Segunda linha - Datas e tipo de viagem */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label>Tipo de Viagem</Label>
                      <Select value={newTransaction.tripType} onValueChange={(value) => setNewTransaction({...newTransaction, tripType: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Lazer">
                            <div className="flex items-center">
                              <Heart className="mr-2 h-4 w-4" />
                              Lazer
                            </div>
                          </SelectItem>
                          <SelectItem value="Negócios">
                            <div className="flex items-center">
                              <Briefcase className="mr-2 h-4 w-4" />
                              Negócios
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Data de Partida</Label>
                      <Input
                        type="date"
                        value={newTransaction.departureDate}
                        onChange={(e) => setNewTransaction({...newTransaction, departureDate: e.target.value})}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Data de Retorno</Label>
                      <Input
                        type="date"
                        value={newTransaction.returnDate}
                        onChange={(e) => setNewTransaction({...newTransaction, returnDate: e.target.value})}
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 mt-6">
                        <input
                          type="checkbox"
                          id="hasStopsEdit"
                          checked={newTransaction.hasStops}
                          onChange={(e) => setNewTransaction({...newTransaction, hasStops: e.target.checked})}
                          className="rounded border-gray-300"
                        />
                        <Label htmlFor="hasStopsEdit">Possui escalas</Label>
                      </div>
                    </div>
                  </div>

                  {/* Campos de escalas (aparecem quando "Possui escalas" está marcado) */}
                  {newTransaction.hasStops && (
                    <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                      <h4 className="font-medium text-yellow-800 mb-3 flex items-center">
                        ✈️ Detalhes das Escalas
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Escala da Ida</Label>
                          <Input
                            placeholder="Ex: Lisboa (LIS), Frankfurt (FRA)"
                            value={newTransaction.outboundStops || ''}
                            onChange={(e) => setNewTransaction({...newTransaction, outboundStops: e.target.value})}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Escala da Volta</Label>
                          <Input
                            placeholder="Ex: Paris (CDG), Amsterdam (AMS)"
                            value={newTransaction.returnStops || ''}
                            onChange={(e) => setNewTransaction({...newTransaction, returnStops: e.target.value})}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Multiple Products - MOVED UP */}
                <div className="lg:col-span-3 border-b pb-4 mb-4">
                  <h3 className="text-lg font-semibold mb-4">📦 Produtos/Serviços da Venda</h3>
                  {newTransaction.products.map((product, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 p-4 border rounded-lg bg-gray-50">
                      <div className="space-y-2">
                        <Label>Produto/Serviço</Label>
                        <Input
                          placeholder="Ex: Passagem, Seguro, Transfer"
                          value={product.name}
                          onChange={(e) => updateProduct(index, 'name', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Custo (R$)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0,00"
                          value={product.cost}
                          onChange={(e) => updateProduct(index, 'cost', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Fornecedor</Label>
                        <Select value={product.supplier || ''} onValueChange={(value) => updateProduct(index, 'supplier', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o fornecedor" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">Nenhum</SelectItem>
                            {suppliers.map(supplier => (
                              <SelectItem key={supplier.id} value={supplier.name}>
                                {supplier.name} - {supplier.supplierCode}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-end">
                        {index > 0 && (
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => removeProduct(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addProduct}
                    className="w-full"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Adicionar Produto/Serviço
                  </Button>
                </div>

                {/* Multiple Suppliers Section - Edit Modal */}
                <div className="lg:col-span-3 border-b pb-4 mb-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold flex items-center">
                      🏢 Fornecedores (até 6)
                    </h3>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addSupplier}
                      disabled={newTransaction.suppliers.length >= 6}
                    >
                      <Plus className="mr-1 h-4 w-4" />
                      Adicionar Fornecedor
                    </Button>
                  </div>

                  {newTransaction.suppliers.map((supplier, index) => (
                    <div key={index} className="mb-6 p-4 border rounded-lg bg-gray-50">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-gray-700">Fornecedor {index + 1}</h4>
                        {index > 0 && (
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => removeSupplier(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="space-y-2">
                          <Label>Nome do Fornecedor</Label>
                          <Select value={supplier.name || ''} onValueChange={(value) => updateSupplier(index, 'name', value)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o fornecedor" />
                            </SelectTrigger>
                            <SelectContent>
                              {suppliers.map(sup => (
                                <SelectItem key={sup.id} value={sup.name}>{sup.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>Valor (R$)</Label>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="0,00"
                            value={supplier.value || ''}
                            onChange={(e) => updateSupplier(index, 'value', e.target.value)}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Data de Pagamento</Label>
                          <Input
                            type="date"
                            value={supplier.paymentDate || ''}
                            onChange={(e) => updateSupplier(index, 'paymentDate', e.target.value)}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Status do Pagamento</Label>
                          <Select value={supplier.paymentStatus || 'Pendente'} onValueChange={(value) => updateSupplier(index, 'paymentStatus', value)}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Pendente">🕐 Pendente</SelectItem>
                              <SelectItem value="Pago">✅ Pago</SelectItem>
                              <SelectItem value="Cancelado">❌ Cancelado</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Miles section for each supplier */}
                      <div className="mt-4">
                        <div className="flex items-center space-x-2 mb-3">
                          <Checkbox
                            id={`editUsedMiles-${index}`}
                            checked={supplier.usedMiles || false}
                            onCheckedChange={(checked) => updateSupplier(index, 'usedMiles', checked)}
                          />
                          <Label htmlFor={`editUsedMiles-${index}`} className="font-medium">
                            Fornecedor utilizou milhas
                          </Label>
                        </div>

                        {supplier.usedMiles && (
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-3 bg-blue-50 rounded-md">
                            <div className="space-y-2">
                              <Label>Quantidade de Milhas</Label>
                              <Input
                                type="number"
                                placeholder="Ex: 25000"
                                value={supplier.milesQuantity || ''}
                                onChange={(e) => updateSupplier(index, 'milesQuantity', e.target.value)}
                              />
                            </div>

                            <div className="space-y-2">
                              <Label>Valor por 1.000 milhas (R$)</Label>
                              <Input
                                type="number"
                                step="0.01"
                                placeholder="Ex: 26,00"
                                value={supplier.milesValue || ''}
                                onChange={(e) => updateSupplier(index, 'milesValue', e.target.value)}
                              />
                            </div>

                            <div className="space-y-2">
                              <Label>Programa de Milhas</Label>
                              <Select value={supplier.milesProgram || ''} onValueChange={(value) => updateSupplier(index, 'milesProgram', value)}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione o programa" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="LATAM Pass">✈️ LATAM Pass</SelectItem>
                                  <SelectItem value="Smiles">✈️ Smiles (GOL)</SelectItem>
                                  <SelectItem value="TudoAzul">✈️ TudoAzul (Azul)</SelectItem>
                                  <SelectItem value="Multiplus">✈️ Multiplus</SelectItem>
                                  <SelectItem value="American Airlines">✈️ American Airlines</SelectItem>
                                  <SelectItem value="United">✈️ United MileagePlus</SelectItem>
                                  <SelectItem value="Delta">✈️ Delta SkyMiles</SelectItem>
                                  <SelectItem value="Outros">📋 Outros</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Financial Details */}
                <div className="lg:col-span-3 border-b pb-4 mb-4">
                  <h3 className="text-lg font-semibold mb-4">💰 Detalhes Financeiros</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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

                    <div className="space-y-2">
                      <Label>Percentual da Comissão</Label>
                      <div className="flex items-center space-x-2">
                        <Input
                          type="text"
                          readOnly
                          value={`${calculateCommissionPercentage()}%`}
                          className="bg-gray-100"
                        />
                        <span className="text-sm text-gray-600">automático</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Status Pagamento Comissão</Label>
                      <Select value={newTransaction.commissionPaymentStatus} onValueChange={(value) => setNewTransaction({...newTransaction, commissionPaymentStatus: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Pendente">🕐 Pendente</SelectItem>
                          <SelectItem value="Pago">✅ Pago</SelectItem>
                          <SelectItem value="Cancelado">❌ Cancelado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {newTransaction.commissionPaymentStatus === 'Pago' && (
                      <div className="space-y-2">
                        <Label>Data Pagamento Comissão</Label>
                        <Input
                          type="date"
                          value={newTransaction.commissionPaymentDate}
                          onChange={(e) => setNewTransaction({...newTransaction, commissionPaymentDate: e.target.value})}
                        />
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label>Valor Total *</Label>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0,00"
                        value={newTransaction.amount}
                        onChange={(e) => setNewTransaction({...newTransaction, amount: e.target.value})}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Lucro Final</Label>
                      <div className="flex items-center space-x-2">
                        <Input
                          type="text"
                          readOnly
                          value={formatCurrency(calculateProfit())}
                          className={`bg-gray-100 ${calculateProfit() >= 0 ? 'text-green-600' : 'text-red-600'}`}
                        />
                        <span className="text-sm text-gray-600">automático</span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" className="bg-gradient-to-r from-pink-500 to-orange-400 hover:from-pink-600 hover:to-orange-500">
                  Atualizar Transação
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Modal */}
        <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirmar Exclusão</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p>Tem certeza que deseja excluir esta transação?</p>
              {transactionToDelete && (
                <div className="mt-2 p-3 bg-gray-50 rounded">
                  <p className="font-medium">{transactionToDelete.description}</p>
                  <p className="text-sm text-gray-600">
                    {formatCurrency(transactionToDelete.amount)} - {transactionToDelete.category}
                  </p>
                </div>
              )}
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsDeleteConfirmOpen(false)}>
                Cancelar
              </Button>
              <Button variant="destructive" onClick={handleDeleteTransaction}>
                Excluir
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
            placeholder="Buscar por descrição, cliente, localizador, reserva, cidade..."
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
                      {transaction.autoGenerated && (
                        <Badge variant="secondary" className="text-xs">
                          🤖 Auto-gerada
                        </Badge>
                      )}
                      <span className="text-sm text-gray-500">{transaction.category}</span>
                      <span className="text-sm text-gray-500">{formatDate(transaction.date)}</span>
                      {transaction.reservationLocator && (
                        <Badge variant="outline">
                          <Plane className="h-3 w-3 mr-1" />
                          {transaction.reservationLocator}
                        </Badge>
                      )}
                    </div>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium text-gray-900">{transaction.description}</h3>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditTransaction(transaction)}
                              className="text-blue-600 hover:text-blue-800 p-1"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            {transaction.type === 'entrada' && transaction.suppliers && transaction.suppliers.length > 0 && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => generateExpensesManually(transaction.id)}
                                className="text-green-600 hover:text-green-800 p-1"
                                title="Gerar despesas para fornecedores pagos"
                              >
                                <DollarSign className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => confirmDeleteTransaction(transaction)}
                              className="text-red-600 hover:text-red-800 p-1"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                            <span className={`text-lg font-bold ${transaction.type === 'entrada' ? 'text-green-600' : 'text-red-600'}`}>
                              {transaction.type === 'entrada' ? '+' : '-'} {formatCurrency(transaction.amount)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Travel Details */}
                    {(transaction.originAirport || transaction.destinationAirport) && (
                      <div className="flex items-center space-x-2 mt-2 text-sm text-gray-600">
                        <MapPin className="h-4 w-4" />
                        <span>
                          {transaction.originAirport} → {transaction.destinationAirport}
                        </span>
                        {transaction.departureDate && (
                          <>
                            <Calendar className="h-4 w-4 ml-2" />
                            <span>{formatDate(transaction.departureDate)}</span>
                          </>
                        )}
                        {transaction.departureTime && (
                          <>
                            <Clock className="h-4 w-4 ml-2" />
                            <span>{transaction.departureTime}</span>
                          </>
                        )}
                      </div>
                    )}
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-2 text-sm text-gray-600">
                      {transaction.client && <span>Cliente: {transaction.client}</span>}
                      {transaction.seller && <span>Vendedor: {transaction.seller}</span>}
                      {transaction.supplier && <span>Fornecedor: {transaction.supplier}</span>}
                      <span>Pagamento: {transaction.paymentMethod}</span>
                      {transaction.productType && <span>Produto: {transaction.productType}</span>}
                      {transaction.clientReservationCode && <span>Reserva Cliente: {transaction.clientReservationCode}</span>}
                      {transaction.departureCity && transaction.arrivalCity && (
                        <span>{transaction.departureCity} → {transaction.arrivalCity}</span>
                      )}
                      {transaction.saleValue && <span>Venda: {formatCurrency(transaction.saleValue)}</span>}
                      {transaction.supplierValue && <span>Fornecedor: {formatCurrency(transaction.supplierValue)}</span>}
                      {transaction.commissionValue && (
                        <span>Comissão: {formatCurrency(transaction.commissionValue)} ({transaction.commissionPercentage?.toFixed(2)}%)</span>
                      )}
                      {transaction.supplierUsedMiles && transaction.supplierMilesQuantity && (
                        <span className="text-blue-600 font-medium">
                          ✈️ Milhas: {parseInt(transaction.supplierMilesQuantity).toLocaleString('pt-BR')} ({transaction.supplierMilesProgram})
                        </span>
                      )}
                      {transaction.airportTaxes && (
                        <span>Taxas: {formatCurrency(transaction.airportTaxes)}</span>
                      )}
                      {transaction.tripType && (
                        <span className="flex items-center">
                          {transaction.tripType === 'Lazer' ? <Heart className="h-3 w-3 mr-1" /> : <Briefcase className="h-3 w-3 mr-1" />}
                          {transaction.tripType}
                        </span>
                      )}
                    </div>

                    {/* Products */}
                    {transaction.products && transaction.products.length > 0 && (
                      <div className="mt-2">
                        <div className="text-sm font-medium text-gray-700 mb-1">Produtos/Serviços:</div>
                        <div className="flex flex-wrap gap-1">
                          {transaction.products.map((product, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {product.name}: {product.clientValue ? formatCurrency(product.clientValue) : (product.value ? formatCurrency(product.value) : 'N/A')}
                              {product.cost && ` (Custo: ${formatCurrency(product.cost)})`}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="text-right">
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

export default EnhancedTransactions;