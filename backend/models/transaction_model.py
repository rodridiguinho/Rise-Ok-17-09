from pydantic import BaseModel, Field, validator
from typing import Optional, List
from datetime import datetime, date
from enum import Enum
from bson import ObjectId


class PyObjectId(ObjectId):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid objectid")
        return ObjectId(v)

    @classmethod
    def __modify_schema__(cls, field_schema):
        field_schema.update(type="string")


class TransactionType(str, Enum):
    ENTRADA = "entrada"
    SAIDA = "saida"


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
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    userId: PyObjectId
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
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str, date: str}
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

    class Config:
        from_attributes = True


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