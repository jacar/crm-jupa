'use client';

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDateTime } from '@/lib/utils';
import {
  Bell,
  UserPlus,
  FileText,
  CreditCard,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  Loader2,
} from 'lucide-react';
import toast from 'react-hot-toast';

type NotificationType = 'user_created' | 'lead_assigned' | 'opportunity_won' | 'invoice_paid' | 'goal_achieved' | 'system' | 'alert';

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

interface Meta {
  total: number;
  page: number;
  limit: number;
}

const NOTIFICATION_ICON: Record<NotificationType, typeof Bell> = {
  user_created: UserPlus,
  lead_assigned: FileText,
  opportunity_won: TrendingUp,
  invoice_paid: CreditCard,
  goal_achieved: CheckCircle,
  system: Bell,
  alert: AlertCircle,
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [meta, setMeta] = useState<Meta>({ total: 0, page: 1, limit: 20 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [markingAll, setMarkingAll] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/notifications', {
        params: { page, limit: 20 },
      });
      setNotifications(data?.data ?? data?.data?.data ?? []);
      setMeta(data?.meta ?? data?.data?.meta ?? { total: 0, page: 1, limit: 10 });
    } catch {
      toast.error('Error al cargar notificaciones');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkRead = async (id: string) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
      );
    } catch {
      toast.error('Error al marcar como leída');
    }
  };

  const handleMarkAllRead = async () => {
    setMarkingAll(true);
    try {
      await api.post('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      toast.success('Todas marcadas como leídas');
    } catch {
      toast.error('Error al marcar todas como leídas');
    } finally {
      setMarkingAll(false);
    }
  };

  const totalPages = Math.ceil((meta?.total || 0) / (meta?.limit || 10));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold tracking-tight">Notificaciones</h1>
          {unreadCount > 0 && (
            <Badge variant="default" className="rounded-full px-2.5">
              {unreadCount}
            </Badge>
          )}
        </div>
        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAllRead}
            disabled={markingAll}
          >
            {markingAll ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Marcar todas como leídas
          </Button>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <Bell className="h-16 w-16 mb-4" />
          <p className="text-lg font-medium">No hay notificaciones</p>
          <p className="text-sm">No tienes notificaciones nuevas por el momento.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((notification) => {
            const Icon = NOTIFICATION_ICON[notification.type] || Bell;
            return (
              <Card
                key={notification.id}
                className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                  !notification.read ? 'border-l-blue-500 border-l-4' : ''
                }`}
                onClick={() => {
                  if (!notification.read) handleMarkRead(notification.id);
                }}
              >
                <CardContent className="flex items-start gap-4 p-4">
                  <div className="relative shrink-0">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full ${
                        !notification.read
                          ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    {!notification.read && (
                      <span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full bg-blue-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p
                        className={`text-sm font-medium ${
                          !notification.read ? 'text-foreground' : 'text-muted-foreground'
                        }`}
                      >
                        {notification.title}
                      </p>
                      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                      {notification.message}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {formatDateTime(notification.createdAt)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1 pt-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Anterior
          </Button>
          <span className="px-3 text-sm text-muted-foreground">
            Página {page} de {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Siguiente
          </Button>
        </div>
      )}

      <div className="text-center">
        <Button variant="link" className="text-sm">
          Ver todas
        </Button>
      </div>
    </div>
  );
}
