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
    products: [{ name: '', value: '' }],
    // Enhanced fields for client reservation and supplier miles
    clientReservationCode: '',
    departureCity: '',
    arrivalCity: '',
    productType: 'Passagem',
    supplierUsedMiles: false,
    supplierMilesQuantity: '',
    supplierMilesValue: '',
    supplierMilesProgram: '',
    airportTaxes: ''
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
      products: [...newTransaction.products, { name: '', value: '' }]
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
        amount: parseFloat(newTransaction.amount),
        saleValue: newTransaction.saleValue ? parseFloat(newTransaction.saleValue) : null,
        supplierValue: newTransaction.supplierValue ? parseFloat(newTransaction.supplierValue) : null,
        commissionValue: newTransaction.commissionValue ? parseFloat(newTransaction.commissionValue) : null,
        products: newTransaction.products.filter(p => p.name && p.value)
      };

      const createdTransaction = await transactionsAPI.createTransaction(transactionData);
      setTransactions([createdTransaction, ...transactions]);
      
      // Reset form
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
        products: [{ name: '', value: '' }],
        // Enhanced fields
        clientReservationCode: '',
        departureCity: '',
        arrivalCity: '',
        productType: 'Passagem',
        supplierUsedMiles: false,
        supplierMilesQuantity: '',
        supplierMilesValue: '',
        supplierMilesProgram: '',
        airportTaxes: ''
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

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (transaction.client && transaction.client.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (transaction.reservationLocator && transaction.reservationLocator.toLowerCase().includes(searchTerm.toLowerCase()));
    
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
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
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
                        {categories.map(category => (
                          <SelectItem key={category} value={category}>{category}</SelectItem>
                        ))}
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div className="space-y-2">
                    <Label>Descrição *</Label>
                    <Input
                      placeholder="Descrição da transação"
                      value={newTransaction.description}
                      onChange={(e) => setNewTransaction({...newTransaction, description: e.target.value})}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Localizador da Reserva</Label>
                    <Input
                      placeholder="Ex: ABC123"
                      value={newTransaction.reservationLocator}
                      onChange={(e) => setNewTransaction({...newTransaction, reservationLocator: e.target.value})}
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
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label>Número do Cliente</Label>
                    <Input
                      placeholder="CLI0001"
                      value={newTransaction.clientNumber}
                      onChange={(e) => setNewTransaction({...newTransaction, clientNumber: e.target.value})}
                    />
                  </div>

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
                    <Label>Tipo de Produto</Label>
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
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
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

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
                  <div className="space-y-2">
                    <Label>Horário de Saída</Label>
                    <Input
                      type="time"
                      value={newTransaction.departureTime}
                      onChange={(e) => setNewTransaction({...newTransaction, departureTime: e.target.value})}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Horário de Chegada</Label>
                    <Input
                      type="time"
                      value={newTransaction.arrivalTime}
                      onChange={(e) => setNewTransaction({...newTransaction, arrivalTime: e.target.value})}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Origem</Label>
                    <Select value={newTransaction.originAirport} onValueChange={(value) => setNewTransaction({...newTransaction, originAirport: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Aeroporto origem" />
                      </SelectTrigger>
                      <SelectContent>
                        {airports.map(airport => (
                          <SelectItem key={airport.code} value={airport.code}>
                            {airport.code} - {airport.city}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Destino</Label>
                    <Select value={newTransaction.destinationAirport} onValueChange={(value) => setNewTransaction({...newTransaction, destinationAirport: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Aeroporto destino" />
                      </SelectTrigger>
                      <SelectContent>
                        {airports.map(airport => (
                          <SelectItem key={airport.code} value={airport.code}>
                            {airport.code} - {airport.city}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center space-x-2 mt-4">
                  <Checkbox
                    id="hasStops"
                    checked={newTransaction.hasStops}
                    onCheckedChange={(checked) => setNewTransaction({...newTransaction, hasStops: checked})}
                  />
                  <Label htmlFor="hasStops">Possui escalas</Label>
                </div>
              </div>

              {/* Financial Details */}
              <div className="lg:col-span-3 border-b pb-4 mb-4">
                <h3 className="text-lg font-semibold mb-4">Detalhes Financeiros</h3>
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
                    <Label>Valor do Fornecedor</Label>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0,00"
                      value={newTransaction.supplierValue}
                      onChange={(e) => setNewTransaction({...newTransaction, supplierValue: e.target.value})}
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

              {/* Supplier Miles Section */}
              <div className="lg:col-span-3 border-b pb-4 mb-4">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Plane className="mr-2 h-5 w-5 text-blue-500" />
                  Informações do Fornecedor
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="supplierUsedMiles"
                        checked={newTransaction.supplierUsedMiles}
                        onChange={(e) => setNewTransaction({...newTransaction, supplierUsedMiles: e.target.checked})}
                        className="rounded border-gray-300"
                      />
                      <Label htmlFor="supplierUsedMiles" className="flex items-center cursor-pointer">
                        ✈️ Fornecedor usou milhas
                      </Label>
                    </div>
                  </div>
                </div>

                {/* Campos de milhas (aparecem apenas quando "Fornecedor usou milhas" está marcado) */}
                {newTransaction.supplierUsedMiles && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="font-medium text-blue-800 mb-3 flex items-center">
                      ✈️ Detalhes das Milhas do Fornecedor
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="space-y-2">
                        <Label>Quantidade de Milhas</Label>
                        <Input
                          type="number"
                          placeholder="Ex: 25000"
                          value={newTransaction.supplierMilesQuantity}
                          onChange={(e) => setNewTransaction({...newTransaction, supplierMilesQuantity: e.target.value})}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Valor das Milhas (R$)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="Ex: 850,00"
                          value={newTransaction.supplierMilesValue}
                          onChange={(e) => setNewTransaction({...newTransaction, supplierMilesValue: e.target.value})}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Programa de Milhas</Label>
                        <Select value={newTransaction.supplierMilesProgram} onValueChange={(value) => setNewTransaction({...newTransaction, supplierMilesProgram: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="LATAM Pass">LATAM Pass</SelectItem>
                            <SelectItem value="Smiles">Smiles (GOL)</SelectItem>
                            <SelectItem value="TudoAzul">TudoAzul (Azul)</SelectItem>
                            <SelectItem value="Multiplus">Multiplus</SelectItem>
                            <SelectItem value="American Airlines">American Airlines</SelectItem>
                            <SelectItem value="United">United MileagePlus</SelectItem>
                            <SelectItem value="Delta">Delta SkyMiles</SelectItem>
                            <SelectItem value="Outros">Outros</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Taxas do Aeroporto (R$)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="Ex: 150,00"
                          value={newTransaction.airportTaxes}
                          onChange={(e) => setNewTransaction({...newTransaction, airportTaxes: e.target.value})}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Multiple Products */}
              <div className="lg:col-span-3">
                <h3 className="text-lg font-semibold mb-4">Produtos/Serviços</h3>
                {newTransaction.products.map((product, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 p-4 border rounded-lg">
                    <div className="space-y-2">
                      <Label>Produto/Serviço</Label>
                      <Input
                        placeholder="Ex: Passagem, Seguro, Transfer"
                        value={product.name}
                        onChange={(e) => updateProduct(index, 'name', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Valor</Label>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0,00"
                        value={product.value}
                        onChange={(e) => updateProduct(index, 'value', e.target.value)}
                      />
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
            placeholder="Buscar por descrição, cliente ou localizador..."
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
                      {transaction.reservationLocator && (
                        <Badge variant="outline">
                          <Plane className="h-3 w-3 mr-1" />
                          {transaction.reservationLocator}
                        </Badge>
                      )}
                    </div>
                    <h3 className="font-semibold text-gray-900">{transaction.description}</h3>
                    
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
                      {transaction.saleValue && <span>Venda: {formatCurrency(transaction.saleValue)}</span>}
                      {transaction.supplierValue && <span>Fornecedor: {formatCurrency(transaction.supplierValue)}</span>}
                      {transaction.commissionValue && (
                        <span>Comissão: {formatCurrency(transaction.commissionValue)} ({transaction.commissionPercentage?.toFixed(2)}%)</span>
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
                              {product.name}: {formatCurrency(product.value)}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
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

export default EnhancedTransactions;