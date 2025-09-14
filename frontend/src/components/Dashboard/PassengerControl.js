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
  Luggage,
  Seat,
  User,
  Baby,
  Users,
  AlertTriangle,
  CheckCircle,
  XCircle
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
          <Badge variant="outline" className="px-3 py-1">
            {reservations.length} Reservas Ativas
          </Badge>
        </div>
      </div>

      {/* Reservations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reservations.map((reservation) => {
          const daysUntil = getDaysUntilTravel(reservation.departureDate);
          const reminderStatus = getReminderStatus(daysUntil);
          
          return (
            <Card key={reservation.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">
                      🔗 {reservation.internalCode}
                    </CardTitle>
                    <CardDescription>
                      {reservation.clientReservationCode && (
                        <span>Cliente: {reservation.clientReservationCode}</span>
                      )}
                    </CardDescription>
                  </div>
                  <Badge 
                    variant="outline" 
                    className={`text-${reminderStatus.color}-600 border-${reminderStatus.color}-300`}
                  >
                    {reminderStatus.text}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Flight Info */}
                <div className="space-y-2">
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
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedReservation(reservation)}
                  >
                    Gerenciar
                  </Button>
                </div>

                {/* Stopovers */}
                {(reservation.hasOutboundStop || reservation.hasReturnStop) && (
                  <div className="text-xs text-orange-600 bg-orange-50 p-2 rounded">
                    ✈️ Voo com escala
                    {reservation.outboundStopCity && ` (Ida: ${reservation.outboundStopCity})`}
                    {reservation.returnStopCity && ` (Volta: ${reservation.returnStopCity})`}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Empty State */}
      {reservations.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Plane className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhuma reserva encontrada
            </h3>
            <p className="text-gray-600 mb-4">
              Crie transações de entrada com dados de viagem para vê-las aqui
            </p>
          </CardContent>
        </Card>
      )}

      {/* Passenger Management Modal */}
      {selectedReservation && (
        <Dialog open={!!selectedReservation} onOpenChange={() => setSelectedReservation(null)}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center">
                <UserCheck className="mr-2 h-5 w-5" />
                Gerenciar Reserva: {selectedReservation.internalCode}
              </DialogTitle>
              <DialogDescription>
                {selectedReservation.client} • {selectedReservation.departureCity} → {selectedReservation.arrivalCity}
              </DialogDescription>
            </DialogHeader>

            <Tabs defaultValue="passengers" className="mt-4">
              <TabsList>
                <TabsTrigger value="passengers">Passageiros</TabsTrigger>
                <TabsTrigger value="services">Serviços</TabsTrigger>
                <TabsTrigger value="reminders">Lembretes</TabsTrigger>
              </TabsList>

              <TabsContent value="passengers" className="space-y-4">
                {/* Add Passenger Button */}
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">
                    Passageiros ({selectedReservation.passengers.length})
                  </h3>
                  <Dialog open={isAddPassengerOpen} onOpenChange={setIsAddPassengerOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Adicionar Passageiro
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Adicionar Passageiro</DialogTitle>
                      </DialogHeader>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div className="space-y-2">
                          <Label>Nome Completo *</Label>
                          <Input
                            value={newPassenger.name}
                            onChange={(e) => setNewPassenger({...newPassenger, name: e.target.value})}
                            placeholder="Nome como no documento"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label>CPF/Documento *</Label>
                          <Input
                            value={newPassenger.document}
                            onChange={(e) => setNewPassenger({...newPassenger, document: e.target.value})}
                            placeholder="000.000.000-00"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Data de Nascimento</Label>
                          <Input
                            type="date"
                            value={newPassenger.birthDate}
                            onChange={(e) => setNewPassenger({...newPassenger, birthDate: e.target.value})}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Tipo de Passageiro</Label>
                          <Select value={newPassenger.type} onValueChange={(value) => setNewPassenger({...newPassenger, type: value})}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Adulto">👤 Adulto</SelectItem>
                              <SelectItem value="Criança">👶 Criança (2-11 anos)</SelectItem>
                              <SelectItem value="Bebê">🍼 Bebê (0-2 anos)</SelectItem>
                              <SelectItem value="Idoso">👴 Idoso (60+ anos)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>Assento Preferencial</Label>
                          <Input
                            value={newPassenger.seat}
                            onChange={(e) => setNewPassenger({...newPassenger, seat: e.target.value})}
                            placeholder="Ex: 12A, Janela, Corredor"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Bagagem</Label>
                          <Input
                            value={newPassenger.baggage}
                            onChange={(e) => setNewPassenger({...newPassenger, baggage: e.target.value})}
                            placeholder="Ex: 23kg, Bagagem extra"
                          />
                        </div>

                        <div className="space-y-2 md:col-span-2">
                          <Label>Necessidades Especiais</Label>
                          <Input
                            value={newPassenger.specialNeeds}
                            onChange={(e) => setNewPassenger({...newPassenger, specialNeeds: e.target.value})}
                            placeholder="Ex: Cadeira de rodas, Dieta especial, Medicamentos"
                          />
                        </div>
                      </div>
                      
                      <div className="flex justify-end space-x-2 mt-6">
                        <Button variant="outline" onClick={() => setIsAddPassengerOpen(false)}>
                          Cancelar
                        </Button>
                        <Button onClick={addPassenger} disabled={!newPassenger.name || !newPassenger.document}>
                          Adicionar Passageiro
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                {/* Passengers List */}
                <div className="space-y-3">
                  {selectedReservation.passengers.map((passenger, index) => (
                    <Card key={index}>
                      <CardContent className="pt-4">
                        <div className="flex justify-between items-start">
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              {passenger.type === 'Adulto' && <User className="h-4 w-4 text-blue-600" />}
                              {passenger.type === 'Criança' && <Baby className="h-4 w-4 text-green-600" />}
                              {passenger.type === 'Bebê' && <Baby className="h-4 w-4 text-pink-600" />}
                              {passenger.type === 'Idoso' && <User className="h-4 w-4 text-purple-600" />}
                              <h4 className="font-medium">{passenger.name}</h4>
                              <Badge variant="secondary">{passenger.type}</Badge>
                            </div>
                            
                            <div className="text-sm text-gray-600 space-y-1">
                              {passenger.document && <div>Documento: {passenger.document}</div>}
                              {passenger.birthDate && <div>Nascimento: {new Date(passenger.birthDate).toLocaleDateString('pt-BR')}</div>}
                              {passenger.seat && (
                                <div className="flex items-center">
                                  <Seat className="h-3 w-3 mr-1" />
                                  Assento: {passenger.seat}
                                </div>
                              )}
                              {passenger.baggage && (
                                <div className="flex items-center">
                                  <Luggage className="h-3 w-3 mr-1" />
                                  Bagagem: {passenger.baggage}
                                </div>
                              )}
                              {passenger.specialNeeds && (
                                <div className="text-orange-600">
                                  <AlertTriangle className="h-3 w-3 mr-1 inline" />
                                  {passenger.specialNeeds}
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center">
                            {passenger.status === 'Confirmado' && <CheckCircle className="h-5 w-5 text-green-500" />}
                            {passenger.status === 'Pendente' && <Clock className="h-5 w-5 text-yellow-500" />}
                            {passenger.status === 'Cancelado' && <XCircle className="h-5 w-5 text-red-500" />}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="services" className="space-y-4">
                <h3 className="text-lg font-medium">Serviços Extras</h3>
                <div className="text-center py-8 text-gray-500">
                  <Luggage className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                  <p>Funcionalidade em desenvolvimento</p>
                  <p className="text-sm">Em breve: bagagem extra, assentos, refeições especiais</p>
                </div>
              </TabsContent>

              <TabsContent value="reminders" className="space-y-4">
                <h3 className="text-lg font-medium">Sistema de Lembretes</h3>
                <div className="text-center py-8 text-gray-500">
                  <Bell className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                  <p>Funcionalidade em desenvolvimento</p>
                  <p className="text-sm">Em breve: lembretes automáticos 30d, 15d, 7d, 48h, 36h, 24h antes da viagem</p>
                </div>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default PassengerControl;