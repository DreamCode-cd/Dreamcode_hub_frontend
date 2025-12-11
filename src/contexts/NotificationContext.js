import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [ws, setWs] = useState(null);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {  
    if (user) {
      const wsUrl = process.env.REACT_APP_BACKEND_URL.replace(/^http/, 'ws');
      const websocket = new WebSocket(`${wsUrl}/ws/${user.id}`);

      websocket.onmessage = (event) => {
        const notification = JSON.parse(event.data);
        setNotifications(prev => [notification, ...prev]);
        
        if (notification.priority === 'urgent' || notification.priority === 'high') {
          toast.error(notification.title, {
            description: notification.message
          });
        } else {
          toast.info(notification.title, {
            description: notification.message
          });
        }
      };

      setWs(websocket);

      return () => {
        websocket.close();
      };
    }
  }, [user]);

  return (
    <NotificationContext.Provider value={{ notifications, setNotifications }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);