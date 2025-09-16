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
  FileText,
  Trash2,
  X
} from 'lucide-react';
import { transactionsAPI } from '../../services/api';

const PassengerControlDirect = () => {
  console.log('🔥 PassengerControlDirect component loaded successfully!');
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [isAddPassengerOpen, setIsAddPassengerOpen] = useState(false);
  const [isAddReservationModalOpen, setIsAddReservationModalOpen] = useState(false);
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
  // Escalas da volta
  const [hasReturnStopover, setHasReturnStopover] = useState(false);
  const [returnStopoverCity, setReturnStopoverCity] = useState('');
  const [returnStopoverArrivalTime, setReturnStopoverArrivalTime] = useState('');
  const [returnStopoverDepartureTime, setReturnStopoverDepartureTime] = useState('');
  const [returnConnectionDuration, setReturnConnectionDuration] = useState('');
  
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
        (transaction.type === 'entrada' || transaction.type === 'entrada_vendas') && 
        transaction.internalReservationCode
        // Removed city requirement since flight details are managed in the modal
      );

      console.log('🔍 DEBUG - Found entry transactions:', entryTransactions.length);
      
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
      const updatedData = {
        passengers: selectedReservation.passengers,
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

      await transactionsAPI.updateTransaction(selectedReservation.id, updatedData);

      // Atualizar a lista local
      setReservations(prev => 
        prev.map(res => 
          res.id === selectedReservation.id 
            ? { ...res, ...updatedData }
            : res
        )
      );

      toast({
        title: "Alterações Salvas",
        description: "Os dados da reserva foram atualizados com sucesso",
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

  // Função para remover passageiro
  const removePassenger = (passengerIndex) => {
    if (passengerIndex === 0) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não é possível eliminar o passageiro principal"
      });
      return;
    }

    const updatedPassengers = selectedReservation.passengers.filter((_, index) => index !== passengerIndex);
    
    setSelectedReservation(prev => ({
      ...prev,
      passengers: updatedPassengers
    }));

    toast({
      title: "Passageiro Eliminado",
      description: "O passageiro foi removido da reserva"
    });
  };

  const getDaysUntilTravel = (departureDate) => {
    if (!departureDate) return null;
    const today = new Date();
    const travel = new Date(departureDate);
    const diffTime = travel - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Nova função para determinar qual data mostrar e o status da viagem
  const getTravelStatus = (reservation) => {
    const today = new Date();
    const departureDate = reservation.departureDate ? new Date(reservation.departureDate) : null;
    const returnDate = reservation.returnDate ? new Date(reservation.returnDate) : null;
    const isRoundTrip = reservation.tripType === 'ida-volta' && returnDate;

    if (!departureDate) {
      return {
        displayDate: null,
        displayLabel: 'Data não definida',
        status: 'incomplete',
        phase: 'pending'
      };
    }

    // Se é só ida ou não tem data de volta
    if (!isRoundTrip) {
      const daysUntilDeparture = Math.ceil((departureDate - today) / (1000 * 60 * 60 * 24));
      
      if (daysUntilDeparture < 0) {
        return {
          displayDate: departureDate,
          displayLabel: 'Viagem realizada',
          status: 'completed',
          phase: 'completed',
          daysCount: Math.abs(daysUntilDeparture) + ' dias atrás'
        };
      } else {
        return {
          displayDate: departureDate,
          displayLabel: 'Ida',
          status: daysUntilDeparture === 0 ? 'today' : 'upcoming',
          phase: 'outbound',
          daysCount: daysUntilDeparture
        };
      }
    }

    // Lógica para ida e volta
    const daysUntilDeparture = Math.ceil((departureDate - today) / (1000 * 60 * 60 * 24));
    const daysUntilReturn = Math.ceil((returnDate - today) / (1000 * 60 * 60 * 24));

    // Ainda não viajou (ida no futuro)
    if (daysUntilDeparture > 0) {
      return {
        displayDate: departureDate,
        displayLabel: 'Ida',
        status: daysUntilDeparture === 1 ? 'tomorrow' : 'upcoming',
        phase: 'outbound',
        daysCount: daysUntilDeparture,
        nextDate: returnDate,
        nextLabel: 'Volta'
      };
    }

    // Já fez a ida, aguardando volta (entre ida e volta)
    if (daysUntilDeparture <= 0 && daysUntilReturn > 0) {
      return {
        displayDate: returnDate,
        displayLabel: 'Volta',
        status: daysUntilReturn === 1 ? 'tomorrow' : daysUntilReturn === 0 ? 'today' : 'upcoming',
        phase: 'return',
        daysCount: daysUntilReturn,
        completedDate: departureDate,
        completedLabel: 'Ida realizada'
      };
    }

    // Viagem completa (volta no passado)
    if (daysUntilReturn < 0) {
      return {
        displayDate: returnDate,
        displayLabel: 'Viagem completa',
        status: 'completed',
        phase: 'completed',
        daysCount: Math.abs(daysUntilReturn) + ' dias atrás',
        completedDate: departureDate,
        completedLabel: 'Ida e volta realizadas'
      };
    }

    return {
      displayDate: departureDate,
      displayLabel: 'Ida',
      status: 'upcoming',
      phase: 'outbound',
      daysCount: daysUntilDeparture
    };
  };

  const getReminderStatus = (travelStatus) => {
    const { status, daysCount, phase } = travelStatus;
    
    if (status === 'completed') {
      return { 
        status: 'completed', 
        color: 'gray', 
        text: travelStatus.daysCount,
        bgColor: 'bg-gray-100',
        textColor: 'text-gray-600'
      };
    }
    
    if (status === 'today') {
      return { 
        status: 'today', 
        color: 'red', 
        text: 'HOJE!',
        bgColor: 'bg-red-100',
        textColor: 'text-red-800'
      };
    }
    
    if (status === 'tomorrow') {
      return { 
        status: 'tomorrow', 
        color: 'orange', 
        text: 'Amanhã',
        bgColor: 'bg-orange-100',
        textColor: 'text-orange-800'
      };
    }

    const days = typeof daysCount === 'number' ? daysCount : 0;
    
    if (days <= 2) {
      return { 
        status: 'urgent', 
        color: 'red', 
        text: `${days} dias`,
        bgColor: 'bg-red-100',
        textColor: 'text-red-800'
      };
    }
    
    if (days <= 7) {
      return { 
        status: 'warning', 
        color: 'yellow', 
        text: `${days} dias`,
        bgColor: 'bg-yellow-100',
        textColor: 'text-yellow-800'
      };
    }
    
    if (days <= 15) {
      return { 
        status: 'upcoming', 
        color: 'blue', 
        text: `${days} dias`,
        bgColor: 'bg-blue-100',
        textColor: 'text-blue-800'
      };
    }
    
    if (days <= 30) {
      return { 
        status: 'planned', 
        color: 'green', 
        text: `${days} dias`,
        bgColor: 'bg-green-100',
        textColor: 'text-green-800'
      };
    }
    
    return { 
      status: 'future', 
      color: 'gray', 
      text: `${days} dias`,
      bgColor: 'bg-gray-100',
      textColor: 'text-gray-600'
    };
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
          <button
            onClick={() => setIsAddReservationModalOpen(true)}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Adicionar Reserva</span>
          </button>
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
                        Ida: {new Date(reservation.departureDate).toLocaleDateString('pt-BR')}
                        {reservation.returnDate && reservation.tripType === 'ida-volta' && (
                          <span className="ml-3 pl-3 border-l border-gray-300">
                            Volta: {new Date(reservation.returnDate).toLocaleDateString('pt-BR')}
                          </span>
                        )}
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
                
                {/* PRIMEIRA LINHA: Tipo Produto, Código Reserva, Cia Aérea */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="bg-white p-4 rounded-lg border-l-4 border-blue-500 shadow-sm">
                    <Label className="text-sm font-medium text-blue-700 mb-2 block">
                      🎫 1. Tipo de Produto
                    </Label>
                    <Input
                      value={productType}
                      onChange={(e) => setProductType(e.target.value)}
                      placeholder="Passagem aérea, pacote, etc."
                      className="text-sm"
                    />
                  </div>
                  
                  <div className="bg-white p-4 rounded-lg border-l-4 border-green-500 shadow-sm">
                    <Label className="text-sm font-medium text-green-700 mb-2 block">
                      🏷️ 2. Código Reserva Cliente
                    </Label>
                    <Input
                      value={clientReservationCode}
                      onChange={(e) => setClientReservationCode(e.target.value)}
                      placeholder="Código fornecido pelo cliente"
                      className="text-sm"
                    />
                  </div>
                  
                  <div className="bg-white p-4 rounded-lg border-l-4 border-purple-500 shadow-sm">
                    <Label className="text-sm font-medium text-purple-700 mb-2 block">
                      ✈️ 3. Companhia Aérea
                    </Label>
                    <Input
                      value={editableAirline}
                      onChange={(e) => setEditableAirline(e.target.value)}
                      placeholder="Nome da companhia aérea"
                      className="text-sm"
                    />
                  </div>
                </div>

                {/* SEGUNDA LINHA: Cidade Saída, Cidade Chegada, Tipo Viagem */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="bg-white p-4 rounded-lg border-l-4 border-orange-500 shadow-sm">
                    <Label className="text-sm font-medium text-orange-700 mb-2 block">
                      🛫 4. Cidade de Saída
                    </Label>
                    <Input
                      value={departureCity}
                      onChange={(e) => setDepartureCity(e.target.value)}
                      placeholder="São Paulo (GRU)"
                      className="text-sm"
                    />
                  </div>
                  
                  <div className="bg-white p-4 rounded-lg border-l-4 border-teal-500 shadow-sm">
                    <Label className="text-sm font-medium text-teal-700 mb-2 block">
                      🛬 5. Cidade de Chegada
                    </Label>
                    <Input
                      value={arrivalCity}
                      onChange={(e) => setArrivalCity(e.target.value)}
                      placeholder="Lisboa (LIS)"
                      className="text-sm"
                    />
                  </div>
                  
                  <div className="bg-white p-4 rounded-lg border-l-4 border-indigo-500 shadow-sm">
                    <Label className="text-sm font-medium text-indigo-700 mb-2 block">
                      🔄 6. Tipo de Viagem
                    </Label>
                    <select
                      value={tripType}
                      onChange={(e) => setTripType(e.target.value)}
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-200"
                    >
                      <option value="ida-volta">Ida e Volta</option>
                      <option value="ida">Somente Ida</option>
                      <option value="multiplos-destinos">Múltiplos Destinos</option>
                    </select>
                  </div>
                </div>

                {/* TERCEIRA LINHA: Datas da Viagem */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg mb-4">
                  <h4 className="text-lg font-bold text-green-800 mb-4">📅 7. Datas da Viagem</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-lg border-l-4 border-green-500 shadow-sm">
                      <Label className="text-sm font-medium text-green-700 mb-2 block">
                        📅 Data de Ida *
                      </Label>
                      <Input
                        type="date"
                        value={departureDate}
                        onChange={(e) => setDepartureDate(e.target.value)}
                        className="text-sm"
                      />
                    </div>
                    
                    {tripType === 'ida-volta' && (
                      <div className="bg-white p-4 rounded-lg border-l-4 border-blue-500 shadow-sm">
                        <Label className="text-sm font-medium text-blue-700 mb-2 block">
                          📅 Data de Volta
                        </Label>
                        <Input
                          type="date"
                          value={returnDate}
                          onChange={(e) => setReturnDate(e.target.value)}
                          className="text-sm"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* QUARTA LINHA: Títulos dos Voos */}
                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-4 rounded-lg mb-4">
                  <h4 className="text-lg font-bold text-yellow-800 mb-2">🕐 8. Horários dos Voos</h4>
                  <h5 className="text-md font-semibold text-orange-700">✈️ 9. Voo de Ida</h5>
                </div>

                {/* QUINTA LINHA: Horários Ida + Escala Ida */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div className="bg-white p-4 rounded-lg border-l-4 border-yellow-500 shadow-sm">
                    <Label className="text-sm font-medium text-yellow-700 mb-2 block">
                      🛫 10. Horário Saída - Ida
                    </Label>
                    <Input
                      type="time"
                      value={outboundDepartureTime}
                      onChange={(e) => setOutboundDepartureTime(e.target.value)}
                      className="text-sm"
                    />
                  </div>
                  
                  <div className="bg-white p-4 rounded-lg border-l-4 border-orange-500 shadow-sm">
                    <Label className="text-sm font-medium text-orange-700 mb-2 block">
                      🛬 11. Horário Chegada - Ida
                    </Label>
                    <Input
                      type="time"
                      value={outboundArrivalTime}
                      onChange={(e) => setOutboundArrivalTime(e.target.value)}
                      className="text-sm"
                    />
                  </div>
                  
                  <div className="bg-white p-4 rounded-lg border-l-4 border-green-500 shadow-sm">
                    <Label className="text-sm font-medium text-green-700 mb-2 block">
                      ⏱️ 12. Duração - Ida (Automático)
                    </Label>
                    <Input
                      value={outboundFlightDuration}
                      placeholder="Calculado automaticamente"
                      className="text-sm bg-gray-50"
                      readOnly
                    />
                  </div>
                  
                  <div className="bg-white p-4 rounded-lg border-l-4 border-red-500 shadow-sm">
                    <Label className="text-sm font-medium text-red-700 mb-2 block">
                      🔄 13. Tem Escala na Ida?
                    </Label>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="hasOutboundStopover"
                        checked={hasStopover}
                        onChange={(e) => setHasStopover(e.target.checked)}
                        className="mr-2 w-4 h-4"
                      />
                      <Label htmlFor="hasOutboundStopover" className="text-sm">
                        Sim, possui escala
                      </Label>
                    </div>
                  </div>
                </div>

                {/* QUINTA LINHA: Detalhes Escala Ida (se tiver) */}
                {hasStopover && (
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 bg-red-50 p-4 rounded-lg">
                    <div className="bg-white p-4 rounded-lg border-l-4 border-pink-500 shadow-sm">
                      <Label className="text-sm font-medium text-pink-700 mb-2 block">
                        🏙️ 13. Cidade de Escala - Ida
                      </Label>
                      <Input
                        value={stopoverCity}
                        onChange={(e) => setStopoverCity(e.target.value)}
                        placeholder="Ex: Paris (CDG)"
                        className="text-sm"
                      />
                    </div>
                    
                    <div className="bg-white p-4 rounded-lg border-l-4 border-purple-500 shadow-sm">
                      <Label className="text-sm font-medium text-purple-700 mb-2 block">
                        🛬 14. Chegada na Escala
                      </Label>
                      <Input
                        type="time"
                        value={stopoverArrivalTime}
                        onChange={(e) => setStopoverArrivalTime(e.target.value)}
                        className="text-sm"
                      />
                    </div>
                    
                    <div className="bg-white p-4 rounded-lg border-l-4 border-cyan-500 shadow-sm">
                      <Label className="text-sm font-medium text-cyan-700 mb-2 block">
                        🛫 15. Saída da Escala
                      </Label>
                      <Input
                        type="time"
                        value={stopoverDepartureTime}
                        onChange={(e) => setStopoverDepartureTime(e.target.value)}
                        className="text-sm"
                      />
                    </div>
                    
                    <div className="bg-white p-4 rounded-lg border-l-4 border-emerald-500 shadow-sm">
                      <Label className="text-sm font-medium text-emerald-700 mb-2 block">
                        ⏱️ 16. Duração Conexão (Automático)
                      </Label>
                      <Input
                        value={connectionDuration}
                        placeholder="Calculado automaticamente"
                        className="text-sm bg-gray-50"
                        readOnly
                      />
                    </div>
                  </div>
                )}

                {/* SEXTA LINHA: Título Voo de Volta (se ida e volta) */}
                {tripType === 'ida-volta' && (
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg mb-4">
                    <h5 className="text-md font-semibold text-blue-700">🔄 17. Voo de Volta</h5>
                  </div>
                )}

                {/* SÉTIMA LINHA: Horários Volta + Escala Volta */}
                {tripType === 'ida-volta' && (
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div className="bg-white p-4 rounded-lg border-l-4 border-blue-500 shadow-sm">
                      <Label className="text-sm font-medium text-blue-700 mb-2 block">
                        🛫 18. Horário Saída - Volta
                      </Label>
                      <Input
                        type="time"
                        value={returnDepartureTime}
                        onChange={(e) => setReturnDepartureTime(e.target.value)}
                        className="text-sm"
                      />
                    </div>
                    
                    <div className="bg-white p-4 rounded-lg border-l-4 border-indigo-500 shadow-sm">
                      <Label className="text-sm font-medium text-indigo-700 mb-2 block">
                        🛬 19. Horário Chegada - Volta
                      </Label>
                      <Input
                        type="time"
                        value={returnArrivalTime}
                        onChange={(e) => setReturnArrivalTime(e.target.value)}
                        className="text-sm"
                      />
                    </div>
                    
                    <div className="bg-white p-4 rounded-lg border-l-4 border-teal-500 shadow-sm">
                      <Label className="text-sm font-medium text-teal-700 mb-2 block">
                        ⏱️ 20. Duração - Volta (Automático)
                      </Label>
                      <Input
                        value={returnFlightDuration}
                        placeholder="Calculado automaticamente"
                        className="text-sm bg-gray-50"
                        readOnly
                      />
                    </div>
                    
                    <div className="bg-white p-4 rounded-lg border-l-4 border-violet-500 shadow-sm">
                      <Label className="text-sm font-medium text-violet-700 mb-2 block">
                        🔄 21. Tem Escala na Volta?
                      </Label>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="hasReturnStopover"
                          checked={hasReturnStopover}
                          onChange={(e) => setHasReturnStopover(e.target.checked)}
                          className="mr-2 w-4 h-4"
                        />
                        <Label htmlFor="hasReturnStopover" className="text-sm">
                          Sim, possui escala
                        </Label>
                      </div>
                    </div>
                  </div>
                )}

                {/* OITAVA LINHA: Detalhes Escala Volta (se tiver) */}
                {tripType === 'ida-volta' && hasReturnStopover && (
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 bg-violet-50 p-4 rounded-lg">
                    <div className="bg-white p-4 rounded-lg border-l-4 border-rose-500 shadow-sm">
                      <Label className="text-sm font-medium text-rose-700 mb-2 block">
                        🏙️ 22. Cidade de Escala - Volta
                      </Label>
                      <Input
                        value={returnStopoverCity}
                        onChange={(e) => setReturnStopoverCity(e.target.value)}
                        placeholder="Ex: Madrid (MAD)"
                        className="text-sm"
                      />
                    </div>
                    
                    <div className="bg-white p-4 rounded-lg border-l-4 border-amber-500 shadow-sm">
                      <Label className="text-sm font-medium text-amber-700 mb-2 block">
                        🛬 23. Chegada na Escala - Volta
                      </Label>
                      <Input
                        type="time"
                        value={returnStopoverArrivalTime}
                        onChange={(e) => setReturnStopoverArrivalTime(e.target.value)}
                        className="text-sm"
                      />
                    </div>
                    
                    <div className="bg-white p-4 rounded-lg border-l-4 border-lime-500 shadow-sm">
                      <Label className="text-sm font-medium text-lime-700 mb-2 block">
                        🛫 24. Saída da Escala - Volta
                      </Label>
                      <Input
                        type="time"
                        value={returnStopoverDepartureTime}
                        onChange={(e) => setReturnStopoverDepartureTime(e.target.value)}
                        className="text-sm"
                      />
                    </div>
                    
                    <div className="bg-white p-4 rounded-lg border-l-4 border-sky-500 shadow-sm">
                      <Label className="text-sm font-medium text-sky-700 mb-2 block">
                        ⏱️ 25. Duração Conexão - Volta (Automático)
                      </Label>
                      <Input
                        value={returnConnectionDuration}
                        placeholder="Calculado automaticamente"
                        className="text-sm bg-gray-50"
                        readOnly
                      />
                    </div>
                  </div>
                )}
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
                      {/* Botão Eliminar Passageiro (não permite eliminar o principal) */}
                      {index > 0 && (
                        <button
                          onClick={() => removePassenger(index)}
                          className="flex items-center space-x-1 px-2 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded text-xs transition-colors"
                          title="Eliminar passageiro"
                        >
                          <Trash2 className="h-3 w-3" />
                          <span>Eliminar</span>
                        </button>
                      )}
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

      {/* Modal - Adicionar Reserva Manualmente */}
      {isAddReservationModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto m-4">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-800">
                  ➕ Adicionar Nova Reserva
                </h3>
                <button
                  onClick={() => setIsAddReservationModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Código Interno *</label>
                  <input
                    type="text"
                    placeholder="RT-2025-XXXX"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Cliente *</label>
                  <input
                    type="text"
                    placeholder="Nome do cliente"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Cia Aérea</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-md">
                    <option value="">Selecione...</option>
                    <option value="GOL">GOL</option>
                    <option value="LATAM">LATAM</option>
                    <option value="Azul">Azul</option>
                    <option value="TAP">TAP</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-200 flex space-x-3">
              <button
                onClick={() => setIsAddReservationModalOpen(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  alert('Modal funcionando! Funcionalidade será implementada.');
                  setIsAddReservationModalOpen(false);
                }}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Salvar Reserva
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PassengerControlDirect;