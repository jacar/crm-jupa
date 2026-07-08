'use client';

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select } from '@/components/ui/select';
import { formatDate } from '@/lib/utils';
import {
  Plus,
  LayoutGrid,
  Table2,
  Search,
  ChevronDown,
  GripVertical,
  X,
  Loader2,
  User,
  Building2,
  Target,
  TrendingUp,
  Star,
} from 'lucide-react';
import toast from 'react-hot-toast';

type LeadStatus = 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'CONVERTED' | 'DISQUALIFIED';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface Lead {
  id: string;
  name: string;
  description?: string;
  source?: string;
  campaign?: string;
  score: number;
  status: LeadStatus;
  probability: number;
  notes?: string;
  companyId?: string;
  contactId?: string;
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
}

const STATUS_OPTIONS: { value: LeadStatus; label: string }[] = [
  { value: 'NEW', label: 'Nuevo' },
  { value: 'CONTACTED', label: 'Contactado' },
  { value: 'QUALIFIED', label: 'Calificado' },
  { value: 'CONVERTED', label: 'Convertido' },
  { value: 'DISQUALIFIED', label: 'Descalificado' },
];

const STATUS_BADGE: Record<LeadStatus, 'outline' | 'warning' | 'default' | 'success' | 'destructive'> = {
  NEW: 'outline',
  CONTACTED: 'warning',
  QUALIFIED: 'default',
  CONVERTED: 'success',
  DISQUALIFIED: 'destructive',
};

const KANBAN_STATUSES: LeadStatus[] = ['NEW', 'CONTACTED', 'QUALIFIED', 'CONVERTED', 'DISQUALIFIED'];

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'table' | 'kanban'>('table');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [userFilter, setUserFilter] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [statusLoading, setStatusLoading] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: '',
    description: '',
    source: '',
    score: 0,
    assignedTo: '',
  });

  const fetchLeads = useCallback(async () => {
    try {
      setLoading(true);
      const params: Record<string, string> = {};
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      if (userFilter) params.assignedTo = userFilter;
      params.limit = '100';
      const { data } = await api.get('/leads', { params });
      setLeads(data.data);
    } catch {
      toast.error('Error al cargar leads');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, userFilter]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  useEffect(() => {
    api.get('/users').then(({ data }) => {
      setUsers(data.data ?? data);
    }).catch(() => {});
  }, []);

  const handleStatusChange = async (id: string, status: LeadStatus) => {
    try {
      setStatusLoading(id);
      await api.patch(`/leads/${id}/status`, { status });
      toast.success('Estado actualizado');
      fetchLeads();
    } catch {
      toast.error('Error al cambiar estado');
    } finally {
      setStatusLoading(null);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error('El nombre es obligatorio');
      return;
    }
    try {
      await api.post('/leads', form);
      toast.success('Lead creado');
      setShowCreateModal(false);
      setForm({ name: '', description: '', source: '', score: 0, assignedTo: '' });
      fetchLeads();
    } catch {
      toast.error('Error al crear lead');
    }
  };

  const groupedLeads = KANBAN_STATUSES.reduce(
    (acc, status) => {
      acc[status] = leads.filter((l) => l.status === status);
      return acc;
    },
    {} as Record<LeadStatus, Lead[]>,
  );

  const getUserName = (id?: string) => {
    if (!id) return '—';
    const user = users.find((u) => u.id === id);
    return user ? `${user.firstName} ${user.lastName}` : '—';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => window.location.href = '/dashboard'}>
            Volver al inicio
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Leads</h1>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-md border">
            <Button
              variant={view === 'table' ? 'default' : 'ghost'}
              size="sm"
              className="rounded-r-none"
              onClick={() => setView('table')}
            >
              <Table2 className="h-4 w-4" />
            </Button>
            <Button
              variant={view === 'kanban' ? 'default' : 'ghost'}
              size="sm"
              className="rounded-l-none"
              onClick={() => setView('kanban')}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
          </div>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="mr-2 h-4 w-4" /> Nuevo Lead
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { value: 'NEW', label: 'Nuevo' },
                { value: 'CONTACTED', label: 'Contactado' },
                { value: 'QUALIFIED', label: 'Calificado' },
                { value: 'CONVERTED', label: 'Convertido' },
                { value: 'DISQUALIFIED', label: 'Descalificado' },
              ]}
              placeholder="Filtrar por estado"
              className="w-[180px]"
            />
            <Select
              value={userFilter}
              onChange={(e) => setUserFilter(e.target.value)}
              options={users.map((u) => ({ value: u.id, label: `${u.firstName} ${u.lastName}` }))}
              placeholder="Filtrar por usuario"
              className="w-[200px]"
            />
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : view === 'table' ? (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left p-3 font-medium">Nombre</th>
                    <th className="text-left p-3 font-medium">Empresa</th>
                    <th className="text-left p-3 font-medium">Estado</th>
                    <th className="text-left p-3 font-medium">Fuente</th>
                    <th className="text-center p-3 font-medium">Score</th>
                    <th className="text-left p-3 font-medium">Asignado a</th>
                    <th className="text-left p-3 font-medium">Creado</th>
                    <th className="text-right p-3 font-medium">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-muted-foreground">
                        No se encontraron leads
                      </td>
                    </tr>
                  ) : (
                    leads.map((lead) => (
                      <tr key={lead.id} className="border-b hover:bg-muted/30 transition-colors">
                        <td className="p-3 font-medium">{lead.name}</td>
                        <td className="p-3 text-muted-foreground">{lead.companyId ? <Building2 className="inline h-3 w-3 mr-1" /> : null}{lead.companyId ? '—' : '—'}</td>
                        <td className="p-3">
                          <Badge variant={STATUS_BADGE[lead.status]}>
                            {STATUS_OPTIONS.find((s) => s.value === lead.status)?.label}
                          </Badge>
                        </td>
                        <td className="p-3 text-muted-foreground">{lead.source || '—'}</td>
                        <td className="p-3 text-center">
                          <span className={`inline-flex items-center gap-1 font-semibold ${lead.score >= 70 ? 'text-green-600' : lead.score >= 40 ? 'text-yellow-600' : 'text-muted-foreground'}`}>
                            {lead.score}
                            <Star className="h-3 w-3 fill-current" />
                          </span>
                        </td>
                        <td className="p-3 text-muted-foreground">
                          <User className="inline h-3 w-3 mr-1" />
                          {getUserName(lead.assignedTo)}
                        </td>
                        <td className="p-3 text-muted-foreground">{formatDate(lead.createdAt)}</td>
                        <td className="p-3 text-right">
                          <Select
                            value={lead.status}
                            onChange={(e) => handleStatusChange(lead.id, e.target.value as LeadStatus)}
                            options={STATUS_OPTIONS}
                            className="w-[140px]"
                            disabled={statusLoading === lead.id}
                          />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-5 gap-4">
          {KANBAN_STATUSES.map((status) => (
            <div key={status} className="flex flex-col">
              <div className="flex items-center justify-between mb-3 px-1">
                <Badge variant={STATUS_BADGE[status]} className="text-xs px-3 py-1">
                  {STATUS_OPTIONS.find((s) => s.value === status)?.label}
                </Badge>
                <span className="text-xs text-muted-foreground font-medium">
                  {groupedLeads[status].length}
                </span>
              </div>
              <div className="flex flex-col gap-3 min-h-[200px]">
                {groupedLeads[status].length === 0 ? (
                  <div className="rounded-lg border-2 border-dashed p-4 text-center text-xs text-muted-foreground">
                    Sin leads
                  </div>
                ) : (
                  groupedLeads[status].map((lead) => (
                    <Card
                      key={lead.id}
                      className="shadow-sm hover:shadow-md transition-all cursor-pointer border-l-4"
                      style={{
                        borderLeftColor:
                          lead.score >= 70
                            ? '#22c55e'
                            : lead.score >= 40
                              ? '#eab308'
                              : '#6b7280',
                      }}
                    >
                      <CardContent className="p-3 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-medium text-sm leading-tight">{lead.name}</p>
                          <GripVertical className="h-3 w-3 shrink-0 text-muted-foreground" />
                        </div>
                        {lead.source && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Target className="h-3 w-3" />
                            {lead.source}
                          </p>
                        )}
                        <div className="flex items-center justify-between pt-1">
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {getUserName(lead.assignedTo)}
                          </span>
                          <span className={`text-xs font-semibold ${lead.score >= 70 ? 'text-green-600' : lead.score >= 40 ? 'text-yellow-600' : 'text-muted-foreground'}`}>
                            {lead.score} pts
                          </span>
                        </div>
                        <div className="pt-1">
                          <Select
                            value={lead.status}
                            onChange={(e) => handleStatusChange(lead.id, e.target.value as LeadStatus)}
                            options={STATUS_OPTIONS}
                            className="w-full text-xs h-7"
                            disabled={statusLoading === lead.id}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="w-full max-w-lg mx-4">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Nuevo Lead</CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setShowCreateModal(false)}>
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nombre *</label>
                  <Input
                    placeholder="Ej: Juan Pérez - Tech Solutions"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Descripción</label>
                  <Input
                    placeholder="Breve descripción del lead"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Fuente</label>
                    <Input
                      placeholder="Ej: website, referral"
                      value={form.source}
                      onChange={(e) => setForm({ ...form, source: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Score</label>
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      placeholder="0-100"
                      value={form.score}
                      onChange={(e) => setForm({ ...form, score: Number(e.target.value) })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Asignar a</label>
                  <Select
                    value={form.assignedTo}
                    onChange={(e) => setForm({ ...form, assignedTo: e.target.value })}
                    options={users.map((u) => ({ value: u.id, label: `${u.firstName} ${u.lastName}` }))}
                    placeholder="Seleccionar usuario"
                  />
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <Button type="button" variant="outline" onClick={() => setShowCreateModal(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">Crear Lead</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
