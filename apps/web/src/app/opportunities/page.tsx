'use client';

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select } from '@/components/ui/select';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Plus, User, Building2, Calendar, DollarSign, X } from 'lucide-react';
import toast from 'react-hot-toast';

type Stage = 'CONTACTO_INICIAL' | 'VISITA_TERRENO' | 'PROPUESTA_HONORARIOS' | 'NEGOCIACION' | 'CONTRATO_FIRMADO' | 'PERDIDO';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface Opportunity {
  id: string;
  name: string;
  company?: { id: number; name: string };
  companyId?: number;
  amount: number;
  probability: number;
  stage: Stage;
  assignedTo?: string;
  expectedCloseDate?: string;
  createdAt: string;
  updatedAt: string;
}

const STAGES: { value: Stage; label: string; color: string; headerClass: string }[] = [
  { value: 'CONTACTO_INICIAL', label: 'Contacto Inicial', color: '#3b82f6', headerClass: 'bg-blue-500' },
  { value: 'VISITA_TERRENO', label: 'Visita a Terreno', color: '#6366f1', headerClass: 'bg-indigo-500' },
  { value: 'PROPUESTA_HONORARIOS', label: 'Prop. Honorarios', color: '#eab308', headerClass: 'bg-yellow-500' },
  { value: 'NEGOCIACION', label: 'Negociación', color: '#f97316', headerClass: 'bg-orange-500' },
  { value: 'CONTRATO_FIRMADO', label: 'Contrato Firmado', color: '#22c55e', headerClass: 'bg-green-500' },
  { value: 'PERDIDO', label: 'Perdida', color: '#ef4444', headerClass: 'bg-red-500' },
];

const STAGE_MAP = new Map(STAGES.map((s) => [s.value, s]));

export default function OpportunitiesPage() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [statusLoading, setStatusLoading] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: '',
    amount: '',
    probability: '0',
    assignedTo: '',
    expectedCloseDate: '',
    companyId: '',
  });

  const fetchOpportunities = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/opportunities', { params: { limit: '100' } });
      setOpportunities(data.data ?? []);
    } catch {
      toast.error('Error al cargar oportunidades');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOpportunities();
  }, [fetchOpportunities]);

  useEffect(() => {
    api.get('/users').then(({ data }) => {
      setUsers(data.data ?? data);
    }).catch(() => {});
  }, []);

  const handleStageChange = async (id: string, stage: Stage) => {
    try {
      setStatusLoading(id);
      await api.patch(`/opportunities/${id}`, { stage });
      toast.success('Etapa actualizada');
      fetchOpportunities();
    } catch {
      toast.error('Error al cambiar etapa');
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
      const payload = {
        name: form.name,
        amount: form.amount ? Number(form.amount) : undefined,
        probability: Number(form.probability),
        assignedTo: form.assignedTo || undefined,
        expectedCloseDate: form.expectedCloseDate || undefined,
        companyId: form.companyId ? Number(form.companyId) : undefined,
      };
      await api.post('/opportunities', payload);
      toast.success('Oportunidad creada');
      setShowCreateModal(false);
      setForm({ name: '', amount: '', probability: '0', assignedTo: '', expectedCloseDate: '', companyId: '' });
      fetchOpportunities();
    } catch {
      toast.error('Error al crear oportunidad');
    }
  };

  const grouped = STAGES.reduce(
    (acc, s) => {
      acc[s.value] = opportunities.filter((o) => o.stage === s.value);
      return acc;
    },
    {} as Record<Stage, Opportunity[]>,
  );

  const totalValue = opportunities.reduce((sum, o) => sum + (o.amount || 0), 0);
  const avgDealSize = opportunities.length > 0 ? totalValue / opportunities.length : 0;

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
          <h1 className="text-3xl font-bold tracking-tight">Oportunidades</h1>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="mr-2 h-4 w-4" /> Nueva Oportunidad
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pipeline Total</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(totalValue)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Oportunidades</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{opportunities.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Deal Promedio</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(avgDealSize)}</p>
          </CardContent>
        </Card>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted-foreground border-t-transparent" />
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {STAGES.map((stage) => {
            const items = grouped[stage.value];
            return (
              <div key={stage.value} className="flex flex-col">
                <div
                  className="rounded-t-lg px-3 py-2 text-white text-xs font-semibold flex items-center justify-between"
                  style={{ backgroundColor: stage.color }}
                >
                  <span>{stage.label}</span>
                  <Badge variant="secondary" className="bg-white/20 text-white border-0 text-xs">
                    {items.length}
                  </Badge>
                </div>
                <div className="flex flex-col gap-3 bg-muted/30 rounded-b-lg p-3 min-h-[300px] border border-t-0">
                  {items.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center rounded-lg border-2 border-dashed p-4 text-xs text-muted-foreground">
                      Sin oportunidades
                    </div>
                  ) : (
                    items.map((opp) => (
                      <Card
                        key={opp.id}
                        className="shadow-sm hover:shadow-md transition-all border-l-4"
                        style={{ borderLeftColor: stage.color }}
                      >
                        <CardContent className="p-3 space-y-2">
                          <p className="font-medium text-sm leading-tight">{opp.name}</p>

                          {opp.company && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <Building2 className="h-3 w-3" />
                              {opp.company.name}
                            </p>
                          )}

                          <p className="text-sm font-bold">{formatCurrency(opp.amount || 0)}</p>

                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-muted-foreground">Probabilidad</span>
                              <span className="font-medium">{opp.probability}%</span>
                            </div>
                            <div className="h-1.5 w-full rounded-full bg-muted">
                              <div
                                className="h-1.5 rounded-full transition-all"
                                style={{
                                  width: `${opp.probability}%`,
                                  backgroundColor: stage.color,
                                }}
                              />
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-1 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {getUserName(opp.assignedTo)}
                            </span>
                            {opp.expectedCloseDate && (
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {formatDate(opp.expectedCloseDate)}
                              </span>
                            )}
                          </div>

                          <div className="pt-1">
                            <Select
                              value={opp.stage}
                              onChange={(e) => handleStageChange(opp.id, e.target.value as Stage)}
                              options={STAGES.map((s) => ({ value: s.value, label: s.label }))}
                              className="w-full text-xs h-7"
                              disabled={statusLoading === opp.id}
                            />
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="w-full max-w-lg mx-4">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Nueva Oportunidad</CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setShowCreateModal(false)}>
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nombre *</label>
                  <Input
                    placeholder="Ej: Implementación CRM - Empresa ABC"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Monto</label>
                    <Input
                      type="number"
                      min={0}
                      placeholder="0"
                      value={form.amount}
                      onChange={(e) => setForm({ ...form, amount: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Probabilidad (%)</label>
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      placeholder="0"
                      value={form.probability}
                      onChange={(e) => setForm({ ...form, probability: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Fecha de Cierre Estimada</label>
                  <Input
                    type="date"
                    value={form.expectedCloseDate}
                    onChange={(e) => setForm({ ...form, expectedCloseDate: e.target.value })}
                  />
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
                  <Button type="submit">Crear Oportunidad</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

