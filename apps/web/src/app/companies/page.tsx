'use client';

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select } from '@/components/ui/select';
import { Plus, Search, Edit, Trash2, UserCheck } from 'lucide-react';
import toast from 'react-hot-toast';

interface Company {
  id: number;
  name: string;
  legalName?: string;
  taxId?: string;
  industry?: string;
  segment?: string;
  website?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  notes?: string;
  isClient: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Meta {
  total: number;
  page: number;
  limit: number;
}

const emptyForm = {
  name: '',
  legalName: '',
  taxId: '',
  industry: '',
  segment: '',
  website: '',
  phone: '',
  email: '',
  address: '',
  city: '',
  state: '',
  country: '',
  postalCode: '',
  notes: '',
  isClient: false,
};

const INDUSTRY_OPTIONS = [
  { value: 'TECHNOLOGY', label: 'Tecnología' },
  { value: 'FINANCE', label: 'Finanzas' },
  { value: 'HEALTHCARE', label: 'Salud' },
  { value: 'EDUCATION', label: 'Educación' },
  { value: 'REAL_ESTATE', label: 'Bienes Raíces' },
  { value: 'RETAIL', label: 'Comercio' },
  { value: 'MANUFACTURING', label: 'Manufactura' },
  { value: 'CONSTRUCTION', label: 'Construcción' },
  { value: 'TRANSPORT', label: 'Transporte' },
  { value: 'HOSPITALITY', label: 'Hotelería' },
  { value: 'ENERGY', label: 'Energía' },
  { value: 'AGRICULTURE', label: 'Agricultura' },
  { value: 'MEDIA', label: 'Medios' },
  { value: 'CONSULTING', label: 'Consultoría' },
  { value: 'OTHER', label: 'Otro' },
];

const SEGMENT_OPTIONS = [
  { value: 'SMALL', label: 'Pequeña' },
  { value: 'MEDIUM', label: 'Mediana' },
  { value: 'LARGE', label: 'Grande' },
  { value: 'ENTERPRISE', label: 'Corporativo' },
  { value: 'GOVERNMENT', label: 'Gobierno' },
  { value: 'NON_PROFIT', label: 'Sin Fines de Lucro' },
  { value: 'OTHER', label: 'Otro' },
];

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [meta, setMeta] = useState<Meta>({ total: 0, page: 1, limit: 10 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [industryFilter, setIndustryFilter] = useState('');
  const [segmentFilter, setSegmentFilter] = useState('');
  const [isClientFilter, setIsClientFilter] = useState('');
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Company | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [convertId, setConvertId] = useState<number | null>(null);
  const [converting, setConverting] = useState(false);

  const fetchCompanies = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = { page: String(page), limit: '10' };
      if (search) params.search = search;
      if (industryFilter) params.industry = industryFilter;
      if (segmentFilter) params.segment = segmentFilter;
      if (isClientFilter) params.isClient = isClientFilter;
      const { data } = await api.get('/companies', { params });
      setCompanies(data?.data ?? data?.data?.data ?? []);
      setMeta(data?.meta ?? data?.data?.meta ?? { total: 0, page: 1, limit: 10 });
    } catch {
      toast.error('Error al cargar empresas');
    } finally {
      setLoading(false);
    }
  }, [page, search, industryFilter, segmentFilter, isClientFilter]);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (company: Company) => {
    setEditing(company);
    setForm({
      name: company.name,
      legalName: company.legalName || '',
      taxId: company.taxId || '',
      industry: company.industry || '',
      segment: company.segment || '',
      website: company.website || '',
      phone: company.phone || '',
      email: company.email || '',
      address: company.address || '',
      city: company.city || '',
      state: company.state || '',
      country: company.country || '',
      postalCode: company.postalCode || '',
      notes: company.notes || '',
      isClient: company.isClient,
    });
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await api.patch(`/companies/${editing.id}`, form);
        toast.success('Empresa actualizada');
      } else {
        await api.post('/companies', form);
        toast.success('Empresa creada');
      }
      setModalOpen(false);
      fetchCompanies();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Error al guardar empresa');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await api.delete(`/companies/${deleteId}`);
      toast.success('Empresa eliminada');
      setDeleteId(null);
      fetchCompanies();
    } catch {
      toast.error('Error al eliminar empresa');
    } finally {
      setDeleting(false);
    }
  };

  const handleConvertToClient = async (id: number) => {
    setConvertId(id);
    setConverting(true);
    try {
      await api.patch(`/companies/${id}/convert-to-client`);
      toast.success('Empresa convertida a cliente');
      fetchCompanies();
    } catch {
      toast.error('Error al convertir a cliente');
    } finally {
      setConvertId(null);
      setConverting(false);
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
          <h1 className="text-3xl font-bold tracking-tight">Empresas</h1>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Nueva Empresa
        </Button>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre o RUT..."
                className="pl-9"
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
            <Select
              value={industryFilter}
              onChange={(e) => { setIndustryFilter(e.target.value); setPage(1); }}
              options={INDUSTRY_OPTIONS}
              placeholder="Filtrar por industria"
              className="w-[180px]"
            />
            <Select
              value={segmentFilter}
              onChange={(e) => { setSegmentFilter(e.target.value); setPage(1); }}
              options={SEGMENT_OPTIONS}
              placeholder="Filtrar por segmento"
              className="w-[180px]"
            />
            <Select
              value={isClientFilter}
              onChange={(e) => { setIsClientFilter(e.target.value); setPage(1); }}
              options={[
                { value: 'true', label: 'Es cliente' },
                { value: 'false', label: 'No es cliente' },
              ]}
              placeholder="Filtrar por cliente"
              className="w-[160px]"
            />
            {(search || industryFilter || segmentFilter || isClientFilter) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { setSearch(''); setIndustryFilter(''); setSegmentFilter(''); setIsClientFilter(''); setPage(1); }}
              >
                Limpiar
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-3 font-medium">Nombre</th>
                  <th className="text-left p-3 font-medium">Industria</th>
                  <th className="text-left p-3 font-medium">Segmento</th>
                  <th className="text-left p-3 font-medium">Teléfono</th>
                  <th className="text-left p-3 font-medium">Email</th>
                  <th className="text-left p-3 font-medium">Ciudad</th>
                  <th className="text-center p-3 font-medium">Cliente</th>
                  <th className="text-right p-3 font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-muted-foreground">
                      Cargando...
                    </td>
                  </tr>
                ) : companies.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-muted-foreground">
                      No se encontraron empresas
                    </td>
                  </tr>
                ) : (
                  companies.map((company) => (
                    <tr key={company.id} className="border-b hover:bg-muted/30 transition-colors">
                      <td className="p-3 font-medium">{company.name}</td>
                      <td className="p-3 text-muted-foreground">
                        {INDUSTRY_OPTIONS.find((o) => o.value === company.industry)?.label || company.industry || '—'}
                      </td>
                      <td className="p-3 text-muted-foreground">
                        {SEGMENT_OPTIONS.find((o) => o.value === company.segment)?.label || company.segment || '—'}
                      </td>
                      <td className="p-3">{company.phone || '—'}</td>
                      <td className="p-3 text-muted-foreground">{company.email || '—'}</td>
                      <td className="p-3 text-muted-foreground">{company.city || '—'}</td>
                      <td className="p-3 text-center">
                        <Badge variant={company.isClient ? 'success' : 'secondary'}>
                          {company.isClient ? 'Sí' : 'No'}
                        </Badge>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {!company.isClient && (
                            <Button
                              variant="ghost"
                              size="icon"
                              disabled={convertId === company.id && converting}
                              onClick={() => handleConvertToClient(company.id)}
                              title="Convertir a Cliente"
                            >
                              <UserCheck className="h-4 w-4 text-green-600" />
                            </Button>
                          )}
                          <Button variant="ghost" size="icon" onClick={() => openEdit(company)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => setDeleteId(company.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between p-4 border-t">
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
        </CardContent>
      </Card>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl border bg-card p-6 shadow-lg">
            <h2 className="mb-4 text-lg font-semibold">
              {editing ? 'Editar Empresa' : 'Nueva Empresa'}
            </h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Nombre *</label>
                  <Input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Razón Social</label>
                  <Input
                    value={form.legalName}
                    onChange={(e) => setForm({ ...form, legalName: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">RUT</label>
                  <Input
                    value={form.taxId}
                    onChange={(e) => setForm({ ...form, taxId: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Industria</label>
                  <Select
                    value={form.industry}
                    onChange={(e) => setForm({ ...form, industry: e.target.value })}
                    options={INDUSTRY_OPTIONS}
                    placeholder="Seleccionar industria"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Segmento</label>
                  <Select
                    value={form.segment}
                    onChange={(e) => setForm({ ...form, segment: e.target.value })}
                    options={SEGMENT_OPTIONS}
                    placeholder="Seleccionar segmento"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Sitio Web</label>
                  <Input
                    value={form.website}
                    onChange={(e) => setForm({ ...form, website: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Teléfono</label>
                  <Input
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Email</label>
                  <Input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Dirección</label>
                  <Input
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Ciudad</label>
                  <Input
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Estado/Región</label>
                  <Input
                    value={form.state}
                    onChange={(e) => setForm({ ...form, state: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">País</label>
                  <Input
                    value={form.country}
                    onChange={(e) => setForm({ ...form, country: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Código Postal</label>
                  <Input
                    value={form.postalCode}
                    onChange={(e) => setForm({ ...form, postalCode: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5 flex items-end pb-1">
                  <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.isClient}
                      onChange={(e) => setForm({ ...form, isClient: e.target.checked })}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    Es cliente
                  </label>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Notas</label>
                <textarea
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? 'Guardando...' : editing ? 'Actualizar' : 'Crear'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-sm rounded-xl border bg-card p-6 shadow-lg">
            <h2 className="mb-2 text-lg font-semibold">Confirmar eliminación</h2>
            <p className="text-sm text-muted-foreground">
              ¿Estás seguro de que deseas eliminar esta empresa? Esta acción no se puede deshacer.
            </p>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setDeleteId(null)}>
                Cancelar
              </Button>
              <Button variant="destructive" onClick={confirmDelete} disabled={deleting}>
                {deleting ? 'Eliminando...' : 'Eliminar'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
