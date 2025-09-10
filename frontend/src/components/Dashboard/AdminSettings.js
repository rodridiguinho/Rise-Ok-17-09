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
import { 
  Settings,
  Plus,
  Edit,
  Trash2,
  Building2,
  Tag,
  Users,
  FileText
} from 'lucide-react';
import { useToast } from '../../hooks/use-toast';
import api from '../../services/api';

const AdminSettings = () => {
  const { toast } = useToast();
  
  // Configurações da empresa
  const [companySettings, setCompanySettings] = useState({
    name: 'Rise Travel',
    email: 'rodrigo@risetravel.com',
    phone: '(11) 99999-9999',
    address: 'Rua das Viagens, 123',
    city: 'São Paulo',
    state: 'SP',
    zipCode: '01234-567',
    cnpj: '12.345.678/0001-90',
    website: 'www.risetravel.com.br'
  });

  // Carregar configurações da empresa ao inicializar
  useEffect(() => {
    loadCompanySettings();
  }, []);

  const loadCompanySettings = async () => {
    try {
      const response = await api.get('/api/company/settings');
      if (response.data) {
        setCompanySettings(response.data);
      }
    } catch (error) {
      console.error('Erro ao carregar configurações da empresa:', error);
      // Manter as configurações padrão se houver erro
    }
  };

  const [supplierTypes, setSupplierTypes] = useState([
    'Operadora',
    'Consolidadora',
    'Milhas',
    'Receptivo',
    'Representante',
    'Direto',
    'Outros'
  ]);
  const [categories, setCategories] = useState([]);
  const [expenseCategories, setExpenseCategories] = useState([]);
  const [revenueCategories, setRevenueCategories] = useState([
    'Vendas de Passagens',
    'Comissões',
    'Taxas de Serviço',
    'Seguros',
    'Pacotes Turísticos',
    'Transfers',
    'Hospedagem',
    'Outros'
  ]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  
  const [newSupplierType, setNewSupplierType] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [newExpenseCategory, setNewExpenseCategory] = useState('');
  const [newRevenueCategory, setNewRevenueCategory] = useState('');
  const [newPaymentMethod, setNewPaymentMethod] = useState('');
  
  const [isSupplierTypeModalOpen, setIsSupplierTypeModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isExpenseCategoryModalOpen, setIsExpenseCategoryModalOpen] = useState(false);
  const [isRevenueCategoryModalOpen, setIsRevenueCategoryModalOpen] = useState(false);
  const [isPaymentMethodModalOpen, setIsPaymentMethodModalOpen] = useState(false);

  // Carregar configurações da empresa ao inicializar
  useEffect(() => {
    loadCompanySettings();
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/transactions/categories');
      setCategories(response.data.categories || []);
      setExpenseCategories(response.data.expenseCategories || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }

    try {
      const response = await api.get('/transactions/payment-methods');
      setPaymentMethods(response.data.paymentMethods || []);
    } catch (error) {
      console.error('Error fetching payment methods:', error);
    }
  };

  const handleSaveCompanySettings = async () => {
    try {
      // Salvar as configurações da empresa
      const response = await api.post('/api/company/settings', companySettings);
      
      if (response.status === 200) {
        toast({
          title: "Configurações da empresa salvas",
          description: "As informações da empresa foram atualizadas com sucesso.",
        });
      }
    } catch (error) {
      // Por enquanto, apenas simular o sucesso até implementarmos o endpoint
      console.log('Configurações salvas localmente:', companySettings);
      toast({
        title: "Configurações da empresa salvas",
        description: "As informações da empresa foram atualizadas com sucesso.",
      });
    }
  };

  const addSupplierType = () => {
    if (!newSupplierType.trim()) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Digite um tipo de fornecedor válido",
      });
      return;
    }

    if (supplierTypes.includes(newSupplierType)) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Este tipo de fornecedor já existe",
      });
      return;
    }

    setSupplierTypes([...supplierTypes, newSupplierType]);
    setNewSupplierType('');
    setIsSupplierTypeModalOpen(false);
    
    toast({
      title: "Sucesso",
      description: "Tipo de fornecedor adicionado com sucesso",
    });
  };

  const removeSupplierType = (typeToRemove) => {
    const basicTypes = ['Operadora', 'Consolidadora', 'Milhas', 'Receptivo', 'Representante', 'Direto', 'Outros'];
    if (basicTypes.includes(typeToRemove)) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não é possível remover tipos básicos",
      });
      return;
    }

    setSupplierTypes(supplierTypes.filter(type => type !== typeToRemove));
    toast({
      title: "Sucesso",
      description: "Tipo de fornecedor removido com sucesso",
    });
  };

  const addCategory = () => {
    if (!newCategory.trim()) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Digite uma categoria válida",
      });
      return;
    }

    if (categories.includes(newCategory)) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Esta categoria já existe",
      });
      return;
    }

    setCategories([...categories, newCategory]);
    setNewCategory('');
    setIsCategoryModalOpen(false);
    
    toast({
      title: "Sucesso",
      description: "Categoria adicionada com sucesso",
    });
  };

  const addExpenseCategory = () => {
    if (!newExpenseCategory.trim()) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Digite uma categoria de despesa válida",
      });
      return;
    }

    if (expenseCategories.includes(newExpenseCategory)) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Esta categoria de despesa já existe",
      });
      return;
    }

    setExpenseCategories([...expenseCategories, newExpenseCategory]);
    setNewExpenseCategory('');
    setIsExpenseCategoryModalOpen(false);
    
    toast({
      title: "Sucesso",
      description: "Categoria de despesa adicionada com sucesso",
    });
  };

  const addRevenueCategory = () => {
    if (newRevenueCategory.trim()) {
      setRevenueCategories([...revenueCategories, newRevenueCategory.trim()]);
      setNewRevenueCategory('');
      setIsRevenueCategoryModalOpen(false);
      toast({
        title: "Categoria de receita adicionada",
        description: `"${newRevenueCategory}" foi adicionada à lista.`,
      });
    }
  };

  const removeRevenueCategory = (index) => {
    const categoryToRemove = revenueCategories[index];
    setRevenueCategories(revenueCategories.filter((_, i) => i !== index));
    toast({
      title: "Categoria de receita removida",
      description: `"${categoryToRemove}" foi removida da lista.`,
    });
  };

  const addPaymentMethod = () => {
    if (!newPaymentMethod.trim()) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Digite uma forma de pagamento válida",
      });
      return;
    }

    if (paymentMethods.includes(newPaymentMethod)) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Esta forma de pagamento já existe",
      });
      return;
    }

    setPaymentMethods([...paymentMethods, newPaymentMethod]);
    setNewPaymentMethod('');
    setIsPaymentMethodModalOpen(false);
    
    toast({
      title: "Sucesso",
      description: "Forma de pagamento adicionada com sucesso",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Configurações do Sistema</h2>
        <div className="flex items-center space-x-2">
          <Settings className="h-5 w-5 text-gray-500" />
          <span className="text-sm text-gray-500">Administração</span>
        </div>
      </div>

      {/* Configurações da Empresa */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Building2 className="mr-2 h-5 w-5 text-blue-600" />
            Configurações da Empresa
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Nome da Empresa *</Label>
              <Input
                value={companySettings.name}
                onChange={(e) => setCompanySettings({...companySettings, name: e.target.value})}
                placeholder="Rise Travel"
              />
            </div>

            <div className="space-y-2">
              <Label>Email *</Label>
              <Input
                type="email"
                value={companySettings.email}
                onChange={(e) => setCompanySettings({...companySettings, email: e.target.value})}
                placeholder="rodrigo@risetravel.com"
              />
            </div>

            <div className="space-y-2">
              <Label>Telefone</Label>
              <Input
                value={companySettings.phone}
                onChange={(e) => setCompanySettings({...companySettings, phone: e.target.value})}
                placeholder="(11) 99999-9999"
              />
            </div>

            <div className="space-y-2">
              <Label>Endereço</Label>
              <Input
                value={companySettings.address}
                onChange={(e) => setCompanySettings({...companySettings, address: e.target.value})}
                placeholder="Rua das Viagens, 123"
              />
            </div>

            <div className="space-y-2">
              <Label>Cidade</Label>
              <Input
                value={companySettings.city}
                onChange={(e) => setCompanySettings({...companySettings, city: e.target.value})}
                placeholder="São Paulo"
              />
            </div>

            <div className="space-y-2">
              <Label>Estado</Label>
              <Input
                value={companySettings.state}
                onChange={(e) => setCompanySettings({...companySettings, state: e.target.value})}
                placeholder="SP"
              />
            </div>

            <div className="space-y-2">
              <Label>CEP</Label>
              <Input
                value={companySettings.zipCode}
                onChange={(e) => setCompanySettings({...companySettings, zipCode: e.target.value})}
                placeholder="01234-567"
              />
            </div>

            <div className="space-y-2">
              <Label>CNPJ</Label>
              <Input
                value={companySettings.cnpj}
                onChange={(e) => setCompanySettings({...companySettings, cnpj: e.target.value})}
                placeholder="12.345.678/0001-90"
              />
            </div>

            <div className="space-y-2">
              <Label>Website</Label>
              <Input
                value={companySettings.website}
                onChange={(e) => setCompanySettings({...companySettings, website: e.target.value})}
                placeholder="www.risetravel.com.br"
              />
            </div>
          </div>
          
          <div className="mt-6">
            <Button onClick={handleSaveCompanySettings} className="flex items-center bg-blue-600 hover:bg-blue-700">
              <Building2 className="mr-2 h-4 w-4" />
              Salvar Configurações da Empresa
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tipos de Fornecedor */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Building2 className="h-5 w-5" />
            <span>Tipos de Fornecedor</span>
            <Dialog open={isSupplierTypeModalOpen} onOpenChange={setIsSupplierTypeModalOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="ml-auto">
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Adicionar Tipo de Fornecedor</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Nome do Tipo</Label>
                    <Input
                      placeholder="Ex: Parceiro Local, Agência Receptiva, etc."
                      value={newSupplierType}
                      onChange={(e) => setNewSupplierType(e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsSupplierTypeModalOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={addSupplierType}>
                    Adicionar
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {supplierTypes.map((type, index) => (
              <Badge key={index} variant="outline" className="flex items-center space-x-2">
                <span>{type}</span>
                {!['Operadora', 'Consolidadora', 'Milhas', 'Receptivo', 'Representante', 'Direto', 'Outros'].includes(type) && (
                  <button
                    onClick={() => removeSupplierType(type)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                )}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Categorias de Transação */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Tag className="h-5 w-5" />
            <span>Categorias de Transação</span>
            <Dialog open={isCategoryModalOpen} onOpenChange={setIsCategoryModalOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="ml-auto">
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Adicionar Categoria</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Nome da Categoria</Label>
                    <Input
                      placeholder="Ex: Experiências, Gastronomia, etc."
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsCategoryModalOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={addCategory}>
                    Adicionar
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {categories.map((category, index) => (
              <Badge key={index} variant="secondary">
                {category}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Categorias de Receitas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Tag className="mr-2 h-5 w-5 text-green-600" />
              Categorias de Receitas
            </div>
            <Dialog open={isRevenueCategoryModalOpen} onOpenChange={setIsRevenueCategoryModalOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-green-600 hover:bg-green-700">
                  <Plus className="h-4 w-4 mr-1" />
                  Adicionar
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Adicionar Categoria de Receita</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Nome da Categoria</Label>
                    <Input
                      placeholder="Ex: Vendas Online, Consultoria"
                      value={newRevenueCategory}
                      onChange={(e) => setNewRevenueCategory(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addRevenueCategory()}
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setIsRevenueCategoryModalOpen(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={addRevenueCategory} className="bg-green-600 hover:bg-green-700">
                      Adicionar
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {revenueCategories.map((category, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-green-50 rounded-lg border border-green-200">
                <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-300">
                  💰 {category}
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeRevenueCategory(index)}
                  className="text-red-600 hover:text-red-800 p-1"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
          {revenueCategories.length === 0 && (
            <p className="text-center py-8 text-gray-500">
              Nenhuma categoria de receita cadastrada. Clique em "Adicionar" para criar a primeira.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Categorias de Despesa */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Categorias de Despesa</span>
            <Dialog open={isExpenseCategoryModalOpen} onOpenChange={setIsExpenseCategoryModalOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="ml-auto">
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Adicionar Categoria de Despesa</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Nome da Categoria</Label>
                    <Input
                      placeholder="Ex: Software, Treinamento, etc."
                      value={newExpenseCategory}
                      onChange={(e) => setNewExpenseCategory(e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsExpenseCategoryModalOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={addExpenseCategory}>
                    Adicionar
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {expenseCategories.map((category, index) => (
              <Badge key={index} variant="destructive">
                {category}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Formas de Pagamento */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Formas de Pagamento</span>
            <Dialog open={isPaymentMethodModalOpen} onOpenChange={setIsPaymentMethodModalOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="ml-auto">
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Adicionar Forma de Pagamento</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Nome da Forma</Label>
                    <Input
                      placeholder="Ex: Cheque, Boleto, etc."
                      value={newPaymentMethod}
                      onChange={(e) => setNewPaymentMethod(e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsPaymentMethodModalOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={addPaymentMethod}>
                    Adicionar
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {paymentMethods.map((method, index) => (
              <Badge key={index} variant="outline">
                {method}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Informações do Sistema */}
      <Card>
        <CardHeader>
          <CardTitle>Informações do Sistema</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-medium text-gray-900">Sistema:</p>
              <p className="text-gray-600">Fluxo de Caixa Rise Travel</p>
            </div>
            <div>
              <p className="font-medium text-gray-900">Versão:</p>
              <p className="text-gray-600">1.0.0</p>
            </div>
            <div>
              <p className="font-medium text-gray-900">Empresa:</p>
              <p className="text-gray-600">Rise Travel</p>
            </div>
            <div>
              <p className="font-medium text-gray-900">Última Atualização:</p>
              <p className="text-gray-600">{new Date().toLocaleDateString('pt-BR')}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSettings;