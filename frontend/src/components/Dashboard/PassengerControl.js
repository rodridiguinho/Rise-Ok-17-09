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
  User
} from 'lucide-react';
import { api } from '../../services/api';

const PassengerControl = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [isAddPassengerOpen, setIsAddPassengerOpen] = useState(false);
  const [newPassenger, setNewPassenger] = useState({
    name: '',
    document: '',
    birthDate: '',
    type: 'Adulto',
    seat: '',
    baggage: '',
    specialNeeds: '',
    status: 'Confirmado'
  });
  const { toast } = useToast();

  // Carregar reservas das transações de entrada
  useEffect(() => {
    loadReservations();
  }, []);

  const loadReservations = async () => {
    setLoading(true);
    try {
      // Buscar todas as transações de entrada com código interno
      const response = await api.getTransactions();
      
      const entryTransactions = response.filter(transaction => 
        transaction.type === 'entrada' && 
        transaction.internalReservationCode &&
        (transaction.departureCity || transaction.arrivalCity)
      );

      // Transformar transações em reservas
      const reservationsData = entryTransactions.map(transaction => ({
        id: transaction.id,
        internalCode: transaction.internalReservationCode,
        clientReservationCode: transaction.clientReservationCode,
        client: transaction.client,
        airline: transaction.airline,
        departureCity: transaction.departureCity,
        arrivalCity: transaction.arrivalCity,
        departureDate: transaction.departureDate,
        returnDate: transaction.returnDate,
        outboundDepartureTime: transaction.outboundDepartureTime,
        outboundArrivalTime: transaction.outboundArrivalTime,
        returnDepartureTime: transaction.returnDepartureTime,
        returnArrivalTime: transaction.returnArrivalTime,
        hasOutboundStop: transaction.hasOutboundStop,
        hasReturnStop: transaction.hasReturnStop,
        outboundStopCity: transaction.outboundStopCity,
        returnStopCity: transaction.returnStopCity,
        tripType: transaction.tripType,
        amount: transaction.amount,
        passengers: transaction.passengers || [
          {
            name: transaction.client,
            document: '',
            birthDate: '',
            type: 'Adulto',
            seat: '',
            baggage: '',
            specialNeeds: '',
            status: 'Confirmado'
          }
        ],
        reminders: transaction.reminders || [],
        travelNotes: transaction.travelNotes || '',
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

  const addPassenger = () => {
    if (!selectedReservation) return;

    const updatedReservation = {
      ...selectedReservation,
      passengers: [...selectedReservation.passengers, { ...newPassenger, id: Date.now() }]
    };

    setReservations(prev => 
      prev.map(res => res.id === selectedReservation.id ? updatedReservation : res)
    );

    setSelectedReservation(updatedReservation);
    setNewPassenger({
      name: '',
      document: '',
      birthDate: '',
      type: 'Adulto',
      seat: '',
      baggage: '',
      specialNeeds: '',
      status: 'Confirmado'
    });
    setIsAddPassengerOpen(false);

    toast({
      title: "✅ Passageiro Adicionado",
      description: `${newPassenger.name} foi adicionado à reserva`,
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Plane className="h-8 w-8 animate-bounce mx-auto mb-2" />
          <p>Carregando reservas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <UserCheck className="mr-3 h-8 w-8 text-blue-600" />
            Controle de Passageiros
          </h1>
          <p className="text-gray-600 mt-1">
            Gerencie passageiros, serviços e lembretes de viagem
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
                        {reservation.outboundDepartureTime && (
                          <span className="ml-2 text-gray-600">às {reservation.outboundDepartureTime}</span>
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
                    onClick={() => setSelectedReservation(reservation)}
                    className="text-sm px-3 py-1"
                  >
                    Gerenciar
                  </Button>
                </div>

                {/* Stopovers */}
                {(reservation.hasOutboundStop || reservation.hasReturnStop) && (
                  <div className="text-xs text-orange-600 bg-orange-50 p-2 rounded mt-2">
                    ✈️ Voo com escala
                    {reservation.outboundStopCity && ` (Ida: ${reservation.outboundStopCity})`}
                    {reservation.returnStopCity && ` (Volta: ${reservation.returnStopCity})`}
                  </div>
                )}
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

      {/* Simple Modal for Selected Reservation */}
      {selectedReservation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold flex items-center">
                <UserCheck className="mr-2 h-5 w-5" />
                Reserva: {selectedReservation.internalCode}
              </h2>
              <Button onClick={() => setSelectedReservation(null)} variant="ghost">
                ✕
              </Button>
            </div>
            
            <p className="text-gray-600 mb-6">
              {selectedReservation.client} • {selectedReservation.departureCity} → {selectedReservation.arrivalCity}
            </p>

            <div className="space-y-4">
              <h3 className="font-medium text-lg">
                Passageiros ({selectedReservation.passengers.length})
              </h3>
              
              {selectedReservation.passengers.map((passenger, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-blue-600" />
                    <span className="font-medium">{passenger.name}</span>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                      {passenger.type}
                    </span>
                  </div>
                  
                  {passenger.document && (
                    <p className="text-sm text-gray-600 mt-1">
                      Documento: {passenger.document}
                    </p>
                  )}
                </div>
              ))}
              
              <div className="pt-4">
                <p className="text-sm text-gray-500 text-center">
                  🚧 Funcionalidades avançadas em desenvolvimento:<br/>
                  • Adicionar passageiros<br/>
                  • Serviços extras (bagagem, assentos)<br/>
                  • Sistema de lembretes automáticos
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PassengerControl;