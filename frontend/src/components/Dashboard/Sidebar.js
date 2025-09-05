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
  UserCog
} from 'lucide-react';

const Sidebar = ({ activeTab, setActiveTab, isOpen, setIsOpen }) => {
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
      id: 'settings',
      label: 'Configurações',
      icon: Settings,
    },
  ];

  return (
    <div className={`fixed left-0 top-0 h-full bg-white shadow-lg border-r border-gray-200 transition-all duration-300 z-40 ${
      isOpen ? 'w-64' : 'w-16'
    }`}>
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        {isOpen && (
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-orange-400 rounded-xl flex items-center justify-center relative">
              {/* Suitcase shape */}
              <div className="w-6 h-5 bg-white rounded-sm relative">
                {/* Airplane icon */}
                <svg viewBox="0 0 24 24" className="w-3 h-3 absolute top-1 left-1.5 text-pink-500 fill-current">
                  <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
                </svg>
              </div>
              {/* Handle */}
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
          className="text-gray-600 hover:text-gray-900"
        >
          <ChevronLeft className={`h-4 w-4 transition-transform ${isOpen ? '' : 'rotate-180'}`} />
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
              className={`w-full justify-start transition-colors ${
                isActive 
                  ? 'bg-gradient-to-r from-pink-500 to-orange-400 text-white hover:from-pink-600 hover:to-orange-500 shadow-lg' 
                  : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
              } ${!isOpen ? 'px-2' : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              <Icon className={`h-5 w-5 ${isOpen ? 'mr-3' : ''}`} />
              {isOpen && <span>{item.label}</span>}
            </Button>
          );
        })}
      </nav>
    </div>
  );
};

export default Sidebar;