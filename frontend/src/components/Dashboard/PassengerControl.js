import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { useToast } from '../../hooks/use-toast';
import api from '../../services/api';
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
        transaction.internalReservationCode &&
        !transaction.hiddenFromPassengerControl  // CORREÇÃO: Filtrar reservas ocultas
        // Removed city requirement since flight details are managed in the modal
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
      // CORREÇÃO: Incluir campos obrigatórios para evitar erro 422
      const updatedData = {
        // Campos obrigatórios do backend
        type: selectedReservation.type || 'entrada',
        category: selectedReservation.category || 'Passagem Aérea',
        description: selectedReservation.description || selectedReservation.client || 'Reserva',
        amount: selectedReservation.amount || 1000,
        paymentMethod: selectedReservation.paymentMethod || 'PIX',
        
        // Campos existentes
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

  // Função para gerar notificações baseadas nas reservas
  const getNotifications = () => {
    const notifications = [];
    const today = new Date();
    
    reservations.forEach(reservation => {
      const travelStatus = getTravelStatus(reservation);
      const passengerName = reservation.client || reservation.passengers[0]?.name || 'Cliente';
      
      // Notificações para viagens hoje
      if (travelStatus.status === 'today') {
        notifications.push({
          id: `today-${reservation.id}`,
          type: 'urgent',
          icon: '🚨',
          title: 'Viagem HOJE!',
          message: `${passengerName} tem ${travelStatus.displayLabel.toLowerCase()} hoje (${reservation.internalCode})`,
          reservation: reservation,
          priority: 1
        });
      }
      
      // Notificações para viagens amanhã
      if (travelStatus.status === 'tomorrow') {
        notifications.push({
          id: `tomorrow-${reservation.id}`,
          type: 'warning',
          icon: '⚠️',
          title: 'Viagem Amanhã',
          message: `${passengerName} tem ${travelStatus.displayLabel.toLowerCase()} amanhã (${reservation.internalCode})`,
          reservation: reservation,
          priority: 2
        });
      }
      
      // Notificações para viagens em 2-7 dias (importantes)
      if (travelStatus.status === 'upcoming' && typeof travelStatus.daysCount === 'number' && travelStatus.daysCount <= 7) {
        notifications.push({
          id: `upcoming-${reservation.id}`,
          type: 'info',
          icon: '📅',
          title: 'Viagem Próxima',
          message: `${passengerName} tem ${travelStatus.displayLabel.toLowerCase()} em ${travelStatus.daysCount} dias (${reservation.internalCode})`,
          reservation: reservation,
          priority: 3
        });
      }
      
      // Notificações para clientes aguardando volta
      if (travelStatus.phase === 'return') {
        const daysUntilReturn = travelStatus.daysCount;
        notifications.push({
          id: `return-${reservation.id}`,
          type: 'return',
          icon: '🔄',
          title: 'Aguardando Volta',
          message: `${passengerName} está na viagem, volta ${daysUntilReturn === 0 ? 'hoje' : daysUntilReturn === 1 ? 'amanhã' : `em ${daysUntilReturn} dias`} (${reservation.internalCode})`,
          reservation: reservation,
          priority: travelStatus.status === 'today' ? 1 : travelStatus.status === 'tomorrow' ? 2 : 3
        });
      }
    });
    
    // Ordenar por prioridade
    return notifications.sort((a, b) => a.priority - b.priority);
  };

  const deleteReservation = async (reservationId) => {
    const confirmCode = prompt('⚠️ ATENÇÃO: Para confirmar a remoção desta reserva APENAS do Controle de Passageiros (sem afetar a venda), digite o código: 135200');
    
    if (confirmCode !== '135200') {
      if (confirmCode !== null) { // Se não cancelou
        toast({
          variant: "destructive",
          title: "Código incorreto",
          description: "Código de confirmação incorreto. Operação cancelada."
        });
      }
      return;
    }

    try {
      setLoading(true);
      
      // CORREÇÃO: Usar endpoint específico que apenas oculta do controle
      const response = await api.patch(`/transactions/${reservationId}/hide-from-passenger-control`);
      
      if (response.status === 200) {
        toast({
          variant: "default",
          title: "Reserva removida do controle",
          description: "Reserva removida do Controle de Passageiros (venda mantida em Transações)"
        });
        
        // Recarregar a lista de reservas
        await loadReservations();
      }
    } catch (error) {
      console.error('Erro ao remover reserva do controle:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: error.response?.data?.detail || "Erro ao remover reserva do controle"
      });
    } finally {
      setLoading(false);
    }
  };

  const notifications = getNotifications();

  // Função para renderizar um card de reserva
  function renderReservationCard(reservation, cardType, cardKey) {
    const travelStatus = getTravelStatus(reservation);
    const reminderStatus = getReminderStatus(travelStatus);
    
    // Definir dados específicos para IDA ou VOLTA
    const isReturnCard = cardType === 'volta';
    const cardDate = isReturnCard ? reservation.returnDate : reservation.departureDate;
    const cardTitle = isReturnCard ? '🔄 VOLTA' : '✈️ IDA';
    const cardBorderColor = isReturnCard ? 'border-l-4 border-orange-500' : 'border-l-4 border-blue-500';
    const cardBgColor = isReturnCard ? 'bg-orange-50' : 'bg-blue-50';
            
    return (
      <div key={cardKey} data-reservation-id={reservation.id} className={`bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6 ${cardBorderColor}`}>
        {/* Header com identificação IDA/VOLTA */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <h3 className="text-lg font-semibold">
                🔗 {reservation.internalCode}
              </h3>
              <span className={`px-2 py-1 rounded text-xs font-bold ${isReturnCard ? 'bg-orange-100 text-orange-800' : 'bg-blue-100 text-blue-800'}`}>
                {cardTitle}
              </span>
            </div>
            <p className="text-gray-600 text-sm">
              Cliente: {reservation.client || reservation.clientReservationCode || 'N/A'}
            </p>
          </div>
          <div className="text-right">
            <span className={`px-2 py-1 rounded text-xs font-medium ${reminderStatus.bgColor} ${reminderStatus.textColor} block mb-1`}>
              {reminderStatus.text}
            </span>
            {/* Status da viagem */}
            <span className={`px-2 py-1 rounded text-xs font-medium ${
              travelStatus.phase === 'completed' ? 'bg-gray-100 text-gray-800' :
              travelStatus.phase === 'return' ? 'bg-blue-100 text-blue-800' :
              'bg-green-100 text-green-800'
            }`}>
              {travelStatus.phase === 'completed' ? '✅ Completa' :
               travelStatus.phase === 'return' ? '🔄 Aguardando volta' :
               '📅 Programada'}
            </span>
          </div>
        </div>
        
        {/* Main Passenger - Prominently displayed */}
        <div className={`${cardBgColor} p-3 rounded-lg mb-4`}>
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
            <span>
              {isReturnCard ? 
                `${reservation.arrivalCity} → ${reservation.departureCity}` : 
                `${reservation.departureCity} → ${reservation.arrivalCity}`
              }
            </span>
          </div>
          
          {/* Data específica do card */}
          {cardDate && (
            <div className="flex items-center text-sm">
              <Calendar className="h-4 w-4 mr-2 text-purple-600" />
              <span className="font-medium">
                {new Date(cardDate).toLocaleDateString('pt-BR')}
              </span>
            </div>
          )}
          
          {/* Horários de voo */}
          {isReturnCard ? (
            // Horários da volta
            (reservation.returnDepartureTime || reservation.returnArrivalTime) && (
              <div className="flex items-center text-xs text-gray-600">
                <Clock className="h-3 w-3 mr-1" />
                <span>
                  {reservation.returnDepartureTime && `Saída: ${reservation.returnDepartureTime}`}
                  {reservation.returnDepartureTime && reservation.returnArrivalTime && ' • '}
                  {reservation.returnArrivalTime && `Chegada: ${reservation.returnArrivalTime}`}
                </span>
              </div>
            )
          ) : (
            // Horários da ida
            (reservation.outboundDepartureTime || reservation.outboundArrivalTime) && (
              <div className="flex items-center text-xs text-gray-600">
                <Clock className="h-3 w-3 mr-1" />
                <span>
                  {reservation.outboundDepartureTime && `Saída: ${reservation.outboundDepartureTime}`}
                  {reservation.outboundDepartureTime && reservation.outboundArrivalTime && ' • '}
                  {reservation.outboundArrivalTime && `Chegada: ${reservation.outboundArrivalTime}`}
                </span>
              </div>
            )
          )}
        </div>

        {/* Passengers Count */}
        <div className="flex items-center justify-between">
          <div className="flex items-center text-sm">
            <Users className="h-4 w-4 mr-2 text-indigo-600" />
            <span>{reservation.passengers.length} Passageiro(s)</span>
          </div>
          
          <div className="flex space-x-2">
            {/* Mostrar botão excluir apenas no card IDA */}
            {!isReturnCard && (
              <Button
                onClick={() => deleteReservation(reservation.id)}
                variant="outline"
                className="text-sm px-3 py-1 text-red-600 border-red-300 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Excluir
              </Button>
            )}
            
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
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Notificações */}
      {notifications.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center mb-4">
            <Bell className="h-5 w-5 mr-2 text-orange-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              🔔 Notificações de Viagem ({notifications.length})
            </h2>
          </div>
          
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {notifications.map(notification => (
              <div 
                key={notification.id}
                className={`p-3 rounded-lg border-l-4 ${
                  notification.type === 'urgent' ? 'bg-red-50 border-red-500' :
                  notification.type === 'warning' ? 'bg-orange-50 border-orange-500' :
                  notification.type === 'return' ? 'bg-blue-50 border-blue-500' :
                  'bg-blue-50 border-blue-500'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <span className="text-lg">{notification.icon}</span>
                    <div>
                      <h4 className={`font-medium ${
                        notification.type === 'urgent' ? 'text-red-800' :
                        notification.type === 'warning' ? 'text-orange-800' :
                        notification.type === 'return' ? 'text-blue-800' :
                        'text-blue-800'
                      }`}>
                        {notification.title}
                      </h4>
                      <p className={`text-sm ${
                        notification.type === 'urgent' ? 'text-red-700' :
                        notification.type === 'warning' ? 'text-orange-700' :
                        notification.type === 'return' ? 'text-blue-700' :
                        'text-blue-700'
                      }`}>
                        {notification.message}
                      </p>
                    </div>
                  </div>
                  
                  <Button
                    onClick={() => {
                      // Scroll to the specific reservation
                      const reservationElement = document.querySelector(`[data-reservation-id="${notification.reservation.id}"]`);
                      if (reservationElement) {
                        reservationElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        reservationElement.classList.add('ring-2', 'ring-blue-500', 'ring-opacity-50');
                        setTimeout(() => {
                          reservationElement.classList.remove('ring-2', 'ring-blue-500', 'ring-opacity-50');
                        }, 3000);
                      }
                    }}
                    variant="outline"
                    className="text-xs px-2 py-1 h-auto"
                  >
                    Ver Reserva
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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
            // Determinar se precisa criar cards separados para IDA e VOLTA
            // CORREÇÃO: Aceitar qualquer transação com returnDate preenchido
            const hasReturnDate = reservation.returnDate && reservation.returnDate.trim() !== '';
            
            if (hasReturnDate) {
              // Criar dois cards: um para IDA e um para VOLTA
              return [
                // CARD IDA
                renderReservationCard(reservation, 'ida', `${reservation.id}-ida`),
                // CARD VOLTA  
                renderReservationCard(reservation, 'volta', `${reservation.id}-volta`)
              ];
            } else {
              // Criar apenas um card para IDA
              return renderReservationCard(reservation, 'ida', reservation.id);
            }
          }).flat()}
        </div>
      )}
    </div>
  );

