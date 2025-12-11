import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { toast } from 'sonner';
import { Plus, AlertOctagon, MessageSquare, Clock } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const Projects = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [comments, setComments] = useState({});
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [commentDialogOpen, setCommentDialogOpen] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'web',
    assigned_to: '',
    deadline: ''
  });

  useEffect(() => {
    fetchTasks();
    fetchUsers();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await axios.get(`${API}/tasks`);
      setTasks(response.data);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
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

  const toDatetimeLocal = (isoString) => {
    const date = new Date(isoString);
    return date.toISOString().slice(0, 16); // "YYYY-MM-DDTHH:mm"
  };


  const fetchComments = async (taskId) => {
    try {
      const response = await axios.get(`${API}/tasks/${taskId}/comments`);
      setComments(prev => ({ ...prev, [taskId]: response.data }));
    } catch (error) {
      console.error('Failed to fetch comments:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      await axios.post(`${API}/tasks`, formData);
      toast.success('Tâche créée avec succès');
      setDialogOpen(false);
      setFormData({ title: '', description: '', category: 'web', assigned_to: '', deadline: '' });
      fetchTasks();
    } catch (error) {
      toast.error('Échec de la création', {
        description: error.response?.data?.detail || 'Une erreur est survenue'
      });
    }
  };

  const handleUpdateStatus = async (taskId, newStatus) => {
    try {
      await axios.put(`${API}/tasks/${taskId}`, { status: newStatus });
      toast.success('Statut mis à jour');
      fetchTasks();
    } catch (error) {
      toast.error('Échec de la mise à jour');
    }
  };

  const handleBlockTask = async (taskId) => {
    const reason = prompt('Raison du blocage:');
    if (!reason) return;

    try {
      await axios.post(`${API}/tasks/${taskId}/block`, null, {
        params: { reason }
      });
      toast.success('Tâche signalée comme bloquée');
      fetchTasks();
    } catch (error) {
      toast.error('Échec du signalement');
    }
  };

  const handleAddComment = async (taskId) => {
    if (!newComment.trim()) return;

    try {
      await axios.post(`${API}/tasks/${taskId}/comments`, { content: newComment });
      toast.success('Commentaire ajouté');
      setNewComment('');
      fetchComments(taskId);
    } catch (error) {
      toast.error('Échec de l\'ajout du commentaire');
    }
  };

  const handleEscalate = async (taskId) => {
    try {
      await axios.post(`${API}/escalate`, {
        entity_type: 'task',
        entity_id: taskId,
        reason: 'Problème signalé sur cette tâche'
      });
      toast.success('Escaladé au manager');
    } catch (error) {
      toast.error('Échec de l\'escalade');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      todo: 'bg-slate-500',
      in_progress: 'bg-blue-500',
      review: 'bg-yellow-500',
      done: 'bg-green-500'
    };
    return colors[status] || 'bg-gray-500';
  };

  const isOverdue = (deadline, status) => {
    return new Date(deadline) < new Date() && status !== 'done';
  };

  const TaskCard = ({ task }) => (
    <Card
      data-testid={`task-card-${task.id}`}
      className={`hover:shadow-lg transition-all ${
        isOverdue(task.deadline, task.status)
          ? 'border-red-500 bg-red-50 dark:bg-red-950/20'
          : ''
      }`}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="text-base">{task.title}</CardTitle>
          {task.is_blocked && (
            <Badge variant="destructive">Bloqué</Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{task.description}</p>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center space-x-2 text-xs">
          <Badge className={`${getStatusColor(task.status)} text-white border-0`}>
            {task.status.replace('_', ' ')}
          </Badge>
          <div className="flex items-center text-muted-foreground">
            <Clock className="h-3 w-3 mr-1" />
            {format(parseISO(task.deadline), 'dd MMM', { locale: fr })}
          </div>
        </div>

        <div className="text-xs text-muted-foreground">
          Assigné à: {users.find(u => u.id === task.assigned_to)?.full_name || 'N/A'}
        </div>

        <div className="flex flex-wrap gap-2 pt-2">
          <Select onValueChange={(value) => handleUpdateStatus(task.id, value)}>
            <SelectTrigger className="h-8 text-xs" data-testid={`task-status-${task.id}`}>
              <SelectValue placeholder="Changer statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todo">À faire</SelectItem>
              <SelectItem value="in_progress">En cours</SelectItem>
              <SelectItem value="review">En révision</SelectItem>
              <SelectItem value="done">Terminé</SelectItem>
            </SelectContent>
          </Select>

          <Button
            data-testid={`block-task-${task.id}`}
            size="sm"
            variant="outline"
            onClick={() => handleBlockTask(task.id)}
          >
            Signaler
          </Button>

          <Button
            data-testid={`comment-task-${task.id}`}
            size="sm"
            variant="outline"
            onClick={() => {
              setSelectedTask(task);
              fetchComments(task.id);
              setCommentDialogOpen(true);
            }}
          >
            <MessageSquare className="h-3 w-3 mr-1" />
            Commenter
          </Button>

          <Button
            data-testid={`escalate-task-${task.id}`}
            size="sm"
            variant="outline"
            onClick={() => handleEscalate(task.id)}
          >
            <AlertOctagon className="h-3 w-3 mr-1" />
            Escalader
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  const webTasks = tasks.filter(t => t.category === 'web');
  const mobileTasks = tasks.filter(t => t.category === 'mobile');
  const otherTasks = tasks.filter(t => t.category === 'other');

  return (
    <div data-testid="projects-page" className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tableaux de Projets</h1>
          <p className="text-muted-foreground mt-1">Gérez vos tâches par catégorie</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="create-task-button">
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle tâche
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Créer une tâche</DialogTitle>
              <DialogDescription>
                Créez une nouvelle tâche avec un responsable et une deadline
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Titre *</Label>
                <Input
                  id="title"
                  data-testid="task-title-input"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  data-testid="task-description-input"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Catégorie *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger data-testid="task-category-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="web">Web</SelectItem>
                    <SelectItem value="mobile">Mobile</SelectItem>
                    <SelectItem value="other">Autres Solutions</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="assigned_to">Assigné à *</Label>
                <Select
                  value={formData.assigned_to}
                  onValueChange={(value) => setFormData({ ...formData, assigned_to: value })}
                >
                  <SelectTrigger data-testid="task-assignee-select">
                    <SelectValue placeholder="Sélectionnez un utilisateur" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((u) => (
                      <SelectItem key={u.id} value={u.id}>{u.full_name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="deadline">Date limite *</Label>
                <Input
                  id="deadline"
                  data-testid="task-deadline-input"
                  type="datetime-local"
                  value={formData.deadline}
                  onChange={(e) =>
                    setFormData({ ...formData, deadline: e.target.value })
                  }
                  required
                />
              </div>
              <Button data-testid="submit-task-button" type="submit" className="w-full">Créer la tâche</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="web" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="web" data-testid="tab-web">
            Web ({webTasks.length})
          </TabsTrigger>
          <TabsTrigger value="mobile" data-testid="tab-mobile">
            Mobile ({mobileTasks.length})
          </TabsTrigger>
          <TabsTrigger value="other" data-testid="tab-other">
            Autres ({otherTasks.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="web" className="space-y-4 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {webTasks.map(task => <TaskCard key={task.id} task={task} />)}
          </div>
          {webTasks.length === 0 && (
            <p className="text-center text-muted-foreground py-12">Aucune tâche Web</p>
          )}
        </TabsContent>

        <TabsContent value="mobile" className="space-y-4 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mobileTasks.map(task => <TaskCard key={task.id} task={task} />)}
          </div>
          {mobileTasks.length === 0 && (
            <p className="text-center text-muted-foreground py-12">Aucune tâche Mobile</p>
          )}
        </TabsContent>

        <TabsContent value="other" className="space-y-4 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {otherTasks.map(task => <TaskCard key={task.id} task={task} />)}
          </div>
          {otherTasks.length === 0 && (
            <p className="text-center text-muted-foreground py-12">Aucune autre tâche</p>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={commentDialogOpen} onOpenChange={setCommentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Commentaires - {selectedTask?.title}</DialogTitle>
            <DialogDescription>
              Historique traçable des discussions sur cette tâche
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="max-h-96 overflow-y-auto space-y-3">
              {comments[selectedTask?.id]?.map((comment) => (
                <div key={comment.id} className="p-3 rounded-lg bg-accent/50">
                  <p className="font-medium text-sm">{comment.user_name}</p>
                  <p className="text-sm mt-1">{comment.content}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {format(parseISO(comment.created_at), 'dd MMM yyyy HH:mm', { locale: fr })}
                  </p>
                </div>
              ))}
              {(!comments[selectedTask?.id] || comments[selectedTask?.id]?.length === 0) && (
                <p className="text-sm text-muted-foreground text-center py-8">Aucun commentaire</p>
              )}
            </div>
            <div className="flex space-x-2">
              <Input
                data-testid="comment-input"
                placeholder="Ajouter un commentaire..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleAddComment(selectedTask?.id);
                  }
                }}
              />
              <Button
                data-testid="submit-comment-button"
                onClick={() => handleAddComment(selectedTask?.id)}
              >
                Envoyer
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Projects;
