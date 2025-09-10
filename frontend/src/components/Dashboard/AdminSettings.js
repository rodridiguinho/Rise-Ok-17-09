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
  const [paymentMethods, setPaymentMethods] = useState([]);
  
  const [newSupplierType, setNewSupplierType] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [newExpenseCategory, setNewExpenseCategory] = useState('');
  const [newPaymentMethod, setNewPaymentMethod] = useState('');
  
  const [isSupplierTypeModalOpen, setIsSupplierTypeModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isExpenseCategoryModalOpen, setIsExpenseCategoryModalOpen] = useState(false);
  const [isPaymentMethodModalOpen, setIsPaymentMethodModalOpen] = useState(false);
  
  const { toast } = useToast();

  useEffect(() => {
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