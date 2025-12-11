import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { toast } from 'sonner';
import { Plus, Calendar, CheckCircle, AlertTriangle, AlertOctagon } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const Meetings = () => {
  const { user } = useAuth();
  const [meetings, setMeetings] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    agenda: '',
    date: '',
    participants: []
  });

  useEffect(() => {
    fetchMeetings();
    fetchUsers();
  }, []);

  function toLocalInputValue(isoString) {
  if (!isoString) return "";
  const date = new Date(isoString);
  return date.toISOString().slice(0, 16);
  }
  function fromLocalInputValue(value) {
    return new Date(value).toISOString();
  }


  const fetchMeetings = async () => {
    try {
      const response = await axios.get(`${API}/meetings`);
      setMeetings(response.data);
    } catch (error) {
      console.error('Failed to fetch meetings:', error);
    } finally {
      setLoading(false);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.agenda) {
      toast.error('Ordre du jour obligatoire', {
        description: 'L’ordre du jour est obligatoire pour créer une réunion'
      });
      return;
    }

    try {
      await axios.post(`${API}/meetings`, formData);
      toast.success('Réunion créée avec succès');
      setDialogOpen(false);
      setFormData({ title: '', agenda: '', date: '', participants: [] });
      fetchMeetings();
    } catch (error) {
      toast.error('Échec de la création', {
        description: error.response?.data?.detail || 'Une erreur est survenue'
      });
    }
  };

  const handleConfirm = async (meetingId) => {
    try {
      await axios.post(`${API}/meetings/${meetingId}/confirm`);
      toast.success('Présence confirmée');
      fetchMeetings();
    } catch (error) {
      toast.error('Échec de la confirmation');
    }
  };

  const handleCloseMeeting = async (meetingId, minutes) => {
    if (!minutes) {
      toast.error('Compte-rendu requis');
      return;
    }

    try {
      await axios.post(`${API}/meetings/${meetingId}/close`, null, {
        params: { minutes }
      });
      toast.success('Réunion clôturée');
      setSelectedMeeting(null);
      fetchMeetings();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Échec de la clôture');
    }
  };

  const handleEscalate = async (meetingId) => {
    try {
      await axios.post(`${API}/escalate`, {
        entity_type: 'meeting',
        entity_id: meetingId,
        reason: 'Problème signalé sur cette réunion'
      });
      toast.success('Escaladé au manager');
    } catch (error) {
      toast.error('Échec de l’escalade');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      scheduled: <Badge variant="outline">Planifiée</Badge>,
      at_risk: <Badge variant="destructive">En risque</Badge>,
      confirmed: <Badge className="bg-green-500">Confirmée</Badge>,
      completed: <Badge className="bg-slate-500">Terminée</Badge>
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
    <div data-testid="meetings-page" className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestion des Réunions</h1>
          <p className="text-muted-foreground mt-1">Planifiez et gérez vos réunions d'équipe</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="create-meeting-button">
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle réunion
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Créer une réunion</DialogTitle>
              <DialogDescription>
                L'ordre du jour est obligatoire pour créer une réunion
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Titre *</Label>
                <Input
                  id="title"
                  data-testid="meeting-title-input"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="agenda">Ordre du jour *</Label>
                <Textarea
                  id="agenda"
                  data-testid="meeting-agenda-input"
                  value={formData.agenda}
                  onChange={(e) => setFormData({ ...formData, agenda: e.target.value })}
                  required
                  rows={4}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Date et heure *</Label>
                <Input
                  id="date"
                  data-testid="meeting-date-input"
                  type="datetime-local"
                  value={toLocalInputValue(formData.date)}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      date: fromLocalInputValue(e.target.value),
                    })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Participants *</Label>
                <Select
                  onValueChange={(value) => {
                    if (!formData.participants.includes(value)) {
                      setFormData({ ...formData, participants: [...formData.participants, value] });
                    }
                  }}
                >
                  <SelectTrigger data-testid="meeting-participants-select">
                    <SelectValue placeholder="Sélectionnez les participants" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((u) => (
                      <SelectItem key={u.id} value={u.id}>{u.full_name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.participants.map((pId) => {
                    const participant = users.find((u) => u.id === pId);
                    return (
                      <Badge key={pId} variant="secondary">
                        {participant?.full_name}
                        <button
                          type="button"
                          onClick={() => setFormData({
                            ...formData,
                            participants: formData.participants.filter((id) => id !== pId)
                          })}
                          className="ml-2 hover:text-destructive"
                        >
                          ×
                        </button>
                      </Badge>
                    );
                  })}
                </div>
              </div>
              <Button data-testid="submit-meeting-button" type="submit" className="w-full">Créer la réunion</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {meetings.map((meeting) => (
          <Card key={meeting.id} data-testid={`meeting-card-${meeting.id}`} className="hover:shadow-lg transition-all">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{meeting.title}</CardTitle>
                  <div className="flex items-center space-x-2 mt-2">
                    {getStatusBadge(meeting.status)}
                    <span className="text-sm text-muted-foreground">
                      {format(parseISO(meeting.date), 'dd MMM yyyy HH:mm', { locale: fr })}
                    </span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm font-medium mb-1">Ordre du jour:</p>
                <p className="text-sm text-muted-foreground line-clamp-3">{meeting.agenda}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium mb-1">Participants: {meeting.participants.length}</p>
                <p className="text-sm text-muted-foreground">
                  Confirmés: {meeting.confirmed_participants.length}/{meeting.participants.length}
                </p>
              </div>

              {meeting.decisions && meeting.decisions.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-1">Décisions:</p>
                  <ul className="text-sm text-muted-foreground list-disc list-inside">
                    {meeting.decisions.slice(0, 2).map((decision, idx) => (
                      <li key={idx} className="line-clamp-1">{decision}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex flex-wrap gap-2 pt-2">
                {meeting.status !== 'completed' && meeting.participants.includes(user?.id) && (
                  <Button
                    data-testid={`confirm-meeting-${meeting.id}`}
                    size="sm"
                    variant={meeting.confirmed_participants.includes(user?.id) ? "outline" : "default"}
                    onClick={() => handleConfirm(meeting.id)}
                    disabled={meeting.confirmed_participants.includes(user?.id)}
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    {meeting.confirmed_participants.includes(user?.id) ? 'Confirmé' : 'Confirmer'}
                  </Button>
                )}
                
                {user?.role === 'secretary' && meeting.status !== 'completed' && (
                  <Button
                    data-testid={`close-meeting-${meeting.id}`}
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      const minutes = prompt('Compte-rendu de la réunion:');
                      if (minutes) handleCloseMeeting(meeting.id, minutes);
                    }}
                  >
                    Clôturer
                  </Button>
                )}
                
                <Button
                  data-testid={`escalate-meeting-${meeting.id}`}
                  size="sm"
                  variant="outline"
                  onClick={() => handleEscalate(meeting.id)}
                >
                  <AlertOctagon className="h-4 w-4 mr-1" />
                  Escalader
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {meetings.length === 0 && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Aucune réunion planifiée</h3>
              <p className="text-sm text-muted-foreground">Créez votre première réunion pour commencer</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Meetings;