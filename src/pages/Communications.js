import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { toast } from 'sonner';
import { Send } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const Communications = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState({});
  const [newMessage, setNewMessage] = useState('');
  const [currentChannel, setCurrentChannel] = useState('web');

  const channels = ['web', 'mobile', 'other', 'general'];

  useEffect(() => {
    channels.forEach(channel => fetchMessages(channel));
  }, []);

  const fetchMessages = async (channel) => {
    try {
      const response = await axios.get(`${API}/messages/${channel}`);
      setMessages(prev => ({ ...prev, [channel]: response.data }));
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      await axios.post(`${API}/messages`, {
        channel: currentChannel,
        content: newMessage
      });
      
      if (newMessage.includes('[DECISION]')) {
        toast.success('Décision enregistrée', {
          description: 'La décision a été ajoutée à la prochaine réunion'
        });
      }
      
      setNewMessage('');
      fetchMessages(currentChannel);
    } catch (error) {
      toast.error('Échec de l\'envoi du message');
    }
  };

  return (
    <div data-testid="communications-page" className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Centre de Communication</h1>
        <p className="text-muted-foreground mt-1">
          Messagerie interne par canal de projet. Utilisez [DECISION] pour marquer une décision.
        </p>
      </div>

      <Tabs value={currentChannel} onValueChange={setCurrentChannel} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="web" data-testid="channel-web">Web</TabsTrigger>
          <TabsTrigger value="mobile" data-testid="channel-mobile">Mobile</TabsTrigger>
          <TabsTrigger value="other" data-testid="channel-other">Autres</TabsTrigger>
          <TabsTrigger value="general" data-testid="channel-general">Général</TabsTrigger>
        </TabsList>

        {channels.map(channel => (
          <TabsContent key={channel} value={channel} className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="capitalize">Canal {channel}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="h-96 overflow-y-auto space-y-3 p-4 rounded-lg bg-accent/20">
                  {messages[channel]?.map((msg) => (
                    <div
                      key={msg.id}
                      data-testid={`message-${msg.id}`}
                      className={`p-3 rounded-lg ${
                        msg.user_id === user?.id
                          ? 'bg-primary text-primary-foreground ml-auto max-w-[80%]'
                          : 'bg-card mr-auto max-w-[80%]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-medium text-sm">{msg.user_name}</p>
                        {msg.is_decision && (
                          <Badge variant="secondary" className="text-xs">DÉCISION</Badge>
                        )}
                      </div>
                      <p className="text-sm">{msg.content}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {format(parseISO(msg.created_at), 'HH:mm', { locale: fr })}
                      </p>
                    </div>
                  ))}
                  {(!messages[channel] || messages[channel]?.length === 0) && (
                    <p className="text-center text-muted-foreground py-12">
                      Aucun message dans ce canal
                    </p>
                  )}
                </div>

                <div className="flex space-x-2">
                  <Input
                    data-testid="message-input"
                    placeholder="Écrivez votre message... (utilisez [DECISION] pour une décision)"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                  />
                  <Button
                    data-testid="send-message-button"
                    onClick={handleSendMessage}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default Communications;