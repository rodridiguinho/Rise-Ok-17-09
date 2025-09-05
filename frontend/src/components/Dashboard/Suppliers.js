import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
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
import { 
  Plus, 
  Search, 
  Building2,
  Edit,
  Trash2,
  Phone,
  Mail,
  MapPin,
  Hash,
  Globe
} from 'lucide-react';
import { useToast } from '../../hooks/use-toast';

const Suppliers = () => {
  const [suppliers, setSuppliers] = useState([
    {
      id: '1',
      supplierNumber: 'FOR001',
      name: 'Hotel Ibis São Paulo',
      email: 'reservas@ibis.com.br',
      phone: '+55 11 3333-4444',
      cnpj: '12.345.678/0001-90',
      website: 'www.ibis.com.br',
      address: 'Av. Paulista, 1000 - São Paulo, SP',
      category: 'Hotel',
      contact: 'Ana Silva',
      totalPayments: 25000.00,
      lastPayment: '2025-01-05',
      status: 'Ativo',
      createdAt: '2024-01-10'
    },
    {
      id: '2',
      supplierNumber: 'FOR002',
      name: 'LATAM Airlines',
      email: 'corporativo@latam.com',
      phone: '+55 11 4004-2121',
      cnpj: '02.012.862/0001-60',
      website: 'www.latam.com',
      address: 'Rua Boa Vista, 254 - São Paulo, SP',
      category: 'Companhia Aérea',
      contact: 'Carlos Santos',
      totalPayments: 89500.00,
      lastPayment: '2025-01-04',
      status: 'Ativo',
      createdAt: '2024-01-05'
    },
    {
      id: '3',
      supplierNumber: 'FOR003',
      name: 'Turismo ABC Ltda',
      email: 'contato@turismoabc.com.br',
      phone: '+55 11 5555-6666',
      cnpj: '98.765.432/0001-10',
      website: 'www.turismoabc.com.br',
      address: 'Rua Augusta, 500 - São Paulo, SP',
      category: 'Operadora',
      contact: 'Maria Oliveira',
      totalPayments: 15750.00,
      lastPayment: '2024-12-30',
      status: 'Inativo',
      createdAt: '2024-02-15'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const { toast } = useToast();

  const [newSupplier, setNewSupplier] = useState({
    supplierNumber: '',
    name: '',
    email: '',
    phone: '',
    cnpj: '',
    website: '',
    address: '',
    category: 'Hotel',
    contact: '',
    status: 'Ativo'
  });

  const supplierCategories = [
    'Hotel',
    'Companhia Aérea',
    'Operadora',
    'Seguradora',
    'Restaurante',
    'Transporte',
    'Passeios',
    'Cruzeiro',
    'Locadora',
    'Outros'
  ];

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const generateSupplierNumber = () => {
    const lastNumber = Math.max(...suppliers.map(s => parseInt(s.supplierNumber.replace('FOR', '')))) + 1;
    return `FOR${lastNumber.toString().padStart(3, '0')}`;
  };

  const filteredSuppliers = suppliers.filter(supplier => 
    supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.supplierNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (supplier.cnpj && supplier.cnpj.includes(searchTerm))
  );

  const handleAddSupplier = () => {
    if (!newSupplier.name || !newSupplier.email) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios.",
      });
      return;
    }

    const supplier = {
      id: Date.now().toString(),
      supplierNumber: newSupplier.supplierNumber || generateSupplierNumber(),
      ...newSupplier,
      totalPayments: 0,
      lastPayment: '-',
      createdAt: new Date().toISOString().split('T')[0]
    };

    setSuppliers([...suppliers, supplier]);
    setNewSupplier({
      supplierNumber: '',
      name: '',
      email: '',
      phone: '',
      cnpj: '',
      website: '',
      address: '',
      category: 'Hotel',
      contact: '',
      status: 'Ativo'
    });
    setIsAddModalOpen(false);
    
    toast({
      title: "Fornecedor adicionado",
      description: "O fornecedor foi cadastrado com sucesso.",
    });
  };

  const handleEditSupplier = (supplier) => {
    setSelectedSupplier(supplier);
    setNewSupplier({ ...supplier });
    setIsEditModalOpen(true);
  };

  const handleUpdateSupplier = () => {
    setSuppliers(suppliers.map(supplier => 
      supplier.id === selectedSupplier.id ? { ...supplier, ...newSupplier } : supplier
    ));
    
    setIsEditModalOpen(false);
    setSelectedSupplier(null);
    setNewSupplier({
      supplierNumber: '',
      name: '',
      email: '',
      phone: '',
      cnpj: '',
      website: '',
      address: '',
      category: 'Hotel',
      contact: '',
      status: 'Ativo'
    });
    
    toast({
      title: "Fornecedor atualizado",
      description: "As informações foram atualizadas com sucesso.",
    });
  };

  const handleDeleteSupplier = (id) => {
    setSuppliers(suppliers.filter(supplier => supplier.id !== id));
    toast({
      title: "Fornecedor removido",
      description: "O fornecedor foi removido com sucesso.",
    });
  };

  const getStatusBadgeColor = (status) => {
    return status === 'Ativo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  const getCategoryBadgeColor = (category) => {
    const colors = {
      'Hotel': 'bg-blue-100 text-blue-800',
      'Companhia Aérea': 'bg-purple-100 text-purple-800',
      'Operadora': 'bg-orange-100 text-orange-800',
      'Seguradora': 'bg-indigo-100 text-indigo-800',
      'Restaurante': 'bg-pink-100 text-pink-800',
      'Transporte': 'bg-yellow-100 text-yellow-800',
      'Passeios': 'bg-teal-100 text-teal-800',
      'Cruzeiro': 'bg-cyan-100 text-cyan-800',
      'Locadora': 'bg-lime-100 text-lime-800',
      'Outros': 'bg-gray-100 text-gray-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Gestão de Fornecedores</h2>
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-indigo-600 hover:bg-indigo-700">
              <Plus className="mr-2 h-4 w-4" />
              Novo Fornecedor
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Cadastrar Novo Fornecedor</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              <div className="space-y-2">
                <Label>Número do Fornecedor</Label>
                <Input
                  placeholder="Deixe vazio para gerar automaticamente"
                  value={newSupplier.supplierNumber}
                  onChange={(e) => setNewSupplier({...newSupplier, supplierNumber: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Nome da Empresa *</Label>
                <Input
                  placeholder="Nome do fornecedor"
                  value={newSupplier.name}
                  onChange={(e) => setNewSupplier({...newSupplier, name: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Email *</Label>
                <Input
                  type="email"
                  placeholder="contato@fornecedor.com"
                  value={newSupplier.email}
                  onChange={(e) => setNewSupplier({...newSupplier, email: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Telefone</Label>
                <Input
                  placeholder="+55 11 99999-9999"
                  value={newSupplier.phone}
                  onChange={(e) => setNewSupplier({...newSupplier, phone: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label>CNPJ</Label>
                <Input
                  placeholder="12.345.678/0001-90"
                  value={newSupplier.cnpj}
                  onChange={(e) => setNewSupplier({...newSupplier, cnpj: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Website</Label>
                <Input
                  placeholder="www.fornecedor.com"
                  value={newSupplier.website}
                  onChange={(e) => setNewSupplier({...newSupplier, website: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Categoria</Label>
                <Select value={newSupplier.category} onValueChange={(value) => setNewSupplier({...newSupplier, category: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {supplierCategories.map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Pessoa de Contato</Label>
                <Input
                  placeholder="Nome do contato"
                  value={newSupplier.contact}
                  onChange={(e) => setNewSupplier({...newSupplier, contact: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Endereço</Label>
                <Textarea
                  placeholder="Endereço completo"
                  value={newSupplier.address}
                  onChange={(e) => setNewSupplier({...newSupplier, address: e.target.value})}
                  rows={2}
                />
              </div>

              <Button onClick={handleAddSupplier} className="w-full">
                Cadastrar Fornecedor
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar fornecedores por nome, email, número, categoria ou CNPJ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Suppliers List */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Fornecedores ({filteredSuppliers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredSuppliers.map((supplier) => (
              <div key={supplier.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                    <Building2 className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="font-medium text-gray-900">{supplier.name}</h3>
                      <Badge className="bg-gray-100 text-gray-800">
                        <Hash className="h-3 w-3 mr-1" />
                        {supplier.supplierNumber}
                      </Badge>
                      <Badge className={getCategoryBadgeColor(supplier.category)}>
                        {supplier.category}
                      </Badge>
                      <Badge className={getStatusBadgeColor(supplier.status)}>
                        {supplier.status}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-500">
                      <div className="flex items-center">
                        <Mail className="h-3 w-3 mr-1" />
                        {supplier.email}
                      </div>
                      {supplier.phone && (
                        <div className="flex items-center">
                          <Phone className="h-3 w-3 mr-1" />
                          {supplier.phone}
                        </div>
                      )}
                      {supplier.cnpj && (
                        <div className="flex items-center">
                          <span className="mr-1">CNPJ:</span>
                          {supplier.cnpj}
                        </div>
                      )}
                      {supplier.website && (
                        <div className="flex items-center">
                          <Globe className="h-3 w-3 mr-1" />
                          {supplier.website}
                        </div>
                      )}
                      {supplier.contact && (
                        <div className="flex items-center">
                          <span className="mr-1">Contato:</span>
                          {supplier.contact}
                        </div>
                      )}
                      {supplier.address && (
                        <div className="flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          {supplier.address.length > 30 ? `${supplier.address.substring(0, 30)}...` : supplier.address}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    Total pago: {formatCurrency(supplier.totalPayments)}
                  </p>
                  <p className="text-sm text-gray-500">
                    Último pagamento: {supplier.lastPayment === '-' ? 'Nunca' : formatDate(supplier.lastPayment)}
                  </p>
                  <p className="text-sm text-gray-500">
                    Cadastrado em: {formatDate(supplier.createdAt)}
                  </p>
                  <div className="flex items-center space-x-2 mt-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-blue-600 hover:text-blue-700"
                      onClick={() => handleEditSupplier(supplier)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-red-600 hover:text-red-700"
                      onClick={() => handleDeleteSupplier(supplier.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            
            {filteredSuppliers.length === 0 && (
              <div className="text-center text-gray-500 py-8">
                <Building2 className="mx-auto h-12 w-12 text-gray-300 mb-2" />
                <p>Nenhum fornecedor encontrado</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Editar Fornecedor</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            <div className="space-y-2">
              <Label>Número do Fornecedor</Label>
              <Input
                placeholder="Número do fornecedor"
                value={newSupplier.supplierNumber}
                onChange={(e) => setNewSupplier({...newSupplier, supplierNumber: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Nome da Empresa *</Label>
              <Input
                placeholder="Nome do fornecedor"
                value={newSupplier.name}
                onChange={(e) => setNewSupplier({...newSupplier, name: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Email *</Label>
              <Input
                type="email"
                placeholder="contato@fornecedor.com"
                value={newSupplier.email}
                onChange={(e) => setNewSupplier({...newSupplier, email: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Telefone</Label>
              <Input
                placeholder="+55 11 99999-9999"
                value={newSupplier.phone}
                onChange={(e) => setNewSupplier({...newSupplier, phone: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label>CNPJ</Label>
              <Input
                placeholder="12.345.678/0001-90"
                value={newSupplier.cnpj}
                onChange={(e) => setNewSupplier({...newSupplier, cnpj: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Website</Label>
              <Input
                placeholder="www.fornecedor.com"
                value={newSupplier.website}
                onChange={(e) => setNewSupplier({...newSupplier, website: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Categoria</Label>
              <Select value={newSupplier.category} onValueChange={(value) => setNewSupplier({...newSupplier, category: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {supplierCategories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Pessoa de Contato</Label>
              <Input
                placeholder="Nome do contato"
                value={newSupplier.contact}
                onChange={(e) => setNewSupplier({...newSupplier, contact: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Endereço</Label>
              <Textarea
                placeholder="Endereço completo"
                value={newSupplier.address}
                onChange={(e) => setNewSupplier({...newSupplier, address: e.target.value})}
                rows={2}
              />
            </div>

            <Button onClick={handleUpdateSupplier} className="w-full">
              Atualizar Fornecedor
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Suppliers;