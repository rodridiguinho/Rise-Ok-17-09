import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { useToast } from '../../hooks/use-toast';
import { 
  UserCheck, 
  Plus, 
  Calendar, 
  MapPin, 
  Plane, 
  Clock, 
  Bell,
  Users,
  User,
  Building,
  FileText
} from 'lucide-react';
import { transactionsAPI } from '../../services/api';

const PassengerControlDirect = () => {
  console.log('🔥 PassengerControlDirect component loaded successfully!');
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [isAddPassengerOpen, setIsAddPassengerOpen] = useState(false);
  const [newPassenger, setNewPassenger] = useState({
    name: '',
    document: '',
    birthDate: '',
    type: 'Adulto',
    nationality: 'Brasileira',
    passportNumber: '',
    passportExpiry: '',
    specialNeeds: '',
    status: 'Confirmado'
  });
  
  // Estados para informações do fornecedor
  const [selectedSupplier, setSelectedSupplier] = useState('');
  const [emissionType, setEmissionType] = useState('E-ticket');
  const [supplierPhone, setSupplierPhone] = useState('');
  const [editableAirline, setEditableAirline] = useState('');
  const [reservationNumber, setReservationNumber] = useState('');
  const [reservationNotes, setReservationNotes] = useState('');
  
  // Novos campos para controle de passageiros
  const [productType, setProductType] = useState('');
  const [clientReservationCode, setClientReservationCode] = useState('');
  const [departureCity, setDepartureCity] = useState('');
  const [arrivalCity, setArrivalCity] = useState('');
  const [tripType, setTripType] = useState('ida-volta');
  const [departureDate, setDepartureDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  // Horários IDA
  const [outboundDepartureTime, setOutboundDepartureTime] = useState('');
  const [outboundArrivalTime, setOutboundArrivalTime] = useState('');
  const [outboundFlightDuration, setOutboundFlightDuration] = useState('');
  // Horários VOLTA
  const [returnDepartureTime, setReturnDepartureTime] = useState('');
  const [returnArrivalTime, setReturnArrivalTime] = useState('');
  const [returnFlightDuration, setReturnFlightDuration] = useState('');
  // Escalas
  const [hasStopover, setHasStopover] = useState(false);
  const [stopoverCity, setStopoverCity] = useState('');
  const [stopoverArrivalTime, setStopoverArrivalTime] = useState('');
  const [stopoverDepartureTime, setStopoverDepartureTime] = useState('');
  const [connectionDuration, setConnectionDuration] = useState('');
  
  const { toast } = useToast();

  // Lista de fornecedores padrão
  const suppliersList = [
    'CVC',
    'Decolar',
    'Latam Travel',
    'Azul Viagens',
    'TAM Viagens',
    'Expedia',
    'Booking.com',
    'Agência Local',
    'Outros'
  ];

  // Carregar reservas das transações de entrada
  useEffect(() => {
    loadReservations();
  }, []);

  const loadReservations = async () => {
    setLoading(true);
    try {
      const response = await transactionsAPI.getTransactions();
      
      const entryTransactions = response.filter(transaction => 
        transaction.type === 'entrada' && 
        transaction.internalReservationCode &&
        (transaction.departureCity || transaction.arrivalCity)
      );

      const reservationsData = entryTransactions.map(transaction => ({
        id: transaction.id,
        internalCode: transaction.internalReservationCode,
        clientReservationCode: transaction.clientReservationCode,
        client: transaction.client,
        airline: transaction.airline,
        supplier: transaction.supplier,
        departureCity: transaction.departureCity,
        arrivalCity: transaction.arrivalCity,
        departureDate: transaction.departureDate,
        returnDate: transaction.returnDate,
        passengers: transaction.passengers || [
          {
            name: transaction.client,
            document: '',
            birthDate: '',
            type: 'Adulto',
            nationality: 'Brasileira',
            passportNumber: '',
            passportExpiry: '',
            specialNeeds: '',
            status: 'Confirmado'
          }
        ],
        travelNotes: transaction.travelNotes || '',
        emissionType: transaction.emissionType || '',
        supplierPhone: transaction.supplierPhone || '',
        reservationNumber: transaction.reservationNumber || '',
        // Novos campos de detalhes da viagem
        productType: transaction.productType || '',
        clientReservationCode: transaction.clientReservationCode || '',
        departureCity: transaction.departureCity || '',
        arrivalCity: transaction.arrivalCity || '',
        tripType: transaction.tripType || 'ida-volta',
        departureDate: transaction.departureDate || '',
        returnDate: transaction.returnDate || '',
        outboundDepartureTime: transaction.outboundDepartureTime || '',
        outboundArrivalTime: transaction.outboundArrivalTime || '',
        outboundFlightDuration: transaction.outboundFlightDuration || '',
        returnDepartureTime: transaction.returnDepartureTime || '',
        returnArrivalTime: transaction.returnArrivalTime || '',
        returnFlightDuration: transaction.returnFlightDuration || '',
        hasStopover: transaction.hasStopover || false,
        stopoverCity: transaction.stopoverCity || '',
        stopoverArrivalTime: transaction.stopoverArrivalTime || '',
        stopoverDepartureTime: transaction.stopoverDepartureTime || '',
        connectionDuration: transaction.connectionDuration || '',
        status: 'Ativa'
      }));

      setReservations(reservationsData);
    } catch (error) {
      console.error('Erro ao carregar reservas:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível carregar as reservas"
      });
    } finally {
      setLoading(false);
    }
  };

  const addPassenger = async () => {
    if (!selectedReservation) return;

    try {
      const updatedReservation = {
        ...selectedReservation,
        passengers: [...selectedReservation.passengers, { ...newPassenger, id: Date.now() }]
      };

      await transactionsAPI.updateTransaction(selectedReservation.id, {
        type: 'entrada',
        category: 'Passagem Aérea',
        description: selectedReservation.client,
        amount: selectedReservation.amount || 1000,
        paymentMethod: 'PIX',
        supplier: selectedSupplier,
        client: selectedReservation.client,
        passengers: updatedReservation.passengers,
        airline: editableAirline,
        travelNotes: reservationNotes,
        emissionType: emissionType,
        supplierPhone: supplierPhone,
        reservationNumber: reservationNumber,
        // Novos campos de detalhes da viagem
        productType: productType,
        clientReservationCode: clientReservationCode,
        departureCity: departureCity,
        arrivalCity: arrivalCity,
        tripType: tripType,
        departureDate: departureDate,
        returnDate: returnDate,
        outboundDepartureTime: outboundDepartureTime,
        outboundArrivalTime: outboundArrivalTime,
        outboundFlightDuration: outboundFlightDuration,
        returnDepartureTime: returnDepartureTime,
        returnArrivalTime: returnArrivalTime,
        returnFlightDuration: returnFlightDuration,
        hasStopover: hasStopover,
        stopoverCity: stopoverCity,
        stopoverArrivalTime: stopoverArrivalTime,
        stopoverDepartureTime: stopoverDepartureTime,
        connectionDuration: connectionDuration
      });

      setReservations(prev => 
        prev.map(res => res.id === selectedReservation.id ? updatedReservation : res)
      );

      setSelectedReservation(updatedReservation);
      setNewPassenger({
        name: '',
        document: '',
        birthDate: '',
        type: 'Adulto',
        nationality: 'Brasileira',
        passportNumber: '',
        passportExpiry: '',
        specialNeeds: '',
        status: 'Confirmado'
      });
      setIsAddPassengerOpen(false);

      toast({
        title: "✅ Passageiro Adicionado",
        description: `${newPassenger.name} foi adicionado à reserva e salvo no sistema`,
      });

    } catch (error) {
      console.error('Erro ao adicionar passageiro:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível adicionar o passageiro"
      });
    }
  };

  const saveReservationChanges = async () => {
    if (!selectedReservation) return;

    try {
      const updateData = {
        type: 'entrada',
        category: 'Passagem Aérea',
        description: selectedReservation.client,
        amount: selectedReservation.amount || 1000,
        paymentMethod: 'PIX',
        supplier: selectedSupplier,
        client: selectedReservation.client,
        passengers: selectedReservation.passengers,
        airline: editableAirline,
        travelNotes: reservationNotes,
        emissionType: emissionType,
        supplierPhone: supplierPhone,
        reservationNumber: reservationNumber,
        departureCity: selectedReservation.departureCity,
        arrivalCity: selectedReservation.arrivalCity,
        departureDate: selectedReservation.departureDate,
        returnDate: selectedReservation.returnDate,
        clientReservationCode: selectedReservation.clientReservationCode,
        internalReservationCode: selectedReservation.internalCode
      };

      await transactionsAPI.updateTransaction(selectedReservation.id, updateData);

      const updatedReservation = {
        ...selectedReservation,
        supplier: selectedSupplier,
        airline: editableAirline,
        travelNotes: reservationNotes,
        emissionType: emissionType,
        supplierPhone: supplierPhone,
        reservationNumber: reservationNumber,
        // Novos campos de detalhes da viagem
        productType: productType,
        clientReservationCode: clientReservationCode,
        departureCity: departureCity,
        arrivalCity: arrivalCity,
        tripType: tripType,
        departureDate: departureDate,
        returnDate: returnDate,
        outboundDepartureTime: outboundDepartureTime,
        outboundArrivalTime: outboundArrivalTime,
        outboundFlightDuration: outboundFlightDuration,
        returnDepartureTime: returnDepartureTime,
        returnArrivalTime: returnArrivalTime,
        returnFlightDuration: returnFlightDuration,
        hasStopover: hasStopover,
        stopoverCity: stopoverCity,
        stopoverArrivalTime: stopoverArrivalTime,
        stopoverDepartureTime: stopoverDepartureTime,
        connectionDuration: connectionDuration
      };

      setReservations(prev => 
        prev.map(res => res.id === selectedReservation.id ? updatedReservation : res)
      );

      setSelectedReservation(updatedReservation);

      toast({
        title: "✅ Alterações Salvas",
        description: "As informações da reserva foram atualizadas com sucesso",
      });

    } catch (error) {
      console.error('Erro ao salvar alterações:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível salvar as alterações"
      });
    }
  };

  const getDaysUntilTravel = (departureDate) => {
    if (!departureDate) return null;
    const today = new Date();
    const travel = new Date(departureDate);
    const diffTime = travel - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getReminderStatus = (daysUntil) => {
    if (daysUntil < 0) return { status: 'passed', color: 'gray', text: 'Viagem realizada' };
    if (daysUntil === 0) return { status: 'today', color: 'red', text: 'HOJE!' };
    if (daysUntil === 1) return { status: 'tomorrow', color: 'orange', text: 'Amanhã' };
    if (daysUntil <= 2) return { status: 'urgent', color: 'red', text: `${daysUntil} dias` };
    if (daysUntil <= 7) return { status: 'warning', color: 'yellow', text: `${daysUntil} dias` };
    if (daysUntil <= 15) return { status: 'upcoming', color: 'blue', text: `${daysUntil} dias` };
    if (daysUntil <= 30) return { status: 'planned', color: 'green', text: `${daysUntil} dias` };
    return { status: 'future', color: 'gray', text: `${daysUntil} dias` };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <UserCheck className="mr-3 h-8 w-8 text-blue-600" />
            Controle de Passageiros - VERSÃO DIRETA
          </h1>
          <p className="text-gray-600 mt-1">
            Gerencie passageiros, fornecedores e informações de viagem
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded">
            {reservations.length} Reservas Ativas
          </span>
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Plane className="h-8 w-8 animate-bounce mx-auto mb-2" />
            <p>Carregando reservas...</p>
          </div>
        </div>
      )}

      {/* Reservations Grid */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reservations.map((reservation) => {
            const daysUntil = getDaysUntilTravel(reservation.departureDate);
            const reminderStatus = getReminderStatus(daysUntil);
            
            return (
              <div key={reservation.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6">
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">
                      🔗 {reservation.internalCode}
                    </h3>
                    {reservation.clientReservationCode && (
                      <p className="text-gray-600 text-sm">
                        Cliente: {reservation.clientReservationCode}
                      </p>
                    )}
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    reminderStatus.color === 'red' ? 'bg-red-100 text-red-800' :
                    reminderStatus.color === 'orange' ? 'bg-orange-100 text-orange-800' :
                    reminderStatus.color === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                    reminderStatus.color === 'blue' ? 'bg-blue-100 text-blue-800' :
                    reminderStatus.color === 'green' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {reminderStatus.text}
                  </span>
                </div>
                
                {/* Main Passenger - Prominently displayed */}
                <div className="bg-indigo-50 p-3 rounded-lg mb-4">
                  <div className="flex items-center">
                    <User className="h-5 w-5 mr-2 text-indigo-600" />
                    <div>
                      <p className="text-xs text-indigo-600 font-medium">PASSAGEIRO PRINCIPAL</p>
                      <p className="font-semibold text-indigo-900">
                        {reservation.client || reservation.passengers[0]?.name || 'Nome não informado'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Flight Info */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm">
                    <Plane className="h-4 w-4 mr-2 text-blue-600" />
                    <span className="font-medium">{reservation.airline || 'Companhia não informada'}</span>
                  </div>
                  
                  <div className="flex items-center text-sm">
                    <MapPin className="h-4 w-4 mr-2 text-green-600" />
                    <span>{reservation.departureCity} → {reservation.arrivalCity}</span>
                  </div>
                  
                  {reservation.departureDate && (
                    <div className="flex items-center text-sm">
                      <Calendar className="h-4 w-4 mr-2 text-purple-600" />
                      <span>
                        {new Date(reservation.departureDate).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  )}
                </div>

                {/* Passengers Count */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm">
                    <Users className="h-4 w-4 mr-2 text-indigo-600" />
                    <span>{reservation.passengers.length} Passageiro(s)</span>
                  </div>
                  
                  <Button
                    onClick={() => {
                      setSelectedReservation(reservation);
                      setEditableAirline(reservation.airline || '');
                      setReservationNumber(reservation.reservationNumber || '');
                      setReservationNotes(reservation.travelNotes || '');
                      
                      // Inicializar novos campos de detalhes da viagem
                      setProductType(reservation.productType || '');
                      setClientReservationCode(reservation.clientReservationCode || '');
                      setDepartureCity(reservation.departureCity || '');
                      setArrivalCity(reservation.arrivalCity || '');
                      setTripType(reservation.tripType || 'ida-volta');
                      setDepartureDate(reservation.departureDate || '');
                      setReturnDate(reservation.returnDate || '');
                      setOutboundDepartureTime(reservation.outboundDepartureTime || '');
                      setOutboundArrivalTime(reservation.outboundArrivalTime || '');
                      setOutboundFlightDuration(reservation.outboundFlightDuration || '');
                      setReturnDepartureTime(reservation.returnDepartureTime || '');
                      setReturnArrivalTime(reservation.returnArrivalTime || '');
                      setReturnFlightDuration(reservation.returnFlightDuration || '');
                      setHasStopover(reservation.hasStopover || false);
                      setStopoverCity(reservation.stopoverCity || '');
                      setStopoverArrivalTime(reservation.stopoverArrivalTime || '');
                      setStopoverDepartureTime(reservation.stopoverDepartureTime || '');
                      setConnectionDuration(reservation.connectionDuration || '');
                      setSelectedSupplier(reservation.supplier || '');
                      setEmissionType(reservation.emissionType || 'E-ticket');
                      setSupplierPhone(reservation.supplierPhone || '');
                    }}
                    className="text-sm px-3 py-1"
                  >
                    Gerenciar
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {!loading && reservations.length === 0 && (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <Plane className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nenhuma reserva encontrada
          </h3>
          <p className="text-gray-600 mb-4">
            Crie transações de entrada com dados de viagem para vê-las aqui
          </p>
        </div>
      )}

      {/* NOVO MODAL COMPLETO - Direct Implementation */}
      {selectedReservation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-5xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold flex items-center">
                <UserCheck className="mr-2 h-5 w-5" />
                🎯 Gerenciar Reserva: {selectedReservation.internalCode}
              </h2>
              <button 
                onClick={() => setSelectedReservation(null)}
                className="text-gray-500 hover:text-gray-700 text-xl font-bold"
              >
                ✕
              </button>
            </div>
            
            <p className="text-gray-600 mb-6">
              {selectedReservation.client} • {selectedReservation.departureCity} → {selectedReservation.arrivalCity}
            </p>

            <div className="space-y-6">
              {/* SEÇÃO FORNECEDOR - CAMPOS MANUAIS */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-medium text-lg flex items-center mb-4">
                  <Building className="mr-2 h-5 w-5 text-blue-600" />
                  📋 Informações do Fornecedor
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Fornecedor */}
                  <div className="bg-white p-3 rounded border-l-4 border-blue-500">
                    <Label className="text-sm font-medium text-blue-700 mb-2 block">
                      🏢 Fornecedor:
                    </Label>
                    <Input
                      value={selectedSupplier}
                      onChange={(e) => setSelectedSupplier(e.target.value)}
                      placeholder="Digite o nome do fornecedor"
                      className="text-sm"
                    />
                  </div>
                  
                  {/* Tipo de Emissão */}
                  <div className="bg-white p-3 rounded border-l-4 border-purple-500">
                    <Label className="text-sm font-medium text-purple-700 mb-2 block">
                      📄 Tipo de Emissão:
                    </Label>
                    <Input
                      value={emissionType}
                      onChange={(e) => setEmissionType(e.target.value)}
                      placeholder="E-ticket, Voucher, etc."
                      className="text-sm"
                    />
                  </div>
                  
                  {/* Telefone do Fornecedor */}
                  <div className="bg-white p-3 rounded border-l-4 border-orange-500">
                    <Label className="text-sm font-medium text-orange-700 mb-2 block">
                      📞 Contato do Fornecedor:
                    </Label>
                    <Input
                      value={supplierPhone}
                      onChange={(e) => setSupplierPhone(e.target.value)}
                      placeholder="(11) 99999-9999"
                      className="text-sm"
                    />
                  </div>
                </div>
                
                {/* Companhia Aérea */}
                <div className="bg-white p-3 rounded border-l-4 border-green-500 mt-4">
                  <Label className="text-sm font-medium text-green-700 mb-2 block">
                    ✈️ Companhia Aérea:
                  </Label>
                  <Input
                    value={editableAirline}
                    onChange={(e) => setEditableAirline(e.target.value)}
                    placeholder="Nome da companhia aérea"
                    className="text-sm"
                  />
                </div>
                
                {/* Número da Reserva */}
                <div className="bg-white p-3 rounded border-l-4 border-red-500 mt-4">
                  <Label className="text-sm font-medium text-red-700 mb-2 block">
                    🎫 Número da Reserva:
                  </Label>
                  <Input
                    value={reservationNumber}
                    onChange={(e) => setReservationNumber(e.target.value)}
                    placeholder="Digite o número da reserva"
                    className="text-sm"
                  />
                </div>
              </div>

              {/* Nova Seção: Detalhes da Viagem do Passageiro */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-5 rounded-xl">
                <h3 className="font-bold text-xl text-blue-900 flex items-center mb-6">
                  <Plane className="mr-3 h-6 w-6 text-blue-600" />
                  ✈️ Detalhes da Viagem do Passageiro
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Tipo de Produto */}
                  <div className="bg-white p-3 rounded border-l-4 border-blue-500">
                    <Label className="text-sm font-medium text-blue-700 mb-2 block">
                      🎫 Tipo de Produto:
                    </Label>
                    <Input
                      value={productType}
                      onChange={(e) => setProductType(e.target.value)}
                      placeholder="Passagem aérea, pacote, etc."
                      className="text-sm"
                    />
                  </div>
                  
                  {/* Código da Reserva do Cliente */}
                  <div className="bg-white p-3 rounded border-l-4 border-green-500">
                    <Label className="text-sm font-medium text-green-700 mb-2 block">
                      🏷️ Código Reserva Cliente:
                    </Label>
                    <Input
                      value={clientReservationCode}
                      onChange={(e) => setClientReservationCode(e.target.value)}
                      placeholder="Código fornecido pelo cliente"
                      className="text-sm"
                    />
                  </div>
                  
                  {/* Tipo de Viagem */}
                  <div className="bg-white p-3 rounded border-l-4 border-purple-500">
                    <Label className="text-sm font-medium text-purple-700 mb-2 block">
                      🔄 Tipo de Viagem:
                    </Label>
                    <select
                      value={tripType}
                      onChange={(e) => setTripType(e.target.value)}
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                    >
                      <option value="ida-volta">Ida e Volta</option>
                      <option value="ida">Somente Ida</option>
                      <option value="multiplos-destinos">Múltiplos Destinos</option>
                    </select>
                  </div>
                  
                  {/* Cidade de Saída */}
                  <div className="bg-white p-3 rounded border-l-4 border-orange-500">
                    <Label className="text-sm font-medium text-orange-700 mb-2 block">
                      🛫 Cidade de Saída:
                    </Label>
                    <Input
                      value={departureCity}
                      onChange={(e) => setDepartureCity(e.target.value)}
                      placeholder="São Paulo (GRU)"
                      className="text-sm"
                    />
                  </div>
                  
                  {/* Cidade de Chegada */}
                  <div className="bg-white p-3 rounded border-l-4 border-teal-500">
                    <Label className="text-sm font-medium text-teal-700 mb-2 block">
                      🛬 Cidade de Chegada:
                    </Label>
                    <Input
                      value={arrivalCity}
                      onChange={(e) => setArrivalCity(e.target.value)}
                      placeholder="Lisboa (LIS)"
                      className="text-sm"
                    />
                  </div>
                  
                  {/* Data de Partida */}
                  <div className="bg-white p-3 rounded border-l-4 border-pink-500">
                    <Label className="text-sm font-medium text-pink-700 mb-2 block">
                      📅 Data de Partida:
                    </Label>
                    <Input
                      type="date"
                      value={departureDate}
                      onChange={(e) => setDepartureDate(e.target.value)}
                      className="text-sm"
                    />
                  </div>
                  
                  {/* Data de Retorno (se ida e volta) */}
                  {tripType === 'ida-volta' && (
                    <div className="bg-white p-3 rounded border-l-4 border-cyan-500">
                      <Label className="text-sm font-medium text-cyan-700 mb-2 block">
                        📅 Data de Retorno:
                      </Label>
                      <Input
                        type="date"
                        value={returnDate}
                        onChange={(e) => setReturnDate(e.target.value)}
                        className="text-sm"
                      />
                    </div>
                  )}
                  
                  {/* Horário Voo Ida - Partida */}
                  <div className="bg-white p-3 rounded border-l-4 border-yellow-500">
                    <Label className="text-sm font-medium text-yellow-700 mb-2 block">
                      🛫 Partida - Ida:
                    </Label>
                    <Input
                      type="time"
                      value={outboundDepartureTime}
                      onChange={(e) => setOutboundDepartureTime(e.target.value)}
                      className="text-sm"
                    />
                  </div>
                  
                  {/* Horário Voo Ida - Chegada */}
                  <div className="bg-white p-3 rounded border-l-4 border-orange-500">
                    <Label className="text-sm font-medium text-orange-700 mb-2 block">
                      🛬 Chegada - Ida:
                    </Label>
                    <Input
                      type="time"
                      value={outboundArrivalTime}
                      onChange={(e) => setOutboundArrivalTime(e.target.value)}
                      className="text-sm"
                    />
                  </div>
                  
                  {/* Duração Voo Ida */}
                  <div className="bg-white p-3 rounded border-l-4 border-green-500">
                    <Label className="text-sm font-medium text-green-700 mb-2 block">
                      ⏱️ Duração - Ida:
                    </Label>
                    <Input
                      value={outboundFlightDuration}
                      onChange={(e) => setOutboundFlightDuration(e.target.value)}
                      placeholder="Ex: 8h 30min"
                      className="text-sm"
                      readOnly
                    />
                  </div>
                  
                  {/* Horário Voo Volta - Partida */}
                  {tripType === 'ida-volta' && (
                    <div className="bg-white p-3 rounded border-l-4 border-purple-500">
                      <Label className="text-sm font-medium text-purple-700 mb-2 block">
                        🛫 Partida - Volta:
                      </Label>
                      <Input
                        type="time"
                        value={returnDepartureTime}
                        onChange={(e) => setReturnDepartureTime(e.target.value)}
                        className="text-sm"
                      />
                    </div>
                  )}
                  
                  {/* Horário Voo Volta - Chegada */}
                  {tripType === 'ida-volta' && (
                    <div className="bg-white p-3 rounded border-l-4 border-indigo-500">
                      <Label className="text-sm font-medium text-indigo-700 mb-2 block">
                        🛬 Chegada - Volta:
                      </Label>
                      <Input
                        type="time"
                        value={returnArrivalTime}
                        onChange={(e) => setReturnArrivalTime(e.target.value)}
                        className="text-sm"
                      />
                    </div>
                  )}
                  
                  {/* Duração Voo Volta */}
                  {tripType === 'ida-volta' && (
                    <div className="bg-white p-3 rounded border-l-4 border-teal-500">
                      <Label className="text-sm font-medium text-teal-700 mb-2 block">
                        ⏱️ Duração - Volta:
                      </Label>
                      <Input
                        value={returnFlightDuration}
                        onChange={(e) => setReturnFlightDuration(e.target.value)}
                        placeholder="Ex: 9h 15min"
                        className="text-sm"
                        readOnly
                      />
                    </div>
                  )}
                </div>
                
                {/* Seção de Escalas */}
                <div className="mt-4 bg-white p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center mb-3">
                    <input
                      type="checkbox"
                      id="hasStopover"
                      checked={hasStopover}
                      onChange={(e) => setHasStopover(e.target.checked)}
                      className="mr-2"
                    />
                    <Label htmlFor="hasStopover" className="text-sm font-medium text-gray-700">
                      🔄 Possui escalas/conexões
                    </Label>
                  </div>
                  
                  {hasStopover && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-3">
                      <div>
                        <Label className="text-sm font-medium text-gray-700 mb-2 block">
                          🏙️ Cidade da Escala:
                        </Label>
                        <Input
                          value={stopoverCity}
                          onChange={(e) => setStopoverCity(e.target.value)}
                          placeholder="Ex: Paris (CDG)"
                          className="text-sm"
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-700 mb-2 block">
                          🛬 Chegada na Escala:
                        </Label>
                        <Input
                          type="time"
                          value={stopoverArrivalTime}
                          onChange={(e) => setStopoverArrivalTime(e.target.value)}
                          className="text-sm"
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-700 mb-2 block">
                          🛫 Saída da Escala:
                        </Label>
                        <Input
                          type="time"
                          value={stopoverDepartureTime}
                          onChange={(e) => setStopoverDepartureTime(e.target.value)}
                          className="text-sm"
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-700 mb-2 block">
                          ⏱️ Tempo de Conexão:
                        </Label>
                        <Input
                          value={connectionDuration}
                          onChange={(e) => setConnectionDuration(e.target.value)}
                          placeholder="Ex: 2h 30min"
                          className="text-sm"
                          readOnly
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Observações */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-lg flex items-center mb-3">
                  <FileText className="mr-2 h-5 w-5 text-gray-600" />
                  📝 Observações da Viagem
                </h3>
                <textarea
                  value={reservationNotes}
                  onChange={(e) => setReservationNotes(e.target.value)}
                  placeholder="Informações adicionais: hotel, transfer, contatos de emergência, etc."
                  className="w-full h-24 p-3 border border-gray-300 rounded resize-none text-sm"
                />
              </div>

              {/* Passageiros */}
              <div>
                <h3 className="font-medium text-lg mb-4">
                  👥 Passageiros ({selectedReservation.passengers.length})
                </h3>
                
                {selectedReservation.passengers.map((passenger, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded mt-3">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-blue-600" />
                        <span className="font-medium">{passenger.name}</span>
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                          {passenger.type}
                        </span>
                        {index === 0 && (
                          <span className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded text-xs">
                            Principal
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {/* Mostrar dados dos passageiros */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                      {passenger.document && (
                        <p><span className="font-medium">Documento:</span> {passenger.document}</p>
                      )}
                      {passenger.nationality && (
                        <p><span className="font-medium">Nacionalidade:</span> {passenger.nationality}</p>
                      )}
                      {passenger.birthDate && (
                        <p><span className="font-medium">Nascimento:</span> {new Date(passenger.birthDate).toLocaleDateString('pt-BR')}</p>
                      )}
                      {passenger.passportNumber && (
                        <p><span className="font-medium">Passaporte:</span> {passenger.passportNumber}</p>
                      )}
                      {passenger.passportExpiry && (
                        <p><span className="font-medium">Vencimento:</span> {new Date(passenger.passportExpiry).toLocaleDateString('pt-BR')}</p>
                      )}
                      {passenger.specialNeeds && (
                        <p className="text-orange-600"><span className="font-medium">Especial:</span> {passenger.specialNeeds}</p>
                      )}
                    </div>
                  </div>
                ))}
                
                {/* Add Passenger Button */}
                <Button
                  onClick={() => setIsAddPassengerOpen(true)}
                  className="w-full flex items-center justify-center space-x-2 border-2 border-dashed border-blue-300 bg-blue-50 hover:bg-blue-100 text-blue-600 mt-4"
                  variant="outline"
                >
                  <Plus className="h-4 w-4" />
                  <span>➕ Adicionar Novo Passageiro</span>
                </Button>
              </div>

              {/* Save Button */}
              <div className="flex justify-end pt-4 border-t">
                <Button
                  onClick={saveReservationChanges}
                  className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-medium"
                >
                  💾 Salvar Todas as Alterações
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Passenger Modal */}
      {isAddPassengerOpen && selectedReservation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold flex items-center">
                <Plus className="mr-2 h-5 w-5 text-blue-600" />
                ➕ Adicionar Novo Passageiro
              </h2>
              <button 
                onClick={() => setIsAddPassengerOpen(false)}
                className="text-gray-500 hover:text-gray-700 text-xl font-bold"
              >
                ✕
              </button>
            </div>
            
            <p className="text-sm text-gray-600 mb-4">
              Reserva: {selectedReservation.internalCode}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="passengerName">Nome Completo *</Label>
                <Input
                  id="passengerName"
                  type="text"
                  value={newPassenger.name}
                  onChange={(e) => setNewPassenger({...newPassenger, name: e.target.value})}
                  placeholder="Nome completo do passageiro"
                />
              </div>

              <div>
                <Label htmlFor="passengerDocument">Documento</Label>
                <Input
                  id="passengerDocument"
                  type="text"
                  value={newPassenger.document}
                  onChange={(e) => setNewPassenger({...newPassenger, document: e.target.value})}
                  placeholder="RG, CPF, Passaporte"
                />
              </div>

              <div>
                <Label htmlFor="passengerNationality">Nacionalidade</Label>
                <Input
                  id="passengerNationality"
                  type="text"
                  value={newPassenger.nationality}
                  onChange={(e) => setNewPassenger({...newPassenger, nationality: e.target.value})}
                  placeholder="Brasileira"
                />
              </div>

              <div>
                <Label htmlFor="passengerBirthDate">Data de Nascimento</Label>
                <Input
                  id="passengerBirthDate"
                  type="date"
                  value={newPassenger.birthDate}
                  onChange={(e) => setNewPassenger({...newPassenger, birthDate: e.target.value})}
                />
              </div>

              <div>
                <Label htmlFor="passengerPassportNumber">Número do Passaporte</Label>
                <Input
                  id="passengerPassportNumber"
                  type="text"
                  value={newPassenger.passportNumber}
                  onChange={(e) => setNewPassenger({...newPassenger, passportNumber: e.target.value})}
                  placeholder="BR123456789"
                />
              </div>

              <div>
                <Label htmlFor="passengerPassportExpiry">Vencimento do Passaporte</Label>
                <Input
                  id="passengerPassportExpiry"
                  type="date"
                  value={newPassenger.passportExpiry}
                  onChange={(e) => setNewPassenger({...newPassenger, passportExpiry: e.target.value})}
                />
              </div>

              <div>
                <Label htmlFor="passengerType">Tipo de Passageiro</Label>
                <select
                  id="passengerType"
                  value={newPassenger.type}
                  onChange={(e) => setNewPassenger({...newPassenger, type: e.target.value})}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                >
                  <option value="Adulto">Adulto</option>
                  <option value="Criança">Criança (2-11 anos)</option>
                  <option value="Bebê">Bebê (0-2 anos)</option>
                  <option value="Idoso">Idoso (60+ anos)</option>
                </select>
              </div>

              <div>
                <Label htmlFor="specialNeeds">Necessidades Especiais</Label>
                <Input
                  id="specialNeeds"
                  type="text"
                  value={newPassenger.specialNeeds}
                  onChange={(e) => setNewPassenger({...newPassenger, specialNeeds: e.target.value})}
                  placeholder="Dieta, mobilidade, etc."
                />
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <Button
                onClick={() => setIsAddPassengerOpen(false)}
                variant="outline"
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={addPassenger}
                disabled={!newPassenger.name.trim()}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                ➕ Adicionar Passageiro
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PassengerControlDirect;