import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { toast } from 'sonner';
import { Plus, Calendar, Package, CheckCircle, XCircle } from 'lucide-react';
import { format, parseISO, differenceInDays } from 'date-fns';
import { fr } from 'date-fns/locale';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const HR = () => {
  const { user } = useAuth();
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [leaveDialogOpen, setLeaveDialogOpen] = useState(false);
  const [equipmentDialogOpen, setEquipmentDialogOpen] = useState(false);
  const [leaveFormData, setLeaveFormData] = useState({
    start_date: '',
    end_date: '',
    reason: ''
  });
  const [equipmentFormData, setEquipmentFormData] = useState({
    name: '',
    assigned_to: ''
  });

  useEffect(() => {
    fetchLeaveRequests();
    fetchEquipment();
    if (user?.role === 'manager') {
      fetchUsers();
    }
  }, [user]);

  const fetchLeaveRequests = async () => {
    try {
      const response = await axios.get(`${API}/leave-requests`);
      setLeaveRequests(response.data);
    } catch (error) {
      console.error('Failed to fetch leave requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEquipment = async () => {
    try {
      const response = await axios.get(`${API}/equipment`);
      setEquipment(response.data);
    } catch (error) {
      console.error('Failed to fetch equipment:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API}/users`);
      setUsers(response.data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  const handleLeaveSubmit = async (e) => {
    e.preventDefault();

    const daysInAdvance = differenceInDays(
      new Date(leaveFormData.start_date),
      new Date()
    );

    if (daysInAdvance < 15) {
      toast.error('Délai insuffisant', {
        description: 'Les demandes de congé doivent être soumises 15 jours à l\'avance'
      });
      return;
    }

    try {
      await axios.post(`${API}/leave-requests`, leaveFormData);
      toast.success('Demande de congé soumise');
      setLeaveDialogOpen(false);
      setLeaveFormData({ start_date: '', end_date: '', reason: '' });
      fetchLeaveRequests();
    } catch (error) {
      toast.error('Échec de la soumission', {
        description: error.response?.data?.detail || 'Une erreur est survenue'
      });
    }
  };

  const handleApprove = async (requestId) => {
    try {
      await axios.put(`${API}/leave-requests/${requestId}/approve`);
      toast.success('Demande approuvée');
      fetchLeaveRequests();
    } catch (error) {
      toast.error('Échec de l\'approbation');
    }
  };

  const handleReject = async (requestId) => {
    try {
      await axios.put(`${API}/leave-requests/${requestId}/reject`);
      toast.success('Demande rejetée');
      fetchLeaveRequests();
    } catch (error) {
      toast.error('Échec du rejet');
    }
  };

  const handleEquipmentSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.post(`${API}/equipment`, equipmentFormData);
      toast.success('Matériel enregistré');
      setEquipmentDialogOpen(false);
      setEquipmentFormData({ name: '', assigned_to: '' });
      fetchEquipment();
    } catch (error) {
      toast.error('Échec de l\'enregistrement');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: <Badge variant="outline">En attente</Badge>,
      approved: <Badge className="bg-green-500">Approuvé</Badge>,
      rejected: <Badge variant="destructive">Rejeté</Badge>
    };
    return badges[status] || <Badge>{status}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div data-testid="hr-page" className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">RH & Administration</h1>
        <p className="text-muted-foreground mt-1">Gérez les congés et le matériel</p>
      </div>

      <Tabs defaultValue="leave" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="leave" data-testid="tab-leave">Demandes de congé</TabsTrigger>
          <TabsTrigger value="equipment" data-testid="tab-equipment">Matériel</TabsTrigger>
        </TabsList>

        <TabsContent value="leave" className="space-y-4 mt-6">
          <div className="flex justify-end">
            <Dialog open={leaveDialogOpen} onOpenChange={setLeaveDialogOpen}>
              <DialogTrigger asChild>
                <Button data-testid="create-leave-button">
                  <Plus className="h-4 w-4 mr-2" />
                  Demander un congé
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Demande de congé</DialogTitle>
                  <DialogDescription>
                    Les demandes doivent être soumises 15 jours à l'avance
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleLeaveSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="start_date">Date de début *</Label>
                    <Input
                      id="start_date"
                      data-testid="leave-start-input"
                      type="date"
                      value={leaveFormData.start_date}
                      onChange={(e) => setLeaveFormData({ ...leaveFormData, start_date: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="end_date">Date de fin *</Label>
                    <Input
                      id="end_date"
                      data-testid="leave-end-input"
                      type="date"
                      value={leaveFormData.end_date}
                      onChange={(e) => setLeaveFormData({ ...leaveFormData, end_date: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reason">Raison *</Label>
                    <Textarea
                      id="reason"
                      data-testid="leave-reason-input"
                      value={leaveFormData.reason}
                      onChange={(e) => setLeaveFormData({ ...leaveFormData, reason: e.target.value })}
                      required
                      rows={3}
                    />
                  </div>
                  <Button data-testid="submit-leave-button" type="submit" className="w-full">Soumettre la demande</Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {leaveRequests.map((request) => (
              <Card key={request.id} data-testid={`leave-request-${request.id}`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{request.user_name}</CardTitle>
                      <CardDescription className="mt-1">
                        {format(parseISO(request.start_date), 'dd MMM', { locale: fr })} - {format(parseISO(request.end_date), 'dd MMM yyyy', { locale: fr })}
                      </CardDescription>
                    </div>
                    {getStatusBadge(request.status)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">{request.reason}</p>
                  
                  {user?.role === 'manager' && request.status === 'pending' && (
                    <div className="flex space-x-2 pt-2">
                      <Button
                        data-testid={`approve-leave-${request.id}`}
                        size="sm"
                        className="flex-1"
                        onClick={() => handleApprove(request.id)}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Approuver
                      </Button>
                      <Button
                        data-testid={`reject-leave-${request.id}`}
                        size="sm"
                        variant="destructive"
                        className="flex-1"
                        onClick={() => handleReject(request.id)}
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Rejeter
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {leaveRequests.length === 0 && (
            <Card>
              <CardContent className="py-12">
                <div className="text-center">
                  <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">Aucune demande de congé</h3>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="equipment" className="space-y-4 mt-6">
          {user?.role === 'manager' && (
            <div className="flex justify-end">
              <Dialog open={equipmentDialogOpen} onOpenChange={setEquipmentDialogOpen}>
                <DialogTrigger asChild>
                  <Button data-testid="create-equipment-button">
                    <Plus className="h-4 w-4 mr-2" />
                    Enregistrer du matériel
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Enregistrer du matériel</DialogTitle>
                    <DialogDescription>
                      Attribuez du matériel à un membre de l'équipe
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleEquipmentSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nom du matériel *</Label>
                      <Input
                        id="name"
                        data-testid="equipment-name-input"
                        value={equipmentFormData.name}
                        onChange={(e) => setEquipmentFormData({ ...equipmentFormData, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="assigned_to">Attribué à *</Label>
                      <select
                        id="assigned_to"
                        data-testid="equipment-assignee-select"
                        className="w-full px-3 py-2 border rounded-md"
                        value={equipmentFormData.assigned_to}
                        onChange={(e) => setEquipmentFormData({ ...equipmentFormData, assigned_to: e.target.value })}
                        required
                      >
                        <option value="">Sélectionnez un utilisateur</option>
                        {users.map((u) => (
                          <option key={u.id} value={u.id}>{u.full_name}</option>
                        ))}
                      </select>
                    </div>
                    <Button data-testid="submit-equipment-button" type="submit" className="w-full">Enregistrer</Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {equipment.map((item) => (
              <Card key={item.id} data-testid={`equipment-${item.id}`}>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <Package className="h-5 w-5 mr-2" />
                    {item.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">Attribué à:</p>
                  <p className="font-medium">{item.user_name}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Depuis: {format(parseISO(item.assigned_date), 'dd MMM yyyy', { locale: fr })}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {equipment.length === 0 && (
            <Card>
              <CardContent className="py-12">
                <div className="text-center">
                  <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">Aucun matériel enregistré</h3>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default HR;