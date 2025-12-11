import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { AlertCircle, Calendar, CheckCircle, Clock } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const Dashboard = () => {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await axios.get(`${API}/dashboard`);
      setDashboard(response.data);
    } catch (error) {
      console.error('Failed to fetch dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  const getStatusColor = (status) => {
    const colors = {
      todo: 'bg-slate-500',
      in_progress: 'bg-blue-500',
      review: 'bg-yellow-500',
      done: 'bg-green-500'
    };
    return colors[status] || 'bg-gray-500';
  };

  const isOverdue = (deadline) => {
    return new Date(deadline) < new Date();
  };

  return (
    <div data-testid="dashboard-page" className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Bonjour, {user?.full_name} !</h1>
        <p className="text-muted-foreground mt-1">Voici un aperçu de votre journée</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tâches totales</CardTitle>
            <CheckCircle className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{dashboard?.total_tasks || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tâches en retard</CardTitle>
            <AlertCircle className="h-5 w-5 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${dashboard?.overdue_tasks > 0 ? 'text-red-500' : ''}`}>
              {dashboard?.overdue_tasks || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Réunions aujourd'hui</CardTitle>
            <Calendar className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{dashboard?.today_meetings || 0}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Mes tâches</CardTitle>
            <CardDescription>Tâches qui vous sont assignées</CardDescription>
          </CardHeader>
          <CardContent>
            {dashboard?.tasks?.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">Aucune tâche assignée</p>
            ) : (
              <div className="space-y-3">
                {dashboard?.tasks?.slice(0, 5).map((task) => (
                  <div
                    key={task.id}
                    data-testid={`task-${task.id}`}
                    className={`p-4 rounded-lg border transition-all hover:shadow-md ${
                      isOverdue(task.deadline) && task.status !== 'done'
                        ? 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800'
                        : 'bg-card'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium">{task.title}</h4>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {task.description}
                        </p>
                        <div className="flex items-center space-x-2 mt-2">
                          <Badge variant="outline" className={`${getStatusColor(task.status)} text-white border-0`}>
                            {task.status.replace('_', ' ')}
                          </Badge>
                          <div className="flex items-center text-xs text-muted-foreground">
                            <Clock className="h-3 w-3 mr-1" />
                            {format(parseISO(task.deadline), 'dd MMM yyyy', { locale: fr })}
                          </div>
                        </div>
                      </div>
                      {task.is_blocked && (
                        <Badge variant="destructive" className="ml-2">Bloqué</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Réunions du jour</CardTitle>
            <CardDescription>Vos réunions prévues aujourd'hui</CardDescription>
          </CardHeader>
          <CardContent>
            {dashboard?.meetings?.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">Aucune réunion aujourd'hui</p>
            ) : (
              <div className="space-y-3">
                {dashboard?.meetings?.map((meeting) => (
                  <div
                    key={meeting.id}
                    data-testid={`meeting-${meeting.id}`}
                    className="p-4 rounded-lg border bg-card hover:shadow-md transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium">{meeting.title}</h4>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {meeting.agenda}
                        </p>
                        <div className="flex items-center space-x-2 mt-2">
                          <Badge
                            variant={meeting.status === 'at_risk' ? 'destructive' : 'outline'}
                          >
                            {meeting.status === 'at_risk' ? 'En risque' : meeting.status}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {format(parseISO(meeting.date), 'HH:mm', { locale: fr })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;