import React from 'react';
import { Button } from '../ui/button';
import { 
  LayoutDashboard, 
  ArrowRightLeft, 
  FileText, 
  Settings,
  ChevronLeft,
  Users,
  Building2,
  UserCog,
  X,
  BarChart3,
  TrendingUp,
  Calendar,
  Crown,
  Plane,
  UserCheck,
  RefreshCw
} from 'lucide-react';

const Sidebar = ({ activeTab, setActiveTab, isOpen, setIsOpen, isMobile }) => {
  const menuItems = [
    {
      id: 'overview',
      label: 'Visão Geral',
      icon: LayoutDashboard,
    },
    {
      id: 'transactions',
      label: 'Transações',
      icon: ArrowRightLeft,
    },
    {
      id: 'clients',
      label: 'Clientes',
      icon: Users,
    },
    {
      id: 'suppliers',
      label: 'Fornecedores',
      icon: Building2,
    },
    {
      id: 'passengers',
      label: 'Controle de Passageiros',
      icon: UserCheck,
    },
    {
      id: 'users',
      label: 'Usuários',
      icon: UserCog,
    },
    {
      id: 'reports',
      label: 'Relatórios',
      icon: FileText,
    },
    {
      id: 'sales-analytics',
      label: 'Analytics Vendas',
      icon: BarChart3,
    },
    {
      id: 'financial-analytics',
      label: 'Analytics Financeiro',
      icon: TrendingUp,
    },
    {
      id: 'sales-reports',
      label: 'Relatórios Vendas',
      icon: Calendar,
    },
    {
      id: 'sales-ranking',
      label: 'Ranking Vendedores',
      icon: Crown,
    },
    {
      id: 'admin-settings',
      label: 'Administração',
      icon: Settings,
    },
    {
      id: 'settings',
      label: 'Configurações',
      icon: Settings,
    },
    {
      id: 'transaction-migration',
      label: 'Migração de Dados',
      icon: RefreshCw,
    },
  ];

  return (
    <div className={`${
      isMobile 
        ? `fixed inset-y-0 left-0 z-40 transform transition-transform duration-300 ${
            isOpen ? 'translate-x-0' : '-translate-x-full'
          } w-64`
        : `fixed left-0 top-0 h-full transition-all duration-300 z-40 ${
            isOpen ? 'w-64' : 'w-16'
          }`
    } bg-white shadow-lg border-r border-gray-200`}>
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        {(isOpen || isMobile) && (
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-orange-400 rounded-xl flex items-center justify-center relative">
              <div className="w-6 h-5 bg-white rounded-sm relative">
                <svg viewBox="0 0 24 24" className="w-3 h-3 absolute top-1 left-1.5 text-pink-500 fill-current">
                  <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
                </svg>
              </div>
              <div className="absolute -top-0.5 left-1/2 transform -translate-x-1/2 w-2 h-1.5 border-2 border-white rounded-t-md"></div>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Rise Travel</h2>
              <p className="text-xs text-gray-500">Controle de Caixa</p>
            </div>
          </div>
        )}
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          className="text-gray-600 hover:text-gray-900 p-2"
        >
          {isMobile ? (
            <X className="h-5 w-5" />
          ) : (
            <ChevronLeft className={`h-4 w-4 transition-transform ${isOpen ? '' : 'rotate-180'}`} />
          )}
        </Button>
      </div>

      <nav className="p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <Button
              key={item.id}
              variant={isActive ? "default" : "ghost"}
              className={`w-full justify-start transition-colors text-left ${
                isActive 
                  ? 'bg-gradient-to-r from-pink-500 to-orange-400 text-white hover:from-pink-600 hover:to-orange-500 shadow-lg' 
                  : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
              } ${!isOpen && !isMobile ? 'px-2' : 'px-4'} py-3`}
              onClick={() => setActiveTab(item.id)}
            >
              <Icon className={`h-5 w-5 ${(isOpen || isMobile) ? 'mr-3' : ''} flex-shrink-0`} />
              {(isOpen || isMobile) && <span className="truncate">{item.label}</span>}
            </Button>
          );
        })}
      </nav>
    </div>
  );
};

export default Sidebar;