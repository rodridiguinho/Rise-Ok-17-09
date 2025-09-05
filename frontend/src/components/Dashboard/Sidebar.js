import React from 'react';
import { Button } from '../ui/button';
import { 
  LayoutDashboard, 
  ArrowRightLeft, 
  FileText, 
  Settings,
  ChevronLeft
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
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-emerald-400 to-blue-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">A</span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">AgentePro</h2>
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
                  ? 'bg-indigo-600 text-white hover:bg-indigo-700' 
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