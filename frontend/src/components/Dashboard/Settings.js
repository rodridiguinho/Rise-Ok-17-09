import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Textarea } from '../ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { 
  Settings as SettingsIcon, 
  User, 
  Bell, 
  Shield, 
  Database,
  Palette,
  Save,
  RefreshCw
} from 'lucide-react';
import { useToast } from '../../hooks/use-toast';

const Settings = () => {
  const [userSettings, setUserSettings] = useState({
    companyName: 'AgentePro Turismo',
    email: 'rorigo@risetravel.com.br',
    phone: '+55 11 99999-9999',
    address: 'Rua das Flores, 123 - São Paulo, SP',
    language: 'pt-BR',
    currency: 'BRL',
    timezone: 'America/Sao_Paulo'
  });

  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    pushNotifications: false,
    dailyReport: true,
    transactionAlerts: true,
    lowCashAlert: true
  });

  const [preferences, setPreferences] = useState({
    theme: 'light',
    autoExport: false,
    backupFrequency: 'weekly',
    decimalPlaces: 2
  });

  const { toast } = useToast();

  const handleSaveSettings = () => {
    toast({
      title: "Configurações salvas",
      description: "Suas configurações foram atualizadas com sucesso.",
    });
  };

  const handleResetSettings = () => {
    toast({
      title: "Configurações resetadas",
      description: "As configurações foram restauradas para os valores padrão.",
    });
  };

  const handleExportData = () => {
    toast({
      title: "Exportação iniciada",
      description: "Seus dados estão sendo exportados. Você receberá um email quando concluído.",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Configurações</h2>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={handleResetSettings}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Resetar
          </Button>
          <Button onClick={handleSaveSettings} className="bg-indigo-600 hover:bg-indigo-700">
            <Save className="mr-2 h-4 w-4" />
            Salvar
          </Button>
        </div>
      </div>

      {/* Company Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <User className="mr-2 h-5 w-5" />
            Informações da Empresa
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nome da Empresa</Label>
              <Input
                value={userSettings.companyName}
                onChange={(e) => setUserSettings({...userSettings, companyName: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={userSettings.email}
                onChange={(e) => setUserSettings({...userSettings, email: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label>Telefone</Label>
              <Input
                value={userSettings.phone}
                onChange={(e) => setUserSettings({...userSettings, phone: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label>Moeda Padrão</Label>
              <Select value={userSettings.currency} onValueChange={(value) => setUserSettings({...userSettings, currency: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BRL">Real (BRL)</SelectItem>
                  <SelectItem value="USD">Dólar (USD)</SelectItem>
                  <SelectItem value="EUR">Euro (EUR)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Endereço</Label>
            <Textarea
              value={userSettings.address}
              onChange={(e) => setUserSettings({...userSettings, address: e.target.value})}
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Bell className="mr-2 h-5 w-5" />
            Notificações
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Notificações por Email</Label>
              <p className="text-sm text-gray-500">Receber notificações importantes por email</p>
            </div>
            <Switch
              checked={notifications.emailNotifications}
              onCheckedChange={(checked) => setNotifications({...notifications, emailNotifications: checked})}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label>Notificações Push</Label>
              <p className="text-sm text-gray-500">Receber notificações em tempo real</p>
            </div>
            <Switch
              checked={notifications.pushNotifications}
              onCheckedChange={(checked) => setNotifications({...notifications, pushNotifications: checked})}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label>Relatório Diário</Label>
              <p className="text-sm text-gray-500">Receber resumo diário por email</p>
            </div>
            <Switch
              checked={notifications.dailyReport}
              onCheckedChange={(checked) => setNotifications({...notifications, dailyReport: checked})}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label>Alertas de Transação</Label>
              <p className="text-sm text-gray-500">Notificar sobre novas transações</p>
            </div>
            <Switch
              checked={notifications.transactionAlerts}
              onCheckedChange={(checked) => setNotifications({...notifications, transactionAlerts: checked})}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label>Alerta de Caixa Baixo</Label>
              <p className="text-sm text-gray-500">Alertar quando o saldo estiver baixo</p>
            </div>
            <Switch
              checked={notifications.lowCashAlert}
              onCheckedChange={(checked) => setNotifications({...notifications, lowCashAlert: checked})}
            />
          </div>
        </CardContent>
      </Card>

      {/* Appearance & Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Palette className="mr-2 h-5 w-5" />
            Aparência e Preferências
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tema</Label>
              <Select value={preferences.theme} onValueChange={(value) => setPreferences({...preferences, theme: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Claro</SelectItem>
                  <SelectItem value="dark">Escuro</SelectItem>
                  <SelectItem value="auto">Automático</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Casas Decimais</Label>
              <Select value={preferences.decimalPlaces.toString()} onValueChange={(value) => setPreferences({...preferences, decimalPlaces: parseInt(value)})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">0 casas</SelectItem>
                  <SelectItem value="2">2 casas</SelectItem>
                  <SelectItem value="3">3 casas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label>Exportação Automática</Label>
              <p className="text-sm text-gray-500">Exportar relatórios automaticamente</p>
            </div>
            <Switch
              checked={preferences.autoExport}
              onCheckedChange={(checked) => setPreferences({...preferences, autoExport: checked})}
            />
          </div>
          <div className="space-y-2">
            <Label>Frequência de Backup</Label>
            <Select value={preferences.backupFrequency} onValueChange={(value) => setPreferences({...preferences, backupFrequency: value})}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Diário</SelectItem>
                <SelectItem value="weekly">Semanal</SelectItem>
                <SelectItem value="monthly">Mensal</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Database className="mr-2 h-5 w-5" />
            Gerenciamento de Dados
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div>
              <Label>Exportar Todos os Dados</Label>
              <p className="text-sm text-gray-500">Baixar todos os dados em formato JSON</p>
            </div>
            <Button variant="outline" onClick={handleExportData}>
              Exportar
            </Button>
          </div>
          <div className="flex items-center justify-between p-4 border border-orange-200 rounded-lg bg-orange-50">
            <div>
              <Label className="text-orange-800">Limpar Cache</Label>
              <p className="text-sm text-orange-600">Limpar dados temporários e cache</p>
            </div>
            <Button variant="outline" className="border-orange-300 text-orange-700 hover:bg-orange-100">
              Limpar
            </Button>
          </div>
          <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
            <div>
              <Label className="text-red-800">Resetar Sistema</Label>
              <p className="text-sm text-red-600">Restaurar todas as configurações padrão</p>
            </div>
            <Button variant="outline" className="border-red-300 text-red-700 hover:bg-red-100">
              Resetar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Security */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="mr-2 h-5 w-5" />
            Segurança
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Alterar Senha</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input type="password" placeholder="Senha atual" />
              <Input type="password" placeholder="Nova senha" />
            </div>
            <Button size="sm" className="mt-2">
              Alterar Senha
            </Button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label>Autenticação de Dois Fatores</Label>
              <p className="text-sm text-gray-500">Adicionar uma camada extra de segurança</p>
            </div>
            <Button variant="outline" size="sm">
              Configurar
            </Button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label>Sessões Ativas</Label>
              <p className="text-sm text-gray-500">Gerenciar dispositivos conectados</p>
            </div>
            <Button variant="outline" size="sm">
              Ver Sessões
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;