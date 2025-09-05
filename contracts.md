# Contratos API - Sistema de Controle de Caixa

## 1. API Endpoints

### Authentication
- `POST /api/auth/login` - Login do usuário
- `POST /api/auth/logout` - Logout do usuário
- `GET /api/auth/me` - Dados do usuário atual

### Transactions
- `GET /api/transactions` - Listar transações (com filtros)
- `POST /api/transactions` - Criar nova transação
- `PUT /api/transactions/:id` - Atualizar transação
- `DELETE /api/transactions/:id` - Deletar transação
- `GET /api/transactions/summary` - Resumo financeiro

### Reports
- `GET /api/reports/summary` - Relatório resumo
- `GET /api/reports/category` - Relatório por categoria
- `POST /api/reports/export/pdf` - Exportar PDF
- `POST /api/reports/export/excel` - Exportar Excel

### Settings
- `GET /api/settings` - Obter configurações
- `PUT /api/settings` - Atualizar configurações

## 2. Modelos de Dados

### User
```javascript
{
  _id: ObjectId,
  email: String,
  password: String (hashed),
  name: String,
  role: String,
  companyName: String,
  phone: String,
  address: String,
  settings: {
    currency: String,
    timezone: String,
    notifications: Object
  },
  createdAt: Date,
  updatedAt: Date
}
```

### Transaction
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  date: Date,
  time: String,
  type: String, // 'entrada' | 'saida'
  category: String,
  description: String,
  amount: Number,
  paymentMethod: String,
  client: String,
  supplier: String,
  status: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Settings
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  companyName: String,
  email: String,
  phone: String,
  address: String,
  currency: String,
  timezone: String,
  notifications: {
    emailNotifications: Boolean,
    pushNotifications: Boolean,
    dailyReport: Boolean,
    transactionAlerts: Boolean,
    lowCashAlert: Boolean
  },
  preferences: {
    theme: String,
    autoExport: Boolean,
    backupFrequency: String,
    decimalPlaces: Number
  },
  updatedAt: Date
}
```

## 3. Dados Mockados para Substituir

### Frontend - `/data/mockData.js`:
- `mockUsers` → Será substituído por autenticação real
- `mockTransactions` → Virá de `GET /api/transactions`
- `mockSummary` → Virá de `GET /api/transactions/summary`
- `mockCategories` → Configuração estática no backend
- `mockPaymentMethods` → Configuração estática no backend

### Contexto de Autenticação:
- `AuthContext` → Usará endpoints reais de autenticação
- Login/logout → Chamadas para `/api/auth/login` e `/api/auth/logout`

## 4. Integrações Frontend-Backend

### Login (LoginPage.js):
- Substituir chamada mock por `POST /api/auth/login`
- Armazenar JWT token no localStorage
- Redirecionar para dashboard após sucesso

### Dashboard Overview:
- `GET /api/transactions/summary` → Dados dos cards
- `GET /api/transactions?limit=5&sort=-createdAt` → Transações recentes

### Transactions Page:
- `GET /api/transactions` → Lista completa com filtros
- `POST /api/transactions` → Criar nova transação
- `DELETE /api/transactions/:id` → Remover transação

### Reports Page:
- `GET /api/reports/summary` → Dados de resumo
- `GET /api/reports/category` → Análise por categoria
- `POST /api/reports/export/pdf` → Gerar PDF real
- `POST /api/reports/export/excel` → Gerar Excel real

### Settings Page:
- `GET /api/settings` → Carregar configurações
- `PUT /api/settings` → Salvar alterações

## 5. Funcionalidades de Exportação

### PDF Export:
- Usar biblioteca `jsPDF` ou `puppeteer`
- Gerar relatório formatado com logo e dados
- Retornar arquivo para download

### Excel Export:
- Usar biblioteca `xlsx` ou `exceljs`
- Criar planilha com dados formatados
- Retornar arquivo para download

## 6. Segurança

### Autenticação:
- JWT tokens com expiração
- Middleware de autenticação para rotas protegidas
- Hash de senhas com bcrypt

### Autorização:
- Todas as transações e dados são por usuário
- Validação de ownership nos endpoints

## 7. Validações

### Transaction:
- Amount deve ser > 0
- Type deve ser 'entrada' ou 'saida'
- Category e description são obrigatórios
- Date não pode ser futuro

### User:
- Email único e válido
- Senha mínimo 6 caracteres
- Campos obrigatórios validados

## 8. Status de Implementação

### ✅ Concluído (Frontend Mock):
- Interface completa
- Navegação entre páginas
- Formulários funcionais
- Design responsivo

### 🔄 Próximos Passos (Backend):
1. Implementar modelos MongoDB
2. Criar endpoints de autenticação
3. Implementar CRUD de transações
4. Sistema de relatórios
5. Exportação PDF/Excel
6. Integração frontend-backend
7. Testes e validações