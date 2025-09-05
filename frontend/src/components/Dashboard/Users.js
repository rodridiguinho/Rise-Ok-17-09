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
  Plus, 
  Search, 
  User,
  Edit,
  Trash2,
  Shield,
  Mail,
  Phone
} from 'lucide-react';
import { useToast } from '../../hooks/use-toast';
import { usersAPI } from '../../services/api';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Vendedor',
    phone: '',
    status: 'Ativo'
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const usersData = await usersAPI.getUsers();
      setUsers(usersData);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao carregar usuários",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const filteredUsers = users.filter(user => 
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddUser = async () => {
    if (!newUser.name || !newUser.email || !newUser.password) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios.",
      });
      return;
    }

    try {
      const createdUser = await usersAPI.createUser(newUser);
      setUsers([...users, createdUser]);
      
      setNewUser({
        name: '',
        email: '',
        password: '',
        role: 'Vendedor',
        phone: '',
        status: 'Ativo'
      });
      setIsAddModalOpen(false);
      
      toast({
        title: "Usuário adicionado",
        description: "O usuário foi criado com sucesso.",
      });
    } catch (error) {
      console.error('Error creating user:', error);
      const errorMessage = error.response?.data?.detail || "Erro ao criar usuário";
      toast({
        variant: "destructive",
        title: "Erro",
        description: errorMessage,
      });
    }
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setNewUser({ 
      name: user.name || '',
      email: user.email || '',
      password: '', // Don't prefill password
      role: user.role || 'Vendedor',
      phone: user.phone || '',
      status: user.status || 'Ativo'
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateUser = async () => {
    if (!newUser.name || !newUser.email) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios.",
      });
      return;
    }

    try {
      const updateData = { ...newUser };
      // Only include password if it's not empty
      if (!updateData.password) {
        delete updateData.password;
      }
      
      const updatedUser = await usersAPI.updateUser(selectedUser.id, updateData);
      setUsers(users.map(user => 
        user.id === selectedUser.id ? updatedUser : user
      ));
      
      setIsEditModalOpen(false);
      setSelectedUser(null);
      setNewUser({
        name: '',
        email: '',
        password: '',
        role: 'Vendedor',
        phone: '',
        status: 'Ativo'
      });
      
      toast({
        title: "Usuário atualizado",
        description: "As informações foram atualizadas com sucesso.",
      });
    } catch (error) {
      console.error('Error updating user:', error);
      const errorMessage = error.response?.data?.detail || "Erro ao atualizar usuário";
      toast({
        variant: "destructive",
        title: "Erro",
        description: errorMessage,
      });
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      await usersAPI.deleteUser(userId);
      setUsers(users.filter(user => user.id !== userId));
      toast({
        title: "Usuário removido",
        description: "O usuário foi removido com sucesso.",
      });
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao remover usuário",
      });
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'Administrador': return 'bg-red-100 text-red-800';
      case 'Gerente': return 'bg-purple-100 text-purple-800';
      case 'Vendedor': return 'bg-blue-100 text-blue-800';
      case 'Operador': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusBadgeColor = (status) => {
    return status === 'Ativo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Gestão de Usuários</h2>
          <div className="animate-pulse h-10 w-32 bg-gray-200 rounded"></div>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="animate-pulse">
              <div className="h-10 bg-gray-200 rounded mb-4"></div>
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
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
        <h2 className="text-2xl font-bold text-gray-900">Gestão de Usuários</h2>
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-pink-500 to-orange-400 hover:from-pink-600 hover:to-orange-500 text-white shadow-lg">
              <Plus className="mr-2 h-4 w-4" />
              Novo Usuário
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Criar Novo Usuário</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Nome Completo *</Label>
                <Input
                  placeholder="Nome do usuário"
                  value={newUser.name}
                  onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Email *</Label>
                <Input
                  type="email"
                  placeholder="email@empresa.com"
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Senha *</Label>
                <Input
                  type="password"
                  placeholder="Senha do usuário"
                  value={newUser.password}
                  onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Telefone</Label>
                <Input
                  placeholder="+55 11 99999-9999"
                  value={newUser.phone}
                  onChange={(e) => setNewUser({...newUser, phone: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Função</Label>
                <Select value={newUser.role} onValueChange={(value) => setNewUser({...newUser, role: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Administrador">Administrador</SelectItem>
                    <SelectItem value="Vendedor">Vendedor</SelectItem>
                    <SelectItem value="Operador">Operador</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={newUser.status} onValueChange={(value) => setNewUser({...newUser, status: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Ativo">Ativo</SelectItem>
                    <SelectItem value="Inativo">Inativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={handleAddUser} className="w-full">
                Criar Usuário
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
              placeholder="Buscar usuários..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Usuários ({filteredUsers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredUsers.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                    <User className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{user.name}</h3>
                    <div className="flex items-center space-x-4 mt-1">
                      <div className="flex items-center text-sm text-gray-500">
                        <Mail className="h-3 w-3 mr-1" />
                        {user.email}
                      </div>
                      {user.phone && (
                        <div className="flex items-center text-sm text-gray-500">
                          <Phone className="h-3 w-3 mr-1" />
                          {user.phone}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 mt-2">
                      <Badge className={getRoleBadgeColor(user.role)}>
                        <Shield className="h-3 w-3 mr-1" />
                        {user.role}
                      </Badge>
                      <Badge className={getStatusBadgeColor(user.status || 'Ativo')}>
                        {user.status || 'Ativo'}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="text-sm text-gray-900">
                    Criado em: {user.createdAt ? formatDate(user.createdAt) : 'N/A'}
                  </p>
                  <p className="text-sm text-gray-500">
                    Último login: {user.lastLogin || 'N/A'}
                  </p>
                  <div className="flex items-center space-x-2 mt-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-blue-600 hover:text-blue-700"
                      onClick={() => handleEditUser(user)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-red-600 hover:text-red-700"
                      onClick={() => handleDeleteUser(user.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            
            {filteredUsers.length === 0 && (
              <div className="text-center text-gray-500 py-8">
                <User className="mx-auto h-12 w-12 text-gray-300 mb-2" />
                <p>Nenhum usuário encontrado</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Usuário</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nome Completo *</Label>
              <Input
                placeholder="Nome do usuário"
                value={newUser.name}
                onChange={(e) => setNewUser({...newUser, name: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Email *</Label>
              <Input
                type="email"
                placeholder="email@empresa.com"
                value={newUser.email}
                onChange={(e) => setNewUser({...newUser, email: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Telefone</Label>
              <Input
                placeholder="+55 11 99999-9999"
                value={newUser.phone}
                onChange={(e) => setNewUser({...newUser, phone: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Função</Label>
              <Select value={newUser.role} onValueChange={(value) => setNewUser({...newUser, role: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Administrador">Administrador</SelectItem>
                  <SelectItem value="Vendedor">Vendedor</SelectItem>
                  <SelectItem value="Operador">Operador</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={newUser.status} onValueChange={(value) => setNewUser({...newUser, status: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Ativo">Ativo</SelectItem>
                  <SelectItem value="Inativo">Inativo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button onClick={handleUpdateUser} className="w-full">
              Atualizar Usuário
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Users;