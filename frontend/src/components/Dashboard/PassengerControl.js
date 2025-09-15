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
    nationality: 'Brasileira',
    passportNumber: '',
    passportExpiry: '',
    seat: '',
    baggage: '',
    specialNeeds: '',
    status: 'Confirmado'
  });
  const [reservationNotes, setReservationNotes] = useState('');
  const [editableAirline, setEditableAirline] = useState('');
  
  // Estados para informações do fornecedor
  const [selectedSupplier, setSelectedSupplier] = useState('');
  const [suppliersList, setSuppliersList] = useState([]);
  const [emissionType, setEmissionType] = useState('');
  const [supplierPhone, setSupplierPhone] = useState('');
  
  const { toast } = useToast();

  // Carregar reservas das transações de entrada
  useEffect(() => {
    loadReservations();
    loadSuppliers();
  }, []);

  const loadSuppliers = async () => {
    try {
      // Carregar lista de fornecedores do backend
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/suppliers`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        // Extrair apenas os nomes dos fornecedores
        const supplierNames = data.map(supplier => supplier.name || supplier.supplierName || supplier);
        setSuppliersList(supplierNames);
      } else {
        // Se não conseguir carregar, deixar lista vazia para o usuário preencher manualmente
        setSuppliersList([]);
      }
    } catch (error) {
      console.error('Erro ao carregar fornecedores:', error);
      // Lista vazia - usuário pode digitar manualmente ou criar fornecedores no sistema
      setSuppliersList([]);
    }
  };

  const loadReservations = async () => {
    setLoading(true);
    try {
      // Buscar todas as transações de entrada com código interno
      const response = await transactionsAPI.getTransactions();
      
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
        supplier: transaction.supplier,
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
        outboundStopArrival: transaction.outboundStopArrival,
        outboundStopDeparture: transaction.outboundStopDeparture,
        returnStopArrival: transaction.returnStopArrival,
        returnStopDeparture: transaction.returnStopDeparture,
        tripType: transaction.tripType,
        amount: transaction.amount,
        passengers: transaction.passengers || [
          {
            name: transaction.client,
            document: '',
            birthDate: '',
            type: 'Adulto',
            nationality: 'Brasileira',
            passportNumber: '',
            passportExpiry: '',
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

  const addPassenger = async () => {
    if (!selectedReservation) return;

    try {
      const updatedReservation = {
        ...selectedReservation,
        passengers: [...selectedReservation.passengers, { ...newPassenger, id: Date.now() }]
      };

      // Save to backend
      await transactionsAPI.updateTransaction(selectedReservation.id, {
        type: 'entrada',
        category: 'Passagem Aérea',
        description: selectedReservation.client,
        amount: selectedReservation.amount,
        paymentMethod: 'PIX',
        supplier: selectedReservation.supplier,
        client: selectedReservation.client,
        passengers: updatedReservation.passengers,
        airline: selectedReservation.airline,
        travelNotes: selectedReservation.travelNotes
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
        seat: '',
        baggage: '',
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

  const updateMainPassenger = (field, value) => {
    if (!selectedReservation) return;

    const updatedReservation = {
      ...selectedReservation,
      passengers: selectedReservation.passengers.map((passenger, index) => 
        index === 0 ? { ...passenger, [field]: value } : passenger
      )
    };

    setReservations(prev => 
      prev.map(res => res.id === selectedReservation.id ? updatedReservation : res)
    );

    setSelectedReservation(updatedReservation);
  };

  const saveReservationChanges = async () => {
    if (!selectedReservation) return;

    try {
      // Prepare data for backend
      const updateData = {
        type: 'entrada',
        category: 'Passagem Aérea',
        description: selectedReservation.client,
        amount: selectedReservation.amount,
        paymentMethod: 'PIX',
        supplier: selectedSupplier, // Usar fornecedor selecionado manualmente
        client: selectedReservation.client,
        passengers: selectedReservation.passengers,
        airline: editableAirline,
        travelNotes: reservationNotes,
        // Novos campos do fornecedor
        emissionType: emissionType,
        supplierPhone: supplierPhone,
        // Include all travel fields
        departureCity: selectedReservation.departureCity,
        arrivalCity: selectedReservation.arrivalCity,
        departureDate: selectedReservation.departureDate,
        returnDate: selectedReservation.returnDate,
        outboundDepartureTime: selectedReservation.outboundDepartureTime,
        outboundArrivalTime: selectedReservation.outboundArrivalTime,
        returnDepartureTime: selectedReservation.returnDepartureTime,
        returnArrivalTime: selectedReservation.returnArrivalTime,
        hasOutboundStop: selectedReservation.hasOutboundStop,
        hasReturnStop: selectedReservation.hasReturnStop,
        outboundStopCity: selectedReservation.outboundStopCity,
        returnStopCity: selectedReservation.returnStopCity,
        clientReservationCode: selectedReservation.clientReservationCode,
        internalReservationCode: selectedReservation.internalCode
      };

      // Save to backend
      await transactionsAPI.updateTransaction(selectedReservation.id, updateData);

      // Update local state
      const updatedReservation = {
        ...selectedReservation,
        supplier: selectedSupplier,
        airline: editableAirline,
        travelNotes: reservationNotes,
        emissionType: emissionType,
        supplierPhone: supplierPhone
      };

      setReservations(prev => 
        prev.map(res => res.id === selectedReservation.id ? updatedReservation : res)
      );

      setSelectedReservation(updatedReservation);

      toast({
        title: "✅ Alterações Salvas",
        description: "As informações da reserva foram atualizadas com sucesso no sistema",
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
            🆕 Controle de Passageiros - Versão Completa
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
                    onClick={() => {
                      setSelectedReservation(reservation);
                      setEditableAirline(reservation.airline || '');
                      setReservationNotes(reservation.travelNotes || '');
                      // Inicializar campos do fornecedor com valores existentes
                      setSelectedSupplier(reservation.supplier || '');
                      setEmissionType(reservation.emissionType || ''); // Carregar valor existente
                      setSupplierPhone(reservation.supplierPhone || ''); // Carregar valor existente
                    }}
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

      {/* Enhanced Modal for Selected Reservation */}
      {selectedReservation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-5xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold flex items-center">
                <UserCheck className="mr-2 h-5 w-5" />
                Reserva: {selectedReservation.internalCode}
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
              {/* Flight Details Section */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-medium text-lg flex items-center mb-3">
                  <Plane className="mr-2 h-5 w-5 text-blue-600" />
                  Detalhes da Viagem
                </h3>
                
                {/* Supplier and Airline Information - Editable */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                  {/* Fornecedor */}
                  <div className="p-3 bg-white rounded border-l-4 border-blue-500">
                    <div className="flex items-center mb-2">
                      <Building className="h-4 w-4 mr-2 text-blue-600" />
                      <p className="text-sm font-medium text-blue-700">Fornecedor:</p>
                    </div>
                    {suppliersList.length > 0 ? (
                      <select
                        value={selectedSupplier}
                        onChange={(e) => setSelectedSupplier(e.target.value)}
                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                      >
                        <option value="">Selecione o fornecedor</option>
                        {suppliersList.map((supplier, index) => (
                          <option key={index} value={supplier}>{supplier}</option>
                        ))}
                      </select>
                    ) : (
                      <Input
                        value={selectedSupplier}
                        onChange={(e) => setSelectedSupplier(e.target.value)}
                        placeholder="Digite o nome do fornecedor"
                        className="text-sm"
                      />
                    )}
                    {suppliersList.length === 0 && (
                      <p className="text-xs text-gray-500 mt-1">
                        Crie fornecedores no sistema ou digite manualmente
                      </p>
                    )}
                  </div>
                  
                  {/* Tipo de Emissão - Campo Livre */}
                  <div className="p-3 bg-white rounded border-l-4 border-purple-500">
                    <div className="flex items-center mb-2">
                      <FileText className="h-4 w-4 mr-2 text-purple-600" />
                      <p className="text-sm font-medium text-purple-700">Tipo de Emissão:</p>
                    </div>
                    <Input
                      value={emissionType}
                      onChange={(e) => setEmissionType(e.target.value)}
                      placeholder="Ex: E-ticket, Voucher, Bilhete físico..."
                      className="text-sm"
                    />
                  </div>
                  
                  {/* Telefone do Fornecedor */}
                  <div className="p-3 bg-white rounded border-l-4 border-orange-500">
                    <div className="flex items-center mb-2">
                      <Bell className="h-4 w-4 mr-2 text-orange-600" />
                      <p className="text-sm font-medium text-orange-700">Contato:</p>
                    </div>
                    <Input
                      value={supplierPhone}
                      onChange={(e) => setSupplierPhone(e.target.value)}
                      placeholder="Telefone do fornecedor"
                      className="text-sm"
                    />
                  </div>
                </div>
                
                {/* Companhia Aérea */}
                <div className="p-3 bg-white rounded border-l-4 border-green-500 mb-4">
                  <div className="flex items-center mb-2">
                    <Plane className="h-4 w-4 mr-2 text-green-600" />
                    <p className="text-sm font-medium text-green-700">Companhia Aérea:</p>
                  </div>
                  <Input
                    value={editableAirline}
                    onChange={(e) => setEditableAirline(e.target.value)}
                    placeholder="Nome da companhia aérea"
                    className="mt-1"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Outbound Flight */}
                  <div className="bg-white p-3 rounded">
                    <h4 className="font-medium text-green-700 flex items-center mb-2">
                      <MapPin className="mr-1 h-4 w-4" />
                      Voo de Ida
                    </h4>
                    
                    {selectedReservation.departureDate && (
                      <p className="text-sm">
                        <Calendar className="inline h-4 w-4 mr-1" />
                        {new Date(selectedReservation.departureDate).toLocaleDateString('pt-BR')}
                      </p>
                    )}
                    
                    {selectedReservation.outboundDepartureTime && (
                      <p className="text-sm">
                        <Clock className="inline h-4 w-4 mr-1" />
                        Saída: {selectedReservation.outboundDepartureTime}
                        {selectedReservation.outboundArrivalTime && (
                          <span> → Chegada: {selectedReservation.outboundArrivalTime}</span>
                        )}
                      </p>
                    )}
                    
                    {selectedReservation.hasOutboundStop && selectedReservation.outboundStopCity && (
                      <div className="mt-2 p-2 bg-orange-50 rounded text-sm">
                        <p className="text-orange-700 font-medium">✈️ Escala:</p>
                        <p>{selectedReservation.outboundStopCity}</p>
                        {selectedReservation.outboundStopArrival && (
                          <p>Chegada: {selectedReservation.outboundStopArrival}</p>
                        )}
                        {selectedReservation.outboundStopDeparture && (
                          <p>Saída: {selectedReservation.outboundStopDeparture}</p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Return Flight */}
                  {selectedReservation.returnDate && (
                    <div className="bg-white p-3 rounded">
                      <h4 className="font-medium text-purple-700 flex items-center mb-2">
                        <MapPin className="mr-1 h-4 w-4" />
                        Voo de Volta
                      </h4>
                      
                      <p className="text-sm">
                        <Calendar className="inline h-4 w-4 mr-1" />
                        {new Date(selectedReservation.returnDate).toLocaleDateString('pt-BR')}
                      </p>
                      
                      {selectedReservation.returnDepartureTime && (
                        <p className="text-sm">
                          <Clock className="inline h-4 w-4 mr-1" />
                          Saída: {selectedReservation.returnDepartureTime}
                          {selectedReservation.returnArrivalTime && (
                            <span> → Chegada: {selectedReservation.returnArrivalTime}</span>
                          )}
                        </p>
                      )}
                      
                      {selectedReservation.hasReturnStop && selectedReservation.returnStopCity && (
                        <div className="mt-2 p-2 bg-orange-50 rounded text-sm">
                          <p className="text-orange-700 font-medium">✈️ Escala:</p>
                          <p>{selectedReservation.returnStopCity}</p>
                          {selectedReservation.returnStopArrival && (
                            <p>Chegada: {selectedReservation.returnStopArrival}</p>
                          )}
                          {selectedReservation.returnStopDeparture && (
                            <p>Saída: {selectedReservation.returnStopDeparture}</p>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Additional Information Section */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-lg flex items-center mb-3">
                  <FileText className="mr-2 h-5 w-5 text-gray-600" />
                  Informações Adicionais
                </h3>
                <textarea
                  value={reservationNotes}
                  onChange={(e) => setReservationNotes(e.target.value)}
                  placeholder="Digite informações adicionais sobre a viagem, observações especiais, contatos de hotéis, etc."
                  className="w-full h-24 p-3 border border-gray-300 rounded resize-none"
                />
              </div>

              {/* Passengers Section - Enhanced Layout */}
              <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-5 rounded-xl">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold text-xl text-indigo-900 flex items-center">
                    <Users className="mr-3 h-6 w-6 text-indigo-600" />
                    Lista de Passageiros
                    <span className="ml-3 px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">
                      {selectedReservation.passengers.length} {selectedReservation.passengers.length > 1 ? 'passageiros' : 'passageiro'}
                    </span>
                  </h3>
                </div>
                
                <div className="space-y-4">
                  {selectedReservation.passengers.map((passenger, index) => (
                    <div key={index} className={`${
                      index === 0 
                        ? 'bg-gradient-to-r from-emerald-50 to-teal-50 border-l-4 border-emerald-400' 
                        : 'bg-white border-l-4 border-blue-300'
                    } p-5 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200`}>
                      
                      {/* Passenger Header */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-full ${
                            index === 0 ? 'bg-emerald-100' : 'bg-blue-100'
                          }`}>
                            <User className={`h-5 w-5 ${
                              index === 0 ? 'text-emerald-600' : 'text-blue-600'
                            }`} />
                          </div>
                          <div>
                            <p className={`font-bold text-lg ${
                              index === 0 ? 'text-emerald-900' : 'text-blue-900'
                            }`}>
                              {passenger.name || 'Nome não informado'}
                            </p>
                            <div className="flex items-center space-x-2 mt-1">
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                index === 0 
                                  ? 'bg-emerald-100 text-emerald-800' 
                                  : 'bg-blue-100 text-blue-800'
                              }`}>
                                {passenger.type || 'Adulto'}
                              </span>
                              {index === 0 && (
                                <span className="px-3 py-1 bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-800 rounded-full text-xs font-bold flex items-center">
                                  ⭐ Titular da Reserva
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        {passenger.status && (
                          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                            ✅ {passenger.status}
                          </span>
                        )}
                      </div>
                      
                      {/* Passenger Details */}
                      {index === 0 ? (
                        // Main passenger - editable with beautiful cards
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          <div className="bg-white p-4 rounded-lg border border-emerald-100 hover:border-emerald-200 transition-colors">
                            <div className="flex items-center mb-2">
                              <FileText className="h-4 w-4 mr-2 text-emerald-600" />
                              <Label className="text-sm font-medium text-emerald-800">Documento</Label>
                            </div>
                            <Input
                              value={passenger.document || ''}
                              onChange={(e) => updateMainPassenger('document', e.target.value)}
                              placeholder="RG, CPF, etc."
                              className="border-emerald-200 focus:border-emerald-400 focus:ring-emerald-200"
                            />
                          </div>
                          
                          <div className="bg-white p-4 rounded-lg border border-emerald-100 hover:border-emerald-200 transition-colors">
                            <div className="flex items-center mb-2">
                              <MapPin className="h-4 w-4 mr-2 text-emerald-600" />
                              <Label className="text-sm font-medium text-emerald-800">Nacionalidade</Label>
                            </div>
                            <Input
                              value={passenger.nationality || 'Brasileira'}
                              onChange={(e) => updateMainPassenger('nationality', e.target.value)}
                              placeholder="Nacionalidade"
                              className="border-emerald-200 focus:border-emerald-400 focus:ring-emerald-200"
                            />
                          </div>
                          
                          <div className="bg-white p-4 rounded-lg border border-emerald-100 hover:border-emerald-200 transition-colors">
                            <div className="flex items-center mb-2">
                              <Calendar className="h-4 w-4 mr-2 text-emerald-600" />
                              <Label className="text-sm font-medium text-emerald-800">Data de Nascimento</Label>
                            </div>
                            <Input
                              type="date"
                              value={passenger.birthDate || ''}
                              onChange={(e) => updateMainPassenger('birthDate', e.target.value)}
                              className="border-emerald-200 focus:border-emerald-400 focus:ring-emerald-200"
                            />
                          </div>
                          
                          <div className="bg-white p-4 rounded-lg border border-emerald-100 hover:border-emerald-200 transition-colors">
                            <div className="flex items-center mb-2">
                              <FileText className="h-4 w-4 mr-2 text-emerald-600" />
                              <Label className="text-sm font-medium text-emerald-800">Número do Passaporte</Label>
                            </div>
                            <Input
                              value={passenger.passportNumber || ''}
                              onChange={(e) => updateMainPassenger('passportNumber', e.target.value)}
                              placeholder="Ex: BR123456789"
                              className="border-emerald-200 focus:border-emerald-400 focus:ring-emerald-200"
                            />
                          </div>
                          
                          <div className="bg-white p-4 rounded-lg border border-emerald-100 hover:border-emerald-200 transition-colors">
                            <div className="flex items-center mb-2">
                              <Clock className="h-4 w-4 mr-2 text-emerald-600" />
                              <Label className="text-sm font-medium text-emerald-800">Vencimento do Passaporte</Label>
                            </div>
                            <Input
                              type="date"
                              value={passenger.passportExpiry || ''}
                              onChange={(e) => updateMainPassenger('passportExpiry', e.target.value)}
                              className="border-emerald-200 focus:border-emerald-400 focus:ring-emerald-200"
                            />
                          </div>
                          
                          <div className="bg-white p-4 rounded-lg border border-emerald-100 hover:border-emerald-200 transition-colors">
                            <div className="flex items-center mb-2">
                              <Bell className="h-4 w-4 mr-2 text-emerald-600" />
                              <Label className="text-sm font-medium text-emerald-800">Necessidades Especiais</Label>
                            </div>
                            <Input
                              value={passenger.specialNeeds || ''}
                              onChange={(e) => updateMainPassenger('specialNeeds', e.target.value)}
                              placeholder="Dieta, mobilidade, medicamentos..."
                              className="border-emerald-200 focus:border-emerald-400 focus:ring-emerald-200"
                            />
                          </div>
                        </div>
                      ) : (
                        // Other passengers - beautiful display cards
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {passenger.document && (
                            <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                              <div className="flex items-center mb-1">
                                <FileText className="h-4 w-4 mr-2 text-blue-600" />
                                <span className="text-xs font-medium text-blue-800">DOCUMENTO</span>
                              </div>
                              <p className="text-blue-900 font-medium">{passenger.document}</p>
                            </div>
                          )}
                          
                          {passenger.nationality && (
                            <div className="bg-purple-50 p-3 rounded-lg border border-purple-100">
                              <div className="flex items-center mb-1">
                                <MapPin className="h-4 w-4 mr-2 text-purple-600" />
                                <span className="text-xs font-medium text-purple-800">NACIONALIDADE</span>
                              </div>
                              <p className="text-purple-900 font-medium">{passenger.nationality}</p>
                            </div>
                          )}
                          
                          {passenger.birthDate && (
                            <div className="bg-pink-50 p-3 rounded-lg border border-pink-100">
                              <div className="flex items-center mb-1">
                                <Calendar className="h-4 w-4 mr-2 text-pink-600" />
                                <span className="text-xs font-medium text-pink-800">NASCIMENTO</span>
                              </div>
                              <p className="text-pink-900 font-medium">{new Date(passenger.birthDate).toLocaleDateString('pt-BR')}</p>
                            </div>
                          )}
                          
                          {passenger.passportNumber && (
                            <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-100">
                              <div className="flex items-center mb-1">
                                <FileText className="h-4 w-4 mr-2 text-indigo-600" />
                                <span className="text-xs font-medium text-indigo-800">PASSAPORTE</span>
                              </div>
                              <p className="text-indigo-900 font-medium">{passenger.passportNumber}</p>
                            </div>
                          )}
                          
                          {passenger.passportExpiry && (
                            <div className="bg-orange-50 p-3 rounded-lg border border-orange-100">
                              <div className="flex items-center mb-1">
                                <Clock className="h-4 w-4 mr-2 text-orange-600" />
                                <span className="text-xs font-medium text-orange-800">VENCIMENTO</span>
                              </div>
                              <p className="text-orange-900 font-medium">{new Date(passenger.passportExpiry).toLocaleDateString('pt-BR')}</p>
                            </div>
                          )}
                          
                          {passenger.specialNeeds && (
                            <div className="bg-amber-50 p-3 rounded-lg border border-amber-100 md:col-span-2 lg:col-span-3">
                              <div className="flex items-center mb-1">
                                <Bell className="h-4 w-4 mr-2 text-amber-600" />
                                <span className="text-xs font-medium text-amber-800">NECESSIDADES ESPECIAIS</span>
                              </div>
                              <p className="text-amber-900 font-medium">{passenger.specialNeeds}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                
                {/* Enhanced Add Passenger Button */}
                <div className="mt-6 p-4 bg-white rounded-xl border-2 border-dashed border-indigo-200 hover:border-indigo-300 transition-colors">
                  <Button
                    onClick={() => setIsAddPassengerOpen(true)}
                    className="w-full flex items-center justify-center space-x-3 bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
                  >
                    <Plus className="h-5 w-5" />
                    <span className="font-medium">Adicionar Novo Passageiro à Reserva</span>
                  </Button>
                </div>
              </div>

              {/* Save Changes Button */}
              <div className="flex justify-end pt-4 border-t">
                <Button
                  onClick={saveReservationChanges}
                  className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white"
                >
                  💾 Salvar Alterações
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Passenger Modal */}
      {isAddPassengerOpen && selectedReservation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold flex items-center">
                <Plus className="mr-2 h-5 w-5 text-blue-600" />
                Adicionar Passageiro
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
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="passengerDocument">Documento</Label>
                <Input
                  id="passengerDocument"
                  type="text"
                  value={newPassenger.document}
                  onChange={(e) => setNewPassenger({...newPassenger, document: e.target.value})}
                  placeholder="RG, CPF"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="passengerNationality">Nacionalidade</Label>
                <Input
                  id="passengerNationality"
                  type="text"
                  value={newPassenger.nationality}
                  onChange={(e) => setNewPassenger({...newPassenger, nationality: e.target.value})}
                  placeholder="Nacionalidade"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="passengerBirth">Data de Nascimento</Label>
                <Input
                  id="passengerBirth"
                  type="date"
                  value={newPassenger.birthDate}
                  onChange={(e) => setNewPassenger({...newPassenger, birthDate: e.target.value})}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="passengerPassport">Número do Passaporte</Label>
                <Input
                  id="passengerPassport"
                  type="text"
                  value={newPassenger.passportNumber}
                  onChange={(e) => setNewPassenger({...newPassenger, passportNumber: e.target.value})}
                  placeholder="Número do passaporte"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="passengerPassportExpiry">Vencimento do Passaporte</Label>
                <Input
                  id="passengerPassportExpiry"
                  type="date"
                  value={newPassenger.passportExpiry}
                  onChange={(e) => setNewPassenger({...newPassenger, passportExpiry: e.target.value})}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="passengerType">Tipo de Passageiro</Label>
                <select
                  id="passengerType"
                  value={newPassenger.type}
                  onChange={(e) => setNewPassenger({...newPassenger, type: e.target.value})}
                  className="mt-1 w-full border border-gray-300 rounded px-3 py-2"
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
                  className="mt-1"
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
                Adicionar Passageiro
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PassengerControl;