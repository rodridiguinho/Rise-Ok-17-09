// Mock data for the cash control system

export const mockUsers = [
  {
    id: 1,
    email: "rorigo@risetravel.com.br",
    password: "Emily2030*",
    name: "Rodrigo Silva",
    role: "Gerente"
  },
  {
    id: 2,
    email: "admin@agentepro.com",
    password: "123456",
    name: "Administrador",
    role: "Admin"
  }
];

export const mockTransactions = [
  {
    id: 1,
    date: "2025-01-05",
    time: "09:30",
    type: "entrada",
    category: "Pacote Turístico",
    description: "Pacote Europa 7 dias - Cliente João Silva",
    amount: 8500.00,
    paymentMethod: "Cartão de Crédito",
    client: "João Silva",
    status: "Confirmado"
  },
  {
    id: 2,
    date: "2025-01-05",
    time: "10:15",
    type: "saida",
    category: "Fornecedor",
    description: "Pagamento Hotel Ibis - Reserva #4523",
    amount: 1200.00,
    paymentMethod: "Transferência",
    supplier: "Hotel Ibis",
    status: "Pago"
  },
  {
    id: 3,
    date: "2025-01-05",
    time: "11:00",
    type: "entrada",
    category: "Seguro Viagem",
    description: "Seguro Viagem Internacional - Maria Santos",
    amount: 350.00,
    paymentMethod: "PIX",
    client: "Maria Santos",
    status: "Confirmado"
  },
  {
    id: 4,
    date: "2025-01-04",
    time: "14:30",
    type: "entrada",
    category: "Passagem Aérea",
    description: "Passagem São Paulo - Miami - Carlos Oliveira",
    amount: 2800.00,
    paymentMethod: "Dinheiro",
    client: "Carlos Oliveira",
    status: "Confirmado"
  },
  {
    id: 5,
    date: "2025-01-04",
    time: "15:45",
    type: "saida",
    category: "Despesa Operacional",
    description: "Combustível veículo da empresa",
    amount: 250.00,
    paymentMethod: "Cartão Corporativo",
    status: "Pago"
  },
  {
    id: 6,
    date: "2025-01-04",
    time: "16:20",
    type: "entrada",
    category: "Transfer",
    description: "Transfer Aeroporto - Hotel - Família Rodriguez",
    amount: 180.00,
    paymentMethod: "Cartão de Débito",
    client: "Família Rodriguez",
    status: "Confirmado"
  },
  {
    id: 7,
    date: "2025-01-03",
    time: "09:00",
    type: "saida",
    category: "Comissão",
    description: "Comissão guia turístico - Tour Centro Histórico",
    amount: 400.00,
    paymentMethod: "PIX",
    supplier: "Guia Ana Paula",
    status: "Pago"
  },
  {
    id: 8,
    date: "2025-01-03",
    time: "13:15",
    type: "entrada",
    category: "Excursão",
    description: "Excursão Cidade Imperial - Grupo de 12 pessoas",
    amount: 4200.00,
    paymentMethod: "Transferência",
    client: "Grupo Empresarial XYZ",
    status: "Confirmado"
  }
];

export const mockSummary = {
  totalEntradas: 16030.00,
  totalSaidas: 1850.00,
  saldoAtual: 14180.00,
  transacoesHoje: 3,
  clientesAtendidos: 6,
  ticketMedio: 2671.67
};

export const mockCategories = [
  "Pacote Turístico",
  "Passagem Aérea", 
  "Hotel/Hospedagem",
  "Seguro Viagem",
  "Transfer",
  "Excursão",
  "Aluguel de Carro",
  "Cruzeiro",
  "Ingresso/Atrações",
  "Fornecedor",
  "Despesa Operacional",
  "Comissão"
];

export const mockPaymentMethods = [
  "Dinheiro",
  "PIX",
  "Cartão de Crédito",
  "Cartão de Débito",
  "Transferência",
  "Cartão Corporativo"
];