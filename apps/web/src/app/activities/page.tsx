'use client';

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select } from '@/components/ui/select';
import { formatDate, formatDateTime } from '@/lib/utils';
import {
  Plus,
  Phone,
  Mail,
  Calendar,
  MessageCircle,
  MapPin,
  CheckSquare,
  FileText,
  CheckCircle2,
  Clock,
  User,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';

type ActivityType = 'CALL' | 'EMAIL' | 'MEETING' | 'WHATSAPP' | 'VISIT' | 'TASK' | 'NOTE';

interface Activity {
  id: number;
  type: ActivityType;
  subject: string;
  description?: string;
  scheduledAt: string;
  completedAt?: string;
  isCompleted: boolean;
  contact?: { id: number; firstName: string; lastName: string };
  contactId?: number | null;
  opportunity?: { id: number; name: string };
  opportunityId?: number | null;
  user?: { id: number; firstName: string; lastName: string };
  assignedTo?: number;
  createdAt: string;
  updatedAt: string;
}

interface Contact {
  id: number;
  firstName: string;
  lastName: string;
}

interface Opportunity {
  id: number;
  name: string;
}

interface Meta {
  total: number;
  page: number;
  limit: number;
}

const TYPE_ICON: Record<ActivityType, React.ReactNode> = {
  CALL: <Phone className="h-5 w-5" />,
  EMAIL: <Mail className="h-5 w-5" />,
  MEETING: <Calendar className="h-5 w-5" />,
  WHATSAPP: <MessageCircle className="h-5 w-5" />,
  VISIT: <MapPin className="h-5 w-5" />,
  TASK: <CheckSquare className="h-5 w-5" />,
  NOTE: <FileText className="h-5 w-5" />,
};

const TYPE_LABEL: Record<ActivityType, string> = {
  CALL: 'Llamada',
  EMAIL: 'Email',
  MEETING: 'Reunión',
  WHATSAPP: 'WhatsApp',
  VISIT: 'Visita',
  TASK: 'Tarea',
  NOTE: 'Nota',
};

const TYPE_COLOR: Record<ActivityType, string> = {
  CALL: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30',
  EMAIL: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30',
  MEETING: 'text-orange-600 bg-orange-100 dark:bg-orange-900/30',
  WHATSAPP: 'text-green-600 bg-green-100 dark:bg-green-900/30',
  VISIT: 'text-rose-600 bg-rose-100 dark:bg-rose-900/30',
  TASK: 'text-cyan-600 bg-cyan-100 dark:bg-cyan-900/30',
  NOTE: 'text-gray-600 bg-gray-100 dark:bg-gray-900/30',
};

const emptyForm = {
  type: 'CALL' as ActivityType,
  subject: '',
  description: '',
  scheduledAt: '',
  contactId: '',
  opportunityId: '',
};

export default function ActivitiesPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [meta, setMeta] = useState<Meta>({ total: 0, page: 1, limit: 10 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [completingId, setCompletingId] = useState<number | null>(null);

  const fetchActivities = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = { page: String(page), limit: '10' };
      if (typeFilter) params.type = typeFilter;
      if (dateFrom) params.dateFrom = dateFrom;
      if (dateTo) params.dateTo = dateTo;
      const { data } = await api.get('/activities', { params });
      setActivities(data?.data ?? data?.data?.data ?? []);
      setMeta(data?.meta ?? data?.data?.meta ?? { total: 0, page: 1, limit: 10 });
    } catch {
      toast.error('Error al cargar actividades');
    } finally {
      setLoading(false);
    }
  }, [page, typeFilter, dateFrom, dateTo]);

  const fetchContacts = useCallback(async () => {
    try {
      const { data } = await api.get('/contacts', { params: { limit: '100' } });
      setContacts(data.data?.data ?? data.data ?? []);
    } catch {
      // non-critical
    }
  }, []);

  const fetchOpportunities = useCallback(async () => {
    try {
      const { data } = await api.get('/opportunities', { params: { limit: '100' } });
      setOpportunities(data.data?.data ?? data.data ?? []);
    } catch {
      // non-critical
    }
  }, []);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  const openCreate = () => {
    setForm(emptyForm);
    setModalOpen(true);
    fetchContacts();
    fetchOpportunities();
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        type: form.type,
        subject: form.subject,
        description: form.description || undefined,
        scheduledAt: form.scheduledAt || undefined,
      };
      if (form.contactId) payload.contactId = Number(form.contactId);
      if (form.opportunityId) payload.opportunityId = Number(form.opportunityId);
      await api.post('/activities', payload);
      toast.success('Actividad creada');
      setModalOpen(false);
      fetchActivities();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Error al crear actividad');
    } finally {
      setSaving(false);
    }
  };

  const handleComplete = async (id: number) => {
    setCompletingId(id);
    try {
      await api.patch(`/activities/${id}/complete`);
      toast.success('Actividad completada');
      fetchActivities();
    } catch {
      toast.error('Error al completar actividad');
    } finally {
      setCompletingId(null);
    }
  };

  const totalPages = Math.ceil((meta?.total || 0) / (meta?.limit || 10));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => window.location.href = '/dashboard'}>
            Volver al inicio
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Actividades</h1>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Nueva Actividad
        </Button>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-3">
            <Select
              value={typeFilter}
              onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
              options={[
                { value: 'CALL', label: 'Llamada' },
                { value: 'EMAIL', label: 'Email' },
                { value: 'MEETING', label: 'Reunión' },
                { value: 'WHATSAPP', label: 'WhatsApp' },
                { value: 'VISIT', label: 'Visita' },
                { value: 'TASK', label: 'Tarea' },
                { value: 'NOTE', label: 'Nota' },
              ]}
              placeholder="Filtrar por tipo"
              className="w-[180px]"
            />
            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
              placeholder="Desde"
              className="w-[160px]"
            />
            <Input
              type="date"
              value={dateTo}
              onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
              placeholder="Hasta"
              className="w-[160px]"
            />
            {(typeFilter || dateFrom || dateTo) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { setTypeFilter(''); setDateFrom(''); setDateTo(''); setPage(1); }}
              >
                Limpiar
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted-foreground border-t-transparent" />
        </div>
      ) : activities.length === 0 ? (
        <div className="py-20 text-center text-muted-foreground">
          No se encontraron actividades
        </div>
      ) : (
        <div className="space-y-3">
          {activities.map((activity) => {
            const colorClass = TYPE_COLOR[activity.type];
            return (
              <Card key={activity.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${colorClass}`}>
                      {TYPE_ICON[activity.type]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {TYPE_LABEL[activity.type]}
                            </Badge>
                            {activity.isCompleted && (
                              <Badge variant="success" className="text-xs">
                                Completada
                              </Badge>
                            )}
                          </div>
                          <h3 className="font-medium mt-1">{activity.subject}</h3>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {!activity.isCompleted && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleComplete(activity.id)}
                              disabled={completingId === activity.id}
                            >
                              <CheckCircle2 className="mr-1 h-4 w-4 text-green-600" />
                              {completingId === activity.id ? 'Completando...' : 'Completar'}
                            </Button>
                          )}
                        </div>
                      </div>
                      {activity.description && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {activity.description}
                        </p>
                      )}
                      <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-muted-foreground">
                        {activity.contact && (
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {activity.contact.firstName} {activity.contact.lastName}
                          </span>
                        )}
                        {activity.user && (
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {activity.user.firstName} {activity.user.lastName}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDateTime(activity.scheduledAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-sm text-muted-foreground">
            Mostrando {(page - 1) * (meta?.limit || 10) + 1}–{Math.min(page * (meta?.limit || 10), meta?.total || 0)} de {meta?.total || 0}
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Anterior
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <Button
                key={p}
                variant={p === page ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPage(p)}
              >
                {p}
              </Button>
            ))}
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Siguiente
            </Button>
          </div>
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="w-full max-w-lg mx-4">
            <div className="flex items-center justify-between p-6 pb-2">
              <h2 className="text-lg font-semibold">Nueva Actividad</h2>
              <Button variant="ghost" size="icon" onClick={() => setModalOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <CardContent>
              <form onSubmit={handleSave} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Tipo *</label>
                  <Select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value as ActivityType })}
                    options={[
                      { value: 'CALL', label: 'Llamada' },
                      { value: 'EMAIL', label: 'Email' },
                      { value: 'MEETING', label: 'Reunión' },
                      { value: 'WHATSAPP', label: 'WhatsApp' },
                      { value: 'VISIT', label: 'Visita' },
                      { value: 'TASK', label: 'Tarea' },
                      { value: 'NOTE', label: 'Nota' },
                    ]}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Asunto *</label>
                  <Input
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Descripción</label>
                  <textarea
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Fecha Programada</label>
                  <Input
                    type="datetime-local"
                    value={form.scheduledAt}
                    onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Contacto</label>
                  <Select
                    value={form.contactId}
                    onChange={(e) => setForm({ ...form, contactId: e.target.value })}
                    options={contacts.map((c) => ({
                      value: String(c.id),
                      label: `${c.firstName} ${c.lastName}`,
                    }))}
                    placeholder="Seleccionar contacto (opcional)"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Oportunidad</label>
                  <Select
                    value={form.opportunityId}
                    onChange={(e) => setForm({ ...form, opportunityId: e.target.value })}
                    options={opportunities.map((o) => ({
                      value: String(o.id),
                      label: o.name,
                    }))}
                    placeholder="Seleccionar oportunidad (opcional)"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={saving}>
                    {saving ? 'Guardando...' : 'Crear Actividad'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
