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
import { Badge } from '../ui/badge';
import { 
  Plus, 
  Search, 
  Users,
  Edit,
  Trash2,
  Phone,
  Mail,
  MapPin,
  Hash
} from 'lucide-react';
import { useToast } from '../../hooks/use-toast';
import { clientsAPI } from '../../services/api';

const Clients = () => {
  const [clients, setClients] = useState([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [newClient, setNewClient] = useState({
    clientNumber: '',
    name: '',
    email: '',
    phone: '',
    document: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    status: 'Ativo'
  });

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const clientsData = await clientsAPI.getClients();
      setClients(clientsData);
    } catch (error) {
      console.error('Error fetching clients:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao carregar clientes",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const generateClientNumber = () => {
    const lastNumber = Math.max(...clients.map(c => parseInt(c.clientNumber.replace('CLI', '')))) + 1;
    return `CLI${lastNumber.toString().padStart(3, '0')}`;
  };

  const filteredClients = clients.filter(client => 
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.clientNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.cpf.includes(searchTerm)
  );

  const handleAddClient = async () => {
    if (!newClient.name || !newClient.email) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios.",
      });
      return;
    }

    try {
      const createdClient = await clientsAPI.createClient(newClient);
      setClients([...clients, createdClient]);
      
      setNewClient({
        clientNumber: '',
        name: '',
        email: '',
        phone: '',
        document: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        status: 'Ativo'
      });
      
      setIsAddModalOpen(false);
      
      toast({
        title: "Cliente adicionado",
        description: "O cliente foi adicionado com sucesso.",
      });
    } catch (error) {
      console.error('Error creating client:', error);
      const errorMessage = error.response?.data?.detail || "Erro ao criar cliente";
      toast({
        variant: "destructive",
        title: "Erro",
        description: errorMessage,
      });
    }
  };

  const handleEditClient = (client) => {
    setSelectedClient(client);
    setNewClient({ ...client });
    setIsEditModalOpen(true);
  };

  const handleUpdateClient = async () => {
    if (!newClient.name || !newClient.email) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios.",
      });
      return;
    }

    try {
      const updatedClient = await clientsAPI.updateClient(selectedClient.id, newClient);
      setClients(clients.map(client => 
        client.id === selectedClient.id ? updatedClient : client
      ));
      
      setIsEditModalOpen(false);
      setSelectedClient(null);
      setNewClient({
        clientNumber: '',
        name: '',
        email: '',
        phone: '',
        document: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        status: 'Ativo'
      });
      
      toast({
        title: "Cliente atualizado",
        description: "As informações foram atualizadas com sucesso.",
      });
    } catch (error) {
      console.error('Error updating client:', error);
      const errorMessage = error.response?.data?.detail || "Erro ao atualizar cliente";
      toast({
        variant: "destructive",
        title: "Erro",
        description: errorMessage,
      });
    }
  };

  const handleDeleteClient = async (id) => {
    try {
      await clientsAPI.deleteClient(id);
      setClients(clients.filter(client => client.id !== id));
      toast({
        title: "Cliente removido",
        description: "O cliente foi removido com sucesso.",
      });
    } catch (error) {
      console.error('Error deleting client:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao remover cliente",
      });
    }
  };

  const getStatusBadgeColor = (status) => {
    return status === 'Ativo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Gestão de Clientes</h2>
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-pink-500 to-orange-400 hover:from-pink-600 hover:to-orange-500 text-white shadow-lg">
              <Plus className="mr-2 h-4 w-4" />
              Novo Cliente
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Cadastrar Novo Cliente</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              <div className="space-y-2">
                <Label>Número do Cliente</Label>
                <Input
                  placeholder="Deixe vazio para gerar automaticamente"
                  value={newClient.clientNumber}
                  onChange={(e) => setNewClient({...newClient, clientNumber: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Nome Completo *</Label>
                <Input
                  placeholder="Nome do cliente"
                  value={newClient.name}
                  onChange={(e) => setNewClient({...newClient, name: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Email *</Label>
                <Input
                  type="email"
                  placeholder="cliente@email.com"
                  value={newClient.email}
                  onChange={(e) => setNewClient({...newClient, email: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Telefone</Label>
                <Input
                  placeholder="+55 11 99999-9999"
                  value={newClient.phone}
                  onChange={(e) => setNewClient({...newClient, phone: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label>CPF</Label>
                <Input
                  placeholder="123.456.789-00"
                  value={newClient.cpf}
                  onChange={(e) => setNewClient({...newClient, cpf: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Endereço</Label>
                <Textarea
                  placeholder="Endereço completo"
                  value={newClient.address}
                  onChange={(e) => setNewClient({...newClient, address: e.target.value})}
                  rows={2}
                />
              </div>

              <Button onClick={handleAddClient} className="w-full">
                Cadastrar Cliente
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
              placeholder="Buscar clientes por nome, email, número ou CPF..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Clients List */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Clientes ({filteredClients.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredClients.map((client) => (
              <div key={client.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="font-medium text-gray-900">{client.name}</h3>
                      <Badge className="bg-gray-100 text-gray-800">
                        <Hash className="h-3 w-3 mr-1" />
                        {client.clientNumber}
                      </Badge>
                      <Badge className={getStatusBadgeColor(client.status)}>
                        {client.status}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-500">
                      <div className="flex items-center">
                        <Mail className="h-3 w-3 mr-1" />
                        {client.email}
                      </div>
                      {client.phone && (
                        <div className="flex items-center">
                          <Phone className="h-3 w-3 mr-1" />
                          {client.phone}
                        </div>
                      )}
                      {client.cpf && (
                        <div className="flex items-center">
                          <span className="mr-1">CPF:</span>
                          {client.cpf}
                        </div>
                      )}
                      {client.address && (
                        <div className="flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          {client.address.length > 30 ? `${client.address.substring(0, 30)}...` : client.address}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    Total em compras: {formatCurrency(client.totalPurchases)}
                  </p>
                  <p className="text-sm text-gray-500">
                    Última compra: {client.lastPurchase === '-' ? 'Nunca' : formatDate(client.lastPurchase)}
                  </p>
                  <p className="text-sm text-gray-500">
                    Cliente desde: {formatDate(client.createdAt)}
                  </p>
                  <div className="flex items-center space-x-2 mt-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-blue-600 hover:text-blue-700"
                      onClick={() => handleEditClient(client)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-red-600 hover:text-red-700"
                      onClick={() => handleDeleteClient(client.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            
            {filteredClients.length === 0 && (
              <div className="text-center text-gray-500 py-8">
                <Users className="mx-auto h-12 w-12 text-gray-300 mb-2" />
                <p>Nenhum cliente encontrado</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Editar Cliente</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            <div className="space-y-2">
              <Label>Número do Cliente</Label>
              <Input
                placeholder="Número do cliente"
                value={newClient.clientNumber}
                onChange={(e) => setNewClient({...newClient, clientNumber: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Nome Completo *</Label>
              <Input
                placeholder="Nome do cliente"
                value={newClient.name}
                onChange={(e) => setNewClient({...newClient, name: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Email *</Label>
              <Input
                type="email"
                placeholder="cliente@email.com"
                value={newClient.email}
                onChange={(e) => setNewClient({...newClient, email: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Telefone</Label>
              <Input
                placeholder="+55 11 99999-9999"
                value={newClient.phone}
                onChange={(e) => setNewClient({...newClient, phone: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label>CPF</Label>
              <Input
                placeholder="123.456.789-00"
                value={newClient.cpf}
                onChange={(e) => setNewClient({...newClient, cpf: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Endereço</Label>
              <Textarea
                placeholder="Endereço completo"
                value={newClient.address}
                onChange={(e) => setNewClient({...newClient, address: e.target.value})}
                rows={2}
              />
            </div>

            <Button onClick={handleUpdateClient} className="w-full">
              Atualizar Cliente
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Clients;