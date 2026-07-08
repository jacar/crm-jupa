'use client';

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select } from '@/components/ui/select';
import { Plus, Search, CheckSquare, Clock, AlertCircle, Flag, User } from 'lucide-react';
import toast from 'react-hot-toast';

type Priority = 'low' | 'medium' | 'high';

interface User {
  id: string;
  firstName: string;
  lastName: string;
}

interface Opportunity {
  id: string;
  name: string;
}

interface Task {
  id: string;
  title: string;
  description?: string;
  isCompleted: boolean;
  priority: Priority;
  dueDate?: string;
  assignedTo?: string;
  assignedUser?: User;
  opportunityId?: string;
  opportunity?: Opportunity;
  createdAt: string;
}

interface Meta {
  total: number;
  page: number;
  limit: number;
}

const PRIORITY_BADGE: Record<Priority, 'secondary' | 'warning' | 'destructive'> = {
  low: 'secondary',
  medium: 'warning',
  high: 'destructive',
};

const PRIORITY_LABEL: Record<Priority, string> = {
  low: 'Baja',
  medium: 'Media',
  high: 'Alta',
};

const PRIORITY_OPTIONS = Object.entries(PRIORITY_LABEL).map(([value, label]) => ({ value, label }));

const emptyForm = {
  title: '',
  description: '',
  priority: '' as '' | Priority,
  dueDate: '',
  userId: '',
  opportunityId: '',
};

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [meta, setMeta] = useState<Meta>({ total: 0, page: 1, limit: 10 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [isCompletedFilter, setIsCompletedFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [toggling, setToggling] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = { page: String(page), limit: '10' };
      if (isCompletedFilter) params.isCompleted = isCompletedFilter;
      if (priorityFilter) params.priority = priorityFilter;
      if (dateFrom) params.dateFrom = dateFrom;
      if (dateTo) params.dateTo = dateTo;
      const { data } = await api.get('/tasks', { params });
      setTasks(data?.data ?? data?.data?.data ?? []);
      setMeta(data?.meta ?? data?.data?.meta ?? { total: 0, page: 1, limit: 10 });
    } catch {
      toast.error('Error al cargar tareas');
    } finally {
      setLoading(false);
    }
  }, [page, isCompletedFilter, priorityFilter, dateFrom, dateTo]);

  const fetchUsers = useCallback(async () => {
    try {
      const { data } = await api.get('/users');
      setUsers(data.data ?? data ?? []);
    } catch {}
  }, []);

  const fetchOpportunities = useCallback(async () => {
    try {
      const { data } = await api.get('/opportunities', { params: { limit: '100' } });
      setOpportunities(data.data ?? []);
    } catch {}
  }, []);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);
  useEffect(() => { fetchUsers(); }, [fetchUsers]);
  useEffect(() => { fetchOpportunities(); }, [fetchOpportunities]);

  const openCreate = () => {
    setForm(emptyForm);
    setCreateOpen(true);
  };

  const handleToggleComplete = async (task: Task) => {
    setToggling(task.id);
    try {
      await api.patch(`/tasks/${task.id}/complete`);
      toast.success(task.isCompleted ? 'Tarea reabierta' : 'Tarea completada');
      fetchTasks();
    } catch {
      toast.error('Error al actualizar tarea');
    } finally {
      setToggling(null);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) { toast.error('El título es obligatorio'); return; }
    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        title: form.title,
        description: form.description || undefined,
        priority: form.priority || undefined,
        dueDate: form.dueDate || undefined,
        userId: form.userId || undefined,
        opportunityId: form.opportunityId || undefined,
      };
      await api.post('/tasks', payload);
      toast.success('Tarea creada');
      setCreateOpen(false);
      fetchTasks();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Error al crear tarea');
    } finally {
      setSaving(false);
    }
  };

  const totalPages = Math.ceil((meta?.total || 0) / (meta?.limit || 10));

  const isOverdue = (dueDate?: string) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date() && !isToday(dueDate);
  };

  const isToday = (date: string) => {
    const d = new Date(date);
    const today = new Date();
    return d.getDate() === today.getDate() &&
      d.getMonth() === today.getMonth() &&
      d.getFullYear() === today.getFullYear();
  };

  const getUserName = (task: Task) => {
    if (task.assignedUser) return `${task.assignedUser.firstName} ${task.assignedUser.lastName}`;
    return '—';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => window.location.href = '/dashboard'}>
            Volver al inicio
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Tareas</h1>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Nueva Tarea
        </Button>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-3">
            <Select
              value={isCompletedFilter}
              onChange={(e) => { setIsCompletedFilter(e.target.value); setPage(1); }}
              options={[
                { value: 'true', label: 'Completadas' },
                { value: 'false', label: 'Pendientes' },
              ]}
              placeholder="Todas"
              className="w-[160px]"
            />
            <Select
              value={priorityFilter}
              onChange={(e) => { setPriorityFilter(e.target.value); setPage(1); }}
              options={PRIORITY_OPTIONS}
              placeholder="Filtrar por prioridad"
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
            {(isCompletedFilter || priorityFilter || dateFrom || dateTo) && (
              <Button variant="ghost" size="sm" onClick={() => { setIsCompletedFilter(''); setPriorityFilter(''); setDateFrom(''); setDateTo(''); setPage(1); }}>
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
      ) : tasks.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center text-muted-foreground">No se encontraron tareas</CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {tasks.map((task) => (
            <Card key={task.id} className={`transition-colors ${task.isCompleted ? 'opacity-60' : ''}`}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="pt-0.5">
                    <input
                      type="checkbox"
                      checked={task.isCompleted}
                      disabled={toggling === task.id}
                      onChange={() => handleToggleComplete(task)}
                      className="h-5 w-5 rounded border-gray-300 cursor-pointer"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className={`font-medium ${task.isCompleted ? 'line-through text-muted-foreground' : ''}`}>
                          {task.title}
                        </p>
                        {task.description && (
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{task.description}</p>
                        )}
                      </div>
                      <Badge variant={PRIORITY_BADGE[task.priority]}>
                        <Flag className="mr-1 h-3 w-3" />
                        {PRIORITY_LABEL[task.priority]}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <User className="h-3.5 w-3.5" />
                        {getUserName(task)}
                      </span>
                      {task.dueDate && (
                        <span className={`flex items-center gap-1 ${isOverdue(task.dueDate) && !task.isCompleted ? 'text-red-500 font-medium' : ''}`}>
                          <Clock className="h-3.5 w-3.5" />
                          {isOverdue(task.dueDate) && !task.isCompleted && <AlertCircle className="h-3.5 w-3.5 text-red-500" />}
                          {formatDate(task.dueDate)}
                        </span>
                      )}
                      {task.opportunity && (
                        <span className="flex items-center gap-1">
                          <span className="text-muted-foreground">Oportunidad:</span>
                          {task.opportunity.name}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Mostrando {(page - 1) * (meta?.limit || 10) + 1}–{Math.min(page * (meta?.limit || 10), meta?.total || 0)} de {meta?.total || 0}
          </p>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
              Anterior
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <Button key={p} variant={p === page ? 'default' : 'outline'} size="sm" onClick={() => setPage(p)}>
                {p}
              </Button>
            ))}
            <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>
              Siguiente
            </Button>
          </div>
        </div>
      )}

      {createOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-lg rounded-xl border bg-card p-6 shadow-lg">
            <h2 className="mb-4 text-lg font-semibold">Nueva Tarea</h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Título *</label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Descripción</label>
                <textarea
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Prioridad</label>
                  <Select
                    value={form.priority}
                    onChange={(e) => setForm({ ...form, priority: e.target.value as Priority })}
                    options={PRIORITY_OPTIONS}
                    placeholder="Seleccionar prioridad"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Fecha de vencimiento</label>
                  <Input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Asignar a</label>
                <Select
                  value={form.userId}
                  onChange={(e) => setForm({ ...form, userId: e.target.value })}
                  options={users.map((u) => ({ value: u.id, label: `${u.firstName} ${u.lastName}` }))}
                  placeholder="Seleccionar usuario"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Oportunidad relacionada</label>
                <Select
                  value={form.opportunityId}
                  onChange={(e) => setForm({ ...form, opportunityId: e.target.value })}
                  options={opportunities.map((o) => ({ value: o.id, label: o.name }))}
                  placeholder="Seleccionar oportunidad (opcional)"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>Cancelar</Button>
                <Button type="submit" disabled={saving}>{saving ? 'Guardando...' : 'Crear Tarea'}</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
