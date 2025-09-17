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
        tripType: transaction.tripType || 'ida-volta',
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

      // CORREÇÃO: Recarregar dados para mostrar passageiros atualizados
      await loadReservations();

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
    // eslint-disable-next-line no-undef
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

        {/* NOVA SEÇÃO: Lista Completa de Passageiros */}
        {reservation.passengers && reservation.passengers.length > 0 && (
          <div className="bg-slate-50 p-3 rounded-lg mb-4">
            <h4 className="text-xs font-bold text-slate-700 mb-2 flex items-center">
              <Users className="h-3 w-3 mr-1" />
              👥 TODOS OS PASSAGEIROS ({reservation.passengers.length}):
            </h4>
            <div className="space-y-2">
              {reservation.passengers.map((passenger, index) => (
                <div key={index} className="bg-white p-2 rounded text-xs border-l-2 border-indigo-300">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-semibold text-indigo-900">
                        {index === 0 && '👑 '}{passenger.name || 'Nome não informado'}
                      </p>
                      <div className="text-slate-600 mt-1 space-y-1">
                        {passenger.document && (
                          <p className="flex items-center">
                            <span className="w-12 text-slate-500">Doc:</span>
                            <span>{passenger.document}</span>
                          </p>
                        )}
                        {passenger.birthDate && (
                          <p className="flex items-center">
                            <span className="w-12 text-slate-500">Nasc:</span>
                            <span>{new Date(passenger.birthDate).toLocaleDateString('pt-BR')}</span>
                          </p>
                        )}
                        {passenger.type && (
                          <p className="flex items-center">
                            <span className="w-12 text-slate-500">Tipo:</span>
                            <span className="px-1 py-0.5 bg-blue-100 text-blue-800 rounded text-xs">
                              {passenger.type}
                            </span>
                          </p>
                        )}
                        {passenger.passportNumber && (
                          <p className="flex items-center">
                            <span className="w-12 text-slate-500">Pass:</span>
                            <span>{passenger.passportNumber}</span>
                            {passenger.passportExpiry && (
                              <span className="text-red-600 ml-1">
                                (exp: {new Date(passenger.passportExpiry).toLocaleDateString('pt-BR')})
                              </span>
                            )}
                          </p>
                        )}
                        {passenger.status && (
                          <p className="flex items-center">
                            <span className="w-12 text-slate-500">Status:</span>
                            <span className={`px-1 py-0.5 rounded text-xs ${
                              passenger.status === 'Confirmado' ? 'bg-green-100 text-green-800' :
                              passenger.status === 'Pendente' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {passenger.status}
                            </span>
                          </p>
                        )}
                        {passenger.specialNeeds && (
                          <p className="flex items-start">
                            <span className="w-12 text-slate-500 mt-0.5">Obs:</span>
                            <span className="text-orange-700 font-medium">{passenger.specialNeeds}</span>
                          </p>
                        )}
                      </div>
                    </div>
                    
                    {/* Badge para passageiro principal */}
                    {index === 0 && (
                      <span className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded text-xs font-bold ml-2">
                        PRINCIPAL
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

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
                      placeholder="E-ticket, Bilhete físico, etc."
                      className="text-sm"
                    />
                  </div>
                  
                  {/* Telefone do Fornecedor */}
                  <div className="bg-white p-3 rounded border-l-4 border-green-500">
                    <Label className="text-sm font-medium text-green-700 mb-2 block">
                      📞 Telefone Fornecedor:
                    </Label>
                    <Input
                      value={supplierPhone}
                      onChange={(e) => setSupplierPhone(e.target.value)}
                      placeholder="(11) 99999-9999"
                      className="text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* SEÇÃO VIAGEM - CAMPOS DE VIAGEM */}
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-medium text-lg flex items-center mb-4">
                  <Plane className="mr-2 h-5 w-5 text-green-600" />
                  ✈️ Detalhes da Viagem
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  {/* Companhia Aérea */}
                  <div className="bg-white p-3 rounded border-l-4 border-green-500">
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
                  <div className="bg-white p-3 rounded border-l-4 border-orange-500">
                    <Label className="text-sm font-medium text-orange-700 mb-2 block">
                      🎫 Número da Reserva:
                    </Label>
                    <Input
                      value={reservationNumber}
                      onChange={(e) => setReservationNumber(e.target.value)}
                      placeholder="Código de reserva"
                      className="text-sm"
                    />
                  </div>
                  
                  {/* Tipo de Produto */}
                  <div className="bg-white p-3 rounded border-l-4 border-indigo-500">
                    <Label className="text-sm font-medium text-indigo-700 mb-2 block">
                      📦 Tipo de Produto:
                    </Label>
                    <Input
                      value={productType}
                      onChange={(e) => setProductType(e.target.value)}
                      placeholder="Passagem, Hotel, Pacote, etc."
                      className="text-sm"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  {/* Código de Reserva do Cliente */}
                  <div className="bg-white p-3 rounded border-l-4 border-pink-500">
                    <Label className="text-sm font-medium text-pink-700 mb-2 block">
                      👤 Código Reserva Cliente:
                    </Label>
                    <Input
                      value={clientReservationCode}
                      onChange={(e) => setClientReservationCode(e.target.value)}
                      placeholder="Código fornecido ao cliente"
                      className="text-sm"
                    />
                  </div>
                  
                  {/* Tipo de Viagem */}
                  <div className="bg-white p-3 rounded border-l-4 border-cyan-500">
                    <Label className="text-sm font-medium text-cyan-700 mb-2 block">
                      🗺️ Tipo de Viagem:
                    </Label>
                    <select
                      value={tripType}
                      onChange={(e) => setTripType(e.target.value)}
                      className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                    >
                      <option value="ida">Só Ida</option>
                      <option value="ida-volta">Ida e Volta</option>
                    </select>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  {/* Cidade de Origem */}
                  <div className="bg-white p-3 rounded border-l-4 border-blue-500">
                    <Label className="text-sm font-medium text-blue-700 mb-2 block">
                      🏙️ Cidade de Origem:
                    </Label>
                    <Input
                      value={departureCity}
                      onChange={(e) => setDepartureCity(e.target.value)}
                      placeholder="Cidade de partida"
                      className="text-sm"
                    />
                  </div>
                  
                  {/* Cidade de Destino */}
                  <div className="bg-white p-3 rounded border-l-4 border-red-500">
                    <Label className="text-sm font-medium text-red-700 mb-2 block">
                      🏙️ Cidade de Destino:
                    </Label>
                    <Input
                      value={arrivalCity}
                      onChange={(e) => setArrivalCity(e.target.value)}
                      placeholder="Cidade de chegada"
                      className="text-sm"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Data de Ida */}
                  <div className="bg-white p-3 rounded border-l-4 border-green-500">
                    <Label className="text-sm font-medium text-green-700 mb-2 block">
                      📅 Data de Ida:
                    </Label>
                    <Input
                      type="date"
                      value={departureDate}
                      onChange={(e) => setDepartureDate(e.target.value)}
                      className="text-sm"
                    />
                  </div>
                  
                  {/* Data de Volta - Apenas se ida-volta */}
                  {tripType === 'ida-volta' && (
                    <div className="bg-white p-3 rounded border-l-4 border-orange-500">
                      <Label className="text-sm font-medium text-orange-700 mb-2 block">
                        📅 Data de Volta:
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

              {/* SEÇÃO HORÁRIOS - CAMPOS DE HORÁRIOS DE VOO */}
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h3 className="font-medium text-lg flex items-center mb-4">
                  <Clock className="mr-2 h-5 w-5 text-yellow-600" />
                  🕐 Horários de Voo
                </h3>
                
                {/* Horários da Ida */}
                <div className="mb-6">
                  <h4 className="font-medium text-md text-blue-700 mb-3">✈️ Voo de Ida</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white p-3 rounded border-l-4 border-blue-500">
                      <Label className="text-sm font-medium text-blue-700 mb-2 block">
                        🛫 Horário de Saída:
                      </Label>
                      <Input
                        type="time"
                        value={outboundDepartureTime}
                        onChange={(e) => setOutboundDepartureTime(e.target.value)}
                        className="text-sm"
                      />
                    </div>
                    
                    <div className="bg-white p-3 rounded border-l-4 border-green-500">
                      <Label className="text-sm font-medium text-green-700 mb-2 block">
                        🛬 Horário de Chegada:
                      </Label>
                      <Input
                        type="time"
                        value={outboundArrivalTime}
                        onChange={(e) => setOutboundArrivalTime(e.target.value)}
                        className="text-sm"
                      />
                    </div>
                    
                    <div className="bg-white p-3 rounded border-l-4 border-purple-500">
                      <Label className="text-sm font-medium text-purple-700 mb-2 block">
                        ⏱️ Duração do Voo:
                      </Label>
                      <Input
                        value={outboundFlightDuration}
                        onChange={(e) => setOutboundFlightDuration(e.target.value)}
                        placeholder="Ex: 2h 30min"
                        className="text-sm"
                      />
                    </div>
                  </div>
                </div>
                
                {/* Horários da Volta - Apenas se ida-volta */}
                {tripType === 'ida-volta' && (
                  <div>
                    <h4 className="font-medium text-md text-orange-700 mb-3">🔄 Voo de Volta</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-white p-3 rounded border-l-4 border-orange-500">
                        <Label className="text-sm font-medium text-orange-700 mb-2 block">
                          🛫 Horário de Saída:
                        </Label>
                        <Input
                          type="time"
                          value={returnDepartureTime}
                          onChange={(e) => setReturnDepartureTime(e.target.value)}
                          className="text-sm"
                        />
                      </div>
                      
                      <div className="bg-white p-3 rounded border-l-4 border-red-500">
                        <Label className="text-sm font-medium text-red-700 mb-2 block">
                          🛬 Horário de Chegada:
                        </Label>
                        <Input
                          type="time"
                          value={returnArrivalTime}
                          onChange={(e) => setReturnArrivalTime(e.target.value)}
                          className="text-sm"
                        />
                      </div>
                      
                      <div className="bg-white p-3 rounded border-l-4 border-indigo-500">
                        <Label className="text-sm font-medium text-indigo-700 mb-2 block">
                          ⏱️ Duração do Voo:
                        </Label>
                        <Input
                          value={returnFlightDuration}
                          onChange={(e) => setReturnFlightDuration(e.target.value)}
                          placeholder="Ex: 2h 15min"
                          className="text-sm"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* SEÇÃO ESCALAS */}
              <div className="bg-red-50 p-4 rounded-lg">
                <h3 className="font-medium text-lg flex items-center mb-4">
                  <MapPin className="mr-2 h-5 w-5 text-red-600" />
                  🛑 Escalas e Conexões
                </h3>
                
                {/* Checkbox para ativar escalas */}
                <div className="mb-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={hasStopover}
                      onChange={(e) => setHasStopover(e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm font-medium text-red-700">
                      ✈️ Esta viagem possui escalas
                    </span>
                  </label>
                </div>
                
                {/* Campos de escala - apenas se ativado */}
                {hasStopover && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white p-3 rounded border-l-4 border-red-500">
                      <Label className="text-sm font-medium text-red-700 mb-2 block">
                        🏙️ Cidade da Escala:
                      </Label>
                      <Input
                        value={stopoverCity}
                        onChange={(e) => setStopoverCity(e.target.value)}
                        placeholder="Ex: Paris"
                        className="text-sm"
                      />
                    </div>
                    
                    <div className="bg-white p-3 rounded border-l-4 border-yellow-500">
                      <Label className="text-sm font-medium text-yellow-700 mb-2 block">
                        🛬 Chegada na Escala:
                      </Label>
                      <Input
                        type="time"
                        value={stopoverArrivalTime}
                        onChange={(e) => setStopoverArrivalTime(e.target.value)}
                        className="text-sm"
                      />
                    </div>
                    
                    <div className="bg-white p-3 rounded border-l-4 border-blue-500">
                      <Label className="text-sm font-medium text-blue-700 mb-2 block">
                        🛫 Saída da Escala:
                      </Label>
                      <Input
                        type="time"
                        value={stopoverDepartureTime}
                        onChange={(e) => setStopoverDepartureTime(e.target.value)}
                        className="text-sm"
                      />
                    </div>
                    
                    <div className="bg-white p-3 rounded border-l-4 border-purple-500">
                      <Label className="text-sm font-medium text-purple-700 mb-2 block">
                        ⏱️ Tempo de Conexão:
                      </Label>
                      <Input
                        value={connectionDuration}
                        onChange={(e) => setConnectionDuration(e.target.value)}
                        placeholder="Ex: 1h 30min"
                        className="text-sm"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* SEÇÃO PASSAGEIROS */}
              <div className="bg-indigo-50 p-4 rounded-lg">
                <h3 className="font-medium text-lg flex items-center mb-4">
                  <Users className="mr-2 h-5 w-5 text-indigo-600" />
                  👥 Lista de Passageiros ({selectedReservation.passengers.length})
                </h3>
                
                {/* Lista de passageiros existentes */}
                <div className="space-y-3 mb-4">
                  {selectedReservation.passengers.map((passenger, index) => (
                    <div key={index} className="bg-white p-4 rounded-lg border border-indigo-200">
                      <div className="flex justify-between items-start">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1">
                          <div>
                            <Label className="text-xs font-medium text-indigo-700">Nome Completo:</Label>
                            <p className="text-sm font-semibold">{passenger.name || 'Nome não informado'}</p>
                          </div>
                          <div>
                            <Label className="text-xs font-medium text-indigo-700">Documento:</Label>
                            <p className="text-sm">{passenger.document || 'Não informado'}</p>
                          </div>
                          <div>
                            <Label className="text-xs font-medium text-indigo-700">Data de Nascimento:</Label>
                            <p className="text-sm">{passenger.birthDate || 'Não informado'}</p>
                          </div>
                        </div>
                        
                        {/* Botão eliminar passageiro - apenas se não for o principal */}
                        {index > 0 && (
                          <Button
                            onClick={() => removePassenger(index)}
                            variant="outline"
                            size="sm"
                            className="text-red-600 border-red-300 hover:bg-red-50 ml-4"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Botão adicionar passageiro */}
                <Button
                  onClick={() => setIsAddPassengerOpen(true)}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Novo Passageiro
                </Button>
              </div>

              {/* SEÇÃO OBSERVAÇÕES */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-lg flex items-center mb-4">
                  <FileText className="mr-2 h-5 w-5 text-gray-600" />
                  📝 Observações da Viagem
                </h3>
                
                <div className="bg-white p-3 rounded border-l-4 border-gray-500">
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">
                    💬 Notas Adicionais:
                  </Label>
                  <textarea
                    value={reservationNotes}
                    onChange={(e) => setReservationNotes(e.target.value)}
                    placeholder="Observações importantes sobre a viagem, instruções especiais, etc."
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                    rows="4"
                  />
                </div>
              </div>

              {/* BOTÕES DE AÇÃO */}
              <div className="flex justify-end space-x-4 pt-6 border-t">
                <Button
                  onClick={() => setSelectedReservation(null)}
                  variant="outline"
                  className="px-6 py-2"
                >
                  Cancelar
                </Button>
                
                <Button
                  onClick={saveReservationChanges}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  💾 Salvar Alterações
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL ADICIONAR PASSAGEIRO */}
      {isAddPassengerOpen && selectedReservation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold flex items-center">
                <User className="mr-2 h-5 w-5" />
                👤 Adicionar Novo Passageiro
              </h2>
              <button 
                onClick={() => setIsAddPassengerOpen(false)}
                className="text-gray-500 hover:text-gray-700 text-xl font-bold"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              {/* Nome Completo */}
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block">
                  👤 Nome Completo:
                </Label>
                <Input
                  value={newPassenger.name}
                  onChange={(e) => setNewPassenger({...newPassenger, name: e.target.value})}
                  placeholder="Nome completo do passageiro"
                  className="w-full"
                />
              </div>
              
              {/* Documento e Data de Nascimento */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">
                    📄 CPF/RG:
                  </Label>
                  <Input
                    value={newPassenger.document}
                    onChange={(e) => setNewPassenger({...newPassenger, document: e.target.value})}
                    placeholder="000.000.000-00"
                    className="w-full"
                  />
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">
                    📅 Data de Nascimento:
                  </Label>
                  <Input
                    type="date"
                    value={newPassenger.birthDate}
                    onChange={(e) => setNewPassenger({...newPassenger, birthDate: e.target.value})}
                    className="w-full"
                  />
                </div>
              </div>
              
              {/* Tipo e Nacionalidade */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">
                    👨‍👩‍👧‍👦 Tipo de Passageiro:
                  </Label>
                  <select
                    value={newPassenger.type}
                    onChange={(e) => setNewPassenger({...newPassenger, type: e.target.value})}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                  >
                    <option value="Adulto">Adulto</option>
                    <option value="Criança">Criança</option>
                    <option value="Bebê">Bebê</option>
                    <option value="Idoso">Idoso</option>
                  </select>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">
                    🌍 Nacionalidade:
                  </Label>
                  <Input
                    value={newPassenger.nationality}
                    onChange={(e) => setNewPassenger({...newPassenger, nationality: e.target.value})}
                    placeholder="Brasileira"
                    className="w-full"
                  />
                </div>
              </div>
              
              {/* Dados do Passaporte */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">
                    📘 Número do Passaporte:
                  </Label>
                  <Input
                    value={newPassenger.passportNumber}
                    onChange={(e) => setNewPassenger({...newPassenger, passportNumber: e.target.value})}
                    placeholder="BR123456789"
                    className="w-full"
                  />
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">
                    📅 Data de Vencimento:
                  </Label>
                  <Input
                    type="date"
                    value={newPassenger.passportExpiry}
                    onChange={(e) => setNewPassenger({...newPassenger, passportExpiry: e.target.value})}
                    className="w-full"
                  />
                </div>
              </div>
              
              {/* Informações Especiais */}
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block">
                  💬 Informações Especiais:
                </Label>
                <textarea
                  value={newPassenger.specialNeeds}
                  onChange={(e) => setNewPassenger({...newPassenger, specialNeeds: e.target.value})}
                  placeholder="Necessidades especiais, restrições alimentares, etc."
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  rows="3"
                />
              </div>
              
              {/* Status */}
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block">
                  ✅ Status:
                </Label>
                <select
                  value={newPassenger.status}
                  onChange={(e) => setNewPassenger({...newPassenger, status: e.target.value})}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                >
                  <option value="Confirmado">Confirmado</option>
                  <option value="Pendente">Pendente</option>
                  <option value="Cancelado">Cancelado</option>
                </select>
              </div>
              
              {/* Botões */}
              <div className="flex justify-end space-x-4 pt-6 border-t">
                <Button
                  onClick={() => setIsAddPassengerOpen(false)}
                  variant="outline"
                  className="px-6 py-2"
                >
                  Cancelar
                </Button>
                
                <Button
                  onClick={addPassenger}
                  className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  👤 Adicionar Passageiro
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PassengerControlDirect;
