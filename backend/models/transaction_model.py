from pydantic import BaseModel, Field, validator
from typing import Optional, List, Dict, Any
from datetime import datetime, date
from enum import Enum

# Passenger model for travel transactions
class Passenger(BaseModel):
    name: str
    document: Optional[str] = None
    birthDate: Optional[str] = None
    type: str = "Adulto"  # Adulto, Criança, Bebê, Idoso
    nationality: str = "Brasileira"
    passportNumber: Optional[str] = None
    passportExpiry: Optional[str] = None
    specialNeeds: Optional[str] = None
    status: str = "Confirmado"


class TransactionType(str, Enum):
    ENTRADA = "entrada"
    SAIDA = "saida"
    ENTRADA_VENDAS = "entrada_vendas"
    SAIDA_VENDAS = "saida_vendas"


class TransactionStatus(str, Enum):
    CONFIRMADO = "Confirmado"
    PENDENTE = "Pendente"
    CANCELADO = "Cancelado"
    PAGO = "Pago"


class TransactionCreate(BaseModel):
    type: TransactionType
    category: str
    description: str
    amount: float = Field(..., gt=0)
    paymentMethod: str
    client: Optional[str] = None
    supplier: Optional[str] = None
    transactionDate: Optional[date] = None
    transactionTime: Optional[str] = None
    status: TransactionStatus = TransactionStatus.CONFIRMADO

    @validator('amount')
    def amount_must_be_positive(cls, v):
        if v <= 0:
            raise ValueError('Amount must be positive')
        return v

    @validator('transactionDate')
    def date_not_in_future(cls, v):
        if v and v > date.today():
            raise ValueError('Transaction date cannot be in the future')
        return v


class TransactionUpdate(BaseModel):
    type: Optional[TransactionType] = None
    category: Optional[str] = None
    description: Optional[str] = None
    amount: Optional[float] = Field(None, gt=0)
    paymentMethod: Optional[str] = None
    client: Optional[str] = None
    supplier: Optional[str] = None
    transactionDate: Optional[date] = None
    transactionTime: Optional[str] = None
    status: Optional[TransactionStatus] = None

    @validator('amount')
    def amount_must_be_positive(cls, v):
        if v is not None and v <= 0:
            raise ValueError('Amount must be positive')
        return v


class Transaction(BaseModel):
    date: date = Field(default_factory=date.today)
    time: str = Field(default_factory=lambda: datetime.now().strftime("%H:%M"))
    type: TransactionType
    category: str
    description: str
    amount: float = Field(..., gt=0)
    paymentMethod: str
    client: Optional[str] = None
    supplier: Optional[str] = None
    status: TransactionStatus = TransactionStatus.CONFIRMADO
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        json_encoders = {date: str, datetime: str}
        use_enum_values = True


class TransactionResponse(BaseModel):
    id: str
    date: str
    time: str
    type: str
    category: str
    description: str
    amount: float
    paymentMethod: str
    client: Optional[str] = None
    supplier: Optional[str] = None
    status: str
    createdAt: datetime


class TransactionSummary(BaseModel):
    totalEntradas: float = 0.0
    totalSaidas: float = 0.0
    saldoAtual: float = 0.0
    transacoesHoje: int = 0
    clientesAtendidos: int = 0
    ticketMedio: float = 0.0


class CategorySummary(BaseModel):
    category: str
    amount: float
    count: int
    percentage: float


# Categorias padrão do sistema
DEFAULT_CATEGORIES = [
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
]

# Métodos de pagamento padrão
DEFAULT_PAYMENT_METHODS = [
    "Dinheiro",
    "PIX",
    "Cartão de Crédito",
    "Cartão de Débito",
    "Transferência",
    "Cartão Corporativo"
]